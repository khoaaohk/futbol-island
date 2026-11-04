'use client';
import {useEffect,useRef} from 'react';
import s from './learn.module.css';

/**
 * /learn's phone menu (owner, Nov 3 2026: at <= 640px the bar only had the logo and Play, so phones could not jump between
 * chapters). A two-line icon left of the Play pill opens a cream panel under the 68px bar with the four chapter links in large
 * type; the current chapter is the same pink chip as the desktop nav (aria-current, set by LearnEnhance on every
 * [data-subnav] link). Built on <details>/<summary>, so with JS off it opens and the anchors work natively. JS only enhances:
 * aria-expanded, focus to the first link on open and back to the button on close, and closing on a link tap, a tap outside,
 * the icon or Escape. The document listeners exist only while the panel is open. The page behind it is locked (overflow hidden on html, restored on close); the panel
 * fits the viewport (svh) and scrolls on a tiny landscape screen. Hidden at >= 641px.
 */
export default function MobileMenu({links}:{links:readonly (readonly [string,string])[]}){
 const ref=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{
  const d=ref.current,btn=d?.querySelector('summary');if(!d||!btn)return;
  let off:(()=>void)|null=null;
  const close=(focus:boolean)=>{d.open=false;if(focus)btn.focus();};
  // the page behind the full-screen panel does not scroll while it is open (owner, Nov 3); a link's jump to its section still works
  const root=document.documentElement;
  const lock=(on:boolean)=>{root.style.overflow=on?'hidden':'';};
  const sync=()=>{
   btn.setAttribute('aria-expanded',String(d.open));
   off?.();off=null;
   lock(d.open);
   if(!d.open)return;
   d.querySelector<HTMLAnchorElement>('a')?.focus({preventScroll:true});
   const onDown=(e:PointerEvent)=>{if(!d.contains(e.target as Node))close(false);};
   const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close(true);}};
   document.addEventListener('pointerdown',onDown);document.addEventListener('keydown',onKey);
   off=()=>{document.removeEventListener('pointerdown',onDown);document.removeEventListener('keydown',onKey);};
  };
  // a link tap: the anchor scrolls natively, the panel closes and the page unlocks (focus follows the section the browser jumps to)
  const onClick=(e:MouseEvent)=>{if((e.target as Element).closest('a')){d.open=false;btn.focus({preventScroll:true});}};
  d.addEventListener('toggle',sync);d.addEventListener('click',onClick);sync();
  return ()=>{lock(false);d.removeEventListener('toggle',sync);d.removeEventListener('click',onClick);off?.();};
 },[]);
 return <details className={s.menu} ref={ref} data-menu="">
  <summary className={s.menuBtn} aria-label="Menu" aria-controls="learn-menu">
   <span className={s.menuIco} aria-hidden="true"><i/><i/></span>
  </summary>
  <div className={s.menuPanel} id="learn-menu">
   <ul className={s.menuList}>{links.map(([id,label])=><li key={id}><a href={`#${id}`}><span>{label}</span></a></li>)}</ul>
  </div>
 </details>;
}
