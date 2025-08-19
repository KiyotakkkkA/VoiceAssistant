from src.speech_rec_module.services import SpeechRecognitionService, TextNormalizationService
from utils import AudioService
from mtypes.Global import Message
from colorama import Fore, Style
from typing import Generator
import colorama

colorama.init()

class Recognizer:
    def __init__(self,
                 name: str,
                 VOICE_RECOGNITION_MODEL_DIR_PATH: str):
        """
        Инициализация голосового ассистента
        
        Args:
            name (str): Имя ассистента
            VOICE_RECOGNITION_MODEL_DIR_PATH (str): Путь к директории с моделью распознавания речи
        """

        self.current_state = 'NORMAL'

        self.name = name
        self.VOICE_RECOGNITION_MODEL_DIR_PATH = VOICE_RECOGNITION_MODEL_DIR_PATH
        
        self.services = {
            'audio': AudioService().getInstance(),
            "speech_recognition": SpeechRecognitionService(name, VOICE_RECOGNITION_MODEL_DIR_PATH),
            "text_normalization": TextNormalizationService(),
        }
        
    def test(self):
        """
        Тестирование всех сервисов
        """
        for service in self.services.values():
            if hasattr(service, "test"):
                service.test()

    def run(self) -> Generator[Message, None, None]:
        """
        Запуск ассистента
        """
        for item in self.services["speech_recognition"].execute():
            if item['payload'].get('text'):
                if self.current_state == "NORMAL":
                    item['payload']['original_text'] = item['payload'].get('text')
                    item['payload']['text'] = self.services["text_normalization"].execute(item['payload']['text'])
            yield item
