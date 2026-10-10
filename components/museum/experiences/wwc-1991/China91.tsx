'use client';
import {useCallback,useEffect,useRef,useState,type KeyboardEvent as RKeyboardEvent,type MutableRefObject,type PointerEvent as RPointerEvent} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {CHINA_1991,TEAMS_1991} from './data';
import {ballCut,crescent,Medallion} from './papercut';
import {rubber,stepSpring} from './spring';
import styles from './wwc.module.css';

/**
 * Beat 2, "China 1991": a folded sheet of red paper. Drag it open (like unfolding a 剪纸 cut) and it fans out into a 12-petal
 * window flower, one petal per team at the first Women's World Cup, with China's petal in gold. Teaching point: 12 teams from all
 * six continents came, and matches were 80 minutes.
 * Motion: the fold follows your drag 1:1 (rubber-banded past fully open / fully shut); on release a velocity-aware spring
 * finishes the unfold (or folds it back) carrying your flick's speed. The loop runs only while dragging or settling.
 */
const N=TEAMS_1991.length,R0=17,R1=55,W=7.4;
const PETAL=`M0 ${-R0}C${W*.9} ${-R0-4} ${W} ${-R1+9} 0 ${-R1}C${-W} ${-R1+9} ${-W*.9} ${-R0-4} 0 ${-R0}Z`;
const PETAL_CUTS=crescent(0,-R1+6.5,2.1,-Math.PI/2,.5)+[-1,0,1].map(i=>`M${i*2-.8} ${-R0-3.4}L${i*2} ${-R0-5.4}L${i*2+.8} ${-R0-3.4}Z`).join('');
const CONTINENTS=new Set(TEAMS_1991.map(t=>t.from)).size;

export type Fold=ReturnType<typeof useFold>;
export function useFold(reduced:MutableRefObject<boolean>){
 const [open,setOpen]=useState(false),[touched,setTouched]=useState(false);
 const petals=useRef<(SVGGElement|null)[]>([]),svg=useRef<SVGSVGElement>(null);
 const E=useRef({u:{x:0,v:0},to:0,drag:false,x0:0,u0:0,raf:0,last:0,samples:[] as {t:number;u:number}[],opened:false});
 const paint=useCallback(()=>{const u=Math.max(-.05,Math.min(1.08,E.current.u.x));
  petals.current.forEach((p,k)=>p?.setAttribute('transform',`rotate(${(k*360/N*u).toFixed(2)})`));
  svg.current?.style.setProperty('--u',u.toFixed(3));},[]);
 const frame=useCallback((now:number)=>{const e=E.current;e.raf=0;if(document.hidden){e.last=0;return;}
  const dt=Math.min(.04,e.last?(now-e.last)/1000:1/60);e.last=now;let settled=false;
  if(!e.drag)settled=stepSpring(e.u,e.to,dt,140,15,.001);
  paint();
  if(e.u.x>.97&&!e.opened){e.opened=true;setOpen(true);try{museumSfx.reveal();}catch{}}
  if(e.u.x<.5&&e.opened&&e.to===0){e.opened=false;setOpen(false);}
  if(e.drag||!settled)e.raf=requestAnimationFrame(frame);else e.last=0;},[paint]);
 const kick=useCallback(()=>{const e=E.current;if(!e.raf&&!document.hidden)e.raf=requestAnimationFrame(frame);},[frame]);
 const setTo=useCallback((to:number,v=0)=>{const e=E.current;setTouched(true);e.to=to;
  if(reduced.current){e.u={x:to,v:0};paint();const o=to>=1;if(o!==e.opened){e.opened=o;setOpen(o);if(o)try{museumSfx.reveal();}catch{}}return;}
  if(v)e.u.v=v;kick();},[kick,paint,reduced]);
 const on={
  onPointerDown:(ev:RPointerEvent<SVGSVGElement>)=>{if(!ev.isPrimary)return;const e=E.current;ev.currentTarget.setPointerCapture?.(ev.pointerId);
   e.drag=true;e.x0=ev.clientX;e.u0=e.u.x;e.samples=[{t:performance.now(),u:e.u.x}];setTouched(true);kick();},
  onPointerMove:(ev:RPointerEvent<SVGSVGElement>)=>{const e=E.current;if(!e.drag)return;const w=Math.max(180,(svg.current?.clientWidth??300)*.7);
   const raw=e.u0+(ev.clientX-e.x0)/w;e.u.x=reduced.current?Math.max(0,Math.min(1,raw)):rubber(raw,0,1,.12);e.u.v=0;
   const now=performance.now();e.samples.push({t:now,u:raw});while(e.samples.length>2&&now-e.samples[0].t>100)e.samples.shift();if(reduced.current)paint();},
  onPointerUp:()=>{const e=E.current;if(!e.drag)return;e.drag=false;const s=e.samples,a=s[0],b=s[s.length-1],dt=Math.max(.016,(b.t-a.t)/1000),v=s.length>1?(b.u-a.u)/dt:0;
   // A tap (no movement) toggles; otherwise the flick and position decide.
   const moved=Math.abs(b.u-e.u0)>.02,to=!moved?(e.u.x>.5?0:1):(v>.8?1:v<-.8?0:e.u.x>.5?1:0);setTo(to,reduced.current?0:Math.max(-6,Math.min(6,v)));},
  onPointerCancel:()=>{const e=E.current;if(!e.drag)return;e.drag=false;setTo(e.u.x>.5?1:0);},
  onKeyDown:(ev:RKeyboardEvent<SVGSVGElement>)=>{const e=E.current;
   if(ev.key==='ArrowRight'||ev.key==='ArrowUp'){ev.preventDefault();setTo(Math.min(1,Math.round(e.to*4+1)/4));}
   else if(ev.key==='ArrowLeft'||ev.key==='ArrowDown'){ev.preventDefault();setTo(Math.max(0,Math.round(e.to*4-1)/4));}
   else if(ev.key===' '||ev.key==='Enter'){ev.preventDefault();setTo(e.to>=1?0:1);}},
 };
 useEffect(()=>{const vis=()=>{const e=E.current;if(document.hidden){cancelAnimationFrame(e.raf);e.raf=0;e.last=0;}};document.addEventListener('visibilitychange',vis);const e=E.current;
  return()=>{document.removeEventListener('visibilitychange',vis);cancelAnimationFrame(e.raf);e.raf=0;};},[]);
 return {open,touched,toggle:()=>setTo(E.current.to>=1?0:1),petals,svg,on,paint};
}

export function ChinaStage({f}:{f:Fold}){
 useEffect(()=>{f.paint();},[f]);
 return <div className={styles.china} data-open={f.open||undefined}>
  <p className={styles.beatKick}>Beat 2 · China 1991</p>
  <div className={styles.fanWrap}>
   <Medallion className={styles.bgFlower} r={50} n={12}/>
   <svg ref={f.svg} className={styles.fan} viewBox="-62 -62 124 124" role="slider" tabIndex={0} data-museum-own-cue aria-label="A folded paper cut. Drag it, or press the arrow keys, to unfold the 12 teams of 1991."
    aria-valuemin={0} aria-valuemax={12} aria-valuenow={f.open?12:0} aria-valuetext={f.open?'Open: 12 teams':'Folded'} {...f.on}>
    {TEAMS_1991.map((t,k)=>[t,k] as const).reverse().map(([t,k])=>{const a=k*360/N,left=a>180;return <g key={t.name} ref={el=>{f.petals.current[k]=el;}} className={styles.petal} data-host={t.host||undefined}>
     <path d={PETAL} transform="translate(.7 1)" fill="#5a0a10" opacity=".28"/>
     <path d={PETAL+PETAL_CUTS} fillRule="evenodd" className={styles.petalPaper}/>
     <text className={styles.petalText} transform={`translate(0 ${-(R0+R1)/2-1}) rotate(${left?90:-90})`} textAnchor="middle" dy="1.2">{t.name.toUpperCase()}</text>
    </g>;})}
    <g className={styles.heart}>
     <circle r={R0+1.5} fill="#5a0a10" opacity=".25" transform="translate(.7 1)"/>
     <circle r={R0+1.5} fill="#c8102e"/>
     <path d={ballCut(8).map(p=>p).join('')} transform="translate(0 -6)" fill="#fff4dc"/>
     <text className={styles.hanzi} y={7.5} textAnchor="middle">中国</text>
     <text className={styles.heartYear} y={13.5} textAnchor="middle">1991</text>
    </g>
   </svg>
   {!f.touched&&<p className={styles.dragHint} aria-hidden="true"><span>Drag the folded paper</span><i>→</i></p>}
  </div>
  <p className={styles.srOnly} aria-live="polite">{f.open?`The paper is open: ${N} teams from ${CONTINENTS} continents.`:''}</p>
 </div>;
}

export function ChinaPanel({f,onNext}:{f:Fold;onNext:()=>void}){
 return <div>
  <p className={styles.lead}>The first Women’s World Cup was played in <b>China</b>, {CHINA_1991.dates}, in {CHINA_1991.cities.slice(0,-1).join(', ')} and {CHINA_1991.cities.at(-1)}.</p>
  <div className={styles.row}>
   <button type="button" className={`${styles.btn} ${f.open?'':styles.gold}`} data-museum-own-cue onClick={f.toggle}>{f.open?'Fold it up':'Unfold the paper'}</button>
   <span className={styles.grow}/>
   {f.open&&<button type="button" className={`${styles.btn} ${styles.gold} ${styles.pop}`} data-museum-own-cue onClick={onNext}>Next: the final →</button>}
  </div>
  <ul className={styles.facts} data-open={f.open||undefined}>
   <li><b>12 teams</b> from all {CONTINENTS} continents: {TEAMS_1991.map(t=>t.name).join(', ')}.</li>
   <li><b>80 minutes.</b> {CHINA_1991.minutes}</li>
   <li><b>The first goal.</b> {CHINA_1991.opener}</li>
   <li><b>A test first.</b> {CHINA_1991.trial}</li>
   <li><b>Not yet called a “World Cup”.</b> Its official name was the {CHINA_1991.officialName}.</li>
  </ul>
 </div>;
}
