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
import {BallShadeDefs,Ghost,PitchLive,PitchStatic,StudioBall,StudioStatic,Tally,Tray,ballCentre,ballPx,ballScreen,pitchPoints,studioPoints,trayHull} from './scene';
import {BEATS,BEST_KEY,CHECK,EXTRA,EXTRA_SOURCES,MODEL_NOTE} from './content';
import {HALF_S,PANELS,PIECES,START_Q,STEPS,ballPanels,bringToFront,counts,easeOut,follow,frameBox,inFrame,match,nextGap,pct,slerp,stillTimes,stitch,tapHit,verdict,type BallKind,type Picture,type Quat} from './model';
import {polygon,type PanelKind} from './geometry';
import s from './Experience.module.css';

/**
 * telstar-1970 · "Mexico 70 on air" (Oct 12 2026 anatomy restyle; user: "these games should not be the pixel style", "larger and
 * fill the entire screen", then: every exhibit except the penalty kick in the anatomy isometric Paper style). The pixel game's
 * rules and teaching are kept; the drawing is now a crafted table-top machine that fills the play area at every size.
 *
 *  1. Stitch (the studio stand): a big Telstar on a turntable in front of a 1970 TV camera. The gap at the front is rimmed in red;
 *     drag the right panel from its tray onto the ball (or tap the tray, or press 5 / 6): a black pentagon (5 sides) or a white
 *     hexagon (6 sides). A wrong shape is refused with the reason. 12 + 20 = 32; "Stitch the rest" after 8.
 *  2. On air (two halves of the same seeded pretend match on a table-top pitch): drag to steer the viewfinder and keep the ball in
 *     shot. The picture is black and white: the brown leather ball melts into the grass greys; the Telstar's black and white
 *     don't. ON AIR % per half; a Picture switch (B&W / colour) for a replay. Reduced motion: eight still frames, tap the ball.
 *  3. Full time: both percentages, the quick check, then the gallery ending (onComplete once, via Ending `reached`).
 * Heat: SVG drawn by React only when something changes; the frame loop (anatomy/paper-loop.ts, via bench useRaf) runs only while the ball turns or a half is
 * played, pauses off screen or in a hidden tab, and is cancelled on unmount. 0 frames at rest.
 */
type Phase='intro'|'stitch'|'ready'|'air'|'half'|'score';
const BALLS:readonly BallKind[]=['leather','telstar'];
const BALL_NAME:Record<BallKind,string>={leather:'Brown leather',telstar:'Telstar'};
const keyOf=(b:BallKind,p:Picture)=>`${b}-${p}`;
const readBest=():Record<string,number>=>{try{return JSON.parse(localStorage.getItem(BEST_KEY)||'{}')||{};}catch{return {};}};
const saveBest=(v:Record<string,number>)=>{try{localStorage.setItem(BEST_KEY,JSON.stringify(v));}catch{/* private mode */}};

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
 // Stitch.
 const [done,setDone]=useState<ReadonlySet<number>>(()=>new Set());
 const studio=useRef({q:START_Q as Quat,from:START_Q as Quat,to:START_Q as Quat,u:1,target:0 as number|null,t0:0,misses:0});
 const [misses,setMisses]=useState(0),[wrong,setWrong]=useState(false),[note,setNote]=useState('The gap with the red rim is at the front. Which panel fits it?'),[stitchSecs,setStitchSecs]=useState<number|null>(null);
 const [drag,setDrag]=useState<{kind:PanelKind;x:number;y:number;x0:number;y0:number}|null>(null);
 // On air.
 const m=useMemo(()=>match(1970),[]);
 const stills=useMemo(()=>stillTimes(m),[m]);
 const [half,setHalf]=useState(0),[picture,setPicture]=useState<Picture>('bw');
 const [results,setResults]=useState<Record<string,number>>({}),[best,setBest]=useState<Record<string,number>>({});
 const air=useRef({t:0,aim:[0,0] as [number,number],want:[0,0] as [number,number],on:0,total:0,onAir:true,step:0,hits:0,tap:null as [number,number]|null,reveal:false,hit:false});
 const [picked,setPicked]=useState<number|null>(null);
 const [flash,setFlash]=useState<{big:string;line:string}|null>(null);
 const ball=BALLS[half]??'telstar';
 const ballRef=useRef(ball);ballRef.current=ball;const picRef=useRef(picture);picRef.current=picture;
 useEffect(()=>{setBest(readBest());},[]);
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const later=(f:()=>void,ms:number)=>{timers.current.push(setTimeout(f,ms));};
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();onClose();}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[onClose]);

 // The model fills the play area: landscape or portrait, fitted to the live size of the card.
 const W=box.w||1,H=box.h||1,orient=W>=H*1.05?'wide':'tall',F=useMemo(()=>frameFor(orient),[orient]);
 const pad=Math.round(Math.max(18,Math.min(W,H)*.06));
 const studioView=phase==='intro'||phase==='stitch'||(phase==='ready'&&!Object.keys(results).length&&half===0&&!!flash);
 const P=useMemo(()=>studioView?fit(F,studioPoints(F),W,H-34,pad,orient==='wide'?30:54):fit(F,pitchPoints(F),W,H-34,pad,orient==='wide'?34:52),[F,W,H,pad,orient,studioView]);
 const Pv=useMemo(()=>({...P,origin:[P.origin[0],P.origin[1]+12] as [number,number]}),[P]);// a little below the corner labels
 const fb=frameBox(W,H);

 // One loop for both machines: the ball's turn on the stand, and a half of the match. It stops when nothing moves.
 const wake=useRaf((dt)=>{
  if(phaseRef.current==='air'&&!reduced){const a=air.current;
   a.t=Math.min(HALF_S,a.t+dt);a.aim=[follow(a.aim[0],a.want[0],dt,.12),follow(a.aim[1],a.want[1],dt,.12)];
   a.onAir=inFrame(a.aim,ballScreen(F,Pv,m,a.t),frameBox(W,H));a.total+=dt;if(a.onAir)a.on+=dt;
   say(`ON AIR ${pct(a.on,a.total)}% · ${Math.ceil(HALF_S-a.t)} s`);redraw();
   if(a.t>=HALF_S){endHalf(pct(a.on,a.total));return false;}return true;}
  const st=studio.current;if(st.u>=1)return false;st.u=Math.min(1,st.u+dt/.42);st.q=slerp(st.from,st.to,easeOut(st.u));redraw();return st.u<1;},live);

 // ── Stitch ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 const turnTo=(i:number|null)=>{const st=studio.current;st.target=i;if(i==null)return;st.from=st.q;st.to=bringToFront(st.q,i);st.u=0;
  if(reduced){st.q=st.to;st.u=1;redraw();}else wake();};
 const startStitch=()=>{const st=studio.current;st.q=START_Q;st.target=nextGap(START_Q,new Set());st.t0=performance.now();st.misses=0;setMisses(0);setDone(new Set());setPhase('stitch');
  say('Panels 0 / 32');museumSfx.card();};
 const finishStitch=()=>{const secs=Math.round((performance.now()-studio.current.t0)/1000);setStitchSecs(secs);studio.current.target=null;
  museumSfx.reveal();museumSfx.crowd();setFlash({big:'32 panels',line:'12 black + 20 white. Now film the match.'});later(()=>setFlash(null),2200);
  setNote(EXTRA.panels);say(`32 / 32 · ${secs} s`);setPhase('ready');};
 const place=(piece:PanelKind)=>{if(phaseRef.current!=='stitch')return;const st=studio.current,gap=st.target;if(gap==null)return;
  const r=stitch(gap,piece);
  if(!r.ok){st.misses++;setMisses(st.misses);museumSfx.flap();setNote(r.say);setWrong(true);say(`${PIECES[PANELS[gap].kind].sides} sides!`);later(()=>setWrong(false),420);return;}
  const next=new Set(done);next.add(gap);setDone(next);museumSfx.card();const c=counts(next);say(`Panels ${c.total} / 32`);
  setNote(c.total===1?'Stitched! The ball turns to the next gap.':piece==='pent'?`A black pentagon: ${c.pent} of 12.`:`A white hexagon: ${c.hex} of 20.`);
  if(next.size===32){finishStitch();return;}
  turnTo(nextGap(st.q,next));};
 const stitchRest=()=>{const all=new Set(PANELS.map((_,i)=>i));setDone(all);finishStitch();};

 // Drag a panel from its tray onto the ball (a tap on the tray places it too).
 const local=(e:{clientX:number;clientY:number})=>{const r=svgRef.current?.getBoundingClientRect();return r?[e.clientX-r.left,e.clientY-r.top] as const:[0,0] as const;};
 const grabPiece=(kind:PanelKind,e:RPE)=>{if(phase!=='stitch')return;e.preventDefault();const [x,y]=local(e);setDrag({kind,x,y,x0:x,y0:y});museumSfx.flapBook();};
 useEffect(()=>{if(!drag)return;
  const move=(e:PointerEvent)=>{const [x,y]=local(e);setDrag(d=>d&&{...d,x,y});};
  const up=(e:PointerEvent)=>{const [x,y]=local(e),{c,r}=ballCentre(F,Pv),moved=Math.hypot(x-drag.x0,y-drag.y0);
   if(Math.hypot(x-c[0],y-c[1])<r*1.15||moved<10)place(drag.kind);setDrag(null);};
  window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
  return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[drag?.kind,drag?.x0,drag?.y0,F,Pv]);

 // ── On air ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 const kickOff=()=>{const a=air.current;a.t=0;a.on=0;a.total=0;a.step=0;a.hits=0;a.tap=null;a.reveal=false;
  const b=ballScreen(F,Pv,m,0);a.aim=[b[0],b[1]];a.want=[b[0],b[1]];a.onAir=true;
  setFlash(null);setPhase('air');phaseRef.current='air';museumSfx.whistle();
  if(reduced){say(`Frame 1 / ${STEPS}`);redraw();return;}
  say('ON AIR 100%');wake();};
 function endHalf(p:number){const k=keyOf(ballRef.current,picRef.current);museumSfx.whistle();
  setResults(r=>({...r,[k]:p}));setBest(b=>{const n={...b,[k]:Math.max(b[k]??0,p)};saveBest(n);return n;});
  const isLast=BALLS.indexOf(ballRef.current)===BALLS.length-1;
  setFlash({big:`${p}%`,line:`${verdict(p)} · ${BALL_NAME[ballRef.current]}`});
  setPhase('half');if(isLast)later(()=>{setFlash(null);setPhase('score');},reduced?400:1700);}
 const secondHalf=()=>{setHalf(1);ballRef.current='telstar';kickOff();};
 const replay=(p:Picture)=>{setPicture(p);picRef.current=p;setHalf(0);ballRef.current='leather';setPicked(null);setResults({});kickOff();};
 // Reduced motion: tap the ball on each still frame.
 const tapStill=(x:number,y:number)=>{const a=air.current;if(a.reveal)return;a.aim=[x,y];a.tap=[x,y];a.reveal=true;
  const [bx,by]=ballScreen(F,Pv,m,stills[a.step]),hit=Math.hypot(x-bx,y-by)<=tapHit(ballPx(Pv));a.hit=hit;if(hit){a.hits++;museumSfx.reveal();}else museumSfx.tick();
  say(`${hit?'Found it':'Lost it'} · ${a.hits} / ${a.step+1}`);redraw();
  later(()=>{a.reveal=false;a.tap=null;a.step++;if(a.step>=STEPS){endHalf(pct(a.hits,STEPS));return;}say(`Frame ${a.step+1} / ${STEPS}`);redraw();},900);};
 // Steer: the viewfinder moves WITH the finger (like a trackpad), so a thumb never covers the frame it is steering.
 const grab=useRef<[number,number]|null>(null);
 const onDown=(e:RPE<SVGSVGElement>)=>{if(phase!=='air')return;const [x,y]=local(e);if(reduced){tapStill(x,y);return;}
  grab.current=[x-air.current.want[0],y-air.current.want[1]];capture(e);};
 const onMove=(e:RPE<SVGSVGElement>)=>{if(!grab.current||phase!=='air')return;const [x,y]=local(e),a=air.current;
  a.want=[Math.max(0,Math.min(W,x-grab.current[0])),Math.max(0,Math.min(H,y-grab.current[1]))];};
 const onUp=()=>{grab.current=null;};
 const onKey=(e:React.KeyboardEvent)=>{const step=e.shiftKey?6:20,a=air.current;
  if(phase==='stitch'&&(e.key==='5'||e.key==='6')){e.preventDefault();place(e.key==='5'?'pent':'hex');return;}
  if(phase!=='air')return;const d:Record<string,[number,number]>={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
  if(d[e.key]){e.preventDefault();a.want=[a.want[0]+d[e.key][0],a.want[1]+d[e.key][1]];if(reduced){a.aim=[...a.want];redraw();}}
  else if((e.key==='Enter'||e.key===' ')&&reduced){e.preventDefault();tapStill(a.aim[0],a.aim[1]);}};

 const c=counts(done);
 const lp=results[keyOf('leather',picture)],tp=results[keyOf('telstar',picture)];
 const checked=picked!=null;
 const sources=useMemo(()=>{const seen=new Set<string>();return [...exhibit.sources,...EXTRA_SOURCES].filter(x=>seen.has(x.url)?false:(seen.add(x.url),true));},[exhibit.sources]);
 const hint=phase==='stitch'?'Drag the panel that fits onto the red gap':phase==='air'?(reduced?'Tap the ball on each still frame':'Drag to keep the ball in the frame'):phase==='half'?'Half time':phase==='ready'?'The camera is ready':'Mexico 70';
 const label=studioView?`A big studio Telstar on a turntable, ${c.total} of 32 panels stitched: ${c.pent} black pentagons and ${c.hex} white hexagons. A 1970 TV camera points at it.`
  :`A table-top pitch filmed from the touchline on a ${picture==='bw'?'black-and-white':'colour'} picture. The ball is the ${BALL_NAME[ball].toLowerCase()}.`;

 // Live air drawing.
 const a=air.current,tNow=reduced&&phase==='air'?stills[Math.min(a.step,stills.length-1)]:a.t;
 const showFinder=phase==='air'&&!reduced;
 const fx=a.aim[0]-fb.w/2,fy=a.aim[1]-fb.h/2;
 const ballAtNow=!studioView?ballScreen(F,Pv,m,tNow):null;
 const ready=box.w>0;

 return <section role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}`} data-museum-experience="telstar-1970"
  className={`${g.room} iso ${s.root}`} data-theme="light" data-phase={phase} data-gap={phase==='stitch'&&studio.current.target!=null?PANELS[studio.current.target].kind:undefined} data-stitched={c.total} data-picture={picture} data-ball={ball} data-orient={orient} data-reduced={reduced||undefined} style={{'--accent':'#e4322b'} as CSSProperties}>
  <style dangerouslySetInnerHTML={{__html:ISO_CSS}}/>
  <ExperienceBack onClose={onClose}/>
  <div className={`${g.scroll} ${s.scroll}`} data-scroll>
   <div className={s.screen} data-play-screen>
    <header className={s.head}>
     <WallLabel as="h1" title={exhibit.title} meta={`${exhibit.year} · Mexico`} caption="Stitch the ball, then film the match on a black-and-white set." className={s.label}/>
    </header>

    <div ref={card} className={s.card} data-play-area data-fill-screen onKeyDown={onKey} tabIndex={0} aria-label={label}>
     <div className={s.corners} aria-hidden="true">
      <span data-corner="fig">Fig. 1970</span><span data-corner="title">Mexico 70 · on air</span>
      <span data-corner="hint">{hint}</span><span data-corner="readout" ref={readRef}>Panels 0 / 32</span>
     </div>
     {ready&&<svg ref={svgRef} className={`iso-svg ${s.svg}`} viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} data-drag={drag?'':undefined}>
      <BallShadeDefs/>
      {studioView?<g>
        <StudioStatic F={F} P={Pv} tally={phase==='stitch'}/>
        {(['pent','hex'] as const).map(kind=><g key={kind}>
         <Tray F={F} P={Pv} kind={kind} left={PIECES[kind].total-(kind==='pent'?c.pent:c.hex)} hot={drag?.kind===kind}/>
         <path d={trayHull(F,Pv,kind)} fill="transparent" className={s.hit} data-tray-hit={kind} onPointerDown={e=>grabPiece(kind,e)}/>
        </g>)}
        <StudioBall F={F} P={Pv} q={studio.current.q} done={done} target={phase==='stitch'?studio.current.target:null} wrong={wrong}/>
        {drag&&<Ghost kind={drag.kind} x={drag.x} y={drag.y} r={Math.max(22,ballCentre(F,Pv).r*.22)}/>}
       </g>
      :<g>
        <g className={s.picture}>
         <PitchStatic F={F} P={Pv} picture={picture}/>
         <PitchLive F={F} P={Pv} m={m} t={tNow} ball={ball} picture={picture}/>
        </g>
        <Tally F={F} P={Pv} on={phase==='air'&&a.onAir}/>
        {showFinder&&<g data-viewfinder={a.onAir?'on':'off'} className={s.finder}>
         <path d={`M0 0H${W}V${H}H0Z M${fx} ${fy}v${fb.h}h${fb.w}v${-fb.h}Z`} fillRule="evenodd" className={s.veil}/>
         {[[0,0,1,1],[1,0,-1,1],[1,1,-1,-1],[0,1,1,-1]].map(([u,v,sx,sy],i)=>{const X=fx+u*fb.w,Y=fy+v*fb.h,L=Math.min(28,fb.w*.16);
          return <path key={i} d={`M${X} ${Y+sy*L}V${Y}H${X+sx*L}`} className={s.bracket}/>;})}
         <path d={`M${a.aim[0]-7} ${a.aim[1]}h14M${a.aim[0]} ${a.aim[1]-7}v14`} className={s.bracket}/>
         <g transform={`translate(${fx+10} ${fy+10})`}><circle r={5} cx={5} cy={5} className={s.recDot}/><text x={15} y={9} className={s.rec}>{a.onAir?'ON AIR':'LOST'}</text></g>
        </g>}
        {reduced&&phase==='air'&&a.reveal&&a.tap&&ballAtNow&&<g data-still-tap={a.hit?'hit':'miss'}>
         <circle cx={ballAtNow[0]} cy={ballAtNow[1]} r={tapHit(ballPx(Pv))} className={a.hit?s.ringHit:s.ringMiss}/>
         <path d={`M${a.tap[0]-8} ${a.tap[1]}h16M${a.tap[0]} ${a.tap[1]-8}v16`} className={s.bracket}/>
        </g>}
       </g>}
     </svg>}
     {flash&&<div className={s.flash} role="status"><b>{flash.big}</b><span>{flash.line}</span></div>}

     {phase==='intro'&&<div className={s.panel} data-intro>
      <p className={g.kicker}>1970 · Mexico</p>
      <h2 className={s.panelTitle}>The ball you can see on black and white.</h2>
      <p className={g.body}>{exhibit.facts[0]}</p>
      <ol className={s.beats}>{BEATS.map(b=><li key={b.head}><span>{b.when}</span><b>{b.head}</b><p>{b.text}</p></li>)}</ol>
      <div className={g.row}><button type="button" className={g.btn} data-start onClick={startStitch} data-museum-own-cue>Stitch the Telstar</button></div>
     </div>}

     {phase==='score'&&<div className={s.panel} data-score-panel>
      <p className={g.kicker}>Full time · {picture==='bw'?'black and white':'colour'}</p>
      <div className={s.compare} data-compare>{BALLS.map(b=>{const v=results[keyOf(b,picture)];return <p key={b} data-ball={b}><span>{BALL_NAME[b]}</span><b>{v??'–'}%</b><i style={{'--f':(v??0)/100} as CSSProperties} aria-hidden="true"/></p>;})}</div>
      <p className={g.body}>{lp!=null&&tp!=null&&tp>lp?<><b>The panels won.</b> Same match, same passes: you kept the Telstar on air {tp-lp} points more than the brown ball.</>
       :<><b>Sharp eyes!</b> On a real 1970 set the ball was a few grey dots, and the black and white panels made all the difference.</>} {exhibit.facts[1]}</p>
      {picture==='bw'&&<p className={g.small}>Play it again in colour: the brown ball is easy to see again.</p>}
      <StepCheck items={[CHECK]} kicker={()=> 'Quick check'} onPick={ok=>{setPicked(ok?CHECK.right:-1);if(ok)museumSfx.reveal();else museumSfx.tick();}}
       doneLabel="See the ending" onDone={()=>later(()=>endRef.current?.scrollIntoView?.({behavior:reduced?'auto':'smooth',block:'start'}),60)}/>
      <div className={g.row}>
       <button type="button" className={g.btn} data-museum-own-cue data-play-again onClick={()=>replay(picture)}>Play again</button>
       <button type="button" className={g.ghost} data-play-colour onClick={()=>replay(picture==='bw'?'colour':'bw')}>{picture==='bw'?'Play in colour':'Play in B&W'}</button>
      </div>
     </div>}
    </div>

    <div className={s.dock} data-dock>
     {phase==='stitch'?<>
       <div className={s.pieces} role="group" aria-label="Stitch a panel into the red gap">
        <button type="button" className={s.piece} data-piece="pent" data-museum-own-cue onClick={()=>place('pent')}><svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points={polygon(5,0,0,11)} fill="#1d1d1b"/></svg>Pentagon<small>5 sides</small></button>
        <button type="button" className={s.piece} data-piece="hex" data-museum-own-cue onClick={()=>place('hex')}><svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points={polygon(6,0,0,11)} fill="#f9f9f6"/></svg>Hexagon<small>6 sides</small></button>
       </div>
       <dl className={s.stats}><div><dt>Pentagons</dt><dd>{c.pent}/12</dd></div><div><dt>Hexagons</dt><dd>{c.hex}/20</dd></div><div><dt>Wrong</dt><dd>{misses}</dd></div></dl>
       <p className={s.say} aria-live="polite">{note}</p>
       {c.total>=8&&<button type="button" className={g.ghost} data-stitch-rest onClick={stitchRest}>Stitch the rest</button>}
      </>
      :phase==='air'?<>
       <dl className={s.stats}><div><dt>Ball</dt><dd>{ball==='leather'?'Leather':'Telstar'}</dd></div><div><dt>Picture</dt><dd>{picture==='bw'?'B&W':'Colour'}</dd></div><div><dt>Half</dt><dd>{half+1}/2</dd></div></dl>
       <p className={s.say}>{reduced?'Find the ball in each still frame and tap it.':ball==='leather'?'Follow the brown ball. On a grey picture it hides in the grass.':'Follow the Telstar: black and white panels on a grey picture.'}</p>
      </>
      :phase==='intro'?<><button type="button" className={g.btn} data-start-dock onClick={startStitch}>Stitch the Telstar</button><p className={s.say}>Mexico, 1970: the first World Cup shown live around the world.</p></>
      :phase==='score'?<p className={s.say}>Same match, same passes: only the ball changed.</p>
      :<>
       <div className={s.toggle} role="group" aria-label="Picture">
        {(['bw','colour'] as const).map(v=><button key={v} type="button" aria-pressed={picture===v} data-picture-opt={v} onClick={()=>setPicture(v)} aria-label={v==='bw'?'Black-and-white picture':'Colour picture'}>{v==='bw'?'B&W':'Colour'}</button>)}
       </div>
       {phase==='half'&&half===0?<button type="button" className={g.btn} data-second-half onClick={secondHalf}>2nd half: the Telstar</button>
        :<button type="button" className={g.btn} data-kick-off onClick={()=>replay(picture)}>Kick off</button>}
       <p className={s.say} aria-live="polite">{phase==='half'&&half===0?<>Half time: <b>{lp??0}%</b> on air with the brown leather ball. Same match, same passes: now the Telstar.</>
        :<>Your Telstar is ready{stitchSecs!=null?<> ({stitchSecs} s, {misses} wrong)</>:null}. You are the 1970 cameraman: keep the ball in the frame. First half: the <b>brown leather</b> ball.</>}</p>
      </>}
    </div>
   </div>

   <div className={s.below}>
    <section className={g.section} aria-labelledby="ts-facts">
     <p className={g.kicker}>The real story</p>
     <h2 id="ts-facts" className={g.h2}>Why the ball went black and white</h2>
     <ol className={g.steps}>{[exhibit.facts[0],exhibit.facts[1],EXTRA.live,EXTRA.panels,EXTRA.name,exhibit.facts[2],EXTRA.made].map((f,i)=><li key={f}><span>{String(i+1).padStart(2,'0')}</span><p className={g.body}>{f}</p></li>)}</ol>
     {Object.keys(best).length>0&&<p className={g.small} data-best>Your best on air: {BALLS.flatMap(b=>(['bw','colour'] as const).map(p=>best[keyOf(b,p)]!=null?`${BALL_NAME[b]} (${p==='bw'?'B&W':'colour'}) ${best[keyOf(b,p)]}%`:null)).filter(Boolean).join(' · ')}</p>}
     <p className={g.small}>{MODEL_NOTE}</p>
    </section>
    <div ref={endRef}>{checked&&<Ending art={<EndBall/>} seen="You’ve seen the Telstar: 12 black and 20 white panels, made to be followed on a black-and-white screen." take={exhibit.forYourGame} onComplete={onComplete} reached={checked}/>}</div>
    <footer>
     <details className={g.sources}><summary>Sources</summary>
      <ul>{sources.map(x=><li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul>
      <p className={g.small}>The ball is drawn from real geometry: a truncated icosahedron, 12 pentagons and 20 hexagons.</p>
     </details>
    </footer>
   </div>
  </div>
 </section>;
}

/** The ending's mark: the finished Telstar on its cup (the same geometry as the game). */
function EndBall(){
 const list=ballPanels(bringToFront(START_Q,3),0,0,100);
 return <svg viewBox="-110 -110 220 230" aria-hidden="true"><ellipse cx="0" cy="104" rx="70" ry="10" fill="#8a8a80" opacity=".3"/>
  <BallShadeDefs/><circle r="100" fill="#f7f7f3"/>
  {list.map(p=><path key={p.i} d={p.d} fill={p.kind==='pent'?'#1d1d1b':'#f7f7f3'} stroke="#77777a" strokeWidth=".8"/>)}
  <circle r="100" fill="url(#ts-ballshade)"/><circle r="100" fill="none" stroke="#1d1d1b" strokeWidth="1.2"/></svg>;
}
