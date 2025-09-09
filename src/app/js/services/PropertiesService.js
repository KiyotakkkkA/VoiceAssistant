import fs from "fs";

export class PropertiesService {
	static instance;
	_loadedProperties = {};

	constructor() {}

	static getInstance() {
		if (!PropertiesService.instance) {
			PropertiesService.instance = new PropertiesService();
		}
		return PropertiesService.instance;
	}

	load(key, propertiesPath) {
		if (!fs.existsSync(propertiesPath)) {
			throw new Error(`[ОШИБКА] Файл свойств не найден: '${propertiesPath}'`);
		}

		try {
			const fileContent = fs.readFileSync(propertiesPath, "utf-8");
			const properties = this._parseProperties(fileContent);
			this._loadedProperties[key] = properties;
		} catch (e) {
			throw new Error(`[ОШИБКА] Неожиданная ошибка при загрузке свойств '${key}' из '${propertiesPath}': ${e}`);
		}
	}

	_parseProperties(content) {
		const properties = {};
		const lines = content.split('\n');

		for (const line of lines) {
			const trimmedLine = line.trim();
			
			if (trimmedLine === '' || trimmedLine.startsWith('#')) {
				continue;
			}

			const equalIndex = trimmedLine.indexOf('=');
			if (equalIndex === -1) {
				continue;
			}

			const key = trimmedLine.substring(0, equalIndex).trim();
			let value = trimmedLine.substring(equalIndex + 1).trim();

			if ((value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}

			if (!isNaN(value) && value !== '') {
				properties[key] = Number(value);
			} else if (value.toLowerCase() === 'true') {
				properties[key] = true;
			} else if (value.toLowerCase() === 'false') {
				properties[key] = false;
			} else {
				properties[key] = value;
			}
		}

		return properties;
	}

	get(keyPath, defaultValue = null) {
		if (!this._loadedProperties[keyPath]) {
			return defaultValue;
		}
		return this._loadedProperties[keyPath];
	}

	getProperty(configKey, propertyKey, defaultValue = null) {
		const config = this._loadedProperties[configKey];
		if (!config || !(propertyKey in config)) {
			return defaultValue;
		}
		return config[propertyKey];
	}

	getAsEnvVars(configKey) {
		const config = this._loadedProperties[configKey];
		if (!config) {
			return {};
		}

		const envVars = {};
		for (const [key, value] of Object.entries(config)) {
			envVars[key] = String(value);
		}
		return envVars;
	}
}
