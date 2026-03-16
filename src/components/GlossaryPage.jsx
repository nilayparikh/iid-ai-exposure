import { useState } from "react";
import { Link } from "react-router-dom";

const GLOSSARY = [
  {
    term: "AI Exposure Score",
    abbr: "AE",
    definition:
      "A composite 0–10 rating measuring how susceptible an industry or occupation is to automation and augmentation by artificial intelligence. Based on task composition, routine intensity, digital maturity, and historical automation precedent.",
    category: "AI",
  },
  {
    term: "Labour Force Participation Rate",
    abbr: "LFPR",
    definition:
      "The proportion of the working-age population (15+) that is either employed or actively seeking employment. An increase in LFPR generally indicates more people entering the workforce.",
    category: "Labour",
  },
  {
    term: "Worker Population Ratio",
    abbr: "WPR",
    definition:
      "The proportion of the working-age population (15+) that is currently employed. Unlike LFPR, this excludes those who are only searching for work.",
    category: "Labour",
  },
  {
    term: "Unemployment Rate",
    abbr: "UR",
    definition:
      "The proportion of the labour force (employed + unemployed seekers) that is unemployed and actively seeking work. Calculated as unemployed persons / total labour force × 100.",
    category: "Labour",
  },
  {
    term: "Periodic Labour Force Survey",
    abbr: "PLFS",
    definition:
      "An annual nationwide survey conducted by the Ministry of Statistics and Programme Implementation (MoSPI) in India, providing estimates of labour force indicators at quarterly and annual intervals.",
    category: "Data",
  },
  {
    term: "National Industrial Classification",
    abbr: "NIC",
    definition:
      "India's standard classification system for economic activities, based on the UN International Standard Industrial Classification (ISIC). Used to categorize industries in this dashboard.",
    category: "Data",
  },
  {
    term: "National Classification of Occupations",
    abbr: "NCO",
    definition:
      "India's standard classification system for occupations, aligned with the International Standard Classification of Occupations (ISCO). Used to categorize occupation groups in this dashboard.",
    category: "Data",
  },
  {
    term: "MoSPI",
    abbr: null,
    definition:
      "Ministry of Statistics and Programme Implementation — the Government of India ministry responsible for collecting, compiling, and publishing statistical data including the PLFS, GDP, CPI, and other national statistics.",
    category: "Data",
  },
  {
    term: "Exposure Tier",
    abbr: null,
    definition:
      "A classification band grouping industries by their AI exposure score: Minimal (0–2), Low (2–4), Moderate (4–6), High (6–8), Very High (8–10). Each tier reflects a different level of AI impact on the workforce.",
    category: "AI",
  },
  {
    term: "Weighted Average Exposure",
    abbr: null,
    definition:
      "The workforce-weighted mean AI exposure score across all industries. Larger industries contribute proportionally more to this metric, reflecting the actual impact on workers rather than a simple industry average.",
    category: "AI",
  },
  {
    term: "Task Composition",
    abbr: null,
    definition:
      "The mix of cognitive, manual, routine, and non-routine tasks that make up an occupation. Industries with more routine cognitive tasks tend to have higher AI exposure scores.",
    category: "AI",
  },
  {
    term: "Gender Wage Gap",
    abbr: null,
    definition:
      "The percentage difference between male and female wages, calculated as (1 − female_wage / male_wage) × 100. A positive gap indicates males earn more on average.",
    category: "Labour",
  },
  {
    term: "Regular Wage/Salaried",
    abbr: null,
    definition:
      "Workers employed with a regular salary or wage, typically in formal or semi-formal establishments. These workers generally have more stable employment and benefits compared to casual or self-employed workers.",
    category: "Labour",
  },
  {
    term: "Casual Labour",
    abbr: null,
    definition:
      "Workers engaged on a temporary, short-term, or daily wage basis without a regular employment contract. Common in agriculture, construction, and unorganised sectors.",
    category: "Labour",
  },
  {
    term: "Self-Employment",
    abbr: null,
    definition:
      "Workers who operate their own enterprise or work as unpaid helpers in a household enterprise. Includes own-account workers, employers, and contributing family workers.",
    category: "Labour",
  },
  {
    term: "Primary Sector",
    abbr: null,
    definition:
      "Economic activities involving extraction of raw materials — agriculture, mining, forestry, fishing. Employs the largest share of India's workforce.",
    category: "Labour",
  },
  {
    term: "Secondary Sector",
    abbr: null,
    definition:
      "Economic activities involving manufacturing, construction, and processing of raw materials into finished goods.",
    category: "Labour",
  },
  {
    term: "Tertiary Sector",
    abbr: null,
    definition:
      "Economic activities involving services — trade, transport, education, healthcare, finance, IT, and administration.",
    category: "Labour",
  },
  {
    term: "Crore (Cr)",
    abbr: null,
    definition:
      "Indian numbering unit equal to 10 million. Used throughout this dashboard to express workforce sizes. 1 Cr = 10M workers.",
    category: "Data",
  },
  {
    term: "Lakh (L)",
    abbr: null,
    definition:
      "Indian numbering unit equal to 100,000. Used in wage displays — e.g., ₹1.5L = ₹150,000.",
    category: "Data",
  },
];

const CATEGORIES = ["All", "AI", "Labour", "Data"];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = GLOSSARY.filter((g) => {
    const matchesCat = cat === "All" || g.category === cat;
    const matchesSearch =
      !search ||
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      (g.abbr && g.abbr.toLowerCase().includes(search.toLowerCase())) ||
      g.definition.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="h-full overflow-y-auto p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-white">Glossary</h1>
        <Link
          to="/treemap"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to dashboard
        </Link>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Key terms and definitions used across the AI Exposure dashboard.
      </p>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 w-64"
        />
        <div className="flex gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium ${
                cat === c
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="space-y-3">
        {filtered.map((g) => (
          <div key={g.term} className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">{g.term}</span>
              {g.abbr && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[10px] font-bold">
                  {g.abbr}
                </span>
              )}
              <span className="ml-auto px-1.5 py-0.5 rounded bg-white/5 text-gray-600 text-[9px] uppercase tracking-wider">
                {g.category}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {g.definition}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-600 text-sm py-8">
            No matching terms found.
          </div>
        )}
      </div>
    </div>
  );
}
