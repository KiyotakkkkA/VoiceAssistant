from interfaces import ISingleton
from utils import AudioService
try:
    from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
    from comtypes import CLSCTX_ALL
    from comtypes.automation import VARIANT
    Pycaw_IMPORTED = True
except ImportError:
    Pycaw_IMPORTED = False

class SystemManageService(ISingleton):
    """
    Сервис для управления системными настройками, такими как громкость.
    """
    SERVICE_NAME = "SystemManageService"

    def __init__(self):
        super().__init__()
        self._volume_controller = None
        if Pycaw_IMPORTED:
            self._initialize_volume_controller()
        else:
            print(f"[ПРЕДУПРЕЖДЕНИЕ] {self.SERVICE_NAME}: Модуль 'pycaw' не найден. Управление громкостью недоступно.")
        
        self.services = {
            "audio": AudioService().getInstance(),
        }

        self.tokens = {
            "SET_VOLUME": self.set_volume_handler,
        }

    def _initialize_volume_controller(self):
        """Инициализирует контроллер громкости для Windows."""
        try:
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            self._volume_controller = interface.QueryInterface(IAudioEndpointVolume)
        except Exception as e:
            print(f"[ОШИБКА] {self.SERVICE_NAME}: Не удалось инициализировать контроллер громкости: {e}")
            self._volume_controller = None

    def set_system_volume(self, level: int) -> dict:
        """
        Устанавливает уровень системной громкости.
        
        Args:
            level (int): Уровень громкости от 0 до 100.
            
        Returns:
            dict: Результат операции.
                - status (bool): True, если успешно.
                - result (dict): Детали результата.
        """
        if not Pycaw_IMPORTED:
            return {
                "status": False,
                "result": {
                    "message": "Модуль 'pycaw' не установлен. Управление громкостью недоступно.",
                    "level": level
                }
            }

        if not self._volume_controller:
            return {
                "status": False,
                "result": {
                    "message": "Контроллер громкости не инициализирован.",
                    "level": level
                }
            }

        try:
            level = max(0, min(100, level))
            scalar_level = level / 100.0
            
            self._volume_controller.SetMasterVolumeLevelScalar(scalar_level, None) 
            
            if self._volume_controller.GetMute():
                self._volume_controller.SetMute(0, None)

            self.services["audio"].play_sound("set_volume_level")
            
            return {
                "status": True,
                "event": "ui_show_set_volume",
                "result": {
                    "message": f"Громкость системы установлена на {level}%",
                    "level": level
                }
            }
        except Exception as e:
            return {
                "status": False,
                "result": {
                    "message": f"Ошибка при установке громкости: {e}",
                    "level": level
                }
            }

    def execute(self, msg_data: dict):
        intent = msg_data.get('intent')
        result = self.tokens[intent](msg_data) 
        
        return result

    def set_volume_handler(self, msg_data: dict) -> dict:
        """
        Обработчик для интента установки громкости.
        Извлекает уровень громкости из текста команды.
        """
        original_text = msg_data.get("original_text", "").lower()
        
        import re
        numbers = re.findall(r'\b\d{1,3}\b', original_text)
        level = None
        for num_str in numbers:
            num = int(num_str)
            if 0 <= num <= 100:
                level = num
                break
        
        if level is None:
            return {
                "status": False,
                "result": {
                    "intent": msg_data.get("intent"),
                    "confidence": msg_data.get("confidence"),
                    "message": "Не удалось определить уровень громкости из команды."
                }
            }
        
        result = self.set_system_volume(level)
        
        if "result" in result:
            result["result"]["intent"] = msg_data.get("intent")
            result["result"]["confidence"] = msg_data.get("confidence")
            
        return result
