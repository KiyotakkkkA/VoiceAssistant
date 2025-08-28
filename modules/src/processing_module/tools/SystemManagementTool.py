from src.processing_module.facades import ToolBuilder
import platform
import psutil
import screen_brightness_control as sbc
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume


class SystemManagementTool:
    def __init__(self) -> None:
        self.commands = [
            self.setup_get_system_info_tool(),
            self.setup_set_system_volume_tool(),
            self.setup_set_system_brightness_tool(),
            self.setup_get_system_volume_tool(),
            self.setup_get_system_brightness_tool()
        ]
    
    def get_commands(self):
        return self.commands

    def setup_get_system_info_tool(self):
        return {
            "name": "get_system_info_tool",
            "handler": self.get_system_info_handler,
            "tool": ToolBuilder()
                .set_name("get_system_info_tool")
                .set_description("Tool that collects basic system information (OS, CPU, RAM, architecture, etc.)")
                .build()
        }

    def setup_set_system_volume_tool(self):
        return {
            "name": "set_system_volume_tool",
            "handler": self.set_system_volume_handler,
            "tool": ToolBuilder()
                .set_name("set_system_volume_tool")
                .set_description("Tool that sets the system volume (0-100)")
                .add_property("volume_level", "number")
                .add_requirements(['volume_level'])
                .build()
        }
    
    def setup_get_system_volume_tool(self):
        return {
            "name": "get_system_volume_tool",
            "handler": self.get_system_volume_handler,
            "tool": ToolBuilder()
                .set_name("get_system_volume_tool")
                .set_description("Tool that gets the current system volume")
                .build()
        }

    def setup_set_system_brightness_tool(self):
        return {
            "name": "set_system_brightness_tool",
            "handler": self.set_system_brightness_handler,
            "tool": ToolBuilder()
                .set_name("set_system_brightness_tool")
                .set_description("Tool that sets the system brightness (0-100)")
                .add_property("brightness_level", "number")
                .add_requirements(['brightness_level'])
                .build()
        }
    
    def setup_get_system_brightness_tool(self):
        return {
            "name": "get_system_brightness_tool",
            "handler": self.get_system_brightness_handler,
            "tool": ToolBuilder()
                .set_name("get_system_brightness_tool")
                .set_description("Tool that gets the current system brightness")
                .build()
        }

    def set_system_brightness_handler(self, brightness_level: int):
        try:
            sbc.set_brightness(brightness_level)
            return {"status": "success", "brightness_set": brightness_level}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_system_brightness_handler(self, **kwargs):
        try:
            brightness = sbc.get_brightness(display=0)
            return {"status": "success", "brightness": brightness[0] if isinstance(brightness, list) else brightness}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def set_system_volume_handler(self, volume_level: int):
        try:
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            volume = interface.QueryInterface(IAudioEndpointVolume)

            volume.SetMasterVolumeLevelScalar(volume_level / 100.0, None)
            return {"status": "success", "volume_set": volume_level}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_system_volume_handler(self, **kwargs):
        try:
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            volume = interface.QueryInterface(IAudioEndpointVolume)

            current_volume = volume.GetMasterVolumeLevelScalar()
            return {"status": "success", "volume": int(current_volume * 100)}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_system_info_handler(self, **kwargs):
        system_info = {}

        try:
            system_info["system"] = platform.system()
            system_info["release"] = platform.release()
            system_info["version"] = platform.version()
            system_info["architecture"] = platform.machine()
        except Exception as e:
            system_info["os_info"] = f"Error: {e}"

        try:
            system_info["cpu"] = {
                "processor": platform.processor(),
                "physical_cores": psutil.cpu_count(logical=False),
                "total_cores": psutil.cpu_count(logical=True),
                "frequency_mhz": psutil.cpu_freq().current if psutil.cpu_freq() else None,
                "usage_percent_per_core": psutil.cpu_percent(percpu=True),
                "total_usage_percent": psutil.cpu_percent()
            }
        except Exception as e:
            system_info["cpu"] = f"Error: {e}"

        try:
            virtual_mem = psutil.virtual_memory()
            system_info["ram"] = {
                "total_gb": round(virtual_mem.total / (1024 ** 3), 2),
                "available_gb": round(virtual_mem.available / (1024 ** 3), 2),
                "used_gb": round(virtual_mem.used / (1024 ** 3), 2),
                "percent": virtual_mem.percent
            }
        except Exception as e:
            system_info["ram"] = f"Error: {e}"

        try:
            disk = psutil.disk_usage('/')
            system_info["disk"] = {
                "total_gb": round(disk.total / (1024 ** 3), 2),
                "used_gb": round(disk.used / (1024 ** 3), 2),
                "free_gb": round(disk.free / (1024 ** 3), 2),
                "percent": disk.percent
            }
        except Exception as e:
            system_info["disk"] = f"Error: {e}"

        return system_info
