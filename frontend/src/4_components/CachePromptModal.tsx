"use client";

import React from "react";
import type { CacheCheckResult } from "../1_domain/pipeline";

interface CachePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  cacheResult: CacheCheckResult | null;
  onAcceptCached: (videoUrl: string) => void;
  onForceFresh: () => void;
}

export function CachePromptModal({
  isOpen,
  onClose,
  cacheResult,
  onAcceptCached,
  onForceFresh,
}: CachePromptModalProps) {
  if (!isOpen || !cacheResult || !cacheResult.isCacheHit) {
    return null;
  }

  const isExact = cacheResult.matchType === "exact";
  const score = cacheResult.similarityScore ?? 100;
  const repoName = cacheResult.repoName || "this repository";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cache-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0e121a] border border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-on-surface">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <span className="material-symbols-outlined text-2xl">bolt</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 id="cache-modal-title" className="text-lg font-bold text-white tracking-tight">
                  Verified Walkthrough Available
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  {score}% Match
                </span>
              </div>
              <p className="text-xs text-gray-400">
                A verified demo is already compiled for <span className="font-mono text-purple-300">{repoName}</span>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Choice Cards */}
        <div className="flex flex-col gap-4">
          {/* Option A: Recommended Instant Cached Walkthrough */}
          <div
            onClick={() => {
              if (cacheResult.videoUrl) {
                onAcceptCached(cacheResult.videoUrl);
              }
            }}
            className="group relative p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-surface-container-high/60 to-black/40 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                  Recommended • Ready in 0.2s
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>Uses 1 Instant View</span>
              </span>
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-emerald-400">play_circle</span>
              <span>Watch Instant Verified Walkthrough</span>
            </h3>

            <p className="text-xs text-gray-300/90 mt-1 leading-relaxed">
              {isExact
                ? `100% commit match (${cacheResult.cachedSha}). Slices real AST code with zero wait time.`
                : `Grounded in commit ${cacheResult.cachedSha}. Recent commits did not alter the core code scenes.`}
            </p>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span>Duration: ~{cacheResult.videoDurationSec || 56.9}s</span>
              <span className="text-emerald-400 font-semibold group-hover:underline">Play Now →</span>
            </div>
          </div>

          {/* Option B: Force Fresh AI Compilation */}
          <div
            onClick={onForceFresh}
            className="group p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400 uppercase">
                Deep Compute (~60s)
              </span>
              <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                <span>Uses 1 Studio Credit</span>
              </span>
            </div>

            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-purple-400">refresh</span>
              <span>Force Fresh AI Re-render</span>
            </h4>

            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Re-clones remote HEAD, invokes BharatCode LLM, synthesizes new voiceover, and renders 1,800 frames with Chromium.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-2 border-t border-white/5">
          <span>Daily Quota: 10 Instant Views • 3 Studio Credits</span>
          <button onClick={onClose} className="hover:text-gray-300 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

