'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {startTracker} from '@/lib/analytics/tracker';

/**
 * Cookie-free first-party visit counter for the admin dashboard (lib/analytics/tracker.ts has the privacy and heat notes).
 * Renders nothing; app/layout.tsx mounts it only in production on Vercel, beside Vercel Web Analytics.
 */
export default function VisitTracker({allowLocalhost=false}:{allowLocalhost?:boolean}){
 const pathname=usePathname();
 const tracker=useRef<ReturnType<typeof startTracker>>(null);
 useEffect(()=>{
  tracker.current=startTracker({window,document,navigator:navigator as Navigator&{globalPrivacyControl?:boolean},storage:(()=>{try{return window.sessionStorage;}catch{return null;}})(),
   now:()=>performance.now(),random:n=>crypto.getRandomValues(new Uint8Array(n)),fetch:window.fetch.bind(window),allowLocalhost});
  return()=>{tracker.current?.stop();tracker.current=null;};
 },[allowLocalhost]);
 useEffect(()=>{if(pathname)tracker.current?.pageview(pathname);},[pathname]);
 return null;
}
