/**
 * Write research/dependencies.json: every coefficient, what it feeds, and how much it moves the
 * answer on the default package (the one the goal search chose). Run with `npm run trace`.
 *
 * The page computes the same thing live; this file is the record a report can cite.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { COEFS } from '../src/data';
import { STAGES, impacts, traceDependencies } from '../src/connections';
import { fullSpendSchedule } from '../src/schedule';
import { DEFAULT_DIALS } from '../src/model';

const read = (f: string) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
const feeds = traceDependencies(Object.fromEntries(['model.ts', 'lake.ts', 'schedule.ts', 'simulate.ts', 'ui/tabs.ts'].map((f) => [f, read(f)])));
const base = DEFAULT_DIALS;
const plan = fullSpendSchedule(base);
const impact = new Map(impacts(base, plan).map((x) => [x.id, x]));
const stage = new Map(STAGES.map((s) => [s.id, s]));

const rows = COEFS.map((c) => ({
  id: c.id,
  label: c.label,
  group: c.group,
  status: c.status,
  value: c.value,
  unit: c.unit,
  feeds: [...(feeds.get(c.id) ?? [])].map((s) => stage.get(s)!.label),
  decides: [...new Set([...(feeds.get(c.id) ?? [])].flatMap((s) => stage.get(s)!.outputs))],
  lakeSwingFt: impact.get(c.id)?.lakeSwingFt ?? null,
  nevSwingM: impact.get(c.id)?.nevSwingM ?? null,
})).sort((a, b) => (b.lakeSwingFt ?? -1) - (a.lakeSwingFt ?? -1));

writeFileSync(new URL('../research/dependencies.json', import.meta.url), `${JSON.stringify(rows, null, 2)}\n`);
console.log(`${rows.length} coefficients; ${rows.filter((r) => r.feeds.length === 0).length} used nowhere.`);
