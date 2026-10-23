import { describe, expect, it } from 'vitest';
import { TABLE_VERIFICATION, VERIFICATION } from './verification';
import {
  chargeModel,
  DEFAULT_DIALS,
  expectedExcess,
  lawnModel,
  levyModel,
  normalCdf,
  pkgModel,
  reconcile,
  seasonCoverage,
  type Dials,
} from './model';
import {
  AREA_ANCHOR_SOURCE,
  BASELINES,
  COEFS,
  CONSUMERS,
  LEGAL_ASSUMPTIONS,
  STAKEHOLDERS,
  VALUE_PER_AF,
  V,
  WATERING_MONTHS_SOURCE,
  coefSources,
  withCoefs,
} from './data';
import { SOURCES } from './sources';
import { budgetSweep, mulberry32, optimise, scorePackage, SEARCH_SPACE, sensitivity, simulate } from './simulate';

const base = pkgModel();

/**
 * The package the defaults held before the goal search: no levy, no repossession, a slow mandate.
 * The mechanism tests below (what binds, what a penalty does) are pinned to it, because the goal
 * package sits at the edge of several dials at once and would test the edge rather than the mechanism.
 */
const REF: Partial<Dials> = {
  monitoringM: 25,
  leaseToOwnM: 30,
  scarcityRatePerAf: 0,
  escalatorOn: false,
  cropLevyPerAf: 0,
  levyThresholdAfPerAcre: 2,
  levyToTransition: 1,
  mandateFloorKaf: 1100,
  mandatePhaseYears: 10,
  repossessOn: false,
  repossessCapKaf: 50,
  phragM: 10.5,
  cropSwitchM: 24,
};

describe('the reconciliation checks all pass at the defaults', () => {
  for (const check of reconcile(base)) {
    it(check.label, () => {
      expect(check.ok, `${check.detail} (${check.lhs} vs ${check.rhs})`).toBe(true);
    });
  }
});

describe('the reconciliation checks pass wherever the dials are put', () => {
  const variants: Partial<Dials>[] = [
    { scarcityRatePerAf: 120, escalatorOn: true },
    { cropLevyPerAf: 200, levyThresholdAfPerAcre: 2 },
    { lawnCutAsked: 0.3, citationsPerThousandJuly: 8, finePerViolation: 500 },
    { mandateFloorKaf: 0 },
    { mandateFloorKaf: 1200, mandatePenaltyPerAf: 2440 },
    { repossessOn: true, budgetM: 400 },
    { budgetM: 25, monitoringM: 0, leaseToOwnM: 0 },
    { baselineId: 'warming' },
    { baselineId: 'long', horizon: 2040 },
  ];
  for (const v of variants) {
    it(`holds for ${JSON.stringify(v)}`, () => {
      for (const check of reconcile(pkgModel(v))) {
        expect(check.ok, `${check.label}: ${check.lhs} vs ${check.rhs}`).toBe(true);
      }
    });
  }
});

describe('units and conversions', () => {
  it('reports lawn depth consistent with area and volume', () => {
    const lawn = lawnModel(DEFAULT_DIALS);
    const acreFeet = (lawn.lawnAcres * lawn.inchesApplied) / 12;
    expect(acreFeet / 1000).toBeCloseTo(V('lawn_water'), 1);
  });

  it('implies a plausible number of people', () => {
    const implied = (V('basin_lawns') * V('people_per_home')) / (V('share_in_basin') * V('share_with_lawn'));
    expect(implied).toBeGreaterThan(2.5e6);
    expect(implied).toBeLessThan(6e6);
  });

  it('has depletion by user summing to the basin total', () => {
    const sum = CONSUMERS.reduce((s, c) => s + c.kaf, 0);
    expect(sum).toBeCloseTo(V('basin_depletion'), 0);
  });

  it('has the charge base equal to the sectors it falls on', () => {
    expect(V('ag_depletion') + V('mi_depletion')).toBeCloseTo(V('charge_base'), 6);
  });

  it('never charges a residential category', () => {
    const chargedKaf = CONSUMERS.filter((c) => c.charged).reduce((s, c) => s + c.kaf, 0);
    expect(chargedKaf).toBeCloseTo(V('charge_base'), 0);
    expect(CONSUMERS.filter((c) => c.id.startsWith('residential')).every((c) => !c.charged)).toBe(true);
  });
});

describe('the scarcity charge', () => {
  it('buys more water with its revenue than it changes through behaviour', () => {
    // With irrigation water worth $236/AF depleted to a farm (Ag Optimization report, Table B-8)
    // and leases at $250/AF, a $40 charge changes behaviour on about 114 KAF but raises enough to
    // lease about 290 KAF. The revenue is the larger half, so where the money goes matters.
    const c = chargeModel(40);
    const boughtWithRevenue = (c.revenueM * 1e6) / V('lease_base_rate') / 1000;
    expect(c.behaviouralKaf).toBeGreaterThan(0);
    expect(boughtWithRevenue).toBeGreaterThan(c.behaviouralKaf);
    expect(c.behaviouralKaf / boughtWithRevenue).toBeLessThan(0.6);
  });

  it('erodes its own base as users respond', () => {
    expect(chargeModel(200).baseAfterResponse).toBeLessThan(chargeModel(0).baseAfterResponse);
  });

  it('raises nothing at a rate of nothing', () => {
    expect(chargeModel(0).revenueM).toBe(0);
    expect(chargeModel(0).behaviouralKaf).toBe(0);
  });

  it('never cuts more than its cap', () => {
    const c = chargeModel(100_000);
    expect(c.agCutKaf).toBeLessThanOrEqual(V('ag_depletion') * V('ag_charge_cap') + 1e-9);
    expect(c.miCutKaf).toBeLessThanOrEqual(V('mi_depletion') * V('mi_charge_cap') + 1e-9);
  });
});

describe('the crop levy', () => {
  it('catches the heaviest users first', () => {
    const low = levyModel(200, 2);
    const high = levyModel(200, 3.5);
    expect(low.acresInScope).toBeGreaterThan(high.acresInScope);
    expect(low.waterKaf).toBeGreaterThan(high.waterKaf);
  });

  it('matches the expected excess of a lognormal', () => {
    // With a threshold of zero, the expected excess is just the mean.
    expect(expectedExcess(2.64, 0.3, 0)).toBeCloseTo(2.64, 6);
    // And it falls as the threshold rises.
    expect(expectedExcess(2.64, 0.3, 2)).toBeGreaterThan(expectedExcess(2.64, 0.3, 3));
  });

  it('raises nothing and moves nothing at a rate of nothing', () => {
    const l = levyModel(0, 2);
    expect(l.waterKaf).toBe(0);
    expect(l.revenueM).toBe(0);
  });
});

describe('residential lawns', () => {
  it('finds enforcement intensity matters far more than the fine', () => {
    const d = { ...DEFAULT_DIALS, lawnCutAsked: 0.2, citationsPerThousandJuly: 0.4, finePerViolation: 250 };
    const quadrupleFine = lawnModel({ ...d, finePerViolation: 1000 });
    const fiftyTimesCitations = lawnModel({ ...d, citationsPerThousandJuly: 20 });
    const baseLawn = lawnModel(d);
    const fineGain = quadrupleFine.compliance - baseLawn.compliance;
    const citationGain = fiftyTimesCitations.compliance - baseLawn.compliance;
    expect(citationGain).toBeGreaterThan(fineGain * 5);
  });

  it('starts at the habit floor with no enforcement at all', () => {
    const l = lawnModel({ ...DEFAULT_DIALS, lawnCutAsked: 0.2, citationsPerThousandJuly: 0, finePerViolation: 0 });
    expect(l.compliance).toBeCloseTo(V('compliance_floor'), 6);
  });

  it('asks for nothing when the limit is off', () => {
    const l = lawnModel({ ...DEFAULT_DIALS, lawnCutAsked: 0 });
    expect(l.waterNotApplied).toBe(0);
    expect(l.toLake).toBe(0);
    expect(l.fineRevenue).toBe(0);
  });

  it('sends only a quarter of a city saving to the lake', () => {
    const l = lawnModel({ ...DEFAULT_DIALS, lawnCutAsked: 0.3, citationsPerThousandJuly: 20 });
    expect(l.toLake).toBeCloseTo(l.waterNotApplied * V('urban_to_lake'), 6);
  });

  it('covers the whole season when the whole season is enforced', () => {
    expect(seasonCoverage('season')).toBeCloseTo(1, 6);
    expect(seasonCoverage('july')).toBeLessThan(seasonCoverage('peak'));
  });
});

describe('the mandate', () => {
  it('only takes what the voluntary levers did not find', () => {
    const low = pkgModel({ mandateFloorKaf: 0 });
    const high = pkgModel({ mandateFloorKaf: 1200 });
    expect(low.final.forcedKaf).toBe(0);
    expect(high.final.forcedKaf).toBeGreaterThan(0);
  });

  it('pricing non-compliance converts coercion into transactions', () => {
    const without = pkgModel({ ...REF, mandateFloorKaf: 800, mandatePenaltyPerAf: 0 });
    const withPenalty = pkgModel({ ...REF, mandateFloorKaf: 800, mandatePenaltyPerAf: V('lake_value_per_af') });
    expect(withPenalty.final.rightsHeldKaf).toBeGreaterThan(without.final.rightsHeldKaf);
    expect(withPenalty.final.forcedKaf).toBeLessThan(without.final.forcedKaf);
    expect(withPenalty.boughtShare).toBeGreaterThan(without.boughtShare);
  });

  it('switches off when voluntary levers alone can hold the healthy floor', () => {
    const r = withCoefs(
      {
        lease_capacity: 1600,
        retire_capacity: 1200,
        shepherd_growth: 80,
        shepherd_start: 250,
        shepherd_monitor_max: 120,
      },
      () =>
        pkgModel({
          budgetM: 800,
          leaseToOwnM: 100,
          mandateFloorKaf: 1200,
          mandatePenaltyPerAf: V('lake_value_per_af'),
          scarcityRatePerAf: 400,
          cropLevyPerAf: 400,
          levyToTransition: 0,
          monitoringM: 50,
          cropSwitchM: 0,
          phragM: 25,
          cloudM: 10,
        }),
    );
    const healthyHoldAdded = r.rightsNeededToHoldHealthyKaf * r.final.deliveryShare;
    expect(r.final.voluntaryNetToLakeKaf).toBeGreaterThan(healthyHoldAdded);
    expect(r.final.mandateLoadBearing).toBe(false);
    expect(r.final.forcedKaf).toBe(0);
  });

  it('does not treat mandate penalties as rights-fund revenue', () => {
    const r = pkgModel({ mandateFloorKaf: 1200, mandatePenaltyPerAf: V('lake_value_per_af') });
    expect(r.final.forcedKaf).toBeGreaterThan(0);
    expect(r.years.every((y) => y.mandateFineRevenueM === 0)).toBe(true);
  });
});

describe('what binds', () => {
  // Which constraint binds depends on the price of a lease, and a charge or a penalty pushes
  // that price down. These tests pin both regimes, because the difference between them is the
  // whole argument.
  const mandateOff = { ...REF, mandateFloorKaf: 0 };
  const chargeOn = { ...REF, mandateFloorKaf: 0, scarcityRatePerAf: 300 };

  it('stops buying anything at all past a few hundred million', () => {
    const sweep = budgetSweep([200, 400, 800], mandateOff);
    expect(sweep[2].netKaf).toBeCloseTo(sweep[1].netKaf, 6);
    expect(sweep[1].ceilingBinds).toBe(true);
    expect(sweep[2].ceilingBinds).toBe(true);
  });

  it('buys a few per cent more water for eight times the money, once the ceiling binds', () => {
    const lo = pkgModel({ ...chargeOn, budgetM: 100, leaseToOwnM: 40 });
    const hi = pkgModel({ ...chargeOn, budgetM: 800, leaseToOwnM: 320 });
    expect(lo.ceilingBinds).toBe(true);
    expect(hi.final.netToLakeKaf / lo.final.netToLakeKaf - 1).toBeLessThan(0.15);
  });

  it('moves by exactly nothing when the lease elasticity changes sixfold', () => {
    // When a quantity ceiling binds, the price the last acre-foot would have fetched is
    // irrelevant: the rate swings by a factor of six and the lake does not notice.
    const lo = withCoefs({ lease_elasticity: 0.3 }, () => pkgModel(chargeOn));
    const hi = withCoefs({ lease_elasticity: 3 }, () => pkgModel(chargeOn));
    expect(hi.final.netToLakeKaf).toBeCloseTo(lo.final.netToLakeKaf, 6);
    expect(hi.final.leaseRatePerAf).toBeLessThan(lo.final.leaseRatePerAf / 3);
  });

  it('moves a great deal when willing-seller capacity changes', () => {
    const lo = withCoefs({ lease_capacity: 100, retire_capacity: 75 }, () => pkgModel(chargeOn));
    const hi = withCoefs({ lease_capacity: 1600, retire_capacity: 600 }, () => pkgModel(chargeOn));
    expect(hi.final.netToLakeKaf).toBeGreaterThan(lo.final.netToLakeKaf * 1.4);
  });

  it('is more leveraged by capacity than by money, by a wide margin', () => {
    const moneyLow = pkgModel({ ...chargeOn, budgetM: 100, leaseToOwnM: 40 });
    const moneyHigh = pkgModel({ ...chargeOn, budgetM: 800, leaseToOwnM: 320 });
    const capLow = withCoefs({ lease_capacity: 200, retire_capacity: 150 }, () => pkgModel(chargeOn));
    const capHigh = withCoefs({ lease_capacity: 1600, retire_capacity: 1200 }, () => pkgModel(chargeOn));
    const moneyGain = moneyHigh.final.netToLakeKaf / moneyLow.final.netToLakeKaf - 1;
    const capGain = capHigh.final.netToLakeKaf / capLow.final.netToLakeKaf - 1;
    expect(capGain).toBeGreaterThan(moneyGain * 5);
  });

  it('is the budget, not the ceiling, that binds at a low budget with no charge', () => {
    // Worth stating plainly: the "money is not the constraint" finding needs the lease price
    // held down by a charge or a penalty. Without one, a small budget binds on money.
    const small = pkgModel({ ...mandateOff, budgetM: 50, leaseToOwnM: 20 });
    expect(small.ceilingBinds).toBe(false);
  });
});

describe('the lake and the goal', () => {
  it('computes the goal from the chosen baseline rather than hard-coding it', () => {
    const dry = pkgModel({ baselineId: 'warming' });
    const wet = pkgModel({ baselineId: 'long' });
    expect(dry.goalElevationFt).toBeLessThan(wet.goalElevationFt);
  });

  it('never reports a level below the lake standing still', () => {
    for (const row of base.years) expect(row.elevationFt).toBeGreaterThan(V('serious_low') - 5);
  });

  it('gives one row per year asked for', () => {
    const r = pkgModel({ startYear: 2027, horizon: 2040 });
    expect(r.years.length).toBe(14);
    expect(r.years[0].year).toBe(2027);
    expect(r.final.year).toBe(2040);
  });
});

describe('determinism', () => {
  it('gives the same answer twice', () => {
    expect(JSON.stringify(pkgModel())).toBe(JSON.stringify(pkgModel()));
  });

  it('gives the same simulation band twice', () => {
    const a = simulate(base, { runs: 60, seed: 7 });
    const b = simulate(base, { runs: 60, seed: 7 });
    expect(a.p10).toEqual(b.p10);
    expect(a.p90).toEqual(b.p90);
  });

  it('has a generator that stays inside the unit interval', () => {
    const rand = mulberry32(1);
    for (let i = 0; i < 1000; i++) {
      const x = rand();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('the simulation band', () => {
  const sim = simulate(base, { runs: 120, seed: 3 });
  it('brackets the median', () => {
    for (let i = 0; i < sim.p50.length; i++) {
      expect(sim.p10[i]).toBeLessThanOrEqual(sim.p50[i]);
      expect(sim.p50[i]).toBeLessThanOrEqual(sim.p90[i]);
    }
  });
  it('reports shares between nothing and everything', () => {
    expect(sim.shareHealthy).toBeGreaterThanOrEqual(0);
    expect(sim.shareHealthy).toBeLessThanOrEqual(1);
    expect(sim.shareBelowCritical).toBeGreaterThanOrEqual(0);
    expect(sim.shareBelowCritical).toBeLessThanOrEqual(1);
  });
  it('widens under a long drought', () => {
    const dry = simulate(base, { runs: 120, seed: 3, longDrought: true });
    expect(dry.p10[dry.p10.length - 1]).toBeLessThanOrEqual(sim.p10[sim.p10.length - 1]);
  });
});

describe('the optimiser', () => {
  it('never returns a package worse than the defaults', () => {
    const r = optimise(0.6, { tries: 150, seed: 11 });
    const baseScore = scorePackage(base, 0.6).score;
    expect(r.score).toBeGreaterThanOrEqual(baseScore - 1e-9);
  });

  it('is deterministic for a seed', () => {
    const a = optimise(0.6, { tries: 80, seed: 5 });
    const b = optimise(0.6, { tries: 80, seed: 5 });
    expect(a.score).toBe(b.score);
    expect(a.dials).toEqual(b.dials);
  });

  it('favours water when told to and support when told to', () => {
    const water = optimise(1, { tries: 200, seed: 9 });
    const support = optimise(0, { tries: 200, seed: 9 });
    expect(water.result.final.netToLakeKaf).toBeGreaterThanOrEqual(support.result.final.netToLakeKaf - 1e-6);
    expect(support.result.support.weakest.score).toBeGreaterThanOrEqual(water.result.support.weakest.score - 1e-6);
  });

  it('keeps spending inside the budget', () => {
    const r = optimise(0.6, { tries: 200, seed: 13 });
    const d = r.dials;
    expect(d.monitoringM + d.cloudM + d.phragM + d.cropSwitchM + d.leaseToOwnM).toBeLessThanOrEqual(d.budgetM + 1e-6);
  });

  it('searches every dial that the controls expose', () => {
    // Drift between the search space and the dials is silent, so it is a test.
    // The price of a water right and the state's interest rate are market assumptions, not policy:
    // letting the search pick a cheap price would buy water with an assumption.
    const skip = new Set(['startYear', 'horizon', 'baselineId', 'budgetM', 'repossessInterest', 'capitalPricePerAf', 'enforcementWindowId', 'longDrought']);
    const searched = new Set(SEARCH_SPACE.map((s) => s.key as string));
    for (const key of Object.keys(DEFAULT_DIALS)) {
      if (skip.has(key)) continue;
      expect(searched.has(key), `dial "${key}" is not in the optimiser's search space`).toBe(true);
    }
    for (const entry of SEARCH_SPACE) {
      expect(Object.keys(DEFAULT_DIALS)).toContain(entry.key as string);
    }
  });
});

describe('sensitivity', () => {
  it('ranks assumptions by how far they move the lake', () => {
    const rows = sensitivity({}, 8);
    expect(rows.length).toBeGreaterThan(0);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].swingFt).toBeGreaterThanOrEqual(rows[i].swingFt);
    }
  });

  it('restores every coefficient it borrowed', () => {
    const before = COEFS.map((c) => c.value);
    sensitivity({}, 5);
    expect(COEFS.map((c) => c.value)).toEqual(before);
  });
});

describe('every assumption is declared', () => {
  it('gives each coefficient a basis', () => {
    for (const c of COEFS) {
      expect(c.basis.length, `${c.id} has no basis`).toBeGreaterThan(10);
    }
  });

  it('says why, for anything with no source behind it', () => {
    for (const c of COEFS) {
      if (c.sourceIds.length === 0 && c.status !== 'assumption' && c.id !== 'budget') {
        throw new Error(`${c.id} is marked ${c.status} but cites no source`);
      }
    }
  });

  it('gives every derived figure its formula', () => {
    const missing = COEFS.filter((c) => c.status === 'derived' && !c.formula).map((c) => c.id);
    expect(missing).toEqual([]);
  });

  it('keeps every default inside its own stated range', () => {
    for (const c of COEFS) {
      if (c.low !== undefined) expect(c.value, `${c.id} below its own low`).toBeGreaterThanOrEqual(c.low);
      if (c.high !== undefined) expect(c.value, `${c.id} above its own high`).toBeLessThanOrEqual(c.high);
    }
  });
});

describe('legal assumptions', () => {
  it('keeps the HB 410 field-leasing cap out of lease-to-own capacity', () => {
    const cap = LEGAL_ASSUMPTIONS.find((a) => a.id === 'hb410_field_rotation');
    expect(cap?.value).toBe('Not applied to lease-to-own');
    expect(cap?.basis).toContain('2.5-acre');
    expect(V('lease_to_own_rotation_multiplier')).toBe(1);
  });

  it('marks the proposed statutory changes as not current law', () => {
    const proposed = LEGAL_ASSUMPTIONS.filter((a) => a.status === 'Proposed legislation');
    expect(proposed).toHaveLength(7);
    for (const row of proposed) expect(row.value).toBe('Not current law');
  });

  it('resolves every source a legal assumption cites', () => {
    const sourceIds = new Set(SOURCES.map((s) => s.id));
    for (const row of LEGAL_ASSUMPTIONS) {
      for (const id of row.sourceIds) {
        expect(sourceIds.has(id), `${row.id} cites unknown source "${id}"`).toBe(true);
      }
    }
  });
});

describe('the normal approximation', () => {
  it('matches known values closely enough', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);
    expect(normalCdf(-5)).toBeLessThan(1e-5);
  });
});

describe('sources', () => {
  it('resolves every source a coefficient cites', () => {
    // A typo in a source id is otherwise only caught by the network link check.
    for (const c of COEFS) {
      for (const id of c.sourceIds) {
        expect(() => coefSources(c.id), `${c.id} cites unknown source "${id}"`).not.toThrow();
      }
    }
  });

  it('gives every source a title, a publisher and a URL', () => {
    for (const s of SOURCES) {
      expect(s.title.length, `${s.id} has no title`).toBeGreaterThan(5);
      expect(s.publisher.length, `${s.id} has no publisher`).toBeGreaterThan(2);
      expect(s.url.startsWith('https://'), `${s.id} has no https URL`).toBe(true);
      expect(s.use.length, `${s.id} does not say what it is used for`).toBeGreaterThan(10);
    }
  });

  it('cites every source from somewhere', () => {
    const referenced = new Set([
      ...COEFS.flatMap((c) => c.sourceIds),
      ...LEGAL_ASSUMPTIONS.flatMap((a) => a.sourceIds),
      ...STAKEHOLDERS.flatMap((s) => s.sourceIds),
      ...VALUE_PER_AF.flatMap((v) => v.sourceIds),
      ...BASELINES.flatMap((b) => b.sourceIds),
      AREA_ANCHOR_SOURCE,
      WATERING_MONTHS_SOURCE,
      // The verification records cite the passages each number was checked against.
      ...Object.values(VERIFICATION).flatMap((v) => v.sourceIds),
      ...Object.values(TABLE_VERIFICATION).flatMap((v) => v.sourceIds),
    ]);
    for (const s of SOURCES) {
      expect(referenced.has(s.id), `source "${s.id}" is cited by nothing`).toBe(true);
    }
  });
});

describe('verification', () => {
  it('records how every coefficient was checked, and when', () => {
    for (const c of COEFS) {
      const v = VERIFICATION[c.id];
      expect(v, `no verification record for ${c.id}`).toBeDefined();
      expect(v.verdict, c.id).toBeTruthy();
      expect(v.checked, c.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('quotes the passage and says where it sits for every confirmed or corrected number', () => {
    for (const v of [...Object.values(VERIFICATION), ...Object.values(TABLE_VERIFICATION)]) {
      if (v.verdict !== 'confirmed' && v.verdict !== 'corrected') continue;
      if (v.id.startsWith('SOURCES/')) continue; // a source row is checked by opening the page, not by a passage
      expect(v.quote.length, `${v.id} has no quote`).toBeGreaterThan(0);
      expect(v.locator.length, `${v.id} has no locator`).toBeGreaterThan(0);
    }
  });

  it('names only sources the model lists', () => {
    const ids = new Set(SOURCES.map((s) => s.id));
    for (const v of [...Object.values(VERIFICATION), ...Object.values(TABLE_VERIFICATION)]) {
      for (const id of v.sourceIds) expect(ids.has(id), `${v.id} cites unknown source ${id}`).toBe(true);
    }
  });

  it('carries the corrected value into the model', () => {
    for (const c of COEFS) {
      const v = VERIFICATION[c.id];
      if (v.verdict === 'corrected' && v.value !== undefined) expect(c.value, c.id).toBeCloseTo(v.value, 6);
    }
  });
});
