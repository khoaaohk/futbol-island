/**
 * Futbol Pinball elite tiers (Nov 8 2026, owner: "add harder levels since there is a scoreboard"). Pure and isomorphic except
 * the two small localStorage helpers at the end. Two tiers sit above the six divisions, each with its OWN island and device
 * board (lib/arcade/leaderboard.ts BOARD_GAMES 'pinderby' and 'pinfinal'), so a Build Up score never shares a board with a
 * World Final one and the existing 'pinball' board keeps its rules and rows untouched.
 *
 *  - Derby Night: opens once Champions Night is open on the ladder. Champions Night's table (sweeper-keeper, 2v1 kick-offs,
 *    Rush clock) played 12% faster with shorter flippers. 3 balls. Points ×2.
 *  - World Final: opens once a goal is scored in Derby Night. 22% faster, the shortest flippers, 2 balls and no ball save
 *    (the 2v1 multiball save still plays). Points ×3.
 *
 * The multiplier applies to every point the sim scores (stepPinball multiplies each frame's gain), so the HUD always shows the
 * real board score. Same coins as any pinball run (3 coins entry, coins from goals and moves only): the economy is untouched.
 */
import type {BoardGame} from '../arcade/leaderboard';

export type PinballTierId='derby'|'final';
export type PinballTier={id:PinballTierId;tier:1|2;board:BoardGame;name:string;short:string;
 /** sim speed (the whole table runs this much faster), flipper length (px; classic Champions Night is 57), balls, points × */
 speed:number;flipper:number;balls:number;mult:number;ballSave:boolean;rules:readonly string[];unlock:string;objective:string};
export const PINBALL_TIERS:Record<PinballTierId,PinballTier>={
 derby:{id:'derby',tier:1,board:'pinderby',name:'Derby Night',short:'DERBY',speed:1.12,flipper:56,balls:3,mult:2,ballSave:true,
  rules:['Faster ball','Shorter flippers','Points ×2'],unlock:'Open Champions Night first',objective:'Faster ball, points ×2. Beat your rival!'},
 final:{id:'final',tier:2,board:'pinfinal',name:'World Final',short:'FINAL',speed:1.22,flipper:54,balls:2,mult:3,ballSave:false,
  rules:['Fastest ball','2 balls, no ball save','Points ×3'],unlock:'Score a goal in Derby Night',objective:'2 balls, no ball save, points ×3.'},
};
export const PINBALL_TIER_IDS:readonly PinballTierId[]=['derby','final'];
/** The tier record for a run's tier number (0 = the classic ladder). */
export const pinballTierOf=(tier:number):PinballTier|null=>tier===1?PINBALL_TIERS.derby:tier===2?PINBALL_TIERS.final:null;
/** The board a run posts to: the classic ladder keeps 'pinball'. */
export const pinballBoardFor=(tier:number):BoardGame=>pinballTierOf(tier)?.board??'pinball';
/** Sim speed and points multiplier for a tier number (1 for the classic ladder). */
export const pinballTierSpeed=(tier:number)=>pinballTierOf(tier)?.speed??1;
export const pinballTierMult=(tier:number)=>pinballTierOf(tier)?.mult??1;

/** Which tiers are open: Derby once the ladder reaches Champions Night (division 6), the World Final after a Derby goal. */
export function pinballTiersOpen(ladderTop:number,p:PinballTierProgress){
 const derby=ladderTop>=6||p.derby.goals>0||p.derby.best>0;
 return {derby,final:derby&&(p.derby.goals>0||p.final.best>0)};
}

/** PERFECT streak multiplier shown on the HUD badge (the sim pays PERFECT_POINTS × streak, streak capped at 5). */
export const pinballStreakBadge=(streak:number)=>Number.isFinite(streak)&&streak>=2?`PERFECT ×${Math.min(5,Math.floor(streak))}`:'';

/** Plain "why it ended" line for the full-time card. */
export function pinballEndReason(s:{balls:number;fullTimeBonus:number},minute=''){
 if(s.balls<=0)return `Out of balls${minute?` at ${minute}`:''}. The last ball slipped past the flippers.`;
 return `Full-time whistle! ${s.balls} ball${s.balls===1?'':'s'} kept${s.fullTimeBonus>0?`: +${s.fullTimeBonus.toLocaleString('en-US')}`:''}.`;
}
/** The full-time card's coach tip without the "why it ended" lead the HUD message starts with (the card shows that line itself). */
export function pinballTipOnly(message:string){const i=message.lastIndexOf(' · ');return i>=0?message.slice(i+3):message;}

/** Dead-ball watchdog: a ball that has barely moved for this long away from the flippers gets a fair little kick. */
export const PINBALL_STALL_SPEED=28,PINBALL_STALL_TIME=2.2,PINBALL_STALL_KICK=300;

export type PinballTierProgress=Record<PinballTierId,{best:number;goals:number}>;
const KEY='fi2-pinball-tiers-v1';
const clean=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(1e7,Math.floor(n))):0;};
export function readPinballTiers():PinballTierProgress{
 try{const v=JSON.parse(localStorage.getItem(KEY)??'{}')??{};return {derby:{best:clean(v.derby?.best),goals:clean(v.derby?.goals)},final:{best:clean(v.final?.best),goals:clean(v.final?.goals)}};}
 catch{return {derby:{best:0,goals:0},final:{best:0,goals:0}};}
}
/** Records a finished tier run; returns the new progress and whether the score is a personal best for that tier. */
export function savePinballTier(tier:PinballTierId,score:number,goals:number):{progress:PinballTierProgress;best:boolean}{
 const p=readPinballTiers(),before=p[tier].best,best=score>before&&score>0;
 p[tier]={best:Math.max(before,clean(score)),goals:p[tier].goals+clean(goals)};
 try{localStorage.setItem(KEY,JSON.stringify(p));}catch{}return {progress:p,best};
}
