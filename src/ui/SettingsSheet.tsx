import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import type { Store } from '@/core/store/types';
import { getWidget } from '@/widgets/registry';

/**
 * Generic settings panel — driven entirely by a Tool's declarative `settings`
 * schema (no per-Tool code). It reads/writes the Tool's own state object through
 * the Store; because WidgetHost subscribes to that kind, the open Tool updates
 * live as you change a field. This is the v1.0.0 version of The Blossom's
 * renderSettings, made data-driven (engineering rule 2 — everything is data).
 */
export function SettingsSheet({
  visible,
  store,
  type,
  id,
  onClose,
}: {
  visible: boolean;
  store: Store;
  type: string;
  id: string;
  onClose: () => void;
}) {
  const { theme, withAlpha } = useTheme();
  const insets = useSafeAreaInsets();
  const plugin = getWidget(type);
  const [state, setState] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    void store.get<Record<string, unknown>>(type, id).then((o) => {
      if (alive) setState(o?.data ?? (plugin?.logic.defaults() as Record<string, unknown>) ?? {});
    });
    return () => { alive = false; };
  }, [visible, store, type, id, plugin]);

  const schema = plugin?.settings ?? [];
  const set = (key: string, value: unknown) => {
    setState((prev) => {
      const next = { ...(prev ?? {}), [key]: value };
      void store.put({ id, kind: type, data: next, updatedAt: Date.now() });
      return next;
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + 16, borderTopLeftRadius: 20, borderTopRightRadius: 20 }]}
          onPress={() => {}}
        >
          <View style={styles.handle} />
          <Text style={[styles.title, { color: theme.text }]}>{plugin?.title ?? 'Settings'}</Text>

          {schema.length === 0 ? (
            <Text style={{ color: theme.textMuted, paddingVertical: 12 }}>This Tool has no settings yet.</Text>
          ) : (
            <ScrollView contentContainerStyle={{ gap: 18, paddingTop: 8 }}>
              {schema.map((f) => {
                const value = state?.[f.key];
                return (
                  <View key={f.key} style={{ gap: 8 }}>
                    <Text style={[styles.label, { color: theme.text }]}>{f.label}</Text>
                    {f.hint ? <Text style={{ color: theme.textMuted, fontSize: 12 }}>{f.hint}</Text> : null}

                    {f.type === 'select' ? (
                      <View style={styles.chips}>
                        {(f.options ?? []).map((opt) => {
                          const active = value === opt.value;
                          return (
                            <Pressable
                              key={opt.value}
                              onPress={() => set(f.key, opt.value)}
                              style={[styles.chip, { borderColor: withAlpha(theme.accent, active ? 1 : 0.35), backgroundColor: active ? withAlpha(theme.accent, 0.18) : 'transparent' }]}
                            >
                              <Text style={{ color: active ? theme.text : theme.textMuted, fontWeight: active ? '700' : '500', fontSize: 13 }}>{opt.label}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : f.type === 'boolean' ? (
                      <Switch
                        value={!!value}
                        onValueChange={(v) => set(f.key, v)}
                        trackColor={{ true: withAlpha(theme.accent, 0.6), false: withAlpha(theme.textMuted, 0.3) }}
                        thumbColor={theme.accent}
                      />
                    ) : (
                      <TextInput
                        value={value != null ? String(value) : ''}
                        onChangeText={(t) => set(f.key, f.type === 'number' ? Number(t) || 0 : t)}
                        keyboardType={f.type === 'number' ? 'numeric' : 'default'}
                        placeholder={f.label}
                        placeholderTextColor={theme.textMuted}
                        style={[styles.input, { color: theme.text, borderColor: withAlpha(theme.textMuted, 0.3), backgroundColor: withAlpha(theme.surface, 0.6) }]}
                      />
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}

          <Pressable onPress={onClose} style={[styles.done, { backgroundColor: theme.accent }]}>
            <Text style={{ color: theme.onAccent, fontWeight: '700' }}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { maxHeight: '80%', paddingHorizontal: 20, paddingTop: 10 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.4)', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '700' },
  label: { fontSize: 15, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  done: { marginTop: 16, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
});
