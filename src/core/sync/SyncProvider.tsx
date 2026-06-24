/**
 * SyncProvider — the runtime that keeps the cloud mirror in step. Stays out of
 * the render path (local sqlite is the source of truth): the UI never waits on
 * it. On launch it signs the user in anonymously (no signup wall), builds a
 * SyncEngine, and reconciles on foreground, on background (flush before suspend),
 * on a gentle interval while active, and live via a Realtime subscription when
 * another device pushes. When Supabase isn't configured everything is a graceful
 * no-op. Ported from v0.0.1 — same proven runtime, pointed at v1.0.0's store.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { getSyncSource } from '../store';
import { getSupabase } from './supabaseClient';
import { isSyncConfigured } from './config';
import { SyncEngine } from './engine';
import { PrefsCursorStore } from './cursors';
import { SupabaseRemote } from './supabaseRemote';
import { ensureSignedIn, isAnonymous, onAuthChange, type Session } from './auth';

const SYNC_INTERVAL_MS = 20_000;

export interface AccountState {
  configured: boolean;
  signedIn: boolean;
  anonymous: boolean;
  email: string | null;
}

export type SyncStatus = 'offline' | 'idle' | 'syncing' | 'error';

interface SyncContextValue {
  account: AccountState;
  status: SyncStatus;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

const OFFLINE_ACCOUNT: AccountState = { configured: false, signedIn: false, anonymous: false, email: null };

function accountFromSession(session: Session | null): AccountState {
  const user = session?.user ?? null;
  return {
    configured: true,
    signedIn: !!user,
    anonymous: isAnonymous(user),
    email: user?.email ?? null,
  };
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountState>(OFFLINE_ACCOUNT);
  const [status, setStatus] = useState<SyncStatus>(isSyncConfigured() ? 'idle' : 'offline');
  const engineRef = useRef<SyncEngine | null>(null);
  const runningRef = useRef(false);

  const buildEngine = async (session: Session | null): Promise<void> => {
    const sb = getSupabase();
    const userId = session?.user?.id;
    if (!sb || !userId) {
      engineRef.current = null;
      return;
    }
    const local = await getSyncSource();
    engineRef.current = new SyncEngine(local, new SupabaseRemote(sb, userId), new PrefsCursorStore(userId));
  };

  const syncNow = async (): Promise<void> => {
    const engine = engineRef.current;
    if (!engine || runningRef.current) return;
    runningRef.current = true;
    setStatus('syncing');
    try {
      await engine.syncOnce();
      setStatus('idle');
    } catch (e) {
      console.warn('[sync] pass failed:', e);
      setStatus('error');
    } finally {
      runningRef.current = false;
    }
  };

  useEffect(() => {
    if (!isSyncConfigured()) return;
    let alive = true;

    void (async () => {
      const session = await ensureSignedIn();
      if (!alive) return;
      setAccount(accountFromSession(session));
      await buildEngine(session);
      if (alive) void syncNow();
    })();

    const offAuth = onAuthChange((session) => {
      setAccount(accountFromSession(session));
      void buildEngine(session).then(() => syncNow());
    });

    const onAppStateChange = (s: AppStateStatus) => {
      if (s === 'active' || s === 'background') void syncNow();
    };
    const appSub = AppState.addEventListener('change', onAppStateChange);

    const timer = setInterval(() => {
      if (AppState.currentState === 'active') void syncNow();
    }, SYNC_INTERVAL_MS);

    const sb = getSupabase();
    const channel = sb
      ?.channel('objects-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'objects' }, () => void syncNow())
      .subscribe();

    return () => {
      alive = false;
      offAuth();
      appSub.remove();
      clearInterval(timer);
      if (channel) void sb?.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <SyncContext.Provider value={{ account, status, syncNow }}>{children}</SyncContext.Provider>;
}

/** Read sync status + account state. Safe outside the provider (returns offline). */
export function useSync(): SyncContextValue {
  return useContext(SyncContext) ?? { account: OFFLINE_ACCOUNT, status: 'offline', syncNow: async () => {} };
}
