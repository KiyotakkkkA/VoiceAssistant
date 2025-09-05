export interface DatabaseApp {
    id: number;
    name: string;
    path: string;
    icon: string | null;
    type: string;
    launch_count: number;
    last_launched: string | null;
    is_favorite: boolean;
    folder_id: number;
}

export interface DatabasePath {
    id: number;
    path: string;
    name: string;
    created_at: string;
    app_count: number;
}

export interface DatabaseStats {
    total_apps: number;
    total_paths: number;
    total_launches: number;
}

export interface DatabaseData {
    paths: DatabasePath[];
    apps: Record<string, DatabaseApp[]>;
}

export interface DatabaseResult {
    apps: DatabaseData;
    stats: DatabaseStats;
}

export class DatabaseService {
    private db: any;
    private prepared: {
        insertPath: any;
        insertApp: any;
        getPathByPath: any;
        getAppsForPath: any;
        getAllPaths: any;
        deleteAppById: any;
        deletePathById: any;
        incrementLaunchCount: any;
        getStats: any;
        searchApps: any;
    };

    constructor(dbPath: string);
    
    private initDatabase(): void;
    private prepareStatements(): void;
    
    saveApps(folderPath: string, folderName: string, apps: Array<{
        name: string;
        path: string;
        icon?: string;
        type: 'exe' | 'lnk';
    }>): boolean;
    
    getAppsForUI(): DatabaseData;
    
    incrementLaunchCount(appId: number): boolean;
    
    getStats(): DatabaseStats;
    
    searchApps(query: string): DatabaseApp[];
    
    deleteApp(appId: number): boolean;
    
    deleteFolder(folderId: number): boolean;
    
    close(): void;
    
    static getInstance(): DatabaseService;
}

export default DatabaseService;
