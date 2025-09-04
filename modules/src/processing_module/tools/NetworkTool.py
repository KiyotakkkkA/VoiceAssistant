import socket
import psutil
from src.processing_module.facades import ToolBuilder
from interfaces import ITool


class NetworkTool(ITool):

    name = 'Network Tools Pack'

    @staticmethod
    def setup_get_network_info_tool():
        return {
            "name": "get_network_info_tool",
            "handler": NetworkTool.get_network_info_handler,
            "tool": ToolBuilder()
                .set_name("get_network_info_tool")
                .set_description("Tool that collects detailed network information (IP addresses, gateway, DNS, MAC, etc.)")
                .build()
        }

    @staticmethod
    def get_network_info_handler(**kwargs):
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

NetworkTool.commands = [
    NetworkTool.setup_get_network_info_tool(),
]