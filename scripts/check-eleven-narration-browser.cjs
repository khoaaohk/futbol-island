// One live spot check complements the full riso player/seam suites: the new file
// must actually decode/play, not merely exist in the offline manifest.
const assert=require('node:assert/strict');
const {chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{const page=await browser.newPage({viewport:{width:390,height:850},isMobile:true,hasTouch:true});
 await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');window.__voiceAudio=[];window.Audio=new Proxy(window.Audio,{construct(Target,args){const a=new Target(...args);window.__voiceAudio.push(a);return a;}});});
 await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');await page.getByRole('button',{name:'Paths',exact:true}).click({timeout:90000});
 await page.getByRole('group',{name:'Choose a format'}).getByRole('button').filter({hasText:/Futsal/i}).click();
 await page.getByRole('button',{name:'Story: Smaller court. Bigger game.',exact:true}).click();
 await page.getByRole('heading',{name:'Love Futsal',exact:true}).waitFor();
 await page.waitForFunction(()=>window.__voiceAudio.some(a=>a.currentSrc.includes('/stories/eleven/futsl/')&&a.readyState>=2&&a.currentTime>.2),null,{timeout:30000});
 const result=await page.evaluate(()=>{const a=window.__voiceAudio.find(a=>a.currentSrc.includes('/stories/eleven/futsl/'));return{src:a.currentSrc,readyState:a.readyState,time:a.currentTime,duration:a.duration,paused:a.paused};});
 assert.equal(result.paused,false);assert.ok(result.duration>30);assert.ok(result.time>.2);console.log('PASS replacement Futsl audio decodes and plays:',JSON.stringify(result));
 await page.locator('[data-riso-story]').press('Escape');await page.locator('[data-riso-story]').waitFor({state:'detached',timeout:5000});
 assert.ok(await page.evaluate(()=>window.__voiceAudio.every(a=>!a.getAttribute('src')||!a.currentSrc.includes('/stories/eleven/'))),'close releases narration source');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
