// Pop-Up Shot browser check (Nov 21 2026, docs/arcade-aaa/popup-direction.md). Real Chrome (always --mute-audio), real input
// (CDP touch swipes on a phone, mouse drags on a desktop) aimed through the page's own core (window.__popup, dev builds only).
//   node scripts/check-popup-browser.cjs --port=<n> [--mobile] [--size=390x844] [--arena=<0-4>] [--daily] [--shots[=dir]] [--name=x] [--clip=dir] [--headed]
// Plays one round with swipes at open targets, reports draws / triangles / frame rate, and that the loop sleeps on the results card.
// --shots saves a mid-round picture (and one during a multi-ball moment); --clip=<dir> records the first ~16 s as a webm (Playwright video).
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.some(a=>a===`--${n}`||a.startsWith(`--${n}=`));
const port=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(port?`http://localhost:${port}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (not 8092) or FUTBOL_BASE_URL=<url>.');process.exit(1);}
const [vw,vh]=(arg('size')||'390x844').split('x').map(Number),mobile=has('mobile'),daily=has('daily'),ARENA=Number(arg('arena')||0),SHOTS=arg('shots')||path.join(__dirname,'..','docs','arcade-aaa','shots'),NAME=arg('name')||(mobile?'phone':'desktop'),CLIP=arg('clip');
const fails=[],check=(ok,what,detail='')=>{console.log(`${ok?'ok  ':'FAIL'} ${what}${detail?` (${detail})`:''}`);if(!ok)fails.push(what);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0.5');
 if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'playtest entry',at:1}},packs:[]}));}catch{}
 const raf=window.requestAnimationFrame.bind(window);window.__rafCalls=0;window.requestAnimationFrame=cb=>{window.__rafCalls++;return raf(cb);};};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:!has('headed'),args:['--mute-audio','--autoplay-policy=no-user-gesture-required','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext(mobile?{viewport:{width:vw,height:vh},deviceScaleFactor:CLIP?2:3,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900},deviceScaleFactor:1});
  await ctx.route('**/api/arcade-board/**',r=>{const u=r.request().url();r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(u.includes('/start')?{ok:true,token:'check'}:u.includes('/top')?{ok:true,all:[],size:20}:{ok:true})});});
  await ctx.addInitScript(seed);const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));
  page.on('console',m=>{if(m.type()!=='error')return;const t=m.text();if(/arcade-board|Failed to load resource|favicon|\[HMR\]|DevTools/i.test(t))return;errors.push('console: '+t.slice(0,200));});
  const cdp=await ctx.newCDPSession(page);
  const shot=async name=>{if(CLIP)return;fs.mkdirSync(SHOTS,{recursive:true});await page.screenshot({path:path.join(SHOTS,`popup-${name}.png`)});};
  await page.goto(`${BASE}/arcade?game=popup`,{waitUntil:'domcontentloaded',timeout:180000});
  await page.waitForSelector('[data-popup-card=start]',{timeout:180000});await wait(800);
  if(!daily)await page.locator(`[data-popup-arena]`).nth(ARENA).click();
  await page.locator(daily?'[data-popup-daily]':'[data-popup-play]').click();
  await page.waitForFunction(()=>window.__popup&&window.__popup.phase==='playing'&&window.__popup.game,null,{timeout:30000});await wait(1300);
  const st=()=>page.evaluate(()=>{const h=window.__popup,g=h.game,s=g.state,r=h.stage,v=h.view,a=h.aspect();
   const open=s.targets.filter(t=>t.on&&t.st===2&&t.kind!==8).sort((x,y)=>y.up-x.up).map(t=>({id:t.id,...g.aimOf(t,a)}));const b=v.project(...g.arena.ball);
   return {phase:h.phase,over:s.over,t:s.t,score:s.score,rack:s.rack,triple:s.triple,balls:s.balls.filter(b=>b.on).length,knocks:s.stats.knocks,flicks:s.stats.flicks,open,ball:{x:r.left+b.x,y:r.top+b.y},H:r.height,info:v.info()};});
  // a swipe from just under the ball along the aim; the length/speed gives the power (core.ts flickFromSwipe)
  let tid=0;const swipe=async(o,ball,H)=>{const ms=70,len=Math.max(.06,.15+o.power*.2)*H,spd=len/H/(ms/1000),want=.45+o.power*2.15,k=want/spd;const dur=Math.max(30,ms/k);
   const x0=ball.x,y0=ball.y+8,dx=Math.sin(o.ang)*len,dy=-Math.cos(o.ang)*len,steps=5,id=++tid;
   if(mobile){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0,id}]});for(let i=1;i<=steps;i++){await wait(dur/steps);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+dx*i/steps,y:y0+dy*i/steps,id}]});}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else{await page.mouse.move(x0,y0);await page.mouse.down();for(let i=1;i<=steps;i++){await wait(dur/steps);await page.mouse.move(x0+dx*i/steps,y0+dy*i/steps);}await page.mouse.up();}};
  const rate=[],infos=[];let shotMid=false,shotMulti=false;const t0=Date.now();
  // --clip: CDP screencast frames (jpeg) with their timestamps; times.txt lets ffmpeg keep the real pacing
  const times=[];if(CLIP){fs.mkdirSync(CLIP,{recursive:true});cdp.on('Page.screencastFrame',f=>{const n=times.length;fs.writeFileSync(path.join(CLIP,`f${String(n).padStart(4,'0')}.jpg`),Buffer.from(f.data,'base64'));times.push(f.metadata.timestamp);cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
   await cdp.send('Page.startScreencast',{format:'jpeg',quality:75,everyNthFrame:1});}
  for(let k=0;k<4000;k++){const s=await st();if(s.over||s.phase!=='playing')break;
   if(s.open.length&&s.rack>0)for(const o of s.open.slice(0,s.triple>0?1:2)){await swipe(o,s.ball,s.H);await wait(70);}
   else await wait(90);
   if(k%15===0)infos.push(s.info);
   const s2=await st();if(!shotMid&&s2.t>16&&s2.balls>=1){shotMid=true;await shot(`${NAME}-a${ARENA}`);}
   if(!shotMulti&&s2.balls>=3&&s2.t>8){shotMulti=true;await shot(`${NAME}-a${ARENA}-multi`);}
   if(Date.now()-t0>(CLIP?16000:90000)&&CLIP)break;}
  if(CLIP){await cdp.send('Page.stopScreencast');fs.writeFileSync(path.join(CLIP,'list.txt'),times.map((t,i)=>`file 'f${String(i).padStart(4,'0')}.jpg'\nduration ${Math.max(.01,(times[i+1]??t+.033)-t).toFixed(4)}`).join('\n'));console.log(`clip: ${times.length} frames over ${(times[times.length-1]-times[0]).toFixed(1)} s`);}
  const s=await st();check(s.knocks>=5,'knocked targets down with real swipes',`${s.knocks} of ${s.flicks} flicks, ${s.score} pts`);
  const calls=infos.map(i=>i.calls),tris=infos.map(i=>i.triangles);console.log(`draws ${Math.min(...calls)}-${Math.max(...calls)}, triangles ${Math.min(...tris)}-${Math.max(...tris)}, programs ${s.info.programs}, textures ${s.info.textures}`);
  {const a=await page.evaluate(()=>window.__rafCalls);await wait(1000);const b=await page.evaluate(()=>window.__rafCalls);console.log(`rAF in 1 s while playing: ${b-a}`);rate.push(b-a);}
  if(!CLIP){await page.waitForSelector('[data-popup-card=results]',{timeout:90000});await wait(600);
   const a=await page.evaluate(()=>window.__rafCalls);await wait(1000);const b=await page.evaluate(()=>window.__rafCalls);check(b-a<=2,'the loop sleeps on the results card',`${b-a} rAF`);
   if(has('shots'))await shot(`${NAME}-results`);}
  check(errors.length===0,'no page errors',errors.slice(0,3).join(' | '));
 }finally{await browser.close();}
 if(fails.length){console.log(`FAILED: ${fails.length}`);process.exit(1);}console.log('popup browser check passed');
})().catch(e=>{console.error(e);process.exit(1);});
