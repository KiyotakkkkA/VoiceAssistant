import React, { useState } from 'react';
import { Category } from '../../atoms';

interface SettingsTab {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: SettingsTab[];
}

interface Props {
  onTabSelect: (tabId: string) => void;
  activeTab: string;
}

const SettingsSidebar: React.FC<Props> = ({ onTabSelect, activeTab }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['appearance'])
  );

  const settingsTabs: SettingsTab[] = [
    {
      id: 'appearance',
      title: 'Внешний вид',
      children: [
        {
          id: 'themes',
          title: 'Темы',
        }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleTabClick = (tabId: string, hasChildren: boolean = false) => {
    if (!hasChildren) {
      onTabSelect(tabId);
    }
  };

  const renderSettingsTab = (tab: SettingsTab, level: number = 0) => {
    const hasChildren = tab.children && tab.children.length > 0;
    const isExpanded = expandedCategories.has(tab.id);
    const isActive = activeTab === tab.id;

    if (hasChildren) {
      return (
        <Category
          key={tab.id}
          title={tab.title}
          icon={tab.icon}
          isExpanded={isExpanded}
          onToggle={() => toggleCategory(tab.id)}
        >
          {tab.children!.map(child => renderSettingsTab(child, level + 1))}
        </Category>
      );
    }

    return (
      <button
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-ui-text-secondary/10 transition-colors rounded-sm ${
          isActive ? 'bg-widget-accent-a/10 text-widget-accent-a border-r-2 border-widget-accent-a' : 'text-ui-text-primary'
        }`}
      >
        {tab.icon && <div className="text-ui-text-secondary">{tab.icon}</div>}
        <span className="font-medium">{tab.title}</span>
      </button>
    );
  };

  return (
    <div className="w-64 h-full border-r border-sidebars-border p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-ui-text-primary mb-2">Настройки</h2>
      </div>
      
      <div className="space-y-1">
        {settingsTabs.map(tab => renderSettingsTab(tab))}
      </div>
    </div>
  );
};

export { SettingsSidebar };
