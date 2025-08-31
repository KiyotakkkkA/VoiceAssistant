import { makeAutoObservable } from 'mobx';
import { useSocketActions } from '../composables';

const { accountDataSet, eventPanelToggle, setApiKeys } = useSocketActions();

type Settings = {
    runtime: {
        'runtime.current.mode': string;
    },
    appearance: {
        themes: {
            themeNames: string[];
        }
    },
    settings: {
        'ui.current.theme.id': string;
        'ui.current.aimodel.id': string;
        'ui.current.event.panel.state'?: boolean;
        'ui.current.apikeys'?: { id: string; name: string; value: string }[];
        'ui.current.account.data'?: { [key: string]: string };

    };
    tools: {
        [key: string]: {
            enabled: boolean;
            functions: {
                name: string;
            }[];
        };
    }
}

class SettingsStore {
    data: Settings = {
        runtime: {
            'runtime.current.mode': 'NORMAL',
        },
        appearance: {
            themes: {
                themeNames: [],
            }
        },
        settings: {
            'ui.current.theme.id': '',
            'ui.current.aimodel.id': '',
            'ui.current.event.panel.state': true,
            'ui.current.apikeys': [],
            'ui.current.account.data': {}
        },
        tools: {}
    };
    
    constructor() {
        makeAutoObservable(this);
    }

    getAccountDataByID(id: string) {
        return this.data.settings['ui.current.account.data']?.[id];
    }

    updateAccountData(updates: {key: string, value: string}[]) {
        if (!this.data.settings['ui.current.account.data']) {
            this.data.settings['ui.current.account.data'] = {};
        }
        for (const { key, value } of updates) {
            this.data.settings['ui.current.account.data'][key] = value;
        }
        accountDataSet(this.data.settings['ui.current.account.data']);
    }

    updateEventPanelState(state: boolean) {
        this.data.settings['ui.current.event.panel.state'] = state;
        eventPanelToggle(state);
    }

    setApiKey(key: { id: string; name: string; value: string }) {
        if (!this.data.settings['ui.current.apikeys']) {
            this.data.settings['ui.current.apikeys'] = [];
        }
        this.data.settings['ui.current.apikeys'] = this.data.settings['ui.current.apikeys'].filter(k => k.id !== key.id);
        this.data.settings['ui.current.apikeys'].push(key);
        setApiKeys(this.data.settings['ui.current.apikeys']);
    }

    deleteApiKey(id: string) {
        if (!this.data.settings['ui.current.apikeys']) {
            this.data.settings['ui.current.apikeys'] = [];
        }
        this.data.settings['ui.current.apikeys'] = this.data.settings['ui.current.apikeys'].filter(k => k.id !== id);
        setApiKeys(this.data.settings['ui.current.apikeys']);
    }
}

export default new SettingsStore();