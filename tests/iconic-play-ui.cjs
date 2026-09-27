// Browser check for the player card's iconic-play film (needs the dev server on :8092 and Chrome).
// Play shows only for players with a film (lib/plays/riso/registry.ts). It lazy-loads the film and plays it inside
// the card's picture window (CardFilmPlayer) with the narration as the caption; at the end, or on Stop / Flip /
// Escape / a hidden page, the loop and audio stop and the card fades back to the portrait. Escape never leaves the card.
// usage: node tests/iconic-play-ui.cjs [screenshotDir]
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright'));}
const out=process.argv[2]||path.join(require('node:os').tmpdir(),'iconic-play-ui');fs.mkdirSync(out,{recursive:true});
const URL=process.env.FI_URL||'http://localhost:8092';
// Every card with a published film (FILMS keys minus PENDING), read from the registry so the test tracks new films.
const FILM_NAMES=(()=>{const src=require('fs').readFileSync(require('path').join(__dirname,'../lib/plays/riso/registry.ts'),'utf8');
 const films=src.slice(src.indexOf('FILMS'),src.indexOf('PENDING'));const keys=[...films.matchAll(/(?:^|[{,\s])(['"])((?:(?!\1).)+)\1\s*:\s*\(\)\s*=>/g)].map(m=>m[2]);
 const pend=(src.match(/PENDING=new Set<string>\(\[([^\]]*)\]/)||[,''])[1];const pending=[...pend.matchAll(/(['"])((?:(?!\1).)+)\1/g)].map(m=>m[2]);
 return keys.filter(k=>!pending.includes(k));})();
const FILM_PLAYERS=(process.env.FI_FILM_PLAYERS?.split(',')??FILM_NAMES);
const GUIDE='dialog[aria-labelledby="position-guide-title"]';
const PLAY='dialog[open] button[aria-label*="iconic play"]';
const guideOpen=page=>page.evaluate(g=>!!document.querySelector(`${g}[open]`),GUIDE);
/** Film chunks fetched so far (the registry's dynamic imports): proves nothing loads before Play. */
const filmRequests=page=>page.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).filter(n=>/plays[_/-]riso|messi-getafe|zidane-volley|banks-save|ricardinho-rabona/.test(n)).length);

/** Clicks live players one by one until a guide opens whose lists contain `want` (or any player when want is null). */
async function openGuideWith(page,want){
 const points=await page.evaluate(()=>{const d=window.__fi2,cam=d.camera,V=cam.position.constructor,list=[];
  for(const e of d.games.entries)for(const rig of e.rigs.values()){if(!rig.root.visible)continue;const p=rig.root.getWorldPosition(new V());p.y+=1;const q=p.clone().project(cam);if(q.z>1||Math.abs(q.x)>.85||Math.abs(q.y)>.85)continue;list.push({x:(q.x+1)/2*innerWidth,y:(1-q.y)/2*innerHeight,dist:p.distanceTo(cam.position)});}
  return list.sort((a,b)=>a.dist-b.dist);});
 for(const pt of points){
  await page.mouse.click(pt.x,pt.y);
  if(!await page.waitForFunction(g=>!!document.querySelector(`${g}[open]`),GUIDE,{timeout:2500}).then(()=>true,()=>false))continue;
  if(!want)return true;
  for(const tab of ['All-time greats','Current stars']){
   await page.locator('dialog[open]').getByRole('button',{name:tab}).click();await page.waitForTimeout(150);
   for(const name of want){const b=page.locator(`dialog[open] button[aria-label="View ${name} player card"]`);if(await b.count()){await b.click();await cardShown(page);return name;}}
  }
  await closeGuide(page);
 }
 return false;
}

/** Leaves the guide: the player view (the card reveal's layout) has Back, Play and Flip on top, so Back to the list, then Done. */
async function closeGuide(page){const back=page.locator('dialog[open]').getByRole('button',{name:'Back',exact:true});
 if(await back.count()){await back.click();await page.locator('dialog[open]').getByRole('button',{name:'Done',exact:true}).waitFor({timeout:10000});}
 await page.locator('dialog[open]').getByRole('button',{name:/Done|Close/}).first().click();await page.waitForFunction(g=>!document.querySelector(`${g}[open]`),GUIDE,{timeout:10000});}

/** Counts rAF callbacks scheduled directly by the card film (not the world resuming after it), so we can prove the loop stops. */
function instrument(){window.__film={raf:0};const raf=window.requestAnimationFrame.bind(window);
 window.requestAnimationFrame=cb=>{if(/CardFilmPlayer/.test((new Error().stack||'').split('\n')[2]||''))window.__film.raf++;return raf(cb);};}
const rafs=page=>page.evaluate(()=>window.__film.raf);
const draws=page=>page.evaluate(()=>Number(document.querySelector('canvas[data-card-film]')?.dataset.draws??-1));
/** Waits for the film to leave the card. It fails only when the film stops making progress: the film clock
 * (canvas data-time) follows the narration audio, so on a loaded machine the natural end can come well after the film's
 * nominal length, and a fixed deadline flaked. No progress for 45 s (or 6 min in all) is a real hang. */
async function filmGone(page){const t0=Date.now();let last=null,since=Date.now();
 for(;;){const t=await page.evaluate(()=>{const c=document.querySelector('canvas[data-card-film]');return c?(c.dataset.time??'0'):null;});
  if(t===null)return;if(t!==last){last=t;since=Date.now();}
  if(Date.now()-since>45000||Date.now()-t0>360000)throw new Error(`film did not end: stuck at t=${t}s for ${Math.round((Date.now()-since)/1000)} s`);
  await page.waitForTimeout(250);}}
// Condition waits (poll the page's state, not fixed sleeps), so a loaded machine only makes the test slower, never wrong.
/** The film is on: Play turned into Stop and the canvas has drawn at least `n` frames (reduced motion draws one still per chapter). */
/** The card's turn has finished: no running animation or transition on the flip layer and no turn in progress (data-turning). A phone
 *  flip takes 950 ms, longer than a loaded machine's fixed waits, and a face caught mid-turn has no rendered text. */
const turnSettled=page=>page.waitForFunction(()=>{const f=document.querySelector('dialog[open] [class*="PlayerCard_flip"]'),c=f?.parentElement;
 return !!f&&!c?.hasAttribute('data-turning')&&f.getAnimations().every(a=>a.playState!=='running');},null,{timeout:10000,polling:50});
const filmRunning=(page,n=1)=>page.waitForFunction(n=>{const c=document.querySelector('canvas[data-card-film]'),b=document.querySelector('dialog[open] button[aria-label*="iconic play"]');
 return !!c&&Number(c.dataset.draws??0)>=n&&/^Stop /.test(b?.getAttribute('aria-label')??'');},n,{timeout:90000});
/** A card has opened in the guide and its box has stopped moving (two equal reads a frame apart). */
async function cardShown(page){await page.locator('dialog[open]').getByRole('button',{name:'Flip',exact:true}).waitFor({timeout:15000});
 await page.waitForFunction(()=>new Promise(done=>{const el=document.querySelector('dialog[open] [class*="PlayerCard"][class*="card"]');if(!el)return done(false);const a=el.getBoundingClientRect();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const b=el.getBoundingClientRect();done(a.x===b.x&&a.y===b.y&&a.width===b.width&&a.height===b.height);}));}),null,{timeout:15000,polling:100});}

async function load(page){
 await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));await page.addInitScript(instrument);
 await page.goto(URL,{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.__fi2?.games?.entries?.length,null,{timeout:120000});await page.waitForTimeout(2500);
}

// The player view mirrors the card reveal: Back / Play / Flip in the top bar (PlayerCard's own Flip hidden), the name above the
// card and "See it in my binder" under it.
const bar=page=>page.evaluate(()=>{const shown=b=>!!b&&b.getBoundingClientRect().width>0,flip=[...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent.trim()==='Flip'&&shown(b)),
 play=document.querySelector('dialog[open] button[aria-label*="iconic play"]'),binder=[...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent.trim()==='See it in my binder'),
 ownFlip=document.querySelector('dialog[open] [class*="PlayerCard"][class*="controls"] button[aria-pressed]'),
 card=document.querySelector('dialog[open] [class*="PlayerCard"][class*="card"][class*="star"],dialog[open] [class*="PlayerCard"][class*="card"][class*="legend"]')?.getBoundingClientRect(),
 r=el=>{const b=el?.getBoundingClientRect();return b&&{l:b.left,r:b.right,t:b.top,b:b.bottom,w:b.width,h:b.height,cx:b.left+b.width/2};};
 return {vw:innerWidth,vh:innerHeight,ownFlipShown:shown(ownFlip),flip:r(flip),play:r(play),binder:r(binder),card:card&&{l:card.left,r:card.right,b:card.bottom,cx:card.left+card.width/2}};});

/** The film canvas fills the picture window, above the art and below the recessed shadow. */
const inWindow=page=>page.evaluate(()=>{const c=document.querySelector('canvas[data-card-film]');if(!c)return null;const win=c.parentElement,a=c.getBoundingClientRect(),b=win.getBoundingClientRect();
 return {window:/window/.test(win.className),fits:Math.abs(a.width-b.width)<1.5&&Math.abs(a.height-b.height)<1.5&&Math.abs(a.left-b.left)<1.5&&Math.abs(a.top-b.top)<1.5,
  px:[c.width,c.height],css:[Math.round(a.width),Math.round(a.height)],z:getComputedStyle(c).zIndex,error:c.dataset.risoError??null,
  bio:document.querySelector('dialog[open] [class*="filmBio"]')?.innerText??null,label:document.querySelector('dialog[open] button[aria-label*="iconic play"]').getAttribute('aria-label')};});

async function portraitBack(page,tag,how){
 await filmGone(page);const s=await page.evaluate(()=>({canvas:!!document.querySelector('canvas[data-card-film]'),filmBio:!!document.querySelector('dialog[open] [class*="filmBio"]'),flipped:!!document.querySelector('dialog[open] [data-flipped]'),
  label:document.querySelector('dialog[open] button[aria-label*="iconic play"]')?.getAttribute('aria-label'),card:!!document.querySelector('dialog[open] [class*="PlayerCard"][class*="front"]')}));
 assert.ok(await guideOpen(page),`${how}: guide stays open`);assert.ok(s.card,`${how}: still on the player card`);
 assert.equal(s.filmBio,false,`${how}: bio restored`);assert.match(String(s.label),/^Play /,`${how}: button back to Play`);
 const r0=await rafs(page);await page.waitForTimeout(700);assert.equal(await rafs(page),r0,`${how}: no animation loop after the film`);
 console.log(tag,how,'→ portrait',JSON.stringify(s));return s;
}

async function run(browser,{w,h,shrink,reduce}){
 const tag=`${w}${reduce?'-reduced':''}`;
 const page=await browser.newPage({viewport:{width:shrink?1440:w,height:shrink?900:h},reducedMotion:reduce?'reduce':'no-preference'});
 const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('crash',()=>console.error(tag,'renderer crashed'));
 await load(page);
 // 1. A player without a film: no Play button; Back, Flip and See it in my binder stay.
 assert.ok(await openGuideWith(page,null),'position guide opens from a live player');
 const plain=await page.evaluate(()=>[...document.querySelectorAll('dialog[open] ul li button[aria-label^="View "]')].map(b=>b.getAttribute('aria-label').replace(/^View /,'').replace(/ player card$/,'')));
 const other=plain.find(n=>!FILM_NAMES.includes(n));
 if(other){await page.locator(`dialog[open] button[aria-label="View ${other} player card"]`).click();await cardShown(page);
  if(shrink){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(300);await cardShown(page);}
  const L=await bar(page);console.log(tag,'no-film',other,JSON.stringify(L));
  assert.equal(L.play,undefined,`${other}: no Play button without a film`);
  assert.ok(L.flip&&L.flip.cx>L.vw/2&&L.flip.t<90,'Flip sits at the top right');assert.ok(L.binder&&Math.abs(L.binder.cx-L.vw/2)<4,'See it in my binder centred');
  await page.screenshot({path:`${out}/ip-nofilm-${tag}.png`});
  if(shrink){await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(600);}
 }
 await closeGuide(page);
 // 2. A film player.
 const name=await openGuideWith(page,FILM_PLAYERS);assert.ok(name,'a film player is reachable from a live player');
 if(shrink){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(300);await cardShown(page);}
 const L=await bar(page);console.log(tag,'film player',name,JSON.stringify(L));
 assert.ok(L.play,'Play shows for a film player');assert.ok(Math.abs(L.play.cx-L.vw/2)<4&&L.play.t<90,'Play sits at the top centre');
 assert.ok(L.flip&&L.flip.l>L.play.r&&Math.abs(L.flip.t-L.play.t)<4,'Flip sits at the top right, level with Play');
 assert.equal(L.ownFlipShown,false,"the card's own Flip is hidden (the top-bar Flip drives it)");
 assert.ok(Math.abs(L.play.h-44)<1.5&&L.play.w>=L.play.h,'Play is a 44px pill matching the other buttons');
 assert.ok(L.binder&&Math.abs(L.binder.cx-L.vw/2)<4&&(!L.card||L.binder.t>=L.card.b)&&L.binder.b<=L.vh,'See it in my binder sits centred under the card, on screen');
 await page.screenshot({path:`${out}/ip-front-${tag}.png`});
 assert.equal(await filmRequests(page),0,'no film code loads before Play');
 assert.equal(await rafs(page),0,'no film loop before Play');
 const play=page.locator(PLAY);
 // Flipped first: Play returns to the front, then plays inside the window.
 await page.getByRole('button',{name:'Flip',exact:true}).click();await turnSettled(page);
 await play.click();
 await filmRunning(page);await turnSettled(page);// Play turns a flipped card back to the front: read the window once that turn has settled
 const mid=await inWindow(page);console.log(tag,'playing',JSON.stringify(mid),'chunks',await filmRequests(page));
 assert.equal(await page.evaluate(()=>!!document.querySelector('dialog[open] [data-flipped]')),false,'Play shows the front');
 assert.ok(mid.window&&mid.fits,'film fills the picture window');assert.equal(mid.z,'1','film sits above the art, below the recessed shadow');
 assert.equal(mid.error,null,'film draws without errors');assert.ok(mid.bio&&mid.bio.length>3,'caption replaces the bio');assert.match(mid.label,/^Stop /,'Play turns into Stop');
 const d1=await draws(page);
 if(reduce){await page.waitForTimeout(500);assert.equal(await rafs(page),0,'reduced motion: no animation loop');}
 // Draws follow the film clock (narration time), which a loaded machine can hold for a moment: wait for the next frame, up to 10 s.
 else assert.ok(await page.waitForFunction(d1=>Number(document.querySelector('canvas[data-card-film]')?.dataset.draws??-1)>d1,d1,{timeout:10000}).then(()=>true,()=>false),'film animates while playing');
 await page.screenshot({path:`${out}/ip-playing-${tag}.png`});
 // Natural end: hold the last frame, fade to the portrait, loop gone.
 await portraitBack(page,tag,'end');await page.screenshot({path:`${out}/ip-end-${tag}.png`});
 // Stop.
 await play.click();await filmRunning(page,reduce?1:2);
 await play.click();const r1=await rafs(page),dr=await draws(page);await page.waitForTimeout(150);
 assert.equal(await rafs(page),r1,'Stop cancels the loop at once');assert.equal(await draws(page),dr,'Stop: no more draws');
 await portraitBack(page,tag,'Stop');
 // Flip.
 await play.click();await filmRunning(page,reduce?1:2);
 await page.getByRole('button',{name:'Flip',exact:true}).click();await portraitBack(page,tag,'Flip');
 await page.getByRole('button',{name:'Flip',exact:true}).click();await turnSettled(page);
 // Escape (focus on Stop) stops only the film.
 await play.click();await filmRunning(page,reduce?1:2);
 await page.keyboard.press('Escape');await portraitBack(page,tag,'Escape');
 // Escape with focus outside the card (the dialog's cancel path).
 await play.click();await filmRunning(page,reduce?1:2);
 await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Escape');await portraitBack(page,tag,'Escape (unfocused)');
 // The page being hidden.
 await play.click();await filmRunning(page,reduce?1:2);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 await portraitBack(page,tag,'hidden page');
 await page.evaluate(()=>{delete document.hidden;});
 // Escape on the card itself still goes back through the guide as before.
 await page.keyboard.press('Escape');await page.waitForTimeout(400);
 assert.ok(await guideOpen(page),'Escape on the card returns to the position list, guide still open');
 assert.deepEqual(errs,[],'no page errors');
 console.log(tag,'ok');await page.close();
}

(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 await run(browser,{w:1440,h:900});
 await run(browser,{w:390,h:844,shrink:true});
 await run(browser,{w:1440,h:900,reduce:true});
 console.log('Iconic play film UI: Play only for film players, lazy film inside the card window, caption, end/Stop/Flip/Escape/hidden fade back with no loop, reduced motion. Screens in',out);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
