import React, { useState } from 'react';
import { AppCard } from '../../molecules/widgets/cards';
import { TextInput } from '../../atoms/input';
import { IconFolder, IconTrash } from '../../atoms/icons';
import { FolderChooseModal, AppScanModal } from '../../molecules/modals';

interface App {
    id: string;
    name: string;
    path: string;
    pathId?: string;
}

interface AppsGridProps {
	apps: Record<string, App>;
}

interface PathInfo {
    id: string;
    path: string; 
    name: string;
}

const AppsGrid: React.FC<AppsGridProps> = ({ apps }) => {
    const [isFolderModalOpen, setFolderModalOpen] = useState(false);
    const [isAppScanModalOpen, setAppScanModalOpen] = useState(false);
    const [selectedScanFolder, setSelectedScanFolder] = useState<string>('');
    const [mockPaths, setMockPaths] = useState<PathInfo[]>([]);
    const [mockApps, setMockApps] = useState<App[]>([]);
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

    const handleAddClick = () => {
        setFolderModalOpen(true);
    };

    const handleFolderSelect = (folderPath: string) => {
        setSelectedScanFolder(folderPath);
        setFolderModalOpen(false);
        setAppScanModalOpen(true);
    };

    const handleAppsConfirm = (selectedApps: any[], folderPath: string) => {
        let pathId = mockPaths.find(p => p.path === folderPath)?.id;
        
        if (!pathId) {
            pathId = (mockPaths.length + 1).toString();
            const pathName = folderPath.split('\\').pop() || folderPath;
            setMockPaths(prev => [...prev, { 
                id: pathId!, 
                path: folderPath, 
                name: pathName 
            }]);
        }

        const newApps = selectedApps.map(app => ({
            id: `${Date.now()}_${app.id}`,
            name: app.name,
            path: app.path,
            pathId: pathId!
        }));

        setMockApps(prev => [...prev, ...newApps]);
    };	return (
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
						<button
							className='px-4 py-2 bg-ui-bg-secondary text-white rounded-md hover:bg-ui-bg-secondary-light transition-colors font-medium'
							onClick={handleAddClick}
						>
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
							<IconFolder size={32} className='text-ui-text-secondary' />
						</div>
						<h3 className='text-lg font-semibold text-ui-text-primary mb-2'>Нет путей</h3>
						<p className='text-ui-text-muted max-w-md'>Добавьте пути для поиска приложений в системе</p>
					</div>
				)}
            </div>
            
            <FolderChooseModal
                isOpen={isFolderModalOpen}
                onClose={() => setFolderModalOpen(false)}
                onSelectFolder={handleFolderSelect}
            />
            
            <AppScanModal
                isOpen={isAppScanModalOpen}
                onClose={() => setAppScanModalOpen(false)}
                onConfirmApps={handleAppsConfirm}
                folderPath={selectedScanFolder}
            />
        </div>
    );
};

export { AppsGrid };