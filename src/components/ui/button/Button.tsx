import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline" | "success" | "warning" | "danger"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Additional classes
  type?: "button" | "submit" | "reset"; // Button type
}



const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-6 py-3 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-[#FF4B1E] text-white disabled:bg-[#ff7a5c]",
    outline:
      "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300",
    success:
      "bg-[#56CCA9] hover:bg-[#45B894] text-white disabled:bg-[#8ce1d0]",
    warning:
      "bg-[#FFBD12] hover:bg-[#FEC929] text-[#18191F] disabled:bg-[#ffe88c]",
    danger:
      "bg-[#F95A2C] hover:bg-[#E84A1C] text-white disabled:bg-[#fc917a]",
  };


  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-semibold gap-2 rounded-xl border-2 border-[#18191F] shadow-[4px_4px_0_0_#18191F] hover:shadow-[2px_2px_0_0_#18191F] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-150 ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
