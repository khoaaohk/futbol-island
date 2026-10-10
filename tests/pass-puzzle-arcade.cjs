// Pass Puzzles arcade browser check (lane E). Needs the dev server on :8092.
// node tests/pass-puzzle-arcade.cjs [--mobile]   (both viewports run when no flag is given)
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
const shots=process.env.PASS_PUZZLE_SHOTS||'/tmp';
async function run(browser,mobile){
 const size=mobile?{width:390,height:844}:{width:1280,height:800},tag=mobile?'390':'1280';
 const page=await browser.newPage({viewport:size,isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.removeItem('fi2-pass-puzzles-v1');
  // Puzzles cost 3 coins from the shared wallet: seed earned coins the same way the book/vending checks do.
  if(!localStorage.getItem('ppa-coins-seeded')){localStorage.setItem('ppa-coins-seeded','1');localStorage.setItem('fi2-island-jobs-v1',JSON.stringify({version:1,day:'',today:{},lifetime:{},earned:0,best:{},starter:true}));localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:Object.fromEntries(Array.from({length:10},(_,i)=>['ppa-fixture-'+i,{game:'island',paid:20,reason:'fixture',at:i}])),packs:[]}));}});
 await page.goto((process.env.FUTBOL_BASE_URL||'http://localhost:8092')+'/arcade?game=puzzle',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.__passPuzzle?.world,null,{timeout:120000});
 const canvas=page.locator('[data-arcade-kind="pass-puzzle"] canvas');
 await page.waitForTimeout(400);await page.screenshot({path:`${shots}/pass-puzzle-levels-${tag}.png`});
 // Level select → brief → freeze.
 await page.locator('[data-level]').first().click();
 await page.getByRole('button',{name:'Start puzzle'}).waitFor();
 await page.screenshot({path:`${shots}/pass-puzzle-brief-${tag}.png`});
 await page.getByRole('button',{name:'Start puzzle'}).click();
 await page.waitForFunction(()=>window.__passPuzzle.world.state.phase==='aiming');
 // Idle aiming sleeps: no frames while nothing moves.
 // After input the defence scans for a bounded 4 s (15 fps), then aiming sleeps completely.
 await page.waitForTimeout(4600);const idle=Number(await canvas.getAttribute('data-frames'));await page.waitForTimeout(600);
 assert.equal(Number(await canvas.getAttribute('data-frames')),idle,'aiming idle sleeps');
 // Draw a stroke from the ball toward the solution's first target (or the nearest teammate).
 const plan=await page.evaluate(()=>{const g=window.__passPuzzle,w=g.world,s=w.state,sol=g.solution?.(w.scenario.id);
  const b=s.ball.p,target=sol?.[0]?.target??(()=>{let best=null,d=1e9;s.attackers.forEach((a,i)=>{if(i===s.carrier)return;const dd=Math.hypot(a.p.x-b.x,a.p.z-b.z);if(dd<d){d=dd;best=a.p;}});return best;})();
  const from=g.scene.toScreen(b.x,0,b.z),to=g.scene.toScreen(target.x,0,target.z);return{from,to};});
 const box=await canvas.boundingBox(),at=p=>({x:box.x+p.x,y:box.y+p.y});
 const a=at(plan.from),c=at(plan.to);await page.mouse.move(a.x,a.y);await page.mouse.down();
 for(let i=1;i<=14;i++){const t=i/14;await page.mouse.move(a.x+(c.x-a.x)*t+Math.sin(t*Math.PI)*18,a.y+(c.y-a.y)*t);await page.waitForTimeout(16);}
 await page.waitForTimeout(120);
 const aim=await page.evaluate(()=>window.__passPuzzle.scene.debug());
 assert(aim.pathDots>3,'predicted path is drawn');assert(aim.receiverRing||aim.end,'path shows a receiver or an end marker');
 await page.screenshot({path:`${shots}/pass-puzzle-aim-${tag}.png`});
 // Hold still to lift it: the loft meter appears.
 await page.waitForTimeout(700);const loft=await page.evaluate(()=>{const m=document.querySelector('[class*="loft"]');return{active:m?.dataset.active,value:Number(getComputedStyle(m).getPropertyValue('--loft')||0)};});
 await page.screenshot({path:`${shots}/pass-puzzle-loft-${tag}.png`});
 // Cancel this stroke by releasing back on the ball (too short to kick).
 await page.mouse.move(a.x,a.y);await page.waitForTimeout(40);
 const threatProbe=await page.evaluate(()=>{const g=window.__passPuzzle,w=g.world,s=w.state;
  // Aim straight through a defender so the red rings must show.
  const d=s.defenders[0],b=s.ball.p;const k={kind:'pass-feet',target:{x:d.p.x+(d.p.x-b.x)*.3,z:d.p.z+(d.p.z-b.z)*.3},curl:0,loft:0,power:.6};return{d:g.scene.toScreen(d.p.x+(d.p.x-b.x)*.3,0,d.p.z+(d.p.z-b.z)*.3)};});
 const dpt=at(threatProbe.d);for(let i=1;i<=10;i++){await page.mouse.move(a.x+(dpt.x-a.x)*i/10,a.y+(dpt.y-a.y)*i/10);await page.waitForTimeout(16);}
 await page.waitForTimeout(100);const threat=await page.evaluate(()=>window.__passPuzzle.scene.debug());
 assert(threat.threatRings>0,'a defender on the line gets a red threat ring');
 // Threat preview: an arrow from the defender to where they reach the ball, a cross where it is stopped,
 // a red path, and the coach's live read naming the defender by shirt number.
 assert(threat.dangerArrows>0,'the threat defender gets a red arrow to the ball');assert.equal(threat.pathColor,'#ff6a4d','a blocked lane draws a red path');
 const laneTip=await page.locator('[data-lane]').first();assert.equal(await laneTip.getAttribute('data-lane'),'blocked','the lane read says blocked');assert.match(await laneTip.textContent(),/#\d+ can/,'the lane read names the defender');
 await page.screenshot({path:`${shots}/pass-puzzle-threat-${tag}.png`});
 await page.mouse.move(a.x,a.y);await page.mouse.up();
 await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.__passPuzzle.world.state.phase),'aiming','a stroke back to the ball does not kick');
 // A pass straight at a defender is cut out: tries left + the hint, then Try again.
 const naive=await page.evaluate(async()=>{const g=window.__passPuzzle,w=g.world,d=w.state.defenders[0].p,k={kind:'pass-space',target:{x:d.x,z:d.z},curl:0,loft:0,power:.5};const ok=g.kick(k);if(!ok)return {why:JSON.stringify({k,phase:w.state.phase})};const start=performance.now();while(w.state.phase!=='success'&&w.state.phase!=='fail'&&performance.now()-start<20000)await new Promise(r=>setTimeout(r,40));return w.state.result??{phase:w.state.phase,ev:w.drain().map(e=>e.type),tick:w.state.tick};});
 assert.equal(naive.outcome,'fail','the naive option fails: '+JSON.stringify(naive));
 await page.getByText('Not this time.').waitFor();await page.getByText(/2 TRIES LEFT/).waitFor();
 assert(await page.locator('[class*="hint"]').count()>0,'fail card shows the hint');
 assert.match(await page.locator('[data-why]').first().textContent(),/#\d+|defender|keeper/i,'the fail card says who stopped it');
 // Tier-2 hint: "Show me where" marks the next pass of the coach's route on the pitch for the next try.
 await page.getByRole('button',{name:/Show me where/}).click();
 await page.screenshot({path:`${shots}/pass-puzzle-fail-${tag}.png`});
 await page.waitForTimeout(1500);const failRest=Number(await canvas.getAttribute('data-frames'));await page.waitForTimeout(500);assert.equal(Number(await canvas.getAttribute('data-frames')),failRest,'fail card sleeps');
 await page.getByRole('button',{name:'Try again'}).click();await page.waitForFunction(()=>{const s=window.__passPuzzle.world.state;return s.phase==='aiming'&&s.attempt===2;});
 await page.waitForFunction(()=>window.__passPuzzle.scene.debug().hint);
 // Solve the level with its solution kicks, fed through the real kick path.
 const solved=await page.evaluate(async()=>{const g=window.__passPuzzle,w=g.world,sol=g.solution?.(w.scenario.id);if(!sol)return{skipped:true};
  const wait=async(ok,ms=15000)=>{const start=performance.now();while(!ok()&&performance.now()-start<ms)await new Promise(r=>setTimeout(r,40));};
  for(const k of sol){await wait(()=>w.state.phase!=='windup'&&w.state.phase!=='flight');if(w.state.phase!=='aiming')break;const before=w.state.tick;if(!g.kick(k))break;await wait(()=>w.state.tick!==before||w.state.phase!=='aiming',3000);}
  const start=performance.now();while(w.state.phase!=='success'&&w.state.phase!=='fail'&&performance.now()-start<20000)await new Promise(r=>setTimeout(r,50));return{phase:w.state.phase,result:w.state.result};});
 assert.equal(solved.phase,'success','the solution completes the level');
 await page.getByText('That’s the move!').waitFor();await page.waitForTimeout(300);
 assert(await page.locator('[data-why] li').count()>0,'the success card explains why the pass worked');
 await page.screenshot({path:`${shots}/pass-puzzle-success-${tag}.png`});
 const stars=await page.evaluate(()=>JSON.parse(localStorage.getItem('fi2-pass-puzzles-v1')).stars);assert(Object.values(stars)[0]>=1,'stars saved');
 // The result screen stops rendering fully.
 await page.waitForTimeout(1500);const rest=Number(await canvas.getAttribute('data-frames'));await page.waitForTimeout(600);assert.equal(Number(await canvas.getAttribute('data-frames')),rest,'result screen sleeps '+await canvas.getAttribute('data-wake'));
 // Watch again: slow-motion replay with the camera pushing in on the key moment.
 await page.getByRole('button',{name:/Watch again/}).click();await page.getByText('Replay · 0.38×').waitFor();
 await page.waitForFunction(()=>window.__passPuzzle.scene.debug().zoom>1.02,null,{timeout:30000});
 await page.screenshot({path:`${shots}/pass-puzzle-replay-${tag}.png`});
 const speed=await page.evaluate(()=>window.__passPuzzle.replay?.speed);assert.equal(speed,.38);
 assert.match(await page.locator('[data-replay-call]').textContent({timeout:20000}),/#\d+/,'the replay calls the play by shirt number');
 await page.getByText('That’s the move!').waitFor({timeout:40000});
 await page.waitForTimeout(1500);const after=Number(await canvas.getAttribute('data-frames'));await page.waitForTimeout(500);assert.equal(Number(await canvas.getAttribute('data-frames')),after,'sleeps after replay');
 // Back to the list shows the stars.
 await page.getByRole('button',{name:'All puzzles'}).last().click();await page.locator('[data-level]').first().waitFor();
 assert.match(await page.locator('[data-level]').first().getAttribute('aria-label'),/[123] of 3 stars/);
 assert.deepEqual(errors,[],'no console errors');
 console.log('PASS_PUZZLE_ARCADE_PASS',JSON.stringify({mobile,aim,loft,threat:threat.threatRings,result:solved.result,stars}));
 await page.close();
}
(async()=>{const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-gl=angle'],executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{const only=process.argv.includes('--mobile')?[true]:process.argv.includes('--desktop')?[false]:[true,false];for(const m of only)await run(browser,m);}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
