"use client";

import React from 'react';
import { ActiveJob } from '../1_domain/pipeline';

interface JobStatusBarProps {
  job: ActiveJob;
  formattedTimer: string;
}

export function JobStatusBar({ job, formattedTimer }: JobStatusBarProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-xl">
      <div className="flex flex-wrap items-center gap-space-md">
        <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-highest">
          <span className="material-symbols-outlined text-[15px] text-primary">terminal</span>
          <span className="font-code-sm text-code-sm text-on-surface font-semibold tracking-wide">
            JOB {job.jobId}
          </span>
        </div>
        <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
          <span className="font-code-sm text-code-sm text-tertiary">SSE STREAM LIVE</span>
        </div>
        <div className="flex items-center gap-space-xs px-space-md py-1 rounded bg-surface-container">
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">alt_route</span>
          <span className="font-code-sm text-code-sm text-on-surface">{job.repoName}</span>
          <span className="font-code-sm text-code-sm text-outline">@</span>
          <span className="font-code-sm text-code-sm text-secondary">{job.branch}</span>
          <span className="font-code-sm text-code-sm px-1 rounded bg-surface-container-highest text-on-surface-variant">
            {job.commitSha}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-space-lg w-full lg:w-auto justify-between lg:justify-end">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[16px] text-outline">timer</span>
          <span className="font-code-md text-code-md text-on-surface tracking-wider font-semibold">
            {formattedTimer}
          </span>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="flex flex-col items-end">
            <span className="font-label-uppercase text-label-uppercase text-on-surface-variant">
              Progress ({job.currentStageIndex}/{job.totalStages} Stages)
            </span>
            <span className="font-code-sm text-code-sm text-primary font-semibold">
              {job.progressPercent}%
            </span>
          </div>
          <div className="w-28 h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-container transition-all duration-500"
              style={{ width: `${job.progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

