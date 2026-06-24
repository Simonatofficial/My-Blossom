import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/ui/StoreProvider';
import { useGrowth } from '@/ui/GrowthProvider';
import { useToast } from '@/ui/ToastProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { Sky } from '@/ui/Sky';
import { AddWidgetSheet } from '@/ui/AddWidgetSheet';
import { SettingsSheet } from '@/ui/SettingsSheet';
import { WidgetHost } from '@/widgets/WidgetHost';
import { getWidget } from '@/widgets/registry';
import { addWidgetToPage, instantiateModule } from '@/modules/engine';
import { MODULE_PRESETS } from '@/presets/modules';
import type { ModuleDoc, PageDoc, WidgetDoc } from '@/modules/types';

/**
 * Home shell — module switcher (top), the active page's widget grid (over the
 * living Sky), a bottom page-tab bar, and a FAB to add Tools. Generic: it draws
 * whatever the store holds, so new modules/pages/widgets appear with no edits
 * here. (Next: the 3-window module rail + per-widget settings panel.)
 */
export default function Home() {
  const store = useStore();
  const { growth, grow } = useGrowth();
  const { toast } = useToast();
  const { theme, setThemeId, withAlpha } = useTheme();
  const insets = useSafeAreaInsets();

  const [mods, setMods] = useState<ModuleDoc[]>([]);
  const [modIdx, setModIdx] = useState(0);
  const [page, setPage] = useState<PageDoc | null>(null);
  const [nodes, setNodes] = useState<WidgetDoc[]>([]);
  const [open, setOpen] = useState<WidgetDoc | null>(null);
  const [adding, setAdding] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mod = mods[modIdx] ?? null;

  // Load all modules (reused after adding one).
  const loadMods = useCallback(async (): Promise<ModuleDoc[]> => {
    const ms = (await store.query<ModuleDoc>('module')).map((o) => o.data);
    setMods(ms);
    return ms;
  }, [store]);

  useEffect(() => { void loadMods(); }, [loadMods]);

  // Add a whole module from a preset (so existing installs gain Activity etc.
  // without a reinstall). Instantiates into the store, then switches to it.
  const addModule = async (key: string) => {
    const preset = MODULE_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    await instantiateModule(store, preset);
    const ms = await loadMods();
    setSwitching(false);
    setModIdx(Math.max(0, ms.length - 1));
  };

  // Load the active module's home page + its widget nodes whenever the module changes.
  const loadPage = useCallback(
    async (m: ModuleDoc, pageId?: string) => {
      if (m.themeId) setThemeId(m.themeId);
      const pg = await store.get<PageDoc>('page', pageId ?? m.homePageId ?? m.pageIds[0]);
      if (!pg) return;
      setPage(pg.data);
      const loaded: WidgetDoc[] = [];
      for (const wid of pg.data.widgetIds) {
        const node = await store.get<WidgetDoc>('widgetNode', `node:${wid}`);
        if (node) loaded.push(node.data);
      }
      setNodes(loaded);
    },
    [store, setThemeId],
  );

  useEffect(() => {
    if (mod) void loadPage(mod);
  }, [mod, loadPage]);

  // The world-handle every Tool gets. `grow` feeds the Blossom loop; `growth`
  // is the live ledger the AspectFlower reads; `toast` is soft confirmation.
  const ctx = { navigate: () => {}, toast, grow, growth };
  const aspect = mod?.feedsAspect;

  const onAdd = async (type: string) => {
    if (!page) return;
    await addWidgetToPage(store, page, type);
    await loadPage(mods[modIdx], page.id); // refresh
  };

  return (
    <View style={{ flex: 1 }}>
      <Sky />

      {/* Top bar: module switcher */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => setSwitching(true)} style={[styles.modPill, { backgroundColor: withAlpha(theme.surface, 0.8) }]}>
          <Text style={{ color: theme.text, fontWeight: '600' }}>{mod?.name ?? 'My Blossom'} ▾</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}>
        <Text style={[styles.pageName, { color: theme.text }]}>{page?.name ?? ''}</Text>
        <View>
          {nodes.map((n) => (
            <WidgetHost key={n.id} id={n.id} type={n.type} store={store} mode="card" ctx={ctx} aspect={aspect} onOpen={() => setOpen(n)} />
          ))}
          {nodes.length === 0 ? <Text style={{ color: theme.textMuted }}>Empty page — tap ＋ to add a Tool.</Text> : null}
        </View>
      </ScrollView>

      {/* Bottom: page tabs */}
      {mod && mod.pageIds.length > 0 ? (
        <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8, backgroundColor: withAlpha(theme.surface, 0.9) }]}>
          <PageTabs store={store} module={mod} activeId={page?.id} onPick={(pid) => loadPage(mod, pid)} />
        </View>
      ) : null}

      {/* FAB */}
      <Pressable onPress={() => setAdding(true)} style={[styles.fab, { bottom: insets.bottom + 64, backgroundColor: theme.accent }]}>
        <Text style={{ color: theme.onAccent, fontSize: 28, fontWeight: '700', lineHeight: 30 }}>＋</Text>
      </Pressable>

      <AddWidgetSheet visible={adding} onPick={onAdd} onClose={() => setAdding(false)} />

      {/* Module switcher sheet */}
      <Modal visible={switching} transparent animationType="fade" onRequestClose={() => setSwitching(false)}>
        <Pressable style={styles.scrim} onPress={() => setSwitching(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, marginTop: insets.top + 56 }]}>
            {mods.map((m, i) => (
              <Pressable key={m.id} onPress={() => { setModIdx(i); setSwitching(false); }} style={styles.sheetRow}>
                <Text style={{ color: i === modIdx ? theme.accent : theme.text, fontWeight: i === modIdx ? '700' : '500' }}>{m.name}</Text>
              </Pressable>
            ))}
            <View style={[styles.sheetDivider, { backgroundColor: withAlpha(theme.textMuted, 0.2) }]} />
            <Text style={[styles.sheetHead, { color: theme.textMuted }]}>ADD A MODULE</Text>
            {MODULE_PRESETS.map((p) => (
              <Pressable key={p.key} onPress={() => void addModule(p.key)} style={styles.sheetRow}>
                <Text style={{ color: theme.text }}>＋ {p.name}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Widget full view */}
      <Modal visible={!!open} animationType="slide" onRequestClose={() => setOpen(null)}>
        <View style={{ flex: 1 }}>
          <Sky />
          <View style={[styles.modalBar, { paddingTop: insets.top + 8 }]}>
            {open && (getWidget(open.type)?.settings?.length ?? 0) > 0 ? (
              <Pressable onPress={() => setSettingsOpen(true)} style={[styles.close, { backgroundColor: withAlpha(theme.surface, 0.8) }]}>
                <Text style={{ color: theme.text }}>⚙ Settings</Text>
              </Pressable>
            ) : <View />}
            <Pressable onPress={() => setOpen(null)} style={[styles.close, { backgroundColor: withAlpha(theme.surface, 0.8) }]}>
              <Text style={{ color: theme.text }}>Done</Text>
            </Pressable>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {open ? <WidgetHost id={open.id} type={open.type} store={store} mode="full" ctx={ctx} aspect={aspect} /> : null}
          </ScrollView>
          {open ? (
            <SettingsSheet visible={settingsOpen} store={store} type={open.type} id={open.id} onClose={() => setSettingsOpen(false)} />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

function PageTabs({
  store, module, activeId, onPick,
}: {
  store: ReturnType<typeof useStore>;
  module: ModuleDoc;
  activeId?: string;
  onPick: (pageId: string) => void;
}) {
  const { theme } = useTheme();
  const [pages, setPages] = useState<PageDoc[]>([]);
  useEffect(() => {
    void (async () => {
      const ps: PageDoc[] = [];
      for (const pid of module.pageIds) {
        const p = await store.get<PageDoc>('page', pid);
        if (p) ps.push(p.data);
      }
      setPages(ps);
    })();
  }, [store, module]);
  return (
    <View style={styles.tabs}>
      {pages.map((p) => (
        <Pressable key={p.id} onPress={() => onPick(p.id)} style={styles.tab}>
          <Text style={{ color: p.id === activeId ? theme.accent : theme.textMuted, fontWeight: p.id === activeId ? '700' : '500' }}>{p.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 16, paddingBottom: 8 },
  modPill: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  pageName: { fontSize: 24, fontWeight: '700', marginBottom: 14 },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 8 },
  tabs: { flexDirection: 'row', justifyContent: 'space-around' },
  tab: { paddingHorizontal: 12, paddingVertical: 6 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { marginHorizontal: 16, borderRadius: 16, paddingVertical: 8 },
  sheetRow: { paddingHorizontal: 18, paddingVertical: 12 },
  sheetDivider: { height: 1, marginVertical: 6, marginHorizontal: 12 },
  sheetHead: { fontSize: 11, letterSpacing: 1, paddingHorizontal: 18, paddingTop: 4, paddingBottom: 2 },
  modalBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  close: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
});
