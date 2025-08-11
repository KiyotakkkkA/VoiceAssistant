import React from 'react';

interface AppConfig {
	display_name?: string;
	alias?: string;
	type?: string;
	path?: string;
	[k: string]: any;
}

interface AppsGridProps {
	apps: Record<string, AppConfig>;
}

const AppCard: React.FC<{ appKey: string; cfg: AppConfig }> = ({ appKey, cfg }) => {
	return (
		<div
			data-app-key={appKey}
			className='group relative rounded-md border border-[#333] bg-[#262626] hover:bg-[#2d2d2d] transition-colors overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:border-[#3d3d3d] active:scale-[0.98] duration-200'
			onClick={() => {
				window?.postMessage?.({ type: 'open_app_path', payload: { key: appKey, path: cfg.path } }, '*');
			}}
		>
			<div
				className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'
				style={{ background: 'radial-gradient(circle at 75% 20%, rgba(0,122,204,0.15), transparent 60%)' }}
			/>
			<div className='p-3 relative z-10 flex flex-col min-h-[120px]'>
				<div className='flex-1'>
					<div className='text-[11px] font-medium tracking-wider text-gray-400 mb-1'>{cfg.type || '—'}</div>
					<div className='text-sm font-semibold text-gray-100 leading-snug'>{cfg.display_name || appKey}</div>
					{cfg.alias && <div className='text-[10px] text-gray-500 mt-1'>({cfg.alias})</div>}
				</div>
				<div className='mt-2 pt-2 border-t border-[#333] flex items-center justify-between text-[10px] text-gray-500'>
					<span className='truncate max-w-[110px]' title={cfg.path}>{cfg.path?.split('\\').slice(-1)[0] || ''}</span>
					<span className='opacity-0 group-hover:opacity-100 text-[#007acc] transition-opacity duration-300'>Открыть</span>
				</div>
			</div>
			<div className='absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#007acc] to-[#0dbc79] opacity-0 group-hover:opacity-100 transition-opacity' />
		</div>
	);
};

const AppsGrid: React.FC<AppsGridProps> = ({ apps }) => {
	const keys = Object.keys(apps || {});
	return (
		<div className='w-full h-full p-6 overflow-auto custom-scrollbar'>
			<div className='max-w-5xl mx-auto'>
				<h2 className='text-lg font-semibold mb-4 tracking-wide text-gray-200'>Приложения</h2>
				<p className='text-[11px] uppercase tracking-wider text-gray-500 mb-4'>Найдено: {keys.length}</p>
				<div className='grid gap-4 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]'>
					{keys.map(k => <AppCard key={k} appKey={k} cfg={apps[k]} />)}
					{keys.length === 0 && (<div className='text-gray-600 text-sm col-span-full py-10 text-center'>Нет загруженных приложений</div>)}
				</div>
			</div>
		</div>
	);
};

export default AppsGrid;
