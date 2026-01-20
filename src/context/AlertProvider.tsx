"use client";

import Alert from "@/components/ui/alert/Alert";
import React, { createContext, useContext, useState, ReactNode } from "react";

type Variant = "success" | "error" | "warning" | "info";

interface AlertState {
  visible: boolean;
  variant: Variant;
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}

interface AlertContextType {
  showAlert: (
    variant: Variant,
    title: string,
    message: string,
    options?: {
      showLink?: boolean;
      linkHref?: string;
      linkText?: string;
      duration?: number;
    }
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    variant: "success",
    title: "",
    message: "",
  });

  const showAlert = (
    variant: Variant,
    title: string,
    message: string,
    options?: {
      showLink?: boolean;
      linkHref?: string;
      linkText?: string;
      duration?: number;
    }
  ) => {
    setAlert({
      visible: true,
      variant,
      title,
      message,
      showLink: options?.showLink,
      linkHref: options?.linkHref,
      linkText: options?.linkText,
    });

    setTimeout(() => {
      setAlert((prev) => ({ ...prev, visible: false }));
    }, options?.duration || 3500);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {alert.visible && (
        <div className="fixed top-6 right-6 z-[9999] w-[320px] animate-slide-in">
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            showLink={alert.showLink}
            linkHref={alert.linkHref}
            linkText={alert.linkText}
          />
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used inside AlertProvider");
  return context;
};
