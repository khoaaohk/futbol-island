const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
const captureTag=process.argv.find(arg=>arg.startsWith('--capture='))?.slice(10)||'motion';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const mobile=process.argv.includes('--mobile'),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));
 await page.goto(new URL('/arcade?game=tennis',process.env.FUTBOL_BASE_URL||'http://localhost:8092').href);
 await page.getByRole('button',{name:'Play',exact:true}).click();
 await page.waitForFunction(()=>window.__arcade3d?.phaseRef.current==='playing');
 const canvas=page.locator('[data-arcade-kind="tennis"] canvas');
 if(mobile){
  for(const action of ['header','scissor','kick','lob','drop']){const box=await page.locator(`[data-tennis-action="${action}"]`).boundingBox();assert(box&&box.width>=44&&box.height>=44,`${action} touch target is at least 44px`);assert(box.x>=0&&box.y+box.height<=844,`${action} remains inside mobile viewport`);}
  const stick=await page.getByRole('group',{name:'Movement joystick'}).boundingBox(),cdp=await page.context().newCDPSession(page);
  const touch={x:stick.x+stick.width*.82,y:stick.y+stick.height/2,id:1};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});await page.waitForTimeout(250);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});await page.waitForTimeout(100);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  assert.equal(await page.evaluate(()=>window.__arcade3d.input.current.x),0,'canceled touch clears movement');
  assert.equal(await page.getByRole('group',{name:'Movement joystick'}).evaluate(el=>el.style.getPropertyValue('--stick')),'translate(0,0)','canceled touch recenters thumb feedback');await cdp.detach();
 }else{await page.keyboard.down('KeyD');await page.waitForTimeout(250);await page.keyboard.up('KeyD');}
 await page.waitForFunction(()=>window.__arcade3d.runtime.state.tennis.you.vx===0);await page.waitForTimeout(250);
 const stopped=await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.tennis;return {x:s.you.x,vx:s.you.vx,frames:document.querySelector('[data-arcade-kind="tennis"] canvas').dataset.frames};});assert(stopped.x>.3&&stopped.x<4.5);assert.equal(stopped.vx,0);
 await page.waitForTimeout(300);assert.equal(await canvas.getAttribute('data-frames'),stopped.frames,'settled serve loop sleeps');
 if(mobile)await page.getByRole('button',{name:'Serve',exact:true}).tap();else await page.keyboard.press('Space');await page.waitForTimeout(700);
 const rally=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.tennis;return{phase:s.phase,kicks:s.kickCount,finite:Number.isFinite(s.ball.x+s.ball.y+s.ball.z),calls:g.stage.renderer.info.render.calls};});assert.equal(rally.phase,'rally');assert(rally.kicks>0&&rally.finite);
 await page.screenshot({path:`/tmp/fi-tennis-${mobile?'mobile':'desktop'}.png`});
 await page.getByRole('button',{name:'Pause game'}).click();await page.waitForTimeout(150);const frame=await canvas.getAttribute('data-frames');await page.waitForTimeout(300);assert.equal(await canvas.getAttribute('data-frames'),frame,'paused renderer sleeps');assert.deepEqual(errors,[]);
 if(process.argv.includes('--volley')){
  await page.getByRole('button',{name:'Resume',exact:true}).click();await canvas.focus();
  await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.tennis;s.phase='rally';s.aiReaction=99;s.queuedKick=0;Object.assign(s.you,{x:0,y:5.3,targetX:0,targetY:5.3,vx:0,vy:0,moveX:0,moveY:0,direct:false,kick:0});Object.assign(s.ball,{x:.35,y:5.1,z:1.6,vx:0,vy:0,vz:-.1,last:'rival',crossed:true,bounces:0});});
  if(mobile)await page.getByRole('button',{name:/^(Serve|Kick)$/}).tap();else await page.keyboard.press('Space');
  await page.waitForFunction(()=>window.__arcade3d.runtime.state.tennis.you.kickStyle===2);
  const poses=[];for(let n=0;n<4;n++){poses.push(await page.evaluate(()=>{const g=window.__arcade3d.runtime,p=g.stage.scene.getObjectByName('tennis-player-you'),s=g.state.tennis;return{kick:s.you.kick,height:s.you.kickHeight,power:s.you.kickPower,hip:p.getObjectByName('left-hip').rotation.x,knee:p.getObjectByName('left-knee').rotation.x};}));await page.screenshot({path:`/tmp/fi-tennis-volley-${mobile?'mobile':'desktop'}-${n}.png`});await page.waitForTimeout(70);}
  assert(poses.every(p=>Object.values(p).every(Number.isFinite)));assert.deepEqual(errors,[]);console.log('SOCCER_TENNIS_VOLLEY_FIXTURE_PASS',JSON.stringify({mobile,poses}));return;
 }
 if(process.argv.includes('--play')||process.argv.includes('--aerial')){
  await page.getByRole('button',{name:'Resume',exact:true}).click();await canvas.focus();
  const cdp=mobile?await page.context().newCDPSession(page):null,stick=mobile?await page.getByRole('group',{name:'Movement joystick'}).boundingBox():null;let touching=false,held=[],incomingCaptured=false,sequenceCaptured=false,lastKick=0;const aerialActions=new Set();
  const steer=async(x,y)=>{
   if(mobile){if(Math.hypot(x,y)<.01){if(touching)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});touching=false;return;}
    await cdp.send('Input.dispatchTouchEvent',{type:touching?'touchMove':'touchStart',touchPoints:[{x:stick.x+stick.width/2+x*stick.width*.35,y:stick.y+stick.height/2+y*stick.height*.35,id:1}]});touching=true;
   }else{const next=[...(x>.2?['KeyD']:x<-.2?['KeyA']:[]),...(y>.2?['KeyS']:y<-.2?['KeyW']:[])];for(const key of held)if(!next.includes(key))await page.keyboard.up(key);for(const key of next)if(!held.includes(key))await page.keyboard.down(key);held=next;}
  };
  const started=Date.now();let result,lastView,lastScore=-1;
  while(Date.now()-started<240000){
   const v=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.tennis,guide=g.stage.scene.getObjectByName('tennis-landing');return{viewPhase:window.__arcade3d.phaseRef.current,phase:s.phase,server:s.server,you:{x:s.you.x,y:s.you.y},ball:{x:s.ball.x,y:s.ball.y,z:s.ball.z,vz:s.ball.vz,last:s.ball.last,crossed:s.ball.crossed,bounces:s.ball.bounces},land:guide?.visible?{x:guide.position.x,y:guide.position.z}:null,kickCount:s.kickCount,lastShot:s.lastShot,headerReady:g.hud().headerReady,scissorReady:g.hud().scissorReady,rally:s.rally,best:s.bestRally,clean:s.cleanReturns,score:s.score};});
   if(v.viewPhase==='paused'){await page.getByRole('button',{name:'Resume',exact:true}).click();continue;}
   assert.notEqual(v.phase,'ready','HMR replaced the active match; rerun on a stable server');
   lastView=v;if(v.score.you+v.score.rival!==lastScore){lastScore=v.score.you+v.score.rival;console.log('TENNIS_PLAY_POINT',JSON.stringify({mobile,score:v.score,best:v.best,clean:v.clean,seconds:Math.round((Date.now()-started)/1000)}));}
   if(v.phase==='over'){result=v;break;}
   let tx=0,ty=4.8;
   if(v.phase==='rally'&&v.ball.last==='rival'){tx=v.land?.x??v.ball.x;ty=v.land?.y??v.ball.y;}
   const practice=Date.now()-started<(process.argv.includes('--aerial')?180000:45000),dx=tx-v.you.x,dy=ty-v.you.y,d=Math.hypot(dx,dy),reach=Math.hypot(v.ball.x-v.you.x,v.ball.y-v.you.y),canReturn=v.phase==='rally'&&v.ball.last==='rival'&&v.ball.crossed&&v.ball.z<1.1&&reach<1;
   const special=process.argv.includes('--aerial')?(!aerialActions.has('header')&&v.headerReady?'header':!aerialActions.has('scissor')&&v.scissorReady?'scissor':null):null;
   await steer(practice&&d>.45?dx/Math.max(d,1):0,practice&&d>.45?dy/Math.max(d,1):0);
   if((v.phase==='serve'&&v.server==='you'||practice&&(canReturn||special))&&Date.now()-lastKick>350){await steer(0,0);
    const capture=process.argv.includes('--sequence')&&!sequenceCaptured&&canReturn;
    if(mobile)await page.getByRole('button',{name:special==='header'?'Header':special==='scissor'?'Scissor':/^(Serve|Kick)$/}).tap();else await page.keyboard.press(special==='header'?'KeyH':special==='scissor'?'KeyL':'Space');lastKick=Date.now();
    if(special){const happened=await page.waitForFunction(({before,shot})=>{const s=window.__arcade3d.runtime.state.tennis;return s.kickCount>before&&s.lastShot===shot&&s.ball.last==='you';},{before:v.kickCount,shot:special},{timeout:500}).then(handle=>{void handle.dispose();return true;},()=>false);if(happened){aerialActions.add(special);await page.waitForTimeout(60);await page.screenshot({path:`/tmp/fi-tennis-${special}-${mobile?'mobile':'desktop'}.png`});const contact=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.tennis,ring=g.stage.scene.getObjectByName('tennis-aerial-impact');return{shot:s.lastShot,speed:Math.hypot(s.ball.vx,s.ball.vy),color:ring.material.color.getHexString(),kick:s.you.kick,height:s.you.kickHeight};});console.log('TENNIS_REAL_AERIAL_CONTACT',JSON.stringify({mobile,contact}));if(aerialActions.size===2){await steer(0,0);await cdp?.detach();assert.deepEqual(errors,[]);console.log('SOCCER_TENNIS_AERIAL_INPUT_PASS',JSON.stringify({mobile,actions:[...aerialActions]}));return;}}}

    const confirmed=capture&&await page.waitForFunction(before=>window.__arcade3d.runtime.state.tennis.kickCount>before&&window.__arcade3d.runtime.state.tennis.ball.last==='you',v.kickCount,{timeout:500}).then(handle=>{void handle.dispose();return true;},()=>false);
    if(confirmed){sequenceCaptured=true;const frames=[];for(let n=1;n<=5;n++){await page.waitForTimeout(55);frames.push(await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.tennis,p=g.stage.scene.getObjectByName('tennis-player-you');return{time:s.clock,kick:s.you.kick,facing:p.rotation.y,ball:[s.ball.x,s.ball.y,s.ball.z],leg:p.getObjectByName('right-hip')?.rotation.x,knee:p.getObjectByName('right-knee')?.rotation.x,pose:p.userData.motion?{stride:p.userData.motion.stride,yaw:p.userData.motion.yaw}:null};}));await page.screenshot({path:`/tmp/fi-tennis-${captureTag}-${mobile?'mobile':'desktop'}-${n}.png`});}require('node:fs').writeFileSync(`/tmp/fi-tennis-${captureTag}-${mobile?'mobile':'desktop'}.json`,JSON.stringify(frames,null,2));if(process.argv.includes('--brief')){assert.deepEqual(errors,[]);console.log('SOCCER_TENNIS_SEQUENCE_PASS',JSON.stringify({mobile,captureTag,frames}));return;}}
   }
   if(!incomingCaptured&&v.phase==='rally'&&v.ball.last==='rival'&&v.ball.y>0){await page.screenshot({path:`/tmp/fi-tennis-incoming-${mobile?'mobile':'desktop'}.png`});if(process.argv.includes('--sequence'))require('node:fs').copyFileSync(`/tmp/fi-tennis-incoming-${mobile?'mobile':'desktop'}.png`,`/tmp/fi-tennis-${captureTag}-${mobile?'mobile':'desktop'}-0.png`);incomingCaptured=true;}
   await page.waitForTimeout(100);
  }
  await steer(0,0);await cdp?.detach();if(process.argv.includes('--aerial'))assert.equal(aerialActions.size,2,'ordinary input must execute both aerial actions');if(process.argv.includes('--brief'))assert(sequenceCaptured,'brief capture requires a confirmed physical return');assert(result,`ordinary-input match finishes: ${JSON.stringify(lastView)}`);assert(result.best>=3,'ordinary input sustains an exchange');assert(result.clean>0,'ordinary input achieves planted clean returns');
  await page.screenshot({path:`/tmp/fi-tennis-result-${mobile?'mobile':'desktop'}.png`});await page.getByRole('button',{name:'Play again',exact:true}).click();await page.waitForFunction(()=>window.__arcade3d.runtime.state.tennis.phase==='serve');
  assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.tennis.score.you+window.__arcade3d.runtime.state.tennis.score.rival),0);
  if(mobile)await page.getByRole('button',{name:'Serve',exact:true}).tap();else{await canvas.focus();await page.keyboard.press('Space');}
  await page.waitForFunction(()=>window.__arcade3d.runtime.state.tennis.score.rival>0,null,{timeout:30000});
  await page.screenshot({path:`/tmp/fi-tennis-missed-return-${mobile?'mobile':'desktop'}.png`});assert.deepEqual(errors,[]);console.log('SOCCER_TENNIS_REAL_INPUT_MATCH_PASS',JSON.stringify({mobile,result}));
 }
 console.log('SOCCER_TENNIS_BROWSER_PASS',JSON.stringify({mobile,stopped,rally}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
