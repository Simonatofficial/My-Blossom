import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { attributeLevel, aspectLevel, type GrowthState } from '@/core/logic/growth';
import { MAX_LEVEL, type AspectDef } from '@/presets/aspects';

/**
 * AspectFlower — the visible soul of the Blossom loop. One flower per aspect:
 * a seed at the centre (the aspect level) ringed by one petal per attribute,
 * each petal's length + fullness scaled by that attribute's earned level. As
 * Tools feed growth (habit → discipline, quest → focus…), the matching petal
 * literally grows. Pure RN (radial transforms) so it renders identically on
 * Android, iOS and web — no SVG/Skia dependency. Cosmetic only; reads, never writes.
 */
export function AspectFlower({
  aspect,
  growth,
  size = 168,
}: {
  aspect: AspectDef;
  growth: GrowthState;
  size?: number;
}) {
  const { theme, withAlpha } = useTheme();
  const attrs = aspect.attributes;
  const n = Math.max(1, attrs.length);
  const seedR = size * 0.17;
  const level = aspectLevel(growth, aspect.id, attrs.map((a) => a.id));

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {attrs.map((attr, i) => {
          const lvl = attributeLevel(growth, aspect.id, attr.id); // 1..MAX_LEVEL
          const t = (lvl - 1) / (MAX_LEVEL - 1); // 0..1 fullness
          const petalLen = size * (0.2 + t * 0.26);
          const petalW = size * 0.15;
          const distance = seedR + petalLen / 2 - size * 0.02;
          const angle = (360 / n) * i;
          return (
            <View
              key={attr.id}
              style={{
                position: 'absolute',
                width: petalW,
                height: petalLen,
                borderRadius: petalW / 2,
                backgroundColor: withAlpha(aspect.petalColor, 0.4 + t * 0.55),
                transform: [{ rotate: `${angle}deg` }, { translateY: -distance }],
              }}
            />
          );
        })}
        {/* seed / core — carries the aspect level */}
        <View
          style={[
            styles.seed,
            {
              width: seedR * 2,
              height: seedR * 2,
              borderRadius: seedR,
              backgroundColor: aspect.seedColor,
              borderColor: withAlpha('#000000', 0.08),
            },
          ]}
        >
          <Text style={[styles.seedNum, { color: withAlpha('#3a2c12', 0.85), fontSize: seedR * 0.85 }]}>{level}</Text>
        </View>
      </View>
      <Text style={{ color: theme.text, fontWeight: '700' }}>
        {aspect.name} <Text style={{ color: theme.textMuted, fontWeight: '500' }}>· Lv {level}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  seed: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  seedNum: { fontWeight: '800' },
});
