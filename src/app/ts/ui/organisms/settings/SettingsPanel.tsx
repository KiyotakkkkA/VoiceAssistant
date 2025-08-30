import React, { useState, createElement } from 'react';
import {
  SettingsSidebar,
  SettingsSection } from '../../molecules/settings';
import { ApperanceView, ApiKeysField, ModulesView, ToolsView, AccountsView } from './sections';
import { observer } from 'mobx-react-lite';

import SettingsStore from '../../../store/SettingsStore';
import ModulesStore from '../../../store/ModulesStore';

interface SectionConfig {
  title: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
}

const SettingsPanel: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState('general-themes');

  const sections: Record<string, SectionConfig> = {
      "user-accounts": {
        title: "Пользователь / Учетные записи",
        component: AccountsView,
        props: {}
      },
      "models-apikeys": {
        title: "Ассистент / Ключи API",
        component: ApiKeysField,
        props: {
          apikeys: SettingsStore.data.settings?.['ui.current.apikeys'] || []
        }
      },
      "models-tools": {
        title: "Ассистент / Инструменты",
        component: ToolsView,
        props: {}
      },
      "general-themes": {
        title: "Общее / Интерфейс",
        component: ApperanceView,
        props: {
          themeNames: SettingsStore.data.appearance.themes.themeNames,
          currentTheme: SettingsStore.data.settings?.['ui.current.theme.id'] || 'dark',
          currentEventPanelState: SettingsStore.data.settings?.['ui.current.event.panel.state']
        }
      },
      "general-modules": {
        title: "Общее / Модули",
        component: ModulesView,
        props: {
          modules: ModulesStore.modules || {},
        }
      },
    };

  const renderContent = (activeTab: string) => {

    if (!sections[activeTab as keyof typeof sections]) {
      return (
        <div className="flex items-center justify-center">
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

    return (
      <SettingsSection title={sections[activeTab as keyof typeof sections].title}>
        {createElement(sections[activeTab as keyof typeof sections].component, sections[activeTab as keyof typeof sections].props)}
      </SettingsSection>
    )
  };

  return (
    <div className="h-full flex bg-ui-bg-primary">
      <SettingsSidebar 
        onTabSelect={setActiveTab} 
        activeTab={activeTab} 
      />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-6">
          {renderContent(activeTab)}
        </div>
      </div>
    </div>
  );
});

export { SettingsPanel };
