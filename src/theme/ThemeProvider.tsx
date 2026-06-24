import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Theme } from './types';
import { DEFAULT_THEME_ID, getThemeById, THEMES } from '@/presets/themes';

/**
 * ThemeProvider — restores + persists the chosen theme and hands the active
 * Theme + a `withAlpha` helper to the tree. Persistence goes through the prefs
 * store (a tiny key/value) so it survives restarts. Pure React; the Sky and the
 * visual engine consume `theme` to paint the world.
 */
interface ThemeCtx {
  theme: Theme;
  themes: Theme[];
  setThemeId: (id: string) => void;
  /** Translucent surface colour over the world. */
  withAlpha: (hex: string, alpha: number) => string;
}

const Ctx = createContext<ThemeCtx | null>(null);

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface PrefsLike {
  getString(key: string): string | null | undefined;
  set(key: string, value: string): void;
}

export function ThemeProvider({
  children,
  prefs,
}: {
  children: React.ReactNode;
  prefs?: PrefsLike;
}) {
  const [themeId, setThemeIdState] = useState<string>(
    () => prefs?.getString('themeId') || DEFAULT_THEME_ID,
  );

  useEffect(() => {
    const saved = prefs?.getString('themeId');
    if (saved && saved !== themeId) setThemeIdState(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setThemeId = useCallback(
    (id: string) => {
      setThemeIdState(id);
      prefs?.set('themeId', id);
    },
    [prefs],
  );

  const theme = getThemeById(themeId) ?? THEMES[0];

  const value = useMemo<ThemeCtx>(
    () => ({ theme, themes: THEMES, setThemeId, withAlpha }),
    [theme, setThemeId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used within ThemeProvider');
  return v;
}
