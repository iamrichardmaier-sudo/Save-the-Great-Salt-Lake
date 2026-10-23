/**
 * The map of how numbers connect is read from the code, so these tests hold the code to it: a
 * coefficient the code asks for must exist, and a coefficient nothing uses must be named here.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COEFS } from './data';
import { CALCULATING, STAGES, impacts, traceDependencies } from './connections';
import { optimise } from './simulate';
import { fullSpendSchedule } from './schedule';

const read = (f: string) => readFileSync(new URL(f, import.meta.url), 'utf8');
const files = {
  'model.ts': read('./model.ts'),
  'lake.ts': read('./lake.ts'),
  'schedule.ts': read('./schedule.ts'),
  'simulate.ts': read('./simulate.ts'),
  'ui/tabs.ts': read('./ui/tabs.ts'),
};
const feeds = traceDependencies(files);
const ids = new Set(COEFS.map((c) => c.id));

/** Coefficients kept in the index for context although no calculation or sentence uses them. */
const UNUSED_ON_PURPOSE: string[] = ['hay_depletion', 'farmer_compensation_low', 'farmer_compensation_high'];

describe('how the numbers connect', () => {
  it('every coefficient the code reads exists', () => {
    for (const id of feeds.keys()) expect(ids.has(id), id).toBe(true);
  });

  it('every stage a coefficient is attributed to is a known stage', () => {
    const stages = new Set(STAGES.map((s) => s.id));
    for (const set of feeds.values()) for (const st of set) expect(stages.has(st), st).toBe(true);
  });

  it('every coefficient is used, or is named here as kept for context', () => {
    const unused = COEFS.filter((c) => !feeds.has(c.id)).map((c) => c.id).sort();
    expect(unused).toEqual([...UNUSED_ON_PURPOSE].sort());
  });

  it('the lake physics reach the lake balance and the programme figures reach the programmes', () => {
    for (const id of ['evap_gross', 'precip_lake', 'inflow_efficiency', 'response_k']) expect(feeds.get(id)?.has('lake'), id).toBe(true);
    for (const id of ['cloud_cost', 'phrag_cap', 'crop_delivery', 'onfarm_cost']) expect(feeds.get(id)?.has('programmes'), id).toBe(true);
    expect(feeds.get('wage_per_job')?.has('budget')).toBe(true);
    expect(feeds.get('lake_value_per_af')?.has('budget')).toBe(true);
  });

  it('most coefficients feed a calculation rather than only the page', () => {
    const calc = COEFS.filter((c) => [...(feeds.get(c.id) ?? [])].some((st) => CALCULATING.has(st)));
    expect(calc.length).toBeGreaterThan(COEFS.length * 0.8);
  });

  it('every coefficient with a range gets an impact, and the lake physics move the lake', () => {
    const base = optimise(0.6, { tries: 200, seed: 424242 }).dials;
    const plan = fullSpendSchedule(base, { stepM: 5, iterations: 0, maxLambda: 0 });
    const x = new Map(impacts(base, plan).map((i) => [i.id, i]));
    const ranged = COEFS.filter((c) => c.low !== undefined && c.high !== undefined && c.low !== c.high);
    expect(x.size).toBe(ranged.length);
    expect(x.get('evap_gross')!.lakeSwingFt).toBeGreaterThan(1);
    expect(x.get('lake_value_per_af')!.nevSwingM).toBeGreaterThan(1000);
  }, 60_000);
});
