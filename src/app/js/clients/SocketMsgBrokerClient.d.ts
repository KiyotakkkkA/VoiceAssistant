import { WebSocketServer, WebSocket } from 'ws';
import { EventsType, EventsTopic } from '../enums/Events.js';
import type { TEventTopicValue, TEventTypeValue } from '../enums/Events.js';
import type { Message } from '../types/Global.js';

interface Logger {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
}

export type Binding = {
    key: [
        TEventTypeValue | null,
        TEventTopicValue | null
    ] & { length: 2 }
    handler: (ws: WebSocket, msg: Message) => void
} & (
    { key: [TEventTypeValue, null] } |
    { key: [null, TEventTopicValue] } |
    { key: [TEventTypeValue, TEventTopicValue] }
);

export class SocketMsgBrokerClient {
    private static WebsocketServer: typeof WebSocketServer;
    private static connectedClients: Set<WebSocket> = new Set();
    private static Bindings: Map<Binding['key'], Array<Binding['handler']>> = new Map();
    private static WssMessageHistory: Message[] = [];
    private static onConnectionAction = (ws: WebSocket) => {};

    private static Logger: Logger;
    private static EnableLogger: boolean;

    public static cleanup(): void;

    public init(WSS: WebSocketServer, EnableLogger: boolean): boolean
    public startListening(): void
    public onConnection(func: (ws: WebSocket) => void): void
    public onMessage(binding: Binding): void

    public getClients(): Set<WebSocket>;

    private logInfo(message: string): void
    private logWarning(message: string): void
    private logError(message: string): void
    private logDebug(message: string): void
}

declare const MsgBroker: SocketMsgBrokerClient;

export { MsgBroker };