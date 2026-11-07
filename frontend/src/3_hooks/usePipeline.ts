"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveJob, PipelineStep, AstMetrics, TelemetryLogLine } from '../1_domain/pipeline';
import { INITIAL_BUFFER_LOGS, TelemetryService } from '../2_services/telemetryService';

const DEFAULT_JOB: ActiveJob = {
  jobId: '#gv-2026',
  repoName: 'GitVideo',
  branch: 'main',
  commitSha: '6bb0c7a2',
  currentStageIndex: 5,
  totalStages: 5,
  progressPercent: 100,
  videoUrl: '/api/video',
  videoDurationSec: 56.9,
  videoSizeMb: '5.49',
};

const INITIAL_STEPS: PipelineStep[] = [
  {
    id: 1,
    title: '1. Cloning Sandbox & Ingestion',
    badgeText: 'COMPLETED',
    badgeStyle: 'completed',
    description: 'Shallow clone depth=1 on ephemeral ramdisk. Git tree indexed into memory.',
    metric1: '130ms',
    metric2: '64 files indexed',
  },
  {
    id: 2,
    title: '2. Analyzing AST & Dependency Graph',
    badgeText: 'RESOLVED',
    badgeStyle: 'resolved',
    description: 'Manifest scanner & AST extractor indexed imports, frameworks, and snippet boundaries.',
    metric1: '6735 LOC',
    metric2: 'TS/JS Stack',
  },
  {
    id: 3,
    title: '3. Drafting Storyboard Narrative',
    badgeText: 'RESOLVED',
    badgeStyle: 'resolved',
    description: 'BharatCode AI Engine: Generating 5-scene architectural script using qwen-3.8-27b.',
    metric1: 'qwen-3.8-27b',
    metric2: '5 Scenes',
  },
  {
    id: 4,
    title: '4. Synthesizing Audio Narration',
    badgeText: 'RESOLVED',
    badgeStyle: 'resolved',
    description: 'Neural Edge TTS voice synthesis with audio sync alignment & exact durations.',
    metric1: 'Neural TTS',
    metric2: '5 MP3 Clips',
  },
  {
    id: 5,
    title: '5. Rendering Remotion Video',
    badgeText: 'COMPLETED',
    badgeStyle: 'completed',
    description: 'Remotion React compositions rendered headlessly via Chromium @ 720p 30fps.',
    metric1: '720p30 H.264',
    metric2: '56.9s MP4',
  },
];

const DEFAULT_AST: AstMetrics = {
  activeNode: 'backend/src/index.ts',
  symbolCount: '64 Files / 12 Snippets',
  astDepth: '4 Levels',
};

export function usePipeline() {
  const [job, setJob] = useState<ActiveJob>(DEFAULT_JOB);
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [astMetrics, setAstMetrics] = useState<AstMetrics>(DEFAULT_AST);
  const [logs, setLogs] = useState<TelemetryLogLine[]>(INITIAL_BUFFER_LOGS);

  const [seconds, setSeconds] = useState(0);
  const [millis, setMillis] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Check existing pipeline status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/pipeline/status');
        if (res.ok) {
          const data = await res.json();
          if (data.skeleton) {
            const repo = data.skeleton.repo;
            setJob((prev) => ({
              ...prev,
              repoName: repo.name || prev.repoName,
              commitSha: repo.commitSha?.substring(0, 8) || prev.commitSha,
              videoUrl: data.hasVideo ? '/api/video' : null,
              videoDurationSec: data.videoStats?.durationSec || 56.9,
              videoSizeMb: data.videoStats?.sizeMb || '5.49',
              progressPercent: data.hasVideo ? 100 : 80,
            }));

            setAstMetrics({
              activeNode: data.skeleton.entryPoints?.[0] || 'index.ts',
              symbolCount: `${repo.totalFiles} Files / ${data.skeleton.snippets?.length || 0} Snippets`,
              astDepth: '4 Levels',
            });
          }
        }
      } catch {}
    }

    checkStatus();
  }, []);

  // Timer interval while running
  useEffect(() => {
    if (!isRunning) return;

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
  }, [isRunning]);

  const copyLogs = useCallback(async () => {
    const success = await TelemetryService.copyBuffer(logs);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [logs]);

  const cancelJob = useCallback(() => {
    if (confirm(`Cancel pipeline execution for Job ${job.jobId}?`)) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsCancelling(true);
      setIsRunning(false);
    }
  }, [job.jobId]);

  // 2. Real pipeline runner connecting to /api/pipeline/run
  const analyzeRepo = useCallback(async (rawUrl: string, skipRender = false) => {
    const cleanName = rawUrl
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .trim() || 'target-repo';

    const newJobId = `#gv-${Math.floor(1000 + Math.random() * 9000)}`;

    setJob({
      jobId: newJobId,
      repoName: cleanName,
      branch: 'main',
      commitSha: 'HEAD',
      currentStageIndex: 1,
      totalStages: 5,
      progressPercent: 5,
      videoUrl: null,
    });

    setSteps([
      {
        id: 1,
        title: '1. Ingesting & Sandbox Setup',
        badgeText: 'PROCESSING',
        badgeStyle: 'processing',
        description: `Resolving repository ${cleanName}...`,
      },
      {
        id: 2,
        title: '2. Analyzing AST & Dependency Graph',
        badgeText: 'QUEUED',
        badgeStyle: 'queued',
        description: 'AST & snippet extractor queued.',
      },
      {
        id: 3,
        title: '3. BharatCode Storyboard Generation',
        badgeText: 'QUEUED',
        badgeStyle: 'queued',
        description: 'Grounded narrative synthesis via qwen-3.8-27b.',
      },
      {
        id: 4,
        title: '4. Voiceover & Audio Synthesis',
        badgeText: 'QUEUED',
        badgeStyle: 'queued',
        description: 'Neural TTS speech generation.',
      },
      {
        id: 5,
        title: '5. Remotion Video Rendering',
        badgeText: skipRender ? 'SKIPPED' : 'QUEUED',
        badgeStyle: 'queued',
        description: skipRender ? 'Skipped via fast mode.' : 'Chromium headless MP4 renderer.',
      },
    ]);

    setLogs([
      {
        id: `log-${Date.now()}-0`,
        timestamp: '00:00.000',
        tag: 'pipeline',
        tagStyle: 'bg-primary-container/30 text-primary',
        message: `Initiating pipeline for target: "${rawUrl}" (skipRender=${skipRender})`,
      },
    ]);

    setSeconds(0);
    setMillis(0);
    setIsRunning(true);
    setIsCancelling(false);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: rawUrl, skipRender }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errMessage = `Request failed (${response.status})`;
        try {
          const errData = await response.json();
          errMessage = errData.message || errData.error || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      if (!response.body) {
        throw new Error('No readable stream returned by API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = 'message';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.replace('event: ', '').trim();
            } else if (line.startsWith('data: ')) {
              eventData = line.replace('data: ', '').trim();
            }
          }

          if (eventData) {
            try {
              const parsed = JSON.parse(eventData);

              if (eventType === 'log') {
                setLogs((prev) => [
                  ...prev.slice(-60),
                  {
                    id: `log-${Date.now()}-${Math.random()}`,
                    timestamp: parsed.timestamp || '00:00.000',
                    tag: parsed.isError ? 'error' : 'worker',
                    tagStyle: parsed.isError ? 'bg-error-container/40 text-error' : 'bg-surface-container-high text-on-surface-variant',
                    message: parsed.line,
                  },
                ]);
              } else if (eventType === 'stage') {
                setJob((prev) => ({
                  ...prev,
                  currentStageIndex: parsed.stageIndex || prev.currentStageIndex,
                  progressPercent: parsed.percent || prev.progressPercent,
                }));

                // Update stepper badges
                setSteps((prevSteps) =>
                  prevSteps.map((step) => {
                    if (step.id < parsed.stageIndex) {
                      return { ...step, badgeText: 'COMPLETED', badgeStyle: 'completed' };
                    }
                    if (step.id === parsed.stageIndex) {
                      return { ...step, badgeText: 'PROCESSING', badgeStyle: 'processing' };
                    }
                    return step;
                  })
                );
              } else if (eventType === 'complete') {
                setIsRunning(false);
                setJob((prev) => ({
                  ...prev,
                  progressPercent: 100,
                  currentStageIndex: 5,
                  videoUrl: parsed.videoUrl || '/api/video',
                }));

                setSteps((prevSteps) =>
                  prevSteps.map((s) => ({ ...s, badgeText: 'COMPLETED', badgeStyle: 'completed' }))
                );
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setLogs((prev) => [
          ...prev,
          {
            id: `log-err-${Date.now()}`,
            timestamp: '00:00.000',
            tag: 'error',
            tagStyle: 'bg-error-container/40 text-error',
            message: `Pipeline error: ${err.message}`,
          },
        ]);
      }
    } finally {
      setIsRunning(false);
    }
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedTimer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;

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
