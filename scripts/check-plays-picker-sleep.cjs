// Choose plays sleep check (overnight heat audit F1, Sep 30 2026; docs/performance-guide.md).
// Watch view of a live pitch → open the full-screen Choose plays sheet: the island renders 0 frames and keeps no rAF chain while it
// is open, and the backdrop has no blur. Closing it (Back) and picking a play both wake the island again.
// usage (dev server on :8092): node scripts/check-plays-picker-sleep.cjs [--mobile]
// Never sound on the user's speakers: --mute-audio and the audio prefs seeded off before load.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.FUTBOL_BASE_URL||'http://localhost:8092',mobile=process.argv.includes('--mobile');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3}:{viewport:{width:1280,height:800}});
  const page=await ctx.newPage();await page.routeWebSocket(/webpack-hmr|_next\/.*hmr|turbopack/,()=>{});
  await page.addInitScript(()=>{for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false','fi2-welcome-v1':'completed'}))localStorage.setItem(k,v);
   const raf=window.requestAnimationFrame.bind(window);window.__rafs=0;window.requestAnimationFrame=cb=>raf(t=>{window.__rafs++;cb(t);});});
  await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:240000});
  await page.waitForFunction(()=>window.__fi2?.games?.entries?.length&&!document.querySelector('[data-island-return-loading]'),null,{timeout:240000});await wait(2500);
  for(let i=0;i<3;i++){const offer=page.getByRole('button',{name:'Open this card'});if(!(await offer.count()))break;await offer.first().click().catch(()=>{});await wait(3500);const done=page.getByRole('button',{name:'Done',exact:true});if(await done.count())await done.last().click().catch(()=>{});await wait(1500);}
  await page.evaluate(()=>{const f=window.__fi2,r=f.renderer,orig=r.render;window.__frames=0;r.render=function(s,c){orig.call(this,s,c);if(s===f.scene)window.__frames++;};});
  const sample=async ms=>{const a=await page.evaluate(()=>[window.__frames,window.__rafs]);await wait(ms);const b=await page.evaluate(()=>[window.__frames,window.__rafs]);return {frames:b[0]-a[0],rafs:b[1]-a[1]};};
  await page.evaluate(()=>document.querySelector('[data-field="11v11"]').click());await wait(4000);
  const watching=await sample(2000);assert(watching.frames>3,`the watch view renders the live match (${watching.frames} frames in 2 s)`);
  await page.getByRole('button',{name:'Choose plays'}).first().click();await wait(1500);
  const backdrop=await page.evaluate(()=>getComputedStyle(document.querySelector('dialog[open]'),'::backdrop').backdropFilter);
  assert.equal(backdrop,'none','no blur under the opaque sheet');
  const open=await sample(3000);assert.equal(open.frames,0,`the island draws nothing behind Choose plays (${open.frames} frames)`);
  assert(open.rafs<=2,`no rAF chain while the sheet is open (${open.rafs} callbacks in 3 s)`);
  await page.locator('dialog[open]').getByRole('button',{name:/back/i}).first().click();await wait(1200);
  const closed=await sample(2000);assert(closed.frames>3,`Back wakes the island (${closed.frames} frames in 2 s)`);
  await page.getByRole('button',{name:'Choose plays'}).first().click();await wait(1500);assert.equal((await sample(1500)).frames,0);
  await page.locator('dialog[open] .field-lesson-list button').first().click();await wait(1500);
  const lesson=await sample(2000);assert(lesson.frames>3,`picking a play wakes the island (${lesson.frames} frames in 2 s)`);
  console.log(JSON.stringify({profile:mobile?'phone':'desktop',watching,open,backdrop,closed,lesson}));
  console.log(`PASS Choose plays sleep (${mobile?'phone':'desktop'}): 0 island frames while open, wakes on Back and on a picked play`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
