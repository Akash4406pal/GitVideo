"use client";

import React from 'react';

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiffModal({ isOpen, onClose }: DiffModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-space-lg">
      <div className="w-full max-w-4xl rounded-xl bg-surface-container-low shadow-2xl overflow-hidden flex flex-col max-h-[870px]">
        {/* Header */}
        <div className="h-12 px-space-md bg-surface-container flex items-center justify-between shrink-0">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">difference</span>
            <span className="font-headline-md text-headline-md text-on-surface">
              Diff Preview Canvas: backend/src/analyzer/skeletonBuilder.ts
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Code Diff Buffer */}
        <div className="p-space-md overflow-y-auto font-code-sm text-code-sm bg-surface-container-lowest space-y-1">
          <div className="text-outline">@@ -140,8 +140,11 @@ export async function buildSkeleton(ingest: IngestResult): Promise&lt;Skeleton&gt; &#123;</div>
          <div className="text-on-surface-variant">     totalLinesOfCode: totalLoc,</div>
          <div className="text-on-surface-variant">   &#125;;</div>
          <div className="bg-error-container/20 text-error px-2 py-0.5 rounded">-  const skeleton = &#123; repo: repoMeta, files: fileNodes &#125;;</div>
          <div className="bg-tertiary-container/20 text-tertiary px-2 py-0.5 rounded">+  const skeleton = &#123; repo: repoMeta, files: fileNodes, snippets, dependencyEdges &#125;;</div>
          <div className="bg-tertiary-container/20 text-tertiary px-2 py-0.5 rounded">+  // Validate runtime contract using Zod schema</div>
          <div className="bg-tertiary-container/20 text-tertiary px-2 py-0.5 rounded">+  const validation = SkeletonSchema.safeParse(skeleton);</div>
          <div className="text-on-surface-variant">   return skeleton;</div>
          <div className="text-on-surface-variant"> &#125;</div>
        </div>

        {/* Footer */}
        <div className="h-12 px-space-md bg-surface-container-low flex items-center justify-between shrink-0">
          <span className="font-code-sm text-code-sm text-on-surface-variant">+4 additions, -1 deletion</span>
          <button
            onClick={onClose}
            className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-body-base text-body-base font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
