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

            while (fs.existsSync(tempFilePath)) {
                tempFilePath = path.join(dir, `${base} (copy${counter > 1 ? ' ' + counter : ''})${ext}`);
                counter++;
            }

            fs.renameSync(filePath, tempFilePath);
        } else {
            throw new Error(`Файл ${filePath} не найден`);
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
        const stats = fs.statSync(start_path);
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
                        const fileName = path.parse(file).name;
                        structure.children[fileName] = childStruct;
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
}
