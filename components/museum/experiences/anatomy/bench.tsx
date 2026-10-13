'use client';
import {useEffect,useId,useState,type ReactNode,type RefObject} from 'react';
import * as k from './iso-kit';
import {Solid,Line,Dots} from './draw';

/**
 * The bench: the small shared toolkit telstar-1970, laced-leather and shirts draw their anatomy-style machines with (Oct 12 2026 restyle, user: every
 * exhibit except the penalty kick uses the "anatomy" isometric technical-illustration look, Paper theme). It sits on the shared
 * kit (iso-kit, draw) and adds what a full-screen GAME needs:
 *  - a FRAME: two floor directions (u, v) so the same model lies landscape (u to screen right) or portrait (u to screen up) and
 *    always fills the screen;
 *  - useBox (the play area's live size), useLive (on screen and the tab visible) and useRaf (the shared Paper loop from paper-loop.ts:
 *    runs only while something moves and while the play area is live; it stops itself, and is cancelled on unmount);
 *  - painters for the paper look: a tinted solid (colour only where colour is the subject), a shaded sphere, a base plate on feet.
 */
export type Plane=k.Plane;
export type Orient='wide'|'tall';
export type Frame={u:Plane;v:Plane;o:Orient};
/** wide: u runs to screen right (dipping a little), v to screen down. tall: u runs to screen up, v to screen right. The frame is
 *  turned off the camera's diagonal (15° wide, 9° tall) so both side faces of every box show: a dimetric look with real volume. */
export const frameFor=(o:Orient,twist=o==='wide'?15:9):Frame=>{const b=((o==='wide'?-45:225)+twist)*Math.PI/180;
 return {u:[Math.cos(b),Math.sin(b)],v:[Math.cos(b+Math.PI/2),Math.sin(b+Math.PI/2)],o};};
export const at=(F:Frame,a:number,b:number):Plane=>[F.u[0]*a+F.v[0]*b,F.u[1]*a+F.v[1]*b];
export type FPlan={a:number;b:number;w:number;d:number;r:number};
export const ringIn=(F:Frame,p:FPlan,steps=6):Plane[]=>k.roundedPlan({x:p.a,y:p.b,w:p.w,d:p.d,r:p.r},steps).map(([a,b])=>at(F,a,b));
export const slab=(F:Frame,p:FPlan,z:number,h:number,P:k.Projection,steps=6,bevel=0)=>k.extrude(ringIn(F,p,steps),z,h,P,{bevel});
export const post=(F:Frame,a:number,b:number,r:number,z:number,h:number,P:k.Projection,steps=24,bevel=0)=>{const [x,y]=at(F,a,b);return k.cylinder(x,y,r,z,h,P,steps,bevel);};
export const pt=(F:Frame,a:number,b:number,z:number,P:k.Projection)=>k.iso([...at(F,a,b),z],P);
export const onTop=(F:Frame,pts:readonly (readonly [number,number])[],z:number,P:k.Projection,closed=false)=>k.onTop(pts.map(([a,b])=>at(F,a,b)),z,P,closed);
export const ringTop=(F:Frame,a:number,b:number,r:number,z:number,P:k.Projection,steps=40)=>{const [x,y]=at(F,a,b);return k.ring(x,y,r,z,P,steps);};
export const seg=(F:Frame,a0:number,b0:number,z0:number,a1:number,b1:number,z1:number,P:k.Projection)=>k.pathOf([pt(F,a0,b0,z0,P),pt(F,a1,b1,z1,P)]);
export const depth=(F:Frame,a:number,b:number,z:number,P:k.Projection)=>k.depthOf([...at(F,a,b),z],P);
/** Screen px per world unit (a sphere of world radius r is r × kOf(P) px across). */
export const kOf=(P:k.Projection)=>P.scale*Math.sqrt(1.6);
/** Fit a projection to the frame-space extremes [a, b, z] (the whole model), filling the play area. */
export function fit(F:Frame,pts:readonly (readonly [number,number,number])[],W:number,H:number,pad:number,elevation=30){
 return k.fitProjection(pts.map(([a,b,z])=>[...at(F,a,b),z] as k.Point3),Math.max(W,40),Math.max(H,40),{pad,elevation});
}
export const boxPts=(p:FPlan,z0:number,z1:number):[number,number,number][]=>[[p.a,p.b,z0],[p.a+p.w,p.b,z0],[p.a,p.b+p.d,z0],[p.a+p.w,p.b+p.d,z0],[p.a,p.b,z1],[p.a+p.w,p.b,z1],[p.a,p.b+p.d,z1],[p.a+p.w,p.b+p.d,z1]];

// ── Colour ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const hexRgb=(h:string)=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
const rgbHex=(c:number[])=>'#'+c.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
export const mix=(a:string,b:string,t:number)=>{const A=hexRgb(a),B=hexRgb(b);return rgbHex(A.map((v,i)=>v+(B[i]-v)*t));};
/** Rec. 709 luma (0–255) and the grey a black-and-white set shows for a colour. */
export const luma=(h:string)=>{const [r,g,b]=hexRgb(h);return .2126*r+.7152*g+.0722*b;};
export const greyOf=(h:string)=>{const l=luma(h);return rgbHex([l,l,l]);};

// ── Painters ───────────────────────────────────────────────────────────────────────────────────────────────────────────
/** A solid in a real colour (a kit, dye, turf, leather): four side tones darker by facing, the top a touch lighter. */
export function Tint({paths,color,edge='hi',crease=true,halo=false,inner}:{paths:k.SolidPaths;color:string;edge?:k.Tone;crease?:boolean;halo?:boolean;inner?:ReactNode}){
 return <g className="iso-solid" data-tint="">
  {halo&&<path className="iso-halo" d={paths.fill}/>}
  <path d={paths.fill} fill={mix(color,'#000000',.12)}/>
  {paths.shades.map((d,i)=>d?<path key={i} d={d} fill={mix(color,'#000000',[.3,.22,.14,.07][i])}/>:null)}
  <path d={paths.top} fill={mix(color,'#ffffff',.06)}/>
  {crease&&paths.crease?<path className="iso-line" data-tone="faint" d={paths.crease} style={{stroke:mix(color,'#ffffff',.35)}}/>:null}
  {inner}
  <path className="iso-line iso-edge" data-tone={edge} d={paths.outline}/>
 </g>;
}
/** A ball: a shaded sphere (light from the upper left), a hairline outline and an optional contact shadow. */
export function Sphere({c,r,color,edge=true,shadow,glint=true,children}:{c:k.Flat;r:number;color:string;edge?:boolean;shadow?:{c:k.Flat;rx:number;ry:number};glint?:boolean;children?:ReactNode}){
 const id='sph'+useId().replace(/:/g,'');
 return <g data-sphere="">
  {shadow&&<ellipse className="iso-halo" cx={shadow.c[0]} cy={shadow.c[1]} rx={shadow.rx} ry={shadow.ry}/>}
  <defs><radialGradient id={id} cx=".36" cy=".32" r=".78">
   <stop offset="0" stopColor={glint?mix(color,'#ffffff',.42):mix(color,'#ffffff',.08)}/><stop offset=".55" stopColor={color}/><stop offset="1" stopColor={mix(color,'#000000',.26)}/>
  </radialGradient></defs>
  <circle cx={c[0]} cy={c[1]} r={r} fill={`url(#${id})`}/>
  {children}
  {edge&&<circle className="iso-line" data-tone="hi" cx={c[0]} cy={c[1]} r={r} fill="none"/>}
 </g>;
}
/** The base plate every model stands on: a halo, four feet on flanges, a bevelled slab, a groove, corner screws and a ruler. */
export function Base({F,p,P,z=-14,h=12,ruler=true}:{F:Frame;p:FPlan;P:k.Projection;z?:number;h?:number;ruler?:boolean}){
 const feet=[[p.a+22,p.b+22],[p.a+p.w-22,p.b+22],[p.a+22,p.b+p.d-22],[p.a+p.w-22,p.b+p.d-22]].sort((A,B)=>depth(F,A[0],A[1],0,P)-depth(F,B[0],B[1],0,P));
 const top=z+h,groove={a:p.a+6,b:p.b+6,w:p.w-12,d:p.d-12,r:Math.max(0,p.r-6)};
 const screws=[[p.a+12,p.b+12],[p.a+p.w-12,p.b+12],[p.a+12,p.b+p.d-12],[p.a+p.w-12,p.b+p.d-12]];
 // The ruler strip along the near long edge (b max in both frames reads as "front").
 const strip={a:p.a+40,b:p.b+p.d-16,w:p.w-80,d:7,r:1};
 const ticks:string[]=[],major:string[]=[];
 if(ruler)for(let a=strip.a+4,i=0;a<=strip.a+strip.w-4;a+=5,i++)(i%5?ticks:major).push(onTop(F,[[a,strip.b+.8],[a,strip.b+.8+(i%5?2.2:3.8)]],top+.6,P));
 return <g data-base="">
  <path className="iso-halo" d={slab(F,p,z-6,h,P).fill}/>
  {feet.map(([a,b],i)=><g key={i}><Solid paths={post(F,a,b,8,z-6,2,P,24)} tone="mid"/><Solid paths={post(F,a,b,6,z-4,4,P,24)} tone="mid"/></g>)}
  <Solid paths={slab(F,p,z,h,P,8,1.6)} tone="mid" inner={<Line d={k.ringSeam(ringIn(F,p,8),z+h*.45,P)} tone="faint"/>}/>
  <Line d={k.onTop(ringIn(F,groove,8),top,P,true)} tone="lo"/>
  {screws.map(([a,b],i)=><Line key={i} d={ringTop(F,a,b,2.4,top,P,16)} tone="lo"/>)}
  <Dots points={screws.map(([a,b])=>pt(F,a,b,top,P))} size={.6} tone="hi"/>
  {ruler&&<><Solid paths={slab(F,strip,top,.6,P,3)} tone="lo" crease="none"/><Line d={ticks.join('')} tone="lo"/><Line d={major.join('')} tone="mid"/></>}
 </g>;
}
/** A label plate with three rule lines (they stand for printed text) and two screws. */
export function LabelPlate({F,a,b,w,d,z,P}:{F:Frame;a:number;b:number;w:number;d:number;z:number;P:k.Projection}){
 const p={a,b,w,d,r:1.5};
 return <g>
  <Solid paths={slab(F,p,z,.8,P,4)} tone="mid"/>
  <Line d={k.onTop(ringIn(F,{a:a+1.6,b:b+1.6,w:w-3.2,d:d-3.2,r:.6},4),z+.8,P,true)} tone="faint"/>
  {[.3,.5,.7].map((f,i)=><Line key={i} d={onTop(F,[[a+5,b+d*f],[a+5+(w-14)*[1,.7,.45][i],b+d*f]],z+.8,P)} tone="lo" free/>)}
  <Dots points={[pt(F,a+w-4,b+d*.3,z+.8,P),pt(F,a+w-4,b+d*.7,z+.8,P)]} size={.55} tone="hi"/>
 </g>;
}

// ── Hooks ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The live size of an element (ResizeObserver, released on unmount). */
export function useBox<T extends Element>(ref:RefObject<T|null>){
 const [box,setBox]=useState({w:0,h:0});
 useEffect(()=>{const el=ref.current;if(!el)return;const read=()=>{const r=el.getBoundingClientRect();setBox(b=>Math.round(r.width)===b.w&&Math.round(r.height)===b.h?b:{w:Math.round(r.width),h:Math.round(r.height)});};
  read();if(typeof ResizeObserver==='undefined')return;const ro=new ResizeObserver(read);ro.observe(el);return()=>ro.disconnect();},[ref]);
 return box;
}
/** True while the element is on screen and the tab is visible (IntersectionObserver + visibilitychange). */
export function useLive<T extends Element>(ref:RefObject<T|null>){
 const [seen,setSeen]=useState(true),[shown,setShown]=useState(true);
 useEffect(()=>{const el=ref.current;if(!el||typeof IntersectionObserver==='undefined')return;const io=new IntersectionObserver(es=>setSeen(es.some(e=>e.isIntersecting)));io.observe(el);return()=>io.disconnect();},[ref]);
 useEffect(()=>{const on=()=>setShown(!document.hidden);on();document.addEventListener('visibilitychange',on);return()=>document.removeEventListener('visibilitychange',on);},[]);
 return seen&&shown;
}
/** The frame loop: the shared Paper loop (paper-loop.ts), parked while `live` is false. Returns wake(). */
export {useRaf} from './paper-loop';
