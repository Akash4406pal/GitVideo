import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WindowChrome } from "../components/WindowChrome.js";
import type { Skeleton } from "../../types/skeleton.js";
import type { Scene } from "../../types/storyboard.js";

interface Scene3Props {
  skeleton: Skeleton;
  scene: Scene;
}

// Simple deterministic syntax highlighter for high-speed offline Remotion rendering
function highlightSyntax(code: string): React.ReactNode {
  // Regex token matching for keywords, strings, comments, numbers
  const tokens = code.split(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|export|from|default|const|let|var|function|return|async|await|class|extends|if|else|switch|case|break|try|catch|finally|throw|new|typeof|instanceof)\b|\b\d+\b)/g);

  return tokens.map((token, i) => {
    if (!token) return null;
    if (token.startsWith("//") || token.startsWith("/*")) {
      return <span key={i} style={{ color: "#7ee787", fontStyle: "italic" }}>{token}</span>;
    }
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'")) || (token.startsWith("`") && token.endsWith("`"))) {
      return <span key={i} style={{ color: "#a5d6ff" }}>{token}</span>;
    }
    if (/^\b(?:import|export|from|default|const|let|var|function|return|async|await|class|extends|if|else|switch|case|break|try|catch|finally|throw|new|typeof|instanceof)\b$/.test(token)) {
      return <span key={i} style={{ color: "#ff7b72", fontWeight: 600 }}>{token}</span>;
    }
    if (/^\b\d+\b$/.test(token)) {
      return <span key={i} style={{ color: "#79c0ff" }}>{token}</span>;
    }
    return <span key={i} style={{ color: "#e6edf3" }}>{token}</span>;
  });
}

export const Scene3_CodeFocus: React.FC<Scene3Props> = ({ skeleton, scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Find target snippet based on segment focus, or fallback to first snippet
  const targetSnippetId = scene.segments[0]?.focus?.snippetId;
  const snippet = skeleton.snippets.find((s) => s.id === targetSnippetId) || skeleton.snippets[0];

  const highlightLines = new Set(scene.segments[0]?.focus?.highlightLines || [1, 2, 3]);

  // Spring physics "Code Camera" - smooth entrance zoom
  const cameraEntrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 80 },
  });

  // Continuous subtle cinematic pan-in over scene duration
  const subtlePan = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateRight: "clamp",
  });

  const totalCameraScale = cameraEntrance * subtlePan;

  // Active cursor blink
  const cursorOpacity = Math.sin((frame / fps) * 6) > 0 ? 1 : 0;

  const lines = snippet ? snippet.code.split("\n").slice(0, 16) : ["// No snippet found"];
  const startLineNumber = snippet?.startLine || 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#080b10",
        backgroundImage: `
          radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 45%),
          radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 45%)
        `,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f0f6fc",
        padding: "24px",
        overflow: "hidden",
      }}
    >
      {/* Scene Header */}
      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#38bdf8" }} />
          <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "1px" }}>
            GROUND-TRUTH AST INSPECTION
          </span>
        </div>
        <h2 style={{ fontSize: "30px", fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
          {scene.title || "Core Architecture Implementation"}
        </h2>
        <span style={{ color: "#8b949e", fontSize: "15px", fontFamily: "monospace" }}>
          {snippet?.filePath || "source code"}
        </span>
      </div>

      {/* Code Camera Viewport */}
      <div
        style={{
          width: "92%",
          height: "74%",
          transform: `scale(${totalCameraScale})`,
          display: "flex",
          justifyContent: "center",
          transition: "transform 0.1s ease-out",
        }}
      >
        <WindowChrome title={snippet?.filePath || "Code Inspection"} width="100%" height="100%">
          <div
            style={{
              flex: 1,
              backgroundColor: "#0b0e14",
              padding: "18px 0",
              overflowY: "hidden",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              fontSize: "14px",
              lineHeight: 1.65,
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
                    padding: "2px 20px",
                    backgroundColor: isHighlighted ? "rgba(56, 189, 248, 0.14)" : "transparent",
                    borderLeft: isHighlighted ? "4px solid #38bdf8" : "4px solid transparent",
                    opacity: isHighlighted ? 1 : 0.65,
                    filter: isHighlighted ? "none" : "blur(0.2px)",
                    boxShadow: isHighlighted ? "inset 0 0 20px rgba(56, 189, 248, 0.08)" : "none",
                  }}
                >
                  <span
                    style={{
                      width: "42px",
                      textAlign: "right",
                      marginRight: "20px",
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
                      whiteSpace: "pre",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {highlightSyntax(line)}
                    {isHighlighted && idx === 0 && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "8px",
                          height: "15px",
                          backgroundColor: "#38bdf8",
                          marginLeft: "4px",
                          opacity: cursorOpacity,
                        }}
                      />
                    )}
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
