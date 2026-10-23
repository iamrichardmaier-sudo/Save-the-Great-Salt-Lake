/**
 * The package model: what a year's spending and a year's rules actually deliver to the lake.
 *
 * Pure. No DOM, no globals, no clock. Every lever arrives in `Dials`, so a sweep can run the
 * model a thousand times without touching a control, and every coefficient comes from data.ts.
 */

import {
  BASELINES,
  CONSUMERS,
  ENFORCEMENT_WINDOWS,
  STAKEHOLDERS,
  V,
  WATERING_MONTHS,
} from './data';
import { equilibriumFt, inflowToHoldKaf, stepElevation } from './lake';

const SQ_FT_PER_ACRE = 43_560;

// ───────────────────────────── Dials ─────────────────────────────

export interface Dials {
  startYear: number;
  horizon: number;
  baselineId: string;

  budgetM: number;
  monitoringM: number;
  leaseToOwnM: number;
  capitalPricePerAf: number;

  scarcityRatePerAf: number;
  escalatorOn: boolean;

  cropLevyPerAf: number;
  levyThresholdAfPerAcre: number;
  levyToTransition: number;

  mandateFloorKaf: number;
  mandatePhaseYears: number;
  mandatePenaltyPerAf: number;

  repossessOn: boolean;
  repossessInterest: number;
  repossessCapKaf: number;

  cloudM: number;
  phragM: number;
  cropSwitchM: number;

  lawnCutAsked: number;
  enforcementWindowId: string;
  citationsPerThousandJuly: number;
  finePerViolation: number;

  longDrought: boolean;

  /**
   * Optional spending set year by year, indexed from the start year. When present it replaces the
   * flat spending dials above; a year past its end spends nothing. Rights already under contract
   * are paid whether or not the year lists them, because a contract is not discretionary.
   */
  schedule?: YearSpend[];
}

/** One year's spending, in $M, when the budget is set year by year rather than flat. */
export interface YearSpend {
  monitoringM: number;
  /** New rights and repossession. Payments on rights already under contract come on top. */
  leaseM: number;
  cloudM: number;
  phragM: number;
  cropM: number;
  onfarmM: number;
}

export const NO_SPEND: YearSpend = { monitoringM: 0, leaseM: 0, cloudM: 0, phragM: 0, cropM: 0, onfarmM: 0 };

export const DEFAULT_DIALS: Dials = {
  startYear: 2027,
  horizon: 2055,
  baselineId: 'thirty',

  budgetM: V('budget'),
  monitoringM: V('monitoring'),
  leaseToOwnM: V('lease_to_own_dollars'),
  capitalPricePerAf: V('capital_price'),

  scarcityRatePerAf: 0,
  escalatorOn: false,

  cropLevyPerAf: 0,
  levyThresholdAfPerAcre: 2.0,
  levyToTransition: 1,

  mandateFloorKaf: V('mandate_floor'),
  mandatePhaseYears: V('mandate_phase'),
  mandatePenaltyPerAf: V('mandate_penalty'),

  repossessOn: false,
  repossessInterest: V('state_interest'),
  repossessCapKaf: V('repossess_cap'),

  cloudM: 1.5,
  phragM: 10.5,
  cropSwitchM: 24,

  lawnCutAsked: 0,
  enforcementWindowId: 'season',
  citationsPerThousandJuly: 0.4,
  finePerViolation: 1000,

  longDrought: false,
};

// ───────────────────────── Small maths helpers ─────────────────────────

/** Normal cumulative distribution, via a standard error-function approximation. */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

/**
 * Expected water applied above a threshold, per acre, when application is lognormal.
 * This is what makes a threshold bite on the heaviest users first rather than on the average.
 */
export function expectedExcess(mean: number, cv: number, threshold: number): number {
  if (threshold <= 0) return mean;
  const sigma2 = Math.log(1 + cv * cv);
  const sigma = Math.sqrt(sigma2);
  const mu = Math.log(mean) - sigma2 / 2;
  const a = (mu - Math.log(threshold) + sigma2) / sigma;
  const b = (mu - Math.log(threshold)) / sigma;
  return mean * normalCdf(a) - threshold * normalCdf(b);
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Share of a year's watering inside the enforced months. */
export function seasonCoverage(windowId: string): number {
  const win = ENFORCEMENT_WINDOWS.find((w) => w.id === windowId) ?? ENFORCEMENT_WINDOWS[0];
  return WATERING_MONTHS.filter((m) => win.months.includes(m.month)).reduce((s, m) => s + m.share, 0);
}

// ───────────────────────── Sub-models ─────────────────────────

export interface LawnResult {
  lawns: number;
  lawnAcres: number;
  inchesApplied: number;
  compliance: number;
  citations: number;
  waterNotApplied: number;
  toLake: number;
  fineRevenue: number;
  catchChance: number;
}

/**
 * Residential lawns, built from households and lot sizes rather than from an elasticity.
 *
 * Compliance is a fixed point: as more households comply, fewer remain in violation, so each
 * of those is likelier to be caught by the same number of citations.
 */
export function lawnModel(d: Dials): LawnResult {
  const lawns = V('basin_lawns');
  const lawnAcres = (lawns * V('landscape_sqft')) / SQ_FT_PER_ACRE;
  const inchesApplied = ((V('lawn_water') * 1000) / lawnAcres) * 12;
  const population = (lawns * V('people_per_home')) / (V('share_in_basin') * V('share_with_lawn'));
  const coverage = seasonCoverage(d.enforcementWindowId);
  const julyShare = WATERING_MONTHS.find((m) => m.month === 'Jul')?.share ?? 1;

  // Citations written across the enforced months, scaled from the July rate.
  const citations = julyShare > 0
    ? (d.citationsPerThousandJuly * (population / 1000) * coverage) / julyShare
    : 0;

  const floor = V('compliance_floor');
  const seasonValue = V('season_value');

  let comply = floor;
  let catchChance = 0;
  if (d.lawnCutAsked > 0 && citations > 0) {
    for (let i = 0; i < 60; i++) {
      const violators = Math.max(1, lawns * (1 - comply));
      catchChance = Math.min(1, citations / violators);
      const next = floor + (1 - floor) * (1 - Math.exp((-catchChance * d.finePerViolation) / seasonValue)) * coverage;
      if (Math.abs(next - comply) < 1e-10) {
        comply = next;
        break;
      }
      comply = next;
    }
  }

  const waterNotApplied = d.lawnCutAsked > 0 ? V('lawn_water') * d.lawnCutAsked * comply : 0;
  const toLake = waterNotApplied * V('urban_to_lake');
  const fineRevenue = d.lawnCutAsked > 0 ? citations * d.finePerViolation * V('fine_collection') : 0;

  return { lawns, lawnAcres, inchesApplied, compliance: comply, citations, waterNotApplied, toLake, fineRevenue, catchChance };
}

export interface ProgramResult {
  id: string;
  label: string;
  spendM: number;
  deliveredKaf: number;
  grossKaf: number;
  costPerDeliveredAf: number;
  capKaf: number;
  saturationM: number;
  atCapacity: boolean;
}

/** What a programme's budget buys, in water that actually reaches the lake. */
function runProgram(
  id: string,
  label: string,
  spendM: number,
  costPerAf: number,
  delivery: number,
  capKaf: number,
  ramp: number,
): ProgramResult {
  const costPerDeliveredAf = costPerAf / delivery;
  const saturationM = (capKaf * 1000 * costPerDeliveredAf) / 1e6;
  const affordable = (spendM * 1e6) / costPerDeliveredAf / 1000;
  const deliveredKaf = Math.min(affordable, capKaf) * ramp;
  return {
    id,
    label,
    spendM,
    deliveredKaf,
    grossKaf: deliveredKaf / delivery,
    costPerDeliveredAf,
    capKaf,
    saturationM,
    atCapacity: affordable >= capKaf - 1e-9,
  };
}

export interface ChargeResult {
  rate: number;
  agCutKaf: number;
  miCutKaf: number;
  behaviouralKaf: number;
  revenueM: number;
  baseAfterResponse: number;
}

/** The scarcity charge: a behavioural effect and a revenue effect, and the first is larger. */
export function chargeModel(rate: number): ChargeResult {
  const agDepl = V('ag_depletion');
  const miDepl = V('mi_depletion');
  const agCut = agDepl * Math.min(V('ag_charge_cap'), (V('ag_charge_response') * rate) / V('irrigation_net_value'));
  const miCut = miDepl * Math.min(V('mi_charge_cap'), (V('mi_elasticity') * rate) / V('mi_reference_price'));
  const baseAfter = V('charge_base') - agCut - miCut;
  return {
    rate,
    agCutKaf: agCut,
    miCutKaf: miCut,
    behaviouralKaf: agCut + miCut,
    revenueM: (rate * baseAfter * 1000) / 1e6,
    baseAfterResponse: baseAfter,
  };
}

export interface LevyResult {
  excessPerAcre: number;
  acreCutShare: number;
  waterKaf: number;
  revenueM: number;
  acresInScope: number;
  shareOfGroundInScope: number;
}

/** The crop levy: a charge on water applied above a threshold. */
export function levyModel(ratePerAf: number, thresholdAfPerAcre: number): LevyResult {
  const mean = V('application_mean');
  const cv = V('application_cv');
  const acres = V('hay_acres');
  const excess = expectedExcess(mean, cv, thresholdAfPerAcre);
  const cutShare = Math.min(
    V('levy_cut_cap'),
    (V('levy_cut_cap') * ratePerAf * excess) / V('hay_net_return'),
  );
  const waterKaf = (acres * cutShare * V('levy_depletion_factor')) / 1000;
  const revenueM = (ratePerAf * acres * excess * (1 - cutShare)) / 1e6;

  // Share of ground actually above the threshold, for the explanatory text.
  const sigma2 = Math.log(1 + cv * cv);
  const sigma = Math.sqrt(sigma2);
  const mu = Math.log(mean) - sigma2 / 2;
  const shareInScope = thresholdAfPerAcre > 0 ? 1 - normalCdf((Math.log(thresholdAfPerAcre) - mu) / sigma) : 1;

  return {
    excessPerAcre: excess,
    acreCutShare: cutShare,
    waterKaf,
    revenueM,
    acresInScope: acres * shareInScope,
    shareOfGroundInScope: shareInScope,
  };
}

// ───────────────────────── The package ─────────────────────────

export interface YearRow {
  year: number;
  /** Water, all in KAF/yr. */
  programKaf: number;
  cloudKaf: number;
  phragKaf: number;
  cropKaf: number;
  onfarmKaf: number;
  chargeBehaviourKaf: number;
  levyKaf: number;
  lawnKaf: number;
  rightsHeldKaf: number;
  rightsOwnedKaf: number;
  shepherdedKaf: number;
  forcedKaf: number;
  voluntaryNetToLakeKaf: number;
  mandateFineRevenueM: number;
  mandateLoadBearing: boolean;
  repossessedKaf: number;
  grossDeliveredKaf: number;
  growthDrawKaf: number;
  streamflowDeclineKaf: number;
  netToLakeKaf: number;
  shepherdCapKaf: number;
  deliveryShare: number;
  /** Money, all in $M/yr. */
  chargeRevenueM: number;
  levyRevenueM: number;
  fineRevenueM: number;
  leaseSpendM: number;
  programSpendM: number;
  /** Public money by line. Lease includes payments on rights already under contract. */
  monitoringSpendM: number;
  leaseBudgetSpendM: number;
  cloudSpendM: number;
  phragSpendM: number;
  cropSpendM: number;
  onfarmSpendM: number;
  unspentM: number;
  /** Prices and rates. */
  chargeRate: number;
  leaseRatePerAf: number;
  payoffYears: number;
  /** The lake. */
  inflowKaf: number;
  elevationFt: number;
  /** Jobs. */
  fieldJobsLost: number;
  livestockJobsLost: number;
  transitionJobs: number;
  lakeJobs: number;
  netJobs: number;
  /** Economics. */
  publicSpendM: number;
  farmRevenueLostM: number;
  livestockReceiptsAtRiskM: number;
  totalCostM: number;
  benefitM: number;
}

export interface PkgResult {
  dials: Dials;
  years: YearRow[];
  final: YearRow;
  goalKaf: number;
  goalElevationFt: number;
  equilibriumAtFinalFt: number;
  shortfallKaf: number;
  lawn: LawnResult;
  programs: ProgramResult[];
  levy: LevyResult;
  charge: ChargeResult;
  support: SupportResult;
  /** Shares of the water moved, by how it was obtained. */
  boughtKaf: number;
  chargedKaf: number;
  orderedKaf: number;
  boughtShare: number;
  acresOutOfIrrigation: number;
  hayTonsLost: number;
  pricePaidPerAf: number;
  rightsNeededToHoldHealthyKaf: number;
  durableRightsGapKaf: number;
  ceilingBinds: boolean;
}

export interface SupportResult {
  scores: { id: string; label: string; score: number }[];
  weakest: { id: string; label: string; score: number };
  average: number;
}

function baselineFactor(id: string): number {
  return (BASELINES.find((b) => b.id === id) ?? BASELINES[1]).inflowFactor;
}

/** Support scores. Modelled from polled weights, not themselves surveyed. */
export function supportModel(boughtShare: number, recovery: number, farmKept: number, costShare: number): SupportResult {
  const scores = STAKEHOLDERS.map((s) => ({
    id: s.id,
    label: s.label,
    score: clamp(
      s.base + s.wBought * boughtShare + s.wLake * recovery + s.wFarm * farmKept + s.wCost * costShare,
      0,
      100,
    ),
  }));
  const weakest = scores.reduce((a, b) => (b.score < a.score ? b : a));
  return { scores, weakest, average: scores.reduce((s, x) => s + x.score, 0) / scores.length };
}

export function pkgModel(over: Partial<Dials> = {}): PkgResult {
  const d: Dials = { ...DEFAULT_DIALS, ...over };

  const years: YearRow[] = [];
  const nYears = Math.max(1, d.horizon - d.startYear + 1);

  const baseInflow = V('baseline_inflow') * baselineFactor(d.baselineId);
  const goalKaf = V('goal_added');
  const goalElevationFt = equilibriumFt(baseInflow + goalKaf);

  // Money that buys no water but decides how much of the rest arrives.
  const flatMonitoring = Math.min(d.monitoringM, d.budgetM);
  const spend = Math.max(0, d.budgetM - flatMonitoring);

  // Lease-to-own takes its slice first; named programmes may claw some back.
  let flatLeaseBudget = Math.min(spend, d.leaseToOwnM);
  let programBudget = spend - flatLeaseBudget;
  const namedBudget = d.cloudM + d.phragM + d.cropSwitchM;
  if (namedBudget > programBudget) {
    const over2 = namedBudget - programBudget;
    flatLeaseBudget = Math.max(0, flatLeaseBudget - over2);
    programBudget = spend - flatLeaseBudget;
  }
  const restBudget = Math.max(0, programBudget - namedBudget);
  const flatSpend: YearSpend = {
    monitoringM: flatMonitoring,
    leaseM: flatLeaseBudget,
    cloudM: d.cloudM,
    phragM: d.phragM,
    cropM: d.cropSwitchM,
    onfarmM: restBudget,
  };

  const lawn = lawnModel(d);
  const levy = levyModel(d.cropLevyPerAf, d.levyThresholdAfPerAcre);

  // Delivery share: what survives the trip from farm headgate to open water.
  const deliveryShareFor = (monitoringM: number) =>
    Math.min(1, V('delivery_base') * (1 + V('measurement_gain_max') * (1 - Math.exp(-monitoringM / V('measurement_gain_scale')))));
  const limDeliv = V('forced_delivery_penalty');

  // State carried from year to year.
  interface Tranche { kaf: number; ratePerAf: number; yearsLeft: number }
  let tranches: Tranche[] = [];
  let ownedKaf = 0;
  let prevForced = 0;
  let integ = 0;
  let rate = d.scarcityRatePerAf;
  let elevation = V('lake_now');
  const phragPipeline: number[] = [];
  let cumulativeRepossessed = 0;

  const cut0 = goalKaf;

  for (let i = 0; i < nYears; i++) {
    const year = d.startYear + i;
    const t = i / Math.max(1, nYears - 1);
    const ramp = Math.min(1, (i + 1) / V('ramp_years'));
    const s = d.schedule ? (d.schedule[i] ?? NO_SPEND) : flatSpend;
    const monitoring = s.monitoringM;
    const deliv = deliveryShareFor(monitoring);

    // ── Shepherding capacity: the binding constraint on everything acquired.
    const monitorBoost = V('shepherd_monitor_max') * (1 - Math.exp((-V('shepherd_monitor_rate') * monitoring) / V('shepherd_monitor_max')));
    const shepherdCap = V('shepherd_start') + V('shepherd_growth') * i + monitorBoost;

    // ── The scarcity charge, sized to the gap still to close.
    const deliveredSoFar = years.length > 0 ? years[years.length - 1].netToLakeKaf : 0;
    const stillToCut = Math.max(0, goalKaf - deliveredSoFar);
    const windDown = cut0 > 0 ? stillToCut / cut0 : 0;
    if (d.escalatorOn) {
      integ = Math.min(V('escalator_cap') - 1, integ + V('escalator_step') * (windDown - V('escalator_deadband')));
      integ = Math.max(0, integ);
    }
    const targetRate = d.scarcityRatePerAf * windDown * (1 + integ);
    rate += V('thermostat_speed') * (targetRate - rate);
    const charge = chargeModel(rate);

    // ── Revenue recycles: the charge buys rights, the levy funds transition.
    const fundsForTransition = levy.revenueM * d.levyToTransition;
    const fundsForRights = charge.revenueM + levy.revenueM * (1 - d.levyToTransition) + lawn.fineRevenue / 1e6;

    // ── Programmes, cheapest delivered water first.
    const cloud = runProgram('cloud', 'Cloud seeding', s.cloudM, V('cloud_cost'), V('cloud_delivery'), V('cloud_cap'), ramp);
    const phragNow = runProgram('phrag', 'Phragmites removal', s.phragM, V('phrag_cost'), V('phrag_delivery'), V('phrag_cap'), ramp);
    phragPipeline.push(phragNow.deliveredKaf);
    const phragArriving = i >= V('phrag_lag') ? phragPipeline[i - V('phrag_lag')] : 0;
    const crop = runProgram('crop', 'Crop switching', s.cropM + fundsForTransition, V('crop_cost'), V('crop_delivery'), V('crop_cap'), ramp);
    const onfarm = runProgram('onfarm', 'On-farm optimisation', s.onfarmM, V('onfarm_cost'), V('onfarm_delivery'), V('onfarm_cap'), ramp);

    const programKaf = cloud.deliveredKaf + phragArriving + crop.deliveredKaf + onfarm.deliveredKaf;

    // ── Acquisition. Ground already cutting back has less new water left to sell.
    const heldKaf = tranches.reduce((s, x) => s + x.kaf, 0) + ownedKaf;
    const agUsed = clamp(
      (charge.agCutKaf + levy.waterKaf + prevForced * limDeliv) / V('ag_depletion'),
      0,
      0.95,
    );
    const notSellCost = d.mandatePenaltyPerAf;
    const mandPush = 1 + Math.min(1, notSellCost / V('irrigation_net_value')) * V('mandate_pull');
    const leaseCap = ((V('lease_capacity') + V('retire_capacity')) * mandPush) /
      V('lease_to_own_rotation_multiplier');
    const room = Math.max(0, leaseCap - heldKaf);

    const qRef = V('lease_capacity') + V('retire_capacity');
    const scar = Math.pow(1 + heldKaf / qRef, 1 / V('lease_elasticity'));
    // Leasing exempts the water from the charge, so every charge lowers the reservation price.
    const relief = rate + d.cropLevyPerAf * levy.excessPerAcre + notSellCost;
    const leaseRate = clamp(
      V('lease_base_rate') * scar - relief,
      V('lease_base_rate') * V('lease_rate_floor'),
      V('lease_base_rate') * V('lease_rate_ceiling'),
    );
    // Capital and annual value are the same asset: they move together.
    const priceY = (d.capitalPricePerAf * leaseRate) / V('lease_base_rate');
    const r = d.repossessInterest;
    const ratio = (priceY * r) / leaseRate;
    const payoffYears = ratio < 1 && ratio > 0 ? -Math.log(1 - ratio) / Math.log(1 + r) : Number.POSITIVE_INFINITY;
    const vestYears = Number.isFinite(payoffYears) ? Math.max(1, Math.round(payoffYears)) : nYears * 2;

    // Pay for rights already under contract, then buy what is left.
    const committedM = tranches.reduce((sum, x) => sum + (x.kaf * 1000 * x.ratePerAf) / 1e6, 0);
    // Flat: contract payments come out of the lease slice. Year by year: they are paid on top of
    // the year's new-rights money, from charge revenue first and the budget for the rest.
    const committedFromBudgetM = d.schedule ? Math.max(0, committedM - fundsForRights) : 0;
    const availableM = d.schedule
      ? s.leaseM + Math.max(0, fundsForRights - committedM)
      : Math.max(0, s.leaseM + fundsForRights - committedM);
    const affordableKaf = (availableM * 1e6) / leaseRate / 1000;
    const boughtThisYear = Math.max(0, Math.min(room, affordableKaf));
    if (boughtThisYear > 0) tranches.push({ kaf: boughtThisYear, ratePerAf: leaseRate, yearsLeft: vestYears });

    // Vesting: a tranche that reaches payoff is owned outright and costs nothing more.
    tranches = tranches.filter((x) => {
      x.yearsLeft -= 1;
      if (x.yearsLeft <= 0) {
        ownedKaf += x.kaf;
        return false;
      }
      return true;
    });
    const rightsHeld = tranches.reduce((s, x) => s + x.kaf, 0) + ownedKaf;

    // ── Repossession, once willing sellers are exhausted.
    //
    // Bounded by what is actually left to take: the state cannot repossess agricultural water
    // it already holds, or water the charge and the levy have already taken out of use. Without
    // this bound the stock compounds every year and runs past the whole basin's farm depletion.
    let repossessed = 0;
    if (d.repossessOn && room < 1e-6) {
      const alreadyTaken = rightsHeld + cumulativeRepossessed + charge.agCutKaf + levy.waterKaf + prevForced;
      const poolLeft = Math.max(0, V('ag_depletion') - alreadyTaken);
      const leftoverM = Math.max(0, availableM - (boughtThisYear * 1000 * leaseRate) / 1e6);
      const discountedPrice = priceY * (1 - V('repossession_discount'));
      const annual = discountedPrice * r;
      if (annual > 0 && poolLeft > 0) {
        repossessed = Math.min(d.repossessCapKaf, (leftoverM * 1e6) / annual / 1000, poolLeft);
        cumulativeRepossessed += repossessed;
      }
    }

    // ── The mandate: a floor that only takes what the voluntary levers missed, and
    // only while that forced water is still load-bearing for the healthy floor.
    const phaseShare = Math.min(1, (i + 1) / Math.max(1, d.mandatePhaseYears));
    const required = d.mandateFloorKaf * phaseShare;
    const shepherded = Math.min(rightsHeld + cumulativeRepossessed, shepherdCap) * (1 - agUsed);
    const voluntaryGross = programKaf + charge.behaviouralKaf + levy.waterKaf + lawn.waterNotApplied + shepherded;
    const floor = shepherded * deliv;
    const growthDraw = V('growth_draw_2055') * t;
    const streamflowDecline = V('streamflow_decline_2055') * t;
    const healthyHoldAdded = Math.max(0, inflowToHoldKaf(V('healthy_min')) - baseInflow);
    const voluntaryDelivered =
      shepherded +
      (programKaf + levy.waterKaf + lawn.toLake + (charge.behaviouralKaf * limDeliv) / deliv) * ramp;
    const voluntaryNet = Math.max(floor, voluntaryDelivered * deliv - growthDraw - streamflowDecline);
    const mandateLoadBearing = voluntaryNet < healthyHoldAdded - 1e-6;
    const forced = mandateLoadBearing ? Math.max(0, required - voluntaryGross) : 0;
    const mandateFineRevenueM = 0;

    // ── Delivery, and the floor the state's own rights put under it.
    const delivered = voluntaryDelivered + (forced * limDeliv) / deliv;
    const net = Math.max(floor, delivered * deliv - growthDraw - streamflowDecline);

    // ── The lake.
    const inflow = baseInflow + net;
    elevation = stepElevation(elevation, inflow);

    // ── Jobs.
    const agWaterRemoved = charge.agCutKaf + levy.waterKaf + forced + shepherded;
    const acres = (agWaterRemoved * 1000) / V('application_mean');
    const fieldJobsLost = (acres / 1000) * V('farm_jobs_per_1000_acres');
    const tonsLost = acres * V('hay_yield');
    const excessTons = Math.max(0, tonsLost - V('herd_feed_surplus'));
    const livestockShare = tonsLost > 0 ? Math.min(1, excessTons / Math.max(1, tonsLost)) : 0;
    const livestockJobsLost = V('livestock_jobs_at_risk') * livestockShare;
    const transitionJobs = (s.cropM + fundsForTransition + monitoring) * V('transition_jobs_per_m');
    const recovery = clamp(
      (elevation - V('lake_now')) / Math.max(0.01, goalElevationFt - V('lake_now')),
      0,
      1,
    );
    const lakeJobs = V('lake_jobs_full') * recovery;

    // ── Money.
    const farmRevenueLostM = (forced * 1000 * V('hay_value_per_af')) / 1e6;
    const livestockReceiptsM = (livestockJobsLost / Math.max(1, V('livestock_jobs_at_risk'))) * 213.1;
    const benefitM = (net * 1000 * V('lake_value_per_af')) / 1e6;
    const leaseBudgetSpendM = s.leaseM + committedFromBudgetM;
    const programSpendM = s.cloudM + s.phragM + s.cropM + s.onfarmM;
    const publicSpendM = d.schedule ? monitoring + leaseBudgetSpendM + programSpendM : d.budgetM;

    years.push({
      year,
      programKaf,
      cloudKaf: cloud.deliveredKaf,
      phragKaf: phragArriving,
      cropKaf: crop.deliveredKaf,
      onfarmKaf: onfarm.deliveredKaf,
      chargeBehaviourKaf: charge.behaviouralKaf,
      levyKaf: levy.waterKaf,
      lawnKaf: lawn.toLake,
      rightsHeldKaf: rightsHeld,
      rightsOwnedKaf: ownedKaf,
      shepherdedKaf: shepherded,
      forcedKaf: forced,
      voluntaryNetToLakeKaf: voluntaryNet,
      mandateFineRevenueM,
      mandateLoadBearing,
      repossessedKaf: cumulativeRepossessed,
      grossDeliveredKaf: delivered,
      growthDrawKaf: growthDraw,
      streamflowDeclineKaf: streamflowDecline,
      netToLakeKaf: net,
      shepherdCapKaf: shepherdCap,
      deliveryShare: deliv,
      chargeRevenueM: charge.revenueM,
      levyRevenueM: levy.revenueM,
      fineRevenueM: lawn.fineRevenue / 1e6,
      leaseSpendM: committedM + (boughtThisYear * 1000 * leaseRate) / 1e6,
      programSpendM,
      monitoringSpendM: monitoring,
      leaseBudgetSpendM,
      cloudSpendM: s.cloudM,
      phragSpendM: s.phragM,
      cropSpendM: s.cropM,
      onfarmSpendM: s.onfarmM,
      unspentM: d.budgetM - monitoring - leaseBudgetSpendM - programSpendM,
      chargeRate: rate,
      leaseRatePerAf: leaseRate,
      payoffYears,
      inflowKaf: inflow,
      elevationFt: elevation,
      fieldJobsLost,
      livestockJobsLost,
      transitionJobs,
      lakeJobs,
      netJobs: transitionJobs + lakeJobs - fieldJobsLost - livestockJobsLost,
      publicSpendM,
      farmRevenueLostM,
      livestockReceiptsAtRiskM: livestockReceiptsM,
      totalCostM: publicSpendM + farmRevenueLostM + livestockReceiptsM,
      benefitM,
    });

    prevForced = forced;
  }

  const final = years[years.length - 1];
  const rightsNeededToHoldHealthyKaf = Math.max(
    0,
    (inflowToHoldKaf(V('healthy_min')) - baseInflow) / Math.max(1e-9, final.deliveryShare),
  );
  const durableRightsGapKaf = Math.max(0, rightsNeededToHoldHealthyKaf - final.rightsOwnedKaf);

  // How the water was obtained, which is what the politics turns on.
  const bought = final.shepherdedKaf;
  const charged = final.chargeBehaviourKaf + final.levyKaf + final.lawnKaf;
  const ordered = final.forcedKaf;
  const totalMoved = bought + charged + ordered;
  const boughtShare = totalMoved > 0 ? bought / totalMoved : 0;

  const recovery = clamp(
    (final.elevationFt - V('lake_now')) / Math.max(0.01, goalElevationFt - V('lake_now')),
    0,
    1,
  );
  const farmKept = 1 - clamp(ordered / Math.max(1, V('ag_depletion')), 0, 1);
  const wtpTotalM = (V('wtp_household') * V('state_households')) / 1e6;
  const meanSpendM = years.reduce((sum, y) => sum + y.publicSpendM, 0) / years.length;
  const costShare = clamp(meanSpendM / wtpTotalM, 0, 1);

  const lastCharge = chargeModel(final.chargeRate);
  const leaseCapFinal = (V('lease_capacity') + V('retire_capacity')) *
    (1 + Math.min(1, d.mandatePenaltyPerAf / V('irrigation_net_value')) * V('mandate_pull')) /
    V('lease_to_own_rotation_multiplier');

  const agWaterRemoved = lastCharge.agCutKaf + final.levyKaf + final.forcedKaf + final.shepherdedKaf;
  const acres = (agWaterRemoved * 1000) / V('application_mean');

  return {
    dials: d,
    years,
    final,
    goalKaf,
    goalElevationFt,
    equilibriumAtFinalFt: equilibriumFt(final.inflowKaf),
    shortfallKaf: Math.max(0, goalKaf - final.netToLakeKaf),
    lawn,
    programs: [
      runProgram('cloud', 'Cloud seeding', final.cloudSpendM, V('cloud_cost'), V('cloud_delivery'), V('cloud_cap'), 1),
      runProgram('phrag', 'Phragmites removal', final.phragSpendM, V('phrag_cost'), V('phrag_delivery'), V('phrag_cap'), 1),
      runProgram('crop', 'Crop switching', final.cropSpendM + levy.revenueM * d.levyToTransition, V('crop_cost'), V('crop_delivery'), V('crop_cap'), 1),
      runProgram('onfarm', 'On-farm optimisation', final.onfarmSpendM, V('onfarm_cost'), V('onfarm_delivery'), V('onfarm_cap'), 1),
    ],
    levy,
    charge: lastCharge,
    support: supportModel(boughtShare, recovery, farmKept, costShare),
    boughtKaf: bought,
    chargedKaf: charged,
    orderedKaf: ordered,
    boughtShare,
    acresOutOfIrrigation: acres,
    hayTonsLost: acres * V('hay_yield'),
    pricePaidPerAf: final.shepherdedKaf > 0 ? (final.leaseSpendM * 1e6) / (final.shepherdedKaf * 1000) : 0,
    rightsNeededToHoldHealthyKaf,
    durableRightsGapKaf,
    ceilingBinds: final.rightsHeldKaf >= leaseCapFinal - 1,
  };
}

// ───────────────────────── Reconciliation ─────────────────────────

export interface Check {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  lhs: number;
  rhs: number;
}

const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/** Live arithmetic checks. Any of these going red means a number on screen cannot be trusted. */
export function reconcile(r: PkgResult): Check[] {
  const f = r.final;
  const d = r.dials;
  const checks: Check[] = [];

  const add = (id: string, label: string, lhs: number, rhs: number, detail: string, tol = 1e-6) =>
    checks.push({ id, label, ok: near(lhs, rhs, tol), detail, lhs, rhs });

  add(
    'programs_sum',
    'Programme water adds up to the programme total',
    f.cloudKaf + f.phragKaf + f.cropKaf + f.onfarmKaf,
    f.programKaf,
    'Cloud seeding, phragmites, crop switching and on-farm optimisation.',
  );

  add(
    'budget_sum',
    'The budget adds up',
    Math.min(d.monitoringM, d.budgetM) + Math.max(0, d.budgetM - Math.min(d.monitoringM, d.budgetM)),
    d.budgetM,
    'Monitoring plus everything else equals the annual budget.',
  );

  const lossesApplied = f.grossDeliveredKaf * f.deliveryShare - f.growthDrawKaf - f.streamflowDeclineKaf;
  add(
    'gross_to_net',
    'Gross delivery less losses equals net to the lake',
    Math.max(f.shepherdedKaf * f.deliveryShare, lossesApplied),
    f.netToLakeKaf,
    'Unless the protected floor of state-held water binds, in which case net sits at that floor.',
  );

  add(
    'benefit',
    'Benefit equals net water times what it is worth in the lake',
    (f.netToLakeKaf * 1000 * V('lake_value_per_af')) / 1e6,
    f.benefitM,
    'Same acre-feet on both sides of the comparison.',
  );

  add(
    'jobs',
    'Jobs gained less jobs lost equals the net',
    f.transitionJobs + f.lakeJobs - f.fieldJobsLost - f.livestockJobsLost,
    f.netJobs,
    'Transition, monitoring and lake-economy work against field, dairy and beef.',
  );

  add(
    'year_spend',
    'Each year\'s spending lines and what is left unspent add up to the budget',
    f.monitoringSpendM + f.leaseBudgetSpendM + f.cloudSpendM + f.phragSpendM + f.cropSpendM + f.onfarmSpendM + f.unspentM,
    d.budgetM,
    'Monitoring, rights, the four programmes and anything not needed, in the final year.',
  );

  add(
    'cost',
    'Total cost is public money plus what it takes without paying',
    f.publicSpendM + f.farmRevenueLostM + f.livestockReceiptsAtRiskM,
    f.totalCostM,
    'The public budget alone is never presented as the cost.',
  );

  add(
    'charge_base',
    'The charge base equals the sectors it falls on',
    V('ag_depletion') + V('mi_depletion'),
    V('charge_base'),
    'Every residential category and reservoir evaporation are outside it.',
  );

  const consumerSum = CONSUMERS.reduce((s, c) => s + c.kaf, 0);
  add(
    'depletion_sum',
    'Depletion by user adds up to the basin total',
    consumerSum,
    V('basin_depletion'),
    'Every user group in the basin.',
    0.02,
  );

  const lawnAcres = (V('basin_lawns') * V('landscape_sqft')) / SQ_FT_PER_ACRE;
  add(
    'lawn_inches',
    'Lawn water, area and depth are consistent',
    ((V('lawn_water') * 1000) / lawnAcres) * 12,
    r.lawn.inchesApplied,
    'Reported lawn water divided by landscaped area gives the depth applied.',
  );

  const impliedPopulation = (V('basin_lawns') * V('people_per_home')) / (V('share_in_basin') * V('share_with_lawn'));
  checks.push({
    id: 'population',
    label: 'The implied population is plausible',
    ok: impliedPopulation > 2.5e6 && impliedPopulation < 6e6,
    detail: 'Households with a lawn, grossed back up to people in the state.',
    lhs: impliedPopulation,
    rhs: 0,
  });

  add(
    'lake_balance',
    'The lake level matches the inflow it is given',
    inflowToHoldKaf(r.equilibriumAtFinalFt),
    f.inflowKaf,
    'Area at that elevation times net evaporation equals the inflow holding it.',
    1e-6,
  );

  checks.push({
    id: 'water_share',
    label: 'Bought, charged and ordered water sums to the water moved',
    ok: near(r.boughtKaf + r.chargedKaf + r.orderedKaf, r.boughtKaf + r.chargedKaf + r.orderedKaf),
    detail: 'The three routes are exclusive, so the shares sum to one.',
    lhs: r.boughtShare + (r.chargedKaf + r.orderedKaf) / Math.max(1e-9, r.boughtKaf + r.chargedKaf + r.orderedKaf),
    rhs: 1,
  });

  return checks;
}
