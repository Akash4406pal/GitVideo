import fs from "node:fs";
import path from "node:path";
import type { DependencyEdge, Snippet } from "../types/skeleton.js";

const ENTRY_POINT_PATTERNS = [
  /(?:^|[\/\\])(index|server|app|main)\.(ts|js|mjs|tsx|jsx|py|go|rs|cpp|c)$/i,
  /(?:^|[\/\\])cmd[\/\\]/i,
];

export function isEntryPoint(normalizedRelPath: string): boolean {
  return ENTRY_POINT_PATTERNS.some((pattern) => pattern.test(normalizedRelPath));
}

export function determineFileRole(normalizedRelPath: string, isEntry: boolean): "entry" | "core" | "utility" | "route" | "config" | "docs" | "other" {
  if (isEntry) return "entry";
  const lower = normalizedRelPath.toLowerCase();

  if (lower.includes("route") || lower.includes("controller") || lower.includes("endpoint") || lower.includes("api/")) {
    return "route";
  }
  if (lower.includes("config") || lower.includes("setting") || lower.endsWith(".config.js") || lower.endsWith(".config.ts")) {
    return "config";
  }
  if (lower.endsWith(".md") || lower.includes("docs/") || lower.includes("doc/")) {
    return "docs";
  }
  if (lower.includes("util") || lower.includes("helper") || lower.includes("common") || lower.includes("lib/")) {
    return "utility";
  }
  if (lower.includes("src/") || lower.includes("service") || lower.includes("model") || lower.includes("analyzer") || lower.includes("core")) {
    return "core";
  }
  return "other";
}

/**
 * Extracts import/require targets from source code for dependency graph mapping.
 */
export function extractImports(sourceCode: string, ext: string): string[] {
  const imports: string[] = [];

  if ([".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(ext)) {
    // ES module import: import ... from 'target';
    const esImportRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = esImportRegex.exec(sourceCode)) !== null) {
      imports.push(match[1]);
    }
    // CommonJS require: require('target')
    const cjsRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = cjsRegex.exec(sourceCode)) !== null) {
      imports.push(match[1]);
    }
  } else if (ext === ".py") {
    // Python import: import foo, from foo import bar
    const pyFromRegex = /from\s+([a-zA-Z0-9_\.]+)\s+import/g;
    let match;
    while ((match = pyFromRegex.exec(sourceCode)) !== null) {
      imports.push(match[1]);
    }
    const pyImportRegex = /^import\s+([a-zA-Z0-9_\.]+)/gm;
    while ((match = pyImportRegex.exec(sourceCode)) !== null) {
      imports.push(match[1]);
    }
  } else if (ext === ".go") {
    const goImportRegex = /import\s+(?:\(([\s\S]*?)\)|"([^"]+)")/g;
    let match;
    while ((match = goImportRegex.exec(sourceCode)) !== null) {
      if (match[2]) {
        imports.push(match[2]);
      } else if (match[1]) {
        const sub = match[1].match(/"([^"]+)"/g);
        if (sub) {
          sub.forEach((s) => imports.push(s.replace(/"/g, "")));
        }
      }
    }
  }

  return Array.from(new Set(imports));
}

/**
 * Extracts a concise 10-30 line snippet from key files.
 */
export function extractSnippet(
  fileId: string,
  relPath: string,
  fullContent: string,
  snippetCounter: number
): { snippet: Snippet; snippetId: string } | null {
  const lines = fullContent.split(/\r?\n/);
  if (lines.length === 0) return null;

  // Find meaningful start (skip top comment headers or empty lines)
  let startIdx = 0;
  while (startIdx < lines.length && (lines[startIdx].trim() === "" || lines[startIdx].trim().startsWith("//") || lines[startIdx].trim().startsWith("/*") || lines[startIdx].trim().startsWith("*"))) {
    startIdx++;
  }

  if (startIdx >= lines.length) startIdx = 0;

  const maxLines = Math.min(25, lines.length - startIdx);
  const endIdx = startIdx + maxLines;
  const snippetLines = lines.slice(startIdx, endIdx);
  const code = snippetLines.join("\n");
  const snippetId = `s_${snippetCounter}`;

  const snippet: Snippet = {
    id: snippetId,
    fileId,
    filePath: relPath,
    title: `${path.basename(relPath)} (L${startIdx + 1}-L${endIdx})`,
    startLine: startIdx + 1,
    endLine: endIdx,
    code,
  };

  return { snippet, snippetId };
}
