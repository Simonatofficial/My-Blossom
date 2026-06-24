/**
 * PrefsCursorStore — persists the sync cursors in the sqlite-backed Prefs,
 * namespaced per user so signing into a different account starts clean. Cursors
 * are two epoch-ms watermarks (see engine.ts). Ported from v0.0.1.
 */
import { getPrefs } from '../store';
import type { CursorStore, Cursors } from './engine';

const ZERO: Cursors = { pushedAt: 0, pulledAt: 0 };

export class PrefsCursorStore implements CursorStore {
  private readonly key: string;

  constructor(userId: string) {
    this.key = `sync.cursors.${userId}`;
  }

  async load(): Promise<Cursors> {
    const saved = await (await getPrefs()).getJSON<Cursors>(this.key);
    return saved ?? ZERO;
  }

  async save(c: Cursors): Promise<void> {
    await (await getPrefs()).setJSON(this.key, c);
  }
}
