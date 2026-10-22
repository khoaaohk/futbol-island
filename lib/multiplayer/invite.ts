// Party invitations (design docs/multiplayer-design.md 2.1-2.3, 3). The code is the only capability: no accounts, no names.
// Relay HTTP calls (POST /party, GET /party/:code), link / share / QR helpers and the pending-link store. No analytics, no saves.
import { CODE_ALPHABET, CODE_LENGTH, normalizeCode } from '../../multiplayer/protocol';
import { SITE_URL } from '../site/seo';
import { relayHttpUrl } from './config';

export const PENDING_KEY = 'fi-party-pending'; // sessionStorage; deliberately not a fi2-* save key, so it is never synced
export const PENDING_TTL_MS = 30 * 60 * 1000; // an invite link opened long ago is stale
export const PARTY_EVENT = 'fi-party-open'; // window event: anything in the HUD can ask PartyHost to open the Play with friends card
export const NOT_IN_CODES_HINT = "That letter isn't used in codes";

export type CreatedParty = { code: string; hostKey: string; expiresAt: number };

export async function createParty(): Promise<CreatedParty | { error: 'rate' | 'offline' }> {
  const base = relayHttpUrl();
  if (!base) return { error: 'offline' };
  try {
    const res = await fetch(`${base}/party`, { method: 'POST' });
    if (res.status === 429) return { error: 'rate' };
    if (!res.ok) return { error: 'offline' };
    const b = (await res.json()) as Partial<CreatedParty>;
    if (typeof b.code !== 'string' || typeof b.hostKey !== 'string' || typeof b.expiresAt !== 'number' || !normalizeCode(b.code)) return { error: 'offline' };
    return { code: b.code, hostKey: b.hostKey, expiresAt: b.expiresAt };
  } catch {
    return { error: 'offline' };
  }
}

/** null = no such party (or the relay cannot be reached). */
export async function checkParty(code: string): Promise<{ open: boolean; size: number; full: boolean } | null> {
  const base = relayHttpUrl();
  const c = normalizeCode(code);
  if (!base || !c) return null;
  try {
    const res = await fetch(`${base}/party/${c}`);
    if (!res.ok) return null;
    const b = (await res.json()) as { open?: boolean; size?: number; full?: boolean };
    return { open: !!b.open, size: typeof b.size === 'number' ? b.size : 0, full: !!b.full };
  } catch {
    return null;
  }
}

/** Links from localhost / LAN / preview origins stay on that origin (so a two-device test works); real players get SITE_URL. */
export function partyOrigin(): string {
  try {
    const o = location.origin;
    if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.[\d.]+|10\.[\d.]+|[a-z0-9-]+\.vercel\.app)(:\d+)?$/i.test(o)) return o;
  } catch { /* no location (SSR / tests) */ }
  return SITE_URL;
}

export function partyLink(code: string): string {
  return `${partyOrigin()}/?party=${code}`;
}

/** Web Share where the browser has it, else the clipboard. */
export async function sharePartyLink(code: string): Promise<'shared' | 'copied' | 'failed'> {
  const url = partyLink(code);
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({ title: 'Play with me on Futbol Island', url });
      return 'shared';
    }
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') return 'failed'; // the sheet was closed: not an error worth a copy
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}

const qrCache = new Map<string, string | null>();
/** QR of the link as a data URL; the qrcode package loads only here, on demand. */
export async function partyQr(code: string): Promise<string | null> {
  if (qrCache.has(code)) return qrCache.get(code) ?? null;
  try {
    const { default: QR } = await import('qrcode');
    const url = await QR.toDataURL(partyLink(code), { width: 240, margin: 1, errorCorrectionLevel: 'M' });
    qrCache.set(code, url);
    return url;
  } catch {
    qrCache.set(code, null);
    return null;
  }
}

function session(): Storage | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; }
}

/** The code from `?party=` (then removed from the address bar) or from sessionStorage; invalid codes are ignored and dropped. */
export function readPendingParty(): string | null {
  const s = session();
  try {
    if (typeof location !== 'undefined') {
      const url = new URL(location.href);
      const raw = url.searchParams.get('party');
      if (raw !== null) {
        url.searchParams.delete('party');
        try { history.replaceState(history.state, '', url.pathname + url.search + url.hash); } catch { /* ignore */ }
        const c = normalizeCode(raw);
        if (c) { try { s?.setItem(PENDING_KEY, `${c}:${Date.now()}`); } catch { /* ignore */ } return c; }
      }
    }
  } catch { /* ignore */ }
  try {
    const stored = s?.getItem(PENDING_KEY) ?? null;
    const [rawCode, rawAt] = stored ? stored.split(':') : [null, null];
    const c = rawCode ? normalizeCode(rawCode) : null;
    const at = rawAt ? Number(rawAt) : Date.now(); // a bare code (no stamp) counts as fresh
    if (stored && (!c || !(Date.now() - at < PENDING_TTL_MS))) { s?.removeItem(PENDING_KEY); return null; } // bad or older than 30 min
    return c;
  } catch {
    return null;
  }
}

/** Flag off (or any caller that must not join): take ?party= out of the address bar without keeping it. */
export function stripPartyParam(): void {
  try {
    if (typeof location === 'undefined') return;
    const url = new URL(location.href);
    if (url.searchParams.get('party') === null) return;
    url.searchParams.delete('party');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  } catch { /* ignore */ }
}

/** Store a typed code (title screen) as the pending party. Normalises; returns the code, or null (nothing stored) when the shape is wrong. */
export function setPendingParty(code: string): string | null {
  const c = normalizeCode(code);
  if (!c) return null;
  try { session()?.setItem(PENDING_KEY, `${c}:${Date.now()}`); } catch { /* ignore */ }
  return c;
}

export function clearPendingParty(): void {
  try { session()?.removeItem(PENDING_KEY); } catch { /* ignore */ }
}

/** Ask PartyHost (if mounted and the flag is on) to open the Play with friends card. */
export function openPartyMenu(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PARTY_EVENT));
}

// ---- pure helpers (tested in tests/mp-ui.cjs) ----
/** 'K7MQ4R' -> 'K7M-Q4R' (a partial code gets the dash only once it has more than 3 characters). */
export function groupCode(code: string): string {
  return code.length > 3 ? `${code.slice(0, 3)}-${code.slice(3)}` : code;
}

/** One typed character -> an alphabet character (upper case), or null. */
export function acceptCodeChar(ch: string): string | null {
  const c = ch.toUpperCase();
  return c.length === 1 && CODE_ALPHABET.indexOf(c) >= 0 ? c : null;
}

/** Typed / pasted text -> the accepted characters (max CODE_LENGTH) plus whether anything was rejected (spaces and dashes are free). */
export function filterCodeText(text: string): { chars: string; rejected: boolean } {
  let chars = '';
  let rejected = false;
  for (const ch of text) {
    if (ch === ' ' || ch === '-') continue;
    const c = acceptCodeChar(ch);
    if (c === null) rejected = true;
    else if (chars.length < CODE_LENGTH) chars += c;
  }
  return { chars, rejected };
}

/** "Red Zebra joined" / "2 friends joined". */
export function joinNote(names: string[]): string {
  return names.length === 1 ? `${names[0]} joined` : `${names.length} friends joined`;
}

/** Collects the names that join within `windowMs` (from the first one) and hands them over together, so a big party's joins show as one note. */
export function createJoinBuffer(flush: (names: string[]) => void, windowMs = 1500): { add(names: string[]): void; cancel(): void } {
  let names: string[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    add(n) {
      names = names.concat(n);
      if (timer === null) timer = setTimeout(() => { const out = names; names = []; timer = null; if (out.length) flush(out); }, windowMs);
    },
    cancel() { if (timer !== null) clearTimeout(timer); timer = null; names = []; },
  };
}

/** "1 h 52 min" style text for the invite card; '' once it is over. */
export function expiryText(expiresAt: number, now: number): string {
  const min = Math.ceil((expiresAt - now) / 60000);
  if (min <= 0) return '';
  // Spelled out for kids and grown-ups (Oct 22 2026, user: "also spell out hours"): "1 hour 52 minutes", "2 hours", "30 minutes".
  const unit = (n: number, one: string) => `${n} ${n === 1 ? one : one + 's'}`;
  if (min < 60) return unit(min, 'minute');
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${unit(h, 'hour')} ${unit(m, 'minute')}` : unit(h, 'hour');
}
