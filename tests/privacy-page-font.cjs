// /privacy (Oct 9 2026 QA): its heading uses the IslandBrush face, but no other stylesheet on that route declares it, so it fell
// back to Arial and the root layout's font preload went unused. A standalone route's own CSS must declare any brush face it uses.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const css=read('app/privacy/privacy.module.css'),helper=read('lib/islandBrushPreload.ts');
// Oct 10 2026: the preload moved from the root layout to the routes that paint the brush at once (not /museum: it warned).
const preload=(helper.match(/ISLAND_BRUSH_URL='(\/[^']*IslandBrush[^']*\.ttf)'/)||[])[1];
assert.ok(preload,'lib/islandBrushPreload.ts names the brush URL');
assert.ok(!/rel="preload"[^>]*IslandBrush/.test(read('app/layout.tsx')),'no root-layout preload (unused on /museum)');
for(const r of ['app/page.tsx','app/privacy/page.tsx','app/arcade/page.tsx','app/konbini/page.tsx','app/island-return/page.tsx'])assert.match(read(r),/preloadIslandBrush\(\)/,r+' preloads the brush');
assert.ok(!/preloadIslandBrush/.test(read('app/museum/page.tsx')),'the museum does not');
if(/font-family:[^;}]*IslandBrush/.test(css)){
 const face=css.match(/@font-face\{[^}]*font-family:IslandBrush;[^}]*src:url\('([^']+)'\)/);
 assert.ok(face,'app/privacy/privacy.module.css uses IslandBrush, so it declares the @font-face');
 assert.ok(fs.existsSync(path.join(root,'public',face[1])),'the face file exists: '+face[1]);
 assert.equal(face[1],preload,'same URL as the route preload, so the preload is the one used');
}
console.log('PASS privacy page font: the brush heading has its @font-face (same file as the layout preload)');
