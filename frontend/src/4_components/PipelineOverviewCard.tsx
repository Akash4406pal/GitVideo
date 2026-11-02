"use client";

import React from 'react';
import { ActiveJob } from '../1_domain/pipeline';

interface PipelineOverviewCardProps {
  job: ActiveJob;
  formattedTimer: string;
}

export function PipelineOverviewCard({ job, formattedTimer }: PipelineOverviewCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-xl">
      {/* Ambient Radial Glow */}
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="flex h-2 w-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.8)] animate-pulse"></span>
          <span className="font-code-md text-code-md font-semibold text-primary tracking-tight truncate">
            Job {job.jobId}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-uppercase text-label-uppercase">
            {job.streamType}
          </span>
        </div>

        {/* Live Elapsed Timer Counter with Radar Ring */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container text-secondary font-code-sm text-code-sm">
          <svg className="h-3.5 w-3.5 animate-spin text-secondary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
            <path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor"></path>
          </svg>
          <span className="tracking-wider">{formattedTimer}</span>
        </div>
      </div>

      {/* Repository Branch Context */}
      <div className="mt-space-sm flex items-center justify-between gap-space-xs text-on-surface-variant">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="material-symbols-outlined text-[16px] text-outline">fork_right</span>
          <span className="font-code-md text-code-md text-on-surface font-medium truncate">
            {job.repoName}
          </span>
          <span className="font-code-sm text-code-sm text-outline">@</span>
          <span className="px-1 rounded bg-surface-container-high text-primary font-code-sm text-code-sm">
            {job.branch}
          </span>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant font-code-sm text-code-sm flex-shrink-0">
          <span className="text-tertiary">{job.currentStageIndex}/{job.totalStages}</span>
          <span className="text-outline">stages</span>
        </div>
      </div>

      {/* Micro Linear Pipeline Bar */}
      <div className="mt-space-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden flex">
        <div className="h-full bg-tertiary w-[40%] transition-all duration-500"></div>
        <div className="h-full bg-primary-container w-[18%] transition-all duration-300 animate-pulse"></div>
        <div className="h-full bg-surface-container-highest flex-1"></div>
      </div>
    </div>
  );
}

