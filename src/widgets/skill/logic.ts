import { todayStr } from '../../core/logic/dates';
import { grantXp, levelProgress, xpToNext, type XpState } from '../../core/logic/xp';
import type { WidgetLogic } from '../types';

/**
 * Skill = an RPG track that levels from XP (The Blossom skill.js). In The
 * Blossom, XP accrues from linked values + nested widgets at day rollover; here
 * the Skill is standalone — you grant XP directly (a session, a win), and it can
 * optionally fold linked outputs via ctx.readLink later. Same level curve
 * (xp.ts): xpToNext(level) = max(10, round(50·level^1.4 / 10)·10).
 */
export interface SkillEntry {
  date: string;
  amount: number;
}
export interface SkillState extends XpState {
  name: string;
  log: SkillEntry[];
}
export type SkillAction =
  | { type: 'grant'; amount: number }
  | { type: 'setName'; name: string };

export { xpToNext, levelProgress };

export const skillLogic: WidgetLogic<SkillState, SkillAction> = {
  defaults: () => ({ name: 'Skill', level: 1, xp: 0, log: [] }),
  reduce(state, action) {
    switch (action.type) {
      case 'grant': {
        const next = grantXp({ level: state.level, xp: state.xp }, action.amount);
        return {
          ...state,
          level: next.level,
          xp: next.xp,
          log: [...state.log, { date: todayStr(), amount: action.amount }],
        };
      }
      case 'setName':
        return { ...state, name: action.name };
      default:
        return state;
    }
  },
};
