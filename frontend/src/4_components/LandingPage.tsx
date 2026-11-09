"use client";

import React, { useState } from "react";
import { AuthModal } from "./AuthModal";

interface LandingPageProps {
  onEnterStudio?: () => void;
  isAuthenticated?: boolean;
  sampleVideoUrl?: string | null;
}

export function LandingPage({
  onEnterStudio,
  isAuthenticated = false,
  sampleVideoUrl = "/api/video",
}: LandingPageProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>();
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const openAuth = (reason?: string) => {
    setAuthReason(reason);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0e14] text-on-surface overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Dynamic Background Ambient Glows & Glass Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-20 w-[38rem] h-[38rem] rounded-full bg-purple-600/15 blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[34rem] h-[34rem] rounded-full bg-indigo-600/15 blur-[160px]" />
        <div className="absolute -bottom-20 left-1/3 w-[36rem] h-[36rem] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#0b0e14]/75 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="material-symbols-outlined text-white text-lg font-bold">terminal</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
              GitVideo
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Beta
              </span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Architecture</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Pipeline Flow</a>
            <a href="#demo" className="hover:text-white transition-colors">Video Showcase</a>
            <a href="https://github.com/Akash4406pal/GitVideo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <span>GitHub</span>
              <span className="material-symbols-outlined text-xs">arrow_outward</span>
            </a>
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onEnterStudio}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Open Studio</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuth("Sign in to your GitVideo account")}
                  className="px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth("Create your GitVideo account to get 3 free daily videos")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Sign Up Free</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 flex flex-col items-center text-center">
        {/* Top Product Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs font-mono text-gray-300 mb-8 animate-fade-in shadow-inner">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>BharatCode 2026 Codebase-to-Video Engine</span>
          <span className="text-gray-500">•</span>
          <span className="text-purple-400">Zero Hallucinations</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Turn Any GitHub Repository Into a{" "}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
            Cinematic Codebase Walkthrough
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed mb-10">
          Paste a public repo URL. GitVideo indexes real AST signatures, writes a grounded architectural narrative via BharatCode AI, synthesizes articulate developer voiceovers, and renders an MP4 in seconds.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          {isAuthenticated ? (
            <button
              onClick={onEnterStudio}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-lg">play_circle</span>
              <span>Launch GitVideo Studio Workspace</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => openAuth("Sign up to generate free AI codebase videos")}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                <span>Get Started Free — 3 Videos/Day</span>
              </button>
              <a
                href="#demo"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-gray-300 hover:text-white font-medium text-sm backdrop-blur-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg">smart_display</span>
                <span>Watch Real Walkthrough</span>
              </a>
            </>
          )}
        </div>

        {/* Glassmorphic Interactive Video Showcase Card */}
        <div id="demo" className="w-full max-w-5xl rounded-3xl bg-surface-container-lowest/80 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-3 sm:p-5 mb-20 relative group">
          {/* Window Chrome Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.08] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="ml-3 font-mono text-[11px] text-gray-400">
                walkthrough_expressjs_express.mp4
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>720p 30fps • Remotion Multi-Core</span>
            </div>
          </div>

          {/* Video Player or Fallback Showcase Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-white/5 shadow-2xl flex items-center justify-center">
            {sampleVideoUrl ? (
              <video
                src={sampleVideoUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
                onPlay={() => setIsPlayingDemo(true)}
              />
            ) : (
              <div className="text-center p-8">
                <span className="material-symbols-outlined text-5xl text-purple-400 mb-2">videocam</span>
                <p className="text-sm font-medium text-gray-300">Sample Video Ready to Render</p>
                <p className="text-xs text-gray-500 mt-1">Sign in to generate walkthroughs for any GitHub repository.</p>
              </div>
            )}
          </div>

          {/* Under-Player Metadata Strip */}
          <div className="mt-3 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gray-400">
            <div className="flex items-center gap-4">
              <span>Duration: <strong className="text-white">~50s</strong></span>
              <span>•</span>
              <span>5 Scenes</span>
              <span>•</span>
              <span>Node.js & JavaScript</span>
            </div>
            <div className="text-purple-300">
              Grounded in Express core architecture, routing engine & middleware pipeline
            </div>
          </div>
        </div>

        {/* Live Metrics Ticker (Glassmorphism Cards) */}
        <div className="w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl text-left hover:border-purple-500/40 transition-all">
            <div className="text-3xl font-extrabold text-white mb-1 font-mono">16 Cores</div>
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Parallel Render</div>
            <div className="text-xs text-gray-400">Multi-threaded Remotion rendering in under 45 seconds.</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl text-left hover:border-indigo-500/40 transition-all">
            <div className="text-3xl font-extrabold text-white mb-1 font-mono">0%</div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Hallucination</div>
            <div className="text-xs text-gray-400">Facts come strictly from AST parsing and real line ranges.</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl text-left hover:border-emerald-500/40 transition-all">
            <div className="text-3xl font-extrabold text-white mb-1 font-mono">35-50s</div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Punchy Pacing</div>
            <div className="text-xs text-gray-400">Concise, senior-engineer delivery tuned for developer retention.</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl text-left hover:border-pink-500/40 transition-all">
            <div className="text-3xl font-extrabold text-white mb-1 font-mono">Natural</div>
            <div className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-1">Developer Voice</div>
            <div className="text-xs text-gray-400">Speech sanitizer eliminates robotic underscores and awkward syntax.</div>
          </div>
        </div>

        {/* Core Architecture Pillars Grid */}
        <div id="features" className="w-full max-w-5xl text-left mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Built on 4 Grounded Architectural Stages
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              GitVideo does not summarize generic Readmes. It reads code directly from the git tree to construct verifiable technical videos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-purple-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">account_tree</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">1. AST & Code Skeleton Extraction</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Shallow-clones repositories in ephemeral sandboxes. Extracts entrypoints, functions, routes, imports, and top code snippets into a compact token-optimized skeleton.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-indigo-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">psychology</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">2. BharatCode Reasoning Storyboard</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                BharatCode AI inspects real code logic to draft a 5-scene narrative: Title Hook, File Tree, Deep Code Focus, Dependency Flow, and Outro. Verified by strict Zod schemas.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-emerald-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">record_voice_over</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">3. Natural Neural TTS Voiceover</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Synthesizes per-segment audio clips using Microsoft Edge neural voices. Our speech sanitizer strips underscores and expands technical syntax into natural spoken English.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-pink-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">movie</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">4. Remotion Video Composition</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Programmatic React video compositions render syntax-highlighted code, dynamic dependency graphs, and subtitles, timed with millisecond accuracy to the speech clips.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action Card */}
        <div className="w-full max-w-4xl rounded-3xl bg-gradient-to-b from-purple-900/30 to-indigo-900/20 border border-purple-500/30 p-8 sm:p-12 backdrop-blur-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            Start Turning Your Repositories Into Videos Today
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto mb-8">
            Sign in with your GitHub or Google account to get 3 free video walkthroughs every 24 hours. Keep your session active for 2 full days.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={onEnterStudio}
                className="px-8 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-sm shadow-xl transition-all hover:scale-105"
              >
                Go to Video Studio
              </button>
            ) : (
              <button
                onClick={() => openAuth("Sign up to start generating codebase walkthroughs")}
                className="px-8 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-sm shadow-xl transition-all hover:scale-105"
              >
                Sign Up with GitHub or Google
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason={authReason}
      />
    </div>
  );
}

