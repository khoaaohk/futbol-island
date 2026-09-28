const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const mobile=process.argv.includes('--mobile'),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{fixture:{game:'island',paid:30,reason:'playtest entry',at:1}},packs:[]}));});
 await page.goto((process.env.FUTBOL_BASE_URL||'http://localhost:8092')+'/arcade?game=pinball',{waitUntil:'domcontentloaded',timeout:90000});await page.getByRole('button',{name:'Play',exact:true}).click();
 const canvas=page.locator('[data-arcade-kind="pinball"] canvas'),client=await page.context().newCDPSession(page);const positions={};for(const name of ['Left flipper','Right flipper','Launch']){const b=await page.getByRole('button',{name,exact:true}).boundingBox();positions[name]={x:b.x+b.width/2,y:b.y+b.height/2,id:1};}
 async function press(name,code){if(mobile){await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[positions[name]]});await page.waitForTimeout(70);await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else {await canvas.focus();await page.keyboard.down(code);await page.waitForTimeout(70);await page.keyboard.up(code);}}
 let strikes=0,goals=0,moves=0,launches=0,losses=0,previousBalls=3,captured=false,retries=0;const end=Date.now()+40000;
 while(Date.now()<end){const s=await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.pinball;return{phase:s.phase,x:s.ball.x,y:s.ball.y,vy:s.ball.vy,balls:s.balls,strikes:s.sfx.flipper,goals:s.goals,moves:s.moves,score:s.score};});strikes=Math.max(strikes,s.strikes);goals=Math.max(goals,s.goals);moves=Math.max(moves,s.moves);if(s.balls<previousBalls)losses++;previousBalls=s.balls;
 if(s.phase==='over'){await page.getByRole('button',{name:'Play again',exact:true}).click();retries++;previousBalls=3;continue;}
 if(s.phase==='ready'){await press('Launch','Space');launches++;}
 // Read-only observation drives ordinary controls; never mutate physics.
 else if(s.phase==='playing'&&s.vy>0&&s.y>490&&s.y<555){await press(s.x<180?'Left flipper':'Right flipper',s.x<180?'KeyA':'KeyD');}
 else await page.waitForTimeout(25);
 if(!captured&&strikes>=2){await page.screenshot({path:`/tmp/fi-pinball-play-${mobile?'mobile':'desktop'}.png`});captured=true;}
 }
 // Stop defending, let the remaining balls drain naturally, and retry.
 const failureEnd=Date.now()+60000;let observedOver=false;
 while(Date.now()<failureEnd){const phase=await page.evaluate(()=>window.__arcade3d.runtime.state.pinball.phase);if(phase==='over'){observedOver=true;await page.getByRole('button',{name:'Play again',exact:true}).click();retries++;await press('Launch','Space');await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.phase==='playing');break;}if(phase==='ready')await press('Launch','Space');await page.waitForTimeout(100);}
 assert(observedOver,'unprotected drains reach game over');
 assert(launches>0&&strikes>0,'ordinary controls launch and strike');assert.deepEqual(errors,[]);console.log('PINBALL_REAL_INPUT',JSON.stringify({mobile,launches,strikes,goals,moves,losses,retries,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
