import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    type = "text",
    placeholder,
    className = "",
    min,
    max,
    step,
    disabled = false,
    success = false,
    error = false,
    hint,
    ...rest
  } = props;

  let inputClasses = `w-full rounded-xl border-2 border-[#18191F] appearance-none px-6 py-3.5 text-sm font-medium placeholder:text-gray-400 focus:outline-none transition-all duration-150 bg-white dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600`;
  } else if (error) {
    inputClasses += ` text-[#18191F] border-[#F95A2C] dark:text-gray-100 dark:border-[#F95A2C]`;
  } else if (success) {
    inputClasses += ` text-success-500 border-success-500 dark:text-success-400 dark:border-success-500`;
  } else {
    inputClasses += ` text-[#18191F] dark:text-gray-100 dark:border-gray-300`;
  }

  return (
    <div className="relative">
      <input
        ref={ref} // <-- Forward the ref
        type={type}
        placeholder={placeholder}
        className={inputClasses}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        {...rest} // include onChange, value, name, defaultValue, etc.
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs font-medium ${
            error ? "text-[#F95A2C]" : success ? "text-success-500" : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;