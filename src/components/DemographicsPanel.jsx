import { useState } from "react";
import { MiniChart } from "./TrendPanel";

const SECTION_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#14b8a6",
  "#e879f9",
];

export default function DemographicsPanel({ data }) {
  const {
    education_breakdown,
    sector_breakdown,
    age_breakdown,
    social_category,
    religion,
  } = data;
  const [eduIndicator, setEduIndicator] = useState("lfpr");
  const [sectorGender, setSectorGender] = useState("person");

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Education breakdown */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
            By Education Level
          </h3>
          <div className="flex gap-1">
            {["lfpr", "wpr", "ur"].map((k) => (
              <button
                key={k}
                onClick={() => setEduIndicator(k)}
                className={`px-2 py-1 rounded text-[10px] font-medium ${
                  eduIndicator === k
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {education_breakdown[eduIndicator] && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Object.entries(education_breakdown[eduIndicator]).map(
              ([edu, pts], idx) => (
                <MiniChart
                  key={edu}
                  label={edu}
                  data={pts}
                  color={SECTION_COLORS[idx % SECTION_COLORS.length]}
                  unit="%"
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* Rural vs Urban */}
      {sector_breakdown && Object.keys(sector_breakdown).length > 0 && (
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
              LFPR — Rural vs Urban
            </h3>
            <div className="flex gap-1">
              {["person", "male", "female"].map((g) => (
                <button
                  key={g}
                  onClick={() => setSectorGender(g)}
                  className={`px-2 py-1 rounded text-[10px] font-medium ${
                    sectorGender === g
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-gray-600 hover:text-gray-400"
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {Object.entries(sector_breakdown).map(([sector, genders]) =>
              genders[sectorGender] ? (
                <MiniChart
                  key={sector}
                  label={sector.charAt(0).toUpperCase() + sector.slice(1)}
                  data={genders[sectorGender]}
                  color={
                    sector === "rural"
                      ? "#22c55e"
                      : sector === "urban"
                        ? "#6366f1"
                        : "#f59e0b"
                  }
                  unit="%"
                />
              ) : null,
            )}
          </div>
        </div>
      )}

      {/* Age group breakdown */}
      {age_breakdown && Object.keys(age_breakdown).length > 0 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
            LFPR by Age Group
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {Object.entries(age_breakdown).map(([age, genders], idx) => (
              <MiniChart
                key={age}
                label={age}
                data={genders.person || genders.male || []}
                color={SECTION_COLORS[idx % SECTION_COLORS.length]}
                unit="%"
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Social category */}
        {social_category && Object.keys(social_category).length > 0 && (
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
              LFPR by Social Category
            </h3>
            <div className="space-y-3">
              {Object.entries(social_category).map(([cat, pts], idx) => (
                <MiniChart
                  key={cat}
                  label={cat}
                  data={pts}
                  color={SECTION_COLORS[idx % SECTION_COLORS.length]}
                  unit="%"
                />
              ))}
            </div>
          </div>
        )}

        {/* Religion */}
        {religion && Object.keys(religion).length > 0 && (
          <div className="glass-panel p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
              LFPR by Religion
            </h3>
            <div className="space-y-3">
              {Object.entries(religion).map(([rel, pts], idx) => (
                <MiniChart
                  key={rel}
                  label={rel}
                  data={pts}
                  color={SECTION_COLORS[(idx + 3) % SECTION_COLORS.length]}
                  unit="%"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
