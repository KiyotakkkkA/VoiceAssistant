import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import { YamlParsingService } from './src/app/js/services/YamlParsingService.js';
import { JsonParsingService } from './src/app/js/services/JsonParsingService.js';
import { EventsType, EventsTopic } from './src/app/js/enums/Events.js';
import { paths } from './src/app/js/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __py_modules_dirname = path.join(__dirname, 'modules');
const __py_master_filename = "master.py"

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let pythonProc = null;
const WS_PORT = 8765;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    fullscreen: true,
    webPreferences: {
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
const connectedClients = new Set();

const services = {
  yaml: YamlParsingService.getInstance(),
  json: JsonParsingService.getInstance()
};

function createBaseFiles() {
  const settingsPath = `${paths.global_path}/settings.json`;
  const content = {
    "ui.current.theme.id": "github-dark",
    "ui.current.apikeys": []
  }

  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify(content, null, 2));
  }
}

function loadInitialConfigs() {

  const cfgs = {
    yaml: {
      loader: services.yaml,
      objs: [
        {
          dir: paths.yaml_configs_path,
          filename: 'apps',
          ext: "yml"
        }
      ]
    },
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
  const wssMessageHistory = [];
  console.log(`[WS] Server listening on ws://localhost:${WS_PORT}`);

  const wsresolver = {
    [EventsType.EVENT]: (ws, msg) => {
      switch (msg.topic) {
        case EventsTopic.SERVICE_HEARTBEAT:
          break;
        case EventsTopic.SERVICE_WAS_REGISTERED:
          wssMessageHistory.push(msg);
        default:
          break;
      }
    },
    [EventsType.SERVICE_INIT]: (ws, msg) => {
      switch (msg.topic) {
        case EventsTopic.READY_ORCHESTRATOR:
          wssMessageHistory.push(msg);
          break;
        case EventsTopic.READY_VOICE_RECOGNIZER:
          wssMessageHistory.push(msg);
          break;
        case EventsTopic.READY_PROCESSOR:
          wssMessageHistory.push(msg);
          break;
      }
    },
    [EventsType.SERVICE_PING]: (ws, msg) => {
      console.log('[WS] Service ping:', msg);
    },
    [EventsType.SERVICE_ACTION]: (ws, msg) => {
      switch (msg.topic) {
        case EventsTopic.ACTION_APP_OPEN:

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

          break;
        case EventsTopic.ACTION_THEME_SET:
          if (!msg.payload?.theme) {
            console.warn('[WS] ACTION_THEME_SET missing theme');
            return;
          }
          try {
            const themeName = msg.payload.theme;
            const themePath = `${paths.themes_path}/${themeName}.json`;

            if (fs.existsSync(themePath)) {
              services.json.load('theme', themePath);

              const settings = services.json.get('settings') || {};
              settings['ui.current.theme.id'] = themeName;

              const settingsPath = `${paths.global_path}/settings.json`;
              fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
              services.json.load('settings', settingsPath);

              const updatedData = {
                themes: {
                  themesList: fs.readdirSync(paths.themes_path).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')),
                  currentThemeData: services.json.get('theme'),
                },
                settings: {
                  'ui.current.theme.id': themeName
                }
              };

              for (const client of connectedClients) {
                if (client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: EventsType.EVENT,
                    topic: EventsTopic.JSON_THEMES_DATA_SET,
                    from: 'server',
                    payload: { data: updatedData }
                  }));
                }
              }

              console.log(`[Theme] Switched to ${themeName}`);
            }
          } catch (e) {
            console.error('[WS] theme setting error', e);
          }
          break;
        case EventsTopic.ACTION_APIKEYS_SET:
          if (!msg.payload?.apikeys) {
            console.warn('[WS] ACTION_APIKEYS_SET missing keys');
            return;
          }
          try {
            const apiKeys = msg.payload.apikeys;

            const settings = services.json.get('settings') || {};
            settings['ui.current.apikeys'] = apiKeys;

            const settingsPath = `${paths.global_path}/settings.json`;
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            services.json.load('settings', settingsPath);

            const updatedData = {
              settings: {
                "ui.current.apikeys": apiKeys
              }
            };

            for (const client of connectedClients) {
                if (client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: EventsType.EVENT,
                    topic: EventsTopic.JSON_APIKEYS_DATA_SET,
                    from: 'server',
                    payload: { data: updatedData }
                  }));
                }
              }

          } catch (e) {
            console.error('[WS] theme setting error', e);
          }
          break;
      }
    }
  }

  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    for (const msg of wssMessageHistory) {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(msg));
      }
    }
    ws.on('close', () => connectedClients.delete(ws));
    ws.on('message', (data) => {
      let msg = null;
      try { msg = JSON.parse(data.toString()); } catch (e) {
        console.warn('[WS] Non-JSON message ignored', data.toString());
        return;
      }
      if (!msg.type) msg.type = 'unknown';
      if (!msg.from) msg.from = 'unknown';

      if (wsresolver[msg.type]) {
        wsresolver[msg.type](ws, msg);
      }
      
      for (const client of connectedClients) {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(msg));
        }
      }
      if (msg.type !== 'ping' && msg.topic !== 'heartbeat') {
        console.log('[WS] Message', msg);
      }
    });

    const yamlCfgsData = {
      apps: services.yaml.get('apps')
    }
    const jsonCfgsData = {
      themes: {
        themesList: fs.readdirSync(paths.themes_path).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')),
        currentThemeData: services.json.get('theme'),
      },
      settings: services.json.get('settings')
    };
    if (yamlCfgsData) {
      ws.send(JSON.stringify({ type: EventsType.SERVICE_INIT, topic: EventsTopic.YAML_DATA_SET, from: 'server', payload: { data: yamlCfgsData } }));
    }
    if (jsonCfgsData) {
      ws.send(JSON.stringify({ type: EventsType.SERVICE_INIT, topic: EventsTopic.JSON_INITAL_DATA_SET, from: 'server', payload: { data: jsonCfgsData } }));
    }
  });
  wss.on('error', (err) => console.error('[WS] Error', err));
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
  loadInitialConfigs();
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