import React from 'react';
import { AppCard, AppConfig} from '../../molecules/widgets';

interface AppsGridProps {
	apps: Record<string, AppConfig>;
}

const AppsGrid: React.FC<AppsGridProps> = ({ apps }) => {
	const keys = Object.keys(apps || {});
	return (
		<div className='w-full h-full p-4 overflow-auto custom-scrollbar'>
			<div className='max-w-6xl mx-auto'>
				<div className='mb-6'>
					<h2 className='text-xl font-bold mb-2 tracking-tight text-ui-text-primary'>Приложения</h2>
					<div className='flex items-center gap-4 text-sm text-ui-text-secondary'>
						<span>Найдено: <span className='font-semibold text-ui-text-accent'>{keys.length}</span></span>
						{keys.length > 0 && <span className='text-ui-text-muted'>•</span>}
						{keys.length > 0 && <span>Нажмите на карточку для запуска</span>}
					</div>
				</div>
				
				{keys.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-16 text-center'>
						<div className='w-16 h-16 rounded-full bg-ui-text-secondary/10 flex items-center justify-center mb-4'>
							<svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor' className='text-ui-text-secondary'>
								<path d='M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2m9 16v-2H6v2h9m3-4v-2H6v2h12z'/>
							</svg>
						</div>
						<h3 className='text-lg font-semibold text-ui-text-primary mb-2'>Нет приложений</h3>
						<p className='text-ui-text-muted max-w-md'>Приложения будут отображены здесь после загрузки конфигурации YAML</p>
					</div>
				) : (
					<div className='grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
						{keys.map(k => <AppCard key={k} appKey={k} cfg={apps[k]} />)}
					</div>
				)}
			</div>
		</div>
	);
};

export { AppsGrid };
