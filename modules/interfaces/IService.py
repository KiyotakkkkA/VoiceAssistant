from interfaces.ISingleton import ISingleton
from abc import abstractmethod
from typing import Dict, Any

class IService(ISingleton):
    SERVICE_NAME: str = "IService@Base"

    def __init__(self):

        self.services: Dict[str, 'IService'] | None = {} # Список сервисов, привязанных к инструменту

    @abstractmethod
    def execute(self, **args) -> Any:
        pass
