import React from 'react';
import { AppCard } from '../../molecules/cards';
import { IconFolder, IconTrash } from '../../atoms/icons';

interface App {
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

interface PathInfo {
    id: number;
    path: string; 
    name: string;
    created_at: string;
    app_count: number;
}

interface DatabaseData {
    paths: PathInfo[];
    apps: Record<string, App[]>;
}

interface Stats {
    total_apps: number;
    total_paths: number;
    total_launches: number;
}

interface AppsGridProps {
    databaseData: DatabaseData;
    stats: Stats;
    isLoading: boolean;
    onDeleteFolder: (folderId: number, folderName: string) => void;
    onDeleteApp: (appId: number, appName: string) => void;
    onLaunchApp: (appId: string, appPath: string) => void;
    onAddPath: () => void;
}

const AppsGrid: React.FC<AppsGridProps> = ({
    databaseData,
    stats,
    isLoading,
    onDeleteFolder,
    onDeleteApp,
    onLaunchApp,
    onAddPath
}) => {
    const groupedApps = databaseData.paths.reduce((acc, path) => {
        const pathApps = databaseData.apps[path.id.toString()] || [];
        if (pathApps.length > 0) {
            acc[path.id] = { path, apps: pathApps };
        }
        return acc;
    }, {} as Record<number, { path: PathInfo, apps: App[] }>);

    return (
        <div className='w-full h-full p-4 overflow-auto custom-scrollbar'>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h2 className='text-xl font-bold mb-2 tracking-tight text-ui-text-primary'>Приложения</h2>
                    <div className='flex items-center gap-4 text-sm text-ui-text-secondary'>
                        <span>Найдено: <span className='font-semibold text-ui-text-accent'>{stats.total_apps}</span></span>
                        <span className='text-ui-text-muted'>•</span>
                        <span>Пути: <span className='font-semibold text-ui-text-accent'>{stats.total_paths}</span></span>
                        <span className='text-ui-text-muted'>•</span>
                        <span>Запусков: <span className='font-semibold text-ui-text-accent'>{stats.total_launches}</span></span>
                    </div>
                </div>

                <div className='mb-6 p-4 bg-ui-bg-secondary/30 rounded-lg border border-ui-border-primary'>
                    <div className='flex gap-3'>
                        <div className='flex-1'>
                            <input
                                type="text"
                                placeholder='Добавить путь для поиска приложений (например: C:\Program Files)'
                                className='w-full px-3 py-2 bg-ui-bg-primary border border-ui-border-primary rounded-md text-ui-text-primary placeholder-ui-text-muted focus:outline-none focus:ring-1 focus:ring-ui-accent'
                                readOnly
                            />
                        </div>
                        <button
                            className='px-4 py-2 bg-ui-bg-secondary text-white rounded-md hover:bg-ui-bg-secondary-light transition-colors font-medium'
                            onClick={onAddPath}
                        >
                            Добавить
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className='flex flex-col items-center justify-center py-16 text-center'>
                        <div className='w-8 h-8 border-2 border-ui-text-accent border-t-transparent rounded-full animate-spin mb-4'></div>
                        <p className='text-ui-text-muted'>Загрузка приложений...</p>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {Object.values(groupedApps).map(({ path, apps }) => (
                            <div key={path.id} className='border border-ui-border-primary rounded-lg overflow-hidden'>
                                <div className='bg-ui-bg-secondary px-4 py-3 border-b border-ui-border-primary/20'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <h3 className='font-semibold text-ui-text-primary'>{path.name}</h3>
                                            <p className='text-sm text-ui-text-muted font-mono'>{path.path}</p>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <span className='text-xs bg-ui-text-accent/10 text-ui-text-accent px-2 py-1 rounded-full font-medium'>
                                                {apps.length} элем.
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteFolder(path.id, path.name);
                                                }}
                                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                title="Удалить папку и все приложения"
                                            >
                                                <IconTrash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className='p-4 bg-ui-bg-primary-light/30'>
                                    <div className='grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
                                        {apps.map(app => (
                                            <AppCard 
                                                key={app.id} 
                                                app={{
                                                    id: app.id.toString(),
                                                    name: app.name,
                                                    path: app.path
                                                }}
                                                onDelete={() => onDeleteApp(app.id, app.name)}
                                                onLaunch={onLaunchApp}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && databaseData.paths.length === 0 && (
                    <div className='flex flex-col items-center justify-center py-16 text-center'>
                        <div className='w-16 h-16 rounded-full bg-ui-text-secondary/10 flex items-center justify-center mb-4'>
                            <IconFolder size={32} className='text-ui-text-secondary' />
                        </div>
                        <h3 className='text-lg font-semibold text-ui-text-primary mb-2'>Нет путей</h3>
                        <p className='text-ui-text-muted max-w-md'>Добавьте пути для поиска приложений в системе</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export { AppsGrid };