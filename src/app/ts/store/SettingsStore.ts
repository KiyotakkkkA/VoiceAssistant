import { makeAutoObservable } from 'mobx';

type Settings = {
    appearance: {
        themes: {
            themeNames: string[];
        }
    },
    modules: {
        [key: string]: {
            service_id: string;
            service_name?: string;
            service_desc?: string;
            enabled: boolean;
        }
    },
    settings: {
        'ui.current.theme.id': string;
        'ui.current.apikeys'?: { id?: string; name: string; value: string }[];

    } | null;
}

class SettingsStore {
    data: Settings = {
        appearance: {
            themes: {
                themeNames: [],
            }
        },
        modules: {},
        settings: null
    };
    
    constructor() {
        makeAutoObservable(this);
    }
}

export default new SettingsStore();