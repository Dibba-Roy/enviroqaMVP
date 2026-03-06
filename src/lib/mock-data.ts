import type {
  DocumentMetadata,
  Finding,
  FindingCategory,
  ProcessingStep,
  ReviewSummary,
} from "./types";

export const mockDocument: DocumentMetadata = {
  documentName: "Environmental Assessment — Resource Recovery Project",
  documentType: "EA",
  author: "Ramsey/Washington County Resource Recovery Project",
  pages: 13,
  regulatoryFramework: "NEPA",
  leadAgency: "Ramsey/Washington Counties",
  dateAnalyzed: new Date().toISOString(),
  overallScore: 68,
};

export const mockFindings: Finding[] = [
  // ── Structural Completeness (4) ──────────────────────────────────
  {
    id: "SC-001",
    severity: "critical",
    category: "Structural Completeness",
    title: "Missing Cumulative Impacts Section",
    description:
      "Document has no cumulative impacts analysis. For environmental analysis reports supporting resource recovery decisions, cumulative impacts of combined waste management strategies should be assessed together.",
    location: "Document-wide",
    regulation: "40 CFR 1508.7; MN Rules 4410.2300",
    regulationCitations: [
      {
        code: "40 CFR 1508.7",
        title: "Cumulative Impact",
        url: "https://www.govinfo.gov/app/details/CFR-2016-title40-vol37/CFR-2016-title40-vol37-sec1508-7",
        excerpt:
          '"Cumulative impact" is the impact on the environment which results from the incremental impact of the action when added to other past, present, and reasonably foreseeable future actions.',
      },
      {
        code: "MN Rules 4410.2300",
        title: "Environmental Assessment Worksheet — Content",
        url: "https://www.revisor.mn.gov/rules/4410.2300/",
        excerpt:
          "The EAW must include a description of cumulative potential effects and an assessment of their significance for the proposed project area.",
      },
    ],
    suggestedResolution:
      "Add a dedicated Cumulative Impacts section that evaluates the combined effects of the proposed resource recovery strategies alongside other past, present, and reasonably foreseeable actions in the region. Reference 40 CFR 1508.7 and MN Rules 4410.2300 for required scope.",
    status: "open",
    confidence: "high",
  },
  {
    id: "SC-002",
    severity: "major",
    category: "Structural Completeness",
    title: "Mitigation Measures Not Explicitly Addressed",
    description:
      "No dedicated section identifying specific mitigation measures for current negative environmental impacts.",
    location: "Document-wide",
    regulation: "40 CFR 1508.20",
    regulationCitations: [
      {
        code: "40 CFR 1508.20",
        title: "Mitigation",
        url: "https://www.ecfr.gov/current/title-40/chapter-V/subchapter-A/part-1508/section-1508.20",
        excerpt:
          "Mitigation includes: (a) Avoiding the impact altogether; (b) Minimizing impacts by limiting the degree or magnitude of the action; (c) Rectifying the impact by repairing, rehabilitating, or restoring the affected environment.",
      },
    ],
    suggestedResolution:
      "Create a Mitigation Measures section that lists each identified adverse impact alongside specific, actionable mitigation strategies. For each measure, indicate responsible parties, implementation timelines, and monitoring protocols per 40 CFR 1508.20.",
    status: "open",
    confidence: "high",
  },
  {
    id: "SC-003",
    severity: "minor",
    category: "Structural Completeness",
    title: "List of Preparers Absent",
    description:
      "Report doesn't identify who prepared the analysis.",
    location: "Document-wide",
    suggestedResolution:
      "Add a List of Preparers appendix identifying all authors, reviewers, and contributing technical experts along with their qualifications and roles in the document preparation.",
    status: "open",
    confidence: "high",
  },
  {
    id: "SC-004",
    severity: "minor",
    category: "Structural Completeness",
    title: "No Executive Summary",
    description:
      "13-page report lacks executive summary for Project Board decision.",
    location: "Page 1",
    suggestedResolution:
      "Prepend a one-to-two page Executive Summary that highlights key findings, the overall environmental score, critical issues requiring Board attention, and recommended next steps.",
    status: "open",
    confidence: "high",
  },

  // ── Internal Consistency (5) ─────────────────────────────────────
  {
    id: "IC-001",
    severity: "critical",
    category: "Internal Consistency",
    title: "Total MSW Percentage Exceeds 100%",
    description:
      "Table shows total at 101.4% without clear explanation of double-counting methodology.",
    location: "Page 2 — MSW Management Table",
    pageNumber: 2,
    suggestedResolution:
      "Audit each row in the MSW Management Table and reconcile the total to 100%. If categories intentionally overlap (e.g., recycling counted within diversion), add a clear footnote explaining the double-counting methodology and present an adjusted net total.",
    status: "open",
    confidence: "high",
  },
  {
    id: "IC-002",
    severity: "major",
    category: "Internal Consistency",
    title: "Recycling Percentage Discrepancy",
    description:
      "Text says 86% diversion, but table shows 52.6% + 36.9% = 89.5% before adjustment. Derivation unclear.",
    location: "Page 1 vs Page 2",
    pageNumber: 1,
    suggestedResolution:
      "Reconcile the narrative diversion claim of 86% with the tabular data summing to 89.5%. Show the full derivation in a footnote or methodology note, identifying which categories are included in the 86% figure and how adjustments are applied.",
    status: "open",
    confidence: "high",
  },
  {
    id: "IC-003",
    severity: "major",
    category: "Internal Consistency",
    title: "County Column Values May Be Swapped",
    description:
      "Several row values for Ramsey and Washington counties appear inconsistent with expected county sizes.",
    location: "Page 2 — MSW Table",
    pageNumber: 2,
    suggestedResolution:
      "Cross-check each county's tonnage against MPCA SCORE data or county solid waste reports. If column headers are swapped, correct them and add a verification note documenting the source of each county's figures.",
    status: "open",
    confidence: "medium",
  },
  {
    id: "IC-004",
    severity: "minor",
    category: "Internal Consistency",
    title: "Incomplete Data Fields",
    description:
      "Table has dashes for missing Ramsey County tonnage figures.",
    location: "Page 2",
    pageNumber: 2,
    suggestedResolution:
      "Replace dashes with actual tonnage values from Ramsey County's solid waste reporting, or add footnotes explaining why data is unavailable and what proxy estimates were used for calculations that depend on those figures.",
    status: "open",
    confidence: "high",
  },
  {
    id: "IC-005",
    severity: "minor",
    category: "Internal Consistency",
    title: "GHG Equivalency Figures Not Cross-Referenced",
    description:
      "481,060 metric tons CO2-e equivalencies not sourced.",
    location: "Page 7",
    pageNumber: 7,
    suggestedResolution:
      "Add a citation to the EPA GHG Equivalencies Calculator or the specific MPCA methodology used to derive the 481,060 metric tons CO2-e figure. Include the conversion factors applied.",
    status: "open",
    confidence: "medium",
  },

  // ── Regulatory Citations (4) ─────────────────────────────────────
  {
    id: "RC-001",
    severity: "major",
    category: "Regulatory Citations",
    title: "Air Quality Standards Lack Specific Citations",
    description:
      "MPCA permitting discussed without citing MN Rules 7007/7011 or permit numbers.",
    location: "Page 9",
    pageNumber: 9,
    regulation: "MN Rules 7007; MN Rules 7011",
    regulationCitations: [
      {
        code: "MN Rules 7007",
        title: "Permits — Air Emission Facilities",
        url: "https://www.revisor.mn.gov/rules/7007/",
        excerpt:
          "No person shall construct, modify, reconstruct, or operate an air emission facility without first obtaining a permit from the commissioner as required under this chapter.",
      },
      {
        code: "MN Rules 7011",
        title: "Standards of Performance for Stationary Sources",
        url: "https://www.revisor.mn.gov/rules/7011/",
        excerpt:
          "Establishes emission standards and compliance procedures for stationary sources of air pollution in Minnesota, including waste combustion facilities.",
      },
    ],
    suggestedResolution:
      "Insert specific regulatory references to MN Rules 7007 (permits) and 7011 (standards) where MPCA air quality permitting is discussed. Include applicable permit numbers or permit-by-rule provisions for the facility.",
    status: "open",
    confidence: "high",
  },
  {
    id: "RC-002",
    severity: "major",
    category: "Regulatory Citations",
    title: "Waste Management Act Missing Statute Number",
    description:
      "References act without MN Stat. §115A citation.",
    location: "Page 1",
    pageNumber: 1,
    regulation: "MN Stat. §115A",
    regulationCitations: [
      {
        code: "MN Stat. §115A",
        title: "Minnesota Waste Management Act",
        url: "https://www.revisor.mn.gov/statutes/cite/115A",
        excerpt:
          "Establishes the state's solid waste management policy hierarchy: waste reduction, reuse, recycling, resource recovery (including waste-to-energy), and land disposal as a last resort.",
      },
    ],
    suggestedResolution:
      "Replace the general reference to 'Waste Management Act' with the full citation 'Minnesota Waste Management Act, MN Stat. §115A' and include the specific subsections relevant to the resource recovery discussion.",
    status: "open",
    confidence: "high",
  },
  {
    id: "RC-003",
    severity: "minor",
    category: "Regulatory Citations",
    title: "No Citation for MPCA GHG Data",
    description:
      '2012 sector breakdown attributed to "MPCA reports" without specific publication.',
    location: "Page 6",
    pageNumber: 6,
    regulation: "MPCA GHG Inventory (2012)",
    regulationCitations: [
      {
        code: "MPCA GHG Inventory (2012)",
        title: "Minnesota Greenhouse Gas Emissions Inventory",
        url: "https://www.pca.state.mn.us/air-water-land-climate/greenhouse-gas-emissions-data",
        excerpt:
          "The biennial inventory provides sector-level GHG emissions for Minnesota, including waste management, transportation, agriculture, and energy generation.",
      },
    ],
    suggestedResolution:
      "Replace 'MPCA reports' with the specific publication title, year, and URL — likely the MPCA Greenhouse Gas Emissions Inventory report for 2012.",
    status: "open",
    confidence: "high",
  },
  {
    id: "RC-004",
    severity: "minor",
    category: "Regulatory Citations",
    title: "MSW Objectives Table Source Missing",
    description:
      "Metropolitan area targets table has no source.",
    location: "Page 3",
    pageNumber: 3,
    regulation: "MN Stat. §473.149",
    regulationCitations: [
      {
        code: "MN Stat. §473.149",
        title: "Metropolitan Solid Waste Management Policy Plan",
        url: "https://www.revisor.mn.gov/statutes/cite/473.149",
        excerpt:
          "The Metropolitan Council shall prepare and adopt a policy plan for solid waste management in the metropolitan area, including recycling and waste reduction goals.",
      },
    ],
    suggestedResolution:
      "Add a source citation beneath the Metropolitan area objectives table referencing the Metropolitan Solid Waste Management Policy Plan or the specific legislative mandate that established the targets.",
    status: "open",
    confidence: "high",
  },

  // ── Data Quality (4) ─────────────────────────────────────────────
  {
    id: "DQ-001",
    severity: "major",
    category: "Data Quality",
    title: "Outdated GHG Data",
    description:
      "2012 emissions data used for 2015 decision.",
    location: "Page 6",
    pageNumber: 6,
    suggestedResolution:
      "Update the GHG analysis to use the most recent available emissions data (2014 or later). If 2012 data must be used, provide a justification explaining why more recent data is unavailable and assess whether trends would materially change the conclusions.",
    status: "open",
    confidence: "high",
  },
  {
    id: "DQ-002",
    severity: "major",
    category: "Data Quality",
    title: "PFC Cost Data Understated",
    description:
      "$25M figure only covers Closed Landfill Program costs, not total remediation.",
    location: "Page 12",
    pageNumber: 12,
    suggestedResolution:
      "Clarify that the $25M figure represents only Closed Landfill Program expenditures. Provide a more comprehensive cost estimate that includes ongoing monitoring, private-party remediation, and projected future costs, or clearly scope the limitation in the text.",
    status: "open",
    confidence: "medium",
  },
  {
    id: "DQ-003",
    severity: "minor",
    category: "Data Quality",
    title: "Pricing Year Mismatch",
    description:
      "2013 commodity prices applied to 2014 composition data for $25M recyclables estimate.",
    location: "Page 5",
    pageNumber: 5,
    suggestedResolution:
      "Align the pricing year with the composition data year by updating to 2014 commodity prices, or add an inflation adjustment factor and note the price vintage used in the calculation.",
    status: "open",
    confidence: "high",
  },
  {
    id: "DQ-004",
    severity: "info",
    category: "Data Quality",
    title: "Energy Equivalency Lacks Methodology",
    description:
      "Metal recycling energy savings conversions not sourced.",
    location: "Page 3",
    pageNumber: 3,
    suggestedResolution:
      "Cite the source for energy equivalency conversion factors (e.g., EPA WARM model, DOE lifecycle data) and provide the specific BTU-per-ton assumptions used for metal recycling energy savings.",
    status: "open",
    confidence: "medium",
  },

  // ── Mitigation Adequacy (3) ───────────────────────────────────────
  {
    id: "MA-001",
    severity: "major",
    category: "Mitigation Adequacy",
    title: "Mitigation Measures Lack Specificity",
    description:
      "The document references 'reducing impacts' and 'minimizing emissions' but provides no quantifiable performance thresholds, measurable success criteria, or specific actions tied to identified adverse effects.",
    location: "Document-wide",
    regulation: "40 CFR 1508.20; MN Rules 4410.2300 Subp. 24",
    regulationCitations: [
      {
        code: "40 CFR 1508.20",
        title: "Mitigation",
        url: "https://www.ecfr.gov/current/title-40/chapter-V/subchapter-A/part-1508/section-1508.20",
        excerpt:
          "Mitigation includes: (a) Avoiding the impact altogether; (b) Minimizing impacts by limiting the degree or magnitude of the action; (c) Rectifying the impact; (d) Reducing or eliminating the impact over time; (e) Compensating for the impact.",
      },
    ],
    suggestedResolution:
      "Revise each mitigation measure to include: (1) the specific adverse impact being addressed, (2) quantifiable performance standards or thresholds, (3) the responsible party for implementation, and (4) a timeline for completion. For example, replace 'reduce air emissions' with 'maintain PM2.5 emissions below 15 µg/m³ annual average as measured at facility boundary monitors.'",
    status: "open",
    confidence: "high",
  },
  {
    id: "MA-002",
    severity: "major",
    category: "Mitigation Adequacy",
    title: "No Mitigation Monitoring and Reporting Program",
    description:
      "Document does not include a Mitigation Monitoring and Reporting Program (MMRP) identifying responsible parties, monitoring frequency, reporting protocols, or enforcement mechanisms for proposed mitigation measures.",
    location: "Document-wide",
    regulation: "40 CFR 1505.2(c); MN Rules 4410.2100 Subp. 6",
    regulationCitations: [
      {
        code: "40 CFR 1505.2(c)",
        title: "Record of Decision — Mitigation Monitoring",
        url: "https://www.ecfr.gov/current/title-40/chapter-V/subchapter-A/part-1505/section-1505.2",
        excerpt:
          "The record of decision shall state whether all practicable means to avoid or minimize environmental harm from the alternative selected have been adopted, and if not, why they were not.",
      },
    ],
    suggestedResolution:
      "Add a Mitigation Monitoring and Reporting Program (MMRP) table that lists each mitigation measure with columns for: responsible party, implementation timing, monitoring method and frequency, performance criteria, and corrective action procedures if thresholds are exceeded.",
    status: "open",
    confidence: "high",
  },
  {
    id: "MA-003",
    severity: "minor",
    category: "Mitigation Adequacy",
    title: "Mitigation Feasibility Not Demonstrated",
    description:
      "Several proposed strategies (expanded organics diversion, enhanced SSR/MWP collection, anaerobic digestion) are presented without cost estimates, technical feasibility assessments, or implementation schedules to demonstrate they are practicable.",
    location: "Page 8 — GHG Reduction Strategies",
    pageNumber: 8,
    suggestedResolution:
      "For each proposed mitigation strategy, add a brief feasibility assessment covering: estimated capital and operating costs, available technology or vendors, required permits or approvals, and a realistic implementation timeline. Cite comparable projects or feasibility studies where available.",
    status: "open",
    confidence: "medium",
  },

  // ── Writing & Clarity (4) ────────────────────────────────────────
  {
    id: "WC-001",
    severity: "minor",
    category: "Writing & Clarity",
    title: "Acronym 'RDF' Undefined at First Use",
    description:
      "Refuse Derived Fuel appears without definition.",
    location: "Page 3",
    pageNumber: 3,
    suggestedResolution:
      "Define 'RDF' as 'Refuse Derived Fuel (RDF)' at its first occurrence and add it to an acronym glossary if one exists.",
    status: "open",
    confidence: "high",
  },
  {
    id: "WC-002",
    severity: "minor",
    category: "Writing & Clarity",
    title: "Multiple Undefined Acronyms",
    description:
      "MSW, MPCA, GHG, MWh, MMBTU, SSO, SSR, MWP, AD all used without first-use definitions.",
    location: "Throughout",
    suggestedResolution:
      "Add an Acronyms and Abbreviations table at the front of the document. Additionally, spell out each acronym at first use in the body text (e.g., 'Municipal Solid Waste (MSW)').",
    status: "open",
    confidence: "high",
  },
  {
    id: "WC-003",
    severity: "info",
    category: "Writing & Clarity",
    title: "Typo: 'indented' should be 'intended'",
    description:
      'Page 8 says "It is indented to be a comparison."',
    location: "Page 8",
    pageNumber: 8,
    suggestedResolution:
      "Correct the typo: change 'indented' to 'intended' on page 8.",
    status: "open",
    confidence: "high",
  },
  {
    id: "WC-004",
    severity: "info",
    category: "Writing & Clarity",
    title: "Vague Comparative Claim",
    description:
      "Air quality section says WTE ranks lower than landfills in emissions but cites no specific study.",
    location: "Page 9",
    pageNumber: 9,
    suggestedResolution:
      "Support the comparative claim with a specific citation — e.g., an EPA AP-42 emission factors comparison or a peer-reviewed lifecycle analysis comparing WTE and landfill air emissions.",
    status: "open",
    confidence: "medium",
  },
];

export function getReviewSummary(findings: Finding[]): ReviewSummary {
  const categories: FindingCategory[] = [
    "Structural Completeness",
    "Internal Consistency",
    "Regulatory Citations",
    "Data Quality",
    "Mitigation Adequacy",
    "Writing & Clarity",
  ];

  const byCategorySeed = Object.fromEntries(
    categories.map((cat) => [
      cat,
      { count: 0, critical: 0, major: 0, minor: 0, info: 0 },
    ]),
  ) as ReviewSummary["byCategory"];

  const summary: ReviewSummary = {
    totalFindings: findings.length,
    critical: 0,
    major: 0,
    minor: 0,
    info: 0,
    byCategory: byCategorySeed,
  };

  for (const f of findings) {
    summary[f.severity]++;
    const bucket = summary.byCategory[f.category];
    bucket.count++;
    bucket[f.severity]++;
  }

  return summary;
}

export const mockDocumentContent = `
<h1>Environmental Analysis Report</h1>
<h2>Ramsey/Washington County Resource Recovery Project</h2>
<p>Prepared for: Ramsey/Washington Counties<br/>Jurisdiction: State — Minnesota<br/>Date: 2015</p>

<h2>1. Introduction and Purpose</h2>
<p>This report provides an environmental analysis of solid waste management strategies for Ramsey and Washington Counties. The Waste Management Act establishes a hierarchy of preferred waste management practices: waste reduction, reuse, recycling, composting, resource recovery including waste-to-energy (WTE), and land disposal as a last resort.</p>
<p>The two-county area generates approximately 940,000 tons of Municipal Solid Waste (MSW) annually. Current diversion rates stand at 86% when combining recycling, organics recovery, and resource recovery programs.</p>

<h2>2. MSW Management Data</h2>
<p>The following table summarizes MSW management methods across both counties:</p>
<table>
  <thead>
    <tr><th>Management Method</th><th>Ramsey County</th><th>Washington County</th><th>Combined %</th></tr>
  </thead>
  <tbody>
    <tr><td>Recycling</td><td>—</td><td>—</td><td>52.6%</td></tr>
    <tr><td>Organics/Composting</td><td>—</td><td>—</td><td>36.9%</td></tr>
    <tr><td>Waste-to-Energy</td><td>—</td><td>—</td><td>7.8%</td></tr>
    <tr><td>Landfill</td><td>—</td><td>—</td><td>4.1%</td></tr>
    <tr><td><strong>Total</strong></td><td>—</td><td>—</td><td><strong>101.4%</strong></td></tr>
  </tbody>
</table>

<h2>3. Metropolitan Area Objectives</h2>
<p>The metropolitan area has established targets for waste diversion and resource recovery. The objectives include achieving 75% recycling rate by 2030 and reducing reliance on landfill disposal to below 5% of total MSW.</p>
<p>Current RDF processing capacity handles approximately 1,500 tons per day across regional facilities. Energy recovery from MSW processing yields approximately 650 MWh annually, equivalent to powering 55,000 homes.</p>
<p>Metal recycling from the waste stream saves significant energy compared to virgin ore processing.</p>

<h2>4. Recyclable Materials Value</h2>
<p>Based on 2014 composition study data and 2013 commodity pricing, the estimated annual value of recoverable materials in the MSW stream is approximately $25 million. Key material categories include:</p>
<ul>
  <li>Mixed paper and cardboard</li>
  <li>Ferrous and non-ferrous metals</li>
  <li>Plastics (#1–#7)</li>
  <li>Glass containers</li>
  <li>Organic materials for composting and SSO programs</li>
</ul>

<h2>5. Greenhouse Gas Impacts</h2>
<p>According to MPCA reports, solid waste management accounts for approximately 7% of Minnesota's total GHG emissions. The 2012 sector breakdown shows waste management contributing 8.2 million metric tons CO2-equivalent annually.</p>
<p>Resource recovery through WTE and recycling programs avoids an estimated 481,060 metric tons of CO2-equivalent emissions annually compared to landfill disposal scenarios. This is equivalent to removing approximately 103,000 vehicles from the road.</p>

<h2>6. GHG Reduction Strategies</h2>
<p>Strategies under consideration for further GHG reductions include expanded organics diversion, enhanced recycling collection through SSR and MWP programs, and anaerobic digestion (AD) of source-separated organics.</p>

<h2>7. Air Quality Considerations</h2>
<p>The air quality impacts of waste-to-energy facilities are regulated through MPCA permitting processes. Modern WTE facilities employ advanced emission control technologies that significantly reduce criteria pollutant emissions.</p>
<p>It is indented to be a comparison of emissions profiles between WTE and landfill gas-to-energy systems. WTE facilities generally rank lower than landfills in total air emissions when accounting for avoided methane releases.</p>
<p>Emissions monitoring data from regional facilities demonstrates compliance with all applicable air quality standards, including requirements for particulate matter, sulfur dioxide, nitrogen oxides, and mercury.</p>

<h2>8. Waste-to-Energy Operations</h2>
<p>The existing WTE facility processes approximately 1,000 tons per day of MSW, generating steam for district heating and electricity for the regional grid. Annual energy production averages 365,000 MMBTU of thermal energy.</p>

<h2>9. Land and Water Impacts</h2>
<p>Landfill operations in the region have resulted in documented groundwater contamination at three closed sites. Remediation costs through the Closed Landfill Program total approximately $25 million to date for PFC contamination cleanup.</p>
<p>Resource recovery alternatives reduce the volume of waste requiring land disposal by approximately 85%, extending the operational life of remaining landfill capacity.</p>

<h2>10. Conclusions and Recommendations</h2>
<p>The analysis demonstrates that an integrated waste management approach combining aggressive recycling, organics recovery, and resource recovery through WTE provides the optimal environmental outcome for the two-county region. Continued investment in collection infrastructure and processing capacity is recommended.</p>
`;

export type SectionChecklistItem = {
  section: string;
  status: "present" | "missing" | "incomplete";
  notes?: string;
};

export function getMockSectionChecklist(): SectionChecklistItem[] {
  return [
    { section: "Purpose and Need", status: "present" },
    {
      section: "Description of Alternatives (incl. No-Action)",
      status: "missing",
      notes: "No alternatives analysis or No-Action alternative presented",
    },
    { section: "Affected Environment / Environmental Setting", status: "present" },
    {
      section: "Environmental Consequences / Impact Analysis",
      status: "incomplete",
      notes: "Air quality and GHG impacts discussed but land use, noise, and biological resources not addressed",
    },
    {
      section: "Cumulative Impacts",
      status: "missing",
      notes: "No cumulative impacts analysis found — required under 40 CFR 1508.7",
    },
    {
      section: "Mitigation Measures",
      status: "missing",
      notes: "No dedicated mitigation section; strategies mentioned lack specificity",
    },
    {
      section: "List of Preparers",
      status: "missing",
      notes: "Authors and qualifications not identified",
    },
    { section: "References / Bibliography", status: "missing", notes: "No reference list provided" },
    {
      section: "Public Involvement / Agency Coordination",
      status: "missing",
      notes: "No documentation of public engagement or agency consultation",
    },
    {
      section: "Executive Summary",
      status: "missing",
      notes: "13-page document lacks summary for decision-makers",
    },
  ];
}

export function getProcessingSteps(): ProcessingStep[] {
  return [
    { label: "Parsing document structure and TOC", status: "pending" },
    { label: "Checking required sections per NEPA/CEQA", status: "pending" },
    { label: "Cross-referencing data tables and figures", status: "pending" },
    { label: "Validating regulatory citations and permits", status: "pending" },
    { label: "Evaluating mitigation measure specificity", status: "pending" },
    { label: "Assessing data currency and methodology", status: "pending" },
    { label: "Generating QA/QC review summary", status: "pending" },
  ];
}
