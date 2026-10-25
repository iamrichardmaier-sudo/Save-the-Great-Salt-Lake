/**
 * The interfaces every stream builds against.
 *
 * Types only, no logic. If four accounts each invent their own view shape or their own idea of
 * what a county allocation looks like, the merge is unsalvageable — so they all import from here.
 *
 * Adding to this file is a coordination event. Tell the other streams.
 */

import type { Dials, PkgResult, YearRow } from './model';
import type { AppState } from './app-state';

export type { AppState, Dials, PkgResult, YearRow };

/**
 * Every view implements this. Views render; they never run the model and never own a clock.
 * `update` is called on every store change — cheap, so keep it cheap.
 */
export interface View {
  mount(el: HTMLElement): void;
  update(state: AppState): void;
  destroy(): void;
}

/** One year of the path, as a view consumes it. */
export interface YearSnapshot {
  year: number;
  /** Index into `result.years`, for anything that needs to look backwards. */
  index: number;
  row: YearRow;
  /** The year before, where one exists — for computing what changed. */
  previous: YearRow | null;
}

/**
 * Farmland leaving irrigation, by county and year.
 *
 * Produced by the solver stream, consumed by the map. This is modelled from cost and land-value
 * ordering, not a prediction about individual farms: some owners will not sell at any price, and
 * the map must say so where a reader will see it.
 */
export interface CountyAllocation {
  countyFips: string;
  countyName: string;
  acresRetired: number;
  afFreed: number;
  year: number;
}

/**
 * A synthetic resident, drawn to match the basin's real demographics with attitudes sampled from
 * published polling.
 *
 * Not a real person and never named as one. Anything shown from a persona carries a visible label
 * that it is a modelled illustration.
 */
export interface Persona {
  id: string;
  countyFips: string;
  countyName: string;
  occupation: 'farm' | 'municipal' | 'industry' | 'other';
  partyLean: 'republican' | 'democrat' | 'independent';
  householdWaterUseAfPerYr: number;
  /** Sampled from polled distributions, not invented. */
  attitudes: {
    concernForLake: number;
    prefersIncentives: number;
    willingnessToPayPerYr: number;
  };
}

/** How a persona fares under a scenario, computed from the model rather than asserted. */
export interface PersonaReaction {
  /** −1 strongly against, +1 strongly in favour. */
  stance: number;
  /** What drove it, each traceable to a model output. */
  reasons: string[];
}

/**
 * What one more unit of a constraint buys.
 *
 * The number the walkthrough shows as "relax this and the objective improves by X". Produced by
 * the solver stream by perturbing a bound and re-solving.
 */
export interface ShadowPrice {
  constraintId: string;
  label: string;
  objectiveGainPerUnit: number;
  /** The unit of the constraint being relaxed, e.g. "$M/yr", so the figure reads correctly. */
  unit: string;
  /** False when the constraint is slack, in which case the gain is about nothing. */
  binding: boolean;
}

/** What the reader is trying to achieve. Registry lives in the solver stream. */
export interface Objective {
  id: string;
  label: string;
  /** One sentence, shown on the choice card in the walkthrough. */
  description: string;
  direction: 'max' | 'min';
  measure(result: PkgResult): number;
}

/** A bound the reader has imposed. */
export interface Constraint {
  id: string;
  label: string;
  /** The dial it bounds, where it maps to one. Null for an outcome constraint. */
  dialKey: keyof Dials | null;
  measure(result: PkgResult): number;
  bound: number;
  sense: '<=' | '>=';
  unit: string;
}

/** What the solver returns. */
export interface SolveResult {
  dials: Dials;
  result: PkgResult;
  objectiveValue: number;
  feasible: boolean;
  /** When infeasible, which constraint makes it so, in words a reader can act on. */
  infeasibleBecause: string | null;
  shadowPrices: ShadowPrice[];
}

/** The biggest change in a given year, for the running readout under the playback bar. */
export interface Highlight {
  kind: 'gain' | 'cost';
  /** A whole sentence with its number in it, built from model fields. */
  sentence: string;
  magnitude: number;
}
