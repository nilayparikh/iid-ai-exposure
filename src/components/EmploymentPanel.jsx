import { useState } from "react";
import { MiniChart } from "./TrendPanel";
import { exposureCSS, exposureLabel, formatNumber } from "../utils/colors";

function InfoRow({ code, name, exposure, workerPct, maxPct, extra }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-2 text-[11px] py-0.5">
      <span
        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
        style={{
          background: exposureCSS(exposure, 0.2),
          color: exposureCSS(exposure),
        }}
      >
        {code}
      </span>
      <span
        className="text-gray-400 truncate"
        style={{ flex: "1 1 0", minWidth: 0 }}
      >
        {name}
      </span>
      <button
        onClick={() => setOpen(!open)}
        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] flex-shrink-0 hover:bg-white/10 text-gray-600 hover:text-gray-300 transition-colors"
        title="Show details"
      >
        {open ? "×" : "i"}
      </button>
      {open && (
        <span
          className="text-[9px] text-gray-600 truncate flex-shrink-0 max-w-[40%]"
          title={extra}
        >
          {extra}
        </span>
      )}
      {!open && (
        <>
          <div className="w-28 h-2 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(workerPct / maxPct) * 100}%`,
                background: exposureCSS(exposure, 0.7),
              }}
            />
          </div>
          <span className="text-gray-300 font-medium w-12 text-right flex-shrink-0">
            {workerPct}%
          </span>
          <span
            className="w-14 text-right text-[10px] font-medium flex-shrink-0"
            style={{ color: exposureCSS(exposure) }}
          >
            {exposure}/10
          </span>
        </>
      )}
    </div>
  );
}

export default function EmploymentPanel({ data }) {
  const { industries, occupations, employment_conditions, broad_sectors } =
    data;
  const [indView, setIndView] = useState("pct"); // pct | exposure
  const [occView, setOccView] = useState("pct");

  const sortedIndustries = [...industries].sort((a, b) =>
    indView === "exposure"
      ? b.ai_exposure - a.ai_exposure
      : b.worker_pct - a.worker_pct,
  );
  const maxIndPct = Math.max(...industries.map((i) => i.worker_pct));

  const sortedOccupations = [...occupations].sort((a, b) =>
    occView === "exposure"
      ? b.ai_exposure - a.ai_exposure
      : b.worker_pct - a.worker_pct,
  );
  const maxOccPct = Math.max(...occupations.map((o) => o.worker_pct));

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Total Workers"
          value={`${data.summary.total_workers_millions}M`}
          color="#6366f1"
        />
        <StatCard
          label="Industries Tracked"
          value={industries.length}
          color="#8b5cf6"
        />
        <StatCard
          label="Occupation Groups"
          value={occupations.length}
          color="#ec4899"
        />
        <StatCard
          label="Avg AI Exposure"
          value={`${data.summary.weighted_avg_exposure}/10`}
          color="#f59e0b"
        />
      </div>

      {/* Industry distribution */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
            Worker Distribution by Industry (NIC 2008)
          </h3>
          <div className="flex gap-1">
            {[
              { key: "pct", label: "By Share" },
              { key: "exposure", label: "By AI Exposure" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setIndView(opt.key)}
                className={`px-2 py-1 rounded text-[10px] font-medium ${
                  indView === opt.key
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-0.5 max-h-[50vh] overflow-y-auto">
          {sortedIndustries.map((ind) => (
            <InfoRow
              key={ind.code}
              code={ind.code}
              name={ind.name}
              exposure={ind.ai_exposure}
              workerPct={ind.worker_pct}
              maxPct={maxIndPct}
              extra={`${ind.ai_rationale} · ${ind.sector} · ${formatNumber(ind.workers_millions)} workers`}
            />
          ))}
        </div>
      </div>

      {/* Occupation distribution */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
            Worker Distribution by Occupation (NCO 2004)
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setOccView("pct")}
              className={`px-2 py-1 rounded text-[10px] font-medium ${
                occView === "pct"
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              By Share
            </button>
            <button
              onClick={() => setOccView("exposure")}
              className={`px-2 py-1 rounded text-[10px] font-medium ${
                occView === "exposure"
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              By AI Exposure
            </button>
          </div>
        </div>
        <div className="space-y-0.5">
          {sortedOccupations.map((occ) => (
            <InfoRow
              key={occ.code}
              code={occ.code}
              name={occ.name}
              exposure={occ.ai_exposure}
              workerPct={occ.worker_pct}
              maxPct={maxOccPct}
              extra={`${occ.ai_rationale} · ${formatNumber(occ.workers_millions)} workers`}
            />
          ))}
        </div>
      </div>

      {/* Employment conditions */}
      {employment_conditions &&
        Object.keys(employment_conditions).length > 0 && (
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
              Employment Conditions (Regular Workers)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(employment_conditions).map(
                ([label, pts], idx) => (
                  <MiniChart
                    key={label}
                    label={label}
                    data={pts}
                    color={
                      ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"][
                        idx % 5
                      ]
                    }
                    unit="%"
                  />
                ),
              )}
            </div>
          </div>
        )}

      {/* Industry trends (top 6) */}
      <div className="glass-panel p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Industry Composition Trends (Top 6)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {industries.slice(0, 6).map((ind, idx) => (
            <MiniChart
              key={ind.code}
              label={`${ind.code} · ${ind.name}`}
              data={ind.trend}
              color={
                [
                  "#6366f1",
                  "#f59e0b",
                  "#8b5cf6",
                  "#10b981",
                  "#ec4899",
                  "#06b6d4",
                ][idx]
              }
              unit="%"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="glass-panel p-3">
      <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">
        {label}
      </div>
      <div className="text-xl font-black" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
