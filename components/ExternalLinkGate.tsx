'use client';
import {useEffect,useRef,useState} from 'react';
import ParentGate from './ParentGate';
import {parentGatePassed} from '@/lib/parentGate';
import {leavesSite} from '@/lib/externalLinks';
import styles from './ExternalLinkGate.module.css';
/** Where a gated link's address is kept once its real href is taken away (QA11 B-2). */
export const GATED_HREF_ATTR='data-gated-href';
/**
 * One grown-up check for EVERY link that leaves the site (lib/externalLinks.ts), mounted once in app/layout.tsx so it covers the
 * island, /konbini, /arcade and /coffee, and any link added later. A capture-phase click listener (event-driven: no loop, no
 * polling) stops the link, asks the shared ParentGate question, and opens the link after a pass. A pass is remembered in memory
 * for a few minutes (parentGatePassed), so a grown-up browsing sources is not asked again each time. Nothing is stored or sent.
 *
 * QA11 B-2: long-press "Open in New Tab" (iPhone), the right-click menu, dragging a link to the tab bar and middle-click never
 * fire a click, so an outside link keeps NO real href: a MutationObserver (event-driven, only when the DOM changes) moves it to
 * data-gated-href and marks the anchor role=link + tabindex=0, so it is a button-like link that only this gate can open (after a
 * pass, or at once while a pass is remembered). Internal links are untouched and behave normally.
 */
export default function ExternalLinkGate(){
 const [pending,setPending]=useState<{href:string;target:string}|null>(null);
 const dialog=useRef<HTMLDialogElement>(null),restore=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  const disarm=(link:HTMLAnchorElement)=>{
   const href=link.getAttribute('href');if(href===null||link.hasAttribute('download')||!leavesSite(href,location.origin))return;
   link.setAttribute(GATED_HREF_ATTR,new URL(href,location.href).href);link.removeAttribute('href');
   if(!link.hasAttribute('role'))link.setAttribute('role','link');if(!link.hasAttribute('tabindex'))link.tabIndex=0;
  };
  const scan=(root:ParentNode)=>{if(root instanceof HTMLAnchorElement)disarm(root);root.querySelectorAll?.('a[href]').forEach(a=>disarm(a as HTMLAnchorElement));};
  scan(document);
  const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'){if(r.target instanceof HTMLAnchorElement)disarm(r.target);}else r.addedNodes.forEach(n=>{if(n instanceof Element)scan(n);});}});
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
  const open=(link:HTMLAnchorElement,event:Event)=>{
   event.preventDefault();event.stopPropagation();
   const href=link.getAttribute(GATED_HREF_ATTR)!,target=link.target||'_self';
   if(parentGatePassed()){go(href,target);return;}
   restore.current=link;setPending({href,target});
  };
  const gatedLink=(event:Event)=>(event.target instanceof Element?event.target.closest(`a[${GATED_HREF_ATTR}]`):null) as HTMLAnchorElement|null;
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button>1)return;
   const gated=gatedLink(event);if(gated){open(gated,event);return;}
   // A link that slipped in before the observer saw it (same frame): gate it the same way.
   const link=(event.target instanceof Element?event.target.closest('a[href]'):null) as HTMLAnchorElement|null;
   if(!link||link.hasAttribute('download')||!leavesSite(link.getAttribute('href')??'',location.origin))return;
   disarm(link);if(link.hasAttribute(GATED_HREF_ATTR))open(link,event);
  };
  const key=(event:KeyboardEvent)=>{if(event.key!=='Enter'||event.defaultPrevented)return;const gated=gatedLink(event);if(gated)open(gated,event);};
  document.addEventListener('click',click,true);document.addEventListener('auxclick',click,true);document.addEventListener('keydown',key,true);
  return()=>{observer.disconnect();document.removeEventListener('click',click,true);document.removeEventListener('auxclick',click,true);document.removeEventListener('keydown',key,true);};
 },[]);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(pending&&!el.open)el.showModal();else if(!pending&&el.open){el.close();restore.current?.focus({preventScroll:true});}},[pending]);
 const pass=()=>{const p=pending;setPending(null);if(p)go(p.href,p.target);};
 return <dialog ref={dialog} className={styles.dialog} aria-label="Ask a grown-up" data-external-link-gate onCancel={e=>{e.preventDefault();setPending(null);}} onClick={e=>{if(e.target===e.currentTarget)setPending(null);}} onKeyDown={e=>e.stopPropagation()} onKeyUp={e=>e.stopPropagation()}>
  {/* A div wrapper: the phone rule that stretches a dialog's first <section> to full screen (globals.css) must not reach the card. */}
  {pending&&<div className={styles.wrap}><ParentGate reason="This link opens another website." onPass={pass} onCancel={()=>setPending(null)}/></div>}
 </dialog>;
}
/** Same-origin hand-offs (/coffee/checkout → Stripe) keep the Referer: the route checks the navigation started on the site. */
function go(href:string,target:string){if(target==='_self')location.assign(href);else window.open(href,'_blank',new URL(href,location.href).origin===location.origin?'noopener':'noopener,noreferrer');}
