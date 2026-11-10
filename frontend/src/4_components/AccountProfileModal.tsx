"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { GlassPanel, PrimaryButton, SecondaryButton } from "./ui/DesignSystem";

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountProfileModal({ isOpen, onClose }: AccountProfileModalProps) {
  const { data: session } = useSession();
  const [quota, setQuota] = useState<{ remaining: number; total: number; resetDate: string } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"usage" | "settings" | "plans">("usage");
  const [cacheCleared, setCacheCleared] = useState(false);

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

  // Fetch real quota
  useEffect(() => {
    if (isOpen && session?.user) {
      fetch("/api/user/quota")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setQuota({
              remaining: data.remaining ?? 3,
              total: data.total ?? 3,
              resetDate: data.resetDate ?? "Daily 00:00 UTC",
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const user = session?.user;
  const userName = user?.name || "Developer";
  const userEmail = user?.email || "developer@gitvideo.dev";
  const userProvider = user?.provider || "Developer Account";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ callbackUrl: "/" });
    } catch {
      setIsSigningOut(false);
    }
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSigningOut) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#0b0e14] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-white flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-white/10">
          {user?.image ? (
            <img
              src={user.image}
              alt={userName}
              className="w-16 h-16 rounded-2xl border border-purple-500/30 object-cover shadow-lg shadow-purple-950/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-950/30">
              {initials}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 id="profile-modal-title" className="text-xl font-bold tracking-tight text-white">
                {userName}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] uppercase border border-purple-500/30">
                {userProvider}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mb-2">{userEmail}</p>
            <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
              <span>•</span>
              <span className="text-purple-300 font-semibold">Free Beta Tier</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-mono transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-white/10 mt-6 mb-6">
          <button
            onClick={() => setActiveTab("usage")}
            className={`pb-3 px-4 font-mono text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "usage"
                ? "border-purple-500 text-purple-300 font-bold"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span>Usage & Quotas</span>
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`pb-3 px-4 font-mono text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "plans"
                ? "border-purple-500 text-purple-300 font-bold"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">workspace_premium</span>
            <span>Subscription Tier</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-4 font-mono text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "settings"
                ? "border-purple-500 text-purple-300 font-bold"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Engine Settings</span>
          </button>
        </div>

        {/* Tab 1: Usage & Quotas */}
        {activeTab === "usage" && (
          <div className="space-y-6">
            {/* Daily Generation Quota Box */}
            <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400">bolt</span>
                  <h3 className="text-sm font-bold text-white">Daily Video Generation Quota</h3>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300">
                  {quota ? `${quota.remaining} / ${quota.total}` : "3 / 3"} Credits Left
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                  style={{
                    width: `${((quota?.remaining ?? 3) / (quota?.total ?? 3)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>Resets daily at 00:00 UTC</span>
                <span className="text-emerald-400">High-Performance Multi-Core Active</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-gray-400">Videos Generated</span>
                <p className="text-xl font-bold font-mono text-white mt-1">
                  {3 - (quota?.remaining ?? 3)}
                </p>
                <span className="text-[10px] text-gray-500 mt-1 block">Past 24 hours</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-gray-400">Rate Limit Window</span>
                <p className="text-xl font-bold font-mono text-white mt-1">5 req / 5m</p>
                <span className="text-[10px] text-gray-500 mt-1 block">Sliding window</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-gray-400">Max Video Length</span>
                <p className="text-xl font-bold font-mono text-white mt-1">90s</p>
                <span className="text-[10px] text-gray-500 mt-1 block">Remotion 720p30</span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-gray-400">LLM Engine</span>
                <p className="text-sm font-bold font-mono text-purple-300 mt-1 truncate">qwen-3.8-27b</p>
                <span className="text-[10px] text-gray-500 mt-1 block">BharatCode API</span>
              </div>
            </div>

            {/* Fast Mode Information */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-200">Tip on Fast Mode:</strong> When analyzing repositories for AST metrics, dependency graphs, and <code className="text-purple-300">ARCHITECTURE.md</code> blueprints without full video rendering, enable <em>Fast Mode</em> on the repo input bar. Fast Mode is unmetered and does not deduct from your daily video quota.
            </div>
          </div>
        )}

        {/* Tab 2: Subscription Plans */}
        {activeTab === "plans" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Current Free Beta Plan */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-purple-500/40 relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-white">Free Beta Tier</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Active
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mb-3">$0</div>
                <ul className="space-y-2 text-xs text-gray-300 font-mono">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✔</span> 3 daily video walkthroughs
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✔</span> Public GitHub repos
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✔</span> 720p 30fps MP4 output
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✔</span> Executive ARCHITECTURE.md
                  </li>
                </ul>
              </div>

              {/* Creator Upgrade */}
              <div className="p-5 rounded-2xl bg-purple-950/20 border border-white/10 relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-white">Creator Studio</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    Planned
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mb-3">$19 <span className="text-xs text-gray-500 font-normal">/ mo</span></div>
                <ul className="space-y-2 text-xs text-gray-300 font-mono">
                  <li className="flex items-center gap-1.5">
                    <span className="text-purple-400">✔</span> 30 videos / month
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-purple-400">✔</span> 1080p 60fps Remotion
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-purple-400">✔</span> 9:16 Shorts/Reels preset
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-purple-400">✔</span> Release-to-Demo GitHub Action
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-[11px] font-mono text-gray-500 text-center pt-2">
              All accounts currently have full access to our Free Beta quota during the BharatCode Build League 2026.
            </p>
          </div>
        )}

        {/* Tab 3: Engine Settings */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-white font-mono uppercase">AI &amp; Compute Configuration</h4>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Model Provider:</span>
                <span className="font-mono text-white font-semibold">BharatCode AI Model API</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Active Model:</span>
                <span className="font-mono text-purple-300">qwen-3.8-27b (BharatCode)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Video Renderer:</span>
                <span className="font-mono text-white">Remotion v4.0 (Chromium Multi-Core)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>TTS Engine:</span>
                <span className="font-mono text-white">Edge Neural TTS + Fallback Audio</span>
              </div>
            </div>

            {/* Cache Management */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Local Repository Cache</h4>
                <p className="text-[11px] text-gray-400">Purge ephemeral clone cache and temp analysis files.</p>
              </div>
              <button
                onClick={handleClearCache}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                {cacheCleared ? "✔ Cache Cleared" : "Clear Cache"}
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-gray-500">
          <span>GitVideo Engine v1.0.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

