import type { Widget } from '../types';
import { notesLogic, type NotesAction, type NotesState } from './logic';
import { NotesCard, NotesFull } from './View';

export const notesWidget: Widget<NotesState, NotesAction> = {
  type: 'notes',
  title: 'Notes',
  icon: 'file-text',
  category: 'Notes & Writing',
  keywords: ['write', 'text', 'document', 'rich', 'page'],
  container: true, // can embed child widgets inside notes (later polish)
  logic: notesLogic,
  CardView: NotesCard,
  FullView: NotesFull,
  outputs: (state) => [{ key: 'count', name: 'Notes', get: () => state.notes.length }],
};
