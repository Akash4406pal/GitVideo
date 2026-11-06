import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { WindowChrome } from "../components/WindowChrome.js";
import type { Skeleton } from "../../types/skeleton.js";
import type { Scene } from "../../types/storyboard.js";

interface Scene3Props {
  skeleton: Skeleton;
  scene: Scene;
}

export const Scene3_CodeFocus: React.FC<Scene3Props> = ({ skeleton, scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Find target snippet based on segment focus, or fallback to first snippet
  const targetSnippetId = scene.segments[0]?.focus?.snippetId;
  const snippet = skeleton.snippets.find((s) => s.id === targetSnippetId) || skeleton.snippets[0];

  const highlightLines = new Set(scene.segments[0]?.focus?.highlightLines || [1, 2, 3]);

  // Subtle camera push-in
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.03], {
    extrapolateRight: "clamp",
  });

  const lines = snippet ? snippet.code.split("\n").slice(0, 16) : ["// No snippet found"];
  const startLineNumber = snippet?.startLine || 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d1117",
        backgroundImage: `
          radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 40%)
        `,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f0f6fc",
        padding: "20px",
      }}
    >
      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 6px 0" }}>
          {scene.title || "Core Implementation"}
        </h2>
        <span style={{ color: "#8b949e", fontSize: "16px" }}>
          Ground-truth inspection: {snippet?.filePath || "source code"}
        </span>
      </div>

      <div
        style={{
          width: "90%",
          height: "72%",
          transform: `scale(${cameraScale})`,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <WindowChrome title={snippet?.filePath || "Code Inspection"} width="100%" height="100%">
          <div
            style={{
              flex: 1,
              backgroundColor: "#0d1117",
              padding: "16px 0",
              overflowY: "hidden",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {lines.map((line, idx) => {
              const currentLineNumber = startLineNumber + idx;
              const isHighlighted = highlightLines.has(idx + 1) || highlightLines.has(currentLineNumber);

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1px 18px",
                    backgroundColor: isHighlighted ? "rgba(56, 189, 248, 0.12)" : "transparent",
                    borderLeft: isHighlighted ? "4px solid #38bdf8" : "4px solid transparent",
                    opacity: isHighlighted ? 1 : 0.6,
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      width: "40px",
                      textAlign: "right",
                      marginRight: "18px",
                      color: isHighlighted ? "#38bdf8" : "#484f58",
                      userSelect: "none",
                      fontSize: "13px",
                      fontWeight: isHighlighted ? 700 : 400,
                    }}
                  >
                    {currentLineNumber}
                  </span>
                  <span
                    style={{
                      color: isHighlighted ? "#f0f6fc" : "#c9d1d9",
                      whiteSpace: "pre",
                    }}
                  >
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </WindowChrome>
      </div>
    </div>
  );
};

