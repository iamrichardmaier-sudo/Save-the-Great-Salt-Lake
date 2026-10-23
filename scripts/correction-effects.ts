/**
 * What each correction did. For every coefficient whose value changed when it was checked at
 * source, put the old value back on its own and rerun: the difference is that correction's
 * effect on the 2055 lake level and on net economic value. Done for two packages:
 *
 *   - the plan as it stood before the corrections (research/pre-correction-package.json), which
 *     is how the corrections changed the answer the owner had, and
 *   - the current default package, the one the goal search chose.
 *
 * The lake area curve and the closure factor fitted to it changed together, so they are reverted
 * together. Run with `npm run effects`. Writes research/correction-effects.json.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { AREA_ANCHORS, COEFS, V, withCoefs } from '../src/data';
import { DEFAULT_DIALS, pkgModel, type Dials } from '../src/model';
import { fullSpendSchedule } from '../src/schedule';
import { VERIFICATION } from '../src/verification';

const pre = JSON.parse(readFileSync(new URL('../research/pre-correction-package.json', import.meta.url), 'utf8')).dials as Dials;
const OLD_ANCHORS = [
  { ft: 4188.5, sqmi: 888 },
  { ft: 4200, sqmi: 1700 },
  { ft: 4211.6, sqmi: 2300 },
];

function withOldAreaCurve<T>(fn: () => T): T {
  const anchors = AREA_ANCHORS as { ft: number; sqmi: number }[];
  const saved = anchors.splice(0, anchors.length, ...OLD_ANCHORS);
  try {
    return withCoefs({ inflow_efficiency: 1.03 }, fn);
  } finally {
    anchors.splice(0, anchors.length, ...saved);
  }
}

type Run = { flatFt: number; scheduleFt: number; firstYear: number | null; nevB: number; meets: boolean };
const runFor = (dials: Dials) => (): Run => {
  // The state's interest rate is a corrected coefficient, so the package follows it.
  const d = { ...dials, repossessInterest: V('state_interest') };
  const f = pkgModel(d);
  const s = fullSpendSchedule(d, { stepM: 2 });
  return { flatFt: f.final.elevationFt, scheduleFt: s.result.final.elevationFt, firstYear: s.firstYearAtTarget, nevB: s.nevM / 1000, meets: s.meetsGoal };
};

const corrected = COEFS.filter((c) => c.id !== 'inflow_efficiency' && VERIFICATION[c.id]?.previous?.value !== undefined);
const out: Record<string, unknown> = {};
for (const [name, dials] of [['preCorrectionPackage', pre], ['defaultPackage', DEFAULT_DIALS]] as const) {
  const run = runFor(dials);
  const now = run();
  const effect = (r: Run) => ({ effectFt: +(now.scheduleFt - r.scheduleFt).toFixed(3), effectNevB: +(now.nevB - r.nevB).toFixed(2), withOldValueMeetsGoal: r.meets });
  const rows = [
    { id: 'area curve + inflow_efficiency', old: 'three anchors, 1.03', now: 'USGS table, 0.933', ...effect(withOldAreaCurve(run)) },
    ...corrected.map((c) => ({ id: c.id, old: VERIFICATION[c.id].previous!.value!, now: c.value, ...effect(withCoefs({ [c.id]: VERIFICATION[c.id].previous!.value! }, run)) })),
  ].sort((a, b) => Math.abs(b.effectFt) - Math.abs(a.effectFt));
  out[name] = { now, rows };
  console.log(`\n${name}: now ${now.scheduleFt.toFixed(2)} ft in 2055 (flat ${now.flatFt.toFixed(2)}), first met ${now.firstYear ?? 'never'}, NEV $${now.nevB.toFixed(2)}B`);
  for (const r of rows) console.log(`  ${String(r.id).padEnd(32)} ${String(r.old).padStart(19)} -> ${String(r.now).padEnd(18)} ${r.effectFt >= 0 ? '+' : ''}${r.effectFt.toFixed(2)} ft  ${r.effectNevB >= 0 ? '+' : ''}${r.effectNevB.toFixed(2)} $B`);
}
writeFileSync(new URL('../research/correction-effects.json', import.meta.url), `${JSON.stringify(out, null, 1)}\n`);
