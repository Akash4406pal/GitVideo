import path from "node:path";
import type { Skeleton, Snippet } from "../types/skeleton.js";
import type { Storyboard } from "../types/storyboard.js";

function extractCodeExplanation(snippet?: Snippet): string {
  if (!snippet) {
    return "The project organizes its architecture through clean separation of concerns.";
  }

  const code = snippet.code;
  const fileName = path.basename(snippet.filePath);

  // 1. Detect SQL logic
  if (snippet.filePath.endsWith(".sql") || code.toUpperCase().includes("SELECT")) {
    const tableMatch = code.match(/FROM\s+([a-zA-Z0-9_\.]+)/i);
    const table = tableMatch ? tableMatch[1] : "the target dataset";
    return `In ${fileName}, the SQL workflow queries ${table}, running analytical aggregations and group-by filters to extract key insights.`;
  }

  // 2. Detect functions (TS/JS/Python)
  const funcMatches = Array.from(code.matchAll(/(?:function|def|const)\s+([a-zA-Z0-9_]+)\s*(?:=|\()/g)).map((m) => m[1]);
  if (funcMatches.length > 0) {
    const mainFunc = funcMatches[0];
    const secondFunc = funcMatches[1];
    if (secondFunc) {
      return `Looking into ${fileName}, the function ${mainFunc} drives the primary execution, collaborating with ${secondFunc} to handle core transformations.`;
    }
    return `Looking into ${fileName}, the function ${mainFunc} implements the central logic, orchestrating inputs and managing state transitions.`;
  }

  // 3. Detect Class definitions
  const classMatch = code.match(/class\s+([a-zA-Z0-9_]+)/);
  if (classMatch) {
    return `In ${fileName}, the class ${classMatch[1]} encapsulates the core domain logic and establishes the system's operational contract.`;
  }

  return `In ${fileName}, the code establishes key handlers directly within lines ${snippet.startLine} to ${snippet.endLine}.`;
}

export function generateFallbackStoryboard(skeleton: Skeleton): Storyboard {
  const repoName = skeleton.repo.name;
  const cleanRepoName = repoName.replace(/_/g, " ").replace(/-/g, " ");
  const languages = skeleton.repo.detectedLanguages.join(", ") || "software";
  const frameworks = skeleton.repo.detectedFrameworks.length > 0 
    ? ` built with ${skeleton.repo.detectedFrameworks.join(" and ")}` 
    : "";
  const mainEntry = skeleton.entryPoints[0] || skeleton.files[0]?.path || "source files";
  const cleanMainEntry = mainEntry.replace(/_/g, " ").replace(/\.[a-zA-Z0-9]+$/, "");
  const primarySnippet = skeleton.snippets[0];

  const codeNarration = extractCodeExplanation(primarySnippet).replace(/_/g, " ");

  return {
    repoName,
    targetDurationSec: 40,
    estimatedDurationSec: 38,
    totalWordCount: 92,
    tone: "technical",
    scenes: [
      {
        id: "scene_1",
        sceneNumber: 1,
        type: "title",
        title: `Overview: ${cleanRepoName}`,
        description: "Introduction hook and tech stack presentation",
        durationEstimateSec: 7,
        segments: [
          {
            id: "seg_1_1",
            text: `${cleanRepoName} is an active ${languages} project${frameworks}, designed for modularity and performance.`,
            focus: {},
          },
        ],
      },
      {
        id: "scene_2",
        sceneNumber: 2,
        type: "file_tree",
        title: "Project Structure",
        description: "Entrypoints and file organization",
        durationEstimateSec: 8,
        segments: [
          {
            id: "seg_2_1",
            text: `The repository spans ${skeleton.repo.totalFiles} files and ${skeleton.repo.totalLinesOfCode} lines of code, bootstrapping execution from ${cleanMainEntry}.`,
            focus: { fileId: skeleton.files[0]?.id },
          },
        ],
      },
      {
        id: "scene_3",
        sceneNumber: 3,
        type: "code_focus",
        title: "Core Implementation",
        description: "High-priority code logic inspection",
        durationEstimateSec: 12,
        segments: [
          {
            id: "seg_3_1",
            text: codeNarration,
            focus: {
              snippetId: primarySnippet?.id,
              fileId: primarySnippet?.fileId,
              highlightLines: [1, 3, 5],
            },
          },
        ],
      },
      {
        id: "scene_4",
        sceneNumber: 4,
        type: "graph",
        title: "Dependency Flow",
        description: "Internal module communication flow",
        durationEstimateSec: 8,
        segments: [
          {
            id: "seg_4_1",
            text: `Analyzing module dependencies shows data moving inward from configuration to execution handlers.`,
            focus: {
              nodeIds: skeleton.dependencyEdges.slice(0, 4).map((e) => e.sourceFileId),
            },
          },
        ],
      },
      {
        id: "scene_5",
        sceneNumber: 5,
        type: "outro",
        title: "Getting Started",
        description: "Conclusion and call to action",
        durationEstimateSec: 6,
        segments: [
          {
            id: "seg_5_1",
            text: `Clone ${repoName} from GitHub to explore or contribute today.`,
            focus: {},
          },
        ],
      },
    ],
  };
}
