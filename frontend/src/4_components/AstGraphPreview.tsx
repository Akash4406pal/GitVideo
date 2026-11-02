"use client";

import React from 'react';
import { AstMetrics } from '../1_domain/pipeline';

interface AstGraphPreviewProps {
  metrics: AstMetrics;
}

export function AstGraphPreview({ metrics }: AstGraphPreviewProps) {
  return (
    <div className="p-space-md rounded-xl bg-surface-container-low shadow-xl flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[18px] text-tertiary">hub</span>
          <span className="font-headline-md text-headline-md text-on-surface">AST Symbol Graph Preview</span>
        </div>
        <span className="font-code-sm text-code-sm text-outline font-medium">AST &amp; Dependency Inspector</span>
      </div>

      <div className="w-full h-32 rounded-lg bg-surface-container-lowest p-space-sm flex items-center justify-center relative overflow-hidden">
        <svg className="w-full h-full text-outline-variant" fill="none" viewBox="0 0 360 100">
          <path
            d="M40 50 H90 M130 50 H180 M220 50 H270 M180 50 V20 H220 M180 50 V80 H220"
            stroke="currentColor"
            strokeDasharray="3 3"
            strokeWidth="1.5"
          ></path>
          <circle className="fill-surface-container-high stroke-outline" cx="40" cy="50" r="14" strokeWidth="1.5"></circle>
          <text className="fill-on-surface font-code-sm text-[10px]" textAnchor="middle" x="40" y="53">root</text>
          <circle className="fill-surface-container-high stroke-primary" cx="110" cy="50" r="16" strokeWidth="2"></circle>
          <text className="fill-primary font-code-sm text-[10px]" textAnchor="middle" x="110" y="53">module</text>
          <circle className="fill-secondary-container stroke-secondary" cx="200" cy="50" r="16" strokeWidth="2"></circle>
          <text className="fill-on-secondary-container font-code-sm text-[10px]" textAnchor="middle" x="200" y="53">AST</text>
          <circle className="fill-surface-container-high stroke-tertiary" cx="290" cy="50" r="14" strokeWidth="1.5"></circle>
          <text className="fill-tertiary font-code-sm text-[10px]" textAnchor="middle" x="290" y="53">graph</text>
          <circle className="fill-surface-container-highest stroke-outline" cx="240" cy="20" r="10" strokeWidth="1"></circle>
          <circle className="fill-surface-container-highest stroke-outline" cx="240" cy="80" r="10" strokeWidth="1"></circle>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-space-xs pt-1">
        <div className="p-space-xs rounded bg-surface-container-highest flex flex-col">
          <span className="font-label-uppercase text-label-uppercase text-on-surface-variant">Active Node</span>
          <span className="font-code-sm text-code-sm text-on-surface font-semibold truncate">{metrics.activeNode}</span>
        </div>
        <div className="p-space-xs rounded bg-surface-container-highest flex flex-col">
          <span className="font-label-uppercase text-label-uppercase text-on-surface-variant">Symbol Count</span>
          <span className="font-code-sm text-code-sm text-tertiary font-semibold">{metrics.symbolCount}</span>
        </div>
        <div className="p-space-xs rounded bg-surface-container-highest flex flex-col">
          <span className="font-label-uppercase text-label-uppercase text-on-surface-variant">AST Depth</span>
          <span className="font-code-sm text-code-sm text-primary font-semibold">{metrics.astDepth}</span>
        </div>
      </div>
    </div>
  );
}

