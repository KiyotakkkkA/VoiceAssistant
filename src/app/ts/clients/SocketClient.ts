import { Message } from "../types/Global";
import { EventsTopic, EventsType } from "../../js/enums/Events";

declare const __SOCKET_HOST__: string;
declare const __SOCKET_PORT__: number;

type MessageHandler = (msg: Message) => void;

interface SocketClientOptions {
	url?: string;
	reconnectDelayMs?: number;
	log?: boolean;
}

class SocketClient {
	private static url: string;
	private static ws: WebSocket | null = null;
	private static handlers: Set<MessageHandler> = new Set();
	private static reconnectDelay: number;
	private static log: boolean;
	private static manualClose = false;

	constructor(opts: SocketClientOptions = {}) {
		SocketClient.url = opts.url || `ws://${__SOCKET_HOST__}:${__SOCKET_PORT__}`;
		SocketClient.reconnectDelay = opts.reconnectDelayMs ?? 1500;
		SocketClient.log = !!opts.log;
		this.connect();
	}

	private connect() {
		if (SocketClient.log) console.log('[SocketClient] connecting to', SocketClient.url);
		SocketClient.ws = new WebSocket(SocketClient.url);
		SocketClient.ws.onopen = () => {
			if (SocketClient.log) console.log('[SocketClient] connected');
			this.send({ type: EventsType.SERVICE_INIT, topic: EventsTopic.READY_UI, from: 'ui', payload: {
				text: 'renderer online'
			} });
		};
		SocketClient.ws.onmessage = (ev) => {
			let parsed: any = null;
			try { parsed = JSON.parse(ev.data); } catch { parsed = ev.data; }
			if (SocketClient.log) console.log('[SocketClient] <=', parsed);
			for (const h of SocketClient.handlers) h(parsed);
		};
		SocketClient.ws.onerror = (err) => {
			if (SocketClient.log) console.warn('[SocketClient] error', err);
		};
		SocketClient.ws.onclose = () => {
			if (SocketClient.log) console.warn('[SocketClient] closed');
			SocketClient.ws = null;
			if (!SocketClient.manualClose) {
				window.safeTimers.setTimeout(() => this.connect(), SocketClient.reconnectDelay);
			}
		};
	}

	send(obj: Message) {
		if (!SocketClient.ws || SocketClient.ws.readyState !== WebSocket.OPEN) return false;
		try {
			const payload = { ...obj };
			if (SocketClient.log) console.log('[SocketClient] =>', payload);
			SocketClient.ws.send(JSON.stringify(payload));
			return true;
		} catch {
			return false;
		}
	}

	subscribe(handler: MessageHandler) {
		SocketClient.handlers.add(handler);
		return () => SocketClient.handlers.delete(handler);
	}

	close() {
		SocketClient.manualClose = true;
		SocketClient.ws?.close();
	}
}

export const socketClient = new SocketClient({ log: true });
export default socketClient;
