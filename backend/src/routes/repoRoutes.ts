import { Router, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { DIST_DIR, config } from "../config/env.js";
import { callBharatCodeModel } from "../storyboard/llmClient.js";

export const repoRouter = Router();

repoRouter.get("/blueprint", (_req: Request, res: Response) => {
  const distDir = DIST_DIR;
  const blueprintPath = path.join(distDir, "ARCHITECTURE.md");
  const skeletonPath = path.join(distDir, "skeleton.json");

  if (fs.existsSync(blueprintPath)) {
    const content = fs.readFileSync(blueprintPath, "utf-8");
    return res.json({
      exists: true,
      content,
      updatedAt: fs.statSync(blueprintPath).mtime.toISOString(),
    });
  }

  if (fs.existsSync(skeletonPath)) {
    try {
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
`;
      return res.json({
        exists: true,
        content: fallbackMarkdown,
        updatedAt: new Date().toISOString(),
      });
    } catch {}
  }

  return res.json({ exists: false, content: null });
});

repoRouter.post("/chat", async (req: Request, res: Response) => {
  const question = String(req.body.question || "").trim();
  if (!question) {
    return res.status(400).json({ error: "Question cannot be empty" });
  }

  const distDir = DIST_DIR;
  const skeletonPath = path.join(distDir, "skeleton.json");
  let skeleton: any = null;

  if (fs.existsSync(skeletonPath)) {
    try {
      skeleton = JSON.parse(fs.readFileSync(skeletonPath, "utf-8"));
    } catch {}
  }

  const repoName = skeleton?.repo?.name || "GitVideo Repository";
  const files = skeleton?.files || [];
  const snippets = skeleton?.snippets || [];
  const entryPoints = skeleton?.entryPoints || [];

  // Deterministic fallback response
  const fallbackAnswer = `Based on the AST analysis for **${repoName}**:

- **Entrypoints:** ${entryPoints.length > 0 ? entryPoints.join(", ") : "Detected modular files."}
- **Key Modules Analyzed:** ${files.slice(0, 5).map((f: any) => `\`${f.path}\``).join(", ")}
- **Grounding Evidence:** Sliced ${snippets.length} AST code snippets with exact line ranges.`;

  const citations = snippets.slice(0, 3).map((s: any) => ({
    filePath: s.filePath,
    startLine: s.startLine,
    endLine: s.endLine,
    title: s.title,
  }));

  if (config.BHARATCODE_API_KEY) {
    try {
      const systemPrompt = `You are GitVideo's expert codebase analyst for the repository '${repoName}'. Answer the developer's question accurately, concisely, and cite specific files and lines from the provided AST analysis context. If the answer cannot be determined from the context, say so clearly.`;
      
      const snippetContext = snippets.slice(0, 3).map((s: any) => 
        `File: ${s.filePath} (Lines ${s.startLine}-${s.endLine})\n\`\`\`\n${s.code}\n\`\`\``
      ).join("\n\n");

      const userPrompt = `Repository: ${repoName}
Languages: ${(skeleton?.repo?.detectedLanguages || []).join(", ")}
Frameworks: ${(skeleton?.repo?.detectedFrameworks || []).join(", ")}
Entrypoints: ${entryPoints.join(", ")}

Key Code Snippets:
${snippetContext}

Developer Question: ${question}

Provide a helpful, precise explanation with grounding citations:`;

      const aiAnswer = await callBharatCodeModel([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      if (aiAnswer && aiAnswer.trim().length > 0) {
        return res.json({
          answer: aiAnswer.trim(),
          citations,
          repoName,
          source: "bharatcode-llm",
        });
      }
    } catch (llmErr: any) {
      console.warn("[RepoChat] LLM query failed, falling back to AST summary:", llmErr.message);
    }
  }

  return res.json({
    answer: fallbackAnswer,
    citations,
    repoName,
    source: "ast-grounding",
  });
});
