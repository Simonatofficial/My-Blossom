import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { WidgetViewProps } from '../types';
import { progress, type GoalAction, type GoalState } from './logic';

export function GoalCard({ state, dispatch }: WidgetViewProps<GoalState, GoalAction>) {
  const { theme, withAlpha } = useTheme();
  const pct = progress(state);
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.head}>
        <Text style={{ color: theme.text, fontWeight: '600' }}>{pct}%</Text>
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>{state.milestones.filter((m) => m.done).length}/{state.milestones.length} milestones</Text>
      </View>
      <View style={[styles.bar, { backgroundColor: withAlpha(theme.textMuted, 0.25) }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.accent }]} />
      </View>
      <View style={{ gap: 6 }}>
        {state.milestones.map((m) => (
          <Pressable key={m.id} onPress={() => dispatch({ type: 'toggleMilestone', id: m.id })} style={styles.row}>
            <Text style={{ color: m.done ? theme.accent : theme.textMuted }}>{m.done ? '◉' : '○'}</Text>
            <Text style={{ color: theme.text, flex: 1, textDecorationLine: m.done ? 'line-through' : 'none' }}>{m.name}</Text>
          </Pressable>
        ))}
        {state.milestones.length === 0 ? <Text style={{ color: theme.textMuted, fontSize: 12 }}>No milestones yet — open to add some.</Text> : null}
      </View>
    </View>
  );
}

export function GoalFull(props: WidgetViewProps<GoalState, GoalAction>) {
  const { dispatch } = props;
  const { theme } = useTheme();
  const [draft, setDraft] = useState('');
  return (
    <View style={{ gap: 12 }}>
      <GoalCard {...props} />
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Add a milestone…"
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.text, borderColor: theme.textMuted }]}
        onSubmitEditing={() => { if (draft.trim()) { dispatch({ type: 'addMilestone', name: draft.trim() }); setDraft(''); } }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
});
