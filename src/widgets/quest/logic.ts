import { uuid } from '../../core/store/ids';
import type { WidgetLogic } from '../types';

/** Difficulty → display label + signature (The Blossom's DIFF_DISPLAY). */
export const DIFFICULTY = {
  sprout: 'Easy',
  bloom: 'Medium',
  flourish: 'Hard',
  radiant: 'Legendary',
} as const;
export type Difficulty = keyof typeof DIFFICULTY;

export interface Step {
  id: string;
  text: string;
  done: boolean;
}
export interface QuestState {
  banner?: string;
  description?: string;
  difficulty: Difficulty;
  dueDate?: string;
  xp?: number; // explicit override; otherwise suggested = steps * 10
  steps: Step[];
}
export type QuestAction =
  | { type: 'addStep'; text: string }
  | { type: 'editStep'; id: string; text: string }
  | { type: 'toggleStep'; id: string }
  | { type: 'removeStep'; id: string }
  | { type: 'move'; id: string; dir: -1 | 1 }
  | { type: 'setMeta'; patch: Partial<Pick<QuestState, 'banner' | 'description' | 'difficulty' | 'dueDate' | 'xp'>> };

export function stepStats(s: QuestState) {
  const total = s.steps.length;
  const done = s.steps.filter((x) => x.done).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}
export function suggestedXp(s: QuestState): number {
  return s.xp != null ? s.xp : s.steps.length * 10;
}

/** Pure brain for the Quest tool — a step-based mission. Standalone. */
export const questLogic: WidgetLogic<QuestState, QuestAction> = {
  defaults: () => ({ difficulty: 'sprout', steps: [] }),
  reduce(state, action) {
    switch (action.type) {
      case 'addStep':
        return { ...state, steps: [...state.steps, { id: uuid(), text: action.text, done: false }] };
      case 'editStep':
        return { ...state, steps: state.steps.map((s) => (s.id === action.id ? { ...s, text: action.text } : s)) };
      case 'toggleStep':
        return { ...state, steps: state.steps.map((s) => (s.id === action.id ? { ...s, done: !s.done } : s)) };
      case 'removeStep':
        return { ...state, steps: state.steps.filter((s) => s.id !== action.id) };
      case 'move': {
        const i = state.steps.findIndex((s) => s.id === action.id);
        const j = i + action.dir;
        if (i < 0 || j < 0 || j >= state.steps.length) return state;
        const steps = [...state.steps];
        [steps[i], steps[j]] = [steps[j], steps[i]];
        return { ...state, steps };
      }
      case 'setMeta':
        return { ...state, ...action.patch };
      default:
        return state;
    }
  },
  // Completing quest steps earns FOCUS — 10 XP per newly-finished step. Diffing
  // prev→next means un-checking then re-checking never farms growth.
  grows(prev, next) {
    const before = prev.steps.filter((s) => s.done).length;
    const after = next.steps.filter((s) => s.done).length;
    if (after <= before) return [];
    return [{ attribute: 'focus', amount: (after - before) * 10 }];
  },
};
