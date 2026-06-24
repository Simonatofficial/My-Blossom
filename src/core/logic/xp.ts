/**
 * XP + level curve — pure. The level cost grows smoothly; granting XP rolls over
 * as many levels as the amount covers. Ported from The Blossom's skill.js:
 *   xpToNext(level) = max(10, round(50 · level^1.4 / 10) · 10)
 */

export function xpToNext(level: number): number {
  return Math.max(10, Math.round((50 * Math.pow(level, 1.4)) / 10) * 10);
}

export interface XpState {
  level: number;
  xp: number; // progress into the current level
}

export interface GrantResult extends XpState {
  leveled: number; // how many levels gained this grant (0 if none)
}

/** Add XP, applying any level-ups. Pure: returns a fresh state. */
export function grantXp(state: XpState, amount: number): GrantResult {
  let { level, xp } = state;
  let leveled = 0;
  xp += Math.max(0, Math.round(amount));
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
    leveled += 1;
  }
  return { level, xp, leveled };
}

/** Progress 0..1 into the current level (for rings/bars). */
export function levelProgress(state: XpState): number {
  return Math.min(1, state.xp / xpToNext(state.level));
}
