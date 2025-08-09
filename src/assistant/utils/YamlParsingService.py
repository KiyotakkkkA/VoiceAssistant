from typing import Any, Dict, Optional
from colorama import Fore, Style
from interfaces import ISingleton
from pathlib import Path
import yaml
import os

class YamlParsingService(ISingleton):
    SERVICE_NAME = "YamlParsingService"

    def __init__(self):
        """
        Инициализирует сервис конфигурации.
        """
        self._main_config_data: Optional[Dict[str, Any]] = None
        self._loaded_configs: Dict[str, Dict[str, Any]] = {}

    def load(self, key: str, yaml_path: str) -> None:
        """
        Загружает дополнительный YAML-файл и сохраняет его данные под указанным ключом.

        Args:
            key (str): Ключ для доступа к данным загруженного файла.
            yaml_path (str): Путь к YAML-файлу для загрузки.
        
        Raises:
            FileNotFoundError: Если файл не найден.
            ValueError: Если произошла ошибка парсинга YAML.
            RuntimeError: Если произошла другая ошибка при загрузке.
        """

        if not os.path.exists(yaml_path):
            raise FileNotFoundError(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Конфигурационный файл для загрузки не найден: {Fore.MAGENTA}'{yaml_path}'{Style.RESET_ALL}")

        try:
            with open(yaml_path, 'r', encoding='utf-8') as file:
                config_data = yaml.safe_load(file) or {}
            self._loaded_configs[key] = config_data
            print(f"{Fore.GREEN}[УСПЕХ]{Style.RESET_ALL} Конфигурация {Fore.MAGENTA}'{key}'{Style.RESET_ALL} загружена из {Fore.MAGENTA}'{yaml_path}'{Style.RESET_ALL}")
        except yaml.YAMLError as e:
            raise ValueError(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Ошибка парсинга YAML в файле {Fore.MAGENTA}'{yaml_path}'{Style.RESET_ALL}: {e}")
        except Exception as e:
            raise RuntimeError(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Неожиданная ошибка при загрузке конфигурации {Fore.MAGENTA}'{key}'{Style.RESET_ALL} из {Fore.MAGENTA}'{yaml_path}'{Style.RESET_ALL}: {e}")

    def get(self, key_path: str, default: Any = None) -> Any:
        """
        Получает значение из конфигурации по пути к ключу.
        Сначала ищет в основном файле, затем в загруженных дополнительных файлах.
        Путь может включать ключ загруженного файла как префикс (например, 'apps_config.applications').

        Args:
            key_path (str): Путь к ключу, разделенный точками.
            default (Any): Значение по умолчанию, если ключ не найден.

        Returns:
            Any: Значение ключа или значение по умолчанию.
        """
        if self._main_config_data is not None:
            keys = key_path.split('.')
            data = self._main_config_data
            try:
                for k in keys:
                    data = data[k]
                return data
            except (KeyError, TypeError):
                pass

        path_parts = key_path.split('.', 1)
        if len(path_parts) > 1:
            config_key = path_parts[0]
            sub_key_path = path_parts[1]
            
            if config_key in self._loaded_configs:
                sub_keys = sub_key_path.split('.')
                data = self._loaded_configs[config_key]
                try:
                    for k in sub_keys:
                        data = data[k]
                    return data
                except (KeyError, TypeError):
                    pass

        return default

    def get_loaded(self, key: str) -> Optional[Dict[str, Any]]:
        """Возвращает словарь данных из конкретной загруженной конфигурации."""
        config = self._loaded_configs.get(key)
        return config.copy() if config is not None else None
