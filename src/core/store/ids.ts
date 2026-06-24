/**
 * Id helpers. `uuid` for opaque object ids; `ulid` (lexicographically sortable,
 * time-prefixed) for things we want to sort by creation. Both are plain strings
 * so Supabase columns stay `text` (v0.0.1 hit a live 400 by typing object ids as
 * Postgres `uuid` then minting friendly ids — we keep ids as text everywhere).
 */

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** RFC4122-ish v4 (uses Math.random — fine for client-local ids, not crypto). */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Time-sortable id. First 10 chars encode the timestamp, last 16 are random. */
export function ulid(now: number = Date.now()): string {
  let ts = '';
  let t = now;
  for (let i = 0; i < 10; i++) {
    ts = CROCKFORD[t % 32] + ts;
    t = Math.floor(t / 32);
  }
  let rand = '';
  for (let i = 0; i < 16; i++) rand += CROCKFORD[(Math.random() * 32) | 0];
  return ts + rand;
}
