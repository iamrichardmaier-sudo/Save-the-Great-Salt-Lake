// @vitest-environment jsdom
/**
 * Rendering tests.
 *
 * Two failures this catches that reading the code does not: a tab that throws while drawing, and
 * a control that produces no visible change when a person moves it. Both present as a page that
 * looks fine and quietly does nothing.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_DIALS, pkgModel, type Dials } from './model';
import { sensitivity, simulate } from './simulate';
import { fullSpendSchedule, type ScheduleResult } from './schedule';
import { TABS, headerSummary, type Ctx } from './ui/tabs';
import { CONTROLS } from './ui/controls';
import { resetProvenance } from './ui/format';

function ctxFor(over: Partial<Dials> = {}): Ctx {
  const d = { ...DEFAULT_DIALS, ...over };
  const r = pkgModel(d);
  let plan: ScheduleResult | undefined;
  // A coarse step and no search for the goal weight keep the render suite quick.
  const schedule = () => (plan ??= fullSpendSchedule(d, { stepM: 5, iterations: 0, maxLambda: 0 }));
  return { d, r, sim: simulate(r, { runs: 40, seed: 5 }), tornado: sensitivity(d, 6), schedule };
}

let host: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = '<div id="host"></div>';
  host = document.getElementById('host')!;
  resetProvenance();
});

describe('every tab renders and mounts', () => {
  const ctx = ctxFor();
  for (const tab of TABS) {
    it(`${tab.label} renders`, () => {
      const html = tab.render(ctx);
      expect(html.length).toBeGreaterThan(200);
      host.innerHTML = html;
      expect(() => tab.mount?.(host, ctx)).not.toThrow();
    });

    it(`${tab.label} leaves no unresolved template`, () => {
      const html = tab.render(ctx);
      expect(html).not.toContain('undefined');
      expect(html).not.toContain('NaN');
      expect(html).not.toContain('[object Object]');
    });
  }

  it('draws an svg wherever it promises a chart', () => {
    for (const tab of TABS) {
      resetProvenance();
      host.innerHTML = tab.render(ctx);
      tab.mount?.(host, ctx);
      for (const box of host.querySelectorAll('.chart')) {
        expect(box.querySelector('svg'), `${tab.label}: chart ${box.id} drew nothing`).not.toBeNull();
      }
    }
  });
});

describe('the page holds together at the extremes', () => {
  const extremes: Partial<Dials>[] = [
    { budgetM: 25, monitoringM: 0, leaseToOwnM: 0, cloudM: 0, phragM: 0, cropSwitchM: 0, mandateFloorKaf: 0 },
    { budgetM: 800, monitoringM: 50, leaseToOwnM: 100, scarcityRatePerAf: 400, cropLevyPerAf: 400 },
    { lawnCutAsked: 0.5, citationsPerThousandJuly: 20, finePerViolation: 1000 },
    { mandateFloorKaf: 1000, mandatePenaltyPerAf: 2440, repossessOn: true },
    { horizon: 2035 },
    { baselineId: 'warming', longDrought: true },
  ];
  for (const over of extremes) {
    it(`renders with ${JSON.stringify(over).slice(0, 60)}`, () => {
      const ctx = ctxFor(over);
      for (const tab of TABS) {
        resetProvenance();
        const html = tab.render(ctx);
        expect(html).not.toContain('NaN');
        expect(html).not.toContain('undefined');
        host.innerHTML = html;
        expect(() => tab.mount?.(host, ctx), `${tab.label} threw`).not.toThrow();
      }
      // The year-by-year budget at $800M takes a few seconds to build.
    }, 60_000);
  }
});

describe('the header summary', () => {
  it('describes the same scenario the package tab does', () => {
    const ctx = ctxFor();
    const summary = headerSummary(ctx.r);
    const pkg = TABS.find((t) => t.id === 'pkg')!.render(ctx);
    // The net-to-lake figure appears in both, so they cannot drift apart.
    const net = Math.round(ctx.r.final.netToLakeKaf).toLocaleString('en-US');
    expect(summary).toContain(net);
    expect(pkg).toContain(net);
  });

  it('adapts when a lever is switched off rather than printing a zero', () => {
    const off = ctxFor({ mandateFloorKaf: 0, scarcityRatePerAf: 0, cropLevyPerAf: 0, lawnCutAsked: 0 });
    const pkg = TABS.find((t) => t.id === 'pkg')!.render(off);
    expect(pkg).toContain('off');
    expect(pkg).toContain('no limit');
  });
});

describe('every control actually changes something', () => {
  // Drift between the controls and the model is silent: the dial moves and nothing happens.
  // A control whose prerequisite is off is tested with that prerequisite switched on, which is
  // what a person would do; the page tells them so rather than leaving the dial dead.
  const fingerprint = (d: Dials) => {
    const r = pkgModel(d);
    const sim = simulate(r, { runs: 20, seed: 2 });
    return JSON.stringify([
      r.final.netToLakeKaf,
      r.final.elevationFt,
      r.final.forcedKaf,
      r.final.rightsHeldKaf,
      r.support.weakest.score,
      r.final.chargeRevenueM,
      r.lawn.compliance,
      r.levy.waterKaf,
      r.years.length,
      r.goalKaf,
      sim.p10[sim.p10.length - 1],
      sim.shareHealthy,
      // The path, not just the endpoint: a dial that changes how fast the lake recovers is
      // doing something a reader can see, even where the ceiling fixes where it ends up.
      r.years[Math.floor(r.years.length / 3)]?.netToLakeKaf,
      r.years[Math.floor(r.years.length / 3)]?.repossessedKaf,
      r.years[Math.floor(r.years.length / 2)]?.elevationFt,
    ]);
  };

  for (const c of CONTROLS) {
    it(`${c.label} moves the model`, () => {
      const start: Dials = { ...DEFAULT_DIALS, ...(c.prereq ?? {}) };
      const baseFingerprint = fingerprint(start);
      const dials: Dials = { ...start };
      const key = c.key;
      if (c.kind === 'toggle') {
        (dials as unknown as Record<string, unknown>)[key as string] = !start[key];
      } else if (c.kind === 'select') {
        const opts = c.options ?? [];
        const other = opts.find((o) => o.value !== (start[key] as unknown as string));
        expect(other, `${c.label} has no alternative option`).toBeTruthy();
        (dials as unknown as Record<string, unknown>)[key as string] = other!.value;
      } else {
        const current = start[key] as unknown as number;
        const target = Math.abs(current - c.max!) > Math.abs(current - c.min!) ? c.max! : c.min!;
        (dials as unknown as Record<string, unknown>)[key as string] = target;
      }
      expect(fingerprint(dials), `moving "${c.label}" changed nothing in the model`).not.toBe(baseFingerprint);
    });

    it(`${c.label} says so when it currently does nothing`, () => {
      // A dial that is inert at the defaults must declare it, so the page can tell the reader
      // instead of letting them drag a control that quietly has no effect.
      const inertAtDefaults = fingerprint({ ...DEFAULT_DIALS }) === fingerprint(
        (() => {
          const d: Dials = { ...DEFAULT_DIALS };
          const key = c.key;
          if (c.kind === 'toggle') (d as unknown as Record<string, unknown>)[key as string] = !DEFAULT_DIALS[key];
          else if (c.kind === 'select') {
            const other = (c.options ?? []).find((o) => o.value !== (DEFAULT_DIALS[key] as unknown as string));
            if (other) (d as unknown as Record<string, unknown>)[key as string] = other.value;
          } else {
            const cur = DEFAULT_DIALS[key] as unknown as number;
            (d as unknown as Record<string, unknown>)[key as string] =
              Math.abs(cur - c.max!) > Math.abs(cur - c.min!) ? c.max! : c.min!;
          }
          return d;
        })(),
      );
      if (inertAtDefaults) {
        expect(c.inertWhen?.({ ...DEFAULT_DIALS }), `"${c.label}" does nothing at the defaults but does not say so`).toBe(true);
      }
    });
  }

  it('has a control for every dial a person should be able to set', () => {
    const exposed = new Set(CONTROLS.map((c) => String(c.key)));
    const internal = new Set(['startYear', 'repossessInterest']);
    for (const key of Object.keys(DEFAULT_DIALS)) {
      if (internal.has(key)) continue;
      expect(exposed.has(key), `dial "${key}" has no control`).toBe(true);
    }
  });

  it('starts every control inside its own range', () => {
    for (const c of CONTROLS) {
      if (c.kind !== 'range') continue;
      const v = DEFAULT_DIALS[c.key] as unknown as number;
      expect(v, `${c.label} starts below its minimum`).toBeGreaterThanOrEqual(c.min!);
      expect(v, `${c.label} starts above its maximum`).toBeLessThanOrEqual(c.max!);
    }
  });
});

describe('provenance', () => {
  it('attaches a source or a basis to every figure on the package tab', () => {
    resetProvenance();
    const ctx = ctxFor();
    const html = TABS.find((t) => t.id === 'pkg')!.render(ctx);
    host.innerHTML = html;
    const figs = host.querySelectorAll('.fig');
    expect(figs.length).toBeGreaterThan(30);
    for (const f of figs) {
      expect(f.getAttribute('data-prov')).toBeTruthy();
    }
  });

  it('marks assumptions wherever they appear', () => {
    resetProvenance();
    const ctx = ctxFor();
    host.innerHTML = TABS.find((t) => t.id === 'pkg')!.render(ctx);
    expect(host.querySelectorAll('.fig-assumed').length).toBeGreaterThan(0);
  });
});
