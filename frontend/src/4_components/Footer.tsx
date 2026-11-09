"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="w-full bg-[#07090e] border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-500/20">
                <span className="material-symbols-outlined text-white text-base">movie_filter</span>
              </div>
              <span className="font-bold text-lg text-white tracking-tight">GitVideo</span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-4">
              The AI product demo studio made specifically for developers, founders, and engineering teams. Your code has a story. Let GitVideo tell it.
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#preview" className="hover:text-white transition-colors">Product Preview</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Quotas</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="https://github.com/Akash4406pal/GitVideo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
              <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
              <li><a href="https://bharatcode.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">BharatCode League</a></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-4">Trust & Legal</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><span className="text-gray-400 cursor-pointer hover:text-white transition-colors">Privacy Policy</span></li>
              <li><span className="text-gray-400 cursor-pointer hover:text-white transition-colors">Terms of Service</span></li>
              <li><span className="text-gray-400 cursor-pointer hover:text-white transition-colors">Security Architecture</span></li>
              <li><span className="text-gray-400 cursor-pointer hover:text-white transition-colors">Contact Engineering</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <div>
            © 2026 GitVideo Engine • Built for developers with zero hallucination.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Remotion & BharatCode AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
