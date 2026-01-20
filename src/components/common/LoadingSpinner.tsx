"use client";

import Image from "next/image";

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

export default function LoadingSpinner({
  text = "Loading...",
  size = "md",
  fullScreen = false,
}: LoadingSpinnerProps) {
  // fullScreen: for loading states that replace the entire page (e.g., auth check)
  // default: for loading states within a page layout (centers in available space)
  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center bg-[#FFFBEA] dark:bg-gray-900"
    : "flex-1 min-h-[50vh] flex items-center justify-center";

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <div className="relative mx-auto animate-bounce" style={{ width: "fit-content" }}>
          {/* Logo avec animation de pulsation */}
          <div className={`${sizeClasses[size]} animate-pulse-slow`}>
            <Image
              src="/images/logo/Logo-4hacks.svg"
              alt="4Hacks Logo"
              width={size === "sm" ? 48 : size === "md" ? 80 : 112}
              height={size === "sm" ? 48 : size === "md" ? 80 : 112}
              className="w-full h-full"
            />
          </div>
          {/* Cercle de rotation autour du logo */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${sizeClasses[size]} border-4 border-transparent border-t-[#56CCA9] border-r-[#FFBD12] rounded-full animate-spin`}
            style={{ width: size === "sm" ? "60px" : size === "md" ? "100px" : "140px", height: size === "sm" ? "60px" : size === "md" ? "100px" : "140px" }}
          ></div>
        </div>
        {text && (
          <p className="text-gray-600 dark:text-gray-400 font-medium text-center animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
