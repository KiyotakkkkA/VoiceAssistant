from typing import Any, Dict, List, Generator, Optional
from openai import OpenAI
from interfaces import IProvider


class OpenAIProvider(IProvider):

    def _setup_client(self) -> None:
        try:
            self.client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=self.api_key)
        except Exception as e:
            print(f"Failed to setup OpenAI client: {e}")
            self.client = None
    
    def chat_stream(self, messages: List[Dict[str, str]], tools: List[Any]) -> Generator[Any, None, None]:
        if not self.client:
            raise ValueError("OpenAI client is not initialized")
        
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,  # type: ignore
                stream=True
            )
            
            for chunk in stream:
                yield chunk
        except Exception as e:
            print(f"OpenAI chat stream error: {e}")
            return
    
    def extract_thinking(self, part: Any) -> Optional[str]:
        try:
            if hasattr(part, 'choices') and part.choices:
                delta = part.choices[0].delta
                return delta.reasoning if hasattr(delta, 'reasoning') else None
            return None
        except Exception:
            return None
    
    def extract_content(self, part: Any) -> Optional[str]:
        try:
            if hasattr(part, 'choices') and part.choices:
                delta = part.choices[0].delta
                return delta.content if hasattr(delta, 'content') else None
            return None
        except Exception:
            return None
    
    def extract_tool_calls(self, part: Any) -> List[Dict[str, Any]]:
        try:
            if hasattr(part, 'choices') and part.choices:
                delta = part.choices[0].delta
                if hasattr(delta, 'tool_calls') and delta.tool_calls:
                    return [
                        {
                            "name": tool_call.function.name,
                            "args": tool_call.function.arguments,
                        }
                        for tool_call in delta.tool_calls
                    ]
            return []
        except Exception:
            return []
