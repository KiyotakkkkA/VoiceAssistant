import * as Icons from "../../atoms/icons";

interface Module {
    service_id: string;
    service_name?: string;
    service_desc?: string;
    enabled: boolean;
}

const getModuleIcon = (serviceId: string) => {
    const iconMap: Record<string, JSX.Element> = {
        'orchestrator': (
            <Icons.IconShield className="w-6 h-6" />
        ),
        'processing_module': (
            <Icons.IconTerminal className="w-6 h-6" />
        ),
        'speech_rec_module': (
            <Icons.IconMicrophone className="w-6 h-6" />
        )
    };
    
    return iconMap[serviceId] || (
        <Icons.IconFile className="w-6 h-6" />
    );
};

const getModuleTypeInfo = (serviceId: string) => {
    const typeMap: Record<string, { type: string; color: string; bgColor: string }> = {
        'orchestrator': { type: 'Основной', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    };
    
    return typeMap[serviceId] || { type: 'Модуль', color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
};

const ModuleCard = ({ module }: { module: Module }) => {

    const typeInfo = getModuleTypeInfo(module.service_id);
    const isEnabled = module.enabled;
    
    return (
        <div
            key={module.service_id}
            className={`group relative rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-ui-border-primary bg-gradient-to-br from-ui-bg-secondary/50 to-ui-accent/5 hover:border-ui-border-primary-hover`}
        >
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                isEnabled ? 'bg-green-400 shadow-green-400/50 shadow-lg' : 'bg-red-400 shadow-red-400/50 shadow-lg'
            }`}>
                <div className={`absolute inset-0 rounded-full animate-pulse ${
                    isEnabled ? 'bg-green-400' : 'bg-red-400'
                }`} />
            </div>

            <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${typeInfo.bgColor} ${typeInfo.color} group-hover:scale-110 transition-transform duration-300`}>
                        {getModuleIcon(module.service_id)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-ui-text-primary mb-1 truncate">
                            {module.service_name || module.service_id}
                        </h3>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                            {typeInfo.type}
                        </div>
                    </div>
                </div>

                <p className="text-ui-text-muted text-sm mb-4 leading-relaxed">
                    {module.service_desc || 'Описание модуля отсутствует'}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isEnabled 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                isEnabled ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            {isEnabled ? 'Активен' : 'Неактивен'}
                        </span>
                    </div>

                    <div className="text-xs text-ui-text-muted font-mono">
                        {module.service_id}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ui-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    );
}

export { ModuleCard };