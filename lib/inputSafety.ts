// Structural DOM check also works in tests and with elements from another window.
export function ownsKeyboard(target: unknown): boolean {
  const el = target as { closest?: (selector: string) => unknown } | null;
  return !!el?.closest?.('input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="textbox"], .pm-modal');
}

export type HeldKeys = Record<'up'|'down'|'left'|'right'|'shootEdge'|'passEdge', boolean>;
export function clearHeldKeys(keys: HeldKeys) {
  keys.up = keys.down = keys.left = keys.right = keys.shootEdge = keys.passEdge = false;
}

export const INPUT_HEARTBEAT_MS = 250;
export const INPUT_STALE_MS = 1250;
export function createInputWatchdog(release: () => void, now: () => number = () => performance.now()) {
  let last = -Infinity, armed = false;
  return {
    touch() { last = now(); armed = true; },
    reset() { armed = false; release(); },
    check() { if (armed && now() - last >= INPUT_STALE_MS) { armed = false; release(); return true; } return false; },
  };
}

export function createInputHeartbeat(send: (axes: {mx:number;my:number}) => void, now: () => number = () => performance.now()) {
  let last = -Infinity, mx = 0, my = 0;
  return (axes: {mx:number;my:number}) => {
    const t = now();
    if (Math.abs(axes.mx-mx) <= .02 && Math.abs(axes.my-my) <= .02 && t-last < INPUT_HEARTBEAT_MS) return;
    mx = axes.mx; my = axes.my; last = t; send({mx,my});
  };
}
