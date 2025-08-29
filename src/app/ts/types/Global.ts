import type { TEventTopicValue, TEventTypeValue } from '../../js/enums/Events.js';

// Interface for safety timers integration in Electron
declare global {
  interface Window {
    safeTimers: {
      setTimeout: (callback: () => void, delay: number) => NodeJS.Timeout;
      setInterval: (callback: () => void, interval: number) => NodeJS.Timeout;
      clearTimeout: (id: NodeJS.Timeout) => void;
      clearInterval: (id: NodeJS.Timeout) => void;
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
