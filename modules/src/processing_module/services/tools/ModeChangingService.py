from interfaces import ISingleton
from utils import AudioService
from paths import path_resolver
from enums.Events import EventsType, EventsTopic

class ModeChangingService(ISingleton):
    SERVICE_NAME = "ModeChangingService"
    
    def __init__(self):
        super().__init__()
        
        self.services = {
            "audio": AudioService().getInstance(),
        }

        self.required_mode = None
        
        self.tokens = {
            "SET_NORMAL_MODE": self.set_normal_mode_handler,
            "SET_INTERACTIVE_MODE": self.set_interactive_mode_handler,
        }

    def set_normal_mode_handler(self, msg_data: dict):
        self.services["audio"].play_sound("set_mode")

        return {
            "status": True,
            "message": "Режим успешно изменён на 'ОБЫЧНЫЙ'",
            "additional": {
                "mode_to": "NORMAL"
            }
        }

    def set_interactive_mode_handler(self, msg_data: dict):
        self.services["audio"].play_sound("set_mode")

        return {
            "status": True,
            "message": "Режим успешно изменён на 'ИНТЕРАКТИВНЫЙ'",
            "additional": {
                "mode_to": "INTERACTIVE"
            }
        }

    def execute(self, current_excecutor_state: str, msg_data: dict):
        intent = msg_data.get('intent')
        result = self.tokens[intent](msg_data) 
        
        return result
