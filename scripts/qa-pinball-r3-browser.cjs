// Futbol Pinball round 3 browser QA (docs/ARCADE_PINBALL_R3_OCT26.md). Not in `npm test` (needs a running server):
//   FUTBOL_BASE_URL=http://localhost:8152 node scripts/qa-pinball-r3-browser.cjs [--size=390x844] [--out=/tmp/x]
// Checks: the start card fits without scrolling, the ladder (6 chips, hard ones locked on a fresh save, unlocked after a
// cleared Complete Forward), one Play button, the once-only tutorial hint, a hard-division run (High Press / Champions
// Night: sweeper-keeper visible, rush clock in the HUD, auto 2v1), the nudge option, a cinematic beat that ends on a
// flipper press, and no page errors. One screenshot per stage into --out.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
const arg=(k,d)=>{const a=process.argv.find(v=>v.startsWith(`--${k}=`));return a?a.slice(k.length+3):d;};
const [W,H]=arg('size','390x844').split('x').map(Number),out=arg('out','/tmp'),touch=W<1000;
(async()=>{const browser=await chromium.launch({headless:true,args:['--mute-audio'],executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:W,height:H},isMobile:touch,hasTouch:touch}),errors=[],tag=`${W}x${H}`;
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{if(sessionStorage.getItem('qa-init'))return;sessionStorage.setItem('qa-init','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{fixture:{game:'island',paid:90,reason:'playtest entry',at:1}},packs:[]}));localStorage.removeItem('fi2-pinball-tutorial-v1');localStorage.removeItem('fi2-pinball-stars-v1');localStorage.removeItem('fi2-pinball-prefs-v1');localStorage.removeItem('fi2-arcade-record-pinball-v1');});
 const base=process.env.FUTBOL_BASE_URL||'http://localhost:8152';
 await page.goto(new URL('/arcade?game=pinball',base).href,{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForSelector('[data-pinball-card=ready]',{timeout:120000});await page.waitForFunction(()=>!!window.__arcade3d,{timeout:120000});await page.waitForTimeout(+(process.env.QA_SETTLE||12000));
 const fit=await page.evaluate(()=>{const o=document.querySelector('[data-pinball-card]').parentElement,c=document.querySelector('[data-pinball-card]').getBoundingClientRect();return{scroll:o.scrollHeight-o.clientHeight,top:c.top,bottom:c.bottom,h:innerHeight};});
 assert.ok(fit.scroll<=1,`card fits without scrolling (${JSON.stringify(fit)})`);
 const chips=await page.$$eval('[data-division]',els=>els.map(e=>({n:+e.dataset.division,locked:e.disabled,hard:e.hasAttribute('data-hard'),h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width})));
 assert.equal(chips.length,6);assert.deepEqual(chips.map(c=>c.locked),[false,true,true,true,true,true],'fresh save: only Build Up open');
 assert.ok(chips.every(c=>c.h>=48&&c.w>=44),'ladder chips are big enough to tap');
 assert.equal(await page.locator('[data-pinball-card] [data-pinball-play]').count(),1,'one primary button');
 const play=await page.locator('[data-pinball-play]').boundingBox();assert.ok(play.height>=56,'Play is big');
 await page.screenshot({path:`${out}/pb-r3-start-${tag}.png`});
 // Options: nudge switch + help, hidden behind the gear.
 await page.locator('[data-pinball-options]').click();assert.equal(await page.locator('[data-pinball-options-panel]').count(),1);
 await page.locator('[data-pinball-options-panel] input').uncheck();await page.locator('[data-pinball-options]').click();
 // Play: tutorial hint shows once over the waiting table, goes with the first launch.
 await page.locator('[data-pinball-play]').click();
 await page.waitForFunction(()=>window.__arcade3d?.phaseRef.current==='playing');
 await page.waitForSelector('[data-pinball-tutorial]');
 const st=await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.pinball;return{level:s.level,nudgeOn:s.nudgeOn,beginner:s.beginner};});
 assert.deepEqual(st,{level:1,nudgeOn:false,beginner:true},'run set up from the card');
 await page.waitForTimeout(900);await page.screenshot({path:`${out}/pb-r3-tutorial-${tag}.png`});
 await page.locator('[data-pinball-launch]').click();
 await page.waitForFunction(()=>!document.querySelector('[data-pinball-tutorial]'));
 assert.equal(await page.evaluate(()=>localStorage.getItem('fi2-pinball-tutorial-v1')),'1','tutorial marked seen');
 assert.equal(await page.locator('[data-pinball-launch][data-off]').count(),1,'nudge pill hidden when the option is off');
 // Cinematic beat: a charged-launch beat slows the sim; a flipper press ends the slow-mo at once.
 const beat=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball,idle={x:0,y:0,left:false,right:false,charge:false};g.reset();s.plunger=1;g.action(2);for(let i=0;i<3;i++)g.update(1/60,idle);const slow=s.time;for(let i=0;i<6;i++)g.update(1/60,idle);const slowDt=s.time-slow;g.update(1/60,{...idle,left:true});const t0=s.time;for(let i=0;i<6;i++)g.update(1/60,{...idle,left:true});return{shot:g.pinballCamera().shot,slowDt,fastDt:s.time-t0};});
 // Hard division: Champions Night (fixture: start the run there).
 await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball;g.reset();s.level=s.startLevel=6;s.defs=3;});
 await page.evaluate(()=>window.__arcade3d.runtime.action(2));
 await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.extraLive,{timeout:8000});
 const hard=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball,sc=g.stage.scene;s.hot.time=8;s.hot.i=1;s.hype=.9;g.update(1/60,{x:0,y:0,left:false,right:false,charge:false});g.stage.render();const info=g.stage.renderer.info,calls=()=>{g.stage.render();return info.render.calls;},withNew=calls(),added=['pinball-chase-lights','pinball-hot-zone','pinball-sweeper'].map(n=>sc.getObjectByName(n));added.forEach(o=>o.visible=false);const without=calls();added.forEach(o=>o.visible=true);s.level=1;g.update(1/60,{x:0,y:0,left:false,right:false,charge:false});const div1=calls();s.level=6;g.update(1/60,{x:0,y:0,left:false,right:false,charge:false});return{draws:{div6:withNew,div6WithoutNew:without,div1},sweeper:sc.getObjectByName('pinball-sweeper').visible,hot:sc.getObjectByName('pinball-hot-zone').visible,rush:s.rush,detail:g.hud().detail,lights:!!sc.getObjectByName('pinball-chase-lights')};});
 assert.ok(hard.sweeper&&hard.hot&&hard.lights,'sweeper, hot zone and chase lights render');assert.match(hard.detail,/RUSH \d+s/,'rush clock in the HUD');
 assert.equal(beat.shot,'cinema','charged launch frames a cinematic beat');assert.ok(beat.slowDt<.08,'slow-mo set-up');assert.ok(Math.abs(beat.fastDt-.1)<.002,'a flipper press ends the slow-mo at once');
 await page.waitForTimeout(400);await page.screenshot({path:`${out}/pb-r3-hard-${tag}.png`});
 // Full time: the card, then the ladder opens the hard tier once Complete Forward is cleared.
 await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball;s.table.stars[3]|=1;s.level=s.startLevel=4;s.balls=0;s.phase='lost';s.timer=0;g.update(1/60,{x:0,y:0,left:false,right:false,charge:false});});
 await page.waitForSelector('[data-pinball-card=over]',{timeout:8000});
 const skip=page.getByRole('button',{name:'Skip',exact:true});if(await skip.count())await skip.first().click();
 const after=await page.$$eval('[data-division]',els=>els.map(e=>e.disabled));
 assert.deepEqual(after,[false,false,false,false,false,true],'clearing Complete Forward opens High Press');
 const fit2=await page.evaluate(()=>{const o=document.querySelector('[data-pinball-card]').parentElement;return o.scrollHeight-o.clientHeight;});assert.ok(fit2<=1,'full-time card fits');
 await page.waitForTimeout(300);await page.screenshot({path:`${out}/pb-r3-over-${tag}.png`});
 assert.deepEqual(errors,[]);
 console.log('PINBALL_R3_BROWSER_PASS',tag,JSON.stringify({fit,beat,hard,after}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
