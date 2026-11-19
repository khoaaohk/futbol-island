/**
 * Pass Puzzles Endless Run (Nov 10 2026, owner: "the user can play as long as they want to increase their score ... increase in
 * difficulty the further they play"). Puzzles come one after another with no menu in between; the run ends when the three lives
 * are gone (a failed puzzle or a skip costs one). Every puzzle is an authored scenario picked by its measured difficulty
 * (lib/passPuzzle/curve.ts) and remixed: mirrored, every player shifted, up to two extra defenders squeezed in beside the lanes,
 * one of them pressing later on. A remix is only served after its taught route still solves it in the real engine, with heading
 * on AND with the youth no-heading rule (coachRun, about 1 ms each on a laptop), so no impossible puzzle is ever shown. Pure and
 * deterministic: the same seed and level always give the same puzzle (the first run of a day uses the date as its seed).
 * Authored levels, their stars and their boards are untouched: this file only reads the catalog.
 */
import type {Scenario,Kick,Vec2} from './types';
import {ALL_SCENARIOS,ALL_SOLUTIONS} from './catalog';
import {DIFFICULTY} from './curve';
import {remix,seeded,dateKey,type DailyTemplate} from './daily';
import {coachRun,strokeForKick} from './coach';
import {createPuzzle} from './world';
import {readStroke} from './stroke';
import {youthScenario} from './youth';
import {isCall,type Step} from './packs';

export const ENDLESS_LIVES=3;
/** The two gentle openers (levels 1 and 2 of every run), then the pool by measured difficulty. */
export const ENDLESS_OPENERS=['fp-far-corner','fp-find-a-friend'] as const;
/** Templates: every authored puzzle whose taught route also works under the youth no-heading rule when the puzzle is renamed
 * (41 of 46; the five header puzzles stay in their pack). tests/pass-puzzle-endless.cjs proves each one. */
export const ENDLESS_POOL=['fp-find-a-friend','fp-far-corner','fp-run-onto-it','fp-bend-it-round','tm-give-and-go','tm-third-friend','tm-round-the-outside','tm-switch-it','tm-pull-it-back','bp-bounce-pass','bp-keeper-starts-it','bp-through-the-gap','bp-back-to-go-forward','bp-in-behind','air-knock-down','mp-escape-and-switch','mp-one-more-pass','mp-second-ball','tr-beat-the-trap','tr-make-the-run','tr-decoy-run','tr-get-back-onside','ca-sweeper-keeper','ca-escape-the-hunter','ca-break-fast','sp-lay-it-off','sp-over-the-top','sp-round-the-wall','wr-wet-pitch','wr-into-the-wind','wr-aim-off','ss-look-up','ss-set-and-go','ss-third-runner','ss-up-back-through','ex-trap-and-hunter','ex-chain-under-press','ex-one-two-clock','ex-switch-then-through','ex-four-pass-move','ex-set-and-switch'] as const;
const rating=(id:string)=>DIFFICULTY[id]??50;
const template=(id:string):DailyTemplate=>{const scenario=ALL_SCENARIOS.find(s=>s.id===id)!,r=ALL_SOLUTIONS[id];return{scenario,solution:r.solution,naive:r.naive};};
/** The puzzle as the arcade plays it (components/games/PassPuzzleGame.tsx `playable`): a direct shot may finish a goal puzzle. */
export const endlessPlayable=(s:Scenario,heading=true):Scenario=>{const base=heading?s:youthScenario(s);return{...base,require:{...base.require,allowDirectShot:base.require.finish==='goal'}};};

/** What rises with the level. Every field is monotone: the rating window climbs, defenders are added, the players are shifted
 * further, an added defender starts to press, the aids go (Scan shown, then only the hint button, then neither) and the thinking
 * clock appears and shortens gently to a floor. */
export type EndlessRamp={level:number;
 /** centre and floor of the measured-difficulty window the template is picked from (0 easy .. 100 hard) */
 target:number;floor:number;
 extraDefenders:0|1|2;
 /** how far (m) each outfield player may be shifted from the authored spot */
 shift:number;
 /** an added defender closes down the ball */
 press:boolean;
 aid:'scan'|'hint'|'none';
 /** seconds to solve the puzzle (null = no clock); a multi-pass puzzle gets 4 s more per required pass */
 clock:number|null;
 /** AAA pass (Nov 18 2026): the chance (0..1) that a dry puzzle is served on a wet, skiddy pitch (teal turf); 0 before level 8 */
 wet:number};
export function endlessRamp(level:number):EndlessRamp{
 const n=Math.max(1,Math.floor(level)),target=n<3?10:Math.min(92,18+4*(n-3));
 return{level:n,target,floor:Math.max(0,target-26),extraDefenders:n<7?0:n<15?1:2,shift:Math.min(1.2,.3+.045*(n-1)),press:n>=12,aid:n<=4?'scan':n<=9?'hint':'none',clock:n<6?null:Math.max(15,45-2*(n-6)),wet:n<8?0:Math.min(.3,.14+.01*(n-8))};
}
/** Thinking time for a served puzzle (null = no clock). */
export const endlessClock=(ramp:EndlessRamp,s:Scenario)=>ramp.clock===null?null:ramp.clock+4*s.require.minPasses;

const picks=new Map<string,string[]>();
/** The template for each level of a run: inside the level's rating window, never one of the last three. Memoised per seed. */
export function endlessTemplate(seed:string,level:number):string{
 let list=picks.get(seed);if(!list){if(picks.size>8)picks.clear();list=[];picks.set(seed,list);}
 for(let n=list.length+1;n<=level;n++){
  if(n<=2){const flip=seeded(`fi-endless-open-${seed}`)()<.5?1:0;list.push(ENDLESS_OPENERS[(n-1+flip)%2]);continue;}
  const ramp=endlessRamp(n),recent=list.slice(-3),rand=seeded(`fi-endless-pick-${seed}#${n}`),fresh=ENDLESS_POOL.filter(id=>!recent.includes(id));
  let window=fresh.filter(id=>rating(id)>=ramp.floor&&rating(id)<=ramp.target+10);
  if(window.length<4)window=[...fresh].sort((a,b)=>Math.abs(rating(a)-ramp.target)-Math.abs(rating(b)-ramp.target)||(a<b?-1:1)).slice(0,4);
  list.push(window[Math.floor(rand()*window.length)]);
 }
 return list[level-1];
}

/** The points the taught route passes through (the carrier, then each receiver or target), for placing an extra defender. */
function lanePoints(s:Scenario,route:Step[]):Vec2[]{
 const pts:Vec2[]=[{x:s.attackers[s.carrier].x,z:s.attackers[s.carrier].z}];
 for(const st of route){if(isCall(st))continue;const k=st as Kick;
  if(k.kind==='shot')pts.push({x:k.target.x,z:s.pitch.length/2});
  else if(k.receiver!=null&&s.attackers[k.receiver])pts.push({x:s.attackers[k.receiver].x,z:s.attackers[k.receiver].z});
  else pts.push({x:k.target.x,z:k.target.z});}
 return pts;
}
/** One more defender beside a lane of the route (3 to 5.5 m off it), clear of every other player; null when no spot was free. */
function withDefender(s:Scenario,route:Step[],rand:()=>number,press:boolean):Scenario|null{
 const pts=lanePoints(s,route);if(pts.length<2||s.defenders.length>=10)return null;
 for(let n=0;n<6;n++){
  const i=Math.floor(rand()*(pts.length-1)),a=pts[i],b=pts[i+1],dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz)||1,u=.3+.45*rand(),off=(3+2.5*rand())*(rand()<.5?-1:1);
  const x=Math.max(-s.pitch.halfWidth+1,Math.min(s.pitch.halfWidth-1,a.x+dx*u+dz/L*off)),z=Math.max(-s.pitch.length/2+2,Math.min(s.pitch.length/2-3,a.z+dz*u-dx/L*off));
  const others:Vec2[]=[...s.attackers,...s.defenders,...(s.keeper?[s.keeper]:[])];
  if(others.some(p=>Math.hypot(p.x-x,p.z-z)<2.4))continue;
  return{...s,defenders:[...s.defenders,press?{x:+x.toFixed(2),z:+z.toFixed(2),press:true}:{x:+x.toFixed(2),z:+z.toFixed(2)}]};
 }
 return null;
}
/**
 * AAA pass (Nov 18 2026): the lazy way out. Would one straight low shot from the first whistle score (five spots across the goal)?
 * Played in the real engine as a finger would draw it. Before this check a run's later puzzles could be finished with one shot about
 * one time in four (two stars for no reading at all); now a remix that leaves the shot on gets a defender stood in its way.
 */
export function directShotScores(sc:Scenario):boolean{
 if(sc.require.finish!=='goal')return false;const g=sc.pitch,hg=g.goalWidth/2-.4;
 for(const fx of [-1,-.5,0,.5,1]){const w=createPuzzle(sc);let k:Kick;try{k=readStroke(strokeForKick(w,{kind:'shot',target:{x:fx*hg,z:g.length/2},curl:0,loft:0,power:.5}),w);}catch{continue;}
  if(k.kind!=='shot'||!w.kick(k))continue;for(let n=0;n<120*8;n++){const ph=w.state.phase;if(ph!=='windup'&&ph!=='flight')break;w.step(1/120);}
  if(w.state.phase==='success')return true;}
 return false;
}
/** True when the taught route is more than a shot (so a one-shot solve would skip the lesson). */
const hasPass=(route:Step[])=>route.filter(st=>!isCall(st)).length>=2;
/** A defender stood between the ball and the goal (2.6 to 6 m out, on the line to the goal or a step either side) so the lazy shot is
 * blocked while the taught route still works; null when no such spot exists. */
function withShotBlocker(s:Scenario,route:Step[]):Scenario|null{
 if(s.defenders.length>=10)return null;const c=s.attackers[s.carrier],gz=s.pitch.length/2,dx=-c.x,dz=gz-c.z,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L;
 const others:Vec2[]=[...s.attackers,...s.defenders,...(s.keeper?[s.keeper]:[])];
 for(const d of [3.4,4.6,2.6,6])for(const off of [0,.9,-.9]){if(d>=L-3)continue;const x=+(c.x+ux*d+uz*off).toFixed(2),z=+(c.z+uz*d-ux*off).toFixed(2);
  if(Math.abs(x)>s.pitch.halfWidth-1||others.some(p=>Math.hypot(p.x-x,p.z-z)<2.2))continue;
  const sc:Scenario={...s,defenders:[...s.defenders,{x,z}]};if(solves(sc,route)&&!directShotScores(endlessPlayable(sc,true)))return sc;}
 return null;
}
const solves=(s:Scenario,route:Step[])=>coachRun(endlessPlayable(s,true),route).ok&&coachRun(endlessPlayable(s,false),route).ok;

export type EndlessPuzzle={level:number;scenario:Scenario;solution:Step[];template:string;mirrored:boolean;
 /** defenders added to the authored puzzle, and whether one presses */
 extra:number;press:boolean;
 /** AAA pass: served on a wet pitch by the run (not the template's own weather); a defender was stood in the way of the lazy shot */
 wet:boolean;blocker:boolean;
 /** the template's measured difficulty plus what the remix added (for the HUD pips and the tests) */
 difficulty:number;ramp:EndlessRamp;clock:number|null};
/**
 * The puzzle for `level` of the run `seed`. Tries the full remix first, then gives ground (fewer extra defenders, no press, a
 * smaller shift) and ends on the mirrored and finally the authored layout, which the tests prove solvable for every template.
 */
export function endlessPuzzle(seed:string,level:number):EndlessPuzzle{
 const ramp=endlessRamp(level),id=endlessTemplate(seed,ramp.level),t=template(id),rand=seeded(`fi-endless-${seed}#${ramp.level}`),mirrored=rand()<.5,pid=`endless-${ramp.level}`;
 const dress=(s:Scenario):Scenario=>({...s,id:pid,pack:'endless',title:t.scenario.title,attempts:1});
 const done=(scenario:Scenario,solution:Step[],m:boolean,extra:number,press:boolean,wet=false,blocker=false):EndlessPuzzle=>({level:ramp.level,scenario,solution,template:id,mirrored:m,extra,press,wet,blocker,difficulty:rating(id)+extra*8+(press?4:0)+(wet?4:0),ramp,clock:endlessClock(ramp,scenario)});
 // The weather roll has its own stream, so it never shifts the layout rolls. The openers and the first real puzzles stay as authored.
 const wantWet=ramp.wet>0&&!t.scenario.weather&&seeded(`fi-endless-wet-${seed}#${ramp.level}`)()<ramp.wet,proof=ramp.level>=3&&hasPass(t.solution)&&t.scenario.require.finish==='goal';
 for(let n=0;n<9;n++){
  const extras=n<4?ramp.extraDefenders:n<7?Math.max(0,ramp.extraDefenders-1):0,press=ramp.press&&n<3,k=(n<7?ramp.shift:ramp.shift/2)/.6;
  const r=remix(t,()=>.5+(rand()-.5)*k,mirrored,pid);let sc:Scenario|null=dress(r.scenario),added=0,pressing=false,blocker=false;
  for(let e=0;e<extras&&sc;e++){const p=press&&e===0,next:Scenario|null=withDefender(sc,r.solution,rand,p);if(next){sc=next;added++;pressing=pressing||p;}}
  if(!sc||!solves(sc,r.solution))continue;
  // The lazy shot: stand a defender in its way; if no spot keeps the route alive, roll the layout again (the last tries take it as it is).
  if(proof&&directShotScores(endlessPlayable(sc,true))){const b=withShotBlocker(sc,r.solution);if(b){sc=b;added++;blocker=true;}else if(n<7)continue;}
  if(wantWet&&n<5){const w:Scenario={...sc,weather:{wet:true}};if(solves(w,r.solution)&&!(proof&&directShotScores(endlessPlayable(w,true))))return done(w,r.solution,mirrored,added,pressing,true,blocker);}
  return done(sc,r.solution,mirrored,added,pressing,false,blocker);
 }
 const flat=remix(t,()=>.5,mirrored,pid),mirror=dress(flat.scenario);if(solves(mirror,flat.solution))return done(mirror,flat.solution,mirrored,0,false);
 const plain=remix(t,()=>.5,false,pid);return done(dress(plain.scenario),plain.solution,false,0,false);
}

/** The run: lives, level, score (in stars, the unit of the Pass Puzzles board) and the first-try streak. */
export type EndlessRun={seed:string;level:number;lives:number;score:number;solved:number;
 /** first-try solves in a row */
 streak:number;bestStreak:number;
 /** failed tries on the current puzzle */
 tries:number;over:boolean;
 /** AAA pass (Nov 18 2026): Coach's eyes. From level 5 the Scan is no longer free: one eye shows the open lanes for one puzzle. */
 eyes:number};
/** A run starts with two Coach's eyes and holds at most three; every third first-try solve in a row earns one back. */
export const ENDLESS_EYES=2,ENDLESS_EYES_MAX=3,ENDLESS_EYE_EVERY=3;
/** Spend one eye (the caller shows the Scan for the puzzle on the pitch). Null when there is none to spend or the run is over. */
export const spendEye=(run:EndlessRun):EndlessRun|null=>run.over||run.eyes<=0?null:{...run,eyes:run.eyes-1};
export const startEndlessRun=(seed:string):EndlessRun=>({seed,level:1,lives:ENDLESS_LIVES,score:0,solved:0,streak:0,bestStreak:0,tries:0,over:false,eyes:ENDLESS_EYES});
/** The most one puzzle can pay (solve + the taught move + first try + the streak star). */
export const ENDLESS_MAX_STARS=4;
/** Stars for a solved puzzle: 1 for the solve, 1 for playing the taught move (the passes, not just a shot), 1 for a first-try
 * solve, and 1 more on every fifth first-try solve in a row. The same scale as the authored puzzles' three stars. */
export function endlessStars(firstTry:boolean,move:boolean,streak:number){return 1+(move?1:0)+(firstTry?1:0)+(firstTry&&streak>0&&streak%5===0?1:0);}
export type EndlessEvent={kind:'solve';move:boolean}|{kind:'fail'}|{kind:'skip'};
/** Apply one result. A solve moves on; a fail costs a life and the same puzzle is served again; a skip costs a life and moves on. */
export function stepEndless(run:EndlessRun,e:EndlessEvent):{run:EndlessRun;gained:number;lifeLost:boolean;eye?:boolean}{
 if(run.over)return{run,gained:0,lifeLost:false};
 if(e.kind==='solve'){const firstTry=run.tries===0,streak=firstTry?run.streak+1:0,gained=endlessStars(firstTry,e.move,streak),eye=firstTry&&streak%ENDLESS_EYE_EVERY===0&&run.eyes<ENDLESS_EYES_MAX;
  return{run:{...run,level:run.level+1,score:run.score+gained,solved:run.solved+1,streak,bestStreak:Math.max(run.bestStreak,streak),tries:0,eyes:run.eyes+(eye?1:0)},gained,lifeLost:false,eye};}
 const lives=Math.max(0,run.lives-1),over=lives===0;
 if(e.kind==='skip')return{run:{...run,lives,over,level:over?run.level:run.level+1,streak:0,tries:0},gained:0,lifeLost:true};
 return{run:{...run,lives,over,streak:0,tries:run.tries+1},gained:0,lifeLost:true};
}
/** Seed of a run: the first run of a day is the same for everyone (the date); later runs that day get their own. */
export const endlessSeed=(date:Date,run=0)=>run>0?`${dateKey(date)}.${run}`:dateKey(date);
/** Best run kept on the device (stars, puzzles solved). */
export const ENDLESS_BEST_KEY='fi2-pass-puzzles-endless-v1';
