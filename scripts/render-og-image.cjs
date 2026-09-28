// Social sharing still (app/opengraph-image.png, 1200x630): photographs the real island loading screen (IslandLoading: bean cast,
// island art, PLAY · LEARN · GROW, title; no tagline since Sep 27 2026) from the running dev server (:8092). Island model requests
// are held and the loader is cloned without its exit class, so the still never catches the slide-away.
//   node scripts/render-og-image.cjs [out.png]   (default app/opengraph-image.png)
const {chromium}=require('playwright');
const OUT=process.argv[2]||require('node:path').join(__dirname,'..','app','opengraph-image.png');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 // Hold island assets so the loader stays up for the still.
 await p.route(/\.(glb|gltf|hdr|ktx2)(\?|$)/,()=>{});
 await p.goto((process.env.FUTBOL_BASE_URL||'http://localhost:8092')+'/',{waitUntil:'domcontentloaded',timeout:240000});
 await p.waitForSelector('[data-main-island-loading]',{timeout:240000});
 await p.evaluate(()=>{const n=document.querySelector('[data-main-island-loading]');const c=n.cloneNode(true);c.className=[...c.classList].filter(k=>!/exiting/.test(k)).join(' ');c.removeAttribute('data-main-island-loading');c.id='og-still';c.querySelectorAll('[data-island-tan-wipe]').forEach(e=>e.remove());c.style.cssText='position:fixed;inset:0;z-index:2147483647';document.body.appendChild(c);});
 await p.addStyleTag({content:'.island-loading-track{visibility:hidden!important}'});
 await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 await p.waitForTimeout(3000);
 console.log(await p.$eval('#og-still',e=>e.className));
 await p.screenshot({path:OUT});await b.close();})();
