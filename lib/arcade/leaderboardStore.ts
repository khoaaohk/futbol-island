/**
 * Arcade leaderboard storage (Oct 12 2026; docs/arcade-leaderboards.md). Server only.
 *
 * Production: Supabase through the server-only service-role key, calling the security-definer functions in
 * supabase/migrations/20261013_arcade_leaderboards.sql over PostgREST (fetch only, nothing shipped to the browser). The table
 * has RLS on with no policies and anon/authenticated have no grants. Rate-limit buckets reuse the save system's throttle
 * (save_salt / save_hit from 20261010_game_saves.sql): a day-salted hash of the IP, deleted nightly.
 * Local previews and tests: the memory store below (optionally file-backed, BOARD_LOCAL_FILE), with the same rules;
 * tests/arcade-leaderboard.cjs runs both against each other on a throwaway Postgres.
 *
 * A row is: game, score, three letters, a picture id, the day and its week, the session nonce (so one play posts once) and an
 * optional sha256 of a random "claim" the posting device keeps (so it can replace its own older entry). Nothing else.
 */
import {randomBytes} from 'crypto';
import * as fs from 'fs';
import {BOARD_SIZE,compareRows,rankFor,type BoardGame,type BoardRow} from './leaderboard';

/** Posts per IP bucket per hour (a class behind one school IP still fits) and site-wide per day. */
export const BOARD_LIMITS={postPerIp:30,postPerDay:5000} as const;
/** The nightly purge keeps each game's best KEEP_ALL rows of all time, and everything from this week and last week. */
export const BOARD_KEEP_ALL=50;

export type SubmitInput={game:BoardGame;score:number;initials:string;icon:string;nonce:string;claimHash:string|null;replace:{id:number;claimHash:string}|null;day:string;week:string};
export type SubmitResult={ok:true;id:number;rankAll:number|null;rankWeek:number|null}|{ok:false;reason:'used'|'not-top'};
export type TopResult={all:BoardRow[];week:BoardRow[]};
export interface BoardStore{
 kind:'supabase'|'memory';
 schemaVersion():Promise<number>;
 salt(day:string):Promise<string>;
 hit(bucket:string,limit:number,minutes:number,now:Date):Promise<boolean>;
 /** Inserts only if the score makes the all-time or this week's top BOARD_SIZE (else not-top); a nonce posts once. */
 submit(s:SubmitInput):Promise<SubmitResult>;
 top(game:BoardGame,week:string):Promise<TopResult>;
 purge(week:string):Promise<{rows:number}>;
 /** Nov 10 2026 (/admin "Remove row"; supabase/migrations/20261111_board_hidden_rows.sql). The best rows of one game, hidden
  *  ones marked; `hidable` is false when the migration has not run (the list then comes from board_top, without flags). */
 adminList(game:BoardGame,limit:number):Promise<{rows:AdminBoardRow[];hidable:boolean}>;
 /** Soft-delete (or restore) one row. 'missing' = the migration has not run; false = no such row. */
 hide(id:number,hidden:boolean):Promise<boolean|'missing'>;
}
export type AdminBoardRow=BoardRow&{id:number;hidden:boolean;week?:string};

type Row={id:number;game:BoardGame;score:number;initials:string;icon:string;day:string;week:string;nonce:string;claimHash:string|null;hidden?:boolean};
type MemoryData={rows:Row[];nextId:number;throttle:Record<string,number>;salts:Record<string,string>};
const winStart=(now:Date,minutes:number)=>Math.floor(now.getTime()/(minutes*60_000))*minutes*60_000;
const view=(r:Row):BoardRow=>({id:r.id,initials:r.initials,icon:r.icon,score:r.score,day:r.day});
const ordered=(rows:Row[])=>rows.map(r=>({...r,seq:r.id})).sort(compareRows);
/** Monday `weeks` weeks before `week` (YYYY-MM-DD). */
export const weeksBefore=(week:string,weeks:number)=>new Date(Date.parse(week+'T00:00:00Z')-weeks*7*86_400_000).toISOString().slice(0,10);

export function createMemoryBoardStore(file?:string):BoardStore&{readonly data:MemoryData}{
 let data:MemoryData={rows:[],nextId:1,throttle:{},salts:{}};
 // File mode re-reads before each call: Next may load this module once per route bundle.
 const load=()=>{if(file&&fs.existsSync(file)){try{data={rows:[],nextId:1,throttle:{},salts:{},...JSON.parse(fs.readFileSync(file,'utf8'))};}catch{}}};
 const save=()=>{if(file)fs.writeFileSync(file,JSON.stringify(data));};
 load();
 const top=(game:BoardGame,week:string)=>{const g=data.rows.filter(r=>r.game===game&&!r.hidden);return {all:ordered(g).slice(0,BOARD_SIZE),week:ordered(g.filter(r=>r.week===week)).slice(0,BOARD_SIZE)};};
 return {
  kind:'memory',
  get data(){return data;},
  async schemaVersion(){return 1;},
  async salt(day){load();if(!data.salts[day]){data.salts[day]=randomBytes(32).toString('hex');save();}return data.salts[day];},
  async hit(bucket,limit,minutes,now){load();const k=`${bucket}|${winStart(now,minutes)}`;data.throttle[k]=(data.throttle[k]??0)+1;save();return data.throttle[k]<=limit;},
  async submit(s){load();
   if(data.rows.some(r=>r.nonce===s.nonce))return {ok:false,reason:'used'};
   // The device's own older entry (same game, matching claim, not higher) makes way for the new one before ranking.
   const old=s.replace?data.rows.find(r=>r.id===s.replace!.id&&r.game===s.game&&r.claimHash===s.replace!.claimHash&&r.score<=s.score&&!r.hidden):undefined;
   const rest=data.rows.filter(r=>r.game===s.game&&r!==old&&!r.hidden);
   const rankAll=rankFor(ordered(rest),s.score),rankWeek=rankFor(ordered(rest.filter(r=>r.week===s.week)),s.score);
   if(rankAll>BOARD_SIZE&&rankWeek>BOARD_SIZE)return {ok:false,reason:'not-top'};
   if(old)data.rows=data.rows.filter(r=>r!==old);
   const id=data.nextId++;data.rows.push({id,game:s.game,score:s.score,initials:s.initials,icon:s.icon,day:s.day,week:s.week,nonce:s.nonce,claimHash:s.claimHash});save();
   return {ok:true,id,rankAll:rankAll<=BOARD_SIZE?rankAll:null,rankWeek:rankWeek<=BOARD_SIZE?rankWeek:null};
  },
  async top(game,week){load();const t=top(game,week);return {all:t.all.map(view),week:t.week.map(view)};},
  async purge(week){load();const keep=new Set<number>(),before=data.rows.length,last=weeksBefore(week,1);
   for(const g of new Set(data.rows.map(r=>r.game)))for(const r of ordered(data.rows.filter(x=>x.game===g)).slice(0,BOARD_KEEP_ALL))keep.add(r.id);
   data.rows=data.rows.filter(r=>keep.has(r.id)||r.week>=last);
   for(const k of Object.keys(data.throttle))if(Number(k.split('|').pop())<Date.parse(week+'T00:00:00Z')-86_400_000)delete data.throttle[k];
   save();return {rows:before-data.rows.length};},
  async adminList(game,limit){load();return {hidable:true,rows:ordered(data.rows.filter(r=>r.game===game)).slice(0,Math.min(100,Math.max(1,limit))).map(r=>({...view(r),id:r.id,hidden:!!r.hidden,week:r.week}))};},
  async hide(id,hidden){load();const r=data.rows.find(x=>x.id===id);if(!r)return false;r.hidden=hidden||undefined;save();return true;},
 };
}

/** PostgREST answers 404 for a function that does not exist (a migration not yet run). */
class MissingRpc extends Error{constructor(fn:string){super('missing rpc '+fn);}}
export function createSupabaseBoardStore(url:string,serviceKey:string,fetchImpl:typeof fetch=fetch):BoardStore{
 const base=url.replace(/\/+$/,'')+'/rest/v1',headers={apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,'Content-Type':'application/json'};
 const saltCache=new Map<string,string>();
 // Errors carry the status only, never a body.
 async function rpc<T>(fn:string,args:Record<string,unknown>):Promise<T>{
  const res=await fetchImpl(`${base}/rpc/${fn}`,{method:'POST',headers,body:JSON.stringify(args),cache:'no-store'});
  if(res.status===404)throw new MissingRpc(fn);
  if(!res.ok)throw new Error(`board store ${res.status}`);
  const text=await res.text();return (text?JSON.parse(text):null) as T;
 }
 const rows=(v:unknown):BoardRow[]=>Array.isArray(v)?v.map(r=>({id:Number(r.id),initials:String(r.initials),icon:String(r.icon??''),score:Number(r.score),day:String(r.day)})):[];
 return {
  kind:'supabase',
  async schemaVersion(){try{return Number(await rpc('board_schema_version',{}))||0;}catch{return 0;}},
  async salt(day){const hit=saltCache.get(day);if(hit)return hit;const s=await rpc<string>('save_salt',{p_day:day});if(saltCache.size>4)saltCache.clear();saltCache.set(day,s);return s;},
  async hit(bucket,limit,minutes){return (await rpc<boolean>('save_hit',{p_bucket:bucket,p_limit:limit,p_minutes:minutes}))===true;},
  async submit(s){const r=await rpc<{ok:boolean;id?:number;rank_all?:number|null;rank_week?:number|null;reason?:string}>('board_submit',{p_game:s.game,p_score:s.score,p_initials:s.initials,p_icon:s.icon,p_nonce:s.nonce,p_claim_hash:s.claimHash,p_replace_id:s.replace?.id??null,p_replace_claim_hash:s.replace?.claimHash??null,p_day:s.day,p_week:s.week});
   return r?.ok?{ok:true,id:Number(r.id),rankAll:r.rank_all??null,rankWeek:r.rank_week??null}:{ok:false,reason:r?.reason==='used'?'used':'not-top'};},
  async top(game,week){const r=await rpc<{all:unknown;week:unknown}>('board_top',{p_game:game,p_week:week});return {all:rows(r?.all),week:rows(r?.week)};},
  async purge(week){const r=await rpc<{rows:number}>('board_purge',{p_week:week});return {rows:Number(r?.rows)||0};},
  async adminList(game,limit){
   try{const v=await rpc<unknown>('board_admin_list',{p_game:game,p_limit:limit});
    return {hidable:true,rows:Array.isArray(v)?v.map(r=>({...rows([r])[0],id:Number(r.id),hidden:r.hidden===true,week:typeof r.week==='string'?r.week:undefined})):[]};}
   catch(e){if(!(e instanceof MissingRpc))throw e;
    // Migration not run yet: this week's and all-time top 10 from board_top, without hidden flags.
    const r=await rpc<{all:unknown;week:unknown}>('board_top',{p_game:game,p_week:new Date().toISOString().slice(0,10)});
    const seen=new Map<number,AdminBoardRow>();for(const x of [...rows(r?.all),...rows(r?.week)])if(x.id)seen.set(x.id,{...x,id:x.id,hidden:false});
    return {hidable:false,rows:[...seen.values()].sort((a,b)=>b.score-a.score||a.id-b.id)};}
  },
  async hide(id,hidden){try{const r=await rpc<{ok?:boolean}>('board_hide',{p_id:id,p_hidden:hidden});return r?.ok===true;}catch(e){if(e instanceof MissingRpc)return 'missing';throw e;}},
 };
}

let cached:BoardStore|null|undefined;
/**
 * The configured store, or null (the island boards answer "unavailable"; the device boards still work).
 * Same Supabase project and server-only key as the saves. BOARD_LOCAL_FILE is a local-preview store, ignored on Vercel.
 */
export function getBoardStore():BoardStore|null{
 if(cached!==undefined)return cached;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,local=process.env.BOARD_LOCAL_FILE;
 if(local&&!process.env.VERCEL)cached=createMemoryBoardStore(local);
 else if(url&&key)cached=createSupabaseBoardStore(url,key);
 else cached=null;
 return cached;
}
