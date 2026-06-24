import { uuid } from '../../core/store/ids';
import type { WidgetLogic } from '../types';

/**
 * Goal = a seed that matures as progress grows (The Blossom goal.js). Progress
 * is a weighted average of its milestones; in The Blossom it ALSO folds in linked
 * Quests/Habits (30-day completion). v1.0.0 keeps it standalone (milestones own
 * the progress) and will optionally fold linked outputs via ctx.readLink later —
 * so a Goal works fully on its own, never throwing if nothing is linked.
 */
export interface Milestone {
  id: string;
  name: string;
  done: boolean;
  weight: number;
}
export interface GoalState {
  note: string;
  milestones: Milestone[];
}
export type GoalAction =
  | { type: 'addMilestone'; name: string; weight?: number }
  | { type: 'toggleMilestone'; id: string }
  | { type: 'removeMilestone'; id: string }
  | { type: 'setNote'; note: string };

export function progress(s: GoalState): number {
  if (s.milestones.length === 0) return 0;
  const wsum = s.milestones.reduce((a, m) => a + (m.weight || 1), 0);
  const got = s.milestones.reduce((a, m) => a + (m.done ? 100 : 0) * (m.weight || 1), 0);
  return Math.round(got / (wsum || 1));
}

/** Growth stage icon by progress (circle → leaf → sprout → flower). */
export function stageIcon(pct: number): string {
  if (pct >= 100) return 'flower';
  if (pct >= 60) return 'sprout';
  if (pct >= 25) return 'leaf';
  return 'circle';
}

export const goalLogic: WidgetLogic<GoalState, GoalAction> = {
  defaults: () => ({ note: '', milestones: [] }),
  reduce(state, action) {
    switch (action.type) {
      case 'addMilestone':
        return { ...state, milestones: [...state.milestones, { id: uuid(), name: action.name, done: false, weight: action.weight ?? 1 }] };
      case 'toggleMilestone':
        return { ...state, milestones: state.milestones.map((m) => (m.id === action.id ? { ...m, done: !m.done } : m)) };
      case 'removeMilestone':
        return { ...state, milestones: state.milestones.filter((m) => m.id !== action.id) };
      case 'setNote':
        return { ...state, note: action.note };
      default:
        return state;
    }
  },
  // Reaching a milestone is hard-won WISDOM — 20 XP per newly-completed milestone.
  grows(prev, next) {
    const before = prev.milestones.filter((m) => m.done).length;
    const after = next.milestones.filter((m) => m.done).length;
    if (after <= before) return [];
    return [{ attribute: 'wisdom', amount: (after - before) * 20 }];
  },
};
