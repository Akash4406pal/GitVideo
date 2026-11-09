"use client";

import React, { useState } from 'react';
import { UserNav } from './UserNav';

export type StudioSection = 'ingest' | 'telemetry' | 'studio' | 'gallery';

interface HeaderProps {
  onOpenAuth?: () => void;
  activeSection?: StudioSection;
  onNavigate?: (section: StudioSection) => void;
}

const NAV_ITEMS: { id: StudioSection; label: string; icon: string }[] = [
  { id: 'ingest', label: 'Ingestion Engine', icon: 'terminal' },
  { id: 'telemetry', label: 'Pipeline Telemetry', icon: 'schema' },
  { id: 'studio', label: 'Video Studio', icon: 'movie_filter' },
  { id: 'gallery', label: 'Showcase Gallery', icon: 'auto_awesome_motion' },
];

export function Header({
  onOpenAuth = () => {},
  activeSection = 'ingest',
  onNavigate,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: StudioSection) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    }
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0b0e14]/85 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand & Stars */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-[0_0_24px_-4px_rgba(99,102,241,0.4)]">
              <span className="material-symbols-outlined text-white text-[19px]">terminal</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">GitVideo</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] uppercase border border-purple-500/30">
            BETA
          </span>
          <a
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors text-xs font-mono"
            href="https://github.com/Akash4406pal/GitVideo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined text-[14px] text-amber-400">star</span>
            <span>GitHub</span>
          </a>
        </div>

        {/* 4 Interactive Studio Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-surface-container-low/70 border border-white/5 shadow-inner">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-sm font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-purple-400' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicator, Mobile Hamburger, & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] text-gray-400">BharatCode v1.0 Live</span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block"></div>

          <UserNav onOpenAuth={onOpenAuth} />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-surface-container text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 bg-[#0d1117] border-b border-white/10 space-y-1 animate-fade-in shadow-2xl">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-purple-400">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
