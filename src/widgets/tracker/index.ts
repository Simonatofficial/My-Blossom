import type { OutputDef, Widget } from '../types';
import { trackerLogic, valueOf, type TrackerAction, type TrackerState } from './logic';
import { TrackerCard, TrackerFull } from './View';

export const trackerWidget: Widget<TrackerState, TrackerAction> = {
  type: 'tracker',
  title: 'Tracker',
  icon: 'activity',
  category: 'Productivity',
  keywords: ['habit', 'log', 'water', 'sleep', 'mood', 'daily', 'measure'],
  logic: trackerLogic,
  CardView: TrackerCard,
  FullView: TrackerFull,
  // One day-keyed output per tracked item — these feed Graphs and the Blossom loop.
  outputs: (state): OutputDef[] =>
    state.items.map((it) => ({
      key: it.id,
      name: it.name,
      dayKeyed: true,
      get: (s, date) => valueOf(s as TrackerState, it.id, date),
    })),
};
