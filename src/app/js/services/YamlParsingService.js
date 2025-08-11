import yaml from 'js-yaml';
import fs from "fs";
import path from "path";

export class YamlParsingService {
    static instance;
    _loadedConfigs = {};

    constructor() {}

    static getInstance(){
        if (!YamlParsingService.instance) {
            YamlParsingService.instance = new YamlParsingService();
        }
        return YamlParsingService.instance;
    }

    load(key, yamlPath) {
        if (!fs.existsSync(yamlPath)) {
            throw new Error(`[ОШИБКА] Конфигурационный файл не найден: '${yamlPath}'`);
        }

        try {
            const fileContent = fs.readFileSync(yamlPath, "utf-8");
            const configData = (yaml.load(fileContent)) || {};
            this._loadedConfigs[key] = configData;
        } catch (e) {
            if (e instanceof yaml.YAMLException) {
                throw new Error(`[ОШИБКА] Ошибка парсинга YAML в файле '${yamlPath}': ${e.message}`);
            }
            throw new Error(`[ОШИБКА] Неожиданная ошибка при загрузке конфигурации '${key}' из '${yamlPath}': ${e}`);
        }
    }

    get(keyPath, defaultValue = null) {
        if (!this._loadedConfigs[keyPath]) {
            return defaultValue;
        }
        return this._loadedConfigs[keyPath];
    }
}
