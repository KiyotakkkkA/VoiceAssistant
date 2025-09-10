import fs from 'fs';
import path from 'path';
import { BASE_SETTINGS_CONTENT, BASE_GITHUB_THEME, BASE_LIGHT_THEME, BASE_CONFIG_CONTENT } from '../base.js';

export class InitDirectoriesService {
    static instance;

    static getInstance() {
        if (!InitDirectoriesService.instance) {
            InitDirectoriesService.instance = new InitDirectoriesService();
        }
        return InitDirectoriesService.instance;
    }

    constructor() {
        this.resourcesTree = {
            assets: [
                { audio: [] },
                { notes: [] },
                { themes: [
                    { 'github-dark.json': JSON.stringify(BASE_GITHUB_THEME, null, 2) },
                    { 'light.json': JSON.stringify(BASE_LIGHT_THEME, null, 2) }
                ] }
            ],
            models: [],
            temp: [],
            global: [
                { 'settings.json': JSON.stringify(BASE_SETTINGS_CONTENT, null, 2) },
                { 'config.json': JSON.stringify(BASE_CONFIG_CONTENT, null, 2) }
            ]
        };
    }

    buildTree(currentPath, { packaged } = { packaged: false }) {
        if (packaged) {
            const resourcesRoot = path.join(currentPath, 'resources');
            if (!fs.existsSync(resourcesRoot)) {
                fs.mkdirSync(resourcesRoot, { recursive: true });
            }
            this._createDirectoryStructure(this.resourcesTree, resourcesRoot);
        } else {
            this._createDirectoryStructure({ resources: this.resourcesTree }, currentPath);
        }
    }

    _createDirectoryStructure(obj, basePath) {
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path.join(basePath, key);

            if (!fs.existsSync(currentPath) && Array.isArray(value)) {
                fs.mkdirSync(currentPath, { recursive: true });
            }

            if (Array.isArray(value)) {
                value.forEach(item => {
                    if (typeof item === 'object') {
                        this._createDirectoryStructure(item, currentPath);
                    }
                });
            } else if (typeof value === 'object') {
                this._createDirectoryStructure(value, currentPath);
            } else if (typeof value === 'string') {
                if (!fs.existsSync(currentPath)) {
                    fs.writeFileSync(currentPath, value);
                }
            }
        }
    }
}