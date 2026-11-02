"use client";

import React from 'react';

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_-8px_32px_0_rgba(0,0,0,0.4)]">
      <div className="w-full px-margin-desktop py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <span className="font-headline-md text-headline-md text-on-surface">GitVideo</span>
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            Synthesizing codebase telemetry to real-time generative video.
          </span>
        </div>
        <div className="flex items-center gap-space-lg">
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
            Architecture
          </a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
            Telemetry Nodes
          </a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
            Security Spec
          </a>
          <span className="font-code-sm text-code-sm text-on-surface-variant">© 2025 GitVideo Engine.</span>
        </div>
      </div>
    </footer>
  );
}

