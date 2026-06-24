import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { WidgetViewProps } from '../types';
import type { NotesAction, NotesState } from './logic';

/** Card face: name + a 2-line preview of the most-recent note. */
export function NotesCard({ state }: WidgetViewProps<NotesState, NotesAction>) {
  const { theme } = useTheme();
  const top = state.notes[0];
  return (
    <View>
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        {top?.title?.trim() || 'Notes'}
      </Text>
      <Text numberOfLines={2} style={[styles.preview, { color: theme.textMuted }]}>
        {top?.body?.trim() || (state.notes.length ? 'Untitled note' : 'No notes yet — tap to write')}
      </Text>
    </View>
  );
}

/** Full view: the notebook — list + an inline editor for each note. (Rich-text
 *  toolbar + embedded child widgets are a later polish; the brain already
 *  supports per-note content and the container contract is wired.) */
export function NotesFull({ state, dispatch }: WidgetViewProps<NotesState, NotesAction>) {
  const { theme, withAlpha } = useTheme();
  return (
    <ScrollView contentContainerStyle={styles.full}>
      <Pressable
        onPress={() => dispatch({ type: 'add' })}
        style={[styles.add, { backgroundColor: theme.accent }]}
      >
        <Text style={[styles.addText, { color: theme.onAccent }]}>+ New note</Text>
      </Pressable>
      {state.notes.map((n) => (
        <View key={n.id} style={[styles.note, { backgroundColor: withAlpha(theme.surface, 0.6) }]}>
          <TextInput
            value={n.title}
            onChangeText={(title) => dispatch({ type: 'edit', id: n.id, patch: { title } })}
            placeholder="Title"
            placeholderTextColor={theme.textMuted}
            style={[styles.noteTitle, { color: theme.text }]}
          />
          <TextInput
            value={n.body}
            onChangeText={(body) => dispatch({ type: 'edit', id: n.id, patch: { body } })}
            placeholder="Write…"
            placeholderTextColor={theme.textMuted}
            multiline
            style={[styles.noteBody, { color: theme.text }]}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 16, fontWeight: '600' },
  preview: { fontSize: 13, marginTop: 4 },
  full: { gap: 12, paddingBottom: 40 },
  add: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  addText: { fontWeight: '600' },
  note: { borderRadius: 16, padding: 14, gap: 8 },
  noteTitle: { fontSize: 17, fontWeight: '600' },
  noteBody: { fontSize: 15, minHeight: 60, textAlignVertical: 'top' },
});
