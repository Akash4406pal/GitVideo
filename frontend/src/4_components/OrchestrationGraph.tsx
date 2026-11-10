"use client";

import React from "react";
import { PipelineStep } from "../1_domain/pipeline";

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
          <h3 className="font-headline-md text-headline-md text-on-surface">Orchestration Graph</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span className="font-code-sm text-code-sm text-on-surface-variant font-mono">Remotion v4.0 SSR</span>
        </div>
      </div>

      <div className="relative flex flex-col gap-space-sm">
        {steps.map((step, index) => {
          const isProcessing = step.badgeStyle === "processing";
          const isCompleted = step.badgeStyle === "completed" || step.badgeStyle === "resolved";
          const isFailed = step.badgeStyle === "queued" && step.badgeText?.toLowerCase().includes("fail");
          const isQueued = !isProcessing && !isCompleted && !isFailed;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id || index} className="relative group">
              {/* Vertical connecting line to next step */}
              {!isLast && (
                <div
                  className={`absolute left-[22px] top-[44px] w-0.5 h-[calc(100%-20px)] z-0 transition-colors ${
                    isCompleted ? "bg-tertiary/40" : isProcessing ? "bg-primary/40 animate-pulse" : "bg-white/5"
                  }`}
                  aria-hidden="true"
                />
              )}

              <div
                className={`p-space-md rounded-xl transition-all duration-300 shadow-md relative z-10 ${
                  isProcessing
                    ? "bg-surface-container-high shadow-2xl border border-primary/40 ring-1 ring-primary/20"
                    : isCompleted
                    ? "bg-surface-container-low hover:bg-surface-container border border-white/5"
                    : isFailed
                    ? "bg-error-container/20 border border-error/30"
                    : "bg-surface-container-lowest/80 opacity-75 border border-white/5"
                }`}
              >
                {isProcessing && (
                  <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />
                )}

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-start gap-space-md">
                    {/* Status Circle / Node Icon */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${
                        isProcessing
                          ? "bg-primary-container/30 text-primary border border-primary/40"
                          : isCompleted
                          ? "bg-tertiary-container/30 text-tertiary border border-tertiary/30"
                          : isFailed
                          ? "bg-error-container/40 text-error border border-error/40"
                          : "bg-surface-variant text-outline border border-white/5"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isProcessing ? "animate-spin" : ""
                        }`}
                      >
                        {isProcessing
                          ? "refresh"
                          : isCompleted
                          ? "check_circle"
                          : isFailed
                          ? "error"
                          : "hourglass_empty"}
                      </span>
                    </div>

                    <div className="flex flex-col w-full">
                      {/* Step Header */}
                      <div className="flex items-center gap-space-sm flex-wrap">
                        <span className="font-headline-md text-headline-md text-on-surface font-semibold">
                          {step.title}
                        </span>
                        <span
                          className={`px-space-xs py-0.5 rounded font-label-uppercase text-label-uppercase text-[10px] tracking-wider uppercase font-mono ${
                            isProcessing
                              ? "bg-secondary-container/50 text-secondary border border-secondary/30 animate-pulse"
                              : isCompleted
                              ? "bg-tertiary-container/40 text-tertiary border border-tertiary/30"
                              : isFailed
                              ? "bg-error-container/40 text-error border border-error/30"
                              : "bg-surface-variant text-on-surface-variant"
                          }`}
                        >
                          {step.badgeText || (isProcessing ? "PROCESSING" : isCompleted ? "COMPLETED" : "QUEUED")}
                        </span>
                      </div>

                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Real-time Streaming Pulse / Waveform when Active */}
                      {(isProcessing || step.hasWaveform) && (
                        <div className="flex flex-col gap-space-xs mt-3 p-space-sm rounded-lg bg-surface-container-lowest border border-white/5 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-space-xs">
                              <span className="material-symbols-outlined text-[15px] text-tertiary">graphic_eq</span>
                              <span className="font-code-sm text-code-sm text-on-surface font-mono">
                                {step.subNote || "Multi-core streaming renderer active"}
                              </span>
                            </div>
                            {step.progressPercent !== undefined && (
                              <span className="font-code-sm text-code-sm text-primary font-semibold font-mono">
                                {step.progressPercent}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 h-5 pt-1" aria-hidden="true">
                            {[12, 20, 8, 16, 6, 20, 14, 10, 18, 20, 12, 8, 16, 6, 14].map((h, i) => (
                              <div
                                key={i}
                                className="w-1 bg-primary rounded-full transition-all duration-300"
                                style={{
                                  height: `${isProcessing ? h : 4}px`,
                                  opacity: isProcessing ? 0.9 : 0.3,
                                  animation: isProcessing ? `pulse 1.2s ease-in-out ${i * 0.08}s infinite` : "none",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step Execution Metrics */}
                  <div className="flex flex-col items-end shrink-0 pl-3 font-mono">
                    <span
                      className={`font-code-sm text-code-sm font-semibold ${
                        isProcessing ? "text-primary" : isCompleted ? "text-tertiary" : "text-outline"
                      }`}
                    >
                      {step.metric1}
                    </span>
                    <span className="font-code-sm text-code-sm text-outline text-[11px]">{step.metric2}</span>
                  </div>
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
          className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-error-container/20 text-error hover:bg-error-container/40 active:scale-[0.98] transition-all font-body-base text-body-base disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-error/20 focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          <span>{isCancelling ? "Cancelling Job..." : "Cancel Job"}</span>
        </button>

        <button
          onClick={onOpenDiff}
          className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright active:scale-[0.98] text-on-surface hover:text-white transition-all font-body-base text-body-base cursor-pointer border border-white/10 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">visibility</span>
          <span>Inspect AST Diff</span>
        </button>
      </div>
    </div>
  );
}
