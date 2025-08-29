import React from 'react';

interface SlidedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SlidedCheckbox: React.FC<SlidedCheckboxProps> = ({ 
  checked, 
  onChange, 
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      container: 'w-10 h-5',
      toggle: 'w-4 h-4',
      translate: checked ? 'translate-x-5' : 'translate-x-0.5'
    },
    md: {
      container: 'w-12 h-6',
      toggle: 'w-5 h-5',
      translate: checked ? 'translate-x-6' : 'translate-x-0.5'
    },
    lg: {
      container: 'w-14 h-7',
      toggle: 'w-6 h-6',
      translate: checked ? 'translate-x-7' : 'translate-x-0.5'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-full transition-all duration-200 ease-in-out
        ${currentSize.container}
        ${checked 
          ? 'bg-ui-bg-secondary-light border border-ui-border-primary shadow-[0_0_0_2px_rgba(var(--color-ui-accent),0.2)]' 
          : 'bg-ui-bg-primary border border-ui-border-primary'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:shadow-[0_0_0_3px_rgba(var(--color-ui-accent),0.15)]'
        }
        focus:outline-none focus:ring-2 focus:ring-ui-accent/50 focus:ring-offset-2 focus:ring-offset-ui-bg-primary
      `}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`
          inline-block rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm
          ${currentSize.toggle}
          ${currentSize.translate}
          ${disabled ? 'bg-gray-300' : ''}
        `}
      />
    </button>
  );
};

export { SlidedCheckbox };
