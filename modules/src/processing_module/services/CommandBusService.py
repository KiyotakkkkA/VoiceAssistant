from src.processing_module.services.tools import AppManageService, SystemManageService
from interfaces import ISingleton

class CommandBusService(ISingleton):
    def __init__(self):
        
        self.tools = {
            "app_manager": AppManageService.getInstance(),
            'system_manager': SystemManageService.getInstance()
        }
        
        self.intent_to_manager_map = {}
        
        self.bind()
    
    def bind(self):
        for tool in self.tools:
            for token in self.tools[tool].tokens.items():
                self.intent_to_manager_map[token[0]] = tool

    def execute(self, msg_data: dict):
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
        
        result = self.tools[manager].execute(msg_data)

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
                "additional": result.get("additional", None)
            }
        }
        