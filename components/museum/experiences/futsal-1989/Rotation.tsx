'use client';
import {useEffect,useId,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import {isSoundEnabled} from '@/lib/games/sound';
import {prefersReduced,sleepyLoop,spring,stepSpring,settled,velocityTracker} from './spring';
import {Bean,INK,WoodDefs,type Pattern} from './woodcut';
import {HandIcon} from './BounceLab';
import css from './futsal.module.css';

/**
 * Beat 3 · "A roda" (the ring): spin the futsal diamond (Oct 9 2026). Besides the goalkeeper, a futsal team usually lines up as
 * a defender (fixo), two wingers (alas) and a forward (pivô), and outfield players can switch positions at any time
 * (Wikipedia, "Futsal", Gameplay). Here the four outfield beans stand on a ring through those four spots; grab any of them (or
 * the ring) and turn it. Let go and the ring keeps your spin, then a spring settles it on the nearest quarter turn, so every
 * bean lands on a new spot. A card for each bean ticks off the spots it has played; when all four have been fixo, ala and pivô,
 * the lesson lands: in futsal everyone attacks and everyone defends.
 *
 * Motion: direct manipulation of the angle (no easing while held), release velocity from the last 100 ms, momentum projected
 * forward, then an underdamped spring to the snapped quarter turn. Heat: a sleepy loop, only while held or settling.
 */
const CX=10,CY=20,RX=6.4,RY=10,Q=Math.PI/2;
type Spot='fixo'|'ala'|'pivô';
/** Ring angle 0 = bottom (our goal end), then right wing, top (pivô), left wing. */
const SPOT_AT=(k:number):{name:Spot;side?:string}=>[{name:'fixo' as Spot},{name:'ala' as Spot,side:'right'},{name:'pivô' as Spot},{name:'ala' as Spot,side:'left'}][((k%4)+4)%4];
const PLAYERS:{name:string;pattern:Pattern}[]=[{name:'Ana',pattern:'stripes'},{name:'Beto',pattern:'dots'},{name:'Cris',pattern:'chevron'},{name:'Dani',pattern:'you'}];
const pos=(a:number)=>({x:CX+RX*Math.sin(a),y:CY+RY*Math.cos(a)});
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{}};

export function Rotation({onDone}:{onDone?:()=>void}){
 const id=useId().replace(/:/g,'');
 const svg=useRef<SVGSVGElement>(null),beans=useRef<(SVGGElement|null)[]>([]);
 const phi=useRef(spring(0,140,.62)),held=useRef<{id:number;a0:number;p0:number;last:number}|null>(null),vt=useRef(velocityTracker()),loop=useRef<ReturnType<typeof sleepyLoop>|null>(null);
 const [turns,setTurns]=useState(0),turnRef=useRef(0);
 const [played,setPlayed]=useState<Set<Spot>[]>(()=>PLAYERS.map((_,i)=>new Set([SPOT_AT(i).name])));
 const [say,setSay]=useState(''),[grabbing,setGrabbing]=useState(false);
 const reduced=useRef(false),take=useRef<HTMLDivElement>(null);

 const paint=()=>{const a=phi.current.x;beans.current.forEach((g,i)=>{if(!g)return;const p=pos(a+i*Q),sc=.115+.02*((Math.cos(a+i*Q)+1)/2);g.setAttribute('transform',`translate(${p.x.toFixed(3)} ${p.y.toFixed(3)}) scale(${sc.toFixed(4)})`);});};
 /** Which quarter turn are we on? When it changes, every bean has moved one spot round. */
 const land=(k:number)=>{if(k===turnRef.current)return;turnRef.current=k;setTurns(k);sfx(museumSfx.flap);
  setPlayed(prev=>prev.map((s,i)=>{const n=new Set(s);n.add(SPOT_AT(i+k).name);return n;}));};
 const tick=(dt:number)=>{const s=phi.current;if(!held.current)stepSpring(s,dt);paint();
  const k=Math.round(s.x/Q);if(!held.current&&Math.abs(s.x-k*Q)<.25)land(k);
  return !!held.current||!settled(s,.0015);};
 useEffect(()=>{reduced.current=prefersReduced();loop.current=sleepyLoop(tick);paint();
  const vis=()=>{if(document.hidden)loop.current?.stop();};document.addEventListener('visibilitychange',vis);
  return()=>{loop.current?.stop();document.removeEventListener('visibilitychange',vis);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);

 const angleAt=(e:{clientX:number;clientY:number})=>{const s=svg.current,m=s?.getScreenCTM();if(!s||!m)return 0;const p=s.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const w=p.matrixTransform(m.inverse());
  return Math.atan2((w.x-CX)/RX,(w.y-CY)/RY);};
 const down=(e:ReactPointerEvent<SVGGElement>)=>{if(held.current)return;unlockMuseumAudio();e.preventDefault();try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
  const a=angleAt(e);held.current={id:e.pointerId,a0:a,p0:phi.current.x,last:a};vt.current.reset();vt.current.add(phi.current.x,0);setGrabbing(true);sfx(museumSfx.card);loop.current?.kick();};
 const move=(e:ReactPointerEvent<SVGGElement>)=>{const h=held.current;if(!h||h.id!==e.pointerId)return;let a=angleAt(e),d=a-h.last;
  if(d>Math.PI)d-=2*Math.PI;else if(d<-Math.PI)d+=2*Math.PI;h.last=a;const s=phi.current;s.x+=d;s.v=0;vt.current.add(s.x,0);if(reduced.current)paint();};
 /** Let go: keep the spin (momentum), then a spring lands it on the nearest quarter turn. */
 const up=(e:ReactPointerEvent<SVGGElement>)=>{const h=held.current;if(!h||h.id!==e.pointerId)return;held.current=null;setGrabbing(false);
  const s=phi.current,w=Math.max(-14,Math.min(14,vt.current.get().x)),proj=s.x+w*.22;let k=Math.round(proj/Q);
  if(k===turnRef.current&&Math.abs(s.x-h.p0)>.35)k+=Math.sign(s.x-h.p0);// a real push always moves at least one spot
  s.to=k*Q;s.v=w;if(reduced.current){s.x=s.to;s.v=0;paint();land(k);}else loop.current?.kick();};
 const spin=(dir:1|-1)=>{unlockMuseumAudio();const s=phi.current,k=Math.round(s.to/Q)+dir;s.to=k*Q;
  if(reduced.current){s.x=s.to;s.v=0;paint();land(k);}else{s.v+=dir*2.2;loop.current?.kick();}};
 const key=(e:ReactKeyboardEvent)=>{if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();spin(1);}else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();spin(-1);}};

 const doneAll=played.every(s=>s.size===3);
 const doneOnce=useRef(false);
 useEffect(()=>{if(doneAll&&!doneOnce.current){doneOnce.current=true;sfx(museumSfx.reveal);setSay('Everyone has played every spot! In futsal, everyone attacks and everyone defends.');onDone?.();requestAnimationFrame(()=>take.current?.scrollIntoView?.({block:'nearest',behavior:prefersReduced()?'auto':'smooth'}));}
  else if(!doneAll&&turns!==0)setSay(PLAYERS.map((p,i)=>`${p.name} is ${SPOT_AT(i+turns).name==='ala'?`on the ${SPOT_AT(i+turns).side} wing`:`the ${SPOT_AT(i+turns).name}`}`).join(', ')+'.');
 },[doneAll,turns,onDone]);
 const reset=()=>{doneOnce.current=false;turnRef.current=0;setTurns(0);setPlayed(PLAYERS.map((_,i)=>new Set([SPOT_AT(i).name])));const s=phi.current;s.to=0;
  if(reduced.current){s.x=0;s.v=0;paint();}else loop.current?.kick();};

 return <div className={css.lab}>
  <figure className={css.labArt}>
   <svg ref={svg} viewBox="-6 -4 32 49" className={`${css.labSvg} ${css.courtSvg}`} role="group" aria-label="A futsal court from above, our goal at the bottom. Four players stand on a ring. Turn the ring.">
    <WoodDefs id={id} k={.08}/>
    <g filter={`url(#${id}-ink)`}>
     {/* the court cut as a block: black boards with grain, white lines cut out */}
     <rect x="-1.4" y="-1.4" width="22.8" height="42.8" fill={INK}/>
     <rect x="-1.4" y="-1.4" width="22.8" height="42.8" fill={`url(#${id}-grain)`}/>
     <g fill="none" stroke="var(--paper)" strokeWidth=".32">
      <rect x="0" y="0" width="20" height="40"/><path d="M0 20H20"/><circle cx="10" cy="20" r="3"/>
      <path d="M2.5 40 A6 6 0 0 1 8.5 34 H11.5 A6 6 0 0 1 17.5 40"/><path d="M2.5 0 A6 6 0 0 0 8.5 6 H11.5 A6 6 0 0 0 17.5 0"/>
      <rect x="8.5" y="40" width="3" height="1.2"/><rect x="8.5" y="-1.2" width="3" height="1.2"/>
     </g>
     
    </g>
    <text x="10" y="-2" textAnchor="middle" className={css.svgTinyInk}>ATTACK ↑</text>
    {/* the ring and its four spots */}
    <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="var(--paper)" strokeWidth=".5" strokeDasharray="1.1 .8"/>
    {[0,1,2,3].map(k=>{const p=pos(k*Q),s=SPOT_AT(k);return <g key={k}>
     <circle cx={p.x} cy={p.y} r="2.7" fill="none" stroke="var(--paper)" strokeWidth=".35"/>
     <text x={p.x+(k===0?3.3:0)} y={p.y+(k===0?.6:k===2?-3.3:4.3)} textAnchor={k===0?'start':'middle'} className={css.svgSpot}>{s.name.toUpperCase()}</text></g>;})}
    {/* the keeper stays in goal */}
    <Bean x={CX} y={37.8} s={.1} pattern="plain" ink="#fffaf0"/>
    <text x={CX+2.4} y={38.6} className={css.svgTiny} textAnchor="start">KEEPER</text>
    <g role="slider" tabIndex={0} aria-label="Turn the team. Arrow keys turn it one spot." aria-valuemin={-99} aria-valuemax={99} aria-valuenow={turns} aria-valuetext={`${Math.abs(turns)} quarter turns`}
     className={css.grab} data-grabbing={grabbing||undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
     <ellipse cx={CX} cy={CY} rx={RX+4} ry={RY+4} fill="transparent"/>
     <ellipse cx={CX} cy={CY} rx={RX+4} ry={RY+4} className={css.grabRing}/>
     {PLAYERS.map((p,i)=><g key={p.name} ref={g=>{beans.current[i]=g;}}>
      <circle r="23" fill="var(--paper)" stroke={INK} strokeWidth="3"/>
      <Bean x={0} y={4} s={.95} pattern={p.pattern}/>
     </g>)}
    </g>
   </svg>
  </figure>
  <div className={css.labText}>
   <p className={css.tryIt}><HandIcon/> Grab a player and spin the team round!</p>
   <div className={css.row}>
    <button type="button" className={css.ghost} onClick={()=>spin(1)} aria-label="Turn one spot anticlockwise">↺ Turn</button>
    <button type="button" className={css.ghost} onClick={()=>spin(-1)} aria-label="Turn one spot clockwise">Turn ↻</button>
   </div>
   <ul className={css.cards} aria-label="Spots each player has played">
    {PLAYERS.map((p,i)=>{const now=SPOT_AT(i+turns).name;return <li key={p.name} data-full={played[i].size===3||undefined}>
     <svg viewBox="-16 -30 32 58" aria-hidden="true"><Bean x={0} y={0} s={1} pattern={p.pattern}/></svg>
     <b>{p.name}</b>
     <span className={css.pips}>{(['fixo','ala','pivô'] as Spot[]).map(s=><i key={s} data-on={played[i].has(s)||undefined} data-now={now===s||undefined}>{s}</i>)}</span>
    </li>;})}
   </ul>
   <p className={css.sr} aria-live="polite">{say}</p>
   {doneAll?<div ref={take} className={css.takeaway}>
    <p className={css.big}><b>Everyone</b> played everywhere!</p>
    <p>In futsal, outfield players can switch spots at any time. So everyone learns to <b>attack</b> and to <b>defend</b>.</p>
    <button type="button" className={css.ghost} onClick={reset}>Start again</button>
   </div>:<p className={css.small}>Fixo = defender. Ala = winger. Pivô = forward. The keeper stays in goal.</p>}
  </div>
 </div>;
}
