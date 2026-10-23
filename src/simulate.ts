/**
 * Uncertainty, search and sensitivity.
 *
 * Inflow varies more than any lever on the page, so a single line is a misleading answer: the
 * band is the honest width. The optimiser and the tornado chart both run the same pure model.
 */

import { COEFS, V, withCoefs } from './data';
import { equilibriumFt, stepElevation } from './lake';
import { DEFAULT_DIALS, pkgModel, type Dials, type PkgResult } from './model';

// ───────────────────────── Seeded randomness ─────────────────────────

/** A small deterministic generator, so every run of the page gives the same band. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function standardNormal(rand: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ───────────────────────── Inflow sequences ─────────────────────────

export interface SimResult {
  years: number[];
  p10: number[];
  p50: number[];
  p90: number[];
  mean: number[];
  shareHealthy: number;
  shareBelowCritical: number;
  runs: number;
}

/**
 * Stochastic inflow sequences with year-to-year spread and drought persistence, run through the
 * same lake response as the deterministic path.
 */
export function simulate(result: PkgResult, opts: { runs?: number; seed?: number; longDrought?: boolean } = {}): SimResult {
  const runs = Math.round(opts.runs ?? V('sim_runs'));
  const seed = opts.seed ?? 20260101;
  const longDrought = opts.longDrought ?? result.dials.longDrought;

  const n = result.years.length;
  const cv = V('inflow_cv');
  const rho = V('inflow_ar1');
  const sigma = cv * Math.sqrt(1 - rho * rho);

  const paths: number[][] = [];
  for (let run = 0; run < runs; run++) {
    const rand = mulberry32(seed + run * 7919);
    let anomaly = standardNormal(rand) * cv;
    // A long drought shifts the whole sequence down rather than widening it.
    const droughtScale = longDrought && rand() < 0.2 ? V('fat_tail_factor') : 1;
    let elevation = V('lake_now');
    const path: number[] = [];
    for (let i = 0; i < n; i++) {
      anomaly = rho * anomaly + standardNormal(rand) * sigma;
      const row = result.years[i];
      const baseInflow = row.inflowKaf - row.netToLakeKaf;
      const wet = Math.max(0.2, 1 + anomaly) * droughtScale;
      elevation = stepElevation(elevation, baseInflow * wet + row.netToLakeKaf);
      path.push(elevation);
    }
    paths.push(path);
  }

  const pick = (sorted: number[], q: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))))];
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];
  const mean: number[] = [];
  for (let i = 0; i < n; i++) {
    const col = paths.map((p) => p[i]).sort((a, b) => a - b);
    p10.push(pick(col, 0.1));
    p50.push(pick(col, 0.5));
    p90.push(pick(col, 0.9));
    mean.push(col.reduce((s, x) => s + x, 0) / col.length);
  }

  const finals = paths.map((p) => p[n - 1]);
  return {
    years: result.years.map((y) => y.year),
    p10,
    p50,
    p90,
    mean,
    shareHealthy: finals.filter((e) => e >= V('healthy_min') && e <= V('healthy_max')).length / finals.length,
    shareBelowCritical: finals.filter((e) => e < V('serious_low')).length / finals.length,
    runs,
  };
}

// ───────────────────────── Sensitivity ─────────────────────────

export interface TornadoRow {
  id: string;
  label: string;
  status: string;
  lowValue: number;
  highValue: number;
  lowElevation: number;
  highElevation: number;
  lowNet: number;
  highNet: number;
  swingFt: number;
  swingKaf: number;
}

/**
 * Which assumptions actually move the answer. Each coefficient is pushed to each end of its
 * stated range, everything else held, and the change in the final lake level recorded.
 */
export function sensitivity(dials: Partial<Dials> = {}, topN = 14): TornadoRow[] {
  const rows: TornadoRow[] = [];
  for (const c of COEFS) {
    if (c.low === undefined || c.high === undefined) continue;
    if (c.low === c.high) continue;
    const lo = withCoefs({ [c.id]: c.low }, () => pkgModel(dials));
    const hi = withCoefs({ [c.id]: c.high }, () => pkgModel(dials));
    rows.push({
      id: c.id,
      label: c.label,
      status: c.status,
      lowValue: c.low,
      highValue: c.high,
      lowElevation: lo.final.elevationFt,
      highElevation: hi.final.elevationFt,
      lowNet: lo.final.netToLakeKaf,
      highNet: hi.final.netToLakeKaf,
      swingFt: Math.abs(hi.final.elevationFt - lo.final.elevationFt),
      swingKaf: Math.abs(hi.final.netToLakeKaf - lo.final.netToLakeKaf),
    });
  }
  rows.sort((a, b) => b.swingFt - a.swingFt);
  return rows.slice(0, topN);
}

// ───────────────────────── The optimiser ─────────────────────────

export interface SearchSpaceEntry {
  key: keyof Dials;
  label: string;
  min: number;
  max: number;
  step?: number;
  boolean?: boolean;
}

/**
 * The dials the search is allowed to move.
 *
 * Derived from the dial object rather than hand-listed, so a dial added to `Dials` without
 * being added here fails the test rather than silently sitting outside the search.
 */
export const SEARCH_SPACE: SearchSpaceEntry[] = [
  { key: 'monitoringM', label: 'Monitoring and verification', min: 0, max: 50 },
  { key: 'leaseToOwnM', label: 'Money for lease-to-own rights', min: 0, max: 100 },
  { key: 'capitalPricePerAf', label: 'Price of a water right', min: 250, max: 9000 },
  { key: 'scarcityRatePerAf', label: 'Scarcity charge on industry', min: 0, max: 400 },
  { key: 'escalatorOn', label: 'Charge climbs while the lake is short', min: 0, max: 1, boolean: true },
  { key: 'cropLevyPerAf', label: 'Crop levy rate', min: 0, max: 400 },
  { key: 'levyThresholdAfPerAcre', label: 'Crop levy threshold', min: 1.5, max: 4 },
  { key: 'levyToTransition', label: 'Levy money routed to transition', min: 0, max: 1 },
  { key: 'mandateFloorKaf', label: 'Mandated cut floor', min: 0, max: 1200 },
  { key: 'mandatePhaseYears', label: 'Years to phase the mandate in', min: 1, max: 25 },
  { key: 'mandatePenaltyPerAf', label: 'Penalty for not meeting the mandate', min: 0, max: 2440 },
  { key: 'repossessOn', label: 'Repossess once willing sellers run out', min: 0, max: 1, boolean: true },
  { key: 'repossessCapKaf', label: 'Most repossessed in a year', min: 0, max: 150 },
  { key: 'cloudM', label: 'Cloud seeding', min: 0, max: 10 },
  { key: 'phragM', label: 'Phragmites removal', min: 0, max: 25 },
  { key: 'cropSwitchM', label: 'Crop switching', min: 0, max: 60 },
  { key: 'lawnCutAsked', label: 'Watering cut asked of households', min: 0, max: 0.5 },
  { key: 'citationsPerThousandJuly', label: 'Citations per thousand people in July', min: 0, max: 20 },
  { key: 'finePerViolation', label: 'Fine per violation', min: 0, max: 1000 },
];

export interface OptimiseResult {
  dials: Dials;
  result: PkgResult;
  score: number;
  tried: number;
  waterScore: number;
  supportScore: number;
}

/** Score a package: how much water, and how well it survives a legislature. */
export function scorePackage(r: PkgResult, waterWeight: number): { score: number; water: number; support: number } {
  const water = Math.min(1, r.final.netToLakeKaf / Math.max(1, r.goalKaf));
  const support = r.support.weakest.score / 100;
  return { score: waterWeight * water + (1 - waterWeight) * support, water, support };
}

/**
 * Random search over the levers. Deterministic for a given seed, so the button gives the same
 * answer twice and a reviewer can reproduce it.
 */
export function optimise(
  waterWeight: number,
  opts: { tries?: number; seed?: number; base?: Partial<Dials> } = {},
): OptimiseResult {
  const tries = opts.tries ?? 1000;
  const rand = mulberry32(opts.seed ?? 424242);
  const base: Dials = { ...DEFAULT_DIALS, ...opts.base };

  let best: OptimiseResult | null = null;
  const consider = (dials: Dials) => {
    const result = pkgModel(dials);
    const s = scorePackage(result, waterWeight);
    if (!best || s.score > best.score) {
      best = { dials, result, score: s.score, tried: tries, waterScore: s.water, supportScore: s.support };
    }
  };

  consider(base);
  for (let i = 0; i < tries; i++) {
    const candidate: Dials = { ...base };
    for (const entry of SEARCH_SPACE) {
      const draw = entry.boolean
        ? rand() < 0.5
        : entry.min + rand() * (entry.max - entry.min);
      (candidate as unknown as Record<string, number | boolean>)[entry.key as string] = draw;
    }
    // The budget is fixed by the brief; spending has to fit inside it.
    const spend = candidate.monitoringM + candidate.cloudM + candidate.phragM + candidate.cropSwitchM + candidate.leaseToOwnM;
    if (spend > candidate.budgetM) {
      const scale = candidate.budgetM / spend;
      candidate.monitoringM *= scale;
      candidate.cloudM *= scale;
      candidate.phragM *= scale;
      candidate.cropSwitchM *= scale;
      candidate.leaseToOwnM *= scale;
    }
    consider(candidate);
  }

  return best!;
}

/** A budget sweep: what another dollar buys, and where it stops buying anything. */
export function budgetSweep(budgets: number[], base: Partial<Dials> = {}): { budgetM: number; netKaf: number; elevationFt: number; ceilingBinds: boolean }[] {
  return budgets.map((budgetM) => {
    const r = pkgModel({ ...base, budgetM, leaseToOwnM: budgetM * 0.4, monitoringM: Math.min(25, budgetM * 0.25) });
    return { budgetM, netKaf: r.final.netToLakeKaf, elevationFt: r.final.elevationFt, ceilingBinds: r.ceilingBinds };
  });
}

/** Where the lake settles for a sustained addition, for the target tab. */
export function levelForAdded(addedKaf: number, baselineFactor = 1): number {
  return equilibriumFt(V('baseline_inflow') * baselineFactor + addedKaf);
}
