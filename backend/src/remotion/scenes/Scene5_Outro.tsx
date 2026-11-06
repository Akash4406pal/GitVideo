import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WindowChrome } from "../components/WindowChrome.js";
import type { Skeleton } from "../../types/skeleton.js";
import type { Scene } from "../../types/storyboard.js";

interface Scene5Props {
  skeleton: Skeleton;
  scene: Scene;
}

export const Scene5_Outro: React.FC<Scene5Props> = ({ skeleton, scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const ctaOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const repoUrl = skeleton.repo.url || `https://github.com/example/${skeleton.repo.name}`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d1117",
        backgroundImage: `
          radial-gradient(circle at 50% 30%, rgba(34, 197, 94, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 50% 80%, rgba(56, 189, 248, 0.12) 0%, transparent 60%)
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
      <div
        style={{
          transform: `scale(${entrance})`,
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 800,
            margin: "0 0 10px 0",
            background: "linear-gradient(135deg, #ffffff 40%, #7ee787 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Explore {skeleton.repo.name}
        </h1>
        <p style={{ color: "#8b949e", fontSize: "18px", margin: 0 }}>
          {scene.description || "Start building, contributing, or exploring today"}
        </p>
      </div>

      <WindowChrome title="Terminal: Quickstart" width="70%" height="40%">
        <div
          style={{
            flex: 1,
            backgroundColor: "#0d1117",
            padding: "20px 24px",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ color: "#8b949e" }}># 1. Clone the repository</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#7ee787" }}>➜</span>
            <span style={{ color: "#58a6ff" }}>git clone</span>
            <span style={{ color: "#f0f6fc" }}>{repoUrl}</span>
          </div>

          <div style={{ color: "#8b949e", marginTop: "6px" }}># 2. Install dependencies & run</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#7ee787" }}>➜</span>
            <span style={{ color: "#f0f6fc" }}>cd {skeleton.repo.name} && npm install && npm run dev</span>
          </div>
        </div>
      </WindowChrome>

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          opacity: ctaOpacity,
        }}
      >
        <div
          style={{
            padding: "10px 22px",
            backgroundColor: "#238636",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "15px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⭐</span> Star on GitHub
        </div>

        <div
          style={{
            padding: "10px 22px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid #30363d",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "15px",
            color: "#c9d1d9",
          }}
        >
          GitVideo Engine
        </div>
      </div>
    </div>
  );
};

