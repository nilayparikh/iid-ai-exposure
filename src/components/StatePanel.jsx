import { useState } from "react";
import { exposureCSS } from "../utils/colors";

export default function StatePanel({ data }) {
  const { states } = data;
  const [metric, setMetric] = useState("lfpr"); // lfpr | ur
  const [sortBy, setSortBy] = useState("name");

  const sorted = [...states].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "lfpr") return (b.lfpr_latest || 0) - (a.lfpr_latest || 0);
    if (sortBy === "ur") return (b.ur_latest || 0) - (a.ur_latest || 0);
    return 0;
  });

  const maxLfpr = Math.max(...states.map((s) => s.lfpr_latest || 0));
  const maxUr = Math.max(...states.map((s) => s.ur_latest || 0));

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[
            { id: "lfpr", label: "LFPR" },
            { id: "ur", label: "Unemployment" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                metric === m.id
                  ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                  : "border-white/5 bg-white/5 text-gray-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-gray-600">Sort:</div>
        <div className="flex gap-1">
          {[
            { id: "name", label: "A-Z" },
            { id: "lfpr", label: "LFPR" },
            { id: "ur", label: "UR" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-2 py-1 rounded text-[10px] font-medium ${
                sortBy === s.id
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* State cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sorted.map((state) => (
          <StateCard
            key={state.name}
            state={state}
            metric={metric}
            maxLfpr={maxLfpr}
            maxUr={maxUr}
          />
        ))}
      </div>

      {/* Summary bubble chart */}
      <div className="glass-panel p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          LFPR vs Unemployment Rate by State
        </h3>
        <ScatterPlot states={states} />
      </div>
    </div>
  );
}

function StateCard({ state, metric, maxLfpr, maxUr }) {
  const value = metric === "lfpr" ? state.lfpr_latest : state.ur_latest;
  const max = metric === "lfpr" ? maxLfpr : maxUr;
  const color = metric === "lfpr" ? "#6366f1" : "#ef4444";

  return (
    <div className="glass-panel p-3 hover:bg-white/5 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-300 truncate pr-2">
          {state.name}
        </span>
        <span className="text-xs font-bold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%`, background: color + "aa" }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-gray-600">
        <span>LFPR: {state.lfpr_latest}%</span>
        <span>UR: {state.ur_latest}%</span>
      </div>
    </div>
  );
}

function ScatterPlot({ states }) {
  const svgRef = (svg) => {
    if (!svg) return;
    const w = svg.clientWidth;
    const h = 300;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const padLeft = 50,
      padRight = 20,
      padTop = 20,
      padBottom = 40;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const lfprMin = Math.min(...states.map((s) => s.lfpr_latest || 0)) - 2;
    const lfprMax = Math.max(...states.map((s) => s.lfpr_latest || 0)) + 2;
    const urMin = 0;
    const urMax = Math.max(...states.map((s) => s.ur_latest || 0)) + 1;

    const scaleX = (v) =>
      padLeft + ((v - lfprMin) / (lfprMax - lfprMin)) * chartW;
    const scaleY = (v) =>
      padTop + chartH - ((v - urMin) / (urMax - urMin)) * chartH;

    return {
      w,
      h,
      padLeft,
      padRight,
      padTop,
      padBottom,
      chartW,
      chartH,
      lfprMin,
      lfprMax,
      urMin,
      urMax,
      scaleX,
      scaleY,
    };
  };

  const w = 800,
    h = 300;
  const padLeft = 50,
    padRight = 20,
    padTop = 20,
    padBottom = 40;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;
  const lfprMin = Math.min(...states.map((s) => s.lfpr_latest || 0)) - 2;
  const lfprMax = Math.max(...states.map((s) => s.lfpr_latest || 0)) + 2;
  const urMin = 0;
  const urMax = Math.max(...states.map((s) => s.ur_latest || 0)) + 1;

  const scaleX = (v) =>
    padLeft + ((v - lfprMin) / (lfprMax - lfprMin)) * chartW;
  const scaleY = (v) =>
    padTop + chartH - ((v - urMin) / (urMax - urMin)) * chartH;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      style={{ maxHeight: 300 }}
    >
      {/* Grid */}
      {Array.from({ length: 5 }, (_, i) => {
        const val = urMin + ((urMax - urMin) / 4) * i;
        const y = scaleY(val);
        return (
          <g key={`yg-${i}`}>
            <line
              x1={padLeft}
              y1={y}
              x2={w - padRight}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
            />
            <text
              x={padLeft - 6}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#555"
              fontSize="9"
            >
              {val.toFixed(1)}%
            </text>
          </g>
        );
      })}

      {/* Axis labels */}
      <text x={w / 2} y={h - 5} textAnchor="middle" fill="#666" fontSize="10">
        LFPR (%)
      </text>
      <text
        x={12}
        y={h / 2}
        textAnchor="middle"
        fill="#666"
        fontSize="10"
        transform={`rotate(-90, 12, ${h / 2})`}
      >
        UR (%)
      </text>

      {/* X axis ticks */}
      {Array.from({ length: 5 }, (_, i) => {
        const val = lfprMin + ((lfprMax - lfprMin) / 4) * i;
        const x = scaleX(val);
        return (
          <text
            key={`xt-${i}`}
            x={x}
            y={h - padBottom + 15}
            textAnchor="middle"
            fill="#555"
            fontSize="9"
          >
            {val.toFixed(0)}%
          </text>
        );
      })}

      {/* Dots */}
      {states.map((state) => {
        const x = scaleX(state.lfpr_latest || 0);
        const y = scaleY(state.ur_latest || 0);
        const color =
          (state.ur_latest || 0) > 5
            ? "#ef4444"
            : (state.ur_latest || 0) > 3
              ? "#f59e0b"
              : "#10b981";
        return (
          <g key={state.name}>
            <circle cx={x} cy={y} r={5} fill={color} opacity={0.7} />
            <title>{`${state.name}\nLFPR: ${state.lfpr_latest}%\nUR: ${state.ur_latest}%`}</title>
            <text x={x} y={y - 8} textAnchor="middle" fill="#888" fontSize="7">
              {state.name.length > 8
                ? state.name.substring(0, 6) + ".."
                : state.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
