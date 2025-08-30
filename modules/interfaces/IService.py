from interfaces.ISingleton import ISingleton
from abc import abstractmethod
from typing import Dict, Any
from copy import deepcopy

class IService(ISingleton):

    _socket_messages_queue = []

    SERVICE_NAME: str = "IService@Base"

    def __init__(self):

        self.services: Dict[str, 'IService'] | None = {}

    @abstractmethod
    def execute(self, **args) -> Any:
        pass

    @classmethod
    def clear_socket_messages_queue(cls):
        cls._socket_messages_queue.clear()

    @classmethod
    def get_socket_messages_queue(cls):
        return deepcopy(cls._socket_messages_queue)

    @classmethod
    def extend_socket_messages_queue(cls, messages: list[dict]):
        cls._socket_messages_queue.extend(messages)

    @classmethod
    def add_socket_message_to_queue(cls, type: str, topic: str, data: dict):
        message = {
            'type': type,
            'topic': topic,
            'payload': {
                'data': data
            }
        }

        cls._socket_messages_queue.append(message)
