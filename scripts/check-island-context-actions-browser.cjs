const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:161,z:-33,yaw:0,ride:'walk',flightHeight:0}));});
  await page.goto('http://localhost:8092/?from=arcade',{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.__fi2&&!document.querySelector('[data-island-return-loading]'),null,{timeout:120000});
  const prompts='[data-coaches-enter],[data-arcade-enter],[data-museum-enter],[data-vending-go],[data-fish-enter],[data-market-enter],[data-truck-land],[data-truck-exit],.field-learn-card';
  const visible=()=>page.locator(prompts).evaluateAll(list=>list.filter(e=>!e.hidden&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden').map(e=>({text:e.textContent,label:e.getAttribute('aria-label')})));
  await page.locator('[data-coaches-enter]').waitFor({state:'visible'});assert.equal((await visible()).length,1,'building prompt is the only action');
  await page.screenshot({path:`/tmp/island-context-coaches-${mobile?'mobile':'desktop'}.png`});
  const move=async(x,z,y=0)=>{await page.evaluate(({x,z,y})=>{const g=window.__fi2;Object.assign(g.location,{x,z});Object.assign(g.velocity,{x:0,z:0});g.rooftop.reset(x,z,y);g.player.root.position.set(x,y,z);},{x,z,y});await page.keyboard.press('KeyW');await page.waitForTimeout(900);};
  await move(168,-65);/* clear of Maya (155,-68): a nearby NPC's Talk outranks Learn Plays (docs/ui/HUD_STACK.md) */await page.waitForFunction(()=>[...document.querySelectorAll('.field-learn-card')].some(e=>!e.hidden&&!e.disabled));assert.equal((await visible()).length,1,'field action returns after leaving entry');
  if(!mobile){await move(161,-24);const p=await page.evaluate(()=>{const g=window.__fi2,r=g.renderer.domElement.getBoundingClientRect(),b=g.world.coachesBounds;for(const x of [b.min.x+1,b.max.x-1,(b.min.x+b.max.x)/2])for(const y of [1,3,6]){const v=g.player.root.position.clone().set(x,y,b.max.z).project(g.camera),p={x:r.x+(v.x+1)*r.width/2,y:r.y+(1-v.y)*r.height/2};if(document.elementFromPoint(p.x,p.y)===g.renderer.domElement)return p;}throw Error('Building hover fixture is obscured');});await page.mouse.move(p.x,p.y);await page.locator('[data-coaches-enter]').waitFor({state:'visible'});assert.equal((await visible()).length,1,'hover entry replaces field action immediately');await page.mouse.move(5,5);await page.waitForTimeout(650);}
  await move(135,10.4,17.23);await page.locator('[data-vending-go]').waitFor({state:'visible'});assert.equal((await visible()).length,1,'roof vending action replaces field card');
  await page.screenshot({path:`/tmp/island-context-vending-${mobile?'mobile':'desktop'}.png`});assert.deepEqual(errors,[]);console.log('ISLAND_CONTEXT_ACTIONS_PASS',JSON.stringify({mobile}));await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
