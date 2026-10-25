/**
 * The one shared store.
 *
 * Four streams build views against this. The rule that keeps them consistent: **no view owns a
 * clock and no view runs the model**. A view reads the year from here and renders it. When the
 * year moves, every view moves together, because there is only one year.
 *
 * Plain TypeScript, no framework, no dependencies.
 */

import { DEFAULT_DIALS, pkgModel, type Dials, type PkgResult } from './model';

export interface AppState {
  /** Every lever, as the model takes them. */
  dials: Dials;
  /** The model's output for those dials. Never set this directly; set dials and it re-runs. */
  result: PkgResult;
  /** Index into `result.years`, not a calendar year. Always in range. */
  yearIndex: number;
  /** Playback across the year path. */
  playing: boolean;
  /** Seconds of wall clock per model year. */
  speed: number;
  /** Which persona the reader has opened, if any. */
  selectedPersonaId: string | null;
  /** Dials the reader has starred as constraints rather than free variables. */
  starredDials: ReadonlySet<keyof Dials>;
}

export type Listener = (state: AppState) => void;

/** Seconds per year. Twenty-nine years at ten seconds each is five minutes, which is too long. */
export const DEFAULT_SPEED = 2;

function build(dials: Dials): AppState {
  return {
    dials,
    result: pkgModel(dials),
    yearIndex: 0,
    playing: false,
    speed: DEFAULT_SPEED,
    selectedPersonaId: null,
    starredDials: new Set(),
  };
}

let state: AppState = build({ ...DEFAULT_DIALS });
const listeners = new Set<Listener>();

export function getState(): AppState {
  return state;
}

/**
 * Merge a change into the state and notify.
 *
 * Setting `dials` re-runs the model, because a result that disagrees with the dials that produced
 * it is the one bug this store exists to prevent. The year index is clamped to the new path, so
 * shortening the horizon can never leave the cursor pointing past the end.
 */
export function setState(partial: Partial<AppState>): AppState {
  const next: AppState = { ...state, ...partial };

  if (partial.dials && partial.dials !== state.dials) {
    next.result = pkgModel(partial.dials);
  }

  const lastIndex = Math.max(0, next.result.years.length - 1);
  next.yearIndex = Math.min(Math.max(0, Math.round(next.yearIndex)), lastIndex);

  state = next;
  for (const fn of [...listeners]) fn(state);
  return state;
}

/** Subscribe to every change. Returns the unsubscribe. */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// ───────────────────────── Convenience ─────────────────────────

/** Change some dials without rebuilding the whole object. */
export function setDials(partial: Partial<Dials>): AppState {
  return setState({ dials: { ...state.dials, ...partial } });
}

/** The row the cursor is on. */
export function currentYear() {
  return state.result.years[state.yearIndex] ?? state.result.final;
}

/** Move the cursor. Clamped, so callers never have to bounds-check. */
export function stepYear(delta: number): AppState {
  return setState({ yearIndex: state.yearIndex + delta });
}

export function setYearIndex(index: number): AppState {
  return setState({ yearIndex: index });
}

/** True when the cursor is on the last year of the path. */
export function atEnd(): boolean {
  return state.yearIndex >= state.result.years.length - 1;
}

export function setPlaying(playing: boolean): AppState {
  return setState({ playing });
}

export function setSpeed(secondsPerYear: number): AppState {
  return setState({ speed: Math.max(0.1, secondsPerYear) });
}

/** Star a dial as a constraint, or unstar it. */
export function toggleStar(dial: keyof Dials): AppState {
  const starred = new Set(state.starredDials);
  if (starred.has(dial)) starred.delete(dial);
  else starred.add(dial);
  return setState({ starredDials: starred });
}

export function setSelectedPersona(id: string | null): AppState {
  return setState({ selectedPersonaId: id });
}

/** Back to the defaults. Mainly for tests, which must not leak state into each other. */
export function resetState(dials: Dials = { ...DEFAULT_DIALS }): AppState {
  state = build(dials);
  for (const fn of [...listeners]) fn(state);
  return state;
}
