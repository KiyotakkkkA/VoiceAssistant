import path from 'path'
import paths from '../paths.js';
import { FileSystemService } from '../services/FileSystemService.js';
import { EventsType, EventsTopic } from '../enums/Events.js';
import { useSocketServer } from './useSocketServer.js';
import { dialog } from 'electron';

const useFileSystem = () => {
    const { sendToAll } = useSocketServer();

    const renameFile = (filePath, newFilename) => {
        if (!filePath || !newFilename) {
            console.error('Invalid parameters for renameFile');
            return;
        }

        const baseExt = '.txt';
        FileSystemService.getInstance().fileRename(path.join(paths.notes_path, filePath + baseExt), newFilename + baseExt);

        sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
            notes: FileSystemService.getInstance().buildNotesStructure(paths.notes_path)?.children || {}
        });
    }

    const deleteFile = (filePath) => {
        if (!filePath) {
            console.error('Invalid parameters for deleteFile');
            return;
        }

        const baseExt = '.txt';
        FileSystemService.getInstance().fileDelete(path.join(paths.notes_path, filePath + baseExt));

        sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
            notes: FileSystemService.getInstance().buildNotesStructure(paths.notes_path)?.children || {}
        });
    }

    const writeFile = (filePath, content = "", flag = 'c') => {
        if (!filePath) {
            console.error('Invalid parameters for writeFile');
            return;
        }

        let total_path = null;

        if (flag === 'c') {
            total_path = path.join(paths.notes_path, filePath);
        }
        else if (flag === 'w') {
            total_path = filePath;
        }
        
        if (total_path) {
            FileSystemService.getInstance().fileWrite(total_path, content, flag);
        }

        sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
            notes: FileSystemService.getInstance().buildNotesStructure(paths.notes_path)?.children || {}
        });
    }

    const createFolder = (dirPath, name) => {
        if (!name) {
            console.error('Invalid parameters for createFolder');
            return;
        }

        FileSystemService.getInstance().folderCreate(path.join(paths.notes_path, dirPath), name);

        sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
            notes: FileSystemService.getInstance().buildNotesStructure(paths.notes_path)?.children || {}
        });
    }

    const deleteFolder = (dirPath) => {
        if (!dirPath) {
            console.error('Invalid parameters for deleteFolder');
            return;
        }

        FileSystemService.getInstance().folderDelete(path.join(paths.notes_path, dirPath));

        sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
            notes: FileSystemService.getInstance().buildNotesStructure(paths.notes_path)?.children || {}
        });
    }

    const renameFolder = (dirPath, newName) => {
        if (!dirPath || !newName) {
            console.error('Invalid parameters for renameFolder');
            return;
        }

        FileSystemService.getInstance().folderRename(path.join(paths.notes_path, dirPath), newName);

        sendToAll(EventsType.EVENT, EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA, {
            notes: FileSystemService.getInstance().buildNotesStructure(paths.notes_path)?.children || {}
        });
    }
    
    const scanDirectory = (dirPath) => {
        try {
            return {
                success: true,
                apps: FileSystemService.getInstance().scanDir(dirPath).map(app => ({
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
    }

    const showOpenDialog = async (mainWindow) => {
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
    }

    return {
        renameFile,
        deleteFile,
        writeFile,
        createFolder,
        deleteFolder,
        renameFolder,
        scanDirectory,
        showOpenDialog
    }
}

export { useFileSystem };