from src.processing_module.facades import ToolBuilder
from store.ModulesStore import ModulesStore

class ModuleManagementTool:
    def __init__(self) -> None:
        self.commands = [
            self.setup_get_modules_tool()
        ]
    
    def get_commands(self):
        return self.commands

    def setup_get_modules_tool(self):
        return {
            "name": "get_modules_tool",
            'handler': self.get_modules_handler,
            "tool": ToolBuilder().set_name("get_modules_tool").set_description('Tool that can retrieve a list of connected modules; Use it in case of getting external modules connected to your system').build()
        }

    def get_modules_handler(self, **kwargs):
        modules = ModulesStore.get_all_modules()
        return "\n".join([f"Модуль {module['module.name']}" for module in modules.values()])
