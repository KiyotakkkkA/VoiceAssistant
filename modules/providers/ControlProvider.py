from clients import ModuleClient

class ControlProvider:

    _clients: dict[str, ModuleClient] = {}

    @staticmethod
    def connect(client_key: str, client: ModuleClient):
        if isinstance(client, ModuleClient):
            ControlProvider._clients[client_key] = client

    @staticmethod
    def socket_emit(client_key: str, data: dict):
        client = ControlProvider._clients.get(client_key)

        if isinstance(client, ModuleClient):
            client.emit(data)