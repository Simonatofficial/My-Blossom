/**
 * Auth — thin wrappers over Supabase Auth. Cozy path: a brand-new user gets an
 * ANONYMOUS account automatically (instant sync, no signup wall). They can later
 * "save your account" with email + password, which UPGRADES the same anonymous
 * user so their garden carries over. We never touch passwords; Supabase handles
 * it. Every call no-ops gracefully when sync is unconfigured. Ported from v0.0.1.
 */
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';

export type { Session, User } from '@supabase/supabase-js';

/** True when a user is signed in but has no email yet (the cozy default). */
export function isAnonymous(user: User | null): boolean {
  return !!user && !user.email;
}

export async function getSession(): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

/** Ensure there's a session — sign in anonymously if there isn't one yet. */
export async function ensureSignedIn(): Promise<Session | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const existing = await getSession();
  if (existing) return existing;
  const { data, error } = await sb.auth.signInAnonymously();
  if (error) {
    console.warn('[auth] anonymous sign-in failed:', error.message);
    return null;
  }
  return data.session;
}

/** Attach email + password to the current (usually anonymous) user — keeps data. */
export async function saveAccount(email: string, password: string): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Sync is not set up yet.' };
  const { error } = await sb.auth.updateUser({ email: email.trim(), password });
  return error ? { error: error.message } : {};
}

/** Sign in an existing email/password account (e.g. on a second device). */
export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: 'Sync is not set up yet.' };
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  return error ? { error: error.message } : {};
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
}

/** Subscribe to session changes; returns an unsubscribe fn. */
export function onAuthChange(cb: (session: Session | null) => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
