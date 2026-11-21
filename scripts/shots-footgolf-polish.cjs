#!/usr/bin/env node
// FootGolf Island look check (Nov 21 2026 polish pass): phone-size shots of the aim view at chosen holes, a flyover frame and a putt view,
// plus draw calls / triangles per hole (renderer.info) at each tee. Always --mute-audio; pass your own server (never 8092).
//   node scripts/shots-footgolf-polish.cjs --port=<n> --out=<dir> [--tag=before] [--holes=0,2,6,8] [--size=390x844] [--all]
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.some(a=>a===`--${n}`);
const port=arg('port');if(!port||port==='8092'){console.error('--port=<your port>');process.exit(1);}
const OUT=arg('out'),tag=arg('tag')||'shot',[vw,vh]=(arg('size')||'390x844').split('x').map(Number),mobile=vw<700;
const holes=has('all')?[0,1,2,3,4,5,6,7,8]:(arg('holes')||'0,2,6,8').split(',').map(Number),wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{const ctx=await browser.newContext({viewport:{width:vw,height:vh},deviceScaleFactor:mobile?2:1,hasTouch:mobile,isMobile:mobile});
  await ctx.addInitScript(()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'t',at:1}},packs:[]}));}catch{}});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e).slice(0,200)));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource|supabase|net::ERR/i.test(m.text()))errors.push(m.text().slice(0,200));});
  if(OUT)fs.mkdirSync(OUT,{recursive:true});const shot=n=>OUT?page.screenshot({path:path.join(OUT,`${tag}-${n}.png`)}):0;
  await page.goto(`http://localhost:${port}/arcade?game=footgolf`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-footgolf-play]',{timeout:180000});await wait(1200);
  await page.click('[data-footgolf-play]');await page.waitForSelector('[data-footgolf-hud]',{timeout:20000});
  const ev=(f,a)=>page.evaluate(f,a);
  for(const h of holes){await ev(i=>window.__footgolf.loadHole(i),h);
   if(h===0&&!has('noflight')){await wait(300);await shot('flyover-a');await wait(1200);await shot('flyover');await wait(1300);await shot('flyover-c');}
   await ev(()=>{window.__footgolf.view.skipFlyover();window.__footgolf.wake();});await wait(1600);
   const i=await ev(()=>window.__footgolf.view.info());console.log(`hole ${h+1}: ${i.calls} draws, ${i.triangles} tris (scene ${i.tris}, baked ${i.scenery}) ${JSON.stringify(i.parts)}, ${i.textures} tex, ${i.programs} prog`);await shot(`hole${h+1}`);
   if(h===0||h===5){// a putt view a few metres from the cup
    await ev(()=>{const f=window.__footgolf,H=f.game.state.hole;f.placeBall(H.cup[0]+1.2,H.cup[1]+3.4);f.setKind('putt');f.wake();});await wait(1600);await shot(`putt${h+1}`);}}
  if(has('kick')){await ev(()=>window.__footgolf.loadHole(0));await ev(()=>{window.__footgolf.view.skipFlyover();window.__footgolf.wake();});await wait(1500);
   const cdp=await ctx.newCDPSession(page),frames=[];await cdp.send('Page.startScreencast',{format:'jpeg',quality:70,maxWidth:780,everyNthFrame:1});cdp.on('Page.screencastFrame',f=>{frames.push(f.data);cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
   const r=await ev(()=>{const e=document.querySelector('[data-footgolf-stage]').getBoundingClientRect();return {x:e.x+e.width/2,y:e.y+e.height*.42};});
   await wait(700);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y,id:1}]});for(let i=1;i<=14;i++){await wait(60);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x,y:r.y+i*13,id:1}]});}
   await wait(500);if(OUT)await page.screenshot({path:path.join(OUT,`${tag}-charge.png`)});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(180);if(OUT)await page.screenshot({path:path.join(OUT,`${tag}-strike.png`)});
   await wait(8000);await cdp.send('Page.stopScreencast');const dir=path.join(OUT,'.frames');fs.mkdirSync(dir,{recursive:true});frames.forEach((d,i)=>fs.writeFileSync(path.join(dir,`f${String(i).padStart(4,'0')}.jpg`),Buffer.from(d,'base64')));console.log(`kick frames ${frames.length}`);}
  console.log(errors.length?`errors: ${errors.join(' | ')}`:'no console errors');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
