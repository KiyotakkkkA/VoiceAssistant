from src.processing_module.facades import ToolBuilder
from store.ModulesStore import ModulesStore
from interfaces import ITool

class ModuleManagementTool(ITool):

    name = 'Module Management Tools Pack'

    @staticmethod
    def setup_get_modules_tool():
        return {
            "name": "get_modules_tool",
            'handler': ModuleManagementTool.get_modules_handler,
            "tool": ToolBuilder().set_name("get_modules_tool").set_description('Tool that can retrieve a list of connected modules; Use it in case of getting external modules connected to your system').build()
        }

    @staticmethod
    def get_modules_handler(**kwargs):
        modules = ModulesStore.get_all_modules()
        return "\n".join([f"Модуль {module['module.name']}" for module in modules.values()])

ModuleManagementTool.commands = [
    ModuleManagementTool.setup_get_modules_tool()
]
