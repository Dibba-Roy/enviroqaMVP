"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  MapPin,
  Scale,
  Lightbulb,
  MessageSquare,
  FileText,
  Link2,
} from "lucide-react";
import type {
  Finding,
  FindingSeverity,
  FindingStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

/* ── Config maps ──────────────────────────────────────────────────── */

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; color: string; bg: string; dot: string }
> = {
  critical: {
    label: "Critical",
    color: "text-critical",
    bg: "bg-critical/15",
    dot: "bg-critical",
  },
  major: {
    label: "Major",
    color: "text-major",
    bg: "bg-major/15",
    dot: "bg-major",
  },
  minor: {
    label: "Minor",
    color: "text-minor",
    bg: "bg-minor/15",
    dot: "bg-minor",
  },
  info: {
    label: "Info",
    color: "text-info",
    bg: "bg-info/15",
    dot: "bg-info",
  },
};

const STATUS_OPTIONS: {
  value: FindingStatus;
  label: string;
  activeColor: string;
  activeBg: string;
}[] = [
  {
    value: "open",
    label: "Open",
    activeColor: "text-info",
    activeBg: "bg-info/15 border-info/30",
  },
  {
    value: "in-review",
    label: "In Review",
    activeColor: "text-major",
    activeBg: "bg-major/15 border-major/30",
  },
  {
    value: "resolved",
    label: "Resolved",
    activeColor: "text-success",
    activeBg: "bg-success/15 border-success/30",
  },
  {
    value: "dismissed",
    label: "Dismissed",
    activeColor: "text-text-muted",
    activeBg: "bg-text-muted/10 border-text-muted/20",
  },
];

/* ── Section header ───────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <Icon size={14} className="text-text-muted shrink-0" />
      <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em]">
        {label}
      </span>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

type FindingDetailProps = {
  finding: Finding;
  onClose: () => void;
  onStatusChange: (id: string, status: FindingStatus) => void;
  onNoteChange: (id: string, note: string) => void;
  relatedFindings: Finding[];
};

export default function FindingDetail({
  finding,
  onClose,
  onStatusChange,
  onNoteChange,
  relatedFindings,
}: FindingDetailProps) {
  const sev = SEVERITY_CONFIG[finding.severity];

  const [localNote, setLocalNote] = useState(finding.reviewerNote ?? "");
  const prevIdRef = useRef(finding.id);

  useEffect(() => {
    if (prevIdRef.current !== finding.id) {
      setLocalNote(finding.reviewerNote ?? "");
      prevIdRef.current = finding.id;
    }
  }, [finding.id, finding.reviewerNote]);

  const handleNoteBlur = () => {
    if (localNote !== (finding.reviewerNote ?? "")) {
      onNoteChange(finding.id, localNote);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-full flex flex-col bg-surface"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded font-semibold",
              sev.bg,
              sev.color,
            )}
          >
            {sev.label}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted">
            {finding.category}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-surface-elevated text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Title */}
        <div>
          <span className="text-xs text-text-muted font-mono">
            {finding.id}
          </span>
          <h2 className="text-base font-bold text-text-primary mt-0.5 leading-snug">
            {finding.title}
          </h2>
        </div>

        <div className="h-px bg-border" />

        {/* Issue Description */}
        <section>
          <SectionHeader icon={FileText} label="Issue Description" />
          <p className="text-[13px] text-text-secondary leading-relaxed pl-[22px]">
            {finding.description}
          </p>
        </section>

        {/* Document Location */}
        <section>
          <SectionHeader icon={MapPin} label="Document Location" />
          <div className="flex items-center gap-2 pl-[22px]">
            <span className="text-[13px] text-text-secondary">
              {finding.location}
            </span>
            {finding.pageNumber && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent/15 text-accent">
                Page {finding.pageNumber}
              </span>
            )}
          </div>
        </section>

        {/* Applicable Regulation */}
        {finding.regulation && (
          <section>
            <SectionHeader icon={Scale} label="Applicable Regulation" />
            <div className="ml-[22px] px-2.5 py-1.5 rounded bg-surface-elevated border border-border">
              <span className="text-[13px] text-accent font-mono leading-relaxed">
                {finding.regulation}
              </span>
            </div>
          </section>
        )}

        {/* Suggested Resolution */}
        <section>
          <SectionHeader icon={Lightbulb} label="Suggested Resolution" />
          <div className="ml-[22px] px-3 py-2 rounded bg-accent/5 border-l-2 border-accent/40">
            <p className="text-[13px] text-text-secondary leading-relaxed">
              {finding.suggestedResolution}
            </p>
          </div>
        </section>

        {/* Reviewer Notes */}
        <section>
          <SectionHeader icon={MessageSquare} label="Reviewer Notes" />
          <textarea
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Add your review notes..."
            rows={3}
            className="w-full ml-[22px] max-w-[calc(100%-22px)] bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none transition-colors"
          />
        </section>

        {/* Status */}
        <section>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em] block mb-2">
            Status
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_OPTIONS.map((opt) => {
              const active = finding.status === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onStatusChange(finding.id, opt.value)}
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                    active
                      ? cn(opt.activeBg, opt.activeColor)
                      : "border-border text-text-muted bg-surface hover:bg-surface-elevated",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-px bg-border" />

        {/* Related Findings */}
        {relatedFindings.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <Link2 size={14} className="text-text-muted shrink-0" />
              <span className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em]">
                Related Findings
              </span>
              <span className="text-[11px] text-text-muted ml-1">
                ({relatedFindings.length})
              </span>
            </div>
            <div className="space-y-1">
              {relatedFindings.map((rf) => {
                const rfSev = SEVERITY_CONFIG[rf.severity];
                return (
                  <button
                    key={rf.id}
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        const event = new CustomEvent("select-finding", {
                          detail: rf,
                        });
                        window.dispatchEvent(event);
                      }, 50);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded bg-surface-elevated hover:bg-border/30 transition-colors text-left cursor-pointer"
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        rfSev.dot,
                      )}
                    />
                    <span className="text-xs text-text-muted font-mono shrink-0">
                      {rf.id}
                    </span>
                    <span className="text-xs text-text-secondary truncate">
                      {rf.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
