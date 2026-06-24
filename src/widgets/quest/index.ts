import type { Widget } from '../types';
import { questLogic, stepStats, type QuestAction, type QuestState } from './logic';
import { QuestCard, QuestFull } from './View';

export const questWidget: Widget<QuestState, QuestAction> = {
  type: 'quest',
  title: 'Quest',
  icon: 'flag',
  category: 'Productivity',
  keywords: ['task', 'todo', 'mission', 'steps', 'goal'],
  logic: questLogic,
  CardView: QuestCard,
  FullView: QuestFull,
  // % complete — feeds Goals (weighted progress) and the Blossom loop.
  outputs: (state) => [{ key: 'pct', name: 'Progress', get: () => stepStats(state).pct }],
  settings: [
    { key: 'difficulty', label: 'Difficulty', type: 'select', options: [
      { label: 'Easy', value: 'sprout' }, { label: 'Medium', value: 'bloom' },
      { label: 'Hard', value: 'flourish' }, { label: 'Legendary', value: 'radiant' },
    ] },
    { key: 'dueDate', label: 'Due date', type: 'text', hint: 'YYYY-MM-DD (optional)' },
  ],
};
