"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
  className?: string;
  showMermaid?: boolean;
}

// GitHub Dark Alert Configuration
interface AlertConfig {
  type: "note" | "tip" | "important" | "warning" | "caution";
  title: string;
  icon: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

const ALERT_MAP: Record<string, AlertConfig> = {
  "[!note]": {
    type: "note",
    title: "Note",
    icon: "info",
    borderColor: "border-sky-500/40",
    bgColor: "bg-sky-950/20",
    textColor: "text-sky-200",
    iconColor: "text-sky-400",
  },
  "[!tip]": {
    type: "tip",
    title: "Tip",
    icon: "lightbulb",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-950/20",
    textColor: "text-emerald-200",
    iconColor: "text-emerald-400",
  },
  "[!important]": {
    type: "important",
    title: "Important",
    icon: "priority_high",
    borderColor: "border-purple-500/40",
    bgColor: "bg-purple-950/20",
    textColor: "text-purple-200",
    iconColor: "text-purple-400",
  },
  "[!warning]": {
    type: "warning",
    title: "Warning",
    icon: "warning",
    borderColor: "border-amber-500/40",
    bgColor: "bg-amber-950/20",
    textColor: "text-amber-200",
    iconColor: "text-amber-400",
  },
  "[!caution]": {
    type: "caution",
    title: "Caution",
    icon: "dangerous",
    borderColor: "border-rose-500/40",
    bgColor: "bg-rose-950/20",
    textColor: "text-rose-200",
    iconColor: "text-rose-400",
  },
};

/**
 * Interactive Mermaid Diagram Renderer
 */
function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"diagram" | "code">("diagram");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function renderMermaid() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#0d1117",
            primaryColor: "#7c3aed",
            primaryTextColor: "#f1f5f9",
            primaryBorderColor: "#a855f7",
            lineColor: "#c084fc",
            secondaryColor: "#1e1b4b",
            tertiaryColor: "#0f172a",
          },
          securityLevel: "loose",
        });

        const uniqueId = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, code.trim());
        if (isMounted) {
          setSvgContent(svg);
          setHasError(false);
        }
      } catch (err) {
        console.warn("[MarkdownViewer] Mermaid render fallback:", err);
        if (isMounted) {
          setHasError(true);
        }
      }
    }

    renderMermaid();
    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-2xl border border-purple-500/30 bg-[#0d1117] shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/5 text-xs font-mono">
        <div className="flex items-center gap-2 text-purple-300 font-medium">
          <span className="material-symbols-outlined text-sm text-purple-400">schema</span>
          <span>Mermaid Architecture Graph</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("diagram")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === "diagram" ? "bg-purple-600 text-white font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              Interactive Graph
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === "code" ? "bg-purple-600 text-white font-semibold" : "text-gray-400 hover:text-white"
              }`}
            >
              Source
            </button>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Copy Mermaid code"
          >
            <span className="material-symbols-outlined text-sm">{copied ? "done" : "content_copy"}</span>
          </button>
        </div>
      </div>

      {/* Diagram Body */}
      {viewMode === "diagram" && !hasError && svgContent ? (
        <div
          ref={containerRef}
          className="p-6 flex items-center justify-center overflow-x-auto min-h-[160px] [&>svg]:max-w-full [&>svg]:h-auto bg-gradient-to-b from-purple-950/10 to-transparent"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <pre className="p-4 font-mono text-xs text-purple-200 overflow-x-auto whitespace-pre bg-black/60">
          {code}
        </pre>
      )}
    </div>
  );
}

/**
 * Enhanced Code Block with 1-Click Copy and GitHub Dark theme
 */
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-white/10 bg-[#0d1117] shadow-lg overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/5 text-[11px] font-mono text-gray-400">
        <span className="uppercase tracking-wider font-semibold text-purple-300">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[13px]">{copied ? "done" : "content_copy"}</span>
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-gray-200 selection:bg-purple-500 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * GitHub Flavored Markdown Viewer
 */
export function MarkdownViewer({
  content,
  className = "",
  showMermaid = true,
}: MarkdownViewerProps) {
  return (
    <div
      className={`github-markdown-body font-sans text-gray-300 text-xs sm:text-sm leading-relaxed max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // H1: Top-level document header
          h1({ children }) {
            return (
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight pb-3 mb-4 mt-6 border-b border-white/10 flex items-center gap-2">
                {children}
              </h1>
            );
          },
          // H2: Section header
          h2({ children }) {
            return (
              <h2 className="text-base sm:text-lg font-bold text-purple-300 tracking-tight pb-2 mb-3 mt-6 border-b border-white/5">
                {children}
              </h2>
            );
          },
          // H3: Sub-section header
          h3({ children }) {
            return (
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight mb-2 mt-4">
                {children}
              </h3>
            );
          },
          // H4-H6: Minor headers
          h4({ children }) {
            return (
              <h4 className="text-xs sm:text-sm font-semibold text-purple-200 uppercase tracking-wider mb-2 mt-3">
                {children}
              </h4>
            );
          },
          // Paragraph
          p({ children }) {
            return <p className="mb-3 leading-relaxed text-gray-300">{children}</p>;
          },
          // Strong / Bold
          strong({ children }) {
            return <strong className="font-bold text-white">{children}</strong>;
          },
          // Emphasis / Italic
          em({ children }) {
            return <em className="italic text-gray-200">{children}</em>;
          },
          // Lists
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-300 marker:text-purple-400">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-3 space-y-1 text-gray-300 marker:text-purple-400">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          // Blockquotes and GitHub Alerts
          blockquote({ children }: any) {
            // Check if this blockquote is a GitHub Alert
            let alertKey = "";
            const rawChildren = Array.isArray(children) ? children : [children];
            const firstChild = rawChildren[1] || rawChildren[0];

            if (firstChild && firstChild.props && firstChild.props.children) {
              const textContent = String(
                Array.isArray(firstChild.props.children)
                  ? firstChild.props.children[0]
                  : firstChild.props.children
              ).trim();

              const lower = textContent.toLowerCase();
              for (const key of Object.keys(ALERT_MAP)) {
                if (lower.startsWith(key)) {
                  alertKey = key;
                  break;
                }
              }
            }

            if (alertKey && ALERT_MAP[alertKey]) {
              const alert = ALERT_MAP[alertKey];
              return (
                <div
                  className={`my-4 p-4 rounded-2xl border ${alert.borderColor} ${alert.bgColor} ${alert.textColor} flex flex-col gap-1.5 shadow-sm`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <span className={`material-symbols-outlined text-sm ${alert.iconColor}`}>
                      {alert.icon}
                    </span>
                    <span>{alert.title}</span>
                  </div>
                  <div className="text-xs leading-relaxed opacity-95">
                    {children}
                  </div>
                </div>
              );
            }

            return (
              <blockquote className="my-3 border-l-4 border-purple-500/60 bg-purple-950/15 pl-4 py-2 rounded-r-xl text-xs sm:text-sm text-gray-300 italic shadow-inner">
                {children}
              </blockquote>
            );
          },
          // Code elements (inline vs block)
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "";
            const rawCode = String(children).replace(/\n$/, "");

            if (!inline && lang === "mermaid" && showMermaid) {
              return <MermaidDiagram code={rawCode} />;
            }

            if (!inline) {
              return <CodeBlock language={lang} code={rawCode} />;
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-white/10 text-purple-300 font-mono text-[11px] sm:text-xs border border-white/10 selection:bg-purple-500 selection:text-white"
                {...props}
              >
                {children}
              </code>
            );
          },
          // GitHub Tables
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-[#0d1117] shadow-md">
                <table className="w-full text-left border-collapse text-xs">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-white/[0.04] text-white font-semibold border-b border-white/10">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-white/5 font-mono text-gray-300">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-3.5 py-2.5 font-bold">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3.5 py-2">{children}</td>;
          },
          // Horizontal Rule
          hr() {
            return <hr className="my-6 border-white/10" />;
          },
          // Anchor / Link
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-4 decoration-purple-500/40 hover:decoration-purple-300 transition-colors"
              >
                {children}
              </a>
            );
          },
          // Images / Badges
          img({ src, alt }) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt || "Markdown visual"}
                className="inline-block max-w-full rounded-lg my-2 align-middle shadow-sm"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

