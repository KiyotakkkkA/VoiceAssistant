import { DatabaseService } from '../services/DatabaseService.js';
import { useSocketServer } from './useSocketServer.js';
import { EventsType, EventsTopic } from '../enums/Events.js';

const useDatabase = () => {

    const { sendToAll } = useSocketServer();

    const saveAppsToDatabase = async (folderPath, folderName, apps) => {
        try {
            const success = DatabaseService.getInstance().saveApps(folderPath, folderName, apps);

            if (success) {
                const appsData = DatabaseService.getInstance().getAppsForUI();
                const stats = DatabaseService.getInstance().getStats();

                sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APPS_UPDATED, {
                    apps: appsData,
                    stats: stats
                });
            }
            
            return success;
        } catch (error) {
            console.error('Error saving apps to database:', error);
            throw error;
        }
    }

    const getAppsFromDatabase = () => {
        try {
            const appsData = DatabaseService.getInstance().getAppsForUI();
            const stats = DatabaseService.getInstance().getStats();

            return {
                apps: appsData,
                stats: stats
            };
        } catch (error) {
            console.error('Error getting apps from database:', error);
            return { apps: { paths: [], apps: {} }, stats: { total_apps: 0, total_paths: 0, total_launches: 0 } };
        }
    }

    const deleteAppFromDatabase = (appId) => {
        try {
            const success = services.database.deleteApp(appId);
        
            if (success) {
                const appsData = services.database.getAppsForUI();
                const stats = services.database.getStats();
                
                sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APPS_UPDATED, {
                    apps: appsData,
                    stats: stats
                });
            }
            
            return success;
        
        } catch (error) {
            console.error('Error deleting app:', error);
            throw error;
        }
    }

    const deleteFolderFromDatabase = (folderId) => {
        try {
            const success = DatabaseService.getInstance().deleteFolder(folderId);
            
            if (success) {
                const appsData = DatabaseService.getInstance().getAppsForUI();
                const stats = DatabaseService.getInstance().getStats();

                sendToAll(EventsType.EVENT, EventsTopic.DATABASE_APPS_UPDATED, {
                    apps: appsData,
                    stats: stats
                });
            }
            
            return success;
        } catch (error) {
            console.error('Error deleting folder:', error);
            throw error;
        }
    }

    return { 
        saveAppsToDatabase,
        getAppsFromDatabase,
        deleteAppFromDatabase,
        deleteFolderFromDatabase
    };
}

export { useDatabase };