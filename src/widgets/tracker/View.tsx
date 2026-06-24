import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { WidgetViewProps } from '../types';
import { todayStr, valueOf, type TrackerAction, type TrackerItem, type TrackerState } from './logic';

function Row({
  item, value, dispatch,
}: {
  item: TrackerItem;
  value: number;
  dispatch: (a: TrackerAction) => void;
}) {
  const { theme } = useTheme();
  const date = todayStr();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
        {item.goal ? (
          <Text style={[styles.sub, { color: theme.textMuted }]}>
            {value}{item.unit ? ` ${item.unit}` : ''} / {item.goal}
          </Text>
        ) : null}
      </View>
      {item.type === 'yesno' ? (
        <Switch
          value={value >= 1}
          onValueChange={(on) => dispatch({ type: 'set', date, itemId: item.id, value: on ? 1 : 0 })}
        />
      ) : (
        <View style={styles.steppers}>
          <Pressable onPress={() => dispatch({ type: 'bump', date, itemId: item.id, by: -1 })} style={[styles.step, { borderColor: theme.textMuted }]}>
            <Text style={{ color: theme.text }}>−</Text>
          </Pressable>
          <Text style={[styles.val, { color: theme.text }]}>{value}{item.unit ? ` ${item.unit}` : ''}</Text>
          <Pressable onPress={() => dispatch({ type: 'bump', date, itemId: item.id, by: 1 })} style={[styles.step, { borderColor: theme.accent }]}>
            <Text style={{ color: theme.accent }}>+</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export function TrackerCard({ state, dispatch }: WidgetViewProps<TrackerState, TrackerAction>) {
  const { theme } = useTheme();
  if (state.items.length === 0) {
    return <Text style={{ color: theme.textMuted }}>No items yet — open to add what you track.</Text>;
  }
  return (
    <View style={{ gap: 10 }}>
      {state.items.map((it) => (
        <Row key={it.id} item={it} value={valueOf(state, it.id)} dispatch={dispatch} />
      ))}
    </View>
  );
}

// Full view reuses the card rows + (later) the history graph + day browser.
export const TrackerFull = TrackerCard;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 15, fontWeight: '600' },
  sub: { fontSize: 12, marginTop: 2 },
  steppers: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  step: { width: 36, height: 36, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  val: { minWidth: 44, textAlign: 'center', fontWeight: '600' },
});
