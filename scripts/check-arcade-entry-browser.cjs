const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const game of (process.argv.includes('--remaining')?['live','puzzle']:['tennis','pinball','runner','live','puzzle'])){
  const ctx=await browser.newContext({viewport:{width:1280,height:800}});await ctx.addInitScript(()=>{localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{seed:{game:'island',paid:12,reason:'fixture',at:1}},packs:[]}));});
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:8092/arcade?game='+game,{waitUntil:'domcontentloaded'});await page.locator('[data-arcade-loading]').waitFor({state:'detached',timeout:30000});
  // Pass Puzzles are free (ECONOMY_PROPOSAL §6a): starting one records no spend.
  if(game==='puzzle'){await page.locator('[data-level]').first().click();await page.getByRole('button',{name:'Start puzzle',exact:true}).click();await page.getByRole('button',{name:'Start puzzle',exact:true}).waitFor({state:'detached',timeout:10000});await page.waitForTimeout(800);
   assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')).spends??{}).length),0,'pass puzzles are free');assert.deepEqual(errors,[]);console.log('PASS free entry puzzle');await ctx.close();continue;}
  else await page.getByRole('button',{name:game==='live'?'Kick off':'Play',exact:true}).click();
  await page.waitForFunction(()=>Object.keys(JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')).spends??{}).length===1);
  let d=await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')).spends));assert.equal(d[0].cost,3);
  if(game!=='puzzle'){await page.getByRole('button',{name:/^Pause(?: game| match)?$/}).click();await page.getByRole('button',{name:game==='live'?'Resume match':'Resume',exact:true}).last().click();await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')).spends).length),1,'resume is free');}
  assert.deepEqual(errors,[]);console.log('PASS paid entry and free resume',game);await ctx.close();
 }
 const page=await browser.newPage();await page.goto('http://localhost:8092/arcade?game=tennis');await page.locator('[data-arcade-loading]').waitFor({state:'detached'});await page.getByRole('button',{name:'Play',exact:true}).click();await page.getByText(/You need 3 more coins/).waitFor();assert(await page.getByRole('button',{name:'Play',exact:true}).isVisible());console.log('PASS empty wallet keeps ready screen and explains how to earn');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
