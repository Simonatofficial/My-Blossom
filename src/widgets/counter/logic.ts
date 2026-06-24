import type { WidgetLogic } from '../types';

export interface CounterState {
  value: number;
  step: number;
}
export type CounterAction =
  | { type: 'inc' }
  | { type: 'dec' }
  | { type: 'reset' }
  | { type: 'setStep'; step: number };

/** Pure brain for the Counter tool — node-testable, no RN/view code. */
export const counterLogic: WidgetLogic<CounterState, CounterAction> = {
  defaults: () => ({ value: 0, step: 1 }),
  reduce(state, action) {
    switch (action.type) {
      case 'inc': return { ...state, value: state.value + state.step };
      case 'dec': return { ...state, value: state.value - state.step };
      case 'reset': return { ...state, value: 0 };
      case 'setStep': return { ...state, step: Math.max(1, action.step) };
      default: return state;
    }
  },
};
