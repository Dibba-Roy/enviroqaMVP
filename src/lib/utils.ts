import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FindingCategory, FindingSeverity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(severity: FindingSeverity): string {
  const colors: Record<FindingSeverity, string> = {
    critical: "text-red-600",
    major: "text-orange-500",
    minor: "text-yellow-500",
    info: "text-blue-500",
  };
  return colors[severity];
}

export function severityLabel(severity: FindingSeverity): string {
  const labels: Record<FindingSeverity, string> = {
    critical: "Critical",
    major: "Major",
    minor: "Minor",
    info: "Info",
  };
  return labels[severity];
}

export function categoryIcon(category: FindingCategory): string {
  const icons: Record<FindingCategory, string> = {
    "Structural Completeness": "layout-list",
    "Internal Consistency": "git-compare",
    "Regulatory Citations": "scale",
    "Data Quality": "database",
    "Mitigation Adequacy": "shield-check",
    "Writing & Clarity": "pen-line",
  };
  return icons[category];
}

export function scoreToGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: "Ready for Submission", color: "text-success" };
  if (score >= 75) return { grade: "Minor Revisions Needed", color: "text-success" };
  if (score >= 60) return { grade: "Significant Revisions Needed", color: "text-major" };
  return { grade: "Major Rework Required", color: "text-critical" };
}
