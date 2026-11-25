// Train wraps: draw the wrap atlas (lib/town/trainWrapArt.ts at its trainWraps.ts layout) on one headless Chrome (--mute-audio) to a PNG.
// Run: node scripts/shot-train-wraps-atlas.cjs <out.png>
const ts=require('typescript'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),out=process.argv[2];
const {L}=require(path.join(root,'tests/lib/tsLoad.cjs'));const W=L('lib/town/trainWraps.ts');
let js=ts.transpileModule(fs.readFileSync(path.join(root,'lib/town/trainWrapArt.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.None,target:ts.ScriptTarget.ES2020}}).outputText;
js=js.replace(/"use strict";/,'');
const rects=[];for(let t=0;t<3;t++){const row=[];for(let k=0;k<4;k++)row.push(W.tileRect(t,k));rects.push({row,badge:W.badgeRect(t),slogan:W.WRAP_THEMES[t].slogan});}
const html=`<canvas id=c width=${W.ATLAS_W} height=${W.ATLAS_H}></canvas><script>var exports={};${js}
const c=document.getElementById('c').getContext('2d');c.fillStyle='#555';c.fillRect(0,0,${W.ATLAS_W},${W.ATLAS_H});const R=${JSON.stringify(rects)};
R.forEach((t,ti)=>{t.row.forEach((r,k)=>{const s=r.h/100;c.save();c.translate(r.x,r.y);c.scale(s,s);drawWrapTile(c,ti,k,r.w/s,t.slogan);c.restore();});const b=t.badge,s=b.w/100;c.save();c.translate(b.x,b.y);c.scale(s,s);drawWrapBadge(c,ti);c.restore();});
document.title='done';</script>`;
(async()=>{const {chromium}=require(path.join(root,'node_modules/playwright'));const b=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});const p=await b.newPage({viewport:{width:W.ATLAS_W,height:W.ATLAS_H}});
p.on('pageerror',e=>console.log('ERR',e.message));await p.setContent(html);await p.waitForFunction(()=>document.title==='done',null,{timeout:10000}).catch(()=>console.log('timeout'));
await p.locator('#c').screenshot({path:out});await b.close();console.log('shot',out);})();
