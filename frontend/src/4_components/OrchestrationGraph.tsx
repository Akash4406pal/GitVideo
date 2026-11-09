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
        {steps.map((step, index) => {
          const isProcessing = step.badgeStyle === 'processing';
          const isCompleted = step.badgeStyle === 'completed' || step.badgeStyle === 'resolved';
          const isQueued = step.badgeStyle === 'queued' || (!isProcessing && !isCompleted);

          return (
            <div
              key={step.id || index}
              className={`p-space-md rounded-xl transition-all duration-300 shadow-md ${
                isProcessing
                  ? 'bg-surface-container-high shadow-2xl border border-primary/30 relative overflow-hidden'
                  : isCompleted
                  ? 'bg-surface-container-low hover:bg-surface-container'
                  : 'bg-surface-container-lowest opacity-75 shadow-sm'
              }`}
            >
              {isProcessing && (
                <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />
              )}

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start gap-space-md">
                  {/* Dynamic Status Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isProcessing
                        ? 'bg-primary-container/30 text-primary'
                        : isCompleted
                        ? 'bg-tertiary-container/30 text-tertiary'
                        : 'bg-surface-variant text-outline'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isProcessing ? 'animate-spin' : ''
                      }`}
                    >
                      {isProcessing
                        ? 'refresh'
                        : isCompleted
                        ? 'check_circle'
                        : 'hourglass_empty'}
                    </span>
                  </div>

                  <div className="flex flex-col w-full">
                    {/* Title & Badge */}
                    <div className="flex items-center gap-space-sm">
                      <span className="font-headline-md text-headline-md text-on-surface">
                        {step.title}
                      </span>
                      <span
                        className={`px-space-xs py-0.5 rounded font-label-uppercase text-label-uppercase ${
                          isProcessing
                            ? 'bg-secondary-container/50 text-secondary animate-pulse'
                            : isCompleted
                            ? 'bg-tertiary-container/40 text-tertiary'
                            : 'bg-surface-variant text-on-surface-variant'
                        }`}
                      >
                        {step.badgeText || (isProcessing ? 'PROCESSING' : isCompleted ? 'COMPLETED' : 'QUEUED')}
                      </span>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {step.description}
                    </p>

                    {/* Waveform Visualizer ONLY when currently processing or step has waveform */}
                    {(isProcessing || step.hasWaveform) && (
                      <div className="flex flex-col gap-space-xs mt-3 p-space-sm rounded-lg bg-surface-container-lowest border border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-space-xs">
                            <span className="material-symbols-outlined text-[15px] text-tertiary">graphic_eq</span>
                            <span className="font-code-sm text-code-sm text-on-surface">
                              {step.subNote || 'Real-time multi-core streaming worker'}
                            </span>
                          </div>
                          {step.progressPercent !== undefined && (
                            <span className="font-code-sm text-code-sm text-primary font-semibold">
                              {step.progressPercent}%
                            </span>
                          )}
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
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-col items-end shrink-0 pl-3">
                  <span
                    className={`font-code-sm text-code-sm font-semibold ${
                      isProcessing ? 'text-primary' : isCompleted ? 'text-tertiary' : 'text-outline'
                    }`}
                  >
                    {step.metric1}
                  </span>
                  <span className="font-code-sm text-code-sm text-outline">{step.metric2}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-space-xs">
        <button
          onClick={onCancel}
          disabled={isCancelling}
          className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-error-container/30 text-error hover:bg-error-container/50 transition-colors font-body-base text-body-base disabled:opacity-50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          <span>{isCancelling ? 'Cancelling...' : 'Cancel Job'}</span>
        </button>
        <button
          onClick={onOpenDiff}
          className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors font-body-base text-body-base cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">visibility</span>
          <span>Diff Preview Canvas</span>
        </button>
      </div>
    </div>
  );
}
