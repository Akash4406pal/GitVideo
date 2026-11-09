"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePipeline } from '../3_hooks/usePipeline';
import { Header, StudioSection } from '../4_components/Header';
import { LandingPage } from '../4_components/LandingPage';
import { AuthModal } from '../4_components/AuthModal';
import { RepoInputBar } from '../4_components/RepoInputBar';
import { JobStatusBar } from '../4_components/JobStatusBar';
import { VideoPlayerCard } from '../4_components/VideoPlayerCard';
import { OrchestrationGraph } from '../4_components/OrchestrationGraph';
import { TelemetryTerminal } from '../4_components/TelemetryTerminal';
import { AstGraphPreview } from '../4_components/AstGraphPreview';
import { ShowcaseGallery } from '../4_components/ShowcaseGallery';
import { DiffModal } from '../4_components/DiffModal';
import { Footer } from '../4_components/Footer';

export default function PipelinePage() {
  const { data: session } = useSession();
  const [view, setView] = useState<"landing" | "studio">("landing");
  const [activeSection, setActiveSection] = useState<StudioSection>("ingest");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>();
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
  } = usePipeline();

  // If user signs in, smoothly transition into the Studio Workspace
  useEffect(() => {
    if (session?.user) {
      setView("studio");
    }
  }, [session]);

  // Set up intersection observer to dynamically highlight the active header section as user scrolls
  useEffect(() => {
    if (view !== "studio") return;

    const sectionIds: StudioSection[] = ["ingest", "studio", "telemetry", "gallery"];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as StudioSection);
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [view]);

  const handleAnalyzeRepo = (url: string, skipRender?: boolean) => {
    if (!session?.user) {
      setAuthReason("Verified GitHub or Google sign-in is required to generate AI videos and enforce token quotas.");
      setIsAuthModalOpen(true);
      return;
    }
    setActiveVideoOverride(null);
    analyzeRepo(url, skipRender);

    // Smoothly scroll down to telemetry when generation starts
    const telemEl = document.getElementById("telemetry");
    if (telemEl) {
      telemEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePlayDemoVideo = () => {
    setActiveVideoOverride("/api/video");
    const studioEl = document.getElementById("studio");
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const effectiveVideoUrl = activeVideoOverride || job.videoUrl;

  // 1. Initial / Unauthenticated Gateway: The Landing Page
  if (view === "landing" && !session?.user) {
    return (
      <LandingPage
        onEnterStudio={() => setView("studio")}
        isAuthenticated={false}
        sampleVideoUrl={job.videoUrl}
      />
    );
  }

  // 2. Authenticated / Studio View: Codebase Walkthrough Studio
  return (
    <>
      {/* Fixed Desktop Header with 4 Working Nav Tabs & Auth Profile */}
      <Header
        onOpenAuth={() => {
          setAuthReason(undefined);
          setIsAuthModalOpen(true);
        }}
        activeSection={activeSection}
        onNavigate={(sec) => setActiveSection(sec)}
      />

      {/* Main Viewport Workspace */}
      <main className="w-full pt-16 flex-1 bg-background text-on-surface">
        <div className="flex flex-col w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 relative overflow-hidden">
            {/* Ambient Background Gradient Blooms */}
            <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-secondary-container/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full bg-tertiary-container/10 blur-[140px] pointer-events-none"></div>

            <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto">
              {/* Back to Landing Page link for quick overview */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                <button
                  onClick={() => setView("landing")}
                  className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-surface-container-high border border-white/5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>View Product Overview & Demo</span>
                </button>
                <span className="text-gray-500 hidden sm:inline">
                  GitVideo Studio Workspace • Connected to Backend Multi-Core Engine
                </span>
              </div>

              {/* API / Quota Error Toast */}
              {apiError && (
                <div className="p-4 rounded-xl bg-error-container/40 border border-error/40 text-error flex items-start justify-between gap-3 animate-fade-in shadow-xl">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">error</span>
                    <div>
                      <p className="font-semibold text-sm">Generation Blocked</p>
                      <p className="text-xs text-red-200 mt-0.5">{apiError}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearError}
                    className="p-1 rounded hover:bg-white/10 text-red-200 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              )}

              {/* ======================================================== */}
              {/* Section 1: Ingestion Engine (#ingest)                   */}
              {/* ======================================================== */}
              <section id="ingest" className="scroll-mt-24">
                <RepoInputBar
                  onAnalyzeRepo={handleAnalyzeRepo}
                  currentRepo={job.repoName}
                  isRunning={isRunning}
                />
              </section>

              {/* ======================================================== */}
              {/* Section 2: Video Studio (#studio)                       */}
              {/* ======================================================== */}
              <section id="studio" className="scroll-mt-24">
                {effectiveVideoUrl ? (
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

              {/* ======================================================== */}
              {/* Section 3: Pipeline Telemetry (#telemetry)               */}
              {/* ======================================================== */}
              <section id="telemetry" className="scroll-mt-24 flex flex-col gap-6">
                {/* Top Job & Streaming Telemetry Bar */}
                <JobStatusBar job={job} formattedTimer={formattedTimer} />

                {/* 12-Column Responsive Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column (7 cols): Pipeline Stages Stepper */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <OrchestrationGraph
                      steps={steps}
                      onOpenDiff={openDiff}
                      onCancel={cancelJob}
                      isCancelling={isCancelling}
                    />
                  </div>

                  {/* Right Column (5 cols): Live Terminal & AST Graph Preview */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <TelemetryTerminal
                      logs={logs}
                      onCopy={copyLogs}
                      copied={copied}
                    />
                    <AstGraphPreview metrics={astMetrics} />
                  </div>
                </div>
              </section>

              {/* ======================================================== */}
              {/* Section 4: Showcase Gallery (#gallery)                  */}
              {/* ======================================================== */}
              <ShowcaseGallery
                onSelectRepo={(url) => {
                  handleAnalyzeRepo(url);
                }}
                onPlayDemoVideo={handlePlayDemoVideo}
              />
            </div>
          </div>
        </div>

        {/* Interactive Diff Modal */}
        <DiffModal isOpen={isDiffOpen} onClose={closeDiff} />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          reason={authReason}
        />
      </main>

      {/* Desktop SaaS Footer */}
      <Footer />
    </>
  );
}
