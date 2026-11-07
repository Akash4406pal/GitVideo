import fs from "node:fs";
import path from "node:path";

export interface DetectedStack {
  languages: string[];
  frameworks: string[];
}

export function detectLanguagesAndFrameworks(repoRoot: string): DetectedStack {
  const languages = new Set<string>();
  const frameworks = new Set<string>();

  // 1. Inspect package.json manifests
  function inspectPackageJson(pkgPath: string) {
    if (!fs.existsSync(pkgPath)) return;
    languages.add("JavaScript");
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      const dir = path.dirname(pkgPath);
      if (allDeps.typescript || fs.existsSync(path.join(dir, "tsconfig.json"))) {
        languages.add("TypeScript");
      }
      if (allDeps.express) frameworks.add("Express");
      if (allDeps.next) frameworks.add("Next.js");
      if (allDeps.react) frameworks.add("React");
      if (allDeps.vue) frameworks.add("Vue");
      if (allDeps["@nestjs/core"]) frameworks.add("NestJS");
      if (allDeps.fastify) frameworks.add("Fastify");
      if (allDeps.remotion || allDeps["@remotion/core"] || allDeps["@remotion/cli"]) frameworks.add("Remotion");
      if (allDeps.tailwindcss) frameworks.add("TailwindCSS");
      if (allDeps.prisma || allDeps["@prisma/client"]) frameworks.add("Prisma");
    } catch {}
  }

  inspectPackageJson(path.join(repoRoot, "package.json"));
  const commonDirs = ["backend", "frontend", "server", "client", "app", "apps/web", "packages/core"];
  for (const sub of commonDirs) {
    inspectPackageJson(path.join(repoRoot, sub, "package.json"));
  }

  // 2. Check Python manifests
  const pythonManifests = [
    path.join(repoRoot, "requirements.txt"),
    path.join(repoRoot, "pyproject.toml"),
    path.join(repoRoot, "backend", "requirements.txt"),
    path.join(repoRoot, "server", "requirements.txt"),
  ];

  for (const m of pythonManifests) {
    if (fs.existsSync(m)) {
      languages.add("Python");
      if (m.endsWith("requirements.txt")) {
        try {
          const content = fs.readFileSync(m, "utf-8").toLowerCase();
          if (content.includes("fastapi")) frameworks.add("FastAPI");
          if (content.includes("flask")) frameworks.add("Flask");
          if (content.includes("django")) frameworks.add("Django");
          if (content.includes("pandas")) frameworks.add("Pandas");
          if (content.includes("numpy")) frameworks.add("NumPy");
          if (content.includes("torch") || content.includes("pytorch")) frameworks.add("PyTorch");
          if (content.includes("tensorflow")) frameworks.add("TensorFlow");
        } catch {}
      }
    }
  }

  // 3. Scan files across root and top directories to catch extensions
  try {
    const entries = fs.readdirSync(repoRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === ".sql") languages.add("SQL");
        else if (ext === ".py") languages.add("Python");
        else if (ext === ".ts" || ext === ".tsx") languages.add("TypeScript");
        else if (ext === ".js" || ext === ".jsx" || ext === ".mjs") languages.add("JavaScript");
        else if (ext === ".go") languages.add("Go");
        else if (ext === ".rs") languages.add("Rust");
        else if (ext === ".java") languages.add("Java");
        else if (ext === ".c" || ext === ".cpp" || ext === ".h") languages.add("C/C++");
        else if (ext === ".sh" || ext === ".bash") languages.add("Shell");
        else if (ext === ".php") languages.add("PHP");
        else if (ext === ".rb") languages.add("Ruby");
      }
    }
  } catch {}

  return {
    languages: Array.from(languages),
    frameworks: Array.from(frameworks),
  };
}
