import os
import json
from ollama import Client
from interfaces import IService
from src.processing_module.tools import FileSystemTool

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
        self.client = None

        self.api_model = None

        self.tools = []
        self.tool_aliases = {}

        self.setup_tools()

    def setup_tools(self):
        self.tools_classes = [
            FileSystemTool
        ]

        for tool_class in self.tools_classes:
            tools_obj = tool_class().get_commands()
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
            model=self.api_model, # type: ignore
            tools=self.tools, # type: ignore
            stream=True,
            messages=messages
        )

    def execute(self, text: str): # type: ignore

        base_msg = [
            {
                "role": "assistant",
                "content": header + text
            }
        ]

        if not self.client or not self.api_model:
            raise ValueError("Client or API model is not set. Please set them before executing.")

        accumulated_response = {
            'thinking': '',
            'content': ''
        }

        final_accumulated_response = {
            'thinking': '',
            'content': ''
        }

        tool_calls_result = []
        messages = []
        messages.extend(base_msg)

        for part in self.create_completion(base_msg):
            if part.message.get('thinking'):
                accumulated_response['thinking'] += part.message['thinking']

            if part.message.get('content'):
                accumulated_response['content'] += part.message['content']

            if part.message.get('tool_calls'):
                for tool in part.message['tool_calls']:
                    call = {
                        "name": tool['function'].name,
                        "args": tool['function'].arguments,
                    }

                    if call['name'] in self.tool_aliases:
                        handler = self.tool_aliases[call['name']]
                        response = handler(**call['args']) if isinstance(call['args'], dict) else handler()

                        tool_calls_result.append({
                            "name": call['name'],
                            "args": tool['function'].arguments,
                            "response": response
                        })
            
        for tool_result_dict in tool_calls_result:
            tool_response_message = {
                "role": "assistant",
                "content": f"Result of {tool_result_dict['name']}: {tool_result_dict['response']}"
            }
            messages.append(tool_response_message)
        
        messages.append({
            "role": "user",
            "content": "Please, use these tool-calling results if they are needed here for an accurate and polite answer in Russian."
        })

        if len(tool_calls_result) == 0:
            return {
                "final_stage": accumulated_response,
            }
        
        for part in self.client.chat(
            model=self.api_model,
            messages=messages,
            stream=True
        ):
            if part.message.get('thinking'):
                final_accumulated_response['thinking'] += part.message['thinking']

            if part.message.get('content'):
                final_accumulated_response['content'] += part.message['content']

        return {
            "initial_stage": accumulated_response,
            "tools_calling_stage": tool_calls_result,
            "final_stage": final_accumulated_response
        }
