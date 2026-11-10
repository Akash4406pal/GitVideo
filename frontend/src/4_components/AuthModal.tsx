"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  initialMode?: "signin" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  reason,
  initialMode = "signup",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"github" | "google" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    try {
      setIsSubmitting(true);
      setActiveProvider(provider);
      setErrorMsg(null);
      await signIn(provider, { callbackUrl: "/?view=dashboard" });
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to authenticate via ${provider}. Please try again.`);
      setIsSubmitting(false);
      setActiveProvider(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-white overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          aria-label="Close authentication dialog"
          disabled={isSubmitting}
        >
          <span className="material-symbols-outlined text-lg leading-none">close</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3.5 shadow-lg shadow-purple-500/10">
            <span className="material-symbols-outlined text-2xl">movie_filter</span>
          </div>

          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {mode === "signup" ? "Create your GitVideo Account" : "Welcome back to GitVideo"}
          </h2>

          <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-sm mx-auto">
            {reason || "Sign in with verified developer OAuth to run codebase workflows and render HD walkthrough videos."}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 flex rounded-xl bg-white/[0.03] border border-white/10 p-1 text-xs font-medium">
            <button
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                mode === "signup"
                  ? "bg-purple-600 text-white font-semibold shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up (3 Free Daily Renders)
            </button>
            <button
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                mode === "signin"
                  ? "bg-purple-600 text-white font-semibold shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Log In
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 animate-fade-in"
          >
            <span className="material-symbols-outlined text-base text-red-400 shrink-0">error</span>
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Primary OAuth Actions */}
        <div className="flex flex-col gap-3 my-5">
          {/* GitHub OAuth Button (Developer Standard) */}
          <button
            type="button"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isSubmitting}
            className="w-full min-h-[46px] flex items-center justify-center gap-3 px-4 rounded-xl bg-[#21262d] hover:bg-[#30363d] active:scale-[0.98] border border-white/15 text-sm text-white font-medium transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          >
            {isSubmitting && activeProvider === "github" ? (
              <span className="material-symbols-outlined text-lg animate-spin text-purple-400">refresh</span>
            ) : (
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            )}
            <span>
              {isSubmitting && activeProvider === "github"
                ? "Connecting GitHub..."
                : `${mode === "signup" ? "Sign up" : "Sign in"} with GitHub`}
            </span>
          </button>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isSubmitting}
            className="w-full min-h-[46px] flex items-center justify-center gap-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] active:scale-[0.98] border border-white/15 text-sm text-white font-medium transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          >
            {isSubmitting && activeProvider === "google" ? (
              <span className="material-symbols-outlined text-lg animate-spin text-purple-400">refresh</span>
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
            )}
            <span>
              {isSubmitting && activeProvider === "google"
                ? "Connecting Google..."
                : `${mode === "signup" ? "Sign up" : "Sign in"} with Google`}
            </span>
          </button>
        </div>

        {/* Security & Access Guarantees */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 space-y-2 text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            <span>Developer Privacy &amp; Security Guarantee</span>
          </div>
          <ul className="space-y-1 text-gray-400 pl-5 list-disc marker:text-purple-400">
            <li>Read-only profile info (Name, Avatar, Verified Email)</li>
            <li>Zero repository write permissions requested</li>
            <li>Temporary clone disks purged automatically after compilation</li>
          </ul>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>48-Hour Secure JWT</span>
          </div>
          <span className="text-purple-300 font-semibold">Free Tier • 3 Demos / Day</span>
        </div>
      </div>
    </div>
  );
}
