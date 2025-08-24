import { makeAutoObservable } from 'mobx';

type Msg = {
    model_name: string;
    text: string;
    timestamp?: Date;
}

type Settings = {
    aiMsgHistory: Msg[];

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
        'ui.current.apikeys'?: { id?: string; name: string; value: string }[];

    };
}

class SettingsStore {
    data: Settings = {
        aiMsgHistory: [],
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
            'ui.current.apikeys': [],
        }
    };
    
    constructor() {
        makeAutoObservable(this);
    }

    clearAiHistory() {
        this.data.aiMsgHistory = [];
    }
}

export default new SettingsStore();