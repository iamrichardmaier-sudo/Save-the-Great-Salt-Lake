/**
 * The year-by-year budget.
 *
 * Built on the page's default package, which the goal search (scripts/goal-search.ts) chose
 * because it reaches the healthy floor with its margin by the horizon on $100M a year. The flat dials stay the baseline these tests compare
 * against, so a change that quietly alters the flat model fails here too.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { V } from './data';
import { DEFAULT_DIALS, pkgModel, reconcile, type Dials, type YearSpend } from './model';
import { LEVERS, fullSpendSchedule, nevParts, type ScheduleResult } from './schedule';

let base: Dials;
let s: ScheduleResult;

beforeAll(() => {
  base = { ...DEFAULT_DIALS };
  s = fullSpendSchedule(base);
}, 120_000);

const sumSpend = (x: YearSpend) => LEVERS.reduce((t, l) => t + x[l.id], 0);
const nevOf = (schedule: YearSpend[]) =>
  pkgModel({ ...base, schedule }).years.reduce((t, y) => t + nevParts(y).nevM, 0);

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
    // Flat pays contracts out of the lease slice; a schedule pays them on top. While charge revenue
    // covers every contract the two are the same water. Once the charge winds down as the lake
    // recovers, the schedule pays contracts from the budget as well, and the two part company.
    const covered = copied.years.findIndex((y, i) => Math.abs(y.leaseBudgetSpendM - flat.years[i].leaseBudgetSpendM) > 1e-9);
    const sameUntil = covered < 0 ? copied.years.length : covered;
    expect(sameUntil).toBeGreaterThanOrEqual(8);
    copied.years.slice(0, sameUntil).forEach((y, i) => {
      expect(y.netToLakeKaf).toBeCloseTo(flat.years[i].netToLakeKaf, 6);
      expect(y.elevationFt).toBeCloseTo(flat.years[i].elevationFt, 9);
    });
  });

  it('leaves the default model untouched when no schedule is given', () => {
    const r = pkgModel(DEFAULT_DIALS);
    for (const y of r.years) expect(y.publicSpendM).toBe(DEFAULT_DIALS.budgetM);
  });
});

describe('the full-spend budget', () => {
  it('spends exactly the whole budget every year', () => {
    for (const row of s.rows) {
      expect(row.totalM).toBeCloseTo(base.budgetM, 6);
      expect(Math.abs(row.unspentM)).toBeLessThan(1e-6);
      expect(sumSpend(row.spend) + row.committedM).toBeCloseTo(base.budgetM, 6);
    }
  });

  it('reaches the healthy floor with its margin by the horizon and holds it', () => {
    // At the edge: the margin over 4,198.5 ft in 2055 is a few hundredths of a foot.
    expect(s.meetsGoal).toBe(true);
    expect(s.targetFt).toBeCloseTo(V('healthy_min') + 0.5, 9);
    expect(s.result.final.elevationFt).toBeGreaterThanOrEqual(s.targetFt);
    expect(s.result.final.elevationFt - s.targetFt).toBeLessThan(0.2);
  });

  it('reports a missed goal, with the shortfall, when the package cannot reach it', () => {
    // The package the optimiser picked before the numbers were re-verified no longer gets there:
    // the result must say so rather than claim the goal.
    const weak = fullSpendSchedule({ ...DEFAULT_DIALS, mandateFloorKaf: 600, cropLevyPerAf: 0, repossessOn: false });
    expect(weak.meetsGoal).toBe(false);
    expect(weak.firstYearAtTarget).toBeNull();
    expect(weak.targetFt - weak.result.final.elevationFt).toBeGreaterThan(0);
  });

  it('funds no programme past its capacity', () => {
    const caps: [keyof YearSpend, string][] = [['cloudM', 'cloud'], ['phragM', 'phrag'], ['cropM', 'crop'], ['onfarmM', 'onfarm']];
    for (const row of s.rows) {
      for (const [id, prefix] of caps) {
        const saturationM = (V(`${prefix}_cap`) * 1000 * V(`${prefix}_cost`)) / V(`${prefix}_delivery`) / 1e6;
        expect(row.spend[id]).toBeLessThanOrEqual(saturationM + 1e-6);
      }
    }
  });

  it('net economic value is the sum of its parts every year', () => {
    for (const row of s.rows) {
      const p = row.nev;
      expect(p.lakeM - p.farmLossM - p.livestockLossM + p.wagesM).toBeCloseTo(p.nevM, 9);
      expect(p.lakeM).toBeCloseTo((row.netToLakeKaf * 1000 * V('lake_value_per_af')) / 1e6, 6);
    }
    expect(s.nevM).toBeCloseTo(s.rows.reduce((t, r) => t + r.nev.nevM, 0), 6);
  });

  it('beats the flat split and an even split on net economic value', () => {
    expect(s.nevM).toBeGreaterThanOrEqual(s.flatNevM);
    const share = base.budgetM / LEVERS.length;
    const even = s.rows.map(() => Object.fromEntries(LEVERS.map((l) => [l.id, share])) as unknown as YearSpend);
    expect(s.nevM).toBeGreaterThanOrEqual(nevOf(even));
  });

  it('cannot be improved by moving one block of money between two lines in a year', () => {
    // Spot-check: a local optimum should not gain from a simple swap.
    const blockM = 2;
    for (const i of [2, 10, 20]) {
      for (const from of LEVERS) {
        if (s.schedule[i][from.id] < blockM) continue;
        for (const to of LEVERS) {
          if (to.id === from.id) continue;
          const schedule = s.schedule.slice();
          schedule[i] = { ...schedule[i], [from.id]: schedule[i][from.id] - blockM, [to.id]: schedule[i][to.id] + blockM };
          const r = pkgModel({ ...base, schedule });
          if (r.years.some((y) => y.unspentM < -1e-6)) continue;
          const gain = r.years.reduce((t, y) => t + nevParts(y).nevM, 0) - s.nevM;
          // A greedy build in whole steps leaves only small gains on the table.
          expect(gain).toBeLessThan(0.01 * s.nevM);
        }
      }
    }
  });

  it('counts money spent past good value only where it was actually spent', () => {
    for (const row of s.rows) {
      expect(row.pastValueM).toBeGreaterThanOrEqual(0);
      expect(row.pastValueM).toBeLessThanOrEqual(row.totalM + 1e-6);
    }
  });

  it('passes every arithmetic check', () => {
    for (const c of reconcile(s.result)) expect(c.ok, c.label).toBe(true);
  });
});
