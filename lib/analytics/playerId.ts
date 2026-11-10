/**
 * Anonymous player ids (Oct 16 2026; user: "i basically want to know by individual level"). Server only (POST /api/visit via
 * ingest.ts). A session's start may carry ONE player key, both already one-way or random ON THE DEVICE:
 *   `ph`: SHA-256(fixed app string + the active save code), 64 hex, made in the browser (lib/analytics/playerHash.ts); or
 *   `pi`: the device's random install id (fi2-install-v1: 16 random bytes made once per device, lib/analytics/deviceMarks.ts).
 * Nov 10 2026 (privacy audit): the raw save code (`pc`) no longer leaves the device; a `pc` an old cached page still sends is
 * dropped unread (lib/analytics/core.ts validateEvent) and never turned into an id.
 * It becomes   HMAC(period key, "h:" + ph)  or  HMAC(period key, "i:" + pi), truncated to 32 hex, where
 *   period key = HMAC(analytics salt, "player id period " + floor(UTC days since 1970 / 90))
 * so the SAME child gets a NEW id every 90 days and, without the salt, an old id cannot be linked to a new one (docs/
 * security/analytics-player-ids.md: what restarts at each period boundary). Analytics never store the code, its hash, the raw
 * install id, an IP or a name. The analytics salt is ANALYTICS_PLAYER_SALT, else one derived from SAVE_CODE_PEPPER under its
 * own label (so the two keys are never the same); with neither, no player id is made at all.
 * /admin shows only 6 hex of a further hash (supabase/migrations/20261019_analytics_day_sessions.sql).
 */
import {createHmac} from 'crypto';
import {INSTALL_ID_RE} from './core';
import {PLAYER_HASH_RE} from './playerHash';

export const PLAYER_ID_RE=/^[0-9a-f]{32}$/;
export type PlayerSecrets={salt?:string|null;pepper?:string|null};
/** Player ids rotate every PERIOD_DAYS UTC days (period 0 began 1970-01-01). */
export const PERIOD_DAYS=90;
export const periodIndex=(nowMs:number)=>Math.floor(nowMs/86_400_000/PERIOD_DAYS);
/** The UTC start of the period holding nowMs (for /admin and the doc). */
export const periodStart=(nowMs:number)=>new Date(periodIndex(nowMs)*PERIOD_DAYS*86_400_000);

/** The analytics salt: ANALYTICS_PLAYER_SALT, else HMAC(pepper, a fixed label); null without either. */
export function playerSalt({salt,pepper}:PlayerSecrets):string|null{
 if(salt&&salt.length>=16)return salt;
 if(pepper)return createHmac('sha256',pepper).update('analytics player salt, version 1').digest('hex');
 return null;
}

/** The stored player id for a start's key in the period holding nowMs, or null (nothing sent, a malformed key, no secret). */
export function derivePlayerId(key:{ph?:string;pi?:string},secrets:PlayerSecrets=envSecrets(),nowMs:number=Date.now()):string|null{
 const salt=playerSalt(secrets);if(!salt)return null;
 const periodKey=createHmac('sha256',salt).update('player id period '+periodIndex(nowMs)).digest();
 const mac=(s:string)=>createHmac('sha256',periodKey).update(s).digest('hex').slice(0,32);
 if(typeof key.ph==='string'&&PLAYER_HASH_RE.test(key.ph))return mac('h:'+key.ph);
 if(typeof key.pi==='string'&&INSTALL_ID_RE.test(key.pi))return mac('i:'+key.pi);
 return null;
}
export const envSecrets=():PlayerSecrets=>({salt:process.env.ANALYTICS_PLAYER_SALT||null,pepper:process.env.SAVE_CODE_PEPPER||null});
