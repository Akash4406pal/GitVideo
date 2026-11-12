"use client";

import React, { useState, useEffect } from "react";
import { MarkdownViewer } from "./ui/MarkdownViewer";

interface ArchitectureBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
  repoName?: string;
}

export function ArchitectureBlueprintModal({
  isOpen,
  onClose,
  onOpenChat,
  repoName = "Target Codebase",
}: ArchitectureBlueprintModalProps) {
  const [activeTab, setActiveTab] = useState<"rendered" | "raw">("rendered");
  const [blueprintContent, setBlueprintContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    fetch("/api/repo/blueprint")
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setBlueprintContent(data.content);
        }
      })
      .catch((err) => {
        setBlueprintContent("# Architecture Blueprint\n\nFailed to load blueprint. Please check pipeline status.");
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(blueprintContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBadge = () => {
    const badgeMarkdown = `[![Watch 60s Architecture Walkthrough](https://img.shields.io/badge/GitVideo-Watch%20Walkthrough-purple?style=for-the-badge&logo=youtube)](https://gitvideo.dev)`;
    navigator.clipboard.writeText(badgeMarkdown);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([blueprintContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ARCHITECTURE.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="blueprint-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[820px] bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-xl">description</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="blueprint-modal-title" className="text-base sm:text-lg font-bold text-white">
                  ARCHITECTURE.md Blueprint
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Ready to Commit
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Executive architectural documentation compiled automatically from AST &amp; dependency trees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-surface-container-highest border border-white/5 text-xs font-mono">
              <button
                onClick={() => setActiveTab("rendered")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === "rendered"
                    ? "bg-purple-600 text-white font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Rendered
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === "raw"
                    ? "bg-purple-600 text-white font-semibold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Raw Markdown
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close blueprint modal"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto font-sans leading-relaxed text-xs sm:text-sm text-gray-300 bg-black/40 scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 font-mono gap-2 text-xs">
              <span className="material-symbols-outlined text-base animate-spin text-purple-400">refresh</span>
              <span>Loading executive architecture blueprint...</span>
            </div>
          ) : activeTab === "raw" ? (
            <pre className="font-mono text-xs text-purple-200 bg-[#090c12] p-4 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap selection:bg-purple-500 selection:text-white">
              {blueprintContent}
            </pre>
          ) : (
            <div className="max-w-4xl mx-auto px-2">
              <MarkdownViewer content={blueprintContent} showMermaid={true} />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-white/10 bg-[#0d1117]">
          <div className="flex items-center gap-2">
            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-mono transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-purple-400">smart_toy</span>
                <span>Ask Architecture Q&amp;A</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyBadge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-amber-400">badge</span>
              <span>{copiedBadge ? "Badge Copied!" : "Copy README Badge"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-200 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">{copied ? "check" : "content_copy"}</span>
              <span>{copied ? "Copied Markdown!" : "Copy Markdown"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Download ARCHITECTURE.md</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

