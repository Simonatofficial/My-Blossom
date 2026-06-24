import { dateAdd, todayStr } from '../../core/logic/dates';
import type { WidgetLogic } from '../types';

/**
 * Habit = a Quest with the COSMOS method built in (The Blossom docs/06). The
 * card is the trigger sentence + one-tap tier buttons; MVV always saves the
 * streak. Faithful port of habit.js's model, kept pure.
 *
 * COSMOS fields: Clarify (purpose) · Outline (goal/metric) · Set a trigger
 * (anchor/place/time) · Map tiers (mvv/standard/stretch) · Observe (the log) ·
 * Sustain (weekly review / adherence).
 */
export const TIERS = [
  { key: 'mvv', label: 'MVV', hint: 'tiny — saves the streak' },
  { key: 'standard', label: 'Standard', hint: 'a normal day' },
  { key: 'stretch', label: 'Stretch', hint: 'when inspired (+25% coins)' },
] as const;
export type TierKey = (typeof TIERS)[number]['key'];

export interface HabitState {
  // trigger
  anchor: string;
  place: string;
  time: string;
  // cosmos
  purpose: string;
  goal: string;
  metric: string;
  tiers: { mvv: string; standard: string; stretch: string };
  weeklyTarget: number; // days/week
  difficulty: 'sprout' | 'bloom' | 'flourish' | 'radiant';
  // observe
  log: Record<string, TierKey>; // date → tier done
  streak: number;
  best: number;
  lastRolled: string | null;
  /** Which aspect attribute this habit grows (default discipline; a preset/
   *  settings can retarget it, e.g. an Activity habit → strength). */
  growthAttribute: string;
}
export type HabitAction =
  | { type: 'logTier'; date: string; tier: TierKey }
  | { type: 'clearDay'; date: string }
  | { type: 'setMeta'; patch: Partial<Omit<HabitState, 'log' | 'streak' | 'best' | 'lastRolled'>> };

export function triggerSentence(s: HabitState): string {
  if (!s.anchor) return 'Set a trigger to begin';
  const bits = [`After ${s.anchor}`];
  if (s.place) bits.push(`at ${s.place}`);
  if (s.time) bits.push(`around ${s.time}`);
  return `${bits.join(', ')} — ${s.tiers.mvv || s.tiers.standard || 'begin'}`;
}

/** Current streak: consecutive days up to today with any tier logged. */
export function computeStreak(log: Record<string, TierKey>, today = todayStr()): number {
  let streak = 0;
  let d = today;
  // a streak survives if today isn't done yet; start from yesterday in that case
  if (!log[d]) d = dateAdd(d, -1);
  while (log[d]) {
    streak += 1;
    d = dateAdd(d, -1);
  }
  return streak;
}

/** Adherence over the last 7 days vs the weekly target (0..100). */
export function adherence(s: HabitState, today = todayStr()): number {
  const target = s.weeklyTarget || 7;
  let done = 0;
  for (let i = 0; i < 7; i++) if (s.log[dateAdd(today, -i)]) done++;
  return Math.min(100, Math.round((done / target) * 100));
}

export const habitLogic: WidgetLogic<HabitState, HabitAction> = {
  defaults: () => ({
    anchor: '', place: '', time: '',
    purpose: '', goal: '', metric: '',
    tiers: { mvv: '', standard: '', stretch: '' },
    weeklyTarget: 7, difficulty: 'bloom',
    log: {}, streak: 0, best: 0, lastRolled: null,
    growthAttribute: 'discipline',
  }),
  reduce(state, action) {
    switch (action.type) {
      case 'logTier': {
        const log = { ...state.log, [action.date]: action.tier };
        const streak = computeStreak(log);
        return { ...state, log, streak, best: Math.max(state.best, streak) };
      }
      case 'clearDay': {
        const log = { ...state.log };
        delete log[action.date];
        const streak = computeStreak(log);
        return { ...state, log, streak };
      }
      case 'setMeta':
        return { ...state, ...action.patch };
      default:
        return state;
    }
  },
  onDayRolled(state, today) {
    const streak = computeStreak(state.log, today);
    return { ...state, streak, best: Math.max(state.best, streak), lastRolled: today };
  },
  // A habit builds DISCIPLINE. Award once per newly-logged day (re-tapping the
  // same day is idempotent → no growth), scaled by tier. (The Blossom: tiers
  // earn proportionally; MVV still counts.)
  grows(prev, next, action) {
    if (action.type !== 'logTier') return [];
    if (prev.log[action.date]) return []; // day already had a tier → no double-award
    const amount = action.tier === 'stretch' ? 15 : action.tier === 'standard' ? 10 : 6;
    return [{ attribute: next.growthAttribute || 'discipline', amount }];
  },
};
