'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {startTracker} from '@/lib/analytics/tracker';
import {readStartFlags} from '@/lib/analytics/startFlags';
import {watchStart} from '@/lib/analytics/startEvents';
import {useRootView} from '@/components/root/useRootView';

/**
 * Cookie-free first-party visit counter for the admin dashboard (lib/analytics/tracker.ts has the privacy and heat notes).
 * Renders nothing; app/layout.tsx mounts it only in production on Vercel, beside Vercel Web Analytics.
 */
export default function VisitTracker({allowLocalhost=false}:{allowLocalhost?:boolean}){
 const pathname=usePathname(),view=useRootView();
 const tracker=useRef<ReturnType<typeof startTracker>>(null);
 useEffect(()=>{
  tracker.current=startTracker({window,document,navigator:navigator as Navigator&{globalPrivacyControl?:boolean},storage:(()=>{try{return window.sessionStorage;}catch{return null;}})(),
   now:()=>performance.now(),random:n=>crypto.getRandomValues(new Uint8Array(n)),fetch:window.fetch.bind(window),allowLocalhost,
   // Coarse progress/settings buckets for a new session's start (read once; lib/analytics/startFlags.ts).
   flags:()=>{try{return readStartFlags(window.localStorage);}catch{return null;}}});
  return()=>{tracker.current?.stop();tracker.current=null;};
 },[allowLocalhost]);
 useEffect(()=>{if(pathname)tracker.current?.pageview(pathname);},[pathname]);
 // The title screen (`/` before Play; lib/rootView.ts): its view and one passive click listener for its buttons and links
 // (lib/analytics/startEvents.ts). Play switches `/` to the game in place, which stops it.
 useEffect(()=>{if(pathname!=='/'||view!=='landing'||!tracker.current)return;return watchStart(window);},[pathname,view]);
 return null;
}
