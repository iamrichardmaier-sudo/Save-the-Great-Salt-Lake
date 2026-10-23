/**
 * The budget, year by year.
 *
 * Every year spends its whole budget. What moves is where the money goes: each year is split to
 * do the most economic good across everyone the plan touches, while the lake still reaches the
 * healthy floor by the horizon and stays there.
 *
 * Every decision is measured on the same pure model rather than on a formula of its own, so a
 * saturation point here can never disagree with what the model would deliver.
 */

import { V } from './data';
import { DEFAULT_DIALS, NO_SPEND, pkgModel, type Dials, type PkgResult, type YearRow, type YearSpend } from './model';

export type LeverId = keyof YearSpend;

export const LEVERS: { id: LeverId; label: string }[] = [
  { id: 'monitoringM', label: 'Monitoring and verification' },
  { id: 'leaseM', label: 'Water rights' },
  { id: 'cloudM', label: 'Cloud seeding' },
  { id: 'phragM', label: 'Phragmites removal' },
  { id: 'cropM', label: 'Crop switching' },
  { id: 'onfarmM', label: 'On-farm optimisation' },
];

/**
 * A year's net economic value, in $M.
 *
 * Water reaching the lake at what an acre-foot is worth there, less the farm revenue and livestock
 * receipts it takes, plus the wages of the transition and monitoring jobs the budget creates.
 * Lake-economy jobs and farm field jobs are left out on purpose: the lake value already counts the
 * lake economy, and lost farm revenue already counts farm wages, so adding them again would count
 * the same dollars twice.
 */
export interface NevParts {
  lakeM: number;
  farmLossM: number;
  livestockLossM: number;
  wagesM: number;
  nevM: number;
}

export function nevParts(y: YearRow): NevParts {
  const lakeM = y.benefitM;
  const farmLossM = y.farmRevenueLostM;
  const livestockLossM = y.livestockReceiptsAtRiskM;
  const wagesM = (y.transitionJobs * V('wage_per_job')) / 1e6;
  return { lakeM, farmLossM, livestockLossM, wagesM, nevM: lakeM - farmLossM - livestockLossM + wagesM };
}

export interface ScheduleRow {
  year: number;
  spend: YearSpend;
  /** Payments on rights already under contract that the budget, not charge revenue, covers. */
  committedM: number;
  totalM: number;
  unspentM: number;
  /** Money that went where its water cost more than the lake value, because nothing better was left. */
  pastValueM: number;
  netToLakeKaf: number;
  elevationFt: number;
  flatElevationFt: number;
  nev: NevParts;
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
  /** Net economic value over the plan, and the same for the flat split. */
  nevM: number;
  flatNevM: number;
  /** Extra weight on water needed to meet the goal; zero when the most economic split already does. */
  lambda: number;
  pastValueM: number;
  pastValueYears: number;
}

const STEP_M = 1;
const EPS = 1e-9;

const sumFrom = (r: PkgResult, from: number, f: (y: YearRow) => number) => {
  let s = 0;
  for (let i = from; i < r.years.length; i++) s += f(r.years[i]);
  return s;
};

function withSpend(schedule: YearSpend[], i: number, lever: LeverId, value: number): YearSpend[] {
  const next = schedule.slice();
  next[i] = { ...next[i], [lever]: value };
  return next;
}

/**
 * Build the budget one year at a time, spending all of it.
 *
 * Each year's money goes out in small amounts, each to whichever line adds the most net economic
 * value per dollar, counted through the horizon: a right bought now keeps delivering after it
 * vests but commits payments in later years, phragmites cleared now shows up years later, and the
 * scarcity charge eases as the lake recovers. A programme is funded only up to its capacity. When
 * every line's next dollar is poor value the money still goes out, to the least poor.
 *
 * `lambda` adds weight to water on top of its lake value, for when the most economic split alone
 * would leave the lake short of the goal.
 */
function build(base: Dials, lambda: number, step: number, targetFt: number, flat: PkgResult): ScheduleResult {
  const n = flat.years.length;
  const lakeValue = V('lake_value_per_af');
  const saturationM: Partial<Record<LeverId, number>> = {
    cloudM: (V('cloud_cap') * V('cloud_cost')) / V('cloud_delivery') / 1000,
    phragM: (V('phrag_cap') * V('phrag_cost')) / V('phrag_delivery') / 1000,
    cropM: (V('crop_cap') * V('crop_cost')) / V('crop_delivery') / 1000,
    onfarmM: (V('onfarm_cap') * V('onfarm_cost')) / V('onfarm_delivery') / 1000,
  };
  const score = (r: PkgResult, from: number) =>
    sumFrom(r, from, (y) => nevParts(y).nevM + (lambda * y.netToLakeKaf * lakeValue) / 1000);
  const fitsUnderCap = (r: PkgResult) => r.years.every((y) => y.unspentM >= -1e-6);

  let schedule: YearSpend[] = Array.from({ length: n }, () => ({ ...NO_SPEND }));
  let current = pkgModel({ ...base, schedule });
  const pastValue: number[] = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (;;) {
      const room = current.years[i].unspentM;
      if (room < EPS) break;
      const score0 = score(current, i);
      const water0 = sumFrom(current, i, (y) => y.netToLakeKaf);
      const money0 = sumFrom(current, i, (y) => y.publicSpendM);

      let best: { lever: LeverId; inc: number; r: PkgResult; perM: number; costPerAf: number } | null = null;
      for (const { id } of LEVERS) {
        // A programme is never funded past its capacity: there the money buys nothing at all.
        const headroom = (saturationM[id] ?? Infinity) - schedule[i][id];
        const inc = Math.min(step, room, headroom);
        if (inc < EPS) continue;
        const r = pkgModel({ ...base, schedule: withSpend(schedule, i, id, schedule[i][id] + inc) });
        if (!fitsUnderCap(r)) continue;
        const dMoney = sumFrom(r, i, (y) => y.publicSpendM) - money0;
        const perM = (score(r, i) - score0) / Math.max(dMoney, EPS);
        const dWater = sumFrom(r, i, (y) => y.netToLakeKaf) - water0;
        const costPerAf = dWater > EPS ? (dMoney * 1e6) / (dWater * 1000) : Infinity;
        if (!best || perM > best.perM) best = { lever: id, inc, r, perM, costPerAf };
      }

      // Nothing can take money (every programme at capacity, no rights to buy): monitoring has no cap.
      if (!best) {
        const r = pkgModel({ ...base, schedule: withSpend(schedule, i, 'monitoringM', schedule[i].monitoringM + room) });
        best = { lever: 'monitoringM', inc: room, r, perM: 0, costPerAf: Infinity };
      }

      if (best.costPerAf > lakeValue) pastValue[i] += best.inc;
      schedule = withSpend(schedule, i, best.lever, schedule[i][best.lever] + best.inc);
      current = best.r;
    }
  }

  const result = current;
  const rows: ScheduleRow[] = result.years.map((y, i) => ({
    year: y.year,
    spend: schedule[i],
    committedM: y.leaseBudgetSpendM - schedule[i].leaseM,
    totalM: y.publicSpendM,
    unspentM: y.unspentM,
    pastValueM: pastValue[i],
    netToLakeKaf: y.netToLakeKaf,
    elevationFt: y.elevationFt,
    flatElevationFt: flat.years[i].elevationFt,
    nev: nevParts(y),
  }));

  const firstIdx = result.years.findIndex((y) => y.elevationFt >= targetFt);
  const meetsGoal = firstIdx >= 0 && result.years.slice(firstIdx).every((y) => y.elevationFt >= targetFt);

  return {
    schedule,
    result,
    flat,
    rows,
    targetFt,
    firstYearAtTarget: firstIdx >= 0 ? result.years[firstIdx].year : null,
    meetsGoal,
    totalSpentM: rows.reduce((s, r) => s + r.totalM, 0),
    nevM: rows.reduce((s, r) => s + r.nev.nevM, 0),
    flatNevM: flat.years.reduce((s, y) => s + nevParts(y).nevM, 0),
    lambda,
    pastValueM: pastValue.reduce((s, v) => s + v, 0),
    pastValueYears: pastValue.filter((v) => v > 1e-6).length,
  };
}

/**
 * The full-spend budget: the most economic split of every year's whole budget that still meets the
 * goal. Tries the most economic split first; if that leaves the lake short, raises the weight on
 * water just far enough to meet it. If no weight meets it, returns the most water it found and says
 * the goal is missed.
 */
export function fullSpendSchedule(
  over: Partial<Dials> = {},
  opts: { stepM?: number; bufferFt?: number; iterations?: number; maxLambda?: number } = {},
): ScheduleResult {
  const base: Dials = { ...DEFAULT_DIALS, ...over, schedule: undefined };
  const step = opts.stepM ?? STEP_M;
  const targetFt = V('healthy_min') + (opts.bufferFt ?? 0.5);
  const flat = pkgModel(base);

  const economic = build(base, 0, step, targetFt, flat);
  if (economic.meetsGoal) return economic;

  const maxLambda = opts.maxLambda ?? 20;
  const waterHeavy = build(base, maxLambda, step, targetFt, flat);
  if (!waterHeavy.meetsGoal) return waterHeavy;

  let lo = 0;
  let hi = maxLambda;
  let best = waterHeavy;
  for (let k = 0; k < (opts.iterations ?? 6); k++) {
    const mid = (lo + hi) / 2;
    const trial = build(base, mid, step, targetFt, flat);
    if (trial.meetsGoal) {
      best = trial;
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return best;
}
