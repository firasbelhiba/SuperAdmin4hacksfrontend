"use client";

import React, { useRef, useEffect, useState } from "react";

interface CollapsibleContentProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  isOpen,
  children,
  className = "",
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      // Add extra height for dropdowns that may extend beyond content
      setHeight(contentRef.current.scrollHeight + 300);
    }
  }, [children]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Recalculate height when opening (with extra space for dropdowns)
      setHeight(contentRef.current.scrollHeight + 300);
    }
  }, [isOpen]);

  return (
    <div
      style={{
        maxHeight: isOpen ? `${height}px` : "0px",
        opacity: isOpen ? 1 : 0,
        overflow: isOpen ? "visible" : "hidden",
        transition: "max-height 300ms ease-out, opacity 300ms ease-out",
      }}
    >
      <div ref={contentRef} className={className}>
        {children}
      </div>
    </div>
  );
};

export default CollapsibleContent;
