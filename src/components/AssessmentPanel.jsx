import { useState, useMemo, useRef } from "react";
import {
  exposureCSS,
  exposureLabel,
  formatNumber,
  formatCrore,
} from "../utils/colors";
import { MiniChart } from "./TrendPanel";

export default function AssessmentPanel({
  data,
  selectedIndustry,
  setSelectedIndustry,
}) {
  const { assessment, industries, occupations, summary } = data;
  const [sortBy, setSortBy] = useState("exposure"); // exposure | workers

  const sortedIndustries = useMemo(
    () =>
      [...industries].sort((a, b) =>
        sortBy === "exposure"
          ? b.ai_exposure - a.ai_exposure
          : b.workers_millions - a.workers_millions,
      ),
    [industries, sortBy],
  );

  const sortedOccupations = useMemo(
    () => [...occupations].sort((a, b) => b.ai_exposure - a.ai_exposure),
    [occupations],
  );

  // Tier distribution
  const tierData = useMemo(() => {
    const tiers = [
      { label: "Minimal (0-2)", min: 0, max: 2, color: "#22c55e" },
      { label: "Low (2-4)", min: 2, max: 4, color: "#84cc16" },
      { label: "Moderate (4-6)", min: 4, max: 6, color: "#f59e0b" },
      { label: "High (6-8)", min: 6, max: 8, color: "#f97316" },
      { label: "Very High (8-10)", min: 8, max: 10, color: "#ef4444" },
    ];
    return tiers.map((t) => {
      const inds = industries.filter(
        (i) => i.ai_exposure > t.min && i.ai_exposure <= t.max,
      );
      // edge case: 0 exposure falls in first bucket
      if (t.min === 0) {
        const zeros = industries.filter((i) => i.ai_exposure === 0);
        inds.push(...zeros.filter((i) => !inds.includes(i)));
      }
      const workers = inds.reduce((s, i) => s + i.workers_millions, 0);
      return { ...t, count: inds.length, workers, industries: inds };
    });
  }, [industries]);

  const totalWorkers = summary.total_workers_millions;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Methodology header */}
      <div className="glass-panel p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-200 mb-1">
              {assessment?.basis || "Single-Axis AI Exposure Rubric"}
            </h2>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {assessment?.description}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black text-amber-400">
              {summary.weighted_avg_exposure}
            </div>
            <div className="text-[10px] text-gray-600">Weighted Avg /10</div>
          </div>
        </div>
      </div>

      {/* Key AI Exposure Insights */}
      {(() => {
        const minTier = tierData[0];
        const highTiers = tierData.slice(3);
        const highWorkers = highTiers.reduce((s, t) => s + t.workers, 0);
        const highPct = ((highWorkers / totalWorkers) * 100).toFixed(0);
        const topInd = [...industries].sort(
          (a, b) => b.ai_exposure - a.ai_exposure,
        )[0];
        const biggestInd = [...industries].sort(
          (a, b) => b.workers_millions - a.workers_millions,
        )[0];
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass-panel p-4 border-l-2 border-amber-500/40">
              <div className="text-[10px] uppercase tracking-widest text-amber-400 mb-1">
                High + Very High Exposure
              </div>
              <div className="text-xl font-black text-amber-400">
                {highPct}%
              </div>
              <div className="text-[10px] text-gray-500">
                {highWorkers.toFixed(0)}M workers in industries scored 6+ face
                significant AI disruption potential
              </div>
            </div>
            <div className="glass-panel p-4 border-l-2 border-red-500/40">
              <div className="text-[10px] uppercase tracking-widest text-red-400 mb-1">
                Most Exposed Industry
              </div>
              <div className="text-sm font-bold text-red-400">
                {topInd?.name}
              </div>
              <div className="text-[10px] text-gray-500">
                Score {topInd?.ai_exposure}/10 —{" "}
                {topInd?.ai_rationale?.slice(0, 80)}
              </div>
            </div>
            <div className="glass-panel p-4 border-l-2 border-green-500/40">
              <div className="text-[10px] uppercase tracking-widest text-green-400 mb-1">
                Largest Workforce
              </div>
              <div className="text-sm font-bold text-green-400">
                {biggestInd?.name}
              </div>
              <div className="text-[10px] text-gray-500">
                {formatNumber(biggestInd?.workers_millions)} workers · Exposure:{" "}
                {biggestInd?.ai_exposure}/10 (
                {exposureLabel(biggestInd?.ai_exposure)})
              </div>
            </div>
          </div>
        );
      })()}

      {/* Signal weights */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {assessment?.signals?.map((signal) => (
          <div key={signal.label} className="glass-panel p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-600">
                {signal.label}
              </span>
              <span className="text-xs font-bold text-indigo-400">
                {signal.weight}%
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-indigo-500/60"
                style={{ width: `${signal.weight}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              {signal.description}
            </p>
          </div>
        ))}
      </div>

      {/* Tier distribution */}
      <div className="glass-panel p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Workforce by Exposure Tier
        </h3>
        {/* Stacked bar */}
        <div className="h-6 rounded-full overflow-hidden bg-white/5 flex mb-4">
          {tierData.map((t) => (
            <div
              key={t.label}
              style={{
                width: `${(t.workers / totalWorkers) * 100}%`,
                background: t.color,
                opacity: 0.7,
              }}
              title={`${t.label}: ${t.workers.toFixed(0)}M`}
            />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {tierData.map((t) => (
            <div key={t.label} className="text-center">
              <div className="text-lg font-black" style={{ color: t.color }}>
                {t.workers.toFixed(0)}M
              </div>
              <div className="text-[9px] text-gray-600">{t.label}</div>
              <div className="text-[10px] text-gray-500">
                {t.count} industries
              </div>
              <div className="text-[10px] text-gray-600">
                {((t.workers / totalWorkers) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scatter plot */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
            Industry Exposure vs Workforce
          </h3>
          <span className="text-[9px] text-gray-600">
            x = worker share% · y = exposure score · size = absolute workforce
          </span>
        </div>
        <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">
          Industries in the upper-left are highly exposed but employ fewer
          workers — targets for upskilling programs. Those in the lower-right
          are large employers with low AI risk — the backbone of India's labour
          market. Click any bubble to drill down.
        </p>
        <IndustryScatter
          industries={industries}
          selectedIndustry={selectedIndustry}
          onSelect={setSelectedIndustry}
        />
      </div>

      {/* Industry drill-down */}
      {selectedIndustry &&
        (() => {
          const ind = industries.find((i) => i.code === selectedIndustry);
          if (!ind) return null;
          const sameTier = industries
            .filter(
              (i) =>
                i.code !== ind.code &&
                Math.abs(i.ai_exposure - ind.ai_exposure) <= 1,
            )
            .slice(0, 4);
          return (
            <div className="glass-panel p-4 border border-indigo-500/20 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{
                        background: exposureCSS(ind.ai_exposure, 0.2),
                        color: exposureCSS(ind.ai_exposure),
                      }}
                    >
                      {ind.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {ind.name}
                      </h3>
                      <span className="text-[10px] text-gray-500">
                        {ind.sector}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIndustry(null)}
                  className="text-gray-600 hover:text-gray-300 text-xs px-2 py-1 rounded hover:bg-white/5"
                >
                  ✕ Close
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-0.5">
                    AI Exposure
                  </div>
                  <div
                    className="text-xl font-black"
                    style={{ color: exposureCSS(ind.ai_exposure) }}
                  >
                    {ind.ai_exposure}
                    <span className="text-xs text-gray-500">/10</span>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {exposureLabel(ind.ai_exposure)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-0.5">
                    Workers
                  </div>
                  <div className="text-xl font-black text-gray-200">
                    {formatNumber(ind.workers_millions)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {ind.worker_pct}% of workforce
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-0.5">
                    Sector
                  </div>
                  <div className="text-sm font-semibold text-gray-300">
                    {ind.sector}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-0.5">
                    Rank
                  </div>
                  <div className="text-xl font-black text-gray-200">
                    #
                    {[...industries]
                      .sort((a, b) => b.ai_exposure - a.ai_exposure)
                      .findIndex((i) => i.code === ind.code) + 1}
                  </div>
                  <div className="text-[10px] text-gray-500">by exposure</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed mb-3 border-l-2 pl-3 border-indigo-500/30">
                {ind.ai_rationale}
              </div>
              {ind.trend?.length > 0 && (
                <div className="mb-3">
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-2">
                    Workforce Trend
                  </div>
                  <MiniChart
                    label=""
                    data={ind.trend}
                    color={exposureCSS(ind.ai_exposure)}
                    unit="%"
                  />
                </div>
              )}
              {sameTier.length > 0 && (
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-2">
                    Similar Exposure Industries
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sameTier.map((si) => (
                      <button
                        key={si.code}
                        onClick={() => setSelectedIndustry(si.code)}
                        className="px-2 py-1 rounded-lg text-[10px] bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-all"
                      >
                        <span
                          className="font-bold mr-1"
                          style={{ color: exposureCSS(si.ai_exposure) }}
                        >
                          {si.ai_exposure}
                        </span>
                        {si.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Industry list */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
              Industry AI Exposure Scores
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setSortBy("exposure")}
                className={`px-2 py-1 rounded text-[10px] font-medium ${
                  sortBy === "exposure"
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                By Exposure
              </button>
              <button
                onClick={() => setSortBy("workers")}
                className={`px-2 py-1 rounded text-[10px] font-medium ${
                  sortBy === "workers"
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                By Workers
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {sortedIndustries.map((ind) => (
              <div
                key={ind.code}
                className="flex items-start gap-2 text-[11px] cursor-pointer rounded-lg px-1 py-0.5 hover:bg-white/5 transition-colors"
                onClick={() =>
                  setSelectedIndustry(
                    ind.code === selectedIndustry ? null : ind.code,
                  )
                }
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: exposureCSS(ind.ai_exposure, 0.2),
                    color: exposureCSS(ind.ai_exposure),
                  }}
                >
                  {ind.code}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium truncate">
                      {ind.name}
                    </span>
                    <span
                      className="font-bold ml-2 flex-shrink-0"
                      style={{ color: exposureCSS(ind.ai_exposure) }}
                    >
                      {ind.ai_exposure}
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-600 mt-0.5">
                    {ind.ai_rationale}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(ind.ai_exposure / 10) * 100}%`,
                          background: exposureCSS(ind.ai_exposure, 0.6),
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-600">
                      {ind.worker_pct}% · {formatNumber(ind.workers_millions)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Occupation list */}
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
            Occupation AI Exposure Scores
          </h3>
          <div className="space-y-2">
            {sortedOccupations.map((occ) => (
              <div
                key={occ.code}
                className="flex items-start gap-2 text-[11px]"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: exposureCSS(occ.ai_exposure, 0.2),
                    color: exposureCSS(occ.ai_exposure),
                  }}
                >
                  {occ.code}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium truncate">
                      {occ.name}
                    </span>
                    <span
                      className="font-bold ml-2 flex-shrink-0"
                      style={{ color: exposureCSS(occ.ai_exposure) }}
                    >
                      {occ.ai_exposure}
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-600 mt-0.5">
                    {occ.ai_rationale}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(occ.ai_exposure / 10) * 100}%`,
                          background: exposureCSS(occ.ai_exposure, 0.6),
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-600">
                      {occ.worker_pct}% · {formatNumber(occ.workers_millions)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier definitions */}
      <div className="glass-panel p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Exposure Tier Definitions
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {assessment?.tier_definitions?.map((tier) => (
            <div key={tier.label} className="text-center">
              <div
                className="text-sm font-bold mb-1"
                style={{
                  color: exposureCSS(
                    tier.range === "0-2"
                      ? 1
                      : tier.range === "2-4"
                        ? 3
                        : tier.range === "4-6"
                          ? 5
                          : tier.range === "6-8"
                            ? 7
                            : 9,
                  ),
                }}
              >
                {tier.label}
              </div>
              <div className="text-[10px] text-gray-600">{tier.range}</div>
              <p className="text-[9px] text-gray-600 mt-1">
                {tier.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key takeaway */}
      <div className="glass-panel p-4 border-l-2 border-brand-cyan/40">
        <h3 className="text-xs font-semibold text-brand-cyan mb-2">
          Key Takeaway
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          India's AI exposure is concentrated in its services sector — financial
          services, information & communication, and professional activities
          face the highest disruption potential. However, the bulk of India's
          workforce remains in agriculture and construction, where AI exposure
          is minimal to low. This creates a dual challenge: preparing the
          services sector workforce for AI-augmented work while ensuring the
          vast low-exposure workforce benefits from productivity gains rather
          than being left behind.
        </p>
      </div>

      {/* Coverage note */}
      <div className="text-[10px] text-gray-600 text-center p-2">
        {assessment?.coverage_note}
      </div>
    </div>
  );
}

function IndustryScatter({ industries, selectedIndustry, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);
  const width = 700;
  const height = 350;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 32;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const xMax = Math.max(...industries.map((i) => i.worker_pct)) * 1.1;
  const yMax = 10;

  const scaleX = (v) => padLeft + (v / xMax) * chartW;
  const scaleY = (v) => padTop + chartH - (v / yMax) * chartH;

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * width;
    const sy = ((e.clientY - rect.top) / rect.height) * height;
    let closest = null;
    let minDist = 30;
    for (const ind of industries) {
      const cx = scaleX(ind.worker_pct);
      const cy = scaleY(ind.ai_exposure);
      const dist = Math.sqrt((sx - cx) ** 2 + (sy - cy) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = {
          ind,
          cx,
          cy,
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top,
        };
      }
    }
    setHovered(closest);
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
        onClick={() => {
          if (hovered && onSelect) {
            onSelect(
              hovered.ind.code === selectedIndustry ? null : hovered.ind.code,
            );
          }
        }}
        style={{ cursor: hovered ? "pointer" : "default" }}
      >
        {/* Grid */}
        {Array.from({ length: 6 }, (_, i) => {
          const yVal = (yMax / 5) * i;
          const y = scaleY(yVal);
          return (
            <g key={`y${i}`}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="rgba(255,255,255,0.04)"
              />
              <text
                x={padLeft - 6}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#555"
                fontSize="9"
              >
                {yVal}
              </text>
            </g>
          );
        })}

        {/* Tier background bands */}
        <rect
          x={padLeft}
          y={scaleY(2)}
          width={chartW}
          height={scaleY(0) - scaleY(2)}
          fill="#22c55e"
          opacity="0.04"
        />
        <rect
          x={padLeft}
          y={scaleY(4)}
          width={chartW}
          height={scaleY(2) - scaleY(4)}
          fill="#84cc16"
          opacity="0.04"
        />
        <rect
          x={padLeft}
          y={scaleY(6)}
          width={chartW}
          height={scaleY(4) - scaleY(6)}
          fill="#f59e0b"
          opacity="0.04"
        />
        <rect
          x={padLeft}
          y={scaleY(8)}
          width={chartW}
          height={scaleY(6) - scaleY(8)}
          fill="#f97316"
          opacity="0.04"
        />
        <rect
          x={padLeft}
          y={scaleY(10)}
          width={chartW}
          height={scaleY(8) - scaleY(10)}
          fill="#ef4444"
          opacity="0.04"
        />

        {/* Industry bubbles */}
        {industries.map((ind) => {
          const cx = scaleX(ind.worker_pct);
          const cy = scaleY(ind.ai_exposure);
          const r = 5 + Math.sqrt(ind.workers_millions) * 0.9;
          const selected = selectedIndustry === ind.code;
          const isHovered = hovered?.ind.code === ind.code;
          return (
            <g key={ind.code}>
              {/* Glow effect for high exposure */}
              {ind.ai_exposure >= 6 && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 4}
                  fill="none"
                  stroke={exposureCSS(ind.ai_exposure, 0.2)}
                  strokeWidth={1}
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? r + 2 : r}
                fill={exposureCSS(
                  ind.ai_exposure,
                  isHovered ? 0.9 : selected ? 0.85 : 0.55,
                )}
                stroke={
                  selected
                    ? "#fff"
                    : isHovered
                      ? exposureCSS(ind.ai_exposure)
                      : "rgba(255,255,255,0.12)"
                }
                strokeWidth={selected ? 2 : isHovered ? 1.5 : 0.5}
                style={{ transition: "r 0.15s, fill 0.15s" }}
              />
            </g>
          );
        })}

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 4}
          textAnchor="middle"
          fill="#666"
          fontSize="9"
        >
          Worker Share (%)
        </text>
        <text
          x={12}
          y={height / 2}
          textAnchor="middle"
          fill="#666"
          fontSize="9"
          transform={`rotate(-90, 12, ${height / 2})`}
        >
          AI Exposure (0-10)
        </text>
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute z-30 glass-panel p-3 pointer-events-none animate-fade-in"
          style={{
            left: Math.min(
              hovered.screenX + 12,
              svgRef.current?.clientWidth - 220 || 0,
            ),
            top: hovered.screenY - 10,
          }}
        >
          <div className="font-semibold text-white text-sm mb-1">
            {hovered.ind.name}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
            <span className="text-gray-500">AI Exposure</span>
            <span
              className="text-right font-bold"
              style={{ color: exposureCSS(hovered.ind.ai_exposure) }}
            >
              {hovered.ind.ai_exposure}/10 (
              {exposureLabel(hovered.ind.ai_exposure)})
            </span>
            <span className="text-gray-500">Workers</span>
            <span className="text-right text-gray-300">
              {formatNumber(hovered.ind.workers_millions)}
            </span>
            <span className="text-gray-500">Share</span>
            <span className="text-right text-gray-300">
              {hovered.ind.worker_pct}%
            </span>
          </div>
          <div className="text-[9px] text-gray-500 mt-1.5 border-t border-white/5 pt-1">
            {hovered.ind.ai_rationale}
          </div>
        </div>
      )}
    </div>
  );
}
