/** Phone coins bar (owner, Oct 23 2026): from 1,000 coins the number is shown as 1k / 1.2k / 12k / 123k / 1.2M to save room.
 *  Always rounds DOWN (never shows more than you have); the full number stays in the aria-label and the pocket. */
export function shortCoins(n: number): string {
  if (!Number.isFinite(n) || n < 1000) return String(Math.max(0, Math.trunc(n || 0)));
  const fmt = (v: number, unit: string) => {
    const tenths = Math.floor(v * 10) / 10;
    return (v < 10 ? (Number.isInteger(tenths) ? String(tenths) : tenths.toFixed(1)) : String(Math.floor(v))) + unit;
  };
  if (n < 1_000_000) return fmt(n / 1000, 'k');
  return fmt(n / 1_000_000, 'M');
}
