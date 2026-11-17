'use client';
/**
 * The arcade leaderboard client (docs/arcade-leaderboards.md). Small on purpose: the games import only beginBoardSession
 * (one POST when a play starts); the board screens are lazy components that use the rest.
 * Heat: no timers, no polling. A board is fetched when a board screen opens (or once at game over to see whether the score
 * made a board), and one game's boards are reused for 20 s.
 */
import {BOARD_SIZE,ISLAND_BOARD_SIZE,LOCAL_BOARDS_KEY,addLocalScore,addPosted,emptyLocalBoards,replaceable,sanitizeLocalBoards,type BoardGame,type BoardRow,type LocalBoards} from './leaderboard';

const API='/api/arcade-board';
const sessions=new Map<BoardGame,{token:string;at:number}>();
/** Asks the server for a signed play session as a play starts (fire and forget; offline or not set up = device board only). */
export function beginBoardSession(game:BoardGame){
 sessions.delete(game);
 if(typeof fetch==='undefined')return;
 void fetch(`${API}/start`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({game}),cache:'no-store'})
  .then(r=>r.ok?r.json():null).then(v=>{if(v?.ok&&typeof v.token==='string')sessions.set(game,{token:v.token,at:Date.now()});}).catch(()=>{});
}
export const hasBoardSession=(game:BoardGame)=>sessions.has(game);
/** A session posts once: taken here, then gone. */
function takeSession(game:BoardGame){const s=sessions.get(game);sessions.delete(game);return s?.token??null;}

/**
 * Nov 17 2026 (owner: "for the high score only have all time"): the client shows the island ALL-TIME board only. The API still
 * answers `weekly` (left alone on the server); it is not read. `size` is how many rows the island board holds: 20, or 10 until
 * supabase/migrations/20261122_board_top20.sql is pasted (an older server sends none).
 */
export type IslandBoards={all:BoardRow[];size:number};
const islandValue=(v:{all?:unknown;size?:unknown}):IslandBoards=>{
 const size=Math.min(ISLAND_BOARD_SIZE,Math.max(1,Math.trunc(Number(v.size))||BOARD_SIZE));
 return {all:(Array.isArray(v.all)?v.all as BoardRow[]:[]).slice(0,size),size};
};
const topCache=new Map<BoardGame,{at:number;value:IslandBoards}>();
/** The island all-time board for a game, or null when the island boards are unavailable (offline, or not set up). */
export async function fetchIslandBoards(game:BoardGame,{fresh=false}:{fresh?:boolean}={}):Promise<IslandBoards|null>{
 const hit=topCache.get(game);if(!fresh&&hit&&Date.now()-hit.at<20_000)return hit.value;
 try{const r=await fetch(`${API}/top?game=${game}`);if(!r.ok)return null;const v=await r.json();if(!v?.ok)return null;
  const value=islandValue(v);topCache.set(game,{at:Date.now(),value});return value;}
 catch{return null;}
}

export function readLocalBoards():LocalBoards{try{return sanitizeLocalBoards(JSON.parse(localStorage.getItem(LOCAL_BOARDS_KEY)??'null'));}catch{return emptyLocalBoards();}}
function writeLocalBoards(b:LocalBoards){try{localStorage.setItem(LOCAL_BOARDS_KEY,JSON.stringify(b));}catch{/* private browsing: this visit only */}}

export type PostResult={local:number|null;seq:number;island:{ok:true;id:number;all:number|null;boards:IslandBoards}|{ok:false;reason:'none'|'short'|'fast'|'not-top'|'busy'|'unavailable'|'invalid'}};
/**
 * Saves a score: always on this device, silently (the device store keeps its top 10 per game, as before; no device board is
 * shown any more), and on the island when `island` is true and a play session is held. The letters and picture are remembered on this device for next time.
 */
export async function postScore(game:BoardGame,score:number,initials:string,icon:string,island:boolean):Promise<PostResult>{
 let boards=readLocalBoards();const added=addLocalScore(boards,game,{initials,icon,score,now:Date.now()});
 boards={...added.boards,me:{initials,icon}};writeLocalBoards(boards);
 const token=island?takeSession(game):null;
 if(!token)return {local:added.rank,seq:added.entry.seq,island:{ok:false,reason:'none'}};
 const old=replaceable(boards,game,initials,score);
 try{
  const r=await fetch(`${API}/submit`,{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({token,score,initials,icon,...(old?{replace:{id:old.id,claim:old.claim}}:{})})});
  const v=await r.json().catch(()=>null);
  if(r.status===429)return {local:added.rank,seq:added.entry.seq,island:{ok:false,reason:'busy'}};
  if(!v?.ok)return {local:added.rank,seq:added.entry.seq,island:{ok:false,reason:v?.reason==='short'||v?.reason==='fast'||v?.reason==='not-top'?v.reason:v?.unavailable?'unavailable':'invalid'}};
  writeLocalBoards(addPosted(readLocalBoards(),game,{id:v.id,claim:v.claim,initials,score},old?.id));
  const value=islandValue(v);topCache.set(game,{at:Date.now(),value});
  return {local:added.rank,seq:added.entry.seq,island:{ok:true,id:v.id,all:typeof v.rank?.all==='number'&&v.rank.all<=value.size?v.rank.all:null,boards:value}};
 }catch{return {local:added.rank,seq:added.entry.seq,island:{ok:false,reason:'unavailable'}};}
}
