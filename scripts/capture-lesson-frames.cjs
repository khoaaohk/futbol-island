// Library lesson frames (positions-game.webp, formations-game.webp; Nov 20 2026). Needs a dev server on :9032 (the dev-only
// __fiLegacyQuality hook lifts the phone 1.75 pixel-ratio cap). MOB=1 gives the phone camera framing (court fills the frame) on a
// 1920x1080 viewport at DPR 2, so the canvas really renders at 3840x2160, several lessons/steps in one browser. JOBS='fmt:id:step:angles:times;...'
const {chromium}=require('playwright');
const OUT=process.env.OUTDIR||require('os').tmpdir(),HUD=process.env.HUD==='1';
const JOBS=process.env.JOBS.split(';').map(j=>{const [fmt,id,step,ang,times]=j.split(':');return {fmt,id,step,ang,times};});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--mute-audio']});
 try{const ctx=await browser.newContext({viewport:{width:+(process.env.VW||1920),height:+(process.env.VH||1080)},deviceScaleFactor:+(process.env.DPR||2),isMobile:process.env.MOB==='1',hasTouch:process.env.MOB==='1'});const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0');sessionStorage.setItem('fi2-island-handoff','1');window.__fiLegacyQuality=true;});
 await page.goto('http://localhost:9032/play?from=e2e',{waitUntil:'domcontentloaded',timeout:300000});
 await page.waitForFunction(()=>window.__fi2?.games&&window.__fi2?.lessonPass&&!document.querySelector('[class*=IslandLoading],[class*=oading]'),null,{timeout:300000});await page.waitForTimeout(7000);
 const hideDlg=()=>page.evaluate(()=>{let st=document.getElementById('cap-hide');if(!st){st=document.createElement('style');st.id='cap-hide';st.textContent='dialog,dialog::backdrop{display:none!important}';document.body.appendChild(st);}});
 let lastFmt='';
 for(const J of JOBS){
  if(J.fmt!==lastFmt){const v=await page.evaluate(f=>{const e=window.__fi2.games.entries.find(e=>e.venue.id===f);return e?{x:e.venue.x,z:e.venue.z,w:e.venue.width,yaw:e.venue.yaw??0}:null;},J.fmt);
   if(v){await page.evaluate(({x,z,w,yaw})=>{const f=window.__fi2;f.rideRef.current='walk';f.flight.height=0;const off=w/2+2;f.location.x=x+(yaw?0:off);f.location.z=z+(yaw?off:0);},v);await page.waitForTimeout(3000);}lastFmt=J.fmt;}
  for(const ang of J.ang.split(',')){
   await page.evaluate(({f,id,s})=>window.dispatchEvent(new CustomEvent('fi2-format-path-launch',{detail:{format:f,lessonId:id,step:+s,quiz:false,question:0,nonce:Date.now()}})),{f:J.fmt,id:J.id,s:J.step});
   await page.waitForTimeout(2500);
   const want={default:'Standard',broadcast:'Broadcast',top:'Overhead',side:'Sideline',goalkeeper:'Goalkeeper'}[ang];
   for(let i=0;i<6;i++){const t=await page.locator('[title^="Camera: "]').first().getAttribute('title').catch(()=>null);if(!t){console.log('no camera button');break;}if(t==='Camera: '+want)break;await page.evaluate(()=>document.querySelector('[title^="Camera: "]').click());await page.waitForTimeout(500);}
   await hideDlg();const t0=Date.now();
   for(const s of J.times.split(',').map(Number)){const w=s*1000-(Date.now()-t0);if(w>0)await page.waitForTimeout(w);
    await hideDlg();const base=`${OUT}/${J.fmt}-${J.id}-${ang}-s${J.step}-${s}`;
    if(HUD){await page.screenshot({path:base+'-hud.jpg',type:'jpeg',quality:80,scale:'css'});}
    await page.addStyleTag({content:'body *:not(canvas){visibility:hidden!important} canvas{visibility:visible!important}'}).catch(()=>{});
    await page.screenshot({path:base+'.jpg',type:'jpeg',quality:94});
    const cw=await page.evaluate(()=>{const c=[...document.querySelectorAll('canvas')].sort((a,b)=>b.width-a.width)[0];return c?c.width+'x'+c.height:'?';});
    await page.evaluate(()=>document.querySelectorAll('style').forEach(st=>{if(st.textContent.includes('body *:not(canvas)'))st.remove();}));
    console.log('shot',base.split('/').pop(),cw);}
  }}
 console.log('errors',errs.slice(0,3).join(' | ').slice(0,300));
 }finally{await browser.close();}})();
