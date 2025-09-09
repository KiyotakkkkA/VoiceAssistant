import pyaudio
import time, json
from vosk import Model, KaldiRecognizer
from colorama import Fore, Style, init
from interfaces import IService
from utils import AudioService
from utils.EnvHelper import getenv_int, getenv
from utils.LogService import get_logger
from enums.Events import EventsType, EventsTopic
from mtypes.Global import Message
from typing import Generator, override, Optional

init()

class SpeechRecognitionService(IService):
    SERVICE_NAME = "SpeechRecognitionService"
    
    def __init__(self, name, model_path):
        """
        Инициализация сервиса распознавания речи
        
        Args:
            name (str): Имя, которое будет распознаваться
            model_path (str): Путь к директории с моделью
        """
        self.logger = get_logger()
        self.name = name
        self._name_lower = name.lower()
        
        try:
            self.logger.info(f"Loading Vosk model from: {model_path}", self.SERVICE_NAME)
            self.model = Model(model_path)
            self.logger.info("Vosk model loaded successfully", self.SERVICE_NAME)
        except Exception as e:
            self.logger.critical(f"Failed to load Vosk model from {model_path}", self.SERVICE_NAME, e)
            raise

        try:
            self.name_recognizer = KaldiRecognizer(self.model, getenv_int("VOICE_RECOGNITION_DISCRETIZATION_RATE", 16000))
            self.full_recognizer = KaldiRecognizer(self.model, getenv_int("VOICE_RECOGNITION_DISCRETIZATION_RATE", 16000))
            self.logger.info("Kaldi recognizers initialized", self.SERVICE_NAME)
        except Exception as e:
            self.logger.critical("Failed to initialize Kaldi recognizers", self.SERVICE_NAME, e)
            raise

        self.name_detection_buffer = getenv_int("VOICE_RECOGNITION_NAME_DETECTION_BUFFER", 1024)
        self.full_detection_buffer = getenv_int("VOICE_RECOGNITION_FULL_DETECTION_BUFFER", 8192)

        self.name_in_partial = False
        self.is_name_listening_state = True

        self.p: Optional[pyaudio.PyAudio] = None
        self.stream: Optional[pyaudio.Stream] = None
        self._init_audio_stream()

        self.services = {
            "audio": AudioService().getInstance()
        }

    def _init_audio_stream(self):
        try:
            if self.stream:
                self.stream.stop_stream()
                self.stream.close()
            if self.p:
                self.p.terminate()
        except Exception as e:
            self.logger.warning(f"Error during audio stream cleanup: {e}", self.SERVICE_NAME, e)
            
        try:
            self.logger.info("Initializing PyAudio stream", self.SERVICE_NAME)
            self.p = pyaudio.PyAudio()
            self.stream = self.p.open(
                format=pyaudio.paInt16,
                channels=getenv_int("VOICE_RECOGNITION_CHANNELS", 1),
                rate=getenv_int("VOICE_RECOGNITION_DISCRETIZATION_RATE", 16000),
                input=True,
                frames_per_buffer=self.full_detection_buffer
            )
            self.stream.start_stream()
            self.logger.info("PyAudio stream initialized successfully", self.SERVICE_NAME)
        except Exception as e:
            self.logger.critical("Failed to initialize PyAudio stream", self.SERVICE_NAME, e)
            raise

    def _is_stream_active(self):
        try:
            return self.stream is not None and self.stream.is_active() and not self.stream.is_stopped()
        except:
            return False

    def _wait_for_name(self, timeout=None, stop_event=None):
        start_time = time.time()
        
        self.name_recognizer.Reset()
        self.name_in_partial = False
        
        while True:
            if stop_event and stop_event.is_set():
                return False
                
            if timeout and (time.time() - start_time) > timeout:
                return False
            
            if not self._is_stream_active():
                print(f"[{self.SERVICE_NAME}] Stream is not active, reinitializing...")
                try:
                    self._init_audio_stream()
                except Exception as init_error:
                    print(f"[{self.SERVICE_NAME}] Failed to reinitialize stream: {init_error}")
                    return False
                
            try:
                if not self.stream:
                    print(f"[{self.SERVICE_NAME}] Stream is None, reinitializing...")
                    self._init_audio_stream()
                
                if self.stream is None:
                    print(f"[{self.SERVICE_NAME}] Failed to initialize stream")
                    return False
                    
                data = self.stream.read(self.name_detection_buffer, exception_on_overflow=False)
                if not data:
                    time.sleep(0.01)
                    continue

                if self.name_recognizer.AcceptWaveform(data):
                    result = json.loads(self.name_recognizer.Result())
                    if result.get('text') and self._name_lower in result['text'].lower():
                        return True
                    self.name_in_partial = False
                else:
                    partial = json.loads(self.name_recognizer.PartialResult())
                    part_text = (partial.get('partial') or '').lower()
                    if part_text:
                        if self._name_lower in part_text:
                            self.name_in_partial = True
                            return True
                
            except Exception as e:
                print(f"[{self.SERVICE_NAME}] error in _wait_for_name: {e}")
                if "Stream closed" in str(e) or "-9988" in str(e):
                    print(f"[{self.SERVICE_NAME}] Stream closed error, reinitializing...")
                    try:
                        self._init_audio_stream()
                    except Exception as init_error:
                        print(f"[{self.SERVICE_NAME}] Failed to reinitialize after stream error: {init_error}")
                        return False
                elif stop_event and stop_event.is_set():
                    return False
            
            time.sleep(0.01)

    @override
    def execute(self, stop_event=None, **args) -> Generator[Message, None, None]:
        try:
            while True:
                if stop_event and stop_event.is_set():
                    print(f"[{self.SERVICE_NAME}] received stop signal, exiting...")
                    break
                
                name_detected = self._wait_for_name(timeout=1.0, stop_event=stop_event)
                if name_detected:
                    self.services['audio'].play_sound_async("listening") # type: ignore
                    yield { 'type': EventsType.SERVICE_ACTION.value, 'topic': EventsTopic.ACTION_WAKE.value, 'payload': { 'name': self.name } } # type: ignore

                    self.is_name_listening_state = False
                    self.full_recognizer.Reset()
                    
                    while not self.is_name_listening_state:
                        if stop_event and stop_event.is_set():
                            print(f"[{self.SERVICE_NAME}] received stop signal during text recognition, exiting...")
                            return
                        
                        if not self._is_stream_active():
                            print(f"[{self.SERVICE_NAME}] Stream is not active during full recognition, reinitializing...")
                            try:
                                self._init_audio_stream()
                            except Exception as init_error:
                                print(f"[{self.SERVICE_NAME}] Failed to reinitialize stream during full recognition: {init_error}")
                                self.is_name_listening_state = True
                                break
                        
                        try:
                            if not self.stream:
                                print(f"[{self.SERVICE_NAME}] Stream is None, reinitializing...")
                                self._init_audio_stream()
                            
                            if self.stream is None:
                                print(f"[{self.SERVICE_NAME}] Failed to initialize stream during full recognition")
                                self.is_name_listening_state = True
                                break
                                
                            data = self.stream.read(self.full_detection_buffer, exception_on_overflow=False)
                            
                            if data and self.full_recognizer.AcceptWaveform(data):
                                result = json.loads(self.full_recognizer.Result())
                                if result.get('text'):
                                    self.is_name_listening_state = True
                                    yield { 'type': EventsType.EVENT.value, 'topic': EventsTopic.RAW_TEXT_DATA_RECOGNIZED.value, 'payload': { 'text': result['text'] } }
                        except Exception as stream_error:
                            print(f"[{self.SERVICE_NAME}] error during full recognition: {stream_error}")
                            if "Stream closed" in str(stream_error) or "-9988" in str(stream_error):
                                print(f"[{self.SERVICE_NAME}] Stream closed error during full recognition, will reinitialize on next iteration")
                                self.is_name_listening_state = True
                                break
        except Exception as e:
            print(f"[{self.SERVICE_NAME}] error in execute: {e}")
        finally:
            print(f"[{self.SERVICE_NAME}] execute finished")

    def cleanup(self):
        try:
            if hasattr(self, 'stream') and self.stream is not None:
                try:
                    if not self.stream.is_stopped():
                        self.stream.stop_stream()
                    self.stream.close()
                except Exception as stream_e:
                    print(f"[{self.SERVICE_NAME}] error closing stream: {stream_e}")
                finally:
                    self.stream = None
            
            if hasattr(self, 'p') and self.p is not None:
                try:
                    self.p.terminate()
                except Exception as pa_e:
                    print(f"[{self.SERVICE_NAME}] error terminating PyAudio: {pa_e}")
                finally:
                    self.p = None
                
        except Exception as e:
            print(f"[{self.SERVICE_NAME}] error during cleanup: {e}")