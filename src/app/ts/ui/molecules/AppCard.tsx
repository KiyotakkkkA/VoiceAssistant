import { socketClient } from '../../utils';
import React from 'react';

interface AppConfig {
	display_name?: string;
	alias?: string;
	type?: string;
	path?: string;
	[k: string]: any;
}

const AppCard: React.FC<{ appKey: string; cfg: AppConfig }> = ({ appKey, cfg }) => {
    const fileName = cfg.path?.split(/\\|\//).slice(-1)[0] || '';
    const handleOpen = () => {
        socketClient.send({ type: 'action_open_app_path', payload: { key: appKey, path: cfg.path } })
        window?.postMessage?.({ type: 'action_open_app_path', payload: { key: appKey, path: cfg.path } }, '*');
    };
    
    const getInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };
    
    const displayName = cfg.display_name || appKey;
    const initials = getInitials(displayName);
    const category = cfg.category || cfg.type || 'Утилиты';
    
    return (
        <div
            data-app-key={appKey}
            role='button'
            tabIndex={0}
            onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); handleOpen(); } }}
            className='group relative rounded-lg border border-appcard-border bg-appcard-bg overflow-hidden cursor-pointer hover:border-appcard-border-hover active:scale-[0.98] transition-all duration-200 hover:shadow-lg'
            onClick={handleOpen}
        >
            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-appcard-accent/10 via-transparent to-widget-accent-b/10' />
            
            <div className='absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-appcard-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            
            <div className='p-3 relative z-10'>
                <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-appcard-accent/20 to-widget-accent-b/20 border border-appcard-accent/30 flex items-center justify-center'>
                        <span className='text-sm font-bold text-appcard-accent tracking-tight'>{initials}</span>
                    </div>
                    
                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                            <h3 className='font-semibold text-sm text-ui-text-primary truncate leading-tight'>{displayName}</h3>
                            {cfg.alias && <span className='text-xs text-ui-text-secondary opacity-70'>({cfg.alias})</span>}
                        </div>
                        <div className='flex items-center gap-2 text-xs text-ui-text-secondary'>
                            <span className='px-1.5 py-0.5 rounded text-[10px] font-medium bg-ui-text-secondary/10 text-ui-text-secondary uppercase tracking-wide'>{category}</span>
                        </div>
                    </div>
                </div>
                
                <div className='mt-3 pt-2 border-t border-appcard-divider/50 flex items-center justify-between'>
                    <span className='text-xs text-ui-text-muted truncate max-w-[140px] font-mono' title={cfg.path}>{fileName}</span>
                    <div className='flex items-center gap-1 text-xs text-appcard-accent opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0'>
                        <svg width='12' height='12' viewBox='0 0 24 24' fill='currentColor'>
                            <path d='M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zM21 3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z'/>
                        </svg>
                        <span className='font-medium'>Открыть</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AppCard };
export type {
    AppConfig
}