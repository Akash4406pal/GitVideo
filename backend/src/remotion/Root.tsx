import React from "react";
import { Composition } from "remotion";
import { MainComposition } from "./MainComposition.js";
import type { VideoProps } from "./types.js";

const defaultProps: VideoProps = {
  skeleton: {
    repo: {
      name: "GitVideo",
      url: "https://github.com/example/GitVideo",
      commitSha: "head",
      branch: "main",
      detectedLanguages: ["TypeScript"],
      detectedFrameworks: ["React", "Next.js"],
      totalFiles: 20,
      totalLinesOfCode: 2000,
    },
    summary: "GitVideo codebase explainer",
    entryPoints: ["src/index.ts"],
    files: [],
    snippets: [],
    dependencyEdges: [],
  },
  storyboard: {
    repoName: "GitVideo",
    targetDurationSec: 60,
    estimatedDurationSec: 50,
    totalWordCount: 120,
    tone: "engaging",
    scenes: [],
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="GitVideoWalkthrough"
      component={MainComposition as any}
      durationInFrames={1500}
      fps={30}
      width={1280}
      height={720}
      defaultProps={defaultProps as Record<string, unknown>}
      calculateMetadata={({ props }) => {
        const typedProps = props as unknown as VideoProps;
        const fps = 30;
        let totalDurationSec = 0;

        if (typedProps.storyboard?.scenes?.length) {
          for (const scene of typedProps.storyboard.scenes) {
            const sceneAudioSec = scene.segments?.reduce(
              (sum: number, seg: { durationSec?: number }) => sum + (seg.durationSec || 2.5),
              0
            ) || scene.durationEstimateSec || 10;
            totalDurationSec += sceneAudioSec;
          }
        }

        const durationInFrames = Math.max(90, Math.ceil((totalDurationSec || 50) * fps));

        return {
          durationInFrames,
          props: props as Record<string, unknown>,
        };
      }}
    />
  );
};
