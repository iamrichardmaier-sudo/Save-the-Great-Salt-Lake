/**
 * Search the policy dials for a package that reaches the healthy floor, with its 0.5 ft margin,
 * by 2055 on the fixed $100M a year. This is how the page's default package was chosen.
 *
 * Run with `npm run goal-search`. Two stages, both deterministic:
 *
 *   1. For each of eight seeds, 20,000 random packages, then a hill-climb on the worst 2055 level
 *      across the package and six ±10% nudges of its dials, so a knife-edge package loses.
 *   2. From the best stage-1 package whose year-by-year budget meets the goal, a hill-climb on the
 *      lower of the flat and year-by-year 2055 levels.
 *
 * What the search may not move: the price of a water right and the state's interest rate (market
 * assumptions, not policy), the budget, the horizon and the climate. A watering ask below 5% is
 * snapped to none, because the lawn model raises full fine revenue from a token ask.
 *
 * Writes research/goal-search.json and prints the best package next to the current defaults.
 */

import { writeFileSync } from 'node:fs';
import { DEFAULT_DIALS, pkgModel, type Dials } from '../src/model';
import { mulberry32, SEARCH_SPACE } from '../src/simulate';
import { fullSpendSchedule } from '../src/schedule';

const SPACE = SEARCH_SPACE;
const MONEY = ['monitoringM', 'cloudM', 'phragM', 'cropSwitchM', 'leaseToOwnM'] as const;

function fit(d: Dials): Dials {
  if (d.lawnCutAsked < 0.05) d.lawnCutAsked = 0;
  const spend = MONEY.reduce((s, k) => s + d[k], 0);
  if (spend > d.budgetM) for (const k of MONEY) d[k] *= d.budgetM / spend;
  return d;
}

function nudge(d: Dials, rand: () => number, scale: number): Dials {
  const c = { ...d } as unknown as Record<string, number | boolean>;
  const e = SPACE[Math.floor(rand() * SPACE.length)];
  c[e.key as string] = e.boolean
    ? !c[e.key as string]
    : Math.min(e.max, Math.max(e.min, (c[e.key as string] as number) + (rand() - 0.5) * (e.max - e.min) * scale));
  return fit(c as unknown as Dials);
}

const flat = (d: Dials) => pkgModel(d).final.elevationFt;

const stage1: { seed: number; dials: Dials; flatFt: number; robustFt: number; scheduleFt: number; meets: boolean }[] = [];
for (let seed = 1; seed <= 8; seed++) {
  const rand = mulberry32(seed);
  let best = { d: DEFAULT_DIALS, s: -Infinity };
  for (let i = 0; i < 20_000; i++) {
    const c = { ...DEFAULT_DIALS } as unknown as Record<string, number | boolean>;
    for (const e of SPACE) c[e.key as string] = e.boolean ? rand() < 0.5 : e.min + rand() * (e.max - e.min);
    const d = fit(c as unknown as Dials);
    const s = flat(d);
    if (s > best.s) best = { d, s };
  }
  const shake = mulberry32(99);
  const shakes = Array.from({ length: 6 }, () => SPACE.map(() => 0.9 + 0.2 * shake()));
  const robust = (d: Dials) =>
    Math.min(
      flat(d),
      ...shakes.map((f) => {
        const c = { ...d } as unknown as Record<string, number | boolean>;
        SPACE.forEach((e, j) => {
          if (!e.boolean) c[e.key as string] = Math.min(e.max, Math.max(e.min, (c[e.key as string] as number) * f[j]));
        });
        return flat(fit(c as unknown as Dials));
      }),
    );
  let cur = { d: best.d, s: robust(best.d) };
  for (let it = 0; it < 3000; it++) {
    const c = nudge(cur.d, rand, 0.15);
    const s = robust(c);
    if (s >= cur.s) cur = { d: c, s };
  }
  const sch = fullSpendSchedule(cur.d);
  stage1.push({ seed, dials: cur.d, flatFt: flat(cur.d), robustFt: cur.s, scheduleFt: sch.result.final.elevationFt, meets: sch.meetsGoal });
  console.log(`seed ${seed}: flat ${flat(cur.d).toFixed(3)} ft, robust ${cur.s.toFixed(3)} ft, year by year ${sch.result.final.elevationFt.toFixed(3)} ft, ${sch.meetsGoal ? 'meets' : 'misses'}`);
}

const start = [...stage1].sort((a, b) => Number(b.meets) - Number(a.meets) || b.scheduleFt - a.scheduleFt)[0];
const rand = mulberry32(5);
const both = (d: Dials) => {
  const f = pkgModel(d);
  const s = fullSpendSchedule(d, { stepM: 2 });
  const tail = Math.min(...f.years.slice(-8).map((y) => y.elevationFt), ...s.result.years.slice(-8).map((y) => y.elevationFt));
  return Math.min(f.final.elevationFt, s.result.final.elevationFt) + 0.2 * tail + 0.001 * f.support.weakest.score;
};
let cur = { d: start.dials, s: both(start.dials) };
for (let it = 0; it < 100; it++) {
  const c = nudge(cur.d, rand, 0.2);
  if (c.lawnCutAsked !== cur.d.lawnCutAsked) continue;
  const s = both(c);
  if (s > cur.s) cur = { d: c, s };
}

const report = (label: string, d: Dials) => {
  const f = pkgModel(d);
  const s = fullSpendSchedule(d);
  const row = {
    label,
    flatFt: +f.final.elevationFt.toFixed(3),
    scheduleFt: +s.result.final.elevationFt.toFixed(3),
    meetsGoal: s.meetsGoal,
    firstYearAtTarget: s.firstYearAtTarget,
    nevB: +(s.nevM / 1000).toFixed(2),
    weakestSupport: `${f.support.weakest.label} ${f.support.weakest.score.toFixed(0)}`,
  };
  console.log(JSON.stringify(row));
  return row;
};
const found = report('search result', cur.d);
const current = report('current defaults', DEFAULT_DIALS);
writeFileSync(
  new URL('../research/goal-search.json', import.meta.url),
  `${JSON.stringify({ stage1: stage1.map(({ dials, ...r }) => r), found: { ...found, dials: cur.d }, current }, null, 1)}\n`,
);
