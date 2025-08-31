from src.processing_module.facades import ToolBuilder
from store.RuntimeCacheStore import RuntimeCacheStore
from interfaces import ITool

class UserInfoTool(ITool):

    name = 'User Information Tools Pack'

    @staticmethod
    def setup_get_user_info_tool():
        return {
            "name": "get_user_info_tool",
            'handler': UserInfoTool.get_user_info_handler,
            "tool": ToolBuilder().set_name("get_user_info_tool").set_description('Tool that can retrieve user information; Use it in case of getting details about a specific user').build()
        }

    @staticmethod
    def get_user_info_handler(**kwargs):
        cache = RuntimeCacheStore.get_cache('account_data', {})

        if not cache:
            return {"error": "No user information found"}

        sections = {
            'User Github Data': {
                'gh-link': {
                    'value': cache.get('gh-link', ''),
                    'description': 'Link to the user\'s GitHub profile'
                },
            }
        }

        return sections

UserInfoTool.commands = [
    UserInfoTool.setup_get_user_info_tool()
]
