export type DocumentMetadata = {
  documentName: string;
  documentType:
    | "EIS"
    | "EIR"
    | "EA"
    | "IS-MND"
    | "CatEx"
    | "PhaseI-ESA"
    | "BiologicalAssessment"
    | "WetlandDelineation"
    | "TechnicalStudy"
    | "Other";
  author: string;
  pages: number;
  regulatoryFramework: string;
  leadAgency: string;
  dateAnalyzed: string;
  overallScore: number;
};

export type FindingSeverity = "critical" | "major" | "minor" | "info";

export type FindingCategory =
  | "Structural Completeness"
  | "Internal Consistency"
  | "Regulatory Citations"
  | "Data Quality"
  | "Mitigation Adequacy"
  | "Writing & Clarity";

export type FindingStatus = "open" | "in-review" | "resolved" | "dismissed";

export type RegulationCitation = {
  code: string;
  title: string;
  url?: string;
  excerpt?: string;
};

export type FindingConfidence = "high" | "medium" | "low";

export type Finding = {
  id: string;
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  location: string;
  pageNumber?: number;
  regulation?: string;
  regulationCitations?: RegulationCitation[];
  suggestedResolution: string;
  status: FindingStatus;
  reviewerNote?: string;
  confidence: FindingConfidence;
};

export type ReviewSummary = {
  totalFindings: number;
  critical: number;
  major: number;
  minor: number;
  info: number;
  byCategory: Record<
    FindingCategory,
    {
      count: number;
      critical: number;
      major: number;
      minor: number;
      info: number;
    }
  >;
};

export type UploadState =
  | "idle"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

export type ProcessingStep = {
  label: string;
  status: "pending" | "active" | "complete";
};
