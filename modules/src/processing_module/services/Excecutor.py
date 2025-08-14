from src.processing_module.services.CommandBusService import CommandBusService
from src.processing_module.services.classification import IntentTrainingService, IntentClassifierService
from utils import AudioService
from colorama import Fore, Style
import colorama

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
        self.TEXT_CLASSIFICATION_DATASETS_DIR_PATH = TEXT_CLASSIFICATION_DATASETS_DIR_PATH
        self.TEXT_CLASSIFICATION_MODEL_DIR_PATH = TEXT_CLASSIFICATION_MODEL_DIR_PATH
        
        self.prediction_threshold = prediction_threshold

        self.services = {
            'audio': AudioService().getInstance(),
            "intent_classifier": IntentClassifierService(TEXT_CLASSIFICATION_MODEL_DIR_PATH),
            "command_bus": CommandBusService(),
            "dataset_model": IntentTrainingService(
                input_dataset_files_dir=TEXT_CLASSIFICATION_DATASETS_DIR_PATH,
                output_merged_dataset_file_path=TEXT_CLASSIFICATION_MODEL_DIR_PATH,
                output_model_save_path=TEXT_CLASSIFICATION_MODEL_DIR_PATH,
            )
        }
    
    def train(self):
        """
        Обучение модели классификации
        """
        self.services["dataset_model"].train(test_size=0.1)
                
    def run(self, msg):
        """
        Запуск ассистента
        """
        intent = self.services.get("intent_classifier")
        if intent and intent.is_loaded:
            predicted_intent = intent.predict(msg['payload']['text'].split(), self.prediction_threshold)
            command_result = self.services["command_bus"].execute(predicted_intent)
            
            if not command_result.get('data', {}).get('status'):
                self.services["audio"].play_sound("not_understood")

            yield command_result

        else:
            print(f"{Fore.RED}Сервис классификации интентов не настроен или модель не загружена.{Style.RESET_ALL}")
