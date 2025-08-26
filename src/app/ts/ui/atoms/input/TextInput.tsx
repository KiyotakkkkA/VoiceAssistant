import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  model?: string;
  placeholder?: string;
}

const TextInput: React.FC<TextFieldProps> = ({ label, className='', model, placeholder, ...rest }) => {
  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 text-sm font-medium text-ui-text-secondary">{label}</label>}
      <input
        placeholder={placeholder}
        className={`px-3 py-2 focus:bg-input-focus bg-ui-bg-secondary-light text-ui-text-primary border border-ui-border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-ui-accent ${className}`}
        value={model}
        {...rest}
      />
    </div>
  );
};

export { TextInput };
