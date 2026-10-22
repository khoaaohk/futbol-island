// Bug squad top bar + firefly lessons browser check (Oct 21 2026; docs/island-jobs.md §15 "Firefly lessons and the permanent Bug squad
// top bar"). Day and Night at 1288x717 and 390x844 with a long-time player's save (pill seen): start the shift at the sign, then after
// each step the top bar [data-bug-bar] must exist OUTSIDE the HUD stack, be on screen and on top (elementFromPoint), hold the hint (➤)
// and End (×), and the stack must start below it. Steps: start, the HUD stack hidden (a stuck flag), hint, catches (two fireflies and a
// repeat of the same call at Night: the card shows the call, the Coaching idea and a different Real football fact), 20 s, End (two taps).
// No End button on the action cluster. Screenshots to $BUG_SHOTS (default /tmp/firefly-lessons). Fails on console / page errors.
// usage: FUTBOL_BASE_URL=http://localhost:8791 node scripts/check-bug-bar-browser.cjs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.env.BUG_SHOTS||'/tmp/firefly-lessons',base=process.env.FUTBOL_BASE_URL||'http://localhost:8791';fs.mkdirSync(OUT,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms)),SIGN={x:606,z:133.5};
const barCheck=async(page,step,log)=>{const p=await page.evaluate(()=>{const j=window.__fi2Jobs;if(!j.run)return {ok:false,why:'no run'};
  const staged=document.documentElement.hasAttribute('data-catch-stage')||!!j.getView().releasing||!!j.getView().zooming;
  const bar=document.querySelector('[data-bug-bar]');if(!bar)return {ok:false,why:'no bar in the DOM'};if(staged)return {ok:true,staged:true};
  const r=bar.getBoundingClientRect(),cs=getComputedStyle(bar.querySelector('[data-job-active]')),hint=bar.querySelector('[data-bug-hint]'),end=bar.querySelector('[data-bug-end]');
  const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2),stack=document.querySelector('[data-hud-stack]'),st=stack?.getBoundingClientRect();
  const cluster=!!document.querySelector('.travel-actions [data-job-end],.job-end-mini,[data-job-end-count]');
  const ok=r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight&&+cs.opacity>.5&&cs.visibility==='visible'&&!!hit&&bar.contains(hit)&&!!hint&&!!end&&!bar.closest('[data-hud-stack]')&&!cluster&&(!st||st.height===0||st.top>=r.bottom-1);
  return {ok,why:ok?'':JSON.stringify({rect:[r.x|0,r.y|0,r.width|0,r.height|0],op:cs.opacity,vis:cs.visibility,hit:hit&&(String(hit.className)||hit.tagName),hint:!!hint,end:!!end,stackTop:st&&st.top|0,cluster,html:bar.outerHTML.slice(0,300)}),
   text:bar.innerText.replace(/\s+/g,' ').slice(0,60)};});
 log.push(`${step}:${p.ok?(p.staged?'staged':'ok'):'FAIL'}${p.text?' ['+p.text+']':''}`);assert(p.ok,`top bar after ${step}: ${p.why}`);};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio','--use-angle=metal']});const report={};
 try{for(const vp of [{tag:'desktop',w:1288,h:717,mobile:false},{tag:'phone',w:390,h:844,mobile:true}])for(const time of ['day','night']){const key=`${vp.tag}-${time}`,log=[];report[key]={log};
  const ctx=await browser.newContext({viewport:{width:vp.w,height:vp.h},isMobile:vp.mobile,hasTouch:vp.mobile,deviceScaleFactor:vp.mobile?2:1});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>{if(!/ChunkLoadError|Loading chunk|error while hydrating/.test(e.message))errors.push(e.message);});
  page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon|net::ERR|404/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(({SIGN,time})=>{if(sessionStorage.getItem('bar-test-seeded'))return;sessionStorage.setItem('bar-test-seeded','1');
   localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-time-of-day',time);localStorage.setItem('fi2-bug-pill-v1','1');
   for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);
   sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:SIGN.x,z:SIGN.z,yaw:Math.PI,ride:'walk',flightHeight:0}));},{SIGN,time});
  await page.goto(base+'/?from=konbini',{timeout:240000});await page.waitForFunction(()=>window.__fi2&&window.__fi2Jobs,null,{timeout:180000});
  await page.locator('[data-island-return-loading]').waitFor({state:'detached',timeout:90000}).catch(()=>{});await wait(1500);
  const tap=loc=>vp.mobile?loc.tap():loc.click();
  const offer=page.locator('[data-job-offer="bug-scout"]');await offer.waitFor({timeout:20000});await tap(offer);
  const go=page.getByRole('button',{name:'Start job'});await go.waitFor({timeout:8000});await tap(go);await page.waitForFunction(()=>window.__fi2Jobs.run,null,{timeout:8000});await wait(1200);
  await barCheck(page,'start',log);
  await page.evaluate(()=>{document.querySelector('[data-hud-stack]').hidden=true;});await wait(400);await barCheck(page,'stack-hidden',log);await page.evaluate(()=>{document.querySelector('[data-hud-stack]').hidden=false;});
  await tap(page.locator('[data-bug-bar] [data-bug-hint]'));await wait(600);await barCheck(page,'hint',log);
  // Catches: the nearest target, then a repeat of the same call / species when one is out.
  const targets=()=>page.evaluate(()=>{const f=window.__fi2,l=f.location;return f.wildBugs.query(l.x,0,l.z,3000).map(b=>({id:b.id,x:b.x,y:b.y,z:b.z,k:b.call?.id??b.species?.id}));});
  const catchOne=async b=>{const x=b.x+1.6*Math.sign(SIGN.x-b.x||1)*.7,z=b.z+1.6*Math.sign(SIGN.z-b.z||1)*.7;await page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),{x,z,yaw:Math.atan2(b.x-x,b.z-z)});await wait(600);
   const before=await page.evaluate(()=>window.__fi2Jobs.getView().caught?.nonce??0);await page.keyboard.press('Space');await wait(400);await barCheck(page,'swing',log);
   await page.waitForFunction(n=>(window.__fi2Jobs.getView().caught?.nonce??0)>n&&!window.__fi2Jobs.getView().zooming,before,{timeout:9000}).catch(()=>{});await wait(900);
   return page.evaluate(()=>{const c=document.querySelector('[data-bug-card]');return c?{id:c.getAttribute('data-bug-card'),title:c.querySelector('b')?.textContent,idea:c.querySelector('[data-bug-idea]')?.textContent??null,fact:c.querySelector('[data-bug-fact]')?.textContent??null}:null;});};
  const cards=[];let ts=await targets();
  for(let k=0;k<(time==='night'?3:1)&&ts.length;k++){const prev=cards.at(-1);const pick=k===2&&prev?ts.find(t=>t.k===prev.id)??null:ts[0];if(!pick){log.push('no repeat target out');break;}
   const c=await catchOne(pick);cards.push(c);await barCheck(page,`catch-${k+1}`,log);if(c&&time==='night'&&k<2)await page.screenshot({path:`${OUT}/${key}-card-${k+1}.png`});
   if(k===2&&c)await page.screenshot({path:`${OUT}/${key}-card-repeat.png`});ts=await targets();await wait(7600);}
  report[key].cards=cards;
  if(time==='night'){for(const c of cards.filter(Boolean)){assert(c.idea&&/^Coaching idea/.test(c.idea),`night card has the Coaching idea: ${JSON.stringify(c)}`);assert(c.fact&&/^Real football fact/.test(c.fact),'night card has a fact');assert(c.title&&c.title.endsWith('!'),'the call is the title');}
   const rep=cards[2],first=cards.find(c=>c&&rep&&c.id===rep.id);if(rep&&first&&first!==rep)assert.notEqual(rep.fact,first.fact,'a repeat catch rotates to another fact');}
  if(time==='day')await page.screenshot({path:`${OUT}/${key}-bar.png`});
  await wait(vp.tag==='desktop'&&time==='night'?20000:4000);await barCheck(page,'wait',log);
  await tap(page.locator('[data-bug-bar] [data-bug-end]'));await wait(300);if(await page.evaluate(()=>!!window.__fi2Jobs.run)){await barCheck(page,'end-ask',log);await tap(page.locator('[data-bug-bar] [data-bug-end]'));await wait(800);}
  report[key].ended=await page.evaluate(()=>!window.__fi2Jobs.run&&!document.querySelector('[data-bug-bar]')&&!document.documentElement.hasAttribute('data-bug-bar-on'));assert(report[key].ended,'End on the bar ends the shift and removes the bar + offset');
  report[key].errors=errors.slice(0,5);assert.equal(errors.length,0,`${key}: console errors ${errors.slice(0,3).join(' | ')}`);await ctx.close();}
  report.pass=true;
 }catch(e){report.error=String(e&&e.stack||e).slice(0,900);}
 finally{await browser.close();console.log(JSON.stringify(report,null,1));if(!report.pass)process.exitCode=1;}
})();
