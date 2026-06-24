/**
 * The Supabase client — created once, lazily, only when keys are configured.
 * Returns null when unconfigured so every caller degrades to offline-only with a
 * simple null check. The auth session persists through our sqlite-backed Prefs
 * (no extra storage dep), so a signed-in user stays signed in. Ported from
 * v0.0.1 — points at the SAME Supabase project + keys you already got working.
 */
import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSyncConfig } from './config';
import { getPrefs } from '../store';

/** Adapt our async Prefs to the {get,set,remove}Item shape Supabase Auth wants. */
const prefsAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    return (await getPrefs()).getString(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await (await getPrefs()).setString(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await (await getPrefs()).remove(key);
  },
};

let client: SupabaseClient | null | undefined;

/** The shared client, or null if Supabase isn't configured (offline-only). */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const cfg = getSyncConfig();
  client = cfg
    ? createClient(cfg.url, cfg.anonKey, {
        auth: {
          storage: prefsAuthStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
  return client;
}
