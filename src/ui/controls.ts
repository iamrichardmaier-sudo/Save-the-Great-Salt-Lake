/**
 * The dials. Each one declares the coefficient behind its default, so hovering or clicking a
 * control shows the same provenance panel as any number on the page.
 */

import { BASELINES, ENFORCEMENT_WINDOWS } from '../data';
import type { Dials } from '../model';
import { escapeHtml, millionsYr, num, pct, perAf } from './format';

export type ControlKind = 'range' | 'toggle' | 'select';

export interface Control {
  key: keyof Dials;
  label: string;
  kind: ControlKind;
  min?: number;
  max?: number;
  step?: number;
  /** How the current value reads to a person. */
  display: (v: never, d: Dials) => string;
  /** The coefficient the default comes from, for the provenance panel. */
  coef?: string;
  help: string;
  options?: { value: string; label: string }[];
  group: string;
  /** True when this dial currently does nothing, because something else is switched off. */
  inertWhen?: (d: Dials) => boolean;
  /** What to switch on so it does something. Shown to the reader, and used by the tests. */
  prereq?: Partial<Dials>;
  prereqHint?: string;
}

export const CONTROLS: Control[] = [
  // ── Budget
  {
    key: 'budgetM', label: 'Annual budget', kind: 'range', min: 25, max: 800, step: 5, group: 'Budget',
    display: (v: number) => millionsYr(v, 0), coef: 'budget',
    help: 'The brief sets this at $100M a year. Raise it and watch how little the lake notices once the ceiling binds.',
  },
  {
    key: 'monitoringM', label: 'Monitoring and verification', kind: 'range', min: 0, max: 50, step: 0.5, group: 'Budget',
    display: (v: number) => millionsYr(v, 1), coef: 'monitoring',
    help: 'Buys no water at all. It decides how much of everything else can be tracked and legally delivered to the lake.',
  },
  {
    key: 'leaseToOwnM', label: 'Money for lease-to-own rights', kind: 'range', min: 0, max: 100, step: 1, group: 'Budget',
    display: (v: number) => millionsYr(v, 0), coef: 'lease_to_own_dollars',
    help: 'Payments build ownership instead of renting the same water twice. What this does not absorb goes to the programmes.',
  },
  {
    key: 'capitalPricePerAf', label: 'Price of a water right', kind: 'range', min: 250, max: 9000, step: 50, group: 'Budget',
    display: (v: number) => perAf(v), coef: 'capital_price',
    help: 'Unresolved. Anchored to Colorado River buyouts, and contradicted by two Utah figures an order of magnitude lower.',
  },

  // ── Charges
  {
    key: 'scarcityRatePerAf', label: 'Scarcity charge on industry', kind: 'range', min: 0, max: 400, step: 5, group: 'Charges',
    display: (v: number) => perAf(v), coef: 'irrigation_net_value',
    help: 'Falls on every non-household use. It moves more water by changing behaviour than its revenue buys.',
  },
  {
    key: 'escalatorOn', label: 'Charge climbs while the lake is short', kind: 'toggle', group: 'Charges',
    display: (v: boolean) => (v ? 'on' : 'off'), coef: 'escalator_step',
    help: 'An escalating rate adds water at no measurable political cost, because nobody is ordered to do anything.',
    inertWhen: (d) => d.scarcityRatePerAf <= 0,
    prereq: { scarcityRatePerAf: 120 },
    prereqHint: 'Set a scarcity charge above zero and this starts to matter.',
  },
  {
    key: 'cropLevyPerAf', label: 'Crop levy rate', kind: 'range', min: 0, max: 400, step: 5, group: 'Charges',
    display: (v: number) => perAf(v), coef: 'hay_net_return',
    help: 'Charged only on water applied above the threshold, so it taxes over-watering rather than farming.',
  },
  {
    key: 'levyThresholdAfPerAcre', label: 'Crop levy applies above', kind: 'range', min: 1.5, max: 4, step: 0.1, group: 'Charges',
    display: (v: number) => `${num(v, 1)} AF/acre`, coef: 'application_mean',
    help: 'The threshold matters more than the rate. Basin hay averages 2.64 AF an acre, so a line at 3.5 catches the heaviest fields only.',
    inertWhen: (d) => d.cropLevyPerAf <= 0,
    prereq: { cropLevyPerAf: 200 },
    prereqHint: 'Set a crop levy rate above zero first.',
  },
  {
    key: 'levyToTransition', label: 'Levy money routed to transition', kind: 'range', min: 0, max: 1, step: 0.05, group: 'Charges',
    display: (v: number) => `${pct(v)} to transition, ${pct(1 - v)} to rights`,
    help: 'Levy receipts should fund crop-switching rebates. Spending them on rights as well counts the same dollars as both a price signal and a purchase.',
    inertWhen: (d) => d.cropLevyPerAf <= 0,
    prereq: { cropLevyPerAf: 200 },
    prereqHint: 'There is no levy money to route until the levy rate is above zero.',
  },

  // ── Mandate
  {
    key: 'mandateFloorKaf', label: 'Mandated cut, if the rest falls short', kind: 'range', min: 0, max: 1000, step: 25, group: 'Mandate',
    display: (v: number) => (v === 0 ? 'none' : `${num(v, 0)} KAF/yr floor`), coef: 'mandate_floor',
    help: 'A floor, not an order on top: it only takes what the voluntary levers did not already find.',
  },
  {
    key: 'mandatePhaseYears', label: 'Years to phase the mandate in', kind: 'range', min: 1, max: 25, step: 1, group: 'Mandate',
    display: (v: number) => `over ${num(v, 0)} years`, coef: 'mandate_phase',
    help: 'How long farms have to adjust before the floor bites in full.',
  },
  {
    key: 'mandatePenaltyPerAf', label: 'Penalty for not meeting the mandate', kind: 'range', min: 0, max: 2440, step: 20, group: 'Mandate',
    display: (v: number) => (v === 0 ? 'none' : perAf(v)), coef: 'mandate_penalty',
    help: 'The sharpest idea here. Price non-compliance at what the water is worth in the lake and coercion converts itself into transactions.',
  },
  {
    key: 'repossessOn', label: 'Repossess once willing sellers run out', kind: 'toggle', group: 'Mandate',
    display: (v: boolean) => (v ? 'on' : 'off'), coef: 'repossess_cap',
    help: 'Compulsory acquisition at market value, on the same instalment terms. It waits until the fund is free, so it needs its own appropriation to bite.',
    inertWhen: (d) => d.budgetM < 300 && d.scarcityRatePerAf <= 0,
    prereq: { budgetM: 500, leaseToOwnM: 100, scarcityRatePerAf: 200 },
    prereqHint: 'Willing sellers have to run out first. That needs a bigger budget, or a charge that lowers the price of a right.',
  },
  {
    key: 'repossessCapKaf', label: 'Most repossessed in a year', kind: 'range', min: 0, max: 150, step: 5, group: 'Mandate',
    display: (v: number) => `${num(v, 0)} KAF/yr`, coef: 'repossess_cap',
    help: 'A legal and administrative limit as much as a policy choice.',
    inertWhen: (d) => !d.repossessOn,
    prereq: { repossessOn: true, budgetM: 500, leaseToOwnM: 100, scarcityRatePerAf: 200 },
    prereqHint: 'Switch repossession on first.',
  },

  // ── Programmes
  {
    key: 'cropSwitchM', label: 'Crop switching', kind: 'range', min: 0, max: 60, step: 0.5, group: 'Programmes',
    display: (v: number) => millionsYr(v, 1), coef: 'crop_cost',
    help: 'Pays farms to move off alfalfa onto lower-water crops.',
  },
  {
    key: 'phragM', label: 'Phragmites removal', kind: 'range', min: 0, max: 25, step: 0.5, group: 'Programmes',
    display: (v: number) => millionsYr(v, 1), coef: 'phrag_cost',
    help: 'The highest delivery of anything here, because the water is freed below every diversion. It arrives three years late.',
  },
  {
    key: 'cloudM', label: 'Cloud seeding', kind: 'range', min: 0, max: 10, step: 0.1, group: 'Programmes',
    display: (v: number) => millionsYr(v, 1), coef: 'cloud_cost',
    help: 'The cheapest water on the list, and the one with the least evidence behind its capacity.',
  },

  // ── Lawns
  {
    key: 'lawnCutAsked', label: 'Watering cut asked of households', kind: 'range', min: 0, max: 0.5, step: 0.05, group: 'Residential lawns',
    display: (v: number) => (v === 0 ? 'no limit' : `${pct(v)} less lawn water`), coef: 'lawn_water',
    help: 'The limit applies all season. The enforcement calendar below only controls when citations are written.',
  },
  {
    key: 'enforcementWindowId', label: 'Months citations are written', kind: 'select', group: 'Residential lawns',
    display: (v: string) => ENFORCEMENT_WINDOWS.find((w) => w.id === v)?.label ?? v,
    options: ENFORCEMENT_WINDOWS.map((w) => ({ value: w.id, label: w.label })),
    help: 'Covering fewer months means fewer citations, so compliance falls even though the rule has not changed.',
    inertWhen: (d) => d.lawnCutAsked <= 0,
    prereq: { lawnCutAsked: 0.2, citationsPerThousandJuly: 4 },
    prereqHint: 'Ask households for a cut first; with no limit there is nothing to cite.',
  },
  {
    key: 'citationsPerThousandJuly', label: 'Citations per thousand people in July', kind: 'range', min: 0, max: 20, step: 0.1, group: 'Residential lawns',
    display: (v: number) => `${num(v, 1)} per 1,000 people`, coef: 'season_value',
    help: 'This is the dial that moves compliance. A watering ordinance is an enforcement-budget question, not a penalty-schedule question.',
    inertWhen: (d) => d.lawnCutAsked <= 0,
    prereq: { lawnCutAsked: 0.2 },
    prereqHint: 'Ask households for a cut first; with no limit there is nothing to cite.',
  },
  {
    key: 'finePerViolation', label: 'Fine per violation', kind: 'range', min: 0, max: 1000, step: 25, group: 'Residential lawns',
    display: (v: number) => `${num(v, 0)} a citation`, coef: 'season_value',
    help: 'Quadrupling the fine buys a few points of compliance. Multiplying the citation rate buys dozens.',
    inertWhen: (d) => d.lawnCutAsked <= 0 || d.citationsPerThousandJuly <= 0,
    prereq: { lawnCutAsked: 0.2, citationsPerThousandJuly: 4 },
    prereqHint: 'A fine only matters if citations are written. Ask for a cut and set a citation rate.',
  },

  // ── Context
  {
    key: 'baselineId', label: 'Baseline climate', kind: 'select', group: 'Context',
    display: (v: string) => BASELINES.find((b) => b.id === v)?.label ?? v,
    options: BASELINES.map((b) => ({ value: b.id, label: b.label })),
    help: 'What "the gap" means depends on which climate you measure it against. The goal is computed from this, never fixed.',
  },
  {
    key: 'horizon', label: 'Horizon', kind: 'range', min: 2035, max: 2075, step: 1, group: 'Context',
    display: (v: number) => String(v),
    help: 'How far out to run the model.',
  },
  {
    key: 'longDrought', label: 'Allow a multi-decade drought', kind: 'toggle', group: 'Context',
    display: (v: boolean) => (v ? 'on' : 'off'), coef: 'fat_tail_factor',
    help: 'Deepens the dry tail of the simulated sequences, rather than simply widening the band.',
  },
];

export function renderControl(c: Control, d: Dials): string {
  const value = d[c.key] as never;
  const id = `ctl-${String(c.key)}`;
  const display = c.display(value, d);
  const inert = c.inertWhen?.(d) ?? false;
  const head = `
    <div class="ctl-head">
      <label for="${id}">${escapeHtml(c.label)}</label>
      <button type="button" class="ctl-why" data-help="${String(c.key)}" aria-label="Why this dial matters">?</button>
    </div>
    <output class="ctl-value" for="${id}">${escapeHtml(display)}</output>
    ${inert ? `<p class="ctl-inert">Does nothing yet. ${escapeHtml(c.prereqHint ?? '')}${c.prereq ? ` <button type="button" class="ctl-enable" data-enable="${String(c.key)}">Switch it on</button>` : ''}</p>` : ''}`;

  if (c.kind === 'toggle') {
    return `<div class="ctl ctl-toggle ${inert ? 'is-inert' : ''}" data-key="${String(c.key)}">
      ${head}
      <input type="checkbox" id="${id}" data-dial="${String(c.key)}" ${value ? 'checked' : ''}>
    </div>`;
  }
  if (c.kind === 'select') {
    return `<div class="ctl ${inert ? 'is-inert' : ''}" data-key="${String(c.key)}">
      ${head}
      <select id="${id}" data-dial="${String(c.key)}">
        ${(c.options ?? []).map((o) => `<option value="${escapeHtml(o.value)}" ${o.value === (value as unknown as string) ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
      </select>
    </div>`;
  }
  return `<div class="ctl ${inert ? 'is-inert' : ''}" data-key="${String(c.key)}">
    ${head}
    <input type="range" id="${id}" data-dial="${String(c.key)}" min="${c.min}" max="${c.max}" step="${c.step}" value="${value as unknown as number}">
  </div>`;
}

export function controlsByGroup(d: Dials, groups: string[]): string {
  return groups
    .map((g) => {
      const items = CONTROLS.filter((c) => c.group === g);
      if (!items.length) return '';
      return `<section class="ctl-group">
        <h4>${escapeHtml(g)}</h4>
        <div class="ctl-grid">${items.map((c) => renderControl(c, d)).join('')}</div>
      </section>`;
    })
    .join('');
}

export function controlHelp(key: string): Control | undefined {
  return CONTROLS.find((c) => String(c.key) === key);
}
