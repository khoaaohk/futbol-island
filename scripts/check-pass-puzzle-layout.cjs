// Pass Puzzles layout check (Nov 11 2026, owner on a tablet: "the puzzle game controls cover the players").
// For every authored scenario and N Endless puzzles at phone, tablet and desktop sizes, in each tray state (one row; Shoot with both
// sliders), asserts that every piece's projected screen box (feet to flag) and the ball sit outside the control tray and the top HUD
// and inside the viewport, and that the goal mouth is fully visible. Prints the worst margins.
// node scripts/check-pass-puzzle-layout.cjs --port=<n> [--sizes=1024x768,768x1024] [--endless=30] [--shots=<dir>]
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const arg=k=>(process.argv.find(a=>a.startsWith(`--${k}=`))||'').slice(k.length+3);
const port=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(port?`http://localhost:${port}`:'');
if(!BASE){console.error('Pass your own server: --port=<port>. There is no default port.');process.exit(1);}
const PHONES=['390x844','390x664','375x553','360x560'],TABLETS=['768x1024','768x924','1024x768','1024x668','820x1180','820x1080','1180x820','1180x720','744x1133','744x1033'];
const SIZES=(arg('sizes')||[...TABLETS,...PHONES,'1440x900'].join(',')).split(',').map(s=>{const [w,h]=s.split('x').map(Number);return{w,h,phone:PHONES.includes(s)};});
const ENDLESS=Number(arg('endless')||30),shots=arg('shots');
const sep=(a,b)=>Math.max(b.x0-a.x1,a.x0-b.x1,b.y0-a.y1,a.y0-b.y1);/* > 0: the boxes are apart by that many px */
async function sweep(page,list,tag,size,worst,fails){
 for(const mode of ['auto','shoot']){
  await page.locator('[data-pp-tray] [role=group] button').filter({hasText:mode==='auto'?'Auto':'Shoot'}).click();await page.waitForTimeout(120);
  for(const item of list){
   const r=await page.evaluate(async item=>{const g=window.__passPuzzle,sc=item.endless?g.endlessScenario(item.endless,item.level):g.scenarios().find(s=>s.id===item.id);if(!sc)return null;
    const p=g.layout(sc),q=e=>{const b=e.getBoundingClientRect();return{x0:b.left,x1:b.right,y0:b.top,y1:b.bottom};};
    const tray=document.querySelector('[data-pp-tray]');let top=0;for(const e of document.querySelectorAll('[data-arcade-kind=pass-puzzle] [class*="topBar"],[data-endless-hud],[class*="hintDock"]')){const b=e.getBoundingClientRect();if(b.height>0&&b.top<innerHeight*.4)top=Math.max(top,b.bottom);}
    return{p,tray:tray&&q(tray),top,W:innerWidth,H:innerHeight};},item);
   if(!r||!r.p){fails.push(`${tag} ${mode} ${item.id||item.endless}: no layout`);continue;}
   if(!r.tray){fails.push(`${tag} ${mode}: tray missing`);continue;}
   const name=item.id||`endless#${item.level}`,boxes=[...r.p.pieces.map(b=>({...b,label:`${b.kind}${b.i}`})),{...r.p.ball,label:'ball'}];
   if(r.p.goal)boxes.push({...r.p.goal,label:'goal'});
   for(const b of boxes){const m={tray:sep(b,r.tray),top:b.y0-r.top,view:Math.min(b.x0,r.W-b.x1,b.y0,r.H-b.y1)};
    for(const k of Object.keys(m)){const key=`${size}:${k}`;if(!worst[key]||m[k]<worst[key].v)worst[key]={v:m[k],at:`${mode} ${name} ${b.label}`};if(m[k]<0)fails.push(`${tag} ${mode} ${name} ${b.label}: ${k} ${m[k].toFixed(1)}px`);}}
  }
 }
}
async function begin(page,endless){
 await page.goto(BASE+'/arcade?game=puzzle',{waitUntil:'domcontentloaded',timeout:180000});
 await page.waitForFunction(()=>window.__passPuzzle?.world,null,{timeout:180000});await page.waitForTimeout(300);
 if(endless)await page.locator('[data-endless]').click();
 else{await page.locator('[data-pack]').first().click();await page.locator('[data-level]').first().click();await page.getByRole('button',{name:'Start puzzle'}).click();}
 await page.waitForFunction(()=>window.__passPuzzle.world?.state.phase==='aiming'&&document.querySelector('[data-pp-tray]'),null,{timeout:60000});await page.waitForTimeout(300);
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',args:['--mute-audio']}),worst={},fails=[];let count=0;
 try{
  for(const size of SIZES){const tag=`${size.w}x${size.h}`;
   const ctx=await browser.newContext({viewport:{width:size.w,height:size.h},isMobile:size.phone,hasTouch:size.phone||size.w<1300,reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.removeItem('fi2-pass-puzzles-v1');});
   await begin(page,false);
   const ids=await page.evaluate(()=>window.__passPuzzle.scenarios().map(s=>s.id));
   await sweep(page,ids.map(id=>({id})),tag,tag,worst,fails);count+=ids.length*2;
   await begin(page,true);
   const list=Array.from({length:ENDLESS},(_,i)=>({endless:`layout-${i}`,level:1+i}));await sweep(page,list,tag+' endless',tag,worst,fails);count+=ENDLESS*2;
   if(errors.length)fails.push(`${tag}: page errors ${errors.slice(0,2).join(' | ')}`);
   await ctx.close();console.log(`${tag}: ok so far, ${fails.length} fails total`);
  }
 }finally{await browser.close();}
 const rows={};for(const [k,v] of Object.entries(worst)){const [size,m]=k.split(':');(rows[size]??={})[m]=`${v.v.toFixed(0)}px (${v.at})`;}
 for(const [size,r] of Object.entries(rows))console.log(`${size.padEnd(9)} tray ${r.tray}  top ${r.top}  view ${r.view}`);
 console.log(`${count} framings checked, ${fails.length} failures`);if(fails.length){console.log(fails.slice(0,40).join('\n'));process.exit(1);}
})().catch(e=>{console.error(e);process.exit(1);});
