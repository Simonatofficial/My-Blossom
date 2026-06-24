import type { ModuleDef } from '@/modules/types';
import { BLOSSOM_PRESET } from './blossom';
import { PRODUCTIVITY_PRESET } from './productivity';
import { ACTIVITY_PRESET } from './activity';

/**
 * The preset module gallery. "New module → from Preset" reads this; first-run
 * seeding plants the starred ones. Add a module preset = one import + one entry.
 * The full Blossom roster (Activity, Study, D&D DM/Character, World, Canvas…)
 * lands here wave by wave (MERGE-SPEC §4.3).
 */
export const MODULE_PRESETS: ModuleDef[] = [BLOSSOM_PRESET, PRODUCTIVITY_PRESET, ACTIVITY_PRESET];

/** Planted automatically on a fresh install. */
export const SEED_PRESETS: ModuleDef[] = [BLOSSOM_PRESET, PRODUCTIVITY_PRESET, ACTIVITY_PRESET];
