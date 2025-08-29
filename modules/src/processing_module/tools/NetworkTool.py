from src.processing_module.facades import ToolBuilder
import socket
import psutil
import requests


class NetworkTool:

    name = 'Networking Tools Pack'

    def __init__(self) -> None:

        self.commands = [
            self.setup_get_network_info_tool(),
            self.setup_web_search_tool(),
        ]
    
    def get_commands(self):
        return self.commands

    def setup_get_network_info_tool(self):
        return {
            "name": "get_network_info_tool",
            "handler": self.get_network_info_handler,
            "tool": ToolBuilder()
                .set_name("get_network_info_tool")
                .set_description("Tool that collects detailed network information (IP addresses, gateway, DNS, MAC, etc.)")
                .build()
        }

    def get_network_info_handler(self, **kwargs):
        network_info = {}

        try:
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            network_info["hostname"] = hostname
            network_info["local_ip"] = local_ip
        except Exception as e:
            network_info["hostname"] = f"Error: {e}"
            network_info["local_ip"] = None

        try:
            addrs = psutil.net_if_addrs()
            interfaces = {}
            for iface_name, iface_addrs in addrs.items():
                iface_details = []
                for addr in iface_addrs:
                    iface_details.append({
                        "family": str(addr.family),
                        "address": addr.address,
                        "netmask": addr.netmask,
                        "broadcast": addr.broadcast
                    })
                interfaces[iface_name] = iface_details
            network_info["interfaces"] = interfaces
        except Exception as e:
            network_info["interfaces"] = f"Error: {e}"

        try:
            connections = psutil.net_connections(kind="inet")
            conn_list = []
            for conn in connections:
                conn_list.append({
                    "fd": conn.fd,
                    "family": str(conn.family),
                    "type": str(conn.type),
                    "laddr": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else None,
                    "raddr": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else None,
                    "status": conn.status
                })
            network_info["connections"] = conn_list
        except Exception as e:
            network_info["connections"] = f"Error: {e}"

        return network_info

    def setup_web_search_tool(self):
        return {
            "name": "web_search_tool",
            "handler": self.web_search_handler,
            "tool": ToolBuilder()
                .set_name("web_search_tool")
                .set_description("Tool that performs a web search using SearchAPI.io (DuckDuckGo engine) and returns a list of result links with titles.")
                .add_property("query", "string")
                .add_requirements(['query'])
                .build()
        }

    def web_search_handler(self, query: str, **kwargs):
        try:
            url = "https://www.searchapi.io/api/v1/search?api_key=N1wZ2qhY33qz1MGS9JNUbrmg"
            params = {
                "engine": "duckduckgo",
                "q": query,
            }
            response = requests.get(url, params=params, headers={"User-Agent": "Mozilla/5.0"})
            data = response.json()

            results = []
            if "organic_results" in data:
                for item in data["organic_results"]:
                    results.append({
                        "title": item.get("title"),
                        "link": item.get("link"),
                        "snippet": item.get("snippet")
                    })

            return results[:4] if results else "No results found"
        except Exception as e:
            return {"error": str(e)}