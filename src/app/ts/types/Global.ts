import type { TEventTopicValue, TEventTypeValue } from '../../js/enums/Events.js';

export interface App {
    id: string | number;
    name: string;
    path: string;
    type: string;
    size: number;
    modified: Date;
}

// Interface for safety timers integration in Electron
declare global {
  interface Window {
    safeTimers: {
      setTimeout: (callback: () => void, delay: number) => NodeJS.Timeout;
      setInterval: (callback: () => void, interval: number) => NodeJS.Timeout;
      clearTimeout: (id: NodeJS.Timeout) => void;
      clearInterval: (id: NodeJS.Timeout) => void;
    };
    electronAPI?: {
        scanDirectory?: (path: string) => Promise<{
            success: boolean;
            apps: Array<{
                name: string;
                path: string;
                icon?: string;
                type: 'exe' | 'lnk';
            }>;
            error?: string;
        }>;
        openFolderDialog?: () => Promise<string | null>;
        saveAppsToDatabase?: (
            folderPath: string, 
            folderName: string, 
            apps: Array<{
                name: string;
                path: string;
                icon?: string;
                type: 'exe' | 'lnk';
            }>
        ) => Promise<boolean>;
        getAppsFromDatabase?: () => Promise<{
            apps: {
                paths: Array<{
                    id: number;
                    path: string;
                    name: string;
                    created_at: string;
                    app_count: number;
                }>;
                apps: Record<string, Array<{
                    id: number;
                    name: string;
                    path: string;
                    icon: string | null;
                    type: string;
                    launch_count: number;
                    last_launched: string | null;
                    is_favorite: boolean;
                    folder_id: number;
                }>>;
            };
            stats: {
                total_apps: number;
                total_paths: number;
                total_launches: number;
            };
        }>;
        deleteApp?: (appId: number) => Promise<boolean>;
        deleteFolder?: (folderId: number) => Promise<boolean>;
        launchApp?: (appId: number, appPath: string) => Promise<boolean>;
    };
  }
}

export {};

// Message type for WebSocket communication
export type Message = {
    type: TEventTypeValue;
    topic: TEventTopicValue;
    payload: Record<string, any>
    from?: string
};

// Interface for module metadata
export interface Module {
    service_id: string;
    service_name?: string;
    service_desc?: string;
    enabled: boolean;
    isReloading: boolean;
    isEnabling: boolean;
    isDisabling: boolean;
}

// File structure representation
export type FileStructure = {
  _isDir: boolean;
  content?: string;
};

// Folder structure representation
export type FolderStructure = {
  [key: string]: FileStructure | FolderStructure | boolean;
};

// Notes specific types
export type NoteItem = {
  id: number;
  name: string;
  type: 'note';
  content: string;
  modified: string;
  preview: string;
  path: string;
};

// Notes folder item type
export type NoteFolderItem = {
  name: string;
  type: 'folder';
  path: string;
  children: { [key: string]: NoteItem | NoteFolderItem };
};

// Notes structure representation
export type NotesStructure = {
  [key: string]: NoteItem | NoteFolderItem;
};

// Tool call representation
export interface ToolCall {
  name: string;
  execution_time: string;
  args: any;
  response: any;
}

// AI response representation
export interface AIResponse {
  initial_stage?: {
    thinking?: string;
    content?: string;
  };
  tools_calling_stage?: ToolCall[];
  final_stage?: {
    thinking?: string;
    content?: string;
  };
  timing?: {
    total_time?: number;
    thinking_time?: number;
    tool_calls_time?: number;
  };
}

// Dialog message representation
export interface DialogMessage {
  id: string;
  content: string | AIResponse;
  role: 'user' | 'assistant';
  timestamp: Date;
  model_name?: string;
}

// Dialog representation
export interface Dialog {
  id: string;
  title: string;
  messages: DialogMessage[];
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

// Settings Account data structure
export type AccountData = {
    [key: string]: string;
}

// Settings API data structure
export type ApiData = {
    [key: string]: {
        id: string;
        name: string;
        value: string;
        provider: string;
    }
}

// Settings Tools data structure
export type ToolsData = {
    [key: string]: {
        required_settings_fields: string[];
        enabled: boolean;
        available: boolean;
        functions: {
            name: string;
        }[];
    };
}
