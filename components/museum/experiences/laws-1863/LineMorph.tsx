'use client';
import {memo,useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {N,mix,resample,toPath,type Drawing,type Pt,type Stroke} from './lines';
/** Points a stroke is resampled to: enough for long or round strokes (a morph resamples both ends to the target's count). */
const cnt=(st:Stroke)=>Math.max(N,st.pts.length*4);
import {loop,spring,stepSpring} from './spring';
import s from './Experience.module.css';

/**
 * laws-1863 · a line drawing that tells its story by moving (Oct 9 2026). Give it a Drawing (named monoline strokes); give it another
 * and it moves there:
 *  - a stroke in both drawings MORPHS (both are resampled to the same number of points and a spring carries every point across,
 *    so a sagging tape straightens into a crossbar and a leg swings through a kick);
 *  - a stroke that is new DRAWS ITSELF ON (stroke-dashoffset 1 → 0 on a normalised pathLength, staggered);
 *  - a stroke that has gone DRAWS ITSELF OFF and is removed.
 * The first drawing draws on when it mounts (or when it scrolls into view, with `whenSeen`). `then` plays a second drawing once,
 * a beat later (the sorter's one-line stories).
 * Heat: the morph runs one animation-frame chain (spring.ts) only while points are moving, then stops; draw-on/off are one-shot
 * CSS animations. Nothing runs at rest. Reduced motion: the finished drawing, no animation.
 */
/** born: the generation a stroke (re)entered in (its element key); out: the generation that retired it. */
type Shown={key:string;stroke:Stroke;phase:'in'|'stay'|'out';born:number;out:number;i:number};
function LineMorph({drawing,then,thenAfter=900,vb,reduced,label,className,whenSeen=false}:{drawing:Drawing;then?:Drawing;thenAfter?:number;vb:string;reduced:boolean;label?:string;className?:string;whenSeen?:boolean}){
 const [seen,setSeen]=useState(!whenSeen||reduced);
 const [stage,setStage]=useState(0);
 const target=stage===1&&then?then:drawing;
 const svg=useRef<SVGSVGElement>(null),pts=useRef(new Map<string,Pt[]>()),gen=useRef(0),anim=useRef<ReturnType<typeof loop>|null>(null),timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const [shown,setShown]=useState<Shown[]>(()=>Object.entries(drawing).map(([key,stroke],i)=>({key,stroke,phase:'in',born:0,out:0,i})));
 const shownRef=useRef(shown);shownRef.current=shown;
 useEffect(()=>()=>{anim.current?.stop();timers.current.forEach(clearTimeout);},[]);

 // Draw on only once it is on screen (the rulebook figures below the fold), then never observe again.
 useEffect(()=>{if(seen)return;const el=svg.current;if(!el||typeof IntersectionObserver==='undefined'){setSeen(true);return;}
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){setSeen(true);io.disconnect();}},{threshold:.35});io.observe(el);return()=>io.disconnect();},[seen]);
 // The one-line story: after the first drawing has drawn on, move into the second.
 useEffect(()=>{if(!then||!seen)return;if(reduced){setStage(1);return;}const t=setTimeout(()=>setStage(1),thenAfter);timers.current.push(t);return()=>clearTimeout(t);},[then,seen,reduced,thenAfter]);

 // A new target: work out what morphs, what draws on and what draws off.
 const first=useRef(true);
 useLayoutEffect(()=>{
  if(first.current){first.current=false;for(const [k,st] of Object.entries(target))pts.current.set(k,resample(st.pts,cnt(st),st.closed));return;}
  const g=++gen.current,keys=new Set(Object.keys(target)),from=new Map<string,Pt[]>(),to=new Map<string,Pt[]>();
  {const prev=shownRef.current,out:Shown[]=[];let i=0;
   for(const sh of prev){const nx=target[sh.key];
    if(nx){const back=sh.phase==='out';out.push({key:sh.key,stroke:nx,phase:back?'in':'stay',born:back?g:sh.born,out:0,i:back?i++:sh.i});
     if(sh.phase!=='out'){const was=pts.current.get(sh.key);from.set(sh.key,was?(was.length===cnt(nx)?was:resample(was,cnt(nx),!!nx.closed)):resample(nx.pts,cnt(nx),nx.closed));to.set(sh.key,resample(nx.pts,cnt(nx),nx.closed));}}
    else out.push(sh.phase==='out'?sh:{...sh,phase:'out',out:g});}
   for(const k of keys)if(!prev.some(p=>p.key===k)){out.push({key:k,stroke:target[k],phase:'in',born:g,out:0,i:i++});}
   shownRef.current=out;setShown(out);}
  for(const k of keys)if(!to.has(k))pts.current.set(k,resample(target[k].pts,cnt(target[k]),target[k].closed));
  // Retired strokes leave once they have drawn themselves off.
  timers.current.push(setTimeout(()=>setShown(list=>list.filter(x=>!(x.phase==='out'&&x.out===g))),reduced?0:520));
  anim.current?.stop();
  queueMicrotask(()=>{
   const paths=svg.current?.querySelectorAll<SVGPathElement>('[data-k]');if(!paths)return;const el=new Map<string,SVGPathElement>();paths.forEach(p=>el.set(p.dataset.k!,p));
   const write=(t:number)=>{for(const [k,b] of to){const a=from.get(k)!,p=t>=1?b:mix(a,b,t);pts.current.set(k,p);const st=target[k];el.get(k)?.setAttribute('d',toPath(p,st.smooth,st.closed));}};
   // Nothing actually moves (the same drawing again, or React's development double-run): no frames at all.
   let moves=false;for(const [k,b] of to){const f=from.get(k)!;if(f.length!==b.length||f.some((p,j)=>Math.abs(p[0]-b[j][0])+Math.abs(p[1]-b[j][1])>.05)){moves=true;break;}}
   if(reduced||!moves){write(1);return;}
   write(0);const sp=spring(0);sp.target=1;
   anim.current=loop(dt=>{const rest=stepSpring(sp,dt,150,19,.001);write(rest?1:sp.x);return !rest;});
  });
 },[target]);// eslint-disable-line react-hooks/exhaustive-deps

 return <svg ref={svg} className={`${s.lines} ${className??''}`} viewBox={vb} data-seen={seen||undefined} role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true}>
  {shown.map(sh=>{const st=sh.stroke,p=pts.current.get(sh.key)??resample(st.pts,cnt(st),st.closed);
   return <path key={sh.key+':'+sh.born} data-k={sh.key} d={toPath(p,st.smooth,st.closed)} pathLength={st.dash?undefined:1}
    className={s.ln} data-tone={st.tone??'ink'} data-dash={st.dash||undefined} data-phase={sh.phase} style={{'--i':sh.i} as CSSProperties}/>;})}
 </svg>;
}
export default memo(LineMorph);
