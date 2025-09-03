import React, { useState, useEffect } from 'react';
import type { App } from '../../../types/electron';

interface AppScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmApps: (selectedApps: App[], folderPath: string) => void;
    folderPath: string;
}

const AppScanModal: React.FC<AppScanModalProps> = ({
    isOpen,
    onClose,
    onConfirmApps,
    folderPath,
}) => {
    const [scannedApps, setScannedApps] = useState<App[]>([]);
    const [selectedApps, setSelectedApps] = useState<Set<string | number>>(new Set());
    const [isScanning, setIsScanning] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        if (isOpen && folderPath) {
            scanFolder();
        }
    }, [isOpen, folderPath]);

    const scanFolder = async () => {
        setIsScanning(true);
        try {
            if (window.electronAPI?.scanDirectory) {
                const results = await window.electronAPI.scanDirectory(folderPath);
                setScannedApps(results);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const mockApps: App[] = [
                    {
                        id: 1,
                        name: 'Visual Studio Code',
                        path: `${folderPath}\\Microsoft VS Code\\Code.exe`,
                        type: '.exe',
                        size: 150000000,
                        modified: new Date('2024-01-15')
                    },
                    {
                        id: 2,
                        name: 'Google Chrome',
                        path: `${folderPath}\\Google\\Chrome\\Application\\chrome.exe`,
                        type: '.exe',
                        size: 120000000,
                        modified: new Date('2024-02-10')
                    },
                    {
                        id: 3,
                        name: 'Discord',
                        path: `${folderPath}\\Discord\\Discord.exe`,
                        type: '.exe',
                        size: 80000000,
                        modified: new Date('2024-01-20')
                    },
                    {
                        id: 4,
                        name: 'Steam',
                        path: `${folderPath}\\Steam\\steam.exe`,
                        type: '.exe',
                        size: 200000000,
                        modified: new Date('2024-02-05')
                    },
                    {
                        id: 5,
                        name: 'Notepad++',
                        path: `${folderPath}\\Notepad++\\notepad++.exe`,
                        type: '.exe',
                        size: 15000000,
                        modified: new Date('2024-01-30')
                    }
                ];
                
                setScannedApps(mockApps);
            }
        } catch (error) {
            console.error('Ошибка сканирования:', error);
            setScannedApps([]);
        } finally {
            setIsScanning(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU');
    };

    const handleAppToggle = (appId: string | number) => {
        const newSelected = new Set(selectedApps);
        if (newSelected.has(appId)) {
            newSelected.delete(appId);
        } else {
            newSelected.add(appId);
        }
        setSelectedApps(newSelected);
        setSelectAll(newSelected.size === scannedApps.length);
    };

    const handleSelectAllToggle = () => {
        if (selectAll) {
            setSelectedApps(new Set());
        } else {
            setSelectedApps(new Set(scannedApps.map(app => app.id)));
        }
        setSelectAll(!selectAll);
    };

    const handleConfirm = () => {
        const selectedAppsList = scannedApps.filter(app => selectedApps.has(app.id));
        onConfirmApps(selectedAppsList, folderPath);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-ui-bg-primary border border-ui-border-primary rounded-lg w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-ui-border-primary">
                    <div>
                        <h2 className="text-lg font-semibold text-ui-text-primary">Найденные приложения</h2>
                        <p className="text-sm text-ui-text-muted font-mono">{folderPath}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-ui-bg-secondary transition-colors text-ui-text-secondary hover:text-ui-text-primary"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    {isScanning ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-8 h-8 border-2 border-ui-text-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-ui-text-secondary">Сканирование папки...</p>
                        </div>
                    ) : scannedApps.length > 0 ? (
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4 p-3 bg-ui-bg-secondary/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAllToggle}
                                            className="w-4 h-4 text-ui-text-accent"
                                        />
                                        <span className="text-sm text-ui-text-primary">Выбрать все</span>
                                    </label>
                                </div>
                                <div className="text-sm text-ui-text-secondary">
                                    Найдено: <span className="font-semibold text-ui-text-accent">{scannedApps.length}</span> | 
                                    Выбрано: <span className="font-semibold text-ui-text-accent">{selectedApps.size}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {scannedApps.map((app) => (
                                    <div
                                        key={app.id}
                                        onClick={() => handleAppToggle(app.id)}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border
                                            ${selectedApps.has(app.id) 
                                                ? 'bg-ui-text-accent/10 border-ui-text-accent/20' 
                                                : 'border-ui-border-primary hover:bg-ui-bg-secondary/30'
                                            }
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedApps.has(app.id)}
                                            onChange={() => {}}
                                            className="w-4 h-4 text-ui-text-accent"
                                        />
                                        <div className="flex-shrink-0">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-ui-text-accent">
                                                <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21A7,7 0 0,1 14,26H10A7,7 0 0,1 3,19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M14,9H10A5,5 0 0,0 5,14V17H19V14A5,5 0 0,0 14,9Z"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-ui-text-primary truncate">
                                                {app.name}
                                            </div>
                                            <div className="text-sm text-ui-text-muted font-mono truncate">
                                                {app.path}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-ui-text-muted mt-1">
                                                <span>Размер: {formatFileSize(app.size)}</span>
                                                <span>•</span>
                                                <span>Изменен: {formatDate(app.modified)}</span>
                                                <span>•</span>
                                                <span className="bg-ui-bg-secondary px-2 py-0.5 rounded">
                                                    {app.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-ui-text-secondary/10 flex items-center justify-center mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-ui-text-secondary">
                                    <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21A7,7 0 0,1 14,26H10A7,7 0 0,1 3,19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M14,9H10A5,5 0 0,0 5,14V17H19V14A5,5 0 0,0 14,9Z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-ui-text-primary mb-2">Приложения не найдены</h3>
                            <p className="text-ui-text-muted text-center max-w-md">
                                В выбранной папке не обнаружено исполняемых файлов (.exe) или ярлыков (.lnk)
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center p-4 border-t border-ui-border-primary">
                    <button
                        onClick={scanFolder}
                        disabled={isScanning}
                        className="px-4 py-2 text-ui-text-secondary hover:text-ui-text-primary transition-colors disabled:opacity-50"
                    >
                        Пересканировать
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-ui-text-secondary hover:text-ui-text-primary transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedApps.size === 0}
                            className="px-4 py-2 bg-ui-bg-secondary text-ui-text-primary rounded-lg hover:bg-ui-bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Добавить выбранные ({selectedApps.size})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AppScanModal };
