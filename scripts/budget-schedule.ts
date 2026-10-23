/**
 * Write the year-by-year budget to research/budget-schedule.csv and print it as a table.
 *
 * Run with `npm run schedule`. Built on the package the optimiser picks at the page's default
 * weighting, the package that reaches the healthy floor by the horizon. Every year spends the
 * whole budget.
 */

import { writeFileSync } from 'node:fs';
import { LEVERS, fullSpendSchedule, type ScheduleRow } from '../src/schedule';
import { optimise } from '../src/simulate';

const base = optimise(0.6, { tries: 1000, seed: 424242 }).dials;
const s = fullSpendSchedule(base);

const m = (v: number) => v.toFixed(2);
const lineFor = (row: ScheduleRow, id: (typeof LEVERS)[number]['id']) =>
  id === 'leaseM' ? row.spend.leaseM + row.committedM : row.spend[id];

const header = [
  'year',
  ...LEVERS.map((l) => `${l.label} ($M)`),
  'Spent ($M)',
  'Spent past good value ($M)',
  'Lake value of water ($M)',
  'Farm revenue lost ($M)',
  'Livestock receipts at risk ($M)',
  'Wages of jobs created ($M)',
  'Net economic value ($M)',
  'Net to lake (KAF/yr)',
  'Lake (ft)',
  'Flat-split lake (ft)',
];
const csv = [header.join(',')];
for (const row of s.rows) {
  csv.push([
    row.year,
    ...LEVERS.map((l) => m(lineFor(row, l.id))),
    m(row.totalM),
    m(row.pastValueM),
    m(row.nev.lakeM),
    m(row.nev.farmLossM),
    m(row.nev.livestockLossM),
    m(row.nev.wagesM),
    m(row.nev.nevM),
    row.netToLakeKaf.toFixed(1),
    row.elevationFt.toFixed(2),
    row.flatElevationFt.toFixed(2),
  ].join(','));
}
writeFileSync(new URL('../research/budget-schedule.csv', import.meta.url), `${csv.join('\n')}\n`);

console.log(
  `Spent $${(s.totalSpentM / 1000).toFixed(2)}B. Net economic value $${(s.nevM / 1000).toFixed(2)}B ` +
    `(flat split $${(s.flatNevM / 1000).toFixed(2)}B). Lake ${s.result.final.elevationFt.toFixed(2)} ft in ` +
    `${s.result.final.year} (flat split ${s.flat.final.elevationFt.toFixed(2)} ft); target ${s.targetFt.toFixed(1)} ft ` +
    `first met ${s.firstYearAtTarget ?? 'never'}, ${s.meetsGoal ? 'held after' : 'NOT met'}. Extra weight on water: ${s.lambda}. ` +
    `Spent past good value: $${s.pastValueM.toFixed(0)}M in ${s.pastValueYears} years.\n`,
);
console.log(`| Year | ${LEVERS.map((l) => l.label).join(' | ')} | Spent | Net economic value | Lake (ft) |`);
console.log(`|---|${LEVERS.map(() => '---:').join('|')}|---:|---:|---:|`);
for (const row of s.rows) {
  console.log(`| ${row.year} | ${LEVERS.map((l) => lineFor(row, l.id).toFixed(1)).join(' | ')} | ${row.totalM.toFixed(1)} | ${row.nev.nevM.toFixed(0)} | ${row.elevationFt.toFixed(2)} |`);
}
