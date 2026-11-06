import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { WindowChrome } from "../components/WindowChrome.js";
import type { Skeleton } from "../../types/skeleton.js";
import type { Scene } from "../../types/storyboard.js";

interface Scene4Props {
  skeleton: Skeleton;
  scene: Scene;
}

export const Scene4_DependencyGraph: React.FC<Scene4Props> = ({ skeleton, scene }) => {
  const frame = useCurrentFrame();

  const edges = skeleton.dependencyEdges.slice(0, 6);

  // Collect unique files in the edges
  const activeNodes = Array.from(
    new Set(edges.flatMap((e) => [e.sourcePath, e.importedTarget]))
  ).slice(0, 6);

  const pulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.85, 1.15]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d1117",
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.12) 0%, transparent 60%)
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
          {scene.title || "Architecture & Dependency Graph"}
        </h2>
        <span style={{ color: "#8b949e", fontSize: "16px" }}>
          Module import dependencies & component topology
        </span>
      </div>

      <WindowChrome title="Architecture Graph" width="85%" height="70%">
        <div
          style={{
            flex: 1,
            backgroundColor: "#0d1117",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Top Tier Nodes */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
            {activeNodes.slice(0, 3).map((node, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  transform: i === 0 ? `scale(${pulse})` : "none",
                  borderColor: i === 0 ? "#58a6ff" : "#30363d",
                }}
              >
                <span style={{ color: "#58a6ff" }}>📦</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#e6edf3" }}>
                  {node}
                </span>
              </div>
            ))}
          </div>

          {/* Central Connecting Flow Indicators */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "30px",
              color: "#58a6ff",
              fontSize: "20px",
            }}
          >
            <span>↓</span>
            <span style={{ fontSize: "12px", color: "#8b949e", textTransform: "uppercase", letterSpacing: "1px" }}>
              Import Flow
            </span>
            <span>↓</span>
          </div>

          {/* Bottom Tier Nodes */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
            {activeNodes.slice(3, 6).map((node, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                <span style={{ color: "#a371f7" }}>⚙️</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#e6edf3" }}>
                  {node}
                </span>
              </div>
            ))}
          </div>
        </div>
      </WindowChrome>
    </div>
  );
};

