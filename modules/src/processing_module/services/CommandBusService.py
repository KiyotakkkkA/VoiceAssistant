from utils.AudioService import AudioService
from src.processing_module.services.tools import AppManageService, SystemManageService, ModeChangingService
from interfaces import ISingleton

class CommandBusService(ISingleton):
    def __init__(self):

        self.services = {
            'audio': AudioService().getInstance(),
        }
        
        self.tools = {
            "app_manager": AppManageService.getInstance(),
            'system_manager': SystemManageService.getInstance(),
            "mode_changing": ModeChangingService.getInstance()
        }
        
        self.intent_to_manager_map = {}
        
        self.bind()
    
    def bind(self):
        for tool in self.tools:
            for token in self.tools[tool].tokens.items():
                self.intent_to_manager_map[token[0]] = tool

    def execute(self, current_excecutor_state: str, msg_data: dict):
        if not msg_data.get("intent"):
            return {
                "original_text": msg_data.get("original_text"),
                "intent": None,
                "confidence": msg_data.get("confidence"),
                "data": {
                    "status": False,
                    "message": "Команда не распознана"
                }
            }
        
        intent = msg_data["intent"]
        manager = self.intent_to_manager_map.get(intent)
        
        if not manager:
            return {
                "original_text": msg_data.get("original_text"),
                "intent": intent,
                "confidence": msg_data.get("confidence"),
                "data": {
                    "status": False,
                    "message": "Обработчик команды не найден"
                }
            }

        if self.tools[manager].required_mode and self.tools[manager].required_mode != current_excecutor_state:

            self.services["audio"].play_sound("incorrect_mode")

            return {
                "original_text": msg_data.get("original_text"),
                "intent": intent,
                "confidence": msg_data.get("confidence"),
                "data": {
                    "status": False,
                    "message": f"Неверный режим работы. Ожидается: {manager.required_mode}, текущий: {current_excecutor_state}"
                }
            }

        result = self.tools[manager].execute(current_excecutor_state, msg_data)

        status = result.get("status")
        event = result.get("event", None)

        return {
            "original_text": msg_data.get("original_text"),
            'intent': intent,
            "confidence": msg_data.get("confidence"),
            'event': event,
            "data": {
                "status": status,
                "message": result.get("message"),
                "additional": result.get("additional", {})
            }
        }
        