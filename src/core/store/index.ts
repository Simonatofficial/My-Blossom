/**
 * Store entry point. Picks the local adapter for the platform and exposes a
 * single shared `store`, the `prefs` key/value store, and a `SyncSource` view of
 * the store for the sync engine. Native → sqlite; web/tests → memory (expo-sqlite's
 * native module isn't available there). The rest of the app imports `store`
 * and never knows which adapter answered (docs/01 §3).
 */
import { Platform } from 'react-native';
import type { Obj, Store } from './types';
import { MemoryStore } from './memory';
import { SqliteStore } from './sqlite';
import { MemoryPrefs, SqlitePrefs, type Prefs } from './prefs';

let _store: (Store & {
  allChangedSince(since: number): Promise<Obj[]>;
  applyRemoteObj(obj: Obj): Promise<boolean>;
}) | null = null;
let _prefs: Prefs | null = null;

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

/** The tiny key/value prefs store (theme, cursors, auth session). */
export async function getPrefs(): Promise<Prefs> {
  if (_prefs) return _prefs;
  if (Platform.OS === 'web') {
    _prefs = new MemoryPrefs();
  } else {
    try {
      _prefs = await SqlitePrefs.open();
    } catch {
      _prefs = new MemoryPrefs();
    }
  }
  return _prefs;
}

/**
 * The SyncSource view of the local store — what the SyncEngine reconciles. Both
 * adapters expose `allChangedSince` + `applyRemoteObj` (clock-preserving LWW), so
 * this wrapper is adapter-agnostic. Objects only for now (links sync lands when
 * the `links` table is added to the live Supabase project — see supabase/schema.sql).
 */
export async function getSyncSource() {
  const s = await openStore();
  const ss = s as Store & {
    allChangedSince(since: number): Promise<Obj[]>;
    applyRemoteObj(obj: Obj): Promise<boolean>;
  };
  return {
    changedSince: (since: number) => ss.allChangedSince(since),
    applyRemote: (obj: Obj) => ss.applyRemoteObj(obj),
  };
}

export * from './types';
export { MemoryStore } from './memory';
export { SqliteStore } from './sqlite';
export { uuid, ulid } from './ids';
export type { Prefs } from './prefs';
