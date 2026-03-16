import { useMemo } from "react";
import { Link } from "react-router-dom";
import { exposureCSS, exposureLabel, formatNumber } from "../utils/colors";

const REPORT_CARDS = [
  {
    to: "/treemap",
    icon: "▦",
    title: "Industry × Occupation Treemap",
    desc: "Visual map of 564M workers across 20 industries and 9 occupations, sized by workforce and coloured by AI exposure.",
  },
  {
    to: "/assessment",
    icon: "🤖",
    title: "AI Exposure Analysis",
    desc: "Methodology, scatter plot, drill-down into individual industries, and exposure tier distribution.",
  },
  {
    to: "/state-vulnerability",
    icon: "🗺",
    title: "State AI Vulnerability",
    desc: "Composite AI exposure index for 36 states — ranking, 7-year trend, and industry-mix breakdown.",
  },
  {
    to: "/vulnerability-matrix",
    icon: "⚠",
    title: "Vulnerability Matrix",
    desc: "Cross-reference AI exposure with informal employment to identify the most at-risk states.",
  },
  {
    to: "/trends",
    icon: "📈",
    title: "National Trends",
    desc: "LFPR, WPR, unemployment rate time series with gender breakdowns over 7 years.",
  },
  {
    to: "/demographics",
    icon: "👥",
    title: "Demographics",
    desc: "Education, age, sector, religion and social category breakdowns of the labour force.",
  },
  {
    to: "/states",
    icon: "📊",
    title: "State Profiles",
    desc: "LFPR, WPR, unemployment by state with gender and trend comparisons.",
  },
  {
    to: "/employment",
    icon: "💼",
    title: "Employment Structure",
    desc: "Self-employment, regular, casual splits and working conditions across sectors.",
  },
  {
    to: "/wages",
    icon: "₹",
    title: "Wages & Gender Gap",
    desc: "Regular, casual and self-employment wages with gender gaps and state wage rankings.",
  },
];

export default function HomePage({ data, stateAI }) {
  const { summary, industries } = data;

  const kpis = useMemo(() => {
    const highPct = industries
      .filter((i) => i.ai_exposure >= 6)
      .reduce((s, i) => s + i.worker_pct, 0);
    const topInd = [...industries].sort(
      (a, b) => b.ai_exposure - a.ai_exposure,
    )[0];
    const topState = stateAI?.states?.[0];
    const bottomState = stateAI?.states?.[stateAI.states.length - 1];
    return { highPct, topInd, topState, bottomState };
  }, [industries, stateAI]);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Hero */}
      <div className="glass-panel p-6 border-l-2 border-brand-cyan/40">
        <h1 className="text-lg md:text-xl font-bold text-white mb-2">
          AI Exposure of India's Job Market
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
          An interactive exploration of how artificial intelligence intersects
          with India's {formatNumber(summary.total_workers_millions)}-strong
          workforce. Built from the Periodic Labour Force Survey (PLFS){" "}
          {summary.data_year} covering {summary.num_industries} NIC industry
          sections and {summary.num_occupations} NCO occupation divisions.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI
          label="Total Workforce"
          value={formatNumber(summary.total_workers_millions)}
          sub={`${summary.num_industries} industries · ${summary.num_occupations} occupations`}
          color="#00F5FF"
        />
        <KPI
          label="Weighted Avg Exposure"
          value={`${summary.weighted_avg_exposure}/10`}
          sub={exposureLabel(summary.weighted_avg_exposure)}
          color={exposureCSS(summary.weighted_avg_exposure)}
        />
        <KPI
          label="High + Very High Exposed"
          value={`${Math.round(kpis.highPct)}%`}
          sub={`${formatNumber(summary.high_exposure_workers_millions)} workers at score 6+`}
          color="#f97316"
        />
        <KPI
          label="Most Exposed Industry"
          value={kpis.topInd?.name?.split(" ")[0]}
          sub={`${kpis.topInd?.ai_exposure}/10 — ${formatNumber(kpis.topInd?.workers_millions)}`}
          color={exposureCSS(kpis.topInd?.ai_exposure)}
        />
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

      {/* Report cards grid */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Reports & Explorations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {REPORT_CARDS.map((card) => (
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
        Data: Periodic Labour Force Survey (PLFS) {summary.data_year} • Ministry
        of Statistics and Programme Implementation (MoSPI) • AI exposure scores
        derived from ILO/OECD task-based methodology
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
