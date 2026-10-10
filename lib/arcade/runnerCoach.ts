import {RUNNER_SKILLS,RUNNER_SKILL_FOR,runnerContactTime,runnerSkillTarget,type RunnerGame,type RunnerObject} from './runnerGame';

/**
 * Breakaway Run first-run coach (Oct 10 2026): teach by doing, not by reading.
 *
 * Kids aged 7-12 skip the help paragraph. Instead, the first time each core decision comes up, the
 * game eases into slow motion, names the ONE action in big words and lights the ONE button to press:
 *  - lane:  a defender stands in your lane and the space is beside you → swipe into the open lane;
 *  - jump:  a low slide tackle is coming at you → jump it;
 *  - skill: a defender is close enough to beat with a skill move → tap the named move;
 *  - shoot: you are lined up with the goal's gold gap → shoot.
 * A beat ends when the player acts (or the moment passes). It is marked learned only when the player
 * actually does it, and each beat is offered in at most RUNNER_COACH.runs runs, so it never nags.
 *
 * Heat: pure state + a few comparisons per simulation frame, no allocation in the steady state, no loop
 * of its own. Storage is written only when a beat completes or is first offered in a run.
 */
export type RunnerCoachBeat='lane'|'jump'|'skill'|'shoot';
export type RunnerCoachButton=''|'left'|'right'|'jump'|'skill'|'shoot';
/** scale: slow-motion time scale per beat; ease: seconds to ramp in/out; hold: max real seconds of slow motion
 * per beat; runs: runs in which an unlearned beat is offered.
 * The jump beat snaps in (no ease): a hurdle counts when the runner is ≥0.9 m up at the tackle's first contact,
 * so a press at contact time ~0.07-0.65 s clears it. It opens at 0.5 s (well inside), so even a slow reaction lands. */
export const RUNNER_COACH={scale:{lane:.35,jump:.25,skill:.3,shoot:.35},ease:.12,hold:2.4,runs:2,jumpFrom:.5,jumpTo:.12} as const;
export const RUNNER_COACH_BEATS:readonly RunnerCoachBeat[]=['lane','jump','skill','shoot'];
export type RunnerCoachProgress={done:RunnerCoachBeat[];offered:Partial<Record<RunnerCoachBeat,number>>};
const KEY='fi2-runner-coach-v1';
let cache:RunnerCoachProgress|null=null;
export function readRunnerCoach():RunnerCoachProgress{
 if(cache)return cache;
 let value:RunnerCoachProgress={done:[],offered:{}};
 try{const raw=typeof localStorage!=='undefined'?localStorage.getItem(KEY):null;if(raw){const v=JSON.parse(raw);
  value={done:Array.isArray(v?.done)?v.done.filter((b:string)=>(RUNNER_COACH_BEATS as readonly string[]).includes(b)):[],offered:{}};
  for(const b of RUNNER_COACH_BEATS){const n=Number(v?.offered?.[b]);if(Number.isFinite(n)&&n>0)value.offered[b]=Math.floor(n);}}}catch{/* storage optional */}
 return cache=value;
}
function save(p:RunnerCoachProgress){cache=p;try{localStorage.setItem(KEY,JSON.stringify(p));}catch{/* storage optional */}}
/** Test hook: forget the cached progress (and optionally set it). */
export function resetRunnerCoach(p?:RunnerCoachProgress){cache=p?{done:[...p.done],offered:{...p.offered}}:null;}
/** True while a beat is still worth offering: not learned and not yet offered in RUNNER_COACH.runs runs. */
export function runnerCoachWanted(beat:RunnerCoachBeat,p=readRunnerCoach()){return!p.done.includes(beat)&&(p.offered[beat]??0)<RUNNER_COACH.runs;}

type CoachRun={runId:number;offered:Set<RunnerCoachBeat>;target:RunnerObject|undefined;held:number;baseline:number;kind:RunnerCoachBeat|''};
const runs=new WeakMap<RunnerGame,CoachRun>();
function coachRun(s:RunnerGame){let r=runs.get(s);if(!r||r.runId!==s.runId){r={runId:s.runId,offered:new Set(),target:undefined,held:0,baseline:0,kind:''};runs.set(s,r);}return r;}
const LANES=[-1,0,1] as const;
const objX=(o:RunnerObject)=>o.x??o.lane*2.4;
const blocks=(o:RunnerObject)=>(o.kind==='defender'||o.kind==='cone')&&!o.passed&&!o.beaten&&!o.knock;
/** The lane beside the runner with no obstacle near this line (prefers the ball trail's lane). */
function openLaneBeside(s:RunnerGame,z:number){
 let best=0,bestScore=-1;
 for(const lane of LANES){if(lane===s.lane||Math.abs(lane-s.lane)>1)continue;let clear=true;
  for(const o of s.objects)if(blocks(o)&&Math.abs(o.z-z)<4&&Math.abs(objX(o)-lane*2.4)<1.3){clear=false;break;}
  if(!clear)continue;const score=lane===s.readLane?2:1;if(score>bestScore){best=lane;bestScore=score;}}
 return bestScore<0?0:best;
}
/** Monotonic counter of the action a beat teaches; the beat is learned once it moves. */
function counter(s:RunnerGame,beat:RunnerCoachBeat){return beat==='lane'?s.cuts:beat==='jump'?s.jumps:beat==='skill'?s.skills:s.goals+s.shotsFired;}
/** Find a fresh moment for an unlearned beat. Order matters: the lane lesson comes first. */
const wantedNow=(beat:RunnerCoachBeat,p:RunnerCoachProgress,offered:ReadonlySet<RunnerCoachBeat>)=>!offered.has(beat)&&runnerCoachWanted(beat,p);
function findBeat(s:RunnerGame,p:RunnerCoachProgress,offered:ReadonlySet<RunnerCoachBeat>):{beat:RunnerCoachBeat;target:RunnerObject;prompt:string;button:RunnerCoachButton;word:string}|null{
 if(wantedNow('shoot',p,offered)&&s.balls>0){
  for(const o of s.objects)if(o.kind==='goal'&&!o.passed&&!o.keeper&&o.z>-20&&o.z<-10&&Math.abs(s.x-o.openLane*2.4)<.65)return{beat:'shoot',target:o,prompt:'TAP SHOOT · score through the gold gap!',button:'shoot',word:'SHOOT!'};
 }
 for(const o of s.objects){
  if(!blocks(o)||o.z<-17||o.z>-2||Math.abs(objX(o)-s.x)>1.2)continue;
  if(o.kind==='defender'&&o.role==='tackler'&&wantedNow('jump',p,offered)&&!runnerCoachWanted('lane',p)&&!s.jumping&&(o.tackle??0)>0){const t=runnerContactTime(s,o);if(t<=RUNNER_COACH.jumpFrom&&t>=RUNNER_COACH.jumpTo)
   return{beat:'jump',target:o,prompt:'JUMP! Hop over the low slide tackle',button:'jump',word:'JUMP!'};continue;}
  if(wantedNow('lane',p,offered)&&o.z<-8){const lane=openLaneBeside(s,o.z);if(lane!==s.lane&&Math.abs(lane-s.lane)===1){const right=lane>s.lane;
   return{beat:'lane',target:o,prompt:`SWIPE ${right?'→':'←'} · run into the open space!`,button:right?'right':'left',word:right?'MOVE →':'← MOVE'};}}
 }
 if(wantedNow('skill',p,offered)&&!runnerCoachWanted('lane',p)&&s.balls>0&&!s.jumping&&s.slide<=0&&s.skillCooldown<=0&&!s.skill){
  const t=runnerSkillTarget(s);if(t&&t.role!=='tackler'&&t.role!=='line'){const time=runnerContactTime(s,t);
   if(time<=.6&&time>=.2){const label=RUNNER_SKILLS[RUNNER_SKILL_FOR[t.role??'jockey']].label;return{beat:'skill',target:t,prompt:`TAP ${label.toUpperCase()} · beat the defender!`,button:'skill',word:`${label.toUpperCase()}!`};}}
 }
 return null;
}
/** Call once per frame with REAL (unscaled) seconds, before the simulation tick. Sets s.coach* fields:
 * the prompt and button the HUD shows, the 3D word the fx layer pops, and the time scale to apply. */
export function tickRunnerCoach(s:RunnerGame,dt:number){
 const r=coachRun(s);dt=Math.max(0,Math.min(dt,.1));
 if(s.lives<=0||s.outro>0){s.coach='';s.coachPrompt='';s.coachButton='';s.coachScale=1;r.kind='';r.target=undefined;return;}
 const p=readRunnerCoach();
 if(r.kind){
  const t=r.target,done=counter(s,r.kind)>r.baseline,beaten=r.kind==='lane'?!!t&&Math.abs(objX(t)-s.x)>1.6:r.kind==='skill'?!!t?.beaten:false;
  const gone=!t||t.passed||!!t.knock||t.z>-.5||s.hurt>0||(r.kind==='shoot'&&s.balls<=0);
  if(done||beaten){if(!p.done.includes(r.kind))save({done:[...p.done,r.kind],offered:p.offered});end(s,r);}
  else if(gone)end(s,r);
  else r.held+=dt;
 }
 // Steady state for a player who has learned everything: one short loop, no search.
 let open=false;for(const b of RUNNER_COACH_BEATS)if(!r.offered.has(b)&&runnerCoachWanted(b,p)){open=true;break;}
 if(open&&!r.kind&&s.hurt<=0&&s.recover<=0){const found=findBeat(s,p,r.offered);
  if(found){
   r.kind=found.beat;r.target=found.target;r.held=0;r.baseline=counter(s,found.beat);r.offered.add(found.beat);
   save({done:p.done,offered:{...p.offered,[found.beat]:(p.offered[found.beat]??0)+1}});
   s.coach=found.beat;s.coachPrompt=found.prompt;s.coachButton=found.button;s.coachWord=found.word;s.coachCount++;
   if(found.beat==='jump')s.coachScale=RUNNER_COACH.scale.jump;}
 }
 const slow=!!r.kind&&r.held<RUNNER_COACH.hold;
 const k=1-Math.exp(-dt/RUNNER_COACH.ease*2.3);s.coachScale+=((slow&&r.kind?RUNNER_COACH.scale[r.kind]:1)-s.coachScale)*k;
 if(Math.abs(s.coachScale-1)<.005)s.coachScale=1;
}
function end(s:RunnerGame,r:CoachRun){r.kind='';r.target=undefined;r.held=0;s.coach='';s.coachPrompt='';s.coachButton='';}
