#!/usr/bin/env node
// Arcade audio probe (Nov 10 2026): proves a game really puts sound on the output, instead of reading the code.
//   node scripts/check-arcade-audio.cjs --port=<n> [tennis|pinball|runner|live|puzzle|kitrush|snake|airhockey|lineup|trophydrop|rollball|ballblaster|safehands|keepyuppy] [--suspended] [--headed] [--null-output] [--mute]
// keepyuppy (Nov 21 2026): windows count-in (the four clicks before bar 1), music (the first bars of the track, scheduled ahead on the
// AudioContext clock: kick, clap, shaker, bass), touch (a boot on the ball while the song is stopped) and over (the end cue); the
// start card, the stage cards and the pause must be SILENT. --mute keeps Chrome's --mute-audio (night runs): the analyser sits
// before the destination, so the graph is still measured while nothing reaches the speakers.
// trophydrop (Nov 17 2026): windows land (a boot dropped through the game's own drop()) and merge (two size-3 balls dropped on one
// spot); menu / paused must be SILENT.
// pinball (Nov 10 2026): windows flipper (KeyA, KeyD), bumper (ball sent into rondo cone 0), goal (ball in the goal mouth) and drain
// (ball at the bottom, ball save off) are driven on the live table through window.__arcade3d after the launch window.
// kitrush (Nov 10 2026): windows slice, combo and life-lost are driven through the game's own swipe() on its three teaching waves
// (one own kit, a pair of own kits, own + rival), and menu / paused must be SILENT (Kit Rush has no menu sound).
// snake (Nov 10 2026): windows pickup (a team-mate is stood one cell ahead of the captain on the live pitch), full-squad (the same,
// eleven times, to the fanfare) and crash (hands off into the touchline with the save spent); menu / paused must be SILENT.
// lineup (Nov 17 2026): windows place (a tray piece set on the empty pitch through the game's own place()), clear (row 0 filled but for
// the piece's top cells, then the piece placed: the line chord + clap) and over (the end cue); menu / paused must be SILENT.
// rollball (Nov 17 2026): windows roll (the stick held forward through the dev hook: the rolling voice), plate (the ball set on the
// first plate: clunk + note, then the gate slides) and splash (the ball set past the edge), then over (the end cue); menu / paused SILENT.
// It wraps AudioNode.connect in the page so every connection to an AudioDestinationNode goes through an AnalyserNode first, samples
// the RMS of what reaches the speakers every 15 ms, and prints the peak RMS per labelled window (tennis: serve kick, bounce, point
// bell, ambience bed; other games: menu and play). Also prints how many contexts and destination connections were made and each
// context's state. Chrome runs WITHOUT --mute-audio and with --autoplay-policy=no-user-gesture-required.
// --suspended keeps the real autoplay policy: the context starts suspended, a cue is requested before any tap, then a real tap
// follows; sound must start only after the tap (the iOS / Safari path).
// Exit code 1 when a labelled window that must be audible is silent. Never point it at the owner's dev server on 8092.
// ballblaster (Nov 17 2026): windows kick (the game's own shoot() up the empty pitch), smash (a robot set 8 m ahead and shot: the clank,
// the wind-down spring) and over (the end cue); menu / paused must be SILENT.
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
 /* Fix round 2 (Nov 18 2026): --null-output sends Chrome's sound to its own timer-driven null sink. Use it when every game reads RMS 0 with a running context: the machine's sound device has stopped pulling, so the audio clock stands still (seen overnight on the owner's Mac). Nothing reaches the speakers. */if(process.argv.includes('--null-output'))args.push('--disable-audio-output');if(process.argv.includes('--mute'))args.push('--mute-audio');
 const browser=await chromium.launch({channel:'chrome',headless:!process.argv.includes('--headed'),args,ignoreDefaultArgs:['--mute-audio']});let fail=false;
 try{/* Nov 11 2026: Breakaway Run plays upright (390x664, the iPhone with its browser bars); --landscape probes it sideways as before */const landscape=game==='live'||game==='runner'&&process.argv.includes('--landscape'),ctx=await browser.newContext({viewport:landscape?{width:844,height:390}:game==='runner'?{width:390,height:664}:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
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
  }else if(game==='trophydrop'){quiet.push('menu');
   await page.waitForFunction(()=>window.__trophy&&window.__trophy.phase==='playing',null,{timeout:30000});
   const D=(tier,x)=>page.evaluate(([tier,x])=>{const g=window.__trophy.game,s=g.state;s.cool=0;s.cur=tier;g.aim(x);g.drop();window.__trophy.wake();},[tier,x]);
   await label('land');await D(3,20);await wait(900);must.push('land');await label('');await wait(300);
   await label('merge');await D(1,70);await wait(120);await D(1,70);await wait(1200);must.push('merge');await label('');
   if(!(await page.evaluate(()=>window.__trophy.game.state.stats.merges>=1)))errors.push('no merge happened');
   await page.locator('[data-arcade-pause]').tap().catch(()=>{});await wait(700);await label('paused');await wait(900);quiet.push('paused');await label('');
  }else if(game==='snake'){quiet.push('menu');
   // Nov 17 2026: kick-off waits for the first input since Nov 11 (state.hold); the probe gives that first press itself
   await page.waitForFunction(()=>{const k=window.__snake;if(!k||k.phase!=='playing'||!k.game)return false;const s=k.game.state;if(s.hold&&s.ready<=0)k.game.turn(s.dir);return s.ticks>=1;},null,{timeout:30000,polling:100});
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
  }else if(game==='airhockey'){quiet.push('menu');
   // Air Futbol (Nov 11 2026): a real finger (CDP touch) holds the striker and serves; each window then sets the puck up on the live
   // table through the dev handle (window.__airhockey) and lets the game's own physics fire the cue: serve = the whistle; hit = the
   // finger drives the striker through a resting puck (clack); wall = the puck flies at a side board (tick); hum = the puck slides
   // through open table, nothing else sounding; goal = the puck goes into the top goal (horn + claps). paused: P is pressed while
   // the puck is still moving, and the table hum must be gone. menu / paused must be SILENT.
   await page.waitForFunction(()=>window.__airhockey&&window.__airhockey.phase==='playing',null,{timeout:30000});
   const cdp=await ctx.newCDPSession(page),T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
   const at=(x,y)=>page.evaluate(([x,y])=>{const k=window.__airhockey,l=k.layout,r=document.querySelector('[data-air-stage]').getBoundingClientRect();return {x:r.left+l.cx+(x-50)*l.scale,y:r.top+l.cy+(y-80)*l.scale,id:1};},[x,y]);
   const put=(px,py,vx,vy)=>page.evaluate(([px,py,vx,vy])=>{const s=window.__airhockey.game.state;s.phase='play';s.inGoal=false;s.px=px;s.py=py;s.pvx=vx;s.pvy=vy;s.lastHit=0;s.tx[1]=92;s.ty[1]=8;},[px,py,vx,vy]);
   await label('serve');await T('touchStart',[await at(50,145)]);await page.waitForFunction(()=>window.__airhockey.game.state.phase==='play',null,{timeout:5000}).catch(()=>errors.push('no serve'));await wait(450);must.push('serve');
   await label('');await put(50,120,0,0);await wait(250);await label('hit');for(let i=1;i<=6;i++){await T('touchMove',[await at(50,145-i*6)]);await wait(16);}await wait(300);must.push('hit');
   await label('');await T('touchMove',[await at(50,150)]);await put(50,60,0,0);await wait(500);await put(20,60,-220,0);await label('wall');await wait(220);must.push('wall');
   await label('');await put(50,60,0,0);await wait(500);await put(20,70,45,0);await wait(120);await label('hum');await wait(500);must.push('hum');
   if(!(await page.evaluate(()=>window.__airhockey.audio.humming)))errors.push('the hum voice was not running while the puck moved');
   await label('');await put(50,60,0,0);await wait(400);await put(50,8,0,-220);await label('goal');await page.waitForFunction(()=>window.__airhockey.game.state.goals[0]>=1,null,{timeout:3000}).catch(()=>errors.push('no goal'));await wait(1300);must.push('goal');
   await label('');await page.waitForFunction(()=>window.__airhockey.game.state.phase==='play',null,{timeout:8000}).catch(()=>{});await wait(900);await put(20,70,50,0);await wait(300);
   await page.keyboard.press('KeyP');await wait(350);if(await page.evaluate(()=>window.__airhockey.audio.humming))errors.push('the hum kept running under the pause card');await label('paused');await wait(900);quiet.push('paused');await T('touchEnd',[]).catch(()=>{});
  }else if(game==='lineup'){quiet.push('menu');
   await page.waitForFunction(()=>window.__lineup&&window.__lineup.phase==='playing',null,{timeout:30000});await label('');await wait(500);
   const L=fn=>page.evaluate(fn);
   await L(()=>{const k=window.__lineup,g=k.game,s=g.state;s.grid.fill(0);s.ref.fill(0);window.__audioLabel('place');const p=s.tray.findIndex(Boolean);g.place(p,4,4);k.sync();});await wait(500);must.push('place');
   await label('');await wait(300);
   await L(()=>{const k=window.__lineup,g=k.game,s=g.state;s.grid.fill(0);s.ref.fill(0);const slot=s.tray.findIndex(Boolean),sh=k.shape(s.tray[slot].shape),top=new Set(sh.cells.filter(c=>c[1]===0).map(c=>c[0]));for(let x=0;x<8;x++)if(!top.has(x))s.grid[x]=1;window.__audioLabel('clear');g.place(slot,0,0);k.sync();});await wait(900);must.push('clear');
   await label('');await wait(300);
   await L(()=>{window.__audioLabel('over');window.__lineup.audio.over();});await wait(1000);must.push('over');
   await label('');await page.keyboard.press('KeyP');await wait(600);await label('paused');await wait(900);quiet.push('paused');
  }else if(game==='ballblaster'){quiet.push('menu');
   await page.waitForFunction(()=>window.__ballblaster&&window.__ballblaster.phase==='playing',null,{timeout:30000});await label('');await wait(600);
   const B=fn=>page.evaluate(fn);
   await B(()=>{window.__audioLabel('kick');window.__ballblaster.game.shoot(0,1,-30,.5,0);});await wait(500);must.push('kick');
   await label('');await wait(300);
   await B(()=>{const g=window.__ballblaster.game,s=g.state,e=s.ents.find(x=>!x.on);Object.assign(e,{on:true,dead:false,kind:1,id:99999,x:0,y:0,z:-8,r:.48,h:1.5,hp:1,max:1,t:0,ph:0,tx:0,cd:0,lastBall:-1,lastAt:0,flash:0,gold:false,speed:0,phase:0});s.rack=6;window.__audioLabel('smash');g.shoot(0,.75,-8,.6,0);});
   await page.waitForFunction(()=>window.__ballblaster.game.state.stats.breaks>=1,null,{timeout:3000}).catch(()=>errors.push('no break'));await wait(600);must.push('smash');
   await label('');await wait(300);
   await B(()=>{window.__audioLabel('over');window.__ballblaster.audio.over();});await wait(1000);must.push('over');
   await label('');await page.keyboard.press('KeyP');await wait(600);await label('paused');await wait(900);quiet.push('paused');
  }else if(game==='keepyuppy'){quiet.push('menu');
   // first run: the kicking foot, the timing check skipped, then the track card (all silent but the button click), then the song
   await page.locator('[data-keepyuppy-foot="R"]').tap({timeout:20000}).catch(()=>errors.push('no foot card'));await wait(500);await page.locator('[data-keepyuppy-card="calib"] [data-keepyuppy-skip]').tap({timeout:20000}).catch(()=>errors.push('no timing card'));
   await page.waitForSelector('[data-keepyuppy-card="tip"]',{timeout:20000}).catch(()=>errors.push('no track card'));await wait(900);await label('track-card');await wait(900);quiet.push('track-card');
   await label('');await page.locator('[data-keepyuppy-go]').tap();await wait(350);await label('count-in');await page.evaluate(()=>{window.__keepyuppy.game.state.lives=99;/* nobody plays here: the run must outlast the probe */});await wait(2500);must.push('count-in');
   await label('');await page.waitForFunction(()=>window.__keepyuppy.time>6.2,null,{timeout:20000,polling:50}).catch(()=>errors.push('the song did not run'));await label('music');await wait(4000);must.push('music');
   const K=fn=>page.evaluate(fn);
   {const a=await K(()=>{const h=window.__keepyuppy;return {song:h.audio.songTime()!==null,scheduled:h.audio.scheduled,state:h.audio.state};});if(!a.song||a.state!=='running'||a.scheduled<40)errors.push('the music is not on the audio clock: '+JSON.stringify(a));}
   await label('');await K(()=>window.__keepyuppy.audio.stopSong());await wait(700);await K(()=>{window.__audioLabel('touch');const a=window.__keepyuppy.audio;a.touch(3,true);});await wait(500);must.push('touch');
   await label('');await wait(300);await K(()=>{window.__audioLabel('over');window.__keepyuppy.audio.over(true,3);});await wait(1200);must.push('over');
   await label('');await page.keyboard.press('KeyP');await wait(600);await label('paused');await wait(900);quiet.push('paused');
  }else if(game==='safehands'){quiet.push('menu');
   // safehands (Nov 21 2026): windows whistle (the referee before the first kick: the game's own run-up), kick (the strike that follows),
   // glove (a parry + the crowd, the game's own cues) and over (the end cue); menu / paused must be SILENT.
   await page.waitForFunction(()=>window.__safehands&&window.__safehands.phase==='playing',null,{timeout:30000});await page.locator('[data-safehands-ack]').tap().catch(()=>{});await label('');
   const S=fn=>page.evaluate(fn);
   await page.waitForFunction(()=>window.__safehands.game.state.phase==='run',null,{timeout:9000,polling:20}).catch(()=>errors.push('no run-up'));await label('whistle');await wait(500);must.push('whistle');
   await label('');await page.waitForFunction(()=>window.__safehands.game.state.phase==='fly',null,{timeout:6000,polling:10}).catch(()=>errors.push('no kick'));await label('kick');await wait(400);must.push('kick');
   await label('');await wait(300);
   await S(()=>{window.__audioLabel('glove');const a=window.__safehands.audio;a.glove(1);a.cheer(false);});await wait(900);must.push('glove');
   await label('');await wait(300);
   await S(()=>{window.__audioLabel('over');window.__safehands.audio.over(false);});await wait(1000);must.push('over');
   await label('');await page.keyboard.press('KeyP');await wait(600);await label('paused');await wait(900);quiet.push('paused');
  }else if(game==='rollball'){quiet.push('menu');
   await page.waitForFunction(()=>window.__rollball&&window.__rollball.phase==='playing',null,{timeout:30000});await label('');await wait(600);
   const D=fn=>page.evaluate(fn);
   await D(()=>{const k=window.__rollball;k.botTick=()=>k.game.input(.15,1);k.useBot=true;window.__audioLabel('roll');});await wait(900);must.push('roll');
   await D(()=>{const k=window.__rollball;k.useBot=false;k.botTick=()=>k.game.input(0,0);k.useBot=true;});await label('');await wait(700);
   await D(()=>{const k=window.__rollball,s=k.game.state,p=s.world.plates[0];s.ball.x=p.x;s.ball.z=p.z;s.ball.y=p.y+.35;s.ball.vx=s.ball.vz=0;window.__audioLabel('plate');});await wait(1100);must.push('plate');
   await label('');await wait(400);
   await D(()=>{const s=window.__rollball.game.state;s.ball.x=9;s.ball.y=.35;s.ball.air=true;window.__audioLabel('splash');});await wait(900);must.push('splash');
   await label('');await wait(600);await D(()=>{window.__audioLabel('over');window.__rollball.audio.over();});await wait(1200);must.push('over');
   await label('');await D(()=>{window.__rollball.useBot=false;});await page.keyboard.press('KeyP');await wait(600);await label('paused');await wait(900);quiet.push('paused');
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
   if(game==='runner'){await label('');await wait(300);await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.runner;s.event++;s.eventKind='round';window.__audioLabel('round-clear');});await wait(900);must.push('round-clear');
    // AAA pass (Nov 18 2026): the return ball (it was silent), the golden shot armed and the full ball ladder each have their own cue.
    for(const [kind,name] of [['return','return-ball'],['golden','golden-ready'],['ladder','full-ladder']]){await label('');await wait(300);await page.evaluate(([kind,name])=>{const s=window.__arcade3d.runtime.state.runner;s.event++;s.eventKind=kind;window.__audioLabel(name);},[kind,name]);await wait(900);must.push(name);}}
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
