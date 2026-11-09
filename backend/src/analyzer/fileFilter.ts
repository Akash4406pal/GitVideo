import path from "node:path";

export const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".github",
  "node_modules",
  "dist",
  "build",
  "out",
  ".next",
  ".cache",
  "coverage",
  ".venv",
  "venv",
  "env",
  "__pycache__",
  ".idea",
  ".vscode",
  "target",
  "bin",
  "obj",
  ".turbo",
  "vendor",
  "test",
  "tests",
  "__tests__",
  "spec",
  "specs",
  "fixtures",
  "benchmark",
  "benchmarks",
]);

export const IGNORED_FILES = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "Cargo.lock",
  "Gemfile.lock",
  "composer.lock",
  ".DS_Store",
  "thumbs.db",
]);

export const ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".hpp",
  ".cs",
  ".rb",
  ".php",
  ".json",
  ".md",
  ".html",
  ".css",
  ".yaml",
  ".yml",
  ".toml",
  ".sql",
]);

export const MAX_FILE_SIZE_BYTES = 250 * 1024; // 250 KB limit per file

export function shouldIgnoreDirectory(dirName: string): boolean {
  return IGNORED_DIRECTORIES.has(dirName) || dirName.startsWith(".");
}

export function shouldAnalyzeFile(filePath: string, sizeBytes: number): boolean {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (IGNORED_FILES.has(fileName)) return false;
  if (sizeBytes > MAX_FILE_SIZE_BYTES) return false;
  if (fileName.endsWith(".min.js") || fileName.endsWith(".min.css") || fileName.endsWith(".d.ts.map")) return false;

  return ALLOWED_EXTENSIONS.has(ext) || fileName.toLowerCase() === "dockerfile" || fileName.toLowerCase() === "makefile";
}

