/**
 * /coach/manifest.webmanifest: the coach app's own "Add to Home Screen" identity (Nov 16 2026; docs/coach-app/HANDOFF.md). The
 * site's manifest (app/manifest.ts, the game at /play) is unchanged; app/coach/layout.tsx points its pages here instead.
 * start_url, scope and id are /coach, so the installed app opens the coach app and stays inside it.
 */
export const dynamic='force-static';
const MANIFEST={name:'Futbol Island Coach',short_name:'Coach',description:'Lineups, fair playing time and a live substitution clock for youth soccer coaches. Works offline; your team stays on your phone.',
 id:'/coach',start_url:'/coach',scope:'/coach',display:'standalone',orientation:'any',lang:'en',dir:'ltr',
 theme_color:'#1d6b55',background_color:'#fbf7ee',categories:['sports','utilities'],
 icons:[{src:'/coach/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:'/coach/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
  {src:'/coach/icon-maskable.png',sizes:'512x512',type:'image/png',purpose:'maskable'},{src:'/coach/icon.svg',sizes:'any',type:'image/svg+xml'}]};
export function GET(){return new Response(JSON.stringify(MANIFEST),{headers:{'Content-Type':'application/manifest+json','Cache-Control':'public, max-age=3600'}});}
