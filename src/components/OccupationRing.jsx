import { exposureCSS, formatCrore } from "../utils/colors";

export default function OccupationRing({ data }) {
  const { occupations } = data;
  const maxShare = Math.max(...occupations.map((occ) => occ.worker_pct));
  const weightedExposure =
    occupations.reduce(
      (sum, occ) => sum + occ.ai_exposure * occ.worker_pct,
      0,
    ) / occupations.reduce((sum, occ) => sum + occ.worker_pct, 0);

  return (
    <div className="glass-panel p-3">
      <h3 className="text-[9px] font-semibold uppercase tracking-widest text-gray-600 mb-2">
        Occupation Mix (PLFS)
      </h3>
      <div className="flex items-end justify-between mb-3 text-[10px]">
        <div>
          <div className="text-gray-500">Weighted exposure</div>
          <div className="text-lg font-semibold text-gray-200">
            {weightedExposure.toFixed(1)}/10
          </div>
        </div>
        <div className="text-right text-gray-500">
          <div>{occupations.length} PLFS occupation groups</div>
          <div>national workforce distribution</div>
        </div>
      </div>
      <div className="space-y-2">
        {occupations.map((occ) => (
          <div key={occ.code} className="space-y-1">
            <div className="flex items-center gap-2 text-[10px]">
              <div
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ background: exposureCSS(occ.ai_exposure) }}
              />
              <span className="text-gray-400 flex-1 truncate">{occ.name}</span>
              <span className="text-gray-600 w-9 text-right">
                {occ.ai_exposure}
              </span>
              <span className="text-gray-300 w-12 text-right font-medium">
                {occ.worker_pct}%
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(occ.worker_pct / maxShare) * 100}%`,
                  background: exposureCSS(occ.ai_exposure, 0.72),
                }}
              />
            </div>
            <div className="text-[9px] text-gray-600 text-right">
              {formatCrore(occ.workers_millions)} workers
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
