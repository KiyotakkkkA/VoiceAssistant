from interfaces import IToolService
from utils import AudioService
from enums.Events import EventsTopic
from mtypes.Global import ToolServiceResponse

try:
    from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume
    from comtypes import CLSCTX_ALL
    Pycaw_IMPORTED = True
except ImportError:
    Pycaw_IMPORTED = False

try:
    import screen_brightness_control as sbc
    BRIGHTNESS_IMPORTED = True
except ImportError:
    BRIGHTNESS_IMPORTED = False

class SystemManageService(IToolService):
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
        
        self.required_mode = 'NORMAL'
        
        self.services = {
            "audio": AudioService().getInstance(),
        }

        self.tokens = {
            "SET_VOLUME": self.set_volume_handler,
            "SET_BRIGHTNESS": self.set_brightness_handler,
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

    def set_system_volume(self, level: int) -> ToolServiceResponse:
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
                "message": "Модуль 'pycaw' не установлен. Управление громкостью недоступно.",
            }

        if not self._volume_controller:
            return {
                "status": False,
                "message": "Контроллер громкости не инициализирован.",
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
                "event": EventsTopic.UI_SHOW_SET_VOLUME.value,
                "message": f"Громкость системы установлена на {level}%",
                "additional": {
                    "level": level
                }
            }
        except Exception as e:
            return {
                "status": False,
                "message": f"Ошибка при установке громкости: {e}",
            }

    def set_system_brightness(self, level: int) -> ToolServiceResponse:
        """Устанавливает системную яркость (если поддерживается).

        Args:
            level (int): 0-100
        Returns:
            dict: аналогично set_system_volume
        """
        if not BRIGHTNESS_IMPORTED:
            return {
                "status": False,
                "message": "Модуль 'screen_brightness_control' не установлен. Управление яркостью недоступно.",
            }
        try:
            level = max(0, min(100, int(level)))
            sbc.set_brightness(level)

            self.services["audio"].play_sound("set_brightness_level")

            return {
                "status": True,
                "event": EventsTopic.UI_SHOW_SET_BRIGHTNESS.value,
                "message": f"Яркость системы установлена на {level}%",
                "additional": {
                    "level": level
                }
            }
        except Exception as e:
            return {
                "status": False,
                "message": f"Ошибка при установке яркости: {e}"
            }

    def execute(self, current_excecutor_state: str, msg_data: dict):
        intent = msg_data.get('intent')
        result = self.tokens[intent](msg_data) 
        
        return result

    def set_volume_handler(self, msg_data: dict) -> ToolServiceResponse:
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
                "message": "Не удалось определить уровень громкости из команды."
            }
            
        return self.set_system_volume(level)

    def set_brightness_handler(self, msg_data: dict) -> ToolServiceResponse:
        """Обработчик интента установки яркости (SET_BRIGHTNESS)."""
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
            lvl_field = msg_data.get("level")
            if isinstance(lvl_field, (int, float)) and 0 <= lvl_field <= 100:
                level = int(lvl_field)

        if level is None:
            return {
                "status": False,
                "message": "Не удалось определить уровень яркости из команды."
            }

        return self.set_system_brightness(level)
