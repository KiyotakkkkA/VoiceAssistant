import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { spawn, exec } from 'child_process';
import fs from 'fs';
import { YamlParsingService } from './src/app/js/services/YamlParsingService.js';
import { JsonParsingService } from './src/app/js/services/JsonParsingService.js';
import { paths } from './src/app/js/paths.js';
import { json } from 'stream/consumers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
}

let pythonIsReady = false;

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

  const selectedTheme = services.json.get('settings')['ui.current.theme'];
  services.json.load('theme', `${paths.themes_configs_path}/${selectedTheme}.json`);

}

function startWebSocketServer() {
  if (wss) return;
  wss = new WebSocketServer({ port: WS_PORT });
  console.log(`[WS] Server listening on ws://localhost:${WS_PORT}`);
  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    ws.on('close', () => connectedClients.delete(ws));
    ws.on('message', (data) => {
      let msg = null;
      try { msg = JSON.parse(data.toString()); } catch (e) {
        console.warn('[WS] Non-JSON message ignored', data.toString());
        return;
      }
      if (!msg.type) msg.type = 'unknown';
      if (!msg.from) msg.from = 'unknown';
      if (msg.type === 'python_ready') {
        pythonIsReady = true;
      }
      if (msg.type === 'action_open_app_path' && msg.payload?.path) {
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
          console.error('[WS] action_open_app_path error', e);
        }
      }
      for (const client of connectedClients) {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(msg));
        }
      }
      if (msg.type !== 'ping') {
        console.log('[WS] Message', msg);
      }
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'server_ack', from: 'server', payload: { receivedType: msg.type } }));
      }
    });
    ws.send(JSON.stringify({ type: 'server_welcome', payload: 'connected', from: 'server' }));

    const yamlCfgsData = {
      apps: services.yaml.get('apps')
    }
    const jsonCfgsData = {
      theme: services.json.get('theme'),
      settings: services.json.get('settings')
    };
    if (yamlCfgsData) {
      ws.send(JSON.stringify({ type: 'set_yaml_configs', from: 'server', payload: { data: yamlCfgsData } }));
    }
    if (jsonCfgsData) {
      ws.send(JSON.stringify({ type: 'set_json_data', from: 'server', payload: { data: jsonCfgsData } }));
    }
    if (pythonIsReady && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'python_ready', from: 'server', payload: 'replay' }));
    }
  });
  wss.on('error', (err) => console.error('[WS] Error', err));
}

function resolvePythonExecutable() {
  const venvWin = path.join(__dirname, 'src', 'assistant', '.venv', 'Scripts', 'python.exe');
  const venvUnix = path.join(__dirname, 'src', 'assistant', '.venv', 'bin', 'python');
  if (fs.existsSync(venvWin)) return venvWin;
  if (fs.existsSync(venvUnix)) return venvUnix;
  return process.platform === 'win32' ? 'python' : 'python3';
}

function startPythonProcess() {
  if (pythonProc) return;
  const pyExec = resolvePythonExecutable();
  const assistantDir = path.join(__dirname, 'src', 'assistant');
  const mainPy = path.join(assistantDir, 'main.py');
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