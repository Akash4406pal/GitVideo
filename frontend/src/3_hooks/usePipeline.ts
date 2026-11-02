"use client";

import { useState, useEffect, useCallback } from 'react';
import { ActiveJob, PipelineStep, AstMetrics, TelemetryLogLine } from '../1_domain/pipeline';
import { INITIAL_BUFFER_LOGS, TelemetryService } from '../2_services/telemetryService';

const DEFAULT_JOB: ActiveJob = {
  jobId: '#gv-2026',
  repoName: 'Akash4406pal/GitVideo',
  branch: 'main',
  commitSha: '8994781',
  currentStageIndex: 3,
  totalStages: 5,
  progressPercent: 78,
};

const DEFAULT_STEPS: PipelineStep[] = [
  {
    id: 1,
    title: '1. Cloning Sandbox & Ingestion',
    badgeText: 'COMPLETED',
    badgeStyle: 'completed',
    description: 'Shallow clone depth=1 on ephemeral ramdisk. Git tree indexed into memory.',
    metric1: '130ms',
    metric2: '36 files indexed',
  },
  {
    id: 2,
    title: '2. Analyzing AST & Dependency Graph',
    badgeText: 'RESOLVED',
    badgeStyle: 'resolved',
    description: 'Manifest scanner & AST extractor indexed imports, frameworks, and snippet boundaries.',
    metric1: '3582 LOC',
    metric2: 'TS/JS Stack',
  },
  {
    id: 3,
    title: '3. Drafting Storyboard Narrative',
    badgeText: 'PROCESSING',
    badgeStyle: 'processing',
    description: 'BharatCode AI Engine: Generating 5-scene architectural script using qwen-3.8-27b.',
    metric1: 'qwen-3.8-27b',
    metric2: 'Temp 0.3',
    progressPercent: 78,
    hasWaveform: true,
    subNote: 'Scene 2: Entrypoint & AST Flow',
  },
  {
    id: 4,
    title: '4. Synthesizing Audio Narration',
    badgeText: 'QUEUED',
    badgeStyle: 'queued',
    description: 'Piper neural TTS with voice model en_US-lessac-high. Audio sync alignment.',
    metric1: 'Piper TTS',
    metric2: '48kHz WAV',
  },
  {
    id: 5,
    title: '5. Rendering Remotion Video',
    badgeText: 'QUEUED',
    badgeStyle: 'queued',
    description: 'Remotion composition with Shiki syntax highlight canvas & spring transitions.',
    metric1: '720p30 Remotion',
    metric2: 'H.264 MP4',
  },
];

const DEFAULT_AST: AstMetrics = {
  activeNode: 'skeletonBuilder.ts',
  symbolCount: '36 Files / 12 Snippets',
  astDepth: '4 Levels',
};

export function usePipeline() {
  const [job, setJob] = useState<ActiveJob>(DEFAULT_JOB);
  const [steps, setSteps] = useState<PipelineStep[]>(DEFAULT_STEPS);
  const [astMetrics, setAstMetrics] = useState<AstMetrics>(DEFAULT_AST);
  const [logs, setLogs] = useState<TelemetryLogLine[]>(INITIAL_BUFFER_LOGS);

  const [seconds, setSeconds] = useState(31);
  const [millis, setMillis] = useState(48);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  // High-precision millisecond telemetry timer
  useEffect(() => {
    if (isCancelling) return;

    const interval = setInterval(() => {
      setMillis((prev) => {
        const nextM = prev + 7;
        if (nextM >= 100) {
          setSeconds((s) => s + 1);
          return 0;
        }
        return nextM;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [isCancelling]);

  const copyLogs = useCallback(async () => {
    const success = await TelemetryService.copyBuffer(logs);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [logs]);

  const cancelJob = useCallback(() => {
    if (confirm(`Cancel pipeline execution for Job ${job.jobId}?`)) {
      setIsCancelling(true);
    }
  }, [job.jobId]);

  const analyzeRepo = useCallback((rawUrl: string) => {
    const cleanName = rawUrl
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .trim() || 'target-repo';

    const newJobId = `#gv-${Math.floor(1000 + Math.random() * 9000)}`;

    setJob((prev) => ({
      ...prev,
      jobId: newJobId,
      repoName: cleanName,
      commitSha: 'HEAD',
      currentStageIndex: 2,
      progressPercent: 45,
    }));

    setSeconds(0);
    setMillis(0);
    setIsCancelling(false);

    setLogs([
      {
        id: `log-${Date.now()}-1`,
        timestamp: '00:00.010',
        tag: 'git',
        tagStyle: 'bg-secondary-container/30 text-secondary',
        message: `shallow_clone target="${rawUrl}" depth=1`,
      },
      {
        id: `log-${Date.now()}-2`,
        timestamp: '00:00.145',
        tag: 'analyzer',
        tagStyle: 'bg-tertiary-container/30 text-tertiary',
        message: `tree_walk: filtering noise & scanning manifest files in ${cleanName}`,
      },
      {
        id: `log-${Date.now()}-3`,
        timestamp: '00:00.320',
        tag: 'analyzer',
        tagStyle: 'bg-tertiary-container/30 text-tertiary',
        message: 'language_detection: analyzing frameworks & package manifests',
      },
      {
        id: `log-${Date.now()}-4`,
        timestamp: '00:00.612',
        tag: 'graph',
        tagStyle: 'bg-primary-container/30 text-primary',
        message: 'import_resolver: building module dependency graph and entrypoint slice',
      },
      {
        id: `log-${Date.now()}-5`,
        timestamp: '00:00.910',
        tag: 'bharatcode',
        tagStyle: 'bg-secondary-container/40 text-secondary',
        message: 'dispatching skeleton.json to BharatCode AI (qwen-3.8-27b)...',
      },
    ]);

    setAstMetrics({
      activeNode: cleanName.includes('GitVideo') ? 'skeletonBuilder.ts' : 'index / app entry',
      symbolCount: 'AST Nodes extracted',
      astDepth: '3-5 Levels',
    });
  }, []);

  const formattedTimer = `00:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;

  return {
    job,
    steps,
    astMetrics,
    logs,
    formattedTimer,
    isDiffOpen,
    openDiff: () => setIsDiffOpen(true),
    closeDiff: () => setIsDiffOpen(false),
    isCancelling,
    cancelJob,
    analyzeRepo,
    copied,
    copyLogs,
  };
}
