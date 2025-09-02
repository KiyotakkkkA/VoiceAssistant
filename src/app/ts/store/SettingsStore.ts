import { makeAutoObservable } from 'mobx';
import { useSocketActions } from '../composables';
import { ApiData, AccountData, ToolsData } from '../types/Global';

const { accountDataSet, eventPanelToggle, setApiKeys } = useSocketActions();

type Settings = {
    runtime: {
        'runtime.current.mode': string;
        'runtime.appearance.themesList': string[];
    },
    settings: {
        'current.ai.model.id': string;
        'current.ai.api': ApiData;
        'current.ai.tools': ToolsData;

        'current.account.data': AccountData;

        'current.appearance.theme': string;

        'current.interface.event_panel.state': boolean;
        
    }
}

class SettingsStore {
    data: Settings = {
        runtime: {
            'runtime.current.mode': 'NORMAL',
            'runtime.appearance.themesList': []
        },
        settings: {
            'current.ai.model.id': '',
            'current.ai.api': {},
            'current.ai.tools': {},
            'current.account.data': {},
            'current.appearance.theme': '',
            'current.interface.event_panel.state': true,
        }
    };
    
    constructor() {
        makeAutoObservable(this);
    }

    applySettings(newSettings: Partial<Settings>) {
        console.log('Applying settings:', newSettings);
        this.data.settings = { ...this.data.settings, ...newSettings };
    }

    getAccountDataByID(id: string) {
        return this.data.settings['current.account.data']?.[id];
    }

    updateAccountData(updates: {key: string, value: string}[]) {
        if (!this.data.settings['current.account.data']) {
            this.data.settings['current.account.data'] = {};
        }
        for (const { key, value } of updates) {
            this.data.settings['current.account.data'][key] = value;
        }
        accountDataSet(this.data.settings['current.account.data']);
    }

    updateEventPanelState(state: boolean) {
        this.data.settings['current.interface.event_panel.state'] = state;
        eventPanelToggle(state);
    }

    setApiKey(key: { id: string; name: string; value: string }) {
        if (!this.data.settings['current.ai.api']) {
            this.data.settings['current.ai.api'] = {};
        }
        this.data.settings['current.ai.api'][key.id] = key;
        setApiKeys(this.data.settings['current.ai.api']);
    }

    deleteApiKey(id: string) {
        console.log('Deleting API key with id:', id);
        if (!this.data.settings['current.ai.api']) {
            this.data.settings['current.ai.api'] = {};
        }
        delete this.data.settings['current.ai.api'][id];
        setApiKeys(this.data.settings['current.ai.api']);
    }
}

export default new SettingsStore();