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
