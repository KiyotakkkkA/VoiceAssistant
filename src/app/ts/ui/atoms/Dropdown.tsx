import React, { useState, useRef, useEffect } from 'react';


interface Props {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Dropdown: React.FC<Props> = ({ options, value, onChange, placeholder = "Выберите..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-w-32 px-3 py-2 text-left bg-ui-text-secondary/5 hover:bg-ui-text-secondary/10 border border-ui-border-primary/70 rounded-md transition-colors text-sm text-ui-text-primary focus:outline-none focus:ring-2 focus:ring-widget-accent-a/30"
      >
        <div className="flex items-center justify-between">
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`ml-2 text-ui-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-sidebars-bg border border-ui-border-primary/20 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-left hover:bg-ui-text-secondary/10 transition-colors text-sm first:rounded-t-md last:rounded-b-md ${
                value === option.value ? 'bg-widget-accent-a/10 text-widget-accent-a' : 'text-ui-text-primary'
              }`}
            >
              <div>
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-ui-text-secondary mt-1">{option.description}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { Dropdown };
