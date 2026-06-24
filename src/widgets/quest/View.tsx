import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fmtDate } from '@/core/logic/dates';
import type { WidgetViewProps } from '../types';
import { DIFFICULTY, stepStats, suggestedXp, type QuestAction, type QuestState } from './logic';

function ProgressBar({ pct }: { pct: number }) {
  const { theme, withAlpha } = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: withAlpha(theme.textMuted, 0.25) }]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.accent }]} />
    </View>
  );
}

export function QuestCard({ state, dispatch }: WidgetViewProps<QuestState, QuestAction>) {
  const { theme } = useTheme();
  const { total, done, pct } = stepStats(state);
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.chips}>
        <Chip>{DIFFICULTY[state.difficulty]}</Chip>
        <Chip>✦ {suggestedXp(state)} XP</Chip>
        {state.dueDate ? <Chip>{fmtDate(state.dueDate)}</Chip> : null}
      </View>
      {state.description ? <Text style={{ color: theme.textMuted, fontSize: 13 }}>{state.description}</Text> : null}
      <ProgressBar pct={pct} />
      <Text style={{ color: theme.textMuted, fontSize: 12 }}>{done} of {total}</Text>
      <View style={{ gap: 6 }}>
        {state.steps.map((s) => (
          <Pressable key={s.id} onPress={() => dispatch({ type: 'toggleStep', id: s.id })} style={styles.step}>
            <Text style={{ color: s.done ? theme.accent : theme.textMuted }}>{s.done ? '◉' : '○'}</Text>
            <Text style={{ color: theme.text, textDecorationLine: s.done ? 'line-through' : 'none', flex: 1 }}>{s.text}</Text>
          </Pressable>
        ))}
        {state.steps.length === 0 ? <Text style={{ color: theme.textMuted, fontSize: 12 }}>No steps yet — open to add some.</Text> : null}
      </View>
    </View>
  );
}

export function QuestFull(props: WidgetViewProps<QuestState, QuestAction>) {
  const { state, dispatch } = props;
  const { theme } = useTheme();
  const [draft, setDraft] = useState('');
  return (
    <View style={{ gap: 12 }}>
      <QuestCard {...props} />
      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Add a step…"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.text, borderColor: theme.textMuted }]}
          onSubmitEditing={() => { if (draft.trim()) { dispatch({ type: 'addStep', text: draft.trim() }); setDraft(''); } }}
        />
      </View>
    </View>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  const { theme, withAlpha } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: withAlpha(theme.accent, 0.16) }]}>
      <Text style={{ color: theme.text, fontSize: 11 }}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
});
