import requests
from interfaces import ITool
from src.processing_module.facades import ToolBuilder
from typing import Dict
from store.RuntimeCacheStore import RuntimeCacheStore


class GitHubTool(ITool):
    
    name = 'GitHub API Tools Pack'

    _base_url: str = "https://api.github.com"
    _headers: Dict[str, str] = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'VoiceAssistant-GitHub-Tool'
    }

    @staticmethod
    def _make_request(method: str, endpoint: str, params: dict = {}) -> dict:
        url = f"{GitHubTool._base_url}{endpoint}"
        token = RuntimeCacheStore.get_cache("account_data", {}).get("gh-public-key", "") # type: ignore
        GitHubTool._headers['Authorization'] = f'token {token}'

        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=GitHubTool._headers, params=params)
            else:
                return {"error": f"Unsupported HTTP method: {method}"}
            
            if response.status_code in [200, 201]:
                return response.json() if response.content else {"success": True}
            else:
                return {
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "status_code": response.status_code
                }
                
        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}

    @staticmethod
    def setup_get_repo_info_tool():
        return {
            "name": "get_repo_info_tool",
            "handler": GitHubTool.get_repo_info_handler,
            "tool": ToolBuilder()
                .set_name("get_repo_info_tool")
                .set_description("Get detailed information about a GitHub repository")
                .add_property("username", "string", description="Username or organization name | For getting current user Github profile use 'get_user_info_tool'")
                .add_property("repo", "string", description="Repository name")
                .add_requirements(['username', 'repo'])
                .build()
        }

    @staticmethod
    def get_repo_info_handler(username: str, repo: str, **kwargs):
        result = GitHubTool._make_request('GET', f'/repos/{username}/{repo}') # type: ignore

        if 'error' in result:
            return result
            
        formatted_result = {
            "name": result.get('name'),
            "full_name": result.get('full_name'),
            "description": result.get('description'),
            "private": result.get('private'),
            "html_url": result.get('html_url'),
            "clone_url": result.get('clone_url'),
            "ssh_url": result.get('ssh_url'),
            "language": result.get('language'),
            "size": result.get('size'),
            "stargazers_count": result.get('stargazers_count'),
            "watchers_count": result.get('watchers_count'),
            "forks_count": result.get('forks_count'),
            "open_issues_count": result.get('open_issues_count'),
            "default_branch": result.get('default_branch'),
            "created_at": result.get('created_at'),
            "updated_at": result.get('updated_at'),
            "pushed_at": result.get('pushed_at'),
            "topics": result.get('topics', [])
        }
        
        return formatted_result

    @staticmethod
    def setup_list_repos_tool():
        return {
            "name": "get_list_repos_tool",
            "handler": GitHubTool.list_repos_handler,
            "tool": ToolBuilder()
                .set_name("get_list_repos_tool")
                .set_description("List repositories for a user or organization")
                .add_property("username", "string", description="Username or organization name | For getting current user Github profile use 'get_user_info_tool'")
                .add_property("type", "string", description="Repository type: 'all', 'owner', 'public', 'private', 'member' (default: 'all')")
                .add_property("sort", "string", description="Sort by: 'created', 'updated', 'pushed', 'full_name' (default: 'updated')")
                .add_property("per_page", "integer", description="Results per page (max 100, default: 30)")
                .add_requirements(['username'])
                .build()
        }

    @staticmethod
    def list_repos_handler(username: str, type: str = "all", sort: str = "updated", per_page: int = 30, **kwargs):
        params = {
            'type': type,
            'sort': sort,
            'per_page': min(per_page, 100)
        }

        result = GitHubTool._make_request('GET', f'/users/{username}/repos', params=params)

        if 'error' in result:
            return result
            
        repos = []
        for repo in result:
            repos.append({
                "name": repo.get('name'),
                "full_name": repo.get('full_name'),
                "description": repo.get('description'),
                "private": repo.get('private'),
                "html_url": repo.get('html_url'),
                "language": repo.get('language'),
                "stargazers_count": repo.get('stargazers_count'),
                "forks_count": repo.get('forks_count'),
                "updated_at": repo.get('updated_at')
            })
        
        return {
            "total_repos": len(repos),
            "repositories": repos
        }

GitHubTool.commands = [
    GitHubTool.setup_get_repo_info_tool(),
    GitHubTool.setup_list_repos_tool()
]