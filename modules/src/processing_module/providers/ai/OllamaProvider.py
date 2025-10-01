from typing import Any, Dict, List, Generator, Optional
from ollama import Client
from interfaces import IProvider


class OllamaProvider(IProvider):
    
    def _setup_client(self) -> None:
        try:
            self.client = Client(
                host="https://ollama.com",
                headers={'Authorization': self.api_key} if self.api_key else {}
            )
        except Exception as e:
            print(f"Failed to setup Ollama client: {e}")
            self.client = None
    
    def chat_stream(self, messages: List[Dict[str, str]], tools: List[Any]) -> Generator[Any, None, None]:
        if not self.client:
            raise ValueError("Ollama client is not initialized")
        
        try:
            for part in self.client.chat(
                model=self.model,
                tools=tools,
                stream=True,
                messages=messages
            ):
                yield part
        except Exception as e:
            print(f"[OllamaProvider] Stream error: {type(e).__name__}: {e}")
            raise
    
    def extract_thinking(self, part: Any) -> Optional[str]:
        try:
            return part.message.get('thinking') if hasattr(part, 'message') and part.message else None
        except Exception:
            return None
    
    def extract_content(self, part: Any) -> Optional[str]:
        try:
            return part.message.get('content') if hasattr(part, 'message') and part.message else None
        except Exception:
            return None
    
    def extract_tool_calls(self, part: Any) -> List[Dict[str, Any]]:
        try:
            if hasattr(part, 'message') and part.message and part.message.get('tool_calls'):
                return [
                    {
                        "name": tool['function'].name,
                        "args": tool['function'].arguments,
                    }
                    for tool in part.message['tool_calls']
                ]
            return []
        except Exception:
            return []
