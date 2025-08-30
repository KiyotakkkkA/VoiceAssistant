import path from 'path';
import fs from 'fs';
import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { spawn, exec } from 'child_process';
import { JsonParsingService } from './src/app/js/services/JsonParsingService.js';
import { FileSystemService } from './src/app/js/services/FileSystemService.js';
import { EventsType, EventsTopic } from './src/app/js/enums/Events.js';
import { MsgBroker } from "./src/app/js/clients/SocketMsgBrokerClient.js";
import { paths } from './src/app/js/paths.js';
import { useSocketServer } from "./src/app/js/composables/useSocketServer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __py_modules_dirname = path.join(__dirname, 'modules');
const __py_master_filename = "master.py"

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let pythonProc = null;
const WS_PORT = 8765;

const { sendToAll } = useSocketServer();

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
  fsystem: FileSystemService.getInstance()
};

function updateSettings(key, value, eventType, eventTopic) {
  try {
    const settings = services.json.get('settings') || {};
    settings[key] = value;

    const settingsPath = `${paths.global_path}/settings.json`;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    services.json.load('settings', settingsPath);

    const updatedData = {
      settings: {
        [key]: value
      }
    };

    for (const client of MsgBroker.getClients()) {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: eventType,
          topic: eventTopic,
          from: 'server',
          payload: { data: updatedData }
        }));
      }
    }

    return true;
  } catch (e) {
    console.error(`[Settings] Error updating ${key}:`, e);
    return false;
  }
}

function loadTheme(themeName) {
  try {
    const themePath = `${paths.themes_path}/${themeName}.json`;

    if (fs.existsSync(themePath)) {
      services.json.load('theme', themePath);
      return true;
    }
    return false;
  } catch (e) {
    console.error(`[Theme] Error loading theme ${themeName}:`, e);
    return false;
  }
}

function createBaseFiles() {
  const settingsPath = `${paths.global_path}/settings.json`;
  const content = {
    "ui.current.theme.id": "github-dark",
    "ui.current.event.panel.state": true,
    'ui.current.aimodel.id': '',

    "ui.current.apikeys": [],
    "ui.current.tools": {}
  }

  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify(content, null, 2));
  }
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

  const selectedTheme = services.json.get('settings')['ui.current.theme.id'];
  services.json.load('theme', `${paths.themes_path}/${selectedTheme}.json`);
}

function startWebSocketServer() {
  if (wss) return;
  wss = new WebSocketServer({ port: WS_PORT });

  MsgBroker.init(wss, true);
  MsgBroker.onConnection((ws) => {
    const notesPath = paths.notes_path;
    const notesData = services.fsystem.buildNotesStructure(notesPath);
    const jsonCfgsData = {
      notes: notesData ? notesData.children : {},
      themes: {
        themesList: fs.readdirSync(paths.themes_path).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')),
        currentThemeData: services.json.get('theme'),
      },
      settings: services.json.get('settings')
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
      if (!msg.payload?.path || !msg.payload?.newName) {
        console.warn('[WS] ACTION_FILE_RENAME missing path or newName');
        return;
      }

      const baseExt = '.txt';
      services.fsystem.fileRename(path.join(paths.notes_path, msg.payload.path + baseExt), msg.payload.newName + baseExt);

      sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
        notes: services.fsystem.buildNotesStructure(paths.notes_path)?.children || {}
      });
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FILE_DELETE],

    handler: (ws, msg) => {
      if (!msg.payload?.path) {
        console.warn('[WS] ACTION_FILE_DELETE missing path');
        return;
      }

      const baseExt = '.txt';
      services.fsystem.fileDelete(path.join(paths.notes_path, msg.payload.path + baseExt));

      sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
        notes: services.fsystem.buildNotesStructure(paths.notes_path)?.children || {}
      });
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FILE_WRITE],
    handler: (ws, msg) => {
      if (!msg.payload?.path) {
        console.warn('[WS] ACTION_FILE_WRITE missing path');
        return;
      }

      let total_path = null;

      if (msg.payload.flag === 'c') {
        total_path = path.join(paths.notes_path, msg.payload.path);
      }
      else if (msg.payload.flag === 'w') {
        total_path = msg.payload.path;
      }
      
      if (total_path) {
        services.fsystem.fileWrite(total_path, msg.payload.content, msg.payload.flag);
      }

      sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
        notes: services.fsystem.buildNotesStructure(paths.notes_path)?.children || {}
      });
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FOLDER_CREATE],
    handler: (ws, msg) => {
      if (!msg.payload?.name) {
        console.warn('[WS] ACTION_FOLDER_CREATE missing name');
        return;
      }

      services.fsystem.folderCreate(path.join(paths.notes_path, msg.payload.path), msg.payload.name);

      sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
        notes: services.fsystem.buildNotesStructure(paths.notes_path)?.children || {}
      });
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FOLDER_DELETE],
    handler: (ws, msg) => {
      if (!msg.payload?.path) {
        console.warn('[WS] ACTION_FOLDER_DELETE missing path');
        return;
      }

      services.fsystem.folderDelete(path.join(paths.notes_path, msg.payload.path));

      sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
        notes: services.fsystem.buildNotesStructure(paths.notes_path)?.children || {}
      });
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_FOLDER_RENAME],
    handler: (ws, msg) => {
      if (!msg.payload?.path || !msg.payload?.newName) {
        console.warn('[WS] ACTION_FOLDER_RENAME missing path or newName');
        return;
      }

      services.fsystem.folderRename(path.join(paths.notes_path, msg.payload.path), msg.payload.newName);

      sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
        notes: services.fsystem.buildNotesStructure(paths.notes_path)?.children || {}
      });
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_APP_OPEN],
    handler: (ws, msg) => {
      if (!msg.payload?.path) {
        console.warn('[WS] ACTION_APP_OPEN missing path');
        return;
      }

      try {
        const appPath = msg.payload.path;
        const folder = path.dirname(appPath);
        if (process.platform === 'win32') {
          exec(`explorer.exe /select,"${appPath}"`);
        } else if (process.platform === 'darwin') {
          exec(`open "${folder}"`);
        } else {
          exec(`xdg-open "${folder}"`);
        }
      } catch (e) {
        console.error('[WS] opening app error', e);
      }
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_THEME_SET],
    handler: (ws, msg) => {
      if (!msg.payload?.theme) {
        console.warn('[WS] ACTION_THEME_SET missing theme');
        return;
      }
      
      const themeName = msg.payload.theme;
      
      if (loadTheme(themeName)) {

        if (updateSettings(
          'ui.current.theme.id', 
          themeName, 
          EventsType.EVENT, 
          EventsTopic.JSON_THEMES_DATA_SET
        )) {

          const updatedData = {
            themes: {
              themesList: fs.readdirSync(paths.themes_path).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')),
              currentThemeData: services.json.get('theme'),
            },
            settings: {
              'ui.current.theme.id': themeName
            }
          };

          sendToAll(EventsType.EVENT, EventsTopic.JSON_THEMES_DATA_SET, {
            ...updatedData
          });
        }
      }
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_EVENT_PANEL_TOGGLE],
    handler: (ws, msg) => {
      if (!msg.payload?.state && msg.payload?.state !== false) {
        console.warn('[WS] ACTION_EVENT_PANEL_TOGGLE missing state');
        return;
      }
      
      updateSettings(
        'ui.current.event.panel.state', 
        msg.payload.state, 
        EventsType.EVENT, 
        EventsTopic.JSON_EVENT_PANEL_STATE_SET
      );
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_APIKEYS_SET],
    handler: (ws, msg) => {
      if (!msg.payload?.apikeys) {
        console.warn('[WS] ACTION_APIKEYS_SET missing keys');
        return;
      }
      
      updateSettings(
        'ui.current.apikeys', 
        msg.payload.apikeys, 
        EventsType.EVENT, 
        EventsTopic.JSON_APIKEYS_DATA_SET
      );
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_AIMODEL_SET],
    handler: (ws, msg) => {
      if (!msg.payload?.modelId) {
        console.warn('[WS] ACTION_AIMODEL_SET missing model');
        return;
      }
      
      if (updateSettings(
        'ui.current.aimodel.id', 
        msg.payload.modelId, 
        EventsType.EVENT, 
        EventsTopic.HAVE_TO_BE_REFETCHED_SETTINGS_DATA
      )) {
        sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_SETTINGS_DATA, {});
      }
    }
  });

  MsgBroker.startListening();
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
  startWebSocketServer();
  createBaseFiles();
  loadInitialData();
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