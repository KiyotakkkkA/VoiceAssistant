import fs from 'fs';
import path from 'path';
import paths from '../paths.js';
import { DatabaseService } from '../services/DatabaseService.js';
import { DownloadService } from '../services/DownloadService.js';
import { useSocketServer } from './useSocketServer.js';
import { EventsType, EventsTopic } from '../enums/Events.js';
import { spawn } from 'child_process';
import { JsonParsingService } from '../services/JsonParsingService.js';

const usePC = () => {

    const { sendToAll } = useSocketServer();

    const launchApp = async (appId, appPath) => {
        try {
            DatabaseService.getInstance().incrementLaunchCount(appId);
            
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
    }

    const downloadVoiceRecModel = () => {
            DownloadService.getInstance().download('https://drive.google.com/file/d/1rHix5tBOz4_13opmbDX1ZrOa_OKsxk5h/view?usp=sharing', path.join(paths.voice_model_path, 'voice_small.zip'), true).then(() => {

                let current_config_data = JsonParsingService.getInstance().get('config');
                current_config_data['path_to_voice_model'] = 'voice_small';
                
                fs.writeFileSync(path.join(paths.global_path, 'config.json'), JSON.stringify(current_config_data, null, 2));

                sendToAll(EventsType.SERVICE_ACTION, EventsTopic.ACTION_SERVICE_RELOAD, {}, 'speech_rec_module');
            }
        ).catch((error) => {
            console.error('Error downloading voice recognition model:', error);
        });
    }

    return {
      launchApp,
      downloadVoiceRecModel
    }
}

export { usePC };