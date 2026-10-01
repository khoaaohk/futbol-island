// Browser check for the four Sep 29 2026 book machines (North Beach, Causeway Stop, Coconut Café, Sharks Beach): at each
// machine, buy its pop-up book with seeded coins, read it, turn a page and play Coach Bella's narration, at 1280×800 and
// 390×844 (touch). Also records draw calls at the machine (island view) and in the book, and that the island sleeps behind it.
// usage: node scripts/check-book-machines-browser.cjs [outDir]   (dev server on :8092; FUTBOL_BASE_URL to override)
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os');
const out=process.argv[2]||os.tmpdir()+'/futbol-book-machines';fs.mkdirSync(out,{recursive:true});
const MACHINES=[['northbeach','cafu'],['causeway','nadim'],['cayplaza','kante'],['sharks','oshoala']];
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});const report={};try{
 for(const [vp,width,height] of [['desktop',1280,800],['phone',390,844]]){
  const touch=vp==='phone',ctx=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const press=l=>touch?l.tap():l.click();
  // 30 fixture runs × 20 coins = 600 coins, as scripts/check-player-book-browser.cjs seeds them.
  await p.addInitScript(()=>{if(localStorage.getItem('book-machines-seeded'))return;localStorage.setItem('book-machines-seeded','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-island-jobs-v1',JSON.stringify({version:1,day:'',today:{},lifetime:{},earned:0,best:{},starter:true}));localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:Object.fromEntries(Array.from({length:30},(_,i)=>['book-fixture-'+i,{game:'island',paid:20,reason:'fixture',at:i}])),packs:[]}));
   const Native=window.Audio;window.__bookVoices=[];window.Audio=function(...a){const x=new Native(...a);window.__bookVoices.push(x);return x;};window.Audio.prototype=Native.prototype;});
  await p.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092/',{timeout:240000});await p.waitForFunction(()=>window.__fi2?.vending,null,{timeout:240000});await p.waitForTimeout(3000);
  let coins=600;
  for(const [machine,book] of MACHINES){
   const itemId=await p.evaluate(m=>window.__fi2.vending.entries.find(e=>e.machine.id===m)?.machine.specials[0],machine);assert(itemId,machine+' has a special');
   // Walk up (teleport to the walk-up spot), measure the island's draw calls there, then Go.
   await p.evaluate(m=>{const f=window.__fi2,e=f.vending.entries.find(e=>e.machine.id===m);f.location.x=e.front.x+e.dir.x*1.5;f.location.z=e.front.z+e.dir.z*1.5;f.rideRef.current='walk';f.flight.height=0;},machine);
   await p.waitForTimeout(2200);
   const view=await p.evaluate(()=>{const f=window.__fi2,root=f.scene.getObjectByName('vending-machines');const calls=()=>{f.renderer.render(f.scene,f.camera);return f.renderer.info.render.calls;};const on=[calls(),calls()][1];root.visible=false;const off=[calls(),calls()][1];root.visible=true;return {drawCalls:on,withoutMachines:off};});
   await p.screenshot({path:`${out}/${vp}-${machine}-1-walkup.png`});
   await press(p.locator('[data-vending-go]'));await p.waitForSelector('[data-vending-face]',{timeout:20000});await p.waitForTimeout(600);
   const item=p.locator(`[data-vending-item="${itemId}"]`);await item.waitFor({timeout:10000});
   await press(item);await press(item);await p.waitForSelector('[data-vending-tray="full"]',{timeout:15000});await p.screenshot({path:`${out}/${vp}-${machine}-2-bought.png`});
   await press(p.locator('[data-vending-tray]'));await press(p.getByRole('button',{name:'Read my book',exact:true}));
   await p.waitForSelector(`[data-player-book="${book}"]`,{timeout:20000});await p.waitForTimeout(3000);
   coins-=100;assert.equal(await p.locator('[data-vending-coins]').getAttribute('data-vending-coins'),String(coins),book+' costs 100 coins');
   await p.screenshot({path:`${out}/${vp}-${machine}-3-open.png`});
   // Turn a page (Next), then play Coach Bella on page 2.
   await press(p.getByRole('button',{name:'Next page',exact:false}));await p.waitForTimeout(3400);assert.equal(await p.locator('[data-player-book]').getAttribute('data-page'),'1',book+' turned to page 2');
   const scene=p.locator('[data-book-scene]'),before=+await scene.getAttribute('data-render-count'),world=await p.evaluate(()=>window.__fi2.renderer.info.render.frame);
   await press(p.getByRole('button',{name:'Play story',exact:true}));
   await p.waitForFunction(b=>window.__bookVoices.some(a=>a.src.includes('/voice/books/'+b+'/')&&!a.paused&&a.currentTime>.4),book,{timeout:20000});await p.waitForTimeout(1200);
   const during=+await scene.getAttribute('data-render-count');assert(during>before+8,book+' paper animates with the narration');
   const book3d={drawCalls:+await scene.getAttribute('data-draw-calls'),textures:+await scene.getAttribute('data-textures'),triangles:+await scene.getAttribute('data-triangles')};
   await p.screenshot({path:`${out}/${vp}-${machine}-4-narrating.png`});
   await press(p.getByRole('button',{name:'Pause',exact:true}));await p.waitForTimeout(300);const paused=await scene.getAttribute('data-render-count');await p.waitForTimeout(900);
   assert.equal(await scene.getAttribute('data-render-count'),paused,book+' paper sleeps while paused');
   assert.equal(await p.evaluate(()=>window.__fi2.renderer.info.render.frame),world,'island sleeps behind the book');
   const src=await p.evaluate(b=>window.__bookVoices.find(a=>a.src.includes('/voice/books/'+b+'/'))?.src,book);
   report[`${vp}/${machine}`]={book,itemId,island:view,book3d,voice:src&&src.split('/voice/')[1]};
   // Back out of the book and the machine.
   await press(p.getByRole('button',{name:'Back',exact:true}));await p.waitForSelector('[data-vending-face]');await p.keyboard.press('Escape');await p.waitForTimeout(400);
   if(await p.locator('[data-vending-face]').count())await press(p.getByRole('button',{name:'Done',exact:true}).first());
   await p.waitForTimeout(1800);
  }
  const spends=await p.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')).spends||{}).map(s=>s.itemId));
  for(const [m] of MACHINES)assert.equal(spends.filter(s=>s===report[`${vp}/${m}`].itemId).length,1,m+' book charged once');
  assert.deepEqual(errors,[]);console.log(vp,'PASS: four book machines, purchase, read, page turn, narration, sleep');await ctx.close();
 }
 console.log(JSON.stringify(report,null,1));fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,1));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
