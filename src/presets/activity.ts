import type { ModuleDef } from '@/modules/types';

/**
 * The Activity module (→ feeds the Physical aspect) — the second priority module
 * (DESIGN-DOC: build Productivity & Activity first). It needs no new Tool code:
 * it composes the ported Tools and retargets their growth via `config` (a habit
 * here grows Strength, not Discipline) so completing a workout blooms the Physical
 * flower. Pure data — expand its pages/widgets here, never in the engine.
 */
export const ACTIVITY_PRESET: ModuleDef = {
  key: 'activity',
  name: 'Activity',
  icon: 'activity',
  themeId: 'ocean',
  feedsAspect: 'physical',
  pages: [
    {
      name: 'Today',
      icon: 'sun',
      layout: 'masonry',
      home: true,
      widgets: [
        { type: 'habit', config: { growthAttribute: 'strength' } },
        { type: 'quest', config: { growthAttribute: 'conditioning' } },
        { type: 'tracker', config: {} },
      ],
    },
    {
      name: 'Body',
      icon: 'trending-up',
      layout: 'stream',
      widgets: [
        { type: 'flower', config: { aspect: 'physical' } },
        { type: 'goal', config: { growthAttribute: 'mobility' } },
        { type: 'skill', config: { growthAttribute: 'conditioning' } },
      ],
    },
  ],
};
