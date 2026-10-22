'use client';
import {useCallback,useEffect,useMemo,useReducer,useRef,useState,type CSSProperties,type PointerEvent as RPE} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import ExperienceBack from '../ExperienceBack';
import WallLabel from '../modern/WallLabel';
import StepCheck from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {useReduced} from '../modern/hooks';
import g from '../modern/gallery.module.css';
import {ISO_CSS} from '../anatomy/iso-kit';
import {fit,frameFor,useBox,useLive,useRaf} from '../anatomy/bench';
import {Hood,LaneLive,LaneStatic,RigLive,RigStatic,lanePoints,metresAt,rigPoints} from './scene';
import {CHECK,EXTRA_SOURCES,HEAD_PAIN,HEAD_STUDY,LEATHER,LEATHER_GAIN,LEATHER_GAIN_PCT,NO_LACES_1966,SIZES,YEATS} from './facts';
import {BEATS,BEST_KEY,PRACTICE_NOTE} from './content';
import {DMAX,KICKS,MAX_POINTS,carry,carryFactor,dryCarry,gramsOf,minuteOf,powerAt,scoreKick,targets,verdict,type MatchBall} from './match';
import {MODERN_G,SOAK_SECONDS,TAP_SOAK,flightAt,gramsAt,leatherTone,minutesAt} from './model';
import {FigureStage,type FigureHandle} from '../anatomy/FigureStage';
import fs from '../anatomy/FigureStage.module.css';
import {makeLeatherFigure,type BallMode} from './figure';
import {LOOK_INTRO,LOOK_SAY} from './facts';
import s from './Experience.module.css';

/**
 * laced-leather · "The weather machine" (Oct 12 2026 anatomy restyle; user: "these games should not be the pixel style", "larger
 * and fill the entire screen", then every exhibit except the penalty kick in the anatomy isometric Paper style). The pixel game's
 * rules and numbers are kept; the drawing is a crafted bench machine that fills the play area at every size.
 *
 *  1. The rain machine: hold RAIN (the button, the hood, or Space). Water falls from the hood's nozzles onto two dial scales: the
 *     laced leather ball darkens and its needle climbs 410 → 595 g as the minutes run to 90 (the 2023 lab test); the modern ball's
 *     needle stays at 430 g.
 *  2. The rain match (match.ts): eight long passes from minute 0 to minute 90. Hold Kick (or press and hold the pitch): the blue
 *     marker sweeps along the metre ruler to where a DRY ball would land; let go to kick. The leather ball soaks as the match goes
 *     on and the same kick lands shorter, so you must aim past your team-mate. 3 / 2 / 1 / 0 points by how close it lands.
 *     Replay with the modern ball.
 *  3. Full time: points, the quick check, then the gallery ending (onComplete once, via Ending `reached`). Best per ball saved.
 * Heat: React draws only on change; the frame loop (anatomy/paper-loop.ts, via bench useRaf) runs only while it rains, while the marker sweeps or while the
 * ball flies, pauses off screen or in a hidden tab, and is cancelled on unmount. Reduced motion: RAIN taps add 15 minutes, tap
 * the pitch to place the marker then tap Kick, the ball lands at once.
 */
type Phase='intro'|'machine'|'match'|'score'|'look';
type Result={pts:number;landed:number;target:number;say:string};
const readBest=():Partial<Record<MatchBall,number>>=>{try{return JSON.parse(localStorage.getItem(BEST_KEY)||'{}')||{};}catch{return {};}};
const saveBest=(b:Partial<Record<MatchBall,number>>)=>{try{localStorage.setItem(BEST_KEY,JSON.stringify(b));}catch{/* private mode */}};

/** Keep the pointer while a finger holds (a synthetic or lost pointer just skips it). */
const capture=(e:{currentTarget:EventTarget;pointerId:number})=>{try{(e.currentTarget as Element).setPointerCapture?.(e.pointerId);}catch{/* no active pointer */}};

export default function Experience({exhibit,onClose,onComplete}:ExperienceProps){
 const reduced=useReduced();
 const card=useRef<HTMLDivElement>(null),svgRef=useRef<SVGSVGElement>(null),readRef=useRef<HTMLSpanElement>(null),endRef=useRef<HTMLDivElement>(null);
 const box=useBox(card),live=useLive(card);
 const say=useCallback((t:string)=>{if(readRef.current&&readRef.current.textContent!==t)readRef.current.textContent=t;},[]);
 const [phase,setPhase]=useState<Phase>('intro');
 const phaseRef=useRef(phase);phaseRef.current=phase;
 const [,redraw]=useReducer((n:number)=>n+1,0);
 // Rain machine.
 const rig=useRef({soak:0,raining:false});
 const [soak,setSoak]=useState(0);
 // Rain match.
 const [ballKind,setBallKind]=useState<MatchBall>('leather');
 const [list,setList]=useState<number[]>(()=>targets());
 const [results,setResults]=useState<Result[]>([]);
 const k=results.length;
 const m=useRef({aim:null as number|null,ball:null as {u:number;z:number}|null,landed:null as number|null,t:0,to:0,flying:false,charging:false,c0:0,power:.5,kicking:false});
 const [flash,setFlash]=useState<{big:string;line:string}|null>(null);
 const [picked,setPicked]=useState<number|null>(null),[best,setBest]=useState<Partial<Record<MatchBall,number>>>({});
 const [note,setNote]=useState('');
 useEffect(()=>{setBest(readBest());},[]);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const later=(f:()=>void,ms:number)=>{timers.current.push(setTimeout(f,ms));};
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{const kk=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose();}};window.addEventListener('keydown',kk);return()=>window.removeEventListener('keydown',kk);},[onClose]);

 // Turn the ball (museum-figures-2, figure kit v2): made once; `lookFrom` is the phase to go back to. Labels light for 1.8 s.
 const fig=useMemo(()=>makeLeatherFigure(),[]),figHandle=useRef<FigureHandle|null>(null),lookFrom=useRef<Phase>('intro');
 const [lit,setLit]=useState<string[]>([]),[lookNote,setLookNote]=useState(LOOK_INTRO),[ballMode,setBallMode]=useState<BallMode>('old');
 const openLook=()=>{lookFrom.current=phaseRef.current;setPhase('look');museumSfx.card();};
 const sayOf=(id:string,mode:BallMode)=>LOOK_SAY[mode==='new'&&(id==='panel'||id==='bladder')?(id==='panel'?'newPanel':'newBladder'):id]??LOOK_INTRO;
 const touchPart=(id:string)=>{setLit([id]);setLookNote(sayOf(id,fig.mode));museumSfx.tick();later(()=>setLit(l=>l[0]===id?[]:l),1800);};
 const swapBall=()=>{const m:BallMode=fig.mode==='old'?'new':'old';fig.setMode(m);setBallMode(m);setLit([]);setLookNote(m==='new'?LOOK_SAY.valve:LOOK_SAY.opening);figHandle.current?.invalidate();museumSfx.card();};
 const W=box.w||1,H=box.h||1,orient=W>=H*1.05?'wide':'tall',FL=useMemo(()=>frameFor(orient),[orient]),FM=useMemo(()=>frameFor('wide'),[]);
 const pad=Math.round(Math.max(18,Math.min(W,H)*.05));
 const machineView=phase==='intro'||phase==='machine';
 // The machine always stands with its two scales side by side (on a phone too: it is tall, so it fills a portrait card); the
 // match lane turns with the screen (along it on a desktop, up it on a phone).
 const F=machineView?FM:FL,hoodH=orient==='wide'?246:360;
 const P0=useMemo(()=>machineView?fit(F,rigPoints(hoodH),W,H-34,pad,orient==='wide'?30:40):fit(F,lanePoints(),W,H-34,pad,orient==='wide'?36:50),[F,W,H,pad,orient,machineView,hoodH]);
 const P=useMemo(()=>({...P0,origin:[P0.origin[0],P0.origin[1]+12] as [number,number]}),[P0]);
 const kk=Math.min(k,KICKS-1),grams=gramsOf(ballKind,kk),target=list[kk];
 const live2=useRef({k,target,ballKind,list});live2.current={k,target,ballKind,list};

 // One loop: rain while held, the power sweep while charging, the ball's flight. It stops when none of these is happening.
 const wake=useRaf((dt)=>{
  const r=rig.current;
  if(phaseRef.current==='machine'&&r.raining){r.soak=Math.min(1,r.soak+dt/SOAK_SECONDS);say(`${gramsAt(r.soak)} g · ${minutesAt(r.soak)} min`);setSoak(r.soak);
   if(r.soak>=1){stopRain();return false;}return true;}
  const M=m.current;
  if(M.charging){M.power=powerAt(performance.now()-M.c0);M.aim=dryCarry(M.power);say(`Dry ball: ${M.aim.toFixed(0)} m`);redraw();return true;}
  if(M.flying){M.t+=dt;const f=flightAt(M.to,M.t);M.ball={u:f.u,z:f.z};M.kicking=M.t<.25;redraw();if(f.done){land();return false;}return true;}
  return false;},live);

 // ── The rain machine ───────────────────────────────────────────────────────────────────────────────────────────────────
 const full=soak>=1;
 const startRain=()=>{if(phaseRef.current!=='machine'||rig.current.soak>=1)return;const r=rig.current;
  if(reduced){r.soak=Math.min(1,r.soak+TAP_SOAK+1e-9);setSoak(r.soak);museumSfx.flapBook();say(`${gramsAt(r.soak)} g · ${minutesAt(r.soak)} min`);if(r.soak>=1)soaked();return;}
  r.raining=true;museumSfx.flapBook();redraw();wake();};
 const stopRain=()=>{const r=rig.current;if(!r.raining)return;r.raining=false;setSoak(r.soak);redraw();if(r.soak>=1)soaked();};
 const soaked=()=>{museumSfx.reveal();setFlash({big:`+${LEATHER_GAIN} g`,line:`${LEATHER_GAIN_PCT}% heavier after ${LEATHER.soakMinutes} minutes. The modern ball: still ${MODERN_G} g.`});later(()=>setFlash(null),2800);};
 const startMachine=()=>{const r=rig.current;r.soak=0;r.raining=false;setSoak(0);setPhase('machine');say(`${LEATHER.dry} g · 0 min`);};

 // ── The rain match ─────────────────────────────────────────────────────────────────────────────────────────────────────
 const startMatch=(b:MatchBall)=>{const t=targets();setList(t);setResults([]);setBallKind(b);setPicked(null);setFlash(null);
  const M=m.current;M.aim=null;M.ball=null;M.landed=null;M.t=0;M.flying=false;M.charging=false;M.kicking=false;
  setNote(b==='leather'?(reduced?'Kick-off: the leather ball is dry. Tap the pitch where a dry ball should land, then tap Kick.':'Kick-off: the leather ball is dry. Hold Kick and let go when the blue marker reaches your team-mate.'):'The modern ball: it stays the same weight all match.');
  setPhase('match');phaseRef.current='match';museumSfx.whistle();say(`Minute 0 · ${gramsOf(b,0)} g`);};
 const charge=()=>{const M=m.current;if(phaseRef.current!=='match'||M.flying||M.charging||live2.current.k>=KICKS)return;
  if(reduced){if(M.aim==null)M.aim=DMAX/2;redraw();return;}
  M.charging=true;M.c0=performance.now();M.landed=null;M.ball=null;wake();};
 const release=()=>{const M=m.current;if(phaseRef.current!=='match'||M.flying||live2.current.k>=KICKS)return;
  if(reduced){kick((M.aim??DMAX/2)/DMAX);return;}
  if(!M.charging)return;M.charging=false;kick(M.power);};
 const kick=(p:number)=>{const M=m.current,L=live2.current,gr=gramsOf(L.ballKind,L.k);
  M.to=carry(p,gr);M.t=0;M.aim=dryCarry(p);M.landed=null;M.ball={u:0,z:0};museumSfx.kick();say(`Kick ${Math.round(p*100)}% · ${gr} g`);
  if(reduced){M.ball={u:M.to,z:0};land();return;}M.flying=true;wake();};
 function land(){const M=m.current,L=live2.current;M.flying=false;M.kicking=false;M.landed=M.to;const r=scoreKick(M.to,L.target);museumSfx[r.pts>=2?'net':'tick']();
  setResults(rs=>{const next=[...rs,{pts:r.pts,landed:M.to,target:L.target,say:r.say}];
   if(next.length>=KICKS){const total=next.reduce((a,b)=>a+b.pts,0);setBest(b=>{const n={...b,[L.ballKind]:Math.max(b[L.ballKind]??0,total)};saveBest(n);return n;});later(()=>{setFlash(null);setPhase('score');museumSfx.crowd();},reduced?700:1700);}
   else later(()=>{const N=m.current;N.ball=null;N.landed=null;N.aim=null;setFlash(null);say(`Minute ${minuteOf(next.length)} · ${gramsOf(L.ballKind,next.length)} g`);redraw();},reduced?900:1500);
   return next;});
  setFlash({big:r.pts?`+${r.pts}`:'Miss',line:r.say});
  setNote(L.ballKind==='leather'&&L.k>=2&&r.miss<-1.5?`The ball is ${gramsOf('leather',L.k)} g now: the same kick goes shorter. Aim past your team-mate.`:r.say);redraw();}

 // Pointer on the drawing: hold on the machine to rain; on the pitch, hold to charge (reduced motion: tap to place the marker).
 const local=(e:{clientX:number;clientY:number})=>{const r=svgRef.current?.getBoundingClientRect();return r?[e.clientX-r.left,e.clientY-r.top] as const:[0,0] as const;};
 const onDown=(e:RPE<SVGSVGElement>)=>{capture(e);
  if(phase==='machine'){startRain();return;}
  if(phase!=='match')return;
  if(reduced){const [x,y]=local(e),u=metresAt(F,P,x,y);m.current.aim=Math.max(1,Math.min(DMAX,u));say(`Dry ball: ${m.current.aim.toFixed(0)} m`);redraw();return;}
  charge();};
 const onUp=()=>{if(phase==='machine'){stopRain();return;}if(phase==='match'&&!reduced)release();};
 const keyDown=(e:React.KeyboardEvent)=>{if(e.repeat)return;
  if(e.key===' '||e.key==='Enter'){e.preventDefault();if(phase==='machine')startRain();else if(phase==='match')charge();}
  if(phase==='match'&&reduced&&(e.key==='ArrowUp'||e.key==='ArrowRight'||e.key==='ArrowDown'||e.key==='ArrowLeft')){e.preventDefault();const M=m.current,d=e.key==='ArrowUp'||e.key==='ArrowRight'?1:-1;M.aim=Math.max(1,Math.min(DMAX,(M.aim??DMAX/2)+d*(e.shiftKey?.5:2)));say(`Dry ball: ${M.aim.toFixed(0)} m`);redraw();}};
 const keyUp=(e:React.KeyboardEvent)=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(phase==='machine')stopRain();else if(phase==='match')release();}};

 const total=results.reduce((a,b)=>a+b.pts,0);
 const checked=picked!=null;
 const check=CHECK[0];
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...EXTRA_SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const hint=phase==='machine'?(reduced?'Tap Rain: 15 minutes a tap':'Hold Rain to soak both balls'):phase==='match'?(reduced?'Tap the pitch to aim, then tap Kick':'Hold to aim, let go to kick'):'A rainy Saturday';
 const label=phase==='match'||phase==='score'?`A muddy pitch in the rain, minute ${minuteOf(kk)}. Your team-mate waits ${target} metres up the pitch. The ${ballKind==='leather'?'leather':'modern'} ball weighs ${grams} grams.`
  :`The rain machine: a hood with nozzles over two dial scales. The laced leather ball weighs ${gramsAt(soak)} grams after ${minutesAt(soak)} minutes; the modern ball ${MODERN_G} grams.`;
 const M=m.current,ready=box.w>0;

 return <section role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="laced-leather"
  className={`${g.room} iso ${s.root}`} data-theme="light" data-phase={phase} data-ball={ballKind} data-soak={soak.toFixed(2)} data-pass={k} data-score={total} data-orient={orient} data-reduced={reduced||undefined} style={{'--accent':'#2a5bd7'} as CSSProperties}>
  <style dangerouslySetInnerHTML={{__html:ISO_CSS}}/>
  <ExperienceBack onClose={onClose}/>
  <div className={`${g.scroll} ${s.scroll}`} data-scroll>
   <div className={s.screen} data-play-screen>
    <header className={s.head}><WallLabel as="h1" title={exhibit.title} meta={exhibit.year} caption="Make it rain on a leather ball, then play a whole match with it." className={s.label}/></header>

    <div ref={card} className={s.card} data-play-area data-fill-screen tabIndex={0} onKeyDown={keyDown} onKeyUp={keyUp} aria-label={label}>
     <div className={s.corners} aria-hidden="true">
      <span data-corner="fig">Fig. 1966</span><span data-corner="title">{machineView?'The weather machine':'The rain match'}</span>
      <span data-corner="hint">{hint}</span><span data-corner="readout" ref={readRef}>{LEATHER.dry} g · 0 min</span>
     </div>
     {phase==='look'&&<FigureStage spec={fig.spec} active={lit} reduced={reduced} onLabel={touchPart} handle={figHandle} top={28}
      label={ballMode==='old'?'An old laced leather ball on a display cup: leather panels, a lace and the lace-up opening':'A modern size 5 ball on a display cup: stitched panels and a small valve'}
      extra={<button type="button" className={fs.pill} aria-pressed={ballMode==='new'} data-fig-modern onClick={swapBall}>{ballMode==='old'?'Old vs New: show new':'Old vs New: show old'}</button>}/>}
     {ready&&phase!=='look'&&<svg ref={svgRef} className={`iso-svg ${s.svg}`} viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label}
      onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={e=>{if(e.buttons)onUp();}}>
      {machineView?<g>
        <RigStatic F={F} P={P} H={hoodH}/>
        <RigLive F={F} P={P} soak={soak} raining={rig.current.raining} H={hoodH}/>
        <Hood F={F} P={P} raining={rig.current.raining} H={hoodH}/>
       </g>
      :<g>
        <LaneStatic F={F} P={P} minute={minuteOf(kk)}/>
        <LaneLive F={F} P={P} target={target} aim={M.aim} ball={M.ball} landed={M.landed} grams={grams} leather={ballKind==='leather'} kicking={M.kicking}/>
       </g>}
     </svg>}
     {flash&&<div className={s.flash} role="status"><b>{flash.big}</b><span>{flash.line}</span></div>}

     {phase==='intro'&&<div className={s.panel} data-intro>
      <p className={g.kicker}>{exhibit.year}</p>
      <h2 className={s.panelTitle}>The ball that drank the rain.</h2>
      <p className={g.body}>{exhibit.facts[0]}</p>
      <ol className={s.beats}>{BEATS.map(b=><li key={b.head}><span>{b.when}</span><b>{b.head}</b><p>{b.text}</p></li>)}</ol>
     </div>}

     {phase==='score'&&<div className={s.panel} data-score-panel>
      <p className={g.kicker}>Full time · {ballKind==='leather'?'the leather ball':'the modern ball'}</p>
      <p className={s.big}><b>{total}</b><span>of {MAX_POINTS} points</span></p>
      <ol className={s.pips} aria-label={`${results.length} passes`}>{results.map((r,i)=><li key={i} data-pts={r.pts}><b>{r.pts}</b><span>{minuteOf(i)}′</span></li>)}</ol>
      <p className={g.body}><b>{verdict(total,ballKind)}</b></p>
      <p className={g.body}>{ballKind==='leather'?<>At kick-off the ball weighed <b>{LEATHER.dry} g</b>; at full time <b>{LEATHER.wet} g</b>. The same kick went {Math.round((1-carryFactor(LEATHER.wet))*100)}% shorter.</>:<>The modern ball weighed <b>{MODERN_G} g</b> all match, so the same kick went the same way.</>} {HEAD_PAIN}</p>
      {(best.leather!=null||best.modern!=null)&&<p className={g.small} data-best>Best · leather {best.leather??'–'} · modern {best.modern??'–'}</p>}
      <StepCheck items={[{q:check.q,options:check.options,right:check.answer,why:check.why}]} kicker={()=>'Quick check'} onPick={ok=>{setPicked(ok?check.answer:-1);if(ok)museumSfx.reveal();else museumSfx.tick();}}
       doneLabel="See the ending" onDone={()=>later(()=>endRef.current?.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'start'}),60)}/>
      <div className={g.row}>
       <button type="button" className={g.btn} data-museum-own-cue data-play-modern onClick={()=>startMatch(ballKind==='leather'?'modern':'leather')}>{ballKind==='leather'?'Play with the modern ball':'Play with leather'}</button>
       <button type="button" className={g.ghost} data-play-again onClick={()=>startMatch(ballKind)}>Play again</button>
       <button type="button" className={g.ghost} data-look onClick={openLook}>Look inside both balls</button>
      </div>
     </div>}
    </div>

    <div className={s.dock} data-dock>
     {phase==='look'?<div className={s.introDock}><p className={s.say} aria-live="polite" data-look-note>{lookNote}</p>
       <button type="button" className={g.btn} data-look-back onClick={()=>{setPhase(lookFrom.current);setLookNote(LOOK_INTRO);}}>{lookFrom.current==='intro'?'Back to the start':'Back to full time'}</button></div>
     :phase==='intro'?<div className={s.introDock}><button type="button" className={g.btn} data-start data-start-dock data-museum-own-cue onClick={startMachine}>Start the machine</button><button type="button" className={g.ghost} data-look onClick={openLook}>Turn the old ball</button><p className={s.say}>A rainy Saturday, long ago. Your team’s ball is brown leather.</p></div>
     :phase==='machine'?<>
       {!full?<button type="button" className={s.hold} data-rain onPointerDown={e=>{e.preventDefault();capture(e);startRain();}} onPointerUp={stopRain} onPointerCancel={stopRain}
         onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();startRain();}}} onKeyUp={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();stopRain();}}}>{reduced?'Rain +15 min':'Hold: Rain'}</button>
        :<button type="button" className={g.btn} data-kick-off onClick={()=>startMatch('leather')}>Kick off</button>}
       <dl className={s.stats}><div><dt>Leather</dt><dd style={{color:leatherTone(soak)}}>{gramsAt(soak)} g</dd></div><div><dt>Modern</dt><dd>{MODERN_G} g</dd></div><div><dt>In water</dt><dd>{minutesAt(soak)} min</dd></div></dl>
       <p className={s.say} aria-live="polite">{!full?(soak===0?'Hold the Rain button. Watch both needles.':`The leather ball has drunk ${gramsAt(soak)-LEATHER.dry} g of water so far. The modern ball: nothing.`)
        :<>The leather ball went from <b>{LEATHER.dry} g</b> to <b>{LEATHER.wet} g</b>. Now play a whole match in the rain with it.</>}</p>
      </>
     :phase==='match'?<>
       <button type="button" className={s.hold} data-kick disabled={M.flying||k>=KICKS} onPointerDown={e=>{e.preventDefault();capture(e);charge();}} onPointerUp={release} onPointerCancel={release}
        onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();charge();}}} onKeyUp={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();release();}}}>{reduced?'Kick':'Hold: Kick'}</button>
       <ol className={s.pipsRow} aria-label={`${results.length} of ${KICKS} passes, ${total} points`}>{Array.from({length:KICKS},(_,i)=><li key={i} data-pts={results[i]?.pts}/>)}</ol>
       <dl className={s.stats}><div><dt>Minute</dt><dd>{minuteOf(kk)}′</dd></div><div><dt>Ball</dt><dd>{grams} g</dd></div><div><dt>Points</dt><dd>{total}</dd></div></dl>
       <p className={s.say} aria-live="polite">{note}</p>
      </>
     :<p className={s.say}>Same kick, heavier ball: it lands shorter.</p>}
    </div>
   </div>

   <div className={s.below}>
    <section className={g.section} aria-labelledby="ll-facts">
     <p className={g.kicker}>The real story</p>
     <h2 id="ll-facts" className={g.h2}>Leather, rain and the right size</h2>
     <ol className={g.steps}>{[exhibit.facts[0],`In a 2023 lab test, a copy of the ${LEATHER.ballYear} leather World Cup ball went from ${LEATHER.dry} g to ${LEATHER.wet} g after ${LEATHER.soakMinutes} minutes in water. A modern ball in the same water did not change weight.`,NO_LACES_1966,HEAD_PAIN,HEAD_STUDY,exhibit.facts[1],exhibit.facts[2]].map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
     <figure className={s.quote}><blockquote>“{YEATS.quote}”</blockquote><figcaption>{YEATS.who}</figcaption></figure>
     <table className={s.sizes} data-sizes><caption>Which ball?</caption><thead><tr><th scope="col">Size</th><th scope="col">Around</th><th scope="col">Weight</th><th scope="col">Ages</th></tr></thead>
      <tbody>{(['3','4','5'] as const).map(id=><tr key={id}><th scope="row">{SIZES[id].name}</th><td>{SIZES[id].around}</td><td>{SIZES[id].weight}</td><td>{SIZES[id].ages}</td></tr>)}</tbody></table>
     <p className={g.small}>{PRACTICE_NOTE}</p>
    </section>
    <div ref={endRef}>{checked&&<Ending art={<EndBall/>} seen={`You’ve seen a leather ball drink the rain: ${LEATHER.dry} g dry, ${LEATHER.wet} g soaked.`} take={exhibit.forYourGame} onComplete={onComplete} reached={checked}/>}</div>
    <footer><details className={g.sources}><summary>Sources</summary>
     <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></details></footer>
   </div>
  </div>
 </section>;
}

/** The ending's mark: the soaked leather ball beside its dry self (the same tones as the game). */
function EndBall(){
 return <svg viewBox="0 0 240 200" aria-hidden="true">
  <defs><radialGradient id="ll-end-dry" cx=".36" cy=".32" r=".8"><stop offset="0" stopColor="#e2c39f"/><stop offset=".55" stopColor={leatherTone(0)}/><stop offset="1" stopColor="#7f5730"/></radialGradient>
   <radialGradient id="ll-end-wet" cx=".36" cy=".32" r=".8"><stop offset="0" stopColor="#8a6a4c"/><stop offset=".55" stopColor={leatherTone(1)}/><stop offset="1" stopColor="#2f1e10"/></radialGradient></defs>
  <ellipse cx="70" cy="176" rx="46" ry="8" fill="#8a8a80" opacity=".3"/><ellipse cx="170" cy="182" rx="56" ry="9" fill="#8a8a80" opacity=".38"/>
  <circle cx="70" cy="128" r="46" fill="url(#ll-end-dry)" stroke="#1d1d1b" strokeWidth="1"/>
  <circle cx="170" cy="124" r="56" fill="url(#ll-end-wet)" stroke="#1d1d1b" strokeWidth="1"/>
  <path d="M52 100q18-8 36 0M150 92q20-9 40 0" fill="none" stroke="#2a1a0c" strokeWidth="3" strokeLinecap="round"/>
  {[0,1,2,3,4].map(i=><path key={i} d={`M${170-36+i*18} ${36+(i%2)*10}v18`} stroke="#2a5bd7" strokeWidth="2" strokeLinecap="round" opacity=".7"/>)}
 </svg>;
}
