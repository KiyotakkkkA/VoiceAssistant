import os
from openai import OpenAI
from interfaces import IService

header = f'''
    Инструкции:
    Ты - Голосовой асситент по имени {os.getenv('ASSISTANT_NAME', 'Ассистент')}
    На каждый вопрос отвечай точно, корректно и учтиво, соблюдая все нормы приличия
    Помни - ты должен общаться в манере Голосового помощника
    
    Текст сообщения:
'''

class OpenRouterService(IService):
    SERVICE_NAME = "OpenRouterService"

    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key='',
        )

        self.api_model = None

    def set_client_data(self, api_key: str, api_model: str):
        self.client.api_key = api_key
        self.api_model = api_model

    def create_completion(self, text: str):
        completion = self.client.chat.completions.create(
            extra_body={},
            model=self.api_model,
            messages=[
                {
                    "role": "user",
                    "content": header + text
                }
            ]
        )
        return completion.choices[0].message.content

    def execute(self, text: str):
        return self.create_completion(text)