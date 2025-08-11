import { socketClient } from '../../utils/SocketClient';

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
        socketClient.send({ type: 'open_app_path', payload: { key: appKey, path: cfg.path } })
        window?.postMessage?.({ type: 'open_app_path', payload: { key: appKey, path: cfg.path } }, '*');
    };
    return (
        <div
            data-app-key={appKey}
            role='button'
            tabIndex={0}
            onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); handleOpen(); } }}
            className='group relative rounded-md border border-[#303030] bg-[#262626] overflow-hidden cursor-pointer shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none hover:border-[#3d3d3d] active:scale-[0.985] duration-200 card-hover-lift'
            onClick={handleOpen}
        >
            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none'
                style={{ background: 'radial-gradient(circle at 75% 15%, rgba(0,122,204,0.18), transparent 55%)'}} />
            <div className='absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#007acc] via-[#0dbc79] to-[#007acc] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <div className='absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#007acc] to-[#0dbc79] opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <div className='p-3 relative z-10 flex flex-col min-h-[128px]'>
                <div className='flex-1'>
                    <div className='text-[10px] font-semibold tracking-wider text-gray-500 mb-1 flex items-center gap-1'>
                        <span className='uppercase'>{cfg.type || '—'}</span>
                    </div>
                    <div className='text-[13px] font-semibold text-gray-100 leading-snug'>{cfg.display_name || appKey}</div>
                    {cfg.alias && <div className='text-[10px] text-gray-500 mt-1 italic'>({cfg.alias})</div>}
                </div>
                <div className='mt-3 pt-2 border-t border-[#333] flex items-center justify-between text-[10px] text-gray-500'>
                    <span className='truncate max-w-[110px]' title={cfg.path}>{fileName}</span>
                    <span className='flex items-center gap-1 text-[#007acc] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0'>
                        <svg width='10' height='10' viewBox='0 0 24 24' className='opacity-70'><path fill='currentColor' d='M10 4v2H5v13h13v-5h2v6H3V4h7zm9-2v8h-2V6.414l-7.793 7.793-1.414-1.414L15.586 5H12V3h7z'/></svg>
                        Перейти
                    </span>
                </div>
            </div>
            <div className='pointer-events-none absolute inset-0 rounded-md border border-transparent group-hover:border-[#3a3a3a] transition-colors' />
        </div>
    );
};

export { AppCard };
export type {
    AppConfig
}