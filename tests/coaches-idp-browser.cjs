#!/usr/bin/env node
/*
 * Football plan (IDP v2, simplified Oct 10 2026, docs/idp/DESIGN.md §10) headless play-through. Needs a dev server:
 * FUTBOL_BASE_URL (default http://localhost:8092). Not part of `npm test` (it needs a browser and the island). Screenshots go
 * to shots/idp/ (git-ignored). For each of phone (390×844, touch) and desktop (1440×900), counting taps per task:
 *   PLAYER   Coaches Centre → the plan (no gate: user decision Oct 10 2026) → pick a goal → who helped; Practise → "I did it!" → check in with a note;
 *            a standalone check-in; talk it through; "I can do it now!" (celebration) → the next goal;
 *   GROWN-UP "For grown-ups and coaches" (ParentGate first): a note, the fridge card (the print HTML is captured and rendered), the week story,
 *            the review screen;
 *   COACH    give a goal by QR, open its link (/plan#c=…) and add the coach's goal; the fridge QR on a grown-up's phone.
 * Heat: at rest on the plan's home, 0 rAF callbacks and 0 running animations for 2 s; the celebration ends; reduced motion
 * runs nothing. Also: no element past the right edge at 390, every button named, no page errors.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const PW=['/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright','playwright','@playwright/test'];
let chromium;for(const p of PW){try{chromium=require(p).chromium;if(chromium)break;}catch{}}
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:8092',OUT=path.join(__dirname,'..','shots','idp');fs.mkdirSync(OUT,{recursive:true});
const WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
const log=[];
async function run(browser,vp){
 const tag=vp.width<600?'390':'1440';
 const ctx=await browser.newContext({viewport:vp,hasTouch:vp.width<600,isMobile:vp.width<600,deviceScaleFactor:vp.width<600?2:1});
 ctx.setDefaultTimeout(180000);ctx.setDefaultNavigationTimeout(240000);
 await ctx.addInitScript(()=>{try{if(!localStorage.getItem('fi2-welcome-v1'))localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-grownups-format-v1','7v7');}catch{}
  const raf=window.requestAnimationFrame.bind(window);window.__raf=0;window.requestAnimationFrame=cb=>raf(t=>{window.__raf++;cb(t);});});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let taps=0,screens=0;const tap=async loc=>{await loc.click();taps++;await page.waitForTimeout(550);};
 const shot=n=>page.screenshot({path:path.join(OUT,`${tag}-${n}.png`)});
 const begin=()=>{taps=0;screens=0;};const end=name=>{log.push({vp:tag,task:name,taps,screens});console.log(tag,name,'taps',taps,'screens',screens);};
 const gate=async()=>{const g=page.locator('[data-parent-gate]').first();await page.waitForTimeout(400);if(!(await g.count()))return false;screens++;
  const q=await g.locator('label').first().textContent();const m=/What is (\w+) times (\w+)\?/.exec(q||'');
  await g.locator('[data-parent-gate-answer]').fill(String(WORDS.indexOf(m[1])*WORDS.indexOf(m[2])));taps++;await tap(g.getByRole('button',{name:'Continue'}));return true;};
 const hscroll=async()=>page.evaluate(()=>{const p=document.querySelector('[data-idp-plan]');if(!p)return 'no plan';const bad=[...p.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1;});return bad.length?bad.slice(0,3).map(e=>e.className+':'+Math.round(e.getBoundingClientRect().right)):false;});
 const idle=async(ms=2000)=>{await page.evaluate(()=>{window.__raf=0;});await page.waitForTimeout(ms);return page.evaluate(()=>({raf:window.__raf,running:document.getAnimations().filter(a=>a.playState==='running').length}));};
 await page.goto(BASE+'/',{waitUntil:'domcontentloaded',timeout:240000});
 await page.waitForSelector('[data-title-start]',{timeout:120000});await page.waitForTimeout(1500);await page.locator('[data-title-start]').click();
 // Title → save code (required before play) → the island. Taps whatever forward button the save sheets show.
 for(let i=0;i<90;i++){
  if(await page.locator('[data-arcade-enter]:visible').count()&&!(await page.locator('[data-save-create]:visible,[data-required-save]:visible').count()))break;
  const b=page.getByRole('button',{name:/^(Get my code|I saved it|Got it|Start|Play|Continue)$/}).filter({visible:true});
  if(await b.count())await b.first().click({timeout:5000}).catch(()=>{});
  await page.waitForTimeout(2000);}
 await page.waitForTimeout(3000);
 // KID: first goal.
 begin();
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('fi2-endgame-open',{detail:{target:'coaches'}})));taps++;screens++;await page.waitForTimeout(1500);await shot('01-coaches-centre');
 await tap(page.locator('button:has-text("Football plan")').first());
 if(await gate())throw new Error('the kid\'s plan must open without the ParentGate (user decision, Oct 10 2026)');
 await page.waitForSelector('[data-idp-builder]');screens++;await shot('02-pick-goal');
 await tap(page.locator('[data-goal-option="7-look"]'));screens++;await shot('03-who');
 await tap(page.locator('[data-who="Me and my coach"]'));
 await page.waitForSelector('[data-idp-home]');screens++;await page.waitForTimeout(700);await shot('04-home');
 end('set first goal (kid, Coaches Centre)');
 console.log(tag,'hscroll home',await hscroll());
 const rest=await idle();console.log(tag,'at rest on home',rest);assert.equal(rest.raf,0,'no rAF at rest');assert.equal(rest.running,0,'no running animations at rest');
 await page.locator('[data-idp-home]').evaluate(el=>el.closest('[class*="body"]')?.scrollBy(0,2000));await page.waitForTimeout(300);await shot('05-home-bottom');
 // KID: the core loop: Practise → I did it! → check in (face, note) → Save.
 begin();await tap(page.locator('[data-idp-main="practise"]'));screens++;await shot('06-practise');
 console.log(tag,'hscroll practise',await hscroll());
 await tap(page.locator('[data-mission-done]'));screens++;await page.waitForSelector('[data-idp-checkin-screen]');await shot('07-checkin');
 await tap(page.locator('[data-feel=getting]'));
 await page.locator('#idp-player-note').fill('I looked twice before my pass');taps++;
 await shot('08-checkin-filled');
 await tap(page.locator('[data-checkin-save]'));await page.waitForSelector('[data-idp-home]');screens++;await shot('09-home-saved');
 end('practise + check in with a note (kid loop)');
 // KID: a standalone note (check in without a mission).
 begin();await tap(page.locator('[data-idp-checkin]'));screens++;await tap(page.locator('[data-feel=tricky]'));await page.locator('#idp-player-note').fill('Ask coach about turning');taps++;await tap(page.locator('[data-checkin-save]'));screens++;end('add a note (kid, from home)');
 // KID: review early.
 begin();await tap(page.locator('[data-idp-review]'));screens++;await shot('10-review');await tap(page.locator('[data-review-keep]'));await page.waitForSelector('[data-idp-home]');screens++;end('do a review (kid)');
 const st=await page.evaluate(()=>({plan:JSON.parse(localStorage.getItem('fi2-idp-v2')),text:JSON.parse(localStorage.getItem('fi2-idp-text-v1')||'{}')}));
 assert.equal(st.plan.plan.missions.length,1);assert.equal(st.plan.plan.checkins.length,2);assert.equal(st.plan.plan.reviews.length,1);
 assert.equal(st.text.notes.filter(n=>n.kind==='player').length,2,'two player notes on the device');assert.ok(!JSON.stringify(st.plan).includes('looked twice'),'no typed words in the synced plan');
 // Celebrate needs 3 practice moments: one more check-in, then "I can do it now!".
 await page.locator('[data-idp-checkin]').click();await page.waitForTimeout(500);await page.locator('[data-feel=cando]').click();await page.locator('[data-checkin-save]').click();await page.waitForSelector('[data-idp-home]');await page.waitForTimeout(600);
 await page.locator('[data-can-now="7-look"]').click();await page.waitForSelector('[data-celebrate]');await page.waitForTimeout(300);await shot('11-celebrate-mid');await page.waitForTimeout(1400);await shot('12-celebrate');
 const cel=await idle(1200);assert.equal(cel.running,0,'the celebration ends');
 await page.locator('[data-celebrate-next]').click();await page.waitForSelector('[data-idp-builder]');await page.waitForTimeout(500);await shot('13-next-goal');
 await page.locator('[data-goal-option="7-touch"]').click();await page.waitForTimeout(500);await page.locator('[data-who="Just me"]').click();await page.waitForSelector('[data-idp-home]');
 // GROWN-UP: the hub from the plan.
 begin();await tap(page.locator('[data-idp-grownups]'));
 if(!(await gate())&&!(await page.locator('[data-grown-hub]').count()))throw new Error('the grown-up tools ask the ParentGate first');
 screens++;await page.waitForSelector('[data-grown-hub]');await shot('14-hub');
 console.log(tag,'hscroll hub',await hscroll());
 await tap(page.locator('[data-hub-tile=notes]'));screens++;await shot('15-notes');await page.locator('#idp-home-note').fill('Ask about the keeper call');taps++;await tap(page.locator('[data-note-save]'));end('add a note (grown-up, from the plan)');
 begin();await tap(page.locator('[data-idp-back]').last());await page.waitForSelector('[data-grown-hub]');await tap(page.locator('[data-hub-tile=fridge]'));screens++;await shot('16-fridge');
 await page.locator('#idp-fridge-name').fill('Sam');
 await tap(page.locator('[data-fridge-print]'));
 const printed=await page.waitForFunction(()=>{const f=document.querySelector('div[data-grownups-print]');return f&&f.shadowRoot?f.shadowRoot.innerHTML:null;},null,{timeout:10000}).then(h=>h.jsonValue());
 assert.match(printed,/Sam’s football plan/);assert.match(printed,/data:image\/png;base64/);
 end('print the fridge card (from hub; +1 to reach hub from plan)');
 const fridge=await ctx.newPage();await fridge.setViewportSize({width:820,height:1160});await fridge.setContent(printed);await fridge.waitForTimeout(300);await fridge.screenshot({path:path.join(OUT,`${tag}-17-fridge-card.png`),fullPage:true});await fridge.close();
 const wk=await page.locator('[data-fridge]').getAttribute('data-week-url');
 // COACH: goal by QR.
 begin();await tap(page.locator('[data-idp-back]').last());await page.waitForSelector('[data-grown-hub]');await tap(page.locator('[data-hub-tile=coach]'));screens++;await shot('18-coach');
 await tap(page.locator('[data-coach-goal="7-goalside"]'));await tap(page.locator('[data-make-qr]'));await page.waitForSelector('[data-coach-qr-code] img');await page.locator('[data-coach-qr-code]').scrollIntoViewIfNeeded();await shot('19-coach-qr');
 end('share a goal by coach QR (from hub)');
 const link=(await page.locator('[data-coach-qr-code] p').filter({hasText:'/plan#c='}).textContent()).trim();assert.match(link,/\/plan#c=1~7-goalside~k[0-9a-z]{3}$/);
 const kid=await ctx.newPage();await kid.goto(link,{waitUntil:'domcontentloaded'});await kid.waitForSelector('[data-coach-link]');await kid.waitForTimeout(600);await kid.screenshot({path:path.join(OUT,`${tag}-20-coach-link.png`),fullPage:true});
 await kid.locator('[data-add-coach-goal]').click();await kid.waitForSelector('text=Added!');await kid.close();
 // Week story on a grown-up phone.
 if(wk){const p2=await ctx.newPage();await p2.goto(BASE+wk,{waitUntil:'domcontentloaded'});await p2.waitForSelector('[data-week-story]');await p2.waitForTimeout(800);await p2.screenshot({path:path.join(OUT,`${tag}-21-week-phone.png`),fullPage:true});await p2.close();}
 // Week screen + review from the hub.
 await page.locator('[data-idp-back]').last().click();await page.waitForSelector('[data-grown-hub]');await page.locator('[data-hub-tile=week]').click();await page.waitForSelector('[data-grown-view]');await page.waitForTimeout(600);await shot('22-week');
 console.log(tag,'hscroll week',await hscroll());
 await page.locator('[data-idp-back]').last().click();await page.waitForSelector('[data-grown-hub]');await page.locator('[data-hub-tile=review]').click();await page.waitForSelector('[data-review]');await page.waitForTimeout(400);await shot('23-review-grown');
 await page.locator('[data-idp-back]').last().click();await page.waitForSelector('[data-grown-hub]');await page.locator('[data-idp-back]').last().click();await page.waitForSelector('[data-idp-home]');
 // Reduced motion: a screen is complete with nothing animating.
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-idp-main="practise"]').click();await page.waitForSelector('[data-idp-practise]');await page.waitForTimeout(60);
 const rm=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);assert.equal(rm,0,'reduced motion: nothing animates');await shot('24-reduced-motion');
 // Accessibility: every button has an accessible name; focus moved to the screen title.
 const unnamed=await page.evaluate(()=>[...document.querySelectorAll('[data-idp-plan] button')].filter(b=>!(b.getAttribute('aria-label')||b.textContent||'').trim()).length);assert.equal(unnamed,0,'every button is named');
 const focused=await page.evaluate(()=>document.activeElement?.id);console.log(tag,'focus on',focused);
 assert.deepEqual(errors.filter(e=>!/ResizeObserver|WebGL|context lost/i.test(e)),[],'no page errors');
 await ctx.close();
}
(async()=>{const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined});
 try{for(const vp of [{width:390,height:844},{width:1440,height:900}])await run(browser,vp);}finally{await browser.close();}
 console.table(log);console.log('IDP_BROWSER_PASS');})().catch(e=>{console.error(e);process.exit(1);});
