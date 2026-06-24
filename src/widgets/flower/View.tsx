import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { AspectFlower } from '@/ui/AspectFlower';
import { ASPECTS } from '@/presets/aspects';
import { attributeLevel, type GrowthState } from '@/core/logic/growth';
import type { WidgetViewProps } from '../types';
import type { FlowerAction, FlowerState } from './logic';

const aspectOf = (id: string) => ASPECTS.find((a) => a.id === id) ?? ASPECTS[0];

export function FlowerCard({ state, ctx }: WidgetViewProps<FlowerState, FlowerAction>) {
  const growth = (ctx.growth ?? {}) as GrowthState;
  const aspect = aspectOf(state.aspect);
  return (
    <View style={{ alignItems: 'center', paddingVertical: 4 }}>
      <AspectFlower aspect={aspect} growth={growth} size={150} />
    </View>
  );
}

export function FlowerFull({ state, dispatch, ctx }: WidgetViewProps<FlowerState, FlowerAction>) {
  const { theme, withAlpha } = useTheme();
  const growth = (ctx.growth ?? {}) as GrowthState;
  const aspect = aspectOf(state.aspect);

  return (
    <View style={{ gap: 18 }}>
      {/* aspect switcher */}
      <View style={styles.chips}>
        {ASPECTS.map((a) => {
          const active = a.id === state.aspect;
          return (
            <Pressable
              key={a.id}
              onPress={() => dispatch({ type: 'setAspect', aspect: a.id })}
              style={[
                styles.chip,
                { borderColor: withAlpha(a.petalColor, active ? 1 : 0.4), backgroundColor: active ? withAlpha(a.petalColor, 0.18) : 'transparent' },
              ]}
            >
              <Text style={{ color: active ? theme.text : theme.textMuted, fontWeight: active ? '700' : '500', fontSize: 12 }}>{a.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <AspectFlower aspect={aspect} growth={growth} size={220} />

      {/* attribute (petal) breakdown */}
      <View style={{ gap: 8 }}>
        {aspect.attributes.map((attr) => {
          const lvl = attributeLevel(growth, aspect.id, attr.id);
          return (
            <View key={attr.id} style={styles.row}>
              <Text style={{ color: theme.text }}>{attr.name}</Text>
              <View style={styles.track}>
                <View style={[styles.barTrack, { backgroundColor: withAlpha(theme.textMuted, 0.2) }]}>
                  <View style={{ height: 6, borderRadius: 3, width: `${(lvl / 10) * 100}%`, backgroundColor: aspect.petalColor }} />
                </View>
                <Text style={{ color: theme.textMuted, fontSize: 12, width: 34, textAlign: 'right' }}>Lv {lvl}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={{ color: theme.textMuted, fontSize: 12, textAlign: 'center' }}>
        Complete habits, quests, goals and skills in this module to grow these petals.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  row: { gap: 4 },
  track: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
});
