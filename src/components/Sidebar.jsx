import {
  exposureCSS,
  exposureLabel,
  formatCrore,
  formatRupees,
} from "../utils/colors";

const TIERS = [
  { label: "Minimal", range: "0-2", min: 0, max: 2 },
  { label: "Low", range: "2-4", min: 2, max: 4 },
  { label: "Moderate", range: "4-6", min: 4, max: 6 },
  { label: "High", range: "6-8", min: 6, max: 8 },
  { label: "Very High", range: "8-10", min: 8, max: 10 },
];

export default function Sidebar({
  data,
  selectedIndustry,
  setSelectedIndustry,
}) {
  const { summary, industries, employment_status } = data;

  // Compute tier breakdown
  const tierData = TIERS.map((tier) => {
    const inds = industries.filter(
      (i) => i.ai_exposure >= tier.min && i.ai_exposure < tier.max + 0.01,
    );
    const workers = inds.reduce((s, i) => s + i.workers_millions, 0);
    return {
      ...tier,
      workers,
      pct: (workers / summary.total_workers_millions) * 100,
    };
  });

  // Histogram: 11 bins (0-10)
  const histBins = Array.from({ length: 11 }, (_, i) => {
    const workers = industries
      .filter((ind) => Math.round(ind.ai_exposure) === i)
      .reduce((s, ind) => s + ind.workers_millions, 0);
    return workers;
  });
  const histMax = Math.max(...histBins);

  return (
    <aside className="w-56 flex-shrink-0 bg-dark-800 border-r border-white/5 flex flex-col overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-sm font-bold leading-tight">
            <span className="gradient-text">AI Exposure</span>
            <br />
            <span className="text-gray-400 font-normal text-xs">
              of India's Job Market
            </span>
          </h2>
          <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
            {summary.num_industries} industries · {summary.num_occupations}{" "}
            occupation groups
            <br />
            area = PLFS industry workforce
            <br />
            color = AI exposure score (0–10)
          </p>
        </div>

        {/* Total workers */}
        <StatBlock label="Total Workforce">
          <div className="text-2xl font-black stat-glow tracking-tight">
            {formatCrore(summary.total_workers_millions)}
          </div>
          <div className="text-[10px] text-gray-500">
            {summary.total_workers_millions}M workers
          </div>
        </StatBlock>

        {/* Avg exposure */}
        <StatBlock label="Weighted Avg. Exposure">
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-black stat-glow"
              style={{ color: exposureCSS(summary.weighted_avg_exposure) }}
            >
              {summary.weighted_avg_exposure}
            </span>
            <span className="text-xs text-gray-500">/10</span>
          </div>
          <div className="text-[10px] text-gray-500">
            {exposureLabel(summary.weighted_avg_exposure)} · job-weighted
          </div>
        </StatBlock>

        {/* Histogram */}
        <StatBlock label="Jobs by AI exposure score">
          <div className="flex items-end gap-[2px] h-10">
            {histBins.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm min-h-[1px] transition-all"
                style={{
                  height: `${histMax > 0 ? (val / histMax) * 100 : 0}%`,
                  background: exposureCSS(i, 0.7),
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[8px] text-gray-600 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </StatBlock>

        {/* Tier breakdown */}
        <StatBlock label="Breakdown by tier">
          <div className="space-y-1.5">
            {tierData.map((tier) => (
              <div
                key={tier.label}
                className="flex items-center gap-1.5 text-[11px]"
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: exposureCSS((tier.min + tier.max) / 2) }}
                />
                <span className="text-gray-500 flex-1">{tier.label}</span>
                <span className="text-gray-400 font-medium">
                  {formatCrore(tier.workers)}
                </span>
                <span className="text-gray-600 w-8 text-right text-[10px]">
                  {tier.pct.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </StatBlock>

        {/* Employment structure */}
        <StatBlock label="Employment type">
          <div className="space-y-1.5">
            {Object.entries(employment_status || {}).map(
              ([label, yearData]) => {
                const latest = yearData?.[yearData.length - 1]?.value;
                if (latest == null) return null;
                return (
                  <div key={label} className="text-[11px]">
                    <div className="flex justify-between text-gray-500 mb-0.5">
                      <span>{label}</span>
                      <span className="text-gray-400">{latest}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${latest}%`,
                          background:
                            "linear-gradient(90deg, rgba(41,50,255,0.5), rgba(168,56,255,0.5))",
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </StatBlock>

        {/* Wages */}
        <StatBlock label="Avg Wages (2023-24)">
          <div className="space-y-1">
            <WageRow
              label="Regular/mo"
              value={data.wages?.regular_monthly?.latest_person}
            />
            <WageRow
              label="Casual/day"
              value={data.wages?.casual_daily?.latest_person}
            />
            <WageRow
              label="Self-emp/mo"
              value={data.wages?.self_employment_monthly?.latest_person}
            />
          </div>
        </StatBlock>

        {/* Gradient legend */}
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span>Safe</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden flex">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ background: exposureCSS(i * 0.5) }}
              />
            ))}
          </div>
          <span>Exposed</span>
        </div>
      </div>
    </aside>
  );
}

function StatBlock({ label, children }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-[9px] font-semibold uppercase tracking-widest text-gray-600">
        {label}
      </h3>
      {children}
    </div>
  );
}

function WageRow({ label, value }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-medium">{formatRupees(value)}</span>
    </div>
  );
}
