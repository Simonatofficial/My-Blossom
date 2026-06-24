/**
 * The five aspects, as DATA (everything-is-data, rule 2). Each aspect is a
 * flower: its attributes are the petals (docs/06, DESIGN-DOC Floor 1.3). The
 * growth engine replaces the placeholder `level`s with real values earned from
 * the modules — petals grow as attributes level; skills (stars) come next.
 * Ported from v0.0.1 (this part was right); colours are a cozy first pass.
 */
export interface AttributeDef {
  id: string;
  name: string;
  level: number; // 1..MAX_LEVEL — placeholder until the growth engine lands
}

export interface AspectDef {
  id: string;
  name: string;
  module: string; // the module that feeds this aspect (docs/06)
  petalColor: string;
  seedColor: string;
  attributes: AttributeDef[];
  level: number;
}

export const MAX_LEVEL = 10;

const attrs = (names: string[]): AttributeDef[] =>
  names.map((name) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, level: 1 }));

export const ASPECTS: AspectDef[] = [
  { id: 'mental', name: 'Mental', module: 'Productivity', petalColor: '#7db4f0', seedColor: '#f0c860',
    attributes: attrs(['Focus', 'Learning', 'Creativity', 'Discipline', 'Wisdom']), level: 1 },
  { id: 'physical', name: 'Physical', module: 'Activity', petalColor: '#6cc6a0', seedColor: '#e8943a',
    attributes: attrs(['Strength', 'Conditioning', 'Mobility', 'Nutrition', 'Sleep', 'Health']), level: 1 },
  { id: 'emotional', name: 'Emotional', module: 'Meditation', petalColor: '#c79af0', seedColor: '#f0c860',
    attributes: attrs(['Calm', 'Resilience', 'Gratitude', 'Self-awareness']), level: 1 },
  { id: 'social', name: 'Social', module: 'Connection', petalColor: '#f0908f', seedColor: '#f0c860',
    attributes: attrs(['Connection', 'Communication', 'Empathy', 'Community']), level: 1 },
  { id: 'recreation', name: 'Recreation', module: 'Recreation', petalColor: '#f0c860', seedColor: '#e8943a',
    attributes: attrs(['Play', 'Creativity', 'Curiosity', 'Rest']), level: 1 },
];
