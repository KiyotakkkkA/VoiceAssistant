interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  model?: string;
  placeholder?: string;
}

const TextInput: React.FC<TextFieldProps> = ({ label, className, model, placeholder }) => {
  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 text-sm font-medium text-ui-text-secondary">{label}</label>}
      <input
        placeholder={placeholder}
        className={`px-3 py-2 focus:bg-input-focus bg-input-bg text-ui-text-primary border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-ui-accent ${className}`}
        value={model}
      />
    </div>
  );
};

export { TextInput };
