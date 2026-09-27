// Ordinary input playthrough: reads state to choose a route, never mutates it.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const mobile=process.argv.includes('--mobile'),returnMode=process.argv.includes('--returns'),walletMode=process.argv.includes('--wallet');
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));
  await page.goto((process.env.FUTBOL_BASE_URL||'http://localhost:8092')+'/arcade?game=runner');await page.waitForFunction(()=>window.__arcade3d,null,{timeout:90000});
  await page.getByRole('button',{name:'Play',exact:true}).click();
  const cdp=await page.context().newCDPSession(page),events=[];let event=-1,laneChanges=0,defenderTravel=0,committedDefenders=0,returns=0,returnShotAt=-100,returnLane=0;
  for(let i=0;i<250;i++){
   const s=await page.evaluate(()=>{const r=window.__arcade3d.runtime.state.runner;return{lane:r.lane,x:r.x,lives:r.lives,balls:r.balls,event:r.event,eventKind:r.eventKind,time:r.time,returning:r.shots.some(p=>p.active&&(p.returner||p.returning)),activeShots:r.shots.some(p=>p.active),message:r.message,objects:r.objects.filter(o=>!o.passed&&o.z<0)};});
   for(const o of s.objects)if(o.kind==='defender'){defenderTravel=Math.max(defenderTravel,Math.abs((o.x??o.lane*2.4)-o.lane*2.4));if((o.read??0)>.45)committedDefenders++;}
   if(s.event!==event){event=s.event;events.push(s.message);if(s.eventKind==='block'){returns++;returnLane=s.lane===1?0:1;}}if(s.lives<=0)break;
   const goal=s.objects.find(o=>o.kind==='goal'&&o.z>-34);
   const coin=s.objects.filter(o=>o.kind==='coin').sort((a,b)=>b.z-a.z)[0];
   const returningTarget=returnMode?s.objects.find(o=>o.kind==='defender'&&o.z< -25&&o.z> -39):null;
   let lane=returnMode&&s.returning?returnLane:returningTarget?.lane??goal?.openLane??coin?.lane??s.lane;
   const danger=s.objects.find(o=>o.kind!=='coin'&&o.kind!=='goal'&&o.lane===lane&&o.z>-11);
   if(danger&&!goal&&!returningTarget&&!s.returning)lane=[0,-1,1].find(l=>!s.objects.some(o=>o.kind!=='coin'&&o.kind!=='goal'&&o.lane===l&&o.z>-15))??lane;
   if(lane!==s.lane){
    laneChanges++;const direction=Math.sign(lane-s.lane);
    if(mobile){
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:400}]});
     await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190+direction*65,y:400}]});
     await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }else await page.keyboard.press(direction>0?'ArrowRight':'ArrowLeft');
   }
   if(returnMode&&returningTarget&&!s.returning&&s.balls>0&&Math.abs(s.x-returningTarget.lane*2.4)<.3&&s.time-returnShotAt>1){returnShotAt=s.time;if(mobile)await page.getByRole('button',{name:'Shoot',exact:true}).tap();else await page.keyboard.press('Space');}
   if(!returnMode&&goal&&goal.z>-21&&s.balls>0&&Math.abs(s.x-goal.openLane*2.4)<.5){
    if(mobile)await page.getByRole('button',{name:'Shoot',exact:true}).tap();else await page.keyboard.press('Space');
   }
   if(walletMode){const earned=await page.evaluate(()=>{const v=JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')??'null');return Object.values(v?.runs??{}).filter(r=>r.game==='runner').reduce((n,r)=>n+r.paid,0);});if(earned>=3&&i>70)break;}
   if(returnMode&&returns>0&&!s.activeShots){await page.screenshot({path:`/tmp/breakaway-return-play-${mobile?'mobile':'desktop'}.png`});break;}
   if(!returnMode&&(i===20||i===60||i===115))await page.screenshot({path:`/tmp/breakaway-play-${mobile?'mobile':'desktop'}-${i}.png`});
   await page.waitForTimeout(150);
  }
  const result=await page.evaluate(()=>{const r=window.__arcade3d.runtime.state.runner;return{score:r.score,goals:r.goals,lives:r.lives,distance:r.distance,combo:r.combo};});
  if(walletMode){await page.waitForFunction(()=>{const w=JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')??'null');return Object.values(w?.runs??{}).some(r=>r.game==='runner'&&r.paid>0);});const earned=await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')).runs).reduce((n,r)=>n+r.paid,0));assert(earned>0&&earned<=12);await page.getByRole('button',{name:'Pause game'}).click();await page.getByRole('button',{name:'Back to arcade',exact:true}).click();await page.getByRole('button',{name:'Coins',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Your coins'});await dialog.waitFor();assert(await dialog.getByText(`${earned} earned by playing`,{exact:true}).isVisible());await page.waitForTimeout(400);await page.screenshot({path:`/tmp/arcade-wallet-earned-${mobile?'mobile':'desktop'}.png`});await page.reload();await page.getByRole('button',{name:'Coins',exact:true}).click();assert(await page.getByRole('dialog',{name:'Your coins'}).getByText(`${earned} earned by playing`,{exact:true}).isVisible());assert.deepEqual(errors,[]);console.log('ARCADE_WALLET_ORDINARY_PLAY_PASS',JSON.stringify({mobile,earned,result,laneChanges,persisted:true}));return;}
  if(returnMode){assert(returns>0,'ordinary shots provoke a defender return');assert(result.lives>0,'ordinary player survives return');assert.deepEqual(errors,[]);console.log('BREAKAWAY_RETURN_PLAY_PASS',JSON.stringify({mobile,returns,result,events}));return;}
  assert(defenderTravel>.6&&committedDefenders>0,'ordinary run includes visible committed defender movement');assert(result.goals>=2,'ordinary controls can score repeated goals');assert(laneChanges>=3,'route requires deliberate lane changes');assert(events.some(m=>m.startsWith('PERFECT FINISH')),'deliberate timing achieves the precision bonus');
  if(process.argv.includes('--failure')){
   // Stop reacting to the defensive lines, then retry through the real menu.
   await page.getByRole('button',{name:'Play again',exact:true}).waitFor({timeout:120000});
   await page.getByRole('button',{name:'Play again',exact:true}).click();
   await page.waitForFunction(()=>{const r=window.__arcade3d.runtime.state.runner;return r.lives===3&&r.score===0&&r.distance<10;});
  }
  assert.deepEqual(errors,[]);console.log('BREAKAWAY_PLAY_PASS',JSON.stringify({mobile,result,laneChanges,defenderTravel,committedDefenders,finishes:events.filter(m=>m.includes('FINISH')||m.startsWith('GOAL')),naturalFailure:process.argv.includes('--failure')}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
