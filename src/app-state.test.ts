import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  atEnd,
  currentYear,
  DEFAULT_SPEED,
  getState,
  resetState,
  setDials,
  setPlaying,
  setSelectedPersona,
  setSpeed,
  setState,
  setYearIndex,
  stepYear,
  subscribe,
  toggleStar,
} from './app-state';
import { DEFAULT_DIALS } from './model';

beforeEach(() => {
  resetState();
});

describe('the store starts somewhere sensible', () => {
  it('holds a result matching its dials', () => {
    const s = getState();
    expect(s.result.dials).toEqual(s.dials);
    expect(s.result.years.length).toBeGreaterThan(0);
  });

  it('starts at the first year, paused, with nothing selected', () => {
    const s = getState();
    expect(s.yearIndex).toBe(0);
    expect(s.playing).toBe(false);
    expect(s.speed).toBe(DEFAULT_SPEED);
    expect(s.selectedPersonaId).toBeNull();
    expect(s.starredDials.size).toBe(0);
  });

  it('defaults to a playback speed a person would sit through', () => {
    // Twenty-nine years at ten seconds each is five minutes. Nobody watches that.
    const years = getState().result.years.length;
    expect(DEFAULT_SPEED * years).toBeLessThan(120);
  });
});

describe('subscribing', () => {
  it('notifies on change', () => {
    const seen = vi.fn();
    subscribe(seen);
    setYearIndex(3);
    expect(seen).toHaveBeenCalledTimes(1);
    expect(seen.mock.calls[0][0].yearIndex).toBe(3);
  });

  it('stops notifying once unsubscribed', () => {
    const seen = vi.fn();
    const off = subscribe(seen);
    setYearIndex(1);
    off();
    setYearIndex(2);
    expect(seen).toHaveBeenCalledTimes(1);
    expect(getState().yearIndex).toBe(2);
  });

  it('notifies every listener', () => {
    const a = vi.fn();
    const b = vi.fn();
    subscribe(a);
    subscribe(b);
    setYearIndex(1);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('survives a listener unsubscribing itself mid-notify', () => {
    const off = subscribe(() => off());
    expect(() => setYearIndex(1)).not.toThrow();
  });
});

describe('setting dials re-runs the model', () => {
  it('produces a result for the dials that were set', () => {
    setDials({ budgetM: 400 });
    const s = getState();
    expect(s.dials.budgetM).toBe(400);
    expect(s.result.dials.budgetM).toBe(400);
  });

  it('actually changes the outcome', () => {
    const before = getState().result.final.netToLakeKaf;
    setDials({ mandateFloorKaf: 0, scarcityRatePerAf: 0, cloudM: 0, phragM: 0, cropSwitchM: 0 });
    expect(getState().result.final.netToLakeKaf).not.toBeCloseTo(before, 6);
  });

  it('never leaves the result disagreeing with the dials', () => {
    for (const budget of [50, 200, 800]) {
      setDials({ budgetM: budget });
      expect(getState().result.dials).toEqual(getState().dials);
    }
  });

  it('leaves the result alone when the dials did not change', () => {
    const before = getState().result;
    setState({ playing: true });
    expect(getState().result).toBe(before);
  });
});

describe('the year cursor', () => {
  it('clamps below zero', () => {
    setYearIndex(-5);
    expect(getState().yearIndex).toBe(0);
  });

  it('clamps past the end', () => {
    setYearIndex(9999);
    expect(getState().yearIndex).toBe(getState().result.years.length - 1);
  });

  it('clamps when a shorter horizon makes the current year disappear', () => {
    setYearIndex(getState().result.years.length - 1);
    setDials({ horizon: DEFAULT_DIALS.startYear + 5 });
    const s = getState();
    expect(s.yearIndex).toBeLessThanOrEqual(s.result.years.length - 1);
    expect(s.result.years[s.yearIndex]).toBeDefined();
  });

  it('steps forward and back', () => {
    stepYear(4);
    expect(getState().yearIndex).toBe(4);
    stepYear(-2);
    expect(getState().yearIndex).toBe(2);
  });

  it('knows when it is at the end', () => {
    expect(atEnd()).toBe(false);
    setYearIndex(getState().result.years.length - 1);
    expect(atEnd()).toBe(true);
  });

  it('always returns a real row for the cursor', () => {
    for (let i = -2; i < getState().result.years.length + 2; i++) {
      setYearIndex(i);
      expect(currentYear()).toBeDefined();
      expect(currentYear().year).toBeGreaterThan(2000);
    }
  });
});

describe('playback and selection', () => {
  it('round-trips playing and speed', () => {
    setPlaying(true);
    expect(getState().playing).toBe(true);
    setSpeed(0.5);
    expect(getState().speed).toBe(0.5);
  });

  it('refuses a speed of zero, which would never advance', () => {
    setSpeed(0);
    expect(getState().speed).toBeGreaterThan(0);
  });

  it('round-trips the selected persona', () => {
    setSelectedPersona('p-12');
    expect(getState().selectedPersonaId).toBe('p-12');
    setSelectedPersona(null);
    expect(getState().selectedPersonaId).toBeNull();
  });
});

describe('starring a dial as a constraint', () => {
  it('toggles on and off', () => {
    toggleStar('budgetM');
    expect(getState().starredDials.has('budgetM')).toBe(true);
    toggleStar('budgetM');
    expect(getState().starredDials.has('budgetM')).toBe(false);
  });

  it('does not mutate the previous set, so views can compare', () => {
    const before = getState().starredDials;
    toggleStar('budgetM');
    expect(before.has('budgetM')).toBe(false);
    expect(getState().starredDials).not.toBe(before);
  });
});
