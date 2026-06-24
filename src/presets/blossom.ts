import type { ModuleDef } from '@/modules/types';

/**
 * The Blossom starter module (the hub) — a small, cozy first module so the app
 * has something alive on first run. Pure data: the engine instantiates it with
 * fresh ids. As the widget roster grows (docs/04 port map), richer presets
 * (Productivity, Activity, Study, D&D DM…) are added the same way.
 */
export const BLOSSOM_PRESET: ModuleDef = {
  key: 'blossom',
  name: 'My Blossom',
  icon: 'flower',
  themeId: 'flower',
  feedsAspect: 'mental',
  pages: [
    {
      name: 'Home',
      icon: 'home',
      layout: 'masonry',
      home: true,
      widgets: [
        { type: 'tracker', config: {} },
        { type: 'notes', config: {} },
        { type: 'counter', config: {} },
      ],
    },
  ],
};
