// The kid's typed first name for this page visit: memory only. Never written to any browser storage, cookie, save file or
// analytics event, never logged. Lost on reload (the game just asks again).
import { NICK_MAX, normalizeNick } from '../../multiplayer/protocol';

let chosen: string | null = null;
export const getNick = (): string | null => chosen;
export const setNick = (n: string | null): void => { chosen = normalizeNick(n); };
export const clearNick = (): void => { chosen = null; };
/** The first name is REQUIRED to start or join a party: 2 to 12 letters (normalizeNick). */
export const hasValidNick = (): boolean => chosen !== null;
export const NICK_HINT = 'Type your first name to play';

/** Live filter while typing: keep letters (A-Z, a-z, Latin-1 accented) only, at most NICK_MAX. Everything else is dropped silently. */
export function filterNickInput(text: string): string {
  return text.replace(/[^A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/g, '').slice(0, NICK_MAX);
}
