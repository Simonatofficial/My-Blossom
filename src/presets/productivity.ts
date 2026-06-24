import type { ModuleDef } from '@/modules/types';

/**
 * The Productivity module (→ feeds the Mental aspect) — one of the two priority
 * modules (DESIGN-DOC: build Productivity & Activity first). A cozy, real
 * starting layout using the ported Tools. Pure data; the engine instantiates it
 * with fresh ids. Expand its pages/widgets here — never in the engine.
 */
export const PRODUCTIVITY_PRESET: ModuleDef = {
  key: 'productivity',
  name: 'Productivity',
  icon: 'check-circle',
  themeId: 'forest',
  feedsAspect: 'mental',
  pages: [
    {
      name: 'Today',
      icon: 'sun',
      layout: 'masonry',
      home: true,
      widgets: [
        { type: 'habit', config: {} },
        { type: 'quest', config: {} },
        { type: 'tracker', config: {} },
      ],
    },
    {
      name: 'Growth',
      icon: 'trending-up',
      layout: 'stream',
      widgets: [
        { type: 'flower', config: { aspect: 'mental' } },
        { type: 'goal', config: {} },
        { type: 'skill', config: {} },
      ],
    },
  ],
};
