"use client";

import React, { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    // Create a synthetic event that matches React.ChangeEvent<HTMLSelectElement>
    const syntheticEvent = {
      target: {
        name,
        value: optionValue,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative">
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full items-center rounded-xl border-2 ${
          error
            ? "border-[#F95A2C]"
            : "border-[#18191F] dark:border-gray-300"
        } ${
          disabled
            ? "bg-gray-100 cursor-not-allowed shadow-none"
            : "bg-white dark:bg-gray-800 cursor-pointer"
        } text-left transition-all duration-150`}
      >
        {/* Text area */}
        <span
          className={`flex-1 pl-6 py-3.5 text-sm font-medium ${
            selectedOption
              ? "text-[#18191F] dark:text-gray-100"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Yellow chevron section */}
        <div
          className="flex h-full items-center justify-center w-12 py-3.5 bg-[#56CCA9] rounded-r-[10px] border-l-2 border-[#18191F]"
        >
          <svg
            className={`w-5 h-5 text-[#18191F] transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu - using portal-like fixed positioning to avoid overflow issues */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`absolute z-50 mt-2 w-full rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 ease-out origin-top ${
          isOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
        }`}
        style={{
          position: 'absolute',
          top: '100%',
        }}
      >
        <ul className="max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-6 py-3 text-left text-sm font-medium transition-colors duration-150 ${
                  option.value === value
                    ? "bg-[#56CCA9] text-[#18191F] font-bold"
                    : "text-[#18191F] dark:text-gray-100 hover:bg-[#56CCA9]/30"
                } ${
                  index !== options.length - 1
                    ? "border-b-2 border-[#18191F] dark:border-gray-700"
                    : ""
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Select;
