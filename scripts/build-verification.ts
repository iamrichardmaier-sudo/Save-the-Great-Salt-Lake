/**
 * Turn the research records into the model's citations.
 *
 * Reads research/verification/results/*.json (one record per coefficient or table row, written by
 * the research pass) and research/verification/decisions.json (the reviewer's call on each change,
 * made after re-opening the source), and writes two generated files:
 *
 *   src/research-sources.ts  every source the research opened that src/sources.ts did not list
 *   src/verification.ts      one record per coefficient: verdict, source, locator, quote, date
 *
 * Run with `npm run verification`. Values in src/data.ts are changed by hand from decisions.json,
 * never by this script, so a reviewer always sees the change in the diff.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

interface ExtraSource { title?: string; publisher?: string; year?: number; url?: string; quote?: string; locator?: string }
interface ResearchRecord {
  id: string;
  value_model: number | string | null;
  verdict: string;
  value_new: number | null;
  low_new: number | null;
  high_new: number | null;
  quote: string;
  locator: string;
  url: string;
  source_title: string;
  publisher: string;
  year: number | null;
  extra_sources: ExtraSource[] | null;
  arithmetic: string;
  notes: string;
  confidence: string;
}
interface Decision { action: string; value?: number; low?: number; high?: number; why: string; reviewed: string }

const root = new URL('../', import.meta.url);
const dir = new URL('research/verification/', root);
const records: ResearchRecord[] = readdirSync(new URL('results/', dir))
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(readFileSync(new URL(`results/${f}`, dir), 'utf8')) as ResearchRecord[]);
const decisions: Record<string, Decision> = JSON.parse(readFileSync(new URL('decisions.json', dir), 'utf8'));

// Sources the model already lists, by URL, so a record citing one reuses its id.
const sourcesTs = readFileSync(new URL('src/sources.ts', root), 'utf8');
const known = new Map<string, string>();
for (const m of sourcesTs.matchAll(/id: '([^']+)',[\s\S]*?url: '([^']+)'/g)) known.set(m[2], m[1]);
const knownIds = new Set(known.values());

const slug = (url: string) => {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, '').split('.').slice(0, -1).join('_') || u.hostname;
  const tail = (u.pathname.split('/').filter(Boolean).pop() ?? '').replace(/\.[a-z]+$/i, '');
  return `r_${host}_${tail}`.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/_+/g, '_').slice(0, 48).replace(/_$/, '');
};

interface NewSource { id: string; title: string; publisher: string; year: number; url: string; use: string }
const added = new Map<string, NewSource>();
const ids = new Set(knownIds);

/** The source id for a URL, adding a research source the first time it is seen. */
function sourceId(url: string | undefined, meta: { title?: string; publisher?: string; year?: number | null }, use: string): string | null {
  if (!url) return null;
  const cited = url.match(/cited source ([a-z0-9_]+)/);
  if (cited && knownIds.has(cited[1])) return cited[1];
  if (!/^https?:\/\//.test(url) || /[{}|\s]/.test(url)) return null;
  if (known.has(url)) return known.get(url)!;
  if (added.has(url)) return added.get(url)!.id;
  let id = slug(url);
  for (let n = 2; ids.has(id); n++) id = `${slug(url).slice(0, 44)}_${n}`;
  ids.add(id);
  added.set(url, {
    id,
    title: (meta.title || url).slice(0, 200),
    publisher: (meta.publisher || new URL(url).hostname).slice(0, 120),
    year: meta.year && meta.year > 1800 ? meta.year : new Date().getFullYear(),
    url,
    use,
  });
  return id;
}

/** The final verdict: the research verdict, overridden by what the reviewer did with it. */
function finalVerdict(r: ResearchRecord, d: Decision | undefined): string {
  if (!d) return r.verdict;
  switch (d.action) {
    case 'accept':
    case 'accept_with_check':
    case 'accept_as_assumption':
      return d.value !== undefined ? 'corrected' : r.verdict;
    case 'accept_range':
      return 'range revised';
    case 'relabel_assumption':
      return r.verdict === 'evidence' ? 'evidence' : 'unsupported';
    case 'relabel_derived':
      return 'derived';
    case 'relabel_sourced':
    case 'confirm_with_caveat':
    case 'fix_citation':
      return 'confirmed';
    case 'defer':
      return 'open';
    default:
      return r.verdict;
  }
}

const clean = (s: string | null | undefined, n: number) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

const out = records.map((r) => {
  const d = decisions[r.id];
  const primary = sourceId(r.url, { title: r.source_title, publisher: r.publisher, year: r.year }, `Checked for ${r.id}.`);
  const extra = (r.extra_sources ?? [])
    .map((e) => ({ id: sourceId(e.url, e, `Evidence for ${r.id}.`), locator: clean(e.locator, 200), quote: clean(e.quote, 400) }))
    .filter((e) => e.id);
  const changed = d?.value !== undefined && (typeof r.value_model === 'number' || r.value_model === null) && d.value !== r.value_model;
  return {
    id: r.id,
    verdict: finalVerdict(r, d).replace('_', ' '),
    checked: d?.reviewed ?? '2026-10-23',
    reviewed: Boolean(d),
    sourceIds: [primary, ...extra.map((e) => e.id)].filter((x): x is string => Boolean(x)).filter((x, i, a) => a.indexOf(x) === i),
    locator: clean(r.locator, 240),
    quote: clean(r.quote, 500),
    arithmetic: clean(r.arithmetic, 600),
    notes: clean(d?.why ?? r.notes, 900),
    confidence: r.confidence,
    ...(changed ? { previous: typeof r.value_model === 'number' ? { value: r.value_model } : {} } : {}),
    ...(d?.value !== undefined ? { value: d.value } : {}),
    extra,
  };
});

const header = (what: string) =>
  `/**\n * ${what}\n *\n * GENERATED by scripts/build-verification.ts from research/verification/. Do not edit by hand:\n * change the research records or decisions.json and run \`npm run verification\`.\n */\n\n`;

writeFileSync(
  new URL('src/research-sources.ts', root),
  `${header('Sources opened while verifying the model, beyond those src/sources.ts lists by hand.')}import type { Source } from './sources';\n\nexport const RESEARCH_SOURCES: Source[] = ${JSON.stringify([...added.values()], null, 2)};\n`,
);

writeFileSync(
  new URL('src/verification.ts', root),
  `${header('How every number in the model was checked: the verdict, the source and the passage behind it.')}export type Verdict =\n  | 'confirmed'\n  | 'corrected'\n  | 'range revised'\n  | 'derived'\n  | 'evidence'\n  | 'unsupported'\n  | 'no evidence'\n  | 'open';\n\nexport interface Verification {\n  id: string;\n  verdict: Verdict;\n  /** ISO date the passage was checked. */\n  checked: string;\n  /** True when a reviewer re-opened the source before accepting the change. */\n  reviewed: boolean;\n  sourceIds: string[];\n  locator: string;\n  quote: string;\n  arithmetic: string;\n  notes: string;\n  confidence: string;\n  previous?: { value?: number };\n  /** The value the reviewer accepted, when it was changed. */\n  value?: number;\n  extra: { id: string | null; locator: string; quote: string }[];\n}\n\nexport const VERIFICATION: Record<string, Verification> = ${JSON.stringify(Object.fromEntries(out.filter((o) => !o.id.includes('/')).map((o) => [o.id, o])), null, 2)};\n\n/** Rows of the side tables (BASELINES, CONSUMERS, VALUE_PER_AF, …) and the source list, keyed \`TABLE/row\`. */\nexport const TABLE_VERIFICATION: Record<string, Verification> = ${JSON.stringify(Object.fromEntries(out.filter((o) => o.id.includes('/')).map((o) => [o.id, o])), null, 2)};\n\nexport function verification(id: string): Verification | undefined {\n  return VERIFICATION[id] ?? TABLE_VERIFICATION[id];\n}\n`,
);

console.log(`${out.length} records (${out.filter((o) => o.id.includes('/')).length} table rows), ${added.size} new sources.`);
