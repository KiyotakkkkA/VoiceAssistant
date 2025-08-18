import fs from "fs";

export class JsonParsingService {
	static instance;
	_loadedConfigs = {};

	constructor() {}

	static getInstance(){
		if (!JsonParsingService.instance) {
			JsonParsingService.instance = new JsonParsingService();
		}
		return JsonParsingService.instance;
	}

	load(key, jsonPath) {
		if (!fs.existsSync(jsonPath)) {
			throw new Error(`[ОШИБКА] Конфигурационный файл не найден: '${jsonPath}'`);
		}

		try {
			const fileContent = fs.readFileSync(jsonPath, "utf-8");
			const configData = (JSON.parse(fileContent)) || {};
			this._loadedConfigs[key] = configData;
		} catch (e) {
			if (e instanceof SyntaxError) {
				throw new Error(`[ОШИБКА] Ошибка парсинга JSON в файле '${jsonPath}': ${e.message}`);
			}
			throw new Error(`[ОШИБКА] Неожиданная ошибка при загрузке конфигурации '${key}' из '${jsonPath}': ${e}`);
		}
	}

	get(keyPath, defaultValue = null) {
		if (!this._loadedConfigs[keyPath]) {
			return defaultValue;
		}
		return this._loadedConfigs[keyPath];
	}
}

