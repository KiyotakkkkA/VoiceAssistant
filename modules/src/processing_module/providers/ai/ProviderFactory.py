from typing import Dict, Type, Optional, List
from interfaces import IProvider
from .OllamaProvider import OllamaProvider
from .OpenAIProvider import OpenAIProvider


class ProviderFactory:

    _providers: Dict[str, Type[IProvider]] = {
        'ollama': OllamaProvider,
        'router': OpenAIProvider
    }
    
    @classmethod
    def register_provider(cls, name: str, provider_class: Type[IProvider]) -> None:
        cls._providers[name] = provider_class
    
    @classmethod
    def get_provider(cls, name: str, api_key: str, model: str) -> Optional[IProvider]:
        provider_class = cls._providers.get(name)
        if not provider_class:
            raise ValueError(f"Provider '{name}' is not supported. Available: {list(cls._providers.keys())}")
        
        try:
            provider = provider_class(api_key, model)
            if not provider.is_available():
                print(f"Provider '{name}' is not available or not properly configured")
                return None
            return provider
        except Exception as e:
            print(f"Failed to create provider '{name}': {e}")
            return None
    
    @classmethod
    def get_available_providers(cls) -> List[str]:
        return list(cls._providers.keys())
    
    @classmethod
    def is_provider_supported(cls, name: str) -> bool:
        return name in cls._providers
