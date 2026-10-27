import {setRouteProfile,type TerrainId} from '../../components/games/runnerRoute';

/**
 * Breakaway Run routes (round 3, Oct 26 2026): a clear difficulty ladder.
 *
 *  Warm-up      gentle first run: slower pace, 5 hearts that refill on every goal, low hills, a short route.
 *  Breakaway    the classic endless run (unchanged rules), now with terrain zones and gentle heart refills.
 *  Night Derby  HARD: faster, tighter gaps, defenders who drift across lanes, steeper hills, rolling balls,
 *               and a final hill to a BOSS KEEPER at the goal line.
 *  Storm Final  HARDEST: all of the above plus jump-then-slide gauntlets, double jump, the steepest hills.
 *
 * Every hard modifier keeps one readable answer: a lane, a jump or a slide is always open. Coins are earned
 * at the classic rates (goals and footballs collected); stars and unlocks live in their own new storage key,
 * so existing saves (records, missions, coach) are never touched.
 */
export type RunnerModeId='warmup'|'classic'|'night'|'storm';
export type RunnerSky='arcade'|'night'|'storm';
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
};
export const RUNNER_MODES:Record<RunnerModeId,RunnerMode>={
 warmup:{id:'warmup',name:'Warm-up',short:'Easy',icon:'🌱',line:'Gentle start. 5 hearts.',hard:false,lives:5,maxLives:5,refill:1,pace:.86,gap:1.14,startLevel:1,moving:0,combos:false,doubleJump:false,hazards:false,
  finish:900,bossKeeper:false,rise:.7,turn:.8,terrains:['grass','sand','grass','cobbles'],sky:'arcade',buffer:.3,coyote:.14,laneGrace:.14,stars:['Reach the goal line','Score 2 goals','Keep every heart']},
 classic:{id:'classic',name:'Breakaway',short:'Classic',icon:'⚽',line:'Run as far as you can.',hard:false,lives:3,maxLives:3,refill:3,pace:1,gap:1,startLevel:1,moving:0,combos:false,doubleJump:false,hazards:false,
  finish:0,bossKeeper:false,rise:1,turn:1,terrains:['grass','cobbles','neon','sand','bridge','rooftop'],sky:'arcade',buffer:.22,coyote:.1,laneGrace:.1,stars:['Reach stage 3','Score 5 goals','Reach stage 6']},
 night:{id:'night',name:'Night Derby',short:'Hard',icon:'🌙',line:'Faster. Moving defenders. Boss keeper.',hard:true,lives:3,maxLives:3,refill:3,pace:1.1,gap:.88,startLevel:3,moving:.5,combos:false,doubleJump:true,hazards:true,
  finish:1500,bossKeeper:true,rise:1.35,turn:1.1,terrains:['cobbles','bridge','rooftop','neon','snow'],sky:'night',buffer:.2,coyote:.08,laneGrace:.08,stars:['Reach the goal line','Beat the boss keeper','Keep every heart']},
 storm:{id:'storm',name:'Storm Final',short:'Hardest',icon:'⛈️',line:'Rain, big hills, jump-slide combos.',hard:true,lives:3,maxLives:3,refill:4,pace:1.16,gap:.82,startLevel:4,moving:.8,combos:true,doubleJump:true,hazards:true,
  finish:1800,bossKeeper:true,rise:1.7,turn:1.15,terrains:['mud','snow','bridge','rooftop','neon'],sky:'storm',buffer:.18,coyote:.07,laneGrace:.07,stars:['Reach the goal line','Beat the boss keeper','Keep every heart']},
};
export const RUNNER_MODE_ORDER:readonly RunnerModeId[]=['warmup','classic','night','storm'];
/** Salt per route: each route has its own hills; the classic route keeps its original ones (salt 0). */
const SALT:Record<RunnerModeId,number>={warmup:11,classic:0,night:23,storm:37};

let selected:RunnerModeId='classic';
/** Mode for the next run. createRunnerGame reads it; the default (no menu) is the classic run. */
export function selectRunnerMode(id:RunnerModeId){selected=id in RUNNER_MODES?id:'classic';applyRunnerRoute(selected);}
export const selectedRunnerMode=()=>RUNNER_MODES[selected];
/** Route shape for a mode (hills, bends, finish, terrain zones). */
export function applyRunnerRoute(id:RunnerModeId){const m=RUNNER_MODES[id];setRouteProfile({rise:m.rise,turn:m.turn,finish:m.finish,salt:SALT[id],stage:m.startLevel-1,terrains:m.terrains});}

/* ---- stars and unlocks: their own key, written only when a run ends ---- */
export type RunnerRouteSave={v:1;mode:RunnerModeId;stars:Record<RunnerModeId,number>;played:number};
const KEY='fi2-runner-routes-v1';
let cache:RunnerRouteSave|null=null;
const blank=():RunnerRouteSave=>({v:1,mode:'warmup',stars:{warmup:0,classic:0,night:0,storm:0},played:0});
export function readRunnerRoutes():RunnerRouteSave{
 if(cache)return cache;let v=blank();
 try{const raw=typeof localStorage!=='undefined'?localStorage.getItem(KEY):null;if(raw){const p=JSON.parse(raw);
  if(p&&p.v===1){v={v:1,mode:p.mode in RUNNER_MODES?p.mode:'warmup',stars:{...v.stars},played:Math.max(0,Number(p.played)||0)};for(const id of RUNNER_MODE_ORDER)v.stars[id]=Math.max(0,Math.min(3,Math.floor(Number(p.stars?.[id])||0)));}}}catch{/* storage optional */}
 return cache=v;
}
function saveRoutes(v:RunnerRouteSave){cache=v;try{localStorage.setItem(KEY,JSON.stringify(v));}catch{/* storage optional */}}
/** Test hook. */
export function resetRunnerRoutes(v?:RunnerRouteSave){cache=v?{...v,stars:{...v.stars}}:null;}
/** Remember the route the player picked (the menu opens on it next time). */
export function rememberRunnerMode(id:RunnerModeId){const v=readRunnerRoutes();if(v.mode!==id)saveRoutes({...v,mode:id});}
/** Default for the menu: first-timers start on the Warm-up; players with a classic record keep the classic run. */
export function defaultRunnerMode(hasRecord:boolean):RunnerModeId{const v=readRunnerRoutes();if(v.played>0||v.mode!=='warmup')return isRunnerModeOpen(v.mode,hasRecord?3:0)?v.mode:'classic';return hasRecord?'classic':'warmup';}
/**
 * Unlock ladder: Warm-up and Breakaway are always open. Night Derby opens with 2 stars on the Warm-up or
 * Breakaway, or for anyone whose classic record already reached stage 3 (existing players keep their level).
 * Storm Final opens with 2 Night Derby stars.
 */
export function isRunnerModeOpen(id:RunnerModeId,recordStage:number){const s=readRunnerRoutes().stars;
 if(id==='night')return s.warmup>=2||s.classic>=2||recordStage>=3;
 if(id==='storm')return s.night>=2;
 return true;}
export function runnerModeLockHint(id:RunnerModeId){return id==='night'?'Get 2 ★ on Warm-up or Breakaway':id==='storm'?'Get 2 ★ on Night Derby':'';}

/** Minimal shape read for stars (avoids an import cycle with runnerGame). */
type RunResult={mode:string;finished:boolean;won:boolean;goals:number;level:number;hits:number;lives:number};
/** Stars earned by one run (0..3 flags). */
export function runnerRunStars(r:RunResult):[boolean,boolean,boolean]{
 const m=RUNNER_MODES[(r.mode in RUNNER_MODES?r.mode:'classic') as RunnerModeId];
 if(!m.finish)return[r.level>=3,r.goals>=5,r.level>=6];
 return[r.finished,m.bossKeeper?r.won:r.goals>=2,r.finished&&r.hits===0];
}
/** Save the best star count for a route; returns {stars this run, best, newly earned}. Called once per run end. */
export function recordRunnerStars(r:RunResult){
 const flags=runnerRunStars(r),count=flags.filter(Boolean).length,v=readRunnerRoutes(),id=(r.mode in RUNNER_MODES?r.mode:'classic') as RunnerModeId,old=v.stars[id];
 saveRoutes({...v,mode:id,played:v.played+1,stars:{...v.stars,[id]:Math.max(old,count)}});
 return{flags,count,best:Math.max(old,count),gained:Math.max(0,count-old)};
}
