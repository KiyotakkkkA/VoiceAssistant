import { MsgBroker } from "../clients/SocketMsgBrokerClient.js";

const useSocketServer = () => {
  const sendToAll = (_type, _topic, _data) => {
    try {
        for (const client of MsgBroker.getClients()) {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
                type: _type,
                topic: _topic,
                payload: {
                    data: _data
                },
                from: 'server',
            }));
          }
        }
      } catch (e) {
        console.error(`[WS] ${_type} ${_topic} error`, e);
      }
  }

  return {
    sendToAll
  };
};

export { useSocketServer };
