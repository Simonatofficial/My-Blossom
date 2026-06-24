import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { WidgetViewProps } from '../types';
import { levelProgress, xpToNext, type SkillAction, type SkillState } from './logic';

export function SkillCard({ state, dispatch }: WidgetViewProps<SkillState, SkillAction>) {
  const { theme, withAlpha } = useTheme();
  const pct = Math.round(levelProgress(state) * 100);
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.head}>
        <Text style={{ color: theme.text, fontWeight: '600' }}>{state.name}</Text>
        <Text style={{ color: theme.accent, fontWeight: '700' }}>Lv {state.level}</Text>
      </View>
      <View style={[styles.bar, { backgroundColor: withAlpha(theme.textMuted, 0.25) }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.accent }]} />
      </View>
      <Text style={{ color: theme.textMuted, fontSize: 12 }}>{state.xp} / {xpToNext(state.level)} XP</Text>
      <View style={styles.grants}>
        {[5, 10, 25].map((n) => (
          <Pressable key={n} onPress={() => dispatch({ type: 'grant', amount: n })} style={[styles.grant, { borderColor: withAlpha(theme.accent, 0.5) }]}>
            <Text style={{ color: theme.accent, fontWeight: '600', fontSize: 12 }}>+{n} XP</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export const SkillFull = SkillCard;

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  grants: { flexDirection: 'row', gap: 8 },
  grant: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 8, alignItems: 'center' },
});
