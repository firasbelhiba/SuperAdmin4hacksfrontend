import React, { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  hint?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const {
    placeholder = "Enter your message",
    rows = 3,
    className = "",
    disabled = false,
    error = false,
    hint,
    ...rest
  } = props;

  let textareaClasses = `w-full rounded-xl border-2 px-6 py-3.5 text-sm font-medium focus:outline-none transition-all duration-150 resize-none ${className}`;

  if (disabled) {
    textareaClasses += ` bg-gray-100 text-gray-500 border-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600`;
  } else if (error) {
    textareaClasses += ` bg-white text-[#18191F] border-[#F95A2C] dark:bg-gray-800 dark:text-gray-100 dark:border-[#F95A2C]`;
  } else {
    textareaClasses += ` bg-white text-[#18191F] border-[#18191F] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-300`;
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={textareaClasses}
        {...rest}
      />
      {hint && (
        <p
          className={`mt-1.5 text-xs font-medium ${
            error ? "text-[#F95A2C]" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = "TextArea";

export default TextArea;
