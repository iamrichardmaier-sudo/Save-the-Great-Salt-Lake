/**
 * Write the year-by-year budget to research/budget-schedule.csv and print it as a table.
 *
 * Run with `npm run schedule`. Both budgets are built on the package the optimiser picks at the
 * page's default weighting, the package that reaches the healthy floor by the horizon.
 */

import { writeFileSync } from 'node:fs';
import { LEVERS, leanestSchedule, optimiseSchedule, type ScheduleResult } from '../src/schedule';
import { optimise } from '../src/simulate';

const base = optimise(0.6, { tries: 1000, seed: 424242 }).dials;
const plans: [string, ScheduleResult][] = [
  ['full', optimiseSchedule(base)],
  ['lean', leanestSchedule(base)],
];

const m = (v: number) => v.toFixed(2);
const lineFor = (s: ScheduleResult, i: number, id: (typeof LEVERS)[number]['id']) =>
  id === 'leaseM' ? s.rows[i].spend.leaseM + s.rows[i].committedM : s.rows[i].spend[id];

const header = ['budget', 'year', ...LEVERS.map((l) => `${l.label} ($M)`), 'Spent ($M)', 'Not needed ($M)', 'Net to lake (KAF/yr)', 'Lake (ft)', 'Flat-split lake (ft)'];
const csv = [header.join(',')];
for (const [name, s] of plans) {
  s.rows.forEach((row, i) => {
    csv.push([
      name,
      row.year,
      ...LEVERS.map((l) => m(lineFor(s, i, l.id))),
      m(row.totalM),
      m(row.unspentM),
      row.netToLakeKaf.toFixed(1),
      row.elevationFt.toFixed(2),
      row.flatElevationFt.toFixed(2),
    ].join(','));
  });
}
writeFileSync(new URL('../research/budget-schedule.csv', import.meta.url), `${csv.join('\n')}\n`);

for (const [name, s] of plans) {
  console.log(`\n## ${name === 'full' ? 'Everything worth its water' : 'Only what the goal needs'}`);
  console.log(
    `Dearest acre-foot paid for: $${s.cutoffPerAf.toFixed(0)}. Spent $${(s.totalSpentM / 1000).toFixed(2)}B, ` +
      `not needed $${(s.totalSavedM / 1000).toFixed(2)}B. Lake ${s.result.final.elevationFt.toFixed(2)} ft in ` +
      `${s.result.final.year} (flat split ${s.flat.final.elevationFt.toFixed(2)} ft); target ${s.targetFt.toFixed(1)} ft ` +
      `first met ${s.firstYearAtTarget ?? 'never'}, ${s.meetsGoal ? 'held after' : 'NOT met'}.\n`,
  );
  console.log(`| Year | ${LEVERS.map((l) => l.label).join(' | ')} | Spent | Not needed | Lake (ft) |`);
  console.log(`|---|${LEVERS.map(() => '---:').join('|')}|---:|---:|---:|`);
  s.rows.forEach((row, i) => {
    console.log(`| ${row.year} | ${LEVERS.map((l) => lineFor(s, i, l.id).toFixed(1)).join(' | ')} | ${row.totalM.toFixed(1)} | ${row.unspentM.toFixed(1)} | ${row.elevationFt.toFixed(2)} |`);
  });
}
