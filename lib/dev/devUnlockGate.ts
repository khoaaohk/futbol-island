/**
 * Developer-only "unlock everything" switch: the gate (pure, no game imports, so it is cheap to load and easy to test).
 * The work itself lives in ./unlockAll.ts, which components/DevUnlock.tsx imports dynamically only after this gate passes.
 *
 * All three are required, every time:
 *  1. a non-production build (process.env.NODE_ENV !== 'production');
 *  2. a local host (window.location.hostname is 'localhost' or '127.0.0.1');
 *  3. the explicit query flag: `?unlock=all` (optional `&balls=1`, `&paths=1`, `&fish=1`, `&resetDaily=1`) or `?unlock=reset`.
 * Anything else (futbolisland.app, a preview URL, a LAN IP, a production build on localhost) returns null and nothing runs.
 */
export type DevUnlockRequest=
 |{mode:'all';balls:boolean;paths:boolean;fish:boolean;resetDaily:boolean}
 |{mode:'reset'};
export type DevUnlockEnv={nodeEnv:string|undefined;hostname:string;search:string};
export const DEV_UNLOCK_HOSTS:readonly string[]=['localhost','127.0.0.1'];
/** Set before the post-unlock reload so the fresh page can show the confirmation toast. Cleared by the reset. */
export const DEV_UNLOCK_TOAST_KEY='fi2-dev-unlock-toast';

export function devUnlockHostAllowed(env:Pick<DevUnlockEnv,'nodeEnv'|'hostname'>):boolean{
 return env.nodeEnv!=='production'&&DEV_UNLOCK_HOSTS.includes(env.hostname);
}
export function devUnlockRequest(env:DevUnlockEnv):DevUnlockRequest|null{
 if(!devUnlockHostAllowed(env))return null;
 let q:URLSearchParams;try{q=new URLSearchParams(env.search);}catch{return null;}
 const mode=q.get('unlock'),on=(k:string)=>q.get(k)==='1';
 if(mode==='reset')return {mode:'reset'};
 if(mode==='all')return {mode:'all',balls:on('balls'),paths:on('paths'),fish:on('fish'),resetDaily:on('resetDaily')};
 return null;
}
/** The same URL without the dev flags (so a refresh never re-runs them). */
export function stripDevUnlockParams(href:string):string{
 const url=new URL(href);for(const k of ['unlock','balls','paths','fish','resetDaily'])url.searchParams.delete(k);
 return url.pathname+(url.search?url.search:'')+url.hash;
}
/** A small self-contained status toast (dark see-through, like the island's other toasts). Dev only; removed after 4 s. */
export function showDevToast(text:string){
 if(typeof document==='undefined')return;
 const el=document.createElement('div');el.setAttribute('role','status');el.dataset.devUnlockToast='';el.textContent=text;
 Object.assign(el.style,{position:'fixed',left:'50%',top:'calc(env(safe-area-inset-top,0px) + 16px)',transform:'translateX(-50%)',zIndex:'2147483000',
  padding:'10px 16px',borderRadius:'12px',background:'rgba(12,18,28,.82)',color:'#fff',font:'600 14px/1.3 system-ui,sans-serif',
  boxShadow:'0 6px 24px rgba(0,0,0,.35)',pointerEvents:'none',maxWidth:'calc(100vw - 32px)',textAlign:'center'});
 document.body.appendChild(el);setTimeout(()=>el.remove(),4000);
}
