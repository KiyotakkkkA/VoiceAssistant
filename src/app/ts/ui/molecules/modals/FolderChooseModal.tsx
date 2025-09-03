import React, { useState } from 'react';

interface FolderChooseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectFolder: (folderPath: string) => void;
}

const mockFolders = [
	{ id: '1', name: 'Program Files', path: 'C:\\Program Files', type: 'folder' },
	{ id: '2', name: 'Program Files (x86)', path: 'C:\\Program Files (x86)', type: 'folder' },
	{ id: '3', name: 'Users', path: 'C:\\Users', type: 'folder' },
	{ id: '4', name: 'Desktop', path: 'C:\\Users\\User\\Desktop', type: 'folder' },
	{ id: '5', name: 'Documents', path: 'C:\\Users\\User\\Documents', type: 'folder' },
	{ id: '6', name: 'Downloads', path: 'C:\\Users\\User\\Downloads', type: 'folder' },
	{ id: '7', name: 'AppData', path: 'C:\\Users\\User\\AppData', type: 'folder' },
	{ id: '8', name: 'Local', path: 'C:\\Users\\User\\AppData\\Local', type: 'folder' },
	{ id: '9', name: 'Roaming', path: 'C:\\Users\\User\\AppData\\Roaming', type: 'folder' },
	{ id: '10', name: 'Windows', path: 'C:\\Windows', type: 'folder' },
];

const FolderChooseModal: React.FC<FolderChooseModalProps> = ({
	isOpen,
	onClose,
	onSelectFolder,
}) => {
	const [selectedFolder, setSelectedFolder] = useState<string>('');
	const [currentPath, setCurrentPath] = useState('C:\\');

	if (!isOpen) return null;

	const handleSelectFolder = () => {
		if (selectedFolder) {
			onSelectFolder(selectedFolder);
			onClose();
		}
	};

	const handleFolderClick = (folder: typeof mockFolders[0]) => {
		setSelectedFolder(folder.path);
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-ui-bg-primary border border-ui-border-primary rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-ui-border-primary">
					<h2 className="text-lg font-semibold text-ui-text-primary">Выберите папку</h2>
					<button
						onClick={onClose}
						className="p-2 rounded-lg hover:bg-ui-bg-secondary transition-colors text-ui-text-secondary hover:text-ui-text-primary"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
						</svg>
					</button>
				</div>

				{/* Current path */}
				<div className="p-4 border-b border-ui-border-primary">
					<div className="flex items-center gap-2 text-sm">
						<span className="text-ui-text-secondary">Текущий путь:</span>
						<code className="bg-ui-bg-secondary px-2 py-1 rounded text-ui-text-primary font-mono">
							{currentPath}
						</code>
					</div>
				</div>

				{/* Folder list */}
				<div className="flex-1 overflow-auto p-4">
					<div className="space-y-1">
						{mockFolders.map((folder) => (
							<div
								key={folder.id}
								onClick={() => handleFolderClick(folder)}
								className={`
									flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
									${selectedFolder === folder.path 
										? 'bg-ui-text-accent/10 border border-ui-text-accent/20' 
										: 'hover:bg-ui-bg-secondary/30'
									}
								`}
							>
								<div className="flex-shrink-0">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-ui-text-accent">
										<path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
									</svg>
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-medium text-ui-text-primary truncate">
										{folder.name}
									</div>
									<div className="text-sm text-ui-text-muted font-mono truncate">
										{folder.path}
									</div>
								</div>
								{selectedFolder === folder.path && (
									<div className="flex-shrink-0">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-ui-text-accent">
											<path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
										</svg>
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Selected folder display */}
				{selectedFolder && (
					<div className="p-4 border-t border-ui-border-primary bg-ui-bg-secondary/20">
						<div className="flex items-center gap-2 text-sm">
							<span className="text-ui-text-secondary">Выбранная папка:</span>
							<code className="bg-ui-bg-secondary px-2 py-1 rounded text-ui-text-primary font-mono">
								{selectedFolder}
							</code>
						</div>
					</div>
				)}

				{/* Footer */}
				<div className="flex justify-end gap-3 p-4 border-t border-ui-border-primary">
					<button
						onClick={onClose}
						className="px-4 py-2 text-ui-text-secondary hover:text-ui-text-primary transition-colors"
					>
						Отмена
					</button>
					<button
						onClick={handleSelectFolder}
						disabled={!selectedFolder}
						className="px-4 py-2 bg-ui-bg-secondary text-ui-text-primary rounded-lg hover:bg-ui-bg-secondary-light/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Выбрать папку
					</button>
				</div>
			</div>
		</div>
	);
};

export { FolderChooseModal };
