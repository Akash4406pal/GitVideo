"use client";

import React from 'react';
import { PipelineStep } from '../1_domain/pipeline';

interface PipelineStepperProps {
  steps: PipelineStep[];
  activeModelNode: string;
}

export function PipelineStepper({ steps, activeModelNode }: PipelineStepperProps) {
  return (
    <div className="rounded-xl bg-surface-container-low p-space-md shadow-xl flex flex-col space-y-space-md">
      <div className="flex items-center justify-between pb-1">
        <span className="font-code-sm text-code-sm font-semibold uppercase tracking-wider text-outline">
          Execution Pipeline
        </span>
        <span className="font-code-sm text-code-sm text-tertiary">
          Active Node: {activeModelNode}
        </span>
      </div>

      {/* Step 1: Sandbox Cloned */}
      <div className="flex items-start gap-space-sm relative">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-tertiary/15 text-tertiary">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </div>
          <div className="w-0.5 h-10 bg-tertiary/40 my-0.5"></div>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-headline-md text-headline-md text-on-surface truncate">
              {steps[0]?.title || 'Cloning Sandbox'}
            </span>
            <span className="font-code-sm text-code-sm text-tertiary flex-shrink-0">
              {steps[0]?.durationBadge || '120ms'}
            </span>
          </div>
          <p className="font-code-sm text-code-sm text-on-surface-variant truncate mt-0.5">
            {steps[0]?.description}
          </p>
        </div>
      </div>

      {/* Step 2: AST Analysis */}
      <div className="flex items-start gap-space-sm relative">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-tertiary/15 text-tertiary">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </div>
          <div className="w-0.5 h-12 bg-primary/50 my-0.5"></div>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-headline-md text-headline-md text-on-surface truncate">
              {steps[1]?.title || 'Analyzing AST & Symbol Graph'}
            </span>
            <span className="font-code-sm text-code-sm text-tertiary flex-shrink-0">
              {steps[1]?.durationBadge || '840ms'}
            </span>
          </div>
          <p className="font-code-sm text-code-sm text-on-surface-variant truncate mt-0.5">
            {steps[1]?.description}
          </p>
        </div>
      </div>

      {/* Step 3: Active Narrative Drafting */}
      <div className="flex items-start gap-space-sm relative">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary shadow-[0_0_12px_rgba(128,131,255,0.7)]">
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
          </div>
          <div className="w-0.5 h-16 bg-surface-container-highest my-0.5"></div>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-headline-md text-headline-md text-primary font-bold truncate">
              {steps[2]?.title || 'Drafting Storyboard Narrative'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-code-sm text-code-sm font-semibold flex-shrink-0">
              {steps[2]?.progressPercent || 78}%
            </span>
          </div>
          <p className="font-code-sm text-code-sm text-on-surface mt-0.5">
            {steps[2]?.description}
          </p>
          {/* Live Audio Waveform / Generation Monitor */}
          <div className="mt-2.5 rounded bg-surface-container p-2 flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[16px] text-secondary">graphic_eq</span>
              <span className="font-code-sm text-code-sm text-on-surface-variant truncate">
                {steps[2]?.subNote || 'Act 2: Architecture Walkthrough'}
              </span>
            </div>
            <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
              <span className="w-1 bg-secondary rounded-full animate-pulse h-3"></span>
              <span className="w-1 bg-primary rounded-full animate-pulse h-2"></span>
              <span className="w-1 bg-tertiary rounded-full animate-pulse h-3.5"></span>
              <span className="w-1 bg-secondary rounded-full animate-pulse h-1.5"></span>
              <span className="w-1 bg-primary-container rounded-full animate-pulse h-2.5"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4: Synthesizing Audio */}
      <div className="flex items-start gap-space-sm relative">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-container text-outline">
            <span className="material-symbols-outlined text-[15px]">radio_button_unchecked</span>
          </div>
          <div className="w-0.5 h-10 bg-surface-container-highest my-0.5"></div>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-headline-md text-headline-md text-outline truncate">
              {steps[3]?.title || 'Synthesizing Audio'}
            </span>
            <span className="font-code-sm text-code-sm text-outline flex-shrink-0">QUEUED</span>
          </div>
          <p className="font-code-sm text-code-sm text-outline truncate mt-0.5">
            {steps[3]?.description}
          </p>
        </div>
      </div>

      {/* Step 5: Remotion Video Renderer */}
      <div className="flex items-start gap-space-sm relative">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-container text-outline">
            <span className="material-symbols-outlined text-[15px]">radio_button_unchecked</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-headline-md text-headline-md text-outline truncate">
              {steps[4]?.title || 'Rendering Remotion Video'}
            </span>
            <span className="font-code-sm text-code-sm text-outline flex-shrink-0">QUEUED</span>
          </div>
          <p className="font-code-sm text-code-sm text-outline truncate mt-0.5">
            {steps[4]?.description}
          </p>
        </div>
      </div>
    </div>
  );
}

