#!/usr/bin/env node
// Arcade AAA budget check (docs/arcade-aaa/HANDOFF.md §4): opens each arcade game on a phone profile (390x844 touch, DPR 3;
// landscape for Strikers; Breakaway Run is measured UPRIGHT since Nov 11 2026: 390x664, the iPhone with its browser bars, or
// --size=WxH; --landscape measures it sideways at 844x390 as before), seeds test coins in the throwaway browser profile, starts a play and prints per-frame
// GL draw calls / triangles (shadow pass included), live GL textures and a rough JS frame cost. Counts come from wrapping the
// WebGL draw functions, so it works on a production build (no debug hooks needed).
//   FUTBOL_BASE_URL=http://localhost:<your port> node scripts/measure-arcade-games.cjs [runner,tennis,pinball,live,puzzle]
// Use a production build for tennis/pinball/runner (see HANDOFF §8.1). Never point it at the owner's dev server on 8092.
const {chromium}=require('playwright');
const base=process.env.FUTBOL_BASE_URL;if(!base){console.error('Set FUTBOL_BASE_URL to your own server.');process.exit(1);}const games=(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'runner,tennis,pinball,live,puzzle').split(',');
const LANDSCAPE=process.argv.includes('--landscape'),sizeArg=(process.argv.find(a=>a.startsWith('--size='))||'').slice(7).split('x').map(Number),RUNNER=LANDSCAPE?{width:844,height:390}:sizeArg.length===2&&sizeArg.every(n=>n>0)?{width:sizeArg[0],height:sizeArg[1]}:{width:390,height:664};
const init=()=>{const st=window.__gl={draws:0,tris:0,tex:0,frames:[],first:0,last:0};
 for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext]){if(!C)continue;const P=C.prototype;
  const wrap=(name,fn)=>{const o=P[name];if(!o)return;P[name]=function(...a){const t=performance.now();if(!st.first)st.first=t;const r=o.apply(this,a);st.last=performance.now();st.draws++;st.tris+=fn(a);return r;};};
  const tri=(mode,count,inst=1)=>mode===4?count/3*inst:mode===5||mode===6?Math.max(0,count-2)*inst:0;
  wrap('drawElements',a=>tri(a[0],a[1]));wrap('drawArrays',a=>tri(a[0],a[2]));wrap('drawElementsInstanced',a=>tri(a[0],a[1],a[4]));wrap('drawArraysInstanced',a=>tri(a[0],a[2],a[3]));
  const ct=P.createTexture,dt=P.deleteTexture;P.createTexture=function(){st.tex++;return ct.call(this);};P.deleteTexture=function(t){if(t)st.tex--;return dt.call(this,t);};}
 const tick=()=>{if(st.rec&&st.draws)st.frames.push([st.draws,Math.round(st.tris),+(st.last-st.first).toFixed(2)]);st.draws=0;st.tris=0;st.first=0;requestAnimationFrame(tick);};requestAnimationFrame(tick);};
const sample=async(page,ms)=>page.evaluate(async ms=>{const st=window.__gl;st.frames=[];st.rec=true;const t0=performance.now();let n=0;await new Promise(r=>{const f=()=>{n++;performance.now()-t0<ms?requestAnimationFrame(f):r();};requestAnimationFrame(f);});st.rec=false;
  const med=i=>{const v=st.frames.map(f=>f[i]).sort((a,b)=>a-b);return v.length?v[v.length>>1]:0;},max=i=>Math.max(0,...st.frames.map(f=>f[i]));const c=document.querySelector('canvas');
  return{rendered:st.frames.length+'/'+n,draws:med(0),drawsMax:max(0),tris:med(1),trisMax:max(1),cpuMs:med(2),rafMs:+((performance.now()-t0)/n).toFixed(1),tex:st.tex,canvas:c?c.width+'x'+c.height:''};},ms);
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{for(const g of games){
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});await ctx.addInitScript(init);await ctx.addInitScript(()=>{try{if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{'baseline-grant':{game:'island',paid:5000,reason:'baseline',at:Date.now()}},best:{},attempts:{},visits:{},packs:[]}));}catch{}});
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text().slice(0,200));});
  await page.goto(base+'/arcade?game='+g,{waitUntil:'domcontentloaded',timeout:120000});await page.waitForSelector('[data-game] canvas, canvas',{timeout:60000}).catch(()=>errors.push('no canvas'));await page.waitForTimeout(5000);
  const info=await page.evaluate(()=>{const el=document.querySelector('[data-game]');return{game:el?.getAttribute('data-game'),skin:/skin/.test(el?.className||''),failed:/couldn.t load/.test(document.body.innerText),buttons:[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>(b.textContent||b.getAttribute('aria-label')||'').trim().slice(0,18)).slice(0,14)};});
  const menu=await sample(page,2500);const clicked=[];
  if(g==='live'||g==='runner'){await page.setViewportSize(g==='runner'?RUNNER:{width:844,height:390});await page.waitForTimeout(1500);}
  {const b=page.getByRole('button',{name:/^(play|start|kick off)/i}).first();if(await b.isVisible().catch(()=>false)){clicked.push((await b.textContent()||'').trim().slice(0,16));await b.click({timeout:3000,force:true}).catch(e=>errors.push('click: '+e.message.slice(0,80)));}}
  await page.waitForTimeout(800);if(g==='runner')await page.setViewportSize(RUNNER);await page.waitForTimeout(1500);
  if(g==='puzzle'){const b=page.getByRole('button',{name:/^(start puzzle|start)/i}).first();if(await b.isVisible().catch(()=>false)){clicked.push((await b.textContent()||'').trim().slice(0,16));await b.click({timeout:3000}).catch(()=>{});}}
  if(g==='tennis'||g==='pinball'){const b=page.getByRole('button',{name:g==='tennis'?/^serve/i:/launch/i}).first();const box=await b.boundingBox().catch(()=>null);if(box){const cdp=await ctx.newCDPSession(page);const pt=[{x:box.x+box.width/2,y:box.y+box.height/2}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pt});await page.waitForTimeout(g==='pinball'?700:120);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});clicked.push('touch '+g);}else errors.push('no start control');}
  await page.waitForTimeout(g==='live'?4000:1500);const play=await sample(page,5000);const text=await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,140));
  delete info.buttons;if(g==='runner')info.viewport=RUNNER.width+'x'+RUNNER.height;console.log(JSON.stringify({g,...info,clicked,menu,play,text,errors}));await ctx.close();}
 }finally{await browser.close();}
})();
