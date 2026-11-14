// "Can a kid reach X" smoke steps (Nov 13 2026). Shared by scripts/smoke-fishing.mjs and any later release smoke check
// (docs/release-checklist.md). It drives a PRODUCTION build (`next start`) in headless Chromium through Playwright, which the
// repo already uses (playwright.config.ts, scripts/check-*-browser.cjs). Nothing here talks to a real server: /api/visit and
// /api/errors are answered locally, and the tracker itself is off under automation and on localhost anyway.
//
//   const run=createRun({base,shots}); await run.step('Fish button shows',async()=>{...});
//   newIsland(page) · gotoSpot(page,{x,z,yaw}) · waitHud(page,selector) · tapHud(page,selector,touch) · counts(page)
//
// A failing step throws a StepError naming the step; the caller saves a screenshot and exits non-zero.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(path.join(ROOT,'package.json'));
export const {chromium}=require('playwright');

/** The Chromium to drive: PW_EXE, else the build this playwright expects, else the newest one in the playwright cache
 *  (same order as scripts/check-fishing-browser.cjs, Nov 8 2026). */
export function browserPath(){
 const isFile=p=>{try{return !!p&&fs.statSync(p).isFile();}catch{return false;}};
 if(isFile(process.env.PW_EXE))return process.env.PW_EXE;
 try{const own=chromium.executablePath();if(isFile(own))return own;}catch{}
 const cache=process.env.PLAYWRIGHT_BROWSERS_PATH||path.join(os.homedir(),'Library/Caches/ms-playwright');
 const dirs=(()=>{try{return fs.readdirSync(cache);}catch{return [];}})().map(d=>/^(chromium_headless_shell|chromium)-(\d+)$/.exec(d)).filter(Boolean)
  .sort((a,b)=>Number(b[2])-Number(a[2])||(a[1]==='chromium_headless_shell'?-1:1));
 for(const m of dirs){const exe=m[1]==='chromium'?'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing':'chrome-headless-shell-mac-arm64/chrome-headless-shell';
  const p=path.join(cache,m[0],exe);if(isFile(p))return p;}
 return undefined;
}
export const launch=()=>chromium.launch({headless:true,executablePath:browserPath(),args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});

/** The phone and desktop a release must pass on. */
export const VIEWPORTS={
 phone:{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2},
 desktop:{viewport:{width:1440,height:900},isMobile:false,hasTouch:false,deviceScaleFactor:1},
};

/** Load a game module (TypeScript, its relative imports, npm packages) in a vm, like the node tests do, so a check reads the
 *  game's own data (spot positions…) instead of copies that go stale. */
export function loadGameModule(rel){
 const ts=require('typescript'),cache=new Map();
 const ctx=vm.createContext({console,Set,Map,WeakMap,Math,Date,JSON,Promise,Object,Array,Number,String,Boolean,Symbol,Error,TypeError,RangeError,RegExp,Infinity,NaN,isFinite,parseFloat,parseInt,URL,
  structuredClone,queueMicrotask,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Uint8ClampedArray,ArrayBuffer,DataView});
 const resolve=(from,id)=>{const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error(`Cannot resolve ${id} from ${from}`);};
 const load=file=>{if(cache.has(file))return cache.get(file).exports;if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};cache.set(file,mod);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',ctx)(mod.exports,mod,id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id));
  return mod.exports;};
 return load(path.join(ROOT,rel));
}

/** Start `next start` on `port` from `distDir` (a build made with NEXT_DIST_DIR=distDir). Returns {stop()} (kills by PID). */
export async function startServer({port,distDir}){
 if(!fs.existsSync(path.join(ROOT,distDir,'BUILD_ID')))throw Error(`No production build in ${distDir} (run NEXT_DIST_DIR=${distDir} npm run build:quiet first)`);
 if(await portBusy(port))throw Error(`Port ${port} is already in use`);
 const log=[];const child=spawn(path.join(ROOT,'node_modules/.bin/next'),['start','-p',String(port)],{cwd:ROOT,env:{...process.env,NEXT_DIST_DIR:distDir,PORT:String(port)},detached:true,stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',d=>log.push(String(d)));child.stderr.on('data',d=>log.push(String(d)));
 const stop=()=>{try{process.kill(-child.pid,'SIGTERM');}catch{}try{child.kill('SIGTERM');}catch{}};
 for(const until=Date.now()+60000;;){
  if(child.exitCode!==null)throw Error('next start exited: '+log.join('').slice(-400));
  try{const r=await fetch(`http://localhost:${port}/`);if(r.status<500)break;}catch{}
  if(Date.now()>until){stop();throw Error('next start did not answer in 60 s');}
  await new Promise(r=>setTimeout(r,300));
 }
 return {stop,url:`http://localhost:${port}`};
}
const portBusy=port=>new Promise(res=>{const s=net.connect(port,'127.0.0.1');s.once('connect',()=>{s.destroy();res(true);});s.once('error',()=>res(false));});

export class StepError extends Error{constructor(step,cause){super(`${step}: ${cause?.message??cause}`);this.step=step;this.cause=cause;}}

/** Steps with names: `run.step(name,fn)` logs the step and wraps a failure in a StepError naming it. */
export function createRun({label}){
 const t0=Date.now();
 return {label,async step(name,fn){const t=Date.now();try{const v=await fn();console.log(`  ok  ${label} · ${name} (${((Date.now()-t)/1000).toFixed(1)}s)`);return v;}catch(e){throw new StepError(`${label} · ${name}`,e);}},
  elapsed:()=>((Date.now()-t0)/1000).toFixed(1)};
}

/** A fresh tab as a brand-new player: empty storage, sound off, the analytics count probe on (window.__fi2.counts,
 *  lib/dev/debugHooks.ts countProbeAllowed), and the visit / error endpoints answered here so nothing reaches a server. */
export async function preparePage(ctx){
 await ctx.route(/\/api\/(visit|error-report|csp-report)(\/|\?|$)/,r=>r.fulfill({status:204,body:''}));
 // Saving reads as "taking a break" (the game's own no-saving path: Start → Play), so a run never makes a real save code even
 // when the build has the save server's keys.
 await ctx.route(/\/api\/save\//,r=>r.request().url().includes('/api/save/status')?r.fulfill({status:200,contentType:'application/json',body:'{"saving":false,"email":false}'}):r.fulfill({status:503,body:''}));
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.__fiCountProbe=true;
  try{if(!sessionStorage.getItem('smoke-seeded')){sessionStorage.setItem('smoke-seeded','1');
   for(const [k,v] of Object.entries({'fi2-sound-muted':'true','fi2-sound-volume':'0','fi2-music-enabled':'false','fi2-music-volume':'0','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);}}catch{}});
 return {page,errors};
}

/** Wait for a HUD element to be really there for a child: in the DOM, not hidden, laid out with a size, on screen, enabled. */
export async function waitHud(page,selector,timeout=15000){
 await page.waitForFunction(sel=>{const el=document.querySelector(sel);if(!el||el.hidden||el.closest('[hidden]'))return false;
  const cs=getComputedStyle(el),r=el.getBoundingClientRect();
  return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0.05&&r.width>8&&r.height>8&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight&&!el.disabled&&el.getAttribute('aria-disabled')!=='true';},selector,{timeout})
  .catch(async()=>{throw Error(`${selector} is not a visible, enabled button: `+JSON.stringify(await describe(page,selector)));});
}
const describe=(page,sel)=>page.evaluate(sel=>{const el=document.querySelector(sel);if(!el)return 'not in the DOM';const cs=getComputedStyle(el),r=el.getBoundingClientRect();return {hidden:el.hidden,display:cs.display,visibility:cs.visibility,opacity:cs.opacity,disabled:!!el.disabled,rect:[r.x,r.y,r.width,r.height].map(Math.round)};},sel);

/** Tap (touch) or click (mouse) a HUD button the way a child does: at its centre, through whatever is drawn on top. */
export async function tapHud(page,selector,touch){
 await waitHud(page,selector);
 const r=await page.evaluate(sel=>{const b=document.querySelector(sel).getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};},selector);
 const top=await page.evaluate(([sel,x,y])=>{const t=document.elementFromPoint(x,y),el=document.querySelector(sel);return !t||el===t||el.contains(t)?null:(t.tagName+'.'+String(t.className).slice(0,60));},[selector,r.x,r.y]);
 if(top)throw Error(`${selector} is covered by ${top}, a tap would not reach it`);
 if(touch)await page.touchscreen.tap(r.x,r.y);else await page.mouse.click(r.x,r.y);
}

/** Put the player at a world point (window.__fi2.teleport, lib/dev/debugHooks.ts: off on production hosts). */
export async function gotoSpot(page,{x,z,yaw=0}){
 const ok=await page.evaluate(([x,z,yaw])=>{const f=window.__fi2;if(typeof f?.teleport!=='function')return false;f.teleport(x,z,yaw);return true;},[x,z,yaw]);
 if(!ok)throw Error('window.__fi2.teleport is missing (is this a production host?)');
}

/** The analytics counts this tab made so far (the tracker's count() calls that pass its id allowlist). */
export async function counts(page){
 const c=await page.evaluate(()=>typeof window.__fi2?.counts==='function'?window.__fi2.counts():null);
 if(!c)throw Error('window.__fi2.counts is missing (the count probe did not start)');
 return c;
}

/** One finger (phone, CDP touch events) or the mouse (desktop): down / move / up at page coordinates. */
export async function pointer(page,touch){
 if(!touch)return {down:async(x,y)=>{await page.mouse.move(x,y);await page.mouse.down();},move:(x,y)=>page.mouse.move(x,y),up:()=>page.mouse.up()};
 const cdp=await page.context().newCDPSession(page);let last={x:0,y:0};
 const send=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
 return {down:(x,y)=>{last={x,y};return send('touchStart',[{x,y,id:1}]);},move:(x,y)=>{last={x,y};return send('touchMove',[{x,y,id:1}]);},up:()=>send('touchEnd',[])};
}

/** As a new player: /play → Start → Play (saving is "taking a break", see preparePage) → Skip the island welcome. Returns once
 *  the island runs (window.__fi2) with no dialog open. */
export async function newIsland(page,base,touch){
 await page.goto(base+'/play');
 await tapHud(page,'[data-title-start]',touch);
 await page.waitForSelector('[data-landing-play]',{timeout:20000});await tapHud(page,'[data-landing-play]',touch);
 await page.waitForFunction(()=>!!window.__fi2&&!!document.querySelector('dialog[open][data-onboarding-step]'),null,{timeout:90000});
 await tapHud(page,'dialog[open][data-onboarding-step] header [data-navigation]',touch);
 await page.waitForFunction(()=>!document.querySelector('dialog[open]'),null,{timeout:10000});
}

/** Get off any ride by tapping the travel-mode button (it cycles walk → scooter → bike → moped → jetpack). */
export async function onFoot(page,touch){
 for(let i=0;i<6;i++){
  if(await page.evaluate(()=>window.__fi2.rideRef?.current)==='walk')return;
  await tapHud(page,'.travel-actions .travel-mode',touch);await page.waitForTimeout(400);
 }
 throw Error('Still riding '+await page.evaluate(()=>window.__fi2.rideRef?.current)+' after tapping the travel mode button');
}

/** Answer reward pop-ups like a player (a finished task's card offer: Open this card, then Done), until none has shown for
 *  `quietMs`. They can open a moment after the thing that earned them. */
export async function answerPopups(page,quietMs=1200,maxMs=15000){
 let quietSince=Date.now();
 for(const until=Date.now()+maxMs;Date.now()<until;){
  const b=page.locator('dialog[open][class*=CardOffer] button',{hasText:/Open this card|Done|Got it|Keep playing/}).first();
  if(await b.count()){await b.click({timeout:3000}).catch(()=>{});await page.waitForTimeout(700);quietSince=Date.now();continue;}
  if(await page.locator('dialog[open][class*=CardOffer]').count()){await page.keyboard.press('Escape');await page.waitForTimeout(500);quietSince=Date.now();continue;}
  if(Date.now()-quietSince>=quietMs)return;
  await page.waitForTimeout(200);
 }
 throw Error('a reward pop-up would not close');
}

export async function screenshot(page,dir,name){
 fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,name.replace(/[^\w.-]+/g,'-')+'.png');
 await page.screenshot({path:file}).catch(()=>{});return file;
}
