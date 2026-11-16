/* The coach app's service worker (Nov 16 2026; docs/coach-app/HANDOFF.md). Registered ONLY by components/coach/CoachApp.tsx
 * with scope '/coach', so it can only ever control /coach pages: the island game and the reading pages never get a service
 * worker. inScope() is a second guard (tests/coach-app.cjs runs it): a page outside /coach is never answered from the cache.
 * Strategy: the app page is network first (a deploy shows at once) with the cached copy as the offline fallback; Next's hashed
 * static files are cache first (they never change under the same name). Nothing else is touched, nothing is sent. */
const CACHE='fi-coach-v1';
const PAGES=['/coach','/coach/manifest.webmanifest','/coach/icon.svg','/coach/icon-192.png'];
function inScope(path){
 return path==='/coach'||path.startsWith('/coach/');
}
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PAGES)).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fi-coach-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);if(u.origin!==self.location.origin)return;
 if(r.mode==='navigate'){
  if(!inScope(u.pathname))return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('/coach',copy));}return res;}).catch(()=>caches.match('/coach').then(m=>m||Response.error())));
  return;
 }
 if(u.pathname.startsWith('/_next/static/')||inScope(u.pathname)){
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy));}return res;})));
 }
});
