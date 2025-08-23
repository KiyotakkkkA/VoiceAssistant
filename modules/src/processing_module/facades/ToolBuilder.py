from typing import Dict, Any


class ToolBuilder:
    def __init__(self):
        self.tool = {
            "type": "function",
            "function": {
                "name": "",
                "description": "",
                "parameters": {
                    "type": "object",
                    "properties": {}
                },
                "required": []
            }
        }

    def set_name(self, name: str) -> 'ToolBuilder':
        self.tool["function"]["name"] = name
        return self

    def set_description(self, description: str) -> 'ToolBuilder':
        self.tool["function"]["description"] = description
        return self

    def add_property(self, name: str, prop_type: str, **kwargs) -> 'ToolBuilder':
        props = self.tool["function"]["parameters"]["properties"]
        props[name] = {"type": prop_type, **kwargs}
        return self

    def add_requirements(self, reqs: list[str]) -> 'ToolBuilder':
        self.tool["function"]["required"].extend(reqs)
        return self

    def build(self) -> Dict[str, Any]:
        return self.tool