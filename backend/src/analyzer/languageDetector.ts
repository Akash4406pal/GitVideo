import fs from "node:fs";
import path from "node:path";

export interface DetectedStack {
  languages: string[];
  frameworks: string[];
}

export function detectLanguagesAndFrameworks(repoRoot: string): DetectedStack {
  const languages = new Set<string>();
  const frameworks = new Set<string>();

  // Helper to inspect a single package.json
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
    } catch {
      // ignore
    }
  }

  // Check root package.json and subfolders (for monorepos)
  inspectPackageJson(path.join(repoRoot, "package.json"));
  const commonDirs = ["backend", "frontend", "server", "client", "app", "apps/web", "packages/core"];
  for (const sub of commonDirs) {
    inspectPackageJson(path.join(repoRoot, sub, "package.json"));
  }

  // Check Python
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
        const content = fs.readFileSync(m, "utf-8").toLowerCase();
        if (content.includes("fastapi")) frameworks.add("FastAPI");
        if (content.includes("flask")) frameworks.add("Flask");
        if (content.includes("django")) frameworks.add("Django");
        if (content.includes("torch") || content.includes("pytorch")) frameworks.add("PyTorch");
        if (content.includes("tensorflow")) frameworks.add("TensorFlow");
      }
    }
  }

  // Check Go
  if (fs.existsSync(path.join(repoRoot, "go.mod")) || fs.existsSync(path.join(repoRoot, "backend", "go.mod"))) {
    languages.add("Go");
  }

  // Check Rust
  if (fs.existsSync(path.join(repoRoot, "Cargo.toml")) || fs.existsSync(path.join(repoRoot, "backend", "Cargo.toml"))) {
    languages.add("Rust");
  }

  // Check Java
  if (fs.existsSync(path.join(repoRoot, "pom.xml")) || fs.existsSync(path.join(repoRoot, "build.gradle"))) {
    languages.add("Java");
  }

  return {
    languages: Array.from(languages),
    frameworks: Array.from(frameworks),
  };
}
