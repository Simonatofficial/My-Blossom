import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { Store } from '../core/store/types';
import { getWidget } from './registry';
import type { WidgetContext } from './types';

/**
 * WidgetHost — the ONLY thing that touches storage for a Tool. It loads the
 * Tool's state object, runs the pure reducer locally, persists every change, and
 * renders the right face (card vs full). This is the seam that keeps Tools
 * decoupled: a Tool never imports the store or another Tool — the host hands it a
 * `ctx`. (docs/01 §4, the v0.0.1 lesson done right.)
 */
export function WidgetHost({
  id,
  type,
  store,
  mode = 'card',
  ctx,
  aspect,
  onOpen,
}: {
  id: string;
  type: string;
  store: Store;
  mode?: 'card' | 'full';
  ctx: Omit<WidgetContext, 'store'>;
  /** The aspect this Tool's module feeds — supplied to growth events (the Tool
   *  only names the attribute; the module decides which flower it grows). */
  aspect?: string;
  onOpen?: () => void;
}) {
  const { theme, withAlpha } = useTheme();
  const plugin = getWidget(type);
  const [state, setState] = useState<unknown>(() => plugin?.logic.defaults());
  const [loaded, setLoaded] = useState(false);

  // Load persisted state once, then subscribe for live (synced) updates.
  useEffect(() => {
    let alive = true;
    void store.get(type, id).then((obj) => {
      if (alive && obj) setState(obj.data);
      setLoaded(true);
    });
    const unsub = store.subscribe(type, (objs) => {
      const mine = objs.find((o) => o.id === id);
      if (mine && alive) setState(mine.data);
    });
    return () => { alive = false; unsub(); };
  }, [id, type, store]);

  const fullCtx = useMemo<WidgetContext>(() => ({ ...ctx, store }), [ctx, store]);

  // dispatch = pure reduce + persist (debounce-free; sqlite writes are cheap).
  const dispatch = useCallback(
    (action: unknown) => {
      if (!plugin) return;
      setState((prev: unknown) => {
        const next = plugin.logic.reduce(prev, action as never);
        void store.put({ id, kind: type, data: next, updatedAt: Date.now() });
        // Feed the Blossom growth loop: the pure detector says what attribute(s)
        // this change earned; the host supplies the module's aspect and grows it,
        // then a soft toast confirms it ("🌱 +10 Discipline").
        const contribs = plugin.logic.grows?.(prev, next, action as never) ?? [];
        if (aspect && fullCtx.grow && contribs.length) {
          for (const c of contribs) fullCtx.grow(aspect, c.attribute, c.amount, c.skill);
          const summary = contribs.map((c) => `+${c.amount} ${cap(c.attribute)}`).join(', ');
          fullCtx.toast?.(`🌱 ${summary}`);
        }
        return next;
      });
    },
    [plugin, id, type, store, aspect, fullCtx],
  );

  if (!plugin) {
    return (
      <View style={[styles.card, { backgroundColor: withAlpha(theme.surface, 0.4) }]}>
        <Text style={{ color: theme.textMuted }}>Unknown widget: {type}</Text>
      </View>
    );
  }

  const obj = { id, kind: type, data: state, updatedAt: Date.now() } as never;
  const View_ = mode === 'full' ? plugin.FullView ?? plugin.CardView : plugin.CardView;
  if (!View_) return null;

  const canOpen = mode === 'card' && !!plugin.FullView;
  const onPress = () => {
    if (mode !== 'card') return;
    if (plugin.primaryTap) plugin.primaryTap(state as never, dispatch, fullCtx);
    else if (canOpen) onOpen?.();
  };

  const body = (
    <View_ state={state as never} dispatch={dispatch} ctx={fullCtx} obj={obj} />
  );

  if (mode === 'full') return body;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: withAlpha(theme.surface, theme.surfaceOpacity), borderRadius: theme.radius }]}
    >
      <Text style={[styles.kind, { color: theme.textMuted }]}>{plugin.title}</Text>
      {loaded ? body : null}
    </Pressable>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 12 },
  kind: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, opacity: 0.8 },
});
