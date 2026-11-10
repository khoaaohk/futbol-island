// Browser check for the island gashapon machine as its own interface (round 5, Nov 9 2026: owner "not a modal. like the vending
// machine"; "the machine needs to interact to show the gashapon being dropped down"). Walk up to the Island Square Konbini pair,
// tap Gashapon: the camera zooms onto gs-square-snacks, NO dialog opens, the controls sit on the machine (knob, price, chips);
// turning the knob costs exactly 20 coins once, the 3D knob turns and the capsule drops into the tray, a tap cracks it, the
// toy's card shows beside the machine; Look closer opens the 3D viewer and comes back; Spin again; the daily cap tag; Escape
// zooms out and the static machine is folded back. Phone: a fresh player (no coins) sees the "not enough coins" tag.
// Screenshots: desktop + phone zoomed, two desktop mid-drop frames, the desktop reveal.
// usage: FUTBOL_BASE_URL=http://localhost:8823 OUT=<dir> node scripts/check-gashapon-browser.cjs   (dev build: ?preview=all&testCoins)
const assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:8092',OUT=process.env.OUT||'.';
const M={x:68.26,z:-52.42,id:'gs-square-snacks'};
async function open(browser,name,ctxOpts,coins){
 const ctx=await browser.newContext(ctxOpts),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon/.test(m.text()))errors.push(m.text());});
 await page.addInitScript(()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-muted','true');localStorage.setItem('fi2-time-of-day','day');}catch{}});
 await page.goto(BASE+'/play?from=konbini&preview=all'+(coins?'&testCoins=50000':''),{timeout:180000,waitUntil:'domcontentloaded'});
 const start=page.getByRole('button',{name:/^Start/});try{await start.first().waitFor({timeout:60000});await start.first().click();}catch{/* already on the island */}
 await page.waitForFunction(()=>window.__fi2?.world&&window.__fi2.location,null,{timeout:180000});await page.waitForTimeout(2500);
 await page.evaluate(m=>{const f=window.__fi2;f.location.x=m.x-.45;f.location.z=m.z+1.35;f.velocity.x=f.velocity.z=0;f.player.root.rotation.y=Math.PI;},M);
 await page.waitForTimeout(1500);
 await page.evaluate(()=>{const d=document.querySelector('dialog[data-save-dialog]');if(d){d.close();d.remove();}});
 const prompt=page.locator('[data-gashapon-go]:not([hidden])');await prompt.waitFor({timeout:15000});await prompt.click();
 await page.locator('[data-gashapon-face][data-placed=true]').waitFor({timeout:15000});await page.waitForTimeout(700);
 const state=await page.evaluate(()=>{const f=window.__fi2,live=f.scene.getObjectByName('gashapon-live');let draws=0;live?.traverse(o=>{if(o.isMesh)draws++;});
  const r=e=>{const b=document.querySelector(e)?.getBoundingClientRect();return b?{x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}:null;};
  return {live:!!live,liveDraws:draws,dialog:!!document.querySelector('[data-gashapon-face] [role=dialog],[data-gashapon-face][role=dialog]'),
   knob:r('[data-gashapon-spin] span'),label:r('[data-gashapon-spin] span:last-child'),price:r('[data-gashapon-face] p[aria-label^=Price]'),chips:r('[data-gashapon-progress]'),back:r('[data-gashapon-close]'),vw:innerWidth,vh:innerHeight};});
 const zoomShot=path.join(OUT,`gashapon-${name}-zoomed.png`);await page.screenshot({path:zoomShot});
 return {ctx,page,errors,state,zoomShot};
}
const balance=page=>page.locator('[data-gashapon-balance]').textContent().then(Number);
async function spinOnce(page,shots){
 await page.locator('[data-gashapon-spin]').click();
 if(shots){await page.waitForTimeout(380);await page.screenshot({path:shots[0]});await page.waitForTimeout(820);await page.screenshot({path:shots[1]});}
 const tray=page.locator('[data-gashapon-tray=full]');await tray.waitFor({timeout:15000});
 const phase=await page.evaluate(()=>window.__fi2.gasha.live?.phase);
 await tray.click();await page.locator('[data-gashapon-result]').waitFor({timeout:15000});await page.waitForTimeout(450);
 return {phase,toy:await page.locator('[data-gashapon-result]').getAttribute('data-gashapon-result'),repeat:await page.locator('[data-gashapon-repeat]').count()};
}
(async()=>{
 const fs=require('node:fs'),mac='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH||fs.existsSync(mac)?{executablePath:process.env.CHROME_PATH||mac}:{}),args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--mute-audio']});
 const out={};
 try{
  // ---- Desktop: the whole flow.
  {const d=await open(browser,'desktop',{viewport:{width:1280,height:800}},true),{page}=d;
   const bal0=await balance(page);
   const first=await spinOnce(page,[path.join(OUT,'gashapon-desktop-turning.png'),path.join(OUT,'gashapon-desktop-chute.png')]);
   const bal1=await balance(page);const revealShot=path.join(OUT,'gashapon-desktop-reveal.png');await page.screenshot({path:revealShot});
   const card=await page.evaluate(()=>{const c=document.querySelector('[data-gashapon-result]').getBoundingClientRect();return {x:Math.round(c.x),y:Math.round(c.y),w:Math.round(c.width),h:Math.round(c.height)};});
   // Look closer → the 3D viewer → Back: the machine's card is still there.
   await page.locator('[data-gashapon-look]').click();await page.locator('[data-toy-viewer]').waitFor({timeout:20000});await page.waitForTimeout(600);
   await page.keyboard.press('Escape');await page.locator('[data-toy-viewer]').waitFor({state:'detached',timeout:10000});
   const backFromViewer=await page.locator('[data-gashapon-result]').count();
   // Spin again from the card.
   await page.locator('[data-gashapon-again]').click();await page.locator('[data-gashapon-tray=full]').waitFor({timeout:15000});
   await page.locator('[data-gashapon-tray=full]').click();await page.locator('[data-gashapon-result]').waitFor({timeout:15000});
   const again=await page.locator('[data-gashapon-repeat]').count(),bal2=await balance(page);
   const focusOnKnob=await page.evaluate(()=>document.activeElement?.hasAttribute('data-gashapon-spin'));
   // Keyboard: Enter on the knob spins (one more), Space cracks the capsule in the tray (focus moves there).
   const focusBeforeEnter=await page.evaluate(()=>document.activeElement?.outerHTML.slice(0,80));
   await page.keyboard.press('Enter');await page.locator('[data-gashapon-tray=full]').waitFor({timeout:15000}).catch(e=>{throw new Error('Enter did not spin; focus was '+focusBeforeEnter);});
   const trayFocus=await page.evaluate(()=>document.activeElement?.hasAttribute('data-gashapon-tray'));
   await page.keyboard.press('Space');await page.locator('[data-gashapon-result]').waitFor({timeout:15000});await page.waitForTimeout(300);const bal3=await balance(page);
   // Daily cap: today's count at 12 → the cap tag by the price, no charge.
   await page.evaluate(()=>{const k='fi2-gashapon-v1',s=JSON.parse(localStorage.getItem(k));s.today=12;localStorage.setItem(k,JSON.stringify(s));window.dispatchEvent(new StorageEvent('storage',{key:k}));});
   await page.waitForTimeout(200);await page.locator('[data-gashapon-spin]').click();await page.locator('[data-gashapon-error=cap]').waitFor({timeout:5000});await page.waitForTimeout(400);
   const capShot=path.join(OUT,'gashapon-desktop-cap.png');await page.screenshot({path:capShot});const bal4=await balance(page);
   // Escape: zoom out, live copy gone, static machine back.
   await page.keyboard.press('Escape');await page.locator('[data-gashapon-face]').waitFor({state:'detached',timeout:5000});await page.waitForTimeout(1500);
   const after=await page.evaluate(()=>({live:!!window.__fi2.scene.getObjectByName('gashapon-live'),focused:window.__fi2.gasha.focused}));
   out.desktop={state:d.state,first,bal:[bal0,bal1,bal2,bal3,bal4],again,card,backFromViewer,focusOnKnob,trayFocus,after,errors:d.errors,shots:[d.zoomShot,revealShot,capShot]};
   await d.ctx.close();}
  // ---- Phone: framing, thumb sizes, and the no-coins tag for a fresh player.
  {const p=await open(browser,'phone',{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true},false),{page}=p;
   const bal=await balance(page);let coinsTag=null;
   // Spend the starting coins (a fresh player has a few spins' worth), then the next turn shows the tag.
   let b=bal;for(let i=0;i<4&&b>=20;i++){await spinOnce(page,null);b=await balance(page);if(i===0)await page.screenshot({path:path.join(OUT,'gashapon-phone-reveal.png')});}
   if(b<20){await page.locator('[data-gashapon-spin]').click();await page.locator('[data-gashapon-error=coins]').waitFor({timeout:5000});coinsTag=await page.locator('[data-gashapon-error]').textContent();await page.waitForTimeout(400);
    await page.screenshot({path:path.join(OUT,'gashapon-phone-nocoins.png')});}
   out.phone={state:p.state,bal,coinsTag,errors:p.errors,shots:[p.zoomShot]};
   await page.keyboard.press('Escape');await p.ctx.close();}
  console.log(JSON.stringify(out,null,1));
  const D=out.desktop;
  for(const r of [D,out.phone]){assert.equal(r.errors.length,0,r.errors.join('\n'));assert(r.state.live&&r.state.liveDraws<=7&&!r.state.dialog,'live machine, no dialog');}
  assert.equal(D.bal[0]-D.bal[1],20,'one spin = exactly 20 coins');assert.equal(D.first.phase,'tray','the capsule waited in the 3D tray');
  assert.equal(D.backFromViewer,1,'Look closer returns to the card');assert(D.focusOnKnob,'focus back on the knob after a spin');assert(D.trayFocus,'the tray takes focus while the capsule waits');
  assert.equal(D.bal[3],D.bal[4],'the cap costs nothing');assert(!D.after.live&&!D.after.focused,'Escape zooms out and folds the static machine back');
  assert(out.phone.coinsTag,'not-enough-coins tag');
  console.log('PASS gashapon browser check');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
