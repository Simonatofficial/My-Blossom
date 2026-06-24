import type { Widget } from '../types';
import { skillLogic, type SkillAction, type SkillState } from './logic';
import { SkillCard, SkillFull } from './View';

export const skillWidget: Widget<SkillState, SkillAction> = {
  type: 'skill',
  title: 'Skill',
  icon: 'star',
  category: 'Growth & Rewards',
  keywords: ['level', 'xp', 'grow', 'rpg'],
  container: true, // The Blossom: skills can nest sub-skills (later)
  logic: skillLogic,
  CardView: SkillCard,
  FullView: SkillFull,
  outputs: (state) => [{ key: 'level', name: 'Level', get: () => state.level }],
};
