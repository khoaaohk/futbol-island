const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
for(const mobile of(process.argv.includes('--mobile')?[true]:process.argv.includes('--desktop')?[false]:[true,false])){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.removeItem('fi2-pass-puzzles-v1');localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{fixture:{game:'island',paid:30,reason:'playtest entry',at:1}},packs:[]}));});
 await page.goto(new URL('/arcade?game=puzzle',process.env.FUTBOL_BASE_URL||'http://localhost:8092').href,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.__passPuzzle?.world,null,{timeout:90000});await page.locator('[data-arcade-loading]').waitFor({state:'detached',timeout:30000});
 const press=async locator=>mobile?locator.tap():locator.click();const enter=async()=>{await page.goto(new URL('/arcade?game=puzzle',process.env.FUTBOL_BASE_URL||'http://localhost:8092').href,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.__passPuzzle?.world);await page.locator('[data-arcade-loading]').waitFor({state:'detached',timeout:30000});};
 await press(page.getByRole('button',{name:'Arcade',exact:true}));await page.waitForFunction(()=>!window.__passPuzzle);await enter();
 await press(page.getByRole('button',{name:/7v7 Small-sided/}));assert.equal(await page.getByRole('button',{name:/7v7 Small-sided/}).getAttribute('aria-pressed'),'true');
 await press(page.getByRole('button',{name:'Team Moves',exact:true}));assert((await page.locator('[data-level]').first().getAttribute('data-level')).startsWith('tm-'));await press(page.getByRole('button',{name:'First Passes',exact:true}));
 await page.screenshot({path:`/tmp/pass-puzzle-controls-${mobile?'mobile':'desktop'}-chooser.png`});
 const start=async()=>{await press(page.locator('[data-level]').first());await press(page.getByRole('button',{name:'Start puzzle',exact:true}));await page.waitForFunction(()=>window.__passPuzzle.world.state.phase==='aiming');};await start();
 const canvas=page.locator('[data-arcade-kind="pass-puzzle"] canvas'),cdp=await page.context().newCDPSession(page);
 let last={x:0,y:0};const down=async p=>{last=p;if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});else{await page.mouse.move(p.x,p.y);await page.mouse.down();}};
 const move=async p=>{last=p;if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[p]});else await page.mouse.move(p.x,p.y);};
 const up=async()=>mobile?cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}):page.mouse.up();
 const plan=async target=>page.evaluate(target=>{const g=window.__passPuzzle,b=g.world.state.ball.p;return{a:g.scene.toScreen(b.x,0,b.z),b:g.scene.toScreen(target.x,0,target.z)};},target);
 if(process.argv.includes('--cadence')){
  await page.evaluate(()=>{const scene=window.__passPuzzle.scene,original=scene.setAim;window.__aimTimes=[];scene.setAim=(view,...args)=>{if(view)window.__aimTimes.push(performance.now());return original(view,...args);};});
  const route=await plan({x:8.5,z:16});await down(route.a);
  for(let i=1;i<=70;i++){await move({x:route.a.x+(route.b.x-route.a.x)*i/70,y:route.a.y+(route.b.y-route.a.y)*i/70});await page.waitForTimeout(10);}
  await page.waitForTimeout(4500);
  const frames=await canvas.getAttribute('data-frames'),times=await page.evaluate(()=>window.__aimTimes);
  assert(times.length>3,'gesture produces live flight previews');
  for(let i=1;i<times.length;i++)assert(times[i]-times[i-1]>=70,'expensive preview stays bounded near 12.5Hz');
  await page.waitForTimeout(350);assert.equal(await canvas.getAttribute('data-frames'),frames,'stationary held gesture sleeps after loft and body poses settle');
  await move({x:route.b.x-8,y:route.b.y});await page.waitForTimeout(180);
  assert.notEqual(await canvas.getAttribute('data-frames'),frames,'moving a held gesture wakes its preview');
  if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});else{await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await up();}
  assert.equal(await page.evaluate(()=>window.__passPuzzle.world.state.phase),'aiming','canceled performance audit does not fire');
  assert.deepEqual(errors,[]);console.log('PUZZLE_PREVIEW_CADENCE_PASS',JSON.stringify({mobile,predictions:times.length,minimumGap:Math.min(...times.slice(1).map((t,i)=>t-times[i])),heldSleep:true}));await cdp.detach();await page.close();continue;
 }
 const p=await plan({x:8.5,z:16});await down(p.a);for(let i=1;i<=22;i++)await move({x:p.a.x+(p.b.x-p.a.x)*i/22+Math.sin(i/22*Math.PI)*10,y:p.a.y+(p.b.y-p.a.y)*i/22});await page.waitForTimeout(100);
 let aim=await page.evaluate(()=>window.__passPuzzle.scene.debug());assert.equal(aim.strokePoints,0,'raw gesture line is hidden');assert(aim.pathDots>3,'predicted pass remains visible');await page.screenshot({path:`/tmp/pass-puzzle-controls-${mobile?'mobile':'desktop'}-draw.png`});
 await page.waitForTimeout(700);assert.equal(await page.locator('[data-active=true]').count(),1,'hold lift feedback');
 if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});else{await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await up();}await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.__passPuzzle.world.state.phase),'aiming');assert.equal(await page.evaluate(()=>window.__passPuzzle.scene.debug().strokePoints),0);
 // Ordinary input failure/retry, then deliberate pass and finish. No state writes or kick hooks.
 const draw=async target=>{const q=await plan(target);await down(q.a);for(let i=1;i<=16;i++)await move({x:q.a.x+(q.b.x-q.a.x)*i/16,y:q.a.y+(q.b.y-q.a.y)*i/16});await up();};
 await draw({x:0,z:12});await page.getByRole('button',{name:'Try again',exact:true}).waitFor({timeout:20000});await press(page.getByRole('button',{name:'Try again',exact:true}));
 await draw({x:8.5,z:16});await page.waitForFunction(()=>window.__passPuzzle.world.state.phase==='aiming'&&window.__passPuzzle.world.state.passes===1,null,{timeout:20000});
 if(process.argv.includes('--top-bins')){
  await press(page.getByRole('button',{name:'Shoot',exact:true}));await press(page.getByRole('button',{name:'Top bins',exact:true}));
  const power=page.getByRole('slider',{name:'Pass and shot power'}),box=await power.boundingBox();
  if(mobile)await page.touchscreen.tap(box.x+box.width-2,box.y+box.height/2);else await power.click({position:{x:box.width-2,y:box.height/2}});
  await page.screenshot({path:`/tmp/pass-puzzle-top-bins-${mobile?'mobile':'desktop'}.png`});
 }
 await draw({x:-2.75,z:25});await page.getByText('That’s the move!',{exact:true}).waitFor({timeout:20000});if(process.argv.includes('--top-bins'))assert.equal(await page.evaluate(()=>window.__passPuzzle.world.inputs().at(-1).kick.shotHeight),1,'real input retains top-bin selection');await page.screenshot({path:`/tmp/pass-puzzle-controls-${mobile?'mobile':'desktop'}-success.png`});
 await press(page.getByRole('button',{name:'Puzzles',exact:true}));await page.waitForTimeout(1400);const frames=await canvas.getAttribute('data-frames');await page.waitForTimeout(350);assert.equal(await canvas.getAttribute('data-frames'),frames,'chooser sleeps after active play');
 await press(page.getByRole('button',{name:'Arcade',exact:true}));await page.waitForFunction(()=>!window.__passPuzzle);assert.deepEqual(errors,[]);console.log('PASS_PUZZLE_CONTROLS_PASS',JSON.stringify({mobile,aim,ordinaryFailureRetryAndGoal:true,exit:true}));await cdp.detach();await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
