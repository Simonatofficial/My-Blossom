import type { Theme } from '@/theme/types';

/**
 * The preset theme roster (docs/04 §3, locked). Each is a biome with its own
 * light. Data only — rendered by ThemeProvider + Sky + the visual engine. Add a
 * theme by adding an entry; the picker and switching pick it up automatically.
 * Ported intact from v0.0.1's verified 7-theme set. The custom-theme creator
 * (Designer tier) writes user themes in this same shape (docs/02 monetization).
 */
export const THEMES: Theme[] = [
  { id: 'cosmos', name: 'Cosmos',
    sky: ['#2a1f4a', '#1b1430', '#100b20'], haze: '#3a2a5e', bg: '#100b20',
    surface: '#241a3d', surfaceOpacity: 0.72, text: '#f3ecff', textMuted: '#b8a9d6',
    accent: '#9f86ff', onAccent: '#15102b', radius: 20, barStyle: 'light', particles: 'stars',
    feel: { material: 'glass', density: 'cozy' } },
  { id: 'flower', name: 'Flower',
    sky: ['#ffe3cf', '#ffd0dd', '#dbe7ff'], haze: '#ffe9e0', bg: '#fbeef2',
    surface: '#fffafc', surfaceOpacity: 0.82, text: '#3f2b44', textMuted: '#8a7290',
    accent: '#e07aa6', onAccent: '#ffffff', radius: 20, barStyle: 'dark', particles: 'petals',
    feel: { material: 'paper', density: 'cozy' } },
  { id: 'forest', name: 'Forest',
    sky: ['#dcebcb', '#bcd9a8', '#a6cf95'], haze: '#d3e7c2', bg: '#eef4e6',
    surface: '#f6faf0', surfaceOpacity: 0.82, text: '#26361f', textMuted: '#5e7155',
    accent: '#5fb87f', onAccent: '#ffffff', radius: 20, barStyle: 'dark', particles: 'leaves' },
  { id: 'ocean', name: 'Ocean',
    sky: ['#bfeaf0', '#8fd6e0', '#62b4cc'], haze: '#bfe9ef', bg: '#e6f6f8',
    surface: '#f1fbfc', surfaceOpacity: 0.82, text: '#10333a', textMuted: '#567f86',
    accent: '#3fc0d6', onAccent: '#ffffff', radius: 20, barStyle: 'dark', particles: 'bubbles' },
  { id: 'sunset', name: 'Sunset',
    sky: ['#4a2f73', '#b1577f', '#ff9e6d'], haze: '#c76b86', bg: '#2e1d40',
    surface: '#3b2750', surfaceOpacity: 0.7, text: '#fdeae0', textMuted: '#e6bcc4',
    accent: '#ff9e6d', onAccent: '#34203f', radius: 20, barStyle: 'light', particles: 'embers' },
  { id: 'autumn', name: 'Autumn',
    sky: ['#f6dcab', '#e9b97c', '#d59257'], haze: '#f0d3a3', bg: '#f6ead4',
    surface: '#fdf5e7', surfaceOpacity: 0.84, text: '#3d2a18', textMuted: '#7d6450',
    accent: '#ef9f4a', onAccent: '#3d2a18', radius: 20, barStyle: 'dark', particles: 'leaves' },
  { id: 'scarlet', name: 'Scarlet',
    sky: ['#4a0f1a', '#330a12', '#1f060b'], haze: '#5e1320', bg: '#1f060b',
    surface: '#3a0e18', surfaceOpacity: 0.72, text: '#ffe6ea', textMuted: '#d59aa6',
    accent: '#ff6b81', onAccent: '#2a0a10', radius: 20, barStyle: 'light', particles: 'embers',
    feel: { material: 'slate', density: 'cozy' } },
];

export const DEFAULT_THEME_ID = 'cosmos';

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}
