from services.tools import AppManageService, SystemManageService
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
                "status": False,
                "original_text": msg_data.get("original_text"),
                "result": {
                    "intent": None,
                    "confidence": msg_data.get("confidence"),
                    "message": "Команда не распознана"
                }
            }
        
        intent = msg_data["intent"]
        manager = self.intent_to_manager_map.get(intent)
        
        if not manager:
            return {
                "status": False,
                "original_text": msg_data.get("original_text"),
                "result": {
                    "intent": intent,
                    "confidence": msg_data.get("confidence"),
                    "message": "Обработчик команды не найден"
                }
            }
        
        result = self.tools[manager].execute(msg_data)
        
        return {
            "status": result.get("status"),
            "original_text": msg_data.get("original_text"),
            "result": result.get("result")
        }
        