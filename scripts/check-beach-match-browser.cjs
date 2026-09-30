// Live beach soccer on Coral Cay (tests/beach-match.cjs covers the sim): travel to the cay on the map, watch the live
// 5-a-side match on the Sharks Beach court, open a live player's position guide and player card, then fly back to the
// main island and confirm the match is paused (dormant, sim clock frozen). Desktop 1280×800 and phone 390×844.
// Usage: node scripts/check-beach-match-browser.cjs [screenshot dir]   (dev server on :8092)
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.argv[2]??'/tmp/beach-match';fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 for(const mobile of [false,true]){
  const tag=mobile?'phone':'desktop';
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));
  await page.goto('http://localhost:8092/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__fi2?.games&&!document.querySelector('[class*=IslandLoading]'),null,{timeout:240000});await page.waitForTimeout(2500);
  const beach=()=>page.evaluate(()=>{const e=window.__fi2.games.entries.find(e=>e.venue.id==='beach');return {x:e.venue.x,z:e.venue.z,halfZ:e.venue.width/2,dormant:!!e.dormant,visible:e.root.visible,time:e.sim.stats.time,rigs:e.rigs.size,score:{...e.sim.score},period:e.sim.period,events:e.effects.events.slice(-6).map(x=>x.text)};});
  // 1. From the main island the beach match is asleep.
  const start=await beach();assert.equal(start.dormant,true,'asleep while the player is on the main island');assert.equal(start.time,0);assert.equal(start.rigs,0);
  // 2. Travel to Coral Cay with the map.
  await page.getByRole('button',{name:'View map'}).first().click();
  await page.getByRole('button',{name:'Travel to CORAL CAY'}).first().dispatchEvent('click'); // the map pans; the cay may sit outside the frame
  await page.waitForFunction(()=>window.__fi2.location.x>500,null,{timeout:30000});await page.waitForTimeout(2500);
  // 3. Walk to the touchline (relative to the court anchor) and watch the live match.
  await page.evaluate(({x,z,halfZ})=>{const f=window.__fi2;f.rideRef.current='walk';f.flight.height=0;f.location.x=x-8;f.location.z=z+halfZ+2;},start);
  await page.waitForTimeout(5000);
  const watching=await beach();
  assert.equal(watching.dormant,false);assert.equal(watching.visible,true);assert(watching.time>1,'the match plays');assert.equal(watching.rigs,10,'five a side, keepers included');
  assert.equal(await page.locator('[data-field="beach"]').count(),0,'no Learn card at the beach court');
  const inside=await page.evaluate(()=>{const e=window.__fi2.games.entries.find(e=>e.venue.id==='beach'),v=e.venue;return [...e.rigs.values()].every(r=>Math.abs(r.root.position.x-v.x)<=v.length/2+1&&Math.abs(r.root.position.z-v.z)<=v.width/2+1);});
  assert(inside,'every live player is inside the court lines');
  await page.screenshot({path:`${OUT}/beach-match-${tag}.png`});
  // 4. Tap a live player: the beach position guide opens, then a player card.
  let opened=false;
  for(let attempt=0;attempt<12&&!opened;attempt++){
   const target=await page.evaluate(()=>{const f=window.__fi2,e=f.games.entries.find(e=>e.venue.id==='beach'),c=f.camera,r=f.renderer.domElement.getBoundingClientRect();
    const list=[...e.rigs.entries()].map(([id,rig])=>{const p=rig.root.position.clone();p.y+=.9;p.project(c);return {id,x:r.left+(p.x+1)/2*r.width,y:r.top+(1-p.y)/2*r.height,z:p.z};}).filter(p=>p.z<1&&p.x>40&&p.x<r.width-40&&p.y>120&&p.y<r.height-220);
    return list[0]??null;});
   if(target){if(mobile)await page.touchscreen.tap(target.x,target.y);else await page.mouse.click(target.x,target.y);await page.waitForTimeout(700);opened=await page.locator('dialog[open]').count()>0;}
   if(!opened)await page.waitForTimeout(500);
  }
  assert(opened,'a live beach player opens the position guide');
  const heading=await page.locator('dialog[open] h2').first().textContent();assert.match(heading,/^Beach /);
  assert.match(await page.locator('dialog[open]').textContent(),/in beach soccer/);
  await page.screenshot({path:`${OUT}/beach-position-guide-${tag}.png`});
  await page.locator('dialog[open] button[data-player]').first().click();await page.waitForTimeout(900);
  await page.screenshot({path:`${OUT}/beach-player-card-${tag}.png`});
  await page.getByRole('button',{name:'Back',exact:true}).first().click();await page.waitForTimeout(400);
  await page.locator('dialog[open]').getByRole('button',{name:'Done',exact:true}).first().click();await page.waitForTimeout(600);
  assert.equal(await page.locator('dialog[open]').count(),0);
  // 5. Fly back to the main island: the beach match sleeps and its clock stops.
  await page.evaluate(()=>{const f=window.__fi2;f.location.x=95;f.location.z=-35;});
  await page.waitForTimeout(2500);const away=await beach();await page.waitForTimeout(2500);const later=await beach();
  assert.equal(away.dormant,true,'dormant again from the main island');assert.equal(later.time,away.time,'clock frozen while far away');
  await page.screenshot({path:`${OUT}/main-island-${tag}.png`});
  assert.deepEqual(errors,[]);
  console.log(`${tag} passed`,JSON.stringify({watching:{time:+watching.time.toFixed(1),score:watching.score,period:watching.period,events:watching.events},frozenAt:+away.time.toFixed(2)}));
  await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
