import {STORE_KEY,cleanStore,emptyStore,loadStore,type Store} from './store';
/**
 * Several teams in the coach app (owner, Nov 22 2026: "allow coaches to switch between multiple teams they manage"). One record
 * in localStorage under TEAMS_KEY: {v, activeId, teams:[{id, ...Store}]}. Each team keeps its own squad, settings, lineup, live
 * game and last game, so data never mixes; the language and the beep are the coach's, shared by every team.
 * Migration: the first load without TEAMS_KEY (or with a broken one) turns the single team in STORE_KEY (fi-coach-v1) into the
 * first team. Backward compatibility: every save also writes the active team to STORE_KEY, so anything reading fi-coach-v1 still
 * sees the team in use. Pure (no window): the caller passes the storage. tests/coach-app.cjs covers migration, switching, deleting.
 */
export const TEAMS_KEY='fi-coach-teams-v1';
export const MAX_TEAMS=12;
export type TeamRec=Store&{id:string};
/** rev (UX audit B5): a save counter, so two tabs never overwrite each other: the newer record wins and the other tab takes it */
export type Teams={v:1;activeId:string;teams:TeamRec[];rev?:number};
const ID_RE=/^t[a-z0-9]{1,12}$/;
export const teamId=(taken:ReadonlySet<string>,seed:number)=>{let n=Math.abs(Math.round(seed))||1;let id='';do{id='t'+(n++).toString(36).slice(-10);}while(taken.has(id));return id;};
/** A game on the clock (kicked off and not finished): it keeps running when the coach leaves the live screen. */
export const isRunning=(s:Pick<Store,'game'>)=>!!s.game&&s.game.clock.status!=='done'&&s.game.clock.status!=='pre';
const single=(s:Store):Teams=>({v:1,activeId:'t1',teams:[{...s,id:'t1'}]});
/** Make anything read from storage a valid teams record, or null when it is not one (then the caller migrates). */
export function cleanTeams(raw:unknown):Teams|null{
 if(!raw||typeof raw!=='object')return null;const o=raw as {v?:unknown;activeId?:unknown;teams?:unknown;rev?:unknown};
 if(o.v!==1||!Array.isArray(o.teams))return null;
 const ids=new Set<string>(),teams:TeamRec[]=[];
 for(const t of o.teams.slice(0,MAX_TEAMS*2)){
  if(teams.length>=MAX_TEAMS)break;if(!t||typeof t!=='object')continue;const r=t as {id?:unknown};
  let id=typeof r.id==='string'&&ID_RE.test(r.id)&&!ids.has(r.id)?r.id:'';if(!id)id=teamId(ids,teams.length+1);
  ids.add(id);teams.push({...cleanStore(t),id});
 }
 if(!teams.length)return null;
 const activeId=typeof o.activeId==='string'&&ids.has(o.activeId)?o.activeId:teams[0].id;
 const a=teams.find(t=>t.id===activeId)!;
 const rev=Math.round(Number(o.rev));
 return {v:1,activeId,teams:teams.map(t=>({...t,lang:a.lang,sound:a.sound})),rev:Number.isFinite(rev)&&rev>0?rev:0};
}
/** Read the teams; migrate fi-coach-v1 (one team, or an empty first team) when the teams record is missing or unreadable. */
export function loadTeams(storage:Pick<Storage,'getItem'>|null):Teams{
 try{const s=storage?.getItem(TEAMS_KEY);if(s){const t=cleanTeams(JSON.parse(s));if(t)return t;}}catch{/* broken: migrate below */}
 return single(loadStore(storage));
}
export const activeOf=(t:Teams):TeamRec=>t.teams.find(x=>x.id===t.activeId)??t.teams[0];
const strip=({id:_id,...s}:TeamRec):Store=>{void _id;return s;};
/** Save both: the teams and (for anything still reading the old key) the active team alone in fi-coach-v1. */
export function saveTeams(storage:(Pick<Storage,'setItem'>&Partial<Pick<Storage,'getItem'>>)|null,t:Teams):boolean{return saveTeamsRev(storage,t)>0;}
/** The revision saved now in storage (0 = none or unreadable). */
export function storedRev(storage:Partial<Pick<Storage,'getItem'>>|null):number{
 try{const s=storage?.getItem?.(TEAMS_KEY);if(!s)return 0;const r=Math.round(Number((JSON.parse(s) as {rev?:unknown}).rev));return Number.isFinite(r)&&r>0?r:0;}catch{return 0;}
}
/** Save with the next revision (above both this record's and the stored one); returns the revision written, 0 on failure. */
export function saveTeamsRev(storage:(Pick<Storage,'setItem'>&Partial<Pick<Storage,'getItem'>>)|null,t:Teams):number{
 try{if(!storage)return 0;const rev=Math.max(t.rev??0,storedRev(storage))+1;
  storage.setItem(TEAMS_KEY,JSON.stringify({...t,rev}));storage.setItem(STORE_KEY,JSON.stringify(strip(activeOf(t))));return rev;}catch{return 0;}
}
/** Another tab's save (a storage event's new value): the record when it is newer than `mine`, else null. */
export function newerTeams(raw:string|null|undefined,mine:number):Teams|null{
 if(!raw)return null;try{const t=cleanTeams(JSON.parse(raw));return t&&(t.rev??0)>mine?t:null;}catch{return null;}
}
/** Change one team; a change of language or sound is the coach's and goes to every team. */
export function updateTeam(t:Teams,id:string,f:(s:Store)=>Store):Teams{
 const cur=t.teams.find(x=>x.id===id);if(!cur)return t;
 const next={...f(strip(cur)),id},lang=next.lang,sound=next.sound;
 return {...t,teams:t.teams.map(x=>x.id===id?next:lang!==x.lang||sound!==x.sound?{...x,lang,sound}:x)};
}
export const updateActive=(t:Teams,f:(s:Store)=>Store)=>updateTeam(t,activeOf(t).id,f);
export const switchTeam=(t:Teams,id:string):Teams=>t.teams.some(x=>x.id===id)?{...t,activeId:id}:t;
/** Add a team (made active). `from` copies another team's squad (players only: no games, no lineup). */
export function addTeam(t:Teams,init:{name:string;settings?:Store['settings'];from?:string},seed:number):Teams{
 if(t.teams.length>=MAX_TEAMS)return t;
 const a=activeOf(t),src=init.from?t.teams.find(x=>x.id===init.from):undefined,id=teamId(new Set(t.teams.map(x=>x.id)),seed);
 const base=emptyStore(a.lang),players=src?src.team.players.map(p=>({...p})):[];
 const s=cleanStore({...base,sound:a.sound,team:{name:init.name,players},settings:init.settings??base.settings,here:players.map(p=>p.id)});
 return {...t,activeId:id,teams:[...t.teams,{...s,id}]};
}
/** Delete a team. Deleting the active one makes the first other team active; deleting the last leaves one empty team. */
export function deleteTeam(t:Teams,id:string,seed=1):Teams{
 const rest=t.teams.filter(x=>x.id!==id);if(rest.length===t.teams.length)return t;
 if(!rest.length){const a=activeOf(t),s={...emptyStore(a.lang),sound:a.sound},nid=teamId(new Set([id]),seed);return {v:1,activeId:nid,teams:[{...s,id:nid}]};}
 return {...t,activeId:t.activeId===id?rest[0].id:t.activeId,teams:rest};
}
/** The team whose game is on the clock: the active team first, else another. */
export const liveTeam=(t:Teams):TeamRec|null=>{const a=activeOf(t);return isRunning(a)?a:t.teams.find(isRunning)??null;};
/** Two letters for the team badge: "Blue Sharks" -> "BS", "Tigers" -> "TI", nothing -> the team's place ("T1"). */
export function initials(name:string,place:number):string{
 const w=name.trim().split(/\s+/).filter(Boolean);
 if(!w.length)return 'T'+place;
 return (w.length>1?w[0][0]+w[1][0]:w[0].slice(0,2)).toUpperCase();
}
/** A badge colour per team, from its place in the list (light text on each). */
export const TEAM_COLORS=['#1d6b55','#1f5fd1','#9a3b1c','#85621f','#6b3fa0','#2d6f39','#b0306a','#14221d'] as const;
export const teamColor=(i:number)=>TEAM_COLORS[((i%TEAM_COLORS.length)+TEAM_COLORS.length)%TEAM_COLORS.length];
