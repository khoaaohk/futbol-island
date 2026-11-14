// Gashapon toy icons (Nov 10 2026, owner: "update all these icons to the art style we talked about and match each to their
// toys"): lib/gashapon/toyIcons. Every toy of every machine listed in TOY_ICON_SETS has its own icon (one per machine file, six
// each), drawings are unique, fills are vibrant (no near-black: luminance floor, INK outline cells excepted), markup is static and
// safe (no <script>, no on* handlers, no external refs), and the shelf / panel / machine card draw ToyIcon (no face circles).
// The contact sheet for looking at them: render each TOY_ICONS entry in <svg viewBox="0 0 16 16" shape-rendering="crispEdges">
// at 56 and 112 px (an HTML page in headless Chrome) and look at every one before adding a machine.
// usage: node tests/gashapon-icons.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),cache=new Map();
function load(f){if(!/\.tsx?$/.test(f))f=fs.existsSync(f+'.ts')?f+'.ts':f+'.tsx';if(cache.has(f))return cache.get(f).exports;const m={exports:{}};cache.set(f,m);
 const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 new Function('exports','module','require',code)(m.exports,m,id=>id.startsWith('@/')?load(path.join(base,id.slice(2))):id.startsWith('.')?load(path.resolve(path.dirname(f),id)):require(id));return m.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const {TOY_ICONS,TOY_ICON_SETS,toyIconMarkup}=load(path.join(base,'lib/gashapon/toyIcons/index.ts'));
const {INK}=load(path.join(base,'lib/gashapon/toyIcons/types.ts'));
const {GASHAPON_TOYS}=load(path.join(base,'lib/gashapon/toys.ts'));
const {GASHAPON_MACHINES}=load(path.join(base,'lib/gashapon/machines.ts'));
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const lum=hex=>{const n=parseInt(hex.slice(1),16),c=v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;};return 0.2126*c(n>>16)+0.7152*c((n>>8)&255)+0.0722*c(n&255);};
const FIRST7=['gs-square-snacks','gs-square-lucky','gs-cay-sweets','gs-cay-bento','gs-arcade-heroes','gs-arcade-pixel','gs-westbeach'];

ok('machines 1-7 in machines.ts order have icon sets',()=>{assert.deepEqual(GASHAPON_MACHINES.slice(0,7).map(m=>m.id),FIRST7);for(const m of FIRST7)assert.ok(TOY_ICON_SETS[m],m);});
ok('all 14 set machines have icon sets, in machines.ts order (84 toys; the 4 stadium machines share sets)',()=>{assert.equal(GASHAPON_MACHINES.length,18);assert.deepEqual(Object.keys(TOY_ICON_SETS),GASHAPON_MACHINES.filter(m=>!m.set).map(m=>m.id));
 assert.equal(Object.keys(TOY_ICONS).length,84);for(const t of GASHAPON_TOYS)assert.ok(toyIconMarkup(t.id),`${t.id} has no icon`);});
ok('every toy of every listed machine has its own icon, and no stray ids',()=>{
 for(const [m,set] of Object.entries(TOY_ICON_SETS)){const ids=GASHAPON_TOYS.filter(t=>t.machine===m).map(t=>t.id);assert.equal(ids.length,6,m);
  for(const id of ids)assert.ok(typeof set[id]==='string'&&set[id].length>40,`${m}: ${id} has no icon`);
  for(const id of Object.keys(set))assert.ok(ids.includes(id),`${m}: ${id} is not a toy of this machine`);}
 assert.ok(Object.keys(TOY_ICONS).length>=42);assert.equal(toyIconMarkup('nope'),null);assert.equal(toyIconMarkup('toString'),null);});
ok('every drawing is unique',()=>{const seen=new Map();for(const [id,m] of Object.entries(TOY_ICONS)){assert.ok(!seen.has(m),`${id} duplicates ${seen.get(m)}`);seen.set(m,id);}});
ok('vibrant fills only: no near-black (luminance floor 0.07; INK outline excepted)',()=>{
 for(const [id,m] of Object.entries(TOY_ICONS))for(const [,c] of m.matchAll(/fill="(#[0-9a-fA-F]{6})"/g)){if(c.toLowerCase()===INK)continue;assert.ok(lum(c)>=0.07,`${id}: fill ${c} is too dark (${lum(c).toFixed(3)})`);}
 for(const [id,m] of Object.entries(TOY_ICONS))assert.ok(!/fill="(black|#000\b|#000000)"/i.test(m),id);});
ok('safe static markup: known tags only, no script, no on* handlers, no links, no gradients',()=>{
 for(const [id,m] of Object.entries(TOY_ICONS)){assert.ok(!/<script|\son[a-z]+=|href|url\(|javascript:|<foreignObject|<image|Gradient|filter=/i.test(m),id);
  for(const [,tag] of m.matchAll(/<([a-zA-Z]+)/g))assert.ok(['path','circle','ellipse','rect','g'].includes(tag),`${id}: <${tag}>`);
  assert.equal((m.match(/</g)||[]).length,(m.match(/\/>|<\/g>/g)||[]).length,`${id}: every element self-closes`);}});
ok('every icon uses the INK outline',()=>{for(const [id,m] of Object.entries(TOY_ICONS)){assert.ok(m.includes(INK),id);}});
ok('ToyIcon: viewBox 16 + crispEdges, aria-hidden, capsule fallback',()=>{const s=read('components/ToyIcon.tsx');
 assert.match(s,/viewBox:'0 0 16 16'/);assert.match(s,/shapeRendering:'crispEdges'/);assert.match(s,/'aria-hidden':true/);assert.match(s,/data-toy-icon-fallback/);});
ok('the shelf grid, arcade panel and machine card draw ToyIcon, no face circles left',()=>{
 const shelf=read('components/GashaponToyShelf.tsx'),css=read('components/GashaponToyShelf.module.css');
 assert.match(shelf,/<ToyIcon id=\{t\.id\}/);assert.ok(!/'--body'/.test(shelf));assert.ok(!/\.icon::before|\.icon i\{/.test(css),'face dots css gone');
 assert.match(shelf,/Not found yet/);
 assert.match(read('components/GashaponPanel.tsx'),/<ToyIcon id=\{shown\.toy\.id\}/);assert.ok(!/\.art::before/.test(read('components/GashaponPanel.module.css')));
 assert.match(read('components/GashaponMachineFace.tsx'),/<ToyIcon id=\{shown\.toy\.id\}/);});

if(failed){console.log(`\n${failed} failed`);process.exit(1);}else console.log('\nall gashapon icon checks passed');
