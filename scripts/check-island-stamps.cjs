// Island stamp book (Nov 23 2026): one headless Chrome (--mute-audio) on the island. Desktop: stand at the West Beach station
// house, the real "Collect stamp" button shows, clicking it stamps (the moment plays on the West + South spread, South pre-seeded),
// the stamp is saved and the button then reads "Stamped ✓". Phone: the book opened on the West page, a page turn lands on South.
// One desktop + one phone screenshot. Never port 8092.
// app: NEXT_DIST_DIR=.next-stamps npx next dev -p 9155      run: node scripts/check-island-stamps.cjs --port=9155 [--shots=<dir>]
const {chromium}=require('playwright');
const path=require('path');
const arg=(k,d)=>{const a=process.argv.find(s=>s.startsWith(`--${k}=`));return a?a.slice(k.length+3):d;};
const port=arg('port'),shots=arg('shots','');
if(!port||port==='8092'){console.error('give --port=<n> (never 8092)');process.exit(2);}
const url=`http://localhost:${port}`,KEY='fi2-island-stamps-v1',results=[];
const check=(name,ok,extra='')=>{results.push(!!ok);console.log(`${ok?'ok  ':'FAIL'} ${name}${extra?' ('+extra+')':''}`);};
const seed=ids=>JSON.stringify({version:1,reward:false,stamps:Object.fromEntries(ids.map((id,i)=>[id,{at:Date.now()-86400000*(i+2),tilt:i?2.5:-3,dx:.6,dy:-.8}]))});
async function boot(b,vp,mobile,stamps){
 const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
 await ctx.addInitScript(([k,v])=>{try{if(!sessionStorage.getItem('__s_boot')){localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem(k,v);}sessionStorage.setItem('__s_boot','1');}catch{}},[KEY,seed(stamps)]);
 const p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
 await p.goto(url+'/play?from=arcade',{timeout:240000});
 for(let i=0;i<90&&!(await p.evaluate(()=>!!window.__fi2));i++){for(const t of ['I saved it','Get my code','Play'])await p.click(`button:visible:has-text("${t}")`,{timeout:300}).catch(()=>{});if(i===0)await p.click('text=Get my save code',{timeout:4000}).catch(()=>{});await p.waitForTimeout(2000);}
 await p.waitForFunction(()=>!!window.__fi2&&!!window.__fi2.stampPrompt&&!!window.__fi2.renderer&&!document.querySelector('[data-island-return-loading]'),null,{timeout:240000});
 await p.waitForTimeout(4000);return {ctx,p,errs};
}
(async()=>{
 const b=await chromium.launch({args:['--mute-audio','--use-angle=metal']});
 try{
  // ---- Desktop: the station house's real button ----
  {const {ctx,p,errs}=await boot(b,{width:1280,height:800},false,['south']);
   await p.evaluate(()=>{const sp=window.__fi2.trainRide.stationSpot(1,-4);window.__fi2.teleport(sp.x,sp.z,sp.yaw+Math.PI);});
   await p.waitForTimeout(2500);
   const btn=p.locator('[data-stamp-go]');
   await p.waitForFunction(()=>{const e=document.querySelector('[data-stamp-go]');return e&&!e.hidden;},null,{timeout:20000}).catch(()=>{});
   check('desktop: Collect stamp shows at the West Beach station house',await btn.isVisible(),await btn.textContent());
   check('desktop: the button names the West stamp',(await btn.getAttribute('data-stamp-go'))==='west');
   await btn.click();await p.waitForSelector('[data-stamp-book]',{timeout:20000});
   await p.waitForTimeout(1500);
   check('desktop: the book opens on the West + South spread',await p.evaluate(()=>!!document.querySelector('[data-stamp-page="west"][data-stamped]')&&!!document.querySelector('[data-stamp-page="south"][data-stamped]')));
   check('desktop: "New stamp" with coins in the moment',await p.locator('text=New stamp!').isVisible());
   check('desktop: the stamp is saved',await p.evaluate(k=>!!JSON.parse(localStorage.getItem(k)).stamps.west,KEY));
   if(shots)await p.screenshot({path:path.join(shots,'stamp-book-desktop.png')});
   await p.keyboard.press('ArrowRight');await p.waitForTimeout(900);
   check('desktop: a page turn lands on the next spread',(await p.getAttribute('[data-stamp-book]','data-view'))==='2');
   await p.keyboard.press('Escape');await p.waitForTimeout(800);
   check('desktop: Escape closes the book',!(await p.locator('[data-stamp-book]').count()));
   await p.waitForTimeout(1200);
   check('desktop: the button now reads Stamped ✓',/Stamped/.test(await btn.textContent()||''));
   check('desktop: no page errors',errs.length===0,errs.join(' | '));
   await ctx.close();}
  // ---- Phone: one page at a time ----
  {const {ctx,p,errs}=await boot(b,{width:390,height:844},true,['west','south']);
   await p.evaluate(()=>window.dispatchEvent(new CustomEvent('fi2-open-stamp-book',{detail:{page:'west'}})));
   await p.waitForSelector('[data-stamp-book][data-single]',{timeout:20000});await p.waitForTimeout(900);
   check('phone: single-page book on the West page',await p.evaluate(()=>!!document.querySelector('[data-stamp-page="west"][data-stamped]')&&!document.querySelector('[data-stamp-page="south"]')));
   if(shots)await p.screenshot({path:path.join(shots,'stamp-book-phone.png')});
   await p.tap('[data-stamp-nav="next"]');await p.waitForTimeout(900);
   check('phone: next turns to the South page',await p.evaluate(()=>!!document.querySelector('[data-stamp-page="south"][data-stamped]')));
   check('phone: no page errors',errs.length===0,errs.join(' | '));
   await ctx.close();}
 }finally{await b.close();}
 const bad=results.filter(r=>!r).length;console.log(bad?`${bad} FAILED`:`all ${results.length} checks passed`);process.exit(bad?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
