// Arcade chrome consistency audit (Oct 27 2026, docs/ARCADE_CHROME_OCT27.md "Consistency audit"). Opens each arcade game in headless
// Chrome at phone landscape / portrait and desktop sizes, walks start -> playing -> paused -> end, and prints the bounding boxes of the
// score bar parts (Back, pill, Pause), the joystick ring, the thumb buttons and the open card. Measurement only: no assertions.
// End cards: Strikers and Breakaway reach full time through their dev hooks; Tennis / Pinball / Pass Puzzles usually do not from a
// forced state in headless Chrome (reported as a timeout) - their full-time cards are the same components as the start cards.
// Usage: FUTBOL_BASE_URL=http://localhost:8241 node scripts/measure-arcade-chrome.cjs [--shots=/tmp/dir] [--json=out.json] [--only=live,runner]
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs');
const arg=k=>(process.argv.find(a=>a.startsWith(`--${k}=`))||'').split('=')[1];
const base=process.env.FUTBOL_BASE_URL||'http://localhost:8092',shots=arg('shots'),only=arg('only')?.split(',');
const VIEWS={land844:{width:844,height:390,mobile:true},land932:{width:932,height:430,mobile:true,notch:{left:47,right:47,top:0,bottom:21}},
 port390:{width:390,height:844,mobile:true,notch:{top:47,bottom:34,left:0,right:0}},desk:{width:1280,height:800,mobile:false}};
const GAMES=[
 {id:'live',name:'Strikers',views:['land844','land932','desk'],start:/^Kick off$/,
  end:()=>{const s=window.__fi2Live.sim;s.time=(s.duration||180)-.01;}},
 {id:'runner',name:'Breakaway',views:['land844','land932','desk'],start:/Play$/,
  end:()=>{const s=window.__arcade3d.runtime.state.runner;s.lives=1;s.slide=0;s.hurt=0;s.boost=0;s.y=0;s.objects=[{kind:'cone',lane:s.lane??1,z:-.2,passed:false,openLane:0}];}},
 {id:'tennis',name:'Tennis',views:['port390','land844','desk'],start:/^Play/,
  end:()=>{const s=window.__arcade3d.runtime.state.tennis;s.winner='rival';s.phase='over';}},
 {id:'pinball',name:'Pinball',views:['port390','desk'],start:/^Play$/,
  end:()=>{const g=window.__arcade3d.runtime,s=g.state.pinball;s.balls=0;s.phase='lost';s.timer=0;}},
 {id:'puzzle',name:'Pass Puzzles',views:['port390','desk'],start:/^Play/,
  end:()=>{const w=window.__passPuzzle.world;w.state.phase='fail';window.__passPuzzle.wake();}},
];
const measure=()=>{
 const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&+cs.opacity>0.05;};
 const box=e=>{if(!vis(e))return null;const r=e.getBoundingClientRect();return{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),r:Math.round(innerWidth-r.right),b:Math.round(innerHeight-r.bottom)};};
 const bar=document.querySelector('[data-arcade-bar]');
 const out={vw:innerWidth,vh:innerHeight,back:box(bar?.querySelector('[data-navigation=back]')),pill:box(bar?.querySelector('[data-arcade-pill]')),pause:box(bar?.querySelector('[data-arcade-pause]')),bar:box(bar)};
 if(bar){const cs=getComputedStyle(bar);out.barPad=cs.padding;}
 const joy=[...document.querySelectorAll('.joystick')].find(vis);out.stick=box(joy);
 const cardEl=document.querySelector('[data-arcade-paused] [role=dialog]')||(()=>{
  const btn=[...document.querySelectorAll('button')].find(b=>vis(b)&&/^(Play|Play coins|Kick off|Play again|Next round|Next match|Rematch|New run|Run again|Replay|Retry court|Next court|Try again|Retry|Start puzzle|Next puzzle|Resume.*)$/i.test((b.getAttribute('aria-label')||b.textContent||'').replace(/[^A-Za-z ]/g,'').trim()));
  let e=btn;while(e&&e!==document.body){const cs=getComputedStyle(e);const R=e.getBoundingClientRect();if(cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&parseFloat(cs.borderTopLeftRadius)>6&&R.width>200&&R.height>120)return e;e=e.parentElement;}return null;})();
 if(cardEl){const cs=getComputedStyle(cardEl),t=cardEl.querySelector('h1,h2,h3,[role=heading]');const prim=[...cardEl.querySelectorAll('button')].filter(vis).sort((a,b)=>b.getBoundingClientRect().height*b.getBoundingClientRect().width-a.getBoundingClientRect().height*a.getBoundingClientRect().width)[0];
  out.card={...box(cardEl),pad:cs.padding,radius:cs.borderTopLeftRadius,title:t?getComputedStyle(t).fontSize:null,primaryH:prim?Math.round(prim.getBoundingClientRect().height):null,primary:prim?(prim.getAttribute('aria-label')||prim.textContent).trim().slice(0,18):null,scrollH:cardEl.scrollHeight,overflow:cs.overflowY,
   small:[...cardEl.querySelectorAll('button')].filter(b=>vis(b)&&b!==prim).map(b=>Math.round(b.getBoundingClientRect().height)).slice(0,6)};}
 // Thumb buttons: visible buttons outside the bar and any card / overlay.
 out.buttons=[...document.querySelectorAll('button')].filter(b=>vis(b)&&!b.closest('[data-arcade-bar]')&&!(cardEl&&cardEl.contains(b))&&!b.closest('[data-arcade-paused]')&&!b.closest('[role=dialog]'))
  .map(b=>({n:(b.getAttribute('aria-label')||b.textContent||'').trim().replace(/\s+/g,' ').slice(0,14),...box(b)})).filter(b=>b.y>innerHeight*0.35||b.w>=40);
 return out;
};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--mute-audio'],executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const results=[];
 try{for(const g of GAMES){if(only&&!only.includes(g.id))continue;for(const v of g.views){const V=VIEWS[v];
  const ctx=await browser.newContext({viewport:{width:V.width,height:V.height},isMobile:V.mobile,hasTouch:V.mobile,deviceScaleFactor:1});
  await ctx.addInitScript(()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs:{fixture:{game:'island',paid:30,reason:'chrome audit',at:1}},packs:[]}));}catch{}});
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let notch='';
  if(V.notch){try{const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:V.notch});notch='notch';}catch(e){notch='no-notch-emu';}}
  const row=(state,m)=>{results.push({game:g.name,view:v+(notch?`(${notch})`:''),state,...m});};
  const shot=async state=>{if(shots&&(state==='playing'||state==='paused'&&v==='desk'))await page.screenshot({path:`${shots}/${g.id}-${v}-${state}.png`});};
  try{
   await page.goto(new URL('/arcade?game='+g.id,base).href,{waitUntil:'domcontentloaded',timeout:120000});
   if(V.notch&&notch==='notch'){try{const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:V.notch});}catch{}}
   if(g.id==='puzzle'){await page.waitForFunction(()=>window.__passPuzzle?.world,null,{timeout:120000});await page.locator('[data-arcade-loading]').waitFor({state:'detached',timeout:60000}).catch(()=>{});}
   else await page.getByRole('button',{name:g.start}).first().waitFor({timeout:120000});
   await page.waitForTimeout(600);row('start',await page.evaluate(measure));await shot('start');
   const press=l=>V.mobile?l.tap():l.click();
   if(g.id==='puzzle'){await press(page.getByRole('button',{name:g.start}).first());await page.waitForTimeout(800);const sp=page.getByRole('button',{name:'Start puzzle',exact:true});if(await sp.isVisible())await press(sp);await page.waitForFunction(()=>window.__passPuzzle.world.state.phase==='aiming',null,{timeout:20000});}
   else await press(page.getByRole('button',{name:g.start}).first());
   await page.waitForTimeout(1500);row('playing',await page.evaluate(measure));await shot('playing');
   await press(page.locator('[data-arcade-pause]'));await page.waitForTimeout(400);row('paused',await page.evaluate(measure));await shot('paused');
   await press(page.locator('[data-arcade-paused] button').first());await page.waitForTimeout(400);
   try{await page.evaluate(g.end);await page.getByRole('button',{name:/^(Try again|Next round|Play again|Next court|Retry court|Retry|Next puzzle|.*Play again)$/}).first().waitFor({timeout:8000});await page.waitForTimeout(800);row('end',await page.evaluate(measure));await shot('end');}catch(e){row('end',{err:String(e.message).slice(0,80)});}
  }catch(e){row('error',{err:String(e.message).split('\n')[0].slice(0,120)});}
  if(errors.length)console.error(g.id,v,'pageerrors:',errors.slice(0,2).join(' | ').slice(0,200));
  await ctx.close();}}}
 finally{await browser.close();}
 const f=b=>b?`${b.x},${b.y} ${b.w}x${b.h} r${b.r} b${b.b}`:'-';
 for(const r of results){
  const btns=(r.buttons||[]).map(b=>`${b.n}:${b.w}x${b.h}@r${b.r}b${b.b}`).join(' ');
  console.log(`| ${r.game} | ${r.view} | ${r.state} | back ${f(r.back)} | pill ${f(r.pill)} | pause ${f(r.pause)} | stick ${f(r.stick)} | card ${r.card?`${r.card.w}x${r.card.h} y${r.card.y} pad ${r.card.pad} rad ${r.card.radius} title ${r.card.title} prim ${r.card.primaryH} small [${r.card.small}] scroll ${r.card.scrollH} ${r.card.overflow}`:'-'} | ${btns}${r.err?' ERR '+r.err:''} |`);
 }
 if(arg('json'))fs.writeFileSync(arg('json'),JSON.stringify(results,null,1));
})().catch(e=>{console.error(e);process.exit(1);});
