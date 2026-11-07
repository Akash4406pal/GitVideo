"use client";

import React, { useState } from "react";

interface VideoPlayerCardProps {
  videoUrl?: string | null;
  repoName?: string;
  durationSec?: number;
  sizeMb?: string;
}

export function VideoPlayerCard({
  videoUrl = "/api/video",
  repoName = "GitVideo",
  durationSec = 56.9,
  sizeMb = "5.49",
}: VideoPlayerCardProps) {
  const [copied, setCopied] = useState(false);

  if (!videoUrl) return null;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}${videoUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full p-space-md rounded-xl bg-surface-container-low shadow-2xl border border-primary/30 flex flex-col gap-space-sm relative overflow-hidden">
      {/* Ambient background bloom */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-[90px] pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs relative z-10">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[22px]">smart_display</span>
          <span className="font-headline-md text-headline-md text-on-surface">
            Rendered Walkthrough: <span className="text-primary">{repoName}</span>
          </span>
          <span className="px-space-xs py-0.5 rounded bg-tertiary-container/40 text-tertiary font-label-uppercase text-label-uppercase text-[11px]">
            Ready
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">
            720p @ 30fps
          </span>
          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">
            {durationSec}s
          </span>
          {sizeMb && (
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">
              {sizeMb} MB
            </span>
          )}
        </div>
      </div>

      {/* 16:9 Video Canvas */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/90 border border-outline-variant/30 shadow-inner group">
        <video
          key={videoUrl}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-contain"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-space-xs pt-1 relative z-10">
        <span className="font-code-sm text-code-sm text-on-surface-variant flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          Remotion SSR Headless Render • H.264 / AAC
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-body-sm text-body-sm"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? "check" : "content_copy"}
            </span>
            <span>{copied ? "Copied!" : "Share Link"}</span>
          </button>

          <a
            href={videoUrl}
            download={`${repoName}-walkthrough.mp4`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary transition-colors font-body-sm text-body-sm font-semibold shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download MP4</span>
          </a>
        </div>
      </div>
    </div>
  );
}

