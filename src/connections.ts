/**
 * How the numbers connect: which coefficient feeds which part of the model, and how much each
 * one moves the answer.
 *
 * The map is read from the model's own source code rather than written by hand, so it cannot
 * drift from what the model actually does: every `V('<id>')` call is attributed to the part of
 * the model it sits in.
 */

import { COEFS, withCoefs } from './data';
import { pkgModel, type Dials } from './model';
import { nevParts, type ScheduleResult } from './schedule';

export interface Stage {
  id: string;
  label: string;
  /** What this part of the model produces, in plain words. */
  produces: string;
  /** Which of the outputs it feeds. */
  outputs: OutputId[];
}

export type OutputId = 'water' | 'lake' | 'budget' | 'people';

export const OUTPUTS: { id: OutputId; label: string }[] = [
  { id: 'water', label: 'Net water to the lake' },
  { id: 'lake', label: 'Lake elevation' },
  { id: 'budget', label: 'Year-by-year budget and its value' },
  { id: 'people', label: 'Jobs, farm losses and support' },
];

export const STAGES: Stage[] = [
  { id: 'baseline', label: 'Baseline and goal', produces: 'today’s inflow and the inflow the goal adds', outputs: ['water', 'lake'] },
  { id: 'lake', label: 'Lake balance', produces: 'elevation from inflow, evaporation and area', outputs: ['lake'] },
  { id: 'programmes', label: 'Programmes', produces: 'water from cloud seeding, phragmites, crop switching, on-farm work', outputs: ['water', 'budget'] },
  { id: 'charge', label: 'Scarcity charge', produces: 'water users give up, and revenue', outputs: ['water', 'budget'] },
  { id: 'levy', label: 'Crop levy', produces: 'water from the heaviest irrigators, and revenue', outputs: ['water', 'budget'] },
  { id: 'rights', label: 'Rights and shepherding', produces: 'water rights bought, held and protected to the lake', outputs: ['water', 'budget'] },
  { id: 'mandate', label: 'Mandate', produces: 'cuts ordered where voluntary water falls short', outputs: ['water', 'people'] },
  { id: 'delivery', label: 'Delivery and losses', produces: 'share that reaches the lake, less growth and shrinking rivers', outputs: ['water'] },
  { id: 'lawns', label: 'Residential lawns', produces: 'watering cut, compliance and fines', outputs: ['water'] },
  { id: 'jobs', label: 'Jobs', produces: 'jobs gained and lost', outputs: ['people', 'budget'] },
  { id: 'economics', label: 'Value and cost', produces: 'lake value, farm revenue lost, livestock at risk', outputs: ['budget', 'people'] },
  { id: 'support', label: 'Support', produces: 'how each group scores the package', outputs: ['people'] },
  { id: 'budget', label: 'Year-by-year budget', produces: 'where each year’s money goes', outputs: ['budget'] },
  { id: 'uncertainty', label: 'Uncertainty', produces: 'wet and dry year bands', outputs: ['lake'] },
  { id: 'settings', label: 'Starting settings', produces: 'the dials’ default positions', outputs: ['water', 'budget'] },
  { id: 'summary', label: 'Summary figures', produces: 'end-of-plan totals the support scores read', outputs: ['people'] },
  { id: 'display', label: 'Explanation only', produces: 'figures quoted on the page that no calculation uses', outputs: [] },
];

/** Stages that compute something, as against explaining it. */
export const CALCULATING = new Set(STAGES.filter((s) => s.outputs.length > 0).map((s) => s.id));

/** Section markers inside the package model's yearly loop, matched on the comment's opening words. */
const LOOP_SECTIONS: [RegExp, string][] = [
  [/Shepherding capacity/, 'rights'],
  [/The scarcity charge/, 'charge'],
  [/Revenue recycles/, 'charge'],
  [/Programmes/, 'programmes'],
  [/Acquisition/, 'rights'],
  [/Repossession/, 'rights'],
  [/The mandate/, 'mandate'],
  [/Delivery/, 'delivery'],
  [/The lake/, 'lake'],
  [/Jobs/, 'jobs'],
  [/Money/, 'economics'],
];

const FUNCTION_STAGES: Record<string, string> = {
  lawnModel: 'lawns',
  chargeModel: 'charge',
  levyModel: 'levy',
  supportModel: 'support',
  runProgram: 'programmes',
  reconcile: 'economics',
  nevParts: 'budget',
  build: 'budget',
  fullSpendSchedule: 'budget',
  simulate: 'uncertainty',
};

/**
 * Attribute every `V('<id>')` call in the given source files to a stage.
 *
 * `files` maps a file name (model.ts, lake.ts, schedule.ts, simulate.ts, ui/tabs.ts) to its text;
 * anything under ui/ only explains, so a coefficient it names is marked 'display'. Lines are
 * walked in order, keeping track of the enclosing top-level function and, inside the package
 * model, of the section comment that opens each part of the yearly loop.
 */
export function traceDependencies(files: Record<string, string>): Map<string, Set<string>> {
  const feeds = new Map<string, Set<string>>();
  const add = (id: string, stage: string) => {
    if (!feeds.has(id)) feeds.set(id, new Set());
    feeds.get(id)!.add(stage);
  };

  for (const [name, text] of Object.entries(files)) {
    let fn = '';
    let section = '';
    let inLoop = false;
    for (const line of text.split('\n')) {
      const top = line.match(/^(?:export )?(?:function|const) ([A-Za-z0-9_]+)/);
      if (top) {
        fn = top[1];
        section = '';
        inLoop = false;
      }
      if (fn === 'pkgModel' && /for \(let i = 0; i < nYears/.test(line)) inLoop = true;
      const marker = line.match(/^\s*\/\/ ── (.*)/);
      if (marker && fn === 'pkgModel') {
        const hit = LOOP_SECTIONS.find(([re]) => re.test(marker[1]));
        if (hit) section = hit[1];
      }

      if (fn === 'pkgModel' && /const final = years\[/.test(line)) section = 'summary';

      let stage: string;
      if (name === 'lake.ts') stage = 'lake';
      else if (fn === 'DEFAULT_DIALS') stage = 'settings';
      else if (fn === 'pkgModel' && /growthDraw|streamflowDecline/.test(line)) stage = 'delivery';
      else if (fn === 'pkgModel' && /elevation/.test(line) && section !== 'summary') stage = 'lake';
      else if (fn === 'pkgModel' && inLoop) stage = section || 'delivery';
      else if (fn === 'pkgModel') stage = /goal|baseInflow|baseline/i.test(line) ? 'baseline' : 'delivery';
      else stage = FUNCTION_STAGES[fn] ?? (name === 'schedule.ts' ? 'budget' : name === 'simulate.ts' ? 'uncertainty' : 'economics');

      if (name.startsWith('ui/')) {
        // On the page a figure names its coefficient for provenance: V('x'), coef: 'x', figCoef('x').
        for (const m of line.matchAll(/(?:\bV\(|coef: |figCoef\(|coef\()'([a-z0-9_]+)'/g)) add(m[1], 'display');
        continue;
      }
      for (const m of line.matchAll(/\bV\(\s*[`']([a-z0-9_]+)(?:[`']|\$\{)/g)) add(m[1], stage);
      // Templated ids such as V(`${prefix}_cap`) name a family: attribute every member.
      for (const m of line.matchAll(/\bV\(`\$\{[a-zA-Z]+\}_([a-z_]+)`\)/g)) {
        for (const c of COEFS) if (c.id.endsWith(`_${m[1]}`)) add(c.id, stage);
      }
    }
  }
  return feeds;
}

export interface CoefImpact {
  id: string;
  /** Feet the 2055 lake moves across the coefficient's own range. */
  lakeSwingFt: number;
  /** $M the plan's net economic value moves across that range, holding the year-by-year split. */
  nevSwingM: number;
}

/**
 * How much each coefficient moves the answer, across its own stated range.
 *
 * The year-by-year split is held fixed here so the sweep stays quick: this measures how much a
 * number moves the value of the plan as it stands, not how the plan would be re-split.
 */
export function impacts(dials: Dials, plan: ScheduleResult): CoefImpact[] {
  const nevOf = (r: ReturnType<typeof pkgModel>) => r.years.reduce((s, y) => s + nevParts(y).nevM, 0);
  const withPlan = { ...dials, schedule: plan.schedule };
  return COEFS.filter((c) => c.low !== undefined && c.high !== undefined && c.low !== c.high).map((c) => {
    const lo = withCoefs({ [c.id]: c.low! }, () => pkgModel(withPlan));
    const hi = withCoefs({ [c.id]: c.high! }, () => pkgModel(withPlan));
    return {
      id: c.id,
      lakeSwingFt: Math.abs(hi.final.elevationFt - lo.final.elevationFt),
      nevSwingM: Math.abs(nevOf(hi) - nevOf(lo)),
    };
  });
}
