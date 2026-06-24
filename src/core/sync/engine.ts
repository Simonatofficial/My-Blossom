/**
 * SyncEngine — the offline-first reconciler. Pairs a LOCAL SyncSource with a
 * cloud RemoteStore + a small cursor store. Owns NO transport and NO React: pure
 * orchestration, node-testable. Ported verbatim in behaviour from v0.0.1's
 * working M4 engine (the foundation we're keeping).
 *
 * One pass (`syncOnce`): PUSH local changes up, then PULL remote changes down +
 * apply with last-write-wins (applyRemote only overwrites when strictly newer).
 * Push before pull so a genuine local edit is never skipped by a cursor advance.
 */
import type { Obj } from '../store/types';
import type { RemoteStore, SyncSource } from './types';

export interface Cursors {
  pushedAt: number;
  pulledAt: number;
}

export interface CursorStore {
  load(): Promise<Cursors>;
  save(c: Cursors): Promise<void>;
}

export interface SyncResult {
  pushed: number;
  pulled: number;
  applied: number;
}

const maxUpdatedAt = (objs: Obj[], floor: number): number =>
  objs.reduce((m, o) => (o.updatedAt > m ? o.updatedAt : m), floor);

export class SyncEngine {
  private readonly local: SyncSource;
  private readonly remote: RemoteStore;
  private readonly cursors: CursorStore;

  constructor(local: SyncSource, remote: RemoteStore, cursors: CursorStore) {
    this.local = local;
    this.remote = remote;
    this.cursors = cursors;
  }

  /** Run one full reconcile pass. Safe to call repeatedly; idempotent. */
  async syncOnce(): Promise<SyncResult> {
    const c = await this.cursors.load();

    // 1. PUSH — send everything changed locally since we last pushed.
    const outgoing = await this.local.changedSince(c.pushedAt);
    if (outgoing.length > 0) await this.remote.push(outgoing);
    const pushedAt = maxUpdatedAt(outgoing, c.pushedAt);

    // 2. PULL — fetch + apply everything the cloud changed since we last pulled.
    const incoming = await this.remote.pull(c.pulledAt);
    let applied = 0;
    for (const obj of incoming) if (await this.local.applyRemote(obj)) applied++;
    const pulledAt = maxUpdatedAt(incoming, c.pulledAt);

    await this.cursors.save({ pushedAt, pulledAt });
    return { pushed: outgoing.length, pulled: incoming.length, applied };
  }
}
