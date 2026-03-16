import { useState, useMemo } from "react";
import { MiniChart } from "./TrendPanel";
import { formatRupees } from "../utils/colors";

const GENDER_COLORS = { male: "#6366f1", female: "#ec4899", person: "#94a3b8" };

export default function WagesPanel({ data }) {
  const { wages } = data;
  const [activeType, setActiveType] = useState("regular_monthly");
  const [stateSort, setStateSort] = useState("desc");

  const wageTypes = [
    { key: "regular_monthly", label: "Regular Wage" },
    { key: "casual_daily", label: "Casual Wage" },
    { key: "self_employment_monthly", label: "Self-Employment" },
  ];

  const activeWage = wages[activeType];

  // Gender gap cards
  const gapCards = wageTypes
    .map(({ key, label }) => {
      const w = wages[key];
      if (!w) return null;
      const male = w.latest_male;
      const female = w.latest_female;
      const gap =
        male && female ? ((1 - female / male) * 100).toFixed(0) : null;
      return { label, male, female, gap, key };
    })
    .filter(Boolean);

  // State wages sorted
  const stateWages = useMemo(() => {
    const sw = wages.state_regular_wages;
    if (!sw) return [];
    const entries = Object.entries(sw).map(([name, val]) => ({
      name,
      value: val,
    }));
    entries.sort((a, b) =>
      stateSort === "desc" ? b.value - a.value : a.value - b.value,
    );
    return entries;
  }, [wages.state_regular_wages, stateSort]);

  const maxStateWage = stateWages.length
    ? Math.max(...stateWages.map((s) => s.value))
    : 1;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Gender wage gap summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {gapCards.map((card) => (
          <div key={card.key} className="glass-panel p-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">
              {card.label}
            </div>
            <div className="space-y-2">
              <GenderWageBar
                label="Male"
                value={card.male}
                max={Math.max(card.male || 0, card.female || 0)}
                color="#6366f1"
              />
              <GenderWageBar
                label="Female"
                value={card.female}
                max={Math.max(card.male || 0, card.female || 0)}
                color="#ec4899"
              />
            </div>
            {card.gap && (
              <div className="mt-2 text-center">
                <span className="text-xs text-red-400 font-semibold">
                  Gender Gap: {card.gap}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-column layout: trends left, state wages right */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Wage type selector + trends */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
              Wage Trends by Gender
            </h3>
            <div className="flex gap-1">
              {wageTypes.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveType(key)}
                  className={`px-2 py-1 rounded text-[10px] font-medium ${
                    activeType === key
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-gray-600 hover:text-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {activeWage?.by_gender && (
            <div className="grid grid-cols-1 gap-3">
              {["male", "female", "person"].map((g) =>
                activeWage.by_gender[g] ? (
                  <MiniChart
                    key={g}
                    label={g.charAt(0).toUpperCase() + g.slice(1)}
                    data={activeWage.by_gender[g]}
                    color={GENDER_COLORS[g]}
                    unit=""
                  />
                ) : null,
              )}
            </div>
          )}
        </div>

        {/* State-wise regular wages — full height */}
        {stateWages.length > 0 && (
          <div className="glass-panel p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                Regular Wages by State ({data.summary.data_year})
              </h3>
              <button
                onClick={() =>
                  setStateSort((s) => (s === "desc" ? "asc" : "desc"))
                }
                className="px-2 py-1 rounded text-[10px] text-gray-500 hover:text-gray-300 bg-white/5"
              >
                {stateSort === "desc" ? "↓ Highest" : "↑ Lowest"}
              </button>
            </div>
            <div className="space-y-1.5 flex-1 overflow-y-auto">
              {stateWages.map((s, i) => (
                <StateWageRow
                  key={s.name}
                  rank={i + 1}
                  name={s.name}
                  value={s.value}
                  max={maxStateWage}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GenderWageBar({ label, value, max, color }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-12">{label}</span>
      <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-[10px] text-gray-300 font-medium w-14 text-right">
        {formatRupees(value)}
      </span>
    </div>
  );
}

function StateWageRow({ rank, name, value, max }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div
      className="flex items-center gap-2 text-[11px] group relative"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <span className="text-gray-600 w-5 text-right">{rank}.</span>
      <span className="text-gray-400 w-40 truncate">{name}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(value / max) * 100}%`,
            background: `linear-gradient(90deg, #6366f1, #8b5cf6)`,
          }}
        />
      </div>
      <span className="text-gray-300 font-medium w-16 text-right">
        {formatRupees(value)}
      </span>
      {showTip && (
        <div className="absolute left-48 -top-8 z-30 glass-panel px-3 py-2 text-[10px] text-gray-300 whitespace-nowrap pointer-events-none animate-fade-in">
          <div className="font-semibold text-white">{name}</div>
          <div>Avg. Regular Monthly Wage: {formatRupees(value)}</div>
          <div className="text-gray-500">
            {((value / max) * 100).toFixed(0)}% of highest state
          </div>
        </div>
      )}
    </div>
  );
}
