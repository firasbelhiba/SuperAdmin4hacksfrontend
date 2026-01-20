import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-gray-950 flex items-center justify-center p-8 transition-colors">
      <ThemeProvider>
        <div className="flex gap-8 items-center max-w-7xl w-full">
          {/* Left Side - Hero */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#4B4FDD] to-[#4B4FDD] dark:from-[#9713C9] dark:to-[#FCFAF7] rounded-[40px] p-16 min-h-[600px] items-end justify-start relative overflow-hidden">
            {/* Lightning Bolt */}
            <div className="absolute -top-10 -right-20 w-[500px] h-[300px]">
              <Image
                src="/images/green.svg"
                alt="Lightning bolt"
                width={500}
                height={300}
                className="w-full h-full drop-shadow-2xl"
              />
            </div>

            {/* Text */}
            <div className="relative z-10 text-white">
              <h1 className="text-6xl font-bold leading-tight">
                Your Next<br />
                Breakthrough<br />
                Starts Here.
              </h1>
            </div>
          </div>

          {/* Right Side - Form Card */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[420px] bg-white dark:bg-gray-900 rounded-2xl border-[3px] border-[#18191F] dark:border-brand-700 shadow-[8px_8px_0_0_#18191F] dark:shadow-[8px_8px_0_0_var(--color-brand-700)] p-4 transition-all">
              {children}
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeTogglerTwo />
        </div>
      </ThemeProvider>
    </div>
  );
}
