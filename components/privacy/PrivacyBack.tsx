'use client';
import type {ReactNode} from 'react';

/**
 * The /privacy page's Back (Nov 4 2026): returns to the page the reader came from (the tour page, with its scroll spot, or the
 * game), instead of always going to /play. Opened directly (no earlier page of this site), it goes to `fallback`.
 */
export default function PrivacyBack({className,fallback,children}:{className?:string;fallback:string;children:ReactNode}){
 return <a className={className} href={fallback} onClick={e=>{
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  let same=false;
  try{same=!!document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1;}catch{}
  if(same){e.preventDefault();history.back();}
 }}>{children}</a>;
}
