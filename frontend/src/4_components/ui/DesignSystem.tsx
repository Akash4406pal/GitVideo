"use client";

import React from "react";

/**
 * Fine film-grain noise texture overlay for premium cinematic feel.
 */
export function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 opacity-[0.035] bg-grain mix-blend-overlay"
      aria-hidden="true"
    />
  );
}

/**
 * Soft radial ambient glow behind key product visual elements.
 */
export function AmbientGlow({
  color = "purple",
  position = "top-left",
  size = "md",
}: {
  color?: "purple" | "indigo" | "emerald" | "pink";
  position?: "top-left" | "top-right" | "center" | "bottom";
  size?: "sm" | "md" | "lg";
}) {
  const colorMap = {
    purple: "bg-purple-600/15",
    indigo: "bg-indigo-600/15",
    emerald: "bg-emerald-500/10",
    pink: "bg-pink-600/10",
  };

  const posMap = {
    "top-left": "-top-40 -left-20",
    "top-right": "-top-40 -right-20",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    bottom: "-bottom-40 left-1/3",
  };

  const sizeMap = {
    sm: "w-[24rem] h-[24rem] blur-[100px]",
    md: "w-[36rem] h-[36rem] blur-[140px]",
    lg: "w-[48rem] h-[48rem] blur-[180px]",
  };

  return (
    <div
      className={`absolute rounded-full pointer-events-none ${colorMap[color]} ${posMap[position]} ${sizeMap[size]}`}
      aria-hidden="true"
    />
  );
}

/**
 * Frosted-glass panel with restrained transparency, subtle border, and backdrop blur.
 */
export function GlassPanel({
  children,
  className = "",
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl ${
        hover ? "hover:border-purple-500/30 hover:bg-white/[0.04] transition-all" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Standardized Section Heading with Eyebrow, Large Headline, and Supporting Copy.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col ${alignClass} mb-12 sm:mb-16 max-w-3xl ${align === "center" ? "mx-auto" : ""}`}>
      {eyebrow && (
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Primary CTA Button with gradient hover and shadow glow.
 */
export function PrimaryButton({
  children,
  onClick,
  icon,
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl",
    md: "px-6 py-3 text-xs sm:text-sm rounded-xl",
    lg: "px-8 py-3.5 text-sm sm:text-base rounded-2xl",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.02] cursor-pointer ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

/**
 * Secondary Button with subtle glass border and hover highlight.
 */
export function SecondaryButton({
  children,
  onClick,
  icon,
  href,
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: string;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl",
    md: "px-6 py-3 text-xs sm:text-sm rounded-xl",
    lg: "px-8 py-3.5 text-sm sm:text-base rounded-2xl",
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white font-medium backdrop-blur-xl transition-all cursor-pointer ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

/**
 * Reusable Feature Deep-Dive Card with custom icon and visual container.
 */
export function FeatureCard({
  icon,
  title,
  description,
  badge,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <GlassPanel hover className="p-6 sm:p-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
          {badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">{description}</p>
      </div>
      {children && <div className="mt-4 pt-4 border-t border-white/5">{children}</div>}
    </GlassPanel>
  );
}

/**
 * Reusable Workflow Step for the "How It Works" 5-stage pipeline.
 */
export function WorkflowStep({
  stepNumber,
  title,
  description,
  icon,
  detail,
}: {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  detail: string;
}) {
  return (
    <div className="relative flex flex-col items-start p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl group hover:border-purple-500/40 transition-all">
      <div className="flex items-center justify-between w-full mb-4">
        <span className="font-mono text-2xl font-black text-purple-400/50 group-hover:text-purple-400 transition-colors">
          0{stepNumber}
        </span>
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed mb-4">{description}</p>
      <div className="mt-auto w-full pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
        <span>{detail}</span>
      </div>
    </div>
  );
}

/**
 * macOS-style Chrome Window Frame for demo previews.
 */
export function DemoWindow({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-2xl bg-[#090c12]/90 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <span className="ml-3 font-mono text-[11px] text-gray-400">{title}</span>
        </div>
        {badge && (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

