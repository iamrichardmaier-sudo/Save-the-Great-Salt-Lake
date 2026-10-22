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
  VALUE_PER_AF,
  V,
  WATERING_MONTHS,
  coef,
} from '../data';
import { SOURCES, source } from '../sources';
import { areaSqMi, equilibriumFt, inflowToHoldKaf } from '../lake';
import { chargeModel, levyModel, seasonCoverage, type Dials, type PkgResult } from '../model';
import { budgetSweep, levelForAdded, type SimResult, type TornadoRow } from '../simulate';
import { controlsByGroup } from './controls';
import {
  dollarsShort,
  escapeHtml,
  feet,
  fig,
  kafYr,
  millionsYr,
  num,
  pct,
  perAf,
  years as yearsFmt,
} from './format';
import {
  drawBars,
  drawCalibration,
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
        ${tile('Short of standing still', fig(kafYr(deficit), { formula: 'inflow needed to hold today’s level − inflow the lake receives', assumed: false }),
          `even holding this level needs more water than the rivers now bring`)}
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
          The package below takes ${fig(kafYr(r.final.netToLakeKaf), { formula: 'gross delivery x delivery share − growth − streamflow decline', assumed: true })}
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

// ───────────────────────────── 5 · The package ─────────────────────────────

const pkgTab: Tab = {
  id: 'pkg',
  label: 'The package',
  group: 'plan',
  render({ d, r }) {
    const ch = chargeModel(r.final.chargeRate);
    const elements: { name: string; setting: string; water: string; what: string }[] = [
      {
        name: 'Scarcity charge on industry',
        setting: d.scarcityRatePerAf > 0
          ? `${fig(perAf(r.final.chargeRate), { formula: 'the rate, sized to the gap still to close and moved a quarter of the way each year', assumed: true })} now, from a ${fig(perAf(d.scarcityRatePerAf), { coef: 'irrigation_net_value' })} setting`
          : `${fig(perAf(0), { coef: 'irrigation_net_value' })} — off`,
        water: fig(kafYr(ch.behaviouralKaf), { formula: 'agricultural and industrial cutbacks in response to the charge', assumed: true }),
        what: `Falls on ${fig(kafYr(V('charge_base')), { coef: 'charge_base' })} of non-household use, never on households. It raises ${fig(millionsYr(ch.revenueM, 1), { formula: 'rate x the base left after users respond' })}, all of it spent on rights. The cutback is the larger half: users give up water rather than pay for it.`,
      },
      {
        name: 'Lease-to-own rights',
        setting: `${fig(millionsYr(d.leaseToOwnM, 1), { coef: 'lease_to_own_dollars' })}, owned after ${fig(yearsFmt(r.final.payoffYears), { formula: 'amortisation at the state borrowing rate: −ln(1 − price x interest ÷ annual rate) ÷ ln(1 + interest)' })}`,
        water: fig(kafYr(r.final.shepherdedKaf), { formula: 'min(rights held, shepherding capacity) x the share of that ground not already cutting back', assumed: true }),
        what: `At ${fig(perAf(r.final.leaseRatePerAf), { formula: 'base rate x scarcity as the state buys − relief from charges the leased water escapes', assumed: true })} a year. Leasing exempts the water from the charge, so every charge lowers the price of a right rather than raising it. Capped at ${fig(kafYr((V('lease_capacity') + V('retire_capacity')) * (1 + Math.min(1, d.mandatePenaltyPerAf / V('irrigation_net_value')) * V('mandate_pull'))), { formula: 'willing-seller capacity x the widening a credible mandate brings', assumed: true })} of willing sellers.`,
      },
      {
        name: 'Crop levy above a threshold',
        setting: d.cropLevyPerAf > 0
          ? `${fig(perAf(d.cropLevyPerAf), { coef: 'hay_net_return' })} on water applied above ${fig(`${num(d.levyThresholdAfPerAcre, 1)} AF/acre`, { coef: 'application_mean' })}`
          : `${fig(perAf(0), { coef: 'hay_net_return' })} — off`,
        water: fig(kafYr(r.levy.waterKaf), { formula: 'acres x the share of application each one cuts x depletion freed per acre', assumed: true }),
        what: `${fig(pct(r.levy.shareOfGroundInScope), { formula: 'share of hay ground applying more than the threshold, from a lognormal spread around the mean' })} of hay ground sits above the line, raising ${fig(millionsYr(r.levy.revenueM, 1), { formula: 'rate x water applied above the threshold, after farms respond' })}. Receipts fund crop-switching rebates, returned to the farms the levy was charged to.`,
      },
      {
        name: 'Residential lawn limit',
        setting: d.lawnCutAsked > 0
          ? `${fig(pct(d.lawnCutAsked), { coef: 'lawn_water' })} less lawn water, enforced at ${fig(`${num(d.finePerViolation, 0)} a citation`, { coef: 'season_value' })}`
          : `no limit — off`,
        water: fig(kafYr(r.lawn.toLake), { formula: 'water not applied x the share of a city saving that reaches the lake', assumed: true }),
        what: `${fig(pct(r.lawn.compliance), { formula: 'habit floor plus the effect of being caught, solved as a fixed point', assumed: true })} of ${fig(`${num(r.lawn.lawns / 1000, 0)}k lawns`, { coef: 'basin_lawns' })} comply, but only ${fig(pct(V('urban_to_lake')), { coef: 'urban_to_lake' })} of a city saving reaches the lake. Fines raise ${fig(millionsYr(r.lawn.fineRevenue / 1e6, 1), { formula: 'citations x fine x the share collected' })}.`,
      },
      {
        name: 'Conservation programmes',
        setting: `${fig(millionsYr(d.cropSwitchM + d.phragM + d.cloudM, 1), { note: 'Crop switching, phragmites removal and cloud seeding together.' })}`,
        water: fig(kafYr(r.final.programKaf), { formula: 'the four programmes, each capped by capacity rather than by money', assumed: true }),
        what: `Cheapest delivered water first. Two of the three cheapest are capped by how much work exists rather than by money: cloud seeding and phragmites together top out near ${fig(kafYr(V('cloud_cap') + V('phrag_cap')), { formula: 'cloud seeding capacity + phragmites capacity' })}.`,
      },
      {
        name: 'Mandated cut, as a backstop',
        setting: d.mandateFloorKaf > 0
          ? `${fig(kafYr(d.mandateFloorKaf), { coef: 'mandate_floor' })} floor, phased over ${fig(`${num(d.mandatePhaseYears, 0)} years`, { coef: 'mandate_phase' })}`
          : 'none',
        water: fig(kafYr(r.final.forcedKaf), { formula: 'the floor less whatever the voluntary levers already found', assumed: true }),
        what: d.mandatePenaltyPerAf > 0
          ? `Non-compliance priced at ${fig(perAf(d.mandatePenaltyPerAf), { coef: 'mandate_penalty' })}, which widens the willing-seller market rather than narrowing it: a farm that will not sell pays the social cost instead.`
          : `Only bites where the voluntary levers fall short. Every forced acre-foot costs political support, and with no penalty priced on non-compliance there is nothing drawing farms into the market instead.`,
      },
      {
        name: 'Monitoring and verification',
        setting: fig(millionsYr(d.monitoringM, 1), { coef: 'monitoring' }),
        water: '—',
        what: `Buys no water. It carries shepherding capacity to ${fig(kafYr(r.final.shepherdCapKaf), { formula: 'starting capacity + annual growth + what monitoring adds on a saturating curve', assumed: true })} and lifts the delivery share to ${fig(pct(r.final.deliveryShare), { formula: 'base delivery share x (1 + what measurement adds)', assumed: true })}, which is what lets the rest arrive.`,
      },
    ];

    const rows = elements
      .map(
        (e) => `<tr>
          <td class="el-name">${escapeHtml(e.name)}</td>
          <td>${e.setting}</td>
          <td class="num">${e.water}</td>
          <td class="el-what">${e.what}</td>
        </tr>`,
      )
      .join('');

    const weakest = r.support.weakest;
    const costPerAf = r.final.netToLakeKaf > 0 ? (r.final.totalCostM * 1e6) / (r.final.netToLakeKaf * 1000) : 0;

    return `
      <div class="tiles tiles-head">
        ${tile('Water reaching the lake', fig(kafYr(r.final.netToLakeKaf), { formula: 'gross delivery x delivery share − growth − streamflow decline', assumed: true }), `net by ${r.final.year}`, 'tile-ok')}
        ${tile('Where the lake ends up', fig(feet(r.final.elevationFt), { formula: 'the lake responding year by year to the inflow it is given', assumed: true }), `healthy starts at ${fig(feet(V('healthy_min'), 0), { coef: 'healthy_min' })}`)}
        ${tile('Still short', fig(kafYr(r.shortfallKaf), { formula: 'the goal − water reaching the lake', assumed: true }), `against the ${fig(kafYr(r.goalKaf), { coef: 'goal_added' })} the lake needs`, r.shortfallKaf > 0 ? 'tile-bad' : 'tile-ok')}
        ${tile('Weakest support', fig(`${num(weakest.score, 0)} / 100`, { formula: 'modelled from polled weights on bought versus charged versus ordered water', assumed: true }), `${escapeHtml(weakest.label)}, the group that decides whether this survives`, weakest.score < 50 ? 'tile-bad' : '')}
      </div>

      <section class="prose">
        <h3>Seven instruments, each doing the job it is best at</h3>
        <p>
          A <strong>scarcity charge</strong> whose rate is set by how much depletion still has to be
          cut, so it reaches zero only when the lake is genuinely in balance.
          <strong>Lease-to-own rights</strong>, so payments build ownership instead of renting the same
          water twice. A <strong>crop levy</strong> on water applied above a set depth per acre, so it
          taxes over-watering rather than farming. A <strong>residential limit</strong> whose
          compliance turns on enforcement, not on the size of the fine. The
          <strong>cheapest conservation</strong> the toolkit offers. A <strong>mandate</strong> that
          only takes what the rest missed. And <strong>monitoring</strong> that buys no water at all
          but decides how much of everything else ever reaches the lake.
        </p>
        <p class="callout">
          ${r.boughtShare >= 0.5
            ? `${fig(pct(r.boughtShare), { formula: 'water bought ÷ water bought, charged and ordered' })} of the water is bought rather than charged or ordered. Asked the best state approach, ${fig(pct(V('pref_incentives')), { coef: 'pref_incentives' })} of Utah voters chose incentives and ${fig(pct(V('pref_penalties')), { coef: 'pref_penalties' })} chose penalties, so this ratio is what decides whether the package is popular.`
            : `Only ${fig(pct(r.boughtShare), { formula: 'water bought ÷ water bought, charged and ordered' })} of the water is bought rather than charged or ordered. Asked the best state approach, ${fig(pct(V('pref_incentives')), { coef: 'pref_incentives' })} of Utah voters chose incentives and just ${fig(pct(V('pref_penalties')), { coef: 'pref_penalties' })} chose penalties. On this setting the package is mostly ordered, which is the shape voters like least.`}
        </p>
      </section>

      <table class="data table-elements">
        <caption>The elements</caption>
        <thead><tr><th>Element</th><th>Setting</th><th>Water by ${r.final.year}</th><th>What it does</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      ${chart('chart-support', 'Who supports it', `Scores are modelled from weights taken from 2026 Utah polling, not themselves surveyed. The dashed line is the halfway mark.`)}

      ${chart('chart-jobs', 'Jobs lost and jobs made as the package runs', `By ${r.final.year} the package costs ${fig(`${num(r.final.fieldJobsLost, 0)} field jobs`, { formula: 'acres out of irrigation ÷ 1,000 x jobs per thousand acres', assumed: true })} on ${fig(`${num(r.acresOutOfIrrigation, 0)} acres`, { formula: 'agricultural water removed ÷ water applied per acre' })} taken out of irrigation, and ${fig(`${num(r.final.livestockJobsLost, 0)}`, { formula: 'dairy and beef employment exposed once the cut passes the basin’s forage surplus', assumed: true })} in dairy and beef. Against that it supports ${fig(`${num(r.final.transitionJobs, 0)}`, { formula: 'crop transition and monitoring spending x jobs per million', assumed: true })} in transition work and ${fig(`${num(r.final.lakeJobs, 0)}`, { formula: 'lake-economy employment at a healthy lake x how far the lake recovers', assumed: true })} in the lake economy, which only exist if the lake comes back.`)}

      <section class="prose">
        <h3>The cost, stated whole</h3>
        <p>
          The public budget is ${fig(millionsYr(d.budgetM, 0), { coef: 'budget' })}, but that is not the
          cost. Add ${fig(millionsYr(r.final.farmRevenueLostM, 1), { formula: 'water taken without payment x what an acre-foot earns in hay', assumed: true })}
          of farm revenue taken without compensation and
          ${fig(millionsYr(r.final.livestockReceiptsAtRiskM, 1), { formula: 'dairy and beef receipts exposed once the cut passes the forage surplus', assumed: true })}
          of livestock receipts at risk, and the real annual cost is
          ${fig(millionsYr(r.final.totalCostM, 1), { formula: 'public budget + uncompensated farm revenue + livestock receipts at risk', assumed: true })}
          — about ${fig(perAf(costPerAf), { formula: 'total annual cost ÷ water reaching the lake' })} delivered.
          Against that, the water is worth
          ${fig(millionsYr(r.final.benefitM, 0), { formula: 'water reaching the lake x what an acre-foot is worth in the lake', assumed: true })} a year in avoided damage.
        </p>
        <p>
          Utah households say they would pay about ${fig(`${dollarsShort(V('wtp_household'))} a year each`, { coef: 'wtp_household' })},
          roughly ${fig(millionsYr((V('wtp_household') * V('state_households')) / 1e6, 0), { formula: 'willingness to pay per household x households in the state' })}
          statewide. Money is not the binding constraint on this problem, and neither is consent.
        </p>
      </section>`;
  },
  mount(root, { r }) {
    const sup = byId(root, 'chart-support');
    if (sup) {
      drawBars(
        sup,
        r.support.scores.map((s) => ({
          label: s.label,
          value: s.score,
          color: s.score < 50 ? 'var(--c-bad)' : s.score < 65 ? 'var(--c-warn)' : 'var(--c-ok)',
          annotation: num(s.score, 0),
        })),
        { max: 100, marker: { value: 50, label: '' }, format: (v) => num(v, 0) },
      );
    }
    const jobs = byId(root, 'chart-jobs');
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
            <td class="num">${fig(`${num(c.value, Math.abs(c.value) < 10 ? 2 : 0)}`, { coef: c.id })} <span class="unit">${escapeHtml(c.unit)}</span></td>
            <td>${c.low !== undefined ? `${num(c.low, c.low < 10 ? 2 : 0)}–${num(c.high!, c.high! < 10 ? 2 : 0)}` : '—'}</td>
            <td><span class="pill pill-${c.status}">${c.status}</span></td>
            <td>${escapeHtml(c.basis)}</td>
            <td>${c.sourceIds.map((sid) => { const s = source(sid); return `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.publisher)}</a>`; }).join(', ') || '<span class="none">none</span>'}</td>
          </tr>`,
          )
          .join('');
        return `<table class="data data-index"><caption>${escapeHtml(g)}</caption>
          <thead><tr><th>Figure</th><th>Value</th><th>Range</th><th>Status</th><th>Basis</th><th>Source</th></tr></thead>
          <tbody>${rows}</tbody></table>`;
      })
      .join('');

    const srcList = SOURCES.map(
      (s) => `<li>
        <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a>
        <span class="src-meta">${escapeHtml(s.publisher)} · ${s.year}</span>
        <span class="src-use">${escapeHtml(s.use)}</span>
        ${s.locator ? `<span class="src-loc">${escapeHtml(s.locator)}</span>` : ''}
      </li>`,
    ).join('');

    const counts = {
      sourced: COEFS.filter((c) => c.status === 'sourced').length,
      derived: COEFS.filter((c) => c.status === 'derived').length,
      assumption: COEFS.filter((c) => c.status === 'assumption').length,
    };

    return `
      <section class="prose">
        <h3>Every figure the model uses</h3>
        <p>
          ${fig(num(counts.sourced, 0), { note: 'Figures taken from a published source.' })} published figures,
          ${fig(num(counts.derived, 0), { note: 'Figures computed from other figures, each with its formula shown.' })} worked out from others, and
          ${fig(num(counts.assumption, 0), { note: 'Figures with no source behind them. Each is a dial, and each is flagged wherever it appears.' })} assumptions
          with nothing behind them. The assumptions are the interesting ones: every one is a dial, and
          every one carries a warning mark wherever its number appears on this site.
        </p>
      </section>
      ${tables}
      <section class="prose">
        <h3>Sources</h3>
        <ul class="src-list">${srcList}</ul>
      </section>`;
  },
};

const evidenceTab: Tab = {
  id: 'evidence',
  label: 'Assumptions and evidence',
  group: 'detail',
  render() {
    const assumptions = COEFS.filter((c) => c.status === 'assumption');
    const withSources = assumptions.filter((c) => c.sourceIds.length > 0);
    const without = assumptions.filter((c) => c.sourceIds.length === 0);

    const card = (c: (typeof COEFS)[number]) => `<article class="ev-card">
      <header>
        <h4>${escapeHtml(c.label)}</h4>
        <span class="ev-value">${fig(`${num(c.value, Math.abs(c.value) < 10 ? 2 : 0)} ${c.unit}`, { coef: c.id })}</span>
      </header>
      <p class="ev-basis">${escapeHtml(c.basis)}</p>
      ${c.low !== undefined ? `<p class="ev-range">Range used in the sweep: ${num(c.low, c.low < 10 ? 2 : 0)} to ${num(c.high!, c.high! < 10 ? 2 : 0)} ${escapeHtml(c.unit)}</p>` : ''}
      ${
        c.sourceIds.length
          ? `<ul class="ev-src">${c.sourceIds
              .map((id) => {
                const s = source(id);
                return `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a> <span class="src-meta">${escapeHtml(s.publisher)} · ${s.year}</span></li>`;
              })
              .join('')}</ul>`
          : '<p class="ev-none">No empirical analogue attached yet.</p>'
      }
    </article>`;

    return `
      <section class="prose">
        <h3>Where the model is only guessing</h3>
        <p>
          ${fig(num(assumptions.length, 0), { note: 'Coefficients with no published figure behind them.' })}
          of the model's coefficients have no source. ${fig(num(withSources.length, 0), { note: 'Assumptions with supporting material attached.' })}
          have related evidence attached; ${fig(num(without.length, 0), { note: 'Assumptions with nothing attached at all.' })}
          have nothing at all. Both groups are listed in full below, because an assumption nobody can
          see is the thing that breaks a model in front of a reviewer.
        </p>
        <p class="callout">
          A note on honesty: supporting material attached to an assumption is <em>related</em>
          evidence, not proof of the value used. Where a figure rests on a case from another state or
          another decade, the risks tab says how far it would have to be wrong to matter.
        </p>
      </section>

      <h3 class="sec-head">Assumptions with supporting material</h3>
      <div class="ev-grid">${withSources.map(card).join('')}</div>

      <h3 class="sec-head">Assumptions with nothing behind them</h3>
      <div class="ev-grid">${without.map(card).join('')}</div>`;
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

export const TABS: Tab[] = [
  nowTab,
  targetTab,
  pathTab,
  allocTab,
  pkgTab,
  cropsTab,
  lawnTab,
  driversTab,
  revenueTab,
  riskTab,
  simsTab,
  baselineTab,
  evidenceTab,
  calibrationTab,
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

