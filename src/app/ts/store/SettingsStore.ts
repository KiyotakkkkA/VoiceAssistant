import { makeAutoObservable } from 'mobx';

type Settings = {
  appearance: {
        themes: {
            themeNames: string[];
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
        settings: null
    };
    
    constructor() {
        makeAutoObservable(this);
    }
}

export default new SettingsStore();