import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Skeleton } from "../../types/skeleton.js";
import type { Scene } from "../../types/storyboard.js";

interface Scene1Props {
  skeleton: Skeleton;
  scene: Scene;
}

export const Scene1_Title: React.FC<Scene1Props> = ({ skeleton, scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badgesOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const languages = skeleton.repo.detectedLanguages || [];
  const frameworks = skeleton.repo.detectedFrameworks || [];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d1117",
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)
        `,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#f0f6fc",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Header Tag */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "6px 16px",
          backgroundColor: "rgba(33, 38, 45, 0.8)",
          borderRadius: "20px",
          border: "1px solid rgba(88, 166, 255, 0.3)",
          fontSize: "14px",
          fontWeight: 600,
          color: "#58a6ff",
          letterSpacing: "0.5px",
          marginBottom: "24px",
          opacity: titleSpring,
        }}
      >
        <span style={{ fontSize: "16px" }}>⚡</span> GITVIDEO CODEBASE EXPLAINER
      </div>

      {/* Main Repository Title */}
      <h1
        style={{
          fontSize: "72px",
          fontWeight: 800,
          margin: 0,
          textAlign: "center",
          letterSpacing: "-1.5px",
          background: "linear-gradient(135deg, #ffffff 40%, #a5d6ff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          transform: `scale(${titleSpring})`,
          textShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        {skeleton.repo.name}
      </h1>

      {/* Dynamic Tagline from Storyboard Scene */}
      <p
        style={{
          fontSize: "24px",
          color: "#8b949e",
          maxWidth: "750px",
          textAlign: "center",
          marginTop: "16px",
          marginBottom: "36px",
          lineHeight: 1.5,
          opacity: subtitleOpacity,
        }}
      >
        {scene.description || `AI-powered architectural walkthrough of ${skeleton.repo.name}`}
      </p>

      {/* Tech Stack Pills & Metrics */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "800px",
          opacity: badgesOpacity,
        }}
      >
        {languages.map((lang) => (
          <span
            key={lang}
            style={{
              padding: "8px 18px",
              backgroundColor: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              borderRadius: "8px",
              color: "#38bdf8",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {lang}
          </span>
        ))}

        {frameworks.map((fw) => (
          <span
            key={fw}
            style={{
              padding: "8px 18px",
              backgroundColor: "rgba(168, 85, 247, 0.12)",
              border: "1px solid rgba(168, 85, 247, 0.35)",
              borderRadius: "8px",
              color: "#c084fc",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {fw}
          </span>
        ))}

        <span
          style={{
            padding: "8px 18px",
            backgroundColor: "rgba(34, 197, 94, 0.12)",
            border: "1px solid rgba(34, 197, 94, 0.35)",
            borderRadius: "8px",
            color: "#4ade80",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          {skeleton.repo.totalLinesOfCode.toLocaleString()} LOC
        </span>

        <span
          style={{
            padding: "8px 18px",
            backgroundColor: "rgba(251, 191, 36, 0.12)",
            border: "1px solid rgba(251, 191, 36, 0.35)",
            borderRadius: "8px",
            color: "#fbbf24",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          {skeleton.repo.totalFiles} Files
        </span>
      </div>

      {/* Bottom Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#484f58",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.5px",
        }}
      >
        <span>BHARATCODE BUILD LEAGUE 2026</span>
        <span>•</span>
        <span>POWERED BY QWEN-3.8-27B</span>
      </div>
    </div>
  );
};

