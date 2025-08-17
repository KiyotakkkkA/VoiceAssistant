import json
import colorama
from enums.Events import EventsTopic
from src.processing_module.services.OpenRouterService import OpenRouterService
from src.processing_module.services.CommandBusService import CommandBusService
from src.processing_module.services.classification import IntentTrainingService, IntentClassifierService
from utils import AudioService
from colorama import Fore, Style
from paths import path_resolver

colorama.init()

class Excecutor:
    def __init__(self,
                 TEXT_CLASSIFICATION_DATASETS_DIR_PATH: str,
                 TEXT_CLASSIFICATION_MODEL_DIR_PATH: str,
                 prediction_threshold: float = 0.8):
        """
        Инициализация голосового ассистента
        
        Args:
            TEXT_CLASSIFICATION_DATASETS_DIR_PATH (str): Путь к директории с моделью классификации интентов
            TEXT_CLASSIFICATION_MODEL_DIR_PATH (str): Путь к директории с моделью классификации интентов
            prediction_threshold (float): Порог уверенности для классификации
        """

        self.current_state = 'NORMAL'

        self.current_model_id = None
        self.current_model_name = None
        self.current_model_key = None

        self.TEXT_CLASSIFICATION_DATASETS_DIR_PATH = TEXT_CLASSIFICATION_DATASETS_DIR_PATH
        self.TEXT_CLASSIFICATION_MODEL_DIR_PATH = TEXT_CLASSIFICATION_MODEL_DIR_PATH
        
        self.prediction_threshold = prediction_threshold

        self.services = {
            'audio': AudioService().getInstance(),
            "intent_classifier": IntentClassifierService(TEXT_CLASSIFICATION_MODEL_DIR_PATH),
            "command_bus": CommandBusService(),
            "open_router": OpenRouterService(),
            "dataset_model": IntentTrainingService(
                input_dataset_files_dir=TEXT_CLASSIFICATION_DATASETS_DIR_PATH,
                output_merged_dataset_file_path=TEXT_CLASSIFICATION_MODEL_DIR_PATH,
                output_model_save_path=TEXT_CLASSIFICATION_MODEL_DIR_PATH,
            )
        }

        self.get_current_model_data_from_json()

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
                    self.services["open_router"].set_client_data(self.current_model_key, self.current_model_name)
                    break

    def run(self, msg):
        """
        Запуск ассистента
        """
        intent = self.services.get("intent_classifier")
        if intent and intent.is_loaded:
            predicted_intent = intent.predict(msg['payload']['text'].split(), self.prediction_threshold)
            command_result = self.services["command_bus"].execute(self.current_state, predicted_intent)
            
            if command_result.get('data', {}).get('additional', {}).get('mode_to'):
                self.current_state = command_result['data']['additional']['mode_to']
                yield command_result
            
            elif not command_result.get('data', {}).get('status') and self.current_state == "NORMAL":
                self.services["audio"].play_sound("not_understood")
                yield command_result
            elif self.current_state == "INTERACTIVE":
                answer = self.services["open_router"].execute(msg['payload']['text'])
                yield {
                    'event': EventsTopic.ACTION_ANSWERING_AI.value,
                    'original_text': msg['payload']['text'],
                    'data': {
                        'status': True,
                        'model_name': self.current_model_name,
                        'external_ai_answer': answer
                    }
                }
        else:
            print(f"{Fore.RED}Сервис классификации интентов не настроен или модель не загружена.{Style.RESET_ALL}")
