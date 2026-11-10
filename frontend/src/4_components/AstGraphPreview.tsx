"use client";

import React from "react";
import { AstMetrics } from "../1_domain/pipeline";

interface AstGraphPreviewProps {
  metrics: AstMetrics;
}

export function AstGraphPreview({ metrics }: AstGraphPreviewProps) {
  const nodeName = metrics.activeNode?.split("/").pop() || "index.ts";

  return (
    <div className="p-space-md rounded-xl bg-surface-container-low shadow-xl border border-outline-variant/20 flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[18px] text-tertiary">hub</span>
          <h4 className="font-headline-md text-headline-md text-on-surface">AST Dependency Flow</h4>
        </div>
        <span className="font-code-sm text-code-sm text-outline font-medium font-mono text-[11px]">
          Live Module Topology
        </span>
      </div>

      {/* Dynamic Visual Graph Canvas */}
      <div
        role="img"
        aria-label="AST Dependency and Module Flow Graph"
        className="w-full h-32 rounded-lg bg-surface-container-lowest p-space-sm flex items-center justify-center relative overflow-hidden border border-white/5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]" />

        <svg className="w-full h-full text-outline-variant relative z-10" fill="none" viewBox="0 0 360 100">
          <defs>
            <linearGradient id="astFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8083ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#d0bcff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4edea3" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Animated Flow Lines */}
          <path
            d="M50 50 H110 M150 50 H210 M250 50 H310 M210 50 V20 H250 M210 50 V80 H250"
            stroke="url(#astFlowGrad)"
            strokeDasharray="4 4"
            strokeWidth="1.5"
            className="opacity-70 animate-pulse"
          />

          {/* Node 1: Ingestion Root */}
          <circle className="fill-surface-container-high stroke-outline/80" cx="50" cy="50" r="14" strokeWidth="1.5" />
          <text className="fill-on-surface font-mono text-[9px] font-medium" textAnchor="middle" x="50" y="53">repo</text>

          {/* Node 2: Entrypoint Active Node */}
          <circle className="fill-purple-600/30 stroke-purple-400" cx="130" cy="50" r="17" strokeWidth="2" />
          <text className="fill-purple-200 font-mono text-[9px] font-bold" textAnchor="middle" x="130" y="53">
            {nodeName.length > 7 ? nodeName.slice(0, 6) + "…" : nodeName}
          </text>

          {/* Node 3: Grounded AST */}
          <circle className="fill-indigo-600/30 stroke-indigo-400" cx="230" cy="50" r="17" strokeWidth="2" />
          <text className="fill-indigo-200 font-mono text-[9px] font-bold" textAnchor="middle" x="230" y="53">AST</text>

          {/* Node 4: Remotion Studio */}
          <circle className="fill-emerald-600/30 stroke-emerald-400" cx="310" cy="50" r="15" strokeWidth="1.5" />
          <text className="fill-emerald-200 font-mono text-[9px] font-bold" textAnchor="middle" x="310" y="53">video</text>

          {/* Sub-branch nodes */}
          <circle className="fill-surface-container-highest stroke-outline/50" cx="260" cy="20" r="10" strokeWidth="1" />
          <text className="fill-gray-300 font-mono text-[7px]" textAnchor="middle" x="260" y="23">types</text>

          <circle className="fill-surface-container-highest stroke-outline/50" cx="260" cy="80" r="10" strokeWidth="1" />
          <text className="fill-gray-300 font-mono text-[7px]" textAnchor="middle" x="260" y="83">tts</text>
        </svg>
      </div>

      {/* Dynamic Inspector Stats Strip */}
      <div className="grid grid-cols-3 gap-space-xs pt-1">
        <div className="p-space-xs rounded-lg bg-surface-container-highest/80 border border-white/5 flex flex-col">
          <span className="font-label-uppercase text-label-uppercase text-on-surface-variant text-[10px]">Active Target</span>
          <span className="font-code-sm text-code-sm text-on-surface font-semibold truncate font-mono text-xs mt-0.5" title={metrics.activeNode}>
            {metrics.activeNode}
          </span>
        </div>
        <div className="p-space-xs rounded-lg bg-surface-container-highest/80 border border-white/5 flex flex-col">
          <span className="font-label-uppercase text-label-uppercase text-on-surface-variant text-[10px]">Verified Symbols</span>
          <span className="font-code-sm text-code-sm text-tertiary font-semibold font-mono text-xs mt-0.5">{metrics.symbolCount}</span>
        </div>
        <div className="p-space-xs rounded-lg bg-surface-container-highest/80 border border-white/5 flex flex-col">
          <span className="font-label-uppercase text-label-uppercase text-on-surface-variant text-[10px]">AST Depth</span>
          <span className="font-code-sm text-code-sm text-primary font-semibold font-mono text-xs mt-0.5">{metrics.astDepth}</span>
        </div>
      </div>
    </div>
  );
}
