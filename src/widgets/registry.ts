/**
 * The Tool registry. New Tool = new folder under src/widgets/<type>/ + one line
 * in the launch set below — zero edits anywhere else (docs/01 §4).
 *
 * Heterogeneous plugins erase their state/action generics here on purpose; the
 * `any` is the type-erased plugin boundary, kept local to this file + the host.
 *
 * The launch set is intentionally SMALL right now: the three reference Tools
 * that prove the v1.0.0 contract. The full Blossom roster (~60 types) is ported
 * in waves per docs/04 (the port map) — each wave just adds imports here.
 */
import type { Widget, WidgetCategory } from './types';
import { notesWidget } from './notes';
import { trackerWidget } from './tracker';
import { counterWidget } from './counter';
import { questWidget } from './quest';
import { habitWidget } from './habit';
import { goalWidget } from './goal';
import { skillWidget } from './skill';
import { flowerWidget } from './flower';

const registry = new Map<string, Widget<any, any>>();

export function register<S, A>(w: Widget<S, A>): void {
  registry.set(w.type, w as Widget<any, any>);
}

export function getWidget(type: string): Widget<any, any> | undefined {
  return registry.get(type);
}

export function allWidgets(): Widget<any, any>[] {
  return [...registry.values()];
}

/** Tools grouped by category, for the collapsible Add-widget gallery. */
export function widgetsByCategory(): Record<string, Widget<any, any>[]> {
  const out: Record<string, Widget<any, any>[]> = {};
  for (const w of registry.values()) (out[w.category] ??= []).push(w);
  return out;
}

/** Keyword + title search for the Add gallery. */
export function searchWidgets(q: string): Widget<any, any>[] {
  const s = q.trim().toLowerCase();
  if (!s) return allWidgets();
  return allWidgets().filter(
    (w) =>
      w.title.toLowerCase().includes(s) ||
      w.type.includes(s) ||
      (w.keywords ?? []).some((k) => k.includes(s)),
  );
}

// The launch set. New Tool = import above + one entry here. Order = gallery order.
const launch: Widget<any, any>[] = [
  // Productivity
  trackerWidget, questWidget, habitWidget, goalWidget,
  // Notes & Writing
  notesWidget,
  // Growth & Rewards
  flowerWidget, skillWidget,
  // Data & Charts
  counterWidget,
];
launch.forEach((w) => register(w));

export type { WidgetCategory };
