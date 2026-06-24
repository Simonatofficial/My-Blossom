/**
 * Offline-first sync engine. Transport-agnostic: it pushes local changes to a
 * SyncSource and pulls remote ones back, last-write-wins by `updatedAt`. The UI
 * never waits on it. Supabase implements SyncSource (supabaseRemote.ts); a Fake
 * one is used in smoke tests. Ported in shape from v0.0.1's working M4 engine.
 *
 * Wiring (later): a SyncProvider runs push→pull on foreground / interval /
 * Realtime, and writes the cursor to prefs. This file stays pure + testable.
 */
import type { Link, Obj, SyncSource } from '../store/types';

export interface LocalSyncStore {
  changedSince(cursor: number): { objs: Obj[]; links: Link[] };
  applyRemote(objs: Obj[], links: Link[]): void;
}

export class SyncEngine {
  private local: LocalSyncStore;
  private remote: SyncSource;
  private getCursor: () => number;
  private setCursor: (c: number) => void;

  constructor(
    local: LocalSyncStore,
    remote: SyncSource,
    getCursor: () => number,
    setCursor: (c: number) => void,
  ) {
    this.local = local;
    this.remote = remote;
    this.getCursor = getCursor;
    this.setCursor = setCursor;
  }

  /** One full cycle: push local changes, then pull remote ones. Safe to call often. */
  async sync(): Promise<void> {
    const cursor = this.getCursor();
    const { objs, links } = this.local.changedSince(cursor);
    if (objs.length || links.length) await this.remote.push(objs, links);
    const pulled = await this.remote.changedSince(cursor);
    if (pulled.objs.length || pulled.links.length) {
      this.local.applyRemote(pulled.objs, pulled.links);
    }
    this.setCursor(Math.max(cursor, pulled.cursor));
  }
}
