import React from 'react';
import { IconTrash } from '../../../atoms/icons';

interface App {
    id: string;
    name: string;
    path: string;
}

interface AppCardProps {
    app: App;
    onDelete?: (appId: string) => void;
    onLaunch?: (appId: string, appPath: string) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onDelete, onLaunch }) => {

    const handleLaunch = () => {
        if (onLaunch) {
            onLaunch(app.id, app.path);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            onDelete(app.id);
        }
    };

    return (
        <div className='group p-3 bg-ui-bg-secondary border border-ui-border-primary/70 rounded-lg hover:border-ui-text-accent/30 hover:bg-ui-background-secondary/20 transition-all cursor-pointer relative'>
            <div 
                className='flex items-start gap-3'
                onClick={handleLaunch}
            >
                <div className='w-8 h-8 bg-ui-text-accent/10 rounded-md flex items-center justify-center flex-shrink-0'>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' className='text-ui-text-accent'>
                        <path d='M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z'/>
                    </svg>
                </div>
                <div className='flex-1 min-w-0'>
                    <h4 className='font-medium text-ui-text-primary group-hover:text-ui-text-accent transition-colors truncate'>
                        {app.name}
                    </h4>
                    <p className='text-xs text-ui-text-muted font-mono mt-1 truncate'>
                        {app.path}
                    </p>
                </div>
            </div>
            
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300"
                    title="Удалить приложение"
                >
                    <IconTrash size={16} />
                </button>
            )}
        </div>
    );
};

export { AppCard };