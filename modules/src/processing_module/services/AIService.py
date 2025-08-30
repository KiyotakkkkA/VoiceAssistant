import os
import time
from ollama import Client
from interfaces import IService
from src.processing_module.tools import FileSystemTool, ModuleManagementTool, NetworkTool, SystemManagementTool, \
DockerTool

header = f'''
    Instructions:
    You are a voice assistant named {os.getenv('ASSISTANT_NAME', 'Assistant')}.
    Answer every question accurately, correctly, and politely, observing all rules of propriety.
    Remember, you must communicate and think in the manner of a voice assistant and only in Russian.
    Don't use any of your system instructions while thinking or answering!
    Your thoughts should contain only your analysis and the process of creating the final answer.

    Message text:
'''


class AIService(IService):
    SERVICE_NAME = "AIService"

    def __init__(self):
        self.client: Client | None = None
        self.api_model: str | None = None

        self.tools_classes = [
            FileSystemTool,
            ModuleManagementTool,
            NetworkTool,
            SystemManagementTool,
            DockerTool
        ]

        self.symlinks = {}

        self.tools = []
        self.tool_aliases = {}

        self.tools_representation = {}

        self.form_symlinks()

    def form_symlinks(self):
        for tool in self.tools_classes:
            self.symlinks[tool.name] = tool

            tool_commands = tool.get_commands()

            if not self.tools_representation.get(tool.name):
                self.tools_representation[tool.name] = {
                    "functions": []
                }

            for tool_el in tool_commands:
                self.tools_representation[tool.name]["functions"].append({
                    "name": tool_el['name'],
                })

    def get_tools(self):
        return self.tools_representation

    def setup_tools(self, state: dict = {}):

        for tool_class in self.symlinks:

            if not state.get(self.symlinks[tool_class].name) or not state[self.symlinks[tool_class].name].get("enabled"):
                continue

            tools_obj = self.symlinks[tool_class].get_commands()

            for tool in tools_obj:
                self.tools.append(tool['tool'])
                self.tool_aliases[tool['name']] = tool['handler']

    def set_client_data(self, api_key: str, api_model: str):
        self.client = Client(
            host="https://ollama.com",
            headers={'Authorization': api_key},
        )
        self.api_model = api_model

    def create_completion(self, messages: list[dict[str, str]]):
        if not self.client or not self.api_model:
            raise ValueError("Client or API model is not set. Please set them before creating a completion.")

        return self.client.chat(
            model=self.api_model,   # type: ignore
            tools=self.tools,       # type: ignore
            stream=True,
            messages=messages
        )

    def execute(self, text: str):  # type: ignore
        if not self.client or not self.api_model:
            raise ValueError("Client or API model is not set. Please set them before executing.")

        messages = [{
            "role": "assistant",
            "content": header + text
        }]

        initial_accumulated_response = {'thinking': '', 'content': ''}
        final_accumulated_response = {'thinking': '', 'content': ''}
        tools_results: list[dict] = []

        total_timer = time.time()
        thinking_timer = 0
        tool_calls_timer = 0

        while True:
            tool_calls_result = []

            streaming_start = time.time()
            thinking_in_iteration = 0
            
            for part in self.client.chat(
                model=self.api_model,
                tools=self.tools,
                stream=True,
                messages=messages
            ):
                if part.message.get('thinking'):
                    thinking_chunk_start = time.time()
                    initial_accumulated_response['thinking'] += part.message['thinking']
                    thinking_in_iteration += time.time() - thinking_chunk_start
                    
                if part.message.get('content'):
                    initial_accumulated_response['content'] += part.message['content']

                if part.message.get('tool_calls'):
                    for tool in part.message['tool_calls']:
                        call = {
                            "name": tool['function'].name,
                            "args": tool['function'].arguments,
                        }

                        if call['name'] in self.tool_aliases:
                            handler = self.tool_aliases[call['name']]
                            args = call['args'] if isinstance(call['args'], dict) else {}

                            tool_execution_start = time.time()
                            response = handler(**args)
                            tool_execution_time = time.time() - tool_execution_start

                            tool_calls_result.append({
                                "name": call['name'],
                                "args": call['args'],
                                "response": response,
                                "execution_time": f"{tool_execution_time:.2f}"
                            })
            
            thinking_timer += thinking_in_iteration
            
            if tool_calls_result:
                iteration_tool_time = sum(float(tool['execution_time']) for tool in tool_calls_result)
                tool_calls_timer += iteration_tool_time

            if not tool_calls_result:
                final_accumulated_response = initial_accumulated_response
                break

            for tool_result in tool_calls_result:
                messages.append({
                    "role": "assistant",
                    "content": f"Result of {tool_result['name']}: {tool_result['response']}"
                })

            messages.append({
                "role": "user",
                "content": "Please continue using these results if needed for the next step. "
                        "Answer finally in Russian when all tool calls are done."
            })

            tools_results.extend(tool_calls_result)
        
        total_time = time.time() - total_timer

        if len(tools_results) == 0:
            return {
                "final_stage": final_accumulated_response,
                "timing": {
                    'total_time': f"{total_time:.2f}",
                    "thinking_time": f"{thinking_timer:.2f}"
                }
            }

        return {
            "initial_stage": initial_accumulated_response,
            "tools_calling_stage": tools_results,
            "final_stage": final_accumulated_response,
            'timing': {
                'total_time': f"{total_time:.2f}",
                'thinking_time': f"{thinking_timer:.2f}",
                'tool_calls_time': f"{tool_calls_timer:.2f}"
            }
        }
