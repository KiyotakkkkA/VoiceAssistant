from src.processing_module.facades import ToolBuilder
from store.ToolsStore import ToolsStore
from interfaces import ITool
from enums.Events import EventsType, EventsTopic

class ToolManagementTool(ITool):

    name = 'Tool Management Tools Pack'

    @staticmethod
    def setup_get_tools_packs_tool():
        return {
            "name": "get_all_available_tool_packs_tool",
            'handler': ToolManagementTool.get_all_tools_packs_only_names_with_statuses,
            "tool": ToolBuilder().set_name("get_all_available_tool_packs_tool").set_description('Tool that can retrieve a list of available tools packs; Use it in case of getting external tools packs (like set of tools) connected to your system').build()
        }
    
    @staticmethod
    def setup_turn_off_tool_packs_tool():
        return {
            "name": "turn_off_tool_packs_tool",
            'handler': ToolManagementTool.turn_off_tool_packs,
            "tool": ToolBuilder().set_name("turn_off_tool_packs_tool").set_description('Tool that can turn off specified tool packs; Use it in case of disabling certain tool packs, before using them you must use "get_all_available_tool_packs_tool" to get the list of available tool packs')
            .add_property("tool_packs_names_list", "List[string]")
            .add_requirements(["tool_packs_names_list"])
            .build()
        }
    
    @staticmethod
    def setup_turn_on_tool_packs_tool():
        return {
            "name": "turn_on_tool_packs_tool",
            'handler': ToolManagementTool.turn_on_tool_packs,
            "tool": ToolBuilder().set_name("turn_on_tool_packs_tool").set_description('Tool that can turn on specified tool packs; Use it in case of enabling certain tool packs, before using them you must use "get_all_available_tool_packs_tool" to get the list of available tool packs')
            .add_property("tool_packs_names_list", "List[string]")
            .add_requirements(["tool_packs_names_list"])
            .build()
        }

    @staticmethod
    def get_all_tools_packs_only_names_with_statuses(**kwargs):
        tools = ToolsStore.get_all_tools_names_with_statuses()
        return {tool_name: {"enabled": enabled} for tool_name, enabled in tools.items()}
    
    @staticmethod
    def turn_off_tool_packs(tool_packs_names_list: list[str]) -> None:
        for tool_pack_name in tool_packs_names_list:
            ToolsStore.update_tool_status(tool_pack_name, False)
        tools_representations = ToolsStore.refetch_tools()

        ToolManagementTool.add_socket_message_to_queue(
            type=EventsType.EVENT.value,
            topic=EventsTopic.JSON_TOOLS_DATA_SET.value,
            data={
                'tools': tools_representations
            }
        )

    @staticmethod
    def turn_on_tool_packs(tool_packs_names_list: list[str]) -> None:
        for tool_pack_name in tool_packs_names_list:
            ToolsStore.update_tool_status(tool_pack_name, True)
        tools_representations = ToolsStore.refetch_tools()

        ToolManagementTool.add_socket_message_to_queue(
            type=EventsType.EVENT.value,
            topic=EventsTopic.JSON_TOOLS_DATA_SET.value,
            data={
                'tools': tools_representations
            }
        )

ToolManagementTool.commands = [
    ToolManagementTool.setup_get_tools_packs_tool(),
    ToolManagementTool.setup_turn_off_tool_packs_tool(),
    ToolManagementTool.setup_turn_on_tool_packs_tool()
]
