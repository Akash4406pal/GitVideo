import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { WindowChrome } from "../components/WindowChrome.js";
import type { Skeleton } from "../../types/skeleton.js";
import type { Scene } from "../../types/storyboard.js";

interface Scene2Props {
  skeleton: Skeleton;
  scene: Scene;
}

export const Scene2_FileTree: React.FC<Scene2Props> = ({ skeleton, scene }) => {
  const frame = useCurrentFrame();

  const containerOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const files = skeleton.files.slice(0, 10);
  const entryPointSet = new Set(skeleton.entryPoints);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d1117",
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)
        `,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f0f6fc",
        padding: "20px",
        opacity: containerOpacity,
      }}
    >
      <div style={{ marginBottom: "18px", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 6px 0" }}>
          {scene.title || "Project Structure & Entrypoints"}
        </h2>
        <span style={{ color: "#8b949e", fontSize: "16px" }}>
          Key source files and organizational layout ({skeleton.repo.totalFiles} files total)
        </span>
      </div>

      <WindowChrome title={`Explorer: ${skeleton.repo.name}`} width="85%" height="70%">
        <div
          style={{
            flex: 1,
            backgroundColor: "#0d1117",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            overflowY: "hidden",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        >
          {files.map((file, idx) => {
            const isEntry = file.isEntryPoint || entryPointSet.has(file.path);

            const itemDelay = idx * 3;
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemTranslateX = interpolate(frame, [itemDelay, itemDelay + 10], [-15, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={file.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  backgroundColor: isEntry ? "rgba(35, 134, 54, 0.15)" : idx % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "transparent",
                  border: isEntry ? "1px solid rgba(46, 160, 67, 0.4)" : "1px solid transparent",
                  opacity: itemOpacity,
                  transform: `translateX(${itemTranslateX}px)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px" }}>{isEntry ? "⚡" : "📄"}</span>
                  <span
                    style={{
                      fontSize: "15px",
                      color: isEntry ? "#56d364" : "#e6edf3",
                      fontWeight: isEntry ? 600 : 400,
                    }}
                  >
                    {file.path}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {isEntry && (
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "rgba(35, 134, 54, 0.3)",
                        border: "1px solid #3fb950",
                        borderRadius: "12px",
                        color: "#3fb950",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Entry Point
                    </span>
                  )}
                  <span style={{ color: "#8b949e", fontSize: "13px" }}>
                    {file.loc} lines
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </WindowChrome>
    </div>
  );
};

