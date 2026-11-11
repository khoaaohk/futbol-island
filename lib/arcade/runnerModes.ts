import {setRouteProfile,type TerrainId} from '../../components/games/runnerRoute';
import {localPlayDay} from '../town/dailyPlay';
import {RUNNER_SCORE_MAX} from './runnerEndless';

/**
 * Breakaway Run routes (round 3, Oct 26 2026): a clear difficulty ladder.
 *
 *  Warm-up      gentle first run: slower pace, 5 hearts that refill on every goal, low hills, a short route.
 *  Breakaway    the classic endless run (unchanged rules), now with terrain zones and gentle heart refills.
 *  Night Derby  HARD: faster, tighter gaps, defenders who drift across lanes, steeper hills, rolling balls,
 *               and a final hill to a BOSS KEEPER at the goal line.
 *  Storm Final  HARDEST: all of the above plus jump-then-slide gauntlets, double jump, the steepest hills.
 *  Cup Final    (Nov 8 2026) ELITE: a long 2.4 km final from stage 5, every defender drifts, tightest gaps, floodlit stadium sky,
 *               the boss keeper at the end. Its OWN island board ('cupfinal').
 *  Legend       (Nov 8 2026) ENDLESS ELITE: no finish line, two hearts, stage 6 pace from the first metre, everything on.
 *               Its OWN island board ('legend'): the high-score chase.
 *  Daily Run    (Nov 10 2026) one course a day, the SAME for everyone that day (seeded from the local play day, runnerDailySeed):
 *               a medium 1.2 km route with drifting defenders and a boss keeper. Board 'rundaily'; the first finished run of the
 *               day counts for it, later runs that day are free practice (runnerDaily* below). Not in the six-route ladder.
 *  Nov 10 2026: the finite routes (Warm-up, Night Derby, Storm Final) post to their OWN boards ('runwarm', 'runnight', 'runstorm',
 *               ranked by score) so the endless Breakaway no longer buries them; 'runner' stays the Breakaway (classic) board.
 *
 * Every hard modifier keeps one readable answer: a lane, a jump or a slide is always open. Coins are earned
 * at the classic rates (goals and footballs collected); stars and unlocks live in their own new storage key,
 * so existing saves (records, missions, coach) are never touched.
 */
export type RunnerModeId='warmup'|'classic'|'night'|'storm'|'cup'|'legend'|'daily';
export type RunnerSky='arcade'|'night'|'storm'|'final'|'legend';
/** Island board a route posts to (Nov 8 2026; Nov 10 2026: every route has its own; 'runner' is the Breakaway classic board). */
export type RunnerBoard='runner'|'cupfinal'|'legend'|'runwarm'|'runnight'|'runstorm'|'rundaily';
export type RunnerMode={
 id:RunnerModeId;name:string;short:string;icon:string;line:string;hard:boolean;
 /** Starting hearts and the most you can hold. */lives:number;maxLives:number;
 /** Goals that earn one heart back (gentle refill). */refill:number;
 /** Pace multiplier, spacing multiplier between lines (< 1 = tighter), first stage. */pace:number;gap:number;startLevel:number;
 /** Share of defenders that drift across lanes before they set (0..1). */moving:number;
 /** Jump-then-slide gauntlets, double jump, rolling balls. */combos:boolean;doubleJump:boolean;hazards:boolean;
 /** Route length to the goal line (0 = endless) and whether a boss keeper guards it. */finish:number;bossKeeper:boolean;
 /** Hill and bend scale, terrain zones, sky. */rise:number;turn:number;terrains:readonly TerrainId[];sky:RunnerSky;
 /** Forgiveness (seconds): input buffer, late-jump coyote time, late lane-cut grace. */buffer:number;coyote:number;laneGrace:number;
 /** Star goals (finite routes): [finish, beat the boss keeper / score goals, no hearts lost]. */stars:readonly [string,string,string];
 /** Nov 8 2026: island board id, and for endless elite routes the metres/goals behind each star. */board:RunnerBoard;starRule?:{far:number;goals:number;farther:number};
 /** Keeps its own personal best (never the classic arcade record): the elite tiers and the Daily Run. */ownBest?:boolean;
};
export const RUNNER_MODES:Record<RunnerModeId,RunnerMode>={
 warmup:{id:'warmup',name:'Warm-up',short:'Easy',icon:'🌱',line:'Gentle start. 5 hearts.',hard:false,lives:5,maxLives:5,refill:1,pace:.86,gap:1.14,startLevel:1,moving:0,combos:false,doubleJump:false,hazards:false,
  finish:900,bossKeeper:false,rise:.7,turn:.8,terrains:['grass','sand','grass','cobbles'],sky:'arcade',buffer:.3,coyote:.14,laneGrace:.14,stars:['Reach the goal line','Score 2 goals','Keep every heart'],board:'runwarm'},
 classic:{id:'classic',name:'Breakaway',short:'Classic',icon:'⚽',line:'Run as far as you can.',hard:false,lives:3,maxLives:3,refill:3,pace:1,gap:1,startLevel:1,moving:0,combos:false,doubleJump:false,hazards:false,
  finish:0,bossKeeper:false,rise:1,turn:1,terrains:['grass','cobbles','neon','sand','bridge','rooftop'],sky:'arcade',buffer:.22,coyote:.1,laneGrace:.1,stars:['Reach stage 3','Score 5 goals','Reach stage 6'],board:'runner'},
 night:{id:'night',name:'Night Derby',short:'Hard',icon:'🌙',line:'Faster. Moving defenders. Boss keeper.',hard:true,lives:3,maxLives:3,refill:3,pace:1.1,gap:.88,startLevel:3,moving:.5,combos:false,doubleJump:true,hazards:true,
  finish:1500,bossKeeper:true,rise:1.35,turn:1.1,terrains:['cobbles','bridge','rooftop','neon','snow'],sky:'night',buffer:.2,coyote:.08,laneGrace:.08,stars:['Reach the goal line','Beat the boss keeper','Keep every heart'],board:'runnight'},
 storm:{id:'storm',name:'Storm Final',short:'Hardest',icon:'⛈️',line:'Rain, big hills, jump-slide combos.',hard:true,lives:3,maxLives:3,refill:4,pace:1.16,gap:.82,startLevel:4,moving:.8,combos:true,doubleJump:true,hazards:true,
  finish:1800,bossKeeper:true,rise:1.7,turn:1.15,terrains:['mud','snow','bridge','rooftop','neon'],sky:'storm',buffer:.18,coyote:.07,laneGrace:.07,stars:['Reach the goal line','Beat the boss keeper','Keep every heart'],board:'runstorm'},

 // Nov 8 2026 elite tiers. Pace above 1.1 is still held under runnerTopSpeed × 1.1 (tickRunner), so every read-to-contact
 // window measured for the Storm Final holds; the extra difficulty is density (gap), drift share, start stage and hills.
 cup:{id:'cup',name:'Cup Final',short:'Elite',icon:'🏆',line:'The long final. Every defender moves.',hard:true,lives:3,maxLives:3,refill:5,pace:1.2,gap:.78,startLevel:5,moving:.9,combos:true,doubleJump:true,hazards:true,
  finish:2400,bossKeeper:true,rise:1.85,turn:1.2,terrains:['rooftop','neon','mud','bridge','snow'],sky:'final',buffer:.17,coyote:.065,laneGrace:.065,stars:['Reach the goal line','Beat the boss keeper','Keep every heart'],board:'cupfinal',ownBest:true},
 legend:{id:'legend',name:'Legend',short:'Legend',icon:'👑',line:'Endless. Two hearts. Top speed.',hard:true,lives:2,maxLives:2,refill:5,pace:1.26,gap:.76,startLevel:6,moving:1,combos:true,doubleJump:true,hazards:true,
  finish:0,bossKeeper:false,rise:1.9,turn:1.2,terrains:['snow','rooftop','neon','mud','bridge','cobbles'],sky:'legend',buffer:.17,coyote:.065,laneGrace:.065,stars:['Run 1000 m','Score 8 goals','Run 2500 m'],board:'legend',starRule:{far:1000,goals:8,farther:2500},ownBest:true},
 // Nov 10 2026 Daily Run: between Breakaway and Night Derby (a few drifting defenders, rolling balls, a boss keeper), classic
 // forgiveness windows, so any kid past the Warm-up can try it. Hills, lanes, drift and rollers come from the day's seed.
 daily:{id:'daily',name:'Daily Run',short:'Daily',icon:'📅',line:'A new course every day.',hard:false,lives:3,maxLives:3,refill:3,pace:1.04,gap:.94,startLevel:2,moving:.3,combos:false,doubleJump:true,hazards:true,
  finish:1200,bossKeeper:true,rise:1.15,turn:1.05,terrains:['grass','cobbles','bridge','neon','sand'],sky:'arcade',buffer:.22,coyote:.1,laneGrace:.1,stars:['Reach the goal line','Beat the boss keeper','Keep every heart'],board:'rundaily',ownBest:true},
};
export const RUNNER_MODE_ORDER:readonly RunnerModeId[]=['warmup','classic','night','storm','cup','legend'];
/** The island board a route's scores go to (each route its own; 'runner' = the Breakaway classic). */
export const runnerBoardFor=(id:string):RunnerBoard=>RUNNER_MODES[(id in RUNNER_MODES?id:'classic') as RunnerModeId].board;
/** Routes that keep their own personal best (elite tiers, the Daily Run): their scores never touch the classic arcade record. */
export const runnerKeepsOwnBest=(id:string)=>!!RUNNER_MODES[(id in RUNNER_MODES?id:'classic') as RunnerModeId].ownBest;
/** Salt per route: each route has its own hills; the classic route keeps its original ones (salt 0). */
const SALT:Record<Exclude<RunnerModeId,'daily'>,number>={warmup:11,classic:0,night:23,storm:37,cup:53,legend:71};

let selected:RunnerModeId='classic';
/** Mode for the next run. createRunnerGame reads it; the default (no menu) is the classic run. */
export function selectRunnerMode(id:RunnerModeId){selected=id in RUNNER_MODES?id:'classic';applyRunnerRoute(selected);}
export const selectedRunnerMode=()=>RUNNER_MODES[selected];
/** Route shape for a mode (hills, bends, finish, terrain zones). */
export function applyRunnerRoute(id:RunnerModeId){const m=RUNNER_MODES[id];setRouteProfile({rise:m.rise,turn:m.turn,finish:m.finish,lap:m.finish,salt:id==='daily'?runnerDailySalt(runnerDailyDay()):SALT[id],stage:m.startLevel-1,terrains:m.terrains});}

/* ---- Daily Run (Nov 10 2026): one seeded course per local play day, the same for everyone that day ---- */
let dailyClock:()=>number=()=>Date.now();
/** Test hook: the clock the Daily Run reads its day from (null = the real clock). */
export function setRunnerDailyClock(fn:(()=>number)|null){dailyClock=fn??(()=>Date.now());}
/** Today's local play day (YYYY-MM-DD), the same helper the daily coin and play systems use (lib/town/dailyPlay.ts). */
export const runnerDailyDay=()=>localPlayDay(dailyClock());
/** The day's course seed (FNV-1a of the day): the same number on every device on that day, a new one tomorrow. */
export function runnerDailySeed(day:string){let h=0x811c9dc5;for(let i=0;i<day.length;i++){h^=day.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1000+h%900_000;}
/** Hill salt for the day (each day its own hills; the other routes keep their fixed salts). */
export const runnerDailySalt=(day:string)=>101+runnerDailySeed(day)%997;
/** The device's Daily Run day: whether today's board run is used, today's best, runs today. */
export type RunnerDailySave={day:string;counted:boolean;best:number;runs:number};
const DAILY_KEY='fi2-runner-daily-v1';
export function readRunnerDaily(day=runnerDailyDay()):RunnerDailySave{
 try{const p=JSON.parse(typeof localStorage!=='undefined'?localStorage.getItem(DAILY_KEY)??'null':'null');
  if(p&&p.day===day)return {day,counted:p.counted===true,best:Math.max(0,Math.min(RUNNER_SCORE_MAX,Math.floor(Number(p.best)||0))),runs:Math.max(0,Math.floor(Number(p.runs)||0))};}catch{/* storage optional */}
 return {day,counted:false,best:0,runs:0};}
function saveRunnerDaily(v:RunnerDailySave){try{localStorage.setItem(DAILY_KEY,JSON.stringify(v));}catch{/* storage optional */}}
/**
 * One finished Daily Run: the FIRST of the day is the board run (returns true: post it); every later run that day is practice
 * (false: no board entry, still coins and a personal best). Device-local, like every arcade best (no accounts).
 */
export function claimRunnerDailyRun(day:string,score:number){const v=readRunnerDaily(day),first=!v.counted;
 saveRunnerDaily({day,counted:true,best:Math.max(v.best,Math.max(0,Math.min(RUNNER_SCORE_MAX,Math.floor(score)))),runs:v.runs+1});return first;}

/* ---- stars and unlocks: their own key, written only when a run ends ---- */
/** `best` (Nov 8 2026): personal best per elite tier (their scores never touch the classic arcade record). Optional, so old saves read as-is. */
export type RunnerRouteSave={v:1;mode:RunnerModeId;stars:Record<RunnerModeId,number>;played:number;best?:Partial<Record<RunnerModeId,number>>};
const KEY='fi2-runner-routes-v1';
let cache:RunnerRouteSave|null=null;
const blank=():RunnerRouteSave=>({v:1,mode:'warmup',stars:{warmup:0,classic:0,night:0,storm:0,cup:0,legend:0,daily:0},played:0,best:{}});
export function readRunnerRoutes():RunnerRouteSave{
 if(cache)return cache;let v=blank();
 try{const raw=typeof localStorage!=='undefined'?localStorage.getItem(KEY):null;if(raw){const p=JSON.parse(raw);
  if(p&&p.v===1){v={v:1,mode:p.mode in RUNNER_MODES?p.mode:'warmup',stars:{...v.stars},played:Math.max(0,Number(p.played)||0),best:{}};for(const id of [...RUNNER_MODE_ORDER,'daily'] as const)v.stars[id]=Math.max(0,Math.min(3,Math.floor(Number(p.stars?.[id])||0)));
   for(const id of ['cup','legend'] as const){const b=Math.floor(Number(p.best?.[id])||0);if(b>0&&b<=RUNNER_SCORE_MAX)v.best![id]=b;}}}}catch{/* storage optional */}
 return cache=v;
}
function saveRoutes(v:RunnerRouteSave){cache=v;try{localStorage.setItem(KEY,JSON.stringify(v));}catch{/* storage optional */}}
/** Test hook. */
export function resetRunnerRoutes(v?:RunnerRouteSave){cache=v?{...v,stars:{...v.stars},best:{...v.best}}:null;}
/** Personal best on an elite tier (0 = none yet); the Daily Run's is today's best. The four original routes use the arcade record. */
export const runnerTierBest=(id:RunnerModeId)=>id==='daily'?readRunnerDaily().best:readRunnerRoutes().best?.[id]??0;
/** Saves an elite tier's best; returns true when it is a new best. Called once per run end. */
export function saveRunnerTierBest(id:RunnerModeId,score:number){if(id==='daily')return false;/* the Daily Run's best is saved by claimRunnerDailyRun */const v=readRunnerRoutes(),old=v.best?.[id]??0,n=Math.max(0,Math.min(RUNNER_SCORE_MAX,Math.floor(score)));if(n<=old)return false;saveRoutes({...v,best:{...v.best,[id]:n}});return true;}
/** Remember the route the player picked (the menu opens on it next time). */
export function rememberRunnerMode(id:RunnerModeId){const v=readRunnerRoutes();if(v.mode!==id)saveRoutes({...v,mode:id});}
/** Default for the menu: first-timers start on the Warm-up; players with a classic record keep the classic run. */
export function defaultRunnerMode(hasRecord:boolean,daily=false):RunnerModeId{if(daily)return 'daily';/* "Today in the arcade" (arcadeToday.ts) */const v=readRunnerRoutes();if(v.played>0||v.mode!=='warmup')return isRunnerModeOpen(v.mode,hasRecord?3:0)?v.mode:'classic';return hasRecord?'classic':'warmup';}
/**
 * Unlock ladder: Warm-up and Breakaway are always open. Night Derby opens with 2 stars on the Warm-up or
 * Breakaway, or for anyone whose classic record already reached stage 3 (existing players keep their level).
 * Storm Final opens with 2 Night Derby stars; Cup Final with 2 Storm Final stars; Legend with 2 Cup Final stars (Nov 8 2026).
 */
export function isRunnerModeOpen(id:RunnerModeId,recordStage:number){const s=readRunnerRoutes().stars;
 if(id==='night')return s.warmup>=2||s.classic>=2||recordStage>=3;
 if(id==='storm')return s.night>=2;
 if(id==='cup')return (s.storm??0)>=2;
 if(id==='legend')return (s.cup??0)>=2;
 if(id==='daily')return s.warmup>=1||s.classic>=1||recordStage>=2;
 return true;}
export function runnerModeLockHint(id:RunnerModeId){return id==='night'?'Get 2 ★ on Warm-up or Breakaway':id==='storm'?'Get 2 ★ on Night Derby':id==='cup'?'Get 2 ★ on Storm Final':id==='legend'?'Get 2 ★ on Cup Final':id==='daily'?'Get 1 ★ on Warm-up or Breakaway':'';}

/** Minimal shape read for stars (avoids an import cycle with runnerGame). */
type RunResult={mode:string;finished:boolean;won:boolean;goals:number;level:number;hits:number;lives:number;distance?:number;/** Endless play: rounds cleared with no heart lost (a run now always ends on a lost heart). */cleanClears?:number};
/** Stars earned by one run (0..3 flags). */
export function runnerRunStars(r:RunResult):[boolean,boolean,boolean]{
 const m=RUNNER_MODES[(r.mode in RUNNER_MODES?r.mode:'classic') as RunnerModeId];
 if(m.starRule){const d=r.distance??0;return[d>=m.starRule.far,r.goals>=m.starRule.goals,d>=m.starRule.farther];}
 if(!m.finish)return[r.level>=3,r.goals>=5,r.level>=6];
 return[r.finished,m.bossKeeper?r.won:r.goals>=2,r.finished&&(r.cleanClears!==undefined?r.cleanClears>0:r.hits===0)];
}
/** Save the best star count for a route; returns {stars this run, best, newly earned}. Called once per run end. */
export function recordRunnerStars(r:RunResult){
 const flags=runnerRunStars(r),count=flags.filter(Boolean).length,v=readRunnerRoutes(),id=(r.mode in RUNNER_MODES?r.mode:'classic') as RunnerModeId,old=v.stars[id];
 saveRoutes({...v,mode:id,played:v.played+1,stars:{...v.stars,[id]:Math.max(old,count)}});
 return{flags,count,best:Math.max(old,count),gained:Math.max(0,count-old)};
}
