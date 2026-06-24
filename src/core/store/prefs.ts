import * as SQLite from 'expo-sqlite';

/**
 * Tiny key→value prefs (theme id, last module, sync cursors, auth session…).
 * sqlite-backed on device, in-memory on web/tests. Ported from v0.0.1 (proven);
 * shares the app db file but its own `prefs` table. The Supabase client + sync
 * cursors persist through this, so a signed-in user + sync watermark survive
 * restarts with no extra storage dependency.
 */
export interface Prefs {
  getString(key: string): Promise<string | null>;
  setString(key: string, value: string): Promise<void>;
  getJSON<T>(key: string): Promise<T | null>;
  setJSON<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export class SqlitePrefs implements Prefs {
  private db: SQLite.SQLiteDatabase;
  private constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }
  static async open(name = 'my-blossom.db'): Promise<SqlitePrefs> {
    const db = await SQLite.openDatabaseAsync(name);
    await db.execAsync('CREATE TABLE IF NOT EXISTS prefs (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);');
    return new SqlitePrefs(db);
  }
  async getString(key: string): Promise<string | null> {
    const r = await this.db.getFirstAsync<{ value: string }>('SELECT value FROM prefs WHERE key = ?', key);
    return r ? r.value : null;
  }
  async setString(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      'INSERT INTO prefs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key, value,
    );
  }
  async getJSON<T>(key: string): Promise<T | null> {
    const s = await this.getString(key);
    return s == null ? null : (JSON.parse(s) as T);
  }
  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.setString(key, JSON.stringify(value));
  }
  async remove(key: string): Promise<void> {
    await this.db.runAsync('DELETE FROM prefs WHERE key = ?', key);
  }
}

/** In-memory prefs fallback (tests / web / when sqlite is unavailable). */
export class MemoryPrefs implements Prefs {
  private m = new Map<string, string>();
  async getString(key: string) { return this.m.get(key) ?? null; }
  async setString(key: string, value: string) { this.m.set(key, value); }
  async getJSON<T>(key: string) { const s = this.m.get(key); return s == null ? null : (JSON.parse(s) as T); }
  async setJSON<T>(key: string, value: T) { this.m.set(key, JSON.stringify(value)); }
  async remove(key: string) { this.m.delete(key); }
}
