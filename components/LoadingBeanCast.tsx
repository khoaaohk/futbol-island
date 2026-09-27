'use client';
import {type CSSProperties} from 'react';
import {preload} from 'react-dom';
import styles from './IslandLoading.module.css';
import CAST_SIZES from '@/public/splash/cast.json';
import INLINE from './splashInline.json';
import ARCADE_SIZES from '@/public/arcade-loading/cast.json';
import ARCADE_INLINE from './arcadeLoadingInline.json';
type CastId=keyof typeof CAST_SIZES;
type Group={w:number;h:number;items:{id:CastId;x:number;b:number;s:number}[]};
/**
 * The splash cast: stills of the real bean rig baked by scripts/render-splash-characters.cjs, all at one scale, so
 * placement is in render pixels (x = image centre, b = bottom, s = scale) inside each group's w×h box. The island is
 * the hero and stays unobstructed: on wide screens two small groups flank it (left / right of the shore), on portrait
 * screens one row stands on the foreground below it. Order = paint order (back first).
 */
const GROUPS:Record<'left'|'right'|'row',Group>={
 left:{w:890,h:1200,items:[{id:'keeper',x:420,b:470,s:.78},{id:'hero-kick',x:440,b:0,s:1}]},
 right:{w:910,h:900,items:[{id:'cat',x:520,b:320,s:.84},{id:'rival',x:725,b:0,s:.86},{id:'hero-cheer',x:265,b:40,s:1}]},
 row:{w:1200,h:900,items:[{id:'cat',x:930,b:60,s:.86},{id:'hero-kick',x:352,b:0,s:1},{id:'hero-cheer',x:680,b:30,s:.95}]},
};
/** Upper-bound share of the viewport width each group box takes (IslandLoading.module.css). */
const GROUP_VW={left:28,right:28,row:100};
/** Shared static bean cast and exact splash positions; no live character rigs. */
export default function LoadingBeanCast({variant='island',variation=0}:{variant?:'island'|'arcade';variation?:number}){
 const dimensions=variant==='arcade'?ARCADE_SIZES:CAST_SIZES,inline=variant==='arcade'?ARCADE_INLINE:INLINE,directory=variant==='arcade'?'arcade-loading':'splash';
 const src=(id:CastId)=>({small:`/${directory}/${id}-sm.webp`,large:`/${directory}/${id}.webp`});
 const srcSet=(id:CastId)=>{const {small,large}=src(id),{width,sm}=dimensions[id];return `${small} ${sm[0]}w, ${large} ${width}w`;};
 const sizes=(g:keyof typeof GROUPS,id:CastId,s:number)=>`${Math.ceil(dimensions[id].width*s/GROUPS[g].w*GROUP_VW[g])}vw`;

 for(const id of Object.keys(CAST_SIZES) as CastId[])preload(src(id).large,{as:'image',imageSrcSet:srcSet(id),imageSizes:sizes('row',id,1),fetchPriority:'high'});
 return (<div className={styles.cast} role="img" aria-label={variant==='arcade'?'Bean characters clapping, walking and celebrating at the arcade':'Futbol Island players kicking and cheering, one in a club mascot costume'} style={Object.fromEntries(Object.entries(inline).map(([id,uri])=>[`--inline-${id}`,`url(${uri})`])) as CSSProperties}>
      {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map(g=>{const original=GROUPS[g],ids:CastId[]=['hero-kick','hero-cheer','keeper','cat','rival'],G=variant==='arcade'?{...original,items:original.items.map(c=>({...c,id:ids[(ids.indexOf(c.id)+variation)%ids.length]}))}:original;return <div key={g} className={`${styles.group} ${styles[g]}`} style={{aspectRatio:`${G.w}/${G.h}`}}>
        {G.items.map((c,i)=>{const {width,height}=dimensions[c.id];
          const style={left:`${c.x/G.w*100}%`,bottom:`${c.b/G.h*100}%`,height:`${height*c.s/G.h*100}%`,'--d':`${.15+i*.1+(g==='right'?.12:0)}s`,...(variant==='arcade'?{'--arcade-exit-delay':`${.95+(g==='row'?([...G.items].sort((a,b)=>a.x-b.x).findIndex(item=>item.id===c.id)):(g==='right'?2:0)+i)*.12}s`}:{}),backgroundImage:`var(--inline-${c.id})`} as CSSProperties;
          return <img key={c.id} className={styles.castMember} data-cast={c.id} style={style} src={src(c.id).large} srcSet={srcSet(c.id)} sizes={sizes(g,c.id,c.s)} width={width} height={height} alt="" decoding="async" fetchPriority="high" draggable={false}/>;})}
      </div>;})}
    </div>);
}
