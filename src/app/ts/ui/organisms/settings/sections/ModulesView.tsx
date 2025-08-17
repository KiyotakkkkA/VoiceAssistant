import React from 'react';
import { ModuleCard } from '../../../molecules/widgets';

interface Module {
    service_id: string;
    service_name?: string;
    service_desc?: string;
    enabled: boolean;
}

const ModulesView: React.FC<{ modules: { [key: string]: Module } }> = ({ modules }) => {
    return (
        <div className="space-y-6">
            <p className="text-ui-text-muted">Управление компонентами голосового ассистента</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.values(modules).map(module => {
                    return (
                        <ModuleCard key={module.service_id} module={module}/>
                    );
                })}
            </div>

            {Object.keys(modules).length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-ui-text-secondary/10 flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-8 h-8 text-ui-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 21H5V3H14V9H19Z"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-ui-text-primary mb-2">Модули не найдены</h3>
                    <p className="text-ui-text-muted">Не удалось загрузить информацию о системных модулях</p>
                </div>
            )}
        </div>
    );
};

export { ModulesView }
