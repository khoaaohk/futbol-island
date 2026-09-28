const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os');
const out=os.tmpdir()+'/futbol-player-book';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});try{
 for(const [name,width,height] of [['phone',390,844],['desktop',1280,800],['landscape',844,390]]){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:name!=='desktop',hasTouch:name!=='desktop'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{if(localStorage.getItem('book-test-seeded'))return;localStorage.setItem('book-test-seeded','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-island-jobs-v1',JSON.stringify({version:1,day:'',today:{},lifetime:{},earned:0,best:{},starter:true}));localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:Object.fromEntries(Array.from({length:30},(_,i)=>['book-fixture-'+i,{game:'island',paid:20,reason:'fixture',at:i}])),packs:[]}));});
 await p.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092/');await p.waitForFunction(()=>window.__fi2?.vending,null,{timeout:180000});await p.waitForTimeout(3000);
 const openMachine=async()=>{await p.evaluate(()=>{const f=window.__fi2,e=f.vending.entries.find(e=>e.machine.id==='plaza');f.location.x=e.front.x+e.dir.x*1.5;f.location.z=e.front.z+e.dir.z*1.5;f.rideRef.current='walk';f.flight.height=0;});await p.waitForTimeout(1500);await p.locator('[data-vending-go]').click();await p.waitForSelector('[data-vending-face]');};
 await openMachine();const item=p.locator('[data-vending-item="display:plaza:book"]');await item.click();await item.click();await p.waitForSelector('[data-vending-tray="full"]');await p.locator('[data-vending-tray]').click();await p.getByRole('button',{name:'Read my book',exact:true}).click();await p.waitForSelector('[data-player-book="messi"]');await p.waitForTimeout(2600);
 assert.equal(await p.locator('[data-vending-coins]').getAttribute('data-vending-coins'),'500');
 for(let page=0;page<6;page++){
  assert.equal(await p.locator('[data-player-book]').getAttribute('data-page'),String(page));
  const action=p.locator('[data-book-action]');const steps=page===1?3:1;for(let i=0;i<steps;i++){if(name==='desktop')await action.click();else await action.tap();}
  await p.waitForTimeout(700);assert.match(await action.innerText(),/Try the page again/);
  await p.screenshot({path:`${out}/${name}-${page}.png`});
  const sizes=await p.locator('[data-player-book] button').evaluateAll(es=>es.filter(e=>!e.disabled).map(e=>({label:e.textContent,height:e.getBoundingClientRect().height})));assert(sizes.every(s=>s.height>=44),JSON.stringify(sizes));
  if(page<5){await p.getByRole('button',{name:'Next page'}).click();await p.waitForTimeout(3300);}
 }
 await p.waitForTimeout(900);const before=await p.evaluate(()=>window.__fi2.renderer.info.render.frame);await p.waitForTimeout(1000);const after=await p.evaluate(()=>window.__fi2.renderer.info.render.frame);assert.equal(after,before,'island sleeps behind book');
 await p.getByRole('button',{name:'Back',exact:true}).click();await p.waitForSelector('[data-vending-face]');await item.click();await p.waitForSelector('[data-player-book]');assert.equal(await p.locator('[data-player-book]').getAttribute('data-page'),'5','bookmark resumes');await p.keyboard.press('Escape');await p.waitForSelector('[data-vending-face]');
 const spends=await p.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')).spends));assert.equal(spends.filter(s=>s.itemId==='display:plaza:book').length,1,'owned book never charged twice');
 if(name==='desktop'){await p.reload();await p.waitForFunction(()=>window.__fi2?.vending,null,{timeout:180000});await p.waitForTimeout(2500);await openMachine();await item.click();await item.click();await p.waitForSelector('[data-player-book]');assert.equal(await p.locator('[data-player-book]').getAttribute('data-page'),'5');assert.equal(await p.locator('[data-vending-coins]').getAttribute('data-vending-coins'),'500');await p.emulateMedia({reducedMotion:'reduce'});await p.getByRole('button',{name:'Read again'}).click();await p.waitForTimeout(100);const active=await p.locator('[data-player-book]').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length);assert.equal(active,0,'reduced motion has no active reader animations');}
 assert.deepEqual(errors,[]);console.log(name,'PASS purchase, 6 paper interactions, touch/keyboard, bookmark, single debit, 44px controls and island sleep');await ctx.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
