import { z } from "zod";

export const SceneTypeSchema = z.enum([
  "title",        // Scene 1: Repo Title, Star Badge, Stack Pills
  "file_tree",    // Scene 2: Directory structure & Entrypoints
  "code_focus",   // Scene 3: Highlighted code snippet (s_1 / s_2)
  "graph",        // Scene 4: Architectural dependency flow
  "outro",        // Scene 5: Quickstart, GitHub link, conclusion
]);
export type SceneType = z.infer<typeof SceneTypeSchema>;

export const VisualFocusSchema = z.object({
  fileId: z.string().optional(),
  snippetId: z.string().optional(),
  startLine: z.number().optional(),
  endLine: z.number().optional(),
  highlightLines: z.array(z.number()).optional(),
  nodeIds: z.array(z.string()).optional(),
});
export type VisualFocus = z.infer<typeof VisualFocusSchema>;

export const SegmentSchema = z.object({
  id: z.string(),
  text: z.string().min(5).max(350),              // Voiceover narration
  focus: VisualFocusSchema.default({}),           // What visuals highlight during this line
  audioPath: z.string().optional(),              // Populated in Step 3 (TTS)
  durationSec: z.number().optional(),            // Populated in Step 3 (TTS)
});
export type Segment = z.infer<typeof SegmentSchema>;

export const SceneSchema = z.object({
  id: z.string(),
  sceneNumber: z.number().int().min(1).max(10),
  type: SceneTypeSchema,
  title: z.string(),
  description: z.string().optional().default(""),
  durationEstimateSec: z.number().min(3).max(60),
  segments: z.array(SegmentSchema).min(1).max(6),
});
export type Scene = z.infer<typeof SceneSchema>;

export const StoryboardSchema = z.object({
  repoName: z.string(),
  targetDurationSec: z.number().default(75),
  estimatedDurationSec: z.number(),
  totalWordCount: z.number(),
  tone: z.enum(["technical", "engaging", "concise"]).default("engaging"),
  scenes: z.array(SceneSchema).min(3).max(8),
});
export type Storyboard = z.infer<typeof StoryboardSchema>;
