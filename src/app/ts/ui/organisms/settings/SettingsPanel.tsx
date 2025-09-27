import React, { createElement, useMemo } from 'react';
import {
  SettingsSidebar,
  SettingsSection } from '../../molecules/settings';
import { ApperanceView, ApiKeysField, ModulesView, ToolsView, AccountsView } from './sections';
import { observer } from 'mobx-react-lite';
import { useSettingsNavigation, SettingsGroup } from '../../../composables';

import SettingsStore from '../../../store/SettingsStore';
import ModulesStore from '../../../store/ModulesStore';

const SettingsPanel: React.FC = observer(() => {
  const { getCurrentSection, setActiveSection } = useSettingsNavigation();

  const settingsGroups: SettingsGroup[] = useMemo(() => [
    {
      id: 'user',
      title: 'Пользователь',
      sections: [
        {
          id: 'accounts',
          title: 'Учетные записи',
          component: AccountsView,
          props: {}
        }
      ]
    },
    {
      id: 'assistant',
      title: 'Ассистент',
      sections: [
        {
          id: 'apikeys',
          title: 'Ключи API',
          component: ApiKeysField,
          props: {}
        },
        {
          id: 'tools',
          title: 'Инструменты',
          component: ToolsView,
          props: {}
        }
      ]
    },
    {
      id: 'general',
      title: 'Общее',
      sections: [
        {
          id: 'interface',
          title: 'Интерфейс',
          component: ApperanceView,
          props: {
            themeNames: SettingsStore.data.runtime['runtime.appearance.themesList'],
            currentTheme: SettingsStore.data.settings?.['current.appearance.theme'],
          }
        },
        {
          id: 'modules',
          title: 'Модули',
          component: ModulesView,
          props: {
            modules: ModulesStore.modules || {},
          }
        }
      ]
    }
  ], [SettingsStore.data.runtime, SettingsStore.data.settings, ModulesStore.modules]);

  const activeSection = getCurrentSection() || 'accounts';
  
  React.useEffect(() => {
    if (!getCurrentSection()) {
      setActiveSection('accounts');
    }
  }, [getCurrentSection, setActiveSection]);

  const findActiveSection = (sectionId: string) => {
    for (const group of settingsGroups) {
      const section = group.sections.find(s => s.id === sectionId);
      if (section) return section;
    }
    return null;
  };

  const renderContent = (activeSectionId: string) => {
    const section = findActiveSection(activeSectionId);
    
    if (!section) {
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
      <SettingsSection title={section.title}>
        {createElement(section.component, section.props || {})}
      </SettingsSection>
    );
  };

  return (
    <div className="h-full flex bg-ui-bg-primary">
      <SettingsSidebar 
        onTabSelect={setActiveSection} 
        activeTab={activeSection}
        settingsGroups={settingsGroups}
      />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-6">
          {renderContent(activeSection)}
        </div>
      </div>
    </div>
  );
});

export { SettingsPanel };
