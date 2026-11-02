"use client";

import React, { useState } from 'react';

export function BottomNav() {
  const [activeTab, setActiveTab] = useState<'generator' | 'pipeline' | 'studio' | 'gallery'>('pipeline');

  const navItems = [
    { id: 'generator', label: 'Generator', icon: 'terminal' },
    { id: 'pipeline', label: 'Pipeline', icon: 'account_tree' },
    { id: 'studio', label: 'Studio', icon: 'movie_edit' },
    { id: 'gallery', label: 'Gallery', icon: 'video_library' },
  ] as const;

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around h-16 px-space-xs max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-colors min-h-[44px] min-w-[44px] ${
                isActive
                  ? 'text-primary font-code-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-code-sm text-code-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

