import { useState } from "react";
import StateVulnerabilityPage from "./StateVulnerabilityPage";
import VulnerabilityMatrixPage from "./VulnerabilityMatrixPage";
import StatePanel from "./StatePanel";

const TABS = [
  { key: "ranking", label: "AI Vulnerability Ranking", icon: "🗺" },
  { key: "matrix", label: "Risk Matrix", icon: "⚠" },
  { key: "profiles", label: "State Profiles", icon: "📊" },
];

export default function StatesPage({ data, stateAI }) {
  const [tab, setTab] = useState("ranking");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab buttons */}
      <div className="px-4 pt-4 pb-2 flex gap-2 flex-shrink-0 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              tab === t.key
                ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                : "border-white/5 bg-white/5 text-gray-500 hover:text-gray-300"
            }`}
          >
            <span className="text-[10px] mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "ranking" ? (
          <StateVulnerabilityPage
            stateAI={stateAI}
            industries={data.industries}
          />
        ) : tab === "matrix" ? (
          <VulnerabilityMatrixPage stateAI={stateAI} />
        ) : (
          <StatePanel data={data} />
        )}
      </div>
    </div>
  );
}
