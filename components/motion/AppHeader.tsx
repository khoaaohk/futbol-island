'use client';
import type {ReactNode} from 'react';
import {BackButton} from '@/components/BackButton';
import {exitHref} from './motion';
import h from './AppHeader.module.css';
/**
 * One header for the coach apps (/coach and its tools, /scan, /board; owner Nov 22 2026: "consistent, with the title in the middle").
 * A 1fr | auto | 1fr grid, so the title is centred on the screen whatever sits at the sides: left = the way back inside the coach
 * apps (Home inside a coach tool, "Coach" in /scan and /board when opened from the coach app, else an empty slot); centre = the
 * screen's title and a small line under it (they crossfade between screens, components/motion/motion.css); right = the language
 * (a two-letter code) and then the gold Exit, the game's navigation button, which leaves for the page the coach came from.
 */
export function AppHeader({left,title,sub,lang,onLang,exitLabel,exitAria,exitData,exit=true,className=''}:{left?:ReactNode;title:ReactNode;sub?:ReactNode;lang:'en'|'es';onLang?:()=>void;exitLabel?:string;exitAria:string;exitData?:Record<string,string>;exit?:boolean;className?:string}){
 const other=lang==='es'?'en':'es';
 return <header className={`${h.bar} ${className}`}>
  <div className={h.left}>{left}</div>
  <div className={h.title}><b>{title}</b>{sub!=null&&<span>{sub}</span>}</div>
  <div className={h.right}>
   {onLang&&<button type="button" className={h.lang} lang={other} aria-label={other==='es'?'Español':'English'} onClick={onLang}>{other.toUpperCase()}</button>}
   {exit&&<BackButton {...exitData} className={h.exit} label={exitLabel??(lang==='es'?'Salir':'Exit')} aria-label={exitAria} onBack={()=>{window.location.assign(exitHref(lang));}}/>}
  </div>
 </header>;
}
/** The left slot's control: an icon (Home) or an icon and a short label ("Coach"). */
export function HeaderBack({label,text,onClick,data}:{label:string;text?:string;onClick:()=>void;data?:Record<string,string>}){
 return <button type="button" className={`${h.back} ${text?h.backText:''}`} aria-label={label} onClick={onClick} {...data}>
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={text?'M14.5 6 8.5 12l6 6':'M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5'}/></svg>{text&&<span>{text}</span>}</button>;
}
