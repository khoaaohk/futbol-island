'use client';
import {useEffect} from 'react';

/**
 * Developer-only trigger for lib/dev/unlockAll.ts (`?unlock=all`, `?unlock=reset` on localhost). Renders nothing.
 * In a production build `process.env.NODE_ENV` is inlined as 'production', so the effect body (and both dynamic imports) are
 * dead code the bundler drops; in development the gate still requires localhost / 127.0.0.1 plus the explicit query flag.
 */
export default function DevUnlock(){
 useEffect(()=>{
  if(process.env.NODE_ENV==='production')return;
  let cancelled=false;
  void import('@/lib/dev/devUnlockGate').then(gate=>{
   if(cancelled)return;
   const env={nodeEnv:process.env.NODE_ENV,hostname:window.location.hostname,search:window.location.search};
   if(!gate.devUnlockHostAllowed(env))return;
   try{const toast=sessionStorage.getItem(gate.DEV_UNLOCK_TOAST_KEY);if(toast){sessionStorage.removeItem(gate.DEV_UNLOCK_TOAST_KEY);gate.showDevToast(toast);}}catch{}
   const request=gate.devUnlockRequest(env);if(!request)return;
   void import('@/lib/dev/unlockAll').then(m=>{if(!cancelled)void m.handleDevUnlock(request);});
  });
  return()=>{cancelled=true;};
 },[]);
 return null;
}
