"use client";

import React from 'react';

interface PipelineControlsProps {
  onCancel: () => void;
  isCancelled: boolean;
}

export function PipelineControls({ onCancel, isCancelled }: PipelineControlsProps) {
  return (
    <div className="flex items-center gap-space-sm pt-space-xs pb-space-sm">
      <button
        onClick={onCancel}
        disabled={isCancelled}
        className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl transition-all font-code-md text-code-md font-semibold min-h-[44px] ${
          isCancelled
            ? 'opacity-50 bg-error-container/10 text-error cursor-not-allowed'
            : 'bg-error-container/20 text-error hover:bg-error-container/30'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isCancelled ? 'check' : 'cancel'}
        </span>
        <span>{isCancelled ? 'Canceled' : 'Cancel Job'}</span>
      </button>

      <button
        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-surface-container-high text-primary hover:bg-surface-bright transition-all font-code-md text-code-md font-semibold shadow-md min-h-[44px]"
      >
        <span className="material-symbols-outlined text-[18px]">difference</span>
        <span>Diff Preview</span>
      </button>
    </div>
  );
}

