// Ordinary touch inputs only. Wallet setup pays entry; gameplay state is read-only.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  for(const kind of ['runner','pinball']){
   const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
   await context.addInitScript(()=>localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{fixture:{game:'island',paid:30,reason:'test entry',at:1}},packs:[]})));
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(new URL('/arcade?game='+kind,process.env.FUTBOL_BASE_URL||'http://localhost:8092').href,{waitUntil:'domcontentloaded',timeout:90000});
   await page.getByRole('button',{name:'Play',exact:true}).tap();await page.waitForFunction(()=>window.__arcade3d?.phaseRef.current==='playing');
   const cdp=await context.newCDPSession(page);
   const touch=(type,x=190,y=400)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{id:1,x,y}]});
   if(kind==='runner'){
    await page.getByRole('button',{name:'Move one lane left'}).tap();
    await touch('touchStart');await touch('touchMove',225,400);
    assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.runner.lane),0,'swipe commits while finger is still down');
    await touch('touchMove',275,400);await touch('touchEnd');
    assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.runner.lane),0,'same swipe cannot make a second lane change on release');
    await touch('touchStart');await touch('touchMove',190,362);
    assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.runner.jumping),true,'jump begins before swipe release');
    await touch('touchCancel');
    assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.runner.queuedMove),'','cancel does not queue a second jump');
    const balls=await page.evaluate(()=>window.__arcade3d.runtime.state.runner.balls);
    await touch('touchStart');await touch('touchCancel');
    assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.runner.balls),balls,'canceled tap does not shoot');
    await page.waitForFunction(()=>!window.__arcade3d.runtime.state.runner.jumping);await page.locator('canvas').focus();
    await page.keyboard.press('ArrowUp');assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.runner.jumping),true,'up arrow has the expected jump action');
    await page.waitForFunction(()=>!window.__arcade3d.runtime.state.runner.jumping);await page.keyboard.press('KeyS');
    assert((await page.evaluate(()=>window.__arcade3d.runtime.state.runner.slide))>0,'WASD down slides');

   }else{
    const launch=await page.getByRole('button',{name:'Launch',exact:true}).boundingBox(),x=launch.x+launch.width/2,y=launch.y+launch.height/2;
    await touch('touchStart',x,y);await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.plunger>.2);await touch('touchCancel');
    await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.plunger===0);
    assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.pinball.phase),'ready','canceled launch retracts without firing');
    await page.getByRole('button',{name:'Launch',exact:true}).tap();
    await page.waitForFunction(()=>{const s=window.__arcade3d.runtime.state.pinball;return s.phase==='playing'&&s.ball.x<341;});
    const nudge=page.getByRole('button',{name:'Nudge',exact:true});await nudge.waitFor();
    await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Nudge')?.disabled);
    const box=await nudge.boundingBox();await touch('touchStart',box.x+box.width/2,box.y+box.height/2);
    assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.pinball.nudges),0,'touch nudge reacts on press, before release');
    await touch('touchEnd');
   }
   await page.getByRole('button',{name:'Pause game'}).tap();await page.waitForTimeout(160);
   const canvas=page.locator(`[data-arcade-kind="${kind}"] canvas`),frames=await canvas.getAttribute('data-frames');await page.waitForTimeout(300);
   assert.equal(await canvas.getAttribute('data-frames'),frames,'paused input test leaves no active frame loop');
   assert.deepEqual(errors,[]);console.log('ARCADE_INPUT_TIMING_PASS',kind);await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
