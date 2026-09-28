const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 for(const kind of ['tennis','live']){
  const context=await browser.newContext({viewport:kind==='live'?{width:844,height:390}:{width:390,height:844},isMobile:true,hasTouch:true});
  await context.addInitScript(()=>localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{fixture:{game:'island',paid:30,reason:'input audit',at:1}},packs:[]})));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL('/arcade?game='+kind,process.env.FUTBOL_BASE_URL||'http://localhost:8092').href,{waitUntil:'domcontentloaded',timeout:90000});
  await page.getByRole('button',{name:kind==='live'?'Kick off':'Play',exact:true}).tap();
  const joystick=page.getByRole('group',{name:kind==='live'?'Move player':'Movement joystick',exact:true}),box=await joystick.boundingBox(),cdp=await context.newCDPSession(page);
  const first={id:1,x:box.x+box.width/2+24,y:box.y+box.height/2},second={id:2,x:box.x+box.width/2-20,y:box.y+box.height/2};
  const movement=()=>page.evaluate(kind=>kind==='live'?window.__fi2Live.local.current.mx:window.__arcade3d.input.current.x,kind);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first]});const before=await movement();assert(before>.2,'primary finger starts movement');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first,second]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[second]});
  assert.equal(await movement(),before,'unowned finger release does not cancel primary movement');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...first,x:first.x+5}]});assert((await movement())>before,'primary finger remains responsive');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(await movement(),0,'cancel returns to neutral');
  if(kind==='live')for(const action of ['shoot','sprint']){
   const r=await page.locator(`[data-action="${action}"]`).boundingBox(),a={id:3,x:r.x+r.width/2,y:r.y+r.height/2},b={id:4,x:r.x+r.width/2+8,y:r.y+r.height/2};
   const active=()=>page.evaluate(action=>action==='shoot'?window.__fi2Live.charging.current:window.__fi2Live.local.current.sprint,action);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});assert(await active());
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a,b]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[b]});assert(await active(),'second finger must not release '+action);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(await active(),false);if(action==='shoot')assert.equal(await page.evaluate(()=>window.__fi2Live.local.current.shoot),false,'canceled charge does not fire');
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first]});await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.equal(await movement(),0,'focus loss clears held movement');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.deepEqual(errors,[]);console.log('ARCADE_JOYSTICK_OWNERSHIP_PASS',kind);await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
