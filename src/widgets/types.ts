import type { ComponentType, ReactNode } from 'react';
import type { Obj, Store } from '../core/store/types';

/**
 * The Tool (a.k.a. Widget) plugin contract — v1.0.0.
 *
 * This is the BIG upgrade over v0.0.1. v0.0.1 modelled a widget as just
 * `{ logic, View }` — too thin to express The Blossom's real widgets, which have
 * TWO faces (a card + an openable full view), expose VALUE OUTPUTS to the link
 * system, can CONTAIN other widgets, and declare their own SETTINGS. Trying to
 * bolt those on later is exactly how v0.0.1's "upgrades" became downgrades.
 *
 * So v1.0.0 ports The Blossom's proven `registry.register({...})` shape — but
 * fully TYPED and with logic kept PURE (the one rule v0.0.1 got right). A Tool is:
 *   - a pure brain   (logic: state + reducer + day-rollover) — no RN, node-testable
 *   - up to two views (CardView = external face, FullView = internal panel)
 *   - metadata       (outputs, container, settings, category, keywords)
 *
 * HARD RULE (from The Blossom's pain): a Tool is COMPLETE AND STANDALONE. It may
 * optionally read another Tool's outputs (a graph CAN surface a tracker) but
 * NEVER depends on one — if a linked Tool is missing/empty, this Tool still works
 * and nothing throws. Connections enrich; they never couple. (docs/02 §Tools.)
 */

/** A value a Tool exposes to the link/graph system (docs/02 §Values). */
export interface OutputDef {
  key: string;
  name: string;
  /** day-keyed outputs (e.g. a tracker item) are queried by date. */
  dayKeyed?: boolean;
  /** Pure getter over the Tool's own state — never reaches into other Tools. */
  get: (state: unknown, date?: string) => number;
}

/** One declarative settings field — drives a generic settings panel. */
export interface SettingsField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color';
  options?: { label: string; value: string }[]; // for 'select'
  hint?: string;
}
export type SettingsSchema = SettingsField[];

/** A Tool's pure brain — state shape + how actions change it. No view, no RN. */
export interface WidgetLogic<S, A> {
  defaults(): S;
  reduce(state: S, action: A): S;
  /** Optional: called once when the calendar day rolls over (streaks, resets). */
  onDayRolled?(state: S, today: string): S;
}

/** Context the host hands every view. Tools touch the world ONLY through this —
 *  they never import each other or the store directly (keeps them decoupled). */
export interface WidgetContext {
  store: Store;
  /** Navigate to a module/page/widget/object by ref. */
  navigate: (ref: string) => void;
  /** Soft, transient confirmation message. */
  toast: (msg: string) => void;
  /** Read a linked source's current output value (safe: returns null if absent). */
  readLink?: (outputKey: string, date?: string) => number | null;
  /** Award aspect-XP to the Blossom growth engine (docs/06). Tagged by attribute/skill. */
  grow?: (aspect: string, attribute: string, amount: number, skill?: string) => void;
}

/** Props every Tool view receives. CardView is the at-a-glance face; FullView
 *  the openable panel. `host` lets containers render nested child widgets. */
export interface WidgetViewProps<S, A> {
  state: S;
  dispatch: (action: A) => void;
  ctx: WidgetContext;
  /** present for the object backing this instance (id, moduleId, links). */
  obj: Obj<S>;
  /** containers call this to render a child widget by its object. */
  renderChild?: (childId: string) => ReactNode;
}

/** A complete Tool: brain + faces + metadata. */
export interface Widget<S = unknown, A = unknown> {
  /** Stable id, also the Store `kind` for this Tool's objects (e.g. 'notes'). */
  type: string;
  /** Display name in chrome ("Notes"). */
  title: string;
  /** Icon id from the shared icon set (icons over emoji — engineering rule 7). */
  icon: string;
  /** Grouping for the long Add-widget gallery (docs/05 categories). */
  category: WidgetCategory;
  /** Search keywords for the Add gallery. */
  keywords?: string[];
  /** Can this Tool hold child widgets? (Notes, Journal, Separator, Routine…) */
  container?: boolean;

  logic: WidgetLogic<S, A>;
  /** External face — the card on the page. Most Tools have one. */
  CardView?: ComponentType<WidgetViewProps<S, A>>;
  /** Internal view — the full panel on tap. Present if the Tool opens. */
  FullView?: ComponentType<WidgetViewProps<S, A>>;
  /** Tapping the card body fires this instead of opening (Counter +1, Dice reroll). */
  primaryTap?: (state: S, dispatch: (a: A) => void, ctx: WidgetContext) => void;

  outputs?: (state: S) => OutputDef[];
  settings?: SettingsSchema;
}

export type WidgetCategory =
  | 'Productivity'
  | 'Notes & Writing'
  | 'Growth & Rewards'
  | 'Data & Charts'
  | 'Creative'
  | 'Study'
  | 'Utility'
  | 'Organization'
  | 'Games'
  | 'Tabletop'
  | 'World'
  | 'Companion';
