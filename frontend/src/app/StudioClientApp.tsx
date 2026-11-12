"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { usePipeline } from "../3_hooks/usePipeline";
import { Header, StudioSection } from "../4_components/Header";
import { DashboardHub } from "../4_components/DashboardHub";
import { RepoInputBar } from "../4_components/RepoInputBar";
import { JobStatusBar } from "../4_components/JobStatusBar";
import { VideoPlayerCard } from "../4_components/VideoPlayerCard";
import { OrchestrationGraph } from "../4_components/OrchestrationGraph";
import { TelemetryTerminal } from "../4_components/TelemetryTerminal";
import { AstGraphPreview } from "../4_components/AstGraphPreview";
import { ShowcaseGallery } from "../4_components/ShowcaseGallery";
import { FileTreeSelector } from "../4_components/FileTreeSelector";
import { Footer } from "../4_components/Footer";
import { StudioLoadingSkeleton } from "../4_components/ui/StudioLoadingSkeleton";
import type { EditableStoryboard } from "../4_components/StoryboardEditor";

// Lazy-loaded heavy components & modals (Only downloaded when invoked)
const LandingPage = dynamic(
  () => import("../4_components/LandingPage").then((m) => m.LandingPage),
  {
    loading: () => <StudioLoadingSkeleton />,
    ssr: false,
  }
);

const StoryboardEditor = dynamic(
  () => import("../4_components/StoryboardEditor").then((m) => m.StoryboardEditor),
  { ssr: false }
);

const AuthModal = dynamic(
  () => import("../4_components/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);

const AccountProfileModal = dynamic(
  () => import("../4_components/AccountProfileModal").then((m) => m.AccountProfileModal),
  { ssr: false }
);

const DiffModal = dynamic(
  () => import("../4_components/DiffModal").then((m) => m.DiffModal),
  { ssr: false }
);

const ArchitectureBlueprintModal = dynamic(
  () => import("../4_components/ArchitectureBlueprintModal").then((m) => m.ArchitectureBlueprintModal),
  { ssr: false }
);

const ArchitectureChatbot = dynamic(
  () => import("../4_components/ArchitectureChatbot").then((m) => m.ArchitectureChatbot),
  { ssr: false }
);

const DEFAULT_STORYBOARD: EditableStoryboard = {
  repoName: "GitVideo",
  targetDurationSec: 60,
  estimatedDurationSec: 48,
  totalWordCount: 110,
  tone: "engaging",
  scenes: [
    {
      id: "scene_1",
      sceneNumber: 1,
      type: "title",
      title: "1. Hook & Architectural Introduction",
      durationEstimateSec: 9,
      segments: [
        {
          id: "seg_1_1",
          text: "Welcome to GitVideo, an AI-powered engine turning GitHub codebases into verified video walkthroughs.",
        },
      ],
    },
    {
      id: "scene_2",
      sceneNumber: 2,
      type: "file_tree",
      title: "2. Directory Structure & Entrypoints",
      durationEstimateSec: 10,
      segments: [
        {
          id: "seg_2_1",
          text: "The application is structured into a Node.js backend engine and a Next.js 14 App Router studio workspace.",
        },
      ],
    },
    {
      id: "scene_3",
      sceneNumber: 3,
      type: "code_focus",
      title: "3. Core Code Implementation",
      durationEstimateSec: 14,
      segments: [
        {
          id: "seg_3_1",
          text: "Inspecting the AST extractor: imports and exports are verified with exact line numbers and zero hallucination.",
          focus: { snippetId: "s_1", highlightLines: [1, 2, 3] },
        },
      ],
    },
    {
      id: "scene_4",
      sceneNumber: 4,
      type: "graph",
      title: "4. Dependency & Data Flow",
      durationEstimateSec: 8,
      segments: [
        {
          id: "seg_4_1",
          text: "Analyzing module dependencies shows data flowing cleanly from shallow ingestion into the Remotion renderer.",
        },
      ],
    },
    {
      id: "scene_5",
      sceneNumber: 5,
      type: "outro",
      title: "5. Conclusion & Quickstart",
      durationEstimateSec: 7,
      segments: [
        {
          id: "seg_5_1",
          text: "Clone the repository to get started, or generate your own demo in under 60 seconds with GitVideo.",
        },
      ],
    },
  ],
};

interface StudioClientAppProps {
  initialSession: Session | null;
}

export function StudioClientApp({ initialSession }: StudioClientAppProps) {
  const { data: session, status } = useSession();
  const effectiveSession = session !== undefined ? session : initialSession;

  // View state immediately initialized based on server session and URL query params
  const [view, setView] = useState<"landing" | "dashboard" | "runner">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      if (v === "runner" || v === "studio") return "runner";
      if (v === "dashboard") return "dashboard";
      if (v === "landing") return "landing";
    }
    // If user is already authenticated on the server, open directly into DashboardHub!
    return initialSession?.user ? "dashboard" : "landing";
  });

  const [activeSection, setActiveSection] = useState<StudioSection>("ingest");
  const [studioTab, setStudioTab] = useState<"video" | "storyboard">("video");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [focusedFiles, setFocusedFiles] = useState<string[]>([]);
  const [authReason, setAuthReason] = useState<string | undefined>();
  const [authInitialMode, setAuthInitialMode] = useState<"signin" | "signup">("signup");
  const [activeVideoOverride, setActiveVideoOverride] = useState<string | null>(null);

  const {
    job,
    steps,
    astMetrics,
    logs,
    formattedTimer,
    isRunning,
    isDiffOpen,
    openDiff,
    closeDiff,
    isCancelling,
    cancelJob,
    analyzeRepo,
    copied,
    copyLogs,
    apiError,
    clearError,
    skeleton,
  } = usePipeline();

  // Keep view synchronized if authentication state updates on client
  useEffect(() => {
    if (effectiveSession?.user) {
      setView((prev) => (prev === "landing" ? "dashboard" : prev));
    } else if (status === "unauthenticated" && !initialSession?.user) {
      setView("landing");
    }
  }, [effectiveSession, status, initialSession]);

  // Auto-dismiss API error after 8 seconds
  useEffect(() => {
    if (!apiError) return;
    const timer = setTimeout(() => {
      clearError();
    }, 8000);
    return () => clearTimeout(timer);
  }, [apiError, clearError]);

  // Synchronize smooth scroll when activeSection changes or view switches to runner
  useEffect(() => {
    if (view === "runner" && activeSection) {
      const timer = setTimeout(() => {
        const el = document.getElementById(activeSection);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [view, activeSection]);

  const handleOpenAuth = (reason?: string, mode: "signin" | "signup" = "signup") => {
    setAuthReason(reason);
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAnalyzeRepo = (url: string, skipRender?: boolean) => {
    if (!effectiveSession?.user) {
      handleOpenAuth("Sign in or create a free account to execute repository workflows and generate videos.");
      return;
    }
    setActiveVideoOverride(null);
    analyzeRepo(url, skipRender);
    setView("runner");

    setTimeout(() => {
      const telemEl = document.getElementById("telemetry");
      if (telemEl) {
        telemEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleDashboardWorkflow = (
    url: string,
    mode: "video_16_9" | "video_9_16" | "blueprint_only" | "storyboard_only"
  ) => {
    if (!effectiveSession?.user) {
      handleOpenAuth("Sign in to execute codebase workflows.");
      return;
    }

    if (mode === "storyboard_only") {
      setStudioTab("storyboard");
      setView("runner");
      setTimeout(() => {
        const studioEl = document.getElementById("studio");
        if (studioEl) studioEl.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }

    if (mode === "blueprint_only") {
      handleAnalyzeRepo(url, true); // skipRender = true
      return;
    }

    // Video render (16:9 or 9:16)
    setStudioTab("video");
    handleAnalyzeRepo(url, false);
  };

  const handlePlayDemoVideo = () => {
    setActiveVideoOverride("/api/video");
    setView("runner");
    setTimeout(() => {
      const studioEl = document.getElementById("studio");
      if (studioEl) {
        studioEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const effectiveVideoUrl = activeVideoOverride || job.videoUrl;

  // 1. Initial Loading Safety: If status is still resolving and no session is known, show sleek skeleton
  if (status === "loading" && !effectiveSession) {
    return <StudioLoadingSkeleton />;
  }

  // 2. Unauthenticated Gateway: The Flagship Landing Page
  if (view === "landing" && !effectiveSession?.user) {
    return (
      <LandingPage
        onEnterStudio={() => {
          if (effectiveSession?.user) {
            setView("dashboard");
          } else {
            handleOpenAuth("Sign in or create an account to enter the studio.", "signup");
          }
        }}
        isAuthenticated={false}
        sampleVideoUrl={job.videoUrl}
      />
    );
  }

  // 3. Authenticated Shell: Dashboard Hub or Detailed Runner Workspace
  return (
    <>
      {/* Top Header with Profile Access & Navigation */}
      <Header
        onOpenAuth={() => handleOpenAuth()}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenBlueprint={() => setIsBlueprintModalOpen(true)}
        onOpenChat={() => setIsChatbotOpen(true)}
        activeSection={activeSection}
        onNavigate={(sec) => {
          setActiveSection(sec);
          if (view !== "runner") setView("runner");
        }}
      />

      <main className="w-full pt-20 flex-1 bg-background text-on-surface min-h-screen flex flex-col">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 relative flex-1">
          {/* Ambient Background Gradient Blooms */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-purple-600/10 blur-[130px]" />
            <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full bg-indigo-600/10 blur-[150px]" />
          </div>

          <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto">
            {/* View Toggle Bar (Dashboard Hub vs Engine Telemetry Runner) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-400 font-mono pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("dashboard")}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                    view === "dashboard"
                      ? "bg-purple-600/20 text-purple-300 border-purple-500/40 font-bold"
                      : "bg-surface-container-high border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  <span>Dashboard Hub</span>
                </button>

                <button
                  onClick={() => setView("runner")}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                    view === "runner"
                      ? "bg-purple-600/20 text-purple-300 border-purple-500/40 font-bold"
                      : "bg-surface-container-high border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                  <span>Studio Runner &amp; Player</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsBlueprintModalOpen(true)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-purple-300 hover:text-white transition-all cursor-pointer border border-purple-500/20 hover:border-purple-500/40"
                  title="View and download ARCHITECTURE.md blueprint"
                >
                  <span className="material-symbols-outlined text-sm text-purple-400">description</span>
                  <span>ARCHITECTURE.md</span>
                </button>

                <button
                  onClick={() => setIsChatbotOpen(true)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 hover:text-white transition-all cursor-pointer border border-purple-500/30 shadow-sm"
                  title="Ask questions about repository architecture with AST citations"
                >
                  <span className="material-symbols-outlined text-sm text-emerald-400">smart_toy</span>
                  <span>Ask Architecture Q&amp;A</span>
                </button>

                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-purple-400">person</span>
                  <span>Account &amp; Usage</span>
                </button>
                <button
                  onClick={() => setView("landing")}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  View Marketing Site
                </button>
              </div>
            </div>

            {/* Floating API / Quota Error Toast */}
            {apiError && (
              <aside
                role="alert"
                aria-live="assertive"
                className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-[calc(100%-2rem)] p-4 rounded-2xl bg-[#1c0f12]/95 border border-red-500/40 text-red-200 backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 animate-fade-in"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5 border border-red-500/30">
                    <span className="material-symbols-outlined text-lg">error</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">Execution Alert</p>
                    <p className="text-xs text-red-200/90 mt-0.5 leading-relaxed">{apiError}</p>
                  </div>
                </div>
                <button
                  onClick={clearError}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-red-300 hover:text-white transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                  aria-label="Dismiss alert"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </aside>
            )}

            {/* ======================================================== */}
            {/* VIEW A: Main Dashboard Hub (When user signs in/up)       */}
            {/* ======================================================== */}
            {view === "dashboard" ? (
              <div className="flex flex-col gap-8 animate-fade-in">
                {/* Main Dashboard with Multiple Actions Grid */}
                <DashboardHub
                  onAnalyzeRepo={handleDashboardWorkflow}
                  onOpenProfile={() => setIsProfileModalOpen(true)}
                  onPlayDemoVideo={handlePlayDemoVideo}
                  onOpenBlueprint={() => setIsBlueprintModalOpen(true)}
                  onOpenChat={() => setIsChatbotOpen(true)}
                  isRunning={isRunning}
                />

                {/* Pre-rendered Showcase & Benchmark Gallery */}
                <div className="pt-4 border-t border-white/5">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-400">auto_awesome_motion</span>
                      <span>Verified Benchmark Showcase</span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Inspect pre-rendered video walkthroughs for popular open-source repositories.
                    </p>
                  </div>
                  <ShowcaseGallery
                    onSelectRepo={(url) => handleAnalyzeRepo(url)}
                    onPlayDemoVideo={handlePlayDemoVideo}
                  />
                </div>
              </div>
            ) : (
              /* ======================================================== */
              /* VIEW B: Detailed Pipeline Runner & Video Studio          */
              /* ======================================================== */
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* Section 1: Ingestion Engine Input & Interactive File Tree Focus */}
                <section id="ingest" className="scroll-mt-24 flex flex-col gap-4">
                  <RepoInputBar
                    onAnalyzeRepo={handleAnalyzeRepo}
                    currentRepo={job.repoName}
                    isRunning={isRunning}
                  />

                  {/* Interactive File Tree Selector */}
                  <FileTreeSelector
                    files={skeleton?.files}
                    repoName={job.repoName}
                    isRunning={isRunning}
                    onApplySelection={(selected) => {
                      setFocusedFiles(selected);
                      handleAnalyzeRepo(job.repoName, false);
                    }}
                  />
                </section>

                {/* Section 2: Video Studio & Storyboard Studio */}
                <section id="studio" className="scroll-mt-24 flex flex-col gap-4">
                  {/* View Mode Switcher */}
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-container-high border border-white/5 text-xs font-mono">
                      <button
                        onClick={() => setStudioTab("video")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                          studioTab === "video"
                            ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">play_circle</span>
                        <span>Video Player Viewport</span>
                      </button>
                      <button
                        onClick={() => setStudioTab("storyboard")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                          studioTab === "storyboard"
                            ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        <span>Storyboard Studio &amp; Script</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
                      {studioTab === "video" ? "720p 30fps H.264" : "5 Scenes Grounded in Code"}
                    </span>
                  </div>

                  {studioTab === "storyboard" ? (
                    <StoryboardEditor
                      initialStoryboard={DEFAULT_STORYBOARD}
                      onApproveAndRender={() => {
                        setStudioTab("video");
                        handleAnalyzeRepo(job.repoName, false);
                      }}
                      isRendering={isRunning}
                    />
                  ) : effectiveVideoUrl ? (
                    <VideoPlayerCard
                      videoUrl={effectiveVideoUrl}
                      repoName={job.repoName}
                      durationSec={job.videoDurationSec}
                      sizeMb={job.videoSizeMb}
                    />
                  ) : (
                    <div className="w-full p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                          <span className="material-symbols-outlined text-2xl">movie_filter</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-white">Video Studio Viewport</h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container-high text-gray-400 border border-white/5">
                              Ready for Render
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                            Enter a repository URL above to compile an animated walkthrough video, or inspect the pre-rendered benchmark video from the showcase gallery.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handlePlayDemoVideo}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">play_circle</span>
                        <span>Watch Benchmark Video</span>
                      </button>
                    </div>
                  )}
                </section>

                {/* Section 3: Pipeline Telemetry & Live Terminal */}
                <section id="telemetry" className="scroll-mt-24 flex flex-col gap-6">
                  <JobStatusBar job={job} formattedTimer={formattedTimer} />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      <OrchestrationGraph
                        steps={steps}
                        onOpenDiff={openDiff}
                        onCancel={cancelJob}
                        isCancelling={isCancelling}
                      />
                    </div>

                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <TelemetryTerminal logs={logs} onCopy={copyLogs} copied={copied} />
                      <AstGraphPreview metrics={astMetrics} />
                    </div>
                  </div>
                </section>

                {/* Section 4: Showcase Gallery */}
                <ShowcaseGallery
                  onSelectRepo={(url) => handleAnalyzeRepo(url)}
                  onPlayDemoVideo={handlePlayDemoVideo}
                />
              </div>
            )}
          </div>
        </div>

        {/* Dynamically Loaded Modals (Zero impact on initial page bundle) */}
        {isDiffOpen && <DiffModal isOpen={isDiffOpen} onClose={closeDiff} />}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            reason={authReason}
            initialMode={authInitialMode}
          />
        )}

        {isProfileModalOpen && (
          <AccountProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}

        {isBlueprintModalOpen && (
          <ArchitectureBlueprintModal
            isOpen={isBlueprintModalOpen}
            onClose={() => setIsBlueprintModalOpen(false)}
            onOpenChat={() => setIsChatbotOpen(true)}
            repoName={job.repoName}
          />
        )}

        {isChatbotOpen && (
          <ArchitectureChatbot
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
            repoName={job.repoName}
            onSelectFocusFiles={(files) => {
              setFocusedFiles(files);
              const ingestEl = document.getElementById("ingest");
              if (ingestEl) ingestEl.scrollIntoView({ behavior: "smooth" });
            }}
          />
        )}

        {/* SaaS Footer */}
        <Footer />
      </main>
    </>
  );
}

