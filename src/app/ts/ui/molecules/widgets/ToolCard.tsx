import React from 'react';
import { IconSettings } from '../../atoms/icons';

interface ToolCardProps {
  name: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ 
  name, 
}) => {
  return (
    <div className={`
      group relative py-2 px-4 rounded-xl transition-all duration-200 bg-ui-bg-primary-light border border-ui-border-primary
      hover:shadow-md hover:-translate-y-0.5
    `}>
      <div className="flex items-center gap-4">
        <IconSettings size={16} className='text-blue-500'/>
        <span className="text-md text-ui-text-muted font-mono px-2 py-0.5 rounded">
        {name}
        </span>
      </div>
    </div>
  );
};

export { ToolCard };
