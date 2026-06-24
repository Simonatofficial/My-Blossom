import type { WidgetLogic } from '../types';

/**
 * Aspect Flower — the Tool that renders one of the five growth flowers. Its own
 * state is tiny: just which aspect to show (the live petal/level data comes from
 * the shared growth ledger via `ctx.growth`, not from here — a visualiser reads,
 * it doesn't own). Standalone: with no growth yet it simply shows a Lv 1 seed.
 */
export interface FlowerState {
  aspect: string; // aspect id — 'mental' | 'physical' | ...
}
export type FlowerAction = { type: 'setAspect'; aspect: string };

export const flowerLogic: WidgetLogic<FlowerState, FlowerAction> = {
  defaults: () => ({ aspect: 'mental' }),
  reduce(state, action) {
    switch (action.type) {
      case 'setAspect':
        return { ...state, aspect: action.aspect };
      default:
        return state;
    }
  },
};
