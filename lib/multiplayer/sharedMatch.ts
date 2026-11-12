// Public island: "am I in a shared live match right now" (matchLink.ts sets it; the presence switch reads it to warn before a switch,
// because switching closes the socket: an implicit Leave, after which the local match plays on from where it is). No imports, no timers.
let on = false;
const subs = new Set<(on: boolean) => void>();
export function setSharedMatch(v: boolean): void { if (v === on) return; on = v; for (const f of Array.from(subs)) f(v); }
export function inSharedMatch(): boolean { return on; }
export function onSharedMatch(fn: (on: boolean) => void): () => void { subs.add(fn); return () => { subs.delete(fn); }; }
