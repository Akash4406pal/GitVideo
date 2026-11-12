"use client";

import React, { useState, useEffect, useRef } from "react";
import { MarkdownViewer } from "./ui/MarkdownViewer";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: Array<{
    filePath: string;
    startLine: number;
    endLine: number;
    title: string;
  }>;
  relatedFiles?: string[];
  timestamp: string;
}

interface ArchitectureChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  repoName?: string;
  onSelectFocusFiles?: (filePaths: string[]) => void;
}

const PRESET_QUESTIONS = [
  "What are the primary entry points and request lifecycle?",
  "How are module dependencies and imports structured?",
  "Where is the core business logic and parsing implemented?",
  "How are errors, schema validations, and edge cases handled?",
];

export function ArchitectureChatbot({
  isOpen,
  onClose,
  repoName = "Target Codebase",
  onSelectFocusFiles,
}: ArchitectureChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome_1",
      sender: "assistant",
      text: `Hello! I am your **GitVideo Architecture Intelligence Assistant** for **${repoName}**.\n\nI am grounded directly in your repository's AST, module topology, and extracted snippets with zero hallucination. Ask me anything about how the architecture, data flow, or components work!`,
      timestamp: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputValue).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/repo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, repoName }),
      });

      if (!res.ok) {
        throw new Error(`Failed to query architecture (${res.status})`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `asst_${Date.now()}`,
        sender: "assistant",
        text: data.answer || "No response received.",
        citations: data.citations,
        relatedFiles: data.relatedFiles,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "assistant",
          text: `⚠️ **Error querying codebase:** ${err.message || "Please check your network and try again."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl h-[85vh] max-h-[720px] bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header Strip */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-xl">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="chat-modal-title" className="text-base font-bold text-white">
                  Ask Repo Architecture
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  AST Grounded
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Grounded Q&amp;A for <strong className="text-gray-200">{repoName}</strong> with file citations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close architecture chat"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Message Thread Scroll View */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono text-gray-500">
                <span>{msg.sender === "user" ? "You" : "Architecture Engine"}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-purple-600 text-white rounded-tr-none shadow-md"
                    : "bg-surface-container-high border border-white/5 text-gray-200 rounded-tl-none shadow-lg"
                }`}
              >
                {/* Message Body */}
                {msg.sender === "user" ? (
                  <div className="whitespace-pre-wrap font-sans text-white text-xs sm:text-sm">
                    {msg.text}
                  </div>
                ) : (
                  <MarkdownViewer
                    content={msg.text}
                    showMermaid={false}
                    className="text-gray-200"
                  />
                )}

                {/* Grounded Code Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-white/10 space-y-1.5 font-mono text-xs">
                    <div className="text-[10px] uppercase font-semibold text-purple-300 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>Verified Line Citations:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.citations.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-emerald-300 text-[11px] inline-flex items-center gap-1"
                        >
                          <span>{c.filePath}</span>
                          <strong className="text-white">L{c.startLine}-{c.endLine}</strong>
                        </span>
                      ))}
                    </div>

                    {onSelectFocusFiles && msg.relatedFiles && msg.relatedFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectFocusFiles(msg.relatedFiles!);
                          onClose();
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">movie_filter</span>
                        <span>Focus these {msg.relatedFiles.length} files in video script</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-high border border-white/5 text-xs text-gray-400 font-mono flex items-center gap-2">
                <span>Inspecting AST symbols and dependency flow...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-gray-500 shrink-0">Suggestions:</span>
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSend(q)}
              className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-purple-600/20 text-gray-400 hover:text-purple-300 border border-white/5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-white/10 bg-[#0d1117] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask anything about ${repoName} architecture...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 font-sans transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send query"
          >
            <span className="material-symbols-outlined text-[19px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

