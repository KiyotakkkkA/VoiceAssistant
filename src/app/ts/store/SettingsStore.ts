import { makeAutoObservable, runInAction } from 'mobx';
import { useSocketActions } from '../composables';
import { ApiData, AccountData, ToolsData } from '../types/Global';

const { accountDataSet, eventPanelToggle, setApiKeys, toolOff, contextSettingsSet} = useSocketActions();

type Settings = {
    runtime: {
        'runtime.current.mode': string;
        'runtime.appearance.themesList': string[];
    },
    settings: {
        'current.ai.model.id': string;
        'current.ai.api': ApiData;
        'current.ai.context': {
            enabled: boolean;
            max_messages: number;
        };
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
            'current.ai.context': {
                enabled: false,
                max_messages: 10
            },
            'current.ai.tools': {},
            'current.account.data': {},
            'current.appearance.theme': '',
            'current.interface.event_panel.state': true,
        }
    };
    
    constructor() {
        makeAutoObservable(this);
    }

    applySettings(newSettings: Partial<Settings['settings']>) {
        this.data.settings = { ...this.data.settings, ...newSettings };

        const accountDataChangedFlag = Object.keys(newSettings['current.account.data'] || {}).length > 0;
        const toolsDataChangedFlag = Object.keys(newSettings['current.ai.tools'] || {}).length > 0;

        if (accountDataChangedFlag || toolsDataChangedFlag) {
            this.checkAllToolsRequirements();
        }
    }

    getAccountDataByID(id: string) {
        return this.data.settings['current.account.data']?.[id];
    }

    updateContextSettings(updates: { enabled?: boolean; max_messages?: number }) {
        this.data.settings['current.ai.context'] = {
            ...this.data.settings['current.ai.context'],
            ...updates
        };
        contextSettingsSet({
            enabled: this.data.settings['current.ai.context'].enabled,
            max_messages: this.data.settings['current.ai.context'].max_messages
        });
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

    setApiKey(key: { id: string; name: string; value: string, provider: string }) {
        if (!this.data.settings['current.ai.api']) {
            this.data.settings['current.ai.api'] = {};
        }
        this.data.settings['current.ai.api'][key.id] = key;
        setApiKeys(this.data.settings['current.ai.api']);
    }

    deleteApiKey(id: string) {
        if (!this.data.settings['current.ai.api']) {
            this.data.settings['current.ai.api'] = {};
        }
        delete this.data.settings['current.ai.api'][id];
        setApiKeys(this.data.settings['current.ai.api']);
    }

    checkAllToolsRequirements() {
        runInAction(() => {
            const tools = this.data.settings['current.ai.tools'];
            for (const [tool, toolData] of Object.entries(tools)) {
                const { required_settings_fields } = toolData;
                let isAvailable = true;
                
                for (const field in required_settings_fields) {
                    const fieldKey = required_settings_fields[field];
                    const status = this.data.settings['current.account.data'][fieldKey];
                    
                    if (status === undefined || status === '' || status === null) {
                        isAvailable = false;
                        break;
                    }
                }
                
                this.data.settings['current.ai.tools'][tool].available = isAvailable;
                
                if (!isAvailable && this.data.settings['current.ai.tools'][tool].enabled) {
                    this.data.settings['current.ai.tools'][tool].enabled = false;
                    toolOff(tool);
                }
            }
        });
    }

}

export default new SettingsStore();