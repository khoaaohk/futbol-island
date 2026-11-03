import type {CSSProperties} from 'react';
import {LEARN_THEME,learnAsset,learnHash,type LearnGlyph} from '@/lib/site/learnMedia';
import type {LearnGroupId} from '@/lib/site/learnFeatures';
import CAST_SIZES from '@/public/splash/cast.json';
import s from './learn.module.css';

/**
 * One picture slot on /learn (Nov 2 2026): the still (public/learn/<key>.webp) when it exists, a looping muted clip on top when
 * public/learn/video/<key>.* exists, and otherwise an illustrated card drawn here in the group's colours (never a broken image).
 * Server component: LearnEnhance (client) decides when a clip may play (>= 50 % visible, at most 2 at once, never on reduced
 * motion / Save-Data / slow network / battery saver unless tapped). `preload="none"`: nothing downloads before it plays.
 * No `poster` on the video (QA Nov 2): a poster downloads at once even with preload none, which pulled every still (~1.7 MB) on
 * first load. The lazy <img> underneath is the poster; the clip fades in over it only once it plays.
 */
const GLYPHS:Record<LearnGlyph,React.ReactNode>={
 pitch:<><rect x="8" y="14" width="48" height="36" rx="3"/><path d="M32 14v36"/><circle cx="32" cy="32" r="7"/><path d="M8 24h7v16H8M56 24h-7v16h7"/></>,
 compass:<><circle cx="32" cy="32" r="22"/><path d="M40 24l-5 11-11 5 5-11z"/><path d="M32 6v6M32 52v6M6 32h6M52 32h6"/></>,
 ball:<><circle cx="32" cy="32" r="22"/><path d="M32 21l9 6.5-3.4 10.5H26.4L23 27.5zM32 10v11M41 27.5l10-4M37.6 38l6 9M26.4 38l-6 9M23 27.5l-10-4"/></>,
 friends:<><circle cx="22" cy="22" r="7"/><circle cx="42" cy="22" r="7"/><path d="M8 50c1-9 7-14 14-14s13 5 14 14M28 50c1-9 7-14 14-14s13 5 14 14"/></>,
 cards:<><rect x="12" y="16" width="26" height="36" rx="4" transform="rotate(-10 25 34)"/><rect x="26" y="12" width="26" height="36" rx="4"/><circle cx="39" cy="26" r="5"/><path d="M32 40h14"/></>,
 shirt:<><path d="M24 10l-14 7 5 11 6-3v29h22V25l6 3 5-11-14-7c-1 4-4 6-8 6s-7-2-8-6z"/><path d="M28 34h8M32 30v10"/></>,
 shield:<><path d="M32 8l20 7v15c0 13-9 22-20 26C21 52 12 43 12 30V15z"/><path d="M23 31l6 6 12-13"/></>,
};

export function Glyph({name,className}:{name:LearnGlyph;className?:string}){
 return <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{GLYPHS[name]}</svg>;
}

type Cast={width:number;height:number;sm:number[]};
const SIZES=CAST_SIZES as unknown as Record<string,Cast>;
/** A splash still (public/splash/<id>-sm.webp), cache-busted by its size the same way components/landing/TitleArt.tsx does. */
export function castStill(id:string){const c=SIZES[id];return c?{src:`/splash/${id}-sm.webp?v=${c.width}x${c.height}`,src2x:`/splash/${id}.webp?v=${c.width}x${c.height}`,width:c.sm[0],height:c.sm[1]}:null;}

/** The drawn stand-in: group gradient, a faint pitch / dot / stripe pattern picked by the feature id, the group glyph and, when
 *  asked, a splash cast still (public/splash) so phone frames still show a character. */
function Fallback({group,seed,label,cast}:{group:LearnGroupId;seed:string;label:string;cast?:string}){
 const t=LEARN_THEME[group],h=learnHash(seed);
 const style={'--g1':t.c1,'--g2':t.c2,'--gi':t.ink,'--ang':`${120+(h%120)}deg`,'--gx':`${20+(h>>>8)%60}%`} as CSSProperties;
 const c=cast?castStill(cast):null;
 return <div className={s.fallback} style={style} data-pattern={(h>>>4)%3} role="img" aria-label={label}>
  <svg className={s.fbPattern} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
   <g fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="6" y="6" width="148" height="88" rx="4"/><path d="M80 6v88"/><circle cx="80" cy="50" r="14"/><path d="M6 32h18v36H6M154 32h-18v36h18"/></g>
  </svg>
  <Glyph name={t.glyph} className={s.fbGlyph}/>
  {c&&<img className={s.fbCast} src={c.src} width={c.width} height={c.height} alt="" loading="lazy" decoding="async"/>}
 </div>;
}

export default function LearnMedia({imageKey,group,label,cast,eager,className}:{imageKey:string;group:LearnGroupId;label:string;cast?:string;eager?:boolean;className?:string}){
 const a=learnAsset(imageKey);
 const alt=a.alt??label;
 // Most shots are upright phone screens shown in wide slots: crop around the middle (the HUD sits at the top), or the shot's own focus.
 const focus=a.image?{objectPosition:a.focus??(a.image.height>a.image.width?'50% 50%':'50% 20%')}:undefined;
 return <div className={[s.media,className].filter(Boolean).join(' ')} data-media={a.image?'still':'art'}>
  {a.image?<img className={s.still} src={a.image.src} width={a.image.width} height={a.image.height} alt={alt} loading={eager?'eager':'lazy'} decoding="async" style={focus}/>
   :<Fallback group={group} seed={imageKey} label={alt} cast={cast}/>}
  {a.clip&&<>
   <video className={s.clip} data-lv="" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture style={focus}>
    {a.clip.webm&&<source src={a.clip.webm} type="video/webm"/>}
    {a.clip.mp4&&<source src={a.clip.mp4} type="video/mp4"/>}
   </video>
   <button type="button" className={s.clipBtn} data-lv-btn="" aria-label={`Play the clip: ${label}`} data-label={label}>
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className={s.icoPlay} d="M8 5.5v13l11-6.5z"/><path className={s.icoPause} d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
   </button>
  </>}
 </div>;
}
