import type { Widget } from '../types';
import { counterLogic, type CounterAction, type CounterState } from './logic';
import { CounterCard } from './View';

export const counterWidget: Widget<CounterState, CounterAction> = {
  type: 'counter',
  title: 'Counter',
  icon: 'plus-circle',
  category: 'Data & Charts',
  keywords: ['count', 'tally', 'number', 'increment'],
  logic: counterLogic,
  CardView: CounterCard,
  // Card-body tap increments (The Blossom's primaryTap model).
  primaryTap: (_state, dispatch) => dispatch({ type: 'inc' }),
  outputs: (state) => [{ key: 'value', name: 'Count', get: () => state.value }],
  settings: [{ key: 'step', label: 'Step', type: 'number', hint: 'How much +/- changes the count' }],
};
