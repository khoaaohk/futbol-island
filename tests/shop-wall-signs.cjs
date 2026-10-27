// Kit Shop wall signs (Oct 26 2026, QA: "the KIT SHOP label overlaps the jersey wall sign"). The west wall's KIT SHOP wordmark and
// the DESIGN YOUR OWN KIT strip over the shirt shelves shared one plane and overlapped by ~0.3 m (z-fighting, the wordmark's plate
// over the strip's letters). Checks, from lib/shop/shopLayout.ts WALL_SIGNS:
//  1. every sign's aspect matches its rect in the sign atlas (shopScene.ts SIGN), and the scene places the signs from WALL_SIGNS;
//  2. signs on one wall never overlap (with a small gap), stay under the ceiling and inside the wall, clear of the corners;
//  3. the strip sits above the folded-shirt stacks.
// usage: node tests/shop-wall-signs.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const L=require('../lib/shop/shopLayout.ts');
const {ROOM,WALL_SIGNS:W,SHELF_STACK_TOP}=L;

// 1. Atlas aspects and wiring.
const scene=read('lib/shop/shopScene.ts');
const atlas=scene.match(/const SIGN=\{([\s\S]*?)\}\s*as const/)[1];
for(const [k,s] of Object.entries(W)){
 const m=atlas.match(new RegExp(`\\b${k}:\\[(\\d+),(\\d+),(\\d+),(\\d+)\\]`));assert(m,'atlas rect for '+k);
 assert(Math.abs(s.aspect-(+m[4])/(+m[3]))<1e-9,`${k}: aspect matches the atlas rect`);
}
assert(/WALL_SIGNS/.test(scene)&&/at\('logo',Math\.PI\/2\)/.test(scene)&&/at\('tagline',Math\.PI\/2\)/.test(scene),'the scene places the wall signs from WALL_SIGNS');
assert(!/sign\(SIGN\.(logo|tagline|jersey),\d/.test(scene),'no hard-coded wall sign placements left');

// 2. Extents per wall: a sign is a rectangle in (along-wall, y).
const GAP=.08;
const wallOf=s=>Math.abs(s.z-(ROOM.back+.03))<1e-6?'back':Math.abs(s.x-(-ROOM.halfW+.03))<1e-6?'west':Math.abs(s.x-(ROOM.halfW-.03))<1e-6?'east':'?';
const rect=s=>{const h=s.width*s.aspect,along=wallOf(s)==='back'?s.x:s.z;return {a0:along-s.width/2,a1:along+s.width/2,y0:s.y-h/2,y1:s.y+h/2};};
const byWall={};
for(const [k,s] of Object.entries(W)){const w=wallOf(s);assert.notEqual(w,'?',k+' sits on a wall');(byWall[w]??=[]).push([k,rect(s)]);}
for(const [wall,list] of Object.entries(byWall)){
 for(const [k,r] of list){
  assert(r.y1<=ROOM.h-.04,`${k}: under the ceiling (${r.y1.toFixed(2)} m)`);
  const lo=wall==='back'?-ROOM.halfW:ROOM.back,hi=wall==='back'?ROOM.halfW:ROOM.front;
  assert(r.a0>=lo+.5&&r.a1<=hi-.5,`${k}: inside its wall, clear of the corners`);
 }
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
  const [ka,a]=list[i],[kb,b]=list[j];
  const apart=a.a1+GAP<=b.a0||b.a1+GAP<=a.a0||a.y1+GAP<=b.y0||b.y1+GAP<=a.y0;
  assert(apart,`${ka} and ${kb} (${wall} wall) do not overlap`);
 }
}
assert.equal(byWall.west.length,2,'west wall: the KIT SHOP wordmark and the strip');
assert(rect(W.logo).y0>rect(W.tagline).y1,'KIT SHOP wordmark above the strip');

// 3. Above the shirt stacks.
assert(rect(W.tagline).y0>SHELF_STACK_TOP,'the strip clears the top shirt stacks');
assert(new RegExp(`\\[\\.85,1\\.55,2\\.25\\]`).test(scene),'shelf heights unchanged (SHELF_STACK_TOP assumes a 2.25 m top shelf)');
console.log('shop-wall-signs: ok');
