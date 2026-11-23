/* Scan Trainer's service worker (Nov 16 2026; docs/scan-trainer/HANDOFF.md), a copy of public/coach-sw.js. Registered ONLY by
 * components/scan/ScanApp.tsx with scope '/scan', so it can only ever control /scan pages: the island game, the coach app and
 * the reading pages never get it. inScope() is a second guard (tests/scan-trainer.cjs runs it): a page outside /scan is never
 * answered from the cache. Strategy: the app page is network first with the cached copy as the offline fallback; Next's hashed
 * static files are cache first. Nothing else is touched, nothing is sent. */
const CACHE='fi-scan-sw-v2';
const PAGES=['/scan','/scan/manifest.webmanifest','/scan/icon.svg','/scan/icon-192.png'];
function inScope(path){
 return path==='/scan'||path.startsWith('/scan/');
}
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PAGES)).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fi-scan-sw-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);if(u.origin!==self.location.origin)return;
 /* Nov 22 2026: never answer from the cache on a dev machine: the dev server's chunk names do not change, so cache first kept old
    code running after every edit (v2 also drops the v1 cache on activate) */
 if(self.location.hostname==='localhost'||self.location.hostname==='127.0.0.1')return;
 if(r.mode==='navigate'){
  if(!inScope(u.pathname))return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('/scan',copy));}return res;}).catch(()=>caches.match('/scan').then(m=>m||Response.error())));
  return;
 }
 if(u.pathname.startsWith('/_next/static/')||inScope(u.pathname)){
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));}return res;})));
 }
});
