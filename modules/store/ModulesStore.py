from interfaces import ISingleton

class ModulesStore(ISingleton):

    _modules: dict[str, dict] = {}

    @staticmethod
    def set_module(module_name: str, module_data: dict):
        ModulesStore._modules[module_name] = module_data

    @staticmethod
    def get_module(module_name: str):
        return ModulesStore._modules.get(module_name)

    @staticmethod
    def remove_module(module_name: str):
        ModulesStore._modules.pop(module_name, None)

    @staticmethod
    def get_all_modules():
        return ModulesStore._modules
