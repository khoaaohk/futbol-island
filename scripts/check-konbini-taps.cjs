// Konbini tap-every-item check (user, Sep 30 2026: "not all the items are selectable"). For each store and viewport: zoom into
// every section, take every placed FRONT product that faces the camera and is on screen (window.__konbini.debugFronts(), read
// from the same placement records that build the 3D shelf, independent of the hit targets), tap its projected centre and assert
// the RIGHT item opens (its tag card, or the magazine lesson). Also fails for a visible product without any target.
// usage: node scripts/check-konbini-taps.cjs [--mobile] [--door=main|cay]   (dev server on :8092)
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs');
const base=process.env.FUTBOL_BASE_URL||'http://localhost:8092',OUT=process.env.KONBINI_SHOTS;
const mobile=process.argv.includes('--mobile'),tag=mobile?'phone':'desktop';
const doors=(process.argv.find(a=>a.startsWith('--door='))?.slice(7)??'main,cay').split(',');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio']});const summary=[];let failed=0;
 for(const door of doors){
  const ctx=await b.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();
  p.on('pageerror',e=>{if(!/ChunkLoadError|Loading chunk|hydrat/.test(e.message))console.log('pageerror',e.message);});
  await p.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);});
  await p.goto(`${base}/konbini?door=${door}`);await p.waitForFunction(()=>window.__konbini,null,{timeout:120000});await p.waitForFunction(()=>window.__konbini.state.sleeping,null,{timeout:20000});
  const targets=await p.evaluate(()=>window.__konbini.targets);const res={door,viewport:tag,sections:targets.length,products:0,ok:0,fails:[],covered:new Set(),done:new Set(),all:new Set()};
  for(let i=0;i<targets.length;i++){
   await p.evaluate(i=>window.__konbini.zoomTo(i),i);await p.waitForFunction(()=>{const s=window.__konbini.state;return s.zoom?.arrived&&!s.zooming;},null,{timeout:20000});await wait(350);
   const fronts=await p.evaluate(()=>window.__konbini.debugFronts());
   for(const f of fronts){
    // A product whose centre sits under a UI control (section arrows, the card, the header) belongs to a neighbouring section:
    // it must be tapped successfully from some other section instead (checked at the end).
    const covered=await p.evaluate(({x,y})=>{const el=document.elementFromPoint(x,y);return !!el&&!el.matches('canvas,[data-konbini-slot]');},f);
    if(covered){res.covered.add(f.id);continue;}res.products++;
    if(!f.kind){res.fails.push({section:targets[i].label,ref:f.ref,why:'no hit target'});continue;}
    if(mobile)await p.touchscreen.tap(f.x,f.y);else await p.mouse.click(f.x,f.y);
    let got=null;
    if(f.kind==='magazine'){try{await p.locator(`[data-konbini-lesson="${f.ref}"]`).waitFor({timeout:2500});got=f.ref;}catch{got=await p.evaluate(()=>document.querySelector('[data-konbini-lesson]')?.getAttribute('data-konbini-lesson')??null);}
     await p.keyboard.press('Escape');await p.locator('[data-konbini-panel]').waitFor({state:'detached',timeout:3000}).catch(()=>{});await wait(150);}
    else{await wait(120);got=await p.evaluate(()=>document.querySelector('[data-konbini-tag]')?.getAttribute('data-konbini-tag')??null);}
    const want=f.kind==='gear'?[f.ref,f.ref.replace(/^ball:/,'ball-'),f.ref.replace(':','-')]:[f.ref];
    if(got&&(want.includes(got)||(f.kind==='gear'&&got.includes(f.ref.split(':').pop())))){res.ok++;res.done.add(f.id);}else res.fails.push({section:targets[i].label,ref:f.ref,kind:f.kind,got,at:[Math.round(f.x),Math.round(f.y)]});}
   if(OUT&&i<99){fs.mkdirSync(OUT,{recursive:true});await p.screenshot({path:`${OUT}/${door}-${tag}-${String(i).padStart(2,'0')}-${targets[i].label.replace(/\W+/g,'_')}.png`});}
  }
  for(const id of res.covered)if(!res.done.has(id))res.fails.push({id,why:'only ever seen under a UI control'});res.uniqueOk=res.done.size;
  failed+=res.fails.length;summary.push(res);console.log(JSON.stringify({door,viewport:tag,sections:res.sections,taps:res.products,ok:res.ok,uniqueProducts:res.done.size,coveredElsewhere:res.covered.size,fails:res.fails.slice(0,12)}));await ctx.close();}
 await b.close();if(failed){console.log('KONBINI_TAPS_FAIL',failed);process.exit(1);}console.log('KONBINI_TAPS_PASS',JSON.stringify(summary.map(s=>({door:s.door,viewport:s.viewport,sections:s.sections,taps:s.products,ok:s.ok,uniqueProducts:s.uniqueOk}))));})();
