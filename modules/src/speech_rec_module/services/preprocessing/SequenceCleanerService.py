from interfaces import ISingleton
import re


class SequenceCleanerService(ISingleton):
    
    SERVICE_NAME = "SequenceCleanerService"
    
    def __init__(self):
        """
        Инициализация сервиса удаления ненужных последовательностей
        """
        self.to_remove = [
            'то',
            'также',
            'же',
            'на',
            'ведь',
            'вот',
            'ну',
            'уж',
            'ли',
            'не',
            'ни',
            'тоже',
            'так',
            'всё-таки',
            'в',
            'да',
            'как раз',
            'просто',
            'уже',
            'ещё',
            'лишь',
            'вроде',
            'кажется',
            'мол',
            'даже',
            'вот уж',
            'всё равно',
            'будет',
            'тем не менее',
        ]

    def _remove_unnecessary(self, text: str) -> str:
        for word in self.to_remove:
            pattern = r'\b{}\b'.format(re.escape(word))
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)

        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def execute(self, text: str) -> str:
        """
        Выполнение удаления ненужных последовательностей
        
        Args:
            text (str): Текст для удаления ненужных последовательностей
        
        Returns:
            str: Текст без ненужных последовательностей
        """
        return self._remove_unnecessary(text)