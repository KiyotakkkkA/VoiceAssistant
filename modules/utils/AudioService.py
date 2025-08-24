import pygame
import os
from pathlib import Path
from colorama import Fore, Style
from interfaces import IService
from paths import path_resolver
from typing import Any

class AudioService(IService):
    SERVICE_NAME = "AudioService"

    audio_dir = Path(path_resolver['audio_path'])

    def __init__(self):
        super().__init__()
        self.sounds = {}
        if not pygame.mixer.get_init():
            pygame.mixer.init()

        if not os.path.exists(self.audio_dir):
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Директория {self.audio_dir} не найдена")
        else:
            self._load_sounds()

    def _load_sounds(self):
        """Загружает все звуковые файлы из директории в память."""
        try:
            supported_extensions = {'.wav', '.mp3', '.ogg', '.flac', '.mid', '.midi', '.aac', '.wma', '.m4a'}
            
            for file in os.listdir(self.audio_dir):
                file_path = os.path.join(self.audio_dir, file)
                if os.path.isfile(file_path) and Path(file).suffix.lower() in supported_extensions:
                    sound_name = Path(file).stem
                    try:
                        sound_object = pygame.mixer.Sound(file_path)
                        self.sounds[sound_name] = sound_object
                        print(f"{Fore.GREEN}[УСПЕХ]{Style.RESET_ALL} Загружен звук: {Fore.MAGENTA}{sound_name}{Style.RESET_ALL} ({file})")
                    except pygame.error as e:
                        print(f"{Fore.YELLOW}[ПРЕДУПРЕЖДЕНИЕ]{Style.RESET_ALL} Не удалось загрузить звук {Fore.MAGENTA}{file_path}{Style.RESET_ALL}: {e}")
                    except Exception as e:
                        print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Неожиданная ошибка при загрузке звука {Fore.MAGENTA}{file_path}{Style.RESET_ALL}: {e}")
                        
        except Exception as e:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Ошибка при сканировании директории звуков: {e}")

    def play_sound(self, sound_name: str) -> bool:
        """
        Синхронно воспроизводит звук по имени.
        Блокирует выполнение до завершения воспроизведения.
        
        Args:
            sound_name (str): Имя звука (без расширения).
            
        Returns:
            bool: True, если воспроизведение успешно, иначе False.
        """
        if sound_name not in self.sounds:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Звук '{sound_name}' не найден")
            return False
            
        try:
            sound = self.sounds[sound_name]
            sound.play()
            while pygame.mixer.get_busy():
                pygame.time.wait(10)
            return True
        except Exception as e:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Ошибка при воспроизведении звука '{sound_name}': {e}")
            return False

    def play_sound_async(self, sound_name: str) -> bool:
        """
        Асинхронно воспроизводит звук по имени.
        Не блокирует выполнение.
        
        Args:
            sound_name (str): Имя звука (без расширения).
            
        Returns:
            bool: True, если запуск воспроизведения успешен, иначе False.
        """
        if sound_name not in self.sounds:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Звук '{sound_name}' не найден")
            return False
            
        try:
            self.sounds[sound_name].play()
            return True
        except Exception as e:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Ошибка при запуске воспроизведения звука '{sound_name}': {e}")
            return False

    def stop_all_sounds(self):
        """Останавливает воспроизведение всех звуков."""
        try:
            pygame.mixer.stop()
            print(f"{Fore.GREEN}[УСПЕХ]{Style.RESET_ALL} Все звуки остановлены")
        except Exception as e:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Ошибка при остановке звуков: {e}")
    
    def execute(self, **kwargs) -> Any:
        pass

    def __del__(self):
        """Деструктор для освобождения ресурсов pygame при удалении объекта."""
        try:
            pygame.mixer.quit()
        except:
            pass