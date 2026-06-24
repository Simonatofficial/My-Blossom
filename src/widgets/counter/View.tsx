import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { WidgetViewProps } from '../types';
import type { CounterAction, CounterState } from './logic';

/** Counter card — big tally + steppers. The card body tap increments
 *  (registered as primaryTap), so this view only draws + dispatches. */
export function CounterCard({ state, dispatch }: WidgetViewProps<CounterState, CounterAction>) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => dispatch({ type: 'dec' })}
        style={[styles.btn, { borderColor: theme.textMuted }]}
        accessibilityLabel="decrease"
      >
        <Text style={[styles.btnText, { color: theme.text }]}>−</Text>
      </Pressable>
      <Text style={[styles.value, { color: theme.text }]}>{state.value}</Text>
      <Pressable
        onPress={() => dispatch({ type: 'inc' })}
        style={[styles.btn, { borderColor: theme.accent }]}
        accessibilityLabel="increase"
      >
        <Text style={[styles.btnText, { color: theme.accent }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  value: { fontSize: 34, fontWeight: '700', minWidth: 56, textAlign: 'center' },
  btn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 24, fontWeight: '600' },
});
