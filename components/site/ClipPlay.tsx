'use client';
import {useState} from 'react';
import s from './guideVideo.module.css';
/**
 * Click-to-play clip (seo-extras, Nov 15 2026). Before the tap: a button with the poster still (lazy, real size) and nothing
 * else, so the clip costs nothing to readers who do not want it. After the tap: a muted, inline <video> with controls, which
 * starts at once because the tap asked for it. `lang="es"` (Spanish pages) localizes the button label. Never autoplays on load, never has sound, no third-party player.
 */
export default function ClipPlay({name,poster,webm,mp4,width,height,describedBy,lang='en'}:{name:string;poster:string;webm?:string;mp4:string;width:number;height:number;describedBy?:string;lang?:'en'|'es'}){
 const [on,setOn]=useState(false);
 if(on)return <video className={s.frame} width={width} height={height} poster={poster} controls muted playsInline autoPlay loop preload="metadata" aria-label={name} aria-describedby={describedBy}>
  {webm&&<source src={webm} type="video/webm"/>}<source src={mp4} type="video/mp4"/>
 </video>;
 return <button type="button" className={s.poster} onClick={()=>setOn(true)} aria-label={`${lang==='es'?'Reproducir video':'Play video'}: ${name}`} aria-describedby={describedBy}>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img className={s.frame} src={poster} alt="" width={width} height={height} loading="lazy" decoding="async"/>
  <span className={s.play} aria-hidden="true">▶</span>
 </button>;
}
