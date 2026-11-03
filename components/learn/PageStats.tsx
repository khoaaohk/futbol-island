'use client';
import {useEffect} from 'react';
import {watchMarketing} from '@/lib/analytics/marketingEvents';

/**
 * Marketing page stats (Nov 3 2026): renders nothing; starts lib/analytics/marketingEvents.ts for the page root once. It waits
 * one task so the site-wide visit counter (components/VisitTracker.tsx, mounted after the page in app/layout.tsx) is running
 * before the view is counted. Passive listeners and observers only; nothing is sent when the visit counter is off.
 */
export default function PageStats({rootId}:{rootId:string}){
 useEffect(()=>{
  let stop:(()=>void)|null=null;
  const t=window.setTimeout(()=>{const root=document.getElementById(rootId);if(!root)return;
   const store=(k:'sessionStorage'|'localStorage')=>{try{return window[k];}catch{return null;}};
   stop=watchMarketing({window,document,root,now:()=>performance.now(),session:store('sessionStorage'),local:store('localStorage')});},0);
  return ()=>{window.clearTimeout(t);stop?.();};
 },[rootId]);
 return null;
}
