/**
 * The budget, year by year.
 *
 * A flat split keeps paying a lever after it has stopped turning money into water: a programme
 * past its cap, rights nobody is willing to sell, monitoring whose next dollar barely moves the
 * delivery share. This walks the years in order and gives each one only what still buys water,
 * leaving the rest unspent.
 *
 * Every decision is measured on the same pure model rather than on a formula of its own, so a
 * saturation point here can never disagree with what the model would deliver.
 */

import { V } from './data';
import { DEFAULT_DIALS, NO_SPEND, pkgModel, type Dials, type PkgResult, type YearSpend } from './model';

export type LeverId = keyof YearSpend;

export const LEVERS: { id: LeverId; label: string }[] = [
  { id: 'monitoringM', label: 'Monitoring and verification' },
  { id: 'leaseM', label: 'Water rights' },
  { id: 'cloudM', label: 'Cloud seeding' },
  { id: 'phragM', label: 'Phragmites removal' },
  { id: 'cropM', label: 'Crop switching' },
  { id: 'onfarmM', label: 'On-farm optimisation' },
];

export interface ScheduleRow {
  year: number;
  spend: YearSpend;
  /** Payments on rights already under contract that the budget, not charge revenue, covers. */
  committedM: number;
  totalM: number;
  unspentM: number;
  /** What the flat split would have spent on each line that year. */
  flat: YearSpend;
  netToLakeKaf: number;
  elevationFt: number;
  flatElevationFt: number;
}

export interface ScheduleResult {
  schedule: YearSpend[];
  result: PkgResult;
  flat: PkgResult;
  rows: ScheduleRow[];
  /** The elevation the plan must reach, with its safety margin. */
  targetFt: number;
  /** First year at or above the target, if any. */
  firstYearAtTarget: number | null;
  /** Reaches the target by the horizon and never falls back below it afterwards. */
  meetsGoal: boolean;
  totalSpentM: number;
  totalSavedM: number;
  /** The worst water any funded increment bought, in dollars per acre-foot. */
  worstCostPerAf: number;
  /** The dearest water an increment was allowed to buy, in dollars per acre-foot. */
  cutoffPerAf: number;
}

const STEP_M = 1;
const EPS_KAF = 1e-6;

/** Water reaching the lake, summed from year `from` to the horizon, in KAF. */
function waterFrom(r: PkgResult, from: number): number {
  let s = 0;
  for (let i = from; i < r.years.length; i++) s += r.years[i].netToLakeKaf;
  return s;
}

/** Public money spent from year `from` to the horizon, in $M. */
function moneyFrom(r: PkgResult, from: number): number {
  let s = 0;
  for (let i = from; i < r.years.length; i++) s += r.years[i].publicSpendM;
  return s;
}

function withSpend(schedule: YearSpend[], i: number, lever: LeverId, value: number): YearSpend[] {
  const next = schedule.slice();
  next[i] = { ...next[i], [lever]: value };
  return next;
}

/**
 * Build the budget one year at a time.
 *
 * Each year's money goes out in small increments, each to whichever line buys the most water per
 * dollar, counting water through the horizon and money through the horizon. Counting both ways
 * matters: a right bought now keeps delivering after it vests, but it also commits payments in the
 * years after, and phragmites cleared now shows up years later.
 *
 * An increment is funded only while the water it buys is worth at least what it costs: no more
 * than the lake value of an acre-foot. Past that point the money is a diminishing return, and it is
 * left unspent. Increments shrink once the coarse ones stop paying, so a cap is filled rather than
 * overrun or left short. Nothing is funded that a later year's contracts could not pay for inside the cap.
 * A final pass trims each line back to the least money that delivers the same water, which removes
 * the part of the last increment that ran past a cap.
 */
export function optimiseSchedule(over: Partial<Dials> = {}, opts: { stepM?: number; bufferFt?: number; maxCostPerAf?: number } = {}): ScheduleResult {
  const base: Dials = { ...DEFAULT_DIALS, ...over, schedule: undefined };
  const step = opts.stepM ?? STEP_M;
  const targetFt = V('healthy_min') + (opts.bufferFt ?? 0.5);
  const flat = pkgModel(base);
  const n = flat.years.length;
  const maxCostPerAf = opts.maxCostPerAf ?? V('lake_value_per_af');

  let schedule: YearSpend[] = Array.from({ length: n }, () => ({ ...NO_SPEND }));
  let current = pkgModel({ ...base, schedule });
  let worstCostPerAf = 0;

  const fitsUnderCap = (r: PkgResult) => r.years.every((y) => y.unspentM >= -1e-9);

  // A programme funded to its cap stays there for the rest of the year, so it need not be asked
  // again. Only the cap counts: a programme can also buy nothing while the mandate is filling the
  // same gap, and that changes as soon as another line closes it.
  const saturationM: Partial<Record<LeverId, number>> = {
    cloudM: (V('cloud_cap') * V('cloud_cost')) / V('cloud_delivery') / 1000,
    phragM: (V('phrag_cap') * V('phrag_cost')) / V('phrag_delivery') / 1000,
    cropM: (V('crop_cap') * V('crop_cost')) / V('crop_delivery') / 1000,
    onfarmM: (V('onfarm_cap') * V('onfarm_cost')) / V('onfarm_delivery') / 1000,
  };

  for (let i = 0; i < n; i++) {
    const dead = new Set<LeverId>();
    // Coarse increments first, then finer ones to fill the part of a cap a coarse one would overrun.
    for (const size of [step, step / 4, step / 20]) for (;;) {
      const room = current.years[i].unspentM;
      if (room < 1e-9) break;
      const inc = Math.min(size, room);
      const water0 = waterFrom(current, i);
      const money0 = moneyFrom(current, i);

      let best: { lever: LeverId; r: PkgResult; costPerAf: number } | null = null;
      for (const { id } of LEVERS) {
        if (dead.has(id)) continue;
        const trial = withSpend(schedule, i, id, schedule[i][id] + inc);
        const r = pkgModel({ ...base, schedule: trial });
        const dWater = waterFrom(r, i) - water0;
        if (dWater <= EPS_KAF || !fitsUnderCap(r)) {
          if (dWater <= EPS_KAF && schedule[i][id] >= (saturationM[id] ?? Infinity) - 1e-9) dead.add(id);
          continue;
        }
        const costPerAf = ((moneyFrom(r, i) - money0) * 1e6) / (dWater * 1000);
        if (!best || costPerAf < best.costPerAf) best = { lever: id, r, costPerAf };
      }
      if (!best || best.costPerAf > maxCostPerAf) break;

      schedule = withSpend(schedule, i, best.lever, schedule[i][best.lever] + inc);
      current = best.r;
      worstCostPerAf = Math.max(worstCostPerAf, best.costPerAf);
    }
  }

  // Trim: the least money on each line that delivers the same water in every year.
  const sameWater = (r: PkgResult) => r.years.every((y, k) => y.netToLakeKaf >= current.years[k].netToLakeKaf - EPS_KAF);
  for (let i = 0; i < n; i++) {
    for (const { id } of LEVERS) {
      let hi = schedule[i][id];
      if (hi <= 0) continue;
      let lo = Math.max(0, hi - step);
      if (!sameWater(pkgModel({ ...base, schedule: withSpend(schedule, i, id, lo) }))) {
        for (let k = 0; k < 30; k++) {
          const mid = (lo + hi) / 2;
          if (sameWater(pkgModel({ ...base, schedule: withSpend(schedule, i, id, mid) }))) hi = mid;
          else lo = mid;
        }
        lo = hi;
      }
      schedule = withSpend(schedule, i, id, lo);
    }
  }

  const result = pkgModel({ ...base, schedule });
  const rows: ScheduleRow[] = result.years.map((y, i) => ({
    year: y.year,
    spend: schedule[i],
    committedM: y.leaseBudgetSpendM - schedule[i].leaseM,
    totalM: y.publicSpendM,
    unspentM: y.unspentM,
    flat: {
      monitoringM: flat.years[i].monitoringSpendM,
      leaseM: flat.years[i].leaseBudgetSpendM,
      cloudM: flat.years[i].cloudSpendM,
      phragM: flat.years[i].phragSpendM,
      cropM: flat.years[i].cropSpendM,
      onfarmM: flat.years[i].onfarmSpendM,
    },
    netToLakeKaf: y.netToLakeKaf,
    elevationFt: y.elevationFt,
    flatElevationFt: flat.years[i].elevationFt,
  }));

  const firstIdx = result.years.findIndex((y) => y.elevationFt >= targetFt);
  const meetsGoal = firstIdx >= 0 && result.years.slice(firstIdx).every((y) => y.elevationFt >= targetFt);
  const totalSpentM = rows.reduce((s, r) => s + r.totalM, 0);

  return {
    schedule,
    result,
    flat,
    rows,
    targetFt,
    firstYearAtTarget: firstIdx >= 0 ? result.years[firstIdx].year : null,
    meetsGoal,
    totalSpentM,
    totalSavedM: base.budgetM * n - totalSpentM,
    worstCostPerAf,
    cutoffPerAf: maxCostPerAf,
  };
}

/**
 * The leanest budget that still meets the goal.
 *
 * The same year-by-year build, but with the dearest acceptable acre-foot pulled down from the
 * lake value until any lower would miss the target. Everything above that cut-off is money the
 * goal does not need. If even the full build misses the goal, the full build is returned and
 * says so.
 */
export function leanestSchedule(over: Partial<Dials> = {}, opts: { bufferFt?: number; iterations?: number } = {}): ScheduleResult {
  let best = optimiseSchedule(over, { bufferFt: opts.bufferFt });
  if (!best.meetsGoal) return best;
  let lo = 0;
  let hi = best.cutoffPerAf;
  for (let k = 0; k < (opts.iterations ?? 7); k++) {
    const mid = (lo + hi) / 2;
    const trial = optimiseSchedule(over, { bufferFt: opts.bufferFt, maxCostPerAf: mid });
    if (trial.meetsGoal) {
      best = trial;
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return best;
}
