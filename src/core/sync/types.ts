/**
 * Sync contracts. ADDITIVE — the widget-facing `Store` never changes. Sync talks
 * to two small interfaces so the engine is transport-agnostic + testable:
 *   • SyncSource  — the LOCAL db viewed for sync (enumerate changes; apply a
 *                   remote change WITHOUT re-stamping the clock).
 *   • RemoteStore — the CLOUD mirror (pull rows changed since a cursor; push rows).
 * SupabaseRemote implements RemoteStore for real (against the same `objects`
 * table v0.0.1 already uses live). Ported from v0.0.1's working sync (M4).
 *
 * Offline-first: local is the source of truth, last-write-wins per object via
 * `updatedAt`, deletions are soft (`deletedAt`), nothing is ever hard-dropped.
 */
import type { Obj } from '../store/types';

export interface SyncSource {
  /** Every object (all kinds, incl. soft-deleted) with updatedAt > since, oldest first. */
  changedSince(since: number): Promise<Obj[]>;
  /** Apply a cloud row, LWW, preserving its clock. Returns true if it changed local state. */
  applyRemote(obj: Obj): Promise<boolean>;
}

export interface RemoteStore {
  /** Rows with updatedAt > since (incl. soft-deleted), oldest first. */
  pull(since: number): Promise<Obj[]>;
  /** Upsert objects by id. The server keeps each row's own updatedAt. */
  push(objs: Obj[]): Promise<void>;
}
