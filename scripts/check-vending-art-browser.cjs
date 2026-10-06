const {chromium}=require('/Users/khoado/Desktop/Warp Claude Projects/futbol-island/node_modules/playwright');
const OUT='/tmp/vending-art-review';require('fs').mkdirSync(OUT,{recursive:true});
const only=process.argv[2],machineArg=process.argv[3]||'plaza',flow=!process.argv.includes('--pair');
const views=[['phone-portrait',{width:390,height:844},true],['phone-landscape',{width:844,height:390},true],['desktop',{width:1280,height:800},false]].filter(v=>!only||only==='all'||v[0]===only);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 for(const [name,viewport,mobile] of views){
  const ctx=await browser.newContext({viewport,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{if(localStorage.getItem('vend-fixture'))return;localStorage.setItem('vend-fixture','1');localStorage.setItem('fi2-welcome-v1','completed');
   const runs={};for(let i=0;i<2;i++)runs['fixture-'+i]={game:'live',paid:20,reason:'fixture',at:Date.now()+i};localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs,best:{},attempts:{},visits:{},packs:[]}));});
  await page.goto('http://localhost:8092/',{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.__fi2?.vending,null,{timeout:180000});await page.waitForTimeout(4000);
  const tag=`${name}-${machineArg}`;const shot=async n=>{await page.screenshot({path:`${OUT}/${tag}-${n}.png`});console.log(tag,n);};
  // Stand in front of the machine on foot.
  await page.evaluate(id=>{const f=window.__fi2,e=f.vending.entries.find(e=>e.machine.id===id);f.location.x=e.front.x+e.dir.x*1.5;f.location.z=e.front.z+e.dir.z*1.5;if(f.rideRef.current==='jetpack'){f.rideRef.current='walk';f.flight.height=e.machine.y;}},machineArg);
  await page.waitForTimeout(3000);
  await page.waitForFunction(()=>{const b=document.querySelector('[data-vending-go]');return b&&!b.hidden;},null,{timeout:15000}).catch(()=>console.log('no go prompt'));
  await shot('1-approach');
  await page.evaluate(()=>document.querySelector('[data-vending-go]').click());
  await page.waitForTimeout(450);await shot('1b-zooming');
  await page.waitForSelector('[data-vending-face]',{timeout:20000});await page.waitForTimeout(500);
  // Same frame without the face layer: the bare 3D machine at the close-up (continuity check).
  await page.addStyleTag({content:'[data-vending-face]{visibility:hidden!important}'});await page.waitForTimeout(100);await shot('2a-mesh-only');
  await page.evaluate(()=>{for(const s of document.querySelectorAll('style'))if(s.textContent.includes('[data-vending-face]{visibility:hidden'))s.remove();});await page.waitForTimeout(100);
  await shot('2-face');
  const info=await page.evaluate(()=>({face:document.querySelector('[data-vending-face]').dataset.vendingFace,
   slots:[...document.querySelectorAll('[data-vending-item]')].map(b=>{const r=b.getBoundingClientRect();return b.dataset.vendingItem+' '+Math.round(r.width)+'x'+Math.round(r.height);}),
   small:[...document.querySelectorAll('[data-vending-machine] *')].filter(el=>[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'&&parseFloat(getComputedStyle(el).fontSize)<12).map(el=>el.className+':'+el.textContent.slice(0,20)+':'+getComputedStyle(el).fontSize),
   smallButtons:[...document.querySelectorAll('[data-vending-machine] button')].filter(b=>b.getClientRects().length).map(b=>{const r=b.getBoundingClientRect();return [b.getAttribute('aria-label')||b.textContent.trim().slice(0,20),Math.round(r.width),Math.round(r.height)];}).filter(([,w,h])=>w<44||h<44)}));
  // Sep 30 2026: coins pill top-left, Done top-right (same 18/16 phone, 24/20 desktop anchors, mirrored). Phone anchors apply to touch
  // screens of any width too (VendingMachine.module.css: @media (max-width:600px),(pointer:coarse)), e.g. a landscape phone.
  const phone=viewport.width<=600||mobile,done=await page.getByRole('button',{name:'Done',exact:true}).boundingBox(),inset=phone?18:24;
  if(!done||Math.abs(viewport.width-(done.x+done.width)-inset)>1||Math.abs(done.y-(phone?16:20))>1)throw Error('Done button does not match the shared screen anchor: '+JSON.stringify(done));
  const pill=await page.locator('[data-vending-coins]').boundingBox();if(!pill||pill.x>inset+8||pill.x+pill.width>viewport.width/2)throw Error('coins pill is not top-left: '+JSON.stringify(pill));
  console.log(JSON.stringify(info));
  if(info.small.length||info.smallButtons.length)throw Error('Vending readability bounds failed');
  const overlap=await page.locator('[data-vending-item]').evaluateAll(slots=>slots.some(slot=>{const name=slot.children[1],push=slot.children[2];return name.offsetTop+name.offsetHeight>push.offsetTop+.5;}));
  if(overlap)throw Error('Product label overlaps its price button');
  if(flow){
   const first=page.locator('[data-vending-item]').first();
   await first.click();await page.waitForTimeout(300);await shot('3-selected');
   await first.click();await page.waitForTimeout(330);await shot('4-coins');
   await page.waitForSelector('[data-vending-tray="full"]',{timeout:8000});await page.waitForTimeout(250);await shot('5-tray');
   await page.locator('[data-vending-tray]').click();await page.waitForTimeout(600);await shot('6-taken');
   await page.getByRole('button',{name:'Keep shopping'}).click().catch(()=>page.getByRole('button',{name:'Nice!'}).click());
   await page.waitForTimeout(200);
   const pack=page.locator('[data-vending-item]').nth(1);
   await pack.click();await page.waitForTimeout(200);await pack.click();await page.waitForTimeout(300);await shot('7-not-enough');
   await page.keyboard.press('PageDown');await page.waitForTimeout(300);await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);await shot('8-page2-keyboard');
   await page.getByRole('button',{name:'Done',exact:true}).click();await page.waitForTimeout(350);await shot('9-leaving');
   await page.waitForTimeout(1300);await shot('10-left');
   const counts=await page.evaluate(()=>window.__fi2.sound?.counts);console.log('sound',JSON.stringify(counts&&Object.fromEntries(Object.entries(counts).filter(([k])=>k.startsWith('vending')))));
  }
  console.log('errors',errors.slice(0,5));
  await ctx.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
