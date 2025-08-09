from services import SpeechRecognitionService, TextNormalizationService, CommandBusService
from services.classification import IntentTrainingService, IntentClassifierService
from utils import AudioService
from colorama import Fore, Style
import colorama

colorama.init()

class Assistant:
    def __init__(self,
                 name: str,
                 VOICE_RECOGNITION_MODEL_DIR_PATH: str,
                 TEXT_CLASSIFICATION_DATASETS_DIR_PATH: str,
                 TEXT_CLASSIFICATION_MODEL_DIR_PATH: str,
                 prediction_threshold: float = 0.8):
        """
        Инициализация голосового ассистента
        
        Args:
            name (str): Имя ассистента
            VOICE_RECOGNITION_MODEL_DIR_PATH (str): Путь к директории с моделью распознавания речи
            TEXT_CLASSIFICATION_DATASETS_DIR_PATH (str): Путь к директории с моделью классификации интентов
            TEXT_CLASSIFICATION_MODEL_DIR_PATH (str): Путь к директории с моделью классификации интентов
            prediction_threshold (float): Порог уверенности для классификации
        """
        self.name = name
        self.VOICE_RECOGNITION_MODEL_DIR_PATH = VOICE_RECOGNITION_MODEL_DIR_PATH
        
        self.TEXT_CLASSIFICATION_DATASETS_DIR_PATH = TEXT_CLASSIFICATION_DATASETS_DIR_PATH
        self.TEXT_CLASSIFICATION_MODEL_DIR_PATH = TEXT_CLASSIFICATION_MODEL_DIR_PATH
        
        self.prediction_threshold = prediction_threshold
        
        self.services = {
            'audio': AudioService().getInstance(),
            "speech_recognition": SpeechRecognitionService(name, VOICE_RECOGNITION_MODEL_DIR_PATH),
            "text_normalization": TextNormalizationService(),
            "intent_classifier": IntentClassifierService(TEXT_CLASSIFICATION_MODEL_DIR_PATH),
            "command_bus": CommandBusService(),
            "dataset_model": IntentTrainingService(
                input_dataset_files_dir=TEXT_CLASSIFICATION_DATASETS_DIR_PATH,
                output_merged_dataset_file_path=TEXT_CLASSIFICATION_MODEL_DIR_PATH,
                output_model_save_path=TEXT_CLASSIFICATION_MODEL_DIR_PATH,
            )
        }
        
    def test(self):
        """
        Тестирование всех сервисов
        """
        for service in self.services.values():
            if hasattr(service, "test"):
                service.test()
                
    def run(self):
        """
        Запуск ассистента
        """
        for text in self.services["speech_recognition"].execute():
            if text['event'] == 'wake':
                yield text
            else:
                normalized_text = self.services["text_normalization"].execute(text['text'])

                intent = self.services.get("intent_classifier")
                if intent and intent.is_loaded:
                    predicted_intent = intent.predict(normalized_text.split(), self.prediction_threshold)
                    command_result = self.services["command_bus"].execute(predicted_intent)
                    
                    if not command_result.get("status"):
                        self.services["audio"].play_sound("not_understood")
                    
                    yield { "event": "transcript", "text": command_result }
                    
                else:
                    print(f"{Fore.RED}Сервис классификации интентов не настроен или модель не загружена.{Style.RESET_ALL}")

    def start(self):
        """
        Запуск ассистента
        """
        self.test()
        self.run()
    
    def train(self):
        """
        Обучение модели классификации
        """
        self.services["dataset_model"].train(test_size=0.1)
