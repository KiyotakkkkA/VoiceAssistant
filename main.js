import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { JsonParsingService } from './src/app/js/services/JsonParsingService.js';
import { FileSystemService } from './src/app/js/services/FileSystemService.js';
import { InitDirectoriesService } from './src/app/js/services/InitDirectoriesService.js';
import { DownloadService } from './src/app/js/services/DownloadService.js';
import { DatabaseService } from './src/app/js/services/DatabaseService.js';
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
  fsystem: FileSystemService.getInstance(),
  init: InitDirectoriesService.getInstance(),
  download: DownloadService.getInstance(),
  database: DatabaseService.getInstance()
};

function updateSettings(key, value) {
  try {
    const settings = services.json.get('settings') || {};
    settings[key] = value;

    const settingsPath = `${paths.global_path}/settings.json`;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    services.json.load('settings', settingsPath);

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

function refreshSettings(
  type,
  topic,
  key,
  data,
  postRefreshingFn
) {

  if (data === undefined) {
    console.warn(`[WS] ${type} ${topic} missing ${key}`);
    return;
  }

  if (updateSettings(key, data)) {
    if (postRefreshingFn) {
      postRefreshingFn(type, topic, key, data);
    }
  }

}

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

    const notedObject = services.fsystem.buildNotesStructure(paths.notes_path);
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
      themes: themesObject(),
      settings: settingsObject,
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
      services.download.download('https://drive.google.com/file/d/1rHix5tBOz4_13opmbDX1ZrOa_OKsxk5h/view?usp=sharing', path.join(paths.voice_model_path, 'voice_small.zip'), true).then(() => {

        let current_config_data = services.json.get('config');
        current_config_data['path_to_voice_model'] = 'voice_small';
        
        fs.writeFileSync(path.join(paths.global_path, 'config.json'), JSON.stringify(current_config_data, null, 2));

        sendToAll(EventsType.SERVICE_ACTION, EventsTopic.ACTION_SERVICE_RELOAD, {}, 'speech_rec_module');
      })
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
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_THEME_SET],
    handler: (ws, msg) => {
      const themeName = msg.payload['current.appearance.theme'];

      if (loadTheme(themeName)) {

        refreshSettings(
          EventsType.EVENT,
          EventsTopic.JSON_THEMES_DATA_SET,
          'current.appearance.theme',
          themeName,
          (type, topic, key, data) => {
            const updatedData = {
              themes: {
                themesList: fs.readdirSync(paths.themes_path).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')),
                currentThemeData: services.json.get('theme'),
              },
              settings: {
                [key]: data
              }
            };

            sendToAll(type, topic, {
              ...updatedData
            });
          }
        );
      }
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_EVENT_PANEL_TOGGLE],
    handler: (ws, msg) => {
      refreshSettings(
        null,
        null,
        'current.interface.event_panel.state',
        msg.payload['current.interface.event_panel.state'],
        null
      )
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_ACCOUNT_DATA_SET],
    handler: (ws, msg) => {
      refreshSettings(
        EventsType.EVENT,
        EventsTopic.JSON_ACCOUNT_DATA_SET,
        'current.account.data',
        msg.payload['current.account.data'],
        (type, topic, key, data) => {
          sendToAll(type, topic, {
            settings: {
              [key]: data
            }
          });
        }
      );
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_APIKEYS_SET],
    handler: (ws, msg) => {
      refreshSettings(
        null,
        null,
        'current.ai.api',
        msg.payload['current.ai.api'],
        null
      );
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.ACTION_AIMODEL_SET],
    handler: (ws, msg) => {
      refreshSettings(
        EventsType.EVENT,
        EventsTopic.HAVE_TO_BE_REFETCHED_SETTINGS_DATA,
        'current.ai.model.id',
        msg.payload['current.ai.model.id'],
        (type, topic, key, data) => {
          sendToAll(type, topic, {
            settings: {
              [key]: data
            }
          });
        }
      );
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.DATABASE_APPS_UPDATED],
    handler: (ws, msg) => {
      try {
        const { folderPath, folderName, apps } = msg.payload;
        const success = services.database.saveApps(folderPath, folderName, apps);
        
        if (success) {
          const appsData = services.database.getAppsForUI();
          const stats = services.database.getStats();
          
          sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APPS_UPDATED, {
            apps: appsData,
            stats: stats
          });
        }
      } catch (error) {
        console.error('[Database] Ошибка сохранения приложений:', error);
      }
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.DATABASE_APP_LAUNCHED],
    handler: (ws, msg) => {
      try {
        const { appId } = msg.payload;
        const success = services.database.incrementLaunchCount(appId);
        
        if (success) {
          const stats = services.database.getStats();
          sendToAll(EventsType.EVENT, EventsTopic.DATABASE_STATS_UPDATED, {
            stats: stats
          });
        }
      } catch (error) {
        console.error('[Database] Ошибка обновления счетчика запусков:', error);
      }
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.DATABASE_APP_FAVORITE_TOGGLED],
    handler: (ws, msg) => {
      try {
        const { appId } = msg.payload;
        const success = services.database.toggleFavorite(appId);
        
        if (success) {
          const appsData = services.database.getAppsForUI();
          sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APPS_UPDATED, {
            apps: appsData
          });
        }
      } catch (error) {
        console.error('[Database] Ошибка переключения избранного:', error);
      }
    }
  });

  MsgBroker.onMessage({
    key: [EventsType.SERVICE_ACTION, EventsTopic.DATABASE_APP_DATA_SET],
    handler: (ws, msg) => {
      try {
        const appsData = services.database.getAppsForUI();
        const stats = services.database.getStats();

        sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APP_DATA_SET, {
          apps: appsData,
          stats: stats
        });
      } catch (error) {
        console.error('[Database] Ошибка получения данных приложений:', error);
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

function setupIpcHandlers() {
  ipcMain.handle('scan-directory', async (event, dirPath) => {
    try {
      const results = services.fsystem.scanDir(dirPath);
      return {
        success: true,
        apps: results.map(app => ({
          name: app.name,
          path: app.path,
          type: app.type === '.exe' ? 'exe' : 'lnk',
          icon: undefined
        }))
      };
    } catch (error) {
      console.error('Error scanning directory:', error);
      return {
        success: false,
        apps: [],
        error: error.message
      };
    }
  });

  ipcMain.handle('open-folder-dialog', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Выберите папку для сканирования'
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error opening folder dialog:', error);
      throw error;
    }
  });

  ipcMain.handle('save-apps-to-database', async (event, folderPath, folderName, apps) => {
    try {
      const success = services.database.saveApps(folderPath, folderName, apps);
      
      if (success) {
        const appsData = services.database.getAppsForUI();
        const stats = services.database.getStats();
        
        sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APPS_UPDATED, {
          apps: appsData,
          stats: stats
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error saving apps to database:', error);
      throw error;
    }
  });

  ipcMain.handle('get-apps-from-database', async () => {
    try {
      const appsData = services.database.getAppsForUI();
      const stats = services.database.getStats();
      
      return {
        apps: appsData,
        stats: stats
      };
    } catch (error) {
      console.error('Error getting apps from database:', error);
      return { apps: { paths: [], apps: {} }, stats: { total_apps: 0, total_paths: 0, total_launches: 0 } };
    }
  });

  ipcMain.handle('delete-app', async (event, appId) => {
    try {
      const success = services.database.deleteApp(appId);
      
      if (success) {
        const appsData = services.database.getAppsForUI();
        const stats = services.database.getStats();
        
        sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APPS_UPDATED, {
          apps: appsData,
          stats: stats
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting app:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-folder', async (event, folderId) => {
    try {
      const success = services.database.deleteFolder(folderId);
      
      if (success) {
        const appsData = services.database.getAppsForUI();
        const stats = services.database.getStats();
        
        sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APPS_UPDATED, {
          apps: appsData,
          stats: stats
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  });

  ipcMain.handle('launch-app', async (event, appId, appPath) => {
    try {
      services.database.incrementLaunchCount(appId);
      
      if (appPath.endsWith('.lnk')) {
        const getLinkTarget = () => {
          return new Promise((resolve, reject) => {
            const powershellScript = `
              $shell = New-Object -ComObject WScript.Shell
              $shortcut = $shell.CreateShortcut('${appPath.replace(/'/g, "''")}')
              Write-Output $shortcut.TargetPath
            `;
            
            const process = spawn('powershell', ['-Command', powershellScript], {
              stdio: ['pipe', 'pipe', 'pipe']
            });
            
            let output = '';
            let error = '';
            
            process.stdout.on('data', (data) => {
              output += data.toString();
            });
            
            process.stderr.on('data', (data) => {
              error += data.toString();
            });
            
            process.on('close', (code) => {
              if (code === 0 && output.trim()) {
                resolve(output.trim());
              } else {
                reject(new Error(`PowerShell error: ${error || 'Unknown error'}`));
              }
            });
          });
        };
        
        try {
          const targetPath = await getLinkTarget();
          if (targetPath && fs.existsSync(targetPath)) {
            const appDir = path.dirname(targetPath);
            spawn(targetPath, [], {
              detached: true,
              stdio: 'ignore',
              cwd: appDir
            });
          } else {
            spawn('cmd', ['/c', 'start', '', `"${appPath}"`], {
              detached: true,
              stdio: 'ignore'
            });
          }
        } catch (error) {
          console.error('Error resolving .lnk target:', error);
          spawn('cmd', ['/c', 'start', '', `"${appPath}"`], {
            detached: true,
            stdio: 'ignore'
          });
        }
      } else if (appPath.endsWith('.exe')) {
        const appDir = path.dirname(appPath);
        spawn(appPath, [], {
          detached: true,
          stdio: 'ignore',
          cwd: appDir
        });
      } else {
        throw new Error('Unsupported file type');
      }
      
      sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APP_LAUNCHED, {
        appId: appId,
        path: appPath
      });
      
      return true;
    } catch (error) {
      console.error('Error launching app:', error);
      throw error;
    }
  });
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