import { makeAutoObservable } from 'mobx';
import { Module } from '../types/Global';

class ModulesStore {
    modules: Record<string, Module> = {};

    constructor() {
        makeAutoObservable(this);
    }
}

export default new ModulesStore();