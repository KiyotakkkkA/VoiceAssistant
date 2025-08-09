from pymorphy3 import MorphAnalyzer
from interfaces import ISingleton


class LemmatizationService(ISingleton):
    SERVICE_NAME = "LemmatizationService"
    
    def __init__(self):
        """
        Инициализация сервиса лемматизации (приведения слов к начальной форме)
        """
        self.morph = MorphAnalyzer(lang="ru")
        self._cache = {}

    def execute(self, text: str) -> str:
        """
        Выполнение лемматизации
        
        Args:
            text (str): Текст для лемматизации
        
        Returns:
            str: Лемматизированный текст
        """
        if not text or not text.strip():
            return text

        words = text.split()
        result = []

        for word in words:
            punct_before = ''
            punct_after = ''
            clean_word = word
            while clean_word and not clean_word[0].isalpha():
                punct_before += clean_word[0]
                clean_word = clean_word[1:]
            while clean_word and not clean_word[-1].isalpha():
                punct_after = clean_word[-1] + punct_after
                clean_word = clean_word[:-1]

            if not clean_word:
                result.append(word)
                continue

            if clean_word not in self._cache:
                try:
                    self._cache[clean_word] = self.morph.parse(clean_word)[0].normal_form
                except Exception:
                    self._cache[clean_word] = clean_word

            lemmatized = self._cache[clean_word]
            result.append(punct_before + lemmatized + punct_after)

        return ' '.join(result)

    @classmethod
    def test(cls, console_output: bool = False) -> bool:
        """
        Тестирование сервиса лемматизации
        
        Args:
            console_output (bool): Вывод результатов в консоль
        
        Returns:
            bool: True, если все тесты пройдены, False в противном случае
        """
        service = cls()

        test_cases = [
            {"input": "включаю", "output": "включать"},
            {"input": "включи", "output": "включить"},
            {"input": "включил", "output": "включить"},
            {"input": "включу", "output": "включить"},
            {"input": "включаем", "output": "включать"},
            {"input": "свет", "output": "свет"},
            {"input": "света", "output": "свет"},
            {"input": "свету", "output": "свет"},
            {"input": "светом", "output": "свет"},
            {"input": "о свете", "output": "о свет"},

            # Прилагательные
            {"input": "хороший", "output": "хороший"},
            {"input": "хорошего", "output": "хороший"},
            {"input": "хорошему", "output": "хороший"},
            {"input": "хорошей", "output": "хороший"},

            # Местоимения
            {"input": "его", "output": "он"},
            {"input": "ему", "output": "он"},
            {"input": "с ним", "output": "с они"},

            # Числительные
            {"input": "двадцать первое", "output": "двадцать первый"},
            {"input": "пятнадцатое", "output": "пятнадцатый"},
            {"input": "третий", "output": "третий"},
            {"input": "третьего", "output": "третий"},

            # Комбинированные фразы
            {"input": "включи свет в гостиной", "output": "включить свет в гостиная"},
            {"input": "выключи компьютер", "output": "выключить компьютер"},
            {"input": "открой дверь", "output": "открыть дверь"},
            {"input": "какой сегодня день", "output": "какой сегодня день"},
            {"input": "погода в Москве", "output": "погода в москва"},
            {"input": "найди видео про котов", "output": "найти видео про кот"},
            {"input": "установка пакетов", "output": "установка пакет"},
            {"input": "я бегал быстро", "output": "я бегать быстро"},
            {"input": "мы ели пиццу", "output": "мы есть пицца"},
            {"input": "она была счастлива", "output": "она быть счастливый"},
            {"input": "это работает", "output": "это работать"},
            {"input": "компьютеры работают", "output": "компьютер работать"},
            {"input": "включи его", "output": "включить он"},
            {"input": "проверь это", "output": "проверить это"},
            {"input": "скажи мне", "output": "сказать я"},
            {"input": "покажи картинку", "output": "показать картинка"},
            {"input": "увеличь громкость", "output": "увеличить громкость"},
            {"input": "включи музыку", "output": "включить музыка"},
            {"input": "открой окно", "output": "открыть окно"},
            {"input": "закрой дверь", "output": "закрыть дверь"},
            {"input": "включи свет", "output": "включить свет"},
            {"input": "выключи свет", "output": "выключить свет"},
            {"input": "включи свет пожалуйста", "output": "включить свет пожалуйста"},
            {"input": "что такое исключение", "output": "что такой исключение"},
            {"input": "я учу python", "output": "я учить python"},
            {"input": "это мой код", "output": "это мой код"},
            {"input": "в комнате", "output": "в комната"},
            {"input": "в гостиной", "output": "в гостиная"},
            {"input": "на кухне", "output": "на кухня"},
            {"input": "в спальне", "output": "в спальня"},
            {"input": "в ванной", "output": "в ванная"},
            {"input": "в коридоре", "output": "в коридор"},
            {"input": "в офисе", "output": "в офис"},
            {"input": "в шкафу", "output": "в шкаф"},
            {"input": "в ящике", "output": "в ящик"},
        ]

        if console_output:
            print("Тестирование LemmatizationService:")
            print("=" * 60)

        for idx, case in enumerate(test_cases):
            result = service.execute(case["input"])
            assert result == case["output"], f"Тест {idx} не пройден: '{result}' != '{case['output']}'"
            if console_output:
                print(f"✅ Тест {idx + 1} пройден: '{case['input']}' → '{result}'")

        if console_output:
            print(f"\n🎉 Все {len(test_cases)} тестов пройдены успешно!")
        return True


if __name__ == "__main__":
    LemmatizationService.test(console_output=True)