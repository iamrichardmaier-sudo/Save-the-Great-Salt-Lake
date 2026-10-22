/**
 * The physical core: a closed terminal basin with no outlet.
 *
 * Evaporation is the only way water leaves, so the lake settles where inflow equals net
 * evaporation over its own surface. A bigger lake has more surface and evaporates more, which
 * is why each foot of recovery costs more inflow than the last.
 *
 * Everything downstream is meaningless if this is wrong, so `lake.test.ts` validates it against
 * the published simulations before any policy lever exists.
 */

import { AREA_ANCHORS, V } from './data';

const ACRES_PER_SQ_MI = 640;

/** Net evaporation the rivers have to replace: what leaves, less what falls on the lake. */
export function netEvaporationFtPerYr(): number {
  return V('evap_gross') - V('precip_lake');
}

/**
 * Surface area at a given elevation, piecewise linear between the published anchors.
 * Outside the anchored range the nearest segment's slope continues, so the model degrades
 * predictably rather than returning nonsense.
 */
export function areaSqMi(ft: number): number {
  const a = AREA_ANCHORS;
  if (ft <= a[0].ft) {
    const slope = (a[1].sqmi - a[0].sqmi) / (a[1].ft - a[0].ft);
    return Math.max(0, a[0].sqmi + (ft - a[0].ft) * slope);
  }
  for (let i = 0; i < a.length - 1; i++) {
    const lo = a[i];
    const hi = a[i + 1];
    if (ft <= hi.ft) {
      const t = (ft - lo.ft) / (hi.ft - lo.ft);
      return lo.sqmi + t * (hi.sqmi - lo.sqmi);
    }
  }
  const lo = a[a.length - 2];
  const hi = a[a.length - 1];
  const slope = (hi.sqmi - lo.sqmi) / (hi.ft - lo.ft);
  return hi.sqmi + (ft - hi.ft) * slope;
}

/** The inverse: the elevation at which the lake has a given surface area. */
export function elevationForAreaSqMi(sqmi: number): number {
  const a = AREA_ANCHORS;
  if (sqmi <= a[0].sqmi) {
    const slope = (a[1].sqmi - a[0].sqmi) / (a[1].ft - a[0].ft);
    return a[0].ft + (sqmi - a[0].sqmi) / slope;
  }
  for (let i = 0; i < a.length - 1; i++) {
    const lo = a[i];
    const hi = a[i + 1];
    if (sqmi <= hi.sqmi) {
      const t = (sqmi - lo.sqmi) / (hi.sqmi - lo.sqmi);
      return lo.ft + t * (hi.ft - lo.ft);
    }
  }
  const lo = a[a.length - 2];
  const hi = a[a.length - 1];
  const slope = (hi.sqmi - lo.sqmi) / (hi.ft - lo.ft);
  return hi.ft + (sqmi - hi.sqmi) / slope;
}

export function areaAcres(ft: number): number {
  return areaSqMi(ft) * ACRES_PER_SQ_MI;
}

/** River inflow needed to hold the lake at a given elevation, in thousand acre-feet a year. */
export function inflowToHoldKaf(ft: number): number {
  return (areaAcres(ft) * netEvaporationFtPerYr()) / 1000 / V('inflow_efficiency');
}

/** Where the lake settles, given a sustained river inflow. */
export function equilibriumFt(inflowKaf: number): number {
  const acres = (inflowKaf * 1000 * V('inflow_efficiency')) / netEvaporationFtPerYr();
  return elevationForAreaSqMi(acres / ACRES_PER_SQ_MI);
}

/** Added inflow needed, above today's, to settle at a given elevation. */
export function addedInflowForFt(ft: number, baselineInflowKaf = V('baseline_inflow')): number {
  return inflowToHoldKaf(ft) - baselineInflowKaf;
}

/**
 * One year of lake response: the level moves a fixed share of the way toward where the current
 * inflow would eventually hold it.
 */
export function stepElevation(previousFt: number, inflowKaf: number, k = V('response_k')): number {
  const target = equilibriumFt(inflowKaf);
  return previousFt + k * (target - previousFt);
}

/** The whole path, year by year, from a starting level and a series of annual inflows. */
export function elevationPath(
  startFt: number,
  inflowsKaf: readonly number[],
  k = V('response_k'),
): number[] {
  const out: number[] = [];
  let e = startFt;
  for (const inflow of inflowsKaf) {
    e = stepElevation(e, inflow, k);
    out.push(e);
  }
  return out;
}
