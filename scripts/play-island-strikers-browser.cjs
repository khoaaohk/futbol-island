// Read-only observation drives ordinary controls; never injects match state.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const mobile=process.argv.includes('--mobile'),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));
 await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');await page.waitForFunction(()=>window.__fi2,null,{timeout:90000});await page.evaluate(()=>document.querySelector('[data-arcade-enter]').click());await page.getByRole('button',{name:/Island Strikers/}).click();if(mobile){await page.getByRole('heading',{name:'Turn sideways to play'}).waitFor();await page.setViewportSize({width:844,height:390});await page.getByRole('heading',{name:'Turn sideways to play'}).waitFor({state:'hidden'});}await page.getByRole('button',{name:'Kick off',exact:true}).click();await page.waitForFunction(()=>window.__fi2Live?.getElapsed()>.1);
 const cdp=await page.context().newCDPSession(page),touches=new Map(),keys=new Set();let charging=false,shotAt=0,passAt=-10,seenPasses=0;
 const joy=mobile?await page.getByRole('group',{name:'Move player',exact:true}).boundingBox():null;
 const shoot=mobile?await page.getByRole('button',{name:'Hold / Shoot',exact:true}).boundingBox():null;
 const sprint=mobile?await page.getByRole('button',{name:'Sprint',exact:true}).boundingBox():null;
 const pass=mobile?await page.getByRole('button',{name:'Pass / tackle',exact:true}).boundingBox():null;
 async function touch(id,point){const had=touches.has(id);if(point)touches.set(id,{id,...point});else touches.delete(id);await cdp.send('Input.dispatchTouchEvent',{type:point?(had?'touchMove':'touchStart'):'touchEnd',touchPoints:[...touches.values()]});}
 async function key(code,on){if(on&&!keys.has(code)){keys.add(code);await page.keyboard.down(code);}if(!on&&keys.has(code)){keys.delete(code);await page.keyboard.up(code);}}
 const wallStart=Date.now();let last;
 while(Date.now()-wallStart<140000){if(await page.getByRole('button',{name:'Resume match',exact:true}).isVisible())await page.getByRole('button',{name:'Resume match',exact:true}).click();last=await page.evaluate(()=>{const v=window.__fi2Live,s=v.sim,p=s.players[s.selected],owner=s.ball.owner>=0?s.players[s.ball.owner]:null;return{t:s.time,p:{x:p.x,z:p.z,stamina:p.stamina},enemies:s.players.filter(q=>q.team===1).map(q=>({x:q.x,z:q.z})),owner:s.ball.owner,selected:s.selected,event:s.eventKind,b:s.ball,own:s.ball.owner===s.selected,opponent:owner?.team===1,score:[...s.score],passes:s.passes[0],shots:s.shots[0],pause:s.goalPause,portrait:v.visual.portrait};});if(last.t>=55)break;
  let dx,dz;if(last.own){dx=1;dz=(Math.sin(last.t*.18)*7-last.p.z)*.2;for(const enemy of last.enemies){if(enemy.x>last.p.x-1&&enemy.x<last.p.x+5&&Math.abs(enemy.z-last.p.z)<3){dz+=last.p.z>=enemy.z?1.5:-1.5;}}if(Math.abs(last.p.z)>10)dz=-Math.sign(last.p.z);}else{dx=last.b.x-last.p.x;dz=last.b.z-last.p.z;}if(charging){dx=0;dz=last.enemies[3].z>=0?-1:1;}const len=Math.max(1,Math.hypot(dx,dz));dx/=len;dz/=len;
  const sprinting=last.own&&last.p.stamina>.2&&!charging;if(mobile){if(sprinting)await touch(4,{x:sprint.x+sprint.width/2,y:sprint.y+sprint.height/2});else if(touches.has(4))await touch(4,null);}else await key('ShiftLeft',sprinting);
  const sx=last.portrait?dz:dx,sy=last.portrait?-dx:dz;
  if(mobile)await touch(1,{x:joy.x+joy.width/2+sx*30,y:joy.y+joy.height/2+sy*30});else{await key('KeyD',sx>.25);await key('KeyA',sx<-.25);await key('KeyS',sy>.25);await key('KeyW',sy<-.25);}
  if(!charging&&last.own&&last.p.x>3&&last.pause<=0){charging=true;shotAt=last.t;if(mobile)await touch(2,{x:shoot.x+shoot.width/2,y:shoot.y+shoot.height/2});else await key('KeyK',true);}
  if(charging&&(last.t-shotAt>.18||!last.own)){charging=false;if(mobile)await touch(2,null);else await key('KeyK',false);}
  if(!charging&&last.t-passAt>3&&((last.own&&last.passes===0)||last.opponent&&Math.hypot(last.b.x-last.p.x,last.b.z-last.p.z)<2.3)){passAt=last.t;if(mobile){await touch(3,{x:pass.x+pass.width/2,y:pass.y+pass.height/2});await touch(3,null);}else await page.keyboard.press('Space');}
  if(last.passes>seenPasses){seenPasses=last.passes;await page.screenshot({path:`/tmp/fi-strikers-pass-${mobile?'mobile':'desktop'}.png`});}
  await page.waitForTimeout(80);
 }
 for(const code of [...keys])await key(code,false);for(const id of [...touches.keys()])await touch(id,null);
 console.log('PLAY_RESULT',JSON.stringify(last));await page.screenshot({path:`/tmp/fi-strikers-play-${mobile?'mobile':'desktop'}.png`});
 assert(last.t>=30,'sustained ordinary-input play');assert(last.passes>0,'ordinary passing connects to a teammate');assert(last.shots>0,'ordinary play creates a shot');assert.deepEqual(errors,[]);
 await page.screenshot({path:`/tmp/fi-strikers-play-${mobile?'mobile':'desktop'}.png`});console.log('STRIKERS_ORDINARY_PLAY_PASS',JSON.stringify({mobile,seconds:last.t,passes:last.passes,shots:last.shots,score:last.score,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
