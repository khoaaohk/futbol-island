'use client';
import StepIcon from '../StepIcon';
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent,type MouseEvent as ReactMouseEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {Exhibit} from '@/lib/endgame/museum';
import styles from './Cabinet.module.css';
import {BALL_R,GOAL_H,MARK,POWERS,WOBBLE,flightTime,keeperDepth,keeperTime,landing,odds,pickDive,reach,shotResult,toGoal,zoneOf,type Dive,type Era,type Power,type Result} from './model';
import {CHECKS,ERA_NAME,ERA_TEXT,RESULT_TEXT,STORY,ZONE_TEXT,compareText} from './content';
import {loop,rubber,spring,stepSpring} from './motion';
import type {PenaltyScene,SceneState,Shot} from './scene';

/**
 * penalty-1891 · the ARCADE CABINET (Oct 10 2026, user: "keep the white modern design, but add on the pixel penalty from the last
 * design" + "that was more interactive"). The 16-bit penalty shootout from the Oct 9 arcade pass, brought back as an exhibit
 * inside the exhibit: a framed screen on the white gallery wall, with its own wall label. The pixel art lives only inside the
 * frame; the page around it stays modern. It is the hands-on centrepiece: the modern sections explain (history, the 11 m line,
 * same kick under both rules), the cabinet is where you PLAY a shootout. Both use the same model (model.ts), so the numbers agree.
 *
 * The game, as before:
 *  0. Title + cutscene: the four STORY beats as arcade cards over the establishing shot of the keeper; "Skip: step up".
 *  1. Aim: drag on the goal. The reticle follows the finger; flick it and it glides, push past a post and it rubber-bands back.
 *  2. Power: HOLD Shoot. The arcade power bar charges on a spring through Soft → Firm → Blast; the spray grows while the keeper's
 *     reach shrinks. Let go to kick. A tap kicks at the chosen power (the power buttons and Enter do the same).
 *  3. The keeper dives (the island's bean rig), the crowd roars, the net bulges. "Same kick in 1891" replays the same kick and dive
 *     with the keeper 6 yards out. Five kicks make a round: the score screen (shot map, the same five under the other rules, one
 *     quick-check question a round, in turn, and "Take five more").
 *
 * Heat: three.js is imported only when the cabinet comes near the screen. The stage draws on change, loops only while something
 * moves (a shot, the camera, the keeper walking) and is put to sleep by an IntersectionObserver the moment the cabinet leaves the
 * screen (scene.setAwake). The HUD's own springs run one rAF chain only while a finger is down or a spring settles. Everything is
 * disposed on unmount. Frames at rest = 0. Reduced motion: no camera move, no flight (a shot jumps to its result), no hold-charge:
 * a static screen and tap-to-shoot.
 * Crisp pixels: the canvas is snapped to a whole number of buffer pixels (2–4 CSS px each) and upscaled image-rendering: pixelated.
 */
const AIM_X=[-5.2,5.2] as const,AIM_Y=[BALL_R,3.4] as const,ROUND=5,TAP_MS=170,CHARGE_S=1.15;
const clamp=(v:number,[a,b]:readonly [number,number])=>Math.max(a,Math.min(b,v));
type Phase='intro'|'aim'|'flying'|'result';
type Kick={x:number;y:number;dive:Dive;power:Power;era:Era;result:Result};
const ZONE_LABEL={outside:'Off target','top-corner':'Top corner','low-corner':'Low corner',middle:'The middle',near:'Near the keeper'} as const;
const POWER_KEYS=Object.keys(POWERS) as Power[];
const bandOf=(c:number):Power=>c<1/3?'soft':c<2/3?'firm':'blast';
const SEGMENTS=12;
/** CSS pixels per buffer pixel (same rule as scene.ts pixelScale): ≈440 buffer pixels on the long side, 2–4 CSS px each. */
const pixelFor=(w:number,h:number)=>Math.max(2,Math.min(4,Math.round(Math.max(w,h)/440)));

export default function Cabinet({exhibit,reduced,wake,onRound,onStory}:{exhibit:Exhibit;reduced:boolean;
 /** Bumped by the page's "Take a penalty" button: focus the cabinet's first control. */
 wake:number;
 /** A round of five is done and its quick check answered (a real ending of the exhibit). */
 onRound:()=>void;
 /** Scroll the page to the story. */
 onStory:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),screen=useRef<HTMLDivElement>(null),scene=useRef<PenaltyScene|null>(null),cab=useRef<HTMLDivElement>(null);
 const header=useRef<HTMLDivElement>(null),intro=useRef<HTMLDivElement>(null),primary=useRef<HTMLButtonElement>(null),shootBtn=useRef<HTMLButtonElement>(null);
 const chip=useRef<HTMLDivElement>(null),reachTag=useRef<HTMLSpanElement>(null),gauge=useRef<HTMLSpanElement>(null);
 const [phase,setPhase]=useState<Phase>('intro'),[era,setEra]=useState<Era>('today'),[power,setPower]=useState<Power>('firm');
 const [aim,setAim]=useState({x:1.3,y:1.2}),[shots,setShots]=useState<Shot[]>([]),[kicks,setKicks]=useState<Kick[]>([]),[roundStart,setRoundStart]=useState(0),[last,setLast]=useState<Result|null>(null);
 const [failed,setFailed]=useState(false),[moved,setMoved]=useState(false),[summary,setSummary]=useState(false),[busy,setBusy]=useState(false);
 const [near,setNear]=useState(false),[ready,setReady]=useState(0),[layout,setLayout]=useState(0),[charging,setCharging]=useState(false);
 const [beat,setBeat]=useState(0),[rounds,setRounds]=useState(0),[answer,setAnswer]=useState<number|null>(null);
 const [shown,setShown]=useState<Kick|null>(null),[compare,setCompare]=useState<{from:Kick;to:Kick}|null>(null),[replaying,setReplaying]=useState(false);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]),pxRef=useRef(0),inView=useRef(false),reducedRef=useRef(reduced);reducedRef.current=reduced;
 const roundShots=shots.slice(roundStart),roundKicks=kicks.slice(roundStart);
 const later=(f:()=>void,ms:number)=>{timers.current.push(setTimeout(f,ms));};
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);},[]);

 // Crisp pixels: snap the canvas to a whole number of buffer pixels (the browser then upscales by an integer, nearest-neighbour).
 useLayoutEffect(()=>{const sc=screen.current,c=canvas.current;if(!sc||!c)return;
  const fit=()=>{const w=sc.clientWidth,h=sc.clientHeight;if(!w||!h)return;const p=pxRef.current||(pxRef.current=pixelFor(w,h));
   c.style.width=`${Math.floor(w/p)*p}px`;c.style.height=`${Math.floor(h/p)*p}px`;};
  fit();const ro=new ResizeObserver(fit);ro.observe(sc);return()=>ro.disconnect();},[]);

 // Heat: one observer. Near the screen → load the stage (once). On screen → awake; off screen → asleep (no frames at all).
 useEffect(()=>{const el=screen.current;if(!el)return;
  if(typeof IntersectionObserver==='undefined'){setNear(true);inView.current=true;return;}
  const io=new IntersectionObserver(es=>{for(const e of es){
   if(e.isIntersecting&&e.intersectionRatio>0){inView.current=true;setNear(true);}else inView.current=false;
   scene.current?.setAwake(inView.current);}},{threshold:[0,.01]});
  const pre=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){setNear(true);pre.disconnect();}},{rootMargin:'600px 0px'});
  io.observe(el);pre.observe(el);return()=>{io.disconnect();pre.disconnect();};},[]);

 // Lazy-load the three.js stage (three + the island's character rig) when the cabinet is near; dispose it on unmount.
 useEffect(()=>{if(!near)return;let cancelled=false;const node=canvas.current;if(!node)return;
  import('./scene').then(({createPenaltyScene})=>{if(cancelled)return;try{
   const s=createPenaltyScene(node,{coarse:matchMedia('(pointer: coarse)').matches,reducedMotion:reducedRef.current,pixel:pxRef.current||undefined,onLayout:()=>!cancelled&&setLayout(n=>n+1)});
   s.setAwake(inView.current);scene.current=s;setReady(r=>r+1);}catch{setFailed(true);}}).catch(()=>!cancelled&&setFailed(true));
  return()=>{cancelled=true;scene.current?.dispose();scene.current=null;};},[near]);
 const sceneState:SceneState=useMemo(()=>({era,power,aimX:aim.x,aimY:aim.y,shots:roundShots,mode:phase}),[era,power,aim,roundShots.length,phase]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{scene.current?.set(sceneState);},[sceneState,ready]);

 // Tell the stage which part of the screen is free (not under the rules switch or, on wide screens, the cutscene card).
 useLayoutEffect(()=>{const sc=screen.current;if(!sc)return;
  const measure=()=>{const s=scene.current;if(!s)return;const R=sc.getBoundingClientRect(),W=R.width;
   const h=header.current?.getBoundingClientRect();let top=h&&h.height?Math.max(8,h.bottom-R.top+4):8,right=0,bottom=6,left=0;
   if(phase==='intro'){top=8;const b=intro.current?.getBoundingClientRect();
    if(b&&b.width>0&&b.top<R.bottom-8&&b.bottom>R.top+8){if(b.left-R.left>W*.4)right=R.right-b.left+8;else if(b.right-R.left<W*.62)left=b.right-R.left+8;else bottom=Math.max(6,R.bottom-b.top+8);}}
   s.setInsets({top,right,bottom,left});};
  measure();const ro=new ResizeObserver(measure);ro.observe(sc);if(intro.current)ro.observe(intro.current);if(header.current)ro.observe(header.current);
  return()=>ro.disconnect();},[ready,phase]);

 // The live goal-chance chip rides above the reticle; KEEPER REACH sits on top of the reach oval (written straight to the DOM).
 useLayoutEffect(()=>{const s=scene.current;if(!s)return;const c=chip.current,t=reachTag.current;
  if(c){const p=s.project(aim.x,aim.y+.42,0);c.style.transform=`translate(${p.x.toFixed(0)}px,${p.y.toFixed(0)}px) translate(-50%,-100%)`;}
  if(t){const {b}=reach(keeperTime(era,power)),cy=toGoal(era,0,1).y,sc=era==='1891'?MARK/(MARK-keeperDepth('1891')):1,top=Math.min(GOAL_H+.3,cy+b*sc);
   const p=s.project(0,top,0);t.style.transform=`translate(${p.x.toFixed(0)}px,${p.y.toFixed(0)}px) translate(-50%,-55%)`;}
 },[aim,era,power,layout,ready,phase]);

 // Every fifth kick ends a round: let the result land, then show the score screen.
 useEffect(()=>{if(phase!=='result'||replaying||compare||!roundShots.length||roundShots.length<ROUND)return;const t=setTimeout(()=>setSummary(true),reduced?0:1400);return()=>clearTimeout(t);},[roundShots.length,phase,replaying,compare,reduced]);

 // The page's "Take a penalty" button: focus the cabinet's first control.
 useEffect(()=>{if(!wake)return;const t=setTimeout(()=>{(phase==='intro'?primary.current:shootBtn.current)?.focus({preventScroll:true});},reduced?0:450);return()=>clearTimeout(t);},[wake]);// eslint-disable-line react-hooks/exhaustive-deps

 const live=useMemo(()=>odds(era,power,aim.x,aim.y),[era,power,aim]);
 const zone=zoneOf(aim.x,aim.y);
 const goals=shots.filter(s=>s.result==='goal').length,roundGoals=roundShots.filter(s=>s.result==='goal').length;

 const ready2=useCallback(()=>{if(phase==='result'&&!busy){setPhase('aim');setLast(null);setSummary(false);setCompare(null);setShown(null);scene.current?.reset();}},[phase,busy]);

 // ── Aim: a damped spring per axis (drag writes through with rubber-banding; release hands the velocity to the springs).
 const ax=useRef(spring(1.3)),ay=useRef(spring(1.2)),aimLoop=useRef<ReturnType<typeof loop>|null>(null);
 const showAim=useCallback((x:number,y:number)=>setAim({x:rubber(x,AIM_X[0],AIM_X[1],.55),y:rubber(y,AIM_Y[0],AIM_Y[1],.4)}),[]);
 const settleAim=useCallback(()=>{aimLoop.current?.stop();
  const X=ax.current,Y=ay.current;
  if(reducedRef.current){X.x=X.target=clamp(X.x,AIM_X);Y.x=Y.target=clamp(Y.x,AIM_Y);X.v=Y.v=0;setAim({x:X.x,y:Y.x});return;}
  X.target=clamp(X.x+X.v*.14,AIM_X);Y.target=clamp(Y.x+Y.v*.14,AIM_Y);
  aimLoop.current=loop(dt=>{const a=stepSpring(X,dt,170,24),b=stepSpring(Y,dt,170,24);showAim(X.x,Y.x);return !(a&&b);});},[showAim]);
 useEffect(()=>()=>aimLoop.current?.stop(),[]);
 const nudge=useCallback((dx:number,dy:number)=>{ready2();setMoved(true);aimLoop.current?.stop();const X=ax.current,Y=ay.current;
  X.x=X.target=clamp(X.x+dx,AIM_X);Y.x=Y.target=clamp(Y.x+dy,AIM_Y);X.v=Y.v=0;setAim({x:X.x,y:Y.x});},[ready2]);

 // ── Power: hold Shoot. A spring follows the charge; the band (Soft / Firm / Blast) follows it live. Reduced motion: tap only.
 const charge=useRef(spring(0)),hold=useRef<{t0:number;id:number;live:boolean}|null>(null),powerLoop=useRef<ReturnType<typeof loop>|null>(null),powerRef=useRef(power);powerRef.current=power;
 const paintGauge=useCallback((v:number)=>{const g=gauge.current;if(g)g.style.setProperty('--c',Math.max(0,Math.min(1.08,v)).toFixed(3));},[]);
 const runPower=useCallback(()=>{if(powerLoop.current?.running)return;
  powerLoop.current=loop(dt=>{const h=hold.current,C=charge.current;
   if(h){const held=performance.now()-h.t0;if(held>TAP_MS){if(!h.live){h.live=true;setCharging(true);}C.target=Math.min(1,(held-TAP_MS)/1000/CHARGE_S);
     const band=bandOf(C.target);if(band!==powerRef.current){powerRef.current=band;setPower(band);museumSfx.tick();}}}
   const rest=stepSpring(C,dt,260,20);paintGauge(C.x);return !!h||!rest;});},[paintGauge]);
 useEffect(()=>()=>powerLoop.current?.stop(),[]);

 const fire=useCallback((plan:{x:number;y:number;dive:Dive},opts:{era:Era;power:Power;replay?:Kick})=>{
  const s=scene.current;if(!s)return;
  const result=shotResult(opts.era,opts.power,plan.dive,plan.x,plan.y),kick:Kick={...plan,power:opts.power,era:opts.era,result};
  setPhase('flying');setLast(null);setBusy(true);setMoved(true);museumSfx.kick();
  s.shoot({...plan,result},()=>{
   if(opts.replay){setCompare({from:opts.replay,to:kick});setReplaying(false);}
   else{setShots(list=>[...list.slice(-29),{x:plan.x,y:plan.y,result}]);setKicks(list=>[...list.slice(-29),kick]);}
   setShown(kick);setLast(result);setPhase('result');
   if(!reducedRef.current&&result==='goal')navigator.vibrate?.(14);
   if(result==='goal'){museumSfx.net();museumSfx.crowd();}else if(result==='post'||result==='bar')museumSfx.stamp();else museumSfx.look();
  },()=>setBusy(false));
 },[]);

 const shoot=useCallback((p:Power=power)=>{
  if(phase!=='aim'&&!(phase==='result'&&!busy))return;if(!scene.current)return;setSummary(false);setCompare(null);
  if(roundShots.length>=ROUND){setRoundStart(shots.length);setRounds(r=>r+1);setAnswer(null);}
  aimLoop.current?.stop();const X=ax.current,Y=ay.current,x=clamp(X.x,AIM_X),y=clamp(Y.x,AIM_Y);X.x=X.target=x;Y.x=Y.target=y;X.v=Y.v=0;setAim({x,y});
  const w=WOBBLE[Math.floor(Math.random()*WOBBLE.length)],l=landing(x,y,p,w);
  fire({x:l.x,y:l.y,dive:pickDive(Math.random())},{era,power:p});
 },[phase,busy,power,era,roundShots.length,shots.length,fire]);
 const shootRef=useRef(shoot);shootRef.current=shoot;

 /** The same kick (same spot, same dive) under the other rules: the keeper walks to his 1891 spot (or back to his line) first. */
 const replayOther=()=>{const k=shown;if(!k||busy||phase!=='result')return;const other:Era=k.era==='1891'?'today':'1891';
  setReplaying(true);setBusy(true);setPhase('flying');setLast(null);setEra(other);scene.current?.reset();museumSfx.whistle();
  later(()=>{setBusy(false);fire({x:k.x,y:k.y,dive:k.dive},{era:other,power:k.power,replay:k});},reduced?60:1500);};

 const shootDown=(e:ReactPointerEvent<HTMLButtonElement>)=>{if(e.button>0||hold.current)return;const b=e.currentTarget;if(b.disabled)return;
  ready2();b.setPointerCapture(e.pointerId);hold.current={t0:performance.now(),id:e.pointerId,live:false};charge.current.target=0;if(!reducedRef.current)runPower();};
 const shootUp=(e:ReactPointerEvent<HTMLButtonElement>)=>{const h=hold.current;if(!h||h.id!==e.pointerId)return;hold.current=null;
  const p=h.live?bandOf(charge.current.target):powerRef.current;setCharging(false);charge.current.target=0;if(!reducedRef.current)runPower();
  if(e.type==='pointerup')shootRef.current(p);};
 // The keyboard (Enter/Space on the focused button) still clicks: kick at the chosen power. Pointer clicks were handled on release.
 const shootClick=(e:ReactMouseEvent<HTMLButtonElement>)=>{if(e.detail===0)shoot();};

 // Drag to aim. Touch and pen move the aim by how far you drag (the finger never hides the target); a mouse click on the goal
 // puts the aim right there, then drags it. Velocity is tracked for the flick.
 const drag=useRef<{id:number;x:number;y:number;t:number}|null>(null);
 const down=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(phase==='intro'||phase==='flying'||busy||drag.current||summary)return;ready2();aimLoop.current?.stop();
  drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,t:e.timeStamp};e.currentTarget.setPointerCapture(e.pointerId);const X=ax.current,Y=ay.current;X.v=Y.v=0;
  if(e.pointerType==='mouse'&&scene.current){const r=e.currentTarget.getBoundingClientRect(),p=scene.current.unproject(e.clientX-r.left,e.clientY-r.top);
   if(p.x>AIM_X[0]-.5&&p.x<AIM_X[1]+.5&&p.y>-.5&&p.y<AIM_Y[1]+.4){X.x=X.target=clamp(p.x,AIM_X);Y.x=Y.target=clamp(p.y,AIM_Y);setAim({x:X.x,y:Y.x});setMoved(true);}}};
 const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const d=drag.current,s=scene.current;if(!d||d.id!==e.pointerId||!s)return;
  const r=e.currentTarget.getBoundingClientRect(),a=s.unproject(d.x-r.left,d.y-r.top),b=s.unproject(e.clientX-r.left,e.clientY-r.top),dt=Math.max(.008,(e.timeStamp-d.t)/1000);d.x=e.clientX;d.y=e.clientY;d.t=e.timeStamp;
  const g=e.pointerType==='mouse'?1:1.25,dx=(b.x-a.x)*g,dy=(b.y-a.y)*g,X=ax.current,Y=ay.current;
  X.x+=dx;Y.x+=dy;X.target=X.x;Y.target=Y.x;X.v=X.v*.6+dx/dt*.4;Y.v=Y.v*.6+dy/dt*.4;setMoved(true);showAim(X.x,Y.x);};
 const up=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const d=drag.current;if(d?.id!==e.pointerId)return;drag.current=null;
  if(e.timeStamp-d.t>80){ax.current.v=0;ay.current.v=0;}settleAim();};

 // Keyboard, while focus is inside the cabinet: arrows aim, Enter/Space shoot, Escape closes the score screen (and stops there,
 // so the page's own Escape (leave the exhibit) only runs when the score screen is not open).
 const onKey=(e:ReactKeyboardEvent<HTMLDivElement>)=>{
  if(e.key==='Escape'){if(summary){e.preventDefault();setSummary(false);}return;}
  if(phase==='intro'||summary)return;const step=e.shiftKey?.4:.12;
  if(e.key==='ArrowLeft'){e.preventDefault();nudge(-step,0);}else if(e.key==='ArrowRight'){e.preventDefault();nudge(step,0);}
  else if(e.key==='ArrowUp'){e.preventDefault();nudge(0,step);}else if(e.key==='ArrowDown'){e.preventDefault();nudge(0,-step);}
  else if((e.key==='Enter'||e.key===' ')&&!(e.target instanceof HTMLButtonElement)){e.preventDefault();shoot();}};

 // While the score screen is open, Escape closes it first wherever focus is (capture: before the page's own Escape = leave).
 useEffect(()=>{if(!summary)return;const k=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();setSummary(false);}};
  window.addEventListener('keydown',k,true);return()=>window.removeEventListener('keydown',k,true);},[summary]);
 const begin=()=>{museumSfx.whistle();setPhase('aim');later(()=>shootBtn.current?.focus({preventScroll:true}),40);};
 const pct=(v:number)=>`${Math.round(v*100)}%`;
 const aimLabel=`Aim ${Math.abs(aim.x).toFixed(1)} m ${aim.x<0?'left':'right'} of the middle, ${aim.y.toFixed(1)} m up. On target ${pct(live.onTarget)}, goal chance ${pct(live.goal)}.`;
 const eraIndex=era==='1891'?0:1,powerIndex=POWER_KEYS.indexOf(power);
 // Stage geometry for the result banner (the goal's centre column; the pitch in front of the goal).
 const s=scene.current,stageX=s&&ready?s.project(0,GOAL_H/2,0).x:undefined,bannerY=s&&ready?s.project(0,0,6.2).y:undefined;void layout;
 const fresh=roundShots.length>=ROUND&&phase==='aim',dots=Array.from({length:ROUND},(_,i)=>fresh?undefined:roundShots[i]?.result);
 // The round under the other rules: the same five kicks, the same dives.
 const otherEra:Era=roundKicks[0]?.era==='1891'?'today':'1891';
 const otherGoals=roundKicks.filter(k=>shotResult(k.era==='1891'?'today':'1891',k.power,k.dive,k.x,k.y)==='goal').length;
 const canCompare=phase==='result'&&!!shown&&!compare&&!busy;
 const banner=compare?{era:compare.to.era,result:compare.to.result}:shown?{era:shown.era,result:shown.result}:null;
 const pos=stageX!=null&&bannerY!=null?{left:stageX,top:bannerY}:undefined;
 const c=CHECKS[rounds%CHECKS.length];

 return <div ref={cab} className={styles.cab} data-cabinet data-cab-era={era} data-phase={phase} data-summary={summary||undefined} data-charging={charging||undefined} data-reduced={reduced||undefined} onKeyDown={onKey}>
  <div className={styles.body}>
   <div ref={screen} className={styles.screen}>
    <canvas ref={canvas} className={styles.canvas} tabIndex={phase==='intro'?-1:0} role="img" aria-label={`A penalty drawn as 16-bit pixel art: a goal 7.32 metres wide, 11 metres away, and you at the spot. ${aimLabel} Arrow keys aim, Enter shoots.`}
     onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}/>
    <span className={styles.scan} aria-hidden="true"/>
    {failed&&<p className={styles.error}>The arcade couldn’t start on this device. The story and the goal below still work.</p>}

    <div ref={header} className={styles.header}>
     {phase!=='intro'&&<div className={styles.era} role="group" aria-label="Which rules (arcade)" style={{'--i':eraIndex} as CSSProperties}>
      <span className={styles.thumb} aria-hidden="true"/>
      {(['1891','today'] as const).map(v=><button key={v} type="button" aria-pressed={era===v} data-cab-era-button={v} disabled={busy} onClick={()=>{ready2();setEra(v);}}>{v==='today'?'Today':'1891'}</button>)}
     </div>}
    </div>

    {phase!=='intro'&&<div ref={chip} className={styles.chip} data-hidden={phase!=='aim'||undefined} aria-hidden="true"><span>Goal</span><b>{pct(live.goal)}</b></div>}
    {phase!=='intro'&&<span ref={reachTag} className={styles.reachTag} data-hidden={phase!=='aim'||undefined} aria-hidden="true">Keeper reach</span>}
    {phase==='aim'&&!moved&&<p className={styles.hint} style={pos} aria-hidden="true"><span className={styles.hintDot}/>{reduced?'Drag to aim · tap SHOOT':'Drag to aim · hold SHOOT'}</p>}

    {phase==='result'&&last&&banner&&!summary&&<div key={compare?'c':'r'} className={styles.result} style={pos} data-result={last} role="status">
     {compare&&<em className={styles.resultEra}>Same kick · {ERA_NAME[compare.to.era]}</em>}
     <b>{RESULT_TEXT[last].big}</b>
     <span>{compare?compareText(compare.to.era,compare.from.result,compare.to.result):RESULT_TEXT[last].line}</span>
     {compare&&<span className={styles.vs} aria-label={`${ERA_NAME[compare.from.era]}: ${RESULT_TEXT[compare.from.result].big} ${ERA_NAME[compare.to.era]}: ${RESULT_TEXT[compare.to.result].big}`}>
      <i data-result={compare.from.result}>{compare.from.era==='1891'?'1891':'Today'} · {RESULT_TEXT[compare.from.result].big}</i>
      <i data-result={compare.to.result}>{compare.to.era==='1891'?'1891':'Today'} · {RESULT_TEXT[compare.to.result].big}</i></span>}
     {canCompare&&<button type="button" className={styles.compare} onClick={replayOther}><StepIcon kind="play" size={16}/>Same kick {shown!.era==='1891'?'today':'in 1891'}</button>}
    </div>}
    {replaying&&phase==='flying'&&<p className={styles.walk} style={pos} role="status">{era==='1891'?'1891: the keeper walks 6 yards out…':'Today: the keeper goes back to his line…'}</p>}
   </div>

   {/* Title + cutscene: on wide screens a card over the stage; on phones it sits below the screen. */}
   {phase==='intro'&&<div ref={intro} className={styles.introCard} data-beat={beat}>
    {beat===0?<div key="title" className={styles.beat}>
     <p className={styles.kicker}>Press start · {exhibit.year}</p>
     <h3 className={styles.headline}>Step up to the <em>spot</em>.</h3>
     <p className={styles.deck}>Five penalties against the keeper. First: why football needed them.</p>
    </div>:<div key={beat} className={styles.beat} aria-live="polite">
     <p className={styles.kicker}>{STORY[beat-1].when}</p>
     <h3 className={styles.beatHead}><span className={styles.beatIcon} data-icon={STORY[beat-1].icon} aria-hidden="true">{beat}</span>{STORY[beat-1].head}</h3>
     <p className={styles.deck}>{STORY[beat-1].text}</p>
    </div>}
    <ol className={styles.pips} aria-label={`Story ${beat} of ${STORY.length}`}>{STORY.map((_,i)=><li key={i} data-on={i<beat||undefined}/>)}</ol>
    <div className={styles.introButtons}>
     {beat<STORY.length
      ?<><button ref={primary} type="button" className={styles.primary} data-museum-own-cue data-cab-start onClick={()=>{museumSfx.tick();setBeat(b=>b+1);}}>{beat===0?'How it happened ▸':'Next ▸'}</button>
       <button type="button" className={styles.ghost} data-cab-skip onClick={begin}>Skip: step up</button></>
      :<button ref={primary} type="button" className={styles.primary} data-museum-own-cue data-cab-start onClick={begin}>Step up to the spot ▸</button>}
    </div>
   </div>}

   {phase!=='intro'&&<div className={styles.dock}>
    <div className={styles.line}>
     <span className={styles.zoneTag} data-zone={zone}>{ZONE_LABEL[zone]}</span>
     <ol className={styles.round} aria-label={`This round: ${roundShots.length} of ${ROUND} kicks taken, ${roundGoals} scored`}>{dots.map((r,i)=><li key={i} data-result={r}/>)}</ol>
     <p className={styles.zone} aria-live="polite">{charging?'Harder kicks wobble more (the yellow spray grows), but the keeper gets less time (his blue reach shrinks).':phase==='aim'&&!busy?`${era==='1891'?'1891 rules: ':''}${ZONE_TEXT[zone]}`:ERA_TEXT[era]}</p>
    </div>
    <dl className={styles.stats}>
     <div data-k="target"><dt>On target</dt><dd>{pct(live.onTarget)}</dd><i style={{transform:`scaleX(${live.onTarget})`}}/></div>
     <div data-k="reach"><dt>Keeper</dt><dd>{pct(live.reach)}</dd><i style={{transform:`scaleX(${live.reach})`}}/></div>
     <div data-k="goal"><dt>Goal</dt><dd>{pct(live.goal)}</dd><i style={{transform:`scaleX(${live.goal})`}}/></div>
    </dl>
    <div className={styles.power} role="group" aria-label="How hard" style={{'--i':powerIndex} as CSSProperties}>
     <span className={styles.thumb} aria-hidden="true"/>
     {POWER_KEYS.map(p=><button key={p} type="button" aria-pressed={power===p} disabled={busy} onClick={()=>{ready2();setPower(p);}} aria-label={`${POWERS[p].label}: ${POWERS[p].kmh} kilometres an hour`}>
      <b>{POWERS[p].label}</b><small>{POWERS[p].kmh}</small></button>)}
    </div>
    <button ref={shootBtn} type="button" className={styles.shoot} data-museum-own-cue data-cab-shoot onPointerDown={shootDown} onPointerUp={shootUp} onPointerCancel={shootUp} onClick={shootClick}
     onContextMenu={e=>e.preventDefault()} disabled={busy||phase==='flying'||!!failed||summary||!ready} aria-describedby="pk-shoot-help">
     <span className={styles.shootLabel}>{phase==='result'?'Again':'Shoot'}</span>
     <span ref={gauge} className={styles.gauge} aria-hidden="true">{Array.from({length:SEGMENTS},(_,i)=><i key={i} style={{'--k':i/SEGMENTS} as CSSProperties}/>)}</span>
    </button>
    <p id="pk-shoot-help" className={styles.srOnly}>{reduced?'Tap to kick at the chosen power.':'Tap to kick at the chosen power, or hold to power up and let go to kick.'}</p>
    <p className={styles.meta}>Ball <b>{flightTime(power).toFixed(2)} s</b> · keeper <b>{keeperTime(era,power).toFixed(2)} s</b>{shots.length>0&&<> · goals <b>{goals}/{shots.length}</b></>}</p>
   </div>}

   {summary&&<div className={styles.summary} role="dialog" aria-label="Your five penalties" data-cab-score>
    <p className={styles.kicker}>Full time · five penalties</p>
    <h3 className={styles.summaryHead}>{roundGoals}<span>/{ROUND}</span> <em>scored</em></h3>
    <svg className={styles.map} viewBox={`${-4.3} ${-GOAL_H-.5} 8.6 ${GOAL_H+.7}`} shapeRendering="crispEdges" aria-label={`Your shot map: ${roundGoals} goals, ${ROUND-roundGoals} misses or saves`}>
     <rect x={-3.66} y={-GOAL_H} width={7.32} height={GOAL_H} className={styles.mapMouth}/>
     <path d={`M-3.66 0V${-GOAL_H}H3.66V0`} className={styles.mapFrame}/>
     <line x1={-4.3} x2={4.3} y1={0} y2={0} className={styles.mapLine}/>
     {roundShots.map((r,i)=><rect key={i} x={r.x-.17} y={-r.y-.17} width={.34} height={.34} className={styles.mapDot} data-result={r.result} style={{'--d':`${i*90}ms`} as CSSProperties}/>)}
    </svg>
    {roundKicks.length===ROUND&&<p className={styles.other}><b>Same five kicks under {ERA_NAME[otherEra]}:</b> {otherGoals} {otherGoals===1?'goal':'goals'}. {otherEra==='1891'
     ?(otherGoals<roundGoals?'A keeper 6 yards out saves more. That is why, since 1905, he has to stay on his line.':'Your kicks were out of his reach either way.')
     :(otherGoals>roundGoals?'Keepers on the line save fewer: that is today’s rule since 1905.':'Your kicks did the same either way.')}</p>}
    <div className={styles.check} role="group" aria-label={`Quick check: ${c.q}`}>
     <p className={styles.checkQ}><b>Quick check · {rounds%CHECKS.length+1} of {CHECKS.length}</b>{c.q}</p>
     <div className={styles.checkOpts}>{c.options.map((o,j)=><button key={j} type="button" className={styles.checkOpt} disabled={answer!=null}
      data-state={answer==null?undefined:j===c.answer?'right':j===answer?'wrong':'off'} onClick={()=>{setAnswer(j);if(j===c.answer)museumSfx.net();else museumSfx.look();onRound();}}>{o}</button>)}</div>
     {answer!=null&&<p className={styles.checkWhy} role="status"><b>{answer===c.answer?'Right!':'Not quite.'}</b> {c.why}</p>}
    </div>
    <p className={styles.summaryTake}><b>Take it to your game:</b> {exhibit.forYourGame}</p>
    <div className={styles.summaryButtons}>
     <button type="button" className={styles.primary} data-museum-own-cue onClick={()=>{setSummary(false);setRoundStart(shots.length);setRounds(r=>r+1);setAnswer(null);ready2();}}>Take five more</button>
     <button type="button" className={styles.ghost} onClick={()=>{setSummary(false);onStory();}}>Read the story</button>
    </div>
   </div>}
  </div>
 </div>;
}
