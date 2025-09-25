import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ToolCard } from '../../../molecules/cards';
import { SlidedCheckbox } from '../../../atoms/input';
import { IconIdea, IconWarning } from '../../../atoms/icons';
import { useSocketActions } from '../../../../composables';
import { ToolsData } from '../../../../types/Global';
import { ToolTip } from '../../../atoms/feedback';

import SettingsStore from '../../../../store/SettingsStore';

const ToolsView: React.FC = observer(() => {

  const { toolOff, toolOn } = useSocketActions();

  const toggleTool = (category: string, enabled: boolean) => {
    SettingsStore.data.settings['current.ai.tools'][category].enabled = !enabled;
    if (enabled) {
      toolOff(category);
    } else {
      toolOn(category);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {Object.entries(SettingsStore.data.settings?.['current.ai.tools'])?.map(([category, { enabled, required_settings_fields, available }]) => {
          return (
            <div key={category} className="space-y-4">
              <div className={`flex items-center justify-between p-3 ${enabled ? 'bg-ui-bg-secondary' : 'bg-ui-bg-primary-light'} rounded-xl border border-ui-border-primary`}>
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg`}>
                    <IconIdea size={20} className={` ${enabled ? 'text-yellow-500' : ''}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${available ? 'text-ui-text-primary' : 'text-ui-text-muted'}`}>{category}</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div>
                    {!available && (
                      <div>
                        <div className='w-[40px] flex justify-center pt-2'>
                            <ToolTip type="warning" content={
                              <div className='space-y-1'>
                                <span>Требует следующие заполненные поля в разделе "Учетные записи"</span>
                                <div>
                                  {required_settings_fields.map(field => (
                                    <div key={field} className="text-xs text-ui-text-muted">
                                      - {field}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            } position="bottom">
                                <IconWarning size={26} className="text-yellow-500"/>
                            </ToolTip>
                        </div>
                      </div>
                    )}
                  </div>
                  <SlidedCheckbox
                    disabled={!available}
                    checked={enabled}
                    onChange={() => toggleTool(category, enabled)}
                    size="lg"
                  />
                </div>
              </div>

              <div className='pl-4'>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {SettingsStore.data.settings['current.ai.tools'][category].functions.map(func => (
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
