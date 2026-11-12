// Multiplayer client config (design docs/multiplayer-design.md 4.3, 5.1). NEXT_PUBLIC_* must be read literally so Next inlines it.
export function multiplayerEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MULTIPLAYER === '1';
}

/** Relay base URL without a trailing slash, or null when the flag is off or no URL is configured. */
export function relayHttpUrl(): string | null {
  if (!multiplayerEnabled()) return null;
  const raw = process.env.NEXT_PUBLIC_MULTIPLAYER_URL;
  if (!raw || !/^https?:\/\//i.test(raw)) return null;
  return raw.replace(/\/+$/, '');
}

/** `ws(s)://.../party/:code/ws`, derived from the http(s) relay URL. Null when disabled or the code is not plain alphanumerics. */
export function relayWsUrl(code: string): string | null {
  const base = relayHttpUrl();
  if (!base || !/^[A-Z0-9]{1,16}$/.test(code)) return null;
  return `${base.replace(/^http/i, 'ws')}/party/${code}/ws`;
}

/** Public island (relay v2.0): a world shard number from the lobby (1..WORLD_MAX_SHARDS). Anything else never reaches a URL. */
export const validShard = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 999;
/** `GET /world[?in=shard]` (the lobby), or null when the flag is off / no relay URL. */
export function relayLobbyUrl(inShard: number | null): string | null {
  const base = relayHttpUrl();
  if (!base) return null;
  return validShard(inShard) ? `${base}/world?in=${inShard}` : `${base}/world`;
}
/** `ws(s)://.../world/:shard/ws`, or null when disabled or the shard is not a plain number. */
export function relayWorldWsUrl(shard: number): string | null {
  const base = relayHttpUrl();
  if (!base || !validShard(shard)) return null;
  return `${base.replace(/^http/i, 'ws')}/world/${shard}/ws`;
}
