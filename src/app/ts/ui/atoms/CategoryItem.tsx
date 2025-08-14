import React from 'react';

interface Props {
  label: string | React.ReactNode;
  description?: string | React.ReactNode;
  children: React.ReactNode;
}

const CategoryItem: React.FC<Props> = ({ label, description, children }) => {
  return (
    <div className="py-3 border-b border-ui-text-secondary/10 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-ui-text-primary mb-1">
            {label}
          </label>
          {description && (
            <div className="text-xs text-ui-text-secondary leading-relaxed">
              {description}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 min-w-0 max-w-xs">
          {children}
        </div>
      </div>
    </div>
  );
};

export { CategoryItem };
