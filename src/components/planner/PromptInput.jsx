"use client";

import { Sparkles, Loader2 } from "lucide-react";

/**
 * PromptInput
 * Natural language prompt textarea + study duration selector + generate button.
 *
 * Props:
 *  - value            {string}   Prompt text
 *  - onChange         {fn}       Called with new prompt string
 *  - duration         {number}   Study duration in days
 *  - onDurationChange {fn}       Called with new duration number
 *  - onSubmit         {fn}       Called when Generate Plan is clicked
 *  - loading          {boolean}  Shows spinner and disables inputs
 */
export default function PromptInput({
  value,
  onChange,
  duration,
  onDurationChange,
  onSubmit,
  loading,
}) {
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!loading) onSubmit();
    }
  };

  return (
    <div className="bg-[#1c1b1b] rounded-2xl p-6 border border-white/5 glow-border-resting space-y-4">
      {/* Label */}
      <div>
        <label className="block text-sm font-semibold text-white mb-1">
          Tell the AI how to plan for you
        </label>
        <p className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-[0.15em] text-neutral-500 mb-3">
          Describe your priorities, constraints, or focus areas in plain language.
        </p>

        {/* Textarea */}
        <textarea
          id="plan-prompt-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`e.g. "I have 10 days. Focus more on DSA and DBMS, less on Math. I am already good at OS."`}
          rows={3}
          disabled={loading}
          className="w-full rounded-xl px-4 py-3 text-sm bg-[#0e0e0e] border border-white/10 text-[#e5e2e1]
            placeholder:text-neutral-600 outline-none
            focus:ring-1 focus:ring-white/30 focus:border-white/20
            resize-none transition-all duration-300 disabled:opacity-60"
        />
      </div>

      {/* Duration + Submit Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Duration Input */}
        <div className="flex items-center gap-3 bg-[#0e0e0e] border border-white/10 rounded-xl px-4 py-2.5">
          <label
            htmlFor="study-duration-input"
            className="text-sm font-medium text-neutral-400 whitespace-nowrap"
          >
            Study Duration
          </label>
          <input
            id="study-duration-input"
            type="number"
            min={1}
            max={90}
            value={duration}
            onChange={(e) => onDurationChange(Math.max(1, Math.min(90, Number(e.target.value))))}
            disabled={loading}
            className="w-16 text-center text-sm font-semibold text-white bg-transparent
              outline-none border-b border-white/20 disabled:opacity-60"
          />
          <span className="text-sm text-neutral-500">days</span>
        </div>

        {/* Hint text */}
        <p className="text-xs text-neutral-600 hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-neutral-400">Ctrl+Enter</kbd> to generate
        </p>

        {/* Generate Button */}
        <button
          id="generate-plan-btn"
          onClick={onSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold
            bg-white text-[#1a1c1c] hover:shadow-[0_0_15px_rgba(255,255,255,0.12)]
            active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 ml-auto"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {loading ? "Generating…" : "Generate Plan"}
        </button>
      </div>
    </div>
  );
}
