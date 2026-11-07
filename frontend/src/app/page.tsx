"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePipeline } from '../3_hooks/usePipeline';
import { Header } from '../4_components/Header';
import { LandingPage } from '../4_components/LandingPage';
import { AuthModal } from '../4_components/AuthModal';
import { RepoInputBar } from '../4_components/RepoInputBar';
import { JobStatusBar } from '../4_components/JobStatusBar';
import { VideoPlayerCard } from '../4_components/VideoPlayerCard';
import { OrchestrationGraph } from '../4_components/OrchestrationGraph';
import { TelemetryTerminal } from '../4_components/TelemetryTerminal';
import { AstGraphPreview } from '../4_components/AstGraphPreview';
import { DiffModal } from '../4_components/DiffModal';
import { Footer } from '../4_components/Footer';

export default function PipelinePage() {
  const { data: session, status } = useSession();
  const [view, setView] = useState<"landing" | "studio">("landing");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>();

  const {
    job,
    steps,
    astMetrics,
    logs,
    formattedTimer,
    isDiffOpen,
    openDiff,
    closeDiff,
    isCancelling,
    cancelJob,
    analyzeRepo,
    copied,
    copyLogs,
  } = usePipeline();

  // If user signs in, smoothly transition into the Studio Workspace
  useEffect(() => {
    if (session?.user) {
      setView("studio");
    }
  }, [session]);

  const handleAnalyzeRepo = (url: string, skipRender?: boolean) => {
    if (!session?.user) {
      setAuthReason("Sign in with GitHub or Google to generate an AI walkthrough video.");
      setIsAuthModalOpen(true);
      return;
    }
    analyzeRepo(url, skipRender);
  };

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
      {/* Fixed Desktop Header with Auth & Quota */}
      <Header onOpenAuth={() => {
        setAuthReason(undefined);
        setIsAuthModalOpen(true);
      }} />

      {/* Main Viewport Workspace */}
      <main className="w-full pt-16 flex-1 bg-background">
        <div className="flex flex-col w-full">
          <div className="w-full px-margin-desktop py-space-xl relative overflow-hidden">
            {/* Ambient Background Gradient Blooms */}
            <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-secondary-container/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full bg-tertiary-container/10 blur-[140px] pointer-events-none"></div>

            <div className="w-full flex flex-col gap-space-lg">
              {/* Back to Landing Page link for quick overview */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                <button
                  onClick={() => setView("landing")}
                  className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-surface-container-high border border-white/5"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>View Product Overview & Demo</span>
                </button>
                <span className="text-gray-500">GitVideo Studio Workspace • Connected to Backend</span>
              </div>

              {/* Repository Input & Quickstart Controls */}
              <RepoInputBar onAnalyzeRepo={handleAnalyzeRepo} currentRepo={job.repoName} />

              {/* Rendered Video Player Card (when available) */}
              {job.videoUrl && (
                <VideoPlayerCard
                  videoUrl={job.videoUrl}
                  repoName={job.repoName}
                  durationSec={job.videoDurationSec}
                  sizeMb={job.videoSizeMb}
                />
              )}

              {/* Top Job & Streaming Telemetry Bar */}
              <JobStatusBar job={job} formattedTimer={formattedTimer} />

              {/* 12-Column Responsive Workspace Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                {/* Left Column (7 cols): Pipeline Stages Stepper */}
                <div className="lg:col-span-7 flex flex-col gap-space-md">
                  <OrchestrationGraph
                    steps={steps}
                    onOpenDiff={openDiff}
                    onCancel={cancelJob}
                    isCancelling={isCancelling}
                  />
                </div>

                {/* Right Column (5 cols): Live Terminal & AST Graph Preview */}
                <div className="lg:col-span-5 flex flex-col gap-space-md">
                  <TelemetryTerminal
                    logs={logs}
                    onCopy={copyLogs}
                    copied={copied}
                  />
                  <AstGraphPreview metrics={astMetrics} />
                </div>
              </div>
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
