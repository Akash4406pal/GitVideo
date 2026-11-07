import fs from "node:fs";
import path from "node:path";
import { shouldAnalyzeFile, shouldIgnoreDirectory } from "./fileFilter.js";
import { detectLanguagesAndFrameworks } from "./languageDetector.js";
import { determineFileRole, extractImports, extractSnippet, isEntryPoint } from "./codeExtractor.js";
import {
  type DependencyEdge,
  type FileNode,
  type RepoMetadata,
  type Skeleton,
  SkeletonSchema,
  type Snippet,
} from "../types/skeleton.js";
import type { IngestResult } from "../ingest/cloner.js";

export async function buildSkeleton(ingest: IngestResult, sourceUrl: string): Promise<Skeleton> {
  const repoRoot = ingest.repoPath;
  const detected = detectLanguagesAndFrameworks(repoRoot);

  const fileNodes: FileNode[] = [];
  const snippets: Snippet[] = [];
  const dependencyEdges: DependencyEdge[] = [];
  const entryPoints: string[] = [];

  let fileCounter = 1;
  let snippetCounter = 1;
  let totalLoc = 0;

  // Walk directory recursively
  function walkDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(repoRoot, fullPath);
      const normalizedRelPath = relPath.replace(/\\/g, "/");

      if (entry.isDirectory()) {
        if (!shouldIgnoreDirectory(entry.name)) {
          walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        const stats = fs.statSync(fullPath);
        if (shouldAnalyzeFile(fullPath, stats.size)) {
          const content = fs.readFileSync(fullPath, "utf-8");
          const lines = content.split(/\r?\n/);
          const loc = lines.length;
          totalLoc += loc;

          const fileId = `f_${fileCounter++}`;
          const isEntry = isEntryPoint(normalizedRelPath);
          if (isEntry) {
            entryPoints.push(normalizedRelPath);
          }

          const role = determineFileRole(normalizedRelPath, isEntry);
          const snippetIds: string[] = [];

          const ext = path.extname(fullPath).toLowerCase();
          const isCodeFile = [".ts", ".tsx", ".js", ".jsx", ".py", ".sql", ".go", ".rs", ".java", ".c", ".cpp", ".h", ".sh"].includes(ext);

          // Generate snippets for entry points, core files, or code files (up to 12 snippets max)
          if ((isEntry || role === "core" || role === "route" || (isCodeFile && fileNodes.length < 10)) && snippets.length < 12) {
            const extracted = extractSnippet(fileId, normalizedRelPath, content, snippetCounter++);
            if (extracted) {
              snippets.push(extracted.snippet);
              snippetIds.push(extracted.snippetId);
            }
          }
          const imports = extractImports(content, ext);
          for (const imp of imports) {
            dependencyEdges.push({
              sourceFileId: fileId,
              sourcePath: normalizedRelPath,
              importedTarget: imp,
            });
          }

          fileNodes.push({
            id: fileId,
            path: normalizedRelPath,
            extension: ext,
            loc,
            sizeBytes: stats.size,
            isEntryPoint: isEntry,
            role,
            snippetIds,
          });
        }
      }
    }
  }

  walkDir(repoRoot);

  // Guarantee that snippets are extracted even for repos without traditional src/ directories
  if (snippets.length === 0) {
    const candidateFiles = fileNodes
      .filter((f) => ![".md", ".json", ".lock", ".txt", ".yml", ".yaml", ".svg", ".png"].includes(f.extension))
      .sort((a, b) => b.loc - a.loc)
      .slice(0, 4);

    for (const f of candidateFiles) {
      const fullPath = path.join(repoRoot, f.path);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          const extracted = extractSnippet(f.id, f.path, content, snippetCounter++);
          if (extracted) {
            snippets.push(extracted.snippet);
            f.snippetIds.push(extracted.snippetId);
          }
        } catch {}
      }
    }
  }

  // Read README excerpt if available
  let readmeExcerpt: string | undefined;
  const readmeNames = ["README.md", "readme.md", "README", "readme.markdown"];
  for (const name of readmeNames) {
    const readmePath = path.join(repoRoot, name);
    if (fs.existsSync(readmePath)) {
      try {
        const fullReadme = fs.readFileSync(readmePath, "utf-8");
        const lines = fullReadme.split(/\r?\n/).slice(0, 30);
        readmeExcerpt = lines.join("\n").trim();
        break;
      } catch {
        // ignore
      }
    }
  }

  // Map dependency edges to target file IDs if local relative import
  const pathToIdMap = new Map<string, string>();
  for (const f of fileNodes) {
    pathToIdMap.set(f.path, f.id);
    const noExt = f.path.replace(/\.[^/.]+$/, "");
    pathToIdMap.set(noExt, f.id);
  }

  for (const edge of dependencyEdges) {
    if (edge.importedTarget.startsWith(".")) {
      const dir = path.dirname(edge.sourcePath);
      const resolved = path.normalize(path.join(dir, edge.importedTarget)).replace(/\\/g, "/");
      const targetId = pathToIdMap.get(resolved);
      if (targetId) {
        edge.targetFileId = targetId;
      }
    }
  }

  const repoMeta: RepoMetadata = {
    name: ingest.repoName,
    url: sourceUrl,
    commitSha: ingest.commitSha,
    branch: ingest.branch,
    readmeExcerpt,
    detectedLanguages: detected.languages,
    detectedFrameworks: detected.frameworks,
    totalFiles: fileNodes.length,
    totalLinesOfCode: totalLoc,
  };

  const summary = `Repository '${repoMeta.name}' (${repoMeta.commitSha}) contains ${fileNodes.length} scanned files across ${totalLoc} lines of code. Key frameworks detected: ${detected.frameworks.length > 0 ? detected.frameworks.join(", ") : "None detected"}. Identified ${entryPoints.length} entry points.`;

  const skeleton: Skeleton = {
    repo: repoMeta,
    entryPoints,
    files: fileNodes,
    snippets,
    dependencyEdges,
    summary,
  };

  // Validate using Zod
  const validation = SkeletonSchema.safeParse(skeleton);
  if (!validation.success) {
    console.warn("[Validator] Skeleton schema warning:", validation.error.format());
  }

  return skeleton;
}

