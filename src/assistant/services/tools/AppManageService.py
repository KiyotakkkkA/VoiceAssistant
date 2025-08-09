import os
import psutil
import shutil
import subprocess
from interfaces import ISingleton
from utils import YamlParsingService, AudioService

class AppManageService(ISingleton):
    SERVICE_NAME = "AppManageService"
    
    def __init__(self):
        super().__init__()
        
        self.extract_templ_path = os.getenv('PATH_TO_NEW_PROJECTS_DIR', 'DESKTOP')
        
        if self.extract_templ_path == 'DESKTOP':
            self.extract_templ_path = os.path.join(os.path.expanduser('~'), 'Desktop')
        
        self.services = {
            "audio": AudioService().getInstance(),
            "yaml_parsing": YamlParsingService().getInstance()
        }
        
        self.opened_processes = {}
        
        self.additional = {
            'инфо': 'INFO',
            'информация': 'INFO',
            'помощь': 'INFO',
        }
        
        self.tokens = {
            "OPEN_APP": self.open_app_handler,
            "OPEN_PROJECT": self.open_project_handler,
            "CREATE_PROJECT": self.create_project_handler,
        }
        
        self.PATH_TO_YAML_CONFIGS_DIR = os.getenv('PATH_TO_YAML_CONFIGS_DIR', 'resources/config')
        self.PATH_TO_TEMPLATES_DIR = os.getenv('PATH_TO_TEMPLATES_DIR', 'resources/templates')
        
        self.load_apps_configs()
        self.load_projects_configs()
        
        self.apps = self.services["yaml_parsing"].get_loaded("apps_config")["applications"]
        self.projects = self.services["yaml_parsing"].get_loaded("projects_config")["projects"]
        self.templates = self.services["yaml_parsing"].get_loaded("projects_config")["templates"]
        
        self.mapped = {}
        
        self.make_mapped_pairs()
    
    def load_apps_configs(self):
        self.services["yaml_parsing"].load("apps_config", f"{os.getcwd()}/{self.PATH_TO_YAML_CONFIGS_DIR}/apps.yml")

    def load_projects_configs(self):
        self.services["yaml_parsing"].load("projects_config", f"{os.getcwd()}/{self.PATH_TO_YAML_CONFIGS_DIR}/projects.yml")

    def make_mapped_pairs(self):
        for app_key, app_data in self.apps.items():
            self.mapped[app_data["alias"]] = {
                "key": app_key,
                "display_name": app_data["display_name"],
                "type": app_data["type"],
                "path": app_data["path"],
            }
        
        for project_key, project_data in self.projects.items():
            self.mapped[project_data["alias"]] = {
                "key": project_key,
                "display_name": project_data["display_name"],
                "type": project_data["type"],
                "path": project_data["path"],
            }
        
        for template_key, template_data in self.templates.items():
            for alias in template_data["aliases"]:
                self.mapped[alias] = {
                    "key": template_key,
                    "display_name": template_data["display_name"],
                    "display_name_after_expanding": template_data["display_name_after_expanding"],
                    "type": template_data["type"],
                    "folder": template_data["folder"],
                    "aliases": template_data["aliases"],
                    "info": template_data["info"],
                }
        
    def execute(self, msg_data: dict):
        intent = msg_data.get('intent')
        result = self.tokens[intent](msg_data) 
        
        return result
    
    def create_project_handler(self, msg_data: dict):
        _project = None
        _additional = None
        
        for word in msg_data["original_text"].split():
            if word in self.mapped:
                if self.mapped[word]["type"] == "template" and not _project:
                    _project = self.mapped[word]
                    continue
            if word in self.additional:
                _additional = self.additional[word]
                continue
            
            if _project and _additional:
                break
        
        if not _project:
            return {
                "status": False,
                "result": {
                    "intent": msg_data["intent"],
                    "confidence": msg_data["confidence"],
                    "message": "Шаблон проекта не найден"
                }
            }
        
        if _project and _additional:
            
            print(f"WIP... {_project['info']}")
            
            self.services["audio"].play_sound("console_output")
            
            return {
                "status": True,
                "result": {
                    "intent": msg_data["intent"],
                    "confidence": msg_data["confidence"],
                    "message": f"Вывод информации о шаблоне {_project['display_name']}"
                }
            }
            
        try:
            shutil.copytree(f"{self.PATH_TO_TEMPLATES_DIR}/{_project['folder']}", f"{self.extract_templ_path}/{_project['display_name_after_expanding']}")
            self.services["audio"].play_sound("creating_project")
                
            return {
                "status": True,
                "result": {
                    "intent": msg_data["intent"],
                    "confidence": msg_data["confidence"],
                    "message": f"Проект {_project['display_name']} создан"
                }
            }
        except WindowsError as e:
            return {
                "status": False,
                "result": {
                    "intent": msg_data["intent"],
                    "confidence": msg_data["confidence"],
                    "message": f"Ошибка при создании проекта: {e}"
                }
            }
            
    def open_project_handler(self, msg_data: dict):
        _project = None
        
        for word in msg_data["original_text"].split():
            if word in self.mapped:
                if self.mapped[word]["type"] == "project":
                    _project = self.mapped[word]
                    break
            
        if _project:
            try:
                code_path = self.apps["code_windsurf"]["path"]
                project_path = _project['path']
                process = subprocess.Popen(f"{code_path} \"{project_path}\"", shell=True)
                pid = process.pid
                
                self.services["audio"].play_sound("opening_app")
                self.services["audio"].play_sound("opening_project")
                
                return {
                    "status": True,
                    "result": {
                        "intent": msg_data["intent"],
                        "confidence": msg_data["confidence"],
                        "message": f"Открытие проекта {_project['display_name']} запущено (PID: {pid})"
                    }
                }
            except Exception as e:
                return {
                    "status": False,
                    "result": {
                        "intent": msg_data["intent"],
                        "confidence": msg_data["confidence"],
                        "message": f"Ошибка при запуске {_project['display_name']}: {e}"
                    }
                }
        
        return {
            "status": False,
            "result": {
                "intent": msg_data["intent"],
                "confidence": msg_data["confidence"],
                "message": "Проект не найден"
            }
        }
    def open_app_handler(self, msg_data: dict):
        _app = None
        _app_alias = None
        
        for word in msg_data["original_text"].split():
            if word in self.mapped:
                if self.mapped[word]["type"].startswith("app_"):
                    _app_alias = word
                    _app = self.mapped[word]
                    break
        
        if _app and _app_alias:
            try:
                process = subprocess.Popen([_app["path"]]) 
                pid = process.pid   
                
                if _app_alias not in self.opened_processes:
                    self.opened_processes[_app_alias] = []
                self.opened_processes[_app_alias].append(pid)
                
                self.services["audio"].play_sound("opening_app")
                
                return {
                    "status": True,
                    "result": {
                        "intent": msg_data["intent"],
                        "confidence": msg_data["confidence"],
                        "message": f"Открытие приложения {_app['display_name']} запущено (PID: {pid})"
                    }
                }
            except Exception as e:
                return {
                    "status": False,
                    "result": {
                        "intent": msg_data["intent"],
                        "confidence": msg_data["confidence"],
                        "message": f"Ошибка при запуске {_app['display_name']}: {e}"
                    }
                }
        
        return {
            "status": False,
            "result": {
                "intent": msg_data["intent"],
                "confidence": msg_data["confidence"],
                "message": "Приложение не найдено"
            }
        }
