import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { JsonParsingService } from './src/app/js/services/JsonParsingService.js';
import { PropertiesService } from './src/app/js/services/PropertiesService.js';
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

const PACKAGED_BASE = app.isPackaged ? path.dirname(process.execPath) : __dirname;
const ROOT_DIR = PACKAGED_BASE;
const ASAR_ROOT = app.isPackaged ? path.join(process.resourcesPath, 'app.asar') : __dirname;

const PY_MODULES_DIR = app.isPackaged ? path.join(PACKAGED_BASE, 'modules') : path.join(__dirname, 'modules');
const PY_MASTER_FILENAME = 'master.py';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let pythonProc = null;

const {
  setTheme,
  accountDataSet,
  eventPanelSet,
  apiKeysSet,
  aiModelSet,
  contextSettingsSet
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

function getPreloadPath() {
  if (!app.isPackaged) {
    return path.join(__dirname, 'preload.js');
  }
  const asarPreload = path.join(ASAR_ROOT, 'preload.js');
  if (fs.existsSync(asarPreload)) return asarPreload;
  const plainPreload = path.join(process.resourcesPath, 'preload.js');
  if (fs.existsSync(plainPreload)) return plainPreload;
  const fallback = path.join(path.dirname(process.execPath), 'preload.js');
  return fallback;
}

function getIndexHtmlPath() {
  if (!app.isPackaged) return null;
  const asarIndex = path.join(ASAR_ROOT, 'dist', 'index.html');
  if (fs.existsSync(asarIndex)) return asarIndex;
  const plainIndex = path.join(process.resourcesPath, 'dist', 'index.html');
  if (fs.existsSync(plainIndex)) return plainIndex;
  throw new Error(`index.html not found under ${process.resourcesPath}`);
}

const createWindow = () => {
  const preloadPath = getPreloadPath();
  console.log('[Main] Using preload:', preloadPath);
  const win = new BrowserWindow({
    width: 1920,
    height: 1000,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  
  win.maximize();

  win.once('ready-to-show', () => {
    console.log('[Main] Window ready-to-show');
    win.show();
  });

  win.webContents.on('did-fail-load', (e, ec, ed) => {
    console.error('[Main] did-fail-load', ec, ed);
  });
  win.webContents.on('render-process-gone', (e, details) => {
    console.error('[Main] render-process-gone', details);
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    try {
      const idx = getIndexHtmlPath();
      console.log('[Main] Loading index file', idx);
      win.loadFile(idx);
    } catch (err) {
      console.error('[Main] Failed to resolve index.html', err);
    }
  }
  mainWindow = win;
};

let wss = null;

const services = {
  json: JsonParsingService.getInstance(),
  properties: PropertiesService.getInstance(),
  fsystem: FileSystemService.getInstance(),
  init: InitDirectoriesService.getInstance(),
};

function createBaseDirStructure() {
  services.init.buildTree(path.join(ROOT_DIR), { packaged: app.isPackaged });
}

function loadInitialData() {
  const propertiesPath = path.join(ROOT_DIR, 'init.properties');
  if (fs.existsSync(propertiesPath)) {
    try {
      services.properties.load('config', propertiesPath);
      console.log('[Config] Properties loaded from init.properties');
    } catch (e) {
      console.error('[Config] Error loading properties file:', e);
    }
  } else {
    console.warn('[Config] Properties file not found:', propertiesPath);
  }

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

  const selectedTheme = services.json.get('settings')?.['current.appearance.theme'];
  if (selectedTheme) {
    try {
      const themeFile = path.join(paths.themes_path, `${selectedTheme}.json`);
      if (fs.existsSync(themeFile)) {
        services.json.load('theme', themeFile);
      } else {
        console.warn('[Theme] Selected theme file not found, falling back to first available. Looking at', themeFile);
        if (fs.existsSync(paths.themes_path)) {
          const list = fs.readdirSync(paths.themes_path).filter(f => f.endsWith('.json'));
          if (list.length) {
            services.json.load('theme', path.join(paths.themes_path, list[0]));
          }
        }
      }
    } catch (e) {
      console.warn('[Theme] Failed to load selected theme:', e.message);
    }
  }
}

function startWebSocketServer() {
  if (wss) return;
  
  let wsPort = 8765;
  try {
    wsPort = services.properties.getProperty('config', 'SOCKET_PORT', 8765);
    wsPort = parseInt(wsPort);
    if (isNaN(wsPort) || wsPort <= 0 || wsPort > 65535) {
      console.warn(`[WebSocket] Invalid port ${wsPort}, using default 8765`);
      wsPort = 8765;
    }
  } catch (error) {
    console.warn(`[WebSocket] Error getting port from properties: ${error.message}, using default 8765`);
    wsPort = 8765;
  }
  
  console.log(`[WebSocket] Starting WebSocket server on port ${wsPort}`);
  wss = new WebSocketServer({ port: wsPort });

  MsgBroker.init(wss, false);
  MsgBroker.onConnection((ws) => {
    try {
      if (!fs.existsSync(paths.notes_path)) {
        fs.mkdirSync(paths.notes_path, { recursive: true });
      }
    } catch (e) {
      console.warn('[Main] Failed to ensure notes directory:', paths.notes_path, e.message);
    }
    const notedObject = services.fsystem.buildNotesStructure(paths.notes_path).children;
    const settingsObject = services.json.get('settings');
    const themesObject = () => {
      try {
        const themesDir = paths.themes_path;
        if (!fs.existsSync(themesDir)) {
          fs.mkdirSync(themesDir, { recursive: true });
        }
        const list = fs.readdirSync(themesDir)
          .filter(f => f.endsWith('.json'))
          .map(f => f.replace('.json', ''));
        return {
          themesList: list,
          currentThemeData: services.json.get('theme')
        };
      } catch {
        return {
          themesList: [],
          currentThemeData: services.json.get('theme')
        };
      }
    };
    const initialState = () => {
      return {
        voskModel: {
          exists: fs.existsSync(path.join(paths.voice_model_path, '/', services.json.get('config')?.['path_to_voice_model'] ?? ''))
        },
      };
    };

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
    handler: () => { downloadVoiceRecModel(); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_NOTES_REFETCH],
    handler: () => {
      sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
        notes: services.fsystem.buildNotesStructure(paths.notes_path)?.children || {}
      });
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FILE_RENAME],
    handler: (ws, msg) => { renameFile(msg.payload.path, msg.payload.newName); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FILE_DELETE],
    handler: (ws, msg) => { deleteFile(msg.payload.path); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FILE_WRITE],
    handler: (ws, msg) => { writeFile(msg.payload.path, msg.payload.content, msg.payload.flag); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FOLDER_CREATE],
    handler: (ws, msg) => { createFolder(msg.payload.path, msg.payload.name); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FOLDER_DELETE],
    handler: (ws, msg) => { deleteFolder(msg.payload.path); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FOLDER_RENAME],
    handler: (ws, msg) => { renameFolder(msg.payload.path, msg.payload.newName); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_THEME_SET],
    handler: (ws, msg) => { setTheme(msg.payload['current.appearance.theme']); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_EVENT_PANEL_TOGGLE],
    handler: (ws, msg) => { eventPanelSet(msg.payload['current.interface.event_panel.state']); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_CONTEXT_SETTINGS_SET],
    handler: (ws, msg) => { contextSettingsSet(msg.payload.updates); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_ACCOUNT_DATA_SET],
    handler: (ws, msg) => { accountDataSet(msg.payload['current.account.data']); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_APIKEYS_SET],
    handler: (ws, msg) => { apiKeysSet(msg.payload['current.ai.api']); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_AIMODEL_SET],
    handler: (ws, msg) => { aiModelSet(msg.payload['current.ai.model.id']); }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_APP_OPEN],
    handler: (ws, msg) => { launchApp(msg.payload.data.key, msg.payload.data.path); }
  });

  MsgBroker.startListening();
}

function setupIpcHandlers() {
  ipcMain.handle('scan-directory', async (event, dirPath) => {
    return scanDirectory(dirPath);
  });
  ipcMain.handle('preload-ping', async () => 'pong');

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
  const venvWin = path.join(PY_MODULES_DIR, '.venv', 'Scripts', 'python.exe');
  const venvUnix = path.join(PY_MODULES_DIR, '.venv', 'bin', 'python');
  if (fs.existsSync(venvWin)) return venvWin;
  if (fs.existsSync(venvUnix)) return venvUnix;
  return process.platform === 'win32' ? 'python' : 'python3';
}

function startPythonProcess() {
  if (pythonProc) return;
  const pyExec = resolvePythonExecutable();
  const mainPy = path.join(PY_MODULES_DIR, PY_MASTER_FILENAME);
  if (!fs.existsSync(mainPy)) {
    console.warn('[Python] master.py not found at', mainPy);
    return;
  }
  console.log('[Python] Starting', pyExec, mainPy);
  pythonProc = spawn(pyExec, [mainPy], {
    cwd: ROOT_DIR,
    env: { 
      ...process.env, 
      PYTHONUNBUFFERED: '1',
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8: '1',
      APP_ROOT: ROOT_DIR
    }
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
