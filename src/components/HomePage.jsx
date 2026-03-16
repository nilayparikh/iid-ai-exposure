import { useMemo } from "react";
import { Link } from "react-router-dom";
import { exposureCSS, exposureLabel, formatNumber } from "../utils/colors";

const EXPLORE_CARDS = [
  {
    to: "/treemap",
    icon: "▦",
    title: "Exposure Map",
    desc: "Interactive treemap of 20 industries × 9 occupations — area = workforce, colour = AI exposure score.",
  },
  {
    to: "/industries",
    icon: "🏭",
    title: "Industry & Occupation Scores",
    desc: "Detailed AI exposure scores for every NIC industry and NCO occupation with drill-down analysis.",
  },
  {
    to: "/states",
    icon: "🗺",
    title: "State Risk Analysis",
    desc: "State AI vulnerability ranking, risk matrix, and state profiles — identify the most at-risk regions.",
  },
  {
    to: "/workforce",
    icon: "📈",
    title: "AI Exposure Dimensions",
    desc: "Direct exposure pressure, sector drivers, exposed occupations, and labeled proxy filters for readiness and transition gaps.",
  },
  {
    to: "/wages",
    icon: "₹",
    title: "Wage Impact",
    desc: "Wage distributions across employment types, gender gaps, and state-wise wage rankings.",
  },
  {
    to: "/methodology",
    icon: "📐",
    title: "Methodology",
    desc: "Full scoring framework, signal weights, formulas, industry rationales, data pipeline, and references.",
  },
];

export default function HomePage({ data, stateAI }) {
  const { summary, industries } = data;

  const kpis = useMemo(() => {
    const highExposed = industries.filter((i) => i.ai_exposure >= 6);
    const highPct = highExposed.reduce((s, i) => s + i.worker_pct, 0);
    const modExposed = industries.filter(
      (i) => i.ai_exposure >= 4 && i.ai_exposure < 6,
    );
    const modPct = modExposed.reduce((s, i) => s + i.worker_pct, 0);
    const topInd = [...industries].sort(
      (a, b) => b.ai_exposure - a.ai_exposure,
    )[0];
    return { highPct, modPct, topInd };
  }, [industries]);

  /* Tier distribution from industry data */
  const tiers = useMemo(() => {
    const buckets = {
      Minimal: 0,
      Low: 0,
      Moderate: 0,
      High: 0,
      "Very High": 0,
    };
    for (const ind of industries) {
      const t = exposureLabel(ind.ai_exposure);
      buckets[t] = (buckets[t] || 0) + ind.worker_pct;
    }
    return Object.entries(buckets).map(([label, pct]) => ({ label, pct }));
  }, [industries]);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Hero */}
      <div className="glass-panel p-6 border-l-2 border-brand-cyan/40">
        <h1 className="text-lg md:text-xl font-bold text-white mb-2">
          AI Exposure of India's Job Market
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
          How exposed is India's {formatNumber(summary.total_workers_millions)}
          -strong workforce to artificial intelligence? This analysis applies a
          Karpathy-inspired 0–10 scoring rubric to {summary.num_industries} NIC
          industry sections and {summary.num_occupations} NCO occupation
          divisions from the Periodic Labour Force Survey (PLFS){" "}
          {summary.data_year}, mapping each worker to an AI exposure tier.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI
          label="Total Workforce Analyzed"
          value={formatNumber(summary.total_workers_millions)}
          sub={`${summary.num_industries} industries · ${summary.num_occupations} occupations`}
          color="#00F5FF"
        />
        <KPI
          label="Weighted Avg AI Exposure"
          value={`${summary.weighted_avg_exposure}/10`}
          sub={exposureLabel(summary.weighted_avg_exposure)}
          color={exposureCSS(summary.weighted_avg_exposure)}
        />
        <KPI
          label="High + Very High Tier"
          value={`${Math.round(kpis.highPct)}%`}
          sub={`${formatNumber(summary.high_exposure_workers_millions)} workers at score 6+`}
          color="#f97316"
        />
        <KPI
          label="Most Exposed Industry"
          value={kpis.topInd?.name?.split(" ")[0]}
          sub={`Score ${kpis.topInd?.ai_exposure}/10 · ${formatNumber(kpis.topInd?.workers_millions)}`}
          color={exposureCSS(kpis.topInd?.ai_exposure)}
        />
      </div>

      {/* Key Findings */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Key Findings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="glass-panel p-4 border-l-2 border-green-500/30">
            <h3 className="text-xs font-semibold text-green-400 mb-1">
              Agriculture Anchors Low Exposure
            </h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              ~46% of India's workforce is in agriculture (score 2.0), pulling
              the national average well below the US equivalent. This enormous
              physical-labour base provides a structural buffer against
              immediate AI disruption.
            </p>
          </div>
          <div className="glass-panel p-4 border-l-2 border-red-500/30">
            <h3 className="text-xs font-semibold text-red-400 mb-1">
              Service Sector Faces Highest Risk
            </h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Information & Communication (8.5), Finance (8.0), and Professional
              Services (7.5) sit at the frontier of AI disruption. Workers in
              these sectors already see productivity tools that can replace
              routine knowledge tasks.
            </p>
          </div>
          <div className="glass-panel p-4 border-l-2 border-amber-500/30">
            <h3 className="text-xs font-semibold text-amber-400 mb-1">
              State Disparity is Stark
            </h3>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              {stateAI ? (
                <>
                  {stateAI.states[0].name} ({stateAI.states[0].ai_index}) vs{" "}
                  {stateAI.states[stateAI.states.length - 1].name} (
                  {stateAI.states[stateAI.states.length - 1].ai_index}) — a{" "}
                  {(
                    stateAI.states[0].ai_index -
                    stateAI.states[stateAI.states.length - 1].ai_index
                  ).toFixed(1)}
                  -point gap driven by radically different industry mixes.
                </>
              ) : (
                "States with service-heavy economies (Delhi, Chandigarh) score far higher than agriculture-dominated states."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tier Distribution Bar */}
      <div className="glass-panel p-4">
        <h3 className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
          Workforce by AI Exposure Tier
        </h3>
        <div className="flex rounded-lg overflow-hidden h-8 mb-2">
          {tiers.map((t) => {
            const colors = {
              Minimal: "#22c55e",
              Low: "#84cc16",
              Moderate: "#f59e0b",
              High: "#f97316",
              "Very High": "#ef4444",
            };
            return t.pct > 0 ? (
              <div
                key={t.label}
                className="flex items-center justify-center text-[9px] font-bold transition-all"
                style={{
                  width: `${t.pct}%`,
                  background: colors[t.label] + "30",
                  color: colors[t.label],
                }}
                title={`${t.label}: ${t.pct.toFixed(1)}%`}
              >
                {t.pct > 5 ? `${Math.round(t.pct)}%` : ""}
              </div>
            ) : null;
          })}
        </div>
        <div className="flex flex-wrap gap-3 text-[10px]">
          {tiers.map((t) => {
            const colors = {
              Minimal: "#22c55e",
              Low: "#84cc16",
              Moderate: "#f59e0b",
              High: "#f97316",
              "Very High": "#ef4444",
            };
            return (
              <span key={t.label} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: colors[t.label] }}
                />
                <span className="text-gray-400">{t.label}</span>
                <span
                  style={{ color: colors[t.label] }}
                  className="font-semibold"
                >
                  {t.pct.toFixed(1)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* State AI index summary (if data loaded) */}
      {stateAI && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="glass-panel p-4">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
              Highest State AI Exposure
            </h3>
            <div className="space-y-1.5">
              {stateAI.states.slice(0, 5).map((s) => (
                <StateBar
                  key={s.name}
                  state={s}
                  max={stateAI.states[0].ai_index}
                />
              ))}
            </div>
          </div>
          <div className="glass-panel p-4">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
              Lowest State AI Exposure
            </h3>
            <div className="space-y-1.5">
              {stateAI.states
                .slice(-5)
                .reverse()
                .map((s) => (
                  <StateBar
                    key={s.name}
                    state={s}
                    max={stateAI.states[0].ai_index}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Explore cards */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Explore the Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {EXPLORE_CARDS.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="glass-panel p-4 hover:bg-white/[0.04] transition-colors group block"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors mb-1">
                    {card.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-xs mt-0.5">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Data source note */}
      <div className="text-[10px] text-gray-600 text-center p-2 leading-relaxed">
        Data: Periodic Labour Force Survey (PLFS) {summary.data_year} · Ministry
        of Statistics and Programme Implementation (MoSPI) · AI exposure scores
        adapted from{" "}
        <a
          href="https://karpathy.ai/jobs/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300"
        >
          Karpathy's framework
        </a>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, color }) {
  return (
    <div
      className="glass-panel p-3 border-t-2"
      style={{ borderColor: color + "40" }}
    >
      <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">
        {label}
      </div>
      <div className="text-xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>
    </div>
  );
}

function StateBar({ state, max }) {
  const pct = (state.ai_index / max) * 100;
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-gray-400 w-28 truncate flex-shrink-0">
        {state.name}
      </span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: exposureCSS(state.ai_index, 0.6),
          }}
        />
      </div>
      <span
        className="font-bold w-7 text-right flex-shrink-0"
        style={{ color: exposureCSS(state.ai_index) }}
      >
        {state.ai_index}
      </span>
    </div>
  );
}
