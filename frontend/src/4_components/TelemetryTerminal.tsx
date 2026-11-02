"use client";

import React, { useRef, useEffect } from 'react';
import { TelemetryLogLine } from '../1_domain/pipeline';

interface TelemetryTerminalProps {
  logs: TelemetryLogLine[];
  onCopy: () => void;
  copied: boolean;
}

export function TelemetryTerminal({ logs, onCopy, copied }: TelemetryTerminalProps) {
  const bufferRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bufferRef.current) {
      bufferRef.current.scrollTop = bufferRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="rounded-xl bg-surface-container-lowest shadow-2xl overflow-hidden flex flex-col h-[480px]">
      <div className="h-10 px-space-md bg-surface-container-low flex items-center justify-between shrink-0">
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <div className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></div>
            <div className="w-3 h-3 rounded-full bg-tertiary"></div>
          </div>
          <span className="font-code-sm text-code-sm text-on-surface-variant ml-2 font-medium">
            gitvideo-telemetry.log
          </span>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            onClick={onCopy}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Copy Log Buffer"
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-highest text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label-uppercase text-label-uppercase">TAIL</span>
          </div>
        </div>
      </div>

      <div
        ref={bufferRef}
        className="flex-1 p-space-md overflow-y-auto font-code-sm text-code-sm space-y-2 select-text leading-relaxed"
      >
        {logs.map((log) => {
          if (log.isHeartbeat) {
            return (
              <div key={log.id} className="text-tertiary flex items-center gap-1">
                <span>[{log.timestamp}]</span>
                <span className={`px-1 rounded ${log.tagStyle}`}>[{log.tag}]</span>
                <span>{log.message}</span>
                <span className="inline-block w-2 h-4 bg-tertiary animate-pulse ml-1"></span>
              </div>
            );
          }
          return (
            <div key={log.id} className="text-outline">
              [{log.timestamp}]{' '}
              <span className={`px-1 rounded ${log.tagStyle}`}>[{log.tag}]</span>{' '}
              <span className="text-on-surface-variant">{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
