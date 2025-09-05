import fs from 'fs';
import paths from '../paths.js';
import { useSocketServer } from './useSocketServer.js';
import { JsonParsingService } from '../services/JsonParsingService.js';
import { EventsType, EventsTopic } from '../enums/Events.js';

function updateSettings(key, value) {
    try {
        const settings = JsonParsingService.getInstance().get('settings') || {};
        settings[key] = value;

        const settingsPath = `${paths.global_path}/settings.json`;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        JsonParsingService.getInstance().load('settings', settingsPath);

        return true;
    } catch (e) {
        console.error(`[Settings] Error updating ${key}:`, e);
        return false;
    }
}

function loadTheme(themeName) {
    try {
        const themePath = `${paths.themes_path}/${themeName}.json`;

        if (fs.existsSync(themePath)) {
            JsonParsingService.getInstance().load('theme', themePath);
            return true;
        }
        return false;
    } catch (e) {
        console.error(`[Theme] Error loading theme ${themeName}:`, e);
        return false;
    }
}

function refreshSettings(
  type,
  topic,
  key,
  data,
  postRefreshingFn
) {
    if (data === undefined) {
        console.warn(`[WS] ${type} ${topic} missing ${key}`);
        return;
    }

    if (updateSettings(key, data)) {
        if (postRefreshingFn) {
            postRefreshingFn(type, topic, key, data);
        }
    }
}

const useSettings = () => {

    const { sendToAll } = useSocketServer();

    const setTheme = (themeName) => {
        if (loadTheme(themeName)) {

        refreshSettings(
          EventsType.EVENT,
          EventsTopic.JSON_THEMES_DATA_SET,
          'current.appearance.theme',
          themeName,
          (type, topic, key, data) => {
            const updatedData = {
              themes: {
                themesList: fs.readdirSync(paths.themes_path).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')),
                currentThemeData: JsonParsingService.getInstance().get('theme'),
              },
              settings: {
                [key]: data
              }
            };

            sendToAll(type, topic, {
              ...updatedData
            });
          }
        );
      }
    }

    const accountDataSet = (accountData) => {
        refreshSettings(
            EventsType.EVENT,
            EventsTopic.JSON_ACCOUNT_DATA_SET,
            'current.account.data',
            accountData,
            (type, topic, key, data) => {
                sendToAll(type, topic, {
                    settings: {
                        [key]: data
                    }
                });
            }
        );
    }

    const eventPanelSet = (panelState) => {
        refreshSettings(
            null,
            null,
            'current.interface.event_panel.state',
            panelState,
            null
        );
    }

    const apiKeysSet = (apiKeys) => {
        refreshSettings(
            null,
            null,
            'current.ai.api',
            apiKeys,
            null
        );
    }

    const aiModelSet = (model) => {
        refreshSettings(
            EventsType.EVENT,
            EventsTopic.HAVE_TO_BE_REFETCHED_SETTINGS_DATA,
            'current.ai.model.id',
            model,
            (type, topic, key, data) => {
                sendToAll(type, topic, {
                    settings: {
                        [key]: data
                    }
                });
            }
        );
    }

    return {
        setTheme,
        accountDataSet,
        eventPanelSet,
        apiKeysSet,
        aiModelSet
    }
}

export { useSettings };