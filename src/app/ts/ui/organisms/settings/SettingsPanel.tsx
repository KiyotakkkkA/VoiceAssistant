import React, { useState } from 'react';
import { SettingsSidebar, SettingsSection, ThemeSelector } from '../../molecules/settings';
import { observer } from 'mobx-react-lite';

import settingsStore from '../../../store/SettingsStore';

const SettingsPanel: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState('appearance-themes');

  const renderContent = () => {
    switch (activeTab) {
      case 'models-apikeys':
        return (
          <SettingsSection title="Модели AI / Ключи API">
            <ThemeSelector 
              themeNames={settingsStore.data.appearance.themes.themeNames} 
              currentTheme={settingsStore.data.settings?.['ui.current.theme.id'] || 'dark'}
            />
          </SettingsSection>
        );
      case 'appearance-themes':
        return (
          <SettingsSection title="Внешний вид / Темы">
            <ThemeSelector 
              themeNames={settingsStore.data.appearance.themes.themeNames} 
              currentTheme={settingsStore.data.settings?.['ui.current.theme.id'] || 'dark'}
            />
          </SettingsSection>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-ui-text-secondary/10 flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-ui-text-secondary">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-ui-text-primary mb-2">Раздел в разработке</h3>
              <p className="text-ui-text-muted">Этот раздел настроек будет добавлен в будущих версиях</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex bg-main-bg">
      <SettingsSidebar 
        onTabSelect={setActiveTab} 
        activeTab={activeTab} 
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
});

export { SettingsPanel };
