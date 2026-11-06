import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface SubtitleOverlayProps {
  text: string;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ text }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [0, 8], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!text) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "36px",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 50,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          backgroundColor: "rgba(13, 17, 23, 0.88)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "12px",
          padding: "12px 28px",
          color: "#f0f6fc",
          fontSize: "20px",
          fontWeight: 500,
          lineHeight: 1.45,
          textAlign: "center",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#58a6ff",
            boxShadow: "0 0 10px #58a6ff",
          }}
        />
        <span>{text}</span>
      </div>
    </div>
  );
};

