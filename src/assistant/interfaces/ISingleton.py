from abc import ABC, ABCMeta

class SingletonMeta(ABCMeta):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class ISingleton(ABC, metaclass=SingletonMeta):    
    def __init__(self):
        super().__init__()
    
    @classmethod
    def getInstance(cls):
        return cls()