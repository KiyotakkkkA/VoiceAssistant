import fs from "fs";
import path from "path";
import fsExtra from "fs-extra";

export class FileSystemService {

    static instance;

	constructor() {}

	static getInstance(){
		if (!FileSystemService.instance) {
			FileSystemService.instance = new FileSystemService();
		}
		return FileSystemService.instance;
	}

    fileWrite(filePath, content = "", flag = 'c') {
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext);
        let counter = 1;

        while (fs.existsSync(filePath) && flag === 'c') {
            filePath = path.join(path.dirname(filePath), `${base} (copy${counter > 1 ? ' ' + counter : ''})${ext}`);
            counter++;
        }

        if (['c', 'w'].includes(flag)) {
            fs.writeFileSync(filePath, content, "utf8");
        }
    }

    fileDelete(filePath) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            throw new Error(`Файл ${filePath} не найден`);
        }
    }

    fileRename(filePath, newFilename) {
        if (fs.existsSync(filePath)) {
            const dir = path.dirname(filePath);
            let tempFilePath = path.join(dir, newFilename);
            let counter = 1;

            let meta = path.parse(tempFilePath);

            let base = meta.name;
            let ext = meta.ext;

            while (fs.existsSync(tempFilePath)) {
                tempFilePath = path.join(dir, `${base} (copy${counter > 1 ? ' ' + counter : ''})${ext}`);
                counter++;
            }

            fs.renameSync(filePath, tempFilePath);
        } else {
            throw new Error(`Файл ${filePath} не найден`);
        }
    }

    fileMove(sourcePath, destinationPath) {
        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Файл ${sourcePath} не найден`);
        }

        const destDir = path.dirname(destinationPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        let finalDestPath = destinationPath;
        let counter = 1;
        const meta = path.parse(destinationPath);
        const base = meta.name;
        const ext = meta.ext;

        while (fs.existsSync(finalDestPath)) {
            finalDestPath = path.join(meta.dir, `${base} (${counter})${ext}`);
            counter++;
        }

        try {
            fs.renameSync(sourcePath, finalDestPath);
        } catch (error) {
            if (error.code === 'EXDEV') {
                fs.copyFileSync(sourcePath, finalDestPath);
                fs.unlinkSync(sourcePath);
            } else {
                throw error;
            }
        }
    }

    folderCreate(dirPath, name) {
        const newPath = path.join(dirPath, name);
        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath, { recursive: true });
        } else {
            let newPathCopy = newPath + ' (copy)';
            while (fs.existsSync(newPathCopy)) {
                newPathCopy = newPathCopy + ' (copy)';
            }
            fs.mkdirSync(newPathCopy, { recursive: true });
        }
    }

    folderRename(dirPath, newName) {
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Папка ${dirPath} не найдена`);
        }
        const parentDir = path.dirname(dirPath);
        const newPath = path.join(parentDir, newName);

        try {
            fs.renameSync(dirPath, newPath);
        } catch (error) {
            if (error.code === "EPERM") {
                try {
                    fsExtra.copySync(dirPath, newPath);
                    fsExtra.removeSync(dirPath);
                } catch (copyError) {
                    throw new Error(`Не удалось переименовать (копия+удаление): ${copyError.message}`);
                }
            } else {
                throw error;
            }
        }
    }

    folderDelete(dirPath) {
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Папка ${dirPath} не найдена`);
        }
        fs.rmSync(dirPath, { recursive: true, force: true });
    }

    buildNotesStructure(start_path, idCounter = { value: 0 }) {
        try {
            if (!fs.existsSync(start_path)) {
                fs.mkdirSync(start_path, { recursive: true });
            }
        } catch (e) {
            console.warn('[FileSystemService] Failed to ensure notes directory exists:', e.message);
            return { name: path.basename(start_path), type: 'folder', path: start_path, children: {} };
        }

        let stats;
        try {
            stats = fs.statSync(start_path);
        } catch (e) {
            console.warn('[FileSystemService] statSync failed for', start_path, e.message);
            return { name: path.basename(start_path), type: 'folder', path: start_path, children: {} };
        }
        const baseName = path.basename(start_path);
        const relativePath = path.relative(process.cwd(), start_path);

        if (stats.isDirectory()) {
            const structure = {
                name: baseName,
                type: 'folder',
                path: relativePath,
                children: {}
            };

            try {
                const list = fs.readdirSync(start_path);
                
                list.forEach(file => {
                    const filePath = path.join(start_path, file);
                    const childStruct = this.buildNotesStructure(filePath, idCounter);
                    if (childStruct) {
                        const isFile = childStruct.type === 'file';
                        const baseKey = isFile ? path.parse(file).name : file;
                        
                        let uniqueKey = baseKey;
                        if (structure.children[uniqueKey]) {
                            uniqueKey = isFile ? `file:${baseKey}` : `folder:${baseKey}`;

                            const existingItem = structure.children[baseKey];
                            delete structure.children[baseKey];
                            const existingIsFile = existingItem.type === 'file';
                            const existingKey = existingIsFile ? `file:${baseKey}` : `folder:${baseKey}`;
                            structure.children[existingKey] = existingItem;
                        }
                        
                        structure.children[uniqueKey] = childStruct;
                    }
                });
            } catch (error) {
                console.warn(`Cannot read directory ${start_path}:`, error.message);
            }

            return structure;
        } else {
            if (start_path.endsWith(".txt") || start_path.endsWith(".md")) {
                try {
                    const content = fs.readFileSync(start_path, "utf8");
                    const fileName = path.parse(baseName).name;
                    const modifiedTime = stats.mtime;
                    
                    const preview = content
                        .replace(/[#*`\[\]()]/g, '')
                        .split('\n')
                        .filter(line => line.trim())
                        .slice(0, 2)
                        .join(' ')
                        .substring(0, 100) + (content.length > 100 ? '...' : '');

                    const now = new Date();
                    const diffMs = now.getTime() - modifiedTime.getTime();
                    const diffMins = Math.floor(diffMs / (1000 * 60));
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    
                    let modified;
                    if (diffMins < 60) {
                        modified = diffMins <= 1 ? 'Только что' : `${diffMins} минут назад`;
                    } else if (diffHours < 24) {
                        modified = diffHours === 1 ? '1 час назад' : `${diffHours} часов назад`;
                    } else if (diffDays < 30) {
                        modified = diffDays === 1 ? '1 день назад' : `${diffDays} дней назад`;
                    } else {
                        modified = modifiedTime.toLocaleDateString();
                    }

                    return {
                        id: idCounter.value++,
                        name: fileName,
                        type: 'note',
                        content: content,
                        modified: modified,
                        preview: preview,
                        path: relativePath
                    };
                } catch (error) {
                    console.warn(`Cannot read file ${start_path}:`, error.message);
                    return null;
                }
            }
            return null;
        }
    }

    scanDir(dirPath) {
        const results = [];
        
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Папка ${dirPath} не найдена`);
        }

        const scanRecursive = (currentPath, depth = 0) => {
            if (depth > 3) return;

            try {
                const items = fs.readdirSync(currentPath);
                
                items.forEach(item => {
                    const fullPath = path.join(currentPath, item);
                    
                    try {
                        const stats = fs.statSync(fullPath);
                        
                        if (stats.isFile()) {
                            const ext = path.extname(item).toLowerCase();
                            
                            if (ext === '.exe' || ext === '.lnk') {
                                const name = path.basename(item, ext);
                                
                                const systemFiles = ['uninstall', 'setup', 'installer', 'updater', 'crash', 'error'];
                                const isSystemFile = systemFiles.some(sysFile => 
                                    name.toLowerCase().includes(sysFile)
                                );
                                
                                if (!isSystemFile) {
                                    results.push({
                                        id: Date.now() + Math.random(),
                                        name: name,
                                        path: fullPath,
                                        type: ext,
                                        size: stats.size,
                                        modified: stats.mtime
                                    });
                                }
                            }
                        } else if (stats.isDirectory()) {
                            const systemFolders = ['$recycle.bin', 'system volume information', 'windows', 'perflogs'];
                            const folderName = item.toLowerCase();
                            
                            if (!systemFolders.includes(folderName) && !folderName.startsWith('.')) {
                                scanRecursive(fullPath, depth + 1);
                            }
                        }
                    } catch (error) {
                        console.warn(`Cannot access ${fullPath}:`, error.message);
                    }
                });
            } catch (error) {
                console.warn(`Cannot read directory ${currentPath}:`, error.message);
            }
        };

        scanRecursive(dirPath);
        
        return results.sort((a, b) => a.name.localeCompare(b.name));
    }
}
