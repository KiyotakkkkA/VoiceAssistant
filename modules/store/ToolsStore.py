import json
from interfaces import ISingleton, IService
from paths import path_resolver
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.processing_module.services import AIService

class ToolsStore(ISingleton):

    _ai_service: "AIService"
    _available_tools: dict[str, dict] = {}

    _tools_names_with_statuses: dict[str, bool] = {}

    @staticmethod
    def get_all_tools_names_with_statuses() -> dict[str, bool]:
        return ToolsStore._tools_names_with_statuses

    @staticmethod
    def update_tool_status(tool_name: str, status: bool) -> None:
        settings_path = f"{path_resolver['global_path']}/settings.json"
        
        with open(settings_path, 'r+') as f:
            settings = json.load(f)
            if tool_name in settings['current.ai.tools']:
                settings['current.ai.tools'][tool_name]['enabled'] = status
                f.seek(0)
                json.dump(settings, f, indent=4, ensure_ascii=False)
                f.truncate()

    @staticmethod
    def init_available_tools(ai_service: "AIService") -> None:
        ToolsStore._ai_service = ai_service
        ToolsStore._available_tools = ai_service.get_tools()

    @staticmethod
    def refetch_tools():
        ToolsStore._tools_names_with_statuses = {}
        tools_representations = {}
        settings_path = f"{path_resolver['global_path']}/settings.json"
        
        with open(settings_path, 'r+') as f:
            settings = json.load(f)
            tools = settings['current.ai.tools']
            tools_start_len = len(tools)

            for tool_name, tool_info in ToolsStore._available_tools.items():
                element_exists = tool_name in tools
                enabled_status = tools[tool_name]['enabled'] if element_exists else True

                ToolsStore._tools_names_with_statuses[tool_name] = enabled_status

                tools_representations[tool_name] = {
                    'enabled': enabled_status,
                    'available': tool_info['available'],
                    'required_settings_fields': tool_info['required_settings_fields'],
                    'functions': tool_info['functions']
                }
                
                tools[tool_name] = {
                    'enabled': enabled_status,
                }
            
            tools_end_len = len(tools)
            
            if tools_start_len != tools_end_len:
                settings['current.ai.tools'] = tools
                f.seek(0)
                json.dump(settings, f, indent=4, ensure_ascii=False)
                f.truncate()

        ToolsStore._ai_service.setup_tools(state=tools)

        return tools_representations