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
    duration: "56.9s",
    loc: "6.7k LOC",
    scenesCount: 5,
    voice: "Neural Edge (Christopher)",
    description:
      "Full tour of GitVideo: AST repo analysis, LLM storyboard generation, Edge TTS speech synthesis, and multi-core Chromium Remotion video compiling.",
    highlights: ["AST Scanner", "Grounded AI Prompting", "Remotion H.264 Renderer"],
    videoAvailable: false,
  },
  {
    id: "flask",
    title: "Flask WSGI Microframework",
    repo: "pallets/flask",
    repoUrl: "https://github.com/pallets/flask",
    category: "Python Framework",
    duration: "48.7s",
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
    videoAvailable: false,
  },
];

interface ShowcaseGalleryProps {
  onSelectRepo: (repoUrl: string) => void;
  onPlayDemoVideo?: () => void;
}

export function ShowcaseGallery({ onSelectRepo, onPlayDemoVideo }: ShowcaseGalleryProps) {
  return (
    <section id="gallery" className="scroll-mt-24 flex flex-col gap-space-md w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-space-xs">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-tertiary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-[20px]">
              auto_awesome_motion
            </span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Showcase Gallery</h2>
            <p className="text-xs text-on-surface-variant">
              Pre-rendered and benchmarked codebase walkthroughs ready for instant inspection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-[11px] font-mono text-gray-400 border border-white/5">
            4 Curated Projects
          </span>
        </div>
      </div>

      {/* Grid of Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHOWCASE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:bg-surface-container flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-highest text-purple-300 border border-purple-500/20">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500">{item.loc}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-xs font-mono text-gray-400 mt-0.5">{item.repo}</span>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
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
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
              <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-purple-400">record_voice_over</span>
                {item.voice}
              </span>

              <div className="flex items-center gap-2">
                {item.videoAvailable && onPlayDemoVideo && (
                  <button
                    onClick={onPlayDemoVideo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-medium transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">play_circle</span>
                    <span>Play Video</span>
                  </button>
                )}

                <button
                  onClick={() => onSelectRepo(item.repoUrl)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-medium transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-[15px]">play_arrow</span>
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

