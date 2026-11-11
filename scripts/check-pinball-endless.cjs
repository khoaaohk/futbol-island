// Futbol Pinball endless-play check (Nov 10 2026). Phone profile (390x844, touch). A semi-skilled bot plays with real touches (CDP)
// through full-time whistles and asserts: the run is never forced over with balls left, no dead interval over 1 s (a ball in play that
// does not move while no flipper is held, the frame loop asleep mid-ball, or a touch that is ignored), and the level rises each match.
//   node scripts/check-pinball-endless.cjs --port=<n>            fast: the match clock is wound to 86' after 12 s of each match
//   node scripts/check-pinball-endless.cjs --port=<n> --full     real time: two whole 3-minute matches (about 7 minutes)
//   --loops=<n> whistles to play through (default 2) · --observe logs instead of asserting (used to record the old behaviour)
//   --shot=<file.png> saves the last frame (the status tab with the level)
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
const arg=n=>(process.argv.find(a=>a.startsWith('--'+n+'='))||'').slice(n.length+3);
const portArg=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(portArg?`http://localhost:${portArg}`:'');
if(!BASE){console.error('Pass your own server: --port=<port>, PORT=<port> or FUTBOL_BASE_URL=<url>. There is no default port.');process.exit(1);}
const full=process.argv.includes('--full'),observe=process.argv.includes('--observe'),loops=Number(arg('loops')||2),limit=Number(arg('seconds')||(full?loops*215+60:loops*45+60));
(async()=>{const browser=await chromium.launch({headless:true,channel:process.env.CHROMIUM_PATH?undefined:'chrome',executablePath:process.env.CHROMIUM_PATH||undefined,args:['--mute-audio']});try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-pinball-tutorial-v1','1');localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{fixture:{game:'island',paid:30,reason:'playtest entry',at:1}},packs:[]}));});
 await page.goto(new URL('/arcade?game=pinball',BASE).href,{waitUntil:'domcontentloaded',timeout:120000});await page.getByRole('button',{name:/^play/i}).first().click();
 await page.waitForFunction(()=>window.__arcade3d?.phaseRef.current==='playing',null,{timeout:60000});
 // A first-run tutorial card may sit over the table: close it the way a player does.
 for(const name of [/got it/i,/^skip/i,/let.s play/i,/^start/i]){const b=page.getByRole('button',{name});if(await b.count()&&await b.first().isVisible().catch(()=>false)){await b.first().click().catch(()=>{});break;}}
 // In-page monitor on a timer (not rAF: it must see a sleeping frame loop).
 await page.evaluate(({full})=>{const g=window.__arcade3d,canvas=document.querySelector('[data-arcade-kind="pinball"]>canvas'),s=()=>g.runtime.state.pinball;
  const m=window.__pbMon={overs:[],dead:[],asleep:[],whistles:[],levels:[1],shell:[],maxNonPlay:0,wound:0,t0:performance.now()};
  let ax=0,ay=0,still=0,frames=canvas.getAttribute('data-frames'),frameStill=0,last=performance.now(),phase=s().phase,nonPlay=0,match=s().match||1,matchT=0,clock=s().clock,shell=g.phaseRef.current;
  m.timer=setInterval(()=>{const now=performance.now(),dt=(now-last)/1000;last=now;const p=s(),b=p.ball,at=+((now-m.t0)/1000).toFixed(1);
   if(g.phaseRef.current!==shell){shell=g.phaseRef.current;m.shell.push({at,shell});}
   if(shell!=='playing')return;
   if(p.phase!==phase){if(p.phase==='over')m.overs.push({at,balls:p.balls,cue:p.cue,clock:+p.clock.toFixed(1),stoppage:+p.stoppage.toFixed(1),match:p.match||1,score:p.score,reason:p.balls>0?'FORCED: full time with '+p.balls+' ball(s) left':'last ball lost'});phase=p.phase;}
   const mt=p.match||1;if(mt!==match){m.whistles.push({at,level:mt,balls:p.balls,score:p.score,phase:p.phase});m.levels.push(mt);match=mt;matchT=0;}
   if(p.phase==='playing'){nonPlay=0;matchT+=dt;
    const cradle=(p.left>.5||p.right>.5)&&b.y>450,moved=Math.hypot(b.x-ax,b.y-ay)>4;
    if(moved||cradle){if(still>1)m.dead.push({at,seconds:+still.toFixed(2),x:Math.round(ax),y:Math.round(ay),hold:+p.table.hold.toFixed(2),possession:p.possession});still=0;ax=b.x;ay=b.y;}else still+=dt;
    const f=canvas.getAttribute('data-frames');if(f!==frames){if(frameStill>.5)m.asleep.push({at,seconds:+frameStill.toFixed(2)});frames=f;frameStill=0;}else frameStill+=dt;
    // Fast mode: wind the match clock on so a whistle comes every half minute (the rules are untouched).
    if(!full&&matchT>12&&p.clock<172&&p.stoppage<0){p.clock=172;m.wound++;}
   }else if(p.phase!=='over'){nonPlay+=dt;m.maxNonPlay=Math.max(m.maxNonPlay,nonPlay);}
  },50);},{full});
 const client=await page.context().newCDPSession(page);
 const box=async q=>{const r=await page.locator(q).boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2};};
 const pads=[await box('[data-pinball-pad=left]'),await box('[data-pinball-pad=right]')],launch=await box('[data-pinball-launch]');
 const down=[0,0],touches=()=>[0,1].filter(i=>down[i]).map(i=>({x:pads[i].x,y:pads[i].y,id:i+1}));
 const sync=async(type)=>client.send('Input.dispatchTouchEvent',{type,touchPoints:touches()});
 const ignored=[];let lastLaunch=0,pressAt=[0,0],seed=7;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
 const start=Date.now();let snap,ended='';
 while(Date.now()-start<limit*1000){
  snap=await page.evaluate(()=>{const g=window.__arcade3d,p=g.runtime.state.pinball,m=window.__pbMon;return{shell:g.phaseRef.current,phase:p.phase,x:p.ball.x,y:p.ball.y,vy:p.ball.vy,left:p.left,right:p.right,balls:p.balls,match:p.match||1,score:p.score,whistles:m.whistles.length,overs:m.overs.length};});
  if(snap.shell!=='playing'||snap.phase==='over'){ended=snap.shell+'/'+snap.phase;await page.waitForTimeout(250);break;}
  if(snap.whistles>=loops&&snap.phase==='playing'&&Date.now()-start>20000){ended='played through '+snap.whistles+' whistles';break;}
  const now=Date.now();
  if(snap.phase==='ready'){if(now-lastLaunch>700){if(lastLaunch&&now-lastLaunch<3000&&now-lastLaunch>1000)ignored.push({what:'launch',at:(now-start)/1000});lastLaunch=now;await page.touchscreen.tap(launch.x,launch.y);}}
  else if(snap.phase==='playing'){lastLaunch=0;
   for(let i=0;i<2;i++){const side=i?snap.x>180:snap.x<=180,want=down[i]?now-pressAt[i]<150:side&&snap.x<341&&snap.y>496+rnd()*20&&snap.y<562&&snap.vy>-60&&rnd()>.22;
    // The touch must reach the rules: a held pad that the game does not see within 300 ms is ignored input.
    if(down[i]&&now-pressAt[i]>300&&(i?snap.right:snap.left)<.05)ignored.push({what:'flipper '+i,at:(now-start)/1000});
    if(want&&!down[i]){down[i]=1;pressAt[i]=now;await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches()});}
    else if(!want&&down[i]){down[i]=0;await client.send('Input.dispatchTouchEvent',{type:touches().length?'touchMove':'touchEnd',touchPoints:touches()});if(touches().length){/* one finger lifted: re-send as end of that finger */await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:touches()}).catch(()=>{});await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:touches()}).catch(()=>{});}}
   }
  }
  await page.waitForTimeout(16);
 }
 if(down[0]||down[1])await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}).catch(()=>{});
 if(arg('shot'))await page.screenshot({path:arg('shot')});
 const mon=await page.evaluate(()=>{const m=window.__pbMon;clearInterval(m.timer);const p=window.__arcade3d.runtime.state.pinball;return{overs:m.overs,dead:m.dead,asleep:m.asleep,whistles:m.whistles,levels:m.levels,shell:m.shell,maxNonPlay:+m.maxNonPlay.toFixed(2),wound:m.wound,final:{phase:p.phase,balls:p.balls,score:p.score,match:p.match||1,minute:p.clock.toFixed(0),unstuck:p.unstuck},tab:document.querySelector('[data-pinball-dmd]')?.textContent||''};});
 const seconds=Math.round((Date.now()-start)/1000),report={mode:full?'full':'fast',seconds,ended:ended||'time limit',...mon,ignored,errors};
 console.log('PINBALL_ENDLESS',JSON.stringify(report));
 if(!observe){
  assert.deepEqual(errors,[],'no page errors');
  assert.deepEqual(mon.overs.filter(o=>o.balls>0),[],'a run ends only when the last ball is lost');
  assert(mon.whistles.length>=loops,`played through ${loops} full-time whistles (got ${mon.whistles.length}; the bot lost its last ball first: run again)`);
  assert.deepEqual(mon.levels,mon.levels.map((_,i)=>i+1),'the level rises by one at every whistle');
  assert.deepEqual(mon.dead,[],'no ball in play sits still for over 1 s');
  assert.deepEqual(mon.asleep,[],'the frame loop never sleeps while a ball is in play');
  assert.deepEqual(ignored,[],'no touch is ignored');
  assert(mon.maxNonPlay<=2.6,'no wait between balls longer than the goal beat plus the launch tap: '+mon.maxNonPlay);
  assert.match(mon.tab,new RegExp('LV ?'+mon.final.match),'the status tab shows the level: '+mon.tab);
  console.log(`PASS pinball endless (${report.mode}): ${mon.whistles.length} full-time whistles in one run, level ${mon.final.match}, no forced over, no dead interval`);
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
