import React from 'react';
import * as Icons from '../ui/atoms/icons';

export interface ModuleTypeInfo {
  type: string;
  color: string;
  bgColor: string;
}

export const useModuleHelpers = () => {
  const getModuleIcon = (serviceId: string): React.ReactElement => {
    const iconMap: Record<string, React.ReactElement> = {
      'orchestrator': React.createElement(Icons.IconShield, { className: "w-6 h-6" }),
      'processing_module': React.createElement(Icons.IconTerminal, { className: "w-6 h-6" }),
      'speech_rec_module': React.createElement(Icons.IconMicrophone, { className: "w-6 h-6" })
    };
    
    return iconMap[serviceId] || React.createElement(Icons.IconFile, { className: "w-6 h-6" });
  };

  const getModuleTypeInfo = (serviceId: string): ModuleTypeInfo => {
    const typeMap: Record<string, ModuleTypeInfo> = {
      'orchestrator': { 
        type: 'Основной', 
        color: 'text-purple-400', 
        bgColor: 'bg-purple-500/10'
      },
      'processing_module': { 
        type: 'Обработка', 
        color: 'text-blue-400', 
        bgColor: 'bg-blue-500/10'
      },
      'speech_rec_module': { 
        type: 'Распознавание', 
        color: 'text-green-400', 
        bgColor: 'bg-green-500/10'
      }
    };
    
    return typeMap[serviceId] || { 
      type: 'Модуль', 
      color: 'text-gray-400', 
      bgColor: 'bg-gray-500/10'
    };
  };

  const getModelIcon = (model: string): string => {
    if (model.includes('gpt') || model.includes('openai')) {
      return '🤖';
    } else if (model.includes('claude')) {
      return '🧠';  
    } else if (model.includes('gemini')) {
      return '💎';
    }
    return '🤖';
  };

  return {
    getModuleIcon,
    getModuleTypeInfo,
    getModelIcon
  };
};
