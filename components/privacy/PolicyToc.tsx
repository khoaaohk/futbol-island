'use client';
import type {MouseEvent,ReactNode} from 'react';

/** Table-of-contents link that smooth-scrolls to its section in whatever is scrolling (the /start sheet or the /privacy page). */
export default function PolicyToc({href,children}:{href:string;children:ReactNode}){
 const go=(e:MouseEvent<HTMLAnchorElement>)=>{
  const target=document.getElementById(href.slice(1));if(!target)return;
  e.preventDefault();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
  target.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
 };
 return <a href={href} data-track={'sp:'+href.replace(/^#pp-/,'')} onClick={go}>{children}</a>;
}
