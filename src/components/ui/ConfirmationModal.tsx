"use client";

import { ReactNode, useEffect } from "react";
import {
  X, Loader2, AlertTriangle, Trash2, CheckCircle2, ShieldAlert,
} from "lucide-react";

export type ConfirmationVariant = "danger" | "warning" | "success" | "info";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
  icon?: ReactNode;
}

const variantConfig: Record<
  ConfirmationVariant,
  {
    iconBg: string;
    iconColor: string;
    buttonBg: string;
    buttonHover: string;
    DefaultIcon: typeof Trash2;
  }
> = {
  danger: {
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    buttonBg: "bg-red-600",
    buttonHover: "hover:bg-red-700",
    DefaultIcon: Trash2,
  },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    buttonBg: "bg-amber-600",
    buttonHover: "hover:bg-amber-700",
    DefaultIcon: AlertTriangle,
  },
  success: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    buttonBg: "bg-[#0096D6]",
    buttonHover: "hover:bg-[#007FB8]",
    DefaultIcon: CheckCircle2,
  },
  info: {
    iconBg: "bg-[#E8F4F8]",
    iconColor: "text-[#0096D6]",
    buttonBg: "bg-[#0096D6]",
    buttonHover: "hover:bg-[#007FB8]",
    DefaultIcon: ShieldAlert,
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
  icon,
}: ConfirmationModalProps) {
  // Escape key closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const cfg = variantConfig[variant];
  const Icon = cfg.DefaultIcon;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="p-6 pr-12">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${cfg.iconBg} ${cfg.iconColor}`}
            >
              {icon || <Icon size={24} />}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1 pt-1">
              <h3
                id="confirm-title"
                className="text-lg font-bold leading-snug text-[#2D2A32]"
              >
                {title}
              </h3>
              {message && (
                <div className="mt-2 text-sm leading-relaxed text-gray-600">
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg ${cfg.buttonBg} ${cfg.buttonHover} px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
