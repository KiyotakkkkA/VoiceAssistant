from interfaces import IService
from typing import List, Optional
from colorama import Fore, Style
import pickle


class IntentClassifierService(IService):
    SERVICE_NAME = "IntentClassifierService"
    
    STANDART_THRESHOLD = 0.85

    def __init__(self, model_path: str):
        """
        Инициализация сервиса классификации
        
        Args:
            model_path (str): Путь к директории с обученной моделью
        """
        self.model_path = f"{model_path}/intents.pkl"
        self.model = None
        self.is_loaded = False
        
        self.load_model()

    def load_model(self):
        try:
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            self.is_loaded = True
            print(f"{Fore.GREEN}[УСПЕХ]{Style.RESET_ALL} Модель загружена из {Fore.MAGENTA}'{self.model_path}'{Style.RESET_ALL}")
        except FileNotFoundError:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Файл модели '{self.model_path}' не найден. Обучите модель сначала.")
            self.is_loaded = False
        except pickle.UnpicklingError as e:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL}Ошибка десериализации модели (возможно, файл поврежден): {e}")
            self.is_loaded = False
        except Exception as e:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL}Неожиданная ошибка при загрузке модели: {e}")
            import traceback
            traceback.print_exc()
            self.is_loaded = False

    def execute(self, normalized_text_list: List[str], threshold: float = STANDART_THRESHOLD) -> Optional[dict]:
        """
        Предсказывает класс на основе нормализованного текста.

        Args:
            normalized_text_list (List[str]): Список нормализованных слов.
            threshold (float): Минимальная уверенность (вероятность) для принятия предсказания.
                               Если максимальная вероятность ниже этого порога, возвращается None.

        Returns:
            Optional[dict]: Предсказанный класс или None, если уверенность низкая.
        """
        if not self.is_loaded or self.model is None:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Модель не загружена.")
            return None

        text = " ".join(normalized_text_list)

        try:
            probabilities = self.model.predict_proba([text])[0]
            classes = self.model.classes_
            
            max_prob_index = probabilities.argmax()
            max_prob = probabilities[max_prob_index]
            predicted_intent = classes[max_prob_index]
            
            return {
                'original_text': text,
                "intent": str(predicted_intent) if max_prob >= threshold else None,
                "confidence": f"{max_prob:.2%}"
            }

        except Exception as e:
            print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL}Ошибка при классификации: {e}")
            import traceback
            traceback.print_exc()
            return None
