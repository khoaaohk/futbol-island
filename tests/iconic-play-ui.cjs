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
  await page.mouse.click(pt.x,pt.y);await page.waitForTimeout(450);
  if(!await guideOpen(page))continue;
  if(!want)return true;
  for(const tab of ['All-time greats','Current stars']){
   await page.locator('dialog[open]').getByRole('button',{name:tab}).click();await page.waitForTimeout(150);
   for(const name of want){const b=page.locator(`dialog[open] button[aria-label="View ${name} player card"]`);if(await b.count()){await b.click();await page.waitForTimeout(900);return name;}}
  }
  await page.locator('dialog[open]').getByRole('button',{name:/Done|Close/}).first().click();await page.waitForTimeout(600);
 }
 return false;
}

/** Counts rAF callbacks scheduled directly by the card film (not the world resuming after it), so we can prove the loop stops. */
function instrument(){window.__film={raf:0};const raf=window.requestAnimationFrame.bind(window);
 window.requestAnimationFrame=cb=>{if(/CardFilmPlayer/.test((new Error().stack||'').split('\n')[2]||''))window.__film.raf++;return raf(cb);};}
const rafs=page=>page.evaluate(()=>window.__film.raf);
const draws=page=>page.evaluate(()=>Number(document.querySelector('canvas[data-card-film]')?.dataset.draws??-1));
const filmGone=page=>page.waitForFunction(()=>!document.querySelector('canvas[data-card-film]'),null,{timeout:90000});

async function load(page){
 await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));await page.addInitScript(instrument);
 await page.goto(URL);await page.waitForFunction(()=>window.__fi2?.games?.entries?.length,null,{timeout:120000});await page.waitForTimeout(2500);
}

const bar=page=>page.evaluate(()=>{const flip=[...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent.trim()==='Flip'),play=document.querySelector('dialog[open] button[aria-label*="iconic play"]'),
 card=document.querySelector('dialog[open] [class*="PlayerCard"][class*="card"][class*="star"],dialog[open] [class*="PlayerCard"][class*="card"][class*="legend"]')?.getBoundingClientRect(),
 r=el=>{const b=el?.getBoundingClientRect();return b&&{l:b.left,r:b.right,b:b.bottom,w:b.width,h:b.height,cx:b.left+b.width/2};};
 return {vw:innerWidth,vh:innerHeight,flip:r(flip),play:r(play),card:card&&{l:card.left,r:card.right,cx:card.left+card.width/2}};});

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
 const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await load(page);
 // 1. A player without a film: no Play button, Flip centred alone.
 assert.ok(await openGuideWith(page,null),'position guide opens from a live player');
 const plain=await page.evaluate(()=>[...document.querySelectorAll('dialog[open] ul li button[aria-label^="View "]')].map(b=>b.getAttribute('aria-label').replace(/^View /,'').replace(/ player card$/,'')));
 const other=plain.find(n=>!FILM_NAMES.includes(n));
 if(other){await page.locator(`dialog[open] button[aria-label="View ${other} player card"]`).click();await page.waitForTimeout(900);
  if(shrink){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(600);}
  const L=await bar(page);console.log(tag,'no-film',other,JSON.stringify(L));
  assert.equal(L.play,undefined,`${other}: no Play button without a film`);
  if(L.card)assert.ok(Math.abs(L.flip.cx-L.card.cx)<4,'Flip centred when alone');
  await page.screenshot({path:`${out}/ip-nofilm-${tag}.png`});
  if(shrink){await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(600);}
 }
 await page.locator('dialog[open]').getByRole('button',{name:/Done|Close/}).first().click();await page.waitForTimeout(600);
 // 2. A film player.
 const name=await openGuideWith(page,FILM_PLAYERS);assert.ok(name,'a film player is reachable from a live player');
 if(shrink){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(600);}
 const L=await bar(page);console.log(tag,'film player',name,JSON.stringify(L));
 assert.ok(L.play,'Play shows for a film player');assert.ok(L.flip.r<L.play.l,'Flip sits left of Play');
 assert.ok(Math.abs(L.play.h-44)<1.5&&L.play.w>=L.play.h,'Play is a 44px pill matching the other buttons');
 assert.ok(L.play.b<=L.vh&&L.vh-L.play.b>=0,'controls sit on screen, under the card (no longer pinned to the bottom)');
 await page.screenshot({path:`${out}/ip-front-${tag}.png`});
 assert.equal(await filmRequests(page),0,'no film code loads before Play');
 assert.equal(await rafs(page),0,'no film loop before Play');
 const play=page.locator(PLAY);
 // Flipped first: Play returns to the front, then plays inside the window.
 await page.getByRole('button',{name:'Flip',exact:true}).click();await page.waitForTimeout(300);
 await play.click();
 await page.waitForSelector('canvas[data-card-film]',{timeout:30000});await page.waitForTimeout(900);
 const mid=await inWindow(page);console.log(tag,'playing',JSON.stringify(mid),'chunks',await filmRequests(page));
 assert.equal(await page.evaluate(()=>!!document.querySelector('dialog[open] [data-flipped]')),false,'Play shows the front');
 assert.ok(mid.window&&mid.fits,'film fills the picture window');assert.equal(mid.z,'1','film sits above the art, below the recessed shadow');
 assert.equal(mid.error,null,'film draws without errors');assert.ok(mid.bio&&mid.bio.length>3,'caption replaces the bio');assert.match(mid.label,/^Stop /,'Play turns into Stop');
 const d1=await draws(page);await page.waitForTimeout(500);const d2=await draws(page);
 if(reduce){assert.equal(await rafs(page),0,'reduced motion: no animation loop');}else assert.ok(d2>d1,'film animates while playing');
 await page.screenshot({path:`${out}/ip-playing-${tag}.png`});
 // Natural end: hold the last frame, fade to the portrait, loop gone.
 await portraitBack(page,tag,'end');await page.screenshot({path:`${out}/ip-end-${tag}.png`});
 // Stop.
 await play.click();await page.waitForSelector('canvas[data-card-film]');await page.waitForTimeout(600);
 await play.click();const r1=await rafs(page),dr=await draws(page);await page.waitForTimeout(150);
 assert.equal(await rafs(page),r1,'Stop cancels the loop at once');assert.equal(await draws(page),dr,'Stop: no more draws');
 await portraitBack(page,tag,'Stop');
 // Flip.
 await play.click();await page.waitForSelector('canvas[data-card-film]');await page.waitForTimeout(600);
 await page.getByRole('button',{name:'Flip',exact:true}).click();await portraitBack(page,tag,'Flip');
 await page.getByRole('button',{name:'Flip',exact:true}).click();await page.waitForTimeout(300);
 // Escape (focus on Stop) stops only the film.
 await play.click();await page.waitForSelector('canvas[data-card-film]');await page.waitForTimeout(600);
 await page.keyboard.press('Escape');await portraitBack(page,tag,'Escape');
 // Escape with focus outside the card (the dialog's cancel path).
 await play.click();await page.waitForSelector('canvas[data-card-film]');await page.waitForTimeout(600);
 await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Escape');await portraitBack(page,tag,'Escape (unfocused)');
 // The page being hidden.
 await play.click();await page.waitForSelector('canvas[data-card-film]');await page.waitForTimeout(600);
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
