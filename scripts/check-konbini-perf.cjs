// Konbini heat measurement (Sep 29 2026): draw calls, triangles and frame time inside each Konbini against the Arcade room
// and Island Square, in phone emulation (390×844 touch, DPR 3) with the CPU throttled 4×. Frame time = rAF intervals while
// walking for 5 s (phones are capped at 30 fps, so ~33 ms is the target), plus the throttled cost of one render call.
// Also confirms the idle Konbini schedules no frames and that no island runtime exists inside.
// usage: node scripts/check-konbini-perf.cjs [--desktop]
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const base=process.env.FUTBOL_BASE_URL||'http://localhost:8092',desktop=process.argv.includes('--desktop');
const stats=a=>{if(!a.length)return {n:0};const s=[...a].sort((x,y)=>x-y),q=p=>s[Math.min(s.length-1,Math.floor(p*s.length))];return {n:s.length,median:+q(.5).toFixed(1),p90:+q(.9).toFixed(1)};};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const out={};
 const RAF='window.__intervals=[];window.__rafCalls=0;const __r=window.requestAnimationFrame.bind(window);let __last=0;window.requestAnimationFrame=f=>{window.__rafCalls++;return __r(t=>{if(__last)window.__intervals.push(t-__last);__last=t;f(t);});};';
 async function open(url,ready){const ctx=await browser.newContext({viewport:desktop?{width:1280,height:800}:{width:390,height:844},isMobile:!desktop,hasTouch:!desktop,deviceScaleFactor:desktop?1:3});
  const page=await ctx.newPage();await page.addInitScript(s=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-muted','true');sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:95,z:-35,yaw:Math.PI,ride:'walk',flightHeight:0}));eval(s);},RAF);
  await page.goto(base+url);await page.waitForFunction(ready,null,{timeout:120000});await page.waitForTimeout(4000);
  const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});return {ctx,page,cdp};}
 async function walk(page,ms=5000,a='ArrowUp',b='ArrowDown',count=()=>0){const c0=await page.evaluate(count);await page.evaluate(()=>{window.__intervals=[];});await page.keyboard.down(a);await page.waitForTimeout(ms/2);await page.keyboard.up(a);await page.keyboard.down(b);await page.waitForTimeout(ms/2);await page.keyboard.up(b);const c1=await page.evaluate(count);return {rafIntervals:stats(await page.evaluate(()=>window.__intervals)),renderedFps:+((c1-c0)/(ms/1000)).toFixed(1)};}
 // Island Square
 {const {ctx,page}=await open('/?from=konbini',()=>window.__fi2&&!document.querySelector('[data-island-return-loading]'));
  const frame=await walk(page,5000,'ArrowUp','ArrowDown',()=>window.__fi2.renderer.info.render.frame);const r=await page.evaluate(()=>{const f=window.__fi2;f.renderer.render(f.scene,f.camera);const calls=f.renderer.info.render.calls,tri=f.renderer.info.render.triangles;const t=performance.now();for(let i=0;i<20;i++)f.renderer.render(f.scene,f.camera);return {calls,triangles:tri,renderMs:+((performance.now()-t)/20).toFixed(2)};});
  out.islandSquare={...r,frame};await ctx.close();}
 // Arcade room
 {const {ctx,page}=await open('/arcade',()=>window.__arcadeRoom&&!document.querySelector('[data-arcade-loading]'));
  // Left/right: walking down (+z) in the arcade leaves through its door.
  const frame=await walk(page,5000,'ArrowLeft','ArrowRight');const r=await page.evaluate(()=>({...(window.__arcadeRoom?.state.render??{missing:location.href})}));out.arcade={...r,frame};await ctx.close();}
 // Konbinis
 for(const door of ['main','cay']){const {ctx,page}=await open('/konbini?door='+door,()=>window.__konbini);
  await page.waitForFunction(()=>window.__konbini.state.sleeping,null,{timeout:20000});const c0=await page.evaluate(()=>window.__rafCalls);await page.waitForTimeout(3000);const idleRafCalls=await page.evaluate(()=>window.__rafCalls)-c0;
  const frame=await walk(page,5000,'ArrowLeft','ArrowRight',()=>window.__konbini.state.draws);const r=await page.evaluate(()=>{const k=window.__konbini;return {...k.state.render,renderMs:+k.measureRender(20).toFixed(2),pixelRatio:k.state.pixelRatio,frameCapMs:+k.state.frameMs.toFixed(1),islandLoaded:typeof window.__fi2!=='undefined'};});
  out['konbini-'+door]={...r,frame,idleRafCalls};await ctx.close();}
 console.log(JSON.stringify({viewport:desktop?'1280x800':'390x844 touch, 4x CPU',...out},null,1));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
