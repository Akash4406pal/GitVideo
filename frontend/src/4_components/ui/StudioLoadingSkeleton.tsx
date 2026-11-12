"use client";

import React from "react";

export function StudioLoadingSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#0b0e14] text-on-surface flex flex-col">
      {/* Top Header Placeholder */}
      <header className="h-16 w-full border-b border-white/5 bg-[#0b0e14]/85 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600/40 to-indigo-500/40 animate-pulse" />
          <div className="w-24 h-5 rounded-md bg-white/10 animate-pulse" />
          <div className="w-12 h-4 rounded-full bg-purple-500/10 border border-purple-500/20" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-8 rounded-full bg-white/5 border border-white/5 animate-pulse hidden sm:block" />
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse border border-white/10" />
        </div>
      </header>

      {/* Main Studio Body Skeleton */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1">
        {/* Welcome Banner Shimmer */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/20 via-indigo-950/10 to-transparent border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="w-48 sm:w-64 h-6 rounded-md bg-white/15 animate-pulse" />
              <div className="w-72 sm:w-96 h-4 rounded-md bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Action Panel Shimmer */}
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-surface-container-low/40 border border-white/5 flex flex-col gap-4">
          <div className="w-32 h-5 rounded-md bg-purple-500/20 animate-pulse" />
          <div className="w-3/4 h-7 rounded-md bg-white/10 animate-pulse" />
          <div className="w-full h-12 rounded-xl bg-white/5 border border-white/5 animate-pulse mt-2" />
        </div>
      </main>
    </div>
  );
}

