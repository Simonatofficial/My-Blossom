import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Theme } from './types';
import { DEFAULT_THEME_ID, getThemeById, THEMES } from '@/presets/themes';
import { getPrefs } from '@/core/store';

/**
 * ThemeProvider — restores + persists the chosen theme through the sqlite-backed
 * prefs store (survives restarts). Hands the active Theme + a `withAlpha` helper
 * to the tree. The Sky + visual engine consume `theme` to paint the world.
 */
interface ThemeCtx {
  theme: Theme;
  themes: Theme[];
  setThemeId: (id: string) => void;
  withAlpha: (hex: string, alpha: number) => string;
}

const Ctx = createContext<ThemeCtx | null>(null);
const PREF_KEY = 'themeId';

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);

  // Restore the saved theme once on mount.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const saved = await (await getPrefs()).getString(PREF_KEY);
      if (alive && saved && getThemeById(saved)) setThemeIdState(saved);
    })();
    return () => { alive = false; };
  }, []);

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id);
    void (async () => { await (await getPrefs()).setString(PREF_KEY, id); })();
  }, []);

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
