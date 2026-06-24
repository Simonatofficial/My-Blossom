/**
 * The module engine — instantiates a preset ModuleDef into live store objects
 * with fresh ids, recursing into nested widgets, and creates each widget's
 * backing content object (its pure-logic defaults). Ported in spirit from The
 * Blossom's preset instantiator (docs/08), typed and store-backed.
 *
 * This is the generic renderer's data source: build a module once from a def,
 * then the shell renders whatever is in the store. Adding a module never touches
 * the engine — it's all data.
 */
import type { Store } from '../core/store/types';
import { ulid } from '../core/store/ids';
import { getWidget } from '../widgets/registry';
import type { ModuleDef, ModuleDoc, PageDoc, WidgetDef, WidgetDoc } from './types';

async function buildWidget(
  store: Store,
  def: WidgetDef,
  moduleId: string,
  pageId: string,
  parentId: string | undefined,
): Promise<string> {
  const id = ulid();
  const childIds: string[] = [];

  // The layout node.
  const node: WidgetDoc = {
    id, moduleId, pageId, type: def.type, parentId, childIds, config: def.config ?? {},
  };

  // The content object (the Tool's pure-logic defaults), keyed by the same id.
  const plugin = getWidget(def.type);
  if (plugin) {
    await store.put({
      id, kind: plugin.type, moduleId,
      data: plugin.logic.defaults(), updatedAt: Date.now(),
    });
  }

  // Recurse into nested children (container widgets).
  if (def.children?.length) {
    for (const child of def.children) {
      childIds.push(await buildWidget(store, child, moduleId, pageId, id));
    }
  }

  await store.put({ id: `node:${id}`, kind: 'widgetNode', moduleId, data: node, updatedAt: Date.now() });
  return id;
}

/** Add a new widget to an existing page: mints the node + content object and
 *  appends it to the page's widgetIds. Returns the new widget id. Used by the
 *  FAB Add-widget gallery — the live counterpart of preset instantiation. */
export async function addWidgetToPage(
  store: Store,
  page: PageDoc,
  type: string,
): Promise<string> {
  const id = await buildWidget(store, { type, config: {} }, page.moduleId, page.id, undefined);
  const next: PageDoc = { ...page, widgetIds: [...page.widgetIds, id] };
  await store.put({ id: page.id, kind: 'page', moduleId: page.moduleId, data: next, updatedAt: Date.now() });
  return id;
}

/** Instantiate a preset into the store; returns the new module id. */
export async function instantiateModule(store: Store, def: ModuleDef): Promise<string> {
  const moduleId = ulid();
  const pageIds: string[] = [];
  let homePageId: string | undefined;

  for (const pageDef of def.pages) {
    const pageId = ulid();
    const widgetIds: string[] = [];
    for (const w of pageDef.widgets) {
      widgetIds.push(await buildWidget(store, w, moduleId, pageId, undefined));
    }
    const page: PageDoc = {
      id: pageId, moduleId, name: pageDef.name, icon: pageDef.icon,
      layout: pageDef.layout ?? 'masonry', widgetIds,
    };
    await store.put({ id: pageId, kind: 'page', moduleId, data: page, updatedAt: Date.now() });
    pageIds.push(pageId);
    if (pageDef.home) homePageId = pageId;
  }

  const mod: ModuleDoc = {
    id: moduleId, name: def.name, icon: def.icon, themeId: def.themeId,
    pageIds, homePageId: homePageId ?? pageIds[0], feedsAspect: def.feedsAspect,
  };
  await store.put({ id: moduleId, kind: 'module', moduleId, data: mod, updatedAt: Date.now() });
  return moduleId;
}
