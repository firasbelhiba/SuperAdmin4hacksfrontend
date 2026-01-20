"use client";

import { useSidebar } from "@/context/SidebarContext";
import { SelectedUserProvider } from "@/context/SelectedUserContext";
import useAuthGuard from "@/hooks/useAuthGuard";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import React from "react";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isLoading, isReady } = useAuthGuard();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[280px]"
    : "lg:ml-[90px]";

  if (isLoading || !isReady) {
    return <LoadingSpinner text="Loading..." fullScreen />;
  }

  return (
    <SelectedUserProvider>
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />
        <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
          <AppHeader />
          <div className="p-4 h-max mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
        </div>
      </div>
    </SelectedUserProvider>
  );
}
