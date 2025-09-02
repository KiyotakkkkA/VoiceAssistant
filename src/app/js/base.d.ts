export interface BaseSettings {
  "ui.current.theme.id": string;
  "ui.current.event.panel.state": boolean;
  "ui.current.aimodel.id": string;
  "ui.current.apikeys": string[];
  "ui.current.account.data": Record<string, any>;
  "ui.current.tools": Record<string, any>;
}

export const BASE_GITHUB_THEME: Record<string, string>
export const BASE_CONFIG_CONTENT: Record<string, string>
export const BASE_SETTINGS_CONTENT: BaseSettings

export default BASE_SETTINGS_CONTENT;
export default BASE_CONFIG_CONTENT;
export default BASE_GITHUB_THEME;
