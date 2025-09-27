import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { GContext } from '../../providers';
import { IconCheck, IconMicrophone } from '../atoms/icons';
import { useSettingsNavigation } from '../../composables';

import SettingsStore from '../../store/SettingsStore';
import ModulesStore from '../../store/ModulesStore';

interface Props { 
  mode: string;
  transcript: string | Object;
  systemReady?: boolean;
}

const StatePanel: React.FC<Props> = observer(({ mode, systemReady = false }) => {
  const ctx = useContext(GContext);

  if (!ctx?.states) return null;

  const { navigateToSettings } = useSettingsNavigation();

  const getStatusColor = (mode: string) => {
    switch (mode) {
      case 'listening': return { bg: 'bg-badge-listening', text: 'text-white'};
      case 'thinking': return { bg: 'bg-badge-thinking', text: 'text-black'};
      case 'waiting': return { bg: 'bg-badge-waiting', text: 'text-white'};
      case 'initializing': return { bg: 'bg-badge-initializing', text: 'text-white'};
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-400'};
    }
  };

  const statusColors = getStatusColor(mode);

  return (
    <div className='p-4 space-y-4 h-full overflow-y-auto custom-scrollbar'>
      <div className='space-y-3'>
        <div className={`p-3 rounded-lg ${statusColors.bg} backdrop-blur-sm`}>
          <div className={`text-lg font-semibold ${statusColors.text} text-center`}>
            {!systemReady ? 'ИНИЦИАЛИЗАЦИЯ' : ctx.states[mode]}
          </div>
        </div>
      </div>

      <hr className='border-ui-border-primary' />

      <div className='space-y-3'>
        <div className='text-xs font-medium text-ui-text-accent uppercase tracking-wider'>
          <span 
            className='cursor-pointer hover:underline transition-colors hover:text-ui-accent'
            onClick={() => navigateToSettings('modules')}
          >
            Модули
          </span>
        </div>
        
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs'>
            <div className='flex items-center gap-2'>
              <IconMicrophone size={14} />
              <span className='text-ui-text-secondary'>Распознавание речи</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${ModulesStore.modules['speech_rec_module']?.enabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          </div>

          <div className='flex items-center justify-between text-xs'>
            <div className='flex items-center gap-2'>
              <IconCheck size={14} />
              <span className='text-ui-text-secondary'>Обработка команд</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${ModulesStore.modules['processing_module']?.enabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          </div>
        </div>
      </div>
      
      <div className='space-y-2'>
        <div className='text-xs font-medium text-ui-text-accent uppercase tracking-wider'>
          <span 
            className='cursor-pointer hover:underline transition-colors hover:text-ui-accent'
            onClick={() => navigateToSettings('interface')}
          >
            Конфигурация
          </span>
        </div>

        <div className='text-xs space-y-1'>
          <div className='flex justify-between'>
            <span className='text-ui-text-secondary'>AI Модель</span>
            <span className='text-ui-text-primary font-medium text-xs truncate max-w-[100px]'>
              {SettingsStore.data.settings['current.ai.api']?.[SettingsStore.data.settings['current.ai.model.id']]?.name || 'Не выбрана'}
            </span>
          </div>

          {SettingsStore.data.settings['current.interface.event_panel.state'] ? (
            <div className='flex justify-between'>
              <span className='text-ui-text-secondary'>Панель событий</span>
              <span className='text-green-400 font-medium'>Включена</span>
            </div>
          ) : (
            <div className='flex justify-between'>
              <span className='text-ui-text-secondary'>Панель событий</span>
              <span className='text-red-400 font-medium'>Выключена</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export { StatePanel };
