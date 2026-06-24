/**
 * SupabaseRemote — the cloud half of sync. Implements RemoteStore against the
 * single `objects` table that mirrors our Obj model (supabase/schema.sql) — the
 * SAME table v0.0.1 already uses live. RLS scopes every query to the signed-in
 * user automatically, so pull never filters by user_id. Push stamps user_id from
 * the session and upserts by id; the cloud keeps each row's own updated_at
 * (bigint) so LWW stays consistent across devices. Soft deletes ride along as
 * ordinary rows carrying deleted_at. Ported verbatim from v0.0.1.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Obj } from '../store/types';
import type { RemoteStore } from './types';

interface Row {
  id: string;
  kind: string;
  module_id: string | null;
  data: unknown;
  updated_at: number;
  deleted_at: number | null;
}

const TABLE = 'objects';

function toObj(r: Row): Obj {
  return {
    id: r.id,
    kind: r.kind,
    moduleId: r.module_id ?? undefined,
    data: r.data,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at ?? undefined,
  };
}

export class SupabaseRemote implements RemoteStore {
  private readonly client: SupabaseClient;
  private readonly userId: string;

  constructor(client: SupabaseClient, userId: string) {
    this.client = client;
    this.userId = userId;
  }

  async pull(since: number): Promise<Obj[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select('id, kind, module_id, data, updated_at, deleted_at')
      .gt('updated_at', since)
      .order('updated_at', { ascending: true });
    if (error) throw error;
    return (data as Row[]).map(toObj);
  }

  async push(objs: Obj[]): Promise<void> {
    if (objs.length === 0) return;
    const rows = objs.map((o) => ({
      id: o.id,
      user_id: this.userId,
      kind: o.kind,
      module_id: o.moduleId ?? null,
      data: o.data,
      updated_at: o.updatedAt,
      deleted_at: o.deletedAt ?? null,
    }));
    const { error } = await this.client.from(TABLE).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }
}
