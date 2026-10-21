'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type KeyboardEvent,type MutableRefObject,type PointerEvent as RPE,type ReactNode} from 'react';
import type {Projection} from './iso-kit';
import {useBox} from './paper-kit';
import {usePaperLoop} from './paper-loop';
import {FRONT_PITCH,FRONT_YAW,PITCH_MAX,PITCH_MIN,SWATCHES,aimAt,basis,centreOf,dragBy,fade,fitTurn,keyTurn,labelsSvg,lightOf,newTurn,placeLabels,release,stepTurn,turnBy,turnProjection,turnTo,type LabelAnchor,type V3} from './figure-kit';
import f from './FigureStage.module.css';

/**
 * Figure kit v2 · the stage (Oct 21 2026). A Paper figure you can turn all the way round (drag, touch, arrow keys, ⟲ ⟳, Front
 * view), with an optional See-through, Labels that light up and colour Swatches. Opt in per exhibit; nothing else changes.
 *
 * Heat: the figure is drawn as ONE SVG string into a <g> through a ref (no React render per frame); the ONE Paper loop
 * (paper-loop.ts) runs only while the figure coasts, eases or cross-fades, paints only when something changed, sleeps at rest,
 * parks off-screen and in a hidden tab, and is disposed on unmount. A drag paints at most once per frame. Reduced motion: every
 * turn and fade jumps to its end. Caps: ≤ MAX_PARTS (120) SVG elements per figure (tests count them).
 * Ideas from Colorfigures / ISO-GLOW by April Zhu (MIT) and iso-figure by Tolga Cohce (MIT); see docs/museum-paper-style.md.
 */
export type FigureView={yaw:number;pitch:number;P:Projection;V:V3;L:V3;R:V3;U:V3;xray:number;swatch:string|null;active:ReadonlySet<string>;w:number;h:number};
export type FigureDrawing={svg:string;labels?:LabelAnchor[];obj?:{l:number;r:number;t:number;b:number}};
export type FigureSpec={
 id:string;
 /** The figure's true extremes in world units (x, y on the floor, z up); fitted once so it never rescales while turning. */
 points:readonly V3[];
 front?:{yaw:number;pitch:number};
 /** 'full' turns all the way round (default); 'fixed' keeps ±60° around the front. */
 turn?:'full'|'fixed';
 pitch?:readonly [number,number];
 seeThrough?:boolean;
 labels?:boolean;
 /** Swatch ids from SWATCHES (4-6); omitted = no swatch row. */
 swatches?:readonly string[];
 swatchLabel?:string;
 draw:(v:FigureView)=>FigureDrawing;
 /** The figure's own motion (a flip, a pulse); return true while it moves. */
 tick?:(dt:number)=>boolean;
};
export type FigureHandle={turnTo(yaw:number,pitch?:number):void;aim(n:V3):void;invalidate():void;front():void;setSeeThrough(on:boolean):void;setLabels(on:boolean):void};

export function FigureStage({spec,active,reduced,onLabel,handle,top=0,extra,label}:{spec:FigureSpec;active?:ReadonlySet<string>|readonly string[];reduced:boolean;
 onLabel?:(id:string)=>void;handle?:MutableRefObject<FigureHandle|null>;top?:number;extra?:ReactNode;label:string}){
 const [box,{w,h}]=useBox<HTMLDivElement>();
 const g=useRef<SVGGElement>(null);
 const front=spec.front??{yaw:FRONT_YAW,pitch:FRONT_PITCH},range=spec.pitch??[PITCH_MIN,PITCH_MAX];
 const st=useRef({turn:newTurn({yaw:front.yaw,pitch:front.pitch,full:spec.turn!=='fixed',range}),xr:{k:0},lb:{k:0},xrOn:false,lbOn:false,
  swatch:null as string|null,active:new Set<string>() as ReadonlySet<string>,dirty:true,anchors:[] as LabelAnchor[],drag:null as null|{x:number;y:number;t:number}});
 const [xrOn,setXr]=useState(false),[lbOn,setLb]=useState(false),[swatch,setSwatch]=useState<string|null>(null),[used,setUsed]=useState(false);
 const narrow=w<560,font=narrow?13:14,ctlH=(narrow?92:52)+(spec.swatches?.length?(narrow?40:0):0);
 const centre=useMemo(()=>centreOf(spec.points),[spec.points]);
 const P0=useMemo(()=>w>0?fitTurn(spec.points,w,h,front.yaw,front.pitch,{pad:narrow?14:28,top:top+ctlH,bottom:28}):null,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [spec.points,w,h,top,ctlH,narrow]);
 const P0ref=useRef(P0);P0ref.current=P0;const specRef=useRef(spec);specRef.current=spec;

 const paint=useCallback(()=>{const s=st.current,P0=P0ref.current,el=g.current;if(!P0||!el)return;s.dirty=false;
  const {yaw,pitch}=s.turn,P=turnProjection(P0,centre,yaw,pitch),{R,U,V}=basis(yaw,pitch);
  const d=specRef.current.draw({yaw,pitch,P,V,L:lightOf(yaw,pitch),R,U,xray:s.xr.k,swatch:s.swatch,active:s.active,w,h});
  s.anchors=d.labels??[];let out=d.svg;
  if(s.lb.k>0&&d.labels?.length){const obj=d.obj??{l:w*.3,r:w*.7,t:0,b:h};
   out+=labelsSvg(placeLabels(d.labels.map(a=>({...a,on:s.active.has(a.id)})),P,V,{w,h},obj,{font,top:top+ctlH,bottom:30}),font,s.lb.k);}
  el.innerHTML=out;},[centre,w,h,font,top,ctlH]);

 // The one loop: coast / ease / cross-fade, paint when something changed, sleep at rest (no allocation in the tick itself).
 const tick=(dt:number)=>{const s=st.current;
  const turning=stepTurn(s.turn,dt,reduced),x=fade(s.xr,s.xrOn,dt,reduced),l=fade(s.lb,s.lbOn,dt,reduced),own=specRef.current.tick?specRef.current.tick(dt):false;
  const moving=turning||x||l||own;if(moving||s.dirty)paint();return moving;};
 const loop=usePaperLoop(tick,box,reduced);
 const kick=useCallback(()=>{st.current.dirty=true;loop.wake();},[loop]);
 useEffect(()=>{kick();},[kick,P0,paint]);
 useEffect(()=>{st.current.active=active instanceof Set?active:new Set(active??[]);kick();},[active,kick]);

 const api=useMemo<FigureHandle>(()=>({
  turnTo:(yaw,pitch)=>{turnTo(st.current.turn,yaw,pitch);kick();},
  aim:(n)=>{const v=aimAt(n,range);turnTo(st.current.turn,v.yaw,v.pitch);kick();},
  invalidate:kick,
  front:()=>{turnTo(st.current.turn,front.yaw,front.pitch);kick();},
  setSeeThrough:(on)=>{st.current.xrOn=on;setXr(on);kick();},
  setLabels:(on)=>{st.current.lbOn=on;setLb(on);kick();},
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }),[kick]);
 useEffect(()=>{if(handle)handle.current=api;return()=>{if(handle&&handle.current===api)handle.current=null;};},[api,handle]);

 const down=(e:RPE<SVGSVGElement>)=>{if(e.button>0)return;const tag=(e.target as Element).closest?.('[data-fig-label]');
  if(tag){const id=tag.getAttribute('data-fig-label')!,a=st.current.anchors.find(x=>x.id===id);e.preventDefault();
   if(a){const n=a.normal??[a.at[0]-centre[0],a.at[1]-centre[1],a.at[2]-centre[2]] as V3;api.aim(n);}onLabel?.(id);return;}
  st.current.drag={x:e.clientX,y:e.clientY,t:e.timeStamp};st.current.turn.vy=0;st.current.turn.vp=0;st.current.turn.aiming=false;
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* lost pointer: fine */}};
 const move=(e:RPE<SVGSVGElement>)=>{const d=st.current.drag;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!dx&&!dy)return;
  dragBy(st.current.turn,dx,dy,w,(e.timeStamp-d.t)/1000);d.x=e.clientX;d.y=e.clientY;d.t=e.timeStamp;if(!used)setUsed(true);kick();};
 const up=()=>{if(!st.current.drag)return;st.current.drag=null;release(st.current.turn);if(reduced){st.current.turn.vy=0;st.current.turn.vp=0;}kick();};
 const key=(e:KeyboardEvent<HTMLDivElement>)=>{if(keyTurn(st.current.turn,e.key,front)){e.preventDefault();e.stopPropagation();if(!used)setUsed(true);kick();}};
 const spinBy=(d:number)=>{turnBy(st.current.turn,d);if(!used)setUsed(true);kick();};
 const pick=(id:string|null)=>{st.current.swatch=id;setSwatch(id);kick();};

 return <div ref={box} className={f.stage} data-figure={spec.id} data-yaw-turn={spec.turn??'full'} data-see-through={xrOn||undefined} data-labels={lbOn||undefined}
  tabIndex={0} onKeyDown={key} aria-label={`${label}. Drag or use the arrow keys to turn it.`}>
  {w>0&&<svg className={f.svg} viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={label}
   onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}><g ref={g}/></svg>}
  <div className={f.tools} style={{top:top+12}}>
   <div className={f.row} role="group" aria-label="Turn and look">
    <button type="button" className={f.round} aria-label="Turn left" data-fig-turn="-1" onClick={()=>spinBy(-45)}>⟲</button>
    <button type="button" className={f.round} aria-label="Turn right" data-fig-turn="1" onClick={()=>spinBy(45)}>⟳</button>
    <button type="button" className={f.pill} data-fig-front onClick={()=>{api.front();}}>Front view</button>
    {spec.seeThrough&&<button type="button" className={f.pill} aria-pressed={xrOn} data-fig-xray onClick={()=>api.setSeeThrough(!xrOn)}>See-through</button>}
    {spec.labels!==false&&<button type="button" className={f.pill} aria-pressed={lbOn} data-fig-labels onClick={()=>api.setLabels(!lbOn)}>Labels</button>}
    {extra}
   </div>
   {!!spec.swatches?.length&&<div className={f.row} role="radiogroup" aria-label={spec.swatchLabel??'Colour'}>
    <button type="button" role="radio" aria-checked={swatch==null} className={f.swatch} data-fig-swatch="" onClick={()=>pick(null)}>{spec.swatchLabel??'Real'}</button>
    {spec.swatches.map(id=>{const s=SWATCHES.find(x=>x.id===id);if(!s)return null;
     return <button key={id} type="button" role="radio" aria-checked={swatch===id} aria-label={s.name} className={f.dot} style={{background:s.hex}} data-fig-swatch={id} onClick={()=>pick(id)}/>;})}
   </div>}
  </div>
  {!used&&<span className={f.hint} aria-hidden="true" data-fig-hint>Drag to turn</span>}
 </div>;
}
