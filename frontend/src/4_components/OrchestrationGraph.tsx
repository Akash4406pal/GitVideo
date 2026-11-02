"use client";

import React from 'react';
import { PipelineStep } from '../1_domain/pipeline';

interface OrchestrationGraphProps {
  steps: PipelineStep[];
  onOpenDiff: () => void;
  onCancel: () => void;
  isCancelling: boolean;
}

export function OrchestrationGraph({
  steps,
  onOpenDiff,
  onCancel,
  isCancelling,
}: OrchestrationGraphProps) {
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-center justify-between px-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[18px]">schema</span>
          <span className="font-headline-md text-headline-md text-on-surface">Orchestration Graph</span>
        </div>
        <span className="font-code-sm text-code-sm text-on-surface-variant">Target: Remotion v4.0 SSR</span>
      </div>

      <div className="flex flex-col gap-space-sm">
        {/* Stage 1 */}
        <div className="p-space-md rounded-xl bg-surface-container-low transition-all duration-300 shadow-md hover:bg-surface-container">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-space-md">
              <div className="w-7 h-7 rounded-lg bg-tertiary-container/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-md text-headline-md text-on-surface">{steps[0]?.title}</span>
                  <span className="px-space-xs py-0.5 rounded bg-tertiary-container/40 text-tertiary font-label-uppercase text-label-uppercase">
                    {steps[0]?.badgeText}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{steps[0]?.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-code-sm text-code-sm text-tertiary font-semibold">{steps[0]?.metric1}</span>
              <span className="font-code-sm text-code-sm text-outline">{steps[0]?.metric2}</span>
            </div>
          </div>
        </div>

        {/* Stage 2 */}
        <div className="p-space-md rounded-xl bg-surface-container-low transition-all duration-300 shadow-md hover:bg-surface-container">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-space-md">
              <div className="w-7 h-7 rounded-lg bg-tertiary-container/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-md text-headline-md text-on-surface">{steps[1]?.title}</span>
                  <span className="px-space-xs py-0.5 rounded bg-tertiary-container/40 text-tertiary font-label-uppercase text-label-uppercase">
                    {steps[1]?.badgeText}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{steps[1]?.description}</p>
                <div className="flex items-center gap-space-md mt-2">
                  <span className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface">36 files scanned</span>
                  <span className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface">AST &amp; Dependency Graph</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-code-sm text-code-sm text-tertiary font-semibold">{steps[1]?.metric1}</span>
              <span className="font-code-sm text-code-sm text-outline">{steps[1]?.metric2}</span>
            </div>
          </div>
        </div>

        {/* Stage 3 (Active) */}
        <div className="p-space-md rounded-xl bg-surface-container-high shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary-container/20 blur-3xl pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-start gap-space-md">
              <div className="w-7 h-7 rounded-lg bg-primary-container/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[18px] animate-spin">refresh</span>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-md text-headline-md text-on-surface">{steps[2]?.title}</span>
                  <span className="px-space-xs py-0.5 rounded bg-secondary-container/50 text-secondary font-label-uppercase text-label-uppercase animate-pulse">
                    {steps[2]?.badgeText}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{steps[2]?.description}</p>
                
                {/* Dynamic waveform visualizer */}
                <div className="flex flex-col gap-space-xs mt-3 p-space-sm rounded-lg bg-surface-container-lowest">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[15px] text-tertiary">graphic_eq</span>
                      <span className="font-code-sm text-code-sm text-on-surface">{steps[2]?.subNote}</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-primary font-semibold">{steps[2]?.progressPercent}%</span>
                  </div>
                  <div className="flex items-center gap-1 h-5 pt-1">
                    <div className="w-1 bg-primary h-3 rounded-full animate-pulse"></div>
                    <div className="w-1 bg-primary h-5 rounded-full animate-bounce"></div>
                    <div className="w-1 bg-primary h-2 rounded-full"></div>
                    <div className="w-1 bg-primary h-4 rounded-full animate-pulse"></div>
                    <div className="w-1 bg-primary h-1 rounded-full"></div>
                    <div className="w-1 bg-primary h-5 rounded-full animate-bounce"></div>
                    <div className="w-1 bg-primary h-3 rounded-full animate-pulse"></div>
                    <div className="w-1 bg-primary h-2 rounded-full"></div>
                    <div className="w-1 bg-primary h-4 rounded-full animate-bounce"></div>
                    <div className="w-1 bg-primary h-5 rounded-full"></div>
                    <div className="w-1 bg-primary h-3 rounded-full animate-pulse"></div>
                    <div className="w-1 bg-primary h-2 rounded-full"></div>
                    <div className="w-1 bg-primary h-4 rounded-full animate-bounce"></div>
                    <div className="w-1 bg-primary h-1 rounded-full"></div>
                    <div className="w-1 bg-primary h-3 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="font-code-sm text-code-sm text-primary font-semibold">{steps[2]?.metric1}</span>
              <span className="font-code-sm text-code-sm text-outline">{steps[2]?.metric2}</span>
            </div>
          </div>
        </div>

        {/* Stage 4 */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest opacity-75 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-space-md">
              <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-outline text-[18px]">hourglass_empty</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-md text-headline-md text-on-surface">{steps[3]?.title}</span>
                  <span className="px-space-xs py-0.5 rounded bg-surface-variant text-on-surface-variant font-label-uppercase text-label-uppercase">
                    {steps[3]?.badgeText}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{steps[3]?.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-code-sm text-code-sm text-outline">{steps[3]?.metric1}</span>
              <span className="font-code-sm text-code-sm text-outline">{steps[3]?.metric2}</span>
            </div>
          </div>
        </div>

        {/* Stage 5 */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest opacity-60 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-space-md">
              <div className="w-7 h-7 rounded-lg bg-surface-variant flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-outline text-[18px]">movie_edit</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-md text-headline-md text-on-surface">{steps[4]?.title}</span>
                  <span className="px-space-xs py-0.5 rounded bg-surface-variant text-on-surface-variant font-label-uppercase text-label-uppercase">
                    {steps[4]?.badgeText}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{steps[4]?.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-code-sm text-code-sm text-outline">{steps[4]?.metric1}</span>
              <span className="font-code-sm text-code-sm text-outline">{steps[4]?.metric2}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-space-xs">
        <button
          onClick={onCancel}
          disabled={isCancelling}
          className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-error-container/30 text-error hover:bg-error-container/50 transition-colors font-body-base text-body-base disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          <span>{isCancelling ? 'Cancelling...' : 'Cancel Job'}</span>
        </button>
        <button
          onClick={onOpenDiff}
          className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors font-body-base text-body-base"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">visibility</span>
          <span>Diff Preview Canvas</span>
        </button>
      </div>
    </div>
  );
}

