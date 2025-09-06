from abc import ABC, abstractmethod
from typing import Any, Dict, List, Generator, Optional


class IProvider(ABC):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self.client = None
        self._setup_client()
    
    @abstractmethod
    def _setup_client(self) -> None:
        pass
    
    @abstractmethod
    def chat_stream(self, messages: List[Dict[str, str]], tools: List[Any]) -> Generator[Any, None, None]:
        pass
    
    @abstractmethod
    def extract_thinking(self, part: Any) -> Optional[str]:
        pass
    
    @abstractmethod
    def extract_content(self, part: Any) -> Optional[str]:
        pass
    
    @abstractmethod
    def extract_tool_calls(self, part: Any) -> List[Dict[str, Any]]:
        pass
    
    @property
    def provider_name(self) -> str:
        return self.__class__.__name__.replace('Provider', '').lower()
    
    def is_available(self) -> bool:
        return self.client is not None and bool(self.api_key) and bool(self.model)
