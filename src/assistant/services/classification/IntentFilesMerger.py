from interfaces import ISingleton
import os


class IntentFilesMerger(ISingleton):
    def __init__(self,
                 input_files_dir: str,
                 output_file_path: str):
        """
        Инициализация сервиса слияния датасетов
        
        Args:
            input_files_dir (str): Путь к директории с файлами датасетов
            output_file_path (str): Путь к файлу, в который будут записан объединенный датасет
        """
        self.input_files_dir = input_files_dir
        self.output_file_path = output_file_path

        self.input_files = [os.path.join(self.input_files_dir, f) for f in os.listdir(self.input_files_dir) if f.endswith('.txt')]

    def merge(self):
        """
        Слияние датасетов
        """
        if not os.path.exists(self.output_file_path):
            os.makedirs(os.path.dirname(self.output_file_path), exist_ok=True)
        
        with open(self.output_file_path, 'w', encoding='utf-8') as output:
            for input_file in self.input_files:
                with open(input_file, 'r', encoding='utf-8') as input:
                    for line in input:
                        output.write(line)
                output.write("\n\n")