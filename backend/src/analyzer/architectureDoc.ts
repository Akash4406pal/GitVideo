import type { Skeleton, DependencyEdge } from "../types/skeleton.js";
import type { Storyboard } from "../types/storyboard.js";

/**
 * Generates an executive, publication-ready ARCHITECTURE.md blueprint
 * based on verified static extraction and storyboard scenes.
 */
export function generateArchitectureDoc(
  skeleton: Skeleton,
  storyboard?: Storyboard
): string {
  const { repo, entryPoints, snippets, dependencyEdges, files } = skeleton;

  const sanitizeMermaidId = (str: string) => str.replace(/[^a-zA-Z0-9_]/g, "_");

  // Create Mermaid diagram of unique dependencies
  const uniqueEdges = dependencyEdges.slice(0, 25);
  const mermaidLines = uniqueEdges.map(
    (e: DependencyEdge) =>
      `    ${sanitizeMermaidId(e.sourcePath)}["${e.sourcePath}"] --> ${sanitizeMermaidId(e.importedTarget)}["${e.importedTarget}"]`
  );

  const mermaidChart =
    mermaidLines.length > 0
      ? `\`\`\`mermaid
flowchart TD
${Array.from(new Set(mermaidLines)).join("\n")}
\`\`\``
      : `*No external imports detected in initial sample.*`;

  return `# 🏛️ Architecture & System Blueprint: ${repo.name}

> **Generated Automatically by GitVideo Engine**  
> *Commit SHA:* \`${repo.commitSha.substring(0, 8)}\` • *Branch:* \`${repo.branch}\` • *Total Source Files:* \`${repo.totalFiles}\` (\`${repo.totalLinesOfCode}\` LOC)

---

## 🎯 Executive Overview

${repo.name} is a **${repo.detectedLanguages.join(" / ") || "Multi-language"}** application built with **${repo.detectedFrameworks.join(", ") || "Standard Library"}**.

- **Primary Entry Points:** \`${entryPoints.join("`, `") || "Auto-detected"}\`
- **Total Code Snippets Extracted:** \`${snippets.length}\`
- **Total Files Scanned:** \`${files.length}\`

---

## 🏗️ Architectural Dependency Graph

${mermaidChart}

---

## ⚡ Verified Core Code Snippets

${snippets
  .slice(0, 4)
  .map(
    (s, idx) => `### ${idx + 1}. \`${s.filePath}\` (Lines ${s.startLine}–${s.endLine})
*Title:* **${s.title}**  
\`\`\`${s.filePath.endsWith(".ts") || s.filePath.endsWith(".tsx") ? "typescript" : "javascript"}
${s.code.trim()}
\`\`\`
`
  )
  .join("\n\n")}

---

## 🎬 Video Walkthrough Narration

${
  storyboard
    ? storyboard.scenes
        .map(
          (sc) => `### Scene ${sc.sceneNumber}: ${sc.title} (\`~${sc.durationEstimateSec}s\`)
${sc.segments.map((seg) => `> "${seg.text}"`).join("\n\n")}
`
        )
        .join("\n")
    : "*Storyboard generation was skipped or is pending.*"
}

---

## 📌 Embed in your GitHub README

Copy and paste this snippet into your repository's \`README.md\` to showcase the video walkthrough:

\`\`\`markdown
[![Watch 60s Architecture Walkthrough](https://img.shields.io/badge/GitVideo-Watch%20Walkthrough-purple?style=for-the-badge&logo=youtube)](https://gitvideo.dev)
\`\`\`

---
*Generated with ❤️ by GitVideo — AI Codebase-to-Video Engine*
`;
}
