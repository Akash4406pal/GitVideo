import React from "react";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoProps } from "./types.js";
import { Scene1_Title } from "./scenes/Scene1_Title.js";
import { Scene2_FileTree } from "./scenes/Scene2_FileTree.js";
import { Scene3_CodeFocus } from "./scenes/Scene3_CodeFocus.js";
import { Scene4_DependencyGraph } from "./scenes/Scene4_DependencyGraph.js";
import { Scene5_Outro } from "./scenes/Scene5_Outro.js";
import { SubtitleOverlay } from "./components/SubtitleOverlay.js";
import { AudioSequencer } from "./components/AudioSequencer.js";

export const MainComposition: React.FC<VideoProps> = ({ skeleton, storyboard }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Compute frame boundaries for every scene
  let cumulativeFrame = 0;
  const sceneTimings = storyboard.scenes.map((scene) => {
    // If scene has segments, sum their durations; otherwise use scene.durationEstimateSec
    const durationSec = scene.segments.reduce(
      (sum, seg) => sum + (seg.durationSec || 2.5),
      0
    ) || scene.durationEstimateSec || 10;

    const durationInFrames = Math.max(30, Math.ceil(durationSec * fps));
    const startFrame = cumulativeFrame;
    cumulativeFrame += durationInFrames;

    return {
      scene,
      startFrame,
      durationInFrames,
    };
  });

  // Find active segment for subtitles
  let activeSegmentText = "";
  let segCumulative = 0;
  for (const scene of storyboard.scenes) {
    for (const segment of scene.segments) {
      const segFrames = Math.max(15, Math.ceil((segment.durationSec || 2.5) * fps));
      if (frame >= segCumulative && frame < segCumulative + segFrames) {
        activeSegmentText = segment.text;
        break;
      }
      segCumulative += segFrames;
    }
    if (activeSegmentText) break;
  }

  // Component mapper for scenes
  const renderSceneComponent = (sceneType: string, scene: any) => {
    switch (sceneType) {
      case "title":
        return <Scene1_Title skeleton={skeleton} scene={scene} />;
      case "file_tree":
        return <Scene2_FileTree skeleton={skeleton} scene={scene} />;
      case "code_focus":
        return <Scene3_CodeFocus skeleton={skeleton} scene={scene} />;
      case "graph":
        return <Scene4_DependencyGraph skeleton={skeleton} scene={scene} />;
      case "outro":
      default:
        return <Scene5_Outro skeleton={skeleton} scene={scene} />;
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d1117",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Visual Scenes Sequencer */}
      {sceneTimings.map(({ scene, startFrame, durationInFrames }) => (
        <Sequence
          key={scene.id}
          from={startFrame}
          durationInFrames={durationInFrames}
        >
          {renderSceneComponent(scene.type, scene)}
        </Sequence>
      ))}

      {/* Subtitles Overlay */}
      <SubtitleOverlay text={activeSegmentText} />

      {/* Audio Playback Sequencer */}
      <AudioSequencer storyboard={storyboard} fps={fps} />
    </div>
  );
};

