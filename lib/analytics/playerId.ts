/**
 * Anonymous player ids (Oct 16 2026; user: "i basically want to know by individual level"). Server only (POST /api/visit via
 * ingest.ts). A session's start may carry ONE player key: the save code active on the device (`pc`), or the device's random
 * install id (`pi`, fi2-install-v1: 16 random bytes made once per device, lib/analytics/deviceMarks.ts). It becomes
 *   code:    HMAC(analytics salt, "c:" + the save store's own keyed code hash)   (lib/saves/server.ts codeHash)
 *   install: HMAC(analytics salt, "i:" + install id)
 * truncated to 32 hex, and the key itself is dropped right here: analytics never store the code, the code hash (the save
 * store's key), the raw install id, an IP or a name. The analytics salt is ANALYTICS_PLAYER_SALT, else one derived from
 * SAVE_CODE_PEPPER under its own label (so the two keys are never the same); with neither, no player id is made at all.
 * One player = one save code (on every device that uses it), else one device; a device that makes a code later starts a new
 * player id from then on. /admin shows only 6 hex of a further hash (supabase/migrations/20261019_analytics_day_sessions.sql).
 */
import {createHmac} from 'crypto';
import {codeHash} from '../saves/server';
import {formatCode,isNormalCode,parseCode} from '../saves/code';
import {INSTALL_ID_RE,PLAYER_CODE_RE} from './core';

export const PLAYER_ID_RE=/^[0-9a-f]{32}$/;
export type PlayerSecrets={salt?:string|null;pepper?:string|null};

/** The analytics salt: ANALYTICS_PLAYER_SALT, else HMAC(pepper, a fixed label); null without either. */
export function playerSalt({salt,pepper}:PlayerSecrets):string|null{
 if(salt&&salt.length>=16)return salt;
 if(pepper)return createHmac('sha256',pepper).update('analytics player salt, version 1').digest('hex');
 return null;
}

/** The stored player id for a start's key, or null (nothing sent, a malformed key, or no secret configured). */
export function derivePlayerId(key:{pc?:string;pi?:string},secrets:PlayerSecrets=envSecrets()):string|null{
 const salt=playerSalt(secrets);if(!salt)return null;
 const mac=(s:string)=>createHmac('sha256',salt).update(s).digest('hex').slice(0,32);
 if(typeof key.pc==='string'&&PLAYER_CODE_RE.test(key.pc)){
  // As the save store's own sync does: only a code in its stored form, hashed exactly as the store hashes it.
  const parsed=isNormalCode(key.pc)?parseCode(key.pc):null;
  if(!parsed||!secrets.pepper)return null;
  return mac('c:'+codeHash(secrets.pepper,formatCode(parsed)));
 }
 if(typeof key.pi==='string'&&INSTALL_ID_RE.test(key.pi))return mac('i:'+key.pi);
 return null;
}
export const envSecrets=():PlayerSecrets=>({salt:process.env.ANALYTICS_PLAYER_SALT||null,pepper:process.env.SAVE_CODE_PEPPER||null});
