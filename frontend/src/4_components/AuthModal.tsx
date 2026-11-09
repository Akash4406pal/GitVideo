"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function AuthModal({ isOpen, onClose, reason }: AuthModalProps) {
  const [isSigningIn, setIsSigningIn] = useState<string | null>(null);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSigningIn) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSigningIn, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    try {
      setIsSigningIn(provider);
      await signIn(provider, { callbackUrl: window.location.href });
    } catch {
      setIsSigningIn(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSigningIn) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-[#0b0e14] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
          aria-label="Close"
          disabled={Boolean(isSigningIn)}
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 mb-3 shadow-lg shadow-purple-500/10">
            <span className="material-symbols-outlined text-2xl">shield_person</span>
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold tracking-tight">Verified Sign In</h2>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            {reason || "Sign in with GitHub or Google to access GitVideo and generate high-fidelity AI codebase walkthroughs."}
          </p>
        </div>

        {/* Security / Anti-Abuse Notice */}
        <div className="mb-6 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2.5 text-xs text-purple-200">
          <span className="material-symbols-outlined text-[18px] text-purple-400 shrink-0 mt-0.5">verified_user</span>
          <div className="leading-snug">
            <p className="font-semibold text-purple-300">OAuth Verification Enforced</p>
            <p className="text-[11px] text-purple-300/80 mt-0.5">
              Anonymous and mock credentials are fully disabled to protect AI compute instances and prevent token depletion. Free tier includes 3 full videos daily.
            </p>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          {/* GitHub Button */}
          <button
            onClick={() => handleOAuthSignIn("github")}
            disabled={Boolean(isSigningIn)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-white/10 text-white font-medium text-sm transition-all shadow-sm hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
          >
            {isSigningIn === "github" ? (
              <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            <span>{isSigningIn === "github" ? "Redirecting to GitHub..." : "Continue with GitHub"}</span>
          </button>

          {/* Google Button */}
          <button
            onClick={() => handleOAuthSignIn("google")}
            disabled={Boolean(isSigningIn)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-medium text-sm transition-all shadow-sm hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
          >
            {isSigningIn === "google" ? (
              <span className="material-symbols-outlined text-lg animate-spin text-gray-700">refresh</span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
            )}
            <span>{isSigningIn === "google" ? "Redirecting to Google..." : "Continue with Google"}</span>
          </button>
        </div>

        {/* Session Policy Info */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">schedule</span>
            <span>2-day persistent JWT session</span>
          </div>
          <span>Safe logout confirmation</span>
        </div>
      </div>
    </div>
  );
}
