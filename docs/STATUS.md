# STATUS — session handoff ledger

> The fast resume point. Read this + `CLAUDE.md` + `docs/MERGE-SPEC.md` to know where we are without re-scanning the tree. Newest first.

**Last updated:** 2026-06-23 · **Version:** v1.0.0 (W0 done · W1+W2 partial · **bootstrapped + bundle-verified · sync ported + repo wired**) · **Stack:** RN (Expo SDK 54) + Supabase, Android-first

---

## ⚖ Honest progress (read first)
The **merged spine** is in and now carries a real **Productivity vertical**: 7 widgets, the gamification core, and a working shell (module switch · page tabs · FAB add-gallery). Still mostly engine + first-module by felt-product measure (**~12–18%**), but the pattern is now proven across 7 diverse widgets, so each remaining Blossom widget is a clone-the-template job. Track felt-product % separately from engine %.

## Now (in progress)
- **Connect to the existing repo (one git command), then on-device pass.** Run the commands in **`CONNECT.md`** to attach `github.com/Simonatofficial/My-Blossom` and push v1.0.0 as the new main. Then `npx expo start` → Expo Go (SDK 54): confirm both seed modules render, page tabs switch, FAB adds a Tool, Habit tier logs a streak, **and your Supabase `objects` table fills as you add Tools** (anonymous sign-in + sync run on launch).

## Done this session (newest first)
- **Reused the existing GitHub + Supabase (no new ones) + ported the proven sync.** Copied the real `.env` (working Supabase URL + anon key) into v1.0.0; `app.json` already carries the same EAS `projectId`, so builds + EAS secrets carry over. The folder had its own git history but **no remote** (that's why Claude Code asked for a new GitHub) — **`CONNECT.md`** gives the one-time command to attach the existing repo and push. Brought v0.0.1's working M4 sync into v1.0.0, adapted to its Store: `core/store/prefs.ts` + `getPrefs`/`getSyncSource` + `allChangedSince`/`applyRemoteObj` (clock-preserving LWW) on both adapters; `core/sync/` = `types · engine · config · supabaseClient · supabaseRemote · auth · cursors · SyncProvider`, mounted in `_layout` (anonymous sign-in → push/pull on foreground/interval/Realtime against the same `objects` table). Theme now **persists** via prefs. All new `.ts` pass `node --check`; the sync is a byte-faithful port of code that already synced real objects on-device in v0.0.1. *(This sandbox can't edit `.git`/push or hit live Supabase — those run on Simon's machine/phone.)*
- **Bootstrap + full headless verification (the "Now" item, minus the physical phone).** First-ever `npm install` (811 pkgs, clean). **`npm run smoke` green — 12/12** (fixed a stale wallet assertion in `scripts/smoke.ts`: line 38 expected `1g 2s 3c` but `1234c = 1p 2g 3s 4c`, contradicting its own comment + the next line). **`tsc --noEmit` clean** (fixed an implicit-`any` on the `setState` updater param in `WidgetHost.tsx` — TS can't infer through the `SetStateAction` union; annotated `prev: unknown`). **`npx expo export --platform android` clean — 1413 modules bundled** with native platform resolution → 3.86 MB Hermes bundle. This compiles every `.tsx` view (the parts node can't check) the same way the phone will, so the device pass is now low-risk. *(Local git repo initialized + first commit; no GitHub remote yet — see Next.)*
- **W1 (partial) — shell to parity.** `app/index.tsx` rebuilt: module switcher sheet, bottom **page-tab bar**, **FAB → Add-widget gallery** (`src/ui/AddWidgetSheet.tsx`, categories + live search straight from the registry), open-to-full modal. New `addWidgetToPage` in `modules/engine.ts` mints a node+content object and appends it live. *(Still to do: 3-window module rail, per-widget settings panel from the `settings` schema, drag-reorder.)*
- **W2 (partial) — gamification core + Productivity widgets.** Ported pure load-bearing logic: `core/logic/` = `dates` · `wallet` (10:1 copper chain) · `xp` (curve `50·lvl^1.4`, level-up rollover) · **`growth`** (the Blossom loop — modules emit aspect-XP → attribute → aspect level). Ported **4 Productivity Tools** faithfully from The Blossom under the v1.0.0 contract: **quest** (step missions), **habit** (COSMOS tiers + streak + adherence), **goal** (weighted milestones + growth stage), **skill** (XP/level). Registry now serves **7 Tools**; new **Productivity module** preset (Today/Growth pages) seeded alongside the Blossom hub (`presets/modules.ts`).
- **Verified:** every `.ts` passes `node --check`; the brain executes green against the real source — 8 logic checks (dates · wallet · xp · growth loop · quest · habit · goal · skill) + store/sync (put/get/soft-delete · two-device LWW). `.tsx` views compile under Expo/Babel (JSX; not node-checkable). Not yet `npm install`'d / on-device.

## Next (queued, in order — per MERGE-SPEC §5)
0. **Connect to the EXISTING repo** (`CONNECT.md` — `github.com/Simonatofficial/My-Blossom`, no new repo needed) + **on-device pass** incl. confirming live Supabase sync fills the `objects` table.
2. **Finish W1:** 3-window module rail (active-centred, Blossom v115) + generic settings panel + drag-reorder + delete (soft).
3. **Finish W2:** port **Activity** module widgets (health, routine) → wire the growth engine into `WidgetHost.ctx.grow` so habit/quest/skill completions actually feed the aspect flowers; render the growing `AspectFlower`.
4. **W3 — Study garden;** **W4 — visual engine + Liri;** **W5 — Tabletop (SRD import first);** **W6 — Supabase transport + accounts + Blossom-code importer;** **W7 — creative/world/games → native extras → release.**

## Done (foundation — W0)
- **v1.0.0 W0 — the merge foundation.** Fresh folder fusing The Blossom (features) + v0.0.1 (clean RN/Supabase spine). Master `docs/MERGE-SPEC.md` (why v0.0.1 downgraded + full port map + wave roadmap). `Store` interface + `memory`/`sqlite` + `SyncEngine` (offline-first LWW) + hardened `supabase/schema.sql`; the enriched widget contract (two faces · outputs · container · primaryTap · settings · categories); registry + `WidgetHost`; theme system + 7 themes; Module→Page→Widget model + instantiator; 3 reference Tools; app shell. Kept v0.0.1's correct bones; enriched only the contract so The Blossom's widgets fit.

---
### How to use this file
- **Starting:** move the task into **Now** with a one-line frame (Goal · Approach · Files · Done-when).
- **Finishing:** move to **Done** with its `v1.0.x` tag; pull the next item into **Now**; bump *Last updated* + *Version*.
