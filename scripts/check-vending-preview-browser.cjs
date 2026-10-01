// Needs `npm run dev` on :8092 (QA11): it relies on ?preview=all&store=, which production builds switch off. Fails fast otherwise (scripts/requireDevServer.cjs).
const {requireDevServer}=require('./requireDevServer.cjs');
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{await requireDevServer();const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{if(localStorage.getItem('preview-seeded'))return;localStorage.setItem('preview-seeded','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-island-jobs-v1',JSON.stringify({version:1,day:'',today:{},lifetime:{},earned:0,best:{},starter:true}));localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{},packs:[]}));localStorage.setItem('fi2-vending-v1',JSON.stringify({version:1,owned:[],spent:[],found:[]}));});
 const base=process.env.FUTBOL_BASE_URL||'http://localhost:8092/';await p.goto(base+'?preview=all&store=books');await p.waitForFunction(()=>window.__fi2?.vending,null,{timeout:180000});await p.waitForTimeout(4000);
 await p.waitForSelector('[data-vending-face], [data-player-book]',{timeout:60000});
 const snapshot=()=>p.evaluate(()=>Object.fromEntries(['fi2-arcade-wallet-v1','fi2-vending-v1','fi2-player-cards-v1','futbol-island-customization-v1','fi2-ride-unlocks-v1','fi2-backpack-v1'].map(k=>[k,localStorage.getItem(k)])));
 const before=await snapshot();
 // The preview session never grants the one-time starter kit (backpackStore.ensureStarterKit returns early under ?preview=all).
 assert.equal(before['fi2-player-cards-v1'],null,'the preview visit adds no starter cards');assert.equal(before['fi2-backpack-v1'],null,'the preview visit writes no starter receipt');assert.equal(await p.locator('[data-vending-coins]').getAttribute('data-vending-coins'),'0');assert.match(await p.locator('[data-vending-coins]').innerText(),/Preview/);
 const item=p.locator('[data-vending-item="display:plaza:book"]');if(!await p.locator('[data-player-book]').count()){if(await item.getAttribute('aria-pressed')!=='true')await item.tap();await item.tap();}await p.waitForSelector('[data-player-book="messi"]');await p.locator('[data-book-action]').tap();await p.getByRole('button',{name:'Back',exact:true}).tap();await item.tap();await p.waitForSelector('[data-player-book="messi"]');await p.keyboard.press('Escape');
 const ball=p.locator('[data-vending-item="ball:telstar"]');await ball.tap();await ball.tap();assert.match(await p.locator('[data-vending-led]').innerText(),/equipped/);
 const pack=p.locator('[data-vending-item="pack:legends"]');await pack.tap();await pack.tap();await p.waitForSelector('[data-vending-card-reveal]');assert.match(await p.locator('[data-vending-card-reveal]').innerText(),/Sample cards — not saved/);await p.getByRole('button',{name:'Done',exact:true}).tap();
 let costume;for(let i=0;i<20;i++){costume=p.locator('[data-vending-item^="costume:"]').filter({hasNotText:'No costume'}).first();if(await costume.count())break;await p.locator('[data-vending-flip="next"]').tap();}assert(await costume.count(),'costume available');assert.equal(await costume.getAttribute('data-state'),'owned');await costume.tap();await costume.tap();
 assert.deepEqual(await snapshot(),before,'preview does not debit, grant, collect or save equipment');
 await p.goto(base);await p.waitForFunction(()=>window.__fi2?.vending,null,{timeout:180000});await p.waitForTimeout(3000);assert.equal(await p.locator('[data-preview="true"]').count(),0);// The first normal visit of this fresh save may grant its one-time starter kit (three fixed cards + the backpack receipt);
 // that is ordinary play, not the preview, and used to race this snapshot (QA Sep 29 2026). Everything else must be unchanged.
 const after=await snapshot(),starter=JSON.stringify(['Mary Earps','Martin Ødegaard','Ada Hegerberg']);
 assert([null,starter].includes(after['fi2-player-cards-v1']),'only the normal visit\'s starter cards may appear');
 const {['fi2-player-cards-v1']:_a,['fi2-backpack-v1']:_b,...afterRest}=after,{['fi2-player-cards-v1']:_c,['fi2-backpack-v1']:_d,...beforeRest}=before;
 assert.deepEqual(afterRest,beforeRest,'removing flag leaves saved account unchanged');assert.deepEqual(errors,[]);console.log('PASS zero-coin book/reopen, sample pack, unlocked gear/costume, no saved economy or equipment, opt-in reset');await ctx.close();
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
