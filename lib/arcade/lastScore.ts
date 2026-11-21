/**
 * The last score per arcade cabinet (Nov 14 2026, retention: "almost your best"). The cabinets' own saves keep only the best; this
 * one small synced key (fi2-arcade-last-v1, lib/saves/snapshot.ts SYNC + cleanLastRaw, docs/accounts-design.md table A) keeps the
 * last finished run of each scored cabinet, the best at that moment and when, so the Welcome back note can say
 * "Your last Pass Puzzles score was 300, 38 off your best! Tap to beat it" (lib/welcome/hooks.ts arcade_near).
 * Shape: {"<game>":{"s":last,"b":best,"at":ms}} for the fixed games below only, about 40 bytes a game. Pure apart from the
 * storage passed in (defaults to localStorage); no React, no catalogues.
 *  - Written by saveArcadeRecord (Breakaway Run, Pinball, Kit Rush, Squad Snake, Air Futbol: every call is one finished run) and by
 *    Pass Puzzles' Endless Run (components/games/PassPuzzleGame.tsx endlessOver). Futbol Tennis (a rally length) and live matches
 *    (a scoreline) are not scores to beat, so they are left out.
 *  - Nov 15 2026: daily runs and elite tiers write their own entry against their OWN best (LAST_SCORE_MODES: the Daily Run, Cup Final
 *    and Legend from lib/arcade/results/settle.ts, Derby Night and World Final from savePinballTier there, Daily Rush and Daily
 *    Squad from KitRushGame / SquadSnakeGame). A daily entry's best is that day's best (a new course every day), so it only counts
 *    on the same local play day.
 */
export const ARCADE_LAST_KEY='fi2-arcade-last-v1';
export const LAST_SCORE_GAMES=['runner','pinball','puzzle','kitrush','snake','airhockey','lineup','trophydrop','rollball','ballblaster','keepyuppy','holdtheline','footgolf',
 'runner_daily','runner_cup','runner_legend','pinball_derby','pinball_final','kitrush_daily','snake_daily','lineup_daily','rollball_daily','ballblaster_daily','keepyuppy_daily','holdtheline_daily','footgolf_daily'] as const;
/** The daily-run and elite-tier entries: the cabinet, the mode the Welcome back tap opens (`mode` = a tier, `today` = the daily
 *  run) and the words for "Your last <label> was …". */
export const LAST_SCORE_MODES:Partial<Record<string,{game:string;label:string;mode?:string;today?:true}>>={
 runner_daily:{game:'runner',label:'Daily Run',today:true},runner_cup:{game:'runner',label:'Cup Final run',mode:'cup'},
 runner_legend:{game:'runner',label:'Legend run',mode:'legend'},pinball_derby:{game:'pinball',label:'Derby Night game',mode:'derby'},
 pinball_final:{game:'pinball',label:'World Final game',mode:'final'},kitrush_daily:{game:'kitrush',label:'Daily Rush',today:true},
 snake_daily:{game:'snake',label:'Daily Squad',today:true},lineup_daily:{game:'lineup',label:'Daily Line-Up',today:true},rollball_daily:{game:'rollball',label:'Daily Roll',today:true},ballblaster_daily:{game:'ballblaster',label:'Daily Blast',today:true},keepyuppy_daily:{game:'keepyuppy',label:'Track of the Day',today:true},holdtheline_daily:{game:'holdtheline',label:'Match of the Day',today:true},footgolf_daily:{game:'footgolf',label:'Daily Hole',today:true},
};
const playDay=(ms:number)=>{const d=new Date(ms);return d.getFullYear()*1e4+d.getMonth()*100+d.getDate();};
export type LastScoreGame=typeof LAST_SCORE_GAMES[number];
export type LastScore={s:number;b:number;at:number};
export type LastScores=Partial<Record<LastScoreGame,LastScore>>;
const MAX_SCORE=1e9;
const isGame=(g:unknown):g is LastScoreGame=>typeof g==='string'&&(LAST_SCORE_GAMES as readonly string[]).includes(g);
const whole=(n:unknown,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):null;

/** Only the fixed games, whole non-negative numbers, best ≥ last. Anything else is dropped. */
export function sanitizeLastScores(raw:unknown):LastScores{
 const out:LastScores={};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
 for(const [g,v] of Object.entries(raw as Record<string,unknown>)){
  if(!isGame(g)||!v||typeof v!=='object')continue;const r=v as Record<string,unknown>;
  const s=whole(r.s,MAX_SCORE),b=whole(r.b,MAX_SCORE),at=whole(r.at,8.64e15);
  if(s===null||b===null||at===null)continue;
  out[g]={s,b:Math.max(b,s),at};
 }
 return out;
}
/** The snapshot's cleaner (lib/saves/snapshot.ts cleanKeys): the sanitised value as JSON, or null to drop the key. */
export function cleanLastRaw(v:string):string|null{try{return JSON.stringify(sanitizeLastScores(JSON.parse(v)));}catch{return null;}}

type Store=Pick<Storage,'getItem'|'setItem'>|null;
const local=():Store=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
export function readLastScores(storage:Pick<Storage,'getItem'>|null=local()):LastScores{
 try{return sanitizeLastScores(JSON.parse(storage?.getItem(ARCADE_LAST_KEY)??'null'));}catch{return {};}
}
/** One finished run of `game`: its score and the best after it. Other games are ignored. */
export function noteLastScore(game:string,score:number,best:number,now=Date.now(),storage:Store=local()){
 if(!isGame(game)||!storage)return;const s=whole(score,MAX_SCORE),b=whole(best,MAX_SCORE);if(s===null||b===null)return;
 try{storage.setItem(ARCADE_LAST_KEY,JSON.stringify({...readLastScores(storage),[game]:{s,b:Math.max(b,s),at:Math.floor(now)}}));}catch{/* this visit only */}
}

/** How close counts as "almost": within 30% of the best (and at least 1 point off), last played within 14 days. */
export const NEAR_SHARE=.3,NEAR_DAYS=14;
/** The most recently played cabinet (or daily run / elite tier) whose last run fell just short of its best, or null. */
export function nearBest(last:LastScores,now=Date.now()):{game:LastScoreGame;score:number;best:number;gap:number}|null{
 let pick:{game:LastScoreGame;r:LastScore}|null=null;
 for(const g of LAST_SCORE_GAMES){const r=last[g];if(r&&(!pick||r.at>pick.r.at))pick={game:g,r};}
 if(!pick)return null;const {s,b,at}=pick.r,gap=b-s;
 if(s<=0||gap<=0||gap>b*NEAR_SHARE||now-at>NEAR_DAYS*864e5||at>now+6e4)return null;
 if(LAST_SCORE_MODES[pick.game]?.today&&playDay(at)!==playDay(now))return null;// yesterday's course is gone
 return {game:pick.game,score:s,best:b,gap};
}
