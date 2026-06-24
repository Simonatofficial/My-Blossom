import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { todayStr } from '@/core/logic/dates';
import type { WidgetViewProps } from '../types';
import { adherence, TIERS, triggerSentence, type HabitAction, type HabitState } from './logic';

export function HabitCard({ state, dispatch }: WidgetViewProps<HabitState, HabitAction>) {
  const { theme, withAlpha } = useTheme();
  const today = todayStr();
  const doneTier = state.log[today];
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: theme.text, fontSize: 14 }}>{triggerSentence(state)}</Text>
      <View style={styles.row}>
        <Text style={{ color: theme.accent }}>🌱 {state.streak}-day streak</Text>
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>{adherence(state)}% this week</Text>
      </View>
      <View style={styles.tiers}>
        {TIERS.map((t) => {
          const on = doneTier === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => dispatch({ type: 'logTier', date: today, tier: t.key })}
              style={[styles.tier, { borderColor: on ? theme.accent : withAlpha(theme.textMuted, 0.4), backgroundColor: on ? withAlpha(theme.accent, 0.18) : 'transparent' }]}
            >
              <Text style={{ color: on ? theme.accent : theme.text, fontWeight: '600', fontSize: 12 }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const HabitFull = HabitCard;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tiers: { flexDirection: 'row', gap: 8 },
  tier: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
});
