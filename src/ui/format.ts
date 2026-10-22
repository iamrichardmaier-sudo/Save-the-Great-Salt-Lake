/**
 * Numbers on screen, and where each one came from.
 *
 * Nothing in this app prints a bare number. Every figure goes through `fig()`, which attaches
 * the coefficient or formula behind it, so a reader can click any value and see its basis, its
 * range, whether it is an assumption, and a link to the source.
 */

import { coef, coefSources, type Coef } from '../data';
import { source, type Source } from '../sources';

// ───────────────────────── Number formatting ─────────────────────────

const nf = (digits: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function num(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '—';
  return nf(digits).format(value);
}

export function kaf(value: number, digits = 0): string {
  return `${num(value, digits)} KAF`;
}

export function kafYr(value: number, digits = 0): string {
  return `${num(value, digits)} KAF/yr`;
}

export function money(value: number, digits = 0): string {
  return `$${num(value, digits)}`;
}

/** Dollars in millions, written the way the budget is discussed. */
export function millions(value: number, digits = 1): string {
  if (Math.abs(value) >= 1000) return `$${num(value / 1000, 2)}B`;
  return `$${num(value, digits)}M`;
}

export function millionsYr(value: number, digits = 1): string {
  return `${millions(value, digits)}/yr`;
}

/** A dollar figure that may be enormous, written short. */
export function dollarsShort(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${num(value / 1e9, 1)}B`;
  if (abs >= 1e6) return `$${num(value / 1e6, 1)}M`;
  if (abs >= 1e3) return `$${num(value / 1e3, 0)}k`;
  return `$${num(value, 0)}`;
}

export function pct(share: number, digits = 0): string {
  if (!Number.isFinite(share)) return '—';
  return `${num(share * 100, digits)}%`;
}

export function feet(value: number, digits = 1): string {
  return `${num(value, digits)} ft`;
}

export function perAf(value: number, digits = 0): string {
  return `${money(value, digits)}/AF`;
}

export function years(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return 'never';
  return `${num(value, digits)} years`;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

// ───────────────────────── Provenance ─────────────────────────

export interface Provenance {
  /** A coefficient id from data.ts. */
  coef?: string;
  /** For a computed figure: how it was worked out. */
  formula?: string;
  /** Plain words about what this number is. */
  note?: string;
  /** Extra sources beyond the coefficient's own. */
  sourceIds?: string[];
  /** Mark a computed figure as resting on assumptions. */
  assumed?: boolean;
}

let provCounter = 0;
const PROV = new Map<string, { text: string; p: Provenance }>();

/**
 * Render a value with its provenance attached. The warning mark appears wherever the number
 * rests on an assumption, every time that number is shown.
 */
export function fig(text: string, p: Provenance = {}): string {
  const id = `p${++provCounter}`;
  PROV.set(id, { text, p });
  const c = p.coef ? coef(p.coef) : undefined;
  const isAssumption = p.assumed ?? c?.status === 'assumption';
  const isDerived = !isAssumption && (p.formula !== undefined || c?.status === 'derived');
  const cls = isAssumption ? 'fig fig-assumed' : isDerived ? 'fig fig-derived' : 'fig fig-sourced';
  const mark = isAssumption
    ? '<span class="fig-mark" aria-label="assumption">⚠</span>'
    : isDerived
      ? '<span class="fig-mark fig-mark-derived" aria-label="derived">ƒ</span>'
      : '<span class="fig-mark fig-mark-sourced" aria-label="sourced">°</span>';
  const label = isAssumption ? 'assumption' : isDerived ? 'derived figure' : 'sourced figure';
  return `<button type="button" class="${cls}" data-prov="${id}" aria-label="${escapeHtml(text)}, ${label}. Show where this number comes from.">${escapeHtml(text)}${mark}</button>`;
}

/** Plain text with provenance, for labels that are not themselves numbers. */
export function tag(text: string, p: Provenance = {}): string {
  return fig(text, p);
}

export function lookupProvenance(id: string): { text: string; p: Provenance } | undefined {
  return PROV.get(id);
}

export function resetProvenance(): void {
  PROV.clear();
  provCounter = 0;
}

function sourceLink(s: Source): string {
  return `<li class="src">
    <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a>
    <span class="src-meta">${escapeHtml(s.publisher)} · ${s.year}</span>
    ${s.locator ? `<span class="src-loc">${escapeHtml(s.locator)}</span>` : ''}
  </li>`;
}

const STATUS_WORD: Record<string, string> = {
  sourced: 'Published figure',
  derived: 'Worked out from other figures',
  assumption: 'Assumption — no source behind it',
};

/** The panel shown when a reader clicks a number. */
export function provenanceHtml(id: string): string {
  const entry = PROV.get(id);
  if (!entry) return '<p>No record for this figure.</p>';
  const { text, p } = entry;
  const c: Coef | undefined = p.coef ? coef(p.coef) : undefined;
  const sources: Source[] = [
    ...(p.coef ? coefSources(p.coef) : []),
    ...(p.sourceIds ?? []).map(source),
  ].filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);

  const status = c?.status ?? (p.assumed ? 'assumption' : p.formula ? 'derived' : 'sourced');

  const rangeRow =
    c && c.low !== undefined && c.high !== undefined
      ? `<div class="prov-row"><dt>Plausible range</dt><dd>${num(c.low, c.low < 10 ? 2 : 0)} to ${num(c.high, c.high < 10 ? 2 : 0)} ${escapeHtml(c.unit)}</dd></div>`
      : '';

  return `
    <div class="prov">
      <div class="prov-head">
        <span class="prov-value">${escapeHtml(text)}</span>
        <span class="prov-status prov-status-${status}">${STATUS_WORD[status]}</span>
      </div>
      ${c ? `<p class="prov-label">${escapeHtml(c.label)}</p>` : ''}
      <dl>
        ${c ? `<div class="prov-row"><dt>Basis</dt><dd>${escapeHtml(c.basis)}</dd></div>` : ''}
        ${p.note ? `<div class="prov-row"><dt>What it is</dt><dd>${escapeHtml(p.note)}</dd></div>` : ''}
        ${p.formula ? `<div class="prov-row"><dt>Worked out as</dt><dd class="mono">${escapeHtml(p.formula)}</dd></div>` : ''}
        ${c?.formula ? `<div class="prov-row"><dt>Worked out as</dt><dd class="mono">${escapeHtml(c.formula)}</dd></div>` : ''}
        ${rangeRow}
        ${c?.confidence ? `<div class="prov-row"><dt>Confidence</dt><dd>${c.confidence}</dd></div>` : ''}
        ${c?.note ? `<div class="prov-row"><dt>Caveat</dt><dd>${escapeHtml(c.note)}</dd></div>` : ''}
      </dl>
      ${
        sources.length
          ? `<p class="prov-src-head">Sources</p><ul class="prov-src">${sources.map(sourceLink).join('')}</ul>`
          : '<p class="prov-none">No source. This figure is an assumption, and the model is only as good as it.</p>'
      }
    </div>`;
}

/** A coefficient rendered straight from the table, with its own units. */
export function figCoef(id: string, digits?: number, transform?: (v: number) => string): string {
  const c = coef(id);
  const text = transform ? transform(c.value) : `${num(c.value, digits ?? (Math.abs(c.value) < 10 ? 2 : 0))} ${c.unit}`;
  return fig(text, { coef: id });
}
