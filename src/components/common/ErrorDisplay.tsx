"use client";

import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  fullScreen?: boolean;
}

export default function ErrorDisplay({
  title = "Error",
  message = "Something went wrong. Please try again.",
  onRetry,
  retryText = "Try Again",
  fullScreen = false,
}: ErrorDisplayProps) {
  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex-1 flex items-center justify-center";

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={containerClass}>
      <div className="max-w-md mx-auto">
        <div className="bg-white border-2 border-[#FF4B1E] rounded-xl p-8 text-center shadow-[4px_4px_0_0_#FF4B1E]">
          <AlertCircle className="h-12 w-12 text-[#FF4B1E] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#18191F] mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <Button onClick={handleRetry}>{retryText}</Button>
        </div>
      </div>
    </div>
  );
}
