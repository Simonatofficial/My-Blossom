import { uuid } from '../../core/store/ids';
import type { WidgetLogic } from '../types';

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}
export interface NotesState {
  notes: Note[];
}
export type NotesAction =
  | { type: 'add' }
  | { type: 'edit'; id: string; patch: Partial<Pick<Note, 'title' | 'body'>> }
  | { type: 'remove'; id: string };

/** Pure brain for the Notes tool. A complete notebook on its own (the hard rule:
 *  Tools are standalone). Rich text + nesting are View concerns layered on top. */
export const notesLogic: WidgetLogic<NotesState, NotesAction> = {
  defaults: () => ({ notes: [] }),
  reduce(state, action) {
    switch (action.type) {
      case 'add':
        return {
          notes: [{ id: uuid(), title: '', body: '', updatedAt: Date.now() }, ...state.notes],
        };
      case 'edit':
        return {
          notes: state.notes.map((n) =>
            n.id === action.id ? { ...n, ...action.patch, updatedAt: Date.now() } : n,
          ),
        };
      case 'remove':
        return { notes: state.notes.filter((n) => n.id !== action.id) };
      default:
        return state;
    }
  },
};
