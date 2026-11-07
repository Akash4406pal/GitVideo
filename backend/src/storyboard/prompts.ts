import type { Skeleton } from "../types/skeleton.js";

export function buildSystemPrompt(): string {
  return `CRITICAL REASONING INSTRUCTION: Keep internal reasoning under 30 words. Jump directly into producing the pure JSON storyboard.

You are GitVideo's lead developer evangelist and technical video narrator.
Your job is to generate a punchy, 35-to-45 second video script explaining the actual code and architecture of a software repository.

CRITICAL INSTRUCTIONS:
1. OUTPUT PURE JSON ONLY. No markdown ticks (\`\`\`json), no preamble, no conversational text.
2. NATURAL SPOKEN SCRIPT (VOICEOVER FOR HUMAN VOICE ACTOR):
   - The "text" field in each segment is read ALOUD by text-to-speech.
   - NEVER write raw snake_case or underscores in "text". Always translate to natural spoken words (e.g. write "customer behavior SQL queries", NEVER "customer_behavior_sql_queries").
   - Do not speak file extensions literally (say "in the SQL script", not "dot sql").
   - TONE: Charismatic senior software architect presenting at a tech summit. Be conversational, crisp, and direct. Avoid pedantic, academic, or "teachy" phrases like "let us examine" or "this allows us to cleanly orchestrate".
3. EXPLAIN INTENT & MEANING — NEVER RECITE RAW CODE SYNTAX:
   - The viewer ALREADY SEES the code on screen with syntax highlighting. DO NOT READ THE CODE SYNTAX TO THEM.
   - Explain the REAL-WORLD BUSINESS OR TECHNICAL PURPOSE of the logic:
     * Translate queries into the questions they answer (e.g. say: "First, it segments total revenue by gender. Next, it isolates high-value buyers who used discounts yet spent above average. Finally, it ranks the top five rated products").
     * If queries are named Q1, Q2, Q3, refer to them as "Question 1", "Question 2", or "The first query".
     * Translate API handlers into what they process (e.g. "The controller validates payloads and issues JWT tokens").
   - STRICT NEGATIVE CONSTRAINTS:
     * NEVER recite SQL keywords or functions like SUM(), AVG(), WHERE, LIMIT, or parentheses.
     * NEVER speak variable names with underscores (say "purchase amount" or "sales", NEVER "purchase_amount").
4. PACING & LENGTH (PUNCHY & FAST):
   - Total duration: 35 to 45 seconds (~80 to 110 words total).
   - Each narration segment must be 1 to 2 punchy sentences (under 25 words per segment).
5. EXACT 5 SCENES:
   - Scene 1 ("title"): Hook the viewer. Explain what real-world problem this repo solves.
   - Scene 2 ("file_tree"): Explain the directory structure and where execution starts.
   - Scene 3 ("code_focus"): Deep dive into the primary code logic, explaining the purpose and real-world behavior.
   - Scene 4 ("graph"): Explain the data flow: where data originates, how it transforms, and what consumes it.
   - Scene 5 ("outro"): Tell developers how to run or contribute to it.`;
}

export function buildUserPrompt(skeleton: Skeleton): string {
  // Give the LLM real code content so it can actually explain it!
  const snippetsForPrompt = skeleton.snippets.slice(0, 2).map((s) => ({
    id: s.id,
    fileId: s.fileId,
    filePath: s.filePath,
    startLine: s.startLine,
    endLine: s.endLine,
    code: s.code.split("\n").slice(0, 18).join("\n"),
  }));

  const payload = {
    repoName: skeleton.repo.name,
    languages: skeleton.repo.detectedLanguages.length > 0 ? skeleton.repo.detectedLanguages : ["Code"],
    frameworks: skeleton.repo.detectedFrameworks,
    totalFiles: skeleton.repo.totalFiles,
    loc: skeleton.repo.totalLinesOfCode,
    readmeExcerpt: skeleton.repo.readmeExcerpt?.slice(0, 300) || "",
    entryPoints: skeleton.entryPoints.slice(0, 3),
    primarySnippet: snippetsForPrompt[0] || null,
    moduleDependencies: skeleton.dependencyEdges.slice(0, 6).map((e) => `${e.sourcePath} -> ${e.importedTarget}`),
  };

  const primarySnippetId = skeleton.snippets[0]?.id || "s_1";
  const primaryFileId = skeleton.snippets[0]?.fileId || skeleton.files[0]?.id || "f_1";

  return `Repository Information & Real Code:
${JSON.stringify(payload, null, 2)}

Generate a 5-scene JSON storyboard explaining the real code above. Total word count must be 80-110 words (~40s total).

Required JSON format:
{
  "repoName": "${skeleton.repo.name}",
  "targetDurationSec": 40,
  "estimatedDurationSec": 40,
  "totalWordCount": 95,
  "tone": "technical",
  "scenes": [
    {
      "id": "scene_1",
      "sceneNumber": 1,
      "type": "title",
      "title": "${skeleton.repo.name}",
      "description": "Project purpose and stack overview",
      "durationEstimateSec": 7,
      "segments": [
        {
          "id": "seg_1_1",
          "text": "Specific 1-2 sentence hook explaining what problem this project solves.",
          "focus": {}
        }
      ]
    },
    {
      "id": "scene_2",
      "sceneNumber": 2,
      "type": "file_tree",
      "title": "Architecture & Entrypoints",
      "description": "Directory layout and entry point",
      "durationEstimateSec": 8,
      "segments": [
        {
          "id": "seg_2_1",
          "text": "Explaining the organization and entrypoint from ${skeleton.entryPoints[0] || skeleton.files[0]?.path || 'source'}.",
          "focus": { "fileId": "${primaryFileId}" }
        }
      ]
    },
    {
      "id": "scene_3",
      "sceneNumber": 3,
      "type": "code_focus",
      "title": "Code Deep Dive",
      "description": "Explaining the core function/logic in detail",
      "durationEstimateSec": 12,
      "segments": [
        {
          "id": "seg_3_1",
          "text": "Detailed explanation mentioning actual function/query names from the primarySnippet.",
          "focus": {
            "snippetId": "${primarySnippetId}",
            "fileId": "${primaryFileId}",
            "highlightLines": [1, 2, 3]
          }
        }
      ]
    },
    {
      "id": "scene_4",
      "sceneNumber": 4,
      "type": "graph",
      "title": "Module Data Flow",
      "description": "How components connect together",
      "durationEstimateSec": 8,
      "segments": [
        {
          "id": "seg_4_1",
          "text": "Explaining how modules interact and pass data.",
          "focus": { "nodeIds": [] }
        }
      ]
    },
    {
      "id": "scene_5",
      "sceneNumber": 5,
      "type": "outro",
      "title": "Run & Explore",
      "description": "Quickstart and conclusion",
      "durationEstimateSec": 6,
      "segments": [
        {
          "id": "seg_5_1",
          "text": "Call to action on how to run or explore the repository.",
          "focus": {}
        }
      ]
    }
  ]
}`;
}
