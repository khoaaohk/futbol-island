'use client';
/**
 * The plan's one navigation pattern (as on the save-code sheets): Back bottom left, the screen's one main action bottom right.
 * `Go` is a forward NavigationButton in the main-action green. A NavigationButton runs once per mount (it collapses to its
 * icon and hands over), so every screen renders its own Footer and the buttons remount with the screen.
 */
import {useLayoutEffect,useRef,type CSSProperties,type ReactNode} from 'react';
import {NavigationButton} from '../DoneButton';
import s from './Idp.module.css';

const width=(label:string)=>({'--navigation-width':`${Math.max(96,Math.round(label.length*9.5+44))}px`} as CSSProperties);

export function Footer({back,backLabel='Back',children}:{back?:()=>void;backLabel?:string;children?:ReactNode}){
 if(!back&&!children)return null;
 return <div className={s.footer} data-idp-footer>
  {back?<NavigationButton back label={backLabel} style={width(backLabel)} data-idp-back onNavigate={back}/>:<span className={s.navSpacer} aria-hidden="true"/>}
  {children??<span className={s.navSpacer} aria-hidden="true"/>}
 </div>;
}
export function Go({label,onGo,disabled,forward=false,...data}:{label:string;onGo:()=>void;disabled?:boolean;forward?:boolean}&Record<`data-${string}`,string|boolean|undefined>){
 return <NavigationButton {...data} label={label} className={s.go} style={width(label)} disabled={disabled} icon={forward?'forward':undefined} onNavigate={onGo}/>;
}
/** A screen: heading on a paper tab, focus moved to it on entry (so screen readers and keyboards start at the top). */
export function Screen({id,kicker,title,children,...data}:{id:string;kicker?:ReactNode;title:ReactNode;children:ReactNode}&Record<`data-${string}`,string|boolean|undefined>){
 const h=useRef<HTMLHeadingElement>(null);
 useLayoutEffect(()=>{const el=h.current;if(!el)return;el.focus({preventScroll:true});el.closest('[class*="body"]')?.scrollTo?.({top:0});},[]);
 return <section className={s.screen} aria-labelledby={id} {...data}>
  <div className={s.head}>{kicker&&<p className={s.kicker}>{kicker}</p>}<h3 id={id} ref={h} tabIndex={-1} className={s.title}>{title}</h3></div>
  {children}
 </section>;
}
