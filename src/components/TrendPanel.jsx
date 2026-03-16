import { useRef, useEffect, useState } from "react";

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
  const canvasRef = useRef(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.length) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = 140;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const values = data.map((p) => p.value).filter((v) => v != null);
    if (!values.length) return;
    const min = Math.min(...values) * 0.92;
    const max = Math.max(...values) * 1.08;
    const range = max - min || 1;

    const padLeft = 42,
      padRight = 10,
      padTop = 8,
      padBottom = 24;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padTop + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
      ctx.fillStyle = "#555";
      ctx.font = "9px Inter, system-ui";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const val = max - (range / 3) * i;
      ctx.fillText(val.toFixed(val >= 100 ? 0 : 1), padLeft - 4, y);
    }

    // Area
    const validPts = data.filter((p) => p.value != null);
    ctx.beginPath();
    validPts.forEach((p, i) => {
      const x = padLeft + (i / Math.max(validPts.length - 1, 1)) * chartW;
      const y = padTop + ((max - p.value) / range) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(padLeft + chartW, padTop + chartH);
    ctx.lineTo(padLeft, padTop + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, color + "25");
    grad.addColorStop(1, color + "05");
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    validPts.forEach((p, i) => {
      const x = padLeft + (i / Math.max(validPts.length - 1, 1)) * chartW;
      const y = padTop + ((max - p.value) / range) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots + year labels
    validPts.forEach((p, i) => {
      const x = padLeft + (i / Math.max(validPts.length - 1, 1)) * chartW;
      const y = padTop + ((max - p.value) / range) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = "#666";
      ctx.font = "8px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(p.year?.replace("20", "'") || "", x, h - 6);
    });
  }, [data, color]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.length) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const w = canvas.clientWidth;
    const padLeft = 42,
      padRight = 10;
    const chartW = w - padLeft - padRight;
    const validPts = data.filter((p) => p.value != null);
    if (!validPts.length) return;
    const idx = Math.round(((mx - padLeft) / chartW) * (validPts.length - 1));
    const clamped = Math.max(0, Math.min(validPts.length - 1, idx));
    const pt = validPts[clamped];
    const x = padLeft + (clamped / Math.max(validPts.length - 1, 1)) * chartW;
    setHover({ x, pt });
  };

  const latest = data?.filter((d) => d.value != null).slice(-1)[0];

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
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHover(null)}
        />
        {hover && (
          <div
            className="absolute top-0 pointer-events-none z-10"
            style={{ left: hover.x }}
          >
            <div
              className="w-px h-full bg-white/20 absolute left-0 top-0"
              style={{ height: 116 }}
            />
            <div className="absolute -top-1 -translate-x-1/2 glass-panel px-2 py-1 text-[10px] text-gray-300 whitespace-nowrap">
              <span className="font-semibold" style={{ color }}>
                {hover.pt.value}
                {unit}
              </span>
              <span className="text-gray-500 ml-1">{hover.pt.year}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
