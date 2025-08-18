import type { TEventTopicValue, TEventTypeValue } from '../../js/enums/Events.js';

// Message type for WebSocket communication
export type Message = {
    type: TEventTypeValue;
    topic: TEventTopicValue;
    payload: Record<string, any>
    from?: string
};