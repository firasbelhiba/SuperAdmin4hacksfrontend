"use client";

import * as React from "react";
import { useRef, useEffect, useState } from "react";

export const Accordion = ({
  children,
  className = "",
  type: _type,
  collapsible: _collapsible,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "single" | "multiple";
  collapsible?: boolean;
}) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};

export const AccordionItem = ({
  value,
  children,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`rounded-xl border-2 border-[#18191F] dark:border-gray-300 bg-white dark:bg-gray-900 ${className}`}
    >
      {children}
    </div>
  );
};

export const AccordionTrigger = ({
  children,
  onClick = () => {},
  isOpen,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isOpen?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl flex justify-between items-center px-6 py-4 text-left text-[#18191F] dark:text-gray-100 font-bold text-base hover:bg-[#E6FF7B]/20 transition-colors duration-200"
    >
      <span>{children}</span>
      <span
        className={`text-xl transition-transform duration-300 ease-out ${
          isOpen ? "rotate-45" : "rotate-0"
        }`}
      >
        +
      </span>
    </button>
  );
};

export const AccordionContent = ({
  children,
  isOpen,
  className = "",
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  className?: string;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      // Add extra height for dropdowns that may extend beyond content
      setHeight(contentRef.current.scrollHeight + 300);
    }
  }, [children]);

  // Update height when opening
  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight + 300);
    }
  }, [isOpen]);

  return (
    <div
      style={{
        maxHeight: isOpen ? `${height}px` : "0px",
        opacity: isOpen ? 1 : 0,
        overflow: isOpen ? "visible" : "hidden",
        transition: "max-height 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-in-out",
      }}
    >
      <div ref={contentRef} className={`px-6 pb-6 pt-2 ${className}`}>
        {children}
      </div>
    </div>
  );
};
