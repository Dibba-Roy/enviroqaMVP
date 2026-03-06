"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Shield,
  ShieldCheck,
  GitCompare,
  Scale,
  Database,
  FileText,
  Search,
  X,
  Layers,
  MapPin,
  BookMarked,
  Lightbulb,
  MessageSquare,
  Link2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Sun,
  Moon,
  PenLine,
  ClipboardList,
  ListChecks,
  Info,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  mockDocument,
  mockFindings,
  mockDocumentContent,
  getReviewSummary,
  getMockSectionChecklist,
} from "@/lib/mock-data";
import type {
  Finding,
  FindingCategory,
  FindingConfidence,
  FindingSeverity,
  FindingStatus,
} from "@/lib/types";
import type { SectionChecklistItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import ExportReport from "./ExportReport";
import DocumentEditor from "./DocumentEditor";
import EditorSidebar from "./EditorSidebar";

/* ── Config ───────────────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<FindingCategory, React.ElementType> = {
  "Structural Completeness": Shield,
  "Internal Consistency": GitCompare,
  "Regulatory Citations": Scale,
  "Data Quality": Database,
  "Mitigation Adequacy": ShieldCheck,
  "Writing & Clarity": FileText,
};

const CONFIDENCE_CONFIG: Record<
  FindingConfidence,
  { label: string; color: string; bg: string }
> = {
  high: { label: "High confidence", color: "text-success", bg: "bg-success/10" },
  medium: { label: "Medium confidence", color: "text-major", bg: "bg-major/10" },
  low: { label: "Low confidence", color: "text-text-muted", bg: "bg-text-muted/10" },
};

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

const STATUS_CONFIG: Record<
  FindingStatus,
  { label: string; color: string; bg: string }
> = {
  open: {
    label: "Open",
    color: "text-text-secondary",
    bg: "bg-text-secondary/10",
  },
  "in-review": {
    label: "In Review",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  resolved: {
    label: "Resolved",
    color: "text-success",
    bg: "bg-success/10",
  },
  dismissed: {
    label: "Dismissed",
    color: "text-text-muted",
    bg: "bg-text-muted/10",
  },
};

const ALL_SEVERITIES: FindingSeverity[] = [
  "critical",
  "major",
  "minor",
  "info",
];

const ALL_CATEGORIES: FindingCategory[] = [
  "Structural Completeness",
  "Internal Consistency",
  "Regulatory Citations",
  "Data Quality",
  "Mitigation Adequacy",
  "Writing & Clarity",
];

const DOC_TYPE_LABELS: Record<string, string> = {
  EIS: "EIS",
  EIR: "EIR",
  EA: "EA",
  "IS-MND": "IS/MND",
  CatEx: "CatEx",
  "PhaseI-ESA": "Phase I ESA",
  BiologicalAssessment: "Bio Assessment",
  WetlandDelineation: "Wetland",
  TechnicalStudy: "Technical Study",
  Other: "Other",
};

const STATUS_TOAST: Record<FindingStatus, string> = {
  open: "Finding reopened",
  "in-review": "Finding marked as in review",
  resolved: "Finding marked as resolved",
  dismissed: "Finding dismissed",
};

/* ── Small presentational pieces ──────────────────────────────────── */

function ScoreRing({ score }: { score: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const stroke =
    score >= 80
      ? "stroke-success"
      : score >= 60
        ? "stroke-major"
        : "stroke-critical";

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
    >
      <svg width="40" height="40" className="-rotate-90 animate-glow-ring">
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="3"
          className="stroke-border"
        />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="text-base font-semibold text-text-primary">
          {score}/100
        </span>
        <span className="text-xs text-text-muted mt-0.5">QA Readiness</span>
      </div>
    </motion.div>
  );
}

function SeverityMiniBar({
  critical,
  major,
  minor,
  info,
  total,
}: {
  critical: number;
  major: number;
  minor: number;
  info: number;
  total: number;
}) {
  if (total === 0) return null;
  return (
    <div className="flex h-1 w-full rounded-full overflow-hidden bg-border">
      {critical > 0 && (
        <div
          className="bg-critical"
          style={{ width: `${(critical / total) * 100}%` }}
        />
      )}
      {major > 0 && (
        <div
          className="bg-major"
          style={{ width: `${(major / total) * 100}%` }}
        />
      )}
      {minor > 0 && (
        <div
          className="bg-minor"
          style={{ width: `${(minor / total) * 100}%` }}
        />
      )}
      {info > 0 && (
        <div
          className="bg-info"
          style={{ width: `${(info / total) * 100}%` }}
        />
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-border rounded px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="w-10 flex flex-col items-center gap-1.5 pt-0.5">
          <div className="skeleton w-2.5 h-2.5 rounded-full" />
          <div className="skeleton w-8 h-2 rounded" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="skeleton w-12 h-3 rounded" />
            <div className="skeleton w-48 h-3 rounded" />
          </div>
          <div className="skeleton w-full h-2 rounded" />
          <div className="skeleton w-2/3 h-2 rounded" />
          <div className="flex gap-1.5 mt-1">
            <div className="skeleton w-16 h-4 rounded" />
            <div className="skeleton w-20 h-4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────────── */

export default function ReviewDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<
    FindingCategory | "all"
  >("all");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [findings, setFindings] = useState<Finding[]>(mockFindings);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<FindingSeverity[]>([
    ...ALL_SEVERITIES,
  ]);
  const [expandedDescs, setExpandedDescs] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [loaded, setLoaded] = useState(false);
  const [activeView, setActiveView] = useState<"review" | "completeness" | "editor">("review");
  const sectionChecklist = useMemo(() => getMockSectionChecklist(), []);
  const [pendingSuggestion, setPendingSuggestion] = useState<Finding | null>(
    null,
  );
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<Set<string>>(
    new Set(),
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const findingsListRef = useRef<HTMLDivElement>(null);
  const noteToastRef = useRef<ReturnType<typeof setTimeout>>();

  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Skeleton delay ─────────────────────────────────────────────── */

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (noteToastRef.current) clearTimeout(noteToastRef.current);
    };
  }, []);

  /* ── Computed ───────────────────────────────────────────────────── */

  const summary = useMemo(() => getReviewSummary(findings), [findings]);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (selectedCategory !== "all" && f.category !== selectedCategory)
        return false;
      if (!severityFilter.includes(f.severity)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [findings, selectedCategory, severityFilter, searchQuery]);

  const allAddressed =
    filteredFindings.length > 0 &&
    filteredFindings.every(
      (f) => f.status === "resolved" || f.status === "dismissed",
    );

  const totalSeverityCounts = useMemo(() => {
    const c: Record<FindingSeverity, number> = {
      critical: 0,
      major: 0,
      minor: 0,
      info: 0,
    };
    for (const f of findings) c[f.severity]++;
    return c;
  }, [findings]);

  const visibleSeverityCounts = useMemo(() => {
    const c: Record<FindingSeverity, number> = {
      critical: 0,
      major: 0,
      minor: 0,
      info: 0,
    };
    for (const f of filteredFindings) c[f.severity]++;
    return c;
  }, [filteredFindings]);

  const hasOtherFilters =
    selectedCategory !== "all" || searchQuery.length > 0;

  const activeCountByCategory = useMemo(() => {
    const c = {} as Record<FindingCategory, number>;
    for (const cat of ALL_CATEGORIES) c[cat] = 0;
    for (const f of findings) {
      if (f.status === "open" || f.status === "in-review") {
        c[f.category]++;
      }
    }
    return c;
  }, [findings]);

  const relatedFindings = useMemo(() => {
    if (!selectedFinding) return [];
    return findings.filter(
      (f) =>
        f.category === selectedFinding.category &&
        f.id !== selectedFinding.id,
    );
  }, [findings, selectedFinding]);

  /* ── Keyboard navigation ────────────────────────────────────────── */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        if (selectedFinding) {
          setSelectedFinding(null);
          return;
        }
      }

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(prev + 1, filteredFindings.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (
        e.key === "Enter" &&
        focusedIndex >= 0 &&
        focusedIndex < filteredFindings.length
      ) {
        setSelectedFinding(filteredFindings[focusedIndex]);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedFinding, focusedIndex, filteredFindings]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [selectedCategory, searchQuery, severityFilter]);

  useEffect(() => {
    if (focusedIndex < 0 || !findingsListRef.current) return;
    const items =
      findingsListRef.current.querySelectorAll("[data-finding-item]");
    items[focusedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [focusedIndex]);

  /* ── Callbacks ──────────────────────────────────────────────────── */

  const toggleSeverity = useCallback((sev: FindingSeverity) => {
    setSeverityFilter((prev) => {
      if (prev.includes(sev)) {
        const next = prev.filter((s) => s !== sev);
        return next.length === 0 ? [...ALL_SEVERITIES] : next;
      }
      return [...prev, sev];
    });
  }, []);

  const updateStatus = useCallback(
    (id: string, status: FindingStatus) => {
      setFindings((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f)),
      );
      setSelectedFinding((prev) =>
        prev?.id === id ? { ...prev, status } : prev,
      );
      addToast(STATUS_TOAST[status]);
    },
    [addToast],
  );

  const updateNote = useCallback(
    (id: string, note: string) => {
      setFindings((prev) =>
        prev.map((f) => (f.id === id ? { ...f, reviewerNote: note } : f)),
      );
      setSelectedFinding((prev) =>
        prev?.id === id ? { ...prev, reviewerNote: note } : prev,
      );
      if (noteToastRef.current) clearTimeout(noteToastRef.current);
      noteToastRef.current = setTimeout(() => addToast("Note saved"), 1000);
    },
    [addToast],
  );

  const toggleDesc = useCallback((id: string) => {
    setExpandedDescs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const applySuggestion = useCallback(
    (finding: Finding) => {
      setPendingSuggestion(finding);
      setActiveView("editor");
      updateStatus(finding.id, "in-review");
      addToast(`Suggestion ${finding.id} applied to document`);
    },
    [updateStatus, addToast],
  );

  const onSuggestionApplied = useCallback(() => {
    if (pendingSuggestion) {
      setAppliedSuggestionIds((prev) => {
        const next = new Set(prev);
        next.add(pendingSuggestion.id);
        return next;
      });
      setPendingSuggestion(null);
    }
  }, [pendingSuggestion]);

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <Tooltip.Provider delayDuration={400}>
      <div className="flex flex-col h-screen bg-bg font-sans overflow-hidden">
        {/* ── TOP BAR ───────────────────────────────────────────────── */}
        <header className="flex items-center h-14 px-4 border-b border-border bg-surface shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-bold text-text-muted tracking-[0.2em] uppercase select-none">
              EnviroQA
            </span>
            <div className="w-px h-5 bg-border" />
            <span className="text-base text-text-primary font-medium truncate">
              {mockDocument.documentName}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-accent/15 text-accent font-medium shrink-0">
              {DOC_TYPE_LABELS[mockDocument.documentType]}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center gap-4">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="cursor-help">
                  <ScoreRing score={mockDocument.overallScore} />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="rounded-md px-3 py-2 text-xs text-text-primary bg-surface-elevated border border-border shadow-lg z-50 max-w-[260px] leading-relaxed"
                  sideOffset={8}
                >
                  <p className="font-semibold mb-1">QA Readiness Score</p>
                  <p className="text-text-muted">
                    Measures document completeness, internal consistency, and citation accuracy.
                    Not an EPA adequacy rating.
                  </p>
                  <Tooltip.Arrow className="fill-surface-elevated" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            <div className="flex items-center bg-surface-elevated rounded border border-border p-0.5">
              <button
                onClick={() => setActiveView("review")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  activeView === "review"
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                <ClipboardList size={13} />
                Review
              </button>
              <button
                onClick={() => setActiveView("completeness")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  activeView === "completeness"
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                <ListChecks size={13} />
                Completeness
              </button>
              <button
                onClick={() => setActiveView("editor")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  activeView === "editor"
                    ? "bg-accent/15 text-accent"
                    : "text-text-muted hover:text-text-secondary",
                )}
              >
                <PenLine size={13} />
                Editor
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {ALL_SEVERITIES.map((sev) => {
              const total = totalSeverityCounts[sev];
              const visible = visibleSeverityCounts[sev];
              const cfg = SEVERITY_CONFIG[sev];
              const active = severityFilter.includes(sev);
              const showRatio =
                active && hasOtherFilters && visible !== total;

              return (
                <button
                  key={sev}
                  onClick={() => toggleSeverity(sev)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                    active
                      ? `${cfg.bg} ${cfg.color}`
                      : "bg-surface-elevated/50 text-text-muted opacity-40",
                  )}
                >
                  <span className="tabular-nums">
                    {showRatio ? `${visible}/${total}` : total}
                  </span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-border" />

          <ExportReport findings={findings} document={mockDocument} />

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 rounded border border-border text-text-muted hover:text-text-secondary hover:bg-surface-elevated transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? <Sun size={16} /> : <Moon size={16} />
            ) : (
              <Sun size={16} className="opacity-0" />
            )}
          </button>
        </header>

        {/* ── BODY ──────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {activeView === "editor" ? (
            <>
              <EditorSidebar
                findings={findings}
                appliedIds={appliedSuggestionIds}
                onApply={applySuggestion}
              />
              <div className="flex-1 min-w-0">
                <DocumentEditor
                  content={mockDocumentContent}
                  pendingSuggestion={pendingSuggestion}
                  onSuggestionApplied={onSuggestionApplied}
                />
              </div>
            </>
          ) : activeView === "completeness" ? (
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-text-primary">
                    Section Completeness Checklist
                  </h2>
                  <p className="text-sm text-text-muted mt-1">
                    Required sections for an Environmental Assessment (EA) per NEPA guidelines.
                    Based on 40 CFR 1501.5 and agency-specific EA requirements.
                  </p>
                </div>

                <div className="mb-4 flex items-center gap-6 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-success" /> Present
                  </span>
                  <span className="flex items-center gap-1.5">
                    <XCircle size={13} className="text-critical" /> Missing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-major" /> Incomplete
                  </span>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  {sectionChecklist.map((item, i) => {
                    const statusIcon =
                      item.status === "present" ? (
                        <CheckCircle size={16} className="text-success shrink-0" />
                      ) : item.status === "missing" ? (
                        <XCircle size={16} className="text-critical shrink-0" />
                      ) : (
                        <AlertTriangle size={16} className="text-major shrink-0" />
                      );

                    const statusLabel =
                      item.status === "present"
                        ? "Present"
                        : item.status === "missing"
                          ? "Missing"
                          : "Incomplete";

                    const statusColor =
                      item.status === "present"
                        ? "text-success bg-success/10"
                        : item.status === "missing"
                          ? "text-critical bg-critical/10"
                          : "text-major bg-major/10";

                    return (
                      <div
                        key={item.section}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3",
                          i > 0 && "border-t border-border",
                          item.status === "missing" && "bg-critical/[0.02]",
                          item.status === "incomplete" && "bg-major/[0.02]",
                        )}
                      >
                        <div className="pt-0.5">{statusIcon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">
                              {item.section}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase",
                                statusColor,
                              )}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-text-muted mt-1 leading-relaxed">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 rounded-lg border border-border bg-surface-elevated/50">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-text-muted mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-text-secondary">
                        Completeness Summary
                      </p>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {sectionChecklist.filter((s) => s.status === "present").length} of{" "}
                        {sectionChecklist.length} required sections present.{" "}
                        {sectionChecklist.filter((s) => s.status === "missing").length} sections
                        missing,{" "}
                        {sectionChecklist.filter((s) => s.status === "incomplete").length} sections
                        incomplete. Address missing sections before submission to the lead agency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          ) : (
          <>
          {/* ── LEFT SIDEBAR ────────────────────────────────────────── */}
          <aside className="w-64 border-r border-border bg-surface flex flex-col shrink-0">
            <div className="px-3 pt-3 pb-2">
              <h2 className="text-xs font-semibold text-text-muted tracking-[0.15em] uppercase">
                Categories
              </h2>
            </div>

            <nav className="flex-1 overflow-y-auto px-1.5 space-y-0.5">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-all cursor-pointer",
                  selectedCategory === "all"
                    ? "bg-accent/10 border-l-2 border-accent"
                    : "border-l-2 border-transparent hover:bg-surface-elevated",
                )}
              >
                <Layers size={17} className="text-text-muted shrink-0" />
                <span className="text-sm font-medium text-text-primary flex-1">
                  All Findings
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-secondary font-medium">
                  {findings.length}
                </span>
              </button>

              {ALL_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                const d = summary.byCategory[cat];
                const active = selectedCategory === cat;
                const activeCount = activeCountByCategory[cat];

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full flex flex-col gap-1.5 px-2.5 py-2 rounded text-left transition-all cursor-pointer",
                      active
                        ? "bg-accent/10 border-l-2 border-accent"
                        : "border-l-2 border-transparent hover:bg-surface-elevated",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={17} className="text-text-muted shrink-0" />
                      <span className="text-sm font-medium text-text-primary flex-1 truncate">
                        {cat}
                      </span>
                      <motion.span
                        key={activeCount}
                        initial={{ y: -4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-secondary font-medium tabular-nums"
                      >
                        {activeCount}
                      </motion.span>
                    </div>
                    <div className="ml-[26px]">
                      <SeverityMiniBar
                        critical={d.critical}
                        major={d.major}
                        minor={d.minor}
                        info={d.info}
                        total={d.count}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-border px-3 py-3 space-y-2">
              <h3 className="text-xs font-semibold text-text-muted tracking-[0.15em] uppercase">
                Quick Stats
              </h3>
              <dl className="space-y-1.5">
                {[
                  {
                    label: "Pages analyzed",
                    value: String(mockDocument.pages),
                  },
                  { label: "Regulations checked", value: "12" },
                  { label: "Time saved", value: "~6.5 hrs" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between"
                  >
                    <dt className="text-[13px] text-text-muted">{s.label}</dt>
                    <dd className="text-[13px] font-semibold text-text-primary">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>

          {/* ── MAIN CONTENT ────────────────────────────────────────── */}
          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="px-4 py-2.5 border-b border-border shrink-0">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search findings… (⌘F)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded pl-8 pr-8 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-text-muted">
                  {filteredFindings.length} finding
                  {filteredFindings.length !== 1 && "s"}
                  {hasOtherFilters && ` of ${findings.length}`}
                </span>
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="text-xs text-accent hover:underline cursor-pointer"
                  >
                    Clear category filter
                  </button>
                )}
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5"
              ref={findingsListRef}
            >
              {!loaded ? (
                <div className="space-y-1.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <>
                  {allAddressed && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center py-6 mb-2 rounded-lg border border-success/20 bg-success/5"
                    >
                      <CheckCircle size={28} className="text-success mb-2" />
                      <span className="text-sm font-medium text-success">
                        All findings addressed
                      </span>
                      <span className="text-xs text-text-muted mt-1">
                        {filteredFindings.length} finding
                        {filteredFindings.length !== 1 && "s"} resolved or
                        dismissed
                      </span>
                    </motion.div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {filteredFindings.map((finding, index) => {
                      const sev = SEVERITY_CONFIG[finding.severity];
                      const stat = STATUS_CONFIG[finding.status];
                      const selected = selectedFinding?.id === finding.id;
                      const expanded = expandedDescs.has(finding.id);
                      const focused = focusedIndex === index;

                      return (
                        <motion.div
                          key={finding.id}
                          data-finding-item
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => {
                            setSelectedFinding(finding);
                            setFocusedIndex(index);
                          }}
                          className={cn(
                            "group border rounded px-3 py-2.5 cursor-pointer transition-colors",
                            selected
                              ? "border-accent/40 bg-accent/5"
                              : focused
                                ? "border-accent/20 bg-surface-elevated"
                                : "border-border bg-surface hover:bg-surface-elevated hover:border-border",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0 w-10">
                              <div
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full animate-pulse-badge",
                                  sev.dot,
                                )}
                              />
                              <span
                                className={cn(
                                  "text-[11px] font-semibold uppercase",
                                  sev.color,
                                )}
                              >
                                {sev.label}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-text-muted font-mono">
                                  {finding.id}
                                </span>
                                <h3 className="text-sm font-semibold text-text-primary truncate">
                                  {finding.title}
                                </h3>
                              </div>

                              <p
                                className={cn(
                                  "text-[13px] text-text-secondary mt-0.5 leading-relaxed",
                                  !expanded && "line-clamp-2",
                                )}
                              >
                                {finding.description}
                              </p>
                              {finding.description.length > 100 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDesc(finding.id);
                                  }}
                                  className="text-xs text-accent hover:underline mt-0.5 cursor-pointer"
                                >
                                  {expanded ? "show less" : "show more"}
                                </button>
                              )}

                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {finding.location && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted">
                                    {finding.location}
                                  </span>
                                )}
                                {finding.regulation && (
                                  <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono cursor-help">
                                        {finding.regulation}
                                      </span>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                      <Tooltip.Content
                                        className="rounded-md px-2.5 py-1.5 text-xs text-text-primary bg-surface-elevated border border-border shadow-lg z-50"
                                        sideOffset={4}
                                      >
                                        Click to search this regulation
                                        <Tooltip.Arrow className="fill-surface-elevated" />
                                      </Tooltip.Content>
                                    </Tooltip.Portal>
                                  </Tooltip.Root>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                <span
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 rounded font-medium",
                                    stat.bg,
                                    stat.color,
                                  )}
                                >
                                  {stat.label}
                                </span>
                                <Tooltip.Root>
                                  <Tooltip.Trigger asChild>
                                    <span
                                      className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded font-medium cursor-help",
                                        CONFIDENCE_CONFIG[finding.confidence].bg,
                                        CONFIDENCE_CONFIG[finding.confidence].color,
                                      )}
                                    >
                                      {finding.confidence === "high" ? "High" : finding.confidence === "medium" ? "Med" : "Low"} conf.
                                    </span>
                                  </Tooltip.Trigger>
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      className="rounded-md px-2.5 py-1.5 text-xs text-text-primary bg-surface-elevated border border-border shadow-lg z-50 max-w-[200px]"
                                      sideOffset={4}
                                    >
                                      AI confidence in this finding based on document evidence
                                      <Tooltip.Arrow className="fill-surface-elevated" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                </Tooltip.Root>
                                <div className="flex-1" />
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFinding(finding);
                                    }}
                                    className="text-xs px-2 py-0.5 rounded border border-border text-text-secondary hover:bg-surface-elevated transition-colors cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      applySuggestion(finding);
                                    }}
                                    className="text-xs px-2 py-0.5 rounded border border-accent/30 text-accent hover:bg-accent/10 transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <PenLine size={11} />
                                    Apply
                                  </button>
                                  {finding.status !== "resolved" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus(finding.id, "resolved");
                                      }}
                                      className="text-xs px-2 py-0.5 rounded border border-success/30 text-success hover:bg-success/10 transition-colors cursor-pointer"
                                    >
                                      Mark Resolved
                                    </button>
                                  )}
                                  {finding.status !== "dismissed" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus(finding.id, "dismissed");
                                      }}
                                      className="text-xs px-2 py-0.5 rounded border border-border text-text-muted hover:bg-surface-elevated transition-colors cursor-pointer"
                                    >
                                      Dismiss
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {filteredFindings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                      {searchQuery ? (
                        <>
                          <Search size={28} className="mb-2 opacity-30" />
                          <span className="text-sm">
                            No findings match your search
                          </span>
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-2 text-xs text-accent hover:underline cursor-pointer"
                          >
                            Clear search
                          </button>
                        </>
                      ) : (
                        <>
                          <Search size={28} className="mb-2 opacity-30" />
                          <span className="text-sm">
                            No findings match your filters
                          </span>
                          {(selectedCategory !== "all" ||
                            severityFilter.length < ALL_SEVERITIES.length) && (
                            <button
                              onClick={() => {
                                setSelectedCategory("all");
                                setSeverityFilter([...ALL_SEVERITIES]);
                              }}
                              className="mt-2 text-xs text-accent hover:underline cursor-pointer"
                            >
                              Clear all filters
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* ── RIGHT DETAIL PANEL ──────────────────────────────────── */}
          <AnimatePresence>
            {selectedFinding && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 384, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="border-l border-border bg-surface overflow-hidden shrink-0"
              >
                <div className="w-96 h-full flex flex-col">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded font-semibold",
                          SEVERITY_CONFIG[selectedFinding.severity].bg,
                          SEVERITY_CONFIG[selectedFinding.severity].color,
                        )}
                      >
                        {SEVERITY_CONFIG[selectedFinding.severity].label}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted">
                        {selectedFinding.category}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium",
                          CONFIDENCE_CONFIG[selectedFinding.confidence].bg,
                          CONFIDENCE_CONFIG[selectedFinding.confidence].color,
                        )}
                      >
                        {CONFIDENCE_CONFIG[selectedFinding.confidence].label}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedFinding(null)}
                      className="p-1 rounded hover:bg-surface-elevated text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Panel body */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                    <div>
                      <span className="text-xs text-text-muted font-mono">
                        {selectedFinding.id}
                      </span>
                      <h2 className="text-base font-semibold text-text-primary mt-0.5 leading-snug">
                        {selectedFinding.title}
                      </h2>
                    </div>

                    <p className="text-[13px] text-text-secondary leading-relaxed">
                      {selectedFinding.description}
                    </p>

                    <section>
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin size={13} className="text-text-muted" />
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          Location
                        </span>
                      </div>
                      <p className="text-[13px] text-text-secondary pl-4">
                        {selectedFinding.location}
                        {selectedFinding.pageNumber &&
                          ` (Page ${selectedFinding.pageNumber})`}
                      </p>
                    </section>

                    {(selectedFinding.regulationCitations?.length ||
                      selectedFinding.regulation) && (
                      <section>
                        <div className="flex items-center gap-1.5 mb-2">
                          <BookMarked size={13} className="text-text-muted" />
                          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            Applicable Regulation
                            {(selectedFinding.regulationCitations?.length ??
                              0) > 1 && "s"}
                          </span>
                        </div>

                        {selectedFinding.regulationCitations?.length ? (
                          <div className="space-y-2 pl-4">
                            {selectedFinding.regulationCitations.map((cit) => (
                              <div
                                key={cit.code}
                                className="rounded border border-border bg-surface-elevated/50 px-3 py-2"
                              >
                                <div className="flex items-center gap-1.5">
                                  {cit.url ? (
                                    <a
                                      href={cit.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[13px] font-mono font-semibold text-accent hover:underline inline-flex items-center gap-1"
                                    >
                                      {cit.code}
                                      <ExternalLink
                                        size={10}
                                        className="shrink-0 opacity-60"
                                      />
                                    </a>
                                  ) : (
                                    <span className="text-[13px] font-mono font-semibold text-accent">
                                      {cit.code}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-text-secondary mt-0.5">
                                  {cit.title}
                                </p>
                                {cit.excerpt && (
                                  <p className="text-xs text-text-muted leading-relaxed mt-1.5 pl-2 border-l-2 border-accent/25 italic">
                                    {cit.excerpt}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[13px] text-accent font-mono pl-4">
                            {selectedFinding.regulation}
                          </p>
                        )}
                      </section>
                    )}

                    <section>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb size={13} className="text-text-muted" />
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          Suggested Resolution
                        </span>
                      </div>
                      <p className="text-[13px] text-text-secondary leading-relaxed pl-4 border-l-2 border-accent/30">
                        {selectedFinding.suggestedResolution}
                      </p>
                      <button
                        onClick={() => applySuggestion(selectedFinding)}
                        className={cn(
                          "mt-2 ml-4 text-xs font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5",
                          appliedSuggestionIds.has(selectedFinding.id)
                            ? "bg-success/10 text-success cursor-default"
                            : "bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer",
                        )}
                        disabled={appliedSuggestionIds.has(selectedFinding.id)}
                      >
                        <PenLine size={12} />
                        {appliedSuggestionIds.has(selectedFinding.id)
                          ? "Applied to Document"
                          : "Apply to Document"}
                      </button>
                    </section>

                    <section>
                      <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare size={13} className="text-text-muted" />
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          Reviewer Notes
                        </span>
                      </div>
                      <textarea
                        value={selectedFinding.reviewerNote ?? ""}
                        onChange={(e) =>
                          updateNote(selectedFinding.id, e.target.value)
                        }
                        placeholder="Add reviewer notes…"
                        rows={3}
                        className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none transition-colors"
                      />
                    </section>

                    <section>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                        Status
                      </span>
                      <select
                        value={selectedFinding.status}
                        onChange={(e) =>
                          updateStatus(
                            selectedFinding.id,
                            e.target.value as FindingStatus,
                          )
                        }
                        className="bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-[13px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
                      >
                        <option value="open">Open</option>
                        <option value="in-review">In Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </section>

                    {relatedFindings.length > 0 && (
                      <section>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Link2 size={13} className="text-text-muted" />
                          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            Related Findings
                          </span>
                        </div>
                        <div className="space-y-1">
                          {relatedFindings.map((rf) => (
                            <button
                              key={rf.id}
                              onClick={() => setSelectedFinding(rf)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded bg-surface-elevated hover:bg-border/30 transition-colors text-left cursor-pointer"
                            >
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full shrink-0",
                                  SEVERITY_CONFIG[rf.severity].dot,
                                )}
                              />
                              <span className="text-xs text-text-muted font-mono shrink-0">
                                {rf.id}
                              </span>
                              <span className="text-xs text-text-secondary truncate">
                                {rf.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
          </>
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
