const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
for(const mobile of(process.argv.includes('--mobile')?[true]:process.argv.includes('--desktop')?[false]:[true,false])){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.removeItem('fi2-pass-puzzles-v1');});
 await page.goto('http://localhost:8092/arcade?game=puzzle');await page.waitForFunction(()=>window.__passPuzzle?.world,null,{timeout:90000});
 const press=async locator=>mobile?locator.tap():locator.click();const enter=async()=>{await press(page.getByRole('button',{name:'Games',exact:true}));await press(page.getByRole('button',{name:'Play Pass Puzzles',exact:true}));await page.waitForFunction(()=>window.__passPuzzle?.world);};
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
 const p=await plan({x:8.5,z:16});await down(p.a);for(let i=1;i<=22;i++)await move({x:p.a.x+(p.b.x-p.a.x)*i/22+Math.sin(i/22*Math.PI)*10,y:p.a.y+(p.b.y-p.a.y)*i/22});await page.waitForTimeout(100);
 let aim=await page.evaluate(()=>window.__passPuzzle.scene.debug());assert(aim.strokePoints>8&&aim.pathDots>3);assert(Math.hypot(aim.strokeEnd.x-8.5,aim.strokeEnd.z-16)<.05,'line follows actual pointer endpoint');await page.screenshot({path:`/tmp/pass-puzzle-controls-${mobile?'mobile':'desktop'}-draw.png`});
 await page.waitForTimeout(700);assert.equal(await page.locator('[data-active=true]').count(),1,'hold lift feedback');
 if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});else{await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await up();}await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.__passPuzzle.world.state.phase),'aiming');assert.equal(await page.evaluate(()=>window.__passPuzzle.scene.debug().strokePoints),0);
 // Ordinary input failure/retry, then deliberate pass and finish. No state writes or kick hooks.
 const draw=async target=>{const q=await plan(target);await down(q.a);for(let i=1;i<=16;i++)await move({x:q.a.x+(q.b.x-q.a.x)*i/16,y:q.a.y+(q.b.y-q.a.y)*i/16});await up();};
 await draw({x:0,z:12});await page.getByRole('button',{name:'Try again',exact:true}).waitFor({timeout:20000});await press(page.getByRole('button',{name:'Try again',exact:true}));
 await draw({x:8.5,z:16});await page.waitForFunction(()=>window.__passPuzzle.world.state.phase==='aiming'&&window.__passPuzzle.world.state.passes===1,null,{timeout:20000});
 await draw({x:-2.75,z:25});await page.getByText('That’s the move!',{exact:true}).waitFor({timeout:20000});await page.screenshot({path:`/tmp/pass-puzzle-controls-${mobile?'mobile':'desktop'}-success.png`});
 await press(page.getByRole('button',{name:'Puzzles',exact:true}));await page.waitForTimeout(1400);const frames=await canvas.getAttribute('data-frames');await page.waitForTimeout(350);assert.equal(await canvas.getAttribute('data-frames'),frames,'chooser sleeps after active play');
 await press(page.getByRole('button',{name:'Arcade',exact:true}));await page.waitForFunction(()=>!window.__passPuzzle);assert.deepEqual(errors,[]);console.log('PASS_PUZZLE_CONTROLS_PASS',JSON.stringify({mobile,aim,ordinaryFailureRetryAndGoal:true,exit:true}));await cdp.detach();await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
