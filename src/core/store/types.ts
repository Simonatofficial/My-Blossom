/**
 * The Store interface — the single most important contract in the app.
 *
 * Every widget reads/writes through this. Storage *implementations* (adapters)
 * sit behind it: `memory` (tests/web fallback), `sqlite` (local, source of
 * truth), `supabase` (cloud mirror, added behind a SyncSource). The interface
 * NEVER changes — adapters swap underneath. This is what makes offline-first +
 * sync cheap and keeps widgets portable.
 *
 * Inherited verbatim from v0.0.1 (it was correct). v1.0.0 only ADDS the link
 * model below it (objects referenceable from anywhere — the soul of The Blossom).
 *
 * See docs/01 §3 (storage), docs/02 (data model), docs/03 (sync).
 */

/** A single saved piece of user content (a note, tracker, quest, drawing, character…). */
export interface Obj<T = unknown> {
  id: string;
  kind: string; // 'note' | 'tracker' | 'quest' | 'character' | ...
  moduleId?: string; // which module instance it belongs to (scopes queries)
  data: T; // the widget's payload
  updatedAt: number; // epoch ms; drives last-write-wins on sync
  deletedAt?: number | null; // soft delete; 1-week sweep (DESIGN-DOC). Never hard-drop.
}

/** A cross-object link — the "everything is referenceable" backbone (docs/02 §Links). */
export interface Link {
  id: string;
  fromId: string;
  toId: string;
  rel?: string; // 'feeds' | 'attached' | 'embeds' | ...
  updatedAt: number;
  deletedAt?: number | null;
}

export interface Query {
  moduleId?: string;
  includeDeleted?: boolean;
  // extend with widget-specific filters as needed (keep it data-driven)
  [key: string]: unknown;
}

export interface Store {
  get<T = unknown>(kind: string, id: string): Promise<Obj<T> | null>;
  /** Upsert. Implementations set/refresh `updatedAt`. */
  put<T = unknown>(obj: Obj<T>): Promise<void>;
  query<T = unknown>(kind: string, where?: Query): Promise<Obj<T>[]>;
  /** SOFT delete (sets `deletedAt`). */
  remove(id: string): Promise<void>;
  /** Cross-link objects (e.g. attach a drawing to a character). Soft, reversible. */
  link(fromId: string, toId: string, rel?: string): Promise<void>;
  /** Links pointing out of / into an object — powers the value/link system. */
  linksFrom(id: string): Promise<Link[]>;
  linksTo(id: string): Promise<Link[]>;
  /** Live updates for a kind; returns an unsubscribe fn. */
  subscribe(kind: string, cb: (objs: Obj[]) => void): () => void;
}

/**
 * A SyncSource is the optional cloud half. The local store is wrapped by a sync
 * engine that pushes local changes to a SyncSource and pulls remote ones back —
 * never blocking a render. Supabase implements this; a Fake one is used in tests.
 * (docs/03 — offline-first sync.)
 */
export interface SyncSource {
  /** Push local changes upward (last-write-wins by updatedAt). */
  push(objs: Obj[], links: Link[]): Promise<void>;
  /** Pull everything changed since a cursor. */
  changedSince(cursor: number): Promise<{ objs: Obj[]; links: Link[]; cursor: number }>;
}
