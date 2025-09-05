import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { JsonParsingService } from './src/app/js/services/JsonParsingService.js';
import { FileSystemService } from './src/app/js/services/FileSystemService.js';
import { InitDirectoriesService } from './src/app/js/services/InitDirectoriesService.js';
import { EventsType, EventsTopic } from './src/app/js/enums/Events.js';
import { MsgBroker } from "./src/app/js/clients/SocketMsgBrokerClient.js";
import { paths } from './src/app/js/paths.js';
import { useSocketServer } from "./src/app/js/composables/useSocketServer.js";
import { useFileSystem } from './src/app/js/composables/useFileSystem.js';
import { useDatabase } from './src/app/js/composables/useDatabase.js';
import { usePC } from './src/app/js/composables/usePC.js';
import { useSettings } from './src/app/js/composables/useSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __py_modules_dirname = path.join(__dirname, 'modules');
const __py_master_filename = "master.py"

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let pythonProc = null;
const WS_PORT = 8765;

const {
  setTheme,
  accountDataSet,
  eventPanelSet,
  apiKeysSet,
  aiModelSet
} = useSettings();
const {
  launchApp,
  downloadVoiceRecModel
} = usePC();
const { sendToAll } = useSocketServer();
const { 
  saveAppsToDatabase,
  getAppsFromDatabase,
  deleteAppFromDatabase,
  deleteFolderFromDatabase
} = useDatabase();
const { 
  renameFile,
  deleteFile,
  writeFile,
  createFolder,
  deleteFolder,
  renameFolder,
  scanDirectory,
  showOpenDialog
} = useFileSystem();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    win.loadFile(indexPath);
  }
  mainWindow = win;
};

let wss = null;

const services = {
  json: JsonParsingService.getInstance(),
  fsystem: FileSystemService.getInstance(),
  init: InitDirectoriesService.getInstance(),
};

function createBaseDirStructure() {
  services.init.buildTree(path.join(__dirname));
}

function loadInitialData() {
  const cfgs = {
    json: {
      loader: services.json,
      objs: [
        {
          dir: paths.global_path,
          filename: 'settings',
          ext: "json"
        },
        {
          dir: paths.global_path,
          filename: 'config',
          ext: "json"
        }
      ]
    }
  };

  for (const [type, cfg] of Object.entries(cfgs)) {
    for (const obj of cfg.objs || []) {
      const filePath = path.join(obj.dir, `${obj.filename}.${obj.ext}`);
      if (fs.existsSync(filePath)) {
        try {
          cfg.loader.load(obj.filename, filePath);
        } catch (e) {
          console.error(`[Config] Error loading ${type} config from ${filePath}:`, e);
        }
      } else {
        console.warn(`[Config] File not found: ${filePath}`);
      }
    }
  }

  const selectedTheme = services.json.get('settings')['current.appearance.theme'];
  services.json.load('theme', `${paths.themes_path}/${selectedTheme}.json`);
}

function startWebSocketServer() {
  if (wss) return;
  wss = new WebSocketServer({ port: WS_PORT });

  MsgBroker.init(wss, false);
  MsgBroker.onConnection((ws) => {

    const notedObject = services.fsystem.buildNotesStructure(paths.notes_path).children;
    const settingsObject = services.json.get('settings');
    const themesObject = () => {
      return {
        themesList: fs.readdirSync(paths.themes_path).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')),
        currentThemeData: services.json.get('theme')
      }
    }
    const initialState = () => {
      return {
        voskModel: {
          exists: fs.existsSync(path.join(paths.voice_model_path, '/', services.json.get('config')['path_to_voice_model']))
        },
      }
    }

    const jsonCfgsData = {
      notes: notedObject,
      settings: settingsObject,
      themes: themesObject(),
      initialState: initialState(),
    };

    if (jsonCfgsData) {
      ws.send(JSON.stringify({ 
        type: EventsType.SERVICE_INIT, 
        topic: EventsTopic.JSON_INITAL_DATA_SET, 
        from: 'server', 
        payload: { data: jsonCfgsData } 
      }));
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_INIT_DOWNLOADING_VOICE_MODEL],
    handler: (ws, msg) => {
      downloadVoiceRecModel();
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_NOTES_REFETCH],
    handler: (ws, msg) => {
      sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
        notes: services.fsystem.buildNotesStructure(paths.notes_path)?.children || {}
      });
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FILE_RENAME],
    handler: (ws, msg) => {
      renameFile(msg.payload.path, msg.payload.newName);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FILE_DELETE],

    handler: (ws, msg) => {
      deleteFile(msg.payload.path);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FILE_WRITE],
    handler: (ws, msg) => {
      writeFile(msg.payload.path, msg.payload.content, msg.payload.flag);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FOLDER_CREATE],
    handler: (ws, msg) => {
      createFolder(msg.payload.path, msg.payload.name);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FOLDER_DELETE],
    handler: (ws, msg) => {
      deleteFolder(msg.payload.path);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FOLDER_RENAME],
    handler: (ws, msg) => {
      renameFolder(msg.payload.path, msg.payload.newName);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_THEME_SET],
    handler: (ws, msg) => {
      setTheme(msg.payload['current.appearance.theme']);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_EVENT_PANEL_TOGGLE],
    handler: (ws, msg) => {
      eventPanelSet(msg.payload['current.interface.event_panel.state']);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_ACCOUNT_DATA_SET],
    handler: (ws, msg) => {
      accountDataSet(msg.payload['current.account.data']);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_APIKEYS_SET],
    handler: (ws, msg) => {
      apiKeysSet(msg.payload['current.ai.api']);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_AIMODEL_SET],
    handler: (ws, msg) => {
      aiModelSet(msg.payload['current.ai.model.id']);
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_APP_OPEN],
    handler: (ws, msg) => {
      launchApp(msg.payload.data.key, msg.payload.data.path);
    }
  });

  MsgBroker.startListening();
}

function setupIpcHandlers() {
  ipcMain.handle('scan-directory', async (event, dirPath) => {
    return scanDirectory(dirPath);
  });

  ipcMain.handle('open-folder-dialog', async () => {
    return showOpenDialog(mainWindow);
  });

  ipcMain.handle('save-apps-to-database', async (event, folderPath, folderName, apps) => {
    return saveAppsToDatabase(folderPath, folderName, apps);
  });

  ipcMain.handle('get-apps-from-database', async () => {
    return getAppsFromDatabase();
  });

  ipcMain.handle('delete-app-from-database', async (event, appId) => {
    return deleteAppFromDatabase(appId);
  });

  ipcMain.handle('delete-folder-from-database', async (event, folderId) => {
    return deleteFolderFromDatabase(folderId);
  });

  ipcMain.handle('launch-app', async (event, appId, appPath) => {
    return launchApp(appId, appPath);
  });
}

function resolvePythonExecutable() {
  const venvWin = path.join(__py_modules_dirname, '.venv', 'Scripts', 'python.exe');
  const venvUnix = path.join(__py_modules_dirname, '.venv', 'bin', 'python');
  if (fs.existsSync(venvWin)) return venvWin;
  if (fs.existsSync(venvUnix)) return venvUnix;
  return process.platform === 'win32' ? 'python' : 'python3';
}

function startPythonProcess() {
  if (pythonProc) return;
  const pyExec = resolvePythonExecutable();
  const modulesDir = path.join(__py_modules_dirname);
  const mainPy = path.join(modulesDir, __py_master_filename);
  if (!fs.existsSync(mainPy)) {
    console.warn('[Python] main.py not found at', mainPy);
    return;
  }
  console.log('[Python] Starting', pyExec, mainPy);
  pythonProc = spawn(pyExec, [mainPy], {
    cwd: __dirname,
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });
  pythonProc.stdout.on('data', d => process.stdout.write(`[Py] ${d}`));
  pythonProc.stderr.on('data', d => process.stderr.write(`[Py-ERR] ${d}`));
  pythonProc.on('exit', (code, signal) => {
    console.log(`[Python] exited code=${code} signal=${signal}`);
    pythonProc = null;
  });
}

function stopPythonProcess() {
  if (pythonProc) {
    console.log('[Python] Terminating...');
    try { pythonProc.kill('SIGTERM'); } catch (e) { }
    pythonProc = null;
  }
}

app.whenReady().then(() => {
  createBaseDirStructure();
  loadInitialData();
  setupIpcHandlers();
  startWebSocketServer();
  startPythonProcess();
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopPythonProcess();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopPythonProcess();
});