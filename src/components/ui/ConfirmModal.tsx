"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
  children
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-9999"
        onClick={onCancel}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#18191F] dark:border-brand-700 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-[#18191F] dark:text-gray-100 mb-2">
            {title}
          </h3>

          <p className="text-[#18191F]/70 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Custom content (e.g., form fields) */}
          {children && (
            <div className="mb-6">
              {children}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-5 py-2.5 bg-white border-2 border-[#18191F] text-[#18191F] font-bold rounded-xl
                         shadow-[2px_2px_0_0_#18191F] hover:shadow-[1px_1px_0_0_#18191F]
                         hover:translate-x-px hover:translate-y-px
                         transition-all duration-150 disabled:opacity-50"
            >
              {cancelLabel}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-5 py-2.5 bg-[#F95A2C] border-2 border-[#18191F] text-white font-bold rounded-xl
                         shadow-[2px_2px_0_0_#18191F] hover:shadow-[1px_1px_0_0_#18191F]
                         hover:translate-x-px hover:translate-y-px
                         transition-all duration-150 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}
