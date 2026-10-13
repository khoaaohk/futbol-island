// timeline (Oct 9 2026 emaki → Oct 10 2026 modern wall → Oct 10 2026 pixel time machine → Oct 12 2026 anatomy DISPLAY BENCH:
// an isometric bench with twelve turntable stands, one artifact per case, and a carriage whose handwheel is the crank; the
// shared kit in components/museum/experiences/anatomy, Paper theme, one accent). "Order it" deals cases as specimen cards to put
// in order against the clock. Checks: every case is an era with a fact quoted from it, the bench's maths (wheel → cases, rubber
// band, flick → snap, the year counter, the year rail, the spring), the Find-it missions, Order it's rules, the host contract
// (Back closes Order it first, Step inside → onEnter, Visit → onVisit, lock text, passport, stamps, onComplete once), the bench
// (every artifact built, the carriage and wheel in view, fills the stage), no pixeliso, the fill-screen first screen, heat, CSS.
// usage: node tests/museum-exp-timeline.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const Module=require('node:module'),root=path.join(__dirname,'..'),orig=Module._resolveFilename;
Module._resolveFilename=function(req,...a){return orig.call(this,req.startsWith('@/')?path.join(root,req.slice(2)):req,...a);};
const dir='components/museum/experiences/timeline/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const files=fs.readdirSync(path.join(root,dir)),src=Object.fromEntries(files.map(f=>[f,read(dir+f)]));
const X=require('../lib/endgame/museum.ts'),E=require('../'+dir+'eras.ts'),Mm=require('../'+dir+'machine.ts'),B=require('../'+dir+'bench.ts'),O=require('../'+dir+'orderRules.ts');
const K=require('../components/museum/experiences/anatomy/iso-kit.ts');
const exp=src['Experience.tsx'],ord=src['Order.tsx'],css=src['Experience.module.css'],loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts');
const all=Object.entries(src).filter(([f])=>/\.(tsx?|css)$/.test(f)).map(([,s])=>s).join('\n');

// 1. Every case on the timeline is an era, in timelineOrder(), quoting one of its own facts; one accent for the exhibit.
{const order=X.timelineOrder().map(e=>e.id),list=E.eras();
 assert.equal(order.length,X.EXHIBITS.length);assert.deepEqual(list.map(e=>e.exhibit.id),order,'every case is an era, oldest first');
 assert.deepEqual(order.slice(0,5),['laws-1863','penalty-1891','shirts','worldcup-1930','laced-leather']);assert.equal(order.at(-1),'hall-of-fame');
 assert.equal(E.ACCENT,'#2a5bd7');for(const x of list)assert.equal(x.accent,E.ACCENT,'one accent');assert.match(css,/--accent:#2a5bd7/);
 for(const era of list){const e=era.exhibit;assert.ok(e.facts.includes(era.fact),e.id+' fact line comes from its case');}
 const at=id=>list.find(x=>x.exhibit.id===id).fact;
 assert.match(at('laws-1863'),/Football Association was formed in London/);assert.match(at('penalty-1891'),/William McCrum/);assert.match(at('worldcup-1930'),/Argentina 4–2/);
 assert.match(at('cards-1970'),/Ken Aston/);assert.match(at('wwc-1991'),/Norway 2–1/);assert.match(at('var-2018'),/final decision|clear mistakes/);
 assert.match(exp,/\{list\[idx\]\.fact\}/,'the label quotes the fact');assert.match(exp,/aria-valuetext=\{`\$\{e\.year\}: \$\{e\.title\}`\}/);
 const ch=E.CHAPTERS.flatMap(c=>c.ids);assert.deepEqual([...ch].sort(),X.EXHIBITS.map(e=>e.id).sort(),'every case sits in exactly one chapter');
 console.log('PASS 12 eras in timeline order, each quoting its case, one accent');}

// 2. The bench's maths: wheel → cases, rubber band, flick → snap, the year counter, the year rail, the spring.
{assert.equal(Mm.ERAS_PER_TURN,1.5);assert.ok(Math.abs(Mm.crankToEras(-2*Math.PI)-1.5)<1e-9,'one turn = 1.5 cases');assert.ok(Mm.crankToEras(.5)<0,'the other way goes back');
 assert.ok(Math.abs(Mm.angleStep(3.1,-3.1)-(2*Math.PI-6.2))<1e-9,'no jump across ±π');
 assert.equal(Mm.rubber(3,11),3);assert.ok(Mm.rubber(-1,11)<0&&Mm.rubber(-1,11)>-.5);assert.ok(Mm.rubber(-50,11)>-1);
 assert.equal(Mm.projectSnap(2.3,0,12),2);assert.equal(Mm.projectSnap(2.3,2,12),3);assert.equal(Mm.projectSnap(2,-2,12),1);assert.ok(Mm.projectSnap(2,30,12)>=6);assert.equal(Mm.projectSnap(10.8,40,12),11);
 assert.equal(Mm.velocity([[0,0],[100,1]]),10);assert.equal(Mm.velocity([[0,1]]),0);
 const years=X.timelineOrder().map(e=>e.year),xs=Mm.tickXs(years,2026);for(let i=1;i<xs.length;i++)assert.ok(xs[i]>=xs[i-1]);
 assert.equal(xs[years.indexOf('1970')],xs[years.lastIndexOf('1970')],'two 1970 cases share a spot');
 for(const p of [0,1.5,4,7.25,11]){const back=Mm.fracToPos(Mm.posToFrac(p,xs),xs);assert.ok(Math.abs(Mm.posToFrac(back,xs)-Mm.posToFrac(p,xs))<1e-9);}
 assert.equal(Mm.odometer(0,years,2026),1863);assert.equal(Mm.odometer(1,years,2026),1891);assert.equal(Mm.odometer(.5,years,2026),1877);assert.equal(Mm.odometer(11,years,2026),2026);
 assert.equal(Mm.yearsBetween('1863','1970'),107);assert.equal(Mm.yearsBetween('Before the 1960s','1970'),null);
 assert.equal(Mm.direction(2,5),'later');assert.equal(Mm.direction(5,2),'earlier');assert.equal(Mm.direction(3,3),'here');
 {const sp=Mm.spring(0);sp.target=3;let n=0;while(!Mm.stepSpring(sp,1/60)&&n<600)n++;assert.ok(n<600&&sp.x===3&&sp.v===0,'the spring settles exactly, so the loop can stop');}
 // the handwheel: a point on the wheel's rim projects and comes back to the same angle
 const P=B.benchCamera(1400,560);for(const a of [0,.7,2,-2.5]){const [sx,sy]=K.iso([B.HUB.x+Math.cos(a),B.HUB.y+Math.sin(a),B.HUB.z+.3],P);assert.ok(Math.abs(Mm.angleStep(B.wheelAngle(P,sx,sy),a))<1e-6,'wheel angle round trip '+a);}
 assert.ok(B.pxPerCase(P)>200,'a case is a big step on a desktop ('+Math.round(B.pxPerCase(P))+' px)');
 console.log('PASS bench maths: wheel turns, rubber band, flick → snap, year counter between real years, year rail, a spring that stops');}

// 3. Missions and Order it: real cases, no new facts, scoring.
{const ids=E.eras().map(x=>x.exhibit.id);for(const c of Mm.CHALLENGES){assert.ok(ids.includes(c.id));assert.ok(c.ask.length<40);}
 assert.match(exp,/Found it! \$\{tx\.title\}: \$\{tx\.year\}/);assert.match(exp,/keep going, it’s later/);assert.match(exp,/go back, it’s earlier/);assert.match(exp,/data-tl-quest-next/);
 const pool=E.eras().filter(x=>O.dated(x.exhibit)).map(x=>O.toItem(x.exhibit,x.accent,2026));assert.equal(pool.length,10,'only cases with one exact year');
 for(let seed=1;seed<40;seed++)for(let k=0;k<6;k++){const d=O.deal(pool,k,seed,k?O.deal(pool,k-1,seed).map(x=>x.id):[]);assert.equal(d.length,O.setSize(k));
  assert.equal(new Set(d.map(x=>x.y)).size,d.length);assert.ok(!O.inOrder(d),'never dealt in order');}
 assert.deepEqual(O.move(['a','b','c','d'],0,2),['b','c','a','d']);assert.deepEqual(O.swap(['a','b','c'],0,2),['c','b','a']);assert.equal(O.slotAt(85,80,1,4),2);
 const p1=O.setPoints([true,true,true],0,0);assert.deepEqual([p1.points,p1.streak,p1.bonus,p1.quick],[300,1,100,50]);
 assert.equal(O.setPoints([true,true,true,true],9,null).bonus,400);assert.deepEqual(O.setPoints([true,false,false,true],2,0).streak,0);
 const by=id=>pool.find(x=>x.id===id);assert.match(O.lesson([by('laws-1863'),by('worldcup-1930'),by('var-2018')]),/^Right order! .*\(1863\) came first, 155 years before /);
 assert.equal(O.verdict(2000),'Time traveller');assert.equal(O.BEST_KEY,'fi2-museum-timeline-order-best');
 assert.ok(!/requestAnimationFrame|setInterval|setTimeout/.test(ord),'no loop and no timers in Order it');
 assert.match(ord,/b\.animate\(\[\{transform:'scaleX\(1\)'\},\{transform:'scaleX\(0\)'\}\],\{duration:CLOCK_MS,easing:'linear'/);assert.match(ord,/a\.onfinish=\(\)=>\{if\(clock\.current\[0\]===a\)endRef\.current\(\);\}/);
 assert.match(ord,/visibilitychange/);assert.match(ord,/useEffect\(\(\)=>stopClock,\[stopClock\]\)/);assert.match(ord,/if\(reduced\)return;const b=bar\.current/);assert.match(ord,/reduced&&k\+1>=SETS_REDUCED/);
 for(const h of ['data-tl-order-card','data-tl-order-lock','data-tl-order-again','data-tl-order-start','data-tl-order-next','data-tl-order-close','data-tl-order-score','data-tl-order-final','data-tl-order-year'])assert.ok(ord.includes(h),'hook '+h);
 assert.match(ord,/setPointerCapture/);assert.match(ord,/ArrowUp/);assert.match(ord,/swap\(o,sel,i\)/);assert.match(ord,/try\{localStorage/);
 assert.match(ord,/artifactScene\(id,AW,AH\)/,'each card shows its case\'s artifact');assert.match(ord,/getPropertyValue\('--axis'\)/,'cards drag along the card\'s long axis');
 assert.match(ord,/import StepCheck from '\.\.\/modern\/StepCheck'/);assert.match(ord,/<Ending reached/);
 console.log('PASS missions and Order it: real cases dealt out of order, drag/swap along the axis, scoring, a clock that is one animation');}

// 4. Contract: dialog root, shared Back (closes Order it first), Step inside / Visit, locks, passport, onComplete once, lab route.
{assert.match(exp,/data-museum-experience="timeline"/);assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(css,/\.root\{position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{back\}\/>/);assert.equal((exp.match(/<ExperienceBack/g)||[]).length,1);assert.ok(!/NavigationButton|immediate/.test(exp));
 assert.match(exp,/if\(modeRef\.current==='order'\)\{setMode\('travel'\);return;\}/,'Back closes Order it first, then the room');assert.match(exp,/key==='Escape'/);
 assert.match(exp,/if\(enter&&onEnter\)onEnter\(id\);else if\(onVisit\)onVisit\(id\);else onClose\(\)/);
 assert.match(exp,/canEnter=!!onEnter&&!!st\?\.open/);assert.match(exp,/exhibitState\(e,counts\)/);assert.match(exp,/st\.lockText/);
 for(const h of ['data-tl-enter','data-tl-visit','data-tl-lock','data-tl-seen','data-tl-passport','data-tl-era','data-tl-fact','data-tl-chapter','data-tl-scrubber','data-tl-step','data-tl-quest','data-tl-order-open','data-tl-stage','data-tl-start'])assert.ok(exp.includes(h),'hook '+h);
 assert.match(exp,/useMuseumVisits\(\)/);assert.match(exp,/passport\(visits\)/);
 assert.match(exp,/completed=useRef\(false\),complete=useCallback\(\(\)=>\{if\(completed\.current\)return;completed\.current=true;onComplete\?\.\(\);\}/,'onComplete once');
 assert.match(exp,/if\(q\.k===CHALLENGES\.length-1\)\{complete\(\);setDone\(true\);\}/,'finishing the missions');assert.match(exp,/onFinish=\{sc=>\{if\(sc>0\)complete\(\);\}\}/,'…or a scored Order it round');
 assert.match(ord,/onDone=\{\(\)=>\{setChecked\(true\);onFinish\(scoreRef\.current\);\}\}/,'Order it finishes only after its quick check');
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/timeline/page.tsx'))&&/timeline\/Experience/.test(read('app/museum-lab/timeline/TimelineLab.tsx')));
 const room=read('components/MuseumRoom.tsx');assert.match(room,/openExperience\('timeline',\{covered:true/);
 assert.match(src['wall.ts'],/export function springEasing/,'the shared doorway\'s spring easing stays');
 console.log('PASS contract: dialog, shared Back (Order it first), Step inside / Visit, lock text, passport and stamps, onComplete once, lab route');}

// 5. Anatomy style and fill-screen: the shared kit, no pixel kit, every artifact, the carriage in view, the bench fills the card.
{assert.doesNotMatch(all,/pixeliso|PixelStage|Pixmap|PK Press Start|PK Pixelify|#000048|#000024/i,'no pixel kit, pixel fonts or dark pixel grounds');
 assert.doesNotMatch(all,/components\/bits/,'no React Bits');assert.ok(!files.includes('scene.ts'),'the pixel machine scene is gone');
 assert.match(src['bench.ts'],/from '\.\.\/anatomy\/iso-kit'/);assert.match(src['Draw.tsx'],/from '\.\.\/anatomy\/draw'/);assert.match(exp,/<style dangerouslySetInnerHTML=\{\{__html:ISO_CSS\}\}\/>/);
 assert.match(css,/--anatomy-paper:#f7f7f3/);assert.match(css,/--card:#e0e0db/);
 assert.match(css,/\.screen\{[^}]*height:100dvh/);assert.match(css,/\.card\{position:relative;flex:1 1 auto;min-height:0/);assert.match(css,/\.stage\{position:absolute;inset:0\}/);
 assert.match(exp,/viewBox=\{`0 0 \$\{size\.w\} \$\{size\.h\}`\}/,'the bench SVG is the stage, pixel for pixel');
 const ids=E.eras().map(x=>x.exhibit.id);
 for(const id of ids){const P=B.artifactCamera(220,170),it=B.artifact(id,P,0,0,true);assert.ok(it.filter(i=>i.k==='solid'||i.k==='ball').length>=2,id+' has its own artifact');assert.ok(it.some(i=>i.lit||/lit/.test(i.cls||''))||id==='penalty-1891'&&it.some(i=>i.lit),id+' can be lit');}
 assert.ok(new Set(ids.map(id=>B.artifact(id,B.artifactCamera(220,170),0,0).length)).size>5,'the artifacts differ');
 for(const [w,h] of [[1400,560],[1805,780],[366,300]]){const P=B.benchCamera(w,h),items=B.benchItems(ids,P,3);
  assert.ok(items.filter(i=>i.k==='solid').length>=90,'a dense bench ('+items.filter(i=>i.k==='solid').length+' solids)');
  const [hx,hy]=K.iso([B.HUB.x,B.HUB.y,B.HUB.z],P);assert.ok(hx>w*.3&&hx<w*.7&&hy>0&&hy<h,`${w}×${h}: the handwheel is in view, centred`);
  // the bench under the carriage spans the card: the stands either side reach the edges
  const [dx]=B.slide(P,5),l=K.iso([B.standX(4),0,0],P)[0]+dx,r=K.iso([B.standX(6),0,0],P)[0]+dx;assert.ok(l<w*.35&&r>w*.65,`${w}×${h}: neighbouring cases reach toward the edges (${Math.round(l)}…${Math.round(r)})`);
  const k=K.cameraOf(P).k;assert.ok(k*2.2>=(w<500?50:100),`${w}×${h}: a stand is big (${Math.round(k*2.2)} px radius)`);}
 assert.equal(B.markRing(B.benchCamera(800,500),2).length,1);assert.ok(B.wheelHandle(B.benchCamera(800,500),1).length>=3);
 console.log('PASS anatomy and fill-screen: shared kit, no pixel art, twelve artifacts, a dense bench, the wheel in view, big stands at every size');}

// 6. Heat, input, reduced motion, CSS.
{assert.ok(!/requestAnimationFrame|setInterval/.test(all),'no rAF in the exhibit: the shared Paper loop only');assert.match(exp,/import \{useFrameLoop\} from '\.\.\/anatomy\/paper-loop'/);
 assert.match(exp,/useFrameLoop\(dt=>\{if\(dragging\.current\)return false;const settled=stepSpring\(sp,dt\);paintAll\(\);if\(settled\)rest\(\);return !settled;\},stage,reduced\)/,'the loop stops when the bench settles');
 assert.match(loopSrc,/IntersectionObserver/);assert.match(loopSrc,/visibilitychange/);assert.match(loopSrc,/l\.dispose\(\)/,'cancelled on unmount');
 assert.match(exp,/benchG\.current\?\.setAttribute\('transform'/,'the bench moves by a transform written on a ref');
 assert.match(exp,/if\(reduced\)\{sp\.x=sp\.target;sp\.v=0;paintAll\(\);rest\(\);\}else loop\.wake\(\);/,'reduced motion: lands at once');
 assert.match(exp,/wheelAngle\(P,x,y\)/,'the wheel follows the finger round the hub');assert.match(exp,/role="slider"/);assert.match(exp,/'Home'/);assert.match(exp,/setPointerCapture/);
 const cssNo=css.replace(/\/\*[\s\S]*?\*\//g,'');assert.doesNotMatch(cssNo,/infinite/);assert.match(cssNo,/prefers-reduced-motion:reduce/);
 assert.match(cssNo,/\.stepBtn\{width:48px;height:48px/);assert.match(cssNo,/\.rail\{[^}]*height:56px;touch-action:none/);assert.match(cssNo,/\.cart\{[^}]*touch-action:none/);
 for(const sel of cssNo.replace(/@(media|supports|keyframes)[^{]*\{/g,'').match(/(^|\})\s*[^@{}][^{}]*\{/g)??[])for(const part of sel.replace(/^\}?\s*/,'').replace(/\{$/,'').split(','))
  if(!/^(from|to|\d+%)$/.test(part.trim()))assert.match(part,/\.[a-zA-Z]/,'local class: '+part.trim());
 global.window=undefined;const V=require('../lib/museum/museumVisits.ts');assert.deepEqual(V.passport({seen:['timeline','laws-1863'],done:[]}),{seen:1,done:0,total:12,all:false});
 console.log('PASS heat and input: one sleeping loop, drags paint directly, the wheel round the hub, reduced motion lands at once, CSS rules');}
