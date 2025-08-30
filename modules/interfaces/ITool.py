from interfaces.ISingleton import ISingleton
from copy import deepcopy

class ITool(ISingleton):

    _socket_messages_queue = []

    name = 'Base Tool'

    commands = []

    @classmethod
    def get_commands(cls):
        return cls.commands
    
    @classmethod
    def clear_socket_messages_queue(cls):
        cls._socket_messages_queue.clear()

    @classmethod
    def get_socket_messages_queue(cls):
        return deepcopy(cls._socket_messages_queue)

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