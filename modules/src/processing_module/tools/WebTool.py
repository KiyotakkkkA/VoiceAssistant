import requests
from store.RuntimeCacheStore import RuntimeCacheStore
from src.processing_module.facades import ToolBuilder
from interfaces import ITool

class WebTool(ITool):

    name = 'Web Tools Pack'
    required_settings_fields = [
        'search-api-key'
    ]

    @staticmethod
    def setup_web_search_tool():
        return {
            "name": "web_search_tool",
            "handler": WebTool.web_search_handler,
            "tool": ToolBuilder()
                .set_name("web_search_tool")
                .set_description("Tool that performs a web search using SearchAPI.io (DuckDuckGo engine) and returns a list of result links with titles.")
                .add_property("query", "string")
                .add_requirements(['query'])
                .build()
        }

    @staticmethod
    def web_search_handler(query: str, **kwargs):
        try:
            url = f"https://www.searchapi.io/api/v1/search?api_key={RuntimeCacheStore.get_cache("account_data", {}).get("search-api-key", "")}" # type: ignore
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

WebTool.commands = [
    WebTool.setup_web_search_tool(),
]