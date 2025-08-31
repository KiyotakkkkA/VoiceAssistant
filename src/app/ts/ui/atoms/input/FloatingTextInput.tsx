import React, { useState } from "react";

interface FloatingTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

const FloatingTextInput: React.FC<FloatingTextInputProps> = ({
  label,
  className = "",
  value,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  const hasValue = value !== undefined && value !== "";

  return (
    <div className={`relative ${className}`}>
      <input
        {...rest}
        value={value}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        className={`
          w-full h-[48px] px-3 rounded-md border
          bg-ui-bg-secondary-light text-ui-text-primary border-ui-border-primary
          focus:outline-none focus:ring-2 focus:ring-ui-accent
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      />
      <label
        className={`
          absolute left-3 -translate-y-1/2 px-1 pointer-events-none
          transition-all duration-200 ease-in-out
          ${focused || hasValue
            ? "-top-2 left-2 text-sm font-semibold scale-90 bg-ui-bg-primary rounded-md text-ui-accent translate-y-0"
            : "top-1/2 text-base text-ui-text-secondary/70"
          }
        `}
      >
        {label}
      </label>
    </div>
  );
};

export { FloatingTextInput };
