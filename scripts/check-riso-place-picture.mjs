// Live-app check for riso story place-picture: opens Paths → 7v7 → "Story: A Place in the Picture" at four viewports and asserts the player contract.
// Usage: node scripts/check-riso-films-browser.mjs [--title "The Chalk Line"] [--format Futsal] [--out dir]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const arg=(name,fallback)=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:fallback;
const title=arg('--title','A Place in the Picture'),format=arg('--format','7v7'),out=arg('--out','/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/place-picture');
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
 const paperish=await canvas.evaluate(c=>{const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,c.height).data;let cream=0,n=0;for(let i=0;i<d.length;i+=64){n++;if(d[i]>200&&d[i+1]>195&&d[i+2]>170)cream++;}return cream/n;});
 assert.ok(paperish<.85,`the print carries ink, not bare paper (${(paperish*100).toFixed(0)}% cream)`);
 const chapters=film.getByRole('button',{name:/Chapter \d:/});assert.equal(await chapters.count(),6,'six chapter dots');
 for(let i=0;i<6;i++){await chapters.nth(i).click();await page.waitForTimeout(120);assert.equal(await chapters.nth(i).getAttribute('aria-current'),'step',`chapter ${i+1} current`);await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`app-${id}-${width}x${height}-ch${i+1}.png`)});}
 await chapters.nth(3).click();await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,`app-${id}-${width}x${height}.png`)});
 await film.getByRole('button',{name:'Pause',exact:true}).click();await page.waitForTimeout(120);
 assert.equal(await page.evaluate(()=>window.__pathFilmAudio.at(-1).paused),true,'pause stops narration');
 const count=await canvas.getAttribute('data-draws');await page.waitForTimeout(300);assert.equal(await canvas.getAttribute('data-draws'),count,'paused canvas sleeps');
 // a touch while paused wakes a bounded burst, then the canvas sleeps again
 const cb=await canvas.boundingBox();await page.mouse.click(cb.x+cb.width*.5,cb.y+cb.height*.45);await page.waitForTimeout(250);const woke=Number(await canvas.getAttribute('data-draws'));assert.ok(woke>Number(count),'touch wakes a burst while paused');
 await page.waitForTimeout(1100);const slept=await canvas.getAttribute('data-draws');await page.waitForTimeout(300);assert.equal(await canvas.getAttribute('data-draws'),slept,'burst ends and the canvas sleeps');
 await page.screenshot({path:path.join(out,`app-${id}-${width}x${height}-touch.png`)});
 await film.getByRole('button',{name:'Read story transcript',exact:true}).click();const transcript=film.getByRole('article',{name:'Story transcript'});await transcript.waitFor();assert.equal(await transcript.locator('p').count(),6,'transcript lists six chapters');
 await film.getByRole('button',{name:'Back to story'}).click();assert.equal(await film.getByRole('button',{name:'Read story transcript',exact:true}).evaluate(n=>n===document.activeElement),true,'focus returns to Read');
 await film.getByRole('button',{name:'Done',exact:true}).click();await film.waitFor({state:'detached',timeout:5000});
 assert.equal(await page.evaluate(()=>{const audio=window.__pathFilmAudio.at(-1);return audio.paused&&!audio.getAttribute('src');}),true,'close releases narration source');
 assert.deepEqual(errors,[],'zero page errors');console.log('PASS',`${width}x${height}`,id);await page.close();
}}finally{await browser.close();}
