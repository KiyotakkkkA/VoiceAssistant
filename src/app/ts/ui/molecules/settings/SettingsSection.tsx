import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-ui-text-primary mb-4 pb-2 border-b border-ui-border-primary/20">
        {title}
      </h3>
      <div className="space-y-0">
        {children}
      </div>
    </div>
  );
};

export { SettingsSection };
