/**
 * The coin wallet — pure math over a single raw-copper integer. The four
 * denominations (copper/silver/gold/platinum, 10:1 chain) are display-only.
 * Ported verbatim in behaviour from The Blossom's core/wallet.js; here it's
 * pure functions (no global store) so it's testable and the host owns where the
 * balance lives (a `meta` object in the store).
 */

export interface CoinSplit { p: number; g: number; s: number; c: number }

/** Credit copper (earnings always enter as copper-equivalent). Never negative. */
export function add(balance: number, copper: number): number {
  return balance + Math.max(0, Math.round(copper));
}

/** Spend copper. Returns the new balance, or null if funds are insufficient. */
export function spend(balance: number, copper: number): number | null {
  const cost = Math.round(copper);
  if (balance < cost) return null;
  return balance - cost;
}

export function split(copper: number): CoinSplit {
  return {
    p: Math.floor(copper / 1000),
    g: Math.floor((copper % 1000) / 100),
    s: Math.floor((copper % 100) / 10),
    c: copper % 10,
  };
}

/** Render "1g 2s 3c" (skips zero denominations; "0c" when empty). */
export function format(copper: number): string {
  const { p, g, s, c } = split(copper);
  const parts: string[] = [];
  if (p) parts.push(`${p}p`);
  if (g) parts.push(`${g}g`);
  if (s) parts.push(`${s}s`);
  if (c || !parts.length) parts.push(`${c}c`);
  return parts.join(' ');
}
