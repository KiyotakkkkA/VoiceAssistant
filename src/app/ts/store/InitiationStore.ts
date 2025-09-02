import { makeAutoObservable } from 'mobx';

interface InitState {
    voskModel: {
        exists: boolean
        isDownloading?: boolean
    }
}

class InitiationStore {
    state: InitState = {
        voskModel: {
            exists: false,
            isDownloading: false
        }
    };

    constructor() {
        makeAutoObservable(this);
    }
}

export default new InitiationStore();