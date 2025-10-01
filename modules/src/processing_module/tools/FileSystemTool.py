import os
from src.processing_module.facades import ToolBuilder
from interfaces import ITool
from paths import path_resolver
from utils import DatabaseService
from enums.Events import EventsType, EventsTopic

class FileSystemTool(ITool):

    name = 'FileSystem Tools Pack'

    allowed_paths_to_write = [
        path_resolver['notes_path']
    ]
    
    @staticmethod
    def is_path_allowed(file_path):
        abs_file_path = os.path.abspath(file_path)

        for allowed_path in FileSystemTool.allowed_paths_to_write:
            abs_allowed_path = os.path.abspath(allowed_path)
            
            if os.path.commonpath([abs_file_path, abs_allowed_path]) == abs_allowed_path:
                if os.path.isdir(abs_file_path):
                    return False
                return True
        
        return False

    @staticmethod
    def setup_read_file_content_tool():
        return {
            "name": "read_file_content_tool",
            "handler": FileSystemTool.read_file_content_handler,
            "tool": ToolBuilder().set_name("read_file_content_tool")
            .set_description('Tool that can read the content of a text file; Use it in case of getting file content')
            .add_property("file_path", "The path to the file to read")
            .add_requirements(["file_path"])
            .build()
        }

    @staticmethod
    def setup_write_file_content_tool():
        return {
            "name": "write_file_content_tool",
            "handler": FileSystemTool.write_file_content_handler,
            "tool": ToolBuilder().set_name("write_file_content_tool")
            .set_description('Tool that can write content to a text file; Use it in case of saving file content')
            .add_property("file_path", "The path to the file to write")
            .add_property("content", "The content to write to the file")
            .add_requirements(["file_path", "content"])
            .build()
        }

    @staticmethod
    def setup_move_file_tool():
        return {
            "name": "move_file_tool",
            "handler": FileSystemTool.move_file_handler,
            "tool": ToolBuilder().set_name("move_file_tool")
            .set_description('Tool that can move a file from one location to another; Use it when user asks to move, relocate or transfer a file')
            .add_property("source_path", "The current path of the file to move")
            .add_property("destination_path", "The destination path where the file should be moved")
            .add_requirements(["source_path", "destination_path"])
            .build()
        }

    @staticmethod
    def write_file_content_handler(**kwargs):
        file_path = kwargs.get("file_path")
        content = kwargs.get("content")
        
        if not file_path:
            return {"error": "file_path is required"}
        if content is None:
            return {"error": "content is required"}

        if not FileSystemTool.is_path_allowed(file_path):
            return {"error": f"Writing to path '{file_path}' is not allowed. Allowed paths: {FileSystemTool.allowed_paths_to_write}"}

        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(content)
            return {"success": True, "message": f"File written successfully to {file_path}"}
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def read_file_content_handler(**kwargs):
        file_path = kwargs.get("file_path")
        if not file_path:
            return {"error": "file_path is required"}

        try:
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()
            return {"content": content}
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def move_file_handler(**kwargs):
        source_path = kwargs.get("source_path")
        destination_path = kwargs.get("destination_path")
        
        if not source_path:
            return {"error": "source_path is required"}
        if not destination_path:
            return {"error": "destination_path is required"}

        if not FileSystemTool.is_path_allowed(source_path):
            return {"error": f"Moving from path '{source_path}' is not allowed. Allowed paths: {FileSystemTool.allowed_paths_to_write}"}
        
        if not FileSystemTool.is_path_allowed(destination_path):
            return {"error": f"Moving to path '{destination_path}' is not allowed. Allowed paths: {FileSystemTool.allowed_paths_to_write}"}

        if not os.path.exists(source_path):
            return {"error": f"Source file '{source_path}' does not exist"}

        try:
            os.makedirs(os.path.dirname(destination_path), exist_ok=True)
            
            import shutil
            shutil.move(source_path, destination_path)
            
            FileSystemTool.add_socket_message_to_queue(
                type=EventsType.EVENT.value,
                topic=EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA.value,
                data={}
            )
            
            return {"success": True, "message": f"File moved from {source_path} to {destination_path}"}
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def setup_get_notes_tool():
        return {
            "name": "get_notes_tool",
            "handler": FileSystemTool.get_notes_handler,
            "tool": ToolBuilder().set_name("get_notes_tool").set_description('Tool that can retrieve a list of user notes; Use it in case of getting user notes').build()
        }

    @staticmethod
    def get_notes_handler(**kwargs):

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

    @staticmethod
    def setup_get_apps_tool():
        return {
            "name": "get_apps_tool",
            'handler': FileSystemTool.get_apps_handler,
            "tool": ToolBuilder().set_name("get_apps_tool").set_description('Tool that can retrieve a list of installed applications from database; Use it in case of getting installed application names with their details').build()
        }

    @staticmethod
    def get_apps_handler(**kwargs):
        """Получить список всех приложений из базы данных"""
        try:
            db_service = DatabaseService.getInstance()
            apps = db_service.get_all_apps()
            
            if not apps:
                return {"message": "No applications found in database"}
            
            result = []
            for app in apps:
                result.append({
                    "name": app["name"],
                    "path": app["executable_path"], 
                    "launch_count": app["launch_count"],
                    "is_favorite": app["is_favorite"],
                    "folder": app["folder_name"]
                })
            
            return {
                "apps": result,
                "total_count": len(result)
            }
            
        except Exception as e:
            return {"error": f"Failed to retrieve apps: {str(e)}"}

    @staticmethod
    def setup_search_apps_tool():
        return {
            "name": "search_apps_tool",
            'handler': FileSystemTool.search_apps_handler,
            "tool": ToolBuilder().set_name("search_apps_tool")
            .set_description('Tool that can search for applications by name; Use it when user asks to find specific applications')
            .add_property("app_name", "Name or part of the application name to search for")
            .add_requirements(["app_name"])
            .build()
        }

    @staticmethod
    def search_apps_handler(**kwargs):
        """Поиск приложений по имени"""
        app_name = kwargs.get("app_name")
        if not app_name:
            return {"error": "app_name is required"}
            
        try:
            db_service = DatabaseService.getInstance()
            apps = db_service.get_apps_by_name(app_name)
            
            if not apps:
                return {"message": f"No applications found matching '{app_name}'"}
            
            result = []
            for app in apps:
                result.append({
                    "name": app["name"],
                    "path": app["executable_path"],
                    "launch_count": app["launch_count"],
                    "is_favorite": app["is_favorite"],
                    "folder": app["folder_name"]
                })
            
            return {
                "apps": result,
                "search_query": app_name,
                "found_count": len(result)
            }
            
        except Exception as e:
            return {"error": f"Failed to search apps: {str(e)}"}

    @staticmethod
    def setup_open_app_tool():
        return {
            "name": "open_app_tool",
            'handler': FileSystemTool.open_app_handler,
            "tool": ToolBuilder().set_name("open_app_tool")
            .set_description('Tool that can launch/open an application; Use it when user asks to open, launch, start or run an application')
            .add_property("app_name", "Name of the application to launch")
            .add_requirements(["app_name"])
            .build()
        }

    @staticmethod
    def open_app_handler(**kwargs):
        """Открыть приложение и отправить событие в главный процесс"""
        app_name = kwargs.get("app_name")
        if not app_name:
            return {"error": "app_name is required"}
            
        try:
            db_service = DatabaseService.getInstance()
            apps = db_service.get_apps_by_name(app_name)
            
            if not apps:
                return {"error": f"Application '{app_name}' not found in database"}
            
            app = apps[0]
            app_path = app["executable_path"]
            
            FileSystemTool.add_socket_message_to_queue(
                type=EventsType.SERVICE_ACTION.value,
                topic=EventsTopic.ACTION_APP_OPEN.value,
                data={
                    'key': app["name"],
                    'path': app_path
                }
            )
            
            return {
                "success": True,
                "message": f"Application '{app['name']}' launch request sent",
                "app_name": app["name"],
                "app_path": app_path
            }
            
        except Exception as e:
            return {"error": f"Failed to open app: {str(e)}"}

FileSystemTool.commands = [
    FileSystemTool.setup_get_apps_tool(),
    FileSystemTool.setup_search_apps_tool(),
    FileSystemTool.setup_open_app_tool(),
    FileSystemTool.setup_get_notes_tool(),
    FileSystemTool.setup_read_file_content_tool(),
    FileSystemTool.setup_write_file_content_tool(),
    FileSystemTool.setup_move_file_tool()
]
