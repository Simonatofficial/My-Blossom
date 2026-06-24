import { uuid } from '../../core/store/ids';
import type { WidgetLogic } from '../types';

export type ItemType = 'count' | 'measure' | 'yesno';

export interface TrackerItem {
  id: string;
  name: string;
  type: ItemType;
  unit?: string;
  goal?: number;
}

/** Per-day values, keyed by date string 'YYYY-MM-DD' → { itemId: number }. */
export type DayValues = Record<string, Record<string, number>>;

export interface TrackerState {
  items: TrackerItem[];
  days: DayValues;
}

export type TrackerAction =
  | { type: 'addItem'; name: string; itemType: ItemType; unit?: string; goal?: number }
  | { type: 'removeItem'; id: string }
  | { type: 'set'; date: string; itemId: string; value: number }
  | { type: 'bump'; date: string; itemId: string; by: number };

export function todayStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Pure brain for the Tracker tool. Standalone: works with zero linked tools. */
export const trackerLogic: WidgetLogic<TrackerState, TrackerAction> = {
  defaults: () => ({ items: [], days: {} }),
  reduce(state, action) {
    switch (action.type) {
      case 'addItem':
        return {
          ...state,
          items: [
            ...state.items,
            { id: uuid(), name: action.name, type: action.itemType, unit: action.unit, goal: action.goal },
          ],
        };
      case 'removeItem':
        return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      case 'set': {
        const day = { ...(state.days[action.date] ?? {}), [action.itemId]: action.value };
        return { ...state, days: { ...state.days, [action.date]: day } };
      }
      case 'bump': {
        const cur = state.days[action.date]?.[action.itemId] ?? 0;
        const day = { ...(state.days[action.date] ?? {}), [action.itemId]: cur + action.by };
        return { ...state, days: { ...state.days, [action.date]: day } };
      }
      default:
        return state;
    }
  },
};

/** Helper used by outputs + views: today's value for an item. */
export function valueOf(state: TrackerState, itemId: string, date = todayStr()): number {
  return state.days[date]?.[itemId] ?? 0;
}
