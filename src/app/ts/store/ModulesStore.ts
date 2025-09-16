import { makeAutoObservable } from 'mobx';
import { Module } from '../types/Global';

class ModulesStore {
    modules: Record<string, Module> = {};

    constructor() {
        makeAutoObservable(this);
    }

    applyModulesRegisteredData(serviceName: string, moduleData: Module) {
        this.modules[serviceName] = moduleData;
    }

    enableModule(serviceId: string) {
        if (this.modules[serviceId]) {
            this.modules[serviceId].enabled = true;
        }
    }

    stopModule(serviceId: string) {
        if (this.modules[serviceId]) {
            this.modules[serviceId].enabled = false;
            this.modules[serviceId].isDisabling = false;
        }
    }
}

export default new ModulesStore();