// World Cup ball gallery: compile all 40 ball shaders in a real browser and fail on any shader error; then step through the
// timeline (men's and women's) and flip a final ball. Needs the dev server on :8092. usage: node scripts/check-wc-balls-browser.cjs
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--mute-audio']});const p=await b.newPage({viewport:{width:1000,height:800}});const errors=[];
 p.on('console',m=>{if(m.type()==='error'||/Shader Error|WebGLProgram/.test(m.text()))errors.push(m.text().slice(0,800));});p.on('pageerror',e=>errors.push('PAGEERR '+e.message));
 await p.addInitScript(()=>{try{localStorage.setItem('fi2-audio-mix','4-50-v1');localStorage.setItem('sound-muted','1');localStorage.setItem('music-enabled','0');localStorage.setItem('voice-enabled','0');}catch{}});
 await p.goto('http://localhost:8092/museum?balls',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.__wcBallsWarmAll,null,{timeout:90000});
 const t0=Date.now(),n=await p.evaluate(()=>window.__wcBallsWarmAll());console.log(`compiled ${n} ball shaders in ${Date.now()-t0} ms`);
 for(let i=0;i<22;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(60);}
 const last=await p.getAttribute('[data-wc-balls]','data-ball');if(last!=='2026-trionda')errors.push('ArrowRight did not reach 2026: '+last);
 await p.click('[data-wc-final]');await p.waitForTimeout(300);if(await p.getAttribute('[data-wc-balls]','data-ball')!=='2026-trionda-final')errors.push('final toggle failed');
 await p.click('[data-wc-comp=women]');await p.waitForTimeout(300);const w=await p.getAttribute('[data-wc-balls]','data-ball');if(!w.startsWith('wwc-2023'))errors.push('women switch landed on '+w);
 await p.keyboard.press('Home');await p.waitForTimeout(300);if(await p.getAttribute('[data-wc-balls]','data-ball')!=='wwc-1999-icon')errors.push('Home failed');
 await b.close();if(errors.length){console.error('FAIL\n'+errors.join('\n'));process.exit(1);}console.log('PASS browser: all shaders compile, timeline, final ball and Men/Women switch work');})();
