// timeline emaki (Oct 9 2026): every case is a scene with a hairline figure on one hand-scroll, its fact line is quoted from the case,
// the scroll's drag/flick/snap maths, the Find-it challenge, Back/Visit contract, heat (one shared sleeping loop).
// usage: node tests/museum-exp-timeline.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const Module=require('node:module'),root=path.join(__dirname,'..'),orig=Module._resolveFilename;
Module._resolveFilename=function(req,...a){return orig.call(this,req.startsWith('@/')?path.join(root,req.slice(2)):req,...a);};
const dir='components/museum/experiences/timeline/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),E=require('../'+dir+'eras.ts'),F=require('../'+dir+'hairline/figures.ts');
const W=require('../'+dir+'wall.ts'),exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css'),slot=read(dir+'FigureSlot.tsx'),engine=read(dir+'hairline/engine.ts'),figure=read(dir+'hairline/figure.ts'),figs=read(dir+'hairline/figures.ts');

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
 assert.match(exp,/words=x\.fact/);assert.match(exp,/\{xe\.year\}/);assert.match(exp,/\{xe\.title\}/);assert.match(exp,/aria-valuetext=\{`\$\{e\.year\}: \$\{e\.title\}`\}/);
 assert.equal(E.tickLabel('Before the 1960s'),'<1960s');assert.equal(E.tickLabel('1891'),'1891');
 console.log('PASS each era quotes one of its case facts, with year and title');}

// 3. Contract: fixed dialog root, shared ExperienceBack (never `immediate`), Visit → onVisit, locks, keys, 44 px.
{assert.match(exp,/data-museum-experience="timeline"/);assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);assert.equal((exp.match(/<ExperienceBack/g)||[]).length,1);
 assert.ok(!/NavigationButton|immediate/.test(exp),'no local NavigationButton, never immediate');
 assert.match(exp,/if\(onVisit\)onVisit\(id\);else onClose\(\)/,'Visit hands the case id to the host');assert.match(exp,/visit\(xe\.id\)/);
 assert.match(exp,/\|\|reducedMotion\(\)\)\{done\(\);return;\}/,'reduced motion leaves at once, without the roll-up');assert.match(exp,/finished\.then\(done,done\)/,'the roll-up always hands over');
 assert.match(read('components/museum/experiences/types.ts'),/onVisit\?:\(exhibitId:string\)=>void/,'optional onVisit on the contract');
 assert.match(exp,/exhibitState\(xe,counts\)/);assert.match(exp,/st\.lockText/,'locked cases show their lock text');assert.match(exp,/from '@lucasmarkes\/hairline\/react'/,'the package draws the padlock');
 assert.match(exp,/key==='Escape'/);assert.match(exp,/role="slider"/);assert.match(exp,/aria-valuetext/);assert.match(exp,/setPointerCapture/);assert.match(exp,/'Home'/);
 assert.match(css,/\.track\{[^}]*touch-action:none/);assert.match(css,/\.paper\{[^}]*touch-action:none/);
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
 assert.match(exp,/live=\{Math\.abs\(i-idx\)<=1\}/,'only the active era and its neighbours get figures');assert.match(exp,/if\(i<lo\|\|i>hi\)return null/);assert.match(exp,/lo=Math\.max\(0,idx-2\),hi=Math\.min\(n-1,idx\+2\)/);
 assert.match(exp,/register\(p,dt=>/,'the scroll spring is a board on the shared loop');assert.match(exp,/b\.unregister\(\)/);assert.match(exp,/ro\.disconnect\(\)/,'the resize observer goes on unmount');
 assert.match(exp,/a\.forEach\(x=>x\.cancel\(\)\)/,'the unroll is cancelled on unmount');assert.match(exp,/if\(seal&&!reducedMotion\(\)\)/);
 assert.match(slot,/h\.destroy\(\)/);assert.match(slot,/clearTimeout/);assert.match(figure,/destroy\(\)\{loop\.unregister\(\);offPointer\(\);svg\.remove\(\);\}/,'a figure leaves nothing behind');
 assert.match(css,/prefers-reduced-motion:reduce/);assert.ok(!/infinite/.test(css),'no infinite CSS animation');assert.match(css,/vector-effect:non-scaling-stroke/);
 assert.ok(!/<canvas|getContext\(/.test(exp+figs),'SVG only: no canvas, no DPR cost');
 assert.match(exp,/removeEventListener\('keydown'/);
 console.log('PASS heat: shared sleeping loop, lazy figures destroyed, reduced motion, no polling, no canvas');}

// 6. Hairline credit and the package dependency.
{const pkg=JSON.parse(read('package.json'));assert.ok(pkg.dependencies['@lucasmarkes/hairline'],'@lucasmarkes/hairline is a dependency');
 assert.match(engine,/MIT © Lucas Marques/);assert.match(engine,/github\.com\/lucasmarkes\/hairline/);
 console.log('PASS hairline credited, package installed');}

// 7. The scroll's motion maths: rubber band, flick projection and snapping, the real-years rule and its inverse.
{assert.equal(W.rubber(3,11),3);assert.ok(W.rubber(-1,11)<0&&W.rubber(-1,11)>-.5,'past the start it gives a little');assert.ok(W.rubber(-50,11)>-1,'never more than one era');
 assert.ok(W.rubber(13,11)>11&&W.rubber(13,11)<12);
 assert.equal(W.projectSnap(2.3,0,12),2,'a slow release settles on the nearest');assert.equal(W.projectSnap(2.3,2,12),3,'a flick always moves on');assert.equal(W.projectSnap(2,-2,12),1);assert.equal(W.projectSnap(2,2,12),3);
 assert.ok(W.projectSnap(2,30,12)>=6,'a hard flick travels several eras');assert.equal(W.projectSnap(10.8,40,12),11,'and stops at the end');assert.equal(W.projectSnap(.2,-40,12),0);
 assert.equal(W.velocity([[0,0],[100,1]]),10);assert.equal(W.velocity([[0,1]]),0);
 const years=require('../lib/endgame/museum.ts').timelineOrder().map(e=>e.year),even=W.tickXs(years,0,2026),real=W.tickXs(years,1,2026);
 assert.equal(even[0],0);assert.equal(even.at(-1),1);for(let i=1;i<real.length;i++)assert.ok(real[i]>=real[i-1],'real years stay in order');
 assert.equal(real[years.indexOf('1970')],real[years.lastIndexOf('1970')],'two 1970 cases share a spot');assert.ok(W.realYear('Before the 1960s')<1960&&W.realYear('Before the 1960s')>1959);assert.equal(W.realYear('Today',2026),2026);
 for(const xs of [even,real])for(const p of [0,1.5,4,7.25,11]){const back=W.fracToPos(W.posToFrac(p,xs),xs);assert.ok(Math.abs(W.posToFrac(back,xs)-W.posToFrac(p,xs))<1e-9,'rule ↔ scroll round trip');}
 assert.equal(W.yearsBetween('1863','1970'),107);assert.equal(W.yearsBetween('Before the 1960s','1970'),null);
 const e=W.springEasing(170,20);assert.match(e.easing,/^linear\(0,[\d.,-]+,1\)$/);assert.ok(e.ms>200&&e.ms<2500);
 console.log('PASS scroll maths: rubber band, flick → snap, real-years rule, spring easing');}

// 8. Find-it: every challenge is a real case on the scroll, prompts carry no new facts, and success shows the case's own year.
{const ids=E.eras().map(x=>x.exhibit.id);for(const c of W.CHALLENGES){assert.ok(ids.includes(c.id),c.id+' is on the scroll');assert.ok(c.ask.length<40);}
 assert.match(exp,/Found it! \$\{tx\.title\}: \$\{tx\.year\}/);assert.match(exp,/keep going, it’s later/);assert.match(exp,/go back, it’s earlier/);
 assert.match(exp,/aria-live="polite"/);assert.match(exp,/data-tl-quest-next/);assert.match(exp,/data-tl-real/);assert.match(exp,/aria-pressed=\{real\}/);
 console.log('PASS Find-it: challenges on real cases, warmer/colder hints, live feedback, real-years switch');}

// 9. The museum shell (Oct 9 2026): the passport store, the story chapters, the doorway curtain and the host's wiring.
{global.window=undefined;const V=require('../lib/museum/museumVisits.ts');
 assert.equal(V.MUSEUM_VISITS_KEY,'fi2-museum-visits-v1');const S=require('../lib/saves/snapshot.ts');assert.ok(S.SYNC_KEYS.includes(V.MUSEUM_VISITS_KEY),'museum progress syncs with the save code');
 assert.deepEqual(V.sanitizeMuseumVisits({seen:['var-2018','nope','laws-1863','laws-1863'],done:['cards-1970',3]}),{seen:['laws-1863','cards-1970','var-2018'],done:['cards-1970']},'known ids, fixed order, done ⇒ seen');
 assert.deepEqual(V.sanitizeMuseumVisits('junk'),{seen:[],done:[]});assert.deepEqual(V.sanitizeMuseumVisits(null),{seen:[],done:[]});
 assert.deepEqual(V.mergeMuseumVisits({seen:['timeline'],done:[]},{seen:['shirts'],done:['shirts']}),{seen:['timeline','shirts'],done:['shirts']},'merge is a union');
 const p=V.passport({seen:['timeline','laws-1863'],done:[]});assert.deepEqual(p,{seen:1,done:0,total:12,all:false},'the timeline wall is a bonus, not one of the 12');
 assert.equal(V.passport({seen:X.EXHIBITS.map(e=>e.id),done:[]}).all,true);
 const openIds=new Set(['laws-1863','penalty-1891','var-2018']);
 assert.equal(V.nextToVisit({seen:['laws-1863'],done:[]},id=>openIds.has(id)).id,'penalty-1891','next = first open, unvisited case in date order');
 assert.equal(V.nextToVisit({seen:['laws-1863'],done:[]},id=>openIds.has(id),()=>true,'penalty-1891').id,'var-2018','…after the one just left');
 assert.equal(V.nextToVisit({seen:['laws-1863','penalty-1891','var-2018'],done:[]},id=>openIds.has(id)),null);
 assert.equal(V.recordMuseumVisit('laws-1863'),false,'no window (server): never writes');
 const ch=E.CHAPTERS.flatMap(c=>c.ids);assert.deepEqual([...ch].sort(),X.EXHIBITS.map(e=>e.id).sort(),'every case sits in exactly one chapter');
 const order=X.timelineOrder().map(e=>e.id);let last=0;for(const id of order){const n=E.chapterOf(id).n;assert.ok(n>=last,'chapters follow the timeline');last=n;}
 assert.match(exp,/if\(enter&&onEnter\)onEnter\(id\);else if\(onVisit\)onVisit\(id\);else onClose\(\)/,'Step inside → onEnter, else the hall');assert.match(exp,/data-tl-enter=/);assert.match(exp,/canEnter=!!onEnter&&!!st\?\.open/,'only open cases offer Step inside');
 assert.match(exp,/data-tl-seen=/);assert.match(exp,/data-tl-passport=/);assert.match(exp,/onComplete\?\.\(\)/,'finishing Find-it turns the timeline stamp gold');
 const stage=read('components/museum/experiences/ExperienceStage.tsx'),stageCss=read('components/museum/experiences/ExperienceStage.module.css'),room=read('components/MuseumRoom.tsx'),types=read('components/museum/experiences/types.ts');
 assert.match(types,/onEnter\?:\(exhibitId:string\)=>void/);assert.match(types,/onComplete\?:\(\)=>void/);
 assert.ok(!/requestAnimationFrame|setInterval/.test(stage),'the curtain: one-shot animations and timeouts only');assert.match(stage,/obs\.disconnect\(\)/);assert.match(stage,/prefers-reduced-motion: reduce/);
 assert.match(stageCss,/prefers-reduced-motion:reduce/);assert.ok(!/infinite/.test(stageCss));
 for(const m of stage.matchAll(/\.animate\(\[([^\]]*)\]/g))for(const k of m[1].matchAll(/([a-zA-Z]+):/g))assert.ok(['transform','opacity'].includes(k[1]),'the curtain animates transform/opacity only: '+k[1]);
 assert.match(room,/<ExperienceStage key=/,'every experience goes through the one doorway');assert.match(room,/recordMuseumVisit\(id\)/,'stepping inside stamps the passport');
 assert.match(room,/openExperience\('timeline',\{covered:true/,'Back from an exhibit entered from the timeline returns to the timeline');
 assert.match(room,/<StampCard /);assert.match(room,/nextToVisit\(/);
 console.log('PASS shell: passport store (sync key, sanitise, merge, next), chapters, Step inside / return, doorway curtain heat');}
