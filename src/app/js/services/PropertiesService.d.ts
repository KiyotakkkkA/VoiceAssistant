export interface PropertiesService {
	load(key: string, propertiesPath: string): void;
	get(keyPath: string, defaultValue?: any): any;
	getProperty(configKey: string, propertyKey: string, defaultValue?: any): any;
	getAsEnvVars(configKey: string): { [key: string]: string };
}

export class PropertiesService {
	static instance: PropertiesService;
	private _loadedProperties: { [key: string]: any };

	constructor();
	static getInstance(): PropertiesService;
	load(key: string, propertiesPath: string): void;
	get(keyPath: string, defaultValue?: any): any;
	getProperty(configKey: string, propertyKey: string, defaultValue?: any): any;
	getAsEnvVars(configKey: string): { [key: string]: string };
	private _parseProperties(content: string): { [key: string]: any };
}
