"use client";

import React from "react";

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string | null;
}

export function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}: SignOutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#0d1117]/95 border border-white/10 rounded-2xl shadow-2xl p-6 text-white backdrop-blur-2xl">
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
          <span className="material-symbols-outlined text-2xl">logout</span>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold tracking-tight text-on-surface">
            Sign Out of GitVideo?
          </h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {userName ? `Signed in as ${userName}. ` : ""}
            Are you sure you want to sign out? Your 2-day session will end, and you'll need to log in again to generate video walkthroughs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-white/10 text-gray-300 hover:text-white font-medium text-xs transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02]"
          >
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

