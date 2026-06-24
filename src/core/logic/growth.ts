/**
 * The Blossom loop / growth engine — pure.
 *
 * Modules don't reach into each other; instead each emits **aspect-XP events**
 * (tagged by attribute, optionally skill) that the Blossom consumes to grow the
 * aspect flowers (docs/06, MERGE-SPEC §4.4). e.g. a study session →
 * { aspect:'mental', attribute:'learning', amount: 12 }. This file is the one
 * place that turns activity into growth, so wiring a new module = emitting events
 * here, never editing widgets.
 *
 * State is kept separate from the static ASPECTS roster (presets/aspects.ts):
 * here we store earned XP per attribute; levels are *derived* from it via the XP
 * curve, and the aspect level is the rounded mean of its attribute levels.
 */
import { grantXp, type XpState } from './xp';
import { MAX_LEVEL } from '@/presets/aspects';

export interface GrowthEvent {
  aspect: string; // 'mental' | 'physical' | ...
  attribute: string; // attribute id within that aspect
  amount: number; // XP
  skill?: string; // optional skill (star) tag
}

/** aspectId → attributeId → XpState. The earned-growth ledger. */
export type GrowthState = Record<string, Record<string, XpState>>;

export function emptyGrowth(): GrowthState {
  return {};
}

/** Apply one event; returns a fresh state (immutable). */
export function applyGrowth(state: GrowthState, ev: GrowthEvent): GrowthState {
  const aspect = { ...(state[ev.aspect] ?? {}) };
  const cur: XpState = aspect[ev.attribute] ?? { level: 1, xp: 0 };
  const next = grantXp(cur, ev.amount);
  aspect[ev.attribute] = {
    level: Math.min(MAX_LEVEL, next.level),
    xp: next.xp,
  };
  return { ...state, [ev.aspect]: aspect };
}

/** Derived attribute level (1 if untouched). */
export function attributeLevel(state: GrowthState, aspect: string, attribute: string): number {
  return state[aspect]?.[attribute]?.level ?? 1;
}

/** Derived aspect level = rounded mean of its attribute levels (1..MAX_LEVEL).
 *  `attributeIds` comes from the static roster so untouched attributes count as 1. */
export function aspectLevel(state: GrowthState, aspect: string, attributeIds: string[]): number {
  if (attributeIds.length === 0) return 1;
  const sum = attributeIds.reduce((a, id) => a + attributeLevel(state, aspect, id), 0);
  return Math.max(1, Math.min(MAX_LEVEL, Math.round(sum / attributeIds.length)));
}
