'use client';
import {Fragment} from 'react';
import {Dots,Line,Solid} from '../anatomy/draw';
import type {Item} from './bench';

/** Renders the bench's display list with the shared anatomy kit (solids, engraved lines, screw dots, soft shadows, spheres). */
export function Sphere({c,r,cls}:{c:[number,number];r:number;cls?:string}){
 const [x,y]=c,lit=!!cls?.includes('lit');
 return <g className={`tl-sphere${cls?' '+cls.split(' ').map(k=>k==='lit'?'lit':'tl-'+k).join(' '):''}`}>
  <circle className="tl-sphere-body" cx={x} cy={y} r={r}/>
  <circle className="tl-sphere-light" cx={x-r*.13} cy={y-r*.13} r={r*.8}/>
  {cls?.startsWith('leather')&&<path className="tl-sphere-seam" d={`M${x-r*.7} ${y}Q${x} ${y-r*.5} ${x+r*.7} ${y}M${x-r*.2} ${y-r*.42}l${r*.12} ${r*.16}M${x} ${y-r*.48}l${r*.12} ${r*.16}M${x+r*.2} ${y-r*.42}l${r*.12} ${r*.16}`}/>}
  {cls?.startsWith('telstar')&&<g className="tl-sphere-dots">{[[-.35,-.3],[.3,-.25],[0,.25],[-.45,.25],[.42,.28],[0,-.55]].map(([dx,dy],i)=><circle key={i} cx={x+dx*r} cy={y+dy*r} r={r*.16}/>)}</g>}
  <circle className="tl-sphere-edge" cx={x} cy={y} r={r} data-lit={lit||undefined}/>
 </g>;
}
export default function Draw({items}:{items:readonly Item[]}){
 return <>{items.map((it,i)=>{
  switch(it.k){
   case 'solid':return <Fragment key={i}><Solid paths={it.paths} tone={it.tone} crease={it.crease} lit={it.lit} flat={it.flat} className={it.cls}
    inner={it.inner?<Line d={it.inner} tone="faint"/>:undefined}/></Fragment>;
   case 'line':return <Line key={i} d={it.d} tone={it.tone} className={it.cls} free={it.free}/>;
   case 'dots':return <Dots key={i} points={it.pts} size={it.size} tone={it.tone}/>;
   case 'ball':return <Sphere key={i} c={it.c} r={it.r} cls={it.cls}/>;
   case 'shadow':return <path key={i} className="tl-shadow" d={it.d} style={{opacity:it.o}}/>;
  }
 })}</>;
}
