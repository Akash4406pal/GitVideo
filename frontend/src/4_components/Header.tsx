"use client";

import React from 'react';
import { UserNav } from './UserNav';

interface HeaderProps {
  onOpenAuth?: () => void;
}

export function Header({ onOpenAuth = () => {} }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
      <div className="h-16 w-full px-margin-desktop flex items-center justify-between gap-space-lg">
        {/* Brand & Stars */}
        <div className="flex items-center gap-space-md shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center shadow-[0_0_24px_-4px_rgba(99,102,241,0.25)]">
              <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
            </div>
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface">GitVideo</span>
          </div>
          <span className="px-space-xs py-0.5 rounded bg-secondary-container/40 text-secondary font-label-uppercase text-label-uppercase">BETA</span>
          <a className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" href="https://github.com/Akash4406pal/GitVideo" target="_blank" rel="noopener noreferrer">
            <span className="material-symbols-outlined text-[14px] text-tertiary">star</span>
            <span className="font-code-sm text-code-sm">GitHub</span>
          </a>
        </div>

        {/* Desktop Nav Pills */}
        <nav className="hidden lg:flex items-center gap-space-xs p-1 rounded-lg bg-surface-container-low/60">
          <a className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-body-base text-body-base" href="#ingest">
            Ingestion Engine
          </a>
          <a aria-current="page" className="px-space-md py-1.5 rounded transition-colors bg-surface-container-high text-on-surface font-headline-md" href="#">
            Pipeline Telemetry
          </a>
          <a className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-body-base text-body-base" href="#studio">
            Video Studio
          </a>
          <a className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-body-base text-body-base" href="#gallery">
            Showcase Gallery
          </a>
        </nav>

        {/* Status Indicator & User Profile */}
        <div className="flex items-center gap-space-md shrink-0">
          <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-lowest">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">v1.0 BharatCode Online</span>
          </div>
          <div className="h-4 w-px bg-surface-variant hidden sm:block"></div>
          <UserNav onOpenAuth={onOpenAuth} />
        </div>
      </div>
    </header>
  );
}
