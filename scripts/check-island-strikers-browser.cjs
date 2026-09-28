const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const mobile=process.argv.includes('--mobile'),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));
 await page.goto(new URL('/arcade?game=live',process.env.FUTBOL_BASE_URL||'http://localhost:8092').href);
 const root=page.getByRole('region',{name:'Island Strikers arcade match'}),canvas=root.locator('canvas');
 await page.waitForFunction(()=>window.__fi2Live);
 const framing=await page.evaluate(()=>{const {camera,scene}=window.__fi2Live,d=camera.position.length(),p=camera.position.clone();let extent=0;for(const x of [-26,26])for(const z of [-14,14]){p.set(x,2,z).project(camera);extent=Math.max(extent,Math.abs(p.x),Math.abs(p.y));}return{extent,d,far:camera.far,fogNear:scene.fog.near};});
 assert(framing.extent<=.94,'whole stadium fits');assert(framing.fogNear>framing.d+25&&framing.far>framing.d+30,'pitch stays visible on portrait screens');
 if(mobile){await page.getByRole('heading',{name:'Turn sideways to play'}).waitFor();await page.setViewportSize({width:844,height:390});await page.getByRole('heading',{name:'Turn sideways to play'}).waitFor({state:'hidden'});}await page.getByRole('button',{name:'Kick off',exact:true}).click();
 await page.waitForFunction(()=>window.__fi2Live.getElapsed()>.2);
 await page.evaluate(()=>window.__fi2Live.match.reset());
 if(mobile){const box=await page.getByRole('button',{name:'Hold / Shoot',exact:true}).boundingBox(),cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2,id:1}]});
  await page.waitForFunction(()=>window.__fi2Live.sim.charge>.85);assert(await page.evaluate(()=>window.__fi2Live.camera.zoom>1.7&&window.__fi2Live.sim.timeScale<.5),'charge zooms and slows match');await page.screenshot({path:'/tmp/fi-strikers-power-charge.png'});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }else{await page.keyboard.down('KeyK');await page.waitForFunction(()=>window.__fi2Live.sim.charge>.85);await page.keyboard.up('KeyK');}
 await page.waitForFunction(()=>window.__fi2Live.sim.eventKind==='shot');
 const shot=await page.evaluate(()=>{const s=window.__fi2Live.sim;return{owner:s.ball.owner,speed:Math.hypot(s.ball.vx,s.ball.vz)};});assert.equal(shot.owner,-1);assert(shot.speed>27);
 if(mobile){await page.setViewportSize({width:390,height:844});await page.getByRole('heading',{name:'Turn sideways to play'}).waitFor();}else await page.getByRole('button',{name:'Pause',exact:true}).click();await page.waitForTimeout(200);const frames=await canvas.getAttribute('data-frames'),time=await page.evaluate(()=>window.__fi2Live.getElapsed());await page.waitForTimeout(350);assert.equal(await canvas.getAttribute('data-frames'),frames);assert.equal(await page.evaluate(()=>window.__fi2Live.getElapsed()),time);
 if(mobile)await page.setViewportSize({width:844,height:390});await page.getByRole('button',{name:'Resume match',exact:true}).click();await page.waitForFunction(t=>window.__fi2Live.getElapsed()>t,time);
 // Deterministic keeper fixture: an actual collision must use hands, with the bean rig visible.
 await page.evaluate(()=>{const s=window.__fi2Live.sim,p=s.players[7];s.ball.owner=-1;Object.assign(s.ball,{x:p.x-.25,z:p.z,y:1,vx:8,vz:0,vy:0,lock:0});});
 await page.waitForFunction(()=>window.__fi2Live.sim.players[7].strikeKind==='save'&&window.__fi2Live.sim.players[7].kick>.2);
 const keeper=await page.evaluate(()=>{const v=window.__fi2Live,r=v.visual.rigs[7].root;return{bean:!!r.getObjectByName('bean-body'),sideRoll:r.rotation.z,kick:v.sim.players[7].strikeKind};});
 assert(keeper.bean,'new bean keeper is present');assert.equal(keeper.sideRoll,0,'save does not spin the root');
 await page.screenshot({path:`/tmp/fi-strikers-bean-save-${mobile?'mobile':'desktop'}.png`});
 await page.evaluate(()=>{const s=window.__fi2Live.sim;s.ball.owner=-1;Object.assign(s.ball,{x:24.8,z:3,y:1,vx:40,vz:0,vy:0,lock:1});});await page.waitForFunction(()=>window.__fi2Live.sim.score[0]===1);
 await page.waitForFunction(()=>document.querySelector('section[aria-label="Island Strikers arcade match"] header b')?.textContent==='1');
 await page.screenshot({path:`/tmp/fi-strikers-${mobile?'mobile':'desktop'}.png`});
 await page.evaluate(()=>window.__fi2Live.sim.time=179.99);await page.getByRole('heading',{name:'Full time.'}).waitFor();await page.waitForTimeout(200);const endFrames=await canvas.getAttribute('data-frames');await page.waitForTimeout(300);assert.equal(await canvas.getAttribute('data-frames'),endFrames);
 await page.getByRole('button',{name:/^(Play again|Next round)$/}).click();await page.waitForFunction(()=>window.__fi2Live.getElapsed()>0&&window.__fi2Live.getElapsed()<2&&!window.__fi2Live.sim.finished);assert.equal(await page.evaluate(()=>window.__fi2Live.sim.score[0]),0);
 assert.deepEqual(errors,[]);console.log('ISLAND_STRIKERS_BROWSER_PASS',JSON.stringify({mobile,shot,pausedFrames:frames,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
