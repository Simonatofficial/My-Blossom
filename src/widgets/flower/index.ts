import type { Widget } from '../types';
import { flowerLogic, type FlowerAction, type FlowerState } from './logic';
import { FlowerCard, FlowerFull } from './View';

/**
 * Aspect Flower Tool — the live face of the Blossom growth loop. Drop it on a
 * page and it shows that aspect's flower growing as you complete things in the
 * module. A pure visualiser: it reads `ctx.growth` and never writes, so it's
 * completely standalone (a Lv 1 seed when nothing's been grown yet).
 */
export const flowerWidget: Widget<FlowerState, FlowerAction> = {
  type: 'flower',
  title: 'Aspect Flower',
  icon: 'local-florist',
  category: 'Growth & Rewards',
  keywords: ['flower', 'aspect', 'growth', 'bloom', 'petals', 'progress'],
  logic: flowerLogic,
  CardView: FlowerCard,
  FullView: FlowerFull,
  settings: [
    {
      key: 'aspect',
      label: 'Aspect',
      type: 'select',
      options: [
        { label: 'Mental', value: 'mental' },
        { label: 'Physical', value: 'physical' },
        { label: 'Emotional', value: 'emotional' },
        { label: 'Social', value: 'social' },
        { label: 'Recreation', value: 'recreation' },
      ],
    },
  ],
};
