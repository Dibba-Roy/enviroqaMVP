"use client";

import { motion } from "framer-motion";
import { MapPin, Scale, Check, X } from "lucide-react";
import type {
  Finding,
  FindingSeverity,
  FindingStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; color: string; dot: string; bar: string }
> = {
  critical: {
    label: "Critical",
    color: "text-critical",
    dot: "bg-critical",
    bar: "bg-critical",
  },
  major: {
    label: "Major",
    color: "text-major",
    dot: "bg-major",
    bar: "bg-major",
  },
  minor: {
    label: "Minor",
    color: "text-minor",
    dot: "bg-minor",
    bar: "bg-minor",
  },
  info: {
    label: "Info",
    color: "text-info",
    dot: "bg-info",
    bar: "bg-info",
  },
};

const STATUS_CONFIG: Record<
  FindingStatus,
  { label: string; color: string; dot: string }
> = {
  open: { label: "Open", color: "text-text-secondary", dot: "bg-info" },
  "in-review": { label: "In Review", color: "text-accent", dot: "bg-accent" },
  resolved: { label: "Resolved", color: "text-success", dot: "bg-success" },
  dismissed: {
    label: "Dismissed",
    color: "text-text-muted",
    dot: "bg-text-muted",
  },
};

type FindingCardProps = {
  finding: Finding;
  isSelected: boolean;
  onSelect: (finding: Finding) => void;
  onStatusChange: (id: string, status: FindingStatus) => void;
  index?: number;
};

export default function FindingCard({
  finding,
  isSelected,
  onSelect,
  onStatusChange,
  index = 0,
}: FindingCardProps) {
  const sev = SEVERITY_CONFIG[finding.severity];
  const stat = STATUS_CONFIG[finding.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      onClick={() => onSelect(finding)}
      className={cn(
        "group relative flex overflow-hidden rounded border cursor-pointer transition-colors",
        isSelected
          ? "border-accent/50 bg-accent/5"
          : "border-border bg-surface hover:bg-surface-elevated hover:border-text-muted/20",
      )}
    >
      {/* Severity bar — left edge */}
      <div className={cn("w-[3px] shrink-0", sev.bar)} />

      <div className="flex-1 min-w-0 px-3 py-2.5">
        {/* Top line: severity + category */}
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full shrink-0", sev.dot)} />
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wider",
              sev.color,
            )}
          >
            {sev.label}
          </span>
          <span className="text-[11px] text-text-muted">•</span>
          <span className="text-xs text-text-muted truncate">
            {finding.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary mt-1 truncate leading-snug">
          {finding.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-text-secondary mt-0.5 leading-relaxed line-clamp-2">
          {finding.description}
        </p>

        {/* Bottom row: pills + status */}
        <div className="flex items-center gap-1.5 mt-2">
          {finding.location && (
            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate max-w-[120px]">
                {finding.location}
              </span>
            </span>
          )}
          {finding.regulation && (
            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted font-mono">
              <Scale size={11} className="shrink-0" />
              <span className="truncate max-w-[100px]">
                {finding.regulation}
              </span>
            </span>
          )}

          <div className="flex-1" />

          <span className="inline-flex items-center gap-1 text-xs shrink-0">
            <span className={cn("w-2 h-2 rounded-full", stat.dot)} />
            <span className={stat.color}>{stat.label}</span>
          </span>
        </div>
      </div>

      {/* Quick actions — hover only */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {finding.status !== "resolved" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(finding.id, "resolved");
            }}
            className="p-1 rounded bg-surface-elevated border border-border text-text-muted hover:text-success hover:border-success/40 hover:bg-success/10 transition-colors cursor-pointer"
            title="Mark resolved"
          >
            <Check size={14} />
          </button>
        )}
        {finding.status !== "dismissed" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(finding.id, "dismissed");
            }}
            className="p-1 rounded bg-surface-elevated border border-border text-text-muted hover:text-critical hover:border-critical/40 hover:bg-critical/10 transition-colors cursor-pointer"
            title="Dismiss finding"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
