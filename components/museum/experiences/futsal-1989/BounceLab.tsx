'use client';
import {useEffect,useId,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {museumSfx,unlockMuseumAudio} from '@/lib/museum/museumSound';
import {isSoundEnabled} from '@/lib/games/sound';
import {prefersReduced,rubber,sleepyLoop,spring,stepSpring,settled,type Spring} from './spring';
import {INK,RED,Teeth,WoodBall,WoodDefs} from './woodcut';
import css from './futsal.module.css';

/**
 * Beat 1 · "A bola" (the ball): the drop test you do with your own hands, printed as a woodcut (Oct 9 2026).
 * Drawn to scale, 1 SVG unit = 1 cm. Pull either ball up (or press "Drop both from 2 m") and let go: real gravity (981 cm/s²)
 * and a bounce whose energy loss is set by the Laws. FIFA's futsal Law 2: dropped from 2 m, the first rebound must be 50–65 cm.
 * A FIFA Quality Pro grass ball must come back 120–165 cm. Each ball's coefficient of restitution is the middle of its band:
 * e = √(rebound ÷ drop), so a 2 m drop gives 57.5 cm (futsal) and 142.5 cm (grass).
 *
 * Motion: the ball follows your finger through a stiff spring (so a flick throws it, velocity included), rubber-bands above the
 * 2 m line, falls under gravity, squashes on impact with its own spring, and the first rebound's peak is stamped in ink.
 * Heat: one sleepy rAF loop that runs only while a ball is held, flying or wobbling, then stops. Reduced motion: no flight, the
 * result is printed at once.
 */
const G=240,TOP=G-200,GRAV=981,REST_V=28;
type Kind='futsal'|'grass';
const BALLS:Record<Kind,{x:number;r:number;lo:number;hi:number;e:number;name:string;law:string}>={
 futsal:{x:150,r:10,lo:50,hi:65,e:Math.sqrt(57.5/200),name:'Futsal ball',law:'Futsal Law 2'},
 grass:{x:250,r:11,lo:120,hi:165,e:Math.sqrt(142.5/200),name:'Grass ball',law:'FIFA Quality Pro'},
};
type Ball={h:number;v:number;mode:'rest'|'drag'|'lift'|'fall';follow:Spring;sq:Spring;bounces:number;from:number;top:number;peak:number|null};
const fresh=():Ball=>({h:0,v:0,mode:'rest',follow:spring(0,520,.9),sq:spring(0,900,.35),bounces:0,from:0,top:0,peak:null});
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{}};

export function BounceLab({onDone}:{onDone?:()=>void}){
 const id=useId().replace(/:/g,'');
 const svg=useRef<SVGSVGElement>(null),el={futsal:useRef<SVGGElement>(null),grass:useRef<SVGGElement>(null)};
 const balls=useRef<Record<Kind,Ball>>({futsal:fresh(),grass:fresh()});
 const [peaks,setPeaks]=useState<Record<Kind,{peak:number;from:number}|null>>({futsal:null,grass:null});
 const [heights,setHeights]=useState<Record<Kind,number>>({futsal:0,grass:0});
 const [say,setSay]=useState('');
 const drag=useRef<{kind:Kind;id:number}|null>(null),loop=useRef<ReturnType<typeof sleepyLoop>|null>(null);
 const reduced=useRef(false),timer=useRef(0),take=useRef<HTMLDivElement>(null);

 /** Paint a ball: lift it to its height, squash it from its bottom on impact. */
 const paint=(k:Kind)=>{const b=balls.current[k],g=el[k].current,{x,r}=BALLS[k];if(!g)return;
  const s=Math.max(-.35,Math.min(.3,b.sq.x)),sy=1-s,sx=1+s*.75;
  g.setAttribute('transform',`translate(${x} ${(G-b.h).toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(0 ${-r})`);};
 const record=(k:Kind,b:Ball)=>{const peak=Math.round(b.top),from=Math.round(b.from);b.peak=peak;
  setPeaks(p=>({...p,[k]:{peak,from}}));setSay(`${BALLS[k].name}: dropped from ${from} centimetres, bounced back ${peak} centimetres.`);sfx(museumSfx.stamp);};

 const tick=(dt:number)=>{let busy=false;
  for(const k of ['futsal','grass'] as Kind[]){const b=balls.current[k],{e}=BALLS[k];
   if(b.mode==='drag'){const prev=b.h;stepSpring(b.follow,dt);b.h=b.follow.x;b.v=(b.h-prev)/Math.max(dt,1e-3);busy=true;}
   else if(b.mode==='lift'){stepSpring(b.follow,dt);b.h=b.follow.x;b.v=b.follow.v;busy=true;}
   else if(b.mode==='fall'){busy=true;const n=4,h=dt/n;
    for(let i=0;i<n;i++){b.v-=GRAV*h;b.h+=b.v*h;
     if(b.bounces>=1&&b.peak==null){b.top=Math.max(b.top,b.h);if(b.v<0)record(k,b);}
     if(b.h<=0&&b.v<0){const hit=-b.v;b.h=0;b.v=hit*e;b.bounces++;b.sq.v+=hit*.0042;if(hit>140)sfx(museumSfx.tick);
      if(b.v<REST_V){b.v=0;b.mode='rest';if(b.peak==null&&b.bounces>=1){b.top=Math.max(b.top,0);record(k,b);}break;}}}}
   stepSpring(b.sq,dt);if(!settled(b.sq,.002))busy=true;
   paint(k);}
  return busy;};
 useEffect(()=>{reduced.current=prefersReduced();loop.current=sleepyLoop(tick);(['futsal','grass'] as Kind[]).forEach(paint);
  const vis=()=>{if(document.hidden)loop.current?.stop();else loop.current?.kick();};document.addEventListener('visibilitychange',vis);
  return()=>{loop.current?.stop();clearTimeout(timer.current);document.removeEventListener('visibilitychange',vis);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);

 /** Let go: the ball keeps the velocity your hand gave it. Under reduced motion the rebound is worked out and printed at once. */
 const release=(k:Kind)=>{const b=balls.current[k];if(b.mode==='rest'&&b.h<=0)return;
  const v=Math.max(-900,Math.min(900,b.mode==='drag'?b.follow.v:0));b.from=b.h+(v>0?v*v/(2*GRAV):0);b.top=0;b.peak=null;b.bounces=0;
  if(reduced.current){const top=BALLS[k].e**2*(b.h+v*v/(2*GRAV));b.h=0;b.v=0;b.mode='rest';b.top=top;b.bounces=1;record(k,b);paint(k);return;}
  b.v=v;b.mode='fall';loop.current?.kick();};
 const toH=(clientY:number,k:Kind)=>{const s=svg.current;if(!s)return 0;const p=s.createSVGPoint();p.x=0;p.y=clientY;const m=s.getScreenCTM();if(!m)return 0;
  const y=p.matrixTransform(m.inverse()).y;return rubber(G-y-BALLS[k].r,0,200,.5,22);};
 const down=(k:Kind)=>(e:ReactPointerEvent<SVGGElement>)=>{if(drag.current)return;unlockMuseumAudio();e.preventDefault();
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}drag.current={kind:k,id:e.pointerId};
  const b=balls.current[k];b.mode='drag';b.peak=null;b.follow.x=b.h;b.follow.v=0;b.follow.to=Math.max(0,toH(e.clientY,k));
  setPeaks(p=>({...p,[k]:null}));sfx(museumSfx.card);
  if(reduced.current){b.h=b.follow.to;paint(k);}else loop.current?.kick();};
 const move=(e:ReactPointerEvent<SVGGElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const b=balls.current[d.kind];b.follow.to=Math.max(0,toH(e.clientY,d.kind));
  if(reduced.current){b.h=b.follow.to;paint(d.kind);setHeights(h=>({...h,[d.kind]:Math.round(b.h)}));}};
 const up=(e:ReactPointerEvent<SVGGElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;
  const b=balls.current[d.kind];if(b.h>200){b.follow.to=200;}setHeights(h=>({...h,[d.kind]:Math.round(Math.min(200,b.h))}));release(d.kind);};
 /** The hero moment: both balls rise to the 2 m line on springs (a beat apart), hang, and drop together. */
 const dropBoth=()=>{unlockMuseumAudio();sfx(museumSfx.whistle);setPeaks({futsal:null,grass:null});setSay('');
  (['futsal','grass'] as Kind[]).forEach((k,i)=>{const b=balls.current[k];b.peak=null;b.mode='lift';b.follow.x=b.h;b.follow.v=0;b.follow.to=200;b.follow.k=90+i*10;b.follow.c=2*Math.sqrt(b.follow.k)*.8;});
  if(reduced.current){(['futsal','grass'] as Kind[]).forEach(k=>{const b=balls.current[k];b.h=200;b.mode='drag';b.follow.v=0;release(k);});return;}
  loop.current?.kick();
  clearTimeout(timer.current);timer.current=window.setTimeout(()=>{(['futsal','grass'] as Kind[]).forEach(k=>{const b=balls.current[k];if(b.mode!=='lift')return;b.h=200;b.follow.x=200;b.follow.v=0;b.mode='drag';release(k);});
   balls.current.futsal.follow.k=balls.current.grass.follow.k=520;balls.current.futsal.follow.c=balls.current.grass.follow.c=2*Math.sqrt(520)*.9;},1100);};
 /** Keyboard: arrows raise and lower the focused ball 10 cm, Enter or Space lets it go. */
 const key=(k:Kind)=>(e:ReactKeyboardEvent)=>{const b=balls.current[k];
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();b.mode='drag';b.peak=null;b.h=Math.max(0,Math.min(200,b.h+(e.key==='ArrowUp'?10:-10)));b.follow.x=b.follow.to=b.h;b.follow.v=0;paint(k);setHeights(h=>({...h,[k]:Math.round(b.h)}));setPeaks(p=>({...p,[k]:null}));}
  else if(e.key==='Enter'||e.key===' '){e.preventDefault();release(k);}};

 const f=peaks.futsal,g=peaks.grass,both=f&&g,fair=both&&Math.abs(f.from-g.from)<=Math.max(f.from,g.from)*.15&&f.from>40;
 const times=fair&&f.peak>0?g.peak/f.peak:null;
 useEffect(()=>{if(!fair)return;onDone?.();take.current?.scrollIntoView?.({block:'nearest',behavior:prefersReduced()?'auto':'smooth'});},[fair,onDone]);
 const col=(k:Kind)=>{const B=BALLS[k],p=peaks[k],inBand=p&&p.from>=190&&p.from<=210?p.peak>=B.lo&&p.peak<=B.hi:null;
  return <g key={k}>
   {/* the Law's band, hatched like a cut tint */}
   <rect x={B.x-30} y={G-B.hi} width={60} height={B.hi-B.lo} fill={`url(#${id}-hatch)`} opacity=".55"/>
   <rect x={B.x-30} y={G-B.hi} width={60} height={B.hi-B.lo} fill="none" stroke={INK} strokeWidth="1.4"/>
   <text x={B.x+34} y={G-B.hi+9} className={css.svgSmall}>{B.lo}–{B.hi}</text>
   <text x={B.x+34} y={G-B.hi+19} className={css.svgSmall}>cm</text>
   {p&&<g className={css.peakMark} data-ok={inBand??undefined}>
    <path d={`M${B.x-36} ${G-p.peak}h72`} stroke={RED} strokeWidth="2.4" strokeDasharray="5 3"/>
    <g transform={`translate(${B.x-38} ${G-p.peak})`}><rect x="-44" y="-11" width="42" height="20" fill={RED}/><text x="-23" y="4" textAnchor="middle" className={css.svgStamp}>{p.peak}</text></g>
   </g>}
   <g ref={el[k]} transform={`translate(${B.x} ${G}) translate(0 ${-B.r})`}><WoodBall r={B.r} grass={k==='grass'}/></g>
   {/* the grab zone: the whole column, so a small hand can't miss */}
   <g role="slider" tabIndex={0} aria-label={`${B.name}. Arrow keys lift it, Enter drops it.`} aria-valuemin={0} aria-valuemax={200} aria-valuenow={heights[k]} aria-valuetext={`${heights[k]} centimetres up`}
    className={css.grab} onPointerDown={down(k)} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key(k)}>
    <rect x={B.x-34} y={TOP-26} width={68} height={G-TOP+26} fill="transparent"/>
    <rect x={B.x-34} y={TOP-26} width={68} height={G-TOP+26} className={css.grabRing}/>
   </g>
   <text x={B.x} y={G+19} textAnchor="middle" className={css.svgLabel}>{k==='futsal'?'Futsal':'Grass'}</text>
  </g>;};
 return <div className={css.lab}>
  <figure className={css.labArt}>
   <svg ref={svg} viewBox="0 0 330 268" className={css.labSvg} role="group" aria-label="Drop test, drawn to scale. Pull a ball up and let go.">
    <WoodDefs id={id}/>
    <g filter={`url(#${id}-ink)`}>
     <Teeth x={2} y={2} w={326} h={264} size={8}/>
     {/* the floor block and the 2 m line */}
     <rect x={14} y={G} width={302} height={8} fill={INK}/>
     <path d={`M24 ${G+3}h280`} stroke="var(--paper)" strokeOpacity=".35" strokeWidth=".8" strokeDasharray="14 6 3 6"/>
     <path d={`M62 ${TOP}H300`} stroke={INK} strokeWidth="1.6" strokeDasharray="7 5"/>
     {/* the ruler: a carved strip with a notch every 10 cm */}
     <rect x={18} y={TOP} width={14} height={200} fill={INK}/>
     {Array.from({length:21},(_,i)=><path key={i} d={`M${i%5?26:22} ${G-i*10}H32`} stroke="var(--paper)" strokeWidth="1.3"/>)}
    </g>
    {/* type is set outside the inked block so it stays crisp */}
    <text x={62} y={TOP-7} className={css.svgLabel}>2 m drop line</text>
    {[0,50,100,150,200].map(v=><text key={v} x={36} y={G-v+4} className={css.svgSmall}>{v}</text>)}
    <text x={36} y={TOP-16} className={css.svgSmall}>cm</text>
    {col('futsal')}{col('grass')}
   </svg>
  </figure>
  <div className={css.labText}>
   <p className={css.tryIt}><HandIcon/> Pull a ball up high, then let go!</p>
   <button type="button" className={css.btn} data-museum-own-cue onClick={dropBoth}>Drop both from 2 m</button>
   <p className={css.sr} aria-live="polite">{say}</p>
   {fair&&times?<div ref={take} className={css.takeaway} key={`${f.peak}-${g.peak}`}>
    <p className={css.big}><b>{times.toFixed(1)}×</b> higher on grass</p>
    <p>Same drop, but the futsal ball comes back <b>{f.peak} cm</b> and the grass ball <b>{g.peak} cm</b>.</p>
    <p>A low ball stays near your feet on a hard court, so you can stop it with the <b>sole</b> of your boot.</p>
    {onDone&&<p className={css.small}>The futsal Laws say: drop it from 2 m and it must bounce back 50 to 65 cm.</p>}
   </div>:both?<p className={css.small}>Drop both from the same height to compare them fairly. Try the 2 m button!</p>
   :<p className={css.small}>Futsal Law 2: dropped from 2 m, a futsal ball must bounce back 50 to 65 cm. A top grass ball: 120 to 165 cm.</p>}
  </div>
 </div>;
}
export function HandIcon(){return <svg className={css.hand} viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5c0 3.6-2.4 6.5-6 6.5-2.6 0-4.2-1.3-5.4-3.4L4.4 14a1.5 1.5 0 0 1 2.4-1.8L9 14.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
