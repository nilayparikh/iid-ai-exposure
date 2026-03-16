/**
 * Protocol Buffer data loader.
 *
 * Loads per-page .pb binary files and decodes them using the schema.proto
 * definition via protobufjs. Each page is loaded on-demand and cached.
 */
import protobuf from "protobufjs";

const BASE = import.meta.env.BASE_URL || "/";

let rootPromise = null;

/** Load and cache the .proto schema (singleton). */
function getRoot() {
  if (!rootPromise) {
    rootPromise = protobuf.load(`${BASE}pb/schema.proto`);
  }
  return rootPromise;
}

/** Round float32 precision artifacts. */
const r = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

/** Fetch a .pb binary and decode with the named message type. */
async function loadPage(pageName, messageType) {
  const [root, resp] = await Promise.all([
    getRoot(),
    fetch(`${BASE}pb/${pageName}.pb`),
  ]);
  if (!resp.ok) throw new Error(`Failed to load /pb/${pageName}.pb`);
  const buf = await resp.arrayBuffer();
  const MsgType = root.lookupType(messageType);
  const msg = MsgType.decode(new Uint8Array(buf));
  return MsgType.toObject(msg, {
    longs: Number,
    enums: String,
    defaults: true,
    arrays: true,
    objects: true,
  });
}

// ── Per-page loaders with transform to match existing component props ──
// protobufjs returns camelCase; components expect snake_case from JSON.

function yearValueToObj(yv) {
  return { year: yv.year, value: r(yv.value) };
}

function namedSeriesToMap(arr) {
  const map = {};
  for (const ns of arr || []) {
    map[ns.name] = (ns.data || []).map(yearValueToObj);
  }
  return map;
}

function genderSeriesToObj(gs) {
  if (!gs) return {};
  return {
    male: (gs.male || []).map(yearValueToObj),
    female: (gs.female || []).map(yearValueToObj),
    person: (gs.person || []).map(yearValueToObj),
  };
}

function transformIndustry(ind) {
  return {
    code: ind.code || "",
    name: ind.name || "",
    section_code: ind.sectionCode || 0,
    sector: ind.sector || "",
    worker_pct: r(ind.workerPct),
    workers_millions: r(ind.workersMillions),
    ai_exposure: r(ind.aiExposure),
    ai_rationale: ind.aiRationale || "",
    trend: (ind.trend || []).map(yearValueToObj),
  };
}

function transformOccupation(occ) {
  return {
    code: String(occ.code || ""),
    name: occ.name || "",
    division_code: occ.divisionCode || 0,
    worker_pct: r(occ.workerPct),
    workers_millions: r(occ.workersMillions),
    ai_exposure: r(occ.aiExposure),
    ai_rationale: occ.aiRationale || "",
    trend: (occ.trend || []).map(yearValueToObj),
  };
}

function transformSummary(s) {
  if (!s) return {};
  return {
    total_workers_millions: r(s.totalWorkersMillions),
    weighted_avg_exposure: r(s.weightedAvgExposure),
    high_exposure_workers_millions: r(s.highExposureWorkersMillions),
    num_industries: s.numIndustries || 0,
    num_occupations: s.numOccupations || 0,
    latest_lfpr: r(s.latestLfpr),
    latest_ur: r(s.latestUr),
    latest_regular_wage: r(s.latestRegularWage),
    data_source: s.dataSource || "",
    data_year: s.dataYear || "",
    data_years: s.dataYears || [],
  };
}

function transformAssessment(a) {
  if (!a) return {};
  return {
    basis: a.basis || "",
    description: a.description || "",
    coverage_note: a.coverageNote || "",
    signals: (a.signals || []).map((s) => ({
      label: s.label,
      weight: s.weight,
      description: s.description,
    })),
    tier_definitions: (a.tierDefinitions || []).map((t) => ({
      range: t.range,
      label: t.label,
      description: t.description,
    })),
  };
}

function transformIndicatorTrend(t) {
  return {
    name: t.name || "",
    unit: t.unit || "",
    data: (t.data || []).map(yearValueToObj),
  };
}

function transformWageType(w) {
  if (!w) return null;
  return {
    label: w.label || "",
    by_gender: genderSeriesToObj(w.byGender),
    latest_male: r(w.latestMale),
    latest_female: r(w.latestFemale),
    latest_person: r(w.latestPerson),
  };
}

// ── Cached page data ──

const cache = {};

export async function loadTreemapData() {
  if (cache.treemap) return cache.treemap;
  const raw = await loadPage("treemap", "TreemapPage");
  cache.treemap = {
    summary: transformSummary(raw.summary),
    assessment: transformAssessment(raw.assessment),
    industries: (raw.industries || []).map(transformIndustry),
    occupations: (raw.occupations || []).map(transformOccupation),
  };
  return cache.treemap;
}

export async function loadTrendsData() {
  if (cache.trends) return cache.trends;
  const raw = await loadPage("trends", "TrendsPage");
  const gt = raw.genderTrends || {};
  cache.trends = {
    trends: {
      lfpr: transformIndicatorTrend(raw.lfpr),
      wpr: transformIndicatorTrend(raw.wpr),
      ur: transformIndicatorTrend(raw.ur),
    },
    gender_trends: {
      lfpr: genderSeriesToObj(gt.lfpr),
      wpr: genderSeriesToObj(gt.wpr),
      ur: genderSeriesToObj(gt.ur),
    },
    broad_sectors: namedSeriesToMap(raw.broadSectors),
    employment_status: namedSeriesToMap(raw.employmentStatus),
  };
  return cache.trends;
}

export async function loadDemographicsData() {
  if (cache.demographics) return cache.demographics;
  const raw = await loadPage("demographics", "DemographicsPage");
  const eb = raw.educationBreakdown || {};
  cache.demographics = {
    education_breakdown: {
      lfpr: namedSeriesToMap(eb.lfpr),
      wpr: namedSeriesToMap(eb.wpr),
      ur: namedSeriesToMap(eb.ur),
    },
    sector_breakdown: Object.fromEntries(
      (raw.sectorBreakdown || []).map((sb) => [
        sb.sector,
        genderSeriesToObj(sb.data),
      ]),
    ),
    age_breakdown: Object.fromEntries(
      (raw.ageBreakdown || []).map((ab) => [
        ab.ageGroup,
        genderSeriesToObj(ab.data),
      ]),
    ),
    social_category: namedSeriesToMap(raw.socialCategory),
    religion: namedSeriesToMap(raw.religion),
  };
  return cache.demographics;
}

export async function loadStatesData() {
  if (cache.states) return cache.states;
  const raw = await loadPage("states", "StatesPage");
  cache.states = {
    states: (raw.states || []).map((s) => ({
      name: s.name,
      lfpr_latest: r(s.lfprLatest),
      wpr_latest: r(s.wprLatest),
      ur_latest: r(s.urLatest),
      lfpr_trend: (s.lfprTrend || []).map(yearValueToObj),
      wpr_trend: (s.wprTrend || []).map(yearValueToObj),
      ur_trend: (s.urTrend || []).map(yearValueToObj),
      lfpr_by_gender: s.lfprByGender?.values || {},
    })),
  };
  return cache.states;
}

export async function loadEmploymentData() {
  if (cache.employment) return cache.employment;
  const raw = await loadPage("employment", "EmploymentPage");
  cache.employment = {
    summary: transformSummary(raw.summary),
    industries: (raw.industries || []).map(transformIndustry),
    occupations: (raw.occupations || []).map(transformOccupation),
    employment_conditions: namedSeriesToMap(raw.employmentConditions),
    broad_sectors: namedSeriesToMap(raw.broadSectors),
  };
  return cache.employment;
}

export async function loadWagesData() {
  if (cache.wages) return cache.wages;
  const raw = await loadPage("wages", "WagesPage");
  const stateWages = {};
  for (const sw of raw.stateRegularWages || []) {
    stateWages[sw.name] = r(sw.value);
  }
  cache.wages = {
    wages: {
      regular_monthly: transformWageType(raw.regularMonthly),
      casual_daily: transformWageType(raw.casualDaily),
      self_employment_monthly: transformWageType(raw.selfEmploymentMonthly),
      state_regular_wages: stateWages,
    },
    summary: { data_year: raw.dataYear || "" },
  };
  return cache.wages;
}

export async function loadAssessmentData() {
  if (cache.assessment) return cache.assessment;
  const raw = await loadPage("assessment", "AssessmentPage");
  cache.assessment = {
    assessment: transformAssessment(raw.assessment),
    summary: transformSummary(raw.summary),
    industries: (raw.industries || []).map(transformIndustry),
    occupations: (raw.occupations || []).map(transformOccupation),
  };
  return cache.assessment;
}

/**
 * Load ALL pages in parallel and merge into the flat shape
 * that existing components expect (same as data.json structure).
 * Total ~53KB — much smaller than data.json's 153KB.
 */
export async function loadAllData() {
  const [treemap, trends, demographics, states, employment, wages, assessment] =
    await Promise.all([
      loadTreemapData(),
      loadTrendsData(),
      loadDemographicsData(),
      loadStatesData(),
      loadEmploymentData(),
      loadWagesData(),
      loadAssessmentData(),
    ]);

  return {
    summary: treemap.summary,
    assessment: treemap.assessment,
    industries: treemap.industries,
    occupations: treemap.occupations,
    trends: trends.trends,
    gender_trends: trends.gender_trends,
    broad_sectors: trends.broad_sectors,
    employment_status: trends.employment_status,
    education_breakdown: demographics.education_breakdown,
    sector_breakdown: demographics.sector_breakdown,
    age_breakdown: demographics.age_breakdown,
    social_category: demographics.social_category,
    religion: demographics.religion,
    states: states.states,
    employment_conditions: employment.employment_conditions,
    wages: wages.wages,
  };
}
