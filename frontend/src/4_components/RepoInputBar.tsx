"use client";

import React, { useState, useEffect } from 'react';

interface RepoInputBarProps {
  onAnalyzeRepo: (url: string, skipRender?: boolean) => void;
  currentRepo: string;
  isRunning?: boolean;
}

const PRESET_REPOS = [
  { name: 'Akash4406pal/GitVideo', url: 'https://github.com/Akash4406pal/GitVideo', tag: 'This Repo' },
  { name: 'expressjs/express', url: 'https://github.com/expressjs/express', tag: 'Fast Node API' },
  { name: 'pallets/flask', url: 'https://github.com/pallets/flask', tag: 'Python Core' },
  { name: 'customer-trends', url: 'https://github.com/amlanmohanty1/customer-trends-data-analysis-SQL-Python-PowerBI', tag: 'Data Pipeline' },
];

export function RepoInputBar({
  onAnalyzeRepo,
  currentRepo,
  isRunning = false,
}: RepoInputBarProps) {
  const [inputUrl, setInputUrl] = useState(
    currentRepo.startsWith('http') ? currentRepo : `https://github.com/${currentRepo}`
  );
  const [skipRender, setSkipRender] = useState(false);

  // Keep input updated if currentRepo changes from outside (e.g., gallery click)
  useEffect(() => {
    if (currentRepo) {
      setInputUrl(currentRepo.startsWith('http') ? currentRepo : `https://github.com/${currentRepo}`);
    }
  }, [currentRepo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim() && !isRunning) {
      onAnalyzeRepo(inputUrl.trim(), skipRender);
    }
  };

  return (
    <div className="w-full p-space-md rounded-xl bg-surface-container-low shadow-xl border border-outline-variant/20 flex flex-col gap-space-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
          <span className="font-headline-md text-headline-md text-on-surface">Target Codebase Analyzer</span>
          <span className="px-space-xs py-0.5 rounded bg-tertiary-container/40 text-tertiary font-label-uppercase text-label-uppercase text-[11px]">
            {isRunning ? 'Processing Stream' : 'Ready'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-on-surface-variant hover:text-on-surface text-xs font-code-sm">
            <input
              type="checkbox"
              checked={skipRender}
              onChange={(e) => setSkipRender(e.target.checked)}
              disabled={isRunning}
              className="rounded bg-surface-container-high border-outline-variant text-primary focus:ring-0 disabled:opacity-50"
            />
            <span>⚡ Fast Mode (Skip Video Render)</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-space-sm w-full">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            link
          </span>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={isRunning}
            placeholder="Paste public GitHub repository URL (e.g. https://github.com/expressjs/express)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-outline font-code-sm text-code-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isRunning}
          className={`inline-flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-lg font-body-base text-body-base font-semibold shadow-md shrink-0 transition-all ${
            isRunning
              ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30 cursor-not-allowed opacity-80'
              : 'bg-primary text-on-primary hover:bg-primary-container cursor-pointer'
          }`}
        >
          {isRunning ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              <span>Compiling Video...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Generate Video</span>
            </>
          )}
        </button>
      </form>

      {/* Preset shortcuts */}
      <div className="flex flex-wrap items-center gap-space-xs pt-1">
        <span className="font-code-sm text-code-sm text-on-surface-variant">Presets:</span>
        {PRESET_REPOS.map((preset) => (
          <button
            key={preset.url}
            type="button"
            disabled={isRunning}
            onClick={() => {
              setInputUrl(preset.url);
              onAnalyzeRepo(preset.url, skipRender);
            }}
            className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface font-code-sm text-code-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{preset.name}</span>
            <span className="px-1 rounded bg-surface-container-highest text-[10px] text-tertiary">
              {preset.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
