#!/usr/bin/env node
// Candidate stills for the arcade games' shot strips (Nov 20 2026, owner: "each game should have 4 smaller ones and one large
// video"; Air Futbol's shots all showed the same GOAL! burst). Plays one game in headless Chrome on a 390x844 phone (DPR 2) with
// a simple scripted player and saves a JPEG of the screen every --every ms (plus a JSON line of game state) into --out, so a
// person can pick real moments of play. The picked frames are then encoded with cwebp at 480x1039 into public/games/shots/.
// Usage: node scripts/capture-game-shots.cjs --port=9033 --game=airhockey --out=/tmp/x [--seconds=40] [--every=400] [--setup=js]
// Never point it at 8092 (the owner's dev server).
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(`--${k}=`));return a?a.slice(k.length+3):d;};
const port=arg('port',process.env.PORT),BASE=port?`http://localhost:${port}`:'';
if(!BASE||port==='8092'){console.error('Pass your own server: --port=<port> (never 8092).');process.exit(1);}
const GAME=arg('game'),OUT=arg('out'),SECONDS=+arg('seconds',40),EVERY=+arg('every',400),SETUP=arg('setup','');
fs.mkdirSync(OUT,{recursive:true});
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0');}catch{}};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});
 try{const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});await ctx.addInitScript(seed);
  const page=await ctx.newPage(),cdp=await ctx.newCDPSession(page),wait=ms=>page.waitForTimeout(ms);
  const tap=async(x,y)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await wait(40);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  const swipe=async(x0,y0,x1,y1,ms=160,steps=8)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0,id:1}]});for(let k=1;k<=steps;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*k/steps,y:y0+(y1-y0)*k/steps,id:1}]});await wait(ms/steps);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  const G=require(path.join(__dirname,'capture-game-shots-players.cjs'))[GAME];if(!G)throw new Error('unknown game '+GAME);
  await page.goto(`${BASE}/arcade?game=${GAME}`,{waitUntil:'domcontentloaded',timeout:180000});
  await page.waitForSelector(G.start,{timeout:120000});await wait(1500);
  await page.locator(G.start).first().tap();await wait(G.settle??1200);
  if(SETUP)await page.evaluate(SETUP);
  const H={page,cdp,wait,tap,swipe,stop:false};
  let n=0;const t0=Date.now();
  const grab=(async()=>{while(Date.now()-t0<SECONDS*1000&&!H.stop){const t=Date.now();const meta=G.meta?await page.evaluate(G.meta).catch(()=>null):null;
    await page.screenshot({path:path.join(OUT,`f${String(n).padStart(3,'0')}.jpg`),type:'jpeg',quality:92});
    fs.appendFileSync(path.join(OUT,'meta.jsonl'),JSON.stringify({n,t:((t-t0)/1000).toFixed(1),...meta})+'\n');n++;await wait(Math.max(0,EVERY-(Date.now()-t)));}H.stop=true;})();
  const play=(async()=>{try{await G.play(H);}catch(e){console.log('player stopped:',e.message.slice(0,160));}})();
  await grab;H.stop=true;await play;console.log(`${GAME}: ${n} frames in ${OUT}`);
 }finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exit(1);});
