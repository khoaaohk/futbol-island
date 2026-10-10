// No hooks and no 'use client': shared, so the server-rendered loader placeholder (IslandLoadingStatic) ships no JS for it.
import {type CSSProperties} from 'react';
import styles from './IslandLoading.module.css';
import CAST_SIZES from '@/public/splash/cast.json';
import INLINE from './splashInline.json';
import ARCADE_SIZES from '@/public/arcade-loading/cast.json';
import ARCADE_INLINE from './arcadeLoadingInline.json';
/** The ids both casts have (Oct 9 2026: public/splash/cast.json also lists the title screen's trick cast, which this loader doesn't use). */
type CastId=keyof typeof CAST_SIZES&keyof typeof ARCADE_SIZES;
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
/** When each group is on screen: exactly the IslandLoading.module.css breakpoint (portrait row vs wide flanks). */
const CAST_GROUP_MEDIA={row:'(max-aspect-ratio:5/6)',left:'not all and (max-aspect-ratio:5/6)',right:'not all and (max-aspect-ratio:5/6)'} as const;
/** Exit hop order (was :nth-child in the CSS; each <img> now sits alone in its <picture>). */
const EXIT_DELAY=[.12,.04,.18,0,0];
/**
 * Shared static bean cast and exact splash positions; no live character rigs.
 * Loading (docs/performance-guide.md, "Splash cast arrives with the splash", Oct 1 2026):
 *  - one high-priority preload per character the current layout SHOWS (media = its group's breakpoint, sizes = its
 *    on-screen width), so a phone fetches only the three row stills instead of all ten files;
 *  - the main splash serves AVIF (≈27 % smaller than the WebP, higher SSIM against the raw render) through <picture>,
 *    WebP stays as the fallback; the arcade cast has WebP only;
 *  - <img loading="lazy">: the visible ones are in the first viewport and take the preloaded bytes at once, the hidden
 *    group's (display:none) never download, and React adds no automatic head preload for them (it did for eager imgs);
 *  - the inline placeholder (background) paints with the first frame; the entrance is one short unstaggered fade.
 */
/** `lite` (the server-rendered placeholder at `/`, components/IslandLoadingStatic.tsx, hidden for title-screen visitors): no head
 *  preloads and no inline data-URI placeholders, so a visitor who never enters the game downloads none of it; the stills come
 *  from the HTTP cache on an in-game reload. */
export default function LoadingBeanCast({variant='island',variation=0,lite=false}:{variant?:'island'|'arcade';variation?:number;lite?:boolean}){
 const dimensions=variant==='arcade'?ARCADE_SIZES:CAST_SIZES,inline=variant==='arcade'?ARCADE_INLINE:INLINE,directory=variant==='arcade'?'arcade-loading':'splash',avif=variant==='island';
 const src=(id:CastId,ext='webp')=>({small:`/${directory}/${id}-sm.${ext}`,large:`/${directory}/${id}.${ext}`});
 const srcSet=(id:CastId,ext='webp')=>{const {small,large}=src(id,ext),{width,sm}=dimensions[id];return `${small} ${sm[0]}w, ${large} ${width}w`;};
 const best=avif?'avif':'webp';
 const sizes=(g:keyof typeof GROUPS,id:CastId,s:number)=>`${Math.ceil(dimensions[id].width*s/GROUPS[g].w*GROUP_VW[g])}vw`;

 const ids:CastId[]=['hero-kick','hero-cheer','keeper','cat','rival'];
 const groups=(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map(g=>{const original=GROUPS[g];return [g,variant==='arcade'?{...original,items:original.items.map(c=>({...c,id:ids[(ids.indexOf(c.id)+variation)%ids.length]}))}:original] as const;});
 // <link> (hoisted into <head> by React), not react-dom preload(): this React build drops preload()'s `media` option.
 const preloads=lite?[]:groups.flatMap(([g,G])=>G.items.map(c=><link key={g+c.id} rel="preload" as="image" type={`image/${best}`} href={src(c.id,best).large} imageSrcSet={srcSet(c.id,best)} imageSizes={sizes(g,c.id,c.s)} media={CAST_GROUP_MEDIA[g]} fetchPriority="high"/>));
 return (<>{preloads}<div className={styles.cast} role="img" aria-label={variant==='arcade'?'Bean characters clapping, walking and celebrating at the arcade':'Futbol Island players kicking and cheering, one in a club mascot costume'} style={lite?undefined:Object.fromEntries(Object.entries(inline).map(([id,uri])=>[`--inline-${id}`,`url(${uri})`])) as CSSProperties}>
      {groups.map(([g,G])=>{return <div key={g} className={`${styles.group} ${styles[g]}`} style={{aspectRatio:`${G.w}/${G.h}`}}>
        {G.items.map((c,i)=>{const {width,height}=dimensions[c.id];
          const style={left:`${c.x/G.w*100}%`,bottom:`${c.b/G.h*100}%`,height:`${height*c.s/G.h*100}%`,'--d':`${i*.03}s`,'--x':`${EXIT_DELAY[i]}s`,...(variant==='arcade'?{'--arcade-exit-delay':`${.95+(g==='row'?([...G.items].sort((a,b)=>a.x-b.x).findIndex(item=>item.id===c.id)):(g==='right'?2:0)+i)*.12}s`}:{}),backgroundImage:`var(--inline-${c.id})`} as CSSProperties;
          const img=<img className={styles.castMember} data-cast={c.id} style={style} src={src(c.id).large} srcSet={srcSet(c.id)} sizes={sizes(g,c.id,c.s)} width={width} height={height} alt="" loading="lazy" decoding="async" fetchPriority="high" draggable={false}/>;
          return <picture key={c.id}>{avif&&<source type="image/avif" srcSet={srcSet(c.id,'avif')} sizes={sizes(g,c.id,c.s)}/>}{img}</picture>;})}
      </div>;})}
    </div></>);
}
