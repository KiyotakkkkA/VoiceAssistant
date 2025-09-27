import React from 'react';

interface CheckboxSimpleProps {
    className?: string;
    model?: boolean;
    onChange?: (value: boolean) => void;
}

const CheckboxSimple: React.FC<CheckboxSimpleProps> = ({ className, model, onChange, ...rest }) => {
  return (
    <div className="flex flex-col">
      <input
        type="checkbox"
        className={`focus:bg-input-focus bg-ui-bg-secondary-light text-ui-text-primary border border-ui-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-ui-accent ${className}`}
        checked={model}
        onChange={(event) => onChange && onChange(event.target.checked)}
        {...rest}
      />
    </div>
  );
};

export { CheckboxSimple };
