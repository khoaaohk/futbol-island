'use client';
import {Fragment,useMemo,useRef} from 'react';
import {Dots,Line,Solid} from '../anatomy/draw';
import type {Item} from './board';
import type {Group} from './plinths';
import {useSize} from '../anatomy/hooks';

/**
 * Renders the board's display list with the shared anatomy kit (../anatomy/draw): solids (four-tone shading, crease, outline),
 * engraved lines, screw dots, soft shadows, and turned balls (the heads, and the match ball in the exhibit's one accent).
 * `inner` strings are kit path data drawn as a faint seam under the outline.
 */
export function Ball({c,r,cls}:{c:[number,number];r:number;cls?:string}){
 const [x,y]=c;
 return <g className={`hof-sphere${cls?' '+cls.split(' ').map(c=>c==='lit'?'lit':'hof-'+c).join(' '):''}`}>
  <circle className="hof-ball-body" cx={x} cy={y} r={r}/>
  <circle className="hof-ball-light" cx={x-r*.13} cy={y-r*.13} r={r*.8}/>
  {cls==='ball'&&<path className="hof-ball-seam" d={`M${x-r*.62} ${y+r*.12}Q${x} ${y-r*.38} ${x+r*.62} ${y+r*.12}`}/>}
  <circle className="hof-ball-edge" cx={x} cy={y} r={r}/>
 </g>;
}
export default function Draw({items}:{items:readonly Item[]}){
 return <>{items.map((it,i)=>{
  switch(it.k){
   case 'solid':return <Fragment key={i}><Solid paths={it.paths} tone={it.tone} crease={it.crease} halo={it.halo} lit={it.lit} flat={it.flat} className={it.cls}
    inner={it.inner?<Line d={it.inner} tone="faint"/>:undefined}/></Fragment>;
   case 'line':return <Line key={i} d={it.d} tone={it.tone} className={it.cls} free={it.free}/>;
   case 'dots':return <Dots key={i} points={it.pts} size={it.size} tone={it.tone}/>;
   case 'ball':return <Ball key={i} c={it.c} r={it.r} cls={it.cls}/>;
   case 'shadow':return <path key={i} className="hof-shadow" d={it.d} style={{opacity:it.o}}/>;
  }
 })}</>;
}

/** A small static iso drawing, built once per size. */
export function Figure({scene}:{scene:{groups:Group[]}}){
 return <>{scene.groups.map((g,i)=>g.tr?<g key={i} transform={g.tr}><Draw items={g.items}/></g>:<Draw key={i} items={g.items}/>)}</>;
}
export function Sized({className,label,build}:{className:string;label:string;build:(w:number,h:number)=>{groups:Group[]}}){
 const box=useRef<HTMLDivElement>(null),{w,h}=useSize(box);
 const scene=useMemo(()=>w&&h?build(w,h):null,[w,h,build]);
 return <div ref={box} className={className}>{scene&&<svg className="iso-svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role={label?'img':undefined} aria-hidden={label?undefined:true} aria-label={label||undefined}><Figure scene={scene}/></svg>}</div>;
}
