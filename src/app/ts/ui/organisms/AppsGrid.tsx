import React from 'react';
import { AppCard, AppConfig} from '../molecules';

interface AppsGridProps {
	apps: Record<string, AppConfig>;
}

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
