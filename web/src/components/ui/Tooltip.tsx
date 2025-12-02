"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

/**
 * Simple, accessible tooltip component
 * Shows tooltip on hover and focus for keyboard navigation
 */
export function Tooltip({
  content,
  children,
  position = "top",
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setShowTooltip(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleFocus = () => {
    setIsVisible(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, delay);
  };

  const handleBlur = () => {
    setIsVisible(false);
    setShowTooltip(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-t-transparent border-b-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && showTooltip && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
        >
          <div className="relative rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 shadow-lg ring-1 ring-slate-700/50 w-[240px]">
            <p className="leading-relaxed">{content}</p>
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
}

