from interfaces.ISingleton import ISingleton

class ITool(ISingleton):

    name = 'Base Tool'

    commands = []

    @classmethod
    def get_commands(cls):
        return cls.commands