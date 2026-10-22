import { describe, expect, it } from 'vitest';
import {
  addedInflowForFt,
  areaSqMi,
  elevationForAreaSqMi,
  elevationPath,
  equilibriumFt,
  inflowToHoldKaf,
  netEvaporationFtPerYr,
  stepElevation,
} from './lake';
import { AREA_ANCHORS, USU_VALIDATION, V } from './data';

describe('the evaporation balance', () => {
  it('reproduces the published equilibrium elevations within the stated tolerance', () => {
    for (const row of USU_VALIDATION) {
      const modelled = equilibriumFt(V('baseline_inflow') + row.addedKaf);
      expect(Math.abs(modelled - row.elevationFt)).toBeLessThanOrEqual(0.6);
    }
  });

  it('puts the goal near the bottom of the healthy range', () => {
    const atGoal = equilibriumFt(V('baseline_inflow') + V('goal_added'));
    expect(atGoal).toBeGreaterThan(V('healthy_min') - 0.5);
    expect(atGoal).toBeLessThan(V('healthy_min') + 1.5);
  });

  it('passes through every area anchor exactly', () => {
    for (const a of AREA_ANCHORS) {
      expect(areaSqMi(a.ft)).toBeCloseTo(a.sqmi, 6);
      expect(elevationForAreaSqMi(a.sqmi)).toBeCloseTo(a.ft, 6);
    }
  });

  it('inverts area and elevation consistently', () => {
    for (let ft = 4186; ft <= 4214; ft += 0.5) {
      expect(elevationForAreaSqMi(areaSqMi(ft))).toBeCloseTo(ft, 6);
    }
  });

  it('inverts inflow and equilibrium consistently', () => {
    for (let inflow = 1200; inflow <= 3200; inflow += 50) {
      expect(inflowToHoldKaf(equilibriumFt(inflow))).toBeCloseTo(inflow, 6);
    }
  });
});

describe('each foot of recovery costs more than the last', () => {
  it('needs more added inflow per foot as the lake rises, over the range that matters', () => {
    const perFoot = (ft: number) => inflowToHoldKaf(ft + 1) - inflowToHoldKaf(ft);
    // Between today's level and the top of the healthy range, every foot costs at least as
    // much as the one below it. Above 4,200 ft the published anchors imply the lake spreads
    // more slowly per foot, so the marginal cost falls there; that is in the source data, not
    // an artifact of the model, and no policy in this model reaches it.
    for (let ft = Math.floor(V('lake_now')); ft < 4199; ft += 1) {
      expect(perFoot(ft + 1)).toBeGreaterThanOrEqual(perFoot(ft) - 1e-9);
    }
    // And a bigger lake always evaporates strictly more than today's.
    expect(inflowToHoldKaf(V('healthy_min'))).toBeGreaterThan(inflowToHoldKaf(V('lake_now')));
    expect(inflowToHoldKaf(V('healthy_max'))).toBeGreaterThan(inflowToHoldKaf(V('healthy_min')));
  });

  it('costs much more to hold the healthy range than the public deficit figure suggests', () => {
    // Restoring the lake raises its own evaporation: the gap is not the current shortfall.
    const extraEvaporation = inflowToHoldKaf(V('healthy_min')) - inflowToHoldKaf(V('lake_now'));
    expect(extraEvaporation).toBeGreaterThan(700);
  });

  it('agrees with the published table of levels', () => {
    const table = [
      { ft: 4191.1, sqmi: 1072, hold: 1680 },
      { ft: 4195, sqmi: 1347, hold: 2111 },
      { ft: 4198, sqmi: 1559, hold: 2443 },
      { ft: 4200, sqmi: 1700, hold: 2665 },
    ];
    for (const row of table) {
      expect(areaSqMi(row.ft)).toBeCloseTo(row.sqmi, -0.5);
      expect(inflowToHoldKaf(row.ft)).toBeCloseTo(row.hold, -1);
    }
  });

  it('says today the lake is a little short of holding its own level', () => {
    expect(addedInflowForFt(V('lake_now'))).toBeGreaterThan(0);
    expect(addedInflowForFt(V('lake_now'))).toBeLessThan(40);
  });
});

describe('net evaporation', () => {
  it('is what leaves less what falls on the lake', () => {
    expect(netEvaporationFtPerYr()).toBeCloseTo(V('evap_gross') - V('precip_lake'), 10);
  });
});

describe('year-by-year response', () => {
  it('moves toward equilibrium and never past it', () => {
    const inflow = V('baseline_inflow') + V('goal_added');
    const target = equilibriumFt(inflow);
    let e = V('lake_now');
    for (let i = 0; i < 200; i++) {
      const next = stepElevation(e, inflow);
      expect(next).toBeGreaterThan(e - 1e-9);
      expect(next).toBeLessThanOrEqual(target + 1e-9);
      e = next;
    }
    expect(e).toBeCloseTo(target, 2);
  });

  it('falls back toward equilibrium when inflow drops', () => {
    const path = elevationPath(V('healthy_min'), Array(40).fill(V('baseline_inflow')));
    expect(path[path.length - 1]).toBeLessThan(V('healthy_min'));
    expect(path[path.length - 1]).toBeCloseTo(equilibriumFt(V('baseline_inflow')), 1);
  });

  it('returns one elevation per year asked for', () => {
    expect(elevationPath(V('lake_now'), Array(29).fill(V('baseline_inflow'))).length).toBe(29);
  });
});
