import React from 'react';
import { Module } from "../../../../types/Global";
import { observer } from "mobx-react-lite";
import ModulesStore from "../../../../store/ModulesStore";
import { useSocketActions, useModuleHelpers, useModuleStatus } from "../../../../composables";

const getModuleIcon = (serviceId: string) => {
    const { getModuleIcon } = useModuleHelpers();
    return getModuleIcon(serviceId);
};

const getModuleTypeInfo = (serviceId: string) => {
    const { getModuleTypeInfo } = useModuleHelpers();
    return getModuleTypeInfo(serviceId);
};

const ModuleStatus = ({isEnabled, isReloading, isEnabling, isDisabling}: {isEnabled: boolean; isReloading: boolean; isEnabling: boolean; isDisabling: boolean}) => {
    const { getStatusConfig } = useModuleStatus();
    const statusConfig = getStatusConfig(isEnabled, isReloading, isEnabling, isDisabling);

    return (
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgStyle}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${statusConfig.circleStyle}`} />
                {statusConfig.text}
            </span>
        </div>
    )
}

const ModuleCard = observer(({ module }: { module: Module }) => {
    const { getModuleTypeInfo } = useModuleHelpers();
    const { getButtonConfig } = useModuleStatus();
    const { reloadService, enableService, disableService } = useSocketActions();

    const typeInfo = getModuleTypeInfo(module.service_id);

    const isReloading = module.isReloading;
    const isEnabling = module.isEnabling;
    const isDisabling = module.isDisabling;
    const isEnabled = module.enabled;

    const buttonConfig = getButtonConfig(isEnabled, isReloading, isEnabling, isDisabling);

    const handleReload = () => {
        reloadService(module.service_id);
        ModulesStore.modules[module.service_id].isReloading = true;
    };

    const handleEnable = () => {
        enableService(module.service_id);
        ModulesStore.modules[module.service_id].isEnabling = true;
    };

    const handleDisable = () => {
        disableService(module.service_id);
        ModulesStore.modules[module.service_id].isDisabling = true;
    };

    return (
        <div
            key={module.service_id}
            className={`group relative rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-ui-border-primary bg-ui-bg-secondary/50 hover:border-ui-border-primary-hover`}
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
                                    {buttonConfig.showDisable && (
                                        <button 
                                            onClick={handleDisable}
                                            disabled={isDisabling}
                                            className="w-full bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-md text-sm hover:bg-red-500/20 transition-colors"
                                        >
                                            {buttonConfig.disableText}
                                        </button>
                                    )}
                                    {buttonConfig.showReload && (
                                        <button 
                                            onClick={handleReload}
                                            disabled={isReloading}
                                            className={`w-full px-3 py-1 rounded-md text-sm border transition-colors
                                                ${isReloading 
                                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-not-allowed'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                                                    }`}
                                            >
                                                {buttonConfig.reloadText}
                                            </button>
                                    )}
                                </div>
                            ) : (
                                buttonConfig.showEnable && (
                                    <div className="flex justify-between mt-2 gap-4">
                                        <button 
                                            className="w-full bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-md text-sm hover:bg-green-500/20 transition-colors"
                                            disabled={isEnabling}
                                            onClick={handleEnable}
                                        >
                                            {buttonConfig.enableText}
                                        </button>
                                    </div>
                                )
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
