// Collect cards: the card binder (spread or single page, page turns, divider tabs), search, lifting a card into the full
// viewer, empty pockets and the Escape order.
// Part 1 (always): the accent-insensitive search helpers (components/cardSearch.ts).
// Part 2 (needs the dev server on :8092 and Chrome): seeds a collection, opens Paths → Collect cards at 1440×900 and 390×844,
// and screenshots the spread, a mid-flip frame, a divider jump, a search and the card viewer. Pass A runs the app as is
// (UNLOCK_ALL_CARDS: every card collected); pass B stubs that flag off in the served JS to test empty pockets.
// usage: node tests/card-collection.cjs [screenshotDir]   (FI_SKIP_BROWSER=1 runs part 1 only)
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');

const src=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/cardSearch.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};vm.runInNewContext(src,{exports:mod.exports,module:mod});
const {fold,matchesCard,numberQuery,revealsName}=mod.exports;
assert.equal(fold('Kylian Mbappé'),'kylian mbappe');
assert.ok(matchesCard('mbappe','Kylian Mbappé',120),'accents are optional');
assert.ok(matchesCard('MBAPPÉ','Kylian Mbappé',120),'case and accents both fold');
assert.ok(matchesCard('alexander arnold','Trent Alexander-Arnold',1),'punctuation folds to spaces');
assert.ok(matchesCard('vandijk','Virgil van Dijk',1),'spaces are optional');
assert.ok(matchesCard('odegaard','Martin Ødegaard',1),'ø folds to o');
assert.ok(matchesCard('ruben dias','Rúben Dias',1));
assert.ok(!matchesCard('messi','Kylian Mbappé',1));
assert.ok(!matchesCard('   ','Kylian Mbappé',1),'blank matches nothing');
assert.equal(numberQuery('42'),42);assert.equal(numberQuery('#42'),42);assert.equal(numberQuery('No. 042'),42);assert.equal(numberQuery('messi'),null);
assert.ok(matchesCard('042','Anyone',42)&&!matchesCard('42','Anyone',43),'card numbers match exactly');
assert.equal(revealsName('a'),false,'one letter never reveals missing names');
assert.equal(revealsName('mes'),true);assert.equal(revealsName('42'),false,'a number search keeps missing names secret');
console.log('Card search: accents, punctuation, spacing, numbers and name reveal passed.');

const bsrc=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/binder.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const bmod={exports:{}};vm.runInNewContext(bsrc,{exports:bmod.exports,module:bmod,Math});
const {buildBinder,sectionsOf,viewStart,pageOf,sectionOf}=bmod.exports;
const entries=[...Array.from({length:20},(_,i)=>({name:`K${i}`,number:200-i,role:'goalkeeper'})),...Array.from({length:9},(_,i)=>({name:`W${i}`,number:i+1,role:'winger'})),{name:'F0',number:5,role:'fixo'}];
const layout=buildBinder(entries,['goalkeeper','winger']);
assert.equal(layout.version,1);assert.equal(layout.pages.length,4,'20 keepers → 3 pages, 9 wingers → 1 page; each position starts a new page');
assert.ok(layout.pages.every(p=>p.slots.length===9),'9 pockets a page');
assert.equal(layout.pages[0].slots[0],'K19','card-number order within a position');
assert.equal(layout.pages[2].slots.filter(Boolean).length,2);assert.equal(layout.pages[2].slots[8],null,'unused pockets stay empty');
assert.equal(layout.pages[3].role,'winger');assert.ok(!layout.pages.some(p=>p.slots.includes('F0')),'other binders\' positions are left out');
const secs=sectionsOf(layout.pages);assert.equal(secs.map(x=>`${x.role}:${x.start}:${x.pages}:${x.cards.length}`).join(),'goalkeeper:0:3:20,winger:3:1:9','tabs find their pages from the layout');
assert.equal(viewStart(3,true),2);assert.equal(viewStart(3,false),3);assert.equal(pageOf(layout.pages,'W4'),3);assert.equal(sectionOf(secs,2).role,'goalkeeper');
console.log('Card binder: position order, 9-pocket pages, new page per position, empty pockets and layout-derived tabs passed.');

if(process.env.FI_SKIP_BROWSER)process.exit(0);
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright'));}
const zlib=require('node:zlib');
const out=process.argv[2]||path.join(require('node:os').tmpdir(),'card-collection');fs.mkdirSync(out,{recursive:true});
const URL=process.env.FI_URL||'http://localhost:8092';
const GROUPS=JSON.parse(fs.readFileSync(path.join(__dirname,'../lib/town/positionPlayers.json'),'utf8'));
const OWNED=['Virgil van Dijk','Lionel Messi','Franz Beckenbauer','Alisson','Pelé','Zinedine Zidane','Ricardinho','Lamine Yamal','Kylian Mbappé','Lev Yashin'];
const BINDER='dialog[open] [aria-roledescription=binder]';
const DOCK='dialog[open] nav[aria-label=Binder]';
const VIEWER='dialog[open] [role=dialog][aria-modal=true]';
const count=(page,sel)=>page.evaluate(s=>document.querySelectorAll(s).length,sel);
const focused=page=>page.evaluate(()=>document.activeElement?.getAttribute('aria-label')??'');
/** The (visually hidden) live region that announces the open page(s). */
const live=page=>page.evaluate(()=>[...document.querySelectorAll('dialog[open] p[aria-live=polite]')].map(p=>p.textContent).find(t=>/^Page /.test(t))??'');
const box=(page,sel)=>page.evaluate(s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.x,r.y,r.width,r.height].map(v=>Math.round(v*10)/10).join();},sel);
const onTop=(page,sel)=>page.evaluate(s=>{const el=document.querySelector(s);if(!el)return false;const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!hit&&el.contains(hit);},sel);
const doneOnTop=page=>page.evaluate(()=>{const done=[...document.querySelectorAll('dialog[open] button')].find(b=>/^Done$/.test(b.textContent.trim()));const r=done.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return done===hit||done.contains(hit);});
const noOverflow=async(page,label)=>{const o=await page.evaluate(()=>({doc:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,side:[...document.querySelectorAll('dialog[open] *')].some(el=>el.scrollWidth>el.clientWidth+1&&/auto|scroll/.test(getComputedStyle(el).overflowX))}));
 assert.equal(o.doc,false,`${label}: the page scrolls`);assert.equal(o.side,false,`${label}: something scrolls sideways`);};
/** Minimal PNG decoder (8-bit RGB/RGBA, non-interlaced, as Chrome writes them) for pixel diffs. */
function decodePng(buf){let i=8,w=0,h=0,type=6;const idat=[];while(i<buf.length){const len=buf.readUInt32BE(i),kind=buf.toString('ascii',i+4,i+8),data=buf.subarray(i+8,i+8+len);
  if(kind==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);type=data[9];}else if(kind==='IDAT')idat.push(data);i+=12+len;}
 const bpp=type===6?4:3,raw=zlib.inflateSync(Buffer.concat(idat)),stride=w*bpp,px=Buffer.alloc(h*stride);
 for(let y=0;y<h;y++){const f=raw[y*(stride+1)],row=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1));
  for(let x=0;x<stride;x++){const a=x>=bpp?px[y*stride+x-bpp]:0,b=y?px[(y-1)*stride+x]:0,c=x>=bpp&&y?px[(y-1)*stride+x-bpp]:0;let v=row[x];
   if(f===1)v+=a;else if(f===2)v+=b;else if(f===3)v+=(a+b)>>1;else if(f===4){const p0=a+b-c,pa=Math.abs(p0-a),pb=Math.abs(p0-b),pc=Math.abs(p0-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?b:c;}px[y*stride+x]=v&255;}}
 return {w,h,bpp,px};}
/** Share of pixels that differ by more than a small tolerance, outside `masks` ([x, y, w, h] in image px). */
function diff(a,b,masks=[]){const A=decodePng(a),B=decodePng(b);let bad=0,n=0;const masked=(x,y)=>masks.some(([mx,my,mw,mh])=>x>=mx&&x<mx+mw&&y>=my&&y<my+mh);
 for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){if(masked(x,y))continue;n++;const i=y*A.w+x;let d=0;for(let k=0;k<3;k++)d=Math.max(d,Math.abs(A.px[i*A.bpp+k]-B.px[i*B.bpp+k]));if(d>24)bad++;}return bad/Math.max(1,n);}
/** Two painted frames (after a state change, so the screenshot shows it). */
/** Waits (polling) until the announced page matches `re`, then returns the announcement (asserted by the caller). */
const liveMatch=(page,re,ms=15000)=>page.waitForFunction(src=>{const t=[...document.querySelectorAll('dialog[open] p[aria-live=polite]')].map(p=>p.textContent).find(t=>/^Page /.test(t))??'';return new RegExp(src).test(t);},re.source,{timeout:ms}).catch(()=>{}).then(()=>live(page));
/** The binder has settled: no turn running (only a prebuilt, hidden next turn may stay). */
const settledTurn=page=>page.waitForFunction(s=>{const b=document.querySelector(s);return !b.hasAttribute('data-turning')&&!b.querySelector('[class*=BinderLeaf_leaf]:not([data-prep])');},BINDER,{timeout:15000});
/** Every pocket portrait in the binder (resting pages and the hidden prebuilt turn) has loaded and decoded: the art is CSS
 * mask images, so a page shown before its masks arrive paints blank portraits that fill in later (not a turn snap). */
const artLoaded=page=>page.evaluate(s=>{const urls=new Set();for(const el of document.querySelectorAll(`${s} [style*=mask-image]`)){const m=(el.style.maskImage||el.style.webkitMaskImage||'').match(/url\(["']?([^"')]+)/);if(m)urls.add(m[1]);}
 return Promise.all([...urls].map(u=>new Promise(done=>{const i=new Image();i.onload=()=>i.decode().then(done,done);i.onerror=done;i.src=u;}))).then(()=>urls.size);},BINDER);
/** Polls until `sel` matches `n` elements (or the timeout), so the caller's assertion checks a settled state. */
const until=(page,sel,n,ms=20000)=>page.waitForFunction(([s,n])=>document.querySelectorAll(s).length===n,[sel,n],{timeout:ms}).catch(()=>{});
const frames2=page=>page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));

async function open(browser,[w,h],{faceDown=false}={}){
 const context=await browser.newContext({viewport:{width:w,height:h}});const page=await context.newPage();page.errs=[];page.on('pageerror',e=>page.errs.push(e.message));
 await page.addInitScript(owned=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-player-cards-v1',JSON.stringify(owned));},OWNED);
 // Pass B: switch the testing flag off in the served bundle only (the source keeps UNLOCK_ALL_CARDS on via CARD_REWARDS_LAUNCH=false).
 if(faceDown)await page.route(/\/_next\/static\/.*\.js/,async route=>{try{const res=await route.fetch();let body=await res.text();body=body.replace(/UNLOCK_ALL_CARDS\s*=\s*(true|![\w$.]+)/g,'UNLOCK_ALL_CARDS = false');await route.fulfill({response:res,body});}
  catch(error){if(!/closed|disposed/i.test(String(error?.message)))throw error;}});
 await page.goto(URL,{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.__fi2?.games?.entries?.length,null,{timeout:120000});await page.waitForTimeout(1000);
 await page.getByRole('button',{name:'Paths'}).click();await page.getByRole('button',{name:/Collect cards/}).click({timeout:30000});
 // Condition waits (not fixed sleeps): the binder's pockets are in and its page is announced, then a moment for the idle prebuild.
 await page.waitForFunction(b=>!!document.querySelector(`${b} li button`)&&[...document.querySelectorAll('dialog[open] p[aria-live=polite]')].some(p=>/^Page /.test(p.textContent)),BINDER,{timeout:30000});
 await page.waitForTimeout(600);
 return {context,page,dialog:page.locator('dialog[open]')};
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  for(const size of [[1440,900],[390,844]]){
   // Both binders open on page 1, the first card page (spread: pages 1 and 2).
   const w=size[0],spread=w>=880,per=spread?2:1,first=1;
   // ── Pass A: the app as configured (every card collected while UNLOCK_ALL_CARDS is on).
   {const {context,page,dialog}=await open(browser,size);
    const dock=page.locator(DOCK);
    assert.equal(await count(page,`${BINDER} > div > div section[aria-label^="Page "]:not([aria-hidden=true] *)`),per,spread?'an open two-page spread':'a single page');
    assert.match(await live(page),new RegExp(`^Page 1${spread?' and 2':''} of \\d+, Strikers`));
    const pocket=await page.evaluate(s=>{const r=document.querySelector(`${s} li button`).getBoundingClientRect();return r.width;},BINDER);
    // Pockets are a little smaller since the user asked for more room between cards (gap 22px phone / 16px spread).
    assert.ok(spread?pocket>=130:pocket>=88,`cards fill the pockets (${pocket}px)`);
    assert.ok(await doneOnTop(page),'the header floats over the binder');assert.ok(await onTop(page,DOCK),'the dock is on top');
    assert.equal(await dock.getByRole('button',{name:'Previous page'}).isDisabled(),true,'no page before the first');
    await noOverflow(page,`${w} spread`);
    await page.screenshot({path:`${out}/binder-${w}.png`});
    // Drag a page: it curls under the pointer; releasing before halfway lets it fall back.
    const r=await page.evaluate(s=>{const b=document.querySelector(`${s} > div:nth-child(2)`).getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};},BINDER);
    const gx=r.x+r.w-30,gy=r.y+r.h*.7;
    await page.mouse.move(gx,gy);await page.mouse.down();for(let i=1;i<=8;i++)await page.mouse.move(gx-i*(spread?40:30),gy-i*3);await page.waitForTimeout(120);
    assert.ok(await count(page,`${BINDER} [class*=BinderLeaf_strip]`)>=4,'the page bends through several strips');
    await page.screenshot({path:`${out}/drag-curl-${w}.png`});
    await page.mouse.move(gx-20,gy);await page.mouse.up();await settledTurn(page);
    assert.match(await live(page),new RegExp(`^Page ${first}`),'released before halfway: falls back');
    // Auto turn (dock ▶): same sheet, played automatically; mid-flip frame.
    await dock.getByRole('button',{name:'Next page'}).click();await page.waitForTimeout(spread?300:260);
    await page.screenshot({path:`${out}/flip-mid-${w}.png`});
    await settledTurn(page);assert.match(await live(page),new RegExp(`^Page ${first+per}`));assert.equal(await count(page,`${BINDER} [class*=BinderLeaf_leaf]:not([data-prep])`),0,'the sheet settles (only the next turn, prebuilt and hidden, stays)');
    // No snap at the end: hold the turn's last frame, then compare it with the first settled frame.
    // The next turn is prebuilt (hidden) and every portrait it and the open page show has loaded, so both frames show the same art.
    await page.waitForFunction(s=>!!document.querySelector(`${s} [class*=BinderLeaf_leaf][data-prep]`),BINDER,{timeout:15000});await artLoaded(page);await frames2(page);
    await page.evaluate(()=>{window.__fiBinderHold=true;});
    // Condition waits: the held marker (the turn has played its last frame and is waiting for release), then the settle marker.
    await dock.getByRole('button',{name:'Next page'}).click();await page.waitForFunction(()=>typeof window.__fiBinderRelease==='function',null,{timeout:15000});await frames2(page);
    const clip=await page.evaluate(s=>{const b=document.querySelector(s).getBoundingClientRect();return {x:Math.floor(b.x),y:Math.floor(b.y),width:Math.floor(b.width),height:Math.floor(b.height)};},BINDER);
    const leafRects=await page.evaluate(s=>[...document.querySelectorAll(`${s} [class*=BinderLeaf_back]`)][0]?.querySelectorAll('li')&&[...[...document.querySelectorAll(`${s} [class*=BinderLeaf_back]`)][0].querySelectorAll('li')].map(li=>{const r=li.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}),BINDER);
    const held=await page.screenshot({clip});
    await page.evaluate(()=>{window.__fiBinderHold=false;window.__fiBinderRelease?.();});
    await settledTurn(page);await artLoaded(page);await frames2(page);
    const settled=await page.screenshot({clip});
    // The one region that legitimately differs: the page-corner buttons sit under the pages while a sheet turns (so no corner
    // draws over it) and come back once it has landed. Masked with their drop shadow; everything else must match.
    const masks=await page.evaluate(([s,c])=>[...document.querySelectorAll(`${s} button[class*=corner]`)].filter(el=>el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect();
     return [Math.floor(r.x-c.x)-4,Math.floor(r.y-c.y)-4,Math.ceil(r.width)+8,Math.ceil(r.height)+8];}),[BINDER,clip]);
    if(spread){const restRects=await page.evaluate(s=>[...document.querySelector(`${s} > div:nth-child(2) > div:first-child`).querySelectorAll('li')].map(li=>{const r=li.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}),BINDER);
    const shift=Math.max(...leafRects.flatMap((r,i)=>r.map((v,k)=>Math.abs(v-restRects[i][k]))));if(process.env.FI_DEBUG)console.log(JSON.stringify(leafRects.slice(0,3)),JSON.stringify(restRects.slice(0,3)));
    assert.ok(shift<=1,`the landed sheet's pockets sit on the resting page's (max ${shift.toFixed(2)} px apart)`);
    console.log(`  end-of-turn geometry ${w}: pockets within ${shift.toFixed(2)} px`);}
    fs.writeFileSync(`${out}/snap-last-${w}.png`,held);fs.writeFileSync(`${out}/snap-settled-${w}.png`,settled);
    const d=diff(held,settled,masks);assert.ok(d<.02,`last frame vs settled frame differ in ${(d*100).toFixed(2)}% of pixels`);
    console.log(`  end-of-turn snap check ${w}: ${(d*100).toFixed(3)}% pixels differ`);
    // Arrow keys turn pages.
    await dock.getByRole('button',{name:'Previous page'}).focus();
    await page.keyboard.press('ArrowRight');assert.match(await liveMatch(page,new RegExp(`^Page ${first+per*3}`)),new RegExp(`^Page ${first+per*3}`),'ArrowRight turns forward');await settledTurn(page);
    await page.keyboard.press('ArrowLeft');assert.match(await liveMatch(page,new RegExp(`^Page ${first+per*2}`)),new RegExp(`^Page ${first+per*2}`),'ArrowLeft turns back');await settledTurn(page);
    // A divider tab riffles several sheets to its section.
    await dialog.getByRole('button',{name:/^Wingers: jump to page/}).click();await page.waitForFunction(s=>document.querySelectorAll(`${s} [class*=BinderLeaf_leaf]:not([data-prep])`).length>=2,BINDER,{timeout:15000}).catch(()=>{});
    assert.ok(await count(page,`${BINDER} [class*=BinderLeaf_leaf]`)>=2,'several sheets riffle');
    await page.screenshot({path:`${out}/tab-jump-${w}.png`});
    assert.match(await liveMatch(page,/Wingers/),/Wingers/,'the Wingers section is open');await settledTurn(page);
    // Search floats above everything and never moves the binder; picking a result turns to it and lights the pocket.
    const before=await box(page,BINDER);
    await dock.getByRole('button',{name:'Search cards'}).click();
    const input=dialog.getByRole('combobox',{name:'Find a player'});
    await input.fill('mbappe');await until(page,'dialog[open] [role=option]',1);
    assert.equal(await box(page,BINDER),before,'opening search leaves the binder exactly where it was');
    assert.equal(await dialog.getByRole('option').count(),1);
    await page.screenshot({path:`${out}/search-${w}.png`});
    await input.press('Enter');await liveMatch(page,/Strikers/);await settledTurn(page);await until(page,`${BINDER} li[data-spot]:not([aria-hidden=true] *)`,1);
    await page.waitForFunction(()=>/^Kylian Mbappé/.test(document.activeElement?.getAttribute('aria-label')??''),null,{timeout:10000}).catch(()=>{});
    assert.equal(await box(page,BINDER),before,'closing search leaves the binder where it was');
    assert.match(await live(page),/Strikers/,'turned to the Strikers pages');
    assert.equal(await count(page,`${BINDER} li[data-spot]:not([aria-hidden=true] *)`),1,'the pocket lights up');assert.match(await focused(page),/^Kylian Mbappé/,'focus on the card');
    await page.screenshot({path:`${out}/search-result-${w}.png`});
    // Tap: the card rises out of its pocket into the viewer over the blurred binder.
    await page.keyboard.press('Enter');await page.waitForTimeout(200);
    await page.screenshot({path:`${out}/lift-mid-${w}.png`});
    await until(page,'dialog[open] [role=dialog][aria-label="Kylian Mbappé card"]:not([data-phase=in])',1);await frames2(page);
    assert.equal(await count(page,'dialog[open] [role=dialog][aria-label="Kylian Mbappé card"]'),1,'the full card opens');
    // The backdrop is a flat scrim (no backdrop-filter, for phone heat); the binder and dock behind take a static blur.
    assert.ok(await page.evaluate(()=>{const c=getComputedStyle(document.querySelector('dialog[open] [class*=viewerBackdrop]')).backgroundColor;const a=c.match(/[\d.]+(?=\))/);return /rgba?\(/.test(c)&&(!/rgba/.test(c)||+a[0]>=.5);}),'the binder is dimmed behind');
    assert.ok(await page.evaluate(()=>['[class*=CardCollection_layer]','nav[aria-label=Binder]'].every(sel=>/blur\((1[4-9]|2\d)px\)/.test(getComputedStyle(document.querySelector(`dialog[open] ${sel}`)).filter))),'the binder and dock are heavily blurred behind the card');
    const cardW=await page.evaluate(()=>document.querySelector('dialog[open] [class*=cardHost]>div>div:first-child').getBoundingClientRect().width);
    // Phone card is 82vw and matches the binder page band (user request), so a 390 phone gives ~320px.
    assert.ok(cardW>=(spread?450:300),`the card is large (${cardW}px)`);
    await page.screenshot({path:`${out}/viewer-${w}.png`});
    // Escape: card (back into its pocket) → modal.
    // The viewer's top-bar Flip turns the card; the back's tabs (Strengths / Top Plays / History) replace the old tiles.
    await page.getByRole('button',{name:'Flip',exact:true}).click();await until(page,'dialog[open] [role=tablist] [role=tab]',3);
    assert.equal(await count(page,'dialog[open] [role=tablist] [role=tab]'),3,'three tabs on the back');
    await page.getByRole('tab',{name:'Top Plays'}).click();await page.waitForTimeout(400);
    // Highlights show inline in the tab (no sheet): a clip list, or a status line while none are listed.
    await page.waitForFunction(()=>{const p=document.querySelector('dialog[open] [role=tabpanel]');return !!p&&(!!p.querySelector('ul[aria-label$="highlights"]')||/curated|unavailable/.test(p.textContent));},null,{timeout:15000});
    assert.equal(await count(page,'dialog[open] [class*=sheetScrim]'),0,'no highlights sheet');assert.equal(await count(page,'dialog[open] [role=dialog][aria-label$=" card"]'),1,'viewer stays open');
    await page.keyboard.press('Escape');await until(page,'dialog[open] [role=dialog][aria-label$=" card"]',0);
    await page.waitForFunction(()=>/^Kylian Mbappé/.test(document.activeElement?.getAttribute('aria-label')??''),null,{timeout:10000}).catch(()=>{});
    assert.equal(await count(page,'dialog[open] [role=dialog][aria-label$=" card"]'),0,'Escape puts the card back');assert.match(await focused(page),/^Kylian Mbappé/,'focus back on the pocket');
    // Search in the other binder switches to it.
    await dock.getByRole('button',{name:'Search cards'}).click();await input.fill('ricardinho');await until(page,'dialog[open] [role=option]',1);await input.press('Enter');
    await page.waitForFunction(()=>document.querySelector('dialog[open] nav[aria-label=Binder] button[aria-pressed=true]')?.textContent==='Futsal',null,{timeout:15000}).catch(()=>{});await until(page,`${BINDER} li[data-spot]:not([aria-hidden=true] *)`,1);
    assert.equal(await dock.getByRole('button',{name:'Futsal'}).getAttribute('aria-pressed'),'true','the futsal binder opens');
    assert.equal(await count(page,`${BINDER} li[data-spot]:not([aria-hidden=true] *)`),1);
    await dock.getByRole('button',{name:'Futbol'}).click();await page.waitForTimeout(300);
    assert.equal(await page.evaluate(()=>localStorage.getItem('fi2-cards-field-v1')),'football','the chosen binder is remembered');
    await dock.getByRole('button',{name:'Search cards'}).click();await page.keyboard.press('Escape');await page.waitForTimeout(300);
    assert.equal(await count(page,'dialog[open] input[type=search]'),0,'Escape closes search');
    await page.keyboard.press('Escape');await until(page,'dialog[open]',0);
    assert.equal(await page.evaluate(()=>!!document.querySelector('dialog[open]')),false,'Escape closes the modal last');
    assert.deepEqual(page.errs,[],'no page errors');
    await context.close();}
   // ── Pass B: missing cards (flag stubbed off): the real card, greyed out (user, Sep 24 2026); no Play, Flip or tilt.
   {const {context,page,dialog}=await open(browser,size,{faceDown:true});
    assert.ok(await count(page,`${BINDER} li button[aria-label*="Not collected yet"]`)>=7,'missing cards are greyed pockets');
    await page.screenshot({path:`${out}/binder-empty-${w}.png`});
    const pocket=dialog.getByRole('button',{name:/Not collected yet/}).first();
    const [,who,number]=(await pocket.getAttribute('aria-label')).match(/^(.+), card (\d+)/);
    await pocket.click();await page.locator(VIEWER).getByText(/Not collected yet\. /).waitFor({timeout:30000});
    const text=await page.locator(VIEWER).innerText();
    assert.ok(text.includes(who)&&text.includes(`No. ${String(number).padStart(3,'0')}`),'the greyed card shows who it is');assert.match(text,/Not collected yet\. /);
    assert.equal(await page.evaluate(v=>[...document.querySelectorAll(`${v} button[data-state],${v} button[aria-pressed]`)].filter(el=>el.getClientRects().length).length,VIEWER),0,'no Play or Flip on a missing card');
    await page.screenshot({path:`${out}/empty-pocket-${w}.png`});
    await page.keyboard.press('Escape');await until(page,VIEWER,0);
    await page.waitForFunction(()=>/Not collected yet/.test(document.activeElement?.getAttribute('aria-label')??''),null,{timeout:10000}).catch(()=>{});
    assert.equal(await count(page,VIEWER),0);assert.match(await focused(page),/Not collected yet/,'focus back on the pocket');
    assert.deepEqual(page.errs,[],'no page errors');
    // The bundle-rewriting route may still hold a late chunk request: drop it before closing, or its fetch throws.
    await page.unrouteAll({behavior:'ignoreErrors'});await context.close();}
   console.log(`Collect cards ${size.join('×')}: spread/page, card size, drag curl + fall back, auto turn, no end snap, keys, tab riffle, floating search (binder fixed), FLIP viewer over blur, empty pockets and Escape order passed.`);
  }
 }finally{await browser.close();}
 console.log(`Screenshots: ${out}`);
})().catch(error=>{console.error(error);process.exit(1);});
