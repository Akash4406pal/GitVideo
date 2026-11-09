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
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [authMethod, setAuthMethod] = useState<"oauth" | "email">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await signIn(provider, { callbackUrl: "/?view=dashboard" });
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to connect with ${provider}.`);
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        name: name.trim() || email.split("@")[0],
      });

      if (result?.error) {
        setErrorMsg("Sign-in failed. Please check your details.");
        setIsSubmitting(false);
      } else {
        onClose();
        // Smoothly reload/navigate to dashboard
        window.location.href = "/?view=dashboard";
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const result = await signIn("credentials", {
        redirect: false,
        email: "developer@gitvideo.dev",
        name: "Demo Developer",
      });

      if (!result?.error) {
        onClose();
        window.location.href = "/?view=dashboard";
      } else {
        setErrorMsg("Demo sign-in failed.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
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
          disabled={isSubmitting}
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 mb-3 shadow-lg shadow-purple-500/10">
            <span className="material-symbols-outlined text-2xl">movie_filter</span>
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold tracking-tight">
            {mode === "signup" ? "Create your GitVideo account" : "Welcome back to GitVideo"}
          </h2>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            {reason || "Start transforming GitHub repositories into cinematic architectural walkthrough videos."}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-4 flex rounded-xl bg-black/40 border border-white/10 p-1 text-xs font-mono">
            <button
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === "signup"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up (3 Free Videos)
            </button>
            <button
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === "signin"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Log In
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-red-400">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Developer Demo Fast Sign-In */}
        <div className="mb-5">
          <button
            onClick={handleQuickDemoSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 font-mono text-xs transition-all hover:scale-[1.01] shadow-lg shadow-purple-950/20 cursor-pointer disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-300">bolt</span>
            <span className="font-semibold text-white">1-Click Developer Instant Access</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Instant
            </span>
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0b0e14] px-3 font-mono text-[10px] text-gray-500 uppercase">
            or continue with
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3 mb-5">
          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Akash Pal"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/30 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined text-base animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-base">
                {mode === "signup" ? "person_add" : "login"}
              </span>
            )}
            <span>{mode === "signup" ? "Create Free Account" : "Sign In with Email"}</span>
          </button>
        </form>

        {/* OAuth Divider & Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-white/10 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-white font-medium transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>2-Day Session JWT</span>
          </div>
          <span>Free Tier: 3 Videos / Day</span>
        </div>
      </div>
    </div>
  );
}
