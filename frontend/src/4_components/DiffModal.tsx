"use client";

import React, { useEffect } from "react";

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiffModal({ isOpen, onClose }: DiffModalProps) {
  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl rounded-2xl bg-[#0b0e14] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="h-14 px-5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-purple-400 text-xl">difference</span>
            <span id="diff-modal-title" className="font-bold text-sm text-white">
              Diff Preview Canvas: <span className="font-mono text-purple-300">backend/src/analyzer/skeletonBuilder.ts</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Code Diff Buffer */}
        <div className="p-5 overflow-y-auto font-mono text-xs bg-black/50 space-y-1.5 leading-relaxed">
          <div className="text-gray-500 pb-1 border-b border-white/5">
            @@ -140,12 +140,18 @@ export async function buildSkeleton(ingest: IngestResult): Promise&lt;Skeleton&gt;
          </div>
          <div className="text-gray-400">     totalLinesOfCode: totalLoc,</div>
          <div className="text-gray-400">     detectedLanguages: languages,</div>
          <div className="text-gray-400">   &#125;;</div>
          <div className="bg-red-500/15 border-l-2 border-red-500 text-red-300 px-3 py-1 rounded">
            - const skeleton = &#123; repo: repoMeta, files: fileNodes &#125;;
          </div>
          <div className="bg-emerald-500/15 border-l-2 border-emerald-500 text-emerald-300 px-3 py-1 rounded">
            + const skeleton = &#123; repo: repoMeta, files: fileNodes, snippets, dependencyEdges &#125;;
          </div>
          <div className="bg-emerald-500/15 border-l-2 border-emerald-500 text-emerald-300 px-3 py-1 rounded">
            + // Grounding contract: Validate runtime facts against strict Zod schema
          </div>
          <div className="bg-emerald-500/15 border-l-2 border-emerald-500 text-emerald-300 px-3 py-1 rounded">
            + const validation = SkeletonSchema.safeParse(skeleton);
          </div>
          <div className="bg-emerald-500/15 border-l-2 border-emerald-500 text-emerald-300 px-3 py-1 rounded">
            + if (!validation.success) throw new Error("Skeleton contract validation failed");
          </div>
          <div className="text-gray-400">   return skeleton;</div>
          <div className="text-gray-400"> &#125;</div>
        </div>

        {/* Footer */}
        <div className="h-14 px-5 bg-white/[0.02] border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="font-mono text-xs text-gray-400">
            <span className="text-emerald-400">+5 additions</span>, <span className="text-red-400">-1 deletion</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close Diff Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
