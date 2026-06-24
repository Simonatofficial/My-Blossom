import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useStore } from '@/ui/StoreProvider';
import { applyGrowth, emptyGrowth, type GrowthState } from '@/core/logic/growth';

/**
 * GrowthProvider — the live home of the Blossom growth ledger (earned aspect-XP).
 * It loads the single `growth` object from the store, applies events through the
 * pure engine, and persists every change (so growth syncs like any other object,
 * offline-first). The shell hands `grow` to every Tool via `ctx.grow`, and reads
 * `growth` to render the AspectFlowers — this is the one place activity becomes
 * growth on the UI side (the engine, `core/logic/growth.ts`, is the pure math).
 */
const GROWTH_ID = 'growth:main';

interface GrowthApi {
  growth: GrowthState;
  grow: (aspect: string, attribute: string, amount: number, skill?: string) => void;
}
const Ctx = createContext<GrowthApi | null>(null);

export function GrowthProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const [growth, setGrowth] = useState<GrowthState>(emptyGrowth);

  // Load once, then track synced updates (another device growing the same garden).
  useEffect(() => {
    let alive = true;
    void store.get<GrowthState>('growth', GROWTH_ID).then((o) => {
      if (alive && o) setGrowth(o.data);
    });
    const unsub = store.subscribe('growth', (objs) => {
      const mine = objs.find((o) => o.id === GROWTH_ID);
      if (mine && alive) setGrowth(mine.data as GrowthState);
    });
    return () => { alive = false; unsub(); };
  }, [store]);

  const grow = useCallback(
    (aspect: string, attribute: string, amount: number, skill?: string) => {
      if (!amount) return;
      setGrowth((prev) => {
        const next = applyGrowth(prev, { aspect, attribute, amount, skill });
        void store.put({ id: GROWTH_ID, kind: 'growth', data: next, updatedAt: Date.now() });
        return next;
      });
    },
    [store],
  );

  return <Ctx.Provider value={{ growth, grow }}>{children}</Ctx.Provider>;
}

export function useGrowth(): GrowthApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGrowth must be used within GrowthProvider');
  return v;
}
