/**
 * In-memory Store adapter. The reference implementation: it's what the headless
 * smoke tests run against, and the web fallback when sqlite isn't available. The
 * sqlite adapter mirrors this exact behaviour against expo-sqlite. Keeping a
 * pure-JS adapter means every widget's logic can be unit-tested with no native
 * deps (the v0.0.1 lesson: the brain must be testable without a device).
 */
import type { Link, Obj, Query, Store } from './types';
import { uuid } from './ids';

export class MemoryStore implements Store {
  private objs = new Map<string, Obj>();
  private links: Link[] = [];
  private subs = new Map<string, Set<(objs: Obj[]) => void>>();

  async get<T>(kind: string, id: string): Promise<Obj<T> | null> {
    const o = this.objs.get(id);
    return o && o.kind === kind && !o.deletedAt ? (o as Obj<T>) : null;
  }

  async put<T>(obj: Obj<T>): Promise<void> {
    const next = { ...obj, updatedAt: Date.now() } as Obj;
    this.objs.set(obj.id, next);
    this.emit(obj.kind);
  }

  async query<T>(kind: string, where?: Query): Promise<Obj<T>[]> {
    const out: Obj[] = [];
    for (const o of this.objs.values()) {
      if (o.kind !== kind) continue;
      if (!where?.includeDeleted && o.deletedAt) continue;
      if (where?.moduleId && o.moduleId !== where.moduleId) continue;
      out.push(o);
    }
    return out.sort((a, b) => a.updatedAt - b.updatedAt) as Obj<T>[];
  }

  async remove(id: string): Promise<void> {
    const o = this.objs.get(id);
    if (!o) return;
    this.objs.set(id, { ...o, deletedAt: Date.now(), updatedAt: Date.now() });
    this.emit(o.kind);
  }

  async link(fromId: string, toId: string, rel?: string): Promise<void> {
    this.links.push({ id: uuid(), fromId, toId, rel, updatedAt: Date.now() });
  }

  async linksFrom(id: string): Promise<Link[]> {
    return this.links.filter((l) => l.fromId === id && !l.deletedAt);
  }

  async linksTo(id: string): Promise<Link[]> {
    return this.links.filter((l) => l.toId === id && !l.deletedAt);
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

  // --- sync support (used by the sync engine; not part of the Store interface) ---
  changedSince(cursor: number): { objs: Obj[]; links: Link[] } {
    const objs = [...this.objs.values()].filter((o) => o.updatedAt > cursor);
    const links = this.links.filter((l) => l.updatedAt > cursor);
    return { objs, links };
  }

  applyRemote(objs: Obj[], links: Link[]): void {
    for (const r of objs) {
      const local = this.objs.get(r.id);
      if (!local || r.updatedAt >= local.updatedAt) this.objs.set(r.id, r); // LWW
    }
    for (const r of links) {
      const i = this.links.findIndex((l) => l.id === r.id);
      if (i === -1) this.links.push(r);
      else if (r.updatedAt >= this.links[i].updatedAt) this.links[i] = r;
    }
    const kinds = new Set(objs.map((o) => o.kind));
    kinds.forEach((k) => this.emit(k));
  }
}
