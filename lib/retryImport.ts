/**
 * A lazy part's download that survives a dropped connection (QA robust pass, Nov 14 2026).
 *
 * Every panel, machine and lesson of the island is a next/dynamic chunk fetched on first use. Offline (a car, a lift, the edge of
 * the Wi-Fi), the first tap on one of them (the coin pocket, Settings, the map…) failed the download, React.lazy kept that
 * failure, and the whole island fell to the "No internet right now" error screen (app/error.tsx), whose only way back is a
 * reload. Wrapped as `dynamic(()=>retryImport(()=>import('./Panel')),{ssr:false})`, a failed download now waits instead:
 * offline, until the browser says it is back online, then it tries again; online (a blip), once more after a short pause.
 * While it waits the panel simply is not drawn yet (next/dynamic's Suspense fallback) and the island keeps running. A second
 * failure still rejects, so a real deploy mismatch reaches the error screen and its reload as before. Webpack forgets a failed
 * chunk (JS and CSS), so the retry really fetches again. No timers while online and loaded; one `online` listener while waiting.
 */
export const RETRY_IMPORT_PAUSE_MS=1500;
/** How many lazy parts are waiting for the connection right now (components/NetSaveNotice.tsx shows "Waiting for internet…"). */
let waitingOffline=0;
const waitSubs=new Set<()=>void>();
const setWaiting=(d:number)=>{waitingOffline=Math.max(0,waitingOffline+d);waitSubs.forEach(f=>f());};
export const netWaitCount=()=>waitingOffline;
export function subscribeNetWait(f:()=>void){waitSubs.add(f);return()=>{waitSubs.delete(f);};}
export function retryImport<T>(load:()=>Promise<T>,pauseMs=RETRY_IMPORT_PAUSE_MS):Promise<T>{
 return load().catch(()=>new Promise<T>((resolve,reject)=>{
  const again=()=>{load().then(resolve,reject);};
  if(typeof window!=='undefined'&&typeof navigator!=='undefined'&&navigator.onLine===false){
   setWaiting(1);
   window.addEventListener('online',()=>{setWaiting(-1);again();},{once:true});
  }
  else setTimeout(again,pauseMs);
 }));
}
