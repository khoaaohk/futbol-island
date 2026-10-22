// laced-leather · "The weather machine" in the anatomy Paper style (Oct 12 2026 restyle; user: "these games should not be the
// pixel style. only the penalty kick should be pixel game", "larger and fill the entire screen", then every exhibit except the
// penalty kick in the anatomy isometric technical-illustration look). Checks: the case's facts and the sourced numbers
// (facts.ts, unchanged), the host contract, no pixel kit left, the Paper look on the shared anatomy kit, a play area that fills
// the screen at 1440 × 900, 1845 × 1110 and 390 × 844, heat (one loop that stops), the rain machine (410 → 595 g; the modern ball
// unchanged; the dial needle), the rain match (a heavier ball carries shorter; 3/2/1/0), reduced motion, and both machines
// rendered in Node.
// usage: node tests/museum-exp-laced-leather.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const root=path.join(__dirname,'..'),dir='components/museum/experiences/laced-leather/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),F=require('../'+dir+'facts.ts'),M=require('../'+dir+'model.ts'),R=require('../'+dir+'match.ts'),C=require('../'+dir+'content.ts');
const B=require('../components/museum/experiences/anatomy/bench.tsx'),S=require('../'+dir+'scene.tsx'),K=require('../components/museum/experiences/anatomy/iso-kit.ts');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const exp=read(dir+'Experience.tsx'),model=read(dir+'model.ts'),match=read(dir+'match.ts'),scene=read(dir+'scene.tsx'),bench=read('components/museum/experiences/anatomy/bench.tsx'),loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts'),css=read(dir+'Experience.module.css');
const e=X.EXHIBITS.find(x=>x.id==='laced-leather');
const files=fs.readdirSync(path.join(root,dir)).sort();
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');

// 1. Facts and sources: the case's three facts word for word; the lab numbers, sizes, Yeats and the head study, all cited.
{for(const i of [0,1,2])assert.match(exp,new RegExp(`exhibit\\.facts\\[${i}\\]`),`fact ${i+1} is shown`);assert.match(exp,/take=\{exhibit\.forYourGame\}/);
 assert.equal(F.LEATHER.dry,410);assert.equal(F.LEATHER.wet,595);assert.equal(F.LEATHER.soakMinutes,90);assert.equal(F.LEATHER_GAIN,185);assert.equal(F.LEATHER_GAIN_PCT,45);
 assert.ok(e.facts[1].includes(F.SIZES['5'].around)&&e.facts[1].includes(F.SIZES['5'].weight),'size 5 = the case fact');
 for(const k of ['NO_LACES_1966','HEAD_PAIN','HEAD_STUDY'])assert.match(exp,new RegExp(`\\b${k}\\b`),k+' shown');
 assert.match(exp,/YEATS\.quote/);assert.match(exp,/data-sizes/,'the size table (3, 4, 5)');assert.match(exp,/\{PRACTICE_NOTE\}/);assert.match(C.PRACTICE_NOTE,/practice game/);
 assert.match(C.BEATS[0].text,/rainy Saturday/);
 for(const u of ['https://www.nature.com/articles/s41598-023-45489-2','https://lfchistory.net/articles/4667','https://en.wikipedia.org/wiki/Slazenger_Challenge_4-Star'])assert.ok(F.EXTRA_SOURCES.some(s=>s.url===u),'cites '+u);
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.EXTRA_SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 console.log('PASS facts: 3 case facts, lab 410 → 595 g in 90 min, sizes, Yeats, head study, practice game labelled, all sources');}

// 2. Contract.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);
 assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(exp,/data-museum-experience="laced-leather"/);
 assert.equal((exp.match(/<ExperienceBack onClose=\{onClose\}\/>/g)||[]).length,1);assert.doesNotMatch(exp,/NavigationButton|immediate/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((code(exp).match(/onComplete/g)||[]).length,3);assert.match(exp,/\{checked&&<Ending [^\n]*onComplete=\{onComplete\} reached=\{checked\}\/>\}/);assert.match(exp,/const checked=picked!=null/);
 assert.match(exp,/<StepCheck items=\{\[\{q:check\.q,options:check\.options,right:check\.answer,why:check\.why\}\]\}/,'the shared quick check');
 for(const h of ['data-phase','data-ball','data-soak','data-pass','data-kick','data-score','data-rain','data-kick-off','data-play-modern','data-play-again','data-needle','data-aim'])assert.ok(exp.includes(h)||scene.includes(h),'hook '+h);
 assert.equal(C.BEST_KEY,'futbol.museum.laced-leather.rainMatchBest','the progress key is kept');assert.match(exp,/try\{localStorage\.setItem\(BEST_KEY/);
 assert.match(read('app/museum-lab/laced-leather/page.tsx'),/<Lab id="laced-leather"/);assert.match(read('components/museum/experiences/index.tsx'),/'laced-leather':load\(\(\)=>import\('\.\/laced-leather\/Experience'\)\)/);
 console.log('PASS contract: dialog, shared Back, Escape, onComplete only after game + quick check, hooks, progress key, lab route');}

// 3. Style: no pixel kit; the anatomy kit in the Paper tint; one blue accent (the water and the aim).
{for(const f of files){const src=read(dir+f);assert.doesNotMatch(src,/pixeliso/,f+' imports no pixeliso / pixeliso-laws');
  assert.doesNotMatch(src,/#000048|PK Press Start|PK Pixelify|Mega Drive|crispEdges/i,f+': no pixel palette, fonts or navy ground');}
 assert.deepEqual(files,['Experience.module.css','Experience.tsx','content.ts','facts.ts','figure.ts','match.ts','model.ts','scene.tsx']);
 assert.match(bench,/from '\.\/iso-kit'/);assert.match(exp,/from '\.\.\/anatomy\/bench'/);assert.match(exp,/dangerouslySetInnerHTML=\{\{__html:ISO_CSS\}\}/);
 assert.match(exp,/className=\{`\$\{g\.room\} iso \$\{s\.root\}`\} data-theme="light"/);
 assert.match(css,/\.root\.root\[data-theme\]\{--anatomy-page:#e0e0db;--anatomy-card:#e0e0db;--anatomy-paper:#f7f7f3/,'Paper ground and solids');
 assert.match(exp,/'--accent':'#2a5bd7'/);assert.equal(S.BLUE,'#2a5bd7');
 console.log('PASS style: no pixeliso, no pixel palette / fonts / navy; anatomy kit, Paper tint, one blue accent');}

// 4. Fill the screen.
{assert.match(css,/\.screen\{box-sizing:border-box;height:100vh;height:100dvh;display:grid;grid-template-rows:auto minmax\(0,1fr\) auto/);
 assert.match(css,/\.svg\{position:absolute;inset:0;width:100%;height:100%;touch-action:none/);
 assert.match(exp,/data-play-area data-fill-screen/);assert.match(exp,/viewBox=\{`0 0 \$\{W\} \$\{H\}`\}/);assert.match(exp,/const box=useBox\(card\)/);
 for(const [W,H] of [[1400,690],[1805,890],[370,560]]){const tall=W<H*1.05,FM=B.frameFor('wide'),FL=B.frameFor(tall?'tall':'wide'),pad=Math.round(Math.max(18,Math.min(W,H)*.05));
  for(const [name,F,pts,el] of [['machine',FM,S.rigPoints(tall?360:246),tall?22:30],['lane',FL,S.lanePoints(),tall?50:36]]){
   const P=B.fit(F,pts,W,H-34,pad,el),xy=pts.map(([a,b,z])=>K.iso([...B.at(F,a,b),z],P));
   const w=Math.max(...xy.map(p=>p[0]))-Math.min(...xy.map(p=>p[0])),h=Math.max(...xy.map(p=>p[1]))-Math.min(...xy.map(p=>p[1]));
   assert.ok(w/W>.8||h/(H-34)>.8,`${name} fills the ${W}×${H} card (${Math.round(w/W*100)}% × ${Math.round(h/(H-34)*100)}%)`);}}
 console.log('PASS fill: 100dvh screen, card = 1fr, viewBox = measured card, machine and lane fill ≥ 80% at 1440, 1845 and 390');}

// 5. Heat: one frame loop that runs only while it rains, while the marker sweeps or while the ball flies.
{for(const src of [exp,model,match,scene])assert.doesNotMatch(src,/requestAnimationFrame|setInterval/);
 assert.match(bench,/export \{useRaf\} from '\.\/paper-loop'/);assert.match(loopSrc,/else\{wanted=false;last=0;\}/);assert.match(loopSrc,/cancelAnimationFrame\(id\)/);
 assert.match(exp,/if\(r\.soak>=1\)\{stopRain\(\);return false;\}return true;/,'rain stops when soaked');assert.match(exp,/if\(f\.done\)\{land\(\);return false;\}/,'the flight stops when the ball lands');
 assert.match(exp,/return false;\},live\);/,'nothing moving: the loop ends');
 assert.match(scene,/\{raining&&<g className="ll-rain">/,'the falling water is drawn only while it rains');
 assert.match(exp,/useEffect\(\(\)=>\(\)=>timers\.current\.forEach\(clearTimeout\),\[\]\)/);
 console.log('PASS heat: rain / sweep / flight only while they happen, 0 frames at rest, cancelled on unmount');}

// 6. The rain machine: the scale reads the lab's two numbers; the needle turns; the modern ball stays inside Law 2.
{assert.equal(M.gramsAt(0),410);assert.equal(M.gramsAt(1),595);assert.equal(M.gramsAt(2),595,'never past soaked');assert.equal(M.gramsAt(.5),503);
 assert.equal(M.minutesAt(1),90);assert.equal(M.minutesAt(.5),45);assert.equal(M.SOAK_SECONDS,4);assert.ok(Math.abs(M.TAP_SOAK*90-15)<1e-9,'a tap = 15 minutes');
 assert.ok(M.MODERN_G>=F.SIZES['5'].minG&&M.MODERN_G<=F.SIZES['5'].maxG,'the modern ball is a legal size 5');
 assert.notEqual(M.leatherTone(0),M.leatherTone(1),'the leather darkens as it soaks');assert.ok(B.luma(M.leatherTone(1))<B.luma(M.leatherTone(0))-50);
 assert.ok(M.needleAngle(595)>M.needleAngle(410)&&M.needleAngle(430)<M.needleAngle(595),'the needle climbs with the weight');
 console.log('PASS machine: 410 → 595 g over 90 minutes (a tap = 15), the needle climbs, the modern ball 430 g, the leather darkens');}

// 7. The rain match: eight passes, the ball soaks pass by pass, a heavier ball carries shorter, 3/2/1/0 by distance.
{assert.equal(R.KICKS,8);assert.equal(R.minuteOf(0),0);assert.equal(R.minuteOf(7),90);
 assert.equal(R.gramsOf('leather',0),410);assert.equal(R.gramsOf('leather',7),595);assert.equal(R.gramsOf('modern',7),M.MODERN_G);
 assert.equal(R.carryFactor(410),1);assert.ok(R.carryFactor(595)<.8&&R.carryFactor(595)>.75,'a soaked ball carries about 22% shorter');
 assert.ok(R.carry(1,595)<R.carry(1,410),'same kick, heavier ball, shorter');assert.equal(R.dryCarry(.5),R.DMAX/2);
 const t=R.targets(()=>.5);assert.equal(t.length,8);assert.ok(t.every(x=>x>=R.TARGET_MIN&&x<=R.TARGET_MAX));for(let i=1;i<8;i++)assert.ok(Math.abs(t[i]-t[i-1])>=4,'never two alike in a row');
 assert.ok(R.carry(1,595)>=R.TARGET_MAX+1.5,'the furthest team-mate is reachable with a soaked ball');
 assert.equal(R.scoreKick(20,20).pts,3);assert.equal(R.scoreKick(17,20).pts,2);assert.equal(R.scoreKick(15,20).pts,1);assert.equal(R.scoreKick(10,20).pts,0);assert.match(R.scoreKick(10,20).say,/short/);
 assert.equal(R.MAX_POINTS,24);assert.equal(R.powerAt(0),0);assert.equal(R.powerAt(R.SWEEP_MS),1);assert.ok(Math.abs(R.powerAt(R.SWEEP_MS*1.5)-.5)<1e-9,'the sweep comes back');
 const f=M.flightAt(20,M.flightTime(20));assert.ok(f.done&&Math.abs(f.u-20)<1e-9&&f.z<1e-9);
 // A pointer on the kick line reads back as metres along it (the reduced-motion aim).
 const FL=B.frameFor('tall'),P=B.fit(FL,S.lanePoints(),370,560,20,50),[x,y]=B.pt(FL,18*S.M2W,0,4,P);assert.ok(Math.abs(S.metresAt(FL,P,x,y)-18)<1e-6);
 console.log('PASS match: 8 passes 0 → 90 min, 410 → 595 g, ~22% shorter soaked, targets reachable, 3/2/1/0, the power sweep, pointer → metres');}

// 8. Both machines rendered in Node: dense solid parts, the dial needle, the rain only while raining, the pass.
{const FM=B.frameFor('wide'),P=B.fit(FM,S.rigPoints(),1200,700,30);
 const off=renderToStaticMarkup(React.createElement('svg',null,React.createElement(S.RigStatic,{F:FM,P}),React.createElement(S.RigLive,{F:FM,P,soak:.5,raining:false}),React.createElement(S.Hood,{F:FM,P,raining:false})));
 const on=renderToStaticMarkup(React.createElement('svg',null,React.createElement(S.RigLive,{F:FM,P,soak:.5,raining:true})));
 assert.ok((off.match(/<path/g)||[]).length>150,'a dense machine ('+(off.match(/<path/g)||[]).length+' paths)');assert.match(off,/class="iso-halo"/);
 assert.equal((off.match(/data-needle=/g)||[]).length,2,'two dial needles');assert.match(off,/data-needle="503"/);assert.doesNotMatch(off,/ll-rain/);assert.match(on,/ll-rain/);
 for(const o of ['wide','tall']){const FL=B.frameFor(o),Pl=B.fit(FL,S.lanePoints(),1200,700,30);
  const lane=renderToStaticMarkup(React.createElement('svg',null,React.createElement(S.LaneStatic,{F:FL,P:Pl,minute:45}),React.createElement(S.LaneLive,{F:FL,P:Pl,target:18,aim:20,ball:null,landed:null,grams:503,leather:true,kicking:false})));
  assert.match(lane,/data-zones/);assert.match(lane,/data-aim="20.0"/);assert.ok((lane.match(/<path/g)||[]).length>120,o+' lane is detailed');}
 console.log('PASS render: machine + lane rendered in Node, > 150 paths, two needles, rain only while raining, zones and the aim');}

// 9. Reduced motion: RAIN taps add 15 minutes, tap the pitch to aim then tap Kick, the ball lands at once.
{assert.match(exp,/if\(reduced\)\{r\.soak=Math\.min\(1,r\.soak\+TAP_SOAK\+1e-9\)/);
 assert.match(exp,/if\(reduced\)\{kick\(\(M\.aim\?\?DMAX\/2\)\/DMAX\);return;\}/,'Kick uses the placed marker');
 assert.match(exp,/if\(reduced\)\{M\.ball=\{u:M\.to,z:0\};land\(\);return;\}/,'the ball lands at once');
 assert.match(exp,/metresAt\(F,P,x,y\)/,'tap the pitch to place the marker');assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 console.log('PASS reduced motion: tap-to-rain, tap-to-aim then Kick, instant landings');}

// 9. Turn the ball (museum-figures-2, figure kit v2): an old laced leather ball that turns all the way round (18 panels, the lace,
//    the lace-up opening), see-through shows the bladder and its inflation tube, "Old vs New" swaps in a modern ball with a
//    valve and a sealed bladder, labels reachable from every yaw, leather swatches recolour the panels, ≤ 120 parts, the flow kept.
{const FK=require('../components/museum/experiences/anatomy/figure-kit.ts'),LF=require('../'+dir+'figure.ts');
 const fig=LF.makeLeatherFigure(),spec=fig.spec,c=FK.centreOf(spec.points),P0=FK.fitTurn(spec.points,900,700,45,30,{pad:24,top:80});
 const view=(yaw,pitch,xray,swatch=null,active=[])=>{const P=FK.turnProjection(P0,c,yaw,pitch),{R,U,V}=FK.basis(yaw,pitch);
  return {yaw,pitch,P,V,R,U,L:FK.lightOf(yaw,pitch),xray,swatch,swatchHex:FK.swatchList(spec.swatches).find(s=>s.id===swatch)?.hex??null,active:new Set(active),w:900,h:700};};
 assert.equal(LF.PANELS18.length,18,'18 leather panels');assert.equal(LF.PANELS18.filter(p=>p.lace).length,1,'one lace panel');
 for(const mode of ['old','new']){fig.setMode(mode);
  for(let yaw=0;yaw<360;yaw+=45)for(const x of [0,1]){const d=spec.draw(view(yaw,30,x));const n=FK.countParts(d.svg)+d.labels.length*7;
   assert.ok(n<=FK.MAX_PARTS,mode+' '+yaw+'/'+x+': '+n+' parts');
   for(const l of d.labels)assert.ok(FK.anchorFor(l,FK.viewVector(yaw,30)),mode+': '+l.id+' reachable at yaw '+yaw);}}
 fig.setMode('old');const closed=spec.draw(view(45,30,0)),open=spec.draw(view(45,30,1));
 assert.deepEqual(closed.labels.map(l=>l.text).sort(),['Lace','Lace-up opening','Leather panel']);
 assert.deepEqual(open.labels.map(l=>l.text).sort(),['Bladder','Inflation tube','Lace','Lace-up opening','Leather panel'],'the inside is named only when drawn');
 assert.match(closed.svg,/data-lace /);assert.match(closed.svg,/data-opening/);assert.doesNotMatch(closed.svg,/data-bladder/);assert.match(open.svg,/data-bladder/);assert.match(open.svg,/data-tube/);
 const back=FK.aimAt(LF.LACE_DIR.map(x=>-x));assert.doesNotMatch(spec.draw(view(back.yaw,back.pitch,0)).svg,/data-lace /,'the lace is drawn only while it faces you');
 const seen=new Set();for(let yaw=0;yaw<360;yaw+=30)for(const p of [20,60]){const V=FK.viewVector(yaw,p);LF.PANELS18.forEach((q,i)=>{if(FK.dot(q.c,V)>.2)seen.add(i);});}
 assert.ok(seen.size>=17,'every panel but the one resting in the cup can be seen by turning ('+seen.size+')');
 const tan=spec.draw(view(45,30,0)).svg,ox=spec.draw(view(45,30,0,'oxblood')).svg;assert.notEqual(tan,ox,'swatches recolour the leather');
 assert.deepEqual(FK.swatchList(spec.swatches).map(s=>s.name),['Tan','Chestnut','Oxblood','White leather']);
 fig.setMode('new');const nd=spec.draw(view(45,30,1));assert.deepEqual(nd.labels.map(l=>l.text).sort(),['Panel','Sealed bladder','Valve']);
 assert.doesNotMatch(nd.svg,/data-lace|data-tube/,'no lace on the modern ball');assert.match(nd.svg,/data-valve-stem/);assert.equal(spec.draw(view(45,30,1,'oxblood')).svg,nd.svg,'swatches are for the leather');fig.setMode('old');
 const lit=spec.draw(view(45,30,0,null,['lace'])).svg;assert.match(lit,/var\(--accent\)/,'a touched part lights');
 for(const k of ['panel','lace','opening','bladder','tube','newPanel','valve','newBladder'])assert.ok(F.LOOK_SAY[k],'says '+k);
 assert.doesNotMatch(Object.values(F.LOOK_SAY).join(' '),/\d/,'no invented numbers in the look notes');assert.match(F.LOOK_SAY.tube,/unlace/);assert.match(F.LOOK_SAY.valve,/valve/i);
 assert.match(exp,/<FigureStage spec=\{fig\.spec\}/);for(const h of ['data-look ','data-look-back','data-fig-modern','data-look-note'])assert.ok(exp.includes(h),'hook '+h);
 assert.match(exp,/phase==='look'\?/);assert.match(exp,/ready&&phase!=='look'&&<svg/,'one drawing at a time');
 assert.doesNotMatch(read(dir+'figure.ts'),/requestAnimationFrame|setInterval/);
 console.log('PASS turn the ball: 17 of 18 panels seen (one rests in the cup), lace + opening, see-through bladder + tube, old vs new (valve, sealed bladder), labels from every yaw, leather swatches, ≤ 120 parts');}

