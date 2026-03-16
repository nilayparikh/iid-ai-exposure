import { useState } from "react";

const INDICATOR_META = {
  lfpr: {
    label: "Labour Force Participation Rate",
    color: "#6366f1",
    unit: "%",
  },
  wpr: { label: "Worker Population Ratio", color: "#8b5cf6", unit: "%" },
  ur: { label: "Unemployment Rate", color: "#ef4444", unit: "%" },
};

const GENDER_COLORS = {
  male: "#6366f1",
  female: "#ec4899",
  person: "#94a3b8",
};

export default function TrendPanel({ data }) {
  const { trends, gender_trends, broad_sectors, employment_status } = data;
  const [activeIndicators, setActiveIndicators] = useState([
    "lfpr",
    "wpr",
    "ur",
  ]);
  const [genderView, setGenderView] = useState("lfpr");

  const toggle = (key) =>
    setActiveIndicators((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {Object.entries(trends).map(([key, info]) => {
          const pts = info.data;
          if (!pts || pts.length < 2) return null;
          const latest = pts[pts.length - 1];
          const first = pts[0];
          const delta = latest.value - first.value;
          const meta = INDICATOR_META[key] || { color: "#94a3b8", label: key };
          return (
            <div key={key} className="glass-panel p-3">
              <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
                {meta.label}
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div
                    className="text-2xl font-black"
                    style={{ color: meta.color }}
                  >
                    {latest.value}%
                  </div>
                  <div className="text-[10px] text-gray-500">{latest.year}</div>
                </div>
                <div className="text-right">
                  <div
                    className="text-xs font-semibold"
                    style={{
                      color:
                        key === "ur"
                          ? delta <= 0
                            ? "#10b981"
                            : "#ef4444"
                          : delta >= 0
                            ? "#10b981"
                            : "#ef4444",
                    }}
                  >
                    {delta >= 0 ? "+" : ""}
                    {delta.toFixed(1)}pp
                  </div>
                  <div className="text-[10px] text-gray-600">
                    vs {first.year}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {data.summary.latest_regular_wage && (
          <div className="glass-panel p-3">
            <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">
              Regular Wage
            </div>
            <div className="text-2xl font-black text-emerald-400">
              ₹{Math.round(data.summary.latest_regular_wage).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500">
              /month · {data.summary.data_year}
            </div>
          </div>
        )}
      </div>

      {/* Indicator toggle */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(INDICATOR_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              activeIndicators.includes(key)
                ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                : "border-white/5 bg-white/5 text-gray-500 hover:text-gray-300"
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ background: meta.color }}
            />
            {meta.label}
          </button>
        ))}
      </div>

      {/* National trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeIndicators.map((key) => (
          <MiniChart
            key={key}
            label={INDICATOR_META[key]?.label || key}
            data={trends[key]?.data || []}
            color={INDICATOR_META[key]?.color || "#94a3b8"}
            unit="%"
          />
        ))}
      </div>

      {/* Gender comparison */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
            Gender Comparison
          </h3>
          <div className="flex gap-1">
            {["lfpr", "wpr", "ur"].map((k) => (
              <button
                key={k}
                onClick={() => setGenderView(k)}
                className={`px-2 py-1 rounded text-[10px] font-medium ${
                  genderView === k
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {gender_trends[genderView] && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {["male", "female", "person"].map((g) =>
              gender_trends[genderView][g] ? (
                <MiniChart
                  key={g}
                  label={g.charAt(0).toUpperCase() + g.slice(1)}
                  data={gender_trends[genderView][g]}
                  color={GENDER_COLORS[g]}
                  unit="%"
                />
              ) : null,
            )}
          </div>
        )}
      </div>

      {/* Broad sector trends */}
      {broad_sectors && Object.keys(broad_sectors).length > 0 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
            Employment by Broad Sector (%)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Object.entries(broad_sectors).map(([label, pts]) => (
              <MiniChart
                key={label}
                label={label}
                data={pts}
                color={
                  label === "Primary"
                    ? "#22c55e"
                    : label === "Secondary"
                      ? "#f59e0b"
                      : "#6366f1"
                }
                unit="%"
              />
            ))}
          </div>
        </div>
      )}

      {/* Employment status trends */}
      {employment_status && Object.keys(employment_status).length > 0 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
            Employment Status Distribution (%)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(employment_status).map(([label, pts], idx) => (
              <MiniChart
                key={label}
                label={label}
                data={pts}
                color={
                  ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][
                    idx % 5
                  ]
                }
                unit="%"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MiniChart({ label, data, color, unit }) {
  const [hover, setHover] = useState(null);

  if (!data?.length) return null;
  const validPts = data.filter((p) => p.value != null);
  if (!validPts.length) return null;

  const values = validPts.map((p) => p.value);
  const min = Math.min(...values) * 0.92;
  const max = Math.max(...values) * 1.08;
  const range = max - min || 1;
  const latest = validPts[validPts.length - 1];

  const width = 320;
  const height = 140;
  const padLeft = 42;
  const padRight = 10;
  const padTop = 8;
  const padBottom = 24;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (i) => padLeft + (i / Math.max(validPts.length - 1, 1)) * chartW;
  const getY = (v) => padTop + ((max - v) / range) * chartH;

  const linePath = validPts
    .map((p, i) => `${i === 0 ? "M" : "L"}${getX(i)},${getY(p.value)}`)
    .join(" ");
  const areaPath = `${linePath} L${getX(validPts.length - 1)},${padTop + chartH} L${getX(0)},${padTop + chartH} Z`;

  const gridLines = Array.from({ length: 4 }, (_, i) => {
    const val = max - (range / 3) * i;
    const y = padTop + (chartH / 3) * i;
    return { y, label: val >= 100 ? val.toFixed(0) : val.toFixed(1) };
  });

  const handleMouseMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round(((mx - padLeft) / chartW) * (validPts.length - 1));
    const clamped = Math.max(0, Math.min(validPts.length - 1, idx));
    setHover(clamped);
  };

  return (
    <div className="glass-panel p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-gray-400 font-medium truncate">
          {label}
        </span>
        {latest && (
          <span className="text-[11px] font-bold" style={{ color }}>
            {latest.value}
            {unit}
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: 140 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines + labels */}
        {gridLines.map((g) => (
          <g key={g.y}>
            <line
              x1={padLeft}
              y1={g.y}
              x2={width - padRight}
              y2={g.y}
              stroke="rgba(255,255,255,0.04)"
            />
            <text
              x={padLeft - 4}
              y={g.y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#555"
              fontSize="9"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* Area */}
        <path d={areaPath} fill={`url(#grad-${label})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" />

        {/* Dots + year labels */}
        {validPts.map((p, i) => (
          <g key={i}>
            <circle
              cx={getX(i)}
              cy={getY(p.value)}
              r={hover === i ? 4.5 : 2.5}
              fill={hover === i ? "#fff" : color}
              stroke={hover === i ? color : "none"}
              strokeWidth={hover === i ? 2 : 0}
              style={{ transition: "r 0.12s" }}
            />
            <text
              x={getX(i)}
              y={height - 6}
              textAnchor="middle"
              fill="#666"
              fontSize="8"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {p.year?.replace("20", "'") || ""}
            </text>
          </g>
        ))}

        {/* Hover crosshair + label */}
        {hover != null && validPts[hover] && (
          <g>
            <line
              x1={getX(hover)}
              y1={padTop}
              x2={getX(hover)}
              y2={padTop + chartH}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="3,2"
            />
            <rect
              x={getX(hover) - 28}
              y={getY(validPts[hover].value) - 18}
              width={56}
              height={16}
              rx={4}
              fill="rgba(11,11,15,0.85)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={0.5}
            />
            <text
              x={getX(hover)}
              y={getY(validPts[hover].value) - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color}
              fontSize="9"
              fontWeight="700"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {validPts[hover].value}
              {unit}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
