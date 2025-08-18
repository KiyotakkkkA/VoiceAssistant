from interfaces.IService import IService
from abc import abstractmethod
from typing import Callable, Dict
from mtypes.Global import ToolServiceResponse

class IToolService(IService):
    SERVICE_NAME: str = "IToolService@Base"

    def __init__(self):

        self.tokens: Dict[str, Callable[[dict], ToolServiceResponse]] = {} # Список токенов, которые может обработать инструмент

        self.required_mode: str | None = 'NORMAL' # Режим, требуемый для работы инструмента (None - для снятия ограничений)

    @abstractmethod
    def execute(self, **kwargs) -> ToolServiceResponse:
        pass
