import React, { useState } from 'react';
import { IconFolder } from '../../atoms/icons';

interface FolderChooseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectFolder: (folderPath: string) => void;
}

const FolderChooseModal: React.FC<FolderChooseModalProps> = ({
	isOpen,
	onClose,
	onSelectFolder,
}) => {
	const [selectedFolder, setSelectedFolder] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);

	if (!isOpen) return null;

	const handleOpenDialog = async () => {
		try {
			setIsLoading(true);
			if (window.electronAPI?.openFolderDialog) {
				const folderPath = await window.electronAPI.openFolderDialog();
				if (folderPath) {
					setSelectedFolder(folderPath);
				}
			}
		} catch (error) {
			console.error('Error opening folder dialog:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelectFolder = () => {
		if (selectedFolder) {
			onSelectFolder(selectedFolder);
			onClose();
		}
	};

	const handleClose = () => {
		setSelectedFolder('');
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-ui-bg-primary border border-ui-border-primary rounded-lg w-full max-w-lg mx-4">
				<div className="flex items-center justify-between p-4 border-b border-ui-border-primary">
					<h2 className="text-lg font-semibold text-ui-text-primary">Выберите папку</h2>
					<button
						onClick={handleClose}
						className="p-2 rounded-lg hover:bg-ui-bg-secondary transition-colors text-ui-text-secondary hover:text-ui-text-primary"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
						</svg>
					</button>
				</div>

				<div className="p-6 space-y-4">
					<div className="text-center">
						<div className="w-16 h-16 rounded-full bg-ui-text-accent/10 flex items-center justify-center mx-auto mb-4">
							<IconFolder size={32} className='text-ui-text-accent' />
						</div>
						<p className="text-ui-text-secondary mb-4">
							Выберите папку для сканирования приложений
						</p>
						
						<button
							onClick={handleOpenDialog}
							disabled={isLoading}
							className="px-6 py-3 bg-ui-bg-secondary text-ui-text-primary rounded-lg hover:bg-ui-bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
						>
							{isLoading ? (
								<>
									<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-ui-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Загрузка...
								</>
							) : (
								<>
									Открыть проводник
								</>
							)}
						</button>
					</div>

					{selectedFolder && (
						<div className="p-4 bg-ui-bg-secondary/20 rounded-lg border border-ui-border-primary">
							<div className="flex items-start gap-3">
								<div className="flex-shrink-0">
									<IconFolder size={18} className='text-ui-text-secondary' />
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-sm text-ui-text-secondary mb-1">Выбранная папка:</div>
									<code className="text-sm bg-ui-bg-secondary px-2 py-1 rounded text-ui-text-primary font-mono break-all">
										{selectedFolder}
									</code>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-end gap-3 p-4 border-t border-ui-border-primary">
					<button
						onClick={handleClose}
						className="px-4 py-2 text-ui-text-secondary hover:text-ui-text-primary transition-colors"
					>
						Отмена
					</button>
					<button
						onClick={handleSelectFolder}
						disabled={!selectedFolder}
						className="px-4 py-2 bg-ui-bg-secondary text-ui-text-primary rounded-lg hover:bg-ui-bg-secondary-light/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Сканировать папку
					</button>
				</div>
			</div>
		</div>
	);
};

export { FolderChooseModal };
