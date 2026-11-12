export type StepStatus = 'completed' | 'active' | 'queued' | 'failed';

export interface PipelineStep {
  id: number;
  title: string;
  badgeText?: string;
  badgeStyle?: 'completed' | 'resolved' | 'processing' | 'queued';
  description: string;
  metric1?: string;
  metric2?: string;
  durationBadge?: string;
  subNote?: string;
  progressPercent?: number;
  hasWaveform?: boolean;
}

export interface TelemetryLogLine {
  id: string;
  timestamp: string;
  tag: string;
  tagStyle: string;
  message: string;
  isHeartbeat?: boolean;
}

export interface AstMetrics {
  activeNode: string;
  symbolCount: string;
  astDepth: string;
}

export interface ActiveJob {
  jobId: string;
  repoName: string;
  branch: string;
  commitSha?: string;
  currentStageIndex: number;
  totalStages: number;
  progressPercent?: number;
  streamType?: string;
  activeModelNode?: string;
  videoUrl?: string | null;
  videoDurationSec?: number;
  videoSizeMb?: string;
}

export interface FileNodeItem {
  id: string;
  path: string;
  extension: string;
  loc: number;
  sizeBytes: number;
  isEntryPoint: boolean;
  role: "entry" | "core" | "utility" | "route" | "config" | "docs" | "other";
  snippetIds?: string[];
}

export interface SkeletonData {
  repo: {
    name: string;
    url: string;
    commitSha: string;
    branch: string;
    detectedLanguages: string[];
    detectedFrameworks: string[];
    totalFiles: number;
    totalLinesOfCode: number;
    readmeExcerpt?: string;
  };
  entryPoints: string[];
  files: FileNodeItem[];
  snippets: Array<{
    id: string;
    fileId: string;
    filePath: string;
    title: string;
    startLine: number;
    endLine: number;
    code: string;
  }>;
  dependencyEdges: Array<{
    sourceFileId: string;
    sourcePath: string;
    importedTarget: string;
  }>;
  summary?: string;
}
