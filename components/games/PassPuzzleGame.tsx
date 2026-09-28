'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {PuzzleSnapshot} from '@/lib/passPuzzle/types';
import {appendStroke,createPointerFilter,filterPointer,type PointerFilter} from '@/lib/passPuzzle/drawing';
import type {PassControlMode} from '@/lib/passPuzzle/stroke';
import {BackButton} from '../BackButton';
import {Icon} from '../Icon';
import {createPuzzle,readStroke,predict,replay as replayAttempt,type Scenario,type Format,type PuzzleWorld,type PuzzleEvent,type StrokePoint,type Kick,type Prediction,type Replay} from '@/lib/passPuzzle';
import {SCENARIOS as FOUNDATION_SCENARIOS,PACKS as FOUNDATION_PACKS,SCENARIO_SOLUTIONS as FOUNDATION_SOLUTIONS} from '@/lib/passPuzzle/scenarios';
import {CHALLENGE_PACK,CHALLENGE_SCENARIOS,CHALLENGE_SOLUTIONS} from '@/lib/passPuzzle/challenges';
import {arcadeFeedback} from '@/lib/arcade/arcadeFeedback';

import {createPassPuzzleScene,type PassPuzzleScene} from '@/lib/arcade/passPuzzleScene';
import {frameCapSlot} from '@/lib/town/frameCap';
import {isSoundEnabled,getSoundVolume} from '@/lib/games/sound';
import {useArcadeEntry} from '@/lib/arcade/useArcadeEntry';
import {beginArcadeRun,recordPuzzleBest} from '@/lib/arcade/arcadeWallet';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {loadIdp,goalById} from '@/lib/coaches/idp';
import arcade from './ArcadeGame3D.module.css';
import styles from './PassPuzzleGame.module.css';

const SCENARIOS=[...FOUNDATION_SCENARIOS,...CHALLENGE_SCENARIOS],PACKS=[...FOUNDATION_PACKS,CHALLENGE_PACK];
const SCENARIO_SOLUTIONS={...FOUNDATION_SOLUTIONS,...CHALLENGE_SOLUTIONS};

/** Pass Puzzles: freeze the moment, draw the pass, watch it play out. Every level teaches one idea. */
const PROGRESS_KEY='fi2-pass-puzzles-v1';
type Progress={stars:Record<string,number>;format?:Format};
type View='levels'|'brief'|'play'|'result';
type Outcome={success:boolean;stars:number;passes:number;bonus:boolean;reason?:string;attemptsLeft:number;firstTry:boolean};
const FORMATS:Format[]=['7v7','9v9','11v11'];
const RESULT_SETTLE_MS=1700,REPLAY_SPEED=.38,HOLD_LOFT_SECONDS=1.1,MIN_STROKE_METRES=1.2;

function readProgress():Progress{try{const v=JSON.parse(localStorage.getItem(PROGRESS_KEY)??'null');if(v&&typeof v==='object'&&v.stars&&typeof v.stars==='object'){const stars:Record<string,number>={};for(const [k,n] of Object.entries(v.stars))if(typeof n==='number'&&n>=0&&n<=3)stars[k]=Math.round(n);return{stars,format:FORMATS.includes(v.format)?v.format:undefined};}}catch{}return{stars:{}};}
function writeProgress(p:Progress){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(p));}catch{/* Private browsing keeps this visit's stars. */}}
/** The child's own format from their development plan when they have one; 9v9 otherwise. */
function childFormat():Format|undefined{try{const goal=loadIdp().plan?.goalId;const f=goal?goalById(goal)?.format:undefined;return f&&(FORMATS as string[]).includes(f)?f as Format:undefined;}catch{return undefined;}}
const reasonCopy:Record<string,string>={intercept:'A defender got to it first.',save:'The keeper read it.',out:'That one ran out of play.',rest:'The ball stopped before anyone reached it.','too-few-passes':'Right idea, but this one needs more passes first.',timeout:'The chance closed before the finish.'};
const playable=(s:Scenario):Scenario=>({...s,require:{...s.require,allowDirectShot:s.require.finish==='goal'}});
const packInfo=(pack:string)=>PACKS.find(p=>p.id===pack);

export default function PassPuzzleGame({onExit}:{onExit:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),sceneRef=useRef<PassPuzzleScene|null>(null),worldRef=useRef<PuzzleWorld|null>(null),replayRef=useRef<Replay|null>(null);
 const wake=useRef(()=>{}),audio=useRef<AudioContext|null>(null);
 const [controlMode,setControlMode]=useState<PassControlMode>('auto'),[power,setPower]=useState<number|null>(null),[shotHeight,setShotHeight]=useState(0);
 const controls=useRef<{mode:PassControlMode;power?:number;shotHeight?:number}>({mode:'auto',shotHeight:0}),powerSlider=useRef<HTMLInputElement>(null);
 const stroke=useRef<{filter:PointerFilter;bounds:DOMRect;holdX:number;holdY:number;id:number;points:StrokePoint[];lastMove:number;kick:Kick|null;prediction:Prediction|null;dirty:boolean;predictionAt:number;screenX:number;screenY:number}|null>(null);
 const coinVisit=useRef(''),coinAttempt=useRef(''),entry=useArcadeEntry('puzzle');
 const rewindPoint=useRef<PuzzleSnapshot|null>(null),rewound=useRef(false);
 const cancelDrawing=useRef(()=>{});
 const [packId,setPackId]=useState('first-passes');
 const attemptEvents=useRef<PuzzleEvent[]>([]),resultAt=useRef(0),settleUntil=useRef(0),viewRef=useRef<View>('levels');
 const [progress,setProgress]=useState<Progress>({stars:{}}),[format,setFormat]=useState<Format>('9v9');
 const [levelId,setLevelId]=useState<string>(SCENARIOS[0]?.id??''),[view,setViewState]=useState<View>('levels');
 const [hud,setHud]=useState({attempt:1,attempts:3,passes:0,phase:'aiming' as string});
 const [outcome,setOutcome]=useState<Outcome|null>(null),[replaying,setReplaying]=useState(false),[showHint,setShowHint]=useState(false),[error,setError]=useState(false);
 const loftMeter=useRef<HTMLDivElement>(null);
 const level=useMemo(()=>SCENARIOS.find(s=>s.id===levelId)??SCENARIOS[0],[levelId]);
 const packs=useMemo(()=>{const map=new Map<string,Scenario[]>();for(const s of SCENARIOS){if(!map.has(s.pack))map.set(s.pack,[]);map.get(s.pack)!.push(s);}return [...map.entries()].sort((a,b)=>(packInfo(a[0])?.order??9)-(packInfo(b[0])?.order??9));},[]);
 const setView=(v:View)=>{cancelDrawing.current();if(v==='result')resultAt.current=performance.now();viewRef.current=v;setViewState(v);};

 useEffect(()=>{const p=readProgress();setProgress(p);setFormat(p.format??childFormat()??'9v9');},[]);
 const chooseFormat=(f:Format)=>{setFormat(f);setProgress(p=>{const next={...p,format:f};writeProgress(next);return next;});};

 // ── sound: short gesture-unlocked blips like the other arcade games, no sustained source ──
 const unlock=()=>{if(!isSoundEnabled()||getSoundVolume()===0)return;try{audio.current??=new AudioContext();void audio.current.resume();}catch{}};
 // Contact voices distinguish a cushioned header, blocked lane and completed combination.
 const handleEvent=useCallback((e:PuzzleEvent)=>{
  sceneRef.current?.onEvent(e);
  const cue=e.type==='kick'?(e.kind==='shot'?'shot':e.kind==='header'?'lob':'pass'):e.type==='receive'?(e.touch==='header'?'header':worldRef.current&&worldRef.current.state.passes>=3?'combo':'collect'):e.type==='goal'?'goal':e.type==='save'||e.type==='parry'?'save':e.type==='intercept'||e.type==='deflect'?'block':e.type==='heavy_touch'?'hit':'miss';
  arcadeFeedback(audio.current,cue);
 },[]);

 const syncHud=()=>{const s=worldRef.current?.state;if(!s)return;setHud(h=>h.attempt===s.attempt&&h.passes===s.passes&&h.phase===s.phase&&h.attempts===(worldRef.current?.scenario.attempts??3)?h:{attempt:s.attempt,attempts:worldRef.current!.scenario.attempts,passes:s.passes,phase:s.phase});};

 const finish=useCallback(()=>{
  const world=worldRef.current;if(!world?.state.result)return;const r=world.state.result,s=world.state,success=r.outcome==='success',firstTry=s.attempt===1&&!rewound.current;
  if(success&&world.scenario.require.finish==='reach-zone')arcadeFeedback(audio.current,'level');
  const stars=success?1+(r.bonus?1:0)+(firstTry?1:0):0;
  if(success&&coinAttempt.current)void recordPuzzleBest(world.scenario.id,stars,coinAttempt.current,coinVisit.current);
  if(success)setProgress(p=>{const best=Math.max(p.stars[world.scenario.id]??0,stars),next={...p,stars:{...p.stars,[world.scenario.id]:best}};writeProgress(next);return next;});
  setOutcome({success,stars,passes:r.passes,bonus:r.bonus,reason:r.reason,attemptsLeft:s.attemptsLeft,firstTry});setView('result');stroke.current=null;
 },[]);

 // ── one render loop that runs only while something moves ──
 useEffect(()=>{
  const el=canvas.current;if(!el)return;let scene:PassPuzzleScene;try{scene=createPassPuzzleScene(el);sceneRef.current=scene;}catch{setError(true);return;}
  let frame=0,last=0,slot=0,disposed=false,thinkingUntil=0;const interval=1000/(scene.stage.mobile?30:60);
  const draw=(now:number)=>{frame=0;if(disposed||document.hidden)return;const next=frameCapSlot(now,slot,viewRef.current==='play'&&worldRef.current?.state.phase==='aiming'&&!stroke.current?1000/15:interval);if(next<0){frame=requestAnimationFrame(draw);return;}slot=next;const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
   const world=worldRef.current;if(!world){scene.render();return;}
   let busy=false,state=world.state;const rep=replayRef.current;
   if(rep){for(const e of rep.advance(dt))handleEvent(e);state=rep.world.state;
    const key=attemptEvents.current.filter(e=>e.type!=='kick'&&e.type!=='receive').at(-1)??attemptEvents.current.at(-1);
    if(key){const lead=key.t-state.t,amount=Math.max(0,Math.min(1,1-lead/1.4));scene.setReplayFocus({x:key.at.x,z:key.at.z},amount*amount*(3-2*amount));}
    busy=!rep.done;if(rep.done){replayRef.current=null;scene.setReplayFocus(null);setReplaying(false);state=world.state;scene.update(state,0);}
   }else if(viewRef.current==='play'&&(state.phase==='windup'||state.phase==='flight')){world.step(dt);for(const e of world.drain()){attemptEvents.current.push(e);handleEvent(e);}state=world.state;busy=true;
    if(state.phase==='aiming'){thinkingUntil=now+4000;scene.setAim(null,state);syncHud();}
    if(state.phase==='success'||state.phase==='fail'){syncHud();settleUntil.current=now+900;finish();}
   }else if(state.phase==='aiming'){
    const st=stroke.current;
    if(st){const tail=st.points.at(-1)!,held=now/1000-st.lastMove;
     if(now-st.predictionAt>=80&&(st.dirty||held>.2&&held<1.2)){st.predictionAt=now;st.dirty=false;const points=held>.02?[...st.points,{x:tail.x,z:tail.z,t:now/1000}]:st.points;try{st.kick=points.length>1?readStroke(points,world,controls.current):null;st.prediction=st.kick?predict(world,st.kick):null;}catch{st.kick=null;st.prediction=null;}
      scene.setAim({prediction:st.prediction,receiver:st.kick?.receiver,loft:st.kick?.loft??0,stroke:st.points},state);}
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
  const down=(e:PointerEvent)=>{const world=worldRef.current;if(e.button!==0||!world||replayRef.current||viewRef.current!=='play'||world.state.phase!=='aiming'||stroke.current)return;const bounds=el.getBoundingClientRect(),p=scene.pick(e.clientX,e.clientY,bounds);if(!p)return;e.preventDefault();unlock();el.setPointerCapture(e.pointerId);const b=world.state.ball.p,t=performance.now()/1000;stroke.current={filter:createPointerFilter(e.clientX,e.clientY,e.timeStamp),bounds,holdX:e.clientX,holdY:e.clientY,id:e.pointerId,points:[{x:b.x,z:b.z,t:t-.001},{x:p.x,z:p.z,t}],lastMove:t,kick:null,prediction:null,dirty:true,predictionAt:0,screenX:e.clientX,screenY:e.clientY};placeMeter(e);wake.current();};
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
  const up=(e:PointerEvent)=>{const st=stroke.current,world=worldRef.current;if(!st||st.id!==e.pointerId||!world)return;sample(e,true);stroke.current=null;hideMeter();if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
   const t=performance.now()/1000,tail=st.points.at(-1)!,points=[...st.points,{x:tail.x,z:tail.z,t}],length=Math.hypot(tail.x-points[0].x,tail.z-points[0].z);
   let kick:Kick|null=null;try{kick=length>=MIN_STROKE_METRES?readStroke(points,world,controls.current):null;}catch{kick=null;}
   scene.setAim(null,world.state);if(kick){const snapshot=world.snapshot();if(world.kick(kick)){rewindPoint.current=snapshot;syncHud();}}settleUntil.current=performance.now()+400;wake.current();};
  const cancelAll=()=>{const st=stroke.current;stroke.current=null;hideMeter();if(st&&el.hasPointerCapture(st.id))el.releasePointerCapture(st.id);const w=worldRef.current;if(w)scene.setAim(null,w.state);wake.current();};
  cancelDrawing.current=cancelAll;
  const cancel=(e:PointerEvent)=>{if(stroke.current?.id===e.pointerId)cancelAll();};
  const blur=()=>cancelAll();const hidden=()=>{if(document.hidden)cancelAll();};
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
  const placeMeter=(e:PointerEvent)=>{const m=loftMeter.current,r=stroke.current?.bounds??el.getBoundingClientRect();if(m){m.style.left=`${e.clientX-r.left}px`;m.style.top=`${e.clientY-r.top}px`;}};
  const hideMeter=()=>{const m=loftMeter.current;if(m){m.dataset.active='false';m.style.setProperty('--loft','0');}};
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);el.addEventListener('lostpointercapture',cancel);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__passPuzzle:unknown}).__passPuzzle={get world(){return worldRef.current;},get replay(){return replayRef.current;},scene,wake:()=>wake.current(),kick:(k:Kick)=>{const w=worldRef.current;const ok=!!w&&w.kick(k);syncHud();wake.current();return ok;},solution:(id:string)=>SCENARIO_SOLUTIONS[id]?.solution,naive:(id:string)=>SCENARIO_SOLUTIONS[id]?.naive};
  // The level list sits over the first puzzle's frozen pitch: one static frame, then sleep.
  if(SCENARIOS[0])try{const w=createPuzzle(playable(SCENARIOS[0]));worldRef.current=w;scene.load(SCENARIOS[0]);scene.update(w.state,0);}catch{/* the play button reports real failures */}
  wake.current();
  return()=>{disposed=true;cancelDrawing.current=()=>{};window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);el.removeEventListener('lostpointercapture',cancel);scene.dispose();sceneRef.current=null;worldRef.current=null;replayRef.current=null;wake.current=()=>{};void audio.current?.close();audio.current=null;delete (window as unknown as {__passPuzzle?:unknown}).__passPuzzle;};
 },[finish,handleEvent]);

 /** Build the frozen moment for a level: the pitch shows behind the brief card. */
 const loadLevel=(s:Scenario)=>{rewindPoint.current=null;rewound.current=false;const scene=sceneRef.current;if(!scene)return;replayRef.current=null;setReplaying(false);stroke.current=null;attemptEvents.current=[];
  try{const world=createPuzzle(playable(s));worldRef.current=world;scene.load(s);scene.setAim(null,world.state);scene.update(world.state,0);}catch{setError(true);return;}
  setLevelId(s.id);setPackId(s.pack);setOutcome(null);setShowHint(false);syncHud();settleUntil.current=performance.now()+300;wake.current();};
 const openLevel=(s:Scenario)=>{loadLevel(s);setView('brief');};
 const play=async()=>{unlock();const id=await entry.enter();if(!id)return;coinVisit.current||=beginArcadeRun('puzzle');coinAttempt.current=beginArcadeRun('puzzle');recordExploreActivity('arcade');setView('play');const w=worldRef.current;if(w)sceneRef.current?.setAim(null,w.state);settleUntil.current=performance.now()+1200;wake.current();};
 const retry=async()=>{const worldBefore=worldRef.current;if(!worldBefore)return;if(worldBefore.state.attemptsLeft<=0||worldBefore.state.phase==='success'){const id=await entry.enter();if(!id)return;}rewindPoint.current=null;rewound.current=false;coinVisit.current||=beginArcadeRun('puzzle');coinAttempt.current=beginArcadeRun('puzzle');const world=worldRef.current,scene=sceneRef.current;if(!world||!scene)return;replayRef.current=null;setReplaying(false);if(!world.retry()){loadLevel(world.scenario);setView('play');return;}attemptEvents.current=[];scene.resetActors();scene.update(world.state,0);scene.setAim(null,world.state);syncHud();setOutcome(null);setShowHint(true);setView('play');settleUntil.current=performance.now()+600;wake.current();};
 const rewindPass=()=>{const world=worldRef.current,scene=sceneRef.current,snapshot=rewindPoint.current;if(!world||!scene||!snapshot||rewound.current)return;cancelDrawing.current();replayRef.current=null;setReplaying(false);world.drain();world.restore(snapshot);rewound.current=true;rewindPoint.current=null;attemptEvents.current=attemptEvents.current.filter(e=>e.tick<snapshot.state.tick);scene.resetActors();scene.setReplayFocus(null);scene.setAim(null,world.state);scene.update(world.state,0);setOutcome(null);setShowHint(true);syncHud();setView('play');settleUntil.current=performance.now()+600;wake.current();};
 const watchAgain=()=>{const world=worldRef.current;if(!world)return;try{replayRef.current=replayAttempt(world.attemptStart(),world.inputs(),REPLAY_SPEED);}catch{return;}sceneRef.current?.resetActors();setReplaying(true);setView('play');wake.current();};
 const skipReplay=()=>{const rep=replayRef.current,world=worldRef.current;if(!rep||!world)return;replayRef.current=null;sceneRef.current?.setReplayFocus(null);sceneRef.current?.update(world.state,0);setReplaying(false);setView('result');wake.current();};
 useEffect(()=>{if(!replaying&&outcome&&view==='play'&&!replayRef.current&&worldRef.current?.state.result)setView('result');},[replaying,outcome,view]);
 const nextLevel=useMemo(()=>{const i=SCENARIOS.findIndex(s=>s.id===level?.id);return i>=0?SCENARIOS[i+1]:undefined;},[level]);
 const unlocked=(s:Scenario,list:Scenario[])=>{const i=list.indexOf(s);return i<=0||(progress.stars[list[i-1].id]??0)>0||(progress.stars[s.id]??0)>0;};
 const totalStars=Object.values(progress.stars).reduce((a,b)=>a+b,0);

 const star=(on:boolean,key:number)=><span key={key} className={on?styles.starOn:styles.starOff} aria-hidden="true">★</span>;
 const briefText=level?.brief[format]??'',hintText=level?.hint[format]??'';
 const inPlay=view==='play'&&!replaying;

 return <div className={`${arcade.game} ${styles.game}`} data-arcade-kind="pass-puzzle" data-view={view} data-shot-height={controlMode==='shoot'}>
  <canvas ref={canvas} tabIndex={0} aria-label="Pass Puzzles pitch. Draw from the ball to pass."/>
  <header className={`${arcade.header} ${styles.header}`}><BackButton label="Arcade" title="Back to arcade" onBack={()=>{cancelDrawing.current();onExit();}}/>{view!=='levels'?<div className={`${arcade.headerScore} ${styles.passScore}`} aria-live="polite"><strong>{hud.passes}</strong><span>passes · try {hud.attempt} of {hud.attempts}</span></div>:<span/>}
   {view!=='levels'?<div className={styles.navigation}><button onClick={()=>{cancelDrawing.current();replayRef.current=null;sceneRef.current?.setReplayFocus(null);setReplaying(false);setView('levels');wake.current();}}>Puzzles</button>{view==='play'&&!replaying?<button className={arcade.pause} onClick={()=>setShowHint(v=>!v)} aria-pressed={showHint} aria-label={showHint?'Hide hint':'Show hint'} data-tip="Hint"><Icon name="book" size={22}/></button>:null}</div>:<span/>}
  </header>
  {inPlay&&hud.phase==='aiming'&&<p className={`${arcade.message} ${styles.tip}`}>{controlMode==='shoot'?'Choose height and power. Drag toward either corner, then release.':showHint?hintText:hud.passes>0?'Nice touch. Draw the next one.':controlMode==='lift'?'Drag to a teammate or space. Your pass will lift over the ground.':controlMode==='ground'?'Drag into feet or space for a grounded pass.':'Drag to pass or shoot. Hold the tip to lift, or choose below.'}</p>}
  {inPlay&&hud.phase==='aiming'&&<div className={styles.passControls}>
   <div className={styles.passModes} role="group" aria-label="Ball flight">{(['auto','ground','lift','shoot'] as const).map(mode=><button key={mode} aria-pressed={controlMode===mode} onClick={()=>{cancelDrawing.current();controls.current.mode=mode;setControlMode(mode);}}>{mode==='auto'?'Auto':mode==='ground'?'Ground':mode==='lift'?'Lift':'Shoot'}</button>)}</div>
   {controlMode==='shoot'&&<label className={`${styles.powerControl} ${styles.shotHeight}`}><span>Height <b>{shotHeight===0?'Low':shotHeight===100?'Top bins':`${shotHeight}%`}</b></span><input aria-label="Shot height" aria-valuetext={shotHeight===0?'Low shot':shotHeight===100?'Top bins':`${shotHeight}% goal height`} type="range" min="0" max="100" step="5" value={shotHeight} onChange={e=>{const value=Number(e.target.value);controls.current.shotHeight=value/100;setShotHeight(value);if(stroke.current)stroke.current.dirty=true;wake.current();}}/><button type="button" onClick={()=>{const value=shotHeight===100?0:100;controls.current.shotHeight=value/100;setShotHeight(value);if(stroke.current)stroke.current.dirty=true;wake.current();}}>{shotHeight===100?'Low':'Top bins'}</button></label>}
   <label className={styles.powerControl}><span>Power <b>{power===null?'Auto':`${power}%`}</b></span><input ref={powerSlider} aria-label="Pass and shot power" aria-valuetext={power===null?'Automatic power from distance':`${power}% power`} type="range" min="10" max="100" step="5" defaultValue={power??60} onChange={e=>{const value=Number(e.target.value);controls.current.power=value/100;setPower(value);if(stroke.current)stroke.current.dirty=true;wake.current();}}/><button type="button" aria-label="Use automatic power" onClick={()=>{controls.current.power=undefined;setPower(null);if(stroke.current)stroke.current.dirty=true;wake.current();}}>Auto</button></label>
  </div>}
  {replaying&&<><div className={styles.replayChip} role="status"><Icon name="play" size={14}/> Replay · 0.38×</div><button className={`pixel-btn ${styles.skip}`} onClick={skipReplay}>Skip</button></>}
  <div ref={loftMeter} className={styles.loft} data-active="false" aria-hidden="true"><i/><span>LIFT</span></div>

  {view==='levels'&&<div className={arcade.overlay}><section className={`${arcade.card} ${styles.levels}`}>
   <span className={arcade.badge}>FREEZE · DRAW · PLAY</span><h3>Pass Puzzles</h3>
   <p>Find the open teammate. Draw a pass, then watch your idea play out.</p>
   <fieldset className={styles.formatChoice}><legend>How do you play football?</legend><p>This changes the coaching words, not the difficulty.</p><div className={styles.formats}>{FORMATS.map((f,i)=><button key={f} className={`pixel-btn ${styles.format}`} aria-pressed={format===f} onClick={()=>chooseFormat(f)}><b>{f}</b><span>{['Small-sided','Growing teams','Full pitch'][i]}</span></button>)}</div></fieldset>
   <div className={styles.topics} role="group" aria-label="Choose a puzzle topic">{PACKS.map(p=><button key={p.id} aria-pressed={packId===p.id} onClick={()=>setPackId(p.id)}>{p.title}</button>)}</div>
   {packs.filter(([pack])=>pack===packId).map(([pack,list])=><div key={pack} className={styles.pack}><h4>{packInfo(pack)?.title??pack}<small>{list.reduce((n,s)=>n+(progress.stars[s.id]??0),0)}/{list.length*3} ★</small></h4>{packInfo(pack)?.blurb&&<p className={styles.blurb}>{packInfo(pack)!.blurb}</p>}<div className={styles.grid}>
    {list.map((s,i)=>{const open=unlocked(s,list),got=progress.stars[s.id]??0;return <button key={s.id} className={styles.level} disabled={!open} onClick={()=>openLevel(s)} data-level={s.id} aria-label={`${i+1}. ${s.title}${open?`, ${got} of 3 stars`:', locked'}`}><b>{i+1}</b><span>{s.title}</span><em>{[0,1,2].map(n=>star(n<got,n))}</em></button>;})}
   </div></div>)}
   <small>{totalStars} stars collected · saved on this device</small>
  </section></div>}

  {view==='brief'&&level&&<div className={`${arcade.overlay} ${styles.lowOverlay}`}><section className={arcade.card}>
   <span className={arcade.badge}>{format.toUpperCase()} BRIEF · {level.require.minPasses} PASS{level.require.minPasses===1?'':'ES'} IN THE ROUTE</span><h3>{level.title}</h3><p>{briefText}</p>{level.require.finish==='goal'&&<p className={styles.directHint}>See a clear shooting lane? You can also score directly from the opening ball.</p>}
   {showHint?<p className={styles.hint}><Icon name="book" size={16}/> {hintText}</p>:<button className={arcade.exit} onClick={()=>setShowHint(true)}>Show a hint</button>}
   {level.bonus&&<p className={styles.bonus}>Bonus ★ {level.bonus.label}</p>}
   <p>Free to play · a first solve earns 5 coins, plus 1 per new best star</p>{entry.message&&<p role="status">{entry.message}</p>}<button className={arcade.primary} disabled={entry.pending} onClick={play}>Start puzzle</button><button className={arcade.exit} onClick={()=>setView('levels')}>All puzzles</button>
   <small>Drag to a teammate or open grass, then release. Curve your line to bend the pass. Hold the tip to lift it. Red rings warn of defenders.</small>
  </section></div>}

  {view==='result'&&outcome&&level&&<div className={`${arcade.overlay} ${styles.lowOverlay} ${outcome.success?styles.goalResult:''}`}><section className={arcade.card}>
   <span className={arcade.badge}>{outcome.success?'PUZZLE SOLVED':outcome.attemptsLeft>0?`${outcome.attemptsLeft} ${outcome.attemptsLeft===1?'TRY':'TRIES'} LEFT`:'OUT OF TRIES'}</span>
   <h3>{outcome.success?(outcome.passes===0?'What a finish!':'That’s the move!'):'Not this time.'}</h3>
   {outcome.success?<><div className={styles.stars} aria-label={`${outcome.stars} of 3 stars`}>{[0,1,2].map(n=>star(n<outcome.stars,n))}</div>
    <ul className={styles.earned}><li data-on="true">{outcome.passes===0?'Direct finish':`Solved with ${outcome.passes} pass${outcome.passes===1?'':'es'}`} </li><li data-on={outcome.bonus}>{level.bonus?`Bonus: ${level.bonus.label}`:'Bonus'}</li><li data-on={outcome.firstTry}>First try</li></ul>
    <p className={styles.lesson}>{outcome.passes===0?'You spotted a clear shooting lane. Replay to practise the passing route too.':level.lesson}</p></>
   :<><p>{reasonCopy[outcome.reason??'']??'Look again at who can reach the ball.'}</p><p className={styles.hint}><Icon name="book" size={16}/> {hintText}</p></>}
   {outcome.success?(nextLevel?<button className={arcade.primary} onClick={()=>openLevel(nextLevel)}>Next puzzle</button>:<button className={arcade.primary} onClick={()=>setView('levels')}>All puzzles</button>)
    :<button className={arcade.primary} disabled={entry.pending} onClick={retry}>{outcome.attemptsLeft>0?'Try again':'Start over'}</button>}
   {!outcome.success&&rewindPoint.current&&!rewound.current&&<><button className={styles.rewind} onClick={rewindPass}>Rewind last pass</button><small className={styles.rewindNote}>Try a different angle from that moment. One rewind per try; the first-try star needs a clean run.</small></>}
   <div className={styles.row}><button className={`pixel-btn ${styles.secondary}`} onClick={watchAgain}><Icon name="play" size={16}/> Watch again</button>{outcome.success&&<button className={`pixel-btn ${styles.secondary}`} disabled={entry.pending} onClick={retry}><Icon name="reset" size={16}/> Replay level · 3 coins</button>}</div>
   {entry.message&&view==='result'&&<p role="status">{entry.message}</p>}<button className={arcade.exit} onClick={()=>setView('levels')}>All puzzles</button>
  </section></div>}

  {error&&<div className={arcade.overlay}><section className={arcade.card}><span className={arcade.badge}>TAKE A BREATHER</span><h3>The pitch couldn’t load.</h3><p>Return to the arcade and try again.</p><button className={arcade.exit} onClick={onExit}>Back to arcade</button></section></div>}
 </div>;
}
