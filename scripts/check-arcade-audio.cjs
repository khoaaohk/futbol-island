#!/usr/bin/env node
// Arcade audio probe (Nov 10 2026): proves a game really puts sound on the output, instead of reading the code.
//   node scripts/check-arcade-audio.cjs --port=<n> [tennis|pinball|runner|live|puzzle|kitrush|snake] [--suspended] [--headed]
// pinball (Nov 10 2026): windows flipper (KeyA, KeyD), bumper (ball sent into rondo cone 0), goal (ball in the goal mouth) and drain
// (ball at the bottom, ball save off) are driven on the live table through window.__arcade3d after the launch window.
// kitrush (Nov 10 2026): windows slice, combo and life-lost are driven through the game's own swipe() on its three teaching waves
// (one own kit, a pair of own kits, own + rival), and menu / paused must be SILENT (Kit Rush has no menu sound).
// snake (Nov 10 2026): windows pickup (a team-mate is stood one cell ahead of the captain on the live pitch), full-squad (the same,
// eleven times, to the fanfare) and crash (hands off into the touchline with the save spent); menu / paused must be SILENT.
// It wraps AudioNode.connect in the page so every connection to an AudioDestinationNode goes through an AnalyserNode first, samples
// the RMS of what reaches the speakers every 15 ms, and prints the peak RMS per labelled window (tennis: serve kick, bounce, point
// bell, ambience bed; other games: menu and play). Also prints how many contexts and destination connections were made and each
// context's state. Chrome runs WITHOUT --mute-audio and with --autoplay-policy=no-user-gesture-required.
// --suspended keeps the real autoplay policy: the context starts suspended, a cue is requested before any tap, then a real tap
// follows; sound must start only after the tap (the iOS / Safari path).
// Exit code 1 when a labelled window that must be audible is silent. Never point it at the owner's dev server on 8092.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const portArg=(process.argv.find(a=>a.startsWith('--port='))||'').slice(7)||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(portArg?`http://localhost:${portArg}`:'');
if(!BASE){console.error('Pass your own server: --port=<port> or FUTBOL_BASE_URL=<url>.');process.exit(1);}
const game=process.argv.slice(2).find(a=>!a.startsWith('--'))||'tennis',suspended=process.argv.includes('--suspended'),SILENT=1e-4;
const probe=()=>{const st=window.__audioProbe={contexts:[],connections:0,peak:0,label:'',windows:{},errors:[]};const taps=new WeakMap();
 const tapOf=ctx=>{let t=taps.get(ctx);if(!t){const a=ctx.createAnalyser();a.fftSize=2048;origConnect.call(a,ctx.destination);t={a,buf:new Float32Array(2048)};taps.set(ctx,t);st.contexts.push({ctx,t});}return t;};
 const origConnect=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(dest,...rest){if(dest instanceof AudioDestinationNode){st.connections++;return origConnect.call(this,tapOf(dest.context).a,...rest);}return origConnect.call(this,dest,...rest);};
 setInterval(()=>{for(const{t}of st.contexts){t.a.getFloatTimeDomainData(t.buf);let s=0;for(let i=0;i<t.buf.length;i++)s+=t.buf[i]*t.buf[i];const rms=Math.sqrt(s/t.buf.length);if(rms>st.peak)st.peak=rms;if(st.label&&rms>(st.windows[st.label]||0))st.windows[st.label]=rms;else if(st.label&&!(st.label in st.windows))st.windows[st.label]=0;}},15);
 window.__audioLabel=l=>{st.label=l;if(l&&!(l in st.windows))st.windows[l]=0;};window.__audioStates=()=>st.contexts.map(c=>c.ctx.state);};
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.removeItem('fi2-sound-muted');localStorage.setItem('fi2-sound-volume','0.5');localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'playtest entry',at:1}},packs:[]}));}catch{}};
(async()=>{const args=['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist'];if(!suspended)args.push('--autoplay-policy=no-user-gesture-required');
 const browser=await chromium.launch({channel:'chrome',headless:!process.argv.includes('--headed'),args,ignoreDefaultArgs:['--mute-audio']});let fail=false;
 try{const landscape=game==='live'||game==='runner',ctx=await browser.newContext({viewport:landscape?{width:844,height:390}:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await ctx.addInitScript(probe);await ctx.addInitScript(seed);const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message.slice(0,200)));
  const label=l=>page.evaluate(l=>window.__audioLabel(l),l),wait=ms=>page.waitForTimeout(ms),read=()=>page.evaluate(()=>({connections:window.__audioProbe.connections,peak:+window.__audioProbe.peak.toFixed(5),states:window.__audioStates(),windows:Object.fromEntries(Object.entries(window.__audioProbe.windows).map(([k,v])=>[k,+v.toFixed(5)]))}));
  await page.goto(BASE+'/arcade?game='+game,{waitUntil:'domcontentloaded',timeout:120000});await page.waitForSelector('canvas',{timeout:60000});await wait(3500);
  await label('menu');await wait(800);
  if(suspended){const before=await read();console.log(JSON.stringify({game,step:'before any tap',contexts:before.states,peak:before.peak}));}
  const playBtn=page.getByRole('button',{name:/^(play|start|kick off)/i}).first();await label('play-tap');if(await playBtn.isVisible().catch(()=>false))await playBtn.tap({timeout:5000}).catch(()=>playBtn.click({force:true}).catch(()=>{}));await wait(1500);
  const must=[],quiet=[];
  if(game==='tennis'){
   await page.waitForFunction(()=>window.__arcade3d?.phaseRef.current==='playing',null,{timeout:30000});
   const T=fn=>page.evaluate(fn);
   await label('serve-kick');await page.getByRole('button',{name:'Serve',exact:true}).tap();await wait(450);must.push('serve-kick');
   // ambience bed: hold the rally silent (ball hanging high, nobody near it) and listen to what is left: surf + breeze
   await T(()=>{const s=window.__arcade3d.runtime.state.tennis;s.phase='rally';s.aiReaction=99;Object.assign(s.ball,{x:0,y:-3,z:9,vx:0,vy:0,vz:6,wx:0,wy:0,wz:0,last:'you',crossed:true,bounces:0});});await wait(700);await label('ambience-bed');await wait(900);must.push('ambience-bed');
   // bounce: drop the ball on your side
   await T(()=>{const s=window.__arcade3d.runtime.state.tennis;s.phase='rally';s.aiReaction=99;Object.assign(s.you,{x:-4,y:7.5,targetX:-4,targetY:7.5,vx:0,vy:0,moveX:0,moveY:0,kick:0});Object.assign(s.ball,{x:2,y:4,z:1.2,vx:0,vy:.2,vz:-1,wx:0,wy:0,wz:0,last:'rival',crossed:true,bounces:0});});await label('bounce');await wait(700);must.push('bounce');
   await label('');await page.waitForFunction(()=>window.__arcade3d.runtime.state.tennis.phase==='point',null,{timeout:9000}).catch(()=>{});await label('point-bell');await wait(1300);must.push('point-bell');
   await label('');await wait(300);await label('after-pause');await page.getByRole('button',{name:'Pause game'}).click().catch(()=>{});await wait(900);await label('paused-1s-later');await wait(600);
  }else if(game==='kitrush'){quiet.push('menu');
   await page.waitForFunction(()=>window.__kitrush&&window.__kitrush.phase==='playing',null,{timeout:30000});
   // swipes through every item the filter picks, with the game's own swipe() (the same path a finger takes), once `need` of them are in reach
   const cut=(own,need)=>page.waitForFunction(([own,need])=>{const g=window.__kitrush.game,s=g.state;if(s.beat>0)return false;const pick=s.items.filter(it=>it.active&&it.y<s.h*.82&&it.y>s.h*.2&&((it.kind>=7||(it.kind<6&&it.team===s.team))===own));if(pick.length<need)return false;
     window.__audioLabel(own?(need>1?'combo':'slice'):'life-lost');g.beginStroke(0);let x=pick[0].x,y=pick[0].y-9;for(const it of pick){g.swipe(0,x,y,it.x,it.y+1);x=it.x;y=it.y+1;}g.swipe(0,x,y,x,y+6);g.endStroke(0);return true;},[own,need],{timeout:20000,polling:30});
   await label('');await cut(true,1);await wait(450);must.push('slice');await label('');
   await cut(true,2);await wait(800);must.push('combo');await label('');
   await cut(false,1);await wait(900);must.push('life-lost');await label('');await wait(400);
   await page.locator('[data-arcade-pause]').tap().catch(()=>{});await wait(700);await label('paused');await wait(900);quiet.push('paused');
  }else if(game==='snake'){quiet.push('menu');
   await page.waitForFunction(()=>window.__snake&&window.__snake.phase==='playing'&&window.__snake.game.state.ticks>=1,null,{timeout:30000});
   // stands the pitch's own next team-mate one cell ahead of the captain (turning away from a touchline first) until `joined` reaches the goal
   const call=(goal,name)=>page.waitForFunction(([goal,name])=>{const g=window.__snake.game,s=g.state,DX=[0,1,0,-1],DY=[-1,0,1,0];if(s.over)return true;if(s.stats.picks>=goal||s.stats.squads>0&&name==='full-squad')return true;if(s.beat>0||s.qn>0)return false;
     let d=s.dir,x=s.xs[0]+DX[d]*2,y=s.ys[0]+DY[d]*2;if(x<0||y<0||x>=s.cols||y>=s.rows){g.turn((d+1)%4);return false;}
     const p=s.picks.find(q=>q.on);if(!p)return false;const nx=s.xs[0]+DX[d],ny=s.ys[0]+DY[d];for(let i=0;i<s.len;i++)if(s.xs[i]===nx&&s.ys[i]===ny)return false;
     if(s.stats.picks>=goal-1)window.__audioLabel(name);p.x=nx;p.y=ny;return false;},[goal,name],{timeout:60000,polling:25});
   await label('');await call(1,'pickup');await wait(500);must.push('pickup');await label('');
   await page.locator('[data-arcade-pause]').tap().catch(()=>{});await wait(700);await label('paused');await wait(900);quiet.push('paused');await label('');
   await page.locator('[data-arcade-resume]').tap().catch(()=>{});await page.waitForFunction(()=>window.__snake.phase==='playing',null,{timeout:5000});
   await call(11,'full-squad');await wait(1500);must.push('full-squad');await label('');
   await page.waitForFunction(()=>{const s=window.__snake.game.state;return s.over||(s.beat<=0&&s.ready<=0&&s.level>=2);},null,{timeout:8000});
   await page.evaluate(()=>{const s=window.__snake.game.state;s.saves=0;s.picks[0].on=s.picks[1].on=false;window.__audioLabel('crash');});
   await page.waitForFunction(()=>window.__snake.game.state.over,null,{timeout:30000});await wait(900);must.push('crash');await label('');
  }else if(game==='puzzle'){quiet.push('menu');
   // Pass Puzzles (Nov 10 2026, comic pass): three event windows on the first puzzle. draw = a real finger stroke from the ball to
   // the solution's target (brush foley while it moves, the snap tick when it locks on); pass-complete = the release (strike, first
   // touch, the pass note); solved = the rest of the solution played through the game's own kick() up to the goal phrase and stars.
   await label('');{const b=page.getByRole('button',{name:/^(start puzzle|start)/i}).first();await b.waitFor({timeout:20000}).catch(()=>{});if(await b.isVisible().catch(()=>false))await b.tap().catch(()=>{});}
   await page.waitForFunction(()=>window.__passPuzzle?.world?.state.phase==='aiming',null,{timeout:30000});await wait(900);
   const sol=await page.evaluate(()=>{const g=window.__passPuzzle;return g.solution(g.world.scenario.id);}),box=await page.locator('[data-arcade-kind="pass-puzzle"] canvas').boundingBox();
   const at=async p=>{const s=await page.evaluate(p=>window.__passPuzzle.scene.toScreen(p.x,0,p.z),p);return{x:box.x+s.x,y:box.y+s.y};};
   const a=await at(await page.evaluate(()=>window.__passPuzzle.world.state.ball.p)),c=await at(sol[0].target);
   await label('draw');await page.mouse.move(a.x,a.y);await page.mouse.down();for(let i=1;i<=24;i++){const t=i/24;await page.mouse.move(a.x+(c.x-a.x)*t+Math.sin(t*Math.PI)*14,a.y+(c.y-a.y)*t);await wait(30);}await wait(250);must.push('draw');
   await label('pass-complete');await page.mouse.up();await wait(2600);must.push('pass-complete');
   await label('solved');for(let i=1;i<sol.length;i++){await page.waitForFunction(()=>window.__passPuzzle.world.state.phase==='aiming',null,{timeout:15000}).catch(()=>{});await wait(250);await page.evaluate(k=>window.__passPuzzle.kick(k),sol[i]);}
   await page.getByRole('button',{name:/next puzzle/i}).first().waitFor({timeout:20000}).catch(()=>errors.push('puzzle was not solved'));await wait(2600);must.push('solved');
   await label('');await wait(1500);await label('after-result');await wait(900);quiet.push('after-result');
  }else{await label('play');
   if(game==='pinball'){const b=page.getByRole('button',{name:/launch/i}).first();const box=await b.boundingBox().catch(()=>null);if(box){const cdp=await ctx.newCDPSession(page),pt=[{x:box.x+box.width/2,y:box.y+box.height/2}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pt});await wait(700);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}}
   else{for(let i=0;i<4;i++){await page.touchscreen.tap(landscape?700:300,landscape?300:700).catch(()=>{});await wait(400);}}
   await wait(5000);must.push('play');
   // Breakaway round clear (Nov 10 2026): endless play clears a round at every goal-line goal, so the cue is a short two-note steel pan,
   // not the full-time whistle and fanfare. Driven as the game's own 'round' event on the live run; it must be audible.
   if(game==='runner'){await label('');await wait(300);await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.runner;s.event++;s.eventKind='round';window.__audioLabel('round-clear');});await wait(900);must.push('round-clear');}
   if(game==='pinball'){
    // Futbol Pinball (Nov 10 2026, comic pass): four event windows, each driven on the live table through the dev handle
    // (window.__arcade3d, non-production builds only). flipper = KeyA then KeyD (wood block + rim-shot, same frame as the press);
    // bumper = the ball placed just under rondo cone 0 moving up (cajon thump + pan step); goal = the ball placed inside the goal
    // mouth (y<42) clear of the keeper (pan fanfare + claps + crowd); drain = the ball placed at the bottom centre with the ball save
    // off (kalimba fall + dull cajon). A missing cue is recorded as an error, not just a silent window.
    /* the ball may be back on the plunger by now and a ready table sleeps (0 frames): a one-pixel viewport change (the shell's ResizeObserver) wakes the frame loop after each placement, silently */const P=async fn=>{await page.evaluate(fn);const v=page.viewportSize();await page.setViewportSize({width:v.width,height:v.height+1});await wait(90);await page.setViewportSize(v);await wait(90);},on=(cue,ms)=>page.waitForFunction(c=>{const s=window.__arcade3d.runtime.state.pinball;return c==='cone'?s.table.sfx.cone>window.__pbCone:s.cue===c;},cue,{timeout:ms}).catch(async()=>errors.push('pinball '+cue+' did not fire '+await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.pinball;return JSON.stringify({shell:window.__arcade3d.phaseRef.current,phase:s.phase,cue:s.cue,x:Math.round(s.ball.x),y:Math.round(s.ball.y),frames:document.querySelector('canvas').getAttribute('data-frames')});})));
    await P(()=>{const r=window.__arcade3d.runtime;if(r.pinballCinema)r.pinballCinema.enabled=false;});
    await label('');await wait(600);await label('flipper');await page.keyboard.press('KeyA');await wait(260);await page.keyboard.press('KeyD');await wait(500);must.push('flipper');
    await label('');await wait(400);
    await P(()=>{const s=window.__arcade3d.runtime.state.pinball,t=s.table,a=t.coneSpin||0,cx=298,cy=106,x=cx+(276-cx)*Math.cos(a)-(94-cy)*Math.sin(a),y=cy+(276-cx)*Math.sin(a)+(94-cy)*Math.cos(a);window.__pbCone=t.sfx.cone;s.phase='playing';s.openingRescue=false;s.launchGrace=0;Object.assign(s.ball,{x,y:y+24,vx:0,vy:-520});});
    await label('bumper');await on('cone',3000);await wait(600);must.push('bumper');
    await label('');await wait(400);
    await P(()=>{const s=window.__arcade3d.runtime.state.pinball;s.phase='playing';s.openingRescue=false;s.launchGrace=0;Object.assign(s.ball,{x:s.keeper<180?220:140,y:40,vx:0,vy:-200});});
    await label('goal');await on('goal',3000);await wait(1600);must.push('goal');
    await label('');await page.waitForFunction(()=>window.__arcade3d.runtime.state.pinball.phase!=='goal',null,{timeout:8000}).catch(()=>{});await wait(400);
    await P(()=>{const s=window.__arcade3d.runtime.state.pinball;s.phase='playing';s.openingRescue=false;s.launchGrace=0;Object.assign(s.ball,{x:180,y:625,vx:0,vy:400});});
    await label('drain');await page.waitForFunction(()=>{const p=window.__arcade3d.runtime.state.pinball.phase;return p==='lost'||p==='over';},null,{timeout:3000}).catch(()=>errors.push('pinball drain did not fire'));await wait(1100);must.push('drain');
   }}
  await label('');const out=await read();const silent=must.filter(k=>!(out.windows[k]>SILENT)),loud=quiet.filter(k=>out.windows[k]>SILENT);fail=silent.length>0||loud.length>0||errors.length>0;if(loud.length)console.log('ARCADE_AUDIO_NOT_QUIET '+game+': '+loud.join(', '));
  console.log(JSON.stringify({game,suspended,contexts:out.states,destinationConnections:out.connections,peakRms:out.peak,rms:out.windows,silent,errors}));
  console.log(fail?'ARCADE_AUDIO_FAIL '+game+' silent: '+silent.join(', '):'ARCADE_AUDIO_PASS '+game);
 }finally{await browser.close();}
 process.exit(fail?1:0);
})();
