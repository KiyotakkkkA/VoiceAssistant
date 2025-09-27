import React, { useState } from 'react';
import { Category } from '../../atoms';
import { SettingsGroup } from '../../../composables';

interface Props {
  onTabSelect: (tabId: string) => void;
  activeTab: string;
  settingsGroups: SettingsGroup[];
}

const SettingsSidebar: React.FC<Props> = ({ onTabSelect, activeTab, settingsGroups }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['user'])
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleTabClick = (sectionId: string) => {
    onTabSelect(sectionId);
  };

  const renderSettingsGroup = (group: SettingsGroup) => {
    const isExpanded = expandedCategories.has(group.id);

    return (
      <Category
        key={group.id}
        title={group.title}
        isExpanded={isExpanded}
        onToggle={() => toggleCategory(group.id)}
      >
        {group.sections.map(section => (
          <button
            key={section.id}
            onClick={() => handleTabClick(section.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-ui-text-secondary/10 transition-colors rounded-sm ${
              activeTab === section.id ? 'bg-widget-accent-a/10 text-widget-accent-a border-r-2 border-widget-accent-a' : 'text-ui-text-primary'
            }`}
          >
            {section.icon && <div className="text-ui-text-secondary">{section.icon}</div>}
            <div>
              <span className="font-medium">{section.title}</span>
            </div>
          </button>
        ))}
      </Category>
    );
  };

  return (
    <div className="w-64 h-full bg-ui-bg-primary-light border-r border-ui-border-primary p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-ui-text-primary mb-2">Настройки</h2>
      </div>
      
      <div className="space-y-1">
        {settingsGroups.map(group => renderSettingsGroup(group))}
      </div>
    </div>
  );
};

export { SettingsSidebar };
