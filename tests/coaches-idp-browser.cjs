#!/usr/bin/env node
/*
 * IDP v2 headless play-through (Oct 9 2026, docs/idp/DESIGN.md). Needs a dev server: FUTBOL_BASE_URL (default
 * http://localhost:8092). Not part of `npm test` (it needs a browser and the island). Screenshots go to shots/idp/
 * (git-ignored). For each of phone (390×844, touch) and desktop (1280×800):
 *   PLAYER   open the plan (For grown-ups → plan, behind the ParentGate), make it together, walk the five beats, do a mission,
 *            check in twice, add a proud moment, celebrate a goal (frame sequence), choose the next goal;
 *   PARENT   the Grown-ups tab: the week story, leave a cheer, print the fridge card (the print HTML is captured and rendered);
 *   COACH    the Coach tab: pick a goal and cue, make the QR, open its link (/plan#c=…) and add the coach's goal;
 *   PHONE    the fridge card's QR link (/plan#p=…) in a fresh browser with no saves (a grown-up's own phone).
 * Heat: after the motion settles, counts requestAnimationFrame callbacks and running animations for 2 s (both must be 0
 * while the plan is open: the island sleeps behind the sheet and the plan owns no loop). Reduced motion: beats are complete.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const PW=['/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright','playwright','@playwright/test'];
let chromium;for(const p of PW){try{chromium=require(p).chromium;if(chromium)break;}catch{}}
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:8092';
const OUT=path.join(__dirname,'..','shots','idp');fs.mkdirSync(OUT,{recursive:true});
const WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
const shots=[];
async function shot(page,name){const f=path.join(OUT,name+'.png');await page.screenshot({path:f});shots.push(f);return f;}
async function shotEl(page,sel,name){const f=path.join(OUT,name+'.png');await page.locator(sel).first().screenshot({path:f});shots.push(f);return f;}
const settle=page=>page.waitForTimeout(1900);
/** Counts rAF callbacks and running animations for `ms` (installed by the init script). */
async function idleWork(page,ms=2000){
 await page.evaluate(()=>{window.__raf=0;});await page.waitForTimeout(ms);
 return page.evaluate(()=>({raf:window.__raf,running:document.getAnimations().filter(a=>a.playState==='running').length}));
}
async function passGate(page){
 const gate=page.locator('[data-parent-gate]').first();
 if(!(await gate.count()))return;
 const q=await gate.locator('label').first().textContent();const m=/What is (\w+) times (\w+)\?/.exec(q||'');assert.ok(m,'gate question: '+q);
 await gate.locator('[data-parent-gate-answer]').fill(String(WORDS.indexOf(m[1])*WORDS.indexOf(m[2])));
 await gate.getByRole('button',{name:'Continue'}).click();
}
async function frames(page,sel,name,times){let last=0;for(const t of times){await page.waitForTimeout(t-last);last=t;await shotEl(page,sel,`${name}-${String(t).padStart(4,'0')}ms`);}}

async function run(browser,vp){
 const tag=vp.width<600?'phone':'desktop';
 const ctx=await browser.newContext({viewport:vp,hasTouch:vp.width<600,isMobile:vp.width<600,deviceScaleFactor:vp.width<600?2:1});
 await ctx.addInitScript(()=>{
  try{if(!localStorage.getItem('fi2-welcome-v1'))localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-grownups-format-v1','7v7');}catch{}
  const raf=window.requestAnimationFrame.bind(window);window.__raf=0;window.requestAnimationFrame=cb=>raf(t=>{window.__raf++;cb(t);});
 });
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('[data-arcade-enter]',{state:'attached',timeout:120000});
 await page.waitForTimeout(4000);
 // Open the plan the way For grown-ups → "Open this week's plan" does.
 for(let i=0;i<20&&!(await page.locator('dialog[data-grownups][open]').count());i++){await page.evaluate(()=>window.dispatchEvent(new CustomEvent('fi2-open-grownups',{detail:{view:'plan'}})));await page.waitForTimeout(500);}
 await shot(page,`${tag}-00-gate`);
 await passGate(page);
 await page.waitForSelector('[data-idp-plan]');
 await page.getByRole('tab',{name:'My plan'}).click();
 // PLAYER: make the plan together.
 await page.waitForSelector('[data-idp-builder]');await settle(page);await shot(page,`${tag}-01-builder-love`);
 await page.locator('button[data-corner=technical]').first().click();await page.locator('[data-builder-next]').click();
 await settle(page);
 await page.locator('[data-goal-option="7-look"]').click();await page.locator('[data-goal-option="7-touch"]').click();
 await shot(page,`${tag}-02-builder-goals`);
 await page.locator('[data-builder-next]').click();await settle(page);await shot(page,`${tag}-03-builder-who`);
 await page.locator('[data-who="Me and my coach"]').click();
 // The story opens on My goal: frame sequence of the ring growing and the evidence flying in.
 await page.waitForSelector('[data-idp-story]');
 if(tag==='phone')await frames(page,'[data-idp-story]',`${tag}-04-goal-frames`,[0,180,400,700,1100,1700]);else await settle(page);
 await shot(page,`${tag}-04-goal`);
 const rest=await idleWork(page);console.log(tag,'at rest on My goal:',rest);assert.equal(rest.running,0,'no running animations at rest');assert.equal(rest.raf,0,'no rAF at rest while the plan is open');
 // Beat 1 (Start) via the rail, then forward through Next.
 await page.locator('nav[aria-label="Plan story"] button').first().click();await settle(page);await shot(page,`${tag}-05-start`);
 await page.locator('nav[aria-label="Plan story"] button').nth(2).click();await page.waitForTimeout(60);
 if(tag==='phone')await frames(page,'[data-idp-story]',`${tag}-06-practice-frames`,[0,300,700,1300]);else await settle(page);
 await shot(page,`${tag}-06-practice`);
 await page.locator('[data-mission-done]').first().click();await page.waitForTimeout(700);await shot(page,`${tag}-07-mission-done`);
 await page.locator('nav[aria-label="Plan story"] button').nth(3).click();await settle(page);await shot(page,`${tag}-08-feel`);
 for(const feel of ['tricky','getting']){await page.locator(`[data-feel=${feel}]`).click();if(feel==='tricky'){await page.getByRole('button',{name:'At training'}).click();await page.getByRole('button',{name:/help with this/}).click();await shot(page,`${tag}-09-checkin`);}await page.locator('[data-checkin-save]').click();await page.waitForTimeout(200);}
 await page.locator('[data-add-proud]').click();await page.waitForTimeout(500);await shot(page,`${tag}-10-stickers`);
 await page.locator('[data-sticker=brave]').click();
 // Re-enter the beat so the feel line draws on with two check-ins.
 await page.locator('nav[aria-label="Plan story"] button').nth(2).click();await page.waitForTimeout(300);
 await page.locator('nav[aria-label="Plan story"] button').nth(3).click();await settle(page);await shot(page,`${tag}-11-feel-line`);
 await page.locator('nav[aria-label="Plan story"] button').nth(4).click();await settle(page);await shot(page,`${tag}-12-next`);
 await page.locator('[data-can-now="7-look"]').click();
 await page.waitForSelector('[data-celebrate]');
 await frames(page,'[data-celebrate]',`${tag}-13-celebrate`,[0,250,600,950,1300,1700,2200]);
 const celebrateRest=await idleWork(page,1500);assert.equal(celebrateRest.running,0,'the celebration ends');
 await page.locator('[data-celebrate-next]').click();await settle(page);await shot(page,`${tag}-14-next-goal`);
 // Two goals → one met; the plan still has 7-touch, so "Add or change" shows when chosen; pick a new goal via the picker.
 const picker=page.locator('[data-goal-option]');if(await picker.count()){await picker.first().click();await settle(page);}
 await shot(page,`${tag}-15-after-next-goal`);
 const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('fi2-idp-v2')));
 assert.ok(st.history.some(h=>h.goalId==='7-look'&&h.outcome==='met'),'7-look met');assert.ok(st.plan.missions.length>=1&&st.plan.checkins.length>=2&&st.plan.proud.length>=1);
 assert.ok(!JSON.stringify(st).match(/"text"/),'no text in the synced plan');
 // PARENT: the Grown-ups tab.
 await page.getByRole('tab',{name:'Grown-ups'}).click();await page.waitForSelector('[data-grown-view]');
 if(tag==='phone')await frames(page,'[data-grown-view]',`${tag}-16-grown-frames`,[0,300,800,1600]);else await settle(page);
 await shot(page,`${tag}-16-grown`);
 await page.locator('[data-grown-view]').evaluate(el=>el.closest('[class*="body"]')?.scrollBy(0,700));await page.waitForTimeout(300);await shot(page,`${tag}-17-grown-ask`);
 await page.locator('[data-cheer] button').first().click();
 await page.locator('[data-grown-view]').evaluate(el=>el.closest('[class*="body"]')?.scrollBy(0,900));await page.waitForTimeout(300);await shot(page,`${tag}-18-grown-cheer`);
 await page.locator('#idp-fridge-name').fill('Sam');
 await page.locator('[data-fridge-print]').click();
 const printed=await page.waitForFunction(()=>{const f=document.querySelector('iframe[data-grownups-print]');return f&&f.srcdoc?f.srcdoc:null;},null,{timeout:10000}).then(h=>h.jsonValue());
 fs.writeFileSync(path.join(OUT,`${tag}-19-fridge.html`),printed);
 assert.match(printed,/Sam’s football plan/);assert.match(printed,/data:image\/png;base64/,'the QR is an inline image');assert.ok(!/<script/i.test(printed));
 const fridge=await ctx.newPage();await fridge.setViewportSize({width:820,height:1160});await fridge.setContent(printed);await fridge.waitForTimeout(300);
 const fp=path.join(OUT,`${tag}-19-fridge-card.png`);await fridge.screenshot({path:fp,fullPage:true});shots.push(fp);await fridge.close();
 // COACH: make a goal QR, then open its link like a scanning player would.
 await page.getByRole('tab',{name:'Coach'}).click();await page.waitForSelector('[data-coach-tools]');await settle(page);await shot(page,`${tag}-20-coach`);
 await page.locator('[data-coach-goal="7-goalside"]').click();await page.getByRole('button',{name:/Ball, you, goal/}).click();
 await page.locator('[data-make-qr]').click();await page.waitForSelector('[data-coach-qr-code] img');
 await page.locator('[data-coach-qr-code]').scrollIntoViewIfNeeded();await shot(page,`${tag}-21-coach-qr`);
 const link=(await page.locator('[data-coach-qr]').locator('p').filter({hasText:'/plan#c='}).textContent()).trim();
 assert.match(link,/\/plan#c=1~7-goalside~q0~k[0-9a-z]{3}$/);
 await page.locator('[data-session]').scrollIntoViewIfNeeded();await shot(page,`${tag}-22-coach-session`);
 const kid=await ctx.newPage();await kid.goto(link);await kid.waitForSelector('[data-coach-link]');await kid.waitForTimeout(600);
 const kp=path.join(OUT,`${tag}-23-coach-link.png`);await kid.screenshot({path:kp,fullPage:true});shots.push(kp);
 await kid.locator('[data-add-coach-goal]').click();await kid.waitForSelector('text=Added!');
 const after=await kid.evaluate(()=>JSON.parse(localStorage.getItem('fi2-idp-v2')));
 assert.ok(after.plan.goals.some(g=>g.goalId==='7-goalside'&&g.source==='coach'&&g.cue===0),'the coach goal is in the plan');
 const kp2=path.join(OUT,`${tag}-24-coach-added.png`);await kid.screenshot({path:kp2,fullPage:true});shots.push(kp2);await kid.close();
 // PHONE: the fridge card's QR on a grown-up's own phone (fresh browser, no saves).
 await page.getByRole('tab',{name:'Grown-ups'}).click();await page.waitForSelector('[data-fridge]');
 const wk=await page.locator('[data-fridge]').getAttribute('data-week-url');assert.match(wk||'',/^\/plan#p=1~7v7~/);
 const grownCtx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const parent=await grownCtx.newPage();
 if(wk){await parent.goto(BASE+wk);await parent.waitForSelector('[data-week-story]');await parent.waitForTimeout(1800);const pp=path.join(OUT,`${tag}-25-parent-phone.png`);await parent.screenshot({path:pp,fullPage:true});shots.push(pp);}
 await grownCtx.close();
 // Reduced motion: a beat is complete with no animation.
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('tab',{name:'My plan'}).click();await page.waitForSelector('[data-idp-story]');
 await page.locator('nav[aria-label="Plan story"] button').nth(2).click();await page.waitForTimeout(80);
 const rm=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);assert.equal(rm,0,'reduced motion: nothing animates');
 await shot(page,`${tag}-26-reduced-motion-practice`);
 assert.deepEqual(errors.filter(e=>!/ResizeObserver|WebGL|context lost/i.test(e)),[],'no page errors');
 await ctx.close();
 return {rest};
}
(async()=>{
 if(!chromium)throw Error('playwright not found');
 const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader'],executablePath:fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined});
 try{for(const vp of [{width:390,height:844},{width:1280,height:800}]){const r=await run(browser,vp);console.log('IDP_BROWSER_PASS',vp.width,JSON.stringify(r));}}
 finally{await browser.close();}
 console.log(shots.length+' screenshots in '+OUT);
})().catch(e=>{console.error(e);process.exit(1);});
