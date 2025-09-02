import { ToolsData, ApiData, AccountData } from "../ts/types/Global";

export interface BaseSettings {
  'current.ai.model.id': string;
  'current.ai.api': ApiData;
  'current.ai.tools': ToolsData;

  'current.account.data': AccountData;

  'current.appearance.theme': string;

  'current.interface.event_panel.state': boolean;
}

export const BASE_GITHUB_THEME: Record<string, string>
export const BASE_LIGHT_THEME: Record<string, string>
export const BASE_CONFIG_CONTENT: Record<string, string>
export const BASE_SETTINGS_CONTENT: BaseSettings

export default BASE_SETTINGS_CONTENT;
export default BASE_CONFIG_CONTENT;
export default BASE_GITHUB_THEME;
export default BASE_LIGHT_THEME;
