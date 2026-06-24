import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Sky } from '@/ui/Sky';
import { searchWidgets, widgetsByCategory } from '@/widgets/registry';

/**
 * Add-widget gallery — the FAB's "+" sheet. Grouped by category with live
 * search, both read straight from the registry (so a newly registered Tool
 * appears here with zero extra wiring — The Blossom's collapsible gallery, RN).
 */
export function AddWidgetSheet({
  visible,
  onPick,
  onClose,
}: {
  visible: boolean;
  onPick: (type: string) => void;
  onClose: () => void;
}) {
  const { theme, withAlpha } = useTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');

  const groups = useMemo(() => {
    if (q.trim()) return { Results: searchWidgets(q) };
    return widgetsByCategory();
  }, [q]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <Sky />
        <View style={[styles.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.headRow}>
            <Text style={[styles.title, { color: theme.text }]}>Add a Tool</Text>
            <Pressable onPress={onClose} style={[styles.close, { backgroundColor: withAlpha(theme.surface, 0.8) }]}>
              <Text style={{ color: theme.text }}>Close</Text>
            </Pressable>
          </View>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search tools…"
            placeholderTextColor={theme.textMuted}
            style={[styles.search, { color: theme.text, backgroundColor: withAlpha(theme.surface, 0.7), borderColor: withAlpha(theme.textMuted, 0.3) }]}
          />
          <ScrollView contentContainerStyle={{ gap: 18, paddingBottom: 20 }}>
            {Object.entries(groups).map(([cat, widgets]) => (
              <View key={cat} style={{ gap: 8 }}>
                <Text style={[styles.cat, { color: theme.textMuted }]}>{cat.toUpperCase()}</Text>
                <View style={styles.grid}>
                  {widgets.map((w) => (
                    <Pressable
                      key={w.type}
                      onPress={() => { onPick(w.type); onClose(); }}
                      style={[styles.tile, { backgroundColor: withAlpha(theme.surface, theme.surfaceOpacity), borderRadius: theme.radius }]}
                    >
                      <Text style={[styles.tileTitle, { color: theme.text }]}>{w.title}</Text>
                      <Text numberOfLines={1} style={{ color: theme.textMuted, fontSize: 11 }}>{(w.keywords ?? []).slice(0, 3).join(' · ')}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, gap: 12 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  close: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  search: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  cat: { fontSize: 11, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', padding: 14, gap: 4 },
  tileTitle: { fontSize: 15, fontWeight: '600' },
});
