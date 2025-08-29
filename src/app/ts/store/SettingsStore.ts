import { makeAutoObservable } from 'mobx';

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
        'ui.current.apikeys'?: { id?: string; name: string; value: string }[];

    };
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
        }
    };
    
    constructor() {
        makeAutoObservable(this);
    }
}

export default new SettingsStore();