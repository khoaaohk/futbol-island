// /privacy (Oct 9 2026 QA): its heading uses the IslandBrush face, but no other stylesheet on that route declares it, so it fell
// back to Arial and the root layout's font preload went unused. A standalone route's own CSS must declare any brush face it uses.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const css=read('app/privacy/privacy.module.css'),layout=read('app/layout.tsx');
const preload=(layout.match(/href="(\/[^"]*IslandBrush[^"]*\.ttf)"/)||[])[1];
if(/font-family:[^;}]*IslandBrush/.test(css)){
 const face=css.match(/@font-face\{[^}]*font-family:IslandBrush;[^}]*src:url\('([^']+)'\)/);
 assert.ok(face,'app/privacy/privacy.module.css uses IslandBrush, so it declares the @font-face');
 assert.ok(fs.existsSync(path.join(root,'public',face[1])),'the face file exists: '+face[1]);
 if(preload)assert.equal(face[1],preload,'same URL as the root layout preload, so the preload is the one used');
}
console.log('PASS privacy page font: the brush heading has its @font-face (same file as the layout preload)');
