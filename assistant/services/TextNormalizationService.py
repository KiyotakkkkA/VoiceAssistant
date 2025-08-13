from services.preprocessing import SequenceCleanerService, TextToNumberService, LemmatizationService
from interfaces import ISingleton
from colorama import Fore, Style

class TextNormalizationService(ISingleton):
    SERVICE_NAME = "TextNormalizationService"
    
    def __init__(self):
        """
        Инициализация сервиса нормализации текста
        """
        self.services = {
            "sequence_cleaner": SequenceCleanerService(),
            "text_to_number": TextToNumberService(),
            "lemmatization": LemmatizationService()
        }
    
    def test(self):
        """
        Тестирование сервиса нормализации текста
        """
        for service in self.services.values():
            if hasattr(service, "test"):
                if service.test():
                    print(f"{Fore.YELLOW}[ТЕСТ] {Fore.RESET}{service.SERVICE_NAME} {Fore.GREEN}УСПЕШЕН!{Style.RESET_ALL}")
                else:
                    print(f"{Fore.YELLOW}[ТЕСТ] {Fore.RESET}{service.SERVICE_NAME} {Fore.RED}ПРОВАЛЕН!{Style.RESET_ALL}")
    
    def execute(self, text):
        """
        Выполнение нормализации текста
        
        Args:
            text (str): Текст для нормализации
        
        Returns:
            str: Нормализованный текст
        """
        cleaned_text = self.services["sequence_cleaner"].execute(text)
        lemmatized_text = self.services["lemmatization"].execute(cleaned_text)
        number_extracted_text = self.services["text_to_number"].extract_numbers_from(lemmatized_text)
        
        return number_extracted_text