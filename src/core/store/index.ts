/**
 * Store entry point. Picks the local adapter for the platform and exposes a
 * single shared `store`. Native → sqlite; web/tests → memory (expo-sqlite's
 * native module isn't available there). The rest of the app imports `store`
 * and never knows which adapter answered (docs/01 §3).
 */
import { Platform } from 'react-native';
import type { Store } from './types';
import { MemoryStore } from './memory';
import { SqliteStore } from './sqlite';

let _store: Store | null = null;

/** Resolve (once) the local store for this platform. */
export async function openStore(): Promise<Store> {
  if (_store) return _store;
  if (Platform.OS === 'web') {
    _store = new MemoryStore();
  } else {
    try {
      _store = await SqliteStore.open();
    } catch {
      _store = new MemoryStore(); // fail open, never block the app on storage
    }
  }
  return _store;
}

export * from './types';
export { MemoryStore } from './memory';
export { SqliteStore } from './sqlite';
export { uuid, ulid } from './ids';
