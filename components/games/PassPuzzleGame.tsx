'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {appendStroke} from '@/lib/passPuzzle/drawing';
import {BackButton} from '../BackButton';
import {Icon} from '../Icon';
import {createPuzzle,readStroke,predict,replay as replayAttempt,type Scenario,type Format,type PuzzleWorld,type PuzzleEvent,type StrokePoint,type Kick,type Prediction,type Replay} from '@/lib/passPuzzle';
import {SCENARIOS,PACKS,SCENARIO_SOLUTIONS} from '@/lib/passPuzzle/scenarios';
import {createPassPuzzleScene,type PassPuzzleScene} from '@/lib/arcade/passPuzzleScene';
import {frameCapSlot} from '@/lib/town/frameCap';
import {isSoundEnabled,getSoundVolume} from '@/lib/games/sound';
import {beginArcadeRun,recordPuzzleBest} from '@/lib/arcade/arcadeWallet';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {loadIdp,goalById} from '@/lib/coaches/idp';
import arcade from './ArcadeGame3D.module.css';
import styles from './PassPuzzleGame.module.css';

/** Pass Puzzles: freeze the moment, draw the pass, watch it play out. Every level teaches one idea. */
const PROGRESS_KEY='fi2-pass-puzzles-v1';
type Progress={stars:Record<string,number>;format?:Format};
type View='levels'|'brief'|'play'|'result';
type Outcome={success:boolean;stars:number;passes:number;bonus:boolean;reason?:string;attemptsLeft:number;firstTry:boolean};
const FORMATS:Format[]=['7v7','9v9','11v11'];
const RESULT_SETTLE_MS=1200,REPLAY_SPEED=.38,HOLD_LOFT_SECONDS=1.1,MIN_STROKE_METRES=1.2;

function readProgress():Progress{try{const v=JSON.parse(localStorage.getItem(PROGRESS_KEY)??'null');if(v&&typeof v==='object'&&v.stars&&typeof v.stars==='object'){const stars:Record<string,number>={};for(const [k,n] of Object.entries(v.stars))if(typeof n==='number'&&n>=0&&n<=3)stars[k]=Math.round(n);return{stars,format:FORMATS.includes(v.format)?v.format:undefined};}}catch{}return{stars:{}};}
function writeProgress(p:Progress){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(p));}catch{/* Private browsing keeps this visit's stars. */}}
/** The child's own format from their development plan when they have one; 9v9 otherwise. */
function childFormat():Format|undefined{try{const goal=loadIdp().plan?.goalId;const f=goal?goalById(goal)?.format:undefined;return f&&(FORMATS as string[]).includes(f)?f as Format:undefined;}catch{return undefined;}}
const reasonCopy:Record<string,string>={intercept:'A defender got to it first.',save:'The keeper read it.',out:'That one ran out of play.',rest:'The ball stopped before anyone reached it.','too-few-passes':'Right idea, but this one needs more passes first.',timeout:'The chance closed before the finish.'};
const packInfo=(pack:string)=>PACKS.find(p=>p.id===pack);

export default function PassPuzzleGame({onExit}:{onExit:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),sceneRef=useRef<PassPuzzleScene|null>(null),worldRef=useRef<PuzzleWorld|null>(null),replayRef=useRef<Replay|null>(null);
 const wake=useRef(()=>{}),audio=useRef<AudioContext|null>(null),rattle=useRef<AudioBuffer|null>(null);
 const stroke=useRef<{id:number;points:StrokePoint[];lastMove:number;kick:Kick|null;prediction:Prediction|null;dirty:boolean;predictionAt:number;screenX:number;screenY:number}|null>(null);
 const coinVisit=useRef(''),coinAttempt=useRef('');
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
 const sound=useCallback((kind:'kick'|'touch'|'goal'|'miss')=>{
  const ctx=audio.current,volume=getSoundVolume();if(!ctx||ctx.state!=='running'||!isSoundEnabled()||volume===0)return;
  const now=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain(),[from,to,len,level]=({kick:[180,70,.13,.13],touch:[320,160,.08,.06],goal:[660,990,.18,.08],miss:[240,120,.22,.05]} as const)[kind];
  osc.type=kind==='kick'?'triangle':'sine';osc.frequency.setValueAtTime(from,now);osc.frequency.exponentialRampToValueAtTime(to,now+len*.7);gain.gain.setValueAtTime(level*volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+len);osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+len+.01);osc.onended=()=>{osc.disconnect();gain.disconnect();};
  if(kind==='goal'){if(!rattle.current){const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.24),ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*4);rattle.current=b;}const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),air=ctx.createGain();src.buffer=rattle.current;filter.type='bandpass';filter.frequency.value=1700;filter.Q.value=.6;air.gain.setValueAtTime(.09*volume,now);air.gain.exponentialRampToValueAtTime(.0001,now+.24);src.connect(filter);filter.connect(air);air.connect(ctx.destination);src.start(now);src.onended=()=>{src.disconnect();filter.disconnect();air.disconnect();};}
 },[]);
 const handleEvent=useCallback((e:PuzzleEvent)=>{sceneRef.current?.onEvent(e);if(e.type==='kick')sound('kick');else if(e.type==='receive'||e.type==='save'||e.type==='parry'||e.type==='deflect'||e.type==='heavy_touch')sound('touch');else if(e.type==='goal')sound('goal');else if(e.type==='intercept'||e.type==='out')sound('miss');},[sound]);

 const syncHud=()=>{const s=worldRef.current?.state;if(!s)return;setHud(h=>h.attempt===s.attempt&&h.passes===s.passes&&h.phase===s.phase&&h.attempts===(worldRef.current?.scenario.attempts??3)?h:{attempt:s.attempt,attempts:worldRef.current!.scenario.attempts,passes:s.passes,phase:s.phase});};

 const finish=useCallback(()=>{
  const world=worldRef.current;if(!world?.state.result)return;const r=world.state.result,s=world.state,success=r.outcome==='success',firstTry=s.attempt===1;
  const stars=success?1+(r.bonus?1:0)+(firstTry?1:0):0;
  if(success&&coinAttempt.current)void recordPuzzleBest(world.scenario.id,stars,coinAttempt.current,coinVisit.current);
  if(success)setProgress(p=>{const best=Math.max(p.stars[world.scenario.id]??0,stars),next={...p,stars:{...p.stars,[world.scenario.id]:best}};writeProgress(next);return next;});
  setOutcome({success,stars,passes:r.passes,bonus:r.bonus,reason:r.reason,attemptsLeft:s.attemptsLeft,firstTry});setView('result');stroke.current=null;
 },[]);

 // ── one render loop that runs only while something moves ──
 useEffect(()=>{
  const el=canvas.current;if(!el)return;let scene:PassPuzzleScene;try{scene=createPassPuzzleScene(el);sceneRef.current=scene;}catch{setError(true);return;}
  let frame=0,last=0,slot=0,disposed=false;const interval=1000/(scene.stage.mobile?30:60);
  const draw=(now:number)=>{frame=0;if(disposed||document.hidden)return;const next=frameCapSlot(now,slot,interval);if(next<0){frame=requestAnimationFrame(draw);return;}slot=next;const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
   const world=worldRef.current;if(!world){scene.render();return;}
   let busy=false,state=world.state;const rep=replayRef.current;
   if(rep){for(const e of rep.advance(dt))handleEvent(e);state=rep.world.state;
    const key=attemptEvents.current.filter(e=>e.type!=='kick'&&e.type!=='receive').at(-1)??attemptEvents.current.at(-1);
    if(key){const lead=key.t-state.t,amount=Math.max(0,Math.min(1,1-lead/1.4));scene.setReplayFocus({x:key.at.x,z:key.at.z},amount*amount*(3-2*amount));}
    busy=!rep.done;if(rep.done){replayRef.current=null;scene.setReplayFocus(null);setReplaying(false);state=world.state;scene.update(state,0);}
   }else if(viewRef.current==='play'&&(state.phase==='windup'||state.phase==='flight')){world.step(dt);for(const e of world.drain()){attemptEvents.current.push(e);handleEvent(e);}state=world.state;busy=true;
    if(state.phase==='aiming'){scene.setAim(null,state);syncHud();}
    if(state.phase==='success'||state.phase==='fail'){syncHud();settleUntil.current=now+900;finish();}
   }else if(state.phase==='aiming'){
    const st=stroke.current;
    if(st){const tail=st.points.at(-1)!,held=now/1000-st.lastMove;
     if(st.dirty)scene.setStroke(st.points);
     if(now-st.predictionAt>=80&&(st.dirty||held>.2&&held<1.2)){st.predictionAt=now;st.dirty=false;const points=held>.02?[...st.points,{x:tail.x,z:tail.z,t:now/1000}]:st.points;try{st.kick=points.length>1?readStroke(points,world):null;st.prediction=st.kick?predict(world,st.kick):null;}catch{st.kick=null;st.prediction=null;}
      scene.setAim({prediction:st.prediction,receiver:st.kick?.receiver,loft:st.kick?.loft??0,stroke:st.points},state);}
     const loft=st.kick?.loft??0,meter=loftMeter.current;if(meter){meter.style.setProperty('--loft',String(loft));meter.dataset.active=String(held>.12&&!!st.kick);}
     if(held<HOLD_LOFT_SECONDS+.1)busy=true;
    }
   }
   const animating=scene.update(state,dt);
   scene.render();el.dataset.frames=String(Number(el.dataset.frames??0)+1);el.dataset.wake=`${+busy}${+animating}${+(now<settleUntil.current)}`;
   // The result card is a hard stop: a short settle for the last reactions, then no frames at all.
   const stopped=viewRef.current==='levels'||viewRef.current==='brief'||viewRef.current==='result'&&!replayRef.current&&now-resultAt.current>RESULT_SETTLE_MS;
   if(!stopped&&(busy||animating||now<settleUntil.current))frame=requestAnimationFrame(draw);else{last=0;slot=0;}
  };
  wake.current=()=>{if(!disposed&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);};
  const visibility=()=>{if(!document.hidden)wake.current();else{cancelAnimationFrame(frame);frame=0;last=0;slot=0;}};
  const observer=new ResizeObserver(()=>{scene.fit();wake.current();});observer.observe(el);document.addEventListener('visibilitychange',visibility);
  // Pointer: a stroke always starts at the ball, so a small thumb never misses it.
  const down=(e:PointerEvent)=>{const world=worldRef.current;if(e.button!==0||!world||replayRef.current||viewRef.current!=='play'||world.state.phase!=='aiming'||stroke.current)return;const p=scene.pick(e.clientX,e.clientY);if(!p)return;e.preventDefault();unlock();el.setPointerCapture(e.pointerId);const b=world.state.ball.p,t=performance.now()/1000;stroke.current={id:e.pointerId,points:[{x:b.x,z:b.z,t:t-.001},{x:p.x,z:p.z,t}],lastMove:t,kick:null,prediction:null,dirty:true,predictionAt:0,screenX:e.clientX,screenY:e.clientY};placeMeter(e);wake.current();};
  const sample=(e:PointerEvent,force=false)=>{const st=stroke.current;if(!st||st.id!==e.pointerId)return;if(!force&&Math.hypot(e.clientX-st.screenX,e.clientY-st.screenY)<1.5)return;const p=scene.pick(e.clientX,e.clientY);if(!p||!Number.isFinite(p.x+p.z))return;const tail=st.points.at(-1)!;if(Math.hypot(p.x-tail.x,p.z-tail.z)<.02)return;const t=performance.now()/1000;appendStroke(st.points,{x:p.x,z:p.z,t});st.lastMove=t;st.screenX=e.clientX;st.screenY=e.clientY;st.dirty=true;};
  const move=(e:PointerEvent)=>{if(stroke.current?.id!==e.pointerId)return;e.preventDefault();const samples=e.getCoalescedEvents?.()??[];for(const point of samples.slice(-8))sample(point);sample(e);placeMeter(e);wake.current();};
  const up=(e:PointerEvent)=>{const st=stroke.current,world=worldRef.current;if(!st||st.id!==e.pointerId||!world)return;sample(e,true);stroke.current=null;hideMeter();if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
   const t=performance.now()/1000,tail=st.points.at(-1)!,points=[...st.points,{x:tail.x,z:tail.z,t}],length=Math.hypot(tail.x-points[0].x,tail.z-points[0].z);
   let kick:Kick|null=null;try{kick=length>=MIN_STROKE_METRES?readStroke(points,world):null;}catch{kick=null;}
   scene.setAim(null,world.state);if(kick&&world.kick(kick))syncHud();settleUntil.current=performance.now()+400;wake.current();};
  const cancelAll=()=>{const st=stroke.current;stroke.current=null;hideMeter();if(st&&el.hasPointerCapture(st.id))el.releasePointerCapture(st.id);const w=worldRef.current;if(w)scene.setAim(null,w.state);wake.current();};
  cancelDrawing.current=cancelAll;
  const cancel=(e:PointerEvent)=>{if(stroke.current?.id===e.pointerId)cancelAll();};
  const blur=()=>cancelAll();const hidden=()=>{if(document.hidden)cancelAll();};
  window.addEventListener('blur',blur);document.addEventListener('visibilitychange',hidden);
  const placeMeter=(e:PointerEvent)=>{const m=loftMeter.current,r=el.getBoundingClientRect();if(m){m.style.left=`${e.clientX-r.left}px`;m.style.top=`${e.clientY-r.top}px`;}};
  const hideMeter=()=>{const m=loftMeter.current;if(m){m.dataset.active='false';m.style.setProperty('--loft','0');}};
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);el.addEventListener('lostpointercapture',cancel);
  if(process.env.NODE_ENV!=='production')(window as unknown as {__passPuzzle:unknown}).__passPuzzle={get world(){return worldRef.current;},get replay(){return replayRef.current;},scene,wake:()=>wake.current(),kick:(k:Kick)=>{const w=worldRef.current;const ok=!!w&&w.kick(k);syncHud();wake.current();return ok;},solution:(id:string)=>SCENARIO_SOLUTIONS[id]?.solution,naive:(id:string)=>SCENARIO_SOLUTIONS[id]?.naive};
  // The level list sits over the first puzzle's frozen pitch: one static frame, then sleep.
  if(SCENARIOS[0])try{const w=createPuzzle(SCENARIOS[0]);worldRef.current=w;scene.load(SCENARIOS[0]);scene.update(w.state,0);}catch{/* the play button reports real failures */}
  wake.current();
  return()=>{disposed=true;cancelDrawing.current=()=>{};window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);el.removeEventListener('lostpointercapture',cancel);scene.dispose();sceneRef.current=null;worldRef.current=null;replayRef.current=null;wake.current=()=>{};void audio.current?.close();audio.current=null;delete (window as unknown as {__passPuzzle?:unknown}).__passPuzzle;};
 },[finish,handleEvent]);

 /** Build the frozen moment for a level: the pitch shows behind the brief card. */
 const loadLevel=(s:Scenario)=>{const scene=sceneRef.current;if(!scene)return;replayRef.current=null;setReplaying(false);stroke.current=null;attemptEvents.current=[];
  try{const world=createPuzzle(s);worldRef.current=world;scene.load(s);scene.setAim(null,world.state);scene.update(world.state,0);}catch{setError(true);return;}
  setLevelId(s.id);setPackId(s.pack);setOutcome(null);setShowHint(false);syncHud();settleUntil.current=performance.now()+300;wake.current();};
 const openLevel=(s:Scenario)=>{loadLevel(s);setView('brief');};
 const play=()=>{unlock();coinVisit.current||=beginArcadeRun('puzzle');coinAttempt.current=beginArcadeRun('puzzle');recordExploreActivity('arcade');setView('play');const w=worldRef.current;if(w)sceneRef.current?.setAim(null,w.state);settleUntil.current=performance.now()+1200;wake.current();};
 const retry=()=>{coinVisit.current||=beginArcadeRun('puzzle');coinAttempt.current=beginArcadeRun('puzzle');const world=worldRef.current,scene=sceneRef.current;if(!world||!scene)return;replayRef.current=null;setReplaying(false);if(!world.retry()){loadLevel(world.scenario);setView('play');return;}attemptEvents.current=[];scene.resetActors();scene.update(world.state,0);scene.setAim(null,world.state);syncHud();setOutcome(null);setShowHint(true);setView('play');settleUntil.current=performance.now()+600;wake.current();};
 const watchAgain=()=>{const world=worldRef.current;if(!world)return;try{replayRef.current=replayAttempt(world.attemptStart(),world.inputs(),REPLAY_SPEED);}catch{return;}sceneRef.current?.resetActors();setReplaying(true);setView('play');wake.current();};
 const skipReplay=()=>{const rep=replayRef.current,world=worldRef.current;if(!rep||!world)return;replayRef.current=null;sceneRef.current?.setReplayFocus(null);sceneRef.current?.update(world.state,0);setReplaying(false);setView('result');wake.current();};
 useEffect(()=>{if(!replaying&&outcome&&view==='play'&&!replayRef.current&&worldRef.current?.state.result)setView('result');},[replaying,outcome,view]);
 const nextLevel=useMemo(()=>{const i=SCENARIOS.findIndex(s=>s.id===level?.id);return i>=0?SCENARIOS[i+1]:undefined;},[level]);
 const unlocked=(s:Scenario,list:Scenario[])=>{const i=list.indexOf(s);return i<=0||(progress.stars[list[i-1].id]??0)>0||(progress.stars[s.id]??0)>0;};
 const totalStars=Object.values(progress.stars).reduce((a,b)=>a+b,0);

 const star=(on:boolean,key:number)=><span key={key} className={on?styles.starOn:styles.starOff} aria-hidden="true">★</span>;
 const briefText=level?.brief[format]??'',hintText=level?.hint[format]??'';
 const inPlay=view==='play'&&!replaying;

 return <div className={`${arcade.game} ${styles.game}`} data-arcade-kind="pass-puzzle" data-view={view}>
  <canvas ref={canvas} tabIndex={0} aria-label="Pass Puzzles pitch. Draw from the ball to pass."/>
  <header className={`${arcade.header} ${styles.header}`}><BackButton label="Arcade" title="Back to arcade" onBack={()=>{cancelDrawing.current();onExit();}}/><div><small>{view==='levels'?'DRAW THE PASS':level?.concept.replace(/-/g,' ').toUpperCase()}</small><h2>{view==='levels'?'Pass Puzzles':level?.title}</h2></div>
   {view!=='levels'?<div className={styles.navigation}><button onClick={()=>{replayRef.current=null;setReplaying(false);setView('levels');wake.current();}}>Puzzles</button>{view==='play'&&!replaying?<button className={arcade.pause} onClick={()=>setShowHint(v=>!v)} aria-pressed={showHint} aria-label={showHint?'Hide hint':'Show hint'} data-tip="Hint"><Icon name="book" size={22}/></button>:null}</div>:<span/>}
  </header>
  {(view==='play'||view==='result')&&!replaying&&<div className={arcade.score} aria-live="polite"><strong>{hud.passes}/{level?.require.minPasses??0}</strong><span>passes · try {hud.attempt} of {hud.attempts}</span></div>}
  {inPlay&&hud.phase==='aiming'&&<p className={`${arcade.message} ${styles.tip}`}>{showHint?hintText:hud.passes>0?'Nice touch. Draw the next one.':'Drag toward a teammate or space. Release to pass. Hold the tip to lift.'}</p>}
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
   <span className={arcade.badge}>{format.toUpperCase()} BRIEF · {level.require.minPasses} PASS{level.require.minPasses===1?'':'ES'}</span><h3>{level.title}</h3><p>{briefText}</p>
   {showHint?<p className={styles.hint}><Icon name="book" size={16}/> {hintText}</p>:<button className={arcade.exit} onClick={()=>setShowHint(true)}>Show a hint</button>}
   {level.bonus&&<p className={styles.bonus}>Bonus ★ {level.bonus.label}</p>}
   <button className={arcade.primary} onClick={play}>Start puzzle</button><button className={arcade.exit} onClick={()=>setView('levels')}>All puzzles</button>
   <small>Drag to a teammate or open grass, then release. Curve your line to bend the pass. Hold the tip to lift it. Red rings warn of defenders.</small>
  </section></div>}

  {view==='result'&&outcome&&level&&<div className={`${arcade.overlay} ${styles.lowOverlay}`}><section className={arcade.card}>
   <span className={arcade.badge}>{outcome.success?'PUZZLE SOLVED':outcome.attemptsLeft>0?`${outcome.attemptsLeft} ${outcome.attemptsLeft===1?'TRY':'TRIES'} LEFT`:'OUT OF TRIES'}</span>
   <h3>{outcome.success?'That’s the move!':'Not this time.'}</h3>
   {outcome.success?<><div className={styles.stars} aria-label={`${outcome.stars} of 3 stars`}>{[0,1,2].map(n=>star(n<outcome.stars,n))}</div>
    <ul className={styles.earned}><li data-on="true">Solved with {outcome.passes} pass{outcome.passes===1?'':'es'}</li><li data-on={outcome.bonus}>{level.bonus?`Bonus: ${level.bonus.label}`:'Bonus'}</li><li data-on={outcome.firstTry}>First try</li></ul>
    <p className={styles.lesson}>{level.lesson}</p></>
   :<><p>{reasonCopy[outcome.reason??'']??'Look again at who can reach the ball.'}</p><p className={styles.hint}><Icon name="book" size={16}/> {hintText}</p></>}
   {outcome.success?(nextLevel?<button className={arcade.primary} onClick={()=>openLevel(nextLevel)}>Next puzzle</button>:<button className={arcade.primary} onClick={()=>setView('levels')}>All puzzles</button>)
    :<button className={arcade.primary} onClick={retry}>{outcome.attemptsLeft>0?'Try again':'Start over'}</button>}
   <div className={styles.row}><button className={`pixel-btn ${styles.secondary}`} onClick={watchAgain}><Icon name="play" size={16}/> Watch again</button>{outcome.success&&<button className={`pixel-btn ${styles.secondary}`} onClick={retry}><Icon name="reset" size={16}/> Replay level</button>}</div>
   <button className={arcade.exit} onClick={()=>setView('levels')}>All puzzles</button>
  </section></div>}

  {error&&<div className={arcade.overlay}><section className={arcade.card}><span className={arcade.badge}>TAKE A BREATHER</span><h3>The pitch couldn’t load.</h3><p>Return to the arcade and try again.</p><button className={arcade.exit} onClick={onExit}>Back to arcade</button></section></div>}
 </div>;
}
