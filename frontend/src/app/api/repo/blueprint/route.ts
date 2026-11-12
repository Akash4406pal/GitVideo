import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  try {
    const distDir = path.resolve(process.cwd(), "../backend/dist");
    const blueprintPath = path.join(distDir, "ARCHITECTURE.md");
    const skeletonPath = path.join(distDir, "skeleton.json");

    if (fs.existsSync(blueprintPath)) {
      const content = fs.readFileSync(blueprintPath, "utf-8");
      return NextResponse.json({
        exists: true,
        content,
        updatedAt: fs.statSync(blueprintPath).mtime.toISOString(),
      });
    }

    // Fallback: If skeleton exists but ARCHITECTURE.md not rendered yet
    if (fs.existsSync(skeletonPath)) {
      const skeleton = JSON.parse(fs.readFileSync(skeletonPath, "utf-8"));
      const repo = skeleton.repo;
      const fallbackMarkdown = `# 🏛️ Architecture & System Blueprint: ${repo.name}

> **Generated Automatically by GitVideo Engine**  
> *Commit SHA:* \`${repo.commitSha?.substring(0, 8) || "main"}\` • *Branch:* \`${repo.branch || "main"}\` • *Total Files:* \`${repo.totalFiles}\` (\`${repo.totalLinesOfCode}\` LOC)

---

## 🎯 Executive Overview
${repo.name} is a **${repo.detectedLanguages?.join(" / ") || "Multi-language"}** codebase with **${skeleton.files?.length || 0}** scanned source files.

- **Primary Entry Points:** \`${skeleton.entryPoints?.join("`, `") || "Auto-detected"}\`
- **Total Code Snippets Extracted:** \`${skeleton.snippets?.length || 0}\`

---

## 🏗️ Architectural Dependency Flow
\`\`\`mermaid
flowchart TD
${(skeleton.dependencyEdges || [])
  .slice(0, 15)
  .map((e: any) => `    ${e.sourcePath.replace(/[^a-zA-Z0-9_]/g, "_")}["${e.sourcePath}"] --> ${e.importedTarget.replace(/[^a-zA-Z0-9_]/g, "_")}["${e.importedTarget}"]`)
  .join("\n")}
\`\`\`

---

## 📌 Embed in your GitHub README
\`\`\`markdown
[![Watch 60s Architecture Walkthrough](https://img.shields.io/badge/GitVideo-Watch%20Walkthrough-purple?style=for-the-badge&logo=youtube)](https://gitvideo.dev)
\`\`\`
`;
      return NextResponse.json({
        exists: true,
        content: fallbackMarkdown,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        exists: false,
        content: "# No Blueprint Generated Yet\n\nEnter a repository in the GitVideo Ingestion Engine to compile an architectural blueprint.",
      },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load blueprint", message: error.message },
      { status: 500 }
    );
  }
}

