// Origin allow-list for the worker (review #10). Pure, so tests can load it.
// MP_ALLOWED_ORIGINS: comma-separated exact origins; one `*` per entry matches a single DNS label chunk ([a-z0-9-]*), e.g.
//   https://futbolisland.app,https://www.futbolisland.app,https://futbol-island-*-myteam.vercel.app
// Nothing else is allowed in production: no `futbol-island*` wildcard on all of vercel.app, no localhost, no missing Origin.
// MP_DEV=1 (local `wrangler dev` only) also allows localhost / 127.0.0.1 and a missing Origin.
export const DEFAULT_ORIGINS = 'https://futbolisland.app,https://www.futbolisland.app';

export interface OriginEnv { MP_ALLOWED_ORIGINS?: string; MP_DEV?: string }

export function compileOrigins(list: string | undefined): RegExp[] {
  const out: RegExp[] = [];
  for (const raw of (list || DEFAULT_ORIGINS).split(',')) {
    const o = raw.trim();
    if (!/^https?:\/\/[a-z0-9.*-]+(:\d+)?$/i.test(o)) continue; // malformed entries are ignored, never widened
    out.push(new RegExp('^' + o.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]*') + '$', 'i'));
  }
  return out;
}

export function originAllowed(origin: string | null, env: OriginEnv): boolean {
  const dev = env.MP_DEV === '1';
  if (!origin) return dev;
  if (dev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return compileOrigins(env.MP_ALLOWED_ORIGINS).some((r) => r.test(origin));
}
