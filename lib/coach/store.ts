import {base64url,cleanName} from '../site/tools/rotation';
import {cleanSettings,presetOf,settingsFor,type Game,type MatchInfo,type PBlock,type Settings,type Status} from './engine';
/**
 * The coach app's saved data (/coach; docs/coach-app/HANDOFF.md). One record in localStorage under STORE_KEY, on this device
 * only: no account, no server, nothing sent. Everything read back (storage, a shared link) is untrusted and goes through
 * `cleanStore` / `decodeShare`: numbers 0-99 and unique, names cleaned and optional, at most MAX_SQUAD players, a known version.
 * Version history: 1 = Nov 16 2026 (first release). A newer version than this code knows is ignored (a fresh store), never
 * half-read. tests/coach-app.cjs covers cleaning, versioning, the share link and the CSV.
 */
export const STORE_KEY='fi-coach-v1';
export const STORE_VERSION=1;
export const MAX_SQUAD=30;
export type Player={id:string;num:number;name:string;gk:boolean};
export type Team={name:string;players:Player[]};
export type Lang='en'|'es';
export type Store={v:1;team:Team;settings:Settings;
 /** who is coming to the next game (ids); missing ids are not coming */
 here:string[];
 /** who of those is coming late: id -> expected minute of the game from kick-off (null = not known). Late players are not in
  *  the starting lineup; the plan brings each in at that minute (planWithLate); the live game marks them "Not here yet". */
 late:Record<string,number|null>;
 /** the starting lineup: one player id (or '') per formation spot */
 spots:string[];
 game:Game|null;lang:Lang|null;sound:boolean;
 /** the last finished game, for the Summary tab */
 last:Game|null;
 /** the next game's details (UX audit C17): opponent, date, kick-off, home or away; copied into the game at the start */
 match?:MatchInfo};
/** Game details read back: short clean text, a YYYY-MM-DD date, an HH:MM time, home/away or ''. */
export function cleanMatch(raw:unknown):MatchInfo{
 const o=(raw&&typeof raw==='object'?raw:{}) as Partial<MatchInfo>;
 return {opp:cleanName(o.opp),date:typeof o.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(o.date)?o.date:'',time:typeof o.time==='string'&&/^\d{2}:\d{2}$/.test(o.time)?o.time:'',
  home:o.home==='home'||o.home==='away'?o.home:''};
}
export const hasMatch=(m:MatchInfo|undefined|null)=>!!m&&!!(m.opp||m.date||m.time||m.home);
const ID_RE=/^[a-z0-9]{1,12}$/;
export const newId=(taken:ReadonlySet<string>,seed:number)=>{let n=seed;let id='';do{id='p'+(n++).toString(36);}while(taken.has(id));return id;};
export function cleanPlayers(raw:unknown):Player[]{
 const out:Player[]=[],ids=new Set<string>(),nums=new Set<number>();
 if(!Array.isArray(raw))return out;
 for(const r of raw.slice(0,MAX_SQUAD*2)){
  if(out.length>=MAX_SQUAD)break;if(!r||typeof r!=='object')continue;const o=r as Record<string,unknown>;
  const num=Math.round(Number(o.num));if(!Number.isInteger(num)||num<0||num>99||nums.has(num))continue;
  let id=typeof o.id==='string'&&ID_RE.test(o.id)&&!ids.has(o.id)?o.id:'';if(!id)id=newId(ids,num+100);
  ids.add(id);nums.add(num);out.push({id,num,name:cleanName(o.name),gk:o.gk===true});
 }
 return out;
}
export const emptyStore=(lang:Lang|null=null):Store=>({v:1,team:{name:'',players:[]},settings:settingsFor(presetOf('7v7')),here:[],late:{},spots:[],game:null,lang,sound:true,last:null});
const cleanGame=(g:unknown,ids:ReadonlySet<string>):Game|null=>{
 if(!g||typeof g!=='object')return null;const o=g as Game;
 if(o.v!==1||!o.clock||!Array.isArray(o.blocks)||!Array.isArray(o.on)||!Array.isArray(o.stints))return null;
 const okId=(p:unknown)=>typeof p==='string'&&ids.has(p);
 if(!o.on.every(okId)||!o.blocks.every(b=>b&&Array.isArray(b.on)&&b.on.every(okId)))return null;
 const num=(v:unknown)=>Number.isFinite(Number(v))?Number(v):0;
 const status:Record<string,Status>={};for(const [k,v] of Object.entries(o.status??{}))if(ids.has(k)&&['ok','hurt','left','late'].includes(String(v)))status[k]=v as Status;
 const spots:Record<string,number>={};for(const [k,v] of Object.entries(o.spots??{}))if(ids.has(k))spots[k]=Math.max(0,Math.round(num(v)));
 const st=['pre','live','paused','break','done'].includes(o.clock.status)?o.clock.status:'pre';
 return {v:1,started:num(o.started),settings:cleanSettings(o.settings),clock:{period:Math.max(0,Math.round(num(o.clock.period))),acc:Math.max(0,num(o.clock.acc)),since:o.clock.since==null?null:num(o.clock.since),added:Math.max(0,num(o.clock.added)),status:st},
  blocks:o.blocks.map(b=>({period:num(b.period),start:num(b.start),end:num(b.end),on:[...b.on],gk:okId(b.gk)?b.gk:null})),next:Math.max(0,Math.round(num(o.next))),delay:Math.max(0,num(o.delay)),
  on:[...o.on],gk:okId(o.gk)?o.gk:null,spots,stints:o.stints.filter(s=>s&&okId(s.p)).map(s=>({p:s.p,period:num(s.period),from:num(s.from),to:s.to==null?null:num(s.to),gk:!!s.gk})),status,subs:Math.max(0,Math.round(num(o.subs))),
  ...(Array.isArray(o.joined)?{joined:[...new Set(o.joined.filter(okId))] as string[]}:{}),
  ...(o.info?{info:cleanMatch(o.info)}:{}),
  ...(o.score&&typeof o.score==='object'?{score:{goals:Array.isArray(o.score.goals)?o.score.goals.slice(0,99).map(x=>okId(x)?x as string:''):[],them:Math.max(0,Math.min(99,Math.round(num(o.score.them))))}}:{})};
};
/** Late players: only players who are coming; a whole minute 0-240 or null (not known). */
export function cleanLate(raw:unknown,here:ReadonlySet<string>):Record<string,number|null>{
 const out:Record<string,number|null>={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
 for(const [k,v] of Object.entries(raw as Record<string,unknown>)){if(!here.has(k))continue;
  if(v==null)out[k]=null;else{const n=Math.round(Number(v));if(Number.isFinite(n)&&n>=0&&n<=240)out[k]=n;}}
 return out;
}
/** Make anything read from storage a valid store. */
export function cleanStore(raw:unknown):Store{
 if(!raw||typeof raw!=='object')return emptyStore();
 const o=raw as Partial<Store>&{v?:unknown};
 if(o.v!==STORE_VERSION)return emptyStore();
 const players=cleanPlayers(o.team?.players),ids=new Set(players.map(p=>p.id));
 return {v:1,team:{name:cleanName(o.team?.name),players},settings:cleanSettings(o.settings),
  here:Array.isArray(o.here)?[...new Set(o.here.filter(p=>typeof p==='string'&&ids.has(p)))]:[],
  late:cleanLate(o.late,new Set(Array.isArray(o.here)?o.here.filter(p=>typeof p==='string'&&ids.has(p)):[])),
  spots:Array.isArray(o.spots)?o.spots.slice(0,11).map(p=>typeof p==='string'&&ids.has(p)?p:''):[],
  game:cleanGame(o.game,ids),lang:o.lang==='es'||o.lang==='en'?o.lang:null,sound:o.sound!==false,last:cleanGame(o.last,ids),
  ...(o.match?{match:cleanMatch(o.match)}:{})};
}
export function loadStore(storage:Pick<Storage,'getItem'>|null):Store{
 try{const s=storage?.getItem(STORE_KEY);return s?cleanStore(JSON.parse(s)):emptyStore();}catch{return emptyStore();}
}
export function saveStore(storage:Pick<Storage,'setItem'>|null,s:Store):boolean{
 try{storage?.setItem(STORE_KEY,JSON.stringify(s));return !!storage;}catch{return false;}
}
export const label=(p:Player|undefined)=>p?`#${p.num}${p.name?' '+p.name:''}`:'';
/* -------------------------------------------- share link: the plan and the minutes in the URL fragment ------------------- */
/** What a shared link shows: the team, the game settings, every player, the blocks (as player positions in the list) and the
 *  minutes. In `#s=` (the fragment is never sent to a server). Names are left out unless the coach keeps them in. */
export type Shared={team:string;settings:Settings;players:{num:number;name:string}[];blocks:PBlock[];seconds:number[];done:boolean;
 /** the game's details and score (UX audit C2), when the link is a game's */
 info?:{opp:string;date:string;us:number|null;them:number|null}};
/** A name as initials for a parents' link (UX audit C2): "Ana Lopez" -> "A.L.". */
export const initialsOf=(name:string)=>name.trim().split(/\s+/).map(w=>/\p{L}/u.exec(w)?.[0]).filter((x):x is string=>!!x).slice(0,2).map(x=>x.toUpperCase()+'.').join('');
export function encodeShare(x:Shared):string{
 return base64url.encode(JSON.stringify([1,cleanName(x.team),[x.settings.format,x.settings.onField,x.settings.periods,x.settings.periodMin,x.settings.subEvery,x.settings.keeper],
  x.players.map(p=>[p.num,cleanName(p.name)]),x.blocks.map(b=>[b.period,b.start,b.end,b.on.map(Number),b.gk==null?-1:Number(b.gk)]),x.seconds.map(s=>Math.round(s)),x.done?1:0,
  ...(x.info?[[cleanName(x.info.opp),x.info.date,x.info.us??-1,x.info.them??-1]]:[])]));
}
/** Players in a shared plan are ids "0".."n-1" (their place in `players`). */
export function decodeShare(code:string):Shared|null{
 try{
  const a=JSON.parse(base64url.decode(code));if(!Array.isArray(a)||a[0]!==1||!Array.isArray(a[2])||!Array.isArray(a[3])||!Array.isArray(a[4]))return null;
  const [format,onField,periods,periodMin,subEvery,keeper]=a[2];
  const settings=cleanSettings({format,onField,periods,periodMin,subEvery,keeper});
  const players=(a[3] as unknown[]).slice(0,MAX_SQUAD).map(p=>Array.isArray(p)?{num:Math.max(0,Math.min(99,Math.round(Number(p[0])||0))),name:cleanName(p[1])}:{num:0,name:''});
  const n=players.length,ok=(i:unknown)=>Number.isInteger(i)&&(i as number)>=0&&(i as number)<n;
  const blocks:PBlock[]=[];
  for(const b of (a[4] as unknown[]).slice(0,200)){if(!Array.isArray(b)||!Array.isArray(b[3]))return null;
   const on=(b[3] as unknown[]).filter(ok).map(String),start=Number(b[1]),end=Number(b[2]),period=Number(b[0]);
   if(!Number.isFinite(start)||!Number.isFinite(end)||end<start||!Number.isInteger(period)||period<0||period>=settings.periods)return null;
   blocks.push({period,start,end:Math.min(end,settings.periodMin*60+30*60),on,gk:ok(b[4])?String(b[4]):null});}
  const seconds=Array.isArray(a[5])?players.map((_,i)=>Math.max(0,Math.round(Number(a[5][i])||0))):players.map(()=>0);
  const gi=Array.isArray(a[7])?a[7]:null,sc=(v:unknown)=>{const n=Math.round(Number(v));return Number.isFinite(n)&&n>=0&&n<=99?n:null;};
  const info=gi?{opp:cleanName(gi[0]),date:typeof gi[1]==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(gi[1])?gi[1]:'',us:sc(gi[2]),them:sc(gi[3])}:undefined;
  return {team:cleanName(a[1]),settings,players,blocks,seconds,done:a[6]===1,...(info?{info}:{})};
 }catch{return null;}
}
/** Turn a game (or a plan) into the share shape: ids become their place in the team list. */
/** names: full names; otherwise initials (a parents' link: UX audit C2). info: the game's details and score. */
export function toShared(team:Team,settings:Settings,blocks:readonly PBlock[],seconds:Readonly<Record<string,number>>,done:boolean,names:boolean,info?:Shared['info']):Shared{
 const ids=team.players.map(p=>p.id),pos=new Map(ids.map((id,i)=>[id,String(i)]));
 return {team:team.name,settings,players:team.players.map(p=>({num:p.num,name:names?p.name:initialsOf(p.name)})),done,...(info?{info}:{}),
  blocks:blocks.map(b=>({...b,on:b.on.map(p=>pos.get(p)).filter((x):x is string=>x!=null),gk:b.gk==null?null:pos.get(b.gk)??null})),seconds:ids.map(id=>seconds[id]??0)};
}
/* ----------------------------------------------- the minutes as CSV (Excel, Google Sheets, Numbers) ---------------------- */
/** A cell, quoted when needed; a leading = + - @ is defused so a name never runs as a spreadsheet formula. */
export const csvCell=(v:string|number)=>{let s=String(v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return /[",\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;};
export type CsvWords={number:string;name:string;total:string;share:string;period:(i:number)=>string;gk:string};
export const CSV_EN:CsvWords={number:'Number',name:'Name',total:'Minutes',share:'Share of game',period:i=>`Period ${i+1}`,gk:'Minutes in goal'};
/** One row per player: number, name, minutes in each period, minutes in goal, total, share of the game. UTF-8 with a BOM and
 *  CRLF line ends, so Excel opens accents correctly; minutes to one decimal. */
export function minutesCsv(team:Team,g:Pick<Game,'stints'|'settings'>,w:CsvWords=CSV_EN):string{
 const P=g.settings.periods,rows:string[][]=[],game=g.settings.periods*g.settings.periodMin;
 const head=[w.number,w.name,...Array.from({length:P},(_,i)=>w.period(i)),w.gk,w.total,w.share];
 const m1=(s:number)=>(Math.round(s/6)/10).toFixed(1);
 for(const p of team.players){
  const per=Array(P).fill(0);let gk=0;
  for(const s of g.stints)if(s.p===p.id&&s.to!=null){per[s.period]+=s.to-s.from;if(s.gk)gk+=s.to-s.from;}
  const tot=per.reduce((a,b)=>a+b,0);
  rows.push([String(p.num),p.name,...per.map(m1),m1(gk),m1(tot),game?`${Math.round(tot/60/game*100)}%`:'0%']);
 }
 return '﻿'+[head,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
