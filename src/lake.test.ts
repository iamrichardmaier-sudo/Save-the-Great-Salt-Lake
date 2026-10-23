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
    // The USGS area table is measured, not smooth: single feet wobble (4,192-93 ft adds less
    // area than 4,191-92). Over two-foot steps, from today's level to the healthy floor, each
    // step costs at least as much as the one below it.
    const perTwoFeet = (ft: number) => inflowToHoldKaf(ft + 2) - inflowToHoldKaf(ft);
    for (let ft = Math.floor(V('lake_now')); ft + 4 <= 4199; ft += 2) {
      expect(perTwoFeet(ft + 2)).toBeGreaterThanOrEqual(perTwoFeet(ft) - 1e-9);
    }
    // A foot at the healthy floor costs more than twice a foot at today's level.
    expect(inflowToHoldKaf(4198) - inflowToHoldKaf(4197)).toBeGreaterThan(
      2 * (inflowToHoldKaf(Math.floor(V('lake_now')) + 1) - inflowToHoldKaf(Math.floor(V('lake_now')))),
    );
    // And a bigger lake always evaporates strictly more than today's.
    expect(inflowToHoldKaf(V('healthy_min'))).toBeGreaterThan(inflowToHoldKaf(V('lake_now')));
    expect(inflowToHoldKaf(V('healthy_max'))).toBeGreaterThan(inflowToHoldKaf(V('healthy_min')));
  });

  it('costs much more to hold the healthy range than the public deficit figure suggests', () => {
    // Restoring the lake raises its own evaporation: the gap is not the current shortfall.
    const extraEvaporation = inflowToHoldKaf(V('healthy_min')) - inflowToHoldKaf(V('lake_now'));
    expect(extraEvaporation).toBeGreaterThan(700);
  });

  it('agrees with the USGS elevation-area table', () => {
    // Root (2023), USGS data release doi:10.5066/P9DGG75W, whole lake, NGVD29 feet.
    const table = [
      { ft: 4188.5, sqmi: 894 },
      { ft: 4191.1, sqmi: 967 },
      { ft: 4195, sqmi: 1176.5 },
      { ft: 4198, sqmi: 1422.5 },
      { ft: 4200, sqmi: 1602.3 },
    ];
    for (const row of table) {
      expect(Math.abs(areaSqMi(row.ft) - row.sqmi) / row.sqmi).toBeLessThan(0.01);
    }
  });

  it('says today the lake sits below where today’s average inflow would settle it', () => {
    // Water year 2025 was dry (79% of average precipitation), so the lake ended it below its
    // equilibrium at the 2000-2025 average inflow. That equilibrium is still well short of the
    // healthy floor.
    expect(V('lake_now')).toBeLessThan(equilibriumFt(V('baseline_inflow')));
    expect(addedInflowForFt(V('lake_now'))).toBeLessThan(0);
    expect(addedInflowForFt(V('lake_now'))).toBeGreaterThan(-100);
    expect(equilibriumFt(V('baseline_inflow'))).toBeLessThan(V('healthy_min') - 5);
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
