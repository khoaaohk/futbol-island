// World Cup ball audit: count each design's panels from its seams (GPU equirect map + flood fill) and compare with the
// researched panel count; writes flat seam maps to <outDir>/<id>-map.png. Needs the dev server on :8092.
// usage: node scripts/audit-wc-balls.cjs <outDir> [ids...]
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const facts=require('../lib/museum/wcBalls/ballFacts.json');
(async()=>{const out=process.argv[2]||'audit';fs.mkdirSync(out,{recursive:true});const only=process.argv.slice(3);
 const b=await chromium.launch({args:['--mute-audio']});const p=await b.newPage({viewport:{width:900,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{try{localStorage.setItem('fi2-audio-mix','4-50-v1');localStorage.setItem('sound-muted','1');localStorage.setItem('music-enabled','0');localStorage.setItem('voice-enabled','0');}catch{}});
 await p.goto('http://localhost:8092/museum?balls',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.__wcSeamProbe,null,{timeout:90000});
 const ids=only.length?only:Object.keys(facts);const rows=[];
 for(const id of ids){const r=await p.evaluate(id=>window.__wcSeamProbe(id),id);fs.writeFileSync(path.join(out,id+'-map.png'),Buffer.from(r.map.split(',')[1],'base64'));
  const want=(facts[id]?.panels||'').match(/\d+/)?.[0];rows.push({id,want:want?+want:null,got:r.panels,seam:r.seamFraction,areas:r.areas.slice(0,40).join(' ')});
  console.log(`${id.padEnd(36)} want ${String(want??'?').padStart(3)}  got ${String(r.panels).padStart(3)}  ${want&&+want!==r.panels?'MISMATCH':'ok'}  seams ${r.seamFraction}%  areas% ${r.areas.slice(0,14).join(' ')}`);}
 fs.writeFileSync(path.join(out,'panels.json'),JSON.stringify(rows,null,1));await b.close();if(errs.length)console.error(errs.join('\n'));})();
