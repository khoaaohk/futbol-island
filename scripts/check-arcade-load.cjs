// Arcade load timing + prod-safe smoke (Nov 11 2026). Runs against a PRODUCTION server (next start); uses only visible UI.
//   node scripts/check-arcade-load.cjs --port=8148 [--profiles=slow,fast] [--urls=room,kitrush,...] [--smoke] [--runs=1]
// Timing mode: one cold (cache-disabled) load per URL and network profile on a 390x664 phone; prints first paint, time until the
// loading card is gone and the first tap target (room: the walkable canvas; games: Play / a puzzle level) is visible and enabled,
// transfer bytes (by playable, and total 3 s later), request count, chunk "generations" (initiator depth: HTML=1, a chunk it loads=2, ...) and the 5 largest files.
// Smoke mode (--smoke): phone + desktop, unthrottled: each game Play -> a few seconds -> Arcade back button -> room -> enter a game
// from the room; fails on any page error or console error (5xx answers from the local server, e.g. an API without its store
// configured, are listed, not failed: the console line for them is the browser's own resource error).
const {chromium}=require('playwright');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(`--${k}=`));return a?a.slice(k.length+3):d;};
const port=arg('port','8148'),base=`http://localhost:${port}`;
const GAMES=['kitrush','snake','runner','tennis','pinball','puzzle','airhockey'];
const urls=arg('urls',['room',...GAMES].join(',')).split(',');
const PROFILES={slow:{latency:400,downloadThroughput:400*1024/8,uploadThroughput:400*1024/8},fast:{latency:165,downloadThroughput:9000*1024/8*0.9,uploadThroughput:1500*1024/8*0.9}};
const profiles=arg('profiles','slow,fast').split(',');
const runs=Number(arg('runs','1'));
const PHONE={viewport:{width:390,height:664},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'};
const pathOf=id=>id==='room'?'/arcade':`/arcade?game=${id}`;
// The first tap target per URL, visible and enabled, with every loading card gone.
async function waitPlayable(page,id,timeout){
 // The room's loading card is server-rendered; main[data-entering=false] only flips after it is revealed (hydrated + first draw).
 await page.locator('main[aria-label="The Arcade"][data-entering="false"]').waitFor({state:'attached',timeout});
 await page.locator('[data-arcade-loading]').waitFor({state:'detached',timeout});
 await page.locator('[data-arcade-game-loading]').waitFor({state:'detached',timeout});
 // Games: the start card's Play button ("Play", or "Play <mode line>" on Air Futbol / Pass Puzzles).
 const target=id==='room'?page.locator('canvas[aria-label^="Walkable arcade room"]'):page.getByRole('button',{name:/^Play(\b|[A-Z])/}).first();
 await target.waitFor({state:'visible',timeout});
 await page.waitForFunction(el=>el&&!el.disabled,await target.elementHandle({timeout}),{timeout});
 return target;
}
async function timeOne(browser,id,profile){
 const ctx=await browser.newContext(PHONE);const page=await ctx.newPage();const cdp=await ctx.newCDPSession(page);
 await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await cdp.send('Network.emulateNetworkConditions',{offline:false,...PROFILES[profile]});
 const reqs=new Map(),depthByUrl=new Map();
 cdp.on('Network.requestWillBeSent',e=>{const urls=[];const walk=s=>{if(!s)return;for(const f of s.callFrames||[])urls.push(f.url);walk(s.parent);};if(e.initiator.url)urls.push(e.initiator.url);walk(e.initiator.stack);
  let d=1;for(const u of urls){const k=depthByUrl.get(u.split('?')[0]);if(k)d=Math.max(d,k+1);}const u=e.request.url.split('?')[0];if(!depthByUrl.has(u))depthByUrl.set(u,d);
  reqs.set(e.requestId,{url:e.request.url,type:e.type,start:e.timestamp,depth:d,bytes:0});});
 cdp.on('Network.loadingFinished',e=>{const r=reqs.get(e.requestId);if(r){r.bytes=e.encodedDataLength;r.end=e.timestamp;}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const t0=Date.now();await page.goto(base+pathOf(id),{waitUntil:'commit',timeout:120000});
 let ready=null,atReady=null;try{await waitPlayable(page,id,90000);ready=(Date.now()-t0)/1000;atReady=[...reqs.values()].filter(r=>r.end).reduce((s,r)=>s+r.bytes,0)/1024;}catch(e){errors.push('not playable: '+e.message.split('\n')[0]);}
 const fcp=await page.evaluate(()=>{const p=performance.getEntriesByName('first-contentful-paint')[0];return p?p.startTime/1000:null;});
 await page.waitForTimeout(3000);// anything fetched just after the start card (idle prefetch, party layer) counts in the total
 const all=[...reqs.values()].filter(r=>!r.url.startsWith('data:'));
 const bytes=all.reduce((s,r)=>s+r.bytes,0),depth=Math.max(...all.filter(r=>/\.(js|css)(\?|$)/.test(r.url)||r.type==='Document').map(r=>r.depth));
 const top=all.filter(r=>r.bytes>0).sort((a,b)=>b.bytes-a.bytes).slice(0,5).map(r=>`${r.url.split('?')[0].split('/').pop()} ${(r.bytes/1024).toFixed(0)}k`);
 await ctx.close();
 return {id,profile,fcp,ready,atReady,kb:bytes/1024,requests:all.length,depth,top,errors};
}
async function smoke(browser){
 const fail=[];
 for(const mobile of [true,false]){
  const ctx=await browser.newContext(mobile?PHONE:{viewport:{width:1280,height:800}});
  for(const id of GAMES){
   const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push('pageerror '+e.message));const bad5xx=[];page.on('response',r=>{if(r.status()>=500)bad5xx.push(`${r.status()} ${new URL(r.url()).pathname}`);});page.on('console',m=>{if(m.type()==='error'&&!/^Failed to load resource: the server responded with a status of 5\d\d/.test(m.text()))errs.push('console '+m.text());});
   try{
    await page.goto(base+pathOf(id));const target=await waitPlayable(page,id,60000);
    await target.click();
    if(id==='puzzle'){const start=page.getByRole('button',{name:'Start puzzle',exact:true});await start.waitFor({state:'visible',timeout:10000}).then(()=>start.click()).catch(()=>{});}
    await page.waitForTimeout(3000);
    // The Arcade back button (ArcadeTopBar); a game may first show its pause card, so take whichever exit is offered.
    const back=page.getByRole('button',{name:'Arcade',exact:true}).first();await back.click({timeout:10000});
    for(let i=0;i<3&&new URL(page.url()).searchParams.get('game');i++){await page.waitForTimeout(500);const again=page.getByRole('button',{name:/^(Arcade|Leave|Back to the arcade|Quit)/}).first();if(await again.isVisible().catch(()=>false))await again.click().catch(()=>{});}
    await waitPlayable(page,'room',60000);
    // Enter a game from the room: the cabinet prompt if standing at one, else hover pinball (desktop) or tap the canvas (phone).
    let prompt=page.locator('[data-arcade-play]');
    if(!(await prompt.isVisible().catch(()=>false))){if(mobile){for(const [x,y] of [[195,250],[100,200],[290,200],[60,300],[330,300]]){await page.touchscreen.tap(x,y);await page.waitForTimeout(2500);if(await prompt.isVisible().catch(()=>false))break;}}else{await page.mouse.move(125,333);await page.waitForTimeout(1500);}}
    prompt=page.locator('[data-arcade-play]');await prompt.waitFor({state:'visible',timeout:15000});const next=await prompt.getAttribute('data-arcade-play');await prompt.click();
    await waitPlayable(page,next,60000);
    console.log(`SMOKE ${mobile?'phone':'desktop'} ${id} -> back -> room -> ${next} ok${errs.length?' ERRORS: '+errs.join(' | '):''}${bad5xx.length?' (server 5xx, local env: '+[...new Set(bad5xx)].join(', ')+')':''}`);
    if(errs.length)fail.push(`${id}: ${errs.join(' | ')}`);
   }catch(e){fail.push(`${mobile?'phone':'desktop'} ${id}: ${e.message.split('\n')[0]} ${errs.join(' | ')}`);console.log(`SMOKE ${mobile?'phone':'desktop'} ${id} FAIL ${e.message.split('\n')[0]}`);}
   await page.close();
  }
  await ctx.close();
 }
 return fail;
}
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});let code=0;try{
 if(process.argv.includes('--smoke')){const f=await smoke(browser);if(f.length){console.log('SMOKE FAIL\n'+f.join('\n'));code=1;}else console.log('SMOKE PASS');}
 else{console.log('| URL | profile | first paint s | playable s | KB by playable | KB total (+3 s) | requests | generations | largest |');console.log('|---|---|---|---|---|---|---|---|---|');
  for(const profile of profiles)for(const id of urls)for(let i=0;i<runs;i++){const r=await timeOne(browser,id,profile);
   console.log(`| ${pathOf(id)} | ${profile} | ${r.fcp?.toFixed(2)??'-'} | ${r.ready?.toFixed(2)??'FAIL'} | ${r.atReady?.toFixed(0)??'-'} | ${r.kb.toFixed(0)} | ${r.requests} | ${r.depth} | ${r.top.join(', ')} |`);
   if(r.errors.length){console.log('  errors: '+r.errors.join(' | '));code=1;}}}
}finally{await browser.close();}process.exit(code);})().catch(e=>{console.error(e);process.exit(1);});
