"use client";

import React, { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { createPortal } from "react-dom";

export type TooltipPosition = "top" | "bottom" | "left" | "right" | "auto";

export interface TooltipProps {
  /** The text content or React element to render inside the tooltip popup */
  content: ReactNode;
  /** Optional title header inside the tooltip popup */
  title?: string;
  /** Optional icon to display next to the content/title */
  icon?: ReactNode;
  /** The target element or string that triggers the tooltip. Optional if content is string. */
  children?: ReactNode;
  /** Max length of trigger text before auto-truncating (e.g. maxLength={20}) */
  maxLength?: number;
  /** Alias for maxLength (e.g. truncate={20}) */
  truncate?: number;
  /** Preferred position (default: "auto") */
  position?: TooltipPosition;
  /** Optional delay before showing tooltip in ms (default: 100) */
  delay?: number;
  /** Custom max width class for the tooltip popup box (default: "max-w-xs") */
  maxWidth?: string;
  /** Additional custom classes for trigger container or shorthand element */
  className?: string;
  /** Whether to show arrow indicator (default: true) */
  arrow?: boolean;
  /** Vibrant accent bar at top edge (default: true) */
  accent?: boolean;
}

/** Recursively extract plain text from ReactNode (including arrays, elements, strings) */
function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    return extractText((node.props as any).children);
  }
  return "";
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  icon,
  children,
  maxLength,
  truncate,
  position = "auto",
  delay = 100,
  maxWidth = "max-w-xs",
  className = "",
  arrow = true,
  accent = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    actualPos: "top" | "bottom" | "left" | "right";
  }>({
    top: 0,
    left: 0,
    actualPos: "top",
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const limit = maxLength ?? truncate;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const viewportHeight = window.innerHeight;

    let targetPos: "top" | "bottom" | "left" | "right" =
      position === "auto" ? "top" : position;

    // Smart Auto Flip if close to top or bottom viewport edges
    if (position === "top" || position === "auto") {
      if (rect.top < 85) targetPos = "bottom";
      else targetPos = "top";
    } else if (position === "bottom") {
      if (viewportHeight - rect.bottom < 85) targetPos = "top";
      else targetPos = "bottom";
    }

    let top = 0;
    let left = 0;
    const gap = 8; // Gap between trigger element and tooltip

    if (targetPos === "top") {
      top = rect.top + scrollY - gap;
      left = rect.left + scrollX + rect.width / 2;
    } else if (targetPos === "bottom") {
      top = rect.bottom + scrollY + gap;
      left = rect.left + scrollX + rect.width / 2;
    } else if (targetPos === "left") {
      top = rect.top + scrollY + rect.height / 2;
      left = rect.left + scrollX - gap;
    } else if (targetPos === "right") {
      top = rect.top + scrollY + rect.height / 2;
      left = rect.right + scrollX + gap;
    }

    setCoords({ top, left, actualPos: targetPos });
  }, [position]);

  const showTooltip = () => {
    if (limit && limit > 0) {
      const rawTarget = children ?? content;
      const fullText = extractText(rawTarget);
      if (!fullText || fullText.length <= limit) return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updatePosition();
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      window.addEventListener("scroll", updatePosition, { passive: true });
      window.addEventListener("resize", updatePosition, { passive: true });
      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  // Smart resolution of trigger content with automatic truncation support
  const renderTriggerNode = () => {
    const rawTarget = children ?? content;

    if (!limit || limit <= 0) {
      return children ?? rawTarget;
    }

    // Extract all text content from the trigger node or raw target
    const fullText = extractText(rawTarget);

    if (fullText && fullText.length > limit) {
      const truncatedText = `${fullText.slice(0, limit)}...`;

      // If shorthand without children (e.g. <Tooltip content="Long text" maxLength={20} />)
      if (!children) {
        return <span className={`cursor-pointer ${className}`}>{truncatedText}</span>;
      }

      // If children is a React Element (e.g. <p>“{fb.content}”</p>)
      if (React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {}, truncatedText);
      }

      // If children is string or array of strings
      return truncatedText;
    }

    return children ?? rawTarget;
  };

  if (!content) return <>{children}</>;

  const transformStyles: Record<"top" | "bottom" | "left" | "right", string> = {
    top: "-translate-x-1/2 -translate-y-full",
    bottom: "-translate-x-1/2 translate-y-0",
    left: "-translate-x-full -translate-y-1/2",
    right: "translate-x-0 -translate-y-1/2",
  };

  const arrowPosStyles: Record<"top" | "bottom" | "left" | "right", string> = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-[1px] border-t-slate-900 dark:border-t-slate-950 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-[1px] border-b-slate-900 dark:border-b-slate-950 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 -ml-[1px] border-l-slate-900 dark:border-l-slate-950 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 -mr-[1px] border-r-slate-900 dark:border-r-slate-950 border-y-transparent border-l-transparent",
  };

  return (
    <span
      ref={triggerRef}
      className="inline-flex items-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {renderTriggerNode()}

      {mounted &&
        isVisible &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            className={`z-[99999] pointer-events-none ${transformStyles[coords.actualPos]}`}
          >
            <div
              className={`relative overflow-hidden rounded-xl bg-slate-900/95 p-3 text-xs text-slate-100 shadow-2xl shadow-black/40 dark:bg-slate-950/95 ring-1 ring-white/15 backdrop-blur-md whitespace-normal break-words ${maxWidth} animate-in fade-in-0 zoom-in-95 duration-150 transform transition-all`}
            >
              {/* Vibrant Accent Gradient Top Bar */}
              {accent && (
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              )}

              {/* Title Header with optional Icon */}
              {(title || icon) && (
                <div className="flex items-center gap-1.5 font-bold text-[12px] text-white mb-1.5">
                  {icon && <span className="text-blue-400 shrink-0">{icon}</span>}
                  {title && <span>{title}</span>}
                </div>
              )}

              {/* Main Content */}
              <div className="font-normal leading-relaxed text-slate-200 text-[11px]">
                {content}
              </div>

              {/* Pointer Arrow */}
              {arrow && (
                <span
                  aria-hidden="true"
                  className={`absolute border-[5px] border-solid ${arrowPosStyles[coords.actualPos]}`}
                />
              )}
            </div>
          </div>,
          document.body
        )}
    </span>
  );
};

export interface TruncatedCellProps {
  text?: string | null;
  maxLength?: number;
  className?: string;
  children?: ReactNode;
}

export const TruncatedCell: React.FC<TruncatedCellProps> = ({
  text,
  maxLength = 20,
  className = "",
  children,
}) => {
  const contentText = text || (typeof children === "string" ? children : "");
  if (!contentText) return <>{children || "—"}</>;

  return (
    <Tooltip content={contentText} maxLength={maxLength} className={className}>
      {children}
    </Tooltip>
  );
};
