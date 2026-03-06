"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Lightbulb, CheckCircle } from "lucide-react";
import type { Finding, FindingSeverity } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; color: string; dot: string }
> = {
  critical: { label: "Critical", color: "text-critical", dot: "bg-critical" },
  major: { label: "Major", color: "text-major", dot: "bg-major" },
  minor: { label: "Minor", color: "text-minor", dot: "bg-minor" },
  info: { label: "Info", color: "text-info", dot: "bg-info" },
};

type EditorSidebarProps = {
  findings: Finding[];
  appliedIds: Set<string>;
  onApply: (finding: Finding) => void;
};

export default function EditorSidebar({
  findings,
  appliedIds,
  onApply,
}: EditorSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = findings.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.suggestedResolution.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q)
    );
  });

  return (
    <aside className="w-72 border-r border-border bg-surface flex flex-col shrink-0 h-full">
      <div className="px-3 pt-3 pb-2">
        <h2 className="text-xs font-semibold text-text-muted tracking-[0.15em] uppercase">
          Suggestions
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          {findings.length} finding{findings.length !== 1 && "s"} &middot;{" "}
          {appliedIds.size} applied
        </p>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Filter suggestions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded pl-7 pr-7 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        <AnimatePresence mode="popLayout">
          {filtered.map((finding) => {
            const sev = SEVERITY_CONFIG[finding.severity];
            const applied = appliedIds.has(finding.id);

            return (
              <motion.div
                key={finding.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  "rounded border px-2.5 py-2 transition-colors",
                  applied
                    ? "border-success/30 bg-success/5"
                    : "border-border bg-surface hover:bg-surface-elevated",
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={cn("w-2 h-2 rounded-full shrink-0", sev.dot)}
                  />
                  <span className="text-[10px] font-mono text-text-muted">
                    {finding.id}
                  </span>
                  {applied && (
                    <CheckCircle size={11} className="text-success ml-auto" />
                  )}
                </div>

                <h4 className="text-xs font-medium text-text-primary leading-snug line-clamp-2">
                  {finding.title}
                </h4>

                <div className="flex items-start gap-1 mt-1.5">
                  <Lightbulb
                    size={11}
                    className="text-text-muted shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] text-text-muted leading-relaxed line-clamp-3">
                    {finding.suggestedResolution}
                  </p>
                </div>

                <button
                  onClick={() => onApply(finding)}
                  disabled={applied}
                  className={cn(
                    "mt-2 w-full text-xs font-medium py-1 rounded transition-colors",
                    applied
                      ? "bg-success/10 text-success cursor-default"
                      : "bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer",
                  )}
                >
                  {applied ? "Applied" : "Apply to Document"}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-8 text-text-muted">
            <Search size={20} className="mb-2 opacity-30" />
            <span className="text-xs">No matching suggestions</span>
          </div>
        )}
      </div>
    </aside>
  );
}
