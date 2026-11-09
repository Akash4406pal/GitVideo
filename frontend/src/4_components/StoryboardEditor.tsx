"use client";

import React, { useState } from "react";
import { GlassPanel, PrimaryButton, SecondaryButton } from "./ui/DesignSystem";

export interface StoryboardSegment {
  id: string;
  text: string;
  durationSec?: number;
  focus?: {
    fileId?: string;
    snippetId?: string;
    startLine?: number;
    endLine?: number;
    highlightLines?: number[];
  };
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  type: "title" | "file_tree" | "code_focus" | "graph" | "outro";
  title: string;
  durationEstimateSec: number;
  segments: StoryboardSegment[];
}

export interface EditableStoryboard {
  repoName: string;
  targetDurationSec: number;
  estimatedDurationSec: number;
  totalWordCount: number;
  tone: "technical" | "engaging" | "concise";
  scenes: StoryboardScene[];
}

interface StoryboardEditorProps {
  initialStoryboard: EditableStoryboard;
  onApproveAndRender: (storyboard: EditableStoryboard, isShorts: boolean) => void;
  isRendering?: boolean;
}

export function StoryboardEditor({
  initialStoryboard,
  onApproveAndRender,
  isRendering = false,
}: StoryboardEditorProps) {
  const [storyboard, setStoryboard] = useState<EditableStoryboard>(initialStoryboard);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");

  // Handle narration text edit for a specific scene & segment
  const handleTextChange = (sceneIdx: number, segIdx: number, newText: string) => {
    setStoryboard((prev) => {
      const updatedScenes = [...prev.scenes];
      const updatedSegments = [...updatedScenes[sceneIdx].segments];
      updatedSegments[segIdx] = {
        ...updatedSegments[segIdx],
        text: newText,
      };
      updatedScenes[sceneIdx] = {
        ...updatedScenes[sceneIdx],
        segments: updatedSegments,
      };

      // Recalculate word count and estimated duration
      let words = 0;
      for (const sc of updatedScenes) {
        for (const seg of sc.segments) {
          words += seg.text.trim().split(/\s+/).filter(Boolean).length;
        }
      }

      const estimatedSec = Math.max(30, Math.round(words / 2.3));

      return {
        ...prev,
        scenes: updatedScenes,
        totalWordCount: words,
        estimatedDurationSec: estimatedSec,
      };
    });
  };

  const currentScene = storyboard.scenes[activeSceneIdx] || storyboard.scenes[0];

  return (
    <GlassPanel className="p-6 sm:p-8">
      {/* Top Header Bar with Metrics & Aspect Ratio Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-purple-400 text-xl">edit_note</span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Interactive Storyboard Studio
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Review Before Render
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Fine-tune narration scripts, review AST code snippet focus, and choose video aspect ratio before rendering.
          </p>
        </div>

        {/* Aspect Ratio & Metric Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 16:9 vs 9:16 Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setAspectRatio("16:9")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                aspectRatio === "16:9"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              16:9 Landscape
            </button>
            <button
              onClick={() => setAspectRatio("9:16")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                aspectRatio === "9:16"
                  ? "bg-purple-600 text-white font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              9:16 Shorts
            </button>
          </div>

          {/* Duration Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-gray-300">
            <span className="material-symbols-outlined text-sm text-purple-400">schedule</span>
            <span>~{storyboard.estimatedDurationSec}s</span>
          </div>

          {/* Word Count Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-gray-300">
            <span className="material-symbols-outlined text-sm text-emerald-400">format_quote</span>
            <span>{storyboard.totalWordCount} words</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column: Scene Selector Tabs (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            Storyboard Scenes ({storyboard.scenes.length})
          </span>
          {storyboard.scenes.map((scene, idx) => {
            const isActive = idx === activeSceneIdx;
            return (
              <button
                key={scene.id}
                onClick={() => setActiveSceneIdx(idx)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? "bg-purple-600/15 border-purple-500/40 text-white shadow-lg shadow-purple-950/20"
                    : "bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                      isActive
                        ? "bg-purple-500 text-white"
                        : "bg-surface-container-high text-gray-400"
                    }`}
                  >
                    {scene.sceneNumber}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-bold truncate text-white">{scene.title}</p>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {scene.type}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-gray-400 shrink-0">
                  ~{scene.durationEstimateSec || 10}s
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Scene Narration Editor (8 cols) */}
        {currentScene && (
          <div className="lg:col-span-8 flex flex-col gap-4 p-5 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase">
                  Active Scene {currentScene.sceneNumber} of {storyboard.scenes.length}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{currentScene.title}</h4>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                Type: {currentScene.type}
              </span>
            </div>

            {/* Editable Segments */}
            <div className="space-y-4">
              {currentScene.segments.map((segment, segIdx) => (
                <div key={segment.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span>Voiceover Narration (Segment {segIdx + 1})</span>
                    <span>{segment.text.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea
                    rows={3}
                    value={segment.text}
                    onChange={(e) => handleTextChange(activeSceneIdx, segIdx, e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 leading-relaxed font-sans"
                    placeholder="Enter narration for this scene beat..."
                  />

                  {/* Code Focus metadata if scene 3 */}
                  {segment.focus?.snippetId && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono text-purple-300">
                      <span className="material-symbols-outlined text-sm">code</span>
                      <span>Focused on AST Snippet: <strong>{segment.focus.snippetId}</strong></span>
                      {segment.focus.highlightLines && (
                        <span>(Lines: {segment.focus.highlightLines.join(", ")})</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
        <SecondaryButton
          onClick={() => setStoryboard(initialStoryboard)}
          icon="restart_alt"
          size="sm"
        >
          Reset to AI Defaults
        </SecondaryButton>

        <PrimaryButton
          onClick={() => onApproveAndRender(storyboard, aspectRatio === "9:16")}
          icon={isRendering ? "hourglass_empty" : "movie"}
          size="md"
        >
          {isRendering ? "Rendering Remotion Video..." : `Approve & Render ${aspectRatio} Video`}
        </PrimaryButton>
      </div>
    </GlassPanel>
  );
}

