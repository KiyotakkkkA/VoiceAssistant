from src.processing_module.facades import ToolBuilder

class FileSystemTool:
    def __init__(self) -> None:
        self.commands = [
            self.setup_get_apps_tool()
        ]
    
    def get_commands(self):
        return self.commands

    def setup_get_apps_tool(self):
        return {
            "name": "get_apps_tool",
            'handler': self.get_apps_handler,
            "tool": ToolBuilder().set_name("get_apps_tool").set_description('Tool that can retrieve a list of installed applications; Use it in case of getting installed application names').build()
        }

    def get_apps_handler(self, **args):

        return """
            'Google',
            "Visual Studio Code",
            'Genshin Impact'
        """
