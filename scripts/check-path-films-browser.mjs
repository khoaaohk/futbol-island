// Live-app sweep of all 18 path stories through the riso player (components/StoryFilmPlayer.tsx).
// Usage: node scripts/check-path-films-browser.mjs [--compact-mobile] [--out dir] [--only id[,id]]
// Default viewports 390×850 and 1440×850 (--compact-mobile: 320×568, 390×667, 844×390). For one story at all four viewports with the
// touch-visibility gate use scripts/check-riso-films-browser.mjs --title "…" --format … [--track].
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright'));}
const arg=(name,fallback)=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:fallback;
const only=arg('--only','').split(',').filter(Boolean);
const out=arg('--out','/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/sweep');mkdirSync(out,{recursive:true});
// [format tab, [story id, button title (aria-label "Story: <title>"), track mode]]
const groups=[
 ['Futsal',[['futsl','Smaller court. Bigger game.',true],['chalk-line','The Chalk Line'],['woven-court','The Woven Court'],['kite-turned','The Kite That Turned']]],
 ['7v7',[['regulate','When the game feels unfair.',true],['place-picture','A Place in the Picture'],['pocket-radio','The Pocket Radio'],['signal-water','The Signal Across the Water'],['empathy','Emotional Intelligence']]],
 ['9v9',[['grit','Not yet is a starting point.',true],['different-tides','Different Tides'],['harbour-night','The Harbour at Night'],['unfinished-map','The Unfinished Map']]],
 ['11v11',[['reset','Mental Toughness'],['quiet-lantern','The Quiet Lantern'],['boat-weather','The Boat and the Weather'],['more-shirt','More Than a Shirt'],['loss','After the Final Whistle']]]];
const sizes=process.argv.includes('--compact-mobile')?[[320,568],[390,667],[844,390]]:[[390,850],[1440,850]];
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
let checked=0;
try{for(const [width,height] of sizes){
 const page=await browser.newPage({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,deviceScaleFactor:width<1000?2:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');window.__pathFilmAudio=[];window.Audio=new Proxy(window.Audio,{construct(Target,args){const audio=new Target(...args);window.__pathFilmAudio.push(audio);return audio;}});});
 await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');await page.getByRole('button',{name:'Paths',exact:true}).waitFor({timeout:90000});await page.getByRole('button',{name:'Paths',exact:true}).click();await page.getByRole('group',{name:'Choose a format'}).waitFor();
 for(const [format,stories] of groups){
  await page.getByRole('group',{name:'Choose a format'}).getByRole('button').filter({hasText:new RegExp(format,'i')}).first().click();
  for(const [expectedId,title,track] of stories){
   if(only.length&&!only.includes(expectedId))continue;
   await page.getByRole('button',{name:`Story: ${title}`,exact:true}).click();
   const film=page.locator('[data-riso-story]');await film.waitFor({timeout:20000});const id=await film.getAttribute('data-path-film');assert.equal(id,expectedId,`"${title}" opens the riso story ${expectedId}`);
   assert.equal(await page.locator('[data-story-view]:not([data-riso-story])').count(),0,'no other story view is mounted');
   const tray=film.getByRole('region',{name:'Story playback and captions'});const box=await tray.boundingBox();
   assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width+.5&&box.y+box.height<=height+.5,`${id}: tray fits ${width}x${height}: ${JSON.stringify(box)}`);
   await film.getByRole('button',{name:'Pause',exact:true}).waitFor({timeout:15000});await page.waitForTimeout(600);
   const canvas=film.locator('canvas');const first=Number(await canvas.getAttribute('data-draws'));await page.waitForTimeout(400);assert.ok(Number(await canvas.getAttribute('data-draws'))>first,`${id}: canvas draws while playing`);
   assert.equal(await canvas.getAttribute('data-riso-error'),null,`${id}: story draw raised no error`);
   const paperish=await canvas.evaluate(c=>{const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,c.height).data;let cream=0,n=0;for(let i=0;i<d.length;i+=64){n++;if(d[i]>200&&d[i+1]>195&&d[i+2]>170)cream++;}return cream/n;});
   assert.ok(paperish<.85,`${id}: the print carries ink, not bare paper (${(paperish*100).toFixed(0)}% cream)`);
   if(track){
    assert.equal(await film.getByRole('slider',{name:'Story progress'}).count(),0,`${id}: no seek slider`);
    const segments=film.getByRole('button',{name:/Chapter \d+:/});const n=await segments.count();assert.ok(n>=5&&n<=12,`${id}: visual-chapter segments (${n})`);
    await segments.nth(Math.floor(n/2)).click();await page.waitForTimeout(120);assert.equal(await segments.nth(Math.floor(n/2)).getAttribute('aria-current'),'step',`${id}: mid segment current`);await page.waitForTimeout(500);
   }else{
    const chapters=film.getByRole('button',{name:/Chapter \d:/});assert.equal(await chapters.count(),6,`${id}: six chapter dots`);
    await chapters.nth(3).click();await page.waitForTimeout(120);assert.equal(await chapters.nth(3).getAttribute('aria-current'),'step',`${id}: chapter 4 current`);await page.waitForTimeout(600);
   }
   assert.equal(await canvas.getAttribute('data-riso-error'),null,`${id}: no draw error after seeking`);
   await page.screenshot({path:path.join(out,`sweep-${id}-${width}x${height}.png`)});
   await film.getByRole('button',{name:'Pause',exact:true}).click();await page.waitForTimeout(120);
   assert.equal(await page.evaluate(()=>window.__pathFilmAudio.at(-1).paused),true,`${id}: pause stops narration`);
   const count=await canvas.getAttribute('data-draws');await page.waitForTimeout(300);assert.equal(await canvas.getAttribute('data-draws'),count,`${id}: paused canvas sleeps`);
   await film.getByRole('button',{name:'Done',exact:true}).click();await film.waitFor({state:'detached',timeout:5000});
   assert.equal(await page.evaluate(()=>{const audio=window.__pathFilmAudio.at(-1);return audio.paused&&!audio.getAttribute('src');}),true,`${id}: close releases the narration source`);
   assert.deepEqual(errors,[],`${id}: zero page errors`);checked++;console.log('PASS',`${width}x${height}`,id);
  }
 }
 await page.close();
}}finally{await browser.close();}
console.log(`SWEEP_PASS ${checked} story views (${sizes.map(s=>s.join('x')).join(', ')}) → ${out}`);
