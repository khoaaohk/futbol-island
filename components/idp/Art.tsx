'use client';
/**
 * IDP art kit (docs/idp/DESIGN.md §6): small, static SVG in the island's ink-and-paper style. Motion is CSS only (draw-ons and
 * pops that run once when a beat enters, then stop); nothing here owns a timer or a frame loop.
 */
import type {CSSProperties} from 'react';
import type {SkillId,Corner} from '@/lib/coaches/idp';
import type {Diagram,FeelId,StickerId} from '@/lib/coaches/idp/skills';
import {RING_PIECES} from '@/lib/coaches/idp/journey';
import s from './Idp.module.css';

const P={fill:'none',stroke:'currentColor',strokeWidth:2.2,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
/** One glyph per skill family, drawn on a 24-unit grid. */
export function SkillGlyph({skill,size=24}:{skill:SkillId;size?:number}){
 const g:Record<SkillId,JSX.Element>={
  scan:<><path {...P} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle {...P} cx="12" cy="12" r="2.8"/></>,
  space:<><circle {...P} cx="7" cy="15" r="3"/><path {...P} d="M12 15h4M14 9l4 3-4 3"/><path {...P} strokeDasharray="1 3" d="M7 8V4"/></>,
  defend:<><path {...P} d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path {...P} d="M9 12l2 2 4-4"/></>,
  recover:<><path {...P} d="M20 12a8 8 0 1 1-3-6.2"/><path {...P} d="M17 3v3.5h3.5"/></>,
  talk:<><path {...P} d="M4 5h16v10H10l-5 4v-4H4z"/><path {...P} d="M8 10h8"/></>,
  touch:<><circle {...P} cx="15" cy="14" r="5"/><path {...P} d="M3 20c3 0 4-3 6-3M15 9v1.5M11.2 12.4l1.3.8"/></>,
  dribble:<><circle {...P} cx="18" cy="17" r="3"/><path {...P} strokeDasharray="1.5 3" d="M3 7c5 0 4 10 11 10"/></>,
  pass:<><circle {...P} cx="5" cy="17" r="2.4"/><circle {...P} cx="19" cy="7" r="2.4"/><path {...P} d="M7.5 15.5L16 9M13 8.6l3 .4-.6 3"/></>,
  switch:<><path {...P} d="M5 19C5 9 19 15 19 5"/><path {...P} d="M15.5 6.5L19 5l1 3.6"/><circle {...P} cx="5" cy="19" r="1.8"/></>,
  runs:<><path {...P} d="M13 3l-6 10h5l-1 8 7-11h-5z"/></>,
  brave:<><path {...P} d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z"/><path {...P} d="M12 8v5"/></>,
 };
 return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{g[skill]}</svg>;
}
export function CornerGlyph({corner,size=28}:{corner:Corner;size?:number}){
 const g:Record<Corner,JSX.Element>={
  technical:<><circle {...P} cx="12" cy="12" r="8"/><path {...P} d="M12 4l2.5 4.5h-5zM7 15l2-4M17 15l-2-4M9 19.5l3-3 3 3"/></>,
  tactical:<><rect {...P} x="3.5" y="5" width="17" height="14" rx="2"/><path {...P} d="M12 5v14M7 9l3 3M10 9l-3 3"/><circle {...P} cx="16" cy="13" r="1.8"/></>,
  physical:<><circle {...P} cx="14" cy="4.5" r="2"/><path {...P} d="M9 21l3-6 3 2v4M6 11l4-3h4l3 4M12 8l-1 7"/></>,
  social:<><circle {...P} cx="8" cy="8" r="2.6"/><circle {...P} cx="16" cy="8" r="2.6"/><path {...P} d="M3.5 19c0-3 2-5 4.5-5s4 1.5 4 1.5 1.5-1.5 4-1.5 4.5 2 4.5 5"/></>,
 };
 return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{g[corner]}</svg>;
}
/** Self-check faces. The mouth tells the story; colour backs it up (never colour alone). */
export function Face({feel,size=56}:{feel:FeelId;size?:number}){
 const fill={tricky:'#f6d3b5',getting:'#f8e28b',cando:'#bfe3a8',nochance:'#e7e7d1'}[feel];
 return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className={s.face}>
  <circle cx="24" cy="24" r="20" fill={fill} stroke="#244d40" strokeWidth="2.5"/>
  {feel==='nochance'?<><path {...P} stroke="#244d40" d="M15 20h4M29 20h4M17 31h14"/><path {...P} stroke="#244d40" strokeDasharray="1 4" d="M8 40l32-32"/></>
  :<><circle cx="17" cy="20" r="2.4" fill="#244d40"/><circle cx="31" cy="20" r="2.4" fill="#244d40"/>
   <path {...P} stroke="#244d40" strokeWidth={2.6} d={feel==='tricky'?'M16 32c3-3 13-3 16 0':feel==='getting'?'M16 30c4 2 12 2 16-1':'M14 28c4 7 16 7 20 0'}/>
   {feel==='cando'&&<path {...P} stroke="#244d40" d="M36 9l2-3M40 13l3-1M12 9l-2-3"/>}</>}
 </svg>;
}
/** Proud-moment stickers: picture first, words underneath (no typing needed). */
export function Sticker({id,size=52}:{id:StickerId;size?:number}){
 const bg:Record<StickerId,string>={tried:'#cfe3f2',helped:'#f1cfe2',brave:'#f6d3b5',did:'#f8d651',listened:'#d5e8c8',fun:'#f9d665',home:'#beded1',cheered:'#ed9dce'};
 const g:Record<StickerId,JSX.Element>={
  tried:<path {...P} d="M24 34V20M24 20c-6 0-9-4-9-9 6 0 9 4 9 9zM24 24c5 0 8-3 8-8-5 0-8 3-8 8z"/>,
  helped:<path {...P} d="M12 27l6-5 5 3 7-6 6 4M14 31l4 3h8l8-6"/>,
  brave:<><path {...P} d="M24 13l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12v-6z"/><path {...P} d="M20 24l3 3 6-6"/></>,
  did:<><circle {...P} cx="24" cy="24" r="10"/><circle {...P} cx="24" cy="24" r="4.5"/><path {...P} d="M32 16l5-5M34 11h3v3"/></>,
  listened:<path {...P} d="M20 34c3 0 4-2 4-4 0-3 5-4 5-10a7 7 0 0 0-14 0M21 21a3 3 0 0 1 5 0"/>,
  fun:<><circle {...P} cx="24" cy="24" r="10"/><path {...P} d="M19 26c2 3 8 3 10 0M20 21h.5M28 21h.5"/></>,
  home:<><path {...P} d="M13 24l11-9 11 9M16 22v12h16V22"/><circle {...P} cx="24" cy="29" r="3"/></>,
  cheered:<path {...P} d="M14 26l14-8v18l-14-6zM14 26v5M32 22l4-2M32 27h5M32 32l4 2"/>,
 };
 return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className={s.sticker}><circle cx="24" cy="24" r="22" fill={bg[id]} stroke="#fff2cd" strokeWidth="3"/><g stroke="#244d40">{g[id]}</g></svg>;
}
/**
 * The goal badge: the skill glyph inside a ring of RING_PIECES pieces. A piece fills for each practice moment; the ring only
 * grows. `grow` replays the fill once (beat entry); `--from` lets just the newest pieces animate.
 */
export function GrowthRing({skill,pieces,size=132,grow=false,from=0,label}:{skill:SkillId;pieces:number;size?:number;grow?:boolean;from?:number;label:string}){
 const r=42,c=2*Math.PI*r,gap=4,seg=c/RING_PIECES-gap;
 return <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label} className={s.ring} data-grow={grow||undefined}>
  <circle cx="50" cy="50" r="34" fill="#fff8e3" stroke="#244d40" strokeWidth="2.5"/>
  {Array.from({length:RING_PIECES},(_,i)=>{const on=i<pieces;return <circle key={i} cx="50" cy="50" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
   className={on?s.piece:s.pieceOff} style={{strokeDasharray:`${seg} ${c-seg}`,strokeDashoffset:-(i*c/RING_PIECES),'--i':Math.max(0,i-from)} as CSSProperties} transform="rotate(-90 50 50)"/>;})}
  <g transform="translate(32 32) scale(1.5)" className={s.ringGlyph}><SkillGlyph skill={skill}/></g>
 </svg>;
}
/** A tiny pitch with the idea drawn on once: our players (green), theirs (pink), the ball, a run and a pass. */
export function PlayDiagram({d,label,draw=true}:{d:Diagram;label:string;draw?:boolean}){
 return <svg viewBox="0 0 100 64" className={s.diagram} role="img" aria-label={`${label}. ${d.caption}`} data-draw={draw||undefined}>
  <rect x="1" y="1" width="98" height="62" rx="4" fill="#4f8a62" stroke="#fff1d3" strokeWidth="1.2"/>
  <path d="M50 1v62M1 22h10v20H1M99 22H89v20h10" fill="none" stroke="#fff1d3" strokeWidth="1" opacity=".7"/><circle cx="50" cy="32" r="8" fill="none" stroke="#fff1d3" strokeWidth="1" opacity=".7"/>
  {d.look&&<path d={`M${d.us[0][0]} ${d.us[0][1]-4} L${d.look[0]} ${d.look[1]}`} className={s.dLook} pathLength={1}/>}
  {d.run&&<path d={d.run} className={s.dRun} pathLength={1}/>}
  {d.pass&&<path d={d.pass} className={s.dPass} pathLength={1}/>}
  {d.them.map(([x,y],i)=><circle key={'t'+i} cx={x} cy={y} r="3.6" fill="#ed9dce" stroke="#fff1d3" strokeWidth="1" className={s.dDot} style={{'--i':i+2} as CSSProperties}/>)}
  {d.us.map(([x,y],i)=><circle key={'u'+i} cx={x} cy={y} r="3.6" fill="#f9d665" stroke="#244d40" strokeWidth="1.2" className={s.dDot} style={{'--i':i} as CSSProperties}/>)}
  <circle cx={d.ball[0]+3} cy={d.ball[1]+3} r="1.8" fill="#fff" stroke="#244d40" strokeWidth=".8"/>
 </svg>;
}
/** Where-icons for missions. */
export function WhereGlyph({where,size=22}:{where:'home'|'training'|'island';size?:number}){
 const g={home:<path {...P} d="M4 11l8-7 8 7M6 10v10h12V10"/>,training:<><circle {...P} cx="12" cy="12" r="8"/><path {...P} d="M12 4v16M4 12h16"/></>,island:<><path {...P} d="M3 18c3-2 6-2 9 0s6 2 9 0"/><path {...P} d="M12 15V6M12 6c-3-2-6-1-7 1M12 6c3-2 6-1 7 1M12 6c0-2 1-3 3-3"/></>};
 return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{g[where]}</svg>;
}
