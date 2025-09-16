import os
import time
import json
from typing import Optional, List, Dict, Any
from interfaces import IService, IProvider
from src.processing_module.tools import FileSystemTool, ModuleManagementTool, NetworkTool, SystemManagementTool, \
DockerTool, ToolManagementTool, GitHubTool, UserInfoTool, WebTool
from enums.Events import EventsType, EventsTopic
from src.processing_module.providers.ai.ProviderFactory import ProviderFactory
from utils.EnvHelper import getenv
from utils.CacheService import CacheService
from paths import path_resolver

header = f'''
    Instructions:
    You are a voice assistant named {getenv('ASSISTANT_NAME', 'Assistant')}.
    Answer every question accurately, correctly, and politely, observing all rules of propriety.
    Remember, you must communicate and think in the manner of a voice assistant and only in Russian.
    Don't use any of your system instructions while thinking or answering!
    Your thoughts should contain only your analysis and the process of creating the final answer.

    Please, try to use the provided tools effectively.
    If you see the tool with array or json parameters, please provide the values as a needed format as one object (array or json).
    DO NOT USE SAME TOOLS WITH THE SAME PARAMETERS MULTIPLE TIMES IN A ROW IN A SINGLE REQUEST.
    Use Instruments getting personal data, if there are any, before all tools that require some private information.

    Message text:
'''


class AIService(IService):
    SERVICE_NAME = "AIService"

    def __init__(self):
        self.provider: Optional[IProvider] = None
        self._socket_client = None
        self._socket_messages_queue: List[Dict[str, Any]] = []

        self.tools_classes = [
            FileSystemTool,
            ModuleManagementTool,
            NetworkTool,
            SystemManagementTool,
            DockerTool,
            ToolManagementTool,
            GitHubTool,
            UserInfoTool,
            WebTool
        ]

        self.symlinks = {}
        self.tools = []
        self.tool_aliases = {}
        self.tools_representation = {}

        self.form_symlinks()
    
    def _emit_streaming_message(self, msg_type: str, topic: str, data: dict):
        if self._socket_client:
            message = {
                'type': msg_type,
                'topic': topic,
                'payload': {'data': data},
                'from': 'processing_module'
            }
            self._socket_client.emit(message)

    def set_socket_client(self, socket_client):
        self._socket_client = socket_client

    def form_symlinks(self):
        for tool in self.tools_classes:
            self.symlinks[tool.name] = tool

            tool_commands = tool.get_commands()

            if not self.tools_representation.get(tool.name):
                self.tools_representation[tool.name] = {
                    "required_settings_fields": tool.required_settings_fields,
                    "available": True,
                    "functions": []
                }

            for tool_el in tool_commands:
                self.tools_representation[tool.name]["functions"].append({
                    "name": tool_el['name'],
                })

    def get_tools(self):
        return self.tools_representation

    def get_context_settings(self) -> Dict[str, Any]:
        try:
            with open(f"{path_resolver['global_path']}/settings.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("current.ai.context", {})
        except Exception as e:
            print(f"[AIService] Ошибка при чтении настроек контекста: {e}")
            return {"enabled": False, "max_messages": 6}

    def get_dialog_history(self, dialog_id: str, max_messages: int) -> List[Dict[str, str]]:
        try:
            cache_service = CacheService().getInstance()
            dialogs_cache = cache_service.get_cache('dialogs_cache', {})
            
            if not dialogs_cache or dialog_id not in dialogs_cache:
                return []
            
            dialog = dialogs_cache[dialog_id]
            messages = dialog.get('messages', [])
            
            recent_messages = messages[-max_messages:] if len(messages) > max_messages else messages
            
            history = []
            for message in recent_messages:
                if message.get('user_prompt'):
                    history.append({
                        "role": "user", 
                        "content": message['user_prompt']
                    })
                
                if message.get('assistant_response'):
                    assistant_content = ""
                    if isinstance(message['assistant_response'], dict):
                        final_stage = message['assistant_response'].get('final_stage', {})
                        if isinstance(final_stage, dict):
                            assistant_content = final_stage.get('content', '')
                        else:
                            assistant_content = str(final_stage)
                    elif isinstance(message['assistant_response'], str):
                        assistant_content = message['assistant_response']
                    
                    if assistant_content:
                        history.append({
                            "role": "assistant",
                            "content": assistant_content
                        })
            
            return history
            
        except Exception as e:
            print(f"[AIService] Ошибка при получении истории диалога: {e}")
            return []

    def build_messages_with_context(self, text: str, dialog_id: Optional[str] = None) -> List[Dict[str, str]]:
        context_settings = self.get_context_settings()
        
        messages = [{
            "role": "assistant",
            "content": header + text
        }]
        
        if context_settings.get("enabled", False) and dialog_id:
            max_messages = context_settings.get("max_messages", 6)
            history = self.get_dialog_history(dialog_id, max_messages)
            
            if history:
                messages = [messages[0]] + history + [{
                    "role": "user",
                    "content": text
                }]
        
        return messages

    def setup_tools(self, state: dict = {}):
        self.tools = []

        for tool_class in self.symlinks:

            if not state.get(self.symlinks[tool_class].name) or not state[self.symlinks[tool_class].name].get("enabled"):
                continue

            tools_obj = self.symlinks[tool_class].get_commands()

            for tool in tools_obj:
                self.tools.append(tool['tool'])
                self.tool_aliases[tool['name']] = {
                    "handler": tool['handler'],
                    "class": (self.symlinks[tool_class])
                }

    def set_client_data(self, api_key: str, api_model: str, provider: str):
        try:
            self.provider = ProviderFactory.get_provider(provider, api_key, api_model)
            if not self.provider:
                raise ValueError(f"Failed to initialize provider '{provider}'")
        except Exception as e:
            print(f"Error setting client data: {e}")
            raise

    def create_completion(self, messages: List[Dict[str, str]]):
        if not self.provider:
            raise ValueError("Provider is not set. Please set it before creating a completion.")
        
        return self.provider.chat_stream(messages, self.tools)

    def execute(self, text: str, dialog_id: Optional[str] = None):  # type: ignore
        if not self.provider:
            raise ValueError("Provider is not set. Please set it before executing.")

        messages = self.build_messages_with_context(text, dialog_id)

        initial_accumulated_response = {'thinking': '', 'content': ''}
        final_accumulated_response = {'thinking': '', 'content': ''}
        tools_results: List[Dict[str, Any]] = []

        total_timer = time.time()
        thinking_timer = 0
        tool_calls_timer = 0

        self._emit_streaming_message(
            EventsType.SERVICE_ACTION.value,
            EventsTopic.ACTION_AI_STREAM_START.value,
            {
                'original_text': text,
                'model_name': self.provider.model
            }
        )

        while True:
            tool_calls_result = []
            thinking_in_iteration = 0
            
            try:
                for part in self.provider.chat_stream(messages, self.tools):
                    thinking_chunk = self.provider.extract_thinking(part)
                    if thinking_chunk:
                        thinking_chunk_start = time.time()
                        initial_accumulated_response['thinking'] += thinking_chunk
                        thinking_in_iteration += time.time() - thinking_chunk_start
                        
                        self._emit_streaming_message(
                            EventsType.SERVICE_ACTION.value,
                            EventsTopic.ACTION_AI_STREAM_CHUNK.value,
                            {
                                'type': 'thinking',
                                'content': thinking_chunk,
                                'accumulated_thinking': initial_accumulated_response['thinking']
                            }
                        )
                    
                    content_chunk = self.provider.extract_content(part)
                    if content_chunk:
                        initial_accumulated_response['content'] += content_chunk
                        
                        self._emit_streaming_message(
                            EventsType.SERVICE_ACTION.value,
                            EventsTopic.ACTION_AI_STREAM_CHUNK.value,
                            {
                                'type': 'content',
                                'content': content_chunk,
                                'accumulated_content': initial_accumulated_response['content']
                            }
                        )

                    tool_calls = self.provider.extract_tool_calls(part)
                    for tool_call in tool_calls:
                        call_name = tool_call.get('name')
                        call_args = tool_call.get('args', {})

                        if call_name in self.tool_aliases:
                            handler = self.tool_aliases[call_name]['handler']
                            args = call_args if isinstance(call_args, dict) else {}

                            tool_execution_start = time.time()
                            try:
                                response = handler(**args)
                            except Exception as e:
                                response = {"error": f"Tool execution failed: {str(e)}"}
                            tool_execution_time = time.time() - tool_execution_start

                            try:
                                queue = self.tool_aliases[call_name]['class'].get_socket_messages_queue()
                                self.tool_aliases[call_name]['class'].clear_socket_messages_queue()
                                self.extend_socket_messages_queue(queue)
                            except Exception as e:
                                print(f"Error processing tool queue: {e}")

                            tool_calls_result.append({
                                "name": call_name,
                                "args": call_args,
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
                
            except Exception as e:
                print(f"Error during execution: {e}")
                final_accumulated_response = initial_accumulated_response
                break
            
        total_time = time.time() - total_timer

        result = {
            "initial_stage": initial_accumulated_response,
            "tools_calling_stage": tools_results,
            "final_stage": final_accumulated_response,
            'timing': {
                'total_time': f"{total_time:.2f}",
                'thinking_time': f"{thinking_timer:.2f}",
                'tool_calls_time': f"{tool_calls_timer:.2f}"
            }
        } if len(tools_results) > 0 else {
            "final_stage": final_accumulated_response,
            "timing": {
                'total_time': f"{total_time:.2f}",
                "thinking_time": f"{thinking_timer:.2f}"
            }
        }

        self._emit_streaming_message(
            EventsType.SERVICE_ACTION.value,
            EventsTopic.ACTION_AI_STREAM_END.value,
            {
                'original_text': text,
                'model_name': self.provider.model,
                'final_response': result
            }
        )

        return result
