from src.speech_rec_module.services import SpeechRecognitionService
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
        }

    def run(self, stop_event=None) -> Generator[Message, None, None]:
        try:
            for item in self.services["speech_recognition"].execute(stop_event=stop_event):
                if stop_event and stop_event.is_set():
                    break
                yield item
        except Exception as e:
            print(f"[Recognizer] error in run loop: {e}")
        finally:
            print(f"[Recognizer] run loop finished")

    def cleanup(self):
        """Корректная очистка ресурсов"""
        try:
            if hasattr(self.services["speech_recognition"], 'cleanup'):
                self.services["speech_recognition"].cleanup()
        except Exception as e:
            print(f"[Recognizer] error during cleanup: {e}")
