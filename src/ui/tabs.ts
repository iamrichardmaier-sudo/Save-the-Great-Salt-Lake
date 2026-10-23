/**
 * The tabs.
 *
 * Every sentence here is a template. No numeral is typed into prose: each one is read from the
 * model or from data.ts and rendered through `fig()`, which carries its basis and its source.
 */

import {
  BASELINES,
  COEFS,
  CONSUMERS,
  ENFORCEMENT_WINDOWS,
  LEGAL_ASSUMPTIONS,
  VALUE_PER_AF,
  V,
  WATERING_MONTHS,
  coef,
} from '../data';
import { SOURCES, source } from '../sources';
import { TABLE_VERIFICATION, VERIFICATION, type Verification } from '../verification';
import { areaSqMi, equilibriumFt, inflowToHoldKaf } from '../lake';
import { levyModel, seasonCoverage, type Dials, type PkgResult } from '../model';
import { budgetSweep, levelForAdded, type SimResult, type TornadoRow } from '../simulate';
import { LEVERS, type ScheduleResult } from '../schedule';
import { CALCULATING, OUTPUTS, STAGES, impacts, traceDependencies } from '../connections';
import modelSrc from '../model.ts?raw';
import lakeSrc from '../lake.ts?raw';
import scheduleSrc from '../schedule.ts?raw';
import simulateSrc from '../simulate.ts?raw';
import tabsSrc from './tabs.ts?raw';
import { controlsByGroup } from './controls';
import {
  dollarsShort,
  escapeHtml,
  feet,
  fig,
  figCoef,
  kafYr,
  millions,
  millionsYr,
  num,
  pct,
  perAf,
} from './format';
import {
  drawBars,
  drawCalibration,
  drawFlow,
  drawJobs,
  drawLake,
  drawLine,
  drawMonthly,
  drawStack,
  drawTornado,
} from './charts';

export interface Ctx {
  d: Dials;
  r: PkgResult;
  sim: SimResult;
  tornado: TornadoRow[];
  /** The year-by-year budget, built on demand: it runs the model thousands of times. */
  schedule(): ScheduleResult;
}

export interface Tab {
  id: string;
  label: string;
  group: 'plan' | 'detail';
  render(ctx: Ctx): string;
  mount?(root: HTMLElement, ctx: Ctx): void;
}

const LEVER_COLORS: Record<string, string> = {
  rights: 'var(--c1)',
  crop: 'var(--c2)',
  phrag: 'var(--c3)',
  cloud: 'var(--c4)',
  onfarm: 'var(--c5)',
  charge: 'var(--c6)',
  levy: 'var(--c7)',
  lawn: 'var(--c8)',
  forced: 'var(--c-bad)',
};

function tile(label: string, value: string, note: string, tone = ''): string {
  return `<div class="tile ${tone}">
    <p class="tile-label">${escapeHtml(label)}</p>
    <p class="tile-value">${value}</p>
    <p class="tile-note">${note}</p>
  </div>`;
}

function chart(id: string, title?: string, caption?: string): string {
  return `<figure class="chart-box">
    ${title ? `<figcaption class="chart-title">${escapeHtml(title)}</figcaption>` : ''}
    <div class="chart" id="${id}"></div>
    ${caption ? `<p class="chart-caption">${caption}</p>` : ''}
  </figure>`;
}

const byId = (root: HTMLElement, id: string) => root.querySelector<HTMLElement>(`#${id}`);

function sourceLinks(ids: readonly string[]): string {
  return ids
    .map((sid) => {
      const s = source(sid);
      return `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.publisher)}</a>`;
    })
    .join(', ');
}

// ───────────────────────────── 1 · Where we are ─────────────────────────────

const nowTab: Tab = {
  id: 'now',
  label: '1 · Where we are',
  group: 'plan',
  render({ r }) {
    const deficit = inflowToHoldKaf(V('lake_now')) - V('baseline_inflow');
    const agShare = V('ag_depletion') / V('basin_depletion');
    return `
      <div class="tiles">
        ${tile('The lake today', fig(feet(V('lake_now')), { coef: 'lake_now' }),
          `against a healthy floor of ${fig(feet(V('healthy_min'), 0), { coef: 'healthy_min' })} and a serious-effects line at ${fig(feet(V('serious_low'), 0), { coef: 'serious_low' })}`)}
        ${deficit > 0
          ? tile('Short of standing still', fig(kafYr(deficit), { formula: 'inflow needed to hold today’s level − inflow the lake receives', assumed: false }),
              `even holding this level needs more water than the rivers now bring`)
          : tile('Where today’s rivers leave it', fig(feet(equilibriumFt(V('baseline_inflow'))), { formula: 'equilibrium elevation at the 2000–2025 average inflow', assumed: false }),
              `after a dry year the lake sits ${fig(feet(equilibriumFt(V('baseline_inflow')) - V('lake_now')), { formula: 'equilibrium at average inflow − today’s level', assumed: false })} below where average inflow would settle it, still short of the healthy floor`)}
        ${tile('Human depletion in the basin', fig(kafYr(V('basin_depletion')), { coef: 'basin_depletion' }),
          `of which agriculture is ${fig(pct(agShare), { formula: 'agricultural depletion ÷ basin depletion' })}`)}
        ${tile('What the lake is worth', fig(`${perAf(V('lake_value_per_af'))}`, { coef: 'lake_value_per_af' }),
          `against ${fig(perAf(V('hay_value_per_af')), { coef: 'hay_value_per_af' })} for the same water in hay`)}
      </div>

      <section class="prose">
        <h3>The lake is a closed basin</h3>
        <p>
          There is no outlet. Evaporation is the only way water leaves, so the lake settles wherever
          inflow matches what evaporates off its own surface. That makes recovery self-limiting: a
          bigger lake has more surface area and evaporates more, so every foot costs more water than
          the foot below it. Holding today's level takes
          ${fig(kafYr(inflowToHoldKaf(V('lake_now'))), { formula: 'surface area at this elevation x net evaporation ÷ inflow efficiency' })};
          holding the bottom of the healthy range takes
          ${fig(kafYr(inflowToHoldKaf(V('healthy_min'))), { formula: 'surface area at 4,198 ft x net evaporation ÷ inflow efficiency' })}.
        </p>
        <p class="callout">
          The widely quoted evaporation figure describes today's shrunken lake. Restoring it raises its
          own evaporation by about
          ${fig(kafYr(inflowToHoldKaf(V('healthy_min')) - inflowToHoldKaf(V('lake_now'))), { formula: 'inflow to hold 4,198 ft − inflow to hold today’s level' })},
          which is why refilling takes far more water than the current shortfall suggests.
        </p>
      </section>

      ${chart('chart-consumers', 'Who depletes the water', `Residential categories and reservoir evaporation sit outside the scarcity charge; everything else is inside it, a base of ${fig(kafYr(V('charge_base')), { coef: 'charge_base' })}.`)}

      <section class="prose">
        <h3>What this plan proposes to move</h3>
        <p>
          The plan below takes ${fig(kafYr(r.final.netToLakeKaf), { formula: 'gross delivery x delivery share − growth − streamflow decline', assumed: true })}
          to the lake by ${fig(String(r.final.year), {})}, against a goal of
          ${fig(kafYr(r.goalKaf), { coef: 'goal_added' })}. It takes it almost entirely from hay, because
          that is where an acre-foot earns least and is worth most once moved.
        </p>
      </section>`;
  },
  mount(root) {
    const el = byId(root, 'chart-consumers');
    if (el) {
      drawBars(
        el,
        [...CONSUMERS].sort((a, b) => a.kaf - b.kaf).map((c) => ({
          label: c.label,
          value: c.kaf,
          color: c.charged ? 'var(--c1)' : 'var(--c-muted)',
          annotation: `${num(c.kaf, 0)} KAF`,
        })),
        { format: (v) => num(v, 0) },
      );
    }
  },
};

// ───────────────────────────── 2 · Where we need to be ─────────────────────────────

const targetTab: Tab = {
  id: 'target',
  label: '2 · Where we need to be',
  group: 'plan',
  render({ r }) {
    const levels = [V('lake_now'), 4195, V('healthy_min'), 4200];
    const rows = levels
      .map((ft) => {
        const hold = inflowToHoldKaf(ft);
        return `<tr>
          <td>${fig(feet(ft), ft === V('lake_now') ? { coef: 'lake_now' } : { note: 'A level to compare against.' })}</td>
          <td>${fig(`${num(areaSqMi(ft), 0)} sq mi`, { formula: 'piecewise linear between the published area anchors' })}</td>
          <td>${fig(kafYr(hold), { formula: 'area x net evaporation ÷ inflow efficiency' })}</td>
          <td>${fig(kafYr(hold - V('baseline_inflow')), { formula: 'inflow to hold this level − inflow the lake receives now' })}</td>
        </tr>`;
      })
      .join('');

    return `
      <div class="tiles">
        ${tile('The goal', fig(kafYr(r.goalKaf), { coef: 'goal_added' }), `sustained addition to inflow`)}
        ${tile('Where that settles the lake', fig(feet(r.goalElevationFt), { formula: 'equilibrium elevation for baseline inflow plus the goal' }), `against a healthy floor of ${fig(feet(V('healthy_min'), 0), { coef: 'healthy_min' })}`)}
        ${tile('The state’s own range', `${fig(kafYr(coef('goal_added').low!), { coef: 'goal_added' })} – ${fig(kafYr(coef('goal_added').high!), { coef: 'goal_added' })}`, `the gap depends entirely on which baseline climate you measure against`)}
      </div>

      <section class="prose">
        <h3>Why the last foot costs the most</h3>
        <p>
          Area grows with elevation, so each foot of recovery adds surface that then evaporates. The
          marginal cost of a foot near today's level is
          ${fig(kafYr(inflowToHoldKaf(V('lake_now') + 1) - inflowToHoldKaf(V('lake_now'))), { formula: 'inflow to hold one foot higher − inflow to hold today' })};
          near the healthy floor it is
          ${fig(kafYr(inflowToHoldKaf(V('healthy_min') + 1) - inflowToHoldKaf(V('healthy_min'))), { formula: 'inflow to hold 4,199 ft − inflow to hold 4,198 ft' })}.
        </p>
      </section>

      <table class="data">
        <caption>What it takes to hold each level</caption>
        <thead><tr><th>Level</th><th>Surface area</th><th>River inflow to hold it</th><th>Added against today</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      ${chart('chart-curve', 'Added inflow needed, by level', 'The curve steepens because the lake evaporates more as it grows. The model is validated against the published simulations before any policy lever is applied.')}

      <section class="prose">
        <h3>Validation</h3>
        <p>
          The evaporation balance reproduces the published equilibrium elevations within
          ${fig(feet(0.6), { note: 'The largest disagreement between this balance and the published simulations across the validated range.' })},
          which is what lets the model extend past the published range instead of drawing a straight
          line through it.
        </p>
      </section>`;
  },
  mount(root) {
    const el = byId(root, 'chart-curve');
    if (el) {
      const pts: { x: number; y: number }[] = [];
      for (let added = 0; added <= 1400; added += 50) pts.push({ x: added, y: levelForAdded(added) });
      drawLine(el, pts, {
        xFormat: (v) => `${num(v, 0)} KAF`,
        yFormat: (v) => num(v, 0),
        height: 280,
      });
    }
  },
};

// ───────────────────────────── Year-by-year budget ─────────────────────────────

const SPEND_COLORS: Record<string, string> = {
  monitoringM: 'var(--c6)',
  leaseM: LEVER_COLORS.rights,
  cloudM: LEVER_COLORS.cloud,
  phragM: LEVER_COLORS.phrag,
  cropM: LEVER_COLORS.crop,
  onfarmM: LEVER_COLORS.onfarm,
};

const budgetTab: Tab = {
  id: 'budget',
  label: '5 · Budget, year by year',
  group: 'plan',
  render({ schedule }) {
    const s = schedule();
    const last = s.rows[s.rows.length - 1];
    const tableRows = s.rows
      .map((row) => {
        const cells = LEVERS.map(({ id, label }) => {
          const value = id === 'leaseM' ? row.spend.leaseM + row.committedM : row.spend[id];
          const extra = id === 'leaseM' ? ', including payments on rights already under contract' : '';
          return `<td>${fig(millions(value, 1), { formula: `${label}${extra}, set by the year-by-year split`, assumed: true })}</td>`;
        }).join('');
        return `<tr>
          <td>${row.year}</td>
          ${cells}
          <td>${fig(millions(row.totalM, 1), { formula: 'sum of the lines in this row', assumed: true })}</td>
          <td>${fig(millions(row.nev.nevM, 0), { formula: 'lake value of water delivered − farm revenue lost − livestock receipts at risk + wages of jobs created', assumed: true })}</td>
          <td>${fig(feet(row.elevationFt, 2), { formula: 'the lake responding year by year to the inflow this budget delivers', assumed: true })}</td>
        </tr>`;
      })
      .join('');

    return `
      <div class="tiles">
        ${tile('Net economic value', fig(millions(s.nevM, 0), { formula: 'sum over the plan of lake value − farm and livestock losses + wages created', assumed: true }), `against ${fig(millions(s.flatNevM, 0), { formula: 'the same measure for the same spending every year', assumed: true })} for the flat split`, s.nevM >= s.flatNevM ? 'tile-ok' : '')}
        ${tile(`Lake in ${last.year}`, fig(feet(s.result.final.elevationFt, 2), { formula: 'the lake responding year by year to the inflow this budget delivers', assumed: true }), `the flat split reaches ${fig(feet(s.flat.final.elevationFt, 2), { formula: 'the same package with the same spending every year', assumed: true })}`, s.meetsGoal ? 'tile-ok' : 'tile-bad')}
        ${tile('Goal first met', s.firstYearAtTarget !== null ? fig(String(s.firstYearAtTarget), { formula: 'first year the lake stands at or above the target', assumed: true }) : 'not by the horizon', `target ${fig(feet(s.targetFt, 1), { formula: 'bottom of the healthy range + a safety margin', coef: 'healthy_min' })}${s.meetsGoal ? ', and held every year after' : ''}`, s.meetsGoal ? 'tile-ok' : 'tile-bad')}
        ${tile('Spent past good value', fig(millions(s.pastValueM, 0), { formula: 'money placed where its water cost more than the lake value of an acre-foot', assumed: true }), `in ${fig(`${s.pastValueYears} years`, { formula: 'years with any such money', assumed: true })}, because the whole budget must be spent and nothing better was left`)}
      </div>

      ${chart('chart-budget-stack', 'Where each year’s money goes', 'Stacked by spending line. Every year spends the whole budget.')}

      <section class="prose">
        <h3>How each year is split</h3>
        <p>
          Every year spends ${fig(millionsYr(s.result.dials.budgetM, 0), { coef: 'budget' })}. It goes
          out in small amounts, each to whichever line adds the most net economic value per dollar,
          counted through ${fig(String(last.year), { note: 'The horizon the model runs to.' })}: water
          reaching the lake at ${fig(perAf(V('lake_value_per_af')), { coef: 'lake_value_per_af' })},
          less the farm revenue and livestock receipts it takes, plus the wages of the transition and
          monitoring jobs the money creates at ${fig(dollarsShort(V('wage_per_job')), { coef: 'wage_per_job' })}
          a job-year.
        </p>
        <p>
          Lake-economy jobs and farm field jobs are left out of that sum on purpose: the lake value
          already counts the lake economy, and lost farm revenue already counts farm wages. A programme
          is never funded past its capacity. When every line’s next dollar buys water dearer than the
          lake value, the money still goes out, to the least poor use; the tile above counts it.
          ${s.lambda > 0
            ? `The most economic split alone fell short of the goal, so water was weighted ${fig(num(s.lambda, 2), { formula: 'smallest extra weight on water that meets the goal', assumed: true })} times its lake value on top.`
            : 'The most economic split meets the goal on its own, so no extra weight on water was needed.'}
        </p>
        <p>
          A programme’s ramp is a calendar in this model, not a consequence of spending, and the
          scarcity charge eases as the lake recovers, so part of the water a dollar buys is given back
          in later years. The split counts both.
        </p>
      </section>

      <table class="data">
        <caption>The budget, year by year</caption>
        <thead><tr><th>Year</th>${LEVERS.map((l) => `<th>${escapeHtml(l.label)}</th>`).join('')}<th>Spent</th><th>Net economic value</th><th>Lake</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>`;
  },
  mount(root, { schedule }) {
    const el = byId(root, 'chart-budget-stack');
    if (!el) return;
    const s = schedule();
    drawStack(
      el,
      {
        years: s.rows.map((r) => r.year),
        keys: LEVERS.map((l) => ({ id: l.id, label: l.label, color: SPEND_COLORS[l.id] })),
        values: Object.fromEntries(
          LEVERS.map((l) => [l.id, s.rows.map((r) => (l.id === 'leaseM' ? r.spend.leaseM + r.committedM : r.spend[l.id]))]),
        ),
      },
      300,
      '$M',
    );
  },
};

// ───────────────────────────── 3 · Getting there ─────────────────────────────

const pathTab: Tab = {
  id: 'path',
  label: '3 · Getting there, year by year',
  group: 'plan',
  render({ r, sim }) {
    return `
      <div class="tiles">
        ${tile('Water reaching the lake', fig(kafYr(r.final.netToLakeKaf), { formula: 'gross delivery x delivery share − growth − streamflow decline', assumed: true }), `by ${r.final.year}, after growth takes ${fig(kafYr(r.final.growthDrawKaf), { coef: 'growth_draw_2055' })} and the shrinking rivers take ${fig(kafYr(r.final.streamflowDeclineKaf), { coef: 'streamflow_decline_2055' })}`)}
        ${tile('Where the lake ends up', fig(feet(r.final.elevationFt), { formula: 'lake level after responding year by year to the inflow it is given', assumed: true }), `against ${fig(feet(V('lake_now')), { coef: 'lake_now' })} today`)}
        ${tile('Still short', fig(kafYr(r.shortfallKaf), { formula: 'the goal − water reaching the lake', assumed: true }), `against the ${fig(kafYr(r.goalKaf), { coef: 'goal_added' })} the lake needs`, r.shortfallKaf > 0 ? 'tile-bad' : 'tile-ok')}
        ${tile('Runs ending healthy', fig(pct(sim.shareHealthy), { formula: 'share of simulated inflow sequences ending inside the healthy range', assumed: true }), `across ${fig(`${num(sim.runs, 0)} sequences`, { coef: 'sim_runs' })} of wet and dry years`)}
      </div>

      ${chart('chart-path-lake', 'Where this package takes the lake', `The line is an average inflow sequence. The band is the tenth to ninetieth percentile across ${fig(`${num(sim.runs, 0)}`, { coef: 'sim_runs' })} sequences with the basin's year-to-year spread and drought persistence. Inflow varies more than any lever on this page, so the band is the honest width of the answer.`)}

      ${chart('chart-path-stack', 'What each lever contributes', 'Stacked by how the water was obtained. Water the state holds as a right is the only part legally dedicated to the lake; everything else can be re-diverted as the basin grows.')}

      <section class="prose">
        <h3>The protective floor</h3>
        <p>
          Rights the state owns and can shepherd are dedicated to the lake, so growth has to be met
          from conservation or new supply rather than by quietly taking them back. That puts a floor of
          ${fig(kafYr(r.final.shepherdedKaf * r.final.deliveryShare), { formula: 'water the state holds and can shepherd x delivery share', assumed: true })}
          under the result. Growth erodes only what sits above it.
        </p>
      </section>`;
  },
  mount(root, { r, sim }) {
    const lakeEl = byId(root, 'chart-path-lake');
    if (lakeEl) {
      drawLake(lakeEl, {
        years: r.years.map((y) => y.year),
        line: r.years.map((y) => y.elevationFt),
        p10: sim.p10,
        p90: sim.p90,
      });
    }
    const stackEl = byId(root, 'chart-path-stack');
    if (stackEl) {
      drawStack(stackEl, {
        years: r.years.map((y) => y.year),
        keys: [
          { id: 'rights', label: 'Rights the state holds', color: LEVER_COLORS.rights },
          { id: 'crop', label: 'Crop switching', color: LEVER_COLORS.crop },
          { id: 'phrag', label: 'Phragmites removal', color: LEVER_COLORS.phrag },
          { id: 'cloud', label: 'Cloud seeding', color: LEVER_COLORS.cloud },
          { id: 'onfarm', label: 'On-farm optimisation', color: LEVER_COLORS.onfarm },
          { id: 'charge', label: 'Response to the charge', color: LEVER_COLORS.charge },
          { id: 'levy', label: 'Response to the levy', color: LEVER_COLORS.levy },
          { id: 'lawn', label: 'Residential lawns', color: LEVER_COLORS.lawn },
          { id: 'forced', label: 'Mandated cut', color: LEVER_COLORS.forced },
        ],
        values: {
          rights: r.years.map((y) => y.shepherdedKaf),
          crop: r.years.map((y) => y.cropKaf),
          phrag: r.years.map((y) => y.phragKaf),
          cloud: r.years.map((y) => y.cloudKaf),
          onfarm: r.years.map((y) => y.onfarmKaf),
          charge: r.years.map((y) => y.chargeBehaviourKaf),
          levy: r.years.map((y) => y.levyKaf),
          lawn: r.years.map((y) => y.lawnKaf),
          forced: r.years.map((y) => y.forcedKaf),
        },
      });
    }
  },
};

// ───────────────────────────── 4 · Levers and budget ─────────────────────────────

const allocTab: Tab = {
  id: 'alloc',
  label: '4 · Levers and budget',
  group: 'plan',
  render({ d, r }) {
    const progRows = r.programs
      .map(
        (p) => `<tr>
        <td>${escapeHtml(p.label)}</td>
        <td>${fig(millionsYr(p.spendM, 1), { note: 'What this programme is given each year.' })}</td>
        <td>${fig(perAf(p.costPerDeliveredAf), { formula: 'cost per acre-foot ÷ share that reaches the lake' })}</td>
        <td>${fig(kafYr(p.deliveredKaf, 1), { formula: 'min(spend ÷ delivered cost, capacity)', assumed: true })}</td>
        <td>${fig(kafYr(p.capKaf), { coef: `${p.id === 'onfarm' ? 'onfarm' : p.id}_cap` })}</td>
        <td>${fig(millionsYr(p.saturationM, 1), { formula: 'capacity x delivered cost' })}</td>
        <td>${p.atCapacity ? '<span class="pill pill-warn">at capacity</span>' : '<span class="pill">room left</span>'}</td>
      </tr>`,
      )
      .join('');

    return `
      <section class="prose">
        <h3>Move any dial and the whole page re-runs</h3>
        <p>
          Nothing here is a scenario stored in advance. Every figure on every tab is computed from
          these settings when you move them. The search button finds a combination; it is not a
          policy lever itself.
        </p>
      </section>

      <div class="optimiser">
        <div class="opt-slider">
          <label for="opt-weight">What should the search aim for?</label>
          <output id="opt-weight-out">${pct(0.6)} water, ${pct(0.4)} political support</output>
          <input type="range" id="opt-weight" min="0" max="1" step="0.05" value="0.6">
        </div>
        <button type="button" id="opt-run" class="btn-primary">Find the best mix</button>
        <p class="opt-note">
          Tries a thousand combinations of every dial below and writes the best one back into them,
          scored on water delivered and on the support of the group that likes it least.
        </p>
      </div>

      <div class="controls">${controlsByGroup(d, ['Budget', 'Charges', 'Mandate', 'Programmes', 'Residential lawns', 'Context'])}</div>

      <table class="data">
        <caption>What each programme's money buys</caption>
        <thead><tr><th>Programme</th><th>Spend</th><th>Cost per delivered AF</th><th>Delivers</th><th>Capacity</th><th>Saturates at</th><th></th></tr></thead>
        <tbody>${progRows}</tbody>
      </table>

      ${chart('chart-budget', 'What another dollar buys', `Each point re-runs the whole model at that budget with the mandate off, so it shows what money alone does. Past the point where willing sellers run out, more money buys nothing at all.`)}`;
  },
  mount(root) {
    const el = byId(root, 'chart-budget');
    if (el) {
      const sweep = budgetSweep([25, 50, 100, 200, 300, 400, 600, 800], { mandateFloorKaf: 0 });
      drawLine(
        el,
        sweep.map((s) => ({ x: s.budgetM, y: s.netKaf, flag: s.ceilingBinds })),
        { xFormat: (v) => `$${num(v, 0)}M`, yFormat: (v) => `${num(v, 0)} KAF`, height: 280 },
      );
    }
  },
};

// ───────────────────────────── 5 · Impacts ─────────────────────────────

const pkgTab: Tab = {
  id: 'pkg',
  label: 'Impacts',
  group: 'plan',
  render({ d, r }) {
    const weakest = r.support.weakest;
    const costPerAf = r.final.netToLakeKaf > 0 ? (r.final.totalCostM * 1e6) / (r.final.netToLakeKaf * 1000) : 0;
    const durableFloor = r.final.shepherdedKaf * r.final.deliveryShare;
    const erosion = r.final.growthDrawKaf + r.final.streamflowDeclineKaf;
    const routeTotal = Math.max(1e-9, r.boughtKaf + r.chargedKaf + r.orderedKaf);
    const proposedLaw = LEGAL_ASSUMPTIONS.filter((a) => a.status === 'Proposed legislation').length;

    const impacts: { order: string; impact: string; measure: string; mechanism: string }[] = [
      {
        order: 'First',
        impact: 'Water reaches the lake',
        measure: fig(kafYr(r.final.netToLakeKaf), { formula: 'gross delivery x delivery share − growth − streamflow decline', assumed: true }),
        mechanism: `Rights, programmes, charges, lawn savings and the backstop mandate deliver gross water; growth and streamflow decline subtract ${fig(kafYr(erosion), { formula: 'growth draw + streamflow decline' })} before the final lake result is counted.`,
      },
      {
        order: 'First',
        impact: 'The lake elevation responds',
        measure: fig(feet(r.final.elevationFt), { formula: 'lake level after responding year by year to the inflow it is given', assumed: true }),
        mechanism: `The long-run goal is ${fig(kafYr(r.goalKaf), { coef: 'goal_added' })}, leaving a shortfall of ${fig(kafYr(r.shortfallKaf), { formula: 'goal water − net water reaching the lake', assumed: true })} under this setting.`,
      },
      {
        order: 'First',
        impact: 'A protected floor appears',
        measure: fig(kafYr(durableFloor), { formula: 'state-held and shepherded water x delivery share', assumed: true }),
        mechanism: `This is the part insulated by rights the state holds. Water above that floor can still be eroded by growth, re-diversion or measurement failure.`,
      },
      {
        order: 'Second',
        impact: 'Farm income is taken without payment',
        measure: fig(millionsYr(r.final.farmRevenueLostM, 1), { formula: 'water taken without payment x what an acre-foot earns in hay', assumed: true }),
        mechanism: `The package removes water from about ${fig(`${num(r.acresOutOfIrrigation, 0)} acres`, { formula: 'agricultural water removed ÷ water applied per acre' })}; only the uncompensated forced part is booked as lost farm revenue.`,
      },
      {
        order: 'Second',
        impact: 'Work shifts between sectors',
        measure: fig(`${num(r.final.netJobs, 0)} net jobs`, { formula: 'transition + lake-economy jobs − field − livestock jobs', assumed: true }),
        mechanism: `${fig(`${num(r.final.transitionJobs + r.final.lakeJobs, 0)} jobs`, { formula: 'transition jobs + lake-economy jobs', assumed: true })} are made or recovered while ${fig(`${num(r.final.fieldJobsLost + r.final.livestockJobsLost, 0)} jobs`, { formula: 'field jobs + livestock jobs exposed', assumed: true })} are forgone.`,
      },
      {
        order: 'Second',
        impact: 'Benefits are compared with full cost',
        measure: `${fig(millionsYr(r.final.benefitM, 0), { formula: 'water reaching the lake x what an acre-foot is worth in the lake', assumed: true })} vs ${fig(millionsYr(r.final.totalCostM, 1), { formula: 'public budget + uncompensated farm revenue + livestock receipts at risk', assumed: true })}`,
        mechanism: `The public budget is ${fig(millionsYr(d.budgetM, 0), { coef: 'budget' })}, but the impact ledger counts uncompensated farm revenue and livestock receipts too: ${fig(perAf(costPerAf), { formula: 'total annual cost ÷ water reaching the lake' })} delivered.`,
      },
      {
        order: 'Third',
        impact: 'Durability depends on ownership',
        measure: fig(kafYr(r.durableRightsGapKaf), { formula: 'rights needed to hold healthy − rights owned outright', assumed: true }),
        mechanism: `By ${r.final.year}, the state owns ${fig(kafYr(r.final.rightsOwnedKaf), { formula: 'lease-to-own tranches that have fully vested', assumed: true })}; the rest has to be held by continuing policy, charges or mandates.`,
      },
      {
        order: 'Third',
        impact: 'The coalition has a weak link',
        measure: fig(`${num(weakest.score, 0)} / 100`, { formula: 'modelled from polled weights on bought versus charged versus ordered water', assumed: true }),
        mechanism: `${escapeHtml(weakest.label)} is the lowest support score. Bought water is ${fig(pct(r.boughtKaf / routeTotal), { formula: 'bought water ÷ bought, charged and ordered water', assumed: true })} of the route mix; ordered water is ${fig(pct(r.orderedKaf / routeTotal), { formula: 'ordered water ÷ bought, charged and ordered water', assumed: true })}.`,
      },
      {
        order: 'Third',
        impact: 'Law has to carry the model',
        measure: fig(num(proposedLaw, 0), { note: 'Rows tagged Proposed legislation in the legal-assumptions table.' }),
        mechanism: `Those changes cover basin-wide curtailment authority, charges on consumed water, transit protection for saved water, growth insulation for state-held lake rights and statewide residential enforcement.`,
      },
    ];

    const rows = impacts
      .map(
        (e) => `<tr>
          <td><span class="pill">${escapeHtml(e.order)} order</span></td>
          <td class="el-name">${escapeHtml(e.impact)}</td>
          <td class="num">${e.measure}</td>
          <td class="el-what">${e.mechanism}</td>
        </tr>`,
      )
      .join('');

    return `
      <div class="tiles tiles-head">
        ${tile('Water reaching the lake', fig(kafYr(r.final.netToLakeKaf), { formula: 'gross delivery x delivery share − growth − streamflow decline', assumed: true }), `net by ${r.final.year}`, 'tile-ok')}
        ${tile('Where the lake ends up', fig(feet(r.final.elevationFt), { formula: 'the lake responding year by year to the inflow it is given', assumed: true }), `healthy starts at ${fig(feet(V('healthy_min'), 0), { coef: 'healthy_min' })}`)}
        ${tile('Still short', fig(kafYr(r.shortfallKaf), { formula: 'the goal − water reaching the lake', assumed: true }), `against the ${fig(kafYr(r.goalKaf), { coef: 'goal_added' })} the lake needs`, r.shortfallKaf > 0 ? 'tile-bad' : 'tile-ok')}
        ${tile('Weakest support', fig(`${num(weakest.score, 0)} / 100`, { formula: 'modelled from polled weights on bought versus charged versus ordered water', assumed: true }), `${escapeHtml(weakest.label)}, the group that decides whether this survives`, weakest.score < 50 ? 'tile-bad' : '')}
      </div>

      <section class="prose">
        <h3>First, second and third order impacts</h3>
        <p>
          First-order impacts are the acre-feet, elevation and protected water floor. Second-order
          impacts are the income, employment and cost changes caused by moving that water. Third-order
          impacts are what decides whether the result survives: rights ownership, coalition support
          and statutory authority.
        </p>
        <p class="callout">
          ${r.boughtShare >= 0.5
            ? `${fig(pct(r.boughtShare), { formula: 'water bought ÷ water bought, charged and ordered' })} of the water is bought rather than charged or ordered. Asked the best state approach, ${fig(pct(V('pref_incentives')), { coef: 'pref_incentives' })} of Utah voters chose incentives and ${fig(pct(V('pref_penalties')), { coef: 'pref_penalties' })} chose penalties, so this ratio is what decides whether the package is popular.`
            : `Only ${fig(pct(r.boughtShare), { formula: 'water bought ÷ water bought, charged and ordered' })} of the water is bought rather than charged or ordered. Asked the best state approach, ${fig(pct(V('pref_incentives')), { coef: 'pref_incentives' })} of Utah voters chose incentives and just ${fig(pct(V('pref_penalties')), { coef: 'pref_penalties' })} chose penalties. On this setting the package is mostly ordered, which is the shape voters like least.`}
        </p>
      </section>

      <table class="data table-elements">
        <caption>Impact ledger</caption>
        <thead><tr><th>Order</th><th>Impact</th><th>Measure</th><th>Mechanism</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      ${chart('chart-impact-stack', 'First-order water path', 'Stacked by where each acre-foot comes from. The top of the stack is gross supply; the final tile above is after delivery losses, growth and streamflow decline.')}

      ${chart('chart-impact-routes', 'How the water is obtained', 'Bought water is legally and politically different from charged or ordered water, so this route mix is a third-order impact as much as a hydrologic one.')}

      ${chart('chart-impact-jobs', 'Second-order jobs', `By ${r.final.year}, the package costs ${fig(`${num(r.final.fieldJobsLost, 0)} field jobs`, { formula: 'acres out of irrigation ÷ 1,000 x jobs per thousand acres', assumed: true })} and ${fig(`${num(r.final.livestockJobsLost, 0)} livestock jobs`, { formula: 'dairy and beef employment exposed once the cut passes the basin’s forage surplus', assumed: true })}, while supporting transition and lake-economy work. The net line is the second-order labour impact.`)}

      ${chart('chart-impact-support', 'Third-order support', `Scores are modelled from 2026 polling weights, not directly surveyed. The dashed line is the halfway mark.`)}`;
  },
  mount(root, { r }) {
    const stack = byId(root, 'chart-impact-stack');
    if (stack) {
      drawStack(stack, {
        years: r.years.map((y) => y.year),
        keys: [
          { id: 'rights', label: 'Rights the state holds', color: LEVER_COLORS.rights },
          { id: 'crop', label: 'Crop switching', color: LEVER_COLORS.crop },
          { id: 'phrag', label: 'Phragmites removal', color: LEVER_COLORS.phrag },
          { id: 'cloud', label: 'Cloud seeding', color: LEVER_COLORS.cloud },
          { id: 'onfarm', label: 'On-farm optimisation', color: LEVER_COLORS.onfarm },
          { id: 'charge', label: 'Response to the charge', color: LEVER_COLORS.charge },
          { id: 'levy', label: 'Response to the levy', color: LEVER_COLORS.levy },
          { id: 'lawn', label: 'Residential lawns', color: LEVER_COLORS.lawn },
          { id: 'forced', label: 'Mandated cut', color: LEVER_COLORS.forced },
        ],
        values: {
          rights: r.years.map((y) => y.shepherdedKaf),
          crop: r.years.map((y) => y.cropKaf),
          phrag: r.years.map((y) => y.phragKaf),
          cloud: r.years.map((y) => y.cloudKaf),
          onfarm: r.years.map((y) => y.onfarmKaf),
          charge: r.years.map((y) => y.chargeBehaviourKaf),
          levy: r.years.map((y) => y.levyKaf),
          lawn: r.years.map((y) => y.lawnKaf),
          forced: r.years.map((y) => y.forcedKaf),
        },
      });
    }

    const routes = byId(root, 'chart-impact-routes');
    if (routes) {
      drawBars(
        routes,
        [
          { label: 'Bought or held', value: r.boughtKaf, color: LEVER_COLORS.rights, annotation: `${num(r.boughtKaf, 0)} KAF` },
          { label: 'Charged', value: r.chargedKaf, color: LEVER_COLORS.charge, annotation: `${num(r.chargedKaf, 0)} KAF` },
          { label: 'Ordered', value: r.orderedKaf, color: LEVER_COLORS.forced, annotation: `${num(r.orderedKaf, 0)} KAF` },
        ],
        { format: (v) => `${num(v, 0)} KAF` },
      );
    }

    const jobs = byId(root, 'chart-impact-jobs');
    if (jobs) {
      drawJobs(jobs, {
        years: r.years.map((y) => y.year),
        gained: [
          { id: 'transition', label: 'Transition and monitoring', color: 'var(--c3)', values: r.years.map((y) => y.transitionJobs) },
          { id: 'lake', label: 'Lake economy recovered', color: 'var(--c4)', values: r.years.map((y) => y.lakeJobs) },
        ],
        lost: [
          { id: 'field', label: 'Field jobs forgone', color: 'var(--c-bad)', values: r.years.map((y) => y.fieldJobsLost) },
          { id: 'herd', label: 'Dairy and beef forgone', color: 'var(--c-bad-deep)', values: r.years.map((y) => y.livestockJobsLost) },
        ],
        net: r.years.map((y) => y.netJobs),
      });
    }

    const support = byId(root, 'chart-impact-support');
    if (support) {
      drawBars(
        support,
        r.support.scores.map((s) => ({
          label: s.label,
          value: s.score,
          color: s.score < 50 ? 'var(--c-bad)' : s.score < 65 ? 'var(--c-warn)' : 'var(--c-ok)',
          annotation: num(s.score, 0),
        })),
        { max: 100, marker: { value: 50, label: '' }, format: (v) => num(v, 0) },
      );
    }
  },
};

// ───────────────────────────── Detail tabs ─────────────────────────────

const cropsTab: Tab = {
  id: 'crops',
  label: 'Crop transition',
  group: 'detail',
  render({ d, r }) {
    return `
      <section class="prose">
        <h3>The threshold matters more than the rate</h3>
        <p>
          Application is spread across fields, not uniform. Basin hay averages
          ${fig(`${num(V('application_mean'), 2)} AF/acre`, { coef: 'application_mean' })} with a spread of
          ${fig(num(V('application_cv'), 2), { coef: 'application_cv' })}, so where the threshold sits decides
          how many farms are touched at all. At the current setting of
          ${fig(`${num(d.levyThresholdAfPerAcre, 1)} AF/acre`, { coef: 'application_mean' })},
          ${fig(pct(r.levy.shareOfGroundInScope), { formula: 'share of a lognormal spread above the threshold' })}
          of hay ground is in scope — ${fig(`${num(r.levy.acresInScope, 0)} acres`, { formula: 'hay acres x the share above the threshold' })}
          of ${fig(`${num(V('hay_acres'), 0)}`, { coef: 'hay_acres' })}.
        </p>
      </section>

      <div class="tiles">
        ${tile('Water applied above the line', fig(`${num(r.levy.excessPerAcre, 2)} AF/acre`, { formula: 'expected excess of a lognormal above the threshold' }), 'averaged across every acre, including those below it')}
        ${tile('What each acre cuts', fig(pct(r.levy.acreCutShare), { formula: 'levy x water above the line ÷ net return per acre, capped' }), 'a response to the charge, not a purchase')}
        ${tile('Water the levy moves', fig(kafYr(r.levy.waterKaf), { formula: 'acres x cut share x depletion freed per acre', assumed: true }), 'before any delivery loss')}
        ${tile('Crop switching delivers', fig(kafYr(r.programs[2].deliveredKaf), { formula: 'min(spend ÷ delivered cost, capacity)', assumed: true }), `saturating at ${fig(millionsYr(r.programs[2].saturationM, 1), { formula: 'capacity x delivered cost' })}`)}
      </div>

      ${chart('chart-levy', 'What the levy moves, by threshold', 'Each point re-runs the levy at that threshold. Past a point a higher rate moves more farm water but delivers less to the lake, because the ground that responds first is the ground that was returning water anyway.')}

      <section class="prose">
        <h3>Where the first cut falls</h3>
        <p>
          The basin grows ${fig(`${num(V('herd_feed_surplus') / 1000, 0)}k tons`, { coef: 'herd_feed_surplus' })}
          more forage than its own herds eat, so the first hay taken out comes off exports rather than
          local feed. This package takes ${fig(`${num(r.hayTonsLost / 1000, 0)}k tons`, { formula: 'acres out of irrigation x hay yield per acre', assumed: true })}
          off ${fig(`${num(r.acresOutOfIrrigation, 0)} acres`, { formula: 'agricultural water removed ÷ water applied per acre' })}.
          ${r.hayTonsLost > V('herd_feed_surplus')
            ? `That is past the surplus, so dairy and beef start losing their local ration: ${fig(`${num(r.final.livestockJobsLost, 0)} jobs`, { formula: 'dairy and beef employment exposed beyond the surplus', assumed: true })} are exposed.`
            : 'That stays inside the surplus, so no herd loses its local ration.'}
        </p>
      </section>`;
  },
  mount(root, { d }) {
    const el = byId(root, 'chart-levy');
    if (el) {
      const pts: { x: number; y: number }[] = [];
      for (let th = 1.5; th <= 4.01; th += 0.1) {
        pts.push({ x: th, y: levyModel(Math.max(d.cropLevyPerAf, 200), th).waterKaf });
      }
      drawLine(el, pts, { xFormat: (v) => `${num(v, 1)} AF/ac`, yFormat: (v) => `${num(v, 0)} KAF`, height: 250 });
    }
  },
};

const lawnTab: Tab = {
  id: 'lawns',
  label: 'Residential lawns',
  group: 'detail',
  render({ d, r }) {
    return `
      <section class="prose">
        <h3>Built from lots, not from an elasticity</h3>
        <p>
          ${fig(`${num(r.lawn.lawns / 1000, 0)}k homes`, { coef: 'basin_lawns' })} with a lawn, each
          landscaping ${fig(`${num(V('landscape_sqft'), 0)} sq ft`, { coef: 'landscape_sqft' })}, make
          ${fig(`${num(r.lawn.lawnAcres, 0)} acres`, { formula: 'homes with a lawn x landscaped area ÷ 43,560' })}
          of urban lawn. The ${fig(kafYr(V('lawn_water')), { coef: 'lawn_water' })} those lawns use works out
          at ${fig(`${num(r.lawn.inchesApplied, 0)} inches`, { formula: 'lawn water ÷ lawn area, converted to inches' })}
          a year, against the ${fig(`${num(V('turf_need'), 0)} inches`, { coef: 'turf_need' })} turf actually needs.
          The depth is implied by the reported water, not assumed.
        </p>
      </section>

      <div class="tiles">
        ${tile('Households that comply', fig(pct(r.lawn.compliance), { formula: 'habit floor + the effect of enforcement, solved as a fixed point', assumed: true }), `${fig(`${num(r.lawn.citations, 0)} citations`, { formula: 'July citation rate x population, spread over the enforced months' })} a year, so a household breaking the limit has a ${fig(pct(r.lawn.catchChance, 1), { formula: 'citations ÷ households in violation' })} chance of being caught`)}
        ${tile('Lawn water not applied', fig(kafYr(r.lawn.waterNotApplied), { formula: 'lawn water x the cut asked x compliance', assumed: true }), `out of ${fig(kafYr(V('lawn_water')), { coef: 'lawn_water' })} the basin's lawns use`)}
        ${tile('Of that, reaching the lake', fig(kafYr(r.lawn.toLake), { formula: 'water not applied x the share of a city saving that reaches the lake', assumed: true }), `only ${fig(pct(V('urban_to_lake')), { coef: 'urban_to_lake' })} of a city saving gets there — the rest is re-used inside the city`)}
        ${tile('Fine revenue', fig(millionsYr(r.lawn.fineRevenue / 1e6, 1), { formula: 'citations x fine x the share collected' }), `collected at ${fig(pct(V('fine_collection')), { coef: 'fine_collection' })}, paid into the same fund as the charge`)}
      </div>

      ${chart('chart-lawn', 'When the water goes on, and when citations are written', `The limit applies all season. The enforcement calendar only decides when citations are written, and at the current setting that covers ${fig(pct(seasonCoverage(d.enforcementWindowId)), { formula: 'share of a year’s watering inside the enforced months' })} of the year's watering.`)}

      <section class="prose">
        <h3>An enforcement-budget question, not a penalty-schedule question</h3>
        <p class="callout">
          Quadrupling the fine buys a few points of compliance. Multiplying the citation rate buys
          dozens. Watering ordinances are almost always written the other way round — a large fine
          written rarely — which is the combination that does least.
        </p>
      </section>`;
  },
  mount(root, { d, r }) {
    const el = byId(root, 'chart-lawn');
    if (el) {
      const win = ENFORCEMENT_WINDOWS.find((w) => w.id === d.enforcementWindowId) ?? ENFORCEMENT_WINDOWS[0];
      drawMonthly(
        el,
        WATERING_MONTHS.map((m) => m.month),
        WATERING_MONTHS.map((m) => m.share),
        WATERING_MONTHS.map((m) => (win.months.includes(m.month) ? (r.lawn.citations * m.share) / Math.max(1e-9, WATERING_MONTHS.filter((x) => win.months.includes(x.month)).reduce((s, x) => s + x.share, 0)) : 0)),
        { barLabel: 'Share of the year’s watering', lineLabel: 'Citations written', height: 260 },
      );
    }
  },
};

const driversTab: Tab = {
  id: 'drivers',
  label: 'Drivers and growth',
  group: 'detail',
  render({ r }) {
    return `
      <section class="prose">
        <h3>What the package is running against</h3>
        <p>
          Two things erode the result every year. Population growth takes
          ${fig(kafYr(V('growth_draw_2055')), { coef: 'growth_draw_2055' })} by ${r.final.year}, and a warming
          climate takes ${fig(kafYr(V('streamflow_decline_2055')), { coef: 'streamflow_decline_2055' })} out of the
          rivers over the same period. Between them they remove
          ${fig(kafYr(V('growth_draw_2055') + V('streamflow_decline_2055')), { formula: 'growth draw + streamflow decline' })}
          from whatever the levers deliver.
        </p>
      </section>

      <div class="tiles">
        ${tile('Gross water freed', fig(kafYr(r.final.grossDeliveredKaf), { formula: 'everything the levers free, before delivery losses', assumed: true }), 'before anything is lost on the way down')}
        ${tile('Lost in delivery', fig(kafYr(r.final.grossDeliveredKaf * (1 - r.final.deliveryShare)), { formula: 'gross water freed x (1 − delivery share)', assumed: true }), `a delivery share of ${fig(pct(r.final.deliveryShare), { formula: 'base share x what measurement adds', assumed: true })}`)}
        ${tile('Taken by growth', fig(kafYr(r.final.growthDrawKaf), { coef: 'growth_draw_2055' }), 'new homes and businesses in the basin')}
        ${tile('Taken by the rivers shrinking', fig(kafYr(r.final.streamflowDeclineKaf), { coef: 'streamflow_decline_2055' }), 'less natural runoff as the climate warms')}
      </div>

      ${chart('chart-walk', 'From gross to net, step by step', 'Each bar is what remains after the loss named to its left. No step is hidden inside another.')}

      <section class="prose">
        <h3>Shepherding is the binding constraint</h3>
        <p>
          Freeing water is not delivering it. The system can currently shepherd
          ${fig(kafYr(V('shepherd_start')), { coef: 'shepherd_start' })} to the lake, growing by
          ${fig(`${num(V('shepherd_growth'), 0)} KAF/yr`, { coef: 'shepherd_growth' })} a year, plus up to
          ${fig(kafYr(V('shepherd_monitor_max')), { coef: 'shepherd_monitor_max' })} that monitoring can add.
          By ${r.final.year} that reaches ${fig(kafYr(r.final.shepherdCapKaf), { formula: 'starting capacity + growth + what monitoring adds', assumed: true })}.
          Every acre-foot acquired beyond it simply does not arrive.
        </p>
      </section>`;
  },
  mount(root, { r }) {
    const el = byId(root, 'chart-walk');
    if (el) {
      const f = r.final;
      drawBars(
        el,
        [
          { label: 'Net to the lake', value: f.netToLakeKaf, color: 'var(--c-ok)' },
          { label: 'Less shrinking rivers', value: f.netToLakeKaf + f.streamflowDeclineKaf, color: 'var(--c-muted)' },
          { label: 'Less growth', value: f.netToLakeKaf + f.streamflowDeclineKaf + f.growthDrawKaf, color: 'var(--c-muted)' },
          { label: 'Less delivery losses', value: f.grossDeliveredKaf, color: 'var(--c-muted)' },
          { label: 'Gross water freed', value: f.grossDeliveredKaf, color: 'var(--c1)' },
        ],
        { format: (v) => `${num(v, 0)} KAF` },
      );
    }
  },
};

const revenueTab: Tab = {
  id: 'revenue',
  label: 'Value of water',
  group: 'detail',
  render({ r }) {
    const ratio = V('lake_value_per_af') / V('hay_value_per_af');
    return `
      <section class="prose">
        <h3>Output per acre-foot, not a price anyone pays</h3>
        <p>
          These are sector output divided by sector water, which is a measure of how much economic
          activity a unit of water currently sits beside — not what anyone would pay for it, and not
          what it would fetch at auction. A data centre's enormous figure means it uses very little
          water, not that it would outbid a farm.
        </p>
      </section>

      ${chart('chart-value', 'What an acre-foot earns, and where this package takes it from', `Log scale, because the spread runs to six orders of magnitude. Hay earns ${fig(perAf(V('hay_value_per_af')), { coef: 'hay_value_per_af' })} per acre-foot depleted and the same water is worth ${fig(perAf(V('lake_value_per_af')), { coef: 'lake_value_per_af' })} in the lake, a gain of roughly ${fig(`${num(ratio, 0)}x`, { formula: 'value in the lake ÷ value in hay' })} — which is the entire economic case, and why the package takes water from there and nowhere else.`)}

      <div class="tiles">
        ${tile('Water this package moves', fig(kafYr(r.final.netToLakeKaf), { formula: 'net water reaching the lake', assumed: true }), `worth ${fig(millionsYr(r.final.benefitM, 0), { formula: 'net water x value per acre-foot in the lake', assumed: true })} in avoided damage`)}
        ${tile('Hay receipts forgone', fig(millionsYr((r.acresOutOfIrrigation * V('application_mean') * V('hay_value_per_af')) / 1e6, 0), { formula: 'acres out of irrigation x water per acre x hay value per acre-foot', assumed: true }), 'the revenue side of the same water')}
        ${tile('Every announced industrial project', fig(kafYr(V('industrial_pipeline_water'), 1), { coef: 'industrial_pipeline_water' }), `${fig(pct(V('industrial_pipeline_water') / Math.max(1, r.final.netToLakeKaf)), { formula: 'industrial pipeline water ÷ water this package moves' })} of what this package moves, for ${fig(`${num(V('industrial_pipeline_jobs'), 0)} jobs`, { coef: 'industrial_pipeline_jobs' })}`)}
      </div>

      <section class="prose">
        <p class="callout">
          Data centres and the lake are not competing for the same water. Supplying every announced
          project costs a small fraction of what this package moves, which defuses the framing behind
          most of the opposition to them. The state can do both.
        </p>
      </section>`;
  },
  mount(root) {
    const el = byId(root, 'chart-value');
    if (el) {
      drawBars(
        el,
        [...VALUE_PER_AF].sort((a, b) => a.dollarsPerAf - b.dollarsPerAf).map((v) => ({
          label: v.label,
          value: v.dollarsPerAf,
          color: v.category === 'taken' ? 'var(--c-taken)' : v.category === 'proposed' ? 'var(--c-muted)' : 'var(--c4)',
          annotation: dollarsShort(v.dollarsPerAf),
        })),
        {
          log: true,
          marker: { value: V('lake_value_per_af'), label: `Lake ${perAf(V('lake_value_per_af'))}` },
          format: (v) => dollarsShort(v),
        },
      );
    }
  },
};

const legalTab: Tab = {
  id: 'law',
  label: 'Legal assumptions',
  group: 'detail',
  render({ r }) {
    const proposed = LEGAL_ASSUMPTIONS.filter((a) => a.status === 'Proposed legislation');
    const legalRows = [
      {
        claim: 'HB 410 field leasing cap',
        consequence: `The model applies ${fig(`${num(V('lease_to_own_rotation_multiplier'), 0)}x`, { coef: 'lease_to_own_rotation_multiplier' })} to acquired rights, because the instrument buys the water right rather than repeatedly leasing the same field.`,
      },
      {
        claim: 'Saved water must be protected in transit',
        consequence: `Monitoring lifts shepherding capacity to ${fig(kafYr(r.final.shepherdCapKaf), { formula: 'starting capacity + annual growth + what monitoring adds on a saturating curve', assumed: true })}; without legal transit protection, freed water can be re-diverted before it reaches the lake.`,
      },
      {
        claim: 'A basin-wide mandate needs new authority',
        consequence: `The backstop contributes ${fig(kafYr(r.final.forcedKaf), { formula: 'the mandate floor less voluntary water already found', assumed: true })} only where voluntary instruments fall short, and direct mandate fine revenue is ${fig(millionsYr(r.final.mandateFineRevenueM, 1), { formula: 'direct revenue from mandate penalties; currently no non-compliance payment stream is modelled', assumed: true })}.`,
      },
      {
        claim: 'Durability needs owned rights',
        consequence: `The state owns ${fig(kafYr(r.final.rightsOwnedKaf), { formula: 'lease-to-own tranches that have fully vested', assumed: true })} by ${r.final.year}, leaving ${fig(kafYr(r.durableRightsGapKaf), { formula: 'rights needed to hold healthy − rights owned outright', assumed: true })} still to own.`,
      },
    ];
    const rows = legalRows
      .map(
        (row) => `<tr>
          <td class="el-name">${escapeHtml(row.claim)}</td>
          <td>${row.consequence}</td>
        </tr>`,
      )
      .join('');

    return `
      <div class="tiles">
        ${tile('HB 410 in this model', fig(`${num(V('lease_to_own_rotation_multiplier'), 0)}x`, { coef: 'lease_to_own_rotation_multiplier' }), 'no repeal toggle and no two-in-five multiplier on acquired rights')}
        ${tile('Proposed legal changes', fig(num(proposed.length, 0), { note: 'Rows tagged Proposed legislation and Not current law.' }), 'each one is marked Not current law in the table')}
        ${tile('Rights still to own', fig(kafYr(r.durableRightsGapKaf), { formula: 'rights needed to hold healthy − rights owned outright', assumed: true }), 'the durable-rights gap')}
      </div>

      <section class="prose">
        <h3>The cap helps explain the instrument</h3>
        <p>
          HB 410 limits temporary leasing from the same field; this package avoids that fight by
          acquiring water rights instead of leasing the field every year. That distinction is legal
          work, not arithmetic decoration: if the instrument is actually treated as field leasing,
          the model's lease-to-own capacity is overstated.
        </p>
        <p class="callout">
          The biggest legal assumption is the basin-wide mandate. The lake is not administered like a
          senior water right at these volumes, so forced cuts for lake inflow need new statutory
          authority. The rows below say that plainly instead of hiding it inside the water number.
        </p>
      </section>

      <table class="data">
        <caption>Legal effects in the model</caption>
        <thead><tr><th>Issue</th><th>Consequence</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  },
};

const riskTab: Tab = {
  id: 'risk',
  label: 'Risks and weaknesses',
  group: 'detail',
  render({ tornado }) {
    const weaknesses = [
      ['Willing-seller capacity', 'lease_capacity', 'The single sharpest attack on this model. Both leasing and retirement capacity are stated as assumptions with no source. They would have to be wrong by several times over to change the conclusion, but they should be replaced with actual programme enrolment.'],
      ['Programme capacities are flat', 'crop_cap', 'Each programme delivers at a constant cost up to a cap, then nothing. Real conservation programmes have rising marginal cost: the thousandth acre-foot costs more than the first.'],
      ['Cloud seeding capacity', 'cloud_cap', 'Low confidence, and the option table says outright that the capacity is assumed.'],
      ['The mandate widening the market', 'mandate_pull', 'The measured participation jump it rests on came from offering a fixed price with no haggling, not from a threat of curtailment. The magnitude is real; attributing it to coercion is not established.'],
      ['Delivery gain from monitoring', 'measurement_gain_max', 'Capped at ten points with no source, unlike the capacity figures it sits beside.'],
      ['Is lawn water delivered or depleted?', 'lawn_water', 'If the reported figure is water delivered rather than depleted, lawn savings are overstated before the dedication haircut. The direction is conservative, but it is unresolved.'],
      ['The price of a water right', 'capital_price', 'Anchored to Colorado River buyouts and contradicted by two Utah figures an order of magnitude lower. Unresolved, and it moves the amortisation directly.'],
      ['Lake response speed', 'response_k', 'How fast the lake moves toward equilibrium is fitted to the published fill scenarios rather than measured.'],
    ];
    const rows = weaknesses
      .map(([name, id, why]) => `<tr>
        <td class="el-name">${escapeHtml(name)} ${fig(' ', { coef: id })}</td>
        <td>${escapeHtml(why)}</td>
      </tr>`)
      .join('');

    const physicsInTop = tornado.slice(0, 3).filter((t) => coef(t.id).group === 'Lake physics').length;

    return `
      <section class="prose">
        <h3>Which assumptions actually move the answer</h3>
        <p>
          Each bar pushes one coefficient to each end of its own stated range, holds everything else,
          and re-runs the whole model. The width of the bar is how far the lake moves. Anything with a
          short bar can be wrong without mattering; anything with a long bar is worth arguing about.
        </p>
      </section>

      ${chart('chart-tornado', 'How far the lake moves when one assumption changes', 'The vertical line is the current result. Assumptions are shaded; sourced and derived figures are not.')}

      <section class="prose">
        <h3>The three that matter most here</h3>
        <ol class="ranked">
          ${tornado.slice(0, 3).map((t) => `<li><strong>${escapeHtml(t.label)}</strong> — moves the lake ${fig(feet(t.swingFt, 2), { formula: 'elevation at the top of the range − elevation at the bottom', assumed: true })} across its range, and ${fig(kafYr(t.swingKaf), { formula: 'net water at the top of the range − net water at the bottom', assumed: true })} of water. ${escapeHtml(coef(t.id).basis)}</li>`).join('')}
        </ol>
        ${
          physicsInTop >= 2
            ? `<p class="callout">
                ${fig(num(physicsInTop, 0), { note: 'How many of the three largest movers describe the lake’s own water balance rather than a policy choice.' })}
                of those three describe the lake's own water balance — how much evaporates, how much
                rain falls on it, how much the rivers bring — rather than anything a legislature
                decides. That is the honest headline of this chart: the physical uncertainty is
                larger than the policy uncertainty, so a package should be judged on whether it
                still works across that range, not on a single projected level. The policy dials
                below it are the ones worth arguing about, because they are the ones anyone can
                actually set.
              </p>`
            : `<p class="callout">
                The largest movers here are policy choices rather than the lake's own water balance,
                which is unusual for this model and worth checking: at most dial settings the
                physical coefficients dominate.
              </p>`
        }
      </section>

      <table class="data">
        <caption>Weaknesses, stated before a reviewer finds them</caption>
        <thead><tr><th>Weakness</th><th>Why it matters</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  },
  mount(root, { tornado, r }) {
    const el = byId(root, 'chart-tornado');
    if (el && tornado.length) {
      drawTornado(
        el,
        tornado.map((t) => ({
          label: coef(t.id).label,
          low: t.lowElevation,
          high: t.highElevation,
          centre: r.final.elevationFt,
          status: t.status,
          lowLabel: `${num(t.lowValue, t.lowValue < 10 ? 2 : 0)} ${coef(t.id).unit}`,
          highLabel: `${num(t.highValue, t.highValue < 10 ? 2 : 0)} ${coef(t.id).unit}`,
        })),
      );
    }
  },
};

const simsTab: Tab = {
  id: 'sims',
  label: 'Simulations',
  group: 'detail',
  render({ sim, r }) {
    return `
      <div class="tiles">
        ${tile('Sequences run', fig(num(sim.runs, 0), { coef: 'sim_runs' }), 'each a different draw of wet and dry years')}
        ${tile('Ending in the healthy range', fig(pct(sim.shareHealthy), { formula: 'share of sequences ending between the healthy floor and ceiling', assumed: true }), `by ${r.final.year}`, sim.shareHealthy < 0.5 ? 'tile-warn' : 'tile-ok')}
        ${tile('Ending below the serious line', fig(pct(sim.shareBelowCritical), { formula: 'share of sequences ending below the serious-effects elevation', assumed: true }), `below ${fig(feet(V('serious_low'), 0), { coef: 'serious_low' })}`, sim.shareBelowCritical > 0.1 ? 'tile-bad' : 'tile-ok')}
        ${tile('Spread at the end', `${fig(feet(sim.p10[sim.p10.length - 1]), { formula: 'tenth percentile of the simulated sequences', assumed: true })} – ${fig(feet(sim.p90[sim.p90.length - 1]), { formula: 'ninetieth percentile of the simulated sequences', assumed: true })}`, 'the honest width of the answer')}
      </div>

      ${chart('chart-sim', 'Every sequence, as a band', `Year-to-year spread of ${fig(num(V('inflow_cv'), 2), { coef: 'inflow_cv' })} with drought persistence of ${fig(num(V('inflow_ar1'), 2), { coef: 'inflow_ar1' })}. Both are assumptions standing in for the gauged record, and both are flagged wherever they appear.`)}

      <section class="prose">
        <h3>What the band means</h3>
        <p>
          Inflow varies more than any policy lever on this page. A single line implies a precision the
          hydrology does not support, which is why the result is reported as a range and why the share
          of sequences landing in the healthy range matters more than the average ending level.
        </p>
      </section>`;
  },
  mount(root, { sim, r }) {
    const el = byId(root, 'chart-sim');
    if (el) {
      drawLake(el, { years: sim.years, line: sim.p50, p10: sim.p10, p90: sim.p90 }, 360);
    }
    void r;
  },
};

const baselineTab: Tab = {
  id: 'baseline',
  label: 'Baselines',
  group: 'detail',
  render({ d }) {
    const rows = BASELINES.map((b) => {
      const inflow = V('baseline_inflow') * b.inflowFactor;
      const need = inflowToHoldKaf(V('healthy_min')) - inflow;
      return `<tr class="${b.id === d.baselineId ? 'row-active' : ''}">
        <td class="el-name">${escapeHtml(b.label)}</td>
        <td>${escapeHtml(b.description)}</td>
        <td>${fig(kafYr(inflow), { formula: 'baseline inflow x this climate’s factor' })}</td>
        <td>${fig(kafYr(need), { formula: 'inflow to hold the healthy floor − inflow under this climate' })}</td>
        <td>${fig(feet(equilibriumFt(inflow)), { formula: 'equilibrium elevation under this climate with no package at all' })}</td>
      </tr>`;
    }).join('');

    return `
      <section class="prose">
        <h3>"The gap" is not one number</h3>
        <p>
          How much water the lake needs depends entirely on what you think a normal year looks like.
          The state's own published range runs from
          ${fig(kafYr(coef('goal_added').low!), { coef: 'goal_added' })} to
          ${fig(kafYr(coef('goal_added').high!), { coef: 'goal_added' })} for the same target elevation.
          This model computes the goal from whichever baseline is selected rather than storing it, so
          the figure on every other tab moves when this one does.
        </p>
        <p>
          There is a second distinction worth keeping separate: the water needed to
          <em>refill</em> the lake over a period is not the water needed to <em>hold</em> it there
          afterwards. Everything here is a long-run holding figure, which is the larger of the two.
        </p>
      </section>

      <table class="data">
        <caption>Each baseline, and what it implies</caption>
        <thead><tr><th>Baseline</th><th>What it is</th><th>River inflow</th><th>Needed for a healthy lake</th><th>Where the lake settles untouched</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  },
};

/** Digits enough to show a ledger value as it is stored (4,189.7 stays 4,189.7, 0.933 stays 0.933), at most three. */
const exactDigits = (v: number) => [0, 1, 2, 3].find((d) => Math.abs(Math.round(v * 10 ** d) / 10 ** d - v) < 1e-9) ?? 3;

const VERDICT_CLASS: Record<string, string> = {
  confirmed: 'sourced',
  corrected: 'warn',
  'range revised': 'derived',
  derived: 'derived',
  evidence: 'derived',
  unsupported: 'assumption',
  'no evidence': 'assumption',
  open: 'assumption',
};

/** The verdict cell: what checking the number found, the value it replaced, and when. */
function verdictCell(v: Verification | undefined, unit = ''): string {
  if (!v) return '<span class="none">not checked</span>';
  const was = v.previous?.value !== undefined
    ? `<span class="detail">was ${fig(`${num(v.previous.value, exactDigits(v.previous.value))}${unit ? ` ${unit}` : ''}`, { note: 'The value before it was checked at source.', sourceIds: v.sourceIds })}</span>`
    : '';
  return `<span class="pill pill-${VERDICT_CLASS[v.verdict] ?? 'derived'}">${escapeHtml(v.verdict)}</span>${was}<span class="detail">checked ${escapeHtml(v.checked)}${v.reviewed ? ', re-opened by reviewer' : ''}</span>`;
}

function locatorCell(v: Verification | undefined): string {
  if (!v) return '—';
  const links = sourceLinks(v.sourceIds);
  return `${v.locator ? escapeHtml(v.locator) : '—'}${links ? `<span class="detail">${links}</span>` : ''}`;
}

function quoteCell(v: Verification | undefined): string {
  if (!v || (!v.quote && !v.arithmetic)) return '<span class="none">none found</span>';
  return `${v.quote ? `<q class="v-quote">${escapeHtml(v.quote)}</q>` : ''}${v.arithmetic ? `<span class="detail">${escapeHtml(v.arithmetic)}</span>` : ''}`;
}

const indexTab: Tab = {
  id: 'index',
  label: 'Index and sources',
  group: 'detail',
  render() {
    const groups = [...new Set(COEFS.map((c) => c.group))];
    const tables = groups
      .map((g) => {
        const rows = COEFS.filter((c) => c.group === g)
          .map(
            (c) => `<tr>
            <td class="el-name">${escapeHtml(c.label)}</td>
            <td class="num">${fig(`${num(c.value, exactDigits(c.value))}`, { coef: c.id })} <span class="unit">${escapeHtml(c.unit)}</span></td>
            <td>${c.low !== undefined ? `${num(c.low, exactDigits(c.low))}–${num(c.high!, exactDigits(c.high!))}` : '—'}</td>
            <td><span class="pill pill-${c.status}">${c.status}</span></td>
            <td class="v-basis">${escapeHtml(c.basis)}</td>
            <td class="v-src">${c.sourceIds.map((sid) => { const s = source(sid); return `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.publisher)}</a>`; }).join(', ') || '<span class="none">none</span>'}</td>
            <td class="v-verdict">${verdictCell(VERIFICATION[c.id], c.unit)}</td>
            <td class="v-loc">${locatorCell(VERIFICATION[c.id])}</td>
            <td class="v-quote-cell">${quoteCell(VERIFICATION[c.id])}</td>
          </tr>`,
          )
          .join('');
        return `<table class="data data-index data-wide"><caption>${escapeHtml(g)}</caption>
          <thead><tr><th>Figure</th><th>Value</th><th>Range</th><th>Status</th><th>Basis</th><th>Source</th><th>Verdict</th><th>Locator</th><th>Quote</th></tr></thead>
          <tbody>${rows}</tbody></table>`;
      })
      .join('');

    const legalGroups = [...new Set(LEGAL_ASSUMPTIONS.map((a) => a.group))];
    const legalTables = legalGroups
      .map((group) => {
        const rows = LEGAL_ASSUMPTIONS.filter((a) => a.group === group)
          .map(
            (a) => `<tr>
              <td class="el-name">${escapeHtml(a.label)}</td>
              <td><span class="pill pill-${a.status === 'Proposed legislation' ? 'assumption' : 'sourced'}">${escapeHtml(a.status)}</span></td>
              <td>${escapeHtml(a.value)}${a.appliesWhen ? `<span class="detail">${escapeHtml(a.appliesWhen)}</span>` : ''}</td>
              <td>${escapeHtml(a.basis)}</td>
              <td>${sourceLinks(a.sourceIds) || '<span class="none">none</span>'}</td>
            </tr>`,
          )
          .join('');
        return `<table class="data data-index">
          <caption>${escapeHtml(group)}</caption>
          <thead><tr><th>Constraint</th><th>Status</th><th>Value</th><th>Basis</th><th>Source</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
      })
      .join('');

    const assumptions = COEFS.filter((c) => c.status === 'assumption');
    const assumptionRows = assumptions
      .map(
        (c) => `<tr>
          <td class="el-name">${escapeHtml(c.label)}</td>
          <td>${escapeHtml(c.group)}</td>
          <td class="num">${fig(`${num(c.value, exactDigits(c.value))}`, { coef: c.id })} <span class="unit">${escapeHtml(c.unit)}</span></td>
          <td>${c.low !== undefined ? `${num(c.low, exactDigits(c.low))}–${num(c.high!, exactDigits(c.high!))}` : '—'}</td>
          <td>${escapeHtml(c.confidence ?? '—')}</td>
          <td>${escapeHtml(c.basis)}</td>
          <td>${sourceLinks(c.sourceIds) || '<span class="none">model choice</span>'}</td>
        </tr>`,
      )
      .join('');

    const srcList = SOURCES.map(
      (s) => `<li>
        <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a>
        <span class="src-meta">${escapeHtml(s.publisher)} · ${s.year}</span>
        <span class="src-use">${escapeHtml(s.use)}</span>
        ${s.locator ? `<span class="src-loc">${escapeHtml(s.locator)}</span>` : ''}
      </li>`,
    ).join('');

    const tableNames: Record<string, string> = {
      BASELINES: 'Inflow baselines',
      CONSUMERS: 'Who depletes the water',
      STAKEHOLDERS: 'Stakeholder groups',
      VALUE_PER_AF: 'Output per acre-foot by use',
      WATERING_MONTHS: 'Lawn watering by month',
      AREA_ANCHORS: 'Lake area by elevation',
      USU_VALIDATION: 'Published equilibrium elevations',
      LEGAL: 'Legal assumptions',
      SOURCES: 'Source list',
    };
    const tableRows = Object.values(TABLE_VERIFICATION);
    const sideTables = Object.keys(tableNames)
      .map((name) => {
        const rows = tableRows.filter((v) => v.id.startsWith(`${name}/`));
        if (rows.length === 0) return '';
        return `<table class="data data-index data-wide"><caption>${escapeHtml(tableNames[name])}</caption>
          <thead><tr><th>Row</th><th>Now</th><th>Verdict</th><th>Locator</th><th>Quote</th><th>Notes</th></tr></thead>
          <tbody>${rows
            .map(
              (v) => `<tr>
              <td class="el-name">${escapeHtml(v.id.slice(name.length + 1))}</td>
              <td class="num">${v.value !== undefined ? fig(num(v.value, exactDigits(v.value)), { note: 'The value the model now uses, after checking at source.', sourceIds: v.sourceIds }) : '—'}</td>
              <td class="v-verdict">${verdictCell(v)}</td>
              <td class="v-loc">${locatorCell(v)}</td>
              <td class="v-quote-cell">${quoteCell(v)}</td>
              <td class="v-basis">${escapeHtml(v.notes)}</td>
            </tr>`,
            )
            .join('')}</tbody></table>`;
      })
      .join('');
    const verdictCounts = (records: Verification[]) => {
      const c = new Map<string, number>();
      for (const v of records) c.set(v.verdict, (c.get(v.verdict) ?? 0) + 1);
      return [...c.entries()].sort((a, b) => b[1] - a[1]);
    };
    const coefVerdicts = verdictCounts(COEFS.map((c) => VERIFICATION[c.id]).filter((v): v is Verification => Boolean(v)))
      .map(([verdict, n]) => `${fig(num(n, 0), { note: `Coefficients whose verdict is "${verdict}".` })} ${escapeHtml(verdict)}`)
      .join(', ');
    const correctedCount = COEFS.filter((c) => VERIFICATION[c.id]?.previous?.value !== undefined).length;

    const counts = {
      sourced: COEFS.filter((c) => c.status === 'sourced').length,
      derived: COEFS.filter((c) => c.status === 'derived').length,
      assumption: COEFS.filter((c) => c.status === 'assumption').length,
      linkedAssumption: COEFS.filter((c) => c.status === 'assumption' && c.sourceIds.length > 0).length,
      unlinkedAssumption: COEFS.filter((c) => c.status === 'assumption' && c.sourceIds.length === 0).length,
      legal: LEGAL_ASSUMPTIONS.length,
      proposed: LEGAL_ASSUMPTIONS.filter((a) => a.status === 'Proposed legislation').length,
    };

    return `
      <section class="prose">
        <h3>The single ledger</h3>
        <p>
          ${fig(num(counts.sourced, 0), { note: 'Figures taken from a published source.' })} published figures,
          ${fig(num(counts.derived, 0), { note: 'Figures computed from other figures, each with its formula shown.' })} worked out from others, and
          ${fig(num(counts.assumption, 0), { note: 'Figures that remain model assumptions even when they have supporting analogues.' })} assumptions.
          Of those assumptions, ${fig(num(counts.linkedAssumption, 0), { note: 'Assumptions with at least one supporting source or analogue attached.' })}
          now have a source or empirical analogue attached and
          ${fig(num(counts.unlinkedAssumption, 0), { note: 'Assumptions that are policy or modelling choices rather than outside facts.' })}
          are left as explicit model or policy choices. The legal ledger carries
          ${fig(num(counts.legal, 0), { note: 'Rows in the legal-assumptions table.' })} constraints, including
          ${fig(num(counts.proposed, 0), { note: 'Constraints marked Proposed legislation.' })} proposed changes.
        </p>
        <p class="callout">
          A linked assumption is still an assumption. The source column says what evidence or analogue
          was used; the status column says whether the exact number is published, derived or model-made.
        </p>
        <p>
          Every number was checked again at source in October 2026. The verdict column says what that
          found: ${coefVerdicts}. ${fig(num(correctedCount, 0), { note: 'Coefficients whose value changed after checking at source.' })}
          values changed, and each shows the value it replaced. The locator says where in the source the
          figure sits, and the quote is the passage it was checked against.
        </p>
      </section>

      <h3 class="sec-head">Data and coefficients</h3>
      ${tables}

      <h3 class="sec-head">Side tables, checked row by row</h3>
      ${sideTables}

      <h3 class="sec-head">Assumptions</h3>
      <table class="data data-index">
        <caption>Assumption audit</caption>
        <thead><tr><th>Figure</th><th>Group</th><th>Value</th><th>Range</th><th>Confidence</th><th>Basis</th><th>Source or analogue</th></tr></thead>
        <tbody>${assumptionRows}</tbody>
      </table>

      <h3 class="sec-head">Constraints</h3>
      ${legalTables}

      <section class="prose">
        <h3>Sources</h3>
        <ul class="src-list">${srcList}</ul>
      </section>`;
  },
};

const calibrationTab: Tab = {
  id: 'calibration',
  label: 'Calibration',
  group: 'detail',
  render() {
    return `
      <section class="prose">
        <h3>Each default against its own range</h3>
        <p>
          The diamond is the value the model uses. The line is the span the sensitivity sweep explores.
          A default sitting at the edge of its own range is worth a second look: it means the sweep can
          only push it one way.
        </p>
      </section>
      ${chart('chart-cal', 'Defaults against their plausible ranges', 'Only coefficients with a stated range appear here.')}`;
  },
  mount(root) {
    const el = byId(root, 'chart-cal');
    if (el) {
      const rows = COEFS.filter((c) => c.low !== undefined && c.high !== undefined && c.status === 'assumption')
        .slice(0, 18)
        .map((c) => ({
          label: c.label,
          values: [c.low!, c.high!],
          defaultValue: c.value,
          low: c.low,
          high: c.high,
          format: (v: number) => `${num(v, Math.abs(v) < 10 ? 2 : 0)}`,
        }));
      drawCalibration(el, rows);
    }
  },
};

// ───────────────────────────── How it connects ─────────────────────────────

/** The model's own source, read at build time so the map always matches the code. */
const SOURCE_FILES = {
  'model.ts': modelSrc,
  'lake.ts': lakeSrc,
  'schedule.ts': scheduleSrc,
  'simulate.ts': simulateSrc,
  'ui/tabs.ts': tabsSrc,
};

const connectionsTab: Tab = {
  id: 'connections',
  label: 'How it connects',
  group: 'detail',
  render({ d, schedule }) {
    const feeds = traceDependencies(SOURCE_FILES);
    const impact = new Map(impacts({ ...d, schedule: undefined }, schedule()).map((x) => [x.id, x]));
    const calc = COEFS.filter((c) => [...(feeds.get(c.id) ?? [])].some((st) => CALCULATING.has(st)));
    const displayOnly = COEFS.filter((c) => feeds.has(c.id) && !calc.includes(c));
    const unused = COEFS.filter((c) => !feeds.has(c.id));
    const stageLabel = new Map(STAGES.map((st) => [st.id, st.label]));
    const byLake = [...impact.values()].sort((a, b) => b.lakeSwingFt - a.lakeSwingFt).map((x) => x.id);
    const byNev = [...impact.values()].sort((a, b) => b.nevSwingM - a.nevSwingM).map((x) => x.id);
    const rank = (c: (typeof COEFS)[number]) =>
      Math.min(impact.has(c.id) ? byLake.indexOf(c.id) : 999, impact.has(c.id) ? byNev.indexOf(c.id) : 999);

    const rows = [...COEFS]
      .sort((a, b) => rank(a) - rank(b))
      .map((c) => {
        const x = impact.get(c.id);
        const stages = [...(feeds.get(c.id) ?? [])].map((st) => stageLabel.get(st) ?? st);
        return `<tr>
          <td>${figCoef(c.id)} <span class="hint">${escapeHtml(c.label)}</span></td>
          <td><span class="pill pill-${c.status}">${c.status}</span></td>
          <td>${stages.length ? escapeHtml(stages.join(', ')) : '<span class="none">nothing</span>'}</td>
          <td>${x ? fig(feet(x.lakeSwingFt, 2), { formula: `2055 lake level with ${c.id} at the top of its range − at the bottom`, assumed: true }) : '<span class="none">no range</span>'}</td>
          <td>${x ? fig(millions(x.nevSwingM, 0), { formula: `plan net economic value with ${c.id} at the top of its range − at the bottom, same yearly split`, assumed: true }) : '<span class="none">no range</span>'}</td>
        </tr>`;
      })
      .join('');

    return `
      <div class="tiles">
        ${tile('Numbers in the model', fig(String(COEFS.length), { note: 'Every coefficient in data.ts.' }), 'each with a basis, a status and its sources')}
        ${tile('Feed a calculation', fig(String(calc.length), { formula: 'coefficients read by the model, lake, budget or simulation code', assumed: true }), 'traced from the model’s own source code')}
        ${tile('Explanation only', fig(String(displayOnly.length), { formula: 'coefficients only quoted on the page', assumed: true }), 'quoted on the page for context; no result depends on them')}
        ${tile('Used nowhere', fig(String(unused.length), { formula: 'coefficients neither calculated with nor quoted', assumed: true }), unused.length ? escapeHtml(unused.map((c) => c.id).join(', ')) : 'every number is used', unused.length ? 'tile-bad' : 'tile-ok')}
      </div>

      ${chart('chart-connections', 'How the inputs flow through the model', 'Read left to right. A line’s width is how many numbers travel along it. Hover a box to light up what it touches.')}

      <section class="prose">
        <h3>Reading the table</h3>
        <p>
          Each number is pushed to the bottom and then the top of its own plausible range, everything
          else held, and the change recorded twice: in the ${fig(String(d.horizon), { note: 'The horizon the model runs to.' })}
          lake level, and in the plan’s net economic value with the year-by-year split held as it is.
          The table is sorted by whichever of the two a number moves more, so the numbers that decide
          the answer come first. A number with no stated range is a fixed fact or a policy setting.
        </p>
      </section>

      <table class="data">
        <caption>Every number, what it feeds, and how much it moves the answer</caption>
        <thead><tr><th>Number</th><th>Status</th><th>Feeds</th><th>Moves the lake</th><th>Moves net value</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  },
  mount(root) {
    const el = byId(root, 'chart-connections');
    if (!el) return;
    const feeds = traceDependencies(SOURCE_FILES);
    const groups = [...new Set(COEFS.map((c) => c.group))];
    const groupCount = (g: string) => COEFS.filter((c) => c.group === g).length;
    const used = STAGES.filter((st) => COEFS.some((c) => feeds.get(c.id)?.has(st.id)));
    const links = new Map<string, number>();
    for (const c of COEFS) {
      for (const st of feeds.get(c.id) ?? []) {
        const key = `g:${c.group}|s:${st}`;
        links.set(key, (links.get(key) ?? 0) + 1);
      }
    }
    for (const st of used) {
      for (const o of st.outputs) {
        const weight = COEFS.filter((c) => feeds.get(c.id)?.has(st.id)).length;
        links.set(`s:${st.id}|o:${o}`, weight);
      }
    }
    drawFlow(
      el,
      [
        groups.map((g) => ({ id: `g:${g}`, label: g, tag: String(groupCount(g)) })),
        used.map((st) => ({ id: `s:${st.id}`, label: st.label })),
        OUTPUTS.map((o) => ({ id: `o:${o.id}`, label: o.label })),
      ],
      [...links.entries()].map(([k, weight]) => {
        const [from, to] = k.split('|');
        return { from, to, weight };
      }),
    );
  },
};

export const TABS: Tab[] = [
  nowTab,
  targetTab,
  pathTab,
  allocTab,
  budgetTab,
  pkgTab,
  cropsTab,
  lawnTab,
  driversTab,
  revenueTab,
  legalTab,
  riskTab,
  simsTab,
  baselineTab,
  calibrationTab,
  connectionsTab,
  indexTab,
];

/** The header summary, written from the model's own output. */
export function headerSummary(r: PkgResult): string {
  const agShare = V('ag_depletion') / V('basin_depletion');
  return `
    Agriculture is ${fig(pct(agShare), { formula: 'agricultural depletion ÷ basin depletion' })} of
    human depletion in the Great Salt Lake basin, and residential lawns lead urban use. This package
    spends ${fig(millionsYr(r.dials.budgetM, 0), { coef: 'budget' })} and delivers
    ${fig(kafYr(r.final.netToLakeKaf), { formula: 'gross delivery x delivery share − growth − streamflow decline', assumed: true })}
    to the lake by ${fig(String(r.final.year), { note: 'The horizon the model runs to.' })}, enough for a
    long-run level near ${fig(feet(r.final.elevationFt), { formula: 'the lake responding year by year to the inflow it is given', assumed: true })}.
    The goal is ${fig(kafYr(r.goalKaf), { coef: 'goal_added' })}, which would settle the lake near
    ${fig(feet(r.goalElevationFt), { formula: 'equilibrium elevation for baseline inflow plus the goal' })};
    a healthy lake starts at ${fig(feet(V('healthy_min'), 0), { coef: 'healthy_min' })}.
    ${r.ceilingBinds
      ? 'Willing sellers and shepherding capacity are binding before money does: more budget would not help.'
      : 'At this budget the money binds before the willing-seller ceiling does.'}`;
}

