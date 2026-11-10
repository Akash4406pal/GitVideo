"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  userName?: string | null;
  isSigningOut?: boolean;
}

export function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  userName,
  isSigningOut = false,
}: SignOutConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSigningOut) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSigningOut, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const displayName = user?.name || userName || "Developer";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => {
        if (!isSigningOut) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
    >
      <div
        className="relative w-full max-w-sm bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-2xl p-6 text-white backdrop-blur-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSigningOut}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-40 cursor-pointer"
          aria-label="Close dialog"
        >
          <span className="material-symbols-outlined text-lg leading-none">close</span>
        </button>

        {/* Warning / Logout Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4 shadow-lg shadow-red-500/10">
          <span className="material-symbols-outlined text-2xl">logout</span>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-5">
          <h3
            id="signout-modal-title"
            className="text-lg font-bold tracking-tight text-white"
          >
            Sign Out of GitVideo?
          </h3>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Are you sure you want to sign out? Your active session will end, and you'll need to log in again to generate video walkthroughs.
          </p>
        </div>

        {/* User Account Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161b22] border border-[#30363d] mb-5 text-left">
          {user?.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-9 h-9 rounded-full border border-[#30363d] object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {displayName}
            </p>
            {user?.email ? (
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            ) : (
              <p className="text-[11px] text-purple-400/80 font-mono">Active Session</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSigningOut}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#363b42] text-gray-300 hover:text-white font-medium text-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSigningOut}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSigningOut ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Yes, Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
