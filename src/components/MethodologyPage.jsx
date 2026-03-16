import { useMemo } from "react";
import { exposureCSS, exposureLabel } from "../utils/colors";

/* ── Static scoring data (from methodology doc) ── */

const SIGNALS = [
  {
    label: "Digital Core",
    weight: 45,
    desc: "Is the work product fundamentally digital? Can it be done from a computer?",
  },
  {
    label: "Routine Info Processing",
    weight: 25,
    desc: "How much of the work is structured, repetitive information handling?",
  },
  {
    label: "AI Productivity Leverage",
    weight: 20,
    desc: "Can AI make each worker dramatically more productive (reducing headcount)?",
  },
  {
    label: "Physical Barrier",
    weight: 10,
    desc: "Does the job require physical presence or manual dexterity? (inverse — higher barrier = lower exposure)",
  },
];

const INDUSTRY_SCORES = [
  {
    code: "A",
    name: "Agriculture, Forestry & Fishing",
    score: 2.0,
    sector: "Primary",
    rationale:
      "Physical, outdoor, minimal digital. Hands-on work in unpredictable environments.",
  },
  {
    code: "B",
    name: "Mining & Quarrying",
    score: 3.0,
    sector: "Secondary",
    rationale:
      "Physical extraction, some automation potential in planning/geology.",
  },
  {
    code: "C",
    name: "Manufacturing",
    score: 5.5,
    sector: "Secondary",
    rationale:
      "Mixed — assembly automation vs craft. CAD/CAM and quality control increasingly digital.",
  },
  {
    code: "D",
    name: "Electricity, Gas & AC Supply",
    score: 5.0,
    sector: "Secondary",
    rationale:
      "Grid management, SCADA systems increasingly digital. AI optimizes distribution.",
  },
  {
    code: "E",
    name: "Water Supply, Sewerage & Waste",
    score: 3.0,
    sector: "Secondary",
    rationale:
      "Physical service delivery, field operations. Limited digital core work.",
  },
  {
    code: "F",
    name: "Construction",
    score: 3.5,
    sector: "Secondary",
    rationale:
      "Physical, site-based. Some digital in design/BIM but execution is manual.",
  },
  {
    code: "G",
    name: "Trade (Wholesale & Retail)",
    score: 6.0,
    sector: "Tertiary",
    rationale:
      "E-commerce disruption, inventory/pricing AI, demand forecasting. Increasingly digital.",
  },
  {
    code: "H",
    name: "Transportation & Storage",
    score: 5.5,
    sector: "Tertiary",
    rationale:
      "Route optimization, autonomous vehicles long-term. Physical execution today.",
  },
  {
    code: "I",
    name: "Accommodation & Food Services",
    score: 4.0,
    sector: "Tertiary",
    rationale:
      "Service-oriented, hospitality requires human presence. AI for booking/scheduling.",
  },
  {
    code: "J",
    name: "Information & Communication",
    score: 8.5,
    sector: "Tertiary",
    rationale:
      "Almost entirely digital. Coding, data analysis, communication — AI frontier.",
  },
  {
    code: "K",
    name: "Financial & Insurance",
    score: 8.0,
    sector: "Tertiary",
    rationale:
      "Fintech, algorithmic trading, robo-advisory, fraud detection. Highly digital.",
  },
  {
    code: "L",
    name: "Real Estate",
    score: 6.5,
    sector: "Tertiary",
    rationale:
      "Valuation models, digital platforms, documentation. Mix of digital & physical.",
  },
  {
    code: "M",
    name: "Professional & Scientific",
    score: 7.5,
    sector: "Tertiary",
    rationale:
      "Research, consulting, analytics — predominantly knowledge work.",
  },
  {
    code: "N",
    name: "Administrative & Support Services",
    score: 7.0,
    sector: "Tertiary",
    rationale:
      "Data entry, scheduling, customer service — structured information processing.",
  },
  {
    code: "O",
    name: "Public Administration & Defence",
    score: 5.5,
    sector: "Tertiary",
    rationale:
      "Bureaucracy, e-governance push. Mix of paperwork and public-facing roles.",
  },
  {
    code: "P",
    name: "Education",
    score: 6.0,
    sector: "Tertiary",
    rationale:
      "AI tutoring, content generation, grading. Teaching requires human presence.",
  },
  {
    code: "Q",
    name: "Health & Social Work",
    score: 5.0,
    sector: "Tertiary",
    rationale:
      "Diagnostics AI advances, but physical care and procedures require humans.",
  },
  {
    code: "R",
    name: "Arts, Entertainment & Recreation",
    score: 4.5,
    sector: "Tertiary",
    rationale: "Content generation AI, but creativity and performance valued.",
  },
  {
    code: "S",
    name: "Other Service Activities",
    score: 4.0,
    sector: "Tertiary",
    rationale:
      "Mixed personal services — repair, religious, political activities.",
  },
  {
    code: "T",
    name: "Household Activities",
    score: 2.0,
    sector: "Tertiary",
    rationale: "Domestic work, physical presence required. No digital core.",
  },
];

const OCCUPATION_SCORES = [
  { div: 1, name: "Legislators, Senior Officials & Managers", score: 6.0 },
  { div: 2, name: "Professionals", score: 7.0 },
  { div: 3, name: "Technicians & Associate Professionals", score: 7.0 },
  { div: 4, name: "Clerks", score: 9.0 },
  { div: 5, name: "Service Workers & Sales", score: 4.5 },
  { div: 6, name: "Skilled Agricultural Workers", score: 2.0 },
  { div: 7, name: "Craft & Related Trades", score: 3.5 },
  { div: 8, name: "Plant & Machine Operators", score: 5.0 },
  { div: 9, name: "Elementary Occupations", score: 2.5 },
];

const TIERS = [
  {
    range: "0–2",
    label: "Minimal",
    color: "#22c55e",
    desc: "Almost entirely physical work requiring real-time human presence in unpredictable environments.",
  },
  {
    range: "2–4",
    label: "Low",
    color: "#84cc16",
    desc: "Mostly physical or interpersonal work. AI helps with peripheral tasks but doesn't touch the core job.",
  },
  {
    range: "4–6",
    label: "Moderate",
    color: "#f59e0b",
    desc: "Mix of physical and knowledge work. AI assists information-processing parts but substantial share still requires human presence.",
  },
  {
    range: "6–8",
    label: "High",
    color: "#f97316",
    desc: "Predominantly knowledge work. AI tools already useful, workers using AI substantially more productive.",
  },
  {
    range: "8–10",
    label: "Very High",
    color: "#ef4444",
    desc: "Almost entirely done on a computer. Core tasks in domains where AI is rapidly improving.",
  },
];

export default function MethodologyPage({ data }) {
  const { summary, industries } = data || {};

  // Compute actual weighted average from live data to show the formula works
  const computedAvg = useMemo(() => {
    if (!industries?.length) return null;
    const totalPct = industries.reduce((s, i) => s + i.worker_pct, 0);
    if (!totalPct) return null;
    const weighted = industries.reduce(
      (s, i) => s + i.worker_pct * i.ai_exposure,
      0,
    );
    return (weighted / totalPct).toFixed(1);
  }, [industries]);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Hero */}
      <div className="glass-panel p-6 border-l-2 border-brand-cyan/40">
        <h1 className="text-lg font-bold text-white mb-2">
          Methodology — AI Exposure Scoring Framework
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
          How we quantify AI's potential impact on India's{" "}
          {summary ? `${summary.total_workers_millions}M` : "564M"}-strong
          workforce. This page documents every scoring decision, formula, and
          data source used in this analysis.
        </p>
      </div>

      {/* Attribution */}
      <div className="glass-panel p-4 border-l-2 border-indigo-500/30">
        <h2 className="text-sm font-bold text-gray-200 mb-1">
          Attribution — Adapted from Andrej Karpathy
        </h2>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          This methodology is directly inspired by{" "}
          <a
            href="https://karpathy.ai/jobs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Karpathy's AI Exposure of the US Job Market
          </a>
          . We credit Karpathy for the single-axis 0–10 rubric concept, the
          insight that computer-only work is inherently 7+, and the
          area=workforce, color=exposure treemap approach. Our contribution is
          adapting this framework for India using official PLFS data from MoSPI.
        </p>
      </div>

      {/* The Key Insight */}
      <div className="glass-panel p-4 bg-amber-500/5 border border-amber-500/10">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
          The Key Signal
        </h3>
        <blockquote className="text-xs text-gray-300 leading-relaxed italic border-l-2 border-amber-500/30 pl-3">
          "If the core work product is fundamentally digital — done entirely on
          a computer (writing, coding, analyzing, communicating) — AI exposure
          is inherently <strong className="text-amber-400">7+</strong>, because
          AI capabilities in digital domains are advancing rapidly. Even if
          today's AI can't handle every aspect, the trajectory is steep and the
          ceiling is very high."
        </blockquote>
      </div>

      {/* Four Scoring Signals */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Four Scoring Signals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SIGNALS.map((s) => (
            <div key={s.label} className="glass-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-200">
                  {s.label}
                </span>
                <span className="text-sm font-black text-indigo-400">
                  {s.weight}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${s.weight}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Exposure Tiers */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Exposure Tier Definitions (0–10 Scale)
        </h2>
        <div className="space-y-2">
          {TIERS.map((t) => (
            <div
              key={t.label}
              className="glass-panel p-3 flex items-start gap-3"
            >
              <div
                className="w-14 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: t.color + "20", color: t.color }}
              >
                {t.range}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-200">
                  {t.label}
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {t.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Scores Table */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Industry AI Exposure Scores (NIC 2008)
        </h2>
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-2.5 text-gray-600 font-medium">
                    Code
                  </th>
                  <th className="text-left p-2.5 text-gray-600 font-medium">
                    Industry
                  </th>
                  <th className="text-center p-2.5 text-gray-600 font-medium">
                    Score
                  </th>
                  <th className="text-left p-2.5 text-gray-600 font-medium">
                    Tier
                  </th>
                  <th className="text-left p-2.5 text-gray-600 font-medium hidden lg:table-cell">
                    Sector
                  </th>
                  <th className="text-left p-2.5 text-gray-600 font-medium hidden xl:table-cell">
                    Rationale
                  </th>
                </tr>
              </thead>
              <tbody>
                {INDUSTRY_SCORES.map((ind) => (
                  <tr
                    key={ind.code}
                    className="border-b border-white/[0.02] hover:bg-white/[0.02]"
                  >
                    <td className="p-2.5">
                      <span
                        className="inline-flex w-6 h-6 rounded items-center justify-center text-[10px] font-bold"
                        style={{
                          background: exposureCSS(ind.score, 0.15),
                          color: exposureCSS(ind.score),
                        }}
                      >
                        {ind.code}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-300">{ind.name}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className="font-bold"
                        style={{ color: exposureCSS(ind.score) }}
                      >
                        {ind.score}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: exposureCSS(ind.score, 0.1),
                          color: exposureCSS(ind.score),
                        }}
                      >
                        {exposureLabel(ind.score)}
                      </span>
                    </td>
                    <td className="p-2.5 text-gray-500 hidden lg:table-cell">
                      {ind.sector}
                    </td>
                    <td className="p-2.5 text-gray-600 hidden xl:table-cell max-w-xs">
                      {ind.rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Occupation Scores */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Occupation AI Exposure Scores (NCO 2004)
        </h2>
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-2.5 text-gray-600 font-medium">
                  Div
                </th>
                <th className="text-left p-2.5 text-gray-600 font-medium">
                  Occupation Group
                </th>
                <th className="text-center p-2.5 text-gray-600 font-medium">
                  Score
                </th>
                <th className="text-left p-2.5 text-gray-600 font-medium">
                  Tier
                </th>
              </tr>
            </thead>
            <tbody>
              {OCCUPATION_SCORES.map((occ) => (
                <tr
                  key={occ.div}
                  className="border-b border-white/[0.02] hover:bg-white/[0.02]"
                >
                  <td className="p-2.5 text-gray-400 font-medium">{occ.div}</td>
                  <td className="p-2.5 text-gray-300">{occ.name}</td>
                  <td className="p-2.5 text-center">
                    <span
                      className="font-bold"
                      style={{ color: exposureCSS(occ.score) }}
                    >
                      {occ.score}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: exposureCSS(occ.score, 0.1),
                        color: exposureCSS(occ.score),
                      }}
                    >
                      {exposureLabel(occ.score)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulas */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Calculation Formulas
        </h2>
        <div className="space-y-3">
          {/* Weighted Average */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-gray-200 mb-2">
              1. National Weighted Average AI Exposure
            </h3>
            <div className="bg-white/[0.03] rounded-lg p-3 mb-2 font-mono text-xs text-indigo-300">
              <div>
                Weighted_Avg = Σ(industry_worker_pct × industry_ai_score) /
                Σ(industry_worker_pct)
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Each industry's AI exposure score (0–10) is weighted by its share
              of the total workforce. Agriculture (46% of workers, score 2.0)
              pulls the average down, while IT/Finance (small share, score 8+)
              pulls it up.
              {computedAvg && (
                <span className="text-gray-300">
                  {" "}
                  Result:{" "}
                  <strong className="text-amber-400">{computedAvg}/10</strong> (
                  {exposureLabel(parseFloat(computedAvg))}).
                </span>
              )}
            </p>
          </div>

          {/* State AI Index */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-gray-200 mb-2">
              2. State AI Exposure Index
            </h3>
            <div className="bg-white/[0.03] rounded-lg p-3 mb-2 font-mono text-xs text-indigo-300">
              <div>
                State_AI_Index(s, y) = Σ(industry_pct(s, y, i) × ai_score(i)) /
                Σ(industry_pct(s, y, i))
              </div>
              <div className="text-gray-600 mt-1">
                where s = state, y = year, i = industry section (NIC)
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              For each state×year, we compute the workforce-weighted average of
              industry AI scores. PLFS provides the percentage distribution of
              workers by NIC industry section for each state. States with a
              higher share of services/IT workers (e.g., Delhi, Chandigarh)
              score higher; states dominated by agriculture (e.g., Chhattisgarh)
              score lower.
            </p>
          </div>

          {/* Tier Classification */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-gray-200 mb-2">
              3. Exposure Tier Classification
            </h3>
            <div className="bg-white/[0.03] rounded-lg p-3 mb-2 font-mono text-xs text-indigo-300">
              <div>tier(score) = </div>
              <div className="ml-4">Minimal &nbsp;if score ≤ 2</div>
              <div className="ml-4">
                Low &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if 2 &lt; score ≤ 4
              </div>
              <div className="ml-4">Moderate if 4 &lt; score ≤ 6</div>
              <div className="ml-4">
                High &nbsp;&nbsp;&nbsp;&nbsp;if 6 &lt; score ≤ 8
              </div>
              <div className="ml-4">Very High if score &gt; 8</div>
            </div>
          </div>

          {/* Vulnerability Metrics */}
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold text-gray-200 mb-2">
              4. Worker Vulnerability Metrics
            </h3>
            <div className="bg-white/[0.03] rounded-lg p-3 mb-2 font-mono text-xs text-indigo-300">
              <div>
                Triple_Vulnerable(s) = workers without contract AND without paid
                leave AND without social security
              </div>
              <div className="mt-1">
                No_Contract(s) = % of regular workers without a written contract
              </div>
              <div>
                No_Paid_Leave(s) = % of regular workers without paid leave
              </div>
              <div>
                No_SSB(s) = % of regular workers without social security
                benefits
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Employment conditions from PLFS measure how protected workers are.
              States with high AI exposure AND high informal employment face a
              double risk: jobs disrupted by AI with no safety net for displaced
              workers.
            </p>
          </div>
        </div>
      </div>

      {/* Data Pipeline */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Data Pipeline
        </h2>
        <div className="glass-panel p-4">
          <div className="space-y-3 text-[11px] text-gray-400 leading-relaxed">
            <Step n={1} title="Fetch">
              Raw PLFS data fetched via eSankhyiki MCP API (MoSPI). 18 JSON
              files covering 8 indicators across all dimensions — ~8MB total,
              11,937+ employment distribution records paginated across 3 files.
            </Step>
            <Step n={2} title="Parse & Score">
              <code className="text-indigo-400">data/build_data.py</code> parses
              NIC 2008 industry codes (format:{" "}
              <code className="text-gray-500">
                "A_Agriculture, forestry and fishing"
              </code>
              ), applies hand-calibrated AI scores from lookup tables, computes
              workforce percentages, builds 7-year trend series, and aggregates
              demographics.
            </Step>
            <Step n={3} title="State Index">
              <code className="text-indigo-400">data/build_state_ai.js</code>{" "}
              reads employment distribution by state×industry, applies AI
              scores, and computes the weighted-average State AI Index for each
              of 36 states across 7 years. Also extracts employment condition
              metrics per state.
            </Step>
            <Step n={4} title="Protocol Buffers">
              <code className="text-indigo-400">data/build_pb.py</code> compiles
              the JSON output into 7 .pb binary files (~53KB total) using a{" "}
              <code className="text-gray-500">schema.proto</code> definition.
              This reduces payload from ~153KB JSON to ~53KB binary.
            </Step>
            <Step n={5} title="Dashboard">
              React + Vite app loads .pb files on-demand via protobufjs, decodes
              them, and renders interactive visualizations. Static export
              deployed to GitHub Pages.
            </Step>
          </div>
        </div>
      </div>

      {/* India-Specific Considerations */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          India-Specific Considerations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ConsiderationCard
            title="Agriculture Dominance"
            text="~46% of India's workforce is in agriculture (score 2.0), compared to <2% in the US. This alone anchors India's weighted average exposure much lower."
            color="#22c55e"
          />
          <ConsiderationCard
            title="Informal Economy"
            text="A large share of employment is informal, with limited digital infrastructure. This acts as an additional barrier to AI disruption beyond the scoring rubric."
            color="#f59e0b"
          />
          <ConsiderationCard
            title="Service Sector Growth"
            text="India's growing IT, finance, and professional services sectors are highly exposed (7.0–8.5), creating a bifurcated labor market."
            color="#ef4444"
          />
          <ConsiderationCard
            title="Demographic Dividend"
            text="India's young, growing workforce means AI exposure translates differently — potentially more about productivity augmentation than job displacement."
            color="#6366f1"
          />
        </div>
      </div>

      {/* Limitations */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Limitations
        </h2>
        <div className="glass-panel p-4">
          <ol className="space-y-2 text-[11px] text-gray-500 leading-relaxed list-decimal list-inside">
            <li>
              <strong className="text-gray-400">
                Industry-level granularity
              </strong>
              : Scoring 20 NIC sections is much coarser than 342 individual US
              occupations. Within-industry variation is significant.
            </li>
            <li>
              <strong className="text-gray-400">Static scores</strong>: Industry
              scores are manually assigned, not LLM-evaluated from detailed
              descriptions.
            </li>
            <li>
              <strong className="text-gray-400">No task-level analysis</strong>:
              We score industries/occupations holistically rather than
              decomposing into tasks (Eloundou et al., 2023).
            </li>
            <li>
              <strong className="text-gray-400">Temporal lag</strong>: PLFS data
              runs through 2023-24. AI capabilities are advancing rapidly.
            </li>
            <li>
              <strong className="text-gray-400">Informal sector</strong>: The
              rubric assumes formal digital workflows. India's informal sector
              may be less exposed in practice.
            </li>
          </ol>
        </div>
      </div>

      {/* Data Source */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Data Source & References
        </h2>
        <div className="glass-panel p-4">
          <ul className="space-y-2 text-[11px] text-gray-500 leading-relaxed">
            <li>
              <strong className="text-gray-400">[1]</strong> Karpathy, A.
              (2025). <em>AI Exposure of the US Job Market</em>.{" "}
              <a
                href="https://karpathy.ai/jobs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                karpathy.ai/jobs
              </a>
            </li>
            <li>
              <strong className="text-gray-400">[2]</strong> Ministry of
              Statistics & Programme Implementation (2024).{" "}
              <em>Periodic Labour Force Survey Annual Report 2023-24</em>.
            </li>
            <li>
              <strong className="text-gray-400">[3]</strong> National
              Statistical Office. <em>eSankhyiki MCP API</em>.{" "}
              <a
                href="https://mcp.mospi.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                mcp.mospi.gov.in
              </a>
            </li>
            <li>
              <strong className="text-gray-400">[4]</strong> Eloundou, T.,
              Manning, S., Mishkin, P., & Rock, D. (2023).{" "}
              <em>
                GPTs are GPTs: An Early Look at the Labor Market Impact
                Potential of Large Language Models
              </em>
              . arXiv:2303.10130.
            </li>
            <li>
              <strong className="text-gray-400">[5]</strong> National
              Classification of Occupations 2004 (NCO 2004), Ministry of Labour
              and Employment, Government of India.
            </li>
            <li>
              <strong className="text-gray-400">[6]</strong> National Industrial
              Classification 2008 (NIC 2008), Central Statistical Organisation,
              Government of India.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <span className="text-gray-300 font-semibold">{title}</span>
        <span className="text-gray-500"> — </span>
        {children}
      </div>
    </div>
  );
}

function ConsiderationCard({ title, text, color }) {
  return (
    <div
      className="glass-panel p-4 border-l-2"
      style={{ borderColor: color + "40" }}
    >
      <h3 className="text-xs font-semibold mb-1" style={{ color }}>
        {title}
      </h3>
      <p className="text-[11px] text-gray-500 leading-relaxed">{text}</p>
    </div>
  );
}
