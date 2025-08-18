import fs from 'fs';

interface ConfigData {
  [key: string]: any;
}

class JsonParsingService {
  private static instance: JsonParsingService;
  private _loadedConfigs: Record<string, ConfigData>;

  constructor();

  static getInstance(): JsonParsingService;

  load(key: string, jsonPath: string): void;

  get(keyPath: string, defaultValue?: Record<string, any>): Record<string, any>;
}