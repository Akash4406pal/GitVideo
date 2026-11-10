"use client";

import React from "react";

export interface ShowcaseItem {
  id: string;
  title: string;
  repo: string;
  repoUrl: string;
  category: string;
  duration: string;
  loc: string;
  scenesCount: number;
  voice: string;
  description: string;
  highlights: string[];
  videoAvailable?: boolean;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "express",
    title: "Express.js Fast Routing Engine",
    repo: "expressjs/express",
    repoUrl: "https://github.com/expressjs/express",
    category: "Node.js Framework (64k★)",
    duration: "50.04s",
    loc: "9.4k LOC",
    scenesCount: 5,
    voice: "Neural Edge (Christopher)",
    description:
      "Full architectural tour of Express: createApplication export, lib structure, request and response lifecycle, middleware pipeline, and router dispatching.",
    highlights: ["createApplication", "Middleware Pipeline", "Request Delegation", "HTTP Layer Stack"],
    videoAvailable: true,
  },
  {
    id: "gitvideo",
    title: "GitVideo Engine & Compositor",
    repo: "Akash4406pal/GitVideo",
    repoUrl: "https://github.com/Akash4406pal/GitVideo",
    category: "AI & Video Compiling",
    duration: "56.90s",
    loc: "6.7k LOC",
    scenesCount: 5,
    voice: "Neural Edge (Christopher)",
    description:
      "Full tour of GitVideo: AST repo analysis, LLM storyboard generation, Edge TTS speech synthesis, and multi-core Chromium Remotion video compiling.",
    highlights: ["AST Scanner", "Grounded AI Prompting", "Remotion H.264 Renderer"],
    videoAvailable: true,
  },
  {
    id: "flask",
    title: "Flask WSGI Microframework",
    repo: "pallets/flask",
    repoUrl: "https://github.com/pallets/flask",
    category: "Python Framework",
    duration: "48.70s",
    loc: "9.4k LOC",
    scenesCount: 4,
    voice: "Neural Edge (Christopher)",
    description:
      "Deep dive into Werkzeug WSGI bridging, RequestContext stacking, thread-local storage, and modular Blueprint routing systems.",
    highlights: ["WSGI Dispatcher", "Context Local Stacks", "Blueprint Registry"],
    videoAvailable: false,
  },
  {
    id: "customer-trends",
    title: "Customer Trends Data Analysis",
    repo: "amlanmohanty1/customer-trends-data-analysis-SQL-Python-PowerBI",
    repoUrl: "https://github.com/amlanmohanty1/customer-trends-data-analysis-SQL-Python-PowerBI",
    category: "Data Engineering & Analytics",
    duration: "45.34s",
    loc: "1.2k LOC",
    scenesCount: 5,
    voice: "Neural Edge (Christopher)",
    description:
      "End-to-end data pipeline walkthrough. Explains business questions 1 through 5, sales demographic queries, Python feature extraction, and PowerBI visuals.",
    highlights: ["SQL Analytical Queries", "Python Pandas Pipeline", "Business Question Narrative"],
    videoAvailable: true,
  },
];

interface ShowcaseGalleryProps {
  onSelectRepo: (repoUrl: string) => void;
  onPlayDemoVideo?: () => void;
}

export function ShowcaseGallery({ onSelectRepo, onPlayDemoVideo }: ShowcaseGalleryProps) {
  return (
    <section id="gallery" className="scroll-mt-24 flex flex-col gap-space-md w-full">
      {/* Gallery Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-space-xs">
        <div className="flex items-center gap-space-sm">
          <div className="w-9 h-9 rounded-xl bg-tertiary-container/30 border border-tertiary/20 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-tertiary text-[20px]">
              auto_awesome_motion
            </span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface text-lg sm:text-xl font-bold">
              Showcase Gallery
            </h3>
            <p className="text-xs text-on-surface-variant text-gray-400">
              Pre-rendered and benchmarked codebase walkthroughs ready for instant inspection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-surface-container-high text-[11px] font-mono text-gray-300 border border-white/5">
            4 Verified Repositories
          </span>
        </div>
      </div>

      {/* Grid of Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SHOWCASE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-purple-500/40 transition-all duration-200 shadow-xl hover:shadow-2xl hover:bg-surface-container hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              {/* Card Header & Badge Strip */}
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-highest text-purple-300 border border-purple-500/20">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">{item.loc}</span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-xs font-mono text-gray-400 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-gray-500">code</span>
                    <span>{item.repo}</span>
                  </span>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                    <span className="material-symbols-outlined text-[13px]">timer</span>
                    {item.duration}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 mt-1">
                    {item.scenesCount} Scenes
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 leading-relaxed mb-4">{item.description}</p>

              {/* Highlights Pill Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {item.highlights.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-container-high/90 text-gray-300 border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3.5 border-t border-white/5 mt-auto">
              <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-purple-400">record_voice_over</span>
                <span>{item.voice}</span>
              </span>

              <div className="flex items-center gap-2">
                {item.videoAvailable && onPlayDemoVideo && (
                  <button
                    onClick={onPlayDemoVideo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 active:scale-[0.98] border border-emerald-500/30 text-xs font-medium transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                    aria-label={`Play benchmark video for ${item.title}`}
                  >
                    <span className="material-symbols-outlined text-[15px]">play_circle</span>
                    <span>Play Demo</span>
                  </button>
                )}

                <button
                  onClick={() => onSelectRepo(item.repoUrl)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/20 text-purple-200 hover:bg-purple-600/35 active:scale-[0.98] border border-purple-500/30 text-xs font-medium transition-all cursor-pointer hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
                  aria-label={`Load ${item.repo} in studio`}
                >
                  <span className="material-symbols-outlined text-[15px]">tune</span>
                  <span>Load in Studio</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
