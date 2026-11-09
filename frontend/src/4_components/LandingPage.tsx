"use client";

import React, { useState } from "react";
import { AuthModal } from "./AuthModal";
import { Footer } from "./Footer";
import {
  GrainOverlay,
  AmbientGlow,
  GlassPanel,
  SectionHeading,
  PrimaryButton,
  SecondaryButton,
  FeatureCard,
  WorkflowStep,
  DemoWindow,
} from "./ui/DesignSystem";

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
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activePlan, setActivePlan] = useState<"monthly" | "annual">("monthly");

  const openAuth = (reason?: string, mode: "signin" | "signup" = "signup") => {
    setAuthReason(reason);
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      q: "What does GitVideo analyze in a repository?",
      a: "GitVideo inspects project manifests (package.json, pyproject.toml, etc.), directory structure, framework entrypoints, exported functions and classes, HTTP routes, and database models. It parses code files with precise line ranges and ignores binary files, node_modules, build outputs, and files larger than 250KB.",
    },
    {
      q: "Does GitVideo run or execute my repository code?",
      a: "No code from the repository is executed during the standard static analysis and storyboard generation stages. The code is inspected strictly as data via AST and regex parsers. In the future runtime-capture module, code runs inside an isolated, short-lived Docker container with strict network limits and no access to host secrets.",
    },
    {
      q: "Does GitVideo support private repositories?",
      a: "Currently, GitVideo is optimized for public GitHub repositories and local directories. Private repository support using fine-grained GitHub App installation tokens with read-only repository permissions is planned for our Studio tier.",
    },
    {
      q: "Will the video show my actual application code?",
      a: "Yes! GitVideo operates on the strict philosophy of 'Facts from Code, Story from LLM'. All code snippets displayed on screen are sliced directly from real repository files with exact line numbers and preserved syntax highlighting via Shiki.",
    },
    {
      q: "What if my project cannot run automatically?",
      a: "GitVideo focuses first on architectural walkthroughs, syntax highlights, and dependency graphs that do not require running your application. For runtime recordings, a manual screen recording upload fallback is provided so you can splice your own screencasts into the storyboard.",
    },
    {
      q: "Can I edit the generated video script?",
      a: "Yes! In our Studio Storyboard Editor, you can review each of the 5 scenes, edit the narration script, swap code snippet focuses, change pacing, and regenerate individual scenes before triggering the Remotion render.",
    },
    {
      q: "Which languages and frameworks are supported?",
      a: "Currently, JavaScript, TypeScript, Next.js, React, Node.js/Express, Python, FastAPI, and Flask have first-class detection and syntax support. Generic support for Go, Rust, and other languages is continuously expanding.",
    },
    {
      q: "Is my source code stored or used to train AI models?",
      a: "No. Cloned repositories live on ephemeral temporary disks during analysis and are purged automatically. Only the extracted metadata skeleton (symbols, routes, snippet line ranges) is retained for rendering. Your source code is never used to train any model.",
    },
    {
      q: "Can I choose the narration voice, video duration, and aspect ratio?",
      a: "Yes. In the Creative Brief, you can choose between 16:9 Landscape (YouTube/Docs) and 9:16 Vertical (Shorts/Reels/TikTok), target 45s to 90s durations, and select from diverse neural voices with developer-tailored pacing.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#0b0e14] text-on-surface overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Film Grain Texture Overlay */}
      <GrainOverlay />

      {/* Dynamic Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AmbientGlow color="purple" position="top-left" size="lg" />
        <AmbientGlow color="indigo" position="top-right" size="lg" />
        <AmbientGlow color="emerald" position="bottom" size="lg" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* ======================================================== */}
      {/* 1. Header & Navigation                                   */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#0b0e14]/75 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Wordmark with original mark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="material-symbols-outlined text-white text-lg font-bold">movie_filter</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
              GitVideo
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Beta
              </span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-gray-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#problem-solution" className="hover:text-white transition-colors">Why GitVideo</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#preview" className="hover:text-white transition-colors">Studio Preview</a>
            <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <PrimaryButton onClick={onEnterStudio} icon="arrow_forward" size="sm">
                Open Studio
              </PrimaryButton>
            ) : (
              <>
                <button
                  onClick={() => openAuth("Sign in to your GitVideo account", "signin")}
                  className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <PrimaryButton
                  onClick={() => openAuth("Create your GitVideo account to start generating videos", "signup")}
                  icon="rocket_launch"
                  size="sm"
                >
                  Start Creating
                </PrimaryButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. Hero Section                                         */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 flex flex-col items-center text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs font-mono text-gray-300 mb-8 animate-fade-in shadow-inner">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-purple-300 font-semibold">AI PRODUCT DEMO STUDIO</span>
          <span className="text-gray-600">•</span>
          <span>Zero Hallucinations</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Your code has a story.{" "}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
            Let GitVideo tell it.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed mb-10">
          Connect your GitHub repository. GitVideo analyzes your codebase, discovers real features, crafts a grounded narrative, and renders a polished, narrated product demo in seconds.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          {isAuthenticated ? (
            <PrimaryButton onClick={onEnterStudio} icon="play_circle" size="lg">
              Launch Studio Workspace
            </PrimaryButton>
          ) : (
            <>
              <PrimaryButton
                onClick={() => openAuth("Sign up to generate your first demo")}
                icon="movie"
                size="lg"
              >
                Generate your first demo
              </PrimaryButton>
              <SecondaryButton href="#how-it-works" icon="play_arrow" size="lg">
                See how it works
              </SecondaryButton>
            </>
          )}
        </div>

        {/* Hero Visual: Bespoke Product Composition */}
        <div className="w-full max-w-5xl relative group">
          <DemoWindow
            title="walkthrough_expressjs_express.mp4"
            badge="720p 30fps • Remotion Multi-Core"
          >
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/90 border border-white/5 shadow-2xl flex items-center justify-center">
              {sampleVideoUrl ? (
                <video
                  src={sampleVideoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8">
                  <span className="material-symbols-outlined text-5xl text-purple-400 mb-2">videocam</span>
                  <p className="text-sm font-medium text-gray-300">Sample Video Ready to Render</p>
                  <p className="text-xs text-gray-500 mt-1">Sign in to generate walkthroughs for any repository.</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-4">
                <span>Duration: <strong className="text-white">~56s</strong></span>
                <span>•</span>
                <span>5 Scenes</span>
                <span>•</span>
                <span>TypeScript & Node.js</span>
              </div>
              <div className="text-purple-300 italic">
                "Start with a repository. Finish with a story."
              </div>
            </div>
          </DemoWindow>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. Trust & Capability Strip                             */}
      {/* ======================================================== */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.015] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-lg">code</span>
              <span>Understand your codebase</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-lg">auto_awesome</span>
              <span>Discover real features</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-lg">account_tree</span>
              <span>Capture product workflows</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-pink-400 text-lg">record_voice_over</span>
              <span>Generate narrated storyboards</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-lg">movie</span>
              <span>Render editable demos</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. Problem / Solution (Before & After)                   */}
      {/* ======================================================== */}
      <section id="problem-solution" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <SectionHeading
          eyebrow="The Workflow Shift"
          title="You built the product. Don't lose days explaining it."
          description="Creating product demo videos manually is painful, slow, and outdated the moment you push a new commit. GitVideo automates the entire pipeline."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before Card */}
          <div className="p-8 rounded-2xl bg-red-950/10 border border-red-500/20 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">close</span>
              </div>
              <h3 className="text-lg font-bold text-white">The Manual Way (3–5 Days)</h3>
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-red-400 shrink-0 font-mono">✖</span>
                <span>Manually script talking points while trying to explain complex architecture.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 shrink-0 font-mono">✖</span>
                <span>Record multiple screen takes; re-record every time you stutter or a click lags.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 shrink-0 font-mono">✖</span>
                <span>Fiddle with video editing timelines, pan-and-zooms, keyframes, and audio tracks.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 shrink-0 font-mono">✖</span>
                <span>Entire video becomes obsolete the moment you refactor or push a minor release.</span>
              </li>
            </ul>
          </div>

          {/* After Card */}
          <div className="p-8 rounded-2xl bg-emerald-950/15 border border-emerald-500/30 backdrop-blur-xl shadow-xl shadow-emerald-950/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">check</span>
              </div>
              <h3 className="text-lg font-bold text-white">The GitVideo Way (Under 60s)</h3>
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 shrink-0 font-mono">✔</span>
                <span><strong>Instant AST Ingestion:</strong> Discovers real entrypoints, routes, and imports.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 shrink-0 font-mono">✔</span>
                <span><strong>Grounded Narratives:</strong> BharatCode LLM generates 5 scenes with zero code hallucinations.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 shrink-0 font-mono">✔</span>
                <span><strong>Neural Developer Voiceover:</strong> High-definition speech synced to visual beats.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 shrink-0 font-mono">✔</span>
                <span><strong>Programmatic Remotion MP4:</strong> Regenerate in one click whenever your repository changes.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. How It Works (5-Step Visual Flow)                     */}
      {/* ======================================================== */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <SectionHeading
          eyebrow="Pipeline Architecture"
          title="Five steps from Git repository to studio-grade demo"
          description="A deterministic, multi-core pipeline that transforms code structure into visual storytelling."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <WorkflowStep
            stepNumber={1}
            title="Connect Repository"
            description="Provide a public GitHub URL or local directory. Shallow clone indexes files in an ephemeral sandbox."
            icon="link"
            detail="Depth=1 Shallow Clone"
          />
          <WorkflowStep
            stepNumber={2}
            title="Understand Product"
            description="Inspect project structure, routes, components, APIs, models, and extract line-accurate snippets."
            icon="psychology"
            detail="Static AST Extraction"
          />
          <WorkflowStep
            stepNumber={3}
            title="Shape the Story"
            description="Select duration, target audience, and aspect ratio. AI creative director drafts a 5-scene narrative."
            icon="edit_note"
            detail="Grounded LLM Script"
          />
          <WorkflowStep
            stepNumber={4}
            title="Capture & Compose"
            description="Synthesize neural speech per scene segment; compose Remotion code zooms, graphs, and subtitles."
            icon="movie_creation"
            detail="Neural TTS & Sync"
          />
          <WorkflowStep
            stepNumber={5}
            title="Review & Export"
            description="Tweak narration lines, preview real-time frames, and export a high-definition 720p/1080p MP4."
            icon="download"
            detail="Parallel MP4 Render"
          />
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. Feature Sections (7 Deep Dives)                       */}
      {/* ======================================================== */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <SectionHeading
          eyebrow="Deep Capabilities"
          title="Engineered for accuracy, built for developers"
          description="Every component of GitVideo is purpose-built to eliminate hallucinated code and make technical communication effortless."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="terminal"
            title="1. Repository Intelligence"
            description="Deep static analysis extracts components, APIs, routes, and data models with file-path evidence and confidence ratings rather than guessing."
            badge="Static AST"
          >
            <div className="font-mono text-[11px] text-gray-400 bg-black/40 p-3 rounded-lg border border-white/5">
              <span className="text-purple-400">✔</span> 64 source files indexed<br />
              <span className="text-purple-400">✔</span> 12 snippet boundaries verified<br />
              <span className="text-purple-400">✔</span> Express/FastAPI route mappings
            </div>
          </FeatureCard>

          <FeatureCard
            icon="fact_check"
            title="2. Feature Discovery & Grounding"
            description="Strict Zod schemas enforce that every file, function, and snippet mentioned in narration matches a real symbol in the static skeleton."
            badge="Zod Verified"
          >
            <div className="font-mono text-[11px] text-gray-400 bg-black/40 p-3 rounded-lg border border-white/5">
              <span className="text-emerald-400">✔</span> 0% Hallucinated code<br />
              <span className="text-emerald-400">✔</span> Fallback storyboard safety<br />
              <span className="text-emerald-400">✔</span> Preserved real line numbers
            </div>
          </FeatureCard>

          <FeatureCard
            icon="palette"
            title="3. AI Creative Director"
            description="Tailor video purpose: developer deep-dive, hackathon demo, startup pitch, or 30-second speedrun for social channels."
            badge="Audience Modes"
          >
            <div className="font-mono text-[11px] text-gray-400 bg-black/40 p-3 rounded-lg border border-white/5">
              <span className="text-indigo-400">✔</span> Senior Architect mode<br />
              <span className="text-indigo-400">✔</span> Demo Day Pitch mode<br />
              <span className="text-indigo-400">✔</span> 1-Click AI Defaults
            </div>
          </FeatureCard>

          <FeatureCard
            icon="videocam"
            title="4. Real Product Capture"
            description="Sandboxed Playwright workers spin up supported applications to record verified user interactions, with manual screencast fallback."
            badge="Sandboxed"
          >
            <div className="font-mono text-[11px] text-gray-400 bg-black/40 p-3 rounded-lg border border-white/5">
              <span className="text-purple-400">✔</span> Isolated headless browser<br />
              <span className="text-purple-400">✔</span> Real route interaction capture<br />
              <span className="text-purple-400">✔</span> Manual recording upload
            </div>
          </FeatureCard>

          <FeatureCard
            icon="subtitles"
            title="5. Storyboard & Narration"
            description="Scene-by-scene editing lets you adjust script words, preview durations, and swap code snippet highlights before video rendering."
            badge="Editable"
          >
            <div className="font-mono text-[11px] text-gray-400 bg-black/40 p-3 rounded-lg border border-white/5">
              <span className="text-pink-400">✔</span> Live duration calculator<br />
              <span className="text-pink-400">✔</span> Speech syntax sanitizer<br />
              <span className="text-pink-400">✔</span> Neural developer voices
            </div>
          </FeatureCard>

          <FeatureCard
            icon="aspect_ratio"
            title="6. Multi-Ratio Social Studio"
            description="Render standard 16:9 for YouTube and documentation, or 9:16 vertical videos for X/Twitter, TikTok, and YouTube Shorts in one click."
            badge="16:9 & 9:16"
          >
            <div className="font-mono text-[11px] text-gray-400 bg-black/40 p-3 rounded-lg border border-white/5">
              <span className="text-emerald-400">✔</span> 16:9 Landscape preset<br />
              <span className="text-emerald-400">✔</span> 9:16 Shorts/Reels preset<br />
              <span className="text-emerald-400">✔</span> Shiki animated code zoom
            </div>
          </FeatureCard>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. Product Preview Section                               */}
      {/* ======================================================== */}
      <section id="preview" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <SectionHeading
          eyebrow="Studio Interface"
          title="A creative studio built for developers"
          description="Everything you need in one unified interface: telemetry logs, AST metrics, code zooms, and interactive video preview."
        />

        <div className="w-full max-w-5xl mx-auto">
          <DemoWindow title="GitVideo Studio — Express.js Walkthrough" badge="Active Workspace">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Telemetry Mockup */}
              <div className="lg:col-span-5 p-4 rounded-xl bg-black/60 border border-white/5 font-mono text-xs">
                <div className="flex items-center justify-between text-gray-400 pb-2 mb-3 border-b border-white/5">
                  <span className="text-purple-400">● PIPELINE TELEMETRY</span>
                  <span>100% Complete</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-gray-400">
                  <p className="text-gray-500">[00:00.130] <span className="text-emerald-400">CLONE</span> shallow clone depth=1</p>
                  <p className="text-gray-500">[00:00.280] <span className="text-indigo-400">AST</span> indexed 64 source files</p>
                  <p className="text-gray-500">[00:02.150] <span className="text-purple-400">LLM</span> 5 scenes verified via qwen-3.8-27b</p>
                  <p className="text-gray-500">[00:05.800] <span className="text-pink-400">TTS</span> 5 neural speech clips generated</p>
                  <p className="text-gray-500">[00:45.200] <span className="text-emerald-400">RENDER</span> 720p 30fps MP4 completed</p>
                </div>
              </div>

              {/* Right Scene Cards Mockup */}
              <div className="lg:col-span-7 flex flex-col gap-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-purple-300">SCENE 1: HOOK & TITLE</span>
                    <p className="text-white text-xs font-sans mt-0.5 font-semibold">Repository Overview & Stack Pills</p>
                  </div>
                  <span className="text-xs text-purple-400">10.2s</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400">SCENE 2: FILE TREE</span>
                    <p className="text-white text-xs font-sans mt-0.5">Directory Structure & Entrypoint</p>
                  </div>
                  <span className="text-xs text-gray-400">12.5s</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400">SCENE 3: CODE FOCUS</span>
                    <p className="text-white text-xs font-sans mt-0.5">Shiki Syntax Zoom on Core Middleware</p>
                  </div>
                  <span className="text-xs text-gray-400">18.4s</span>
                </div>
              </div>
            </div>
          </DemoWindow>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. Use Cases                                            */}
      {/* ======================================================== */}
      <section id="use-cases" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <SectionHeading
          eyebrow="Target Applications"
          title="Who needs GitVideo?"
          description="From hackathon teams presenting to judges to SaaS founders launching on Product Hunt."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassPanel hover className="p-6">
            <span className="material-symbols-outlined text-3xl text-purple-400 mb-3">rocket</span>
            <h3 className="text-base font-bold text-white mb-2">Startup Founders & SaaS Teams</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Drop an animated 60-second walkthrough on your landing page. Boost conversion and communicate what you built without days of editing.
            </p>
          </GlassPanel>

          <GlassPanel hover className="p-6">
            <span className="material-symbols-outlined text-3xl text-indigo-400 mb-3">emoji_events</span>
            <h3 className="text-base font-bold text-white mb-2">Hackathon Teams & Students</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Submit an airtight product demo video right before the deadline. Judges can understand your technical architecture in 60 seconds.
            </p>
          </GlassPanel>

          <GlassPanel hover className="p-6">
            <span className="material-symbols-outlined text-3xl text-emerald-400 mb-3">badge</span>
            <h3 className="text-base font-bold text-white mb-2">Developer Portfolios</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Embed video walkthroughs in your GitHub READMEs and personal portfolio. Let your code speak for itself with cinematic polish.
            </p>
          </GlassPanel>

          <GlassPanel hover className="p-6">
            <span className="material-symbols-outlined text-3xl text-pink-400 mb-3">campaign</span>
            <h3 className="text-base font-bold text-white mb-2">Feature Launch Announcements</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Export 9:16 vertical videos for X/Twitter and YouTube Shorts whenever you merge a major pull request or push a new release.
            </p>
          </GlassPanel>

          <GlassPanel hover className="p-6">
            <span className="material-symbols-outlined text-3xl text-blue-400 mb-3">school</span>
            <h3 className="text-base font-bold text-white mb-2">Technical Walkthroughs & Onboarding</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Help new team members and open-source contributors get up to speed in minutes rather than sifting through thousands of lines.
            </p>
          </GlassPanel>

          <GlassPanel hover className="p-6">
            <span className="material-symbols-outlined text-3xl text-yellow-400 mb-3">handshake</span>
            <h3 className="text-base font-bold text-white mb-2">Agencies & Client Handoffs</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Deliver professional architectural documentation and video walkthroughs with every completed client codebase.
            </p>
          </GlassPanel>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. Early-Access Pricing                                  */}
      {/* ======================================================== */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <SectionHeading
          eyebrow="Transparent Pricing"
          title="Simple plans for builders and teams"
          description="Get started free during our BharatCode early access beta. Scale as your video generation needs grow."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free / Trial Plan */}
          <GlassPanel className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Free / Early Access</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Live Today
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1 font-mono">$0</div>
              <p className="text-xs text-gray-400 mb-6">Perfect for trying GitVideo on personal repositories.</p>

              <ul className="space-y-3 text-xs text-gray-300 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span>
                  <span><strong>3 free video generations</strong> every 24 hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span>
                  <span>Public GitHub repository analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span>
                  <span>720p 30fps MP4 export</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span>
                  <span>Neural voiceover synthesis</span>
                </li>
              </ul>
            </div>
            <SecondaryButton
              onClick={() => openAuth("Sign up for free early access")}
              className="w-full"
            >
              Start Free
            </SecondaryButton>
          </GlassPanel>

          {/* Creator Plan */}
          <GlassPanel className="p-8 flex flex-col justify-between border-purple-500/40 relative shadow-2xl shadow-purple-950/30">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono text-[10px] font-semibold tracking-wider uppercase">
              Most Popular
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Creator</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  Planned
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1 font-mono">$19 <span className="text-xs text-gray-400 font-sans font-normal">/ mo</span></div>
              <p className="text-xs text-gray-400 mb-6">For indie hackers and startup developers.</p>

              <ul className="space-y-3 text-xs text-gray-300 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✔</span>
                  <span><strong>30 video generations</strong> / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✔</span>
                  <span>1080p 60fps MP4 rendering</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✔</span>
                  <span>9:16 Vertical Shorts/Reels export</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✔</span>
                  <span>Full Storyboard Editor & regeneration</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✔</span>
                  <span>No GitVideo watermark</span>
                </li>
              </ul>
            </div>
            <PrimaryButton
              onClick={() => openAuth("Creator tier early access")}
              className="w-full"
            >
              Join Creator Waitlist
            </PrimaryButton>
          </GlassPanel>

          {/* Studio Plan */}
          <GlassPanel className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Studio</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  Planned
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1 font-mono">$79 <span className="text-xs text-gray-400 font-sans font-normal">/ mo</span></div>
              <p className="text-xs text-gray-400 mb-6">For engineering teams, agencies, and enterprises.</p>

              <ul className="space-y-3 text-xs text-gray-300 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✔</span>
                  <span><strong>Unlimited video generations</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✔</span>
                  <span>Private repository support (GitHub App)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✔</span>
                  <span>Release-to-Demo GitHub Action bot</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✔</span>
                  <span>Sandboxed runtime Playwright capture</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✔</span>
                  <span>Custom branding and voice cloning</span>
                </li>
              </ul>
            </div>
            <SecondaryButton
              onClick={() => openAuth("Studio tier waitlist")}
              className="w-full"
            >
              Contact for Studio
            </SecondaryButton>
          </GlassPanel>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. FAQ Accordion                                        */}
      {/* ======================================================== */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <SectionHeading
          eyebrow="Frequently Asked Questions"
          title="Everything you need to know"
          description="Honest answers about repository analysis, privacy, execution, and video generation."
        />

        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden transition-colors hover:border-purple-500/30"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-sm font-semibold text-white">{item.q}</span>
                <span className="material-symbols-outlined text-gray-400 text-lg shrink-0 transition-transform duration-200">
                  {openFaqIndex === idx ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-white/5">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. Final CTA Card                                       */}
      {/* ======================================================== */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-3xl bg-gradient-to-b from-purple-900/30 via-indigo-900/20 to-black/60 border border-purple-500/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Make your next product demo<br />your easiest deliverable.
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Connect any public repository and watch GitVideo discover, script, and render a cinematic product demo in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <PrimaryButton onClick={onEnterStudio} icon="arrow_forward" size="lg">
                Start with your repository
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={() => openAuth("Sign up to start with your repository")}
                icon="rocket_launch"
                size="lg"
              >
                Start with your repository
              </PrimaryButton>
            )}
          </div>
        </div>
      </section>

      {/* SaaS Footer */}
      <Footer />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason={authReason}
        initialMode={authMode}
      />
    </div>
  );
}
