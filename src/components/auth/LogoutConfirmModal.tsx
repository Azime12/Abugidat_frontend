"use client";

import { LogOut, X } from "lucide-react";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmModal({ open, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 pr-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <LogOut size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2D2A32]">Log out?</h3>
            <p className="mt-1 text-sm text-gray-500">
              You&apos;ll need to log in again to access your account.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
