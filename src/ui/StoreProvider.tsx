import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { Store } from '@/core/store/types';
import { openStore } from '@/core/store';
import { instantiateModule } from '@/modules/engine';
import { SEED_PRESETS } from '@/presets/modules';

/**
 * StoreProvider — opens the platform store once, seeds a starter module on first
 * run, and hands the live `store` to the tree. Everything offline-first: nothing
 * here touches the network. Sync (Supabase) wraps this later without changing it.
 */
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const s = await openStore();
      // First-run seed: if no modules exist yet, plant the starter modules.
      const mods = await s.query('module');
      if (mods.length === 0) {
        for (const preset of SEED_PRESETS) await instantiateModule(s, preset);
      }
      if (alive) setStore(s);
    })();
    return () => { alive = false; };
  }, []);

  if (!store) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}
