// Pop-Up Shot polish shots (Nov 21 2026): one phone picture per arena mid-round (and a multi-ball moment), with renderer.info.
//   node scripts/shots-popup-polish.cjs --port=<n> --out=<dir> [--arenas=0,1,2,3,4] [--tag=after] [--multi] [--size=390x844]
// Flicks go through the page's own fire() (window.__popup, dev builds only), aimed with the core's aimOf, so the kicker reacts as in play.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.includes(`--${n}`);
const port=arg('port');if(!port||port==='8092'){console.error('Pass your own --port (not 8092).');process.exit(1);}
const OUT=arg('out')||'shots',TAG=arg('tag')||'after',AR=(arg('arenas')||'0,1,2,3,4').split(',').map(Number),[vw,vh]=(arg('size')||'390x844').split('x').map(Number);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0');
 if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'playtest entry',at:1}},packs:[]}));}catch{}};
(async()=>{fs.mkdirSync(OUT,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{const ctx=await browser.newContext({viewport:{width:vw,height:vh},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  await ctx.route('**/api/arcade-board/**',r=>{const u=r.request().url();r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(u.includes('/start')?{ok:true,token:'check'}:u.includes('/top')?{ok:true,all:[],size:20}:{ok:true})});});
  await ctx.addInitScript(seed);const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message.slice(0,200)));
  for(const A of AR){
   await page.goto(`http://localhost:${port}/arcade?game=popup`,{waitUntil:'domcontentloaded',timeout:180000});
   await page.waitForSelector('[data-popup-card=start]',{timeout:180000});await wait(600);
   await page.locator('[data-popup-arena]').nth(A).click();await page.locator('[data-popup-play]').click();
   await page.waitForFunction(()=>window.__popup&&window.__popup.phase==='playing'&&window.__popup.game,null,{timeout:30000});await wait(1500);
   const fireOne=(n)=>page.evaluate(n=>{const h=window.__popup,g=h.game,s=g.state,a=h.aspect();if(s.rack<2)n=0;const open=s.targets.filter(t=>t.on&&t.st===2&&t.kind!==8).sort((x,y)=>y.up-x.up);
    for(let i=0;i<Math.min(n,open.length);i++){const o=g.aimOf(open[i],a);h.fire(o.ang,o.power,0);}return {t:s.t,balls:s.balls.filter(b=>b.on).length,info:h.view.info()};},n);
   const infos=[];let shotA=false,shotM=!has('multi');
   for(let k=0;k<400&&!(shotA&&shotM);k++){const r=await fireOne(1);if(k%6===0)infos.push(r.info);await wait(320);
    if(!shotA&&r.t>9){const q=await page.evaluate(()=>window.__popup.game.state.balls.filter(b=>b.on).length);if(q>=1){shotA=true;await page.screenshot({path:path.join(OUT,`${TAG}-a${A}.png`)});}}
    if(!shotM&&r.t>12){await page.evaluate(()=>{const g=window.__popup.game;g.state.triple=Math.max(g.state.triple,2);});await fireOne(1);await wait(260);await page.screenshot({path:path.join(OUT,`${TAG}-a${A}-multi.png`)});shotM=true;}}
   const c=infos.map(i=>i.calls),t=infos.map(i=>i.triangles);console.log(`arena ${A}: draws ${Math.min(...c)}-${Math.max(...c)}, triangles ${Math.min(...t)}-${Math.max(...t)}`);}
  console.log(errors.length?`errors: ${errors.slice(0,3).join(' | ')}`:'no page errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
