from vosk import Model, KaldiRecognizer
from colorama import Fore, Style
from interfaces import ISingleton
from utils import AudioService
import pyaudio
import os
import time, colorama, json

colorama.init()

class SpeechRecognitionService(ISingleton):
    SERVICE_NAME = "SpeechRecognitionService"
    
    def __init__(self, name, model_path):
        """
        Инициализация сервиса распознавания речи
        
        Args:
            name (str): Имя, которое будет распознаваться
            model_path (str): Путь к директории с моделью
        """
        self.name = name
        self._name_lower = name.lower()
        self.model = Model(model_path)

        self.name_recognizer = KaldiRecognizer(self.model, int(os.getenv("VOICE_RECOGNITION_DISCRETIZATION_RATE", 16000)))
        self.full_recognizer = KaldiRecognizer(self.model, int(os.getenv("VOICE_RECOGNITION_DISCRETIZATION_RATE", 16000)))

        self.name_detection_buffer = int(os.getenv("VOICE_RECOGNITION_NAME_DETECTION_BUFFER", 1024))
        self.full_detection_buffer = int(os.getenv("VOICE_RECOGNITION_FULL_DETECTION_BUFFER", 8192))

        self.name_in_partial = False
        self.is_name_listening_state = True

        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(
            format=pyaudio.paInt16,
            channels=int(os.getenv("VOICE_RECOGNITION_CHANNELS", 1)),
            rate=int(os.getenv("VOICE_RECOGNITION_DISCRETIZATION_RATE", 16000)),
            input=True,
            frames_per_buffer=self.full_detection_buffer
        )
        self.stream.start_stream()

        self.services = {
            "audio": AudioService().getInstance()
        }

    def _wait_for_name(self, timeout=None):
        """
        Ожидание распознавания имени
        
        Args:
            timeout (float): Время ожидания в секундах
        
        Returns:
            bool: True, если имя распознано, False в противном случае
        """
        start_time = time.time()
        
        self.name_recognizer.Reset()
        self.name_in_partial = False
        
        while True:
            if timeout and (time.time() - start_time) > timeout:
                return False
                
            data = self.stream.read(self.name_detection_buffer, exception_on_overflow=False)
            
            partial = json.loads(self.name_recognizer.PartialResult())
            
            if partial.get('partial'):
                if self._name_lower in partial['partial'].lower():
                    self.name_in_partial = True
                    return True
                
            if self.name_in_partial:
                if data and self.name_recognizer.AcceptWaveform(data):
                    result = json.loads(self.name_recognizer.Result())
                    if result.get('text'):
                        return True
                    
                    self.name_in_partial = False
            else:
                if data and self.name_recognizer.AcceptWaveform(data):
                    result = json.loads(self.name_recognizer.Result())
                    if result.get('text') and self._name_lower in result['text'].lower():
                        return True
            
            time.sleep(0.01)

    def execute(self):
        """
        Запуск потока распознавания речи
        """
        while True:
            name_detected = self._wait_for_name()
            
            if name_detected:
                self.services["audio"].play_sound("listening")
                yield { 'event': 'wake', 'name': self.name }
                
                self.is_name_listening_state = False
                self.full_recognizer.Reset()
                
                while not self.is_name_listening_state:
                    data = self.stream.read(self.full_detection_buffer, exception_on_overflow=False)
                    
                    if data and self.full_recognizer.AcceptWaveform(data):
                        result = json.loads(self.full_recognizer.Result())
                        if result.get('text'):
                            self.is_name_listening_state = True    
                            yield { 'event': 'transcript', 'text': result['text'] }