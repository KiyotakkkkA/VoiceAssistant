import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional
from interfaces import ISingleton
from paths import path_resolver


class DatabaseService(ISingleton):
    _instance = None
    
    def __init__(self):
        if DatabaseService._instance is not None:
            raise Exception("DatabaseService уже существует. Используйте getInstance()")
        
        self.db_path: Optional[Path] = None
        self.connection: Optional[sqlite3.Connection] = None

        self.connection = sqlite3.connect(f"{path_resolver['database_path']}/apps.db", check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
    
    @classmethod
    def getInstance(cls) -> 'DatabaseService':
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    
    def get_all_apps(self) -> List[Dict[str, Any]]:
        try:
            if not self.connection:
                print("[DatabaseService] Нет соединения с базой данных")
                return []
                
            cursor = self.connection.cursor()
            
            query = """
                SELECT 
                    a.id,
                    a.name,
                    a.executable_path,
                    a.icon_path,
                    a.file_size,
                    a.file_type,
                    a.last_modified,
                    a.launch_count,
                    a.last_launched,
                    a.is_favorite,
                    a.created_at,
                    p.id as path_id,
                    p.path as folder_path,
                    p.name as folder_name
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE p.is_active = 1
                ORDER BY a.name
            """
            
            cursor.execute(query)
            rows = cursor.fetchall()
            
            apps = []
            for row in rows:
                app = {
                    'id': row['id'],
                    'name': row['name'],
                    'executable_path': row['executable_path'],
                    'icon_path': row['icon_path'],
                    'file_size': row['file_size'],
                    'file_type': row['file_type'],
                    'last_modified': row['last_modified'],
                    'launch_count': row['launch_count'],
                    'last_launched': row['last_launched'],
                    'is_favorite': bool(row['is_favorite']),
                    'created_at': row['created_at'],
                    'path_id': row['path_id'],
                    'folder_path': row['folder_path'],
                    'folder_name': row['folder_name']
                }
                apps.append(app)
            
            return apps
            
        except Exception as error:
            print(f"[DatabaseService] Ошибка получения приложений: {error}")
            return []
    
    def get_apps_by_name(self, name_filter: str) -> List[Dict[str, Any]]:
        try:
            if not self.connection:
                print("[DatabaseService] Нет соединения с базой данных")
                return []
                
            cursor = self.connection.cursor()
            
            query = """
                SELECT 
                    a.id,
                    a.name,
                    a.executable_path,
                    a.icon_path,
                    a.file_size,
                    a.file_type,
                    a.last_modified,
                    a.launch_count,
                    a.last_launched,
                    a.is_favorite,
                    a.created_at,
                    p.id as path_id,
                    p.path as folder_path,
                    p.name as folder_name
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE p.is_active = 1 AND a.name LIKE ?
                ORDER BY a.launch_count DESC, a.name
            """
            
            cursor.execute(query, (f'%{name_filter}%',))
            rows = cursor.fetchall()
            
            apps = []
            for row in rows:
                app = {
                    'id': row['id'],
                    'name': row['name'],
                    'executable_path': row['executable_path'],
                    'icon_path': row['icon_path'],
                    'file_size': row['file_size'],
                    'file_type': row['file_type'],
                    'last_modified': row['last_modified'],
                    'launch_count': row['launch_count'],
                    'last_launched': row['last_launched'],
                    'is_favorite': bool(row['is_favorite']),
                    'created_at': row['created_at'],
                    'path_id': row['path_id'],
                    'folder_path': row['folder_path'],
                    'folder_name': row['folder_name']
                }
                apps.append(app)
            
            return apps
            
        except Exception as error:
            print(f"[DatabaseService] Ошибка фильтрации приложений: {error}")
            return []
    
    def get_apps_by_path(self, path_id: int) -> List[Dict[str, Any]]:
        try:
            if not self.connection:
                print("[DatabaseService] Нет соединения с базой данных")
                return []
                
            cursor = self.connection.cursor()
            
            query = """
                SELECT 
                    a.id,
                    a.name,
                    a.executable_path,
                    a.icon_path,
                    a.file_size,
                    a.file_type,
                    a.last_modified,
                    a.launch_count,
                    a.last_launched,
                    a.is_favorite,
                    a.created_at,
                    p.id as path_id,
                    p.path as folder_path,
                    p.name as folder_name
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE p.is_active = 1 AND a.path_id = ?
                ORDER BY a.name
            """
            
            cursor.execute(query, (path_id,))
            rows = cursor.fetchall()
            
            apps = []
            for row in rows:
                app = {
                    'id': row['id'],
                    'name': row['name'],
                    'executable_path': row['executable_path'],
                    'icon_path': row['icon_path'],
                    'file_size': row['file_size'],
                    'file_type': row['file_type'],
                    'last_modified': row['last_modified'],
                    'launch_count': row['launch_count'],
                    'last_launched': row['last_launched'],
                    'is_favorite': bool(row['is_favorite']),
                    'created_at': row['created_at'],
                    'path_id': row['path_id'],
                    'folder_path': row['folder_path'],
                    'folder_name': row['folder_name']
                }
                apps.append(app)
            
            return apps
            
        except Exception as error:
            print(f"[DatabaseService] Ошибка получения приложений по пути: {error}")
            return []
    
    def get_favorite_apps(self) -> List[Dict[str, Any]]:
        try:
            if not self.connection:
                print("[DatabaseService] Нет соединения с базой данных")
                return []
                
            cursor = self.connection.cursor()
            
            query = """
                SELECT 
                    a.id,
                    a.name,
                    a.executable_path,
                    a.icon_path,
                    a.file_size,
                    a.file_type,
                    a.last_modified,
                    a.launch_count,
                    a.last_launched,
                    a.is_favorite,
                    a.created_at,
                    p.id as path_id,
                    p.path as folder_path,
                    p.name as folder_name
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE p.is_active = 1 AND a.is_favorite = 1
                ORDER BY a.launch_count DESC, a.name
            """
            
            cursor.execute(query)
            rows = cursor.fetchall()
            
            apps = []
            for row in rows:
                app = {
                    'id': row['id'],
                    'name': row['name'],
                    'executable_path': row['executable_path'],
                    'icon_path': row['icon_path'],
                    'file_size': row['file_size'],
                    'file_type': row['file_type'],
                    'last_modified': row['last_modified'],
                    'launch_count': row['launch_count'],
                    'last_launched': row['last_launched'],
                    'is_favorite': bool(row['is_favorite']),
                    'created_at': row['created_at'],
                    'path_id': row['path_id'],
                    'folder_path': row['folder_path'],
                    'folder_name': row['folder_name']
                }
                apps.append(app)
            
            return apps
            
        except Exception as error:
            print(f"[DatabaseService] Ошибка получения избранных приложений: {error}")
            return []
    
    def get_apps_stats(self) -> Dict[str, int]:
        try:
            if not self.connection:
                print("[DatabaseService] Нет соединения с базой данных")
                return {
                    'total_apps': 0,
                    'total_paths': 0,
                    'total_launches': 0
                }
                
            cursor = self.connection.cursor()
            
            cursor.execute("""
                SELECT COUNT(*) as total_apps
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE p.is_active = 1
            """)
            total_apps = cursor.fetchone()['total_apps']
            
            cursor.execute("SELECT COUNT(*) as total_paths FROM app_paths WHERE is_active = 1")
            total_paths = cursor.fetchone()['total_paths']
            
            cursor.execute("""
                SELECT COALESCE(SUM(launch_count), 0) as total_launches
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE p.is_active = 1
            """)
            total_launches = cursor.fetchone()['total_launches']
            
            return {
                'total_apps': total_apps,
                'total_paths': total_paths,
                'total_launches': total_launches
            }
            
        except Exception as error:
            print(f"[DatabaseService] Ошибка получения статистики: {error}")
            return {
                'total_apps': 0,
                'total_paths': 0,
                'total_launches': 0
            }
    
    def get_app_by_path(self, executable_path: str) -> Optional[Dict[str, Any]]:
        try:
            if not self.connection:
                print("[DatabaseService] Нет соединения с базой данных")
                return None
                
            cursor = self.connection.cursor()
            
            query = """
                SELECT 
                    a.id,
                    a.name,
                    a.executable_path,
                    a.icon_path,
                    a.file_size,
                    a.file_type,
                    a.last_modified,
                    a.launch_count,
                    a.last_launched,
                    a.is_favorite,
                    a.created_at,
                    p.id as path_id,
                    p.path as folder_path,
                    p.name as folder_name
                FROM apps a
                JOIN app_paths p ON a.path_id = p.id
                WHERE p.is_active = 1 AND a.executable_path = ?
            """
            
            cursor.execute(query, (executable_path,))
            row = cursor.fetchone()
            
            if row:
                return {
                    'id': row['id'],
                    'name': row['name'],
                    'executable_path': row['executable_path'],
                    'icon_path': row['icon_path'],
                    'file_size': row['file_size'],
                    'file_type': row['file_type'],
                    'last_modified': row['last_modified'],
                    'launch_count': row['launch_count'],
                    'last_launched': row['last_launched'],
                    'is_favorite': bool(row['is_favorite']),
                    'created_at': row['created_at'],
                    'path_id': row['path_id'],
                    'folder_path': row['folder_path'],
                    'folder_name': row['folder_name']
                }
            
            return None
            
        except Exception as error:
            print(f"[DatabaseService] Ошибка поиска приложения по пути: {error}")
            return None
    
    def close(self):
        if self.connection:
            self.connection.close()
            self.connection = None
            print("[DatabaseService] Соединение с базой данных закрыто")
