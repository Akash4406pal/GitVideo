import type { Skeleton } from "../types/skeleton.js";
import type { Storyboard } from "../types/storyboard.js";

export function generateFallbackStoryboard(skeleton: Skeleton): Storyboard {
  const repoName = skeleton.repo.name;
  const languages = skeleton.repo.detectedLanguages.join(", ") || "software";
  const frameworks = skeleton.repo.detectedFrameworks.length > 0 
    ? ` built with ${skeleton.repo.detectedFrameworks.join(" and ")}` 
    : "";
  const mainEntry = skeleton.entryPoints[0] || skeleton.files[0]?.path || "source files";
  const primarySnippet = skeleton.snippets[0];

  return {
    repoName,
    targetDurationSec: 75,
    estimatedDurationSec: 72,
    totalWordCount: 155,
    tone: "engaging",
    scenes: [
      {
        id: "scene_1",
        sceneNumber: 1,
        type: "title",
        title: `Overview: ${repoName}`,
        description: "Introduction hook and tech stack presentation",
        durationEstimateSec: 12,
        segments: [
          {
            id: "seg_1_1",
            text: `Welcome to ${repoName}, an open-source ${languages} project${frameworks}. In this walkthrough, we explore how its core architecture fits together.`,
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
        durationEstimateSec: 14,
        segments: [
          {
            id: "seg_2_1",
            text: `The project spans ${skeleton.repo.totalFiles} source files across ${skeleton.repo.totalLinesOfCode} lines of code. Execution bootstraps from ${mainEntry}.`,
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
        durationEstimateSec: 20,
        segments: [
          {
            id: "seg_3_1",
            text: primarySnippet 
              ? `Looking into ${primarySnippet.filePath}, the system orchestrates its main logic right here, establishing key functions and configurations cleanly.`
              : `The core modules are neatly isolated, allowing straightforward debugging and extension.`,
            focus: {
              snippetId: primarySnippet?.id,
              fileId: primarySnippet?.fileId,
              highlightLines: [1, 5, 10],
            },
          },
        ],
      },
      {
        id: "scene_4",
        sceneNumber: 4,
        type: "graph",
        title: "Dependency Graph",
        description: "Internal module communication flow",
        durationEstimateSec: 14,
        segments: [
          {
            id: "seg_4_1",
            text: `Analyzing module imports reveals a decoupled architecture where dependencies flow inward from configuration to runtime handlers.`,
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
        durationEstimateSec: 12,
        segments: [
          {
            id: "seg_5_1",
            text: `You can clone ${repoName} from GitHub today to start exploring. Powered by GitVideo and BharatCode AI.`,
            focus: {},
          },
        ],
      },
    ],
  };
}

