/**
 * The year-by-year budget.
 *
 * Built on the package the optimiser picks at the page's default weighting, which is the package
 * that reaches the healthy floor by the horizon. The flat dials stay the baseline these tests compare
 * against, so a change that quietly alters the flat model fails here too.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { V } from './data';
import { DEFAULT_DIALS, pkgModel, reconcile, type Dials, type YearSpend } from './model';
import { LEVERS, leanestSchedule, optimiseSchedule, type ScheduleResult } from './schedule';
import { optimise } from './simulate';

let base: Dials;
let full: ScheduleResult;
let lean: ScheduleResult;

beforeAll(() => {
  base = optimise(0.6, { tries: 1000, seed: 424242 }).dials;
  full = optimiseSchedule(base);
  lean = leanestSchedule(base);
}, 120_000);

const sumSpend = (s: YearSpend) => LEVERS.reduce((t, l) => t + s[l.id], 0);

describe('a schedule that copies the flat split', () => {
  it('reproduces the flat result exactly', () => {
    const flat = pkgModel(base);
    const schedule = flat.years.map((y) => ({
      monitoringM: y.monitoringSpendM,
      leaseM: y.leaseBudgetSpendM,
      cloudM: y.cloudSpendM,
      phragM: y.phragSpendM,
      cropM: y.cropSpendM,
      onfarmM: y.onfarmSpendM,
    }));
    const copied = pkgModel({ ...base, schedule });
    // Flat pays contracts out of the lease slice; a schedule pays them on top. With charge revenue
    // covering every contract here, the two are the same water.
    copied.years.forEach((y, i) => {
      expect(y.netToLakeKaf).toBeCloseTo(flat.years[i].netToLakeKaf, 6);
      expect(y.elevationFt).toBeCloseTo(flat.years[i].elevationFt, 9);
    });
  });

  it('leaves the default model untouched when no schedule is given', () => {
    const r = pkgModel(DEFAULT_DIALS);
    for (const y of r.years) expect(y.publicSpendM).toBe(DEFAULT_DIALS.budgetM);
  });
});

for (const [name, get] of [['everything worth its water', () => full], ['only what the goal needs', () => lean]] as const) {
  describe(`the budget: ${name}`, () => {
    it('never spends more than the annual budget', () => {
      for (const row of get().rows) {
        expect(row.totalM).toBeLessThanOrEqual(base.budgetM + 1e-9);
        expect(row.unspentM).toBeGreaterThanOrEqual(-1e-9);
      }
    });

    it('adds up every year: lines, contract payments and what is left equal the budget', () => {
      for (const row of get().rows) {
        expect(sumSpend(row.spend) + row.committedM + row.unspentM).toBeCloseTo(base.budgetM, 9);
      }
    });

    it('reaches the healthy floor with its margin by the horizon and holds it', () => {
      const s = get();
      expect(s.meetsGoal).toBe(true);
      expect(s.targetFt).toBeCloseTo(V('healthy_min') + 0.5, 9);
      expect(s.result.final.elevationFt).toBeGreaterThanOrEqual(s.targetFt);
    });

    it('funds no programme past its cap', () => {
      const caps: [keyof YearSpend, string][] = [['cloudM', 'cloud'], ['phragM', 'phrag'], ['onfarmM', 'onfarm']];
      for (const row of get().rows) {
        for (const [id, prefix] of caps) {
          const saturationM = (V(`${prefix}_cap`) * 1000 * V(`${prefix}_cost`)) / V(`${prefix}_delivery`) / 1e6;
          expect(row.spend[id]).toBeLessThanOrEqual(saturationM + 1e-6);
        }
      }
    });

    it('funds nothing that buys no water: taking any line away loses water', () => {
      const s = get();
      // Spot-check a spread of years rather than all of them, to keep the suite quick.
      for (const i of [0, 5, 14, s.rows.length - 1]) {
        for (const { id } of LEVERS) {
          if (s.schedule[i][id] <= 1e-6) continue;
          const schedule = s.schedule.slice();
          schedule[i] = { ...schedule[i], [id]: 0 };
          const r = pkgModel({ ...base, schedule });
          const lost = s.result.years.reduce((t, y, k) => t + y.netToLakeKaf - r.years[k].netToLakeKaf, 0);
          expect(lost).toBeGreaterThan(0);
        }
      }
    });

    it('passes every arithmetic check', () => {
      for (const c of reconcile(get().result)) expect(c.ok, c.label).toBe(true);
    });
  });
}

describe('the two budgets against each other', () => {
  it('the full build puts at least as much water in the lake as the flat split', () => {
    expect(full.result.final.elevationFt).toBeGreaterThanOrEqual(full.flat.final.elevationFt);
  });

  it('the lean build spends no more than the full one, and pays less for its dearest acre-foot', () => {
    expect(lean.totalSpentM).toBeLessThanOrEqual(full.totalSpentM + 1e-6);
    expect(lean.cutoffPerAf).toBeLessThan(full.cutoffPerAf);
  });

  it('the full build pays no acre-foot above the lake value', () => {
    expect(full.cutoffPerAf).toBe(V('lake_value_per_af'));
    expect(full.worstCostPerAf).toBeLessThanOrEqual(V('lake_value_per_af'));
  });
});
