import * as Icons from "../../atoms/icons";
import { socketClient } from "../../../clients";
import { EventsTopic, EventsType } from "../../../../js/enums/Events";
import { Module } from "../../../types/Global";

import { observer } from "mobx-react-lite";
import ModulesStore from "../../../store/ModulesStore";

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

const ModuleStatus = ({isEnabled, isReloading, isEnabling, isDisabling}: {isEnabled: boolean; isReloading: boolean; isEnabling: boolean; isDisabling: boolean}) => {

    const bgStyleEnabled = "bg-green-500/10 text-green-400 border border-green-500/20"
    const bgStyleReloading = "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    const bgStyleDisabled = "bg-red-500/10 text-red-400 border border-red-500/20"

    const circleEnabled = "bg-green-400"
    const circleReloading = "bg-blue-400"
    const circleDisabled = "bg-red-400"

    const textEnabled = "Активен"
    const textEnabling = "Включается..."
    const textReloading = "Перезапускается..."
    const textDisabling = "Отключается..."
    const textDisabled = "Неактивен"

    let resultBgStyle = bgStyleEnabled
    let resultText = textEnabled;
    let resultCircle = circleEnabled;

    if (isEnabling) {
        resultText = textEnabling;
        resultBgStyle = bgStyleEnabled;
        resultCircle = circleEnabled;
    } else if (isDisabling) {
        resultText = textDisabling;
        resultBgStyle = bgStyleDisabled;
        resultCircle = circleDisabled;
    } else if (isReloading) {
        resultText = textReloading;
        resultBgStyle = bgStyleReloading;
        resultCircle = circleReloading;
    } else if (!isEnabled) {
        resultText = textDisabled;
        resultBgStyle = bgStyleDisabled;
        resultCircle = circleDisabled;
    }

    return (
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                resultBgStyle
            }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                    resultCircle
                }`} />
                {resultText}
            </span>
        </div>
    )
}

const ModuleCard = observer(({ module }: { module: Module }) => {
    const typeInfo = getModuleTypeInfo(module.service_id);

    const isReloading = module.isReloading;
    const isEnabling = module.isEnabling;
    const isDisabling = module.isDisabling;
    const isEnabled = module.enabled;

    const handleReload = () => {
        if (socketClient) {
            socketClient.send({
                type: EventsType.SERVICE_ACTION,
                topic: EventsTopic.ACTION_SERVICE_RELOAD,
                payload: { 
                    serviceId: module.service_id,
                },
                from: 'ui'
            });
            ModulesStore.modules[module.service_id].isReloading = true;
        }
    };

    const handleEnable = () => {
        if (socketClient) {
            socketClient.send({
                type: EventsType.SERVICE_ACTION,
                topic: EventsTopic.ACTION_SERVICE_ENABLE,
                payload: {
                    serviceId: module.service_id,
                },
                from: 'ui'
            });
            ModulesStore.modules[module.service_id].isEnabling = true;
        }
    };

    const handleDisable = () => {
        if (socketClient) {
            socketClient.send({
                type: EventsType.SERVICE_ACTION,
                topic: EventsTopic.ACTION_SERVICE_DISABLE,
                payload: {
                    serviceId: module.service_id,
                },
                from: 'ui'
            });
            ModulesStore.modules[module.service_id].isDisabling = true;
        }
    };

    return (
        <div
            key={module.service_id}
            className={`group relative rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-ui-border-primary bg-gradient-to-br from-ui-bg-secondary/50 to-ui-accent/5 hover:border-ui-border-primary-hover`}
        >
            <ModuleStatus isEnabled={isEnabled} isReloading={isReloading} isEnabling={isEnabling} isDisabling={isDisabling} />

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
                    <div className="text-xs text-ui-text-muted font-mono">
                        {module.service_id}
                    </div>
                </div>

                <div>
                    {module.service_id !== 'orchestrator' ? (
                        <>
                            {isEnabled ? (
                                <div className="flex justify-between mt-2 gap-4">
                                    { !isReloading &&
                                        <button 
                                            onClick={handleDisable}
                                            disabled={isDisabling}
                                            className="w-full bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-md text-sm hover:bg-red-500/20 transition-colors"
                                        >
                                            {isDisabling ? 'Отключается...' : 'Отключить'}
                                        </button>
                                    }
                                    { !isDisabling &&<button 
                                        onClick={handleReload}
                                        disabled={isReloading}
                                        className={`w-full px-3 py-1 rounded-md text-sm border transition-colors
                                            ${isReloading 
                                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-not-allowed'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                                                }`}
                                        >
                                            {isReloading ? 'Перезапускается...' : 'Перезапустить'}
                                        </button>
                                    }
                                </div>
                            ) : (
                                    <div className="flex justify-between mt-2 gap-4">
                                        <button 
                                            className="w-full bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-md text-sm hover:bg-green-500/20 transition-colors"
                                            disabled={isEnabling}
                                            onClick={handleEnable}
                                        >
                                            {isEnabling ? 'Включается...' : 'Включить'}
                                        </button>
                                    </div>
                                )}
                        </>
                    ) : (
                        <>
                            <div className="mt-2 text-md text-ui-text-muted italic text-center">
                                Базовый модуль
                            </div>
                        </>
                    )}
            </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ui-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    );
});

export { ModuleCard };
