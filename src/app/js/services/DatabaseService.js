import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import paths from '../paths.js';

export class DatabaseService {
    static instance;
    
    constructor() {
        this.db = null;
        this.statements = {};
        this.initDatabase();
    }

    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    initDatabase() {
        try {
            const dbDir = paths.db_path;
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            const dbPath = path.join(dbDir, 'apps.db');
            this.db = new Database(dbPath);
            
            this.db.pragma('foreign_keys = ON');
            
            this.createTables();
            this.prepareStatements();
            
        } catch (error) {
            console.error('[DatabaseService] Ошибка инициализации:', error);
            throw new Error(`Ошибка инициализации базы данных: ${error.message}`);
        }
    }

    createTables() {
        const createTablesSQL = `
            CREATE TABLE IF NOT EXISTS app_paths (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_scan DATETIME,
                is_active BOOLEAN DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS apps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                executable_path TEXT UNIQUE NOT NULL,
                icon_path TEXT,
                file_size INTEGER DEFAULT 0,
                file_type TEXT DEFAULT '.exe',
                last_modified DATETIME,
                launch_count INTEGER DEFAULT 0,
                last_launched DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (path_id) REFERENCES app_paths(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_apps_name ON apps(name);
            CREATE INDEX IF NOT EXISTS idx_apps_launch_count ON apps(launch_count DESC);
            CREATE INDEX IF NOT EXISTS idx_apps_path_id ON apps(path_id);
            CREATE INDEX IF NOT EXISTS idx_app_paths_active ON app_paths(is_active);
        `;

        this.db.exec(createTablesSQL);
    }

    prepareStatements() {
        this.statements = {
            insertPath: this.db.prepare(`
                INSERT OR REPLACE INTO app_paths (path, name, is_active) 
                VALUES (?, ?, 1)
            `),
            
            reactivatePath: this.db.prepare(`
                UPDATE app_paths SET is_active = 1, last_scan = CURRENT_TIMESTAMP 
                WHERE path = ?
            `),
            
            getPathId: this.db.prepare(`
                SELECT id FROM app_paths WHERE path = ?
            `),
            
            getActivePathId: this.db.prepare(`
                SELECT id FROM app_paths WHERE path = ? AND is_active = 1
            `),
            
            updatePathScanTime: this.db.prepare(`
                UPDATE app_paths 
                SET last_scan = CURRENT_TIMESTAMP 
                WHERE id = ?
            `),
            
            getActivePaths: this.db.prepare(`
                SELECT * FROM app_paths 
                WHERE is_active = 1 
                ORDER BY name
            `),
            
            insertApp: this.db.prepare(`
                INSERT OR REPLACE INTO apps 
                (path_id, name, executable_path, file_size, file_type, last_modified) 
                VALUES (?, ?, ?, ?, ?, ?)
            `),
            
            deleteAppsByPath: this.db.prepare(`
                DELETE FROM apps WHERE path_id = ?
            `),
            
            getAllApps: this.db.prepare(`
                SELECT 
                    a.*,
                    p.path as folder_path,
                    p.name as folder_name
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE p.is_active = 1
                ORDER BY a.launch_count DESC, a.name ASC
            `),

            getAppsByPathId: this.db.prepare(`
                SELECT * FROM apps WHERE path_id = ?
            `),
            
            searchApps: this.db.prepare(`
                SELECT 
                    a.*,
                    p.path as folder_path,
                    p.name as folder_name
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE a.name LIKE ? AND p.is_active = 1
                ORDER BY a.launch_count DESC, a.name ASC
                LIMIT ?
            `),
            
            incrementLaunchCount: this.db.prepare(`
                UPDATE apps 
                SET launch_count = launch_count + 1,
                    last_launched = CURRENT_TIMESTAMP
                WHERE id = ?
            `),
            
            getAppById: this.db.prepare(`
                SELECT * FROM apps WHERE id = ?
            `),
            
            getAppStats: this.db.prepare(`
                SELECT 
                    COUNT(*) as total_apps,
                    COUNT(DISTINCT path_id) as total_paths,
                    SUM(launch_count) as total_launches
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE p.is_active = 1
            `),
            
            deleteApp: this.db.prepare(`
                DELETE FROM apps WHERE id = ?
            `),
            
            deleteFolder: this.db.prepare(`
                UPDATE app_paths SET is_active = 0 WHERE id = ?
            `),
            
            deleteFolderApps: this.db.prepare(`
                DELETE FROM apps WHERE path_id = ?
            `)
        };
    }

    addPath(folderPath, folderName) {
        try {
            const result = this.statements.insertPath.run(folderPath, folderName);
            return result.changes > 0;
        } catch (error) {
            console.error('[DatabaseService] Ошибка добавления пути:', error);
            throw new Error(`Ошибка добавления пути: ${error.message}`);
        }
    }

    getPathId(folderPath) {
        try {
            const result = this.statements.getPathId.get(folderPath);
            return result ? result.id : null;
        } catch (error) {
            console.error('[DatabaseService] Ошибка получения ID пути:', error);
            return null;
        }
    }

    getActivePathId(folderPath) {
        try {
            const result = this.statements.getActivePathId.get(folderPath);
            return result ? result.id : null;
        } catch (error) {
            console.error('[DatabaseService] Ошибка получения активного ID пути:', error);
            return null;
        }
    }

    saveApps(folderPath, folderName, apps) {
        try {
            const transaction = this.db.transaction(() => {
                const activePathId = this.getActivePathId(folderPath);
                const anyPathId = this.getPathId(folderPath);
                
                if (activePathId) {
                    // Путь существует и активен - обновляем приложения
                    return this.updateAppsForPath(activePathId, apps);
                } else if (anyPathId) {
                    // Путь существует но неактивен - реактивируем и обновляем
                    this.statements.reactivatePath.run(folderPath);
                    return this.updateAppsForPath(anyPathId, apps);
                } else {
                    // Новый путь - создаем и добавляем все приложения
                    this.statements.insertPath.run(folderPath, folderName);
                    
                    const pathId = this.getPathId(folderPath);
                    if (!pathId) {
                        throw new Error('Не удалось получить ID пути');
                    }
                    
                    for (const app of apps) {
                        this.statements.insertApp.run(
                            pathId,
                            app.name,
                            app.path,
                            app.size || 0,
                            app.type || '.exe',
                            app.modified ? new Date(app.modified).toISOString() : new Date().toISOString()
                        );
                    }
                    
                    this.statements.updatePathScanTime.run(pathId);
                }
            });
            
            transaction();
            return true;
        } catch (error) {
            console.error('[DatabaseService] Ошибка сохранения приложений:', error);
            throw new Error(`Ошибка сохранения приложений: ${error.message}`);
        }
    }

    updateAppsForPath(pathId, apps) {
        try {
            const existingApps = this.statements.getAppsByPathId.all(pathId);
            const existingPaths = new Set(existingApps.map(app => app.path));
            
            let newAppsCount = 0;
            for (const app of apps) {
                if (!existingPaths.has(app.path)) {
                    this.statements.insertApp.run(
                        pathId,
                        app.name,
                        app.path,
                        app.size || 0,
                        app.type || '.exe',
                        app.modified ? new Date(app.modified).toISOString() : new Date().toISOString()
                    );
                    newAppsCount++;
                }
            }
            
            this.statements.updatePathScanTime.run(pathId);
            
            console.log(`[DatabaseService] Добавлено ${newAppsCount} новых приложений для существующего пути`);
            return true;
        } catch (error) {
            console.error('[DatabaseService] Ошибка обновления приложений:', error);
            throw error;
        }
    }

    getAppsForUI() {
        try {
            const apps = this.statements.getAllApps.all();
            
            const groupedApps = {};
            const paths = {};

            apps.forEach(app => {
                if (!paths[app.path_id]) {
                    paths[app.path_id] = {
                        id: app.path_id.toString(),
                        path: app.folder_path,
                        name: app.folder_name
                    };
                }

                if (!groupedApps[app.path_id]) {
                    groupedApps[app.path_id] = [];
                }

                groupedApps[app.path_id].push({
                    id: app.id.toString(),
                    name: app.name,
                    path: app.executable_path,
                    pathId: app.path_id.toString(),
                    launchCount: app.launch_count,
                    isFavorite: Boolean(app.is_favorite),
                    lastLaunched: app.last_launched
                });
            });

            return {
                paths: Object.values(paths),
                apps: groupedApps
            };
        } catch (error) {
            console.error('[DatabaseService] Ошибка получения приложений:', error);
            return { paths: [], apps: {} };
        }
    }

    searchApps(searchTerm, limit = 50) {
        try {
            return this.statements.searchApps.all(`%${searchTerm}%`, limit);
        } catch (error) {
            console.error('[DatabaseService] Ошибка поиска приложений:', error);
            return [];
        }
    }

    incrementLaunchCount(appId) {
        try {
            const result = this.statements.incrementLaunchCount.run(appId);
            return result.changes > 0;
        } catch (error) {
            console.error('[DatabaseService] Ошибка обновления счетчика запусков:', error);
            return false;
        }
    }

    getStats() {
        try {
            return this.statements.getAppStats.get();
        } catch (error) {
            console.error('[DatabaseService] Ошибка получения статистики:', error);
            return { total_apps: 0, total_paths: 0, total_launches: 0 };
        }
    }

    getActivePaths() {
        try {
            return this.statements.getActivePaths.all();
        } catch (error) {
            console.error('[DatabaseService] Ошибка получения путей:', error);
            return [];
        }
    }

    deleteApp(appId) {
        try {
            const result = this.statements.deleteApp.run(appId);
            return result.changes > 0;
        } catch (error) {
            console.error('[DatabaseService] Ошибка удаления приложения:', error);
            return false;
        }
    }

    deleteFolder(folderId) {
        try {
            this.statements.deleteFolderApps.run(folderId);
            
            const result = this.statements.deleteFolder.run(folderId);
            
            return result.changes > 0;
        } catch (error) {
            console.error('[DatabaseService] Ошибка удаления папки:', error);
            return false;
        }
    }

    getAppByPath(executablePath) {
        try {
            const result = this.statements.getAllApps.all().find(app => app.executable_path === executablePath);
            return result || null;
        } catch (error) {
            console.error('[DatabaseService] Ошибка поиска приложения по пути:', error);
            return null;
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('[DatabaseService] Соединение с базой данных закрыто');
        }
    }
}
