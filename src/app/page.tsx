"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useReviewContext } from "@/lib/review-context";
import type { DocumentMetadata } from "@/lib/types";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded border border-border text-text-muted hover:text-text-secondary hover:bg-surface-elevated transition-colors cursor-pointer"
      title="Toggle theme"
    >
      {mounted ? (
        theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
      ) : (
        <Sun size={18} className="opacity-0" />
      )}
    </button>
  );
}

type DocType = DocumentMetadata["documentType"];

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "EIS", label: "EIS" },
  { value: "EIR", label: "EIR" },
  { value: "EA", label: "EA" },
  { value: "IS-MND", label: "IS/MND" },
  { value: "CatEx", label: "CatEx" },
  { value: "PhaseI-ESA", label: "Phase I ESA" },
  { value: "BiologicalAssessment", label: "Biological Assessment" },
  { value: "WetlandDelineation", label: "Wetland Delineation" },
  { value: "TechnicalStudy", label: "Technical Study" },
  { value: "Other", label: "Other" },
];

const REGULATORY_FRAMEWORKS = [
  "NEPA",
  "CEQA",
  "Joint NEPA/CEQA",
  "SEPA (Washington)",
  "Section 404 (CWA)",
  "ESA Section 7",
  "State-Specific",
] as const;

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUploadData } = useReviewContext();

  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocType>("EA");
  const [projectName, setProjectName] = useState("");
  const [regulatoryFramework, setRegulatoryFramework] = useState("");
  const [leadAgency, setLeadAgency] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const handleFile = useCallback((f: File) => {
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile],
  );

  const onSubmit = useCallback(() => {
    if (!file) return;
    setUploadData({
      fileName: file.name,
      fileSize: file.size,
      docType,
      projectName,
      regulatoryFramework,
      leadAgency,
    });
    setIsExiting(true);
  }, [file, docType, projectName, regulatoryFramework, leadAgency, setUploadData]);

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => router.push("/review"), 400);
    return () => clearTimeout(timer);
  }, [isExiting, router]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        y: isExiting ? -20 : 0,
        scale: isExiting ? 0.98 : 1,
      }}
      transition={{ duration: isExiting ? 0.35 : 0.5, ease: "easeOut" }}
      className="flex min-h-screen items-center justify-center px-4 py-16"
    >
      <div className="w-full max-w-[640px]">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <h1 className="text-base font-medium uppercase tracking-[0.25em] text-text-primary">
              EnviroQA
            </h1>
            <span className="h-2 w-2 rounded-full bg-success" />
          </div>
          <p className="mt-3 text-lg font-medium text-text-secondary">
            AI-Powered Environmental Document QA/QC Review
          </p>
          <p className="mt-2 text-base leading-relaxed text-text-muted">
            Upload an environmental document to automatically check structural
            completeness, regulatory citation accuracy, data consistency,
            mitigation adequacy, and writing quality against NEPA/CEQA standards.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`
            group relative cursor-pointer rounded-lg border-2 border-dashed
            transition-colors duration-200
            ${
              isDragOver
                ? "border-accent bg-accent/5"
                : "border-border hover:border-text-muted"
            }
          `}
          onClick={onBrowse}
        >
          <div className="flex flex-col items-center px-6 py-12">
            <div
              className={`mb-4 rounded-full p-3 transition-colors duration-200 ${
                isDragOver
                  ? "bg-accent/10 text-accent"
                  : "bg-surface-elevated text-text-muted group-hover:text-text-secondary"
              }`}
            >
              <Upload className="h-7 w-7" />
            </div>
            <p className="text-base font-medium text-text-primary">
              Drop your document here
            </p>
            <p className="mt-1.5 text-sm text-text-muted">
              PDF or DOCX — up to 50MB
            </p>

            <div className="my-5 flex w-full max-w-[200px] items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-text-muted">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBrowse();
              }}
              className="rounded-md border border-accent px-5 py-2 text-base font-medium
                text-accent transition-colors duration-150 hover:bg-accent/10"
            >
              Browse files
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        <p className="mt-4 text-center text-sm leading-relaxed text-text-muted">
          Supports: EIS, EIR, EA, IS/MND, CatEx, Phase I ESA, Biological
          Assessments, Wetland Delineation Reports, and Technical Studies
        </p>

        {/* Document Config — slides up after file selection */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-8"
            >
              {/* Selected file indicator */}
              <div className="flex items-center gap-3 rounded-md bg-surface px-4 py-3">
                <FileText className="h-6 w-6 shrink-0 text-accent" />
                <span className="truncate text-base font-medium text-text-primary">
                  {file.name}
                </span>
                <span className="ml-auto shrink-0 text-sm text-text-muted">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>

              {/* Document type radio group */}
              <fieldset className="mt-6">
                <legend className="mb-3 text-sm font-medium uppercase tracking-wider text-text-secondary">
                  Document Type
                </legend>
                <div className="flex flex-wrap gap-2">
                  {DOC_TYPES.map((dt) => (
                    <label
                      key={dt.value}
                      className={`cursor-pointer rounded-md border px-3.5 py-2 text-base transition-colors duration-150 ${
                        docType === dt.value
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-text-secondary hover:border-text-muted hover:text-text-primary"
                      }`}
                    >
                      <input
                        type="radio"
                        name="docType"
                        value={dt.value}
                        checked={docType === dt.value}
                        onChange={() => setDocType(dt.value)}
                        className="sr-only"
                      />
                      {dt.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Optional fields */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-text-secondary">
                    Project Name{" "}
                    <span className="normal-case tracking-normal text-text-muted">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. I-405 Widening Project EIR"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5
                      text-base text-text-primary placeholder:text-text-muted
                      transition-colors focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-text-secondary">
                    Regulatory Framework{" "}
                    <span className="normal-case tracking-normal text-text-muted">
                      (optional)
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={regulatoryFramework}
                      onChange={(e) => setRegulatoryFramework(e.target.value)}
                      className="w-full appearance-none rounded-md border border-border bg-surface
                        px-3 py-2.5 text-base text-text-primary
                        transition-colors focus:border-accent focus:outline-none"
                    >
                      <option value="">Select…</option>
                      {REGULATORY_FRAMEWORKS.map((rf) => (
                        <option key={rf} value={rf}>
                          {rf}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-text-secondary">
                    Lead Agency{" "}
                    <span className="normal-case tracking-normal text-text-muted">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={leadAgency}
                    onChange={(e) => setLeadAgency(e.target.value)}
                    placeholder="e.g. Caltrans, USACE, EPA Region 9"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5
                      text-base text-text-primary placeholder:text-text-muted
                      transition-colors focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={onSubmit}
                disabled={isExiting}
                className="mt-8 w-full rounded-md bg-accent py-3 text-base font-semibold
                  text-white transition-opacity duration-150 hover:opacity-90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Run QA/QC Review
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
