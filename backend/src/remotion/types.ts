import type { Skeleton } from "../types/skeleton.js";
import type { Storyboard, Scene, Segment } from "../types/storyboard.js";

export interface VideoProps {
  skeleton: Skeleton;
  storyboard: Storyboard;
  [key: string]: unknown;
}

export interface SceneTiming {
  scene: Scene;
  startFrame: number;
  durationInFrames: number;
}

export interface SegmentTiming {
  segment: Segment;
  startFrame: number;
  durationInFrames: number;
}
