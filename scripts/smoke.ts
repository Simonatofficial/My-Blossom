/**
 * Headless smoke test — proves the *brain* works with zero RN/device deps. We
 * import only pure modules (logic.ts, core/logic/*, the memory store); never the
 * View.tsx / registry (those need React Native). Run: `npm run smoke`.
 *
 * (Local note: Node 22's experimental type-stripper trips on a couple of pure-TS
 * forms; Expo/tsc compile everything. CI should run this via `tsx`.)
 */
import assert from 'node:assert';
import { MemoryStore } from '../src/core/store/memory';
import * as wallet from '../src/core/logic/wallet';
import { grantXp, xpToNext } from '../src/core/logic/xp';
import { applyGrowth, aspectLevel, emptyGrowth } from '../src/core/logic/growth';
import { todayStr, dateAdd, daysBetween } from '../src/core/logic/dates';
import { counterLogic } from '../src/widgets/counter/logic';
import { notesLogic } from '../src/widgets/notes/logic';
import { trackerLogic, valueOf } from '../src/widgets/tracker/logic';
import { questLogic, stepStats, suggestedXp } from '../src/widgets/quest/logic';
import { habitLogic, computeStreak, adherence } from '../src/widgets/habit/logic';
import { goalLogic, progress } from '../src/widgets/goal/logic';
import { skillLogic } from '../src/widgets/skill/logic';

let passed = 0;
const ok = (n: string) => { console.log('  ✓', n); passed++; };

// --- core: dates ---
{
  assert.equal(dateAdd('2026-06-23', 1), '2026-06-24');
  assert.equal(dateAdd('2026-03-01', -1), '2026-02-28');
  assert.equal(daysBetween('2026-06-20', '2026-06-23'), 3);
  ok('dates: add + diff across month');
}

// --- core: wallet (10:1 chain) ---
{
  let b = 0;
  b = wallet.add(b, 1234);
  assert.equal(wallet.format(b), '1p 2g 3s 4c'); // 1234c = 1p 2g 3s 4c (add + format)
  assert.equal(wallet.format(1234), '1p 2g 3s 4c');
  assert.equal(wallet.spend(5, 10), null); // insufficient
  assert.equal(wallet.spend(20, 7), 13);
  ok('wallet: add + denominations + spend guard');
}

// --- core: xp curve + grant rollover ---
{
  assert.equal(xpToNext(1), 50);
  const r = grantXp({ level: 1, xp: 0 }, 130); // 50 + 70(? l2) ...
  assert.ok(r.level >= 2 && r.leveled >= 1);
  ok('xp: curve + multi-level grant');
}

// --- core: growth engine (Blossom loop) ---
{
  let g = emptyGrowth();
  for (let i = 0; i < 20; i++) g = applyGrowth(g, { aspect: 'mental', attribute: 'learning', amount: 40 });
  const lvl = aspectLevel(g, 'mental', ['focus', 'learning', 'creativity', 'discipline', 'wisdom']);
  assert.ok(lvl >= 1, 'aspect level derived');
  ok('growth: events raise attribute → aspect level');
}

// --- widgets ---
{
  let s = counterLogic.defaults();
  s = counterLogic.reduce(s, { type: 'setStep', step: 5 });
  s = counterLogic.reduce(counterLogic.reduce(s, { type: 'inc' }), { type: 'inc' });
  assert.equal(s.value, 10);
  ok('counter');
}
{
  let s = notesLogic.defaults();
  s = notesLogic.reduce(s, { type: 'add' });
  s = notesLogic.reduce(s, { type: 'edit', id: s.notes[0].id, patch: { title: 'Hi' } });
  assert.equal(s.notes[0].title, 'Hi');
  ok('notes');
}
{
  let s = trackerLogic.defaults();
  s = trackerLogic.reduce(s, { type: 'addItem', name: 'Water', itemType: 'count' });
  const id = s.items[0].id; const d = todayStr();
  s = trackerLogic.reduce(s, { type: 'bump', date: d, itemId: id, by: 3 });
  assert.equal(valueOf(s, id, d), 3);
  ok('tracker: day-keyed value');
}
{
  let s = questLogic.defaults();
  s = questLogic.reduce(s, { type: 'addStep', text: 'a' });
  s = questLogic.reduce(s, { type: 'addStep', text: 'b' });
  assert.equal(suggestedXp(s), 20);
  s = questLogic.reduce(s, { type: 'toggleStep', id: s.steps[0].id });
  assert.equal(stepStats(s).pct, 50);
  ok('quest: steps + suggested XP + progress');
}
{
  let s = habitLogic.defaults();
  const t = todayStr();
  s = habitLogic.reduce(s, { type: 'logTier', date: t, tier: 'mvv' });
  s = habitLogic.reduce(s, { type: 'logTier', date: dateAdd(t, -1), tier: 'standard' });
  assert.equal(computeStreak(s.log, t), 2);
  assert.ok(adherence(s, t) > 0);
  ok('habit: COSMOS tier log + streak + adherence');
}
{
  let s = goalLogic.defaults();
  s = goalLogic.reduce(s, { type: 'addMilestone', name: 'm1' });
  s = goalLogic.reduce(s, { type: 'addMilestone', name: 'm2' });
  s = goalLogic.reduce(s, { type: 'toggleMilestone', id: s.milestones[0].id });
  assert.equal(progress(s), 50);
  ok('goal: weighted milestone progress');
}
{
  let s = skillLogic.defaults();
  s = skillLogic.reduce(s, { type: 'grant', amount: 60 });
  assert.ok(s.level >= 2, 'skill leveled from XP');
  ok('skill: grant XP → level up');
}

// --- the growth loop: Tool completions emit contributions, the flower grows ---
{
  // habit: a newly-logged day earns discipline; re-tapping the same day earns nothing.
  const h0 = habitLogic.defaults();
  const day = todayStr();
  const act = { type: 'logTier', date: day, tier: 'standard' } as const;
  const h1 = habitLogic.reduce(h0, act);
  assert.deepEqual(habitLogic.grows!(h0, h1, act), [{ attribute: 'discipline', amount: 10 }]);
  assert.deepEqual(habitLogic.grows!(h1, habitLogic.reduce(h1, act), act), []); // idempotent
  ok('grows/habit: new day → discipline, re-tap → nothing');

  // quest: completing a step earns focus; un/re-checking never farms it.
  let q = questLogic.defaults();
  q = questLogic.reduce(q, { type: 'addStep', text: 'a' });
  const toggle = { type: 'toggleStep', id: q.steps[0].id } as const;
  const q2 = questLogic.reduce(q, toggle);
  assert.deepEqual(questLogic.grows!(q, q2, toggle), [{ attribute: 'focus', amount: 10 }]);
  assert.deepEqual(questLogic.grows!(q2, questLogic.reduce(q2, toggle), toggle), []); // uncheck → none
  ok('grows/quest: step done → focus, uncheck → nothing');

  // goal: a milestone reached earns wisdom.
  let g = goalLogic.defaults();
  g = goalLogic.reduce(g, { type: 'addMilestone', name: 'm' });
  const mt = { type: 'toggleMilestone', id: g.milestones[0].id } as const;
  assert.deepEqual(goalLogic.grows!(g, goalLogic.reduce(g, mt), mt), [{ attribute: 'wisdom', amount: 20 }]);
  ok('grows/goal: milestone → wisdom');

  // skill: granted XP feeds learning 1:1, tagged with the skill name.
  const sk = skillLogic.defaults();
  const grant = { type: 'grant', amount: 25 } as const;
  assert.deepEqual(skillLogic.grows!(sk, skillLogic.reduce(sk, grant), grant), [{ attribute: 'learning', amount: 25, skill: 'Skill' }]);
  ok('grows/skill: grant → learning (1:1)');

  // wiring: feed the Mental flower from those contributions → its level rises.
  const mentalAttrs = ['focus', 'learning', 'creativity', 'discipline', 'wisdom'];
  let gr = emptyGrowth();
  for (let i = 0; i < 30; i++) {
    gr = applyGrowth(gr, { aspect: 'mental', attribute: 'discipline', amount: 10 });
    gr = applyGrowth(gr, { aspect: 'mental', attribute: 'focus', amount: 10 });
  }
  assert.ok(aspectLevel(gr, 'mental', mentalAttrs) >= 2, 'mental aspect grew from contributions');
  ok('grows→flower: contributions raise the aspect flower level');

  // retarget: an Activity-style habit (growthAttribute = strength) grows Physical.
  const hb = { ...habitLogic.defaults(), growthAttribute: 'strength' };
  const sAct = { type: 'logTier', date: '2025-01-01', tier: 'standard' } as const;
  assert.deepEqual(habitLogic.grows!(hb, habitLogic.reduce(hb, sAct), sAct), [{ attribute: 'strength', amount: 10 }]);
  ok('grows/retarget: config growthAttribute → grows a different aspect (Activity → Physical)');
}

// --- store + sync primitives ---
async function storeAndSync() {
  const st = new MemoryStore();
  await st.put({ id: 'c1', kind: 'counter', data: { value: 7 }, updatedAt: Date.now() });
  assert.equal((await st.get<{ value: number }>('counter', 'c1'))?.data.value, 7);
  await st.remove('c1');
  assert.equal(await st.get('counter', 'c1'), null);
  const A = new MemoryStore(); const B = new MemoryStore();
  await A.put({ id: 'n1', kind: 'notes', data: { notes: [] }, updatedAt: 1000 });
  const d = A.changedSince(0); B.applyRemote(d.objs, d.links);
  assert.ok(await B.get('notes', 'n1'));
  await B.put({ id: 'n1', kind: 'notes', data: { notes: [1] }, updatedAt: 9999 });
  B.applyRemote([{ id: 'n1', kind: 'notes', data: { notes: [] }, updatedAt: 500 }], []);
  assert.deepEqual((await B.get<any>('notes', 'n1'))?.data.notes, [1]); // LWW kept newer
  ok('store + sync: put/get/soft-delete + two-device LWW');
}

(async () => {
  console.log('My Blossom v1.0.0 — smoke');
  await storeAndSync();
  console.log(`\n${passed} checks passed.`);
})();
