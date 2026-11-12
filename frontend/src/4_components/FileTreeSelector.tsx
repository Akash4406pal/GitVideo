"use client";

import React, { useState, useMemo } from "react";
import { FileNodeItem } from "../1_domain/pipeline";

interface FileTreeSelectorProps {
  files?: FileNodeItem[];
  repoName?: string;
  onApplySelection: (selectedPaths: string[], directive?: string) => void;
  isRunning?: boolean;
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  fileData?: FileNodeItem;
  children: { [key: string]: TreeNode };
}

const DEFAULT_CURATED_FILES: FileNodeItem[] = [
  { id: "f_1", path: "extract.py", extension: ".py", loc: 80, sizeBytes: 2331, isEntryPoint: true, role: "entry" },
  { id: "f_2", path: "modules/router.py", extension: ".py", loc: 72, sizeBytes: 2190, isEntryPoint: false, role: "core" },
  { id: "f_3", path: "modules/ocr_parser.py", extension: ".py", loc: 145, sizeBytes: 4820, isEntryPoint: false, role: "core" },
  { id: "f_4", path: "modules/layout_a_parser.py", extension: ".py", loc: 384, sizeBytes: 15977, isEntryPoint: false, role: "core" },
  { id: "f_5", path: "modules/layout_b_parser.py", extension: ".py", loc: 310, sizeBytes: 12104, isEntryPoint: false, role: "core" },
  { id: "f_6", path: "modules/helpers.py", extension: ".py", loc: 119, sizeBytes: 3512, isEntryPoint: false, role: "utility" },
  { id: "f_7", path: "requirements.txt", extension: ".txt", loc: 12, sizeBytes: 240, isEntryPoint: false, role: "config" },
  { id: "f_8", path: "output_schema.json", extension: ".json", loc: 95, sizeBytes: 3100, isEntryPoint: false, role: "config" },
];

const DIRECTIVE_PRESETS = [
  { label: "Core Architecture & Dispatch", text: "Focus on the main entrypoint and how requests are dispatched between layout parsers." },
  { label: "OCR & Fallback Logic", text: "Highlight OCR text extraction fallback when pure-text PDF streams are empty." },
  { label: "Validation & Error Handling", text: "Explain schema validation rules, failure logging, and edge case guards." },
  { label: "Data Pipeline & Transforms", text: "Detail how extracted invoice data is normalized into the final JSON output." },
];

export function FileTreeSelector({
  files = DEFAULT_CURATED_FILES,
  repoName = "Target Codebase",
  onApplySelection,
  isRunning = false,
}: FileTreeSelectorProps) {
  const effectiveFiles = files && files.length > 0 ? files : DEFAULT_CURATED_FILES;

  // Initialize selection with entrypoints or first 3 files
  const initialSelected = useMemo(() => {
    const recommended = effectiveFiles.filter((f) => f.isEntryPoint || f.role === "entry" || f.role === "core").slice(0, 3);
    return new Set(recommended.length > 0 ? recommended.map((f) => f.path) : effectiveFiles.slice(0, 3).map((f) => f.path));
  }, [effectiveFiles]);

  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(initialSelected);
  const [userDirective, setUserDirective] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  // Build hierarchical folder tree
  const treeRoot = useMemo(() => {
    const root: TreeNode = { name: "root", path: "", type: "directory", children: {} };

    for (const file of effectiveFiles) {
      if (searchQuery.trim() && !file.path.toLowerCase().includes(searchQuery.toLowerCase())) {
        continue;
      }

      const parts = file.path.split("/");
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const currentPath = parts.slice(0, i + 1).join("/");

        if (isLast) {
          current.children[part] = {
            name: part,
            path: currentPath,
            type: "file",
            fileData: file,
            children: {},
          };
        } else {
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              path: currentPath,
              type: "directory",
              children: {},
            };
          }
          current = current.children[part];
        }
      }
    }

    return root;
  }, [effectiveFiles, searchQuery]);

  const toggleFile = (path: string) => {
    const next = new Set(selectedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      if (next.size >= 6) {
        alert("For the best 60-second video walkthrough pacing, we recommend selecting between 2 and 5 key files.");
        return;
      }
      next.add(path);
    }
    setSelectedPaths(next);
  };

  const toggleFolder = (folderPath: string) => {
    const next = new Set(collapsedFolders);
    if (next.has(folderPath)) {
      next.delete(folderPath);
    } else {
      next.add(folderPath);
    }
    setCollapsedFolders(next);
  };

  const handleSelectRecommended = () => {
    const recommended = effectiveFiles.filter((f) => f.isEntryPoint || f.role === "entry" || f.role === "core").slice(0, 4);
    setSelectedPaths(new Set(recommended.map((f) => f.path)));
  };

  const handleClearAll = () => {
    setSelectedPaths(new Set());
  };

  const handleConfirm = () => {
    if (selectedPaths.size === 0) {
      alert("Please select at least 1 file to focus on for the storyboard narrative.");
      return;
    }
    onApplySelection(Array.from(selectedPaths), userDirective);
  };

  // Recursive Tree Node Renderer
  const renderTree = (node: TreeNode, depth = 0) => {
    const entries = Object.values(node.children);

    return (
      <div className="flex flex-col space-y-1">
        {entries.map((item) => {
          if (item.type === "directory") {
            const isCollapsed = collapsedFolders.has(item.path);
            return (
              <div key={item.path} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleFolder(item.path)}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.04] text-xs font-mono text-gray-300 transition-colors w-full text-left cursor-pointer"
                  style={{ paddingLeft: `${depth * 16 + 8}px` }}
                >
                  <span className="material-symbols-outlined text-[16px] text-gray-500 transition-transform duration-150">
                    {isCollapsed ? "chevron_right" : "expand_more"}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-purple-400">
                    {isCollapsed ? "folder" : "folder_open"}
                  </span>
                  <span className="font-semibold text-gray-200">{item.name}</span>
                </button>

                {!isCollapsed && (
                  <div className="flex flex-col">{renderTree(item, depth + 1)}</div>
                )}
              </div>
            );
          }

          // File Item
          const isSelected = selectedPaths.has(item.path);
          const isRecommended = item.fileData?.isEntryPoint || item.fileData?.role === "entry" || item.fileData?.role === "core";

          return (
            <div
              key={item.path}
              onClick={() => toggleFile(item.path)}
              className={`flex items-center justify-between py-1.5 px-3 rounded-xl text-xs font-mono transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-purple-600/20 border border-purple-500/40 text-white shadow-sm"
                  : "hover:bg-white/[0.03] text-gray-400 border border-transparent"
              }`}
              style={{ marginLeft: `${depth * 16 + 8}px` }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // handled by parent div
                  className="rounded bg-surface-container-high border-outline-variant text-purple-600 focus:ring-0 cursor-pointer pointer-events-none"
                />
                <span className="material-symbols-outlined text-[16px] text-gray-400 shrink-0">
                  {item.name.endsWith(".ts") || item.name.endsWith(".tsx") || item.name.endsWith(".js")
                    ? "javascript"
                    : item.name.endsWith(".py")
                    ? "code"
                    : item.name.endsWith(".json")
                    ? "data_object"
                    : item.name.endsWith(".md")
                    ? "description"
                    : "draft"}
                </span>
                <span className={`truncate ${isSelected ? "text-white font-medium" : "text-gray-300"}`}>
                  {item.name}
                </span>

                {isRecommended && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shrink-0">
                    ★ Key Logic
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-2">
                {item.fileData?.loc && (
                  <span className="text-[11px] text-gray-500 font-mono">
                    {item.fileData.loc} LOC
                  </span>
                )}
                {item.fileData?.role && item.fileData.role !== "other" && (
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-surface-container-highest text-gray-400 hidden sm:inline">
                    {item.fileData.role}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-xl flex flex-col gap-5">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-xl">account_tree</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Interactive Codebase Focus Selector</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Human-in-the-Loop
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Select 2 to 5 specific files from <strong className="text-gray-200">{repoName}</strong> to focus the narrative and Remotion code zooms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSelectRecommended}
            className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            ★ Recommended
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 text-xs font-mono text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter files by path or name (e.g. router, parser, auth)..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-lowest text-xs text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:border-purple-500/60 font-mono transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-mono"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expandable Tree Scroll Canvas */}
      <div className="max-h-64 overflow-y-auto rounded-xl bg-surface-container-lowest/80 border border-white/5 p-3 space-y-1 scrollbar-thin">
        {Object.keys(treeRoot.children).length > 0 ? (
          renderTree(treeRoot)
        ) : (
          <div className="text-center py-8 text-xs text-gray-500 font-mono">
            No files matched "{searchQuery}"
          </div>
        )}
      </div>

      {/* Selection Status Badge */}
      <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>
            <strong className="text-white">{selectedPaths.size}</strong> files selected for video grounding
          </span>
        </div>
        <span className="text-[11px] text-gray-500">Target Duration: ~60s</span>
      </div>

      {/* Custom Narrative Directive Input */}
      <div className="pt-2 border-t border-white/5 flex flex-col gap-2.5">
        <label className="text-xs font-mono font-medium text-gray-300 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-purple-400 text-sm">edit_note</span>
          <span>Custom Script &amp; Architectural Focus Directive (Optional):</span>
        </label>
        <input
          type="text"
          value={userDirective}
          onChange={(e) => setUserDirective(e.target.value)}
          disabled={isRunning}
          placeholder="e.g. Explain how PDF parsing handles multiple layout variants and logs failures..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 font-mono transition-colors"
        />

        {/* Preset Directive Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-gray-500 py-0.5">Quick Directives:</span>
          {DIRECTIVE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={isRunning}
              onClick={() => setUserDirective(preset.text)}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-purple-600/20 text-gray-400 hover:text-purple-300 border border-white/5 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation CTA */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isRunning || selectedPaths.size === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
        >
          <span className="material-symbols-outlined text-[17px]">play_arrow</span>
          <span>Apply Focus &amp; Generate Walkthrough</span>
        </button>
      </div>
    </div>
  );
}

