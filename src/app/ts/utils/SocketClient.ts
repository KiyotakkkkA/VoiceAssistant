declare const __SOCKET_HOST__: string;
declare const __SOCKET_PORT__: number;

type MessageHandler = (msg: any) => void;

interface SocketClientOptions {
	url?: string;
	reconnectDelayMs?: number;
	log?: boolean;
}

class SocketClient {
	private url: string;
	private ws: WebSocket | null = null;
	private handlers: Set<MessageHandler> = new Set();
	private reconnectDelay: number;
	private log: boolean;
	private manualClose = false;

	constructor(opts: SocketClientOptions = {}) {
		this.url = opts.url || `ws://${__SOCKET_HOST__}:${__SOCKET_PORT__}`;
		this.reconnectDelay = opts.reconnectDelayMs ?? 1500;
		this.log = !!opts.log;
		this.connect();
	}

	private connect() {
		if (this.log) console.log('[SocketClient] connecting to', this.url);
		this.ws = new WebSocket(this.url);
		this.ws.onopen = () => {
			if (this.log) console.log('[SocketClient] connected');
			this.send({ type: 'ui_ready', from: 'ui', payload: 'renderer online' });
		};
		this.ws.onmessage = (ev) => {
			let parsed: any = null;
			try { parsed = JSON.parse(ev.data); } catch { parsed = ev.data; }
			if (this.log) console.log('[SocketClient] <=', parsed);
			for (const h of this.handlers) h(parsed);
		};
		this.ws.onerror = (err) => {
			if (this.log) console.warn('[SocketClient] error', err);
		};
		this.ws.onclose = () => {
			if (this.log) console.warn('[SocketClient] closed');
			this.ws = null;
			if (!this.manualClose) {
				setTimeout(() => this.connect(), this.reconnectDelay);
			}
		};
	}

	send(obj: any) {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
		try {
			const payload = { from: 'ui', ...obj };
			if (this.log) console.log('[SocketClient] =>', payload);
			this.ws.send(JSON.stringify(payload));
			return true;
		} catch {
			return false;
		}
	}

	subscribe(handler: MessageHandler) {
		this.handlers.add(handler);
		return () => this.handlers.delete(handler);
	}

	close() {
		this.manualClose = true;
		this.ws?.close();
	}
}

export const socketClient = new SocketClient({ log: true });
export default socketClient;
