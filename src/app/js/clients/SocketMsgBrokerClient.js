class SocketMsgBrokerClient {

    static MAX_CACHED_MESSAGES = 10;

    static WebsocketServer = null;
    static ConnectedClients = new Set();
    static Bindings = new Map()
    static WssMessageHistory = [];
    static onConnectionAction = (ws) => {};

    static clientMetadata = new Map();
    static messageIdCounter = 0;

    static Logger = {
        info: (message) => console.log(`\x1b[35m[ELECTRON - WSBroker]\x1b[0m \x1b[32mINFO:\x1b[0m ${message}`),
        warn: (message) => console.warn(`\x1b[35m[ELECTRON - WSBroker]\x1b[0m \x1b[33mWARN:\x1b[0m ${message}`),
        error: (message) => console.error(`\x1b[35m[ELECTRON - WSBroker]\x1b[0m \x1b[31mERROR:\x1b[0m ${message}`),
        debug: (message) => console.debug(`\x1b[35m[ELECTRON - WSBroker]\x1b[0m \x1b[36mDEBUG:\x1b[0m ${message}`)
    };

    static EnableLogger = true;

    static cleanup() {
        for (const client of SocketMsgBrokerClient.ConnectedClients) {
            client.terminate();
        }
        SocketMsgBrokerClient.ConnectedClients.clear();
        SocketMsgBrokerClient.Bindings.clear();
        SocketMsgBrokerClient.WssMessageHistory.length = 0;
        SocketMsgBrokerClient.clientMetadata.clear();
        SocketMsgBrokerClient.messageIdCounter = 0;
    }

    init(WSS, EnableLogger = true) {

        SocketMsgBrokerClient.EnableLogger = EnableLogger;

        try {
            SocketMsgBrokerClient.WebsocketServer = WSS;

            SocketMsgBrokerClient.WssMessageHistory.forEach(msg => {
                if (!msg._id) {
                    msg._id = ++SocketMsgBrokerClient.messageIdCounter;
                }
            });

            this.logInfo(`Server listening on ws://localhost:${SocketMsgBrokerClient.WebsocketServer.options.port}`);
            return true;
        } 
        catch (error){
            this.logError(`Critical Error - Unable to init WebSocketServer with error -> ${error}`);
            return false;
        }
    }

    startListening() {
        SocketMsgBrokerClient.WebsocketServer.on('connection', (ws) => {
            SocketMsgBrokerClient.ConnectedClients.add(ws);
            this.logDebug(`New client connected. Client: ${ws._socket.remoteAddress}:${ws._socket.remotePort}`);
            
            let clientServiceId = null;
            let hasReceivedInitialMessage = false;

            ws.on('close', () => {
                SocketMsgBrokerClient.ConnectedClients.delete(ws);
                if (clientServiceId) {
                    this.logDebug(`Client ${clientServiceId} disconnected`);
                }
            });

            ws.on('message', (data) => {
                let msg;
                try { msg = JSON.parse(data.toString()); } catch (e) {
                    this.logWarning(`Non-JSON message ignored: ${data.toString()}`);
                    return;
                }

                if (!msg.type) msg.type = 'unknown';
                if (!msg.from) msg.from = 'unknown';

                msg._id = ++SocketMsgBrokerClient.messageIdCounter;

                if (!hasReceivedInitialMessage) {
                    hasReceivedInitialMessage = true;
                    clientServiceId = msg.from;
                    
                    const lastSeenId = SocketMsgBrokerClient.clientMetadata.get(clientServiceId) || 0;
                    
                    const missedMessages = SocketMsgBrokerClient.WssMessageHistory.filter(historyMsg => 
                        historyMsg._id > lastSeenId
                    );
                    
                    for (const missedMsg of missedMessages) {
                        if (ws.readyState === 1) {
                            ws.send(JSON.stringify(missedMsg));
                        }
                    }
                    
                    this.logDebug(`Client ${clientServiceId} reconnected. Sent ${missedMessages.length} missed messages (last seen: ${lastSeenId})`);
                } else {
                    if (clientServiceId) {
                        SocketMsgBrokerClient.clientMetadata.set(clientServiceId, msg._id);
                    }
                }

                if (SocketMsgBrokerClient.WssMessageHistory.length >= SocketMsgBrokerClient.MAX_CACHED_MESSAGES) {
                    SocketMsgBrokerClient.WssMessageHistory.shift();
                }
                SocketMsgBrokerClient.WssMessageHistory.push(msg);

                if (SocketMsgBrokerClient.Bindings.has(JSON.stringify([msg.type, msg.topic]))) {
                    const handlers = SocketMsgBrokerClient.Bindings.get(JSON.stringify([msg.type, msg.topic]));
                    for (const handler of handlers) {
                        handler(ws, msg);
                    }
                }

                for (const client of SocketMsgBrokerClient.ConnectedClients) {
                    if (client !== ws && client.readyState === 1) {
                        client.send(JSON.stringify(msg));
                    }
                }

                if (msg.type !== 'ping' && msg.topic !== 'heartbeat') {
                    this.logInfo(`Message: ${JSON.stringify(msg)}`);
                }
            });

            SocketMsgBrokerClient.onConnectionAction(ws);
        });

        SocketMsgBrokerClient.WebsocketServer.on('error', (err) => {
            this.logError(`WebSocketServer error: ${err.message}`);
        });
    }

    onConnection(func){
        SocketMsgBrokerClient.onConnectionAction = func;
    }

    onMessage(binding) {
        if (!SocketMsgBrokerClient.Bindings.has(binding.key)) {
            SocketMsgBrokerClient.Bindings.set(JSON.stringify(binding.key), []);
        }
        SocketMsgBrokerClient.Bindings.get(JSON.stringify(binding.key)).push(binding.handler);
    }

    getClients() {
        return SocketMsgBrokerClient.ConnectedClients;
    }

    logInfo(logMsg) {
        if (SocketMsgBrokerClient.EnableLogger) { SocketMsgBrokerClient.Logger.info(logMsg) }
    }

    logWarning(logMsg) {
        if (SocketMsgBrokerClient.EnableLogger) { SocketMsgBrokerClient.Logger.warn(logMsg) }
    }

    logError(logMsg) {
        if (SocketMsgBrokerClient.EnableLogger) { SocketMsgBrokerClient.Logger.error(logMsg) }
    }

    logDebug(logMsg) {
        if (SocketMsgBrokerClient.EnableLogger) { SocketMsgBrokerClient.Logger.debug(logMsg) }
    }

}

export const MsgBroker = new SocketMsgBrokerClient()