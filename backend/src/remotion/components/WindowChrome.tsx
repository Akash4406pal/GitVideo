import React from "react";

interface WindowChromeProps {
  title: string;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
}

export const WindowChrome: React.FC<WindowChromeProps> = ({
  title,
  children,
  width = "90%",
  height = "78%",
}) => {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#161b22",
        borderRadius: "14px",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.65), 0 0 1px rgba(255, 255, 255, 0.15)",
        border: "1px solid #30363d",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Title Bar with macOS Traffic Lights */}
      <div
        style={{
          height: "44px",
          backgroundColor: "#0d1117",
          borderBottom: "1px solid #21262d",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#ff5f56",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#ffbd2e",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#27c93f",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#8b949e",
            fontSize: "14px",
            fontFamily: "monospace",
            fontWeight: 500,
            pointerEvents: "none",
          }}
        >
          {title}
        </div>
      </div>

      {/* Main Body */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
          display: "flex",
        }}
      >
        {children}
      </div>
    </div>
  );
};

