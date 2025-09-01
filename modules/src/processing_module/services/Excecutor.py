import json
import colorama
from src.processing_module.services.AIService import AIService
from utils import AudioService
from interfaces import IService
from colorama import Fore, Style
from paths import path_resolver

colorama.init()

class Excecutor:
    def __init__(self,
                 prediction_threshold: float = 0.8):
        """
        Инициализация голосового ассистента
        
        Args:
            prediction_threshold (float): Порог уверенности для классификации
        """
        self.current_state = 'NORMAL'

        self.current_model_id = None
        self.current_model_name = None
        self.current_model_key = None
        
        self.prediction_threshold = prediction_threshold

        self.services: dict[str, IService] = {
            'audio': AudioService().getInstance(),
            "ai_service": AIService().getInstance(),
        }

        self.get_current_model_data_from_json()

    def set_socket_client(self, socket_client):
        ai_service = self.services["ai_service"]
        if hasattr(ai_service, 'set_socket_client'):
            ai_service.set_socket_client(socket_client)  # type: ignore

    def get_current_model_data_from_json(self, model_id = None):
        """
        Получение данных текущей модели из JSON
        """
        with open(f"{path_resolver['global_path']}/settings.json", 'r') as f:
            data = json.load(f)
            if model_id:
                self.current_model_id = model_id
            else:
                self.current_model_id = data.get("ui.current.aimodel.id", None)
            
            if (not self.current_model_id):
                return

            for key in data.get("ui.current.apikeys", []):
                if key.get("id") == self.current_model_id:
                    self.current_model_name = key.get("name")
                    self.current_model_key = key.get("value")
                    self.services["ai_service"].set_client_data(self.current_model_key, self.current_model_name) # type: ignore
                    break

    def run(self, msg):
        """
        Запуск ассистента
        """

        data = self.services["ai_service"].execute(msg['payload']['text']) # type: ignore

        yield data
