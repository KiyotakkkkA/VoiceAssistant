import React from 'react';

interface WidgetCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  gradientColor?: string;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ 
  title, 
  icon, 
  children, 
  className = '',
  gradientColor = 'rgba(0,122,204,0.35)'
}) => {
  return (
    <div className={`pointer-events-none z-10 ${className}`}>
      <div className='clock-card border border-ui-border-primary bg-ui-bg-secondary/95 relative px-5 py-3 rounded-lg shadow-[0_4px_18px_-6px_rgba(0,0,0,0.45)] backdrop-blur-md min-w-[172px] overflow-hidden'>
        <div 
          className='absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_80%_15%,transparent_60%)]'
          style={{ background: `radial-gradient(circle_at_80%_15%,${gradientColor},transparent_60%)` }}
        />
        <div className='relative'>
          <div className='flex items-center justify-between mb-1'>
            <div className='text-[10px] tracking-[0.2em] uppercase text-widget-muted font-medium'>{title}</div>
            {icon}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
