const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
// Nov 10 2026: the server comes from --port=<n>, PORT or FUTBOL_BASE_URL; there is no default (8092 is the owner's dev server).
const portArg=(process.argv.find(a=>a.startsWith('--port='))||'').slice(7)||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(portArg?`http://localhost:${portArg}`:'');
if(!BASE){console.error('Pass your own server: --port=<port>, PORT=<port> or FUTBOL_BASE_URL=<url>. There is no default port.');process.exit(1);}
// --landscape (Nov 10 2026): Pinball is upright-only on phones, so a sideways phone (touch, 500 px or shorter) now gets RotateLock's
// "turn your phone upright" card over the game and Play cannot be tapped. The landscape run therefore uses the shortest touch window the
// game still serves sideways (900x510: past RotateLock's 500 px limit, inside the short-landscape chrome tuning at 520 px).
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const landscape=process.argv.includes('--landscape'),mobile=landscape||process.argv.includes('--mobile'),page=await browser.newPage({viewport:landscape?{width:900,height:510}:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,reducedMotion:process.argv.includes('--reduced')?'reduce':'no-preference'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{fixture:{game:'island',paid:30,reason:'playtest entry',at:1}},packs:[]}));});
 await page.goto(new URL('/arcade?game=pinball',BASE).href,{waitUntil:'domcontentloaded',timeout:90000});await page.getByRole('button',{name:/^play/i}).first().click();
 await page.waitForFunction(()=>window.__arcade3d?.phaseRef.current==='playing');
 // These are physics / pose fixtures stepped frame by frame: switch the round-3 cinematic slow-mo off so a fixture's
 // sim time is exactly what it asks for (beats are covered by tests/pinball-r3-oct26.cjs + scripts/qa-pinball-r3-browser.cjs).
 await page.evaluate(()=>{window.__arcade3d.runtime.pinballCinema.enabled=false;});
 const canvas=page.locator('[data-arcade-kind="pinball"]>canvas');await canvas.focus();
 // Framing: the whole table (goal crossbar to drain) sits between the HUD and the message, and is not a tiny island.
 const framing=await page.evaluate(()=>{const g=window.__arcade3d.runtime,c=g.stage.camera,r=document.querySelector('[data-arcade-kind="pinball"]>canvas').getBoundingClientRect(),V=g.stage.scene.position.constructor,xs=[],ys=[];for(const [x,y,z] of [[-6.4,0,-10.6],[6.4,0,-10.6],[-6.4,0,10.6],[6.4,0,10.6],[0,2.1,-8.8]]){const p=new V(x,y,z).project(c);xs.push((p.x+1)/2*r.width);ys.push((1-p.y)/2*r.height);}const header=document.querySelector('[data-arcade-kind="pinball"] header').getBoundingClientRect().bottom,message=document.querySelector('[data-arcade-kind="pinball"] p')?.getBoundingClientRect().top??r.height;const py=(x,y,z)=>(1-new V(x,y,z).project(c).y)/2*r.height;return{width:Math.max(...xs)-Math.min(...xs),top:Math.min(...ys),bottom:Math.max(...ys),header,message,view:r.width,height:r.height,goal:py(0,2.1,-8.8),tips:py(0,0,8.9),drain:py(0,.1,9.87),padTop:Math.min(...[...document.querySelectorAll('[data-pinball-pad]')].map(e=>e.getBoundingClientRect().top)),
   /* Pass 3 (Nov 10 2026): what the player must always see: the crossbar and both posts' tops, both flipper tips and the gap between them (table 155..205, 563), against the real DOM boxes of the display and the controls. */
   points:[[-2.67,2.1,-8.8],[0,2.1,-8.8],[2.67,2.1,-8.8],[(155.4-180)/30,.3,(563-310)/30],[0,.3,(563-310)/30],[(204.6-180)/30,.3,(563-310)/30]].map(([x,y,z])=>{const p=new V(x,y,z).project(c);return[(p.x+1)/2*r.width+r.left,(1-p.y)/2*r.height+r.top];}),
   boxes:['[data-pinball-dmd]','[data-pinball-pad=left]','[data-pinball-pad=right]','[data-pinball-launch]','[data-arcade-kind="pinball"] header button'].flatMap(q=>[...document.querySelectorAll(q)]).map(e=>{const b=e.getBoundingClientRect();return[b.left,b.top,b.right,b.bottom];})};});
 // Nov 10 2026: repointed to the machine camera's own contract (lib/games/soccerPinballCamera.ts): the goal crossbar sits under the top
 // bar's row (its safeTop line is 6 px above the bar's foot) and the flipper tips stay on screen above the bottom edge; the far corners
 // and the drain strip are allowed off-frame, and the old message line under the table no longer exists (the calls are on the display).
 // Pass 3 (Nov 10 2026) corrects the landscape-only assertion written in the overlay pass (goal >= header - 14, tips <= height - 18): it let
 // the crossbar sit behind the display (whose foot is below the header's on a short sideways phone) and never looked at the Launch button
 // over the flipper gap. The contract, in EVERY mode (desktop, --mobile, --landscape, --reduced): the goal's crossbar is on screen and
 // not under the dot-matrix display or a top-bar button, and both flipper tips and the gap between them are on screen and not under a
 // flipper button or the Launch / Nudge button (lib/games/soccerPinballCamera.ts holds the same two lines through every push).
 {const hit=framing.points.map(([x,y],i)=>x<0||x>framing.view||y<0||y>framing.height?'off-screen':framing.boxes.some(([l,t,rr,b])=>x>=l&&x<=rr&&y>=t&&y<=b)?'covered':'').map((v,i)=>v?['left post','crossbar','right post','left tip','flipper gap','right tip'][i]+' '+v:'').filter(Boolean);
  assert.deepEqual(hit,[],'goal below the display, flipper tips and gap above the controls: '+JSON.stringify(framing));
  const dmdFoot=Math.max(0,...framing.boxes.filter(([l,t,rr])=>l<framing.points[1][0]&&rr>framing.points[1][0]&&t<framing.points[1][1]).map(b=>b[3]));assert(framing.points[1][1]>=dmdFoot,'crossbar below the foot of the display: '+JSON.stringify(framing));}
 // Comic pass (owner, Nov 10 2026: "see more of the bottom of the pinball machine and less of the sign at the top"; "the sign is not as
 // important and taking up a lot of space"): no display band. The score is a chip in the top bar row, the goal sits right under the top bar's
 // foot, and on an upright phone the drain mouth and clear room under the flipper tips are in view above the pads.
 {const display=await page.evaluate(()=>{const e=document.querySelector('[data-pinball-dmd]');return e?e.getBoundingClientRect().bottom:0;});assert(display<=framing.header+6,'the status tab stays in the top bar row (its foot is the solver top line): '+display+' vs '+framing.header);
  assert(framing.goal<=framing.header+framing.height*.09+8,'the table starts right under the top bar: '+JSON.stringify(framing));
  if(mobile&&!landscape){assert(framing.drain<=framing.padTop,'drain mouth in view above the pads: '+JSON.stringify(framing));assert(framing.padTop-framing.tips>=framing.height*.05,'clear room under the flipper tips: '+JSON.stringify(framing));}}
 if(landscape)assert(framing.width>=framing.view*.3,'landscape table is not a tiny island: '+JSON.stringify(framing));console.log('PINBALL_FRAMING',JSON.stringify(framing));
 await page.waitForTimeout(150);const readyFrame=await canvas.getAttribute('data-frames');await page.waitForTimeout(350);assert.equal(await canvas.getAttribute('data-frames'),readyFrame,'ready table sleeps until input');
 const leftButton=page.getByRole('button',{name:'Left flipper',exact:true});await leftButton.focus();await page.keyboard.down('Enter');await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.left===1);await page.keyboard.up('Enter');await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.left===0);await canvas.focus();
 if(mobile){
  const client=await page.context().newCDPSession(page),left=await page.getByRole('button',{name:'Left flipper',exact:true}).boundingBox(),right=await page.getByRole('button',{name:'Right flipper',exact:true}).boundingBox();
  const fingers=[{x:left.x+left.width/2,y:left.y+left.height/2,id:1},{x:right.x+right.width/2,y:right.y+right.height/2,id:2}];
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:fingers});
  await page.waitForFunction(()=>{const s=window.__arcade3d.runtime.state.pinball;return s.left===1&&s.right===1;});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[fingers[0]]});
  await page.waitForFunction(()=>{const s=window.__arcade3d.runtime.state.pinball;return s.left===0&&s.right===1;});
  await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  await page.waitForFunction(()=>{const s=window.__arcade3d.runtime.state.pinball;return s.left===0&&s.right===0;});
  await client.detach();
 }

 if(mobile){const r=await page.getByRole('button',{name:'Launch',exact:true}).boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);}else await page.keyboard.press('Space');
 await page.waitForTimeout(250);const launch=await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.pinball;return{phase:s.phase,y:s.ball.y,power:s.launchPower};});assert.equal(launch.phase,'playing');assert(launch.y<585);
 if(process.argv.includes('--possession')){
  // Controlled incoming soft ball; the entire receive/pass/shot exchange runs in real time.
  await page.evaluate(()=>{const r=window.__arcade3d.runtime;r.reset();const s=r.state.pinball;s.phase='playing';s.defs=3;s.openingRescue=false;Object.assign(s.ball,{x:94,y:199,vx:0,vy:-100});});
  await canvas.focus();await page.keyboard.press('KeyA');
  await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.possession===1);
  await page.screenshot({path:`/tmp/pinball-possession-${mobile?'mobile':'desktop'}.png`});
  await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.cue==='pass');
  await page.screenshot({path:`/tmp/pinball-pass-${mobile?'mobile':'desktop'}.png`});
  await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.attackPasses===2,{},{timeout:5000});
  await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.cue==='attack',{},{timeout:5000});
  const shot=await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.pinball;return{y:s.ball.y,vy:s.ball.vy,passes:s.attackPasses,owner:s.possession};});assert(shot.vy>0&&shot.owner===-1,'counter shot travels down-table');
  await page.screenshot({path:`/tmp/pinball-counter-${mobile?'mobile':'desktop'}.png`});
  const ready=await page.waitForFunction(()=>{const s=window.__arcade3d.runtime.state.pinball;return s.ball.y>430&&s.ball.vy>0?s.ball.x<180?'left':'right':false;},{},{timeout:5000});
  const side=await ready.jsonValue(),button=page.getByRole('button',{name:side==='left'?'Left flipper':'Right flipper',exact:true});
  await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.ball.y>505);
  if(mobile){const box=await button.boundingBox();await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);}else await page.keyboard.press(side==='left'?'KeyA':'KeyD');
  await page.waitForTimeout(150);const returned=await page.evaluate(()=>window.__arcade3d.runtime.state.pinball.sfx.flipper);assert(returned>0,'player can return a defender counter-shot');
  await page.getByRole('button',{name:'Pause game'}).click();await page.waitForTimeout(250);const frame=await canvas.getAttribute('data-frames');await page.waitForTimeout(350);assert.equal(await canvas.getAttribute('data-frames'),frame);
  assert.deepEqual(errors,[]);console.log('PINBALL_POSSESSION_BROWSER_PASS',JSON.stringify({mobile,shot,returned}));return;
 }
 await canvas.focus();await page.keyboard.down('KeyA');await page.keyboard.down('KeyD');await page.waitForTimeout(100);assert.deepEqual(await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.pinball;return[s.left,s.right];}),[1,1]);await page.keyboard.up('KeyA');await page.keyboard.up('KeyD');await page.waitForTimeout(180);assert.deepEqual(await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.pinball;return[s.left,s.right];}),[0,0]);
 // Put a falling ball between the flippers, then exercise the real input edge.
 await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.pinball;Object.assign(s.ball,{x:180,y:530,vx:0,vy:150});s.nudges=1;s.nudgeCooldown=0;});
 await canvas.focus();await page.keyboard.down('Space');
 assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.pinball.nudges),0,'nudge fires on key down, before release');
 await page.keyboard.up('Space');
 await page.evaluate(()=>window.__arcade3d.runtime.reset());
 await page.keyboard.down('Space');await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.plunger>.2);
 await page.getByRole('button',{name:'Pause game'}).click();await page.keyboard.up('Space');
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__arcade3d.runtime.state.pinball.phase),'ready','pause cancels a held launch');
 await canvas.focus();await page.keyboard.press('Space');
 const combination=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball,idle={x:0,y:0,left:false,right:false,charge:false};g.reset();g.action(2);Object.assign(s.ball,{x:145,y:540,vx:0,vy:100});for(let i=0;i<9;i++)g.update(1/120,{...idle,left:true});for(let i=0;i<18;i++)g.update(1/120,idle);Object.assign(s.ball,{x:215,y:540,vx:0,vy:100});for(let i=0;i<9;i++)g.update(1/120,{...idle,right:true});s.defs=3;g.update(1/120,idle);g.stage.render();return{combo:s.combination,lit:s.moveTime>0,score:s.score,cue:s.cue,message:g.hud().message,calls:g.stage.renderer.info.render.calls,finite:Number.isFinite(s.ball.x+s.ball.y+s.ball.vx+s.ball.vy)};});assert.equal(combination.combo,2);assert(combination.score>=50&&combination.finite);assert.ok(combination.lit,'two feet light the goal');assert.ok(combination.message.length>0,'the tip row coaches the finish');
 // The lit-goal window (was the "FINISH! 14s" HUD line; the feel layer's coach lines replaced that copy). Check the
 // state the line reports and that the tip row shows a live message, not a word that may change again.
 await page.waitForFunction(()=>{const r=window.__arcade3d.runtime;return r.state.pinball.moveTime>0&&r.hud().message.length>0&&!!document.querySelector('[data-arcade-kind="pinball"] p')?.textContent;});
 await page.screenshot({path:`/tmp/fi-pinball-${mobile?'mobile':'desktop'}.png`});
 // Motion fixtures validate consequence poses separately from real-input play.
 const dazed=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball,idle={x:0,y:0,left:false,right:false,charge:false};g.reset();g.action(2);g.update(1/120,idle);const d=s.defenders[0];s.defenderAI[0].cooldown=1;Object.assign(s.ball,{x:d.x,y:d.y+22,vx:0,vy:-400});for(let i=0;i<30;i++)g.update(1/120,idle);/* +10 frames cover the knock-down hit-stop */g.stage.render();const stars=g.stage.scene.getObjectByName('pinball-dazed-0'),body=g.stage.scene.getObjectByName('pinball-defender-0').getObjectByName('arcade-body-offset');return{timer:s.defenderAI[0].dazed,stars:stars.visible,count:stars.children.length,fall:body.rotation.x,keeperStars:!!g.stage.scene.getObjectByName('pinball-dazed-keeper')};});assert(dazed.timer>1.5&&dazed.stars&&dazed.count===3&&dazed.fall< -1,'body hit knocks defender down with three stars');assert.equal(dazed.keeperStars,false);
 await page.screenshot({path:`/tmp/fi-pinball-dazed-${mobile?'mobile':'desktop'}.png`});
 await page.evaluate(()=>{window.__arcade3d.runtime.state.pinball.phase='ready';});
 await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.defenderAI[0].dazed===0);
 const recovered=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball;return{timer:s.defenderAI[0].dazed,stars:g.stage.scene.getObjectByName('pinball-dazed-0').visible};});assert.equal(recovered.timer,0);assert.equal(recovered.stars,false,'stars disappear after real-time recovery');await canvas.focus();await page.keyboard.press('Space');
 const diveMotion=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball,idle={x:0,y:0,left:false,right:false,charge:false};g.reset();g.action(2);Object.assign(s.ball,{x:216,y:150,vx:0,vy:-500});for(let i=0;i<24;i++)g.update(1/120,idle);const keeper=g.stage.scene.getObjectByName('pinball-keeper');g.stage.render();const pelvis=keeper.getObjectByName('player-pelvis');/* Pass 3: the keeper is a machine figure: a committed dive is a rigid lunge of the whole figure on its mount (root roll), not a flying body (pelvis roll). */return{roll:keeper.rotation.z,lift:pelvis.position.y,commit:s.keeperCommit,bean:keeper.getObjectByName('bean-body')?.visible};});assert(Math.abs(diveMotion.roll)>.3&&Number.isFinite(diveMotion.lift)&&diveMotion.commit>0&&diveMotion.bean,'keeper leaves upright stance for a committed dive');
 await page.screenshot({path:`/tmp/fi-pinball-dive-${mobile?'mobile':'desktop'}.png`});
 const impactMotion=await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball,idle={x:0,y:0,left:false,right:false,charge:false};s.phase='playing';Object.assign(s.ball,{x:24,y:360,vx:-650,vy:0});for(let i=0;i<4;i++)g.update(1/120,idle);return document.querySelector('[data-arcade-kind="pinball"]>canvas').style.transform;});if(process.argv.includes('--reduced'))assert.equal(impactMotion,'','reduced motion suppresses table vibration');else assert.match(impactMotion,/translate/,'rail impact vibrates table');
 const saveMotion=[];
 await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball;Object.assign(s.ball,{x:215,y:170,vx:0,vy:-500});s.phase='playing';s.keeper=s.keeperTarget=215;s.keeperVelocity=0;s.keeperCommit=0;s.keeperDive=0;s.keeperThink=.3;s.sfx.keeper=0;});
 for(let i=0;i<2;i++){if(i)await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.sfx.keeper>0);else await page.waitForTimeout(30);saveMotion.push(await page.evaluate(()=>{const g=window.__arcade3d.runtime,k=g.stage.scene.getObjectByName('pinball-keeper').getObjectByName('player-pelvis');return{bodyX:k.rotation.x,bodyY:k.position.y,saves:g.state.pinball.sfx.keeper};}));await page.screenshot({path:`/tmp/fi-pinball-save-${mobile?'mobile':'desktop'}-${i}.png`});}
 assert(saveMotion[1].saves>0,'keeper fixture produces a save');assert(saveMotion.every(v=>Number.isFinite(v.bodyX+v.bodyY)),'save pose is finite');
 const goalMotion=[];
 await page.evaluate(()=>{const g=window.__arcade3d.runtime,s=g.state.pinball;Object.assign(s.ball,{x:118,y:49,vx:0,vy:-400});s.phase='playing';g.update(1/120,{x:0,y:0,left:false,right:false,charge:false});});
 for(let i=0;i<3;i++){if(i)await page.waitForTimeout(i===1?100:180);goalMotion.push(await page.evaluate(()=>{const g=window.__arcade3d.runtime,net=g.stage.scene.getObjectByName('pinball-net'),ball=g.stage.scene.getObjectByName('pinball-ball'),a=net.geometry.attributes.position.array;let depth=0;for(let j=2;j<a.length;j+=3)depth=Math.min(depth,a[j]);return{depth,z:ball.position.z,y:ball.position.y};}));await page.screenshot({path:`/tmp/fi-pinball-goal-${mobile?'mobile':'desktop'}-${i}.png`});}
 if(process.argv.includes('--reduced'))assert(goalMotion.every(v=>v.depth> -1.11),'reduced net stays still');else assert(goalMotion.some(v=>v.depth< -1.11),'goal flexes the net');assert(goalMotion.every(v=>Number.isFinite(v.z+v.y)),'goal recovery stays finite');if(process.argv.includes('--reduced'))assert.equal(goalMotion[1].z,goalMotion[2].z,'reduced goal ball stays still after scoring');else assert.notEqual(goalMotion[0].z,goalMotion[1].z,'goal ball settles into net');
 await page.getByRole('button',{name:'Pause game'}).click();await page.waitForTimeout(150);const frame=await canvas.getAttribute('data-frames');await page.waitForTimeout(350);assert.equal(await canvas.getAttribute('data-frames'),frame,'paused renderer sleeps');
 await page.getByRole('button',{name:'Resume',exact:true}).click();await page.waitForTimeout(150);assert.notEqual(await canvas.getAttribute('data-frames'),frame,'resume wakes renderer');
 // Return to the plunger without replacing the state object observed by the controller.
 await page.evaluate(()=>window.__arcade3d.runtime.reset());await canvas.focus();await page.keyboard.press('KeyA');await page.getByRole('button',{name:'Launch',exact:true}).focus();await page.keyboard.down('Space');
 await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.plunger>=.35);
 const heldPower=await page.evaluate(()=>window.__arcade3d.runtime.state.pinball.plunger);await page.keyboard.up('Space');
 await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.phase==='playing');
 const chargedPower=await page.evaluate(()=>window.__arcade3d.runtime.state.pinball.launchPower);assert(chargedPower>=.13&&chargedPower<.68,'held launch selects a deliberate soft pass');
 await page.getByRole('button',{name:'Pause game'}).click();await page.locator('[data-arcade-paused] [data-arcade-exit]').click();// the pause card's exit reads "Arcade" (shared pause card)
 await page.waitForFunction(()=>!window.__arcade3d);assert.equal(await page.locator('[data-arcade-kind="pinball"]').count(),0,'exit releases the game');
 assert.deepEqual(errors,[]);console.log('SOCCER_PINBALL_BROWSER_PASS',JSON.stringify({mobile,launch,combination,dazed,diveMotion,saveMotion,goalMotion,pauseFrame:frame,readyFrame,heldPower,chargedPower,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
