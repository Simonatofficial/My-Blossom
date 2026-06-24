import type { Widget } from '../types';
import { adherence, habitLogic, type HabitAction, type HabitState } from './logic';
import { HabitCard, HabitFull } from './View';

export const habitWidget: Widget<HabitState, HabitAction> = {
  type: 'habit',
  title: 'Habit',
  icon: 'repeat',
  category: 'Productivity',
  keywords: ['cosmos', 'anchor', 'trigger', 'tiny', 'streak', 'routine'],
  logic: habitLogic,
  CardView: HabitCard,
  FullView: HabitFull,
  // weekly adherence — a clean signal for the Blossom loop (e.g. Discipline).
  outputs: (state) => [{ key: 'adherence', name: 'Adherence', get: () => adherence(state) }],
  settings: [
    { key: 'anchor', label: 'After I…', type: 'text', hint: 'the existing habit you anchor to' },
    { key: 'weeklyTarget', label: 'Days per week', type: 'number' },
  ],
};
