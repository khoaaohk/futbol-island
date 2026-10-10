'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {PuzzleSnapshot} from '@/lib/passPuzzle/types';
import {appendStroke,createPointerFilter,filterPointer,type PointerFilter} from '@/lib/passPuzzle/drawing';
import type {PassControlMode} from '@/lib/passPuzzle/stroke';
import {BackButton} from '../BackButton';
import {Icon} from '../Icon';
import {createPuzzle,readStroke,predict,replay as replayAttempt,type Scenario,type Format,type PuzzleWorld,type PuzzleEvent,type StrokePoint,type Kick,type Prediction,type Replay} from '@/lib/passPuzzle';
import {youthScenario,usesHeading,YOUTH_PACK_BLURB} from '@/lib/passPuzzle/youth';
import {ALL_SCENARIOS,ALL_PACKS,ALL_SOLUTIONS,DAILY_TEMPLATES,routeFor,packGateOpen,pips,nextOnMap} from '@/lib/passPuzzle/catalog';
import {scanLanes,shutLanes} from '@/lib/passPuzzle/scan';
import {coachRun} from '@/lib/passPuzzle/coach';
import {dailyPuzzle} from '@/lib/passPuzzle/daily';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';
import {puzzleStrike,puzzleTouch,puzzlePassChime,puzzleWhistle,puzzleStar} from '@/lib/arcade/passPuzzleAudio';

import {FIRST_TIME} from '@/lib/passPuzzle/sim';
import {createPassPuzzleScene,shirtNumbersFor,type PassPuzzleScene} from '@/lib/arcade/passPuzzleScene';
import {laneStatus,laneWords,noteFor,explainSuccess,explainFail,replayCall,type LaneStatus,type PassNote,type Numbers} from '@/lib/passPuzzle/explain';
import {isCall,type Step} from '@/lib/passPuzzle/packs';
import {frameCapSlot} from '@/lib/town/frameCap';
import {isSoundEnabled,getSoundVolume} from '@/lib/games/sound';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {beginArcadeRun,recordPuzzleBest} from '@/lib/arcade/arcadeWallet';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {loadIdp,goalById} from '@/lib/coaches/idp';
import arcade from './ArcadeGame3D.module.css';
import styles from './PassPuzzleGame.module.css';

const SCENARIOS=ALL_SCENARIOS,PACKS=ALL_PACKS;
/** Daily remix of a learned idea, built (and engine-checked) only when the child opens it. */
let dailyCache:ReturnType<typeof dailyPuzzle>|undefined;
const todaysDaily=()=>{if(dailyCache===undefined){try{dailyCache=dailyPuzzle(DAILY_TEMPLATES,new Date());}catch{dailyCache=null;}}return dailyCache;};
const levelById=(id:string)=>SCENARIOS.find(s=>s.id===id)??(todaysDaily()?.scenario.id===id?todaysDaily()!.scenario:undefined);

/** Pass Puzzles: freeze the moment, draw the pass, watch it play out. Every level teaches one idea. */
const PROGRESS_KEY='fi2-pass-puzzles-v1';
/** heading: the child's explicit choice; undefined = the default (no heading in 7v7, US Soccer under-11 rule). */
type Progress={stars:Record<string,number>;masks?:Record<string,number>;format?:Format;heading?:boolean;
 /** the child's own Scan choice (undefined = on in the first packs, where looking up is the lesson) */
 scan?:boolean};
type View='levels'|'brief'|'play'|'result';
/** Three mastery stars, Cut-the-Rope style skill goals (no first-try pressure): bit 1 solve, 2 the taught move, 4 the bonus. */
type Outcome={success:boolean;stars:number;mask:number;fresh:number;passes:number;bonus:boolean;move:boolean;reason?:string;attemptsLeft:number;
 /** the coach's takeaway: why the move worked, or why it didn't and what to try */
 why:string[];fix?:string};
const STAR_SOLVE=1,STAR_MOVE=2,STAR_BONUS=4;const starCount=(m:number)=>(m&1)+(m>>1&1)+(m>>2&1);
const FORMATS:Format[]=['7v7','9v9','11v11'];
const RUN_GRAB=1.4,BALL_GRAB=2.2,RESULT_SETTLE_MS=1700,REPLAY_SPEED=.38,HOLD_LOFT_SECONDS=1.1,MIN_STROKE_METRES=1.2;

function readProgress():Progress{try{const v=JSON.parse(localStorage.getItem(PROGRESS_KEY)??'null');if(v&&typeof v==='object'&&v.stars&&typeof v.stars==='object'){const stars:Record<string,number>={};for(const [k,n] of Object.entries(v.stars))if(typeof n==='number'&&n>=0&&n<=3)stars[k]=Math.round(n);const masks:Record<string,number>={};if(v.masks&&typeof v.masks==='object')for(const [k,n] of Object.entries(v.masks))if(typeof n==='number'&&n>=0&&n<=7)masks[k]=n|0;return{stars,masks,format:FORMATS.includes(v.format)?v.format:undefined,heading:typeof v.heading==='boolean'?v.heading:undefined,scan:typeof v.scan==='boolean'?v.scan:undefined};}}catch{}return{stars:{}};}
function writeProgress(p:Progress){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(p));}catch{/* Private browsing keeps this visit's stars. */}}
/** The child's own format from their development plan when they have one; 9v9 otherwise. */
function childFormat():Format|undefined{try{const goal=loadIdp().plan?.goalId;const f=goal?goalById(goal)?.format:undefined;return f&&(FORMATS as string[]).includes(f)?f as Format:undefined;}catch{return undefined;}}
const reasonCopy:Record<string,string>={offside:'Offside! Your teammate was past the last defender when the ball was played. Wait for them, or pass sooner.',intercept:'A defender got to it first.',save:'The keeper read it.',out:'That one ran out of play.',rest:'The ball stopped before anyone reached it.','too-few-passes':'Right idea, but this one needs more passes first.',timeout:'Too slow! The defence got back before the finish.'};
const headingAllowed=(p:Progress,f:Format)=>p.heading??f!=='7v7';
/** The puzzle as played: direct shots allowed, and the no-heading youth version when heading is off. */
const playable=(s:Scenario,heading=true):Scenario=>{const base=heading?s:youthScenario(s);return{...base,require:{...base.require,allowDirectShot:base.require.finish==='goal'}};};
const packInfo=(pack:string)=>PACKS.find(p=>p.id===pack);
/** Packs where the Scan starts switched on until the child chooses: looking up is the lesson there. */
const SCAN_FIRST=new Set(['first-passes','see-the-space']);

export default function PassPuzzleGame({onExit}:{onExit:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),sceneRef=useRef<PassPuzzleScene|null>(null),worldRef=useRef<PuzzleWorld|null>(null),replayRef=useRef<Replay|null>(null);
 const wake=useRef(()=>{}),audio=useRef<AudioContext|null>(null);
 const [controlMode,setControlMode]=useState<PassControlMode>('auto'),[power,setPower]=useState<number|null>(null),[shotHeight,setShotHeight]=useState(0);
 const controls=useRef<{mode:PassControlMode;power?:number;shotHeight?:number}>({mode:'auto',shotHeight:0}),powerSlider=useRef<HTMLInputElement>(null);
 const stroke=useRef<{filter:PointerFilter;bounds:DOMRect;holdX:number;holdY:number;id:number;points:StrokePoint[];lastMove:number;kick:Kick|null;prediction:Prediction|null;dirty:boolean;predictionAt:number;screenX:number;screenY:number;run?:number}|null>(null);
 const coinVisit=useRef(''),coinAttempt=useRef(''),entry=useArcadeEntry('puzzle');
 const rewindPoint=useRef<PuzzleSnapshot|null>(null),rewound=useRef(false);
 const cancelDrawing=useRef(()=>{});
 const [packId,setPackId]=useState('first-passes');
 const attemptEvents=useRef<PuzzleEvent[]>([]),resultAt=useRef(0),settleUntil=useRef(0),viewRef=useRef<View>('levels');
 const [progress,setProgress]=useState<Progress>({stars:{}}),[format,setFormat]=useState<Format>('9v9'),progressRef=useRef(progress);progressRef.current=progress;
 const [levelId,setLevelId]=useState<string>(SCENARIOS[0]?.id??''),[view,setViewState]=useState<View>('levels');
 const [hud,setHud]=useState({attempt:1,attempts:3,passes:0,phase:'aiming' as string});
 const [outcome,setOutcome]=useState<Outcome|null>(null),[replaying,setReplaying]=useState(false),[showHint,setShowHint]=useState(false),[error,setError]=useState(false);
 const loftMeter=useRef<HTMLDivElement>(null);
 /** The chosen pack's puzzle grid (scrolled into view when a pack is picked on a phone). */
 const packList=useRef<HTMLDivElement>(null);
 /** Live warning while drawing (only changes re-render): the predicted receiver would be offside. */
 const [aimWarn,setAimWarn]=useState<null|'offside'>(null),aimWarnRef=useRef<null|'offside'>(null);
 const warn=(w:null|'offside')=>{if(aimWarnRef.current!==w){aimWarnRef.current=w;setAimWarn(w);}if(!w)lane(null);};
 /** The coach's live read of the drawn pass (clear / tight / blocked …), re-rendered only when it changes. */
 const [laneRead,setLaneRead]=useState<{status:LaneStatus;text:string}|null>(null),laneRef=useRef('');
 const lane=(v:{status:LaneStatus;text:string}|null)=>{const key=v?v.status+v.text:'';if(laneRef.current!==key){laneRef.current=key;setLaneRead(v);}};
 /** One note per kick of this attempt (what the release looked like), for the takeaway. */
 const notes=useRef<PassNote[]>([]),numbersRef=useRef<Numbers>({attackers:[],defenders:[],keeper:1}),formatRef=useRef<Format>('9v9');
 /** Replay commentary: the current call and the inputs it reads receivers and runs from. */
 const [replayLine,setReplayLine]=useState(''),replayInputs=useRef<{kick:Kick;calls?:{attacker:number}[]}[]>([]),replayKicks=useRef(0),replayHold=useRef(0);
 /** Hints in tiers: 1 = the words, 2 = a glowing spot on the pitch for the next pass of the coach's route. */
 const [spotHint,setSpotHint]=useState(false),spotHintRef=useRef(false);spotHintRef.current=spotHint;const applyHint=useRef(()=>{}),applyScan=useRef(()=>{});
 const heading=headingAllowed(progress,format),headingRef=useRef(heading);headingRef.current=heading;formatRef.current=format;
 const baseLevel=useMemo(()=>levelById(levelId)??SCENARIOS[0],[levelId]);
 /** What the child reads and plays: the youth (no-heading) version when heading is off. */
 const level=useMemo(()=>baseLevel&&!heading?youthScenario(baseLevel):baseLevel,[baseLevel,heading]);
 const numbers=useMemo(()=>level?shirtNumbersFor(level):{attackers:[],defenders:[],keeper:1},[level]);numbersRef.current=numbers;
 const packs=useMemo(()=>{const map=new Map<string,Scenario[]>();for(const s of SCENARIOS){if(!map.has(s.pack))map.set(s.pack,[]);map.get(s.pack)!.push(s);}return [...map.entries()].sort((a,b)=>(packInfo(a[0])?.order??9)-(packInfo(b[0])?.order??9));},[]);
 const setView=(v:View)=>{cancelDrawing.current();warn(null);if(v==='result')resultAt.current=performance.now();viewRef.current=v;setViewState(v);};

 useEffect(()=>{const p=readProgress();setProgress(p);setFormat(p.format??childFormat()??'9v9');},[]);
 const chooseFormat=(f:Format)=>{setFormat(f);setProgress(p=>{const next={...p,format:f};writeProgress(next);return next;});};
 const chooseHeading=(on:boolean)=>setProgress(p=>{const next={...p,heading:on};writeProgress(next);return next;});

 // ── sound: short gesture-unlocked blips like the other arcade games, no sustained source ──
 const unlock=()=>{if(!isSoundEnabled()||getSoundVolume()===0)return;try{audio.current??=new AudioContext();void audio.current.resume();}catch{}};
 // Contact voices distinguish a cushioned header, blocked lane and completed combination.
 const hitStop=useRef(0),chimed=useRef(0),aimSince=useRef(0);
 const handleEvent=useCallback((e:PuzzleEvent)=>{
  sceneRef.current?.onEvent(e);const ctx=audio.current;
  if(replayRef.current){const i=replayKicks.current,inputs=replayInputs.current,line=replayCall(e,numbersRef.current,k=>inputs[k]?.kick.receiver,i,(inputs[i]?.calls??[]).map(c=>c.attacker));if(e.type==='kick')replayKicks.current++;if(line)setReplayLine(line);
   // Freeze-frame on the moment that decided it, so the call can be read.
   if(['intercept','deflect','save','goal','offside'].includes(e.type))replayHold.current=performance.now()+(sceneRef.current?.stage.reduced?350:700);}
  // Contact beats: a hair of hit-stop on the strike and the goal (none with reduced motion).
  if((e.type==='kick'||e.type==='goal')&&!sceneRef.current?.stage.reduced)hitStop.current=performance.now()+(e.type==='goal'?90:45);
  if(e.type==='kick'){if(((replayRef.current?.world??worldRef.current)?.state.passes??0)===0)chimed.current=0;puzzleStrike(ctx,e.speed??10,e.kind??'pass');if(e.kind==='shot')arcadeFeedback(null,'shot');return;}
  if(e.type==='receive'){puzzleTouch(ctx,e.touch);const w=replayRef.current?.world??worldRef.current;const n=w?.state.passes??0;if(n>chimed.current)puzzlePassChime(ctx,n);chimed.current=n;return;}
  if(e.type==='heavy_touch'){puzzleTouch(ctx,e.touch,true);return;}
  if(e.type==='offside'){puzzleWhistle(ctx);return;}
  const cue=e.type==='goal'?'goal':e.type==='save'||e.type==='parry'?'save':e.type==='intercept'||e.type==='deflect'?'block':'miss';
  arcadeFeedback(ctx,cue);
 },[]);

 const syncHud=()=>{const s=worldRef.current?.state;if(!s)return;setHud(h=>h.attempt===s.attempt&&h.passes===s.passes&&h.phase===s.phase&&h.attempts===(worldRef.current?.scenario.attempts??3)?h:{attempt:s.attempt,attempts:worldRef.current!.scenario.attempts,passes:s.passes,phase:s.phase});};

 const finish=useCallback(()=>{
  const world=worldRef.current;if(!world?.state.result)return;const r=world.state.result,s=world.state,success=r.outcome==='success',sc=world.scenario,id=sc.id;
  if(success&&sc.require.finish==='reach-zone')arcadeFeedback(audio.current,'level');
  // The move = the taught route (enough passes, not the direct-shot bypass); the bonus is the mastery goal.
  const move=success&&r.passes>=sc.require.minPasses,mask=success?STAR_SOLVE|(move?STAR_MOVE:0)|(r.bonus?STAR_BONUS:0):0;
  const before=progressRef.current.masks?.[id]??0,merged=before|mask,fresh=mask&~before,stars=Math.max(starCount(merged),progressRef.current.stars[id]??0);
  if(success&&coinAttempt.current&&!id.startsWith('daily-'))void recordPuzzleBest(id,stars,coinAttempt.current,coinVisit.current);
  if(success){setProgress(p=>{const next={...p,stars:{...p.stars,[id]:Math.max(p.stars[id]??0,stars)},masks:{...p.masks,[id]:(p.masks?.[id]??0)|mask}};writeProgress(next);return next;});
   [STAR_SOLVE,STAR_MOVE,STAR_BONUS].filter(b=>mask&b).forEach((_,i)=>puzzleStar(audio.current,i+1,.85+i*.22));}
  let why:string[]=[],fix:string|undefined;
  try{const nums=shirtNumbersFor(sc),f=formatRef.current,kept=notes.current.slice(0,world.inputs().length);
   if(success)why=explainSuccess(kept,sc,nums,f,2);
   else{const stop=attemptEvents.current.filter(e=>['intercept','deflect','save','parry','offside'].includes(e.type)).at(-1),x=explainFail(r.reason,stop,kept.at(-1),nums,f);if(x){why=[x.why];fix=x.fix;}}}catch{/* the generic copy stays */}
  setOutcome({success,stars:starCount(mask),mask,fresh,passes:r.passes,bonus:r.bonus,move,reason:r.reason,attemptsLeft:s.attemptsLeft,why,fix});setView('result');stroke.current=null;
 },[]);

 /** The scan of the current aim, cached: the Scan display and the release's takeaway share one set of predictions. */
 const scanCache=useRef<{key:string;world:PuzzleWorld|null;lanes:ReturnType<typeof scanLanes>}>({key:'',world:null,lanes:[]});
 const lanesNow=(world:PuzzleWorld)=>{const s=world.state,key=`${s.attempt}:${s.chain.length}:${s.carrier}:${s.tick-Math.round(s.aimTime*120)}:${s.attackers.map(a=>a.call?`${a.call.to.x},${a.call.to.z}`:'').join('|')}`,c=scanCache.current;
  if(c.world===world&&c.key===key)return c.lanes;const lanes=scanLanes(world);scanCache.current={key,world,lanes};return lanes;};
 /** The release, remembered for the takeaway: one prediction (memoised from the aim) and a few distances. */
 const takeNote=(world:PuzzleWorld,kick:Kick):PassNote=>{const s=world.state;let p:Prediction|null=null;try{p=predict(world,kick);}catch{}
  const calls=s.attackers.map((a,i)=>a.call&&a.call.startAt==null?i:-1).filter(i=>i>=0);
  const note=noteFor(s,kick,p,calls,s.chain.length>0&&(performance.now()-aimSince.current)/1000<=FIRST_TIME);
  try{note.shut=shutLanes(lanesNow(world));}catch{/* the takeaway works without it */}return note;};
 // ── one render loop that runs only while something moves ──
 useEffect(()=>{
  const el=canvas.current;if(!el)return;let scene:PassPuzzleScene;try{scene=createPassPuzzleScene(el);sceneRef.current=scene;}catch{setError(true);return;}
  let frame=0,last=0,slot=0,disposed=false,thinkingUntil=0;const interval=1000/(scene.stage.mobile?30:60);
  const draw=(now:number)=>{frame=0;if(disposed||document.hidden)return;const next=frameCapSlot(now,slot,viewRef.current==='play'&&worldRef.current?.state.phase==='aiming'&&!stroke.current?1000/15:interval);if(next<0){frame=requestAnimationFrame(draw);return;}slot=next;const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
   const world=worldRef.current;if(!world){scene.render();return;}
   let busy=false,state=world.state;const rep=replayRef.current;
   if(rep){for(const e of rep.advance(now<hitStop.current||now<replayHold.current?0:dt))handleEvent(e);state=rep.world.state;
    const key=attemptEvents.current.filter(e=>e.type!=='kick'&&e.type!=='receive').at(-1)??attemptEvents.current.at(-1);
    if(playerView.current)scene.followPlayer(state,dt);
    else if(key&&!coachReplay.current){const lead=key.t-state.t,amount=Math.max(0,Math.min(1,1-lead/1.4));scene.setReplayFocus({x:key.at.x,z:key.at.z},amount*amount*(3-2*amount));}
    busy=!rep.done||now<replayHold.current;if(rep.done&&now>=replayHold.current){replayRef.current=null;scene.setReplayRuns(false);scene.followPlayer(null,0);scene.setReplayFocus(null);setReplaying(false);state=world.state;scene.update(state,0);}
   }else if(viewRef.current==='play'&&(state.phase==='windup'||state.phase==='flight')){world.step(now<hitStop.current?0:dt);for(const e of world.drain()){attemptEvents.current.push(e);handleEvent(e);}state=world.state;busy=true;
    if(state.phase==='aiming'){thinkingUntil=now+4000;aimSince.current=now;scene.setCalls(state,null);scene.setAim(null,state);applyHint.current();applyScan.current();syncHud();}
    if(state.phase==='success'||state.phase==='fail'){syncHud();settleUntil.current=now+900;finish();}
   }else if(state.phase==='aiming'){
    // One-touch window: a shrinking ring around the new carrier while a first-time finish still counts.
    const left=FIRST_TIME-(now-aimSince.current)/1000,clock=viewRef.current==='play'&&state.chain.length>0&&world.scenario.bonus?.kind==='first-time'&&left>0?left/FIRST_TIME:null;
    scene.setClock(clock,state);if(clock!==null)busy=true;
    const st=stroke.current;
    if(st&&st.run!==undefined){scene.setCalls(state,{from:st.run,to:st.points.at(-1)!});busy=true;}
    else if(st){const tail=st.points.at(-1)!,held=now/1000-st.lastMove;
     if(now-st.predictionAt>=80&&(st.dirty||held>.2&&held<1.2)){st.predictionAt=now;st.dirty=false;const points=held>.02?[...st.points,{x:tail.x,z:tail.z,t:now/1000}]:st.points;try{st.kick=points.length>1?readStroke(points,world,controls.current):null;st.prediction=st.kick?predict(world,st.kick):null;}catch{st.kick=null;st.prediction=null;}warn(st.prediction?.end==='offside'?'offside':null);
      const status=laneStatus(st.prediction);lane(status&&st.prediction?{status,text:laneWords(status,st.prediction,numbersRef.current,formatRef.current)}:null);
      scene.setAim({prediction:st.prediction,receiver:st.kick?.receiver,loft:st.kick?.loft??0,stroke:st.points,status:status??undefined},state);}
     if(controls.current.power===undefined&&st.kick&&powerSlider.current)powerSlider.current.value=String(Math.round(st.kick.power*100/5)*5);
     const loft=st.kick?.loft??0,meter=loftMeter.current;if(meter){meter.style.setProperty('--loft',String(loft));meter.dataset.active=String(controls.current.mode==='auto'&&held>.12&&!!st.kick);}
     if(st.dirty||held<HOLD_LOFT_SECONDS+.1)busy=true;
    }
   }
   // A short scan after input makes the defence feel attentive, then the
   // undecided puzzle sleeps instead of warming a phone indefinitely.
   const idleThinking=viewRef.current==='play'&&state.phase==='aiming'&&(now<thinkingUntil||!!stroke.current&&now/1000-stroke.current.lastMove<1.3);
   const animating=scene.update(state,dt,idleThinking);if(idleThinking&&!scene.stage.reduced)busy=true;
   scene.render();el.dataset.frames=String(Number(el.dataset.frames??0)+1);el.dataset.wake=`${+busy}${+animating}${+(now<settleUntil.current)}`;
   // The result card is a hard stop: a short settle for the last reactions, then no frames at all.
   const stopped=viewRef.current==='levels'||viewRef.current==='brief'||viewRef.current==='result'&&!replayRef.current&&now-resultAt.current>RESULT_SETTLE_MS;
   if(!stopped&&(busy||animating||now<settleUntil.current))frame=requestAnimationFrame(draw);else{last=0;slot=0;}
  };
  wake.current=()=>{thinkingUntil=performance.now()+4000;if(!disposed&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);};
  const visibility=()=>{if(!document.hidden)wake.current();else{cancelAnimationFrame(frame);frame=0;last=0;slot=0;}};
  const observer=new ResizeObserver(()=>{cancelDrawing.current();scene.fit();wake.current();});observer.observe(el);document.addEventListener('visibilitychange',visibility);
  // Pointer: a stroke always starts at the ball, so a small thumb never misses it.
  const down=(e:PointerEvent)=>{const world=worldRef.current;if(e.button!==0||!world||replayRef.current||viewRef.current!=='play'||world.state.phase!=='aiming'||stroke.current)return;const bounds=el.getBoundingClientRect(),p=scene.pick(e.clientX,e.clientY,bounds);if(!p)return;e.preventDefault();unlock();el.setPointerCapture(e.pointerId);const b=world.state.ball.p,t=performance.now()/1000;
   // Starting on a teammate (away from the ball) drags their run instead of a pass: movement first, then the pass.
   let run:number|undefined,best=RUN_GRAB;if(Math.hypot(p.x-b.x,p.z-b.z)>BALL_GRAB)world.state.attackers.forEach((a,i)=>{const d=Math.hypot(a.p.x-p.x,a.p.z-p.z);if(i!==world.state.carrier&&d<best){best=d;run=i;}});
   const from=run!==undefined?world.state.attackers[run].p:b;
   scene.setScan(null);stroke.current={filter:createPointerFilter(e.clientX,e.clientY,e.timeStamp),bounds,holdX:e.clientX,holdY:e.clientY,id:e.pointerId,points:[{x:from.x,z:from.z,t:t-.001},{x:p.x,z:p.z,t}],lastMove:t,kick:null,prediction:null,dirty:true,predictionAt:0,screenX:e.clientX,screenY:e.clientY,run};if(run===undefined)placeMeter(e);wake.current();};
  const sample=(e:PointerEvent,force=false)=>{const st=stroke.current;if(!st||st.id!==e.pointerId)return;
   const filtered=filterPointer(st.filter,e.clientX,e.clientY,e.timeStamp),x=force?e.clientX:filtered.x,y=force?e.clientY:filtered.y;
   if(!force&&Math.hypot(x-st.screenX,y-st.screenY)<.65)return;
   const p=scene.pick(x,y,st.bounds);if(!p||!Number.isFinite(p.x+p.z))return;
   // Coalesced samples keep their own time instead of all receiving the
   // frame's timestamp; hold duration and gesture speed stay consistent.
   const t=Math.max(st.points.at(-1)!.t,Math.min(performance.now()/1000,e.timeStamp/1000));
   if(Math.hypot(e.clientX-st.holdX,e.clientY-st.holdY)>5){st.lastMove=t;st.holdX=e.clientX;st.holdY=e.clientY;}
   appendStroke(st.points,{x:p.x,z:p.z,t});st.screenX=x;st.screenY=y;st.dirty=true;
  };
  const move=(e:PointerEvent)=>{if(stroke.current?.id!==e.pointerId)return;e.preventDefault();const samples=e.getCoalescedEvents?.()??[];for(const point of samples.slice(-8))sample(point);sample(e);placeMeter(e);wake.current();};
  const up=(e:PointerEvent)=>{const st=stroke.current,world=worldRef.current;if(!st||st.id!==e.pointerId||!world)return;warn(null);sample(e,true);stroke.current=null;hideMeter();if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
   if(st.run!==undefined){const a=world.state.attackers[st.run],end=st.points.at(-1)!,len=a?Math.hypot(end.x-a.p.x,end.z-a.p.z):0;
    if(len>=1.5){if(world.callRun(st.run,{x:end.x,z:end.z}))puzzleTouch(audio.current,'feet');}else if(a?.call)world.callRun(st.run,null);/* a tap on a runner cancels their run */
    scene.setCalls(world.state,null);applyScan.current();settleUntil.current=performance.now()+300;wake.current();return;}
   const t=performance.now()/1000,tail=st.points.at(-1)!,points=[...st.points,{x:tail.x,z:tail.z,t}],length=Math.hypot(tail.x-points[0].x,tail.z-points[0].z);
   let kick:Kick|null=null;try{kick=length>=MIN_STROKE_METRES?readStroke(points,world,controls.current):null;}catch{kick=null;}
   scene.setAim(null,world.state);scene.setClock(null,world.state);if(kick){const snapshot=world.snapshot();
    // The frozen world still keeps the thinking time honest: it decides the first-time bonus.
    for(let left=Math.min(4,(performance.now()-aimSince.current)/1000);left>1e-4;left-=.25)world.step(Math.min(.25,left));
    const note=takeNote(world,kick);if(world.kick(kick)){rewindPoint.current=snapshot;notes.current[world.inputs().length-1]=note;syncHud();}}if(world.state.phase==='aiming')applyScan.current();settleUntil.current=performance.now()+400;wake.current();};
  const cancelAll=()=>{warn(null);const st=stroke.current;if(st?.run!==undefined&&worldRef.current)sceneRef.current?.setCalls(worldRef.current.state,null);stroke.current=null;hideMeter();if(st&&el.hasPointerCapture(st.id))el.releasePointerCapture(st.id);const w=worldRef.current;if(w)scene.setAim(null,w.state);applyScan.current();wake.current();};
  cancelDrawing.current=cancelAll;
  const cancel=(e:PointerEvent)=>{if(stroke.current?.id===e.pointerId)cancelAll();};
  const blur=()=>cancelAll();const hidden=()=>{if(document.hidden)cancelAll();};
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
  const placeMeter=(e:PointerEvent)=>{const m=loftMeter.current,r=stroke.current?.bounds??el.getBoundingClientRect();if(m){m.style.left=`${e.clientX-r.left}px`;m.style.top=`${e.clientY-r.top}px`;}};
  const hideMeter=()=>{const m=loftMeter.current;if(m){m.dataset.active='false';m.style.setProperty('--loft','0');}};
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);el.addEventListener('lostpointercapture',cancel);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__passPuzzle:unknown}).__passPuzzle={get world(){return worldRef.current;},get replay(){return replayRef.current;},scene,wake:()=>wake.current(),kick:(k:Kick)=>{const w=worldRef.current;if(!w)return false;const note=w.state.phase==='aiming'?takeNote(w,k):null;const ok=w.kick(k);if(ok&&note)notes.current[w.inputs().length-1]=note;syncHud();wake.current();return ok;},solution:(id:string)=>(id.startsWith('daily-')?todaysDaily()?.solution:routeFor(id,headingRef.current))?.filter(st=>!('call' in st)),route:(id:string)=>id.startsWith('daily-')?todaysDaily()?.solution:routeFor(id,headingRef.current),naive:(id:string)=>ALL_SOLUTIONS[id]?.naive[0],callRun:(i:number,x:number,z:number)=>{const w=worldRef.current;const ok=!!w&&w.callRun(i,{x,z});if(w)sceneRef.current?.setCalls(w.state);wake.current();return ok;},daily:()=>todaysDaily()};
  // The level list sits over the first puzzle's frozen pitch: one static frame, then sleep.
  if(SCENARIOS[0])try{const w=createPuzzle(playable(SCENARIOS[0],headingRef.current));worldRef.current=w;scene.load(SCENARIOS[0]);scene.update(w.state,0);}catch{/* the play button reports real failures */}
  wake.current();
  return()=>{disposed=true;cancelDrawing.current=()=>{};window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);el.removeEventListener('lostpointercapture',cancel);scene.dispose();sceneRef.current=null;worldRef.current=null;replayRef.current=null;wake.current=()=>{};void audio.current?.close();audio.current=null;delete (window as unknown as {__passPuzzle?:unknown}).__passPuzzle;};
 },[finish,handleEvent]);

 /** Build the frozen moment for a level: the pitch shows behind the brief card. */
 const loadLevel=(s:Scenario)=>{rewindPoint.current=null;rewound.current=false;notes.current=[];setSpotHint(false);spotHintRef.current=false;const scene=sceneRef.current;if(!scene)return;replayRef.current=null;setReplaying(false);stroke.current=null;attemptEvents.current=[];
  try{const played=playable(s,headingRef.current);const world=createPuzzle(played);worldRef.current=world;scene.load(played);scene.setAim(null,world.state);scene.setCalls(world.state,null);scene.update(world.state,0);}catch{setError(true);return;}
  setLevelId(s.id);setPackId(s.pack);setOutcome(null);setShowHint(false);syncHud();settleUntil.current=performance.now()+300;wake.current();};
 const openLevel=(s:Scenario)=>{loadLevel(s);setView('brief');};
 const dailyId=`daily-${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
 const openDaily=()=>{const d=todaysDaily();if(d)openLevel(d.scenario);};
 const play=async()=>{unlock();const id=await entry.enter();if(!id)return;aimSince.current=performance.now();coinVisit.current||=beginArcadeRun('puzzle');coinAttempt.current=beginArcadeRun('puzzle');recordExploreActivity('arcade');setView('play');const w=worldRef.current;if(w)sceneRef.current?.setAim(null,w.state);settleUntil.current=performance.now()+1200;wake.current();};
 const retry=async()=>{aimSince.current=performance.now();const worldBefore=worldRef.current;if(!worldBefore)return;if(worldBefore.state.attemptsLeft<=0||worldBefore.state.phase==='success'){const id=await entry.enter();if(!id)return;}rewindPoint.current=null;rewound.current=false;coinVisit.current||=beginArcadeRun('puzzle');coinAttempt.current=beginArcadeRun('puzzle');const world=worldRef.current,scene=sceneRef.current;if(!world||!scene)return;replayRef.current=null;setReplaying(false);if(!world.retry()){loadLevel(world.scenario);setView('play');return;}attemptEvents.current=[];notes.current=[];scene.resetActors();scene.update(world.state,0);scene.setAim(null,world.state);scene.setCalls(world.state,null);applyHint.current();applyScan.current();syncHud();setOutcome(null);setShowHint(true);setView('play');settleUntil.current=performance.now()+600;wake.current();};
 const rewindPass=()=>{aimSince.current=performance.now();const world=worldRef.current,scene=sceneRef.current,snapshot=rewindPoint.current;if(!world||!scene||!snapshot||rewound.current)return;cancelDrawing.current();replayRef.current=null;setReplaying(false);world.drain();world.restore(snapshot);rewound.current=true;rewindPoint.current=null;attemptEvents.current=attemptEvents.current.filter(e=>e.tick<snapshot.state.tick);notes.current.length=Math.min(notes.current.length,world.inputs().length);scene.resetActors();scene.setReplayFocus(null);scene.setAim(null,world.state);scene.setCalls(world.state,null);scene.update(world.state,0);applyHint.current();applyScan.current();setOutcome(null);setShowHint(true);syncHud();setView('play');settleUntil.current=performance.now()+600;wake.current();};
 const coachReplay=useRef(false),playerView=useRef(false),[playerCam,setPlayerCam]=useState(false),[replayKind,setReplayKind]=useState<'mine'|'coach'>('mine');
 const togglePlayerView=()=>{playerView.current=!playerView.current;setPlayerCam(playerView.current);if(!playerView.current){sceneRef.current?.followPlayer(null,0);}wake.current();};
 /** The coach's route: the taught move played the way a finger would draw it, at a calmer 0.6×. */
 const watchCoach=()=>{const world=worldRef.current;if(!world)return;try{const run=coachRun(world.scenario,levelId.startsWith('daily-')?todaysDaily()?.solution??[]:routeFor(levelId,headingRef.current));if(!run.inputs.length)return;replayRef.current=replayAttempt(run.start,run.inputs,.6);coachReplay.current=true;replayInputs.current=run.inputs;}catch{return;}startReplay();setReplayKind('coach');setReplaying(true);setView('play');wake.current();};
 const startReplay=()=>{replayKicks.current=0;replayHold.current=0;setReplayLine('');sceneRef.current?.setHint(null);sceneRef.current?.setScan(null);sceneRef.current?.setReplayRuns(true);sceneRef.current?.resetActors();};
 const watchAgain=()=>{setReplayKind('mine');coachReplay.current=false;const world=worldRef.current;if(!world)return;try{replayRef.current=replayAttempt(world.attemptStart(),world.inputs(),REPLAY_SPEED);replayInputs.current=world.inputs();}catch{return;}startReplay();setReplaying(true);setView('play');wake.current();};
 const skipReplay=()=>{const rep=replayRef.current,world=worldRef.current;if(!rep||!world)return;replayRef.current=null;replayHold.current=0;sceneRef.current?.setReplayRuns(false);sceneRef.current?.followPlayer(null,0);sceneRef.current?.setReplayFocus(null);sceneRef.current?.update(world.state,0);setReplaying(false);setView('result');wake.current();};
 /** Tier-2 hint: the next pass of the coach's route from here (and the run to call first), if the
  *  child's move still matches the route; otherwise null and the words say to start again. */
 const [hintNote,setHintNote]=useState('');
 applyHint.current=()=>{const scene=sceneRef.current,world=worldRef.current;if(!scene)return;
  if(!spotHintRef.current||!world||world.state.phase!=='aiming'||replayRef.current){scene.setHint(null);return;}
  const s=world.state,id=world.scenario.id,route:Step[]=id.startsWith('daily-')?todaysDaily()?.solution??[]:routeFor(id,headingRef.current),done=world.inputs().length,nums=numbersRef.current;
  let k=0,expect=world.scenario.carrier,calls:{attacker:number;to:{x:number;z:number}}[]=[];
  for(const st of route){if(isCall(st)){calls.push(st.call);continue;}
   if(k===done){if(s.carrier!==expect)break;const g=world.scenario.pitch,hg=g.goalWidth/2-.4;
    const spot=st.kind==='shot'?{x:Math.max(-hg,Math.min(hg,st.target.x)),z:g.length/2}:(st.kind==='pass-feet'||st.kind==='header')&&st.receiver!=null&&s.attackers[st.receiver]?{...s.attackers[st.receiver].p}:{...st.target};
    const run=calls.find(c=>!s.attackers[c.attacker]?.call);
    scene.setHint({spot,run:run&&s.attackers[run.attacker]?{from:s.attackers[run.attacker].p,to:run.to}:undefined});
    setHintNote(run?`Hint: first drag #${nums.attackers[run.attacker]} along the mint arrow, then pass to the glowing spot.`:st.kind==='shot'?'Hint: shoot at the glowing spot.':'Hint: pass to the glowing spot.');return;}
   expect=st.kind==='shot'?expect:(st.receiver??expect);calls=[];k++;}
  scene.setHint(null);setHintNote('Your move went a different way. Try again from the start to see the spot.');};
 /** "Look up": the Scan lights every simple pass on the frozen pitch (green open, amber tight, red shut). */
 const scanOn=progress.scan??SCAN_FIRST.has(level?.pack??''),scanRef=useRef(scanOn);scanRef.current=scanOn;
 applyScan.current=()=>{const scene=sceneRef.current,world=worldRef.current;if(!scene)return;
  if(!scanRef.current||viewRef.current!=='play'||!world||world.state.phase!=='aiming'||replayRef.current||stroke.current){scene.setScan(null);return;}
  try{scene.setScan(lanesNow(world));}catch{scene.setScan(null);}};
 const toggleScan=()=>{cancelDrawing.current();const on=!scanRef.current;scanRef.current=on;setProgress(p=>{const next={...p,scan:on};writeProgress(next);return next;});applyScan.current();settleUntil.current=performance.now()+120;wake.current();};
 useEffect(()=>{applyHint.current();applyScan.current();wake.current();},[spotHint,view,heading,scanOn]);
 /** The hint button steps through the tiers: the words, then the spot, then hides them. */
 const cycleHint=()=>{if(!showHint){setShowHint(true);return;}if(!spotHint){setSpotHint(true);return;}setShowHint(false);setSpotHint(false);};
 useEffect(()=>{if(!replaying&&outcome&&view==='play'&&!replayRef.current&&worldRef.current?.state.result)setView('result');},[replaying,outcome,view]);

 const unlocked=(s:Scenario,list:Scenario[])=>{const i=list.indexOf(s);return i<=0||(progress.stars[list[i-1].id]??0)>0||(progress.stars[s.id]??0)>0;};
 const totalStars=Object.values(progress.stars).reduce((a,b)=>a+b,0);
 /** "Next puzzle" follows the pack map (not the file order), and stops at a pack that is still closed. */
 const next=level?nextOnMap(level.id,totalStars):null,nextLevel=next&&'scenario' in next?next.scenario:undefined;

 /** The three star goals in words, for the brief and result cards. */
 const goals=(s:Scenario)=>['Solve the puzzle',s.require.minPasses===0?'Score with a clean shot':`Use the move: ${s.require.minPasses} pass${s.require.minPasses===1?'':'es'} first`,`Bonus: ${s.bonus?.label??'Finish first time'}`];
 const star=(on:boolean,key:number)=><span key={key} className={on?styles.starOn:styles.starOff} aria-hidden="true">★</span>;
 const briefText=level?.brief[format]??'',hintText=level?.hint[format]??'';
 /** Level modifiers, shown as chips (like a level's special rules): what is different about this pitch. */
 const modifiers=(s:Scenario|undefined)=>{if(!s)return[];const m:string[]=[],w=s.weather?.wind;
  if(w)m.push(Math.abs(w.z)>=Math.abs(w.x)?(w.z<0?'Headwind: high balls hang':'Tailwind: high balls carry'):'Crosswind: high balls drift');
  if(s.weather?.wet)m.push('Wet pitch: the ball skids');if(s.require.clock)m.push(`Counter: score within ${s.require.clock} s of play`);
  if(s.defenders.some(d=>d.trap))m.push('Offside trap: the line steps up');if(s.defenders.some(d=>d.hunt))m.push('Hunter: presses every pass');
  if(s.defenders.some(d=>d.recover))m.push('Defenders sprint back');if(s.keeper?.sweeper)m.push('Keeper rushes out');return m;};
 const usesRuns=!!level&&(level.pack==='timing'||(ALL_SOLUTIONS[level.id]?.solution??[]).some(st=>'call' in st));
 const inPlay=view==='play'&&!replaying;

 return <div className={`${arcade.game} ${styles.game}`} data-arcade-kind="pass-puzzle" data-view={view} data-shot-height={controlMode==='shoot'}>
  <canvas ref={canvas} tabIndex={0} aria-label="Pass Puzzles pitch. Draw from the ball to pass."/>
  <header className={`${arcade.header} ${styles.header}`}><BackButton label="Arcade" title="Back to arcade" onBack={()=>{cancelDrawing.current();onExit();}}/>{view!=='levels'?<div className={`${arcade.headerScore} ${styles.passScore}`} aria-live="polite"><strong>{hud.passes}</strong><span>passes · try {hud.attempt}/{hud.attempts}</span></div>:<span/>}
   {view!=='levels'?<div className={styles.navigation}><button onClick={()=>{cancelDrawing.current();replayRef.current=null;sceneRef.current?.setReplayFocus(null);setReplaying(false);setView('levels');wake.current();}}>Puzzles</button>{view==='play'&&!replaying?<button className={arcade.pause} onClick={cycleHint} aria-pressed={showHint} data-hint-level={showHint?spotHint?2:1:0} aria-label={!showHint?'Show hint':!spotHint?'Show me where':'Hide hint'} data-tip={!showHint?'Hint':!spotHint?'Show me where':'Hide hint'}><Icon name="book" size={22}/></button>:null}</div>:<span/>}
  </header>
  {inPlay&&hud.phase==='aiming'&&<p className={`${arcade.message} ${styles.tip}`} data-warn={aimWarn??undefined} data-lane={laneRead?.status}>{laneRead?laneRead.text:aimWarn==='offside'?'Offside! The flagged teammate is past the last defender. Pass sooner or to someone onside.':showHint&&spotHint&&hintNote?hintNote:controlMode==='shoot'?'Choose height and power. Drag toward either corner, then release.':showHint?hintText:usesRuns&&hud.passes===0?'Drag from a teammate to send their run. Drag from the ball to pass.':scanOn&&hud.passes===0?'Scan is on: green lanes are open, red lanes are shut. Draw your pass.':hud.passes>0?'Nice touch. Draw the next one.':controlMode==='lift'?'Drag to a teammate or space. Your pass will lift over the ground.':controlMode==='ground'?'Drag into feet or space for a grounded pass.':'Drag to pass or shoot. Hold the tip to lift, or choose below.'}</p>}
  {inPlay&&modifiers(level).length>0&&<ul className={styles.modifiers} aria-label="This pitch">{modifiers(level).map(m=><li key={m}>{m}</li>)}</ul>}
  {inPlay&&hud.phase==='aiming'&&<div className={styles.passControls}>
   <div className={styles.passModes} role="group" aria-label="Ball flight">{(['auto','ground','lift','shoot'] as const).map(mode=><button key={mode} aria-pressed={controlMode===mode} onClick={()=>{cancelDrawing.current();controls.current.mode=mode;setControlMode(mode);}}>{mode==='auto'?'Auto':mode==='ground'?'Ground':mode==='lift'?'Lift':'Shoot'}</button>)}</div>
   {controlMode==='shoot'&&<label className={`${styles.powerControl} ${styles.shotHeight}`}><span>Height <b>{shotHeight===0?'Low':shotHeight===100?'Top bins':`${shotHeight}%`}</b></span><input aria-label="Shot height" aria-valuetext={shotHeight===0?'Low shot':shotHeight===100?'Top bins':`${shotHeight}% goal height`} type="range" min="0" max="100" step="5" value={shotHeight} onChange={e=>{const value=Number(e.target.value);controls.current.shotHeight=value/100;setShotHeight(value);if(stroke.current)stroke.current.dirty=true;wake.current();}}/><button type="button" onClick={()=>{const value=shotHeight===100?0:100;controls.current.shotHeight=value/100;setShotHeight(value);if(stroke.current)stroke.current.dirty=true;wake.current();}}>{shotHeight===100?'Low':'Top bins'}</button></label>}
   <div className={styles.aidRow}><button type="button" className={styles.scanToggle} aria-pressed={scanOn} onClick={toggleScan} data-scan={scanOn} aria-label={scanOn?'Hide the scan':'Scan: show which passes are open'}><Icon name="target" size={18}/>Scan</button>
   <label className={styles.powerControl}><span>Power <b>{power===null?'Auto':`${power}%`}</b></span><input ref={powerSlider} aria-label="Pass and shot power" aria-valuetext={power===null?'Automatic power from distance':`${power}% power`} type="range" min="10" max="100" step="5" defaultValue={power??60} onChange={e=>{const value=Number(e.target.value);controls.current.power=value/100;setPower(value);if(stroke.current)stroke.current.dirty=true;wake.current();}}/><button type="button" aria-label="Use automatic power" onClick={()=>{controls.current.power=undefined;setPower(null);if(stroke.current)stroke.current.dirty=true;wake.current();}}>Auto</button></label></div>
  </div>}
  {replaying&&<><div className={styles.replayChip} role="status"><Icon name="play" size={14}/> {replayKind==='coach'?'Coach’s route · 0.6×':'Replay · 0.38×'}{replayLine&&<span className={styles.replayCall} aria-live="polite" data-replay-call>{replayLine}</span>}<button className={styles.camToggle} aria-pressed={playerCam} onClick={togglePlayerView}>{playerCam?'Broadcast view':'Player view'}</button></div><button className={`pixel-btn ${styles.skip}`} onClick={skipReplay}>Skip</button></>}
  <div ref={loftMeter} className={styles.loft} data-active="false" aria-hidden="true"><i/><span>LIFT</span></div>

  {view==='levels'&&<div className={arcade.overlay}><section className={`${arcade.card} ${styles.levels}`}>
   <span className={arcade.badge}>FREEZE · DRAW · PLAY</span><h3>Pass Puzzles</h3>
   <p>Find the open teammate. Draw a pass, then watch your idea play out.</p>
   <fieldset className={styles.formatChoice}><legend>How do you play football?</legend><p>This changes the coaching words, not the difficulty.</p><div className={styles.formats}>{FORMATS.map((f,i)=><button key={f} className={`pixel-btn ${styles.format}`} aria-pressed={format===f} onClick={()=>chooseFormat(f)}><b>{f}</b><span>{['Small-sided','Growing teams','Full pitch'][i]}</span></button>)}</div></fieldset>
   <fieldset className={styles.formatChoice} data-heading-choice><legend>Heading the ball</legend><p>US youth rule: no heading at 10 and under. With heading off, crosses are chested down and finished.</p><div className={styles.formats} data-two>{[false,true].map(on=><button key={String(on)} className={`pixel-btn ${styles.format}`} aria-pressed={heading===on} onClick={()=>chooseHeading(on)}><b>{on?'Heading on':'No heading'}</b><span>{on?'Ages 11+':'Ages 10 and under'}</span></button>)}</div></fieldset>
   <button className={styles.daily} data-daily onClick={openDaily}><Icon name="clock" size={18}/><span><b>Daily puzzle</b><small>A new twist on a move you know, every day</small></span><em>{[0,1,2].map(n=>star(n<(progress.stars[dailyId]??0),n))}</em></button>
   {/* The pack map: a path of packs, each opened by stars earned anywhere (skill unlocks, never coins). */}
   <ol className={styles.packMap} role="group" aria-label="Choose a puzzle topic">{PACKS.map((p,i)=>{const list=packs.find(([id])=>id===p.id)?.[1]??[],got=list.reduce((n,s)=>n+(progress.stars[s.id]??0),0),open=packGateOpen(p,totalStars);
    return <li key={p.id} data-open={open} data-done={got===list.length*3||undefined}><button aria-label={p.title} aria-pressed={packId===p.id} onClick={()=>{setPackId(p.id);requestAnimationFrame(()=>packList.current?.scrollIntoView({block:'nearest',behavior:sceneRef.current?.stage.reduced?'auto':'smooth'}));}}><b>{i+1}</b><span>{p.title}</span><small>{open?`${got}/${list.length*3} ★`:`🔒 ${p.gate} ★`}</small></button></li>;})}</ol>
   {packs.filter(([pack])=>pack===packId).map(([pack,list])=>{const info=packInfo(pack),open=!info||packGateOpen(info,totalStars);return <div key={pack} className={styles.pack} ref={packList}><h4>{info?.title??pack}<small>{list.reduce((n,s)=>n+(progress.stars[s.id]??0),0)}/{list.length*3} ★</small></h4>{info?.blurb&&<p className={styles.blurb}>{pack==='in-the-air'&&!heading?YOUTH_PACK_BLURB:info.blurb}</p>}{!open&&<p className={styles.gate} role="status">Earn {info!.gate-totalStars} more ★ in earlier packs to open this one.</p>}<div className={styles.grid}>
    {list.map((s,i)=>{const lvl=open&&unlocked(s,list),got=progress.stars[s.id]??0,title=heading||!usesHeading(s.id)?s.title:youthScenario(s).title,d=pips(s.id);return <button key={s.id} className={styles.level} disabled={!lvl} onClick={()=>openLevel(s)} data-level={s.id} aria-label={`${i+1}. ${title}${lvl?`, ${got} of 3 stars, difficulty ${d} of 3`:', locked'}`}><b>{i+1}</b><span>{title}</span><em>{[0,1,2].map(n=>star(n<got,n))}<i className={styles.pips} data-pips={d} aria-hidden="true">{'●'.repeat(d)}{'○'.repeat(3-d)}</i></em></button>;})}
   </div></div>;})}
   <small>{totalStars} stars collected · saved on this device</small>
  </section></div>}

  {view==='brief'&&level&&<div className={`${arcade.overlay} ${styles.lowOverlay}`}><section className={arcade.card}>
   <span className={arcade.badge}>{format.toUpperCase()} BRIEF · {level.require.minPasses} PASS{level.require.minPasses===1?'':'ES'} IN THE ROUTE</span><h3>{level.title}</h3>{modifiers(level).length>0&&<ul className={styles.modifiers} data-inline>{modifiers(level).map(m=><li key={m}>{m}</li>)}</ul>}<p>{briefText}</p>{level.require.finish==='goal'&&<p className={styles.directHint}>See a clear shooting lane? You can also score directly from the opening ball.</p>}
   {showHint?<p className={styles.hint}><Icon name="book" size={16}/> {hintText}</p>:<button className={arcade.exit} onClick={()=>setShowHint(true)}>Show a hint</button>}
   <ul className={styles.goals} aria-label="Star goals">{goals(level).map((g,i)=><li key={g} data-on={!!((progress.masks?.[level.id]??0)&1<<i)}>{g}</li>)}</ul>
   <p>Free to play · a first solve earns 5 coins, plus 1 per new best star</p>{entry.message&&<p role="status">{entry.message}</p>}<button className={arcade.primary} disabled={entry.pending} onClick={play}>Start puzzle</button><button className={arcade.exit} onClick={()=>setView('levels')}>All puzzles</button>
   <small>Drag to a teammate or open grass, then release. Curve your line to bend the pass. Hold the tip to lift it. Red rings warn of defenders.</small>
  </section></div>}

  {view==='result'&&outcome&&level&&<div className={`${arcade.overlay} ${styles.lowOverlay} ${outcome.success?styles.goalResult:''}`}><section className={arcade.card}>
   <span className={arcade.badge}>{outcome.success?'PUZZLE SOLVED':outcome.attemptsLeft>0?`${outcome.attemptsLeft} ${outcome.attemptsLeft===1?'TRY':'TRIES'} LEFT`:'OUT OF TRIES'}</span>
   <h3>{outcome.success?(outcome.passes===0?'What a finish!':'That’s the move!'):'Not this time.'}</h3>
   {outcome.success?<><div className={styles.stars} aria-label={`${outcome.stars} of 3 stars`}>{[0,1,2].map(n=>star(n<outcome.stars,n))}</div>
    <ul className={styles.earned}>{goals(level).map((g,i)=>{const bit=1<<i;return <li key={g} data-on={!!(outcome.mask&bit)} data-new={!!(outcome.fresh&bit)||undefined}>{g}{outcome.fresh&bit?<b className={styles.newStar}> new</b>:null}</li>;})}</ul>
    {outcome.why.length>0&&<div className={styles.why} data-why><b>Why it worked</b><ul>{outcome.why.map(w=><li key={w}>{w}</li>)}</ul></div>}
    <p className={styles.lesson}>{!outcome.move?'You spotted a clear shooting lane. Now try the passing move for the next star.':level.lesson}</p></>
   :<><p data-why>{outcome.why[0]??reasonCopy[outcome.reason??'']??'Look again at who can reach the ball.'}</p>{outcome.fix&&<p className={styles.fix}><b>Try this:</b> {outcome.fix}</p>}{outcome.reason==='intercept'&&!scanOn&&<p className={styles.fix} data-scan-tip><b>Look up:</b> tap Scan before you draw to see which passes are open.</p>}<p className={styles.hint}><Icon name="book" size={16}/> {hintText}</p>{!spotHint&&outcome.attemptsLeft>0&&<button className={`pixel-btn ${styles.secondary} ${styles.spotHint}`} onClick={()=>{setShowHint(true);setSpotHint(true);}}><Icon name="book" size={16}/> Show me where next try</button>}</>}
   {outcome.success&&next&&'locked' in next&&<p className={styles.nextNote} role="status" data-next-locked>Next up: <b>{next.locked.title}</b>. Earn {next.need} more ★ to open it. Replay a puzzle for its missing stars.</p>}
   {outcome.success&&next&&'scenario' in next&&next.newPack&&<p className={styles.nextNote} data-next-pack>Pack complete! Next up: <b>{packInfo(next.scenario.pack)?.title}</b>.</p>}
   {outcome.success?(nextLevel?<button className={arcade.primary} onClick={()=>openLevel(nextLevel)}>Next puzzle</button>:<button className={arcade.primary} onClick={()=>{if(next&&'locked' in next)setPackId(next.locked.id);setView('levels');}}>All puzzles</button>)
    :<button className={arcade.primary} disabled={entry.pending} onClick={retry}>{outcome.attemptsLeft>0?'Try again':'Start over'}</button>}
   {!outcome.success&&rewindPoint.current&&!rewound.current&&<><button className={styles.rewind} onClick={rewindPass}>Rewind last pass</button><small className={styles.rewindNote}>Try a different angle from that moment. One rewind per try.</small></>}
   <div className={styles.row}><button className={`pixel-btn ${styles.secondary}`} onClick={watchAgain}><Icon name="play" size={16}/> Watch again</button>{(outcome.success||outcome.attemptsLeft===0)&&<button className={`pixel-btn ${styles.secondary}`} onClick={watchCoach}><Icon name="book" size={16}/> Coach’s route</button>}{outcome.success&&<button className={`pixel-btn ${styles.secondary}`} disabled={entry.pending} onClick={retry}><Icon name="reset" size={16}/> Replay level · 3 coins</button>}</div>
   {entry.message&&view==='result'&&<p role="status">{entry.message}</p>}<button className={arcade.exit} onClick={()=>setView('levels')}>All puzzles</button>
  </section></div>}

  {error&&<div className={arcade.overlay}><section className={arcade.card}><span className={arcade.badge}>TAKE A BREATHER</span><h3>The pitch couldn’t load.</h3><p>Return to the arcade and try again.</p><button className={arcade.exit} onClick={onExit}>Back to arcade</button></section></div>}
 </div>;
}
