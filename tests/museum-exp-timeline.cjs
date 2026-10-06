// timeline wall: every case is an era with a hairline figure, its fact line is quoted from the case, Back/Visit contract, heat.
// usage: node tests/museum-exp-timeline.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const Module=require('node:module'),root=path.join(__dirname,'..'),orig=Module._resolveFilename;
Module._resolveFilename=function(req,...a){return orig.call(this,req.startsWith('@/')?path.join(root,req.slice(2)):req,...a);};
const dir='components/museum/experiences/timeline/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),E=require('../'+dir+'eras.ts'),F=require('../'+dir+'hairline/figures.ts');
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css'),slot=read(dir+'FigureSlot.tsx'),engine=read(dir+'hairline/engine.ts'),figure=read(dir+'hairline/figure.ts'),figs=read(dir+'hairline/figures.ts');

// 1. Every case on the timeline is an era, in timelineOrder(), with its own figure.
{const order=X.timelineOrder().map(e=>e.id),eras=E.eras();
 assert.equal(order.length,X.EXHIBITS.length);assert.deepEqual(eras.map(e=>e.exhibit.id),order,'every timeline case is an era, oldest first');
 for(const id of order){const f=F.FIGURES[id];assert.ok(f,id+' has a figure');assert.equal(typeof f.build,'function');assert.ok(f.label.length>20,id+' figure has a description');assert.ok(f.plate[0]>0&&f.plate[1]>0);}
 assert.equal(Object.keys(F.FIGURES).length,order.length,'no stray figures');
 assert.deepEqual(order.slice(0,5),['laws-1863','penalty-1891','shirts','worldcup-1930','laced-leather']);assert.equal(order.at(-1),'hall-of-fame');
 console.log('PASS 12 eras, one hairline figure each, in timeline order');}

// 2. The fact line is quoted word for word from the case's own facts (no new facts).
{for(const era of E.eras()){const e=era.exhibit;assert.ok(e.facts.includes(era.fact),e.id+' fact line comes from its case');assert.ok(Number.isInteger(E.FACT_LINE[e.id]),e.id+' picks a fact');}
 const at=id=>E.eras().find(x=>x.exhibit.id===id).fact;
 assert.match(at('laws-1863'),/Football Association was formed in London/);assert.match(at('penalty-1891'),/William McCrum/);assert.match(at('shirts'),/1928/);
 assert.match(at('worldcup-1930'),/Argentina 4–2/);assert.match(at('cards-1970'),/Ken Aston/);assert.match(at('telstar-1970'),/black-and-white television/);
 assert.match(at('futsal-1989'),/Brazil won it/);assert.match(at('wwc-1991'),/Norway 2–1/);assert.match(at('backpass-1992'),/Since 1992/);assert.match(at('var-2018'),/final decision|clear mistakes/);
 assert.match(exp,/era\.fact/);assert.match(exp,/\{e\.year\}/);assert.match(exp,/\{e\.title\}/);
 assert.equal(E.tickLabel('Before the 1960s'),'<1960s');assert.equal(E.tickLabel('1891'),'1891');
 console.log('PASS each era quotes one of its case facts, with year and title');}

// 3. Contract: fixed dialog root, shared ExperienceBack (never `immediate`), Visit → onVisit, locks, keys, 44 px.
{assert.match(exp,/data-museum-experience="timeline"/);assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);assert.equal((exp.match(/<ExperienceBack/g)||[]).length,1);
 assert.ok(!/NavigationButton|immediate/.test(exp),'no local NavigationButton, never immediate');
 assert.match(exp,/if\(onVisit\)onVisit\(e\.id\);else onClose\(\)/,'Visit hands the case id to the host');
 assert.match(read('components/museum/experiences/types.ts'),/onVisit\?:\(exhibitId:string\)=>void/,'optional onVisit on the contract');
 assert.match(exp,/exhibitState\(e,counts\)/);assert.match(exp,/state\.lockText/,'locked cases show their lock text');assert.match(exp,/from '@lucasmarkes\/hairline\/react'/,'the package draws the padlock');
 assert.match(exp,/key==='Escape'/);assert.match(exp,/role="slider"/);assert.match(exp,/aria-valuetext/);assert.match(exp,/setPointerCapture/);assert.match(exp,/'Home'/);
 assert.match(css,/\.track\{[^}]*touch-action:none/);assert.match(css,/\.stage\{[^}]*touch-action:none/);
 assert.match(css,/\.stepBtn\{width:48px;height:48px/);assert.match(css,/\.stepBtn\{width:44px;height:44px/);assert.match(css,/\.visit\{[^}]*min-height:46px/);
 assert.match(css,/@media \(hover:hover\)/);assert.match(exp,/museumSfx\.tick\(\)/);assert.ok(!/new AudioContext/.test(exp+figs));
 console.log('PASS contract: dialog root, ExperienceBack, Visit callback, lock text, slider + swipe + keys, 44 px targets');}

// 4. CSS module hygiene: every selector carries a local class; no global ::view-transition or :root rules.
{assert.ok(!/view-transition/.test(css),'no ::view-transition rules');assert.ok(!/(^|\})\s*(:root|html|body|svg|path|button|p|span)[\s:{,]/m.test(css),'no bare element selectors');
 for(const sel of css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@keyframes[^{]+\{([^{}]*\{[^}]*\})*[^}]*\}/g,'').match(/(^|\})[^{}@]+\{/g)||[]){const s=sel.replace(/^\}/,'').replace(/\{$/,'').trim();if(!s||/^(from|to|\d+%)$/.test(s))continue;
  for(const part of s.split(','))assert.match(part.replace(/:global\([^)]*\)/g,''),/\.[a-zA-Z]/,'local class in '+part.trim());}
 console.log('PASS every CSS-module selector has a local class');}

// 5. Heat: one shared loop that sleeps at rest, off-screen skipping, lazy figures destroyed, reduced motion, no polling.
{assert.match(engine,/raf=any\?requestAnimationFrame\(frame\):0/,'the shared loop stops when nothing moves');assert.match(engine,/IntersectionObserver/);assert.match(engine,/document\.hidden/);
 assert.match(engine,/prefers-reduced-motion: reduce/);assert.match(engine,/if\(reduced\)\{sp\.x=sp\.t;sp\.v=0;return false;\}/,'springs land at once under reduced motion');
 assert.match(engine,/if\(!boards\.length\)stop\(\)/,'the loop and observers go when the last figure goes');
 assert.ok((engine.match(/requestAnimationFrame\(/g)||[]).length===2&&!/requestAnimationFrame\(/.test(exp+figure+figs+slot),'one rAF loop, in the engine only');
 assert.ok(!/setInterval/.test(exp+engine+figure+figs+slot),'no polling');
 assert.match(exp,/live=\{Math\.abs\(off\)<=1\}/,'only the active era and its neighbours get figures');assert.match(exp,/if\(Math\.abs\(off\)>2\)return null/);
 assert.match(slot,/h\.destroy\(\)/);assert.match(slot,/clearTimeout/);assert.match(figure,/destroy\(\)\{loop\.unregister\(\);offPointer\(\);svg\.remove\(\);\}/,'a figure leaves nothing behind');
 assert.match(css,/prefers-reduced-motion:reduce/);assert.ok(!/infinite/.test(css),'no infinite CSS animation');assert.match(css,/vector-effect:non-scaling-stroke/);
 assert.ok(!/<canvas|getContext\(/.test(exp+figs),'SVG only: no canvas, no DPR cost');
 assert.match(exp,/removeEventListener\('keydown'/);
 console.log('PASS heat: shared sleeping loop, lazy figures destroyed, reduced motion, no polling, no canvas');}

// 6. Hairline credit and the package dependency.
{const pkg=JSON.parse(read('package.json'));assert.ok(pkg.dependencies['@lucasmarkes/hairline'],'@lucasmarkes/hairline is a dependency');
 assert.match(engine,/MIT © Lucas Marques/);assert.match(engine,/github\.com\/lucasmarkes\/hairline/);
 console.log('PASS hairline credited, package installed');}
