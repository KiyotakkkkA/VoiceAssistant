import os
from src.processing_module.facades import ToolBuilder
from paths import path_resolver

class FileSystemTool:
    def __init__(self) -> None:
        self.commands = [
            self.setup_get_apps_tool(),
            self.setup_get_notes_tool(),
            self.setup_read_file_content_tool(),
            self.setup_write_file_content_tool()
        ]

        self.allowed_paths_to_write = [
            path_resolver['notes_path']
        ]
    
    def get_commands(self):
        return self.commands
    
    def is_path_allowed(self, file_path):
        abs_file_path = os.path.abspath(file_path)
        
        for allowed_path in self.allowed_paths_to_write:
            abs_allowed_path = os.path.abspath(allowed_path)
            
            if os.path.commonpath([abs_file_path, abs_allowed_path]) == abs_allowed_path:
                if os.path.isdir(abs_file_path):
                    return False
                return True
        
        return False

    def setup_read_file_content_tool(self):
        return {
            "name": "read_file_content_tool",
            "handler": self.read_file_content_handler,
            "tool": ToolBuilder().set_name("read_file_content_tool")
            .set_description('Tool that can read the content of a text file; Use it in case of getting file content')
            .add_property("file_path", "The path to the file to read")
            .add_requirements(["file_path"])
            .build()
        }
    
    def setup_write_file_content_tool(self):
        return {
            "name": "write_file_content_tool",
            "handler": self.write_file_content_handler,
            "tool": ToolBuilder().set_name("write_file_content_tool")
            .set_description('Tool that can write content to a text file; Use it in case of saving file content')
            .add_property("file_path", "The path to the file to write")
            .add_property("content", "The content to write to the file")
            .add_requirements(["file_path", "content"])
            .build()
        }

    def write_file_content_handler(self, **kwargs):
        file_path = kwargs.get("file_path")
        content = kwargs.get("content")
        
        if not file_path:
            return {"error": "file_path is required"}
        if content is None:
            return {"error": "content is required"}

        if not self.is_path_allowed(file_path):
            return {"error": f"Writing to path '{file_path}' is not allowed. Allowed paths: {self.allowed_paths_to_write}"}

        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(content)
            return {"success": True, "message": f"File written successfully to {file_path}"}
        except Exception as e:
            return {"error": str(e)}

    def read_file_content_handler(self, **kwargs):
        file_path = kwargs.get("file_path")
        if not file_path:
            return {"error": "file_path is required"}

        try:
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()
            return {"content": content}
        except Exception as e:
            return {"error": str(e)}

    def setup_get_notes_tool(self):
        return {
            "name": "get_notes_tool",
            "handler": self.get_notes_handler,
            "tool": ToolBuilder().set_name("get_notes_tool").set_description('Tool that can retrieve a list of user notes; Use it in case of getting user notes').build()
        }

    def get_notes_handler(self, **kwargs):

        notes_path = path_resolver['notes_path']

        result = []

        for root, dirs, files in os.walk(notes_path):
            for file in files:
                if file.endswith(".txt"):
                    relative_path = os.path.abspath(os.path.join(root, file))
                    result.append({
                        "note_name": os.path.splitext(file)[0],
                        "note_path": relative_path
                    })

        return result

    def setup_get_apps_tool(self):
        return {
            "name": "get_apps_tool",
            'handler': self.get_apps_handler,
            "tool": ToolBuilder().set_name("get_apps_tool").set_description('Tool that can retrieve a list of installed applications; Use it in case of getting installed application names').build()
        }

    def get_apps_handler(self, **kwargs):

        return """
            'Google',
            "Visual Studio Code",
            'Genshin Impact'
        """
