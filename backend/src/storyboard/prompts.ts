import type { Skeleton } from "../types/skeleton.js";

export function buildSystemPrompt(): string {
  return `You are GitVideo's expert code narrator and video storyboard director.
Your job is to generate a high-energy, 60-to-80 second video script explaining a software repository.

CRITICAL RULES:
1. OUTPUT PURE JSON ONLY. No markdown formatting, no backticks (\`\`\`json), no preamble, no outro.
2. STRICT SCHEMA COMPLIANCE: Your output must match the exact JSON structure provided in the prompt.
3. GROUNDING IS MANDATORY:
   - Only reference fileId (e.g. "f_1"), snippetId (e.g. "s_1"), and line ranges that appear in the provided repository skeleton.
   - NEVER invent nonexistent files or code snippets.
4. PACING & WORD BUDGET:
   - Total words across all scenes MUST be between 120 and 180 words (~2.3 words per second for a 60-80s video).
   - Keep narration punchy, developer-focused, and natural for text-to-speech.
5. SCENE SEQUENCE (Must be exactly 5 scenes in order):
   - Scene 1 ("title"): Hook the viewer. Explain what the project solves and its tech stack.
   - Scene 2 ("file_tree"): Show directory layout, highlighting entrypoint files.
   - Scene 3 ("code_focus"): Deep dive into the primary code snippet (use valid snippetId and line highlights).
   - Scene 4 ("graph"): Explain how components and modules interact using dependency edges.
   - Scene 5 ("outro"): Quickstart command, call to action to star the repo, conclusion.`;
}

export function buildUserPrompt(skeleton: Skeleton): string {
  // Condense snippets for token economy
  const condensedSnippets = skeleton.snippets.slice(0, 4).map((s) => ({
    snippetId: s.id,
    fileId: s.fileId,
    filePath: s.filePath,
    startLine: s.startLine,
    endLine: s.endLine,
    preview: s.code.split("\n").slice(0, 10).join("\n"),
  }));

  const condensedEdges = skeleton.dependencyEdges.slice(0, 12).map((e) => ({
    from: e.sourcePath,
    to: e.importedTarget,
  }));

  const payload = {
    repo: {
      name: skeleton.repo.name,
      languages: skeleton.repo.detectedLanguages,
      frameworks: skeleton.repo.detectedFrameworks,
      loc: skeleton.repo.totalLinesOfCode,
      totalFiles: skeleton.repo.totalFiles,
      summary: skeleton.summary,
    },
    entryPoints: skeleton.entryPoints,
    availableFiles: skeleton.files.slice(0, 15).map((f) => ({ id: f.id, path: f.path, role: f.role })),
    availableSnippets: condensedSnippets,
    dependencyEdges: condensedEdges,
  };

  const firstSnippetId = skeleton.snippets[0]?.id || "s_1";
  const firstFileId = skeleton.snippets[0]?.fileId || skeleton.files[0]?.id || "f_1";

  return `Generate a 5-scene GitVideo Storyboard JSON for this repository skeleton:

${JSON.stringify(payload, null, 2)}

Return JSON matching this exact structure:
{
  "repoName": "${skeleton.repo.name}",
  "targetDurationSec": 75,
  "estimatedDurationSec": 75,
  "totalWordCount": 150,
  "tone": "engaging",
  "scenes": [
    {
      "id": "scene_1",
      "sceneNumber": 1,
      "type": "title",
      "title": "Welcome to ${skeleton.repo.name}",
      "description": "Introduction hook and tech stack presentation",
      "durationEstimateSec": 12,
      "segments": [
        {
          "id": "seg_1_1",
          "text": "Welcome to ${skeleton.repo.name}, an open-source project built with ${skeleton.repo.detectedLanguages.join(", ") || "code"}.",
          "focus": {}
        }
      ]
    },
    {
      "id": "scene_2",
      "sceneNumber": 2,
      "type": "file_tree",
      "title": "Project Structure & Entrypoints",
      "description": "Directory layout and bootstrap files",
      "durationEstimateSec": 14,
      "segments": [
        {
          "id": "seg_2_1",
          "text": "The project organizes core components neatly, bootstrapping execution from ${skeleton.entryPoints[0] || skeleton.files[0]?.path || "entry point"}.",
          "focus": { "fileId": "${firstFileId}" }
        }
      ]
    },
    {
      "id": "scene_3",
      "sceneNumber": 3,
      "type": "code_focus",
      "title": "Core Implementation",
      "description": "Key logic and function analysis",
      "durationEstimateSec": 20,
      "segments": [
        {
          "id": "seg_3_1",
          "text": "Looking into the core implementation, we see how the central handler sets up the workflow.",
          "focus": {
            "snippetId": "${firstSnippetId}",
            "fileId": "${firstFileId}",
            "highlightLines": [1, 2, 3]
          }
        }
      ]
    },
    {
      "id": "scene_4",
      "sceneNumber": 4,
      "type": "graph",
      "title": "Architecture & Flow",
      "description": "Dependency connections across modules",
      "durationEstimateSec": 15,
      "segments": [
        {
          "id": "seg_4_1",
          "text": "The internal architecture connects services through clean interfaces and modular exports.",
          "focus": { "nodeIds": [] }
        }
      ]
    },
    {
      "id": "scene_5",
      "sceneNumber": 5,
      "type": "outro",
      "title": "Getting Started",
      "description": "Conclusion and call to action",
      "durationEstimateSec": 14,
      "segments": [
        {
          "id": "seg_5_1",
          "text": "Check out the repository on GitHub to dive deeper or build on top of it.",
          "focus": {}
        }
      ]
    }
  ]
}`;
}

