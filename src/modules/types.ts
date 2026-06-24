/**
 * The Module → Page → Widget data model (docs/04). Everything here is DATA:
 * presets are just bundled definition files, instantiated into the store with
 * fresh ids. The app renders these generically — never hard-code a screen where
 * a definition object will do (engineering rule 2).
 *
 * Stored shapes (in the store, kind = 'module' | 'page' | 'widget'):
 *   - Module: { id, name, icon, themeId?, pageIds[], homePageId?, identity? }
 *   - Page:   { id, moduleId, name, icon, layout, widgetIds[] }
 *   - Widget: { id, moduleId, pageId, type, parentId?, config, childIds[] }
 * Widget *content* (a note's text, a tracker's items) lives in the widget's own
 * `kind` object via the Store, keyed by the same id — so a Tool's brain owns its
 * data and the layout tree just references it.
 */

export interface ModuleDoc {
  id: string;
  name: string;
  icon: string;
  themeId?: string;
  pageIds: string[];
  homePageId?: string;
  /** Living-Layout identity (optional world feel). */
  identity?: { feel?: string; accentShape?: string };
  /** The aspect this module feeds, if any (docs/06 — the Blossom loop). */
  feedsAspect?: string;
}

export type PageLayout = 'masonry' | 'stream' | 'hearth' | 'gallery' | 'split';

export interface PageDoc {
  id: string;
  moduleId: string;
  name: string;
  icon: string;
  layout: PageLayout;
  widgetIds: string[];
}

export interface WidgetDoc {
  id: string;
  moduleId: string;
  pageId: string;
  type: string; // registry key
  parentId?: string; // set when nested inside a container widget
  childIds?: string[]; // for container widgets
  config?: Record<string, unknown>; // type-specific settings values
}

// --- Preset definitions (pure data, no ids until instantiated) ---

export interface WidgetDef {
  type: string;
  ref?: string; // '@name' — referenceable by links within the preset
  config?: Record<string, unknown>;
  children?: WidgetDef[];
}

export interface PageDef {
  name: string;
  icon: string;
  layout?: PageLayout;
  home?: boolean;
  widgets: WidgetDef[];
}

export interface ModuleDef {
  key: string; // preset key (e.g. 'blossom', 'dnddm')
  name: string;
  icon: string;
  themeId?: string;
  feedsAspect?: string;
  pages: PageDef[];
}
