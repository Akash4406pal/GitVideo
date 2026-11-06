import React from "react";
import { Audio, Sequence } from "remotion";
import type { Storyboard } from "../../types/storyboard.js";

interface AudioSequencerProps {
  storyboard: Storyboard;
  fps: number;
}

export const AudioSequencer: React.FC<AudioSequencerProps> = ({
  storyboard,
  fps,
}) => {
  let cumulativeFrame = 0;

  return (
    <>
      {storyboard.scenes.map((scene) => {
        return scene.segments.map((segment) => {
          const durationFrames = Math.max(
            15,
            Math.ceil((segment.durationSec || 2.5) * fps)
          );
          const fromFrame = cumulativeFrame;
          cumulativeFrame += durationFrames;

          if (!segment.audioPath) {
            return null;
          }

          return (
            <Sequence
              key={`audio_${scene.id}_${segment.id}`}
              from={fromFrame}
              durationInFrames={durationFrames}
            >
              <Audio src={segment.audioPath} />
            </Sequence>
          );
        });
      })}
    </>
  );
};
