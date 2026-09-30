// Konbini preview + tap-hop check (user, Sep 30 2026: "allow options to preview before buying"; "when clicking, it jumps and
// there's two of them"). Per store and viewport:
//  hop: tap a product; over the hop (frame strip) the product shows ONCE: its merged triangles are hidden, the single lifted
//       copy is visible, sits within 6 cm of its shelf spot and is not scaled;
//  preview: Preview a food → the big view is labelled Preview, never charges, collects, stamps NEW! or fills the pouch;
//           Back returns to the zoomed shelf with the same item selected; Escape also closes it; Buy from the preview runs
//           the normal purchase (one charge, the normal reveal); a gear item (ball/pack) previews its real picture.
// usage: node scripts/check-konbini-preview.cjs [--mobile] [--door=main|cay]   (dev server on :8092; KONBINI_SHOTS=dir)
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.FUTBOL_BASE_URL||'http://localhost:8092',OUT=process.env.KONBINI_SHOTS;
const mobile=process.argv.includes('--mobile'),tag=mobile?'phone':'desktop';
const doors=(process.argv.find(a=>a.startsWith('--door='))?.slice(7)??'main,cay').split(',');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const out=[];
 const TAP=process.env.KONBINI_TAP_SHOTS||(OUT?OUT+'/../tap':null);if(OUT)fs.mkdirSync(OUT,{recursive:true});if(TAP)fs.mkdirSync(TAP,{recursive:true});
 try{for(const door of doors){
  const ctx=await b.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:2});const p=await ctx.newPage();
  await p.addInitScript(()=>{if(sessionStorage.getItem('kp-seeded'))return;sessionStorage.setItem('kp-seeded','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-muted','true');
   const runs={};for(let i=0;i<5;i++)runs['preview-grant-'+i]={game:'island',paid:20,reason:'test grant',at:1};
   localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs,spends:{},packs:[],best:{},attempts:{},visits:{}}));localStorage.removeItem('fi2-konbini-v1');localStorage.removeItem('fi2-konbini-collection-v1');});
  await p.goto(`${base}/konbini?door=${door}`);await p.waitForFunction(()=>window.__konbini?.state.sleeping,null,{timeout:120000});
  const snap=()=>p.evaluate(()=>{const w=JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1'));const bal=Object.values(w.runs).reduce((n,r)=>n+r.paid,0)-Object.values(w.spends??{}).reduce((n,s)=>n+s.cost,0);
   return {bal,konbini:localStorage.getItem('fi2-konbini-v1'),collection:localStorage.getItem('fi2-konbini-collection-v1')};});
  const targets=await p.evaluate(()=>window.__konbini.targets),idx=poi=>targets.findIndex(t=>t.poi===poi);
  const zoomTo=async i=>{await p.evaluate(i=>window.__konbini.zoomTo(i),i);await p.waitForFunction(()=>{const s=window.__konbini.state;return s.zoom?.arrived&&!s.zooming;});await wait(350);};
  const tapAt=async f=>{if(mobile)await p.touchscreen.tap(f.x,f.y);else await p.mouse.click(f.x,f.y);};
  // ---- Hop: one visible copy ----
  await zoomTo(idx('rice'));const food=(await p.evaluate(()=>window.__konbini.debugFronts())).find(f=>f.kind==='food');assert(food,'a food on the rice case');
  await tapAt(food);const hop=[];for(let k=0;k<6;k++){hop.push(await p.evaluate(()=>window.__konbini.debugSelection()));if(TAP)await p.screenshot({path:`${TAP}/${door}-${tag}-hop-${k}.png`,clip:{x:Math.max(0,food.x-110),y:Math.max(0,food.y-110),width:220,height:220}});await wait(90);}
  for(const [k,h] of hop.entries()){assert(h&&h.hidden&&h.lift,`${door} ${tag}: exactly one copy at frame ${k}: ${JSON.stringify(h)}`);assert(h.offset<.06&&Math.abs(h.scale-1)<1e-6,`hop stays in place: ${JSON.stringify(h)}`);}
  await wait(500);const settled=await p.evaluate(()=>window.__konbini.debugSelection());assert(settled.offset<.005,'settles back onto the shelf');
  const asleep=await p.waitForFunction(()=>window.__konbini.state.sleeping,null,{timeout:5000}).then(()=>true,()=>false);assert(asleep,'the hop is bounded: the room sleeps again');
  // ---- Preview a food: no charge, no collect, Back returns ----
  const id=await p.evaluate(()=>document.querySelector('[data-konbini-tag]').getAttribute('data-konbini-tag'));const before=await snap();
  await p.locator(`[data-konbini-preview="${id}"]`).click();const pv=p.locator(`[data-konbini-reveal="${id}"][data-preview]`);await pv.waitFor();
  await p.locator('[data-konbini-reveal][data-built=true]').waitFor({timeout:10000});await wait(400);if(OUT)await p.screenshot({path:`${OUT}/${door}-${tag}-preview-food.png`});
  assert(await p.locator('[data-konbini-preview-tag]').isVisible(),'labelled Preview');assert.equal(await p.locator('[data-konbini-reveal] b:text("NEW!")').count(),0,'no NEW! stamp');assert.equal(await p.locator('[data-konbini-count]').count(),0,'no collection count');
  assert.deepEqual(await snap(),before,'preview never charges, collects or fills the pouch');
  await p.locator('[data-konbini-preview-back]').click();await pv.waitFor({state:'detached'});
  assert.equal(await p.evaluate(()=>document.querySelector('[data-konbini-tag]')?.getAttribute('data-konbini-tag')),id,'Back: the same item still selected');assert(await p.evaluate(()=>window.__konbini.state.zoom?.arrived),'Back: still on the zoomed shelf');
  await p.locator(`[data-konbini-preview="${id}"]`).click();await pv.waitFor();await p.keyboard.press('Escape');await pv.waitFor({state:'detached'});assert.deepEqual(await snap(),before,'Escape closes it, still no charge');
  // ---- Buy from the preview: one charge, the normal reveal ----
  const price=await p.evaluate(id=>Number(document.querySelector(`[data-konbini-buy="${id}"]`).textContent.match(/\d+/)[0]),id);
  await p.locator(`[data-konbini-preview="${id}"]`).click();await pv.waitFor();await p.locator('[data-konbini-preview-buy]').click();
  await p.locator(`[data-konbini-reveal="${id}"]:not([data-preview])`).waitFor({timeout:15000});await p.locator('[data-konbini-reveal][data-built=true]').waitFor({timeout:10000});
  if(OUT)await p.screenshot({path:`${OUT}/${door}-${tag}-bought-from-preview.png`});const after=await snap();
  assert.equal(before.bal-after.bal,price,'Buy from preview charges exactly once');assert.equal(JSON.parse(after.konbini).purchases.length,1,'one purchase');
  await p.keyboard.press('Escape');await p.locator('[data-konbini-reveal]').waitFor({state:'detached'});
  // ---- Preview gear: the real ball / pack picture ----
  const gi=idx('gear');await zoomTo(gi);const gear=(await p.evaluate(()=>window.__konbini.debugFronts())).find(f=>f.kind==='gear');assert(gear,'gear on the gear shelf');await tapAt(gear);
  await p.locator('[data-konbini-preview]').first().click();await p.locator('[data-konbini-reveal][data-preview]').waitFor();await p.locator('[data-konbini-reveal][data-built=true]').waitFor({timeout:10000});await wait(400);
  if(OUT)await p.screenshot({path:`${OUT}/${door}-${tag}-preview-gear.png`});const g2=await snap();assert.equal(g2.bal,after.bal,'gear preview never charges');
  await p.locator('[data-konbini-preview-back]').click();await p.locator('[data-konbini-reveal]').waitFor({state:'detached'});
  out.push({door,viewport:tag,food:id,price,gear:gear.ref,hopFrames:hop.length});await ctx.close();}}
 finally{await b.close();}
 console.log('KONBINI_PREVIEW_PASS',JSON.stringify(out));})().catch(e=>{console.error(e);process.exit(1);});
