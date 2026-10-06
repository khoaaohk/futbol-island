// Usage: node preview.cjs <ballId> [outDir]  → <outDir>/<id>-{front,back,top,side}.png (ball crops, 1000x1000 viewport)
const {chromium}=require('/Users/khoado/Desktop/Warp Claude Projects/futbol-island/node_modules/playwright');
(async()=>{const id=process.argv[2],out=process.argv[3]||__dirname+'/shots';require('fs').mkdirSync(out,{recursive:true});
 const b=await chromium.launch({args:['--mute-audio']});const p=await b.newPage({viewport:{width:1000,height:1000},deviceScaleFactor:1});const logs=[];
 p.on('pageerror',e=>logs.push('PAGEERR '+e.message));p.on('console',m=>{const t=m.text();if(m.type()==='error'||/ERROR|shader/i.test(t))logs.push(t.slice(0,1500));});
 await p.addInitScript(()=>{try{localStorage.setItem('fi2-audio-mix','4-50-v1');localStorage.setItem('sound-muted','1');localStorage.setItem('music-enabled','0');localStorage.setItem('voice-enabled','0');}catch{}});
 await p.goto('http://localhost:8092/museum?balls='+encodeURIComponent(id),{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-wc-balls]',{timeout:90000});
 await p.waitForFunction(()=>!!window.__wcBalls,null,{timeout:60000});await p.waitForTimeout(1500);
 const shown=await p.getAttribute('[data-wc-balls]','data-ball');if(shown!==id)logs.push(`WARNING: gallery shows ${shown}, not ${id}`);
 const poses={front:[.3,-.5,.08],back:[.3,2.64,.08],top:[1.4,0,0],side:[-.2,1.3,.4]};
 for(const [n,e] of Object.entries(poses)){await p.evaluate(e=>window.__wcBalls.pose(...e),e);await p.waitForTimeout(400);
  await p.screenshot({path:`${out}/${id}-${n}.png`,clip:{x:270,y:240,width:460,height:460}});}
 console.log(logs.length?logs.join('\n'):'ok, no errors');await b.close();})();
