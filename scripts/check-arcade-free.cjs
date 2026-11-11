#!/usr/bin/env node
// Free arcade check (Nov 11 2026, owner: "make all arcade games free"). A clean profile (no localStorage at all, so 0 coins)
// opens every /arcade?game=<id> link on the phone profile (390x844; Breakaway Run at 844x390), checks the start card shows no
// price ("coins" next to Play, "You need … more coins"), taps Play and asserts a round really starts, no coin was spent and the
// balance is never negative. --shots also writes docs/arcade-aaa/shots/free-start-cards.png (the six start cards tiled).
//   node scripts/check-arcade-free.cjs --port=<n> [--shots] [--headed]
// Pass your own server; never the owner's dev server on 8092.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.includes(`--${n}`);
const port=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(port?`http://localhost:${port}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (not 8092) or FUTBOL_BASE_URL=<url>.');process.exit(1);}
const SHOTS=path.join(__dirname,'..','docs','arcade-aaa','shots');
const fails=[],check=(ok,what,detail='')=>{console.log(`${ok?'ok  ':'FAIL'} ${what}${detail?` (${detail})`:''}`);if(!ok)fails.push(what);};
const arcade3d=()=>window.__arcade3d?.phaseRef.current==='playing';
// id, start-card selector, the Play button, how we know a round is running
const GAMES=[
 {id:'kitrush',name:'Kit Rush',card:'[data-kitrush-card="start"]',play:'[data-kitrush-play]',running:()=>window.__kitrush?.phase==='playing'},
 {id:'snake',name:'Squad Snake',card:'[data-snake-card="start"]',play:'[data-snake-play]',running:()=>window.__snake?.phase==='playing'},
 {id:'runner',name:'Breakaway Run',landscape:true,card:'[data-arcade-kind="runner"]',play:null,running:arcade3d},
 {id:'tennis',name:'Futbol Tennis',card:'[data-arcade-kind="tennis"]',play:null,running:arcade3d},
 {id:'pinball',name:'Futbol Pinball',card:'[data-arcade-kind="pinball"]',play:null,running:arcade3d},
 {id:'puzzle',name:'Pass Puzzles',card:'[data-arcade-kind="pass-puzzle"]',play:null,running:()=>window.__passPuzzle?.world?.state.phase==='aiming'&&!/Endless Run/.test(document.body.innerText)}];// the chooser closes on Play
const wallet=()=>{let w=null;try{w=JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1')||'null');}catch{}if(!w)return{balance:0,plays:0};
 const sum=o=>Object.values(o||{}).reduce((n,x)=>n+(x.paid??x.cost??0),0);
 return{balance:sum(w.runs)-(w.packs||[]).reduce((n,p)=>n+p.cost,0)-sum(w.spends),plays:Object.keys(w.spends||{}).filter(k=>k.startsWith('play:')).length};};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:!has('headed'),args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const tiles=[];
 try{
  for(const g of GAMES){
   const [w,h]=g.landscape?[844,390]:[390,844];
   const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,isMobile:true,hasTouch:true});// fresh context = no localStorage
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));
   page.on('console',m=>{if(m.type()!=='error')return;const t=m.text();if(/arcade-board|Failed to load resource|favicon|\[HMR\]|Download the React DevTools/i.test(t))return;errors.push('console: '+t.slice(0,200));});
   try{
    await page.goto(`${BASE}/arcade?game=${g.id}`,{waitUntil:'domcontentloaded',timeout:120000});
    await page.waitForSelector(g.card,{timeout:90000});await page.locator('[data-arcade-loading]').waitFor({state:'detached',timeout:60000}).catch(()=>{});await page.waitForTimeout(1200);
    const before=await page.evaluate(wallet);check(before.plays===0,`${g.name}: clean profile, no plays paid`,`balance ${before.balance}`);
    const text=await page.evaluate(()=>document.body.innerText);
    check(!/\d+\s*coins?\s*(per|a)\s*(play|match)|more coins?\b.*earn|Play\s*\d+\s*coins?/i.test(text),`${g.name}: start screen shows no price`,(text.match(/.{0,30}coins?.{0,30}/i)||[''])[0].replace(/\n/g,' '));
    if(has('shots'))tiles.push({name:g.name,landscape:!!g.landscape,b64:(await page.screenshot()).toString('base64')});
    if(g.play)await page.locator(g.play).first().tap();
    else await page.getByRole('button',{name:/^play/i}).first().tap();
    const started=await page.waitForFunction(g.running,null,{timeout:10000}).then(()=>true,()=>false);
    check(started,`${g.name}: Play starts a round with 0 coins`);
    const msg=await page.evaluate(()=>/You need \d+ more coin/.test(document.body.innerText));check(!msg,`${g.name}: no "not enough coins" wall`);
    await page.waitForTimeout(800);const after=await page.evaluate(wallet);
    check(after.balance>=0&&after.balance>=before.balance&&after.plays===0,`${g.name}: no coin spent, balance never negative`,`before ${before.balance}, after ${after.balance}`);
    check(errors.length===0,`${g.name}: no console errors`,errors.slice(0,2).join(' | '));
   }catch(e){check(false,`${g.name}: run`,e.message.slice(0,200));}
   await ctx.close();
  }
  if(has('shots')&&tiles.length){
   const ctx=await browser.newContext({viewport:{width:1520,height:480},deviceScaleFactor:1});const page=await ctx.newPage();
   const cell=t=>`<figure><img src="data:image/png;base64,${t.b64}" style="height:${t.landscape?195:422}px"><figcaption>${t.name}</figcaption></figure>`;
   await page.setContent(`<body style="margin:0;padding:16px;background:#14121f;font:600 14px system-ui;color:#fff;display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">${tiles.map(cell).join('')}<style>figure{margin:0}img{display:block;border-radius:8px}figcaption{margin-top:6px}</style></body>`);
   await page.locator('body').screenshot({path:path.join(SHOTS,'free-start-cards.png')});await ctx.close();console.log('wrote docs/arcade-aaa/shots/free-start-cards.png');
  }
 }finally{await browser.close();}
 console.log(fails.length?`FAIL ${fails.length}: ${fails.join('; ')}`:'PASS every arcade game starts free from a clean profile');process.exit(fails.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
