'use client';
import {useRef,useState,type KeyboardEvent,type PointerEvent as RPE,type ReactNode} from 'react';
import {clampToView,markings,nudge,toModel,toScreen,type Frame,type Pt} from './geometry';
import b from './board.module.css';

/**
 * The tactics board (Oct 14 2026): an abstract pitch (paper surface, hairline markings) and round counters, shared by the 1872,
 * offside and formations exhibits. Counters you may move are dragged (pointer capture, one setState per pointer move, nothing at
 * rest) or nudged with the arrow keys; a tap (or Enter) on a counter calls onTap. Counters glide to new places with a CSS
 * transform transition (no frame loop; reduced motion: they jump). Each counter has a 48 px hit circle.
 */
export type Tone='ink'|'paper'|'accent'|'ball'|'ghost'|'navy';
export type DotSpec={id:string;p:Pt;tone:Tone;name:string;label?:string;drag?:boolean;tap?:boolean;hidden?:boolean;ring?:boolean;small?:boolean};

export default function Board({f,dots,onMove,onTap,onDrop,under,over,label,dataId}:{f:Frame;dots:readonly DotSpec[];
 onMove?:(id:string,p:Pt)=>void;onTap?:(id:string)=>void;onDrop?:(id:string)=>void;
 /** Drawn on the pitch under the counters (lanes, lines). */
 under?:(f:Frame)=>ReactNode;over?:(f:Frame)=>ReactNode;label:string;dataId:string}){
 const svg=useRef<SVGSVGElement>(null),drag=useRef<{id:string;pid:number;x:number;y:number;moved:boolean}|null>(null),[dragId,setDragId]=useState<string|null>(null);
 const m=markings(f),R=Math.max(9,Math.min(15,f.s*2.3));
 const local=(e:{clientX:number;clientY:number})=>{const r=svg.current!.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top] as const;};
 const specOf=(t:EventTarget|null)=>{const el=(t as Element|null)?.closest?.('[data-dot]');const id=el?.getAttribute('data-dot');return id?dots.find(d=>d.id===id&&!d.hidden)??null:null;};
 const down=(e:RPE<SVGSVGElement>)=>{if(e.button>0)return;const d=specOf(e.target);if(!d||(!d.drag&&!d.tap))return;e.preventDefault();
  const [x,y]=local(e);drag.current={id:d.id,pid:e.pointerId,x,y,moved:false};try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* synthetic */}};
 const move=(e:RPE<SVGSVGElement>)=>{const g=drag.current;if(!g||g.pid!==e.pointerId)return;const d=dots.find(x=>x.id===g.id);if(!d?.drag)return;
  const [x,y]=local(e);if(!g.moved&&Math.hypot(x-g.x,y-g.y)<5)return;if(!g.moved){g.moved=true;setDragId(g.id);}
  onMove?.(g.id,clampToView(f,toModel(f,x,y)));};
 const up=(e:RPE<SVGSVGElement>)=>{const g=drag.current;if(!g||g.pid!==e.pointerId)return;drag.current=null;setDragId(null);
  if(g.moved)onDrop?.(g.id);else onTap?.(g.id);};
 const key=(e:KeyboardEvent<SVGSVGElement>)=>{const d=specOf(e.target);if(!d)return;
  if((e.key==='Enter'||e.key===' ')&&d.tap){e.preventDefault();onTap?.(d.id);return;}
  if(!d.drag)return;const n=nudge(d.p,e.key);if(!n)return;e.preventDefault();onMove?.(d.id,clampToView(f,n));onDrop?.(d.id);};
 return <svg ref={svg} className={b.svg} viewBox={`0 0 ${f.w} ${f.h}`} width={f.w} height={f.h} role="group" aria-label={label} data-board={dataId} data-portrait={f.portrait||undefined}
  data-dragging={dragId??undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
  <defs><clipPath id={`${dataId}-clip`}><rect x={m.surface.x-1} y={m.surface.y-1} width={m.surface.w+2} height={m.surface.h+2}/></clipPath></defs>
  <rect className={b.surface} x={m.surface.x} y={m.surface.y} width={m.surface.w} height={m.surface.h} rx="2"/>
  <g clipPath={`url(#${dataId}-clip)`}>
   <path className={b.lines} d={m.lines}/>
   {m.centre&&<><circle className={b.lines} cx={m.centre.at[0]} cy={m.centre.at[1]} r={m.centre.r}/><circle className={b.spot} cx={m.centre.at[0]} cy={m.centre.at[1]} r="1.8"/></>}
   {m.spots.map(([x,y],i)=><circle key={i} className={b.spot} cx={x} cy={y} r="1.8"/>)}
  </g>
  {m.goals.map((d,i)=><path key={i} className={b.goal} d={d}/>)}
  {under?.(f)}
  {dots.map(d=>{const [X,Y]=toScreen(f,d.p),r=d.small||d.tone==='ball'?R*.55:R,live=!d.hidden&&(d.drag||d.tap);
   return <g key={d.id} className={b.dot} data-dot={d.id} data-tone={d.tone} data-drag={dragId===d.id||undefined} data-hidden={d.hidden||undefined} data-can-drag={d.drag||undefined}
    style={{transform:`translate(${X.toFixed(1)}px,${Y.toFixed(1)}px)`}} tabIndex={live?0:undefined} role={live?'button':undefined} aria-hidden={d.hidden||undefined}
    aria-label={live?`${d.name}${d.drag?': drag, or use the arrow keys':''}`:undefined}>
    {live&&<circle className={b.hit} r={24}/>}
    {d.ring&&<circle className={b.ring} r={r+6}/>}
    <circle className={b.body} r={r}/>
    {d.label&&<text className={b.label} y={r*.36} fontSize={Math.round(r*1.02)}>{d.label}</text>}
   </g>;})}
  {over?.(f)}
 </svg>;
}
