/**
 * Re-fetch every URL the model cites and report any that no longer resolve.
 *
 * Run with `npm run check-links`. A source that 404s is worse than no source at all, because
 * the page presents it as if a reader could go and check.
 */

import { SOURCES } from '../src/sources';
import { AREA_ANCHOR_SOURCE, BASELINES, COEFS, STAKEHOLDERS, VALUE_PER_AF, WATERING_MONTHS_SOURCE } from '../src/data';

interface Result {
  id: string;
  url: string;
  status: number | string;
  finalUrl?: string;
  ok: boolean;
  note?: string;
}

async function head(url: string): Promise<Result['status'] | { status: number; finalUrl: string }> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (link check; Utah Water Allocation Model)' },
      signal: AbortSignal.timeout(45_000),
    });
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return `error: ${(e as Error).message.slice(0, 80)}`;
  }
}

async function main(): Promise<void> {
  const results: Result[] = [];

  for (const s of SOURCES) {
    if (!s.url) {
      results.push({ id: s.id, url: '', status: 'missing', ok: false, note: 'no URL at all' });
      continue;
    }
    const r = await head(s.url);
    if (typeof r === 'string') {
      results.push({ id: s.id, url: s.url, status: r, ok: false });
    } else {
      results.push({
        id: s.id,
        url: s.url,
        status: r.status,
        finalUrl: r.finalUrl !== s.url ? r.finalUrl : undefined,
        ok: r.status >= 200 && r.status < 400,
      });
    }
  }

  // Every source must be referenced by something, and every reference must resolve to a source.
  const referenced = new Set([
    ...COEFS.flatMap((c) => c.sourceIds),
    ...STAKEHOLDERS.flatMap((s) => s.sourceIds),
    ...VALUE_PER_AF.flatMap((v) => v.sourceIds),
    ...BASELINES.flatMap((b) => b.sourceIds),
    AREA_ANCHOR_SOURCE,
    WATERING_MONTHS_SOURCE,
  ]);
  const known = new Set(SOURCES.map((s) => s.id));
  const orphanRefs = [...referenced].filter((id) => !known.has(id));
  const unusedSources = SOURCES.filter((s) => !referenced.has(s.id)).map((s) => s.id);

  const bad = results.filter((r) => !r.ok);
  const redirected = results.filter((r) => r.ok && r.finalUrl);

  console.log(`Checked ${results.length} sources.`);
  for (const r of results) {
    const mark = r.ok ? '  ok ' : 'FAIL ';
    console.log(`${mark} ${String(r.status).padEnd(22)} ${r.id.padEnd(20)} ${r.url}`);
    if (r.finalUrl) console.log(`       → redirects to ${r.finalUrl}`);
  }

  if (redirected.length) console.log(`\n${redirected.length} source(s) redirect; the link still works but the URL has moved.`);
  if (unusedSources.length) console.log(`\nSources cited by nothing: ${unusedSources.join(', ')}`);
  if (orphanRefs.length) {
    console.error(`\nCoefficients cite unknown source ids: ${orphanRefs.join(', ')}`);
    process.exitCode = 1;
  }
  if (bad.length) {
    console.error(`\n${bad.length} link(s) did not resolve:`);
    for (const r of bad) console.error(`  ${r.id}: ${r.status} ${r.url}`);
    process.exitCode = 1;
  } else {
    console.log('\nEvery cited link resolves.');
  }
}

void main();
