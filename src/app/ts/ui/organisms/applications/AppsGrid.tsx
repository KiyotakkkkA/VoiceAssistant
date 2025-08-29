import React from 'react';
import { AppCard } from '../../molecules/widgets';
import { TextInput } from '../../atoms/input';
import { IconTrash } from '../../atoms/icons';

interface App {
    id: string;
    name: string;
    path: string;
}

interface AppsGridProps {
	apps: Record<string, App>;
}

const mockPaths = [
	{ id: '1', path: 'C:\\Program Files', name: 'Program Files' },
	{ id: '2', path: 'C:\\Program Files (x86)', name: 'Program Files (x86)' },
	{ id: '3', path: 'C:\\Users\\User\\Desktop', name: 'Desktop' }
];

const mockApps = [
	{ id: '1', name: 'Visual Studio Code', path: 'C:\\Program Files\\Microsoft VS Code\\Code.exe', pathId: '1' },
	{ id: '2', name: 'Google Chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', pathId: '1' },
	{ id: '3', name: 'Discord', path: 'C:\\Program Files (x86)\\Discord\\Discord.exe', pathId: '2' },
	{ id: '4', name: 'Steam', path: 'C:\\Program Files (x86)\\Steam\\steam.exe', pathId: '2' },
	{ id: '5', name: 'MyApp', path: 'C:\\Users\\User\\Desktop\\MyApp.exe', pathId: '3' }
];

const AppsGrid: React.FC<AppsGridProps> = ({ apps }) => {
	const groupedApps = mockApps.reduce((acc, app) => {
		const pathInfo = mockPaths.find(p => p.id === app.pathId);
		if (pathInfo) {
			if (!acc[pathInfo.id]) {
				acc[pathInfo.id] = { path: pathInfo, apps: [] };
			}
			acc[pathInfo.id].apps.push(app);
		}
		return acc;
	}, {} as Record<string, { path: typeof mockPaths[0], apps: typeof mockApps }>);

	return (
		<div className='w-full h-full p-4 overflow-auto custom-scrollbar'>
			<div className='max-w-6xl mx-auto'>
				<div className='mb-6'>
					<h2 className='text-xl font-bold mb-2 tracking-tight text-ui-text-primary'>Приложения</h2>
					<div className='flex items-center gap-4 text-sm text-ui-text-secondary'>
						<span>Найдено: <span className='font-semibold text-ui-text-accent'>{mockApps.length}</span></span>
						<span className='text-ui-text-muted'>•</span>
						<span>Пути: <span className='font-semibold text-ui-text-accent'>{mockPaths.length}</span></span>
					</div>
				</div>

				<div className='mb-6 p-4 bg-ui-bg-secondary/30 rounded-lg border border-ui-border-primary'>
					<div className='flex gap-3'>
						<div className='flex-1'>
							<TextInput
								placeholder='Добавить путь для поиска приложений (например: C:\Program Files)'
							/>
						</div>
						<button className='px-4 py-2 bg-ui-bg-secondary text-white rounded-md hover:bg-ui-bg-secondary-light transition-colors font-medium'>
							Добавить
						</button>
					</div>
				</div>

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
											onClick={() => {}}
											className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
											title="Очистить историю"
										>
											<IconTrash size={16} />
										</button>
									</div>
								</div>
							</div>

							<div className='p-4 bg-ui-bg-primary-light/30'>
								<div className='grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
									{apps.map(app => (
										<AppCard key={app.id} app={app} />
									))}
								</div>
							</div>
						</div>
					))}
				</div>

				{mockPaths.length === 0 && (
					<div className='flex flex-col items-center justify-center py-16 text-center'>
						<div className='w-16 h-16 rounded-full bg-ui-text-secondary/10 flex items-center justify-center mb-4'>
							<svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor' className='text-ui-text-secondary'>
								<path d='M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z'/>
							</svg>
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