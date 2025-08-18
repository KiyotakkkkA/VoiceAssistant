import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

interface ConfigData {
  [key: string]: any;
}

declare class YamlParsingService {
  private static instance: YamlParsingService;
  private _loadedConfigs: Record<string, ConfigData>;

  private constructor();

  static getInstance(): YamlParsingService;

  load(key: string, yamlPath: string): void;

  get(keyPath: string, defaultValue?: Record<string, any>): Record<string, any>;
}

export { YamlParsingService };