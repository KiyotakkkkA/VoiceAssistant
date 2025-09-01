import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ToolCard } from '../../../molecules/widgets/cards';
import { SlidedCheckbox } from '../../../atoms/input';
import { IconIdea } from '../../../atoms/icons';
import { useSocketActions } from '../../../../composables';

import SettingsStore from '../../../../store/SettingsStore';

const ToolsView: React.FC = observer(() => {

  const { toolOff, toolOn } = useSocketActions();

  const toggleTool = (category: string, enabled: boolean) => {
    SettingsStore.data.tools[category].enabled = !enabled;
    if (enabled) {
      toolOff(category);
    } else {
      toolOn(category);
    }
  }

  const categories = Object.entries(SettingsStore.data.tools).reduce((acc, [key, value]) => {
    acc[key] = {
      ...value,
      functions: value.functions.map(func => ({
        ...func,
        enabled: true
      }))
    };
    return acc;
  }, {} as { [key: string]: { enabled: boolean; functions: { name: string }[] } });

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {Object.entries(categories).map(([category, { enabled }]) => {          
          return (
            <div key={category} className="space-y-4">
              <div className={`flex items-center justify-between p-3 ${enabled ? 'bg-ui-bg-secondary' : 'bg-ui-bg-primary-light'} rounded-xl border border-ui-border-primary`}>
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg`}>
                    <IconIdea size={20} className={` ${enabled ? 'text-yellow-500' : ''}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ui-text-primary">{category}</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <SlidedCheckbox
                    checked={enabled}
                    onChange={() => toggleTool(category, enabled)}
                    size="lg"
                  />
                </div>
              </div>

              <div className='pl-4'>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {SettingsStore.data.tools[category].functions.map(func => (
                    <ToolCard
                        key={func.name}
                        name={func.name}
                    />
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export { ToolsView };
