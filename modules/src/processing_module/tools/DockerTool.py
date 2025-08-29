from src.processing_module.facades import ToolBuilder
import docker
from docker.errors import DockerException, APIError, NotFound
import json


class DockerTool:

    name = 'Docker Tools Pack'

    def __init__(self) -> None:
        try:
            self.client = docker.from_env()
            self.client.ping()
        except DockerException as e:
            print(f"Docker connection error: {e}")
            self.client = None
            
        self.commands = [
            self.setup_get_all_images_tool(),
            self.setup_get_all_containers_tool(),
            self.setup_run_container_tool(),
            self.setup_start_container_tool(),
            self.setup_stop_container_tool(),
        ]
    
    def get_commands(self):
        return self.commands

    def setup_get_all_images_tool(self):
        return {
            "name": "get_all_images_tool",
            "handler": self.get_all_images_handler,
            "tool": ToolBuilder()
                .set_name("get_all_images_tool")
                .set_description("Tool that retrieves information about all Docker images on the system")
                .build()
        }

    def get_all_images_handler(self, **kwargs):
        if not self.client:
            return {"error": "Docker client not available"}
        
        try:
            images = self.client.images.list(all=True)
            images_info = []
            
            for image in images:
                image_data = {
                    "id": image.id,
                    "short_id": image.short_id,
                    "tags": image.tags,
                    "size": image.attrs.get('Size', 0),
                    "created": image.attrs.get('Created', ''),
                    "architecture": image.attrs.get('Architecture', ''),
                    "os": image.attrs.get('Os', ''),
                    "parent": image.attrs.get('Parent', ''),
                    "repo_digests": image.attrs.get('RepoDigests', []),
                    "config": {
                        "env": image.attrs.get('Config', {}).get('Env', []),
                        "cmd": image.attrs.get('Config', {}).get('Cmd', []),
                        "exposed_ports": list(image.attrs.get('Config', {}).get('ExposedPorts', {}).keys()) if image.attrs.get('Config', {}).get('ExposedPorts') else []
                    }
                }
                images_info.append(image_data)
            
            return {
                "total_images": len(images_info),
                "images": images_info
            }
            
        except APIError as e:
            return {"error": f"Docker API error: {e}"}
        except Exception as e:
            return {"error": f"Unexpected error: {e}"}

    def setup_get_all_containers_tool(self):
        return {
            "name": "get_all_containers_tool",
            "handler": self.get_all_containers_handler,
            "tool": ToolBuilder()
                .set_name("get_all_containers_tool")
                .set_description("Tool that retrieves information about all Docker containers (running and stopped)")
                .add_property("show_all", "boolean", description="Show all containers including stopped ones (default: true)")
                .build()
        }

    def get_all_containers_handler(self, show_all: bool = True, **kwargs):
        if not self.client:
            return {"error": "Docker client not available"}
        
        try:
            containers = self.client.containers.list(all=show_all)
            containers_info = []
            
            for container in containers:
                container_data = {
                    "id": container.id,
                    "short_id": container.short_id,
                    "name": container.name,
                    "status": container.status,
                    "image": {
                        "id": container.image.id,
                        "tags": container.image.tags
                    },
                    "created": container.attrs.get('Created', ''),
                    "state": container.attrs.get('State', {}),
                    "ports": container.ports,
                    "mounts": [
                        {
                            "source": mount.get('Source', ''),
                            "destination": mount.get('Destination', ''),
                            "type": mount.get('Type', ''),
                            "mode": mount.get('Mode', '')
                        }
                        for mount in container.attrs.get('Mounts', [])
                    ],
                    "network_settings": {
                        "networks": list(container.attrs.get('NetworkSettings', {}).get('Networks', {}).keys()),
                        "ip_address": container.attrs.get('NetworkSettings', {}).get('IPAddress', ''),
                        "ports": container.attrs.get('NetworkSettings', {}).get('Ports', {})
                    },
                    "labels": container.labels,
                    "command": container.attrs.get('Config', {}).get('Cmd', []),
                    "env": container.attrs.get('Config', {}).get('Env', [])
                }
                containers_info.append(container_data)
            
            running_count = len([c for c in containers_info if c['status'] == 'running'])
            
            return {
                "total_containers": len(containers_info),
                "running_containers": running_count,
                "stopped_containers": len(containers_info) - running_count,
                "containers": containers_info
            }
            
        except APIError as e:
            return {"error": f"Docker API error: {e}"}
        except Exception as e:
            return {"error": f"Unexpected error: {e}"}

    def setup_run_container_tool(self):
        return {
            "name": "run_container_tool",
            "handler": self.run_container_handler,
            "tool": ToolBuilder()
                .set_name("run_container_tool")
                .set_description("Tool that runs a Docker container from an image")
                .add_property("image", "string", description="Docker image name or ID to run")
                .add_property("name", "string", description="Optional container name")
                .add_property("command", "string", description="Optional command to run in container")
                .add_property("ports", "object", description="Port mappings (e.g., {'80/tcp': 8080})")
                .add_property("environment", "object", description="Environment variables as key-value pairs")
                .add_property("volumes", "object", description="Volume mappings (e.g., {'/host/path': {'bind': '/container/path', 'mode': 'rw'}})")
                .add_property("detach", "boolean", description="Run container in background (default: true)")
                .add_property("remove", "boolean", description="Automatically remove container when it exits (default: false)")
                .add_property("network", "string", description="Network to connect the container to")
                .add_requirements(['image'])
                .build()
        }

    def run_container_handler(self, image: str, name: str | None = None, command: str | None = None, 
                            ports: dict | None = None, environment: dict | None = None, volumes: dict | None = None,
                            detach: bool = True, remove: bool = False, network: str | None = None, **kwargs):
        if not self.client:
            return {"error": "Docker client not available"}
        
        try:
            run_kwargs = {
                'image': image,
                'detach': detach,
                'remove': remove
            }
            
            if name:
                run_kwargs['name'] = name
            if command:
                run_kwargs['command'] = command
            if ports:
                run_kwargs['ports'] = ports
            if environment:
                run_kwargs['environment'] = environment
            if volumes:
                run_kwargs['volumes'] = volumes
            if network:
                run_kwargs['network'] = network
            
            container = self.client.containers.run(**run_kwargs)
            
            container.reload()
            
            result = {
                "success": True,
                "container_id": container.id,
                "container_short_id": container.short_id,
                "container_name": container.name,
                "status": container.status,
                "image": image
            }
            
            if detach:
                result.update({
                    "ports": container.ports,
                    "network_settings": {
                        "ip_address": container.attrs.get('NetworkSettings', {}).get('IPAddress', ''),
                        "networks": list(container.attrs.get('NetworkSettings', {}).get('Networks', {}).keys())
                    }
                })
            else:
                result["logs"] = container.logs().decode('utf-8')
            
            return result
            
        except NotFound as e:
            return {"error": f"Image not found: {e}"}
        except APIError as e:
            return {"error": f"Docker API error: {e}"}
        except Exception as e:
            return {"error": f"Unexpected error: {e}"}
    
    def setup_start_container_tool(self):
        return {
            "name": "start_container_tool",
            "handler": self.start_container_handler,
            "tool": ToolBuilder()
                .set_name("start_container_tool")
                .set_description("Tool that starts a stopped Docker container")
                .add_property("container_id", "string", description="Container ID or name to start")
                .add_requirements(['container_id'])
                .build()
        }

    def start_container_handler(self, container_id: str, **kwargs):
        if not self.client:
            return {"error": "Docker client not available"}
        
        try:
            container = self.client.containers.get(container_id)
            container.start()
            
            container.reload()
            
            return {
                "success": True,
                "message": f"Container {container_id} started successfully",
                "container_id": container.id,
                "container_name": container.name,
                "status": container.status
            }
            
        except NotFound:
            return {"error": f"Container {container_id} not found"}
        except APIError as e:
            return {"error": f"Docker API error: {e}"}
        except Exception as e:
            return {"error": f"Unexpected error: {e}"}

    def setup_stop_container_tool(self):
        return {
            "name": "stop_container_tool",
            "handler": self.stop_container_handler,
            "tool": ToolBuilder()
                .set_name("stop_container_tool")
                .set_description("Tool that stops a running Docker container")
                .add_property("container_id", "string", description="Container ID or name to stop")
                .add_property("timeout", "integer", description="Seconds to wait for stop before killing (default: 10)")
                .add_requirements(['container_id'])
                .build()
        }

    def stop_container_handler(self, container_id: str, timeout: int = 10, **kwargs):
        if not self.client:
            return {"error": "Docker client not available"}
        
        try:
            container = self.client.containers.get(container_id)
            container.stop(timeout=timeout)
            
            container.reload()
            
            return {
                "success": True,
                "message": f"Container {container_id} stopped successfully",
                "container_id": container.id,
                "container_name": container.name,
                "status": container.status
            }
            
        except NotFound:
            return {"error": f"Container {container_id} not found"}
        except APIError as e:
            return {"error": f"Docker API error: {e}"}
        except Exception as e:
            return {"error": f"Unexpected error: {e}"}