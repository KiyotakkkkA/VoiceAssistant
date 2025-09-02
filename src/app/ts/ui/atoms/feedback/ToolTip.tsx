import React, { useState } from 'react';
import { IconWarning, IconError, IconInfo } from '../icons';

interface ToolTipProps {
  type?: 'info' | 'warning' | 'danger';
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const getArrowPosition = (position: 'top' | 'bottom' | 'left' | 'right') => {
  const arrowPositions = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2',
    left: 'right-[-6px] top-1/2 -translate-y-1/2',
    right: 'left-[-6px] top-1/2 -translate-y-1/2'
  };
  return arrowPositions[position];
};

const ToolTip: React.FC<ToolTipProps> = ({ type = 'info', content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const typeStyles = {
    info: {
      icon: (
        <IconInfo size={16} />
      ),
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      border: 'border-blue-500'
    },
    warning: {
      icon: (
        <IconWarning size={16} />
      ),
      bg: 'bg-yellow-500',
      text: 'text-yellow-500',
      border: 'border-yellow-500'
    },
    danger: {
      icon: (
        <IconError size={16} />
      ),
      bg: 'bg-red-500',
      text: 'text-red-500',
      border: 'border-red-500'
    }
  };

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  };

  const currentType = typeStyles[type];

  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex"
      >
        {children}
      </div>

      {isVisible && (
        <div 
          className={`absolute z-50 w-64 p-3 text-sm text-ui-text-primary bg-ui-bg-secondary border ${currentType.border} rounded-lg shadow-lg ${positionClasses[position]}`}
          role="tooltip"
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 mt-0.5 ${currentType.text}`}>
              {currentType.icon}
            </div>
            <div className="ml-2">
              {content}
            </div>
          </div>
          <div className={`absolute w-3 h-3 bg-ui-bg-secondary border-l border-b border-ui-border-primary transform rotate-45 ${getArrowPosition(position)}`}></div>
        </div>
      )}
    </div>
  );
};

export { ToolTip };