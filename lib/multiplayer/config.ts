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
