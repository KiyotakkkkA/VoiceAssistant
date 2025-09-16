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

    applyInitState(newState: Partial<InitState>) {
        this.state = {
            ...this.state,
            ...newState
        };
    }
}

export default new InitiationStore();