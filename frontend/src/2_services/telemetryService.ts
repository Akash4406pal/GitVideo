import { TelemetryLogLine } from '../1_domain/pipeline';

export const INITIAL_BUFFER_LOGS: TelemetryLogLine[] = [
  {
    id: 'l1',
    timestamp: '00:00.012',
    tag: 'git',
    tagStyle: 'bg-secondary-container/30 text-secondary',
    message: 'shallow_clone url="https://github.com/Akash4406pal/GitVideo" depth=1 ref="8994781"',
  },
  {
    id: 'l2',
    timestamp: '00:00.134',
    tag: 'git',
    tagStyle: 'bg-secondary-container/30 text-secondary',
    message: 'unpack_objects: 100% (36/36 files) tree filtering applied',
  },
  {
    id: 'l3',
    timestamp: '00:00.141',
    tag: 'analyzer',
    tagStyle: 'bg-tertiary-container/30 text-tertiary',
    message: 'manifest_scan: detected TypeScript, Next.js, React, TailwindCSS',
  },
  {
    id: 'l4',
    timestamp: '00:00.320',
    tag: 'analyzer',
    tagStyle: 'bg-tertiary-container/30 text-tertiary',
    message: 'parsed backend/src/analyzer/skeletonBuilder.ts in 24ms',
  },
  {
    id: 'l5',
    timestamp: '00:00.610',
    tag: 'graph',
    tagStyle: 'bg-primary-container/30 text-primary',
    message: 'construct_dag: module dependency graph (depth: 4, nodes: 36, edges: 18)',
  },
  {
    id: 'l6',
    timestamp: '00:00.852',
    tag: 'skeleton',
    tagStyle: 'bg-primary-container/30 text-primary',
    message: 'skeleton_compiled: 36 files indexed, 12 line-accurate snippets extracted',
  },
  {
    id: 'l7',
    timestamp: '00:01.011',
    tag: 'bharatcode',
    tagStyle: 'bg-secondary-container/40 text-secondary',
    message: 'prompt_eval dispatch -> bharatcode-ai/qwen-3.8-27b tokens=2840',
  },
  {
    id: 'l8',
    timestamp: '00:03.240',
    tag: 'bharatcode',
    tagStyle: 'bg-secondary-container/40 text-secondary',
    message: "Scene 1 generated (Scene: 'Hook & Core Purpose') 15.0s audio duration",
  },
  {
    id: 'l9',
    timestamp: '00:08.712',
    tag: 'bharatcode',
    tagStyle: 'bg-secondary-container/40 text-secondary',
    message: 'Scene 2 streaming narrative tokens (chunk 34/58, "Entrypoint & AST Flow")',
  },
  {
    id: 'l10',
    timestamp: '00:31.480',
    tag: 'worker-01',
    tagStyle: 'bg-tertiary-container/40 text-tertiary',
    message: 'telemetry heartbeat: memory_rss=142MB cpu=18.4%',
    isHeartbeat: true,
  },
];

export class TelemetryService {
  static async copyBuffer(logs: TelemetryLogLine[]): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
    const text = logs.map((l) => `[${l.timestamp}] [${l.tag}] ${l.message}`).join('\n');
    await navigator.clipboard.writeText(text);
    return true;
  }
}
