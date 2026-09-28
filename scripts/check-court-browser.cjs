const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));
  await page.goto('http://localhost:8092/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__fi2?.islandNpcs,{timeout:180000});await page.waitForTimeout(3500);
  await page.evaluate(()=>{const f=window.__fi2;f.rideRef.current='walk';f.flight.height=0;f.location.x=86;f.location.z=-54.5;});
  await page.waitForTimeout(1800);
  const snapshot=()=>page.evaluate(()=>window.__fi2.islandNpcs.entries.filter(e=>e.freestyle).map(e=>({id:e.id,x:e.position.x,z:e.position.z,ball:e.freestyle.ball.position.toArray(),phase:e.freestyle.motion.juggle})));
  const a=await snapshot();assert.equal(a.length,4);assert(a.every(e=>e.x>78&&e.x<94&&e.z>-65&&e.z<-53));await page.waitForTimeout(400);const b=await snapshot();assert(b.some((e,i)=>e.ball.some((v,j)=>Math.abs(v-a[i].ball[j])>.05)));
  await page.screenshot({path:`/tmp/court-${mobile?'phone':'desktop'}-day.png`});
  await page.evaluate(()=>window.__fi2.world.updateTrafficSignals('night'));await page.waitForTimeout(50);
  assert(await page.evaluate(()=>window.__fi2.scene.getObjectByName('night-light-pools').visible));
  await page.screenshot({path:`/tmp/court-${mobile?'phone':'desktop'}-lights.png`});
  await page.evaluate(()=>{const f=window.__fi2;f.location.x=81;f.location.z=-55.2;});await page.waitForTimeout(600);
  await page.getByRole('button',{name:'Talk to Kei',exact:true}).click();
  await page.waitForSelector('[data-freestyle-clips]');assert.equal(await page.locator('[data-freestyle-clips] iframe').count(),0);
  const before=await snapshot();await page.waitForTimeout(400);assert.deepEqual(await snapshot(),before);
  await page.locator('[data-freestyle-clips]').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/court-${mobile?'phone':'desktop'}-conversation.png`});
  await page.getByRole('button',{name:'Another freestyle clip'}).click();assert(await page.getByRole('button',{name:'Watch Andrew Henderson · Freestyle control'}).isVisible());
  await page.getByRole('button',{name:'Watch Andrew Henderson · Freestyle control'}).click();
  await page.waitForFunction(()=>document.querySelector('[data-freestyle-clips] iframe')||document.querySelector('[data-freestyle-clips] [role=status]'),{},{timeout:20000});
  console.log('Clip player state:',await page.locator('[data-freestyle-clips] iframe').count()?'embedded player mounted':'publisher fallback shown');
  await page.getByRole('button',{name:'Done',exact:true}).click();await page.waitForTimeout(500);
  assert.equal(await page.locator('dialog[open]').count(),0);assert.deepEqual(errors,[]);console.log(mobile?'phone passed':'desktop passed',JSON.stringify(a));await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
