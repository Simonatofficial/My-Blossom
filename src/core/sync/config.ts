/**
 * Sync configuration — reads the Supabase URL + anon key from Expo config
 * `extra` (app.json → expo.extra, fed from .env / EAS secrets via app.config.js).
 * When absent, the app runs FULLY OFFLINE: no client, no sync, nothing throws —
 * cloud sync is purely additive. Only the public ANON key ever reaches the client.
 * Ported from v0.0.1 (the working setup; these are the same keys + project).
 */
import Constants from 'expo-constants';

export interface SyncConfig {
  url: string;
  anonKey: string;
}

export function getSyncConfig(): SyncConfig | null {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const url = typeof extra.supabaseUrl === 'string' ? extra.supabaseUrl.trim() : '';
  const anonKey = typeof extra.supabaseAnonKey === 'string' ? extra.supabaseAnonKey.trim() : '';
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/** True when real Supabase keys are present, so sync/account features can show. */
export function isSyncConfigured(): boolean {
  return getSyncConfig() !== null;
}
