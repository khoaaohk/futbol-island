/**
 * The island leaderboard API behind /api/arcade-board/{start,submit,top} (docs/arcade-leaderboards.md; Oct 12 2026).
 * Framework-free, so tests/arcade-leaderboard.cjs drives it directly; the route file only reads the capped body.
 *
 *  - start  (POST {game}): a signed, short-lived play session token, issued when a paid play (or a puzzle) begins. Stateless:
 *    HMAC-SHA256(secret, game + issue time + random nonce). Nothing is stored.
 *  - submit (POST {token, score, initials, icon, replace?}): checks the token's signature and age (at least the game's
 *    minimum play time, at most SESSION_MAX_MS), the game's score ceiling and scoring rate, the three letters (A–Z, not
 *    blocked) and the picture id. One post per token (the nonce is unique in the table). Only scores that make a top 10 are
 *    kept. Per-IP and site-wide hourly/daily caps (a day-salted IP hash, never the IP).
 *  - top    (GET ?game=): both island boards for one game. The same for everyone, so it is cached briefly at the edge.
 *
 * The secret is LEADERBOARD_SECRET, or derived from SAVE_CODE_PEPPER (HMAC, so the pepper itself is never used as a key here).
 */
import {createHash,createHmac,randomBytes,timingSafeEqual} from 'crypto';
import {SESSION_MAX_MS,cleanIcon,cleanInitials,dayOf,isBoardGame,scoreInBounds,scorePlausible,weekOf,type BoardGame} from './leaderboard';
import {BOARD_LIMITS,type BoardStore} from './leaderboardStore';

export type BoardAction='start'|'submit'|'top';
export const BOARD_ACTIONS:readonly BoardAction[]=['start','submit','top'];
export type HeaderBag={get(name:string):string|null};
export type Limiter={allow(key:string,nowMs:number):boolean};
export type BoardDeps={store:BoardStore|null;secret:string|undefined;limiter?:Limiter|null;now?:()=>Date};
export type BoardAnswer={status:number;body:Record<string,unknown>;cache?:string};
export const MAX_BOARD_BODY=2048;
export const MIN_SECRET_LENGTH=32;
const NO_STORE='no-store';
/** Island boards change only when someone posts; a short edge cache keeps an opened board cheap for everyone. */
export const TOP_CACHE='public, max-age=0, s-maxage=20, stale-while-revalidate=60';

export function boardSecret(env:{LEADERBOARD_SECRET?:string;SAVE_CODE_PEPPER?:string}):string|undefined{
 if(env.LEADERBOARD_SECRET&&env.LEADERBOARD_SECRET.length>=MIN_SECRET_LENGTH)return env.LEADERBOARD_SECRET;
 if(env.SAVE_CODE_PEPPER&&env.SAVE_CODE_PEPPER.length>=MIN_SECRET_LENGTH)return createHmac('sha256',env.SAVE_CODE_PEPPER).update('arcade-board-v1').digest('hex');
 return undefined;
}
export function clientIp(h:HeaderBag):string{return (h.get('x-vercel-forwarded-for')||h.get('x-forwarded-for')||h.get('x-real-ip')||'').split(',')[0].trim();}
/** 'ip:' + sha256(today's random salt + IP), truncated: the same bucket shape as the save throttle. The IP is never stored. */
export const ipBucket=(salt:string,ip:string)=>'ip:'+createHash('sha256').update(salt).update('\u0000').update(ip).digest('hex').slice(0,32);
const sameOrigin=(h:HeaderBag)=>{const origin=h.get('origin');if(!origin||origin==='null')return true;try{return new URL(origin).host.toLowerCase()===(h.get('host')||'').toLowerCase();}catch{return false;}};
/** The in-memory start limiter is keyed by a per-process salted hash, so not even RAM holds an address. */
const processSalt=randomBytes(16).toString('hex');
const memKey=(ip:string)=>createHash('sha256').update(processSalt).update(ip).digest('hex').slice(0,24);

const sign=(secret:string,payload:string)=>createHmac('sha256',secret).update('board:'+payload).digest('base64url').slice(0,32);
export function makeToken(secret:string,game:BoardGame,issuedMs:number,nonce=randomBytes(16).toString('hex')){
 const payload=`v1.${game}.${issuedMs.toString(36)}.${nonce}`;return `${payload}.${sign(secret,payload)}`;
}
export function readToken(secret:string,token:unknown):{game:BoardGame;issued:number;nonce:string}|null{
 if(typeof token!=='string'||token.length>120)return null;
 const m=/^v1\.([a-z]{2,8})\.([0-9a-z]{1,12})\.([0-9a-f]{32})\.([A-Za-z0-9_-]{32})$/.exec(token);if(!m||!isBoardGame(m[1]))return null;
 const want=Buffer.from(sign(secret,`v1.${m[1]}.${m[2]}.${m[3]}`)),got=Buffer.from(m[4]);
 if(want.length!==got.length||!timingSafeEqual(want,got))return null;
 const issued=parseInt(m[2],36);return Number.isFinite(issued)?{game:m[1],issued,nonce:m[3]}:null;
}
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
function parse(body:string|null|undefined):Record<string,unknown>|null{
 if(typeof body!=='string'||body.length>MAX_BOARD_BODY)return null;
 try{const v=JSON.parse(body);return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}catch{return null;}
}

export async function handleBoard(action:string,req:{body?:string|null;query?:URLSearchParams;headers:HeaderBag},deps:BoardDeps):Promise<BoardAnswer>{
 const now=(deps.now??(()=>new Date()))(),{store,secret}=deps;
 if(!(BOARD_ACTIONS as readonly string[]).includes(action))return {status:404,body:{ok:false}};
 if(!store||!secret)return {status:503,body:{ok:false,unavailable:true}};
 try{
  if(action==='top'){
   const game=req.query?.get('game');if(!isBoardGame(game))return {status:400,body:{ok:false}};
   const week=weekOf(now),t=await store.top(game,week);
   return {status:200,body:{ok:true,game,week,all:t.all,weekly:t.week},cache:TOP_CACHE};
  }
  if(!sameOrigin(req.headers))return {status:403,body:{ok:false}};
  const body=parse(req.body);if(!body)return {status:400,body:{ok:false}};
  if(action==='start'){
   if(!isBoardGame(body.game))return {status:400,body:{ok:false}};
   if(deps.limiter&&!deps.limiter.allow(memKey(clientIp(req.headers)),now.getTime()))return {status:429,body:{ok:false,busy:true}};
   return {status:200,body:{ok:true,token:makeToken(secret,body.game,now.getTime())}};
  }
  // submit
  const session=readToken(secret,body.token);if(!session)return {status:400,body:{ok:false,reason:'token'}};
  const age=now.getTime()-session.issued;if(age<0||age>SESSION_MAX_MS)return {status:400,body:{ok:false,reason:'token'}};
  const game=session.game,initials=cleanInitials(body.initials),icon=cleanIcon(body.icon);
  if(!initials)return {status:400,body:{ok:false,reason:'initials'}};
  if(icon===null)return {status:400,body:{ok:false,reason:'icon'}};
  if(!scoreInBounds(game,body.score))return {status:400,body:{ok:false,reason:'score'}};
  const plausible=scorePlausible(game,body.score,age);if(plausible!=='ok')return {status:200,body:{ok:false,reason:plausible}};
  const r=body.replace as {id?:unknown;claim?:unknown}|undefined,replace=r&&Number.isInteger(r.id)&&(r.id as number)>0&&typeof r.claim==='string'&&/^[0-9a-f]{32}$/.test(r.claim)?{id:r.id as number,claimHash:sha(r.claim)}:null;
  const day=dayOf(now),bucket=ipBucket(await store.salt(day),clientIp(req.headers));
  if(!await store.hit('b:'+bucket,BOARD_LIMITS.postPerIp,60,now)||!await store.hit('b:global',BOARD_LIMITS.postPerDay,1440,now))return {status:429,body:{ok:false,busy:true}};
  const claim=randomBytes(16).toString('hex'),week=weekOf(now);
  const res=await store.submit({game,score:body.score,initials,icon,nonce:session.nonce,claimHash:sha(claim),replace,day,week});
  if(!res.ok)return {status:200,body:{ok:false,reason:res.reason}};
  const t=await store.top(game,week);
  return {status:200,body:{ok:true,id:res.id,claim,rank:{all:res.rankAll,week:res.rankWeek},game,week,all:t.all,weekly:t.week}};
 }catch{
  // No error detail leaves (or is logged).
  return {status:503,body:{ok:false,unavailable:true}};
 }
}
