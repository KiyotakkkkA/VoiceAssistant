import React, { useState, useEffect, useCallback } from 'react';
import { FolderChooseModal, AppScanModal, CanOkModal } from '../molecules/modals';
import { AppsGrid } from '../organisms/applications';

interface App {
    id: number;
    name: string;
    path: string;
    icon: string | null;
    type: string;
    launch_count: number;
    last_launched: string | null;
    is_favorite: boolean;
    folder_id: number;
}

interface PathInfo {
    id: number;
    path: string; 
    name: string;
    created_at: string;
    app_count: number;
}

interface DatabaseData {
    paths: PathInfo[];
    apps: Record<string, App[]>;
}

interface Stats {
    total_apps: number;
    total_paths: number;
    total_launches: number;
}

const AppsPage: React.FC = () => {
    const [isRemoveAppModalOpen, setRemoveAppModalOpen] = useState(false);
    const [isRemoveFolderModalOpen, setRemoveFolderModalOpen] = useState(false);
    const [isFolderModalOpen, setFolderModalOpen] = useState(false);
    const [isAppScanModalOpen, setAppScanModalOpen] = useState(false);
    const [selectedScanFolder, setSelectedScanFolder] = useState<string>('');
    const [selectedDeleteFolder, setSelectedDeleteFolder] = useState<number | null>(null);
    const [selectedDeleteFolderName, setSelectedDeleteFolderName] = useState<string>('');
    const [selectedDeleteApp, setSelectedDeleteApp] = useState<number | null>(null);
    const [selectedDeleteAppName, setSelectedDeleteAppName] = useState<string>('');
    const [databaseData, setDatabaseData] = useState<DatabaseData>({ paths: [], apps: {} });
    const [stats, setStats] = useState<Stats>({ total_apps: 0, total_paths: 0, total_launches: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const loadAppsFromDatabase = useCallback(async () => {
        setIsLoading(true);
        try {
            if (window.electronAPI?.getAppsFromDatabase) {
                const result = await window.electronAPI.getAppsFromDatabase();
                setDatabaseData(result.apps);
                setStats(result.stats);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных из базы:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAppsFromDatabase();
    }, [loadAppsFromDatabase]);

    const handleAddPath = useCallback(() => {
        setFolderModalOpen(true);
    }, []);

    const handleDeleteFolder = useCallback((folderId: number, folderName: string) => {
        setSelectedDeleteFolder(folderId);
        setSelectedDeleteFolderName(folderName);
        setRemoveFolderModalOpen(true);
    }, []);

    const handleDeleteApp = useCallback((appId: number, appName: string) => {
        setSelectedDeleteApp(appId);
        setSelectedDeleteAppName(appName);
        setRemoveAppModalOpen(true);
    }, []);

    const handleLaunchApp = useCallback(async (appId: string, appPath: string) => {
        try {
            if (window.electronAPI?.launchApp) {
                await window.electronAPI.launchApp(parseInt(appId), appPath);
            }
        } catch (error) {
            console.error('Ошибка запуска приложения:', error);
        }
    }, []);

    const handleFolderSelect = useCallback((folderPath: string) => {
        setSelectedScanFolder(folderPath);
        setFolderModalOpen(false);
        setAppScanModalOpen(true);
    }, []);

    const handleAppsConfirm = useCallback(async (selectedApps: any[], folderPath: string) => {
        await loadAppsFromDatabase();
    }, [loadAppsFromDatabase]);

    const confirmDeleteFolder = useCallback(async () => {
        try {
            if (window.electronAPI?.deleteFolder) {
                await window.electronAPI.deleteFolder(selectedDeleteFolder || -1);
                await loadAppsFromDatabase();
            }
        } catch (error) {
            console.error('Ошибка удаления папки:', error);
        }
        setRemoveFolderModalOpen(false);
    }, [selectedDeleteFolder, loadAppsFromDatabase]);

    const confirmDeleteApp = useCallback(async () => {
        try {
            if (window.electronAPI?.deleteApp) {
                await window.electronAPI.deleteApp(selectedDeleteApp || -1);
                await loadAppsFromDatabase();
            }
        } catch (error) {
            console.error('Ошибка удаления приложения:', error);
        }
        setRemoveAppModalOpen(false);
    }, [selectedDeleteApp, loadAppsFromDatabase]);

    const handleCloseFolderModal = useCallback(() => {
        setFolderModalOpen(false);
    }, []);

    const handleCloseAppScanModal = useCallback(() => {
        setAppScanModalOpen(false);
    }, []);

    const handleCloseRemoveAppModal = useCallback(() => {
        setRemoveAppModalOpen(false);
    }, []);

    const handleCloseRemoveFolderModal = useCallback(() => {
        setRemoveFolderModalOpen(false);
    }, []);

    return (
        <div className="w-full h-full">
            <AppsGrid 
                databaseData={databaseData}
                stats={stats}
                isLoading={isLoading}
                onDeleteFolder={handleDeleteFolder}
                onDeleteApp={handleDeleteApp}
                onLaunchApp={handleLaunchApp}
                onAddPath={handleAddPath}
            />
            
            <FolderChooseModal
                isOpen={isFolderModalOpen}
                onClose={handleCloseFolderModal}
                onSelectFolder={handleFolderSelect}
            />
            
            <AppScanModal
                isOpen={isAppScanModalOpen}
                onClose={handleCloseAppScanModal}
                onConfirmApps={handleAppsConfirm}
                folderPath={selectedScanFolder}
            />

            <CanOkModal
                isOpen={isRemoveAppModalOpen}
                onClose={handleCloseRemoveAppModal}
                onConfirm={confirmDeleteApp}
                title="Удалить приложение"
                description={`Вы действительно хотите удалить приложение "${selectedDeleteAppName}"? Это действие нельзя отменить.`}
                confirmText="Удалить"
                cancelText="Отмена"
                type="danger"
            />

            <CanOkModal
                isOpen={isRemoveFolderModalOpen}
                onClose={handleCloseRemoveFolderModal}
                onConfirm={confirmDeleteFolder}
                title="Удалить папку"
                description={`Вы действительно хотите удалить папку "${selectedDeleteFolderName}" и все приложения в ней? Это действие нельзя отменить.`}
                confirmText="Удалить"
                cancelText="Отмена"
                type="danger"
            />
        </div>
    );
};

export { AppsPage };