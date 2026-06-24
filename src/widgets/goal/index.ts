import type { Widget } from '../types';
import { goalLogic, progress, type GoalAction, type GoalState } from './logic';
import { GoalCard, GoalFull } from './View';

export const goalWidget: Widget<GoalState, GoalAction> = {
  type: 'goal',
  title: 'Goal',
  icon: 'target',
  category: 'Productivity',
  keywords: ['target', 'milestone', 'progress', 'seed'],
  logic: goalLogic,
  CardView: GoalCard,
  FullView: GoalFull,
  outputs: (state) => [{ key: 'progress', name: 'Progress', get: () => progress(state) }],
};
