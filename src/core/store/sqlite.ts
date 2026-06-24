/**
 * expo-sqlite Store adapter — the local source of truth on device. Mirrors the
 * MemoryStore behaviour exactly (same LWW + soft-delete semantics) so swapping
 * adapters never changes app behaviour. Two tables: `objects` and `links`. Ids
 * are TEXT (never Postgres uuid — see ids.ts for why).
 */
import * as SQLite from 'expo-sqlite';
import type { Link, Obj, Query, Store } from './types';
import { uuid } from './ids';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS objects (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL,
  module_id TEXT,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_objects_kind ON objects(kind);
CREATE INDEX IF NOT EXISTS idx_objects_module ON objects(module_id);
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY NOT NULL,
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  rel TEXT,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_links_from ON links(from_id);
CREATE INDEX IF NOT EXISTS idx_links_to ON links(to_id);
`;

type Row = {
  id: string; kind: string; module_id: string | null;
  data: string; updated_at: number; deleted_at: number | null;
};

function rowToObj(r: Row): Obj {
  return {
    id: r.id, kind: r.kind, moduleId: r.module_id ?? undefined,
    data: JSON.parse(r.data), updatedAt: r.updated_at, deletedAt: r.deleted_at,
  };
}

export class SqliteStore implements Store {
  private db: SQLite.SQLiteDatabase;
  private subs = new Map<string, Set<(objs: Obj[]) => void>>();

  private constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }

  static async open(name = 'my-blossom.db'): Promise<SqliteStore> {
    const db = await SQLite.openDatabaseAsync(name);
    await db.execAsync(SCHEMA);
    return new SqliteStore(db);
  }

  async get<T>(kind: string, id: string): Promise<Obj<T> | null> {
    const r = await this.db.getFirstAsync<Row>(
      'SELECT * FROM objects WHERE id = ? AND kind = ? AND deleted_at IS NULL', id, kind,
    );
    return r ? (rowToObj(r) as Obj<T>) : null;
  }

  async put<T>(obj: Obj<T>): Promise<void> {
    const updatedAt = Date.now();
    await this.db.runAsync(
      `INSERT INTO objects (id, kind, module_id, data, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         kind=excluded.kind, module_id=excluded.module_id,
         data=excluded.data, updated_at=excluded.updated_at, deleted_at=excluded.deleted_at`,
      obj.id, obj.kind, obj.moduleId ?? null, JSON.stringify(obj.data), updatedAt, obj.deletedAt ?? null,
    );
    this.emit(obj.kind);
  }

  async query<T>(kind: string, where?: Query): Promise<Obj<T>[]> {
    let sql = 'SELECT * FROM objects WHERE kind = ?';
    const args: (string | number)[] = [kind];
    if (!where?.includeDeleted) sql += ' AND deleted_at IS NULL';
    if (where?.moduleId) { sql += ' AND module_id = ?'; args.push(where.moduleId); }
    sql += ' ORDER BY updated_at ASC';
    const rows = await this.db.getAllAsync<Row>(sql, ...args);
    return rows.map(rowToObj) as Obj<T>[];
  }

  async remove(id: string): Promise<void> {
    const now = Date.now();
    const r = await this.db.getFirstAsync<Row>('SELECT kind FROM objects WHERE id = ?', id);
    await this.db.runAsync('UPDATE objects SET deleted_at = ?, updated_at = ? WHERE id = ?', now, now, id);
    if (r) this.emit(r.kind);
  }

  async link(fromId: string, toId: string, rel?: string): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO links (id, from_id, to_id, rel, updated_at) VALUES (?, ?, ?, ?, ?)',
      uuid(), fromId, toId, rel ?? null, Date.now(),
    );
  }

  async linksFrom(id: string): Promise<Link[]> {
    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM links WHERE from_id = ? AND deleted_at IS NULL', id);
    return rows.map((r) => ({ id: r.id, fromId: r.from_id, toId: r.to_id, rel: r.rel ?? undefined, updatedAt: r.updated_at }));
  }

  async linksTo(id: string): Promise<Link[]> {
    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM links WHERE to_id = ? AND deleted_at IS NULL', id);
    return rows.map((r) => ({ id: r.id, fromId: r.from_id, toId: r.to_id, rel: r.rel ?? undefined, updatedAt: r.updated_at }));
  }

  subscribe(kind: string, cb: (objs: Obj[]) => void): () => void {
    if (!this.subs.has(kind)) this.subs.set(kind, new Set());
    this.subs.get(kind)!.add(cb);
    return () => this.subs.get(kind)?.delete(cb);
  }

  private emit(kind: string): void {
    const set = this.subs.get(kind);
    if (!set || set.size === 0) return;
    void this.query(kind).then((objs) => set.forEach((cb) => cb(objs)));
  }
}
