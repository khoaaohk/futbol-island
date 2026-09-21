// Live-app check for riso stories: opens Paths → Futsal → "Story: The Chalk Line" at four viewports and asserts the player contract.
// Usage: node scripts/check-riso-films-browser.mjs [--title "The Chalk Line"] [--format Futsal] [--out dir] [--chapters 6] [--track [--paragraphs N]]
// --track: a track-mode story (seek slider instead of chapter dots; screenshots taken by seeking through filmControls).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const arg=(name,fallback)=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:fallback;
const title=arg('--title','The Chalk Line'),format=arg('--format','Futsal'),track=process.argv.includes('--track'),chapterCount=Number(arg('--chapters','6')),paragraphs=Number(arg('--paragraphs','0'));
const out=arg('--out',track?'/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/track-check':'/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/chalk-line');
mkdirSync(out,{recursive:true});
const sizes=[[390,850],[320,568],[844,390],[1440,850]];
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(const [width,height] of sizes){
 const page=await browser.newPage({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,deviceScaleFactor:width<1000?2:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');window.__pathFilmAudio=[];window.Audio=new Proxy(window.Audio,{construct(Target,args){const audio=new Target(...args);window.__pathFilmAudio.push(audio);return audio;}});});
 await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');await page.getByRole('button',{name:'Paths',exact:true}).waitFor({timeout:90000});await page.getByRole('button',{name:'Paths',exact:true}).click();await page.getByRole('group',{name:'Choose a format'}).waitFor();
 await page.getByRole('group',{name:'Choose a format'}).getByRole('button').filter({hasText:new RegExp(format,'i')}).click();
 await page.getByRole('button',{name:`Story: ${title}`,exact:true}).click();
 const film=page.locator('[data-riso-story]');await film.waitFor({timeout:20000});const id=await film.getAttribute('data-path-film');
 const tray=film.getByRole('region',{name:'Story playback and captions'});const box=await tray.boundingBox();
 assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=width+.5&&box.y+box.height<=height+.5,`tray fits viewport ${width}x${height}: ${JSON.stringify(box)}`);
 const clock=await film.locator('[aria-label="Elapsed and total story time"]').boundingBox();assert.ok(Math.abs((box.x+box.width/2)-(clock.x+clock.width/2))<=1,'timestamp centered on tray');
 assert.equal(await film.getByRole('button',{name:'Back to path',exact:true}).count(),0,'no redundant back-to-path button');
 await film.getByRole('button',{name:'Pause',exact:true}).waitFor({timeout:15000});await page.waitForTimeout(700);
 assert.equal(await film.getByRole('button',{name:'Pause',exact:true}).count(),1,'narration playback starts');
 const canvas=film.locator('canvas');const first=Number(await canvas.getAttribute('data-draws'));await page.waitForTimeout(400);assert.ok(Number(await canvas.getAttribute('data-draws'))>first,'canvas draws while playing');
 assert.equal(await canvas.getAttribute('data-riso-error'),null,'story draw raised no error');
 const paperish=await canvas.evaluate(c=>{const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,c.height).data;let cream=0,n=0;for(let i=0;i<d.length;i+=64){n++;if(d[i]>200&&d[i+1]>195&&d[i+2]>170)cream++;}return cream/n;});
 assert.ok(paperish<.85,`the print carries ink, not bare paper (${(paperish*100).toFixed(0)}% cream)`);
 if(track){
  // Single-track stories share the same segmented chapter bar (one segment per visual chapter); no seek slider anywhere.
  assert.equal(await film.getByRole('slider',{name:'Story progress'}).count(),0,'no seek slider in track mode');
  const segments=film.getByRole('button',{name:/Chapter \d+:/});const n=await segments.count();assert.ok(n>=5&&n<=12,`visual-chapter segments in the bar (${n})`);
  for(let i=0;i<n;i++){await segments.nth(i).click();await page.waitForTimeout(120);assert.equal(await segments.nth(i).getAttribute('aria-current'),'step',`segment ${i+1} current`);await page.waitForTimeout(400);await page.screenshot({path:path.join(out,`app-${id}-${width}x${height}-ch${i+1}.png`)});}
  await film.evaluate(n=>n.filmControls.seekTime(1));await page.waitForTimeout(300);await film.evaluate(n=>n.filmControls.play());await page.waitForTimeout(900);await page.screenshot({path:path.join(out,`app-${id}-${width}x${height}.png`)});
 }else{
  const chapters=film.getByRole('button',{name:/Chapter \d:/});assert.equal(await chapters.count(),chapterCount,`${chapterCount} chapter dots`);
  for(let i=0;i<chapterCount;i++){await chapters.nth(i).click();await page.waitForTimeout(120);assert.equal(await chapters.nth(i).getAttribute('aria-current'),'step',`chapter ${i+1} current`);await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`app-${id}-${width}x${height}-ch${i+1}.png`)});}
  await chapters.nth(Math.min(3,chapterCount-1)).click();await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,`app-${id}-${width}x${height}.png`)});
 }
 await film.getByRole('button',{name:'Pause',exact:true}).click();await page.waitForTimeout(120);
 assert.equal(await page.evaluate(()=>window.__pathFilmAudio.at(-1).paused),true,'pause stops narration');
 const count=await canvas.getAttribute('data-draws');await page.waitForTimeout(300);assert.equal(await canvas.getAttribute('data-draws'),count,'paused canvas sleeps');
 // a touch while paused wakes a bounded burst, then the canvas sleeps again
 const cb=await canvas.boundingBox(),tx=cb.x+cb.width*.5,ty=cb.y+cb.height*.45;
 const boxPixels=async()=>canvas.evaluate((c,[x,y])=>{const r=c.getBoundingClientRect(),k=c.width/r.width,g=c.getContext('2d'),s=Math.round(60*k),d=g.getImageData(Math.round((x-r.left)*k)-s,Math.round((y-r.top)*k)-s,s*2,s*2).data;return Array.from(d);},[tx,ty]);
 const before=await boxPixels();await page.mouse.click(tx,ty);await page.waitForTimeout(300);const after=await boxPixels();
 let changed=0;for(let i=0;i<before.length;i+=4)if(Math.abs(before[i]-after[i])+Math.abs(before[i+1]-after[i+1])+Math.abs(before[i+2]-after[i+2])>40)changed++;
 assert.ok(changed>before.length/4*.02,`touch reaction is visible in a 120 px box around the touch (${(changed/(before.length/4)*100).toFixed(1)}% of pixels changed at +0.3 s)`);
 const woke=Number(await canvas.getAttribute('data-draws'));assert.ok(woke>Number(count),'touch wakes a burst while paused');
 await page.waitForTimeout(1100);const slept=await canvas.getAttribute('data-draws');await page.waitForTimeout(300);assert.equal(await canvas.getAttribute('data-draws'),slept,'burst ends and the canvas sleeps');
 await page.screenshot({path:path.join(out,`app-${id}-${width}x${height}-touch.png`)});
 await film.getByRole('button',{name:'Read story transcript',exact:true}).click();const transcript=film.getByRole('article',{name:'Story transcript'});await transcript.waitFor();const paras=await transcript.locator('p').count();if(track)assert.ok(paragraphs?paras===paragraphs:paras>=1,`transcript lists ${paragraphs||'the'} caption paragraphs (${paras})`);else assert.equal(paras,chapterCount,`transcript lists ${chapterCount} chapters`);
 await film.getByRole('button',{name:'Back to story'}).click();assert.equal(await film.getByRole('button',{name:'Read story transcript',exact:true}).evaluate(n=>n===document.activeElement),true,'focus returns to Read');
 await film.getByRole('button',{name:'Done',exact:true}).click();await film.waitFor({state:'detached',timeout:5000});
 assert.equal(await page.evaluate(()=>{const audio=window.__pathFilmAudio.at(-1);return audio.paused&&!audio.getAttribute('src');}),true,'close releases narration source');
 assert.deepEqual(errors,[],'zero page errors');console.log('PASS',`${width}x${height}`,id,`touch ${(changed/(before.length/4)*100).toFixed(1)}%`);await page.close();
}}finally{await browser.close();}
