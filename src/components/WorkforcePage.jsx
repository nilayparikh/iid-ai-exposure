import { useMemo, useState } from "react";
import { exposureCSS, exposureLabel, formatNumber } from "../utils/colors";

const BAND_FILTERS = [
  {
    key: "all",
    label: "All exposure",
    color: "#94a3b8",
    test: () => true,
  },
  {
    key: "buffer",
    label: "Minimal + Low",
    color: "#22c55e",
    test: (score) => score <= 4,
  },
  {
    key: "transition",
    label: "Moderate",
    color: "#f59e0b",
    test: (score) => score > 4 && score <= 6,
  },
  {
    key: "exposed",
    label: "High + Very High",
    color: "#ef4444",
    test: (score) => score > 6,
  },
];

const PROXY_DIMENSIONS = [
  { key: "education", label: "Education" },
  { key: "age", label: "Age" },
  { key: "sector", label: "Rural / Urban" },
  { key: "social", label: "Social Category" },
  { key: "religion", label: "Religion" },
];

const EDUCATION_METRICS = ["lfpr", "wpr", "ur"];
const SECTOR_GENDERS = ["person", "male", "female"];

export default function WorkforcePage({ data }) {
  const {
    industries,
    occupations,
    education_breakdown,
    sector_breakdown,
    age_breakdown,
    social_category,
    religion,
  } = data;
  const [band, setBand] = useState("all");
  const [industrySort, setIndustrySort] = useState("workers");
  const [proxyDimension, setProxyDimension] = useState("education");
  const [educationMetric, setEducationMetric] = useState("wpr");
  const [sectorGender, setSectorGender] = useState("person");

  const activeBand =
    BAND_FILTERS.find((item) => item.key === band) || BAND_FILTERS[0];

  const exposureSeries = useMemo(() => {
    const yearSet = new Set();
    for (const industry of industries || []) {
      for (const point of industry.trend || []) {
        if (point.year) yearSet.add(point.year);
      }
    }
    const years = [...yearSet].sort();
    const series = years
      .map((year) => {
        let weightedExposure = 0;
        let totalShare = 0;
        let highExposureShare = 0;
        let digitalCoreShare = 0;
        for (const industry of industries || []) {
          const point = (industry.trend || []).find(
            (item) => item.year === year,
          );
          const share = point?.value ?? 0;
          totalShare += share;
          weightedExposure += share * industry.ai_exposure;
          if (industry.ai_exposure >= 6) highExposureShare += share;
          if (industry.ai_exposure >= 7) digitalCoreShare += share;
        }
        return totalShare
          ? {
              year,
              pressure: weightedExposure / totalShare,
              highExposureShare,
              digitalCoreShare,
            }
          : null;
      })
      .filter(Boolean);
    return series;
  }, [industries]);

  const sectorCards = useMemo(() => {
    const sectors = [
      ...new Set((industries || []).map((industry) => industry.sector)),
    ];
    return sectors.map((sector) => {
      const sectorIndustries = industries.filter(
        (industry) => industry.sector === sector,
      );
      const latestShare = sectorIndustries.reduce(
        (sum, industry) => sum + (industry.worker_pct || 0),
        0,
      );
      const exposureWeighted = sectorIndustries.reduce(
        (sum, industry) =>
          sum + (industry.worker_pct || 0) * industry.ai_exposure,
        0,
      );
      const avgExposure = latestShare ? exposureWeighted / latestShare : 0;
      const firstShare = sectorIndustries.reduce((sum, industry) => {
        const points = industry.trend || [];
        return sum + (points[0]?.value || 0);
      }, 0);
      const latestTrendShare = sectorIndustries.reduce((sum, industry) => {
        const points = industry.trend || [];
        return sum + (points[points.length - 1]?.value || 0);
      }, 0);
      const highExposureInsideSector = sectorIndustries
        .filter((industry) => industry.ai_exposure > 6)
        .reduce((sum, industry) => sum + industry.worker_pct, 0);
      return {
        sector,
        latestShare,
        avgExposure,
        delta: latestTrendShare - firstShare,
        highExposurePct: latestShare
          ? (highExposureInsideSector / latestShare) * 100
          : 0,
      };
    });
  }, [industries]);

  const filteredIndustries = useMemo(() => {
    const items = industries.filter((industry) =>
      activeBand.test(industry.ai_exposure),
    );
    return [...items].sort((a, b) =>
      industrySort === "exposure"
        ? b.ai_exposure - a.ai_exposure || b.worker_pct - a.worker_pct
        : b.worker_pct - a.worker_pct || b.ai_exposure - a.ai_exposure,
    );
  }, [activeBand, industries, industrySort]);

  const filteredOccupations = useMemo(() => {
    const items = occupations.filter((occupation) =>
      activeBand.test(occupation.ai_exposure),
    );
    return [...items].sort(
      (a, b) => b.ai_exposure - a.ai_exposure || b.worker_pct - a.worker_pct,
    );
  }, [activeBand, occupations]);

  const proxyView = useMemo(() => {
    if (proxyDimension === "education") {
      const entries = Object.entries(
        education_breakdown?.[educationMetric] || {},
      );
      return {
        title: `${educationMetric.toUpperCase()} by education level`,
        note:
          educationMetric === "ur"
            ? "Proxy for mismatch pressure. Higher unemployment among better-educated groups can signal slower absorption into exposed digital sectors."
            : "Proxy for AI-transition readiness. Higher educational attainment tends to feed the more digital, higher-exposure parts of the labour market.",
        items: entries
          .map(([label, series]) => toProxyRow(label, series))
          .filter(Boolean)
          .sort((a, b) => b.latest - a.latest),
      };
    }
    if (proxyDimension === "age") {
      const entries = Object.entries(age_breakdown || {});
      return {
        title: "LFPR by age group",
        note: "Proxy for transition timing. Younger cohorts are more likely to enter digitally exposed jobs first, while prime-age cohorts hold the largest stock of workers facing reskilling needs.",
        items: entries
          .map(([label, group]) =>
            toProxyRow(label, group.person || group.male || group.female),
          )
          .filter(Boolean)
          .sort((a, b) => b.latest - a.latest),
      };
    }
    if (proxyDimension === "sector") {
      const entries = Object.entries(sector_breakdown || {});
      return {
        title: `LFPR by rural / urban area (${capitalize(sectorGender)})`,
        note: "Proxy for digital access. Urban labour markets tend to host a larger share of high-exposure service work, while rural labour markets remain more agriculture-heavy.",
        items: entries
          .map(([label, group]) =>
            toProxyRow(capitalize(label), group?.[sectorGender]),
          )
          .filter(Boolean)
          .sort((a, b) => b.latest - a.latest),
      };
    }
    if (proxyDimension === "social") {
      return {
        title: "LFPR by social category",
        note: "Proxy for inclusion in the AI transition. This does not measure direct exposure, but it highlights who is more or less engaged in the labour market as AI adoption accelerates.",
        items: Object.entries(social_category || {})
          .map(([label, series]) => toProxyRow(label, series))
          .filter(Boolean)
          .sort((a, b) => b.latest - a.latest),
      };
    }
    return {
      title: "LFPR by religion",
      note: "Proxy for participation gaps that may widen or narrow as AI changes hiring patterns. Use as context, not as a direct exposure measure.",
      items: Object.entries(religion || {})
        .map(([label, series]) => toProxyRow(label, series))
        .filter(Boolean)
        .sort((a, b) => b.latest - a.latest),
    };
  }, [
    age_breakdown,
    education_breakdown,
    educationMetric,
    proxyDimension,
    religion,
    sectorGender,
    sector_breakdown,
    social_category,
  ]);

  const latestPressure = exposureSeries[exposureSeries.length - 1];
  const firstPressure = exposureSeries[0];
  const largestExposedOccupation = [...occupations]
    .filter((occupation) => occupation.ai_exposure > 6)
    .sort((a, b) => b.worker_pct - a.worker_pct)[0];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="glass-panel p-6 border-l-2 border-brand-cyan/40">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-lg font-bold text-white mb-2">
              AI Exposure Dimensions
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              This view is built around AI exposure directly, not generic PLFS
              reporting. The top half uses direct exposure signals from scored
              industries and occupations. The lower half adds clearly tagged
              proxy filters for education, age, geography, and participation
              patterns that shape who can move into or absorb AI-driven change.
            </p>
          </div>
          <div className="glass-panel px-3 py-2 bg-white/[0.02] border border-white/5">
            <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">
              Data treatment
            </div>
            <div className="text-[11px] text-gray-400 leading-relaxed max-w-xs">
              Direct charts use scored AI exposure. Proxy charts are labeled as
              proxy views where the PLFS does not provide a direct cross-tab
              with AI score.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard
          label="Exposure pressure index"
          value={`${round1(latestPressure?.pressure)}/10`}
          sub={`${signedDelta(latestPressure?.pressure - firstPressure?.pressure)} vs ${firstPressure?.year || "start"}`}
          color={exposureCSS(latestPressure?.pressure || 0)}
        />
        <MetricCard
          label="High-exposure workforce"
          value={`${round1(latestPressure?.highExposureShare)}%`}
          sub="Workers in industries scored 6+"
          color="#f97316"
        />
        <MetricCard
          label="Digital-core workforce"
          value={`${round1(latestPressure?.digitalCoreShare)}%`}
          sub="Workers in industries scored 7+"
          color="#ef4444"
        />
        <MetricCard
          label="Largest exposed occupation"
          value={largestExposedOccupation?.name || "-"}
          sub={
            largestExposedOccupation
              ? `${largestExposedOccupation.worker_pct}% of workers · ${largestExposedOccupation.ai_exposure}/10`
              : "No occupation data"
          }
          color={exposureCSS(largestExposedOccupation?.ai_exposure || 0)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-4">
        <SeriesPanel
          title="Estimated AI exposure pressure over time"
          subtitle="Weighted average of industry AI scores using each year's workforce mix."
        >
          <LineChart
            series={exposureSeries.map((point) => ({
              year: point.year,
              value: point.pressure,
            }))}
            color="#00F5FF"
            unit="/10"
            filled
          />
        </SeriesPanel>
        <SeriesPanel
          title="How much of the workforce is already in exposed work?"
          subtitle="Two direct shares tracked from industry composition trends."
        >
          <DualSeriesChart
            primary={exposureSeries.map((point) => ({
              year: point.year,
              value: point.highExposureShare,
            }))}
            secondary={exposureSeries.map((point) => ({
              year: point.year,
              value: point.digitalCoreShare,
            }))}
            primaryLabel="High exposure"
            secondaryLabel="Digital core"
            primaryColor="#f97316"
            secondaryColor="#ef4444"
            unit="%"
          />
        </SeriesPanel>
      </div>

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
          Exposure Drivers by Sector
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {sectorCards.map((sector) => (
            <SectorCard key={sector.sector} sector={sector} />
          ))}
        </div>
      </div>

      <div className="glass-panel p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1">
              Exposure Filters
            </h2>
            <p className="text-[10px] text-gray-500">
              Filter industries and occupations by AI score band, then sort to
              see where the largest exposed worker pools actually sit.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {BAND_FILTERS.map((item) => (
              <button
                key={item.key}
                onClick={() => setBand(item.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  band === item.key
                    ? "bg-white/10 text-white border-white/10"
                    : "bg-white/[0.03] text-gray-500 border-white/5 hover:text-gray-300"
                }`}
                style={
                  band === item.key
                    ? { boxShadow: `inset 0 0 0 1px ${item.color}55` }
                    : undefined
                }
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ background: item.color }}
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <RankedListPanel
            title="Industries"
            subtitle={`${filteredIndustries.length} industries in ${activeBand.label.toLowerCase()}`}
            sort={industrySort}
            onSort={setIndustrySort}
            rows={filteredIndustries.map((industry) => ({
              key: industry.code,
              badge: industry.code,
              label: industry.name,
              value: industry.worker_pct,
              valueLabel: `${industry.worker_pct}%`,
              meta: `${industry.ai_exposure}/10 · ${exposureLabel(industry.ai_exposure)} · ${formatNumber(industry.workers_millions)}`,
              color: exposureCSS(industry.ai_exposure),
            }))}
          />
          <RankedListPanel
            title="Occupations"
            subtitle={`${filteredOccupations.length} occupation groups in ${activeBand.label.toLowerCase()}`}
            rows={filteredOccupations.map((occupation) => ({
              key: occupation.code,
              badge: occupation.code,
              label: occupation.name,
              value: occupation.worker_pct,
              valueLabel: `${occupation.worker_pct}%`,
              meta: `${occupation.ai_exposure}/10 · ${exposureLabel(occupation.ai_exposure)} · ${formatNumber(occupation.workers_millions)}`,
              color: exposureCSS(occupation.ai_exposure),
            }))}
          />
        </div>
      </div>

      <div className="glass-panel p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                AI Transition Readiness Proxies
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/10">
                Proxy view
              </span>
            </div>
            <p className="text-[10px] text-gray-500 max-w-3xl">
              These filters do not directly measure AI exposure. They show the
              labour-market conditions that determine who can access, adapt to,
              or be displaced by higher-exposure work.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROXY_DIMENSIONS.map((item) => (
              <button
                key={item.key}
                onClick={() => setProxyDimension(item.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  proxyDimension === item.key
                    ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-300"
                    : "border-white/5 bg-white/[0.03] text-gray-500 hover:text-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {proxyDimension === "education" &&
            EDUCATION_METRICS.map((metric) => (
              <button
                key={metric}
                onClick={() => setEducationMetric(metric)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium ${
                  educationMetric === metric
                    ? "bg-white/10 text-white"
                    : "text-gray-600 bg-white/[0.03] hover:text-gray-300"
                }`}
              >
                {metric.toUpperCase()}
              </button>
            ))}
          {proxyDimension === "sector" &&
            SECTOR_GENDERS.map((gender) => (
              <button
                key={gender}
                onClick={() => setSectorGender(gender)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium ${
                  sectorGender === gender
                    ? "bg-white/10 text-white"
                    : "text-gray-600 bg-white/[0.03] hover:text-gray-300"
                }`}
              >
                {capitalize(gender)}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 items-start">
          <SeriesPanel
            title={proxyView.title}
            subtitle={proxyView.note}
            compact
          >
            <ProxyBars rows={proxyView.items} />
          </SeriesPanel>
          <div className="space-y-3">
            {proxyView.items.slice(0, 4).map((item) => (
              <ProxySummaryCard key={item.label} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div
      className="glass-panel p-4 border-t-2"
      style={{ borderColor: `${color}55` }}
    >
      <div className="text-[9px] uppercase tracking-widest text-gray-600 mb-1">
        {label}
      </div>
      <div className="text-xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-gray-500 mt-1 leading-relaxed">
        {sub}
      </div>
    </div>
  );
}

function SeriesPanel({ title, subtitle, children, compact = false }) {
  return (
    <div className="glass-panel p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1">
        {title}
      </h3>
      <p className={`text-[10px] text-gray-500 ${compact ? "mb-3" : "mb-4"}`}>
        {subtitle}
      </p>
      {children}
    </div>
  );
}

function LineChart({ series, color, unit, filled = false }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const values = series
    .map((point) => point.value)
    .filter((value) => value != null);
  if (!values.length) return null;
  const width = 640;
  const height = 240;
  const pad = { left: 40, right: 14, top: 12, bottom: 30 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const min = Math.min(...values) * 0.94;
  const max = Math.max(...values) * 1.06;
  const range = max - min || 1;
  const x = (index) =>
    pad.left + (index / Math.max(series.length - 1, 1)) * chartW;
  const y = (value) => pad.top + ((max - value) / range) * chartH;
  const path = series
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${x(index)},${y(point.value)}`,
    )
    .join(" ");
  const area = `${path} L${x(series.length - 1)},${pad.top + chartH} L${x(0)},${pad.top + chartH} Z`;
  const ticks = Array.from({ length: 4 }, (_, index) => {
    const value = max - (range / 3) * index;
    return { y: pad.top + (chartH / 3) * index, label: round1(value) };
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height: 240 }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const localX = ((event.clientX - rect.left) / rect.width) * width;
        const idx = Math.round(
          ((localX - pad.left) / chartW) * (series.length - 1),
        );
        setHoverIndex(Math.max(0, Math.min(series.length - 1, idx)));
      }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <defs>
        <linearGradient id="pressure-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => (
        <g key={tick.y}>
          <line
            x1={pad.left}
            y1={tick.y}
            x2={width - pad.right}
            y2={tick.y}
            stroke="rgba(255,255,255,0.05)"
          />
          <text
            x={pad.left - 6}
            y={tick.y}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#666"
            fontSize="9"
          >
            {tick.label}
          </text>
        </g>
      ))}
      {filled && <path d={area} fill="url(#pressure-area)" />}
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" />
      {series.map((point, index) => (
        <g key={point.year}>
          <circle
            cx={x(index)}
            cy={y(point.value)}
            r={hoverIndex === index ? 4.5 : 2.5}
            fill={hoverIndex === index ? "#fff" : color}
            stroke={hoverIndex === index ? color : "none"}
            strokeWidth={hoverIndex === index ? 2 : 0}
          />
          <text
            x={x(index)}
            y={height - 10}
            textAnchor="middle"
            fill="#666"
            fontSize="8"
          >
            {shrinkYear(point.year)}
          </text>
        </g>
      ))}
      {hoverIndex != null && series[hoverIndex] && (
        <g>
          <line
            x1={x(hoverIndex)}
            y1={pad.top}
            x2={x(hoverIndex)}
            y2={pad.top + chartH}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4,3"
          />
          <rect
            x={x(hoverIndex) - 34}
            y={y(series[hoverIndex].value) - 24}
            width="68"
            height="18"
            rx="4"
            fill="rgba(11,11,15,0.9)"
            stroke="rgba(255,255,255,0.08)"
          />
          <text
            x={x(hoverIndex)}
            y={y(series[hoverIndex].value) - 12}
            textAnchor="middle"
            fill={color}
            fontSize="9"
            fontWeight="700"
          >
            {round1(series[hoverIndex].value)}
            {unit}
          </text>
        </g>
      )}
    </svg>
  );
}

function DualSeriesChart({
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  primaryColor,
  secondaryColor,
  unit,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const merged = primary.map((point, index) => ({
    year: point.year,
    primary: point.value,
    secondary: secondary[index]?.value,
  }));
  const values = merged
    .flatMap((point) => [point.primary, point.secondary])
    .filter((value) => value != null);
  if (!values.length) return null;
  const width = 520;
  const height = 220;
  const pad = { left: 40, right: 14, top: 18, bottom: 30 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const min = Math.min(...values) * 0.94;
  const max = Math.max(...values) * 1.06;
  const range = max - min || 1;
  const x = (index) =>
    pad.left + (index / Math.max(merged.length - 1, 1)) * chartW;
  const y = (value) => pad.top + ((max - value) / range) * chartH;
  const line = (key) =>
    merged
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${x(index)},${y(point[key])}`,
      )
      .join(" ");
  return (
    <div>
      <div className="flex gap-4 text-[10px] mb-2">
        <LegendSwatch label={primaryLabel} color={primaryColor} />
        <LegendSwatch label={secondaryLabel} color={secondaryColor} />
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: 220 }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const localX = ((event.clientX - rect.left) / rect.width) * width;
          const idx = Math.round(
            ((localX - pad.left) / chartW) * (merged.length - 1),
          );
          setHoverIndex(Math.max(0, Math.min(merged.length - 1, idx)));
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {Array.from({ length: 4 }, (_, index) => {
          const value = max - (range / 3) * index;
          const gridY = pad.top + (chartH / 3) * index;
          return (
            <g key={gridY}>
              <line
                x1={pad.left}
                y1={gridY}
                x2={width - pad.right}
                y2={gridY}
                stroke="rgba(255,255,255,0.05)"
              />
              <text
                x={pad.left - 6}
                y={gridY}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#666"
                fontSize="9"
              >
                {round1(value)}
              </text>
            </g>
          );
        })}
        <path
          d={line("primary")}
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.5"
        />
        <path
          d={line("secondary")}
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2.5"
        />
        {merged.map((point, index) => (
          <g key={point.year}>
            <circle
              cx={x(index)}
              cy={y(point.primary)}
              r={hoverIndex === index ? 4 : 2.5}
              fill={primaryColor}
            />
            <circle
              cx={x(index)}
              cy={y(point.secondary)}
              r={hoverIndex === index ? 4 : 2.5}
              fill={secondaryColor}
            />
            <text
              x={x(index)}
              y={height - 10}
              textAnchor="middle"
              fill="#666"
              fontSize="8"
            >
              {shrinkYear(point.year)}
            </text>
          </g>
        ))}
        {hoverIndex != null && merged[hoverIndex] && (
          <g>
            <line
              x1={x(hoverIndex)}
              y1={pad.top}
              x2={x(hoverIndex)}
              y2={pad.top + chartH}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="4,3"
            />
            <rect
              x={x(hoverIndex) - 40}
              y={pad.top + 6}
              width="80"
              height="32"
              rx="4"
              fill="rgba(11,11,15,0.9)"
              stroke="rgba(255,255,255,0.08)"
            />
            <text
              x={x(hoverIndex)}
              y={pad.top + 18}
              textAnchor="middle"
              fill={primaryColor}
              fontSize="9"
              fontWeight="700"
            >
              {round1(merged[hoverIndex].primary)}
              {unit}
            </text>
            <text
              x={x(hoverIndex)}
              y={pad.top + 29}
              textAnchor="middle"
              fill={secondaryColor}
              fontSize="9"
              fontWeight="700"
            >
              {round1(merged[hoverIndex].secondary)}
              {unit}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function LegendSwatch({ label, color }) {
  return (
    <div className="flex items-center gap-1.5 text-gray-400">
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ background: color }}
      />
      <span>{label}</span>
    </div>
  );
}

function SectorCard({ sector }) {
  return (
    <div
      className="glass-panel p-4 border-l-2"
      style={{ borderColor: `${exposureCSS(sector.avgExposure)}55` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm font-semibold text-white">
            {sector.sector}
          </div>
          <div className="text-[10px] text-gray-500">
            Current workforce mix and AI intensity
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-lg font-black"
            style={{ color: exposureCSS(sector.avgExposure) }}
          >
            {round1(sector.avgExposure)}/10
          </div>
          <div className="text-[10px] text-gray-600">avg exposure</div>
        </div>
      </div>
      <div className="space-y-2 text-[11px]">
        <SectorMetric
          label="Workforce share"
          value={`${round1(sector.latestShare)}%`}
        />
        <SectorMetric
          label="Share change"
          value={`${signedDelta(sector.delta)} pp`}
          tone={sector.delta >= 0 ? "#10b981" : "#ef4444"}
        />
        <SectorMetric
          label="High-exposure inside sector"
          value={`${round1(sector.highExposurePct)}%`}
          tone="#f97316"
        />
      </div>
    </div>
  );
}

function SectorMetric({ label, value, tone = "#e5e7eb" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold" style={{ color: tone }}>
        {value}
      </span>
    </div>
  );
}

function RankedListPanel({ title, subtitle, rows, sort, onSort }) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-semibold text-gray-300">{title}</div>
          <div className="text-[10px] text-gray-600">{subtitle}</div>
        </div>
        {onSort && (
          <div className="flex gap-1">
            <button
              onClick={() => onSort("workers")}
              className={`px-2 py-1 rounded text-[10px] ${sort === "workers" ? "bg-white/10 text-white" : "text-gray-600 bg-white/[0.03]"}`}
            >
              Workforce
            </button>
            <button
              onClick={() => onSort("exposure")}
              className={`px-2 py-1 rounded text-[10px] ${sort === "exposure" ? "bg-white/10 text-white" : "text-gray-600 bg-white/[0.03]"}`}
            >
              AI score
            </button>
          </div>
        )}
      </div>
      <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
        {rows.map((row) => (
          <div
            key={row.key}
            className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5"
          >
            <div className="flex items-start gap-2 mb-1.5">
              <span
                className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                style={{ background: `${row.color}22`, color: row.color }}
              >
                {row.badge}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-gray-300 leading-snug">
                  {row.label}
                </div>
                <div className="text-[10px] text-gray-600">{row.meta}</div>
              </div>
              <div
                className="text-[11px] font-semibold"
                style={{ color: row.color }}
              >
                {row.valueLabel}
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(row.value / maxValue) * 100}%`,
                  background: `linear-gradient(90deg, ${row.color}99, ${row.color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProxyBars({ rows }) {
  const maxValue = Math.max(...rows.map((row) => row.latest), 1);
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5"
        >
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="text-[11px] text-gray-300 truncate">
              {row.label}
            </span>
            <div className="text-right">
              <div className="text-[11px] font-semibold text-white">
                {round1(row.latest)}%
              </div>
              <div
                className="text-[10px]"
                style={{ color: row.delta >= 0 ? "#10b981" : "#ef4444" }}
              >
                {signedDelta(row.delta)} pp
              </div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-brand-cyan to-emerald-400"
              style={{ width: `${(row.latest / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProxySummaryCard({ item }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-1">
        {item.label}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-xl font-black text-white">
          {round1(item.latest)}%
        </div>
        <div
          className="text-xs font-semibold"
          style={{ color: item.delta >= 0 ? "#10b981" : "#ef4444" }}
        >
          {signedDelta(item.delta)} pp
        </div>
      </div>
      <div className="text-[10px] text-gray-500 mt-1">
        vs {item.firstYear || "first year"}
      </div>
    </div>
  );
}

function toProxyRow(label, series) {
  if (!series?.length) return null;
  const valid = series.filter((point) => point?.value != null);
  if (!valid.length) return null;
  return {
    label,
    latest: valid[valid.length - 1].value,
    delta: valid[valid.length - 1].value - valid[0].value,
    firstYear: valid[0].year,
  };
}

function round1(value) {
  if (value == null || Number.isNaN(value)) return "-";
  return (Math.round(value * 10) / 10).toFixed(1);
}

function signedDelta(value) {
  if (value == null || Number.isNaN(value)) return "-";
  return `${value >= 0 ? "+" : ""}${round1(value)}`;
}

function shrinkYear(year) {
  return String(year || "").replace("20", "'");
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
