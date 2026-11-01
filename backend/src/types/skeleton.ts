import { z } from "zod";

export const SnippetSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  filePath: z.string(),
  title: z.string(),
  startLine: z.number(),
  endLine: z.number(),
  code: z.string(),
});

export const FileNodeSchema = z.object({
  id: z.string(),
  path: z.string(),
  extension: z.string(),
  loc: z.number(),
  sizeBytes: z.number(),
  isEntryPoint: z.boolean(),
  role: z.enum(["entry", "core", "utility", "route", "config", "docs", "other"]),
  snippetIds: z.array(z.string()),
});

export const DependencyEdgeSchema = z.object({
  sourceFileId: z.string(),
  sourcePath: z.string(),
  importedTarget: z.string(),
  targetFileId: z.string().optional(),
});

export const RepoMetadataSchema = z.object({
  name: z.string(),
  url: z.string(),
  commitSha: z.string(),
  branch: z.string(),
  readmeExcerpt: z.string().optional(),
  detectedLanguages: z.array(z.string()),
  detectedFrameworks: z.array(z.string()),
  totalFiles: z.number(),
  totalLinesOfCode: z.number(),
});

export const SkeletonSchema = z.object({
  repo: RepoMetadataSchema,
  entryPoints: z.array(z.string()),
  files: z.array(FileNodeSchema),
  snippets: z.array(SnippetSchema),
  dependencyEdges: z.array(DependencyEdgeSchema),
  summary: z.string(),
});

export type Snippet = z.infer<typeof SnippetSchema>;
export type FileNode = z.infer<typeof FileNodeSchema>;
export type DependencyEdge = z.infer<typeof DependencyEdgeSchema>;
export type RepoMetadata = z.infer<typeof RepoMetadataSchema>;
export type Skeleton = z.infer<typeof SkeletonSchema>;

