/**
 * Export everything the appendix needs as one JSON file.
 *
 *   npx tsx scripts/export-appendix-data.ts [dials.json] [out.json]
 *
 * This exists so a writer never has to read the TypeScript to get a number. One command gives
 * the whole model: every coefficient with its basis and sources, the scenario year by year, the
 * 2035 and 2055 snapshots, the do-nothing counterfactual, the sensitivity ranking, the
 * uncertainty band, and the sector tables.
 *
 * `dials.json` is an optional partial Dials object — the optimised settings go here. Anything it
 * leaves out keeps the model default.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import {
  BASELINES,
  COEFS,
  CONSUMERS,
  ENFORCEMENT_WINDOWS,
  STAKEHOLDERS,
  VALUE_PER_AF,
  V,
  WATERING_MONTHS,
} from '../src/data';
import { SOURCES, source } from '../src/sources';
import { areaSqMi, equilibriumFt, inflowToHoldKaf } from '../src/lake';
import { DEFAULT_DIALS, pkgModel, reconcile, type Dials } from '../src/model';
import { budgetSweep, sensitivity, simulate } from '../src/simulate';

const dialsPath = process.argv[2];
const outPath = process.argv[3] ?? 'research/appendix-data.json';

const override: Partial<Dials> = dialsPath ? JSON.parse(readFileSync(dialsPath, 'utf8')) : {};
const dials: Dials = { ...DEFAULT_DIALS, ...override };

const main = pkgModel(dials);
const sim = simulate(main, { seed: 20260101 });

/** The counterfactual: no package at all. Every lever off, no budget, no mandate. */
const nothingDials: Dials = {
  ...dials,
  budgetM: 0,
  monitoringM: 0,
  leaseToOwnM: 0,
  cloudM: 0,
  phragM: 0,
  cropSwitchM: 0,
  scarcityRatePerAf: 0,
  escalatorOn: false,
  cropLevyPerAf: 0,
  lawnCutAsked: 0,
  mandateFloorKaf: 0,
  mandatePenaltyPerAf: 0,
  repossessOn: false,
};
const nothing = pkgModel(nothingDials);
const nothingSim = simulate(nothing, { seed: 20260101 });

const snapshot = (year: number) => {
  const row = main.years.find((y) => y.year === year) ?? main.final;
  const none = nothing.years.find((y) => y.year === year) ?? nothing.final;
  return { year, withPackage: row, doNothing: none };
};

const out = {
  generatedAt: new Date().toISOString(),
  note:
    'Every figure the appendix needs. Numbers here are the model output: do not recompute them by hand. ' +
    'KAF = thousand acre-feet. Elevations are feet above sea level, south arm.',

  scenario: {
    dials,
    dialsCameFrom: dialsPath ?? 'model defaults (no dials file supplied)',
    goalKaf: main.goalKaf,
    goalElevationFt: main.goalElevationFt,
    reachesGoal: main.final.netToLakeKaf >= main.goalKaf,
    shortfallKaf: main.shortfallKaf,
    finalElevationFt: main.final.elevationFt,
    healthyMinFt: V('healthy_min'),
    healthyMaxFt: V('healthy_max'),
    todayFt: V('lake_now'),
    ceilingBinds: main.ceilingBinds,
    boughtShare: main.boughtShare,
    boughtKaf: main.boughtKaf,
    chargedKaf: main.chargedKaf,
    orderedKaf: main.orderedKaf,
    acresOutOfIrrigation: main.acresOutOfIrrigation,
    hayTonsLost: main.hayTonsLost,
    pricePaidPerAf: main.pricePaidPerAf,
  },

  /** Year by year, with the package and without it. */
  path: main.years,
  doNothingPath: nothing.years,
  snapshots: { y2035: snapshot(2035), y2055: snapshot(2055) },

  doNothing: {
    finalElevationFt: nothing.final.elevationFt,
    equilibriumFt: nothing.equilibriumAtFinalFt,
    netToLakeKaf: nothing.final.netToLakeKaf,
    shareBelowCritical: nothingSim.shareBelowCritical,
    shareHealthy: nothingSim.shareHealthy,
    p10FinalFt: nothingSim.p10[nothingSim.p10.length - 1],
    p90FinalFt: nothingSim.p90[nothingSim.p90.length - 1],
    seriousLowFt: V('serious_low'),
  },

  uncertainty: {
    runs: sim.runs,
    years: sim.years,
    p10: sim.p10,
    p50: sim.p50,
    p90: sim.p90,
    shareHealthy: sim.shareHealthy,
    shareBelowCritical: sim.shareBelowCritical,
    inflowCv: V('inflow_cv'),
    inflowAr1: V('inflow_ar1'),
  },

  /** What one assumption being wrong does to the lake, ranked. */
  sensitivity: sensitivity(dials, 40),

  budgetSweep: budgetSweep([25, 50, 100, 200, 300, 400, 600, 800], { ...dials, mandateFloorKaf: 0 }),

  /** Does the arithmetic on the page add up? All of these must be true. */
  reconciliation: reconcile(main),

  sectors: {
    byDepletion: CONSUMERS,
    basinDepletionKaf: V('basin_depletion'),
    agDepletionKaf: V('ag_depletion'),
    hayDepletionKaf: V('hay_depletion'),
    chargeBaseKaf: V('charge_base'),
    outputPerAcreFoot: VALUE_PER_AF,
    lakeValuePerAf: V('lake_value_per_af'),
    hayValuePerAf: V('hay_value_per_af'),
    industrialPipelineKaf: V('industrial_pipeline_water'),
    industrialPipelineJobs: V('industrial_pipeline_jobs'),
  },

  jobs: {
    final: {
      fieldLost: main.final.fieldJobsLost,
      livestockLost: main.final.livestockJobsLost,
      transitionGained: main.final.transitionJobs,
      lakeEconomyGained: main.final.lakeJobs,
      net: main.final.netJobs,
    },
    y2035: (() => {
      const r = main.years.find((y) => y.year === 2035) ?? main.final;
      return {
        fieldLost: r.fieldJobsLost,
        livestockLost: r.livestockJobsLost,
        transitionGained: r.transitionJobs,
        lakeEconomyGained: r.lakeJobs,
        net: r.netJobs,
      };
    })(),
    farmJobsPer1000Acres: V('farm_jobs_per_1000_acres'),
    lakeJobsAtHealthy: V('lake_jobs_full'),
  },

  economics: {
    publicBudgetMPerYr: dials.budgetM,
    farmRevenueLostMPerYr: main.final.farmRevenueLostM,
    livestockReceiptsAtRiskMPerYr: main.final.livestockReceiptsAtRiskM,
    totalCostMPerYr: main.final.totalCostM,
    benefitMPerYr: main.final.benefitM,
    costPerAfDelivered:
      main.final.netToLakeKaf > 0 ? (main.final.totalCostM * 1e6) / (main.final.netToLakeKaf * 1000) : 0,
    wtpPerHousehold: V('wtp_household'),
    wtpStatewideMPerYr: (V('wtp_household') * V('state_households')) / 1e6,
    farmerCompensationLowM: V('farmer_compensation_low'),
    farmerCompensationHighM: V('farmer_compensation_high'),
  },

  politics: {
    supportScores: main.support.scores,
    weakest: main.support.weakest,
    average: main.support.average,
    stakeholderWeights: STAKEHOLDERS,
    prefIncentives: V('pref_incentives'),
    prefPenalties: V('pref_penalties'),
    note: 'Support scores are modelled from polled weights, not themselves surveyed.',
  },

  levers: { programs: main.programs, levy: main.levy, charge: main.charge, lawn: main.lawn },

  lakePhysics: {
    netEvaporationFtPerYr: V('evap_gross') - V('precip_lake'),
    baselineInflowKaf: V('baseline_inflow'),
    curve: Array.from({ length: 25 }, (_, i) => {
      const ft = 4188 + i;
      return { elevationFt: ft, areaSqMi: areaSqMi(ft), inflowToHoldKaf: inflowToHoldKaf(ft) };
    }),
    addedInflowCurve: Array.from({ length: 29 }, (_, i) => {
      const added = i * 50;
      return { addedKaf: added, equilibriumFt: equilibriumFt(V('baseline_inflow') + added) };
    }),
  },

  baselines: BASELINES.map((b) => ({
    ...b,
    inflowKaf: V('baseline_inflow') * b.inflowFactor,
    untouchedEquilibriumFt: equilibriumFt(V('baseline_inflow') * b.inflowFactor),
    neededForHealthyKaf: inflowToHoldKaf(V('healthy_min')) - V('baseline_inflow') * b.inflowFactor,
  })),

  wateringMonths: WATERING_MONTHS,
  enforcementWindows: ENFORCEMENT_WINDOWS,

  /** Every coefficient, with where it came from. This is the spine of the assumptions section. */
  coefficients: COEFS.map((c) => ({
    id: c.id,
    label: c.label,
    value: c.value,
    unit: c.unit,
    group: c.group,
    status: c.status,
    basis: c.basis,
    formula: c.formula ?? null,
    low: c.low ?? null,
    high: c.high ?? null,
    confidence: c.confidence ?? null,
    note: c.note ?? null,
    sources: c.sourceIds.map((id) => {
      const s = source(id);
      return { id: s.id, title: s.title, publisher: s.publisher, year: s.year, url: s.url, locator: s.locator ?? null };
    }),
  })),

  sources: SOURCES,

  counts: {
    coefficients: COEFS.length,
    sourced: COEFS.filter((c) => c.status === 'sourced').length,
    derived: COEFS.filter((c) => c.status === 'derived').length,
    assumptions: COEFS.filter((c) => c.status === 'assumption').length,
    assumptionsWithNoSource: COEFS.filter((c) => c.status === 'assumption' && c.sourceIds.length === 0).length,
  },
};

writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(`Wrote ${outPath}`);
console.log(
  `scenario: ${out.scenario.dialsCameFrom} | net ${main.final.netToLakeKaf.toFixed(0)} KAF/yr | ` +
    `lake ${main.final.elevationFt.toFixed(1)} ft | goal ${main.goalKaf} KAF | reaches goal: ${out.scenario.reachesGoal}`,
);
console.log(
  `do nothing: lake ${nothing.final.elevationFt.toFixed(1)} ft | ${(nothingSim.shareBelowCritical * 100).toFixed(0)}% of runs below the serious line`,
);
console.log(`checks: ${out.reconciliation.filter((c) => c.ok).length}/${out.reconciliation.length} pass`);
