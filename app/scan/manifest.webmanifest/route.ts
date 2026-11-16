/**
 * /scan/manifest.webmanifest: Scan Trainer's own "Add to Home Screen" identity (Nov 16 2026; docs/scan-trainer/HANDOFF.md). The
 * site's manifest (app/manifest.ts, the game at /play) is unchanged; app/scan/layout.tsx points its pages here instead.
 * start_url, scope and id are /scan, so the installed app opens Scan Trainer and stays inside it.
 */
export const dynamic='force-static';
const MANIFEST={name:'Futbol Island Scan Trainer',short_name:'Scan',description:'A full-screen scanning trainer for soccer practice: colors, numbers, arrows and passes to call out. Works offline; nothing leaves your phone.',
 id:'/scan',start_url:'/scan',scope:'/scan',display:'fullscreen',display_override:['fullscreen','standalone'],orientation:'any',lang:'en',dir:'ltr',
 theme_color:'#14221d',background_color:'#fbf7ee',categories:['sports','utilities'],
 icons:[{src:'/scan/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:'/scan/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
  {src:'/scan/icon-maskable.png',sizes:'512x512',type:'image/png',purpose:'maskable'},{src:'/scan/icon.svg',sizes:'any',type:'image/svg+xml'}]};
export function GET(){return new Response(JSON.stringify(MANIFEST),{headers:{'Content-Type':'application/manifest+json','Cache-Control':'public, max-age=3600'}});}
