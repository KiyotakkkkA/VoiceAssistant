from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from src.processing_module.services.classification.IntentFilesMerger import IntentFilesMerger
from colorama import Fore, Style
from interfaces import ISingleton
import os
import pickle


class IntentTrainingService(ISingleton):
    SERVICE_NAME = "IntentTrainingService"

    def __init__(self,
                 input_dataset_files_dir: str,
                 output_merged_dataset_file_path: str,
                 output_model_save_path: str,
                 ):
        """
        Инициализация сервиса обучения модели классификатора
        
        Args:
            input_dataset_files_dir (str): Путь к директории с файлами для слияния
            output_merged_dataset_file_path (str): Путь к файлу слияния
            output_model_save_path (str): Путь к файлу сохранения модели
        """
        self.input_dataset_files_dir = input_dataset_files_dir
        self.output_merged_dataset_file_path = output_merged_dataset_file_path
        self.output_model_save_path = output_model_save_path
        
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
            ('clf', SVC(kernel='linear', probability=True)),
        ])
        self.is_trained = False
        
        self.output_merged_dataset_file = f"{self.output_merged_dataset_file_path}/merged.txt"
        
        self.services = {
            "intent_files_merger": IntentFilesMerger(
                input_files_dir=self.input_dataset_files_dir,
                output_file_path=self.output_merged_dataset_file,
            )
        }
        
        self.dataset_path = self.output_merged_dataset_file
    
    def merge_data(self):
        """
        Слияние датасетов
        """
        self.services["intent_files_merger"].merge()

    def load_data(self):
        """
        Загрузка данных
        """
        texts = []
        intents = []
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Dataset file not found: {self.dataset_path}")

        with open(self.dataset_path, 'r', encoding='utf-8') as f:
            for line in f:
                original_line = line
                line = line.strip()
                if not line or '\t' not in line:
                    if line:
                        print(f"{Fore.YELLOW}[ПРЕДУПРЕЖДЕНИЕ]{Style.RESET_ALL} Пропущена строка (нет табуляции): '{original_line.rstrip()}'")
                    continue
                try:
                    text_part, intent_part = line.split('\t', 1)
                    texts.append(text_part.strip())
                    intents.append(intent_part.strip())
                except ValueError:
                    print(f"{Fore.YELLOW}[ПРЕДУПРЕЖДЕНИЕ]{Style.RESET_ALL} Пропуск некорректной строки: {line}")
        return texts, intents

    def train(self, test_size=0.2, random_state=42):
        """
        Обучение модели
        
        Args:
            test_size (float): Размер тестовой выборки (от 0 до 1)
            random_state (int): Состояние генератора случайных чисел
        """
        print(f"{Fore.CYAN}=== Начало обучения модели ==={Style.RESET_ALL}")
        print("Загрузка данных...")
        self.merge_data()
        texts, intents = self.load_data()
        if not texts:
             print(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Нет данных для обучения.")
             return False

        print(f"{Fore.GREEN}[УСПЕХ]{Style.RESET_ALL} Найдено {Fore.YELLOW}{len(texts)}{Style.RESET_ALL} примеров.")

        X_train, X_test, y_train, y_test = train_test_split(
            texts, intents, test_size=test_size, random_state=random_state, stratify=intents
        )

        print("Обучение модели...")
        self.pipeline.fit(X_train, y_train)
        self.is_trained = True

        if test_size > 0:
            y_pred = self.pipeline.predict(X_test)
            acc = accuracy_score(y_test, y_pred)
            acc_color = Fore.GREEN if acc > 0.9 else (Fore.YELLOW if acc > 0.7 else Fore.RED)
            print(f"{Fore.MAGENTA}Точность на тестовой выборке:{Style.RESET_ALL} {acc_color}{acc:.2%}{Style.RESET_ALL}")

        print("Сохранение модели...")
        self.save_model(f"{self.output_model_save_path}/intents.pkl")
        print(f"{Fore.CYAN}=== Обучение модели завершено ==={Style.RESET_ALL}")
        return True

    def save_model(self, model_save_path):
        """
        Сохранение модели
        
        Args:
            model_save_path (str): Путь к файлу, в который будет сохранена модель
        """
        if not self.is_trained:
            raise RuntimeError(f"{Fore.RED}[ОШИБКА]{Style.RESET_ALL} Модель не обучена. Невозможно сохранить.")
        with open(model_save_path, 'wb') as f:
            pickle.dump(self.pipeline, f)
        print(f"{Fore.GREEN}[УСПЕХ]{Style.RESET_ALL} Модель сохранена в {Fore.MAGENTA}{model_save_path}{Style.RESET_ALL}")
