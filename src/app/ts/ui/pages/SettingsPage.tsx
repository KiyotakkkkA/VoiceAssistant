import React, { createElement } from 'react';
import {
  SettingsSidebar,
  SettingsSection } from '../molecules/settings';
import { ApperanceView, ApiKeysView, ModulesView, ToolsView, AccountsView } from '../organisms/settings';
import { observer } from 'mobx-react-lite';
import { useSettingsNavigation, SettingsGroup } from '../../composables';

const SettingsPage: React.FC = observer(() => {
  const { getCurrentSection, setActiveSection } = useSettingsNavigation();

  const settingsGroups: SettingsGroup[] = [
    {
      id: 'user',
      title: 'Пользователь',
      sections: [
        {
          id: 'accounts',
          title: 'Учетные записи',
          component: AccountsView,
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
          component: ApiKeysView,
        },
        {
          id: 'tools',
          title: 'Инструменты',
          component: ToolsView,
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
        },
        {
          id: 'modules',
          title: 'Модули',
          component: ModulesView,
        }
      ]
    }
  ];

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
        {createElement(section.component || {})}
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

export { SettingsPage };
