import { exposureCSS, formatCrore } from "../utils/colors";

export default function IndustryBar({
  data,
  selectedIndustry,
  setSelectedIndustry,
}) {
  const { industries } = data;
  const maxWorkers = Math.max(...industries.map((i) => i.workers_millions));

  return (
    <div className="glass-panel p-3">
      <h3 className="text-[9px] font-semibold uppercase tracking-widest text-gray-600 mb-2">
        Industries by workforce
      </h3>
      <div className="space-y-1.5">
        {industries.map((ind) => {
          const isSelected = selectedIndustry === ind.code;
          return (
            <button
              key={ind.code}
              onClick={() => setSelectedIndustry(isSelected ? null : ind.code)}
              className={`w-full text-left group transition-all rounded-md p-1.5 -m-0.5 ${
                isSelected ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span
                  className={`font-medium truncate pr-2 ${isSelected ? "text-white" : "text-gray-400"}`}
                >
                  {ind.name}
                </span>
                <span className="text-gray-500 flex-shrink-0">
                  {ind.ai_exposure}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(ind.workers_millions / maxWorkers) * 100}%`,
                    background: exposureCSS(ind.ai_exposure, 0.7),
                  }}
                />
              </div>
              <div className="text-[9px] text-gray-600 mt-0.5">
                {formatCrore(ind.workers_millions)} · {ind.worker_pct}%
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
