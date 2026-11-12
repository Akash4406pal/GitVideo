"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { GlassPanel, PrimaryButton, SecondaryButton } from "./ui/DesignSystem";

interface DashboardHubProps {
  onAnalyzeRepo: (url: string, mode: "video_16_9" | "video_9_16" | "blueprint_only" | "storyboard_only") => void;
  onOpenProfile: () => void;
  onPlayDemoVideo: () => void;
  onOpenBlueprint?: () => void;
  onOpenChat?: () => void;
  isRunning?: boolean;
}

const PRESET_REPOS = [
  { name: "Akash4406pal/GitVideo", url: "https://github.com/Akash4406pal/GitVideo", desc: "This Engine • Next.js & Node", tag: "Full Stack" },
  { name: "expressjs/express", url: "https://github.com/expressjs/express", desc: "Node.js Core Routing Engine", tag: "Backend API" },
  { name: "pallets/flask", url: "https://github.com/pallets/flask", desc: "Python WSGI Micro-framework", tag: "Python Core" },
  { name: "fastify/fastify", url: "https://github.com/fastify/fastify", desc: "High-Performance Node Server", tag: "Fast Framework" },
];

export function DashboardHub({
  onAnalyzeRepo,
  onOpenProfile,
  onPlayDemoVideo,
  onOpenBlueprint,
  onOpenChat,
  isRunning = false,
}: DashboardHubProps) {
  const { data: session } = useSession();
  const [repoUrl, setRepoUrl] = useState("https://github.com/expressjs/express");
  const [selectedAction, setSelectedAction] = useState<"video_16_9" | "video_9_16" | "blueprint_only" | "storyboard_only">("video_16_9");

  const userName = session?.user?.name || "Developer";

  const handleExecute = (overrideAction?: "video_16_9" | "video_9_16" | "blueprint_only" | "storyboard_only") => {
    const actionToRun = overrideAction || selectedAction;
    if (repoUrl.trim() && !isRunning) {
      onAnalyzeRepo(repoUrl.trim(), actionToRun);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* Top Welcome & Quota Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-black/50 border border-white/10 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30 text-white font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Welcome back, {userName}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                Studio Hub
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Transform any GitHub repository into cinematic demos, executive architecture blueprints, and social reels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/35 text-xs font-mono text-purple-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm text-emerald-400">smart_toy</span>
              <span>Ask Architecture Q&amp;A</span>
            </button>
          )}

          {onOpenBlueprint && (
            <button
              onClick={onOpenBlueprint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-purple-300 hover:text-white transition-all cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm text-purple-400">description</span>
              <span>ARCHITECTURE.md</span>
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-gray-400">account_circle</span>
            <span>Account</span>
          </button>

          <button
            onClick={onPlayDemoVideo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">play_circle</span>
            <span>Watch Benchmark</span>
          </button>
        </div>
      </div>

      {/* Main Repository Input & Action Studio */}
      <GlassPanel className="p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 inline-block mb-3">
              Target Repository
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              What do you want to create from your codebase?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Paste any public GitHub repository URL below. Then pick which deliverable you want GitVideo to build.
            </p>
          </div>

          {/* Target URL Input Bar */}
          <div className="relative flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                link
              </span>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={isRunning}
                placeholder="https://github.com/username/repository"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 font-mono transition-colors disabled:opacity-60"
              />
            </div>
            <PrimaryButton
              onClick={() => handleExecute()}
              icon={isRunning ? "refresh" : "rocket_launch"}
              size="md"
              className={isRunning ? "animate-pulse" : ""}
            >
              {isRunning ? "Engine Running..." : "Execute Workflow"}
            </PrimaryButton>
          </div>

          {/* Quick-Select Repository Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-mono text-gray-400">Quick Presets:</span>
            {PRESET_REPOS.map((preset) => (
              <button
                key={preset.url}
                onClick={() => {
                  setRepoUrl(preset.url);
                }}
                disabled={isRunning}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  repoUrl === preset.url
                    ? "bg-purple-600/30 border border-purple-500/50 text-white"
                    : "bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-[10px] px-1 rounded bg-black/40 text-purple-300">
                  {preset.tag}
                </span>
              </button>
            ))}
          </div>

          {/* ======================================================== */}
          {/* Multiple Things You Can Do With Your GitHub Repo Link!   */}
          {/* ======================================================== */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
              <span className="material-symbols-outlined text-purple-400 text-lg">auto_awesome</span>
              <span>Available Codebase Workflows (Select One)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Option 1: Full 16:9 Video Walkthrough */}
              <div
                onClick={() => setSelectedAction("video_16_9")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedAction === "video_16_9"
                    ? "bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-950/30 scale-[1.02]"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-2xl">movie</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">1. Full Video Walkthrough</h4>
                  <span className="text-[10px] font-mono text-purple-400 uppercase block mb-2">16:9 Landscape MP4</span>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Discovers entrypoints, writes 5-scene narrative, synthesizes neural voiceover, and renders cinematic 720p Remotion video.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span>~60 Seconds</span>
                  <span className="text-purple-300 font-bold">{selectedAction === "video_16_9" ? "● Selected" : "Select"}</span>
                </div>
              </div>

              {/* Option 2: 9:16 Social Reel / TikTok Short */}
              <div
                onClick={() => setSelectedAction("video_9_16")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedAction === "video_9_16"
                    ? "bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-950/30 scale-[1.02]"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-2xl">stay_current_portrait</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">2. Social Short / Reel</h4>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase block mb-2">9:16 Vertical Video</span>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Formatted for TikTok, YouTube Shorts, Reels, and X/Twitter with stacked architecture graph and dynamic code zooms.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span>Viral Format</span>
                  <span className="text-indigo-300 font-bold">{selectedAction === "video_9_16" ? "● Selected" : "Select"}</span>
                </div>
              </div>

              {/* Option 3: Executive ARCHITECTURE.md Blueprint */}
              <div
                onClick={() => setSelectedAction("blueprint_only")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedAction === "blueprint_only"
                    ? "bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-950/30 scale-[1.02]"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-2xl">description</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">3. Executive Architecture</h4>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-2">ARCHITECTURE.md</span>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Instant AST analysis in ~2 seconds. Generates Markdown architecture document with live Mermaid flowchart and README badge.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span>Fast (~2s)</span>
                  <span className="text-emerald-300 font-bold">{selectedAction === "blueprint_only" ? "● Selected" : "Select"}</span>
                </div>
              </div>

              {/* Option 4: Interactive Storyboard Studio */}
              <div
                onClick={() => setSelectedAction("storyboard_only")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedAction === "storyboard_only"
                    ? "bg-purple-950/30 border-purple-500 shadow-xl shadow-purple-950/30 scale-[1.02]"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-2xl">edit_note</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">4. Storyboard &amp; Script</h4>
                  <span className="text-[10px] font-mono text-pink-400 uppercase block mb-2">Script Studio</span>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Inspects the repo and generates an editable 5-scene script where you can tweak talking points before rendering.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span>Pre-Render Editor</span>
                  <span className="text-pink-300 font-bold">{selectedAction === "storyboard_only" ? "● Selected" : "Select"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}

