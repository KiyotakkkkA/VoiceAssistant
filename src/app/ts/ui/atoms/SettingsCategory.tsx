import React, { useState } from 'react';

interface Props {
  title: string;
  icon?: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

const SettingsCategory: React.FC<Props> = ({ 
  title, 
  icon, 
  isExpanded = false, 
  onToggle, 
  children 
}) => {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-ui-text-secondary/10 transition-colors rounded-sm ${
          isExpanded ? 'bg-ui-text-secondary/5' : ''
        }`}
      >
        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-ui-text-secondary">
            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
        {icon && <div className="text-ui-text-secondary">{icon}</div>}
        <span className="text-ui-text-primary font-medium">{title}</span>
      </button>
      {isExpanded && (
        <div className="pl-8 mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default SettingsCategory;
