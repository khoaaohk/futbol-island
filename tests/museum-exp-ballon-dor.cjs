// ballon-dor (Oct 14 2026 redo: THE GOLDEN BALL WORKSHOP; user: "make it possible to turn knobs and things to make it do
// something", like the stadiums' breakdown). Checks: the winners data matches the sources (Wikipedia's winners tables, 1956 →
// 2025, none in 2020); the trophy facts (French Wikipedia: Mellerio dits Meller, Paris, 15 kg, brass ball on a pyrite block,
// 100 hours by five craftspeople) and the vote (100 journalists, top 10, 15-12-10-8-7-5-4-3-2-1); every control's effect (the
// crank turns the ball, the take-apart slider lifts the layers and the scale reads 0, each lever pull counts one era on the
// drums to 64 / 4 / 1 and 7 women's, the place dial reads the points); the contract; no photos or emoji; 44 px; heat.
// usage: node tests/museum-exp-ballon-dor.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),dir='components/museum/experiences/ballon-dor/';
const D=require('../'+dir+'data.ts'),X=require('../lib/endgame/museum.ts'),W=require('../'+dir+'Workshop.tsx');
const exp=read(dir+'Experience.tsx'),ws=read(dir+'Workshop.tsx'),css=read(dir+'Experience.module.css');
const files=fs.readdirSync(path.join(root,dir)).filter(f=>/\.(tsx?|css)$/.test(f));
const code=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"`\\])\/\/.*$/gm,'$1');

// 1. The winners and the records.
{assert.equal(D.MEN.length,69,'69 men’s awards, 1956 to 2025 without 2020');assert.equal(D.MEN[0].year,1956);assert.equal(D.MEN[0].name,'Stanley Matthews');assert.equal(D.MEN.at(-1).year,2025);
 assert.equal(D.MEN.at(-1).name,'Ousmane Dembélé');assert.ok(!D.MEN.some(w=>w.year===2020)&&!D.WOMEN.some(w=>w.year===2020),'2020 not awarded');
 for(let i=1;i<D.MEN.length;i++)assert.ok(D.MEN[i].year>D.MEN[i-1].year,'one winner a year, in order');
 assert.equal(D.winsOf('Lionel Messi',D.MEN),8,'Messi: eight, the record');for(const w of D.MEN)assert.ok(D.winsOf(w.name,D.MEN)<=8);
 assert.equal(D.winsOf('Cristiano Ronaldo',D.MEN),5);for(const n of ['Johan Cruyff','Michel Platini','Marco van Basten'])assert.equal(D.winsOf(n,D.MEN),3,n);
 assert.deepEqual(D.MEN.filter(w=>w.group==='gk').map(w=>[w.year,w.name]),[[1963,'Lev Yashin']],'one goalkeeper');
 assert.deepEqual(D.MEN.filter(w=>w.group==='df').map(w=>w.year),[1972,1976,1996,2006],'defenders: Beckenbauer ×2, Sammer, Cannavaro');
 assert.deepEqual(D.WOMEN.map(w=>w.year),[2018,2019,2021,2022,2023,2024,2025]);assert.equal(D.WOMEN[0].name,'Ada Hegerberg');
 assert.equal(D.winsOf('Alexia Putellas',D.WOMEN),2);assert.equal(D.winsOf('Aitana Bonmatí',D.WOMEN),3);
 assert.deepEqual([...D.CRITERIA],['Individual performances, decisive and impressive character','Team performances and achievements','Class and fair play']);
 const e=X.EXHIBITS.find(x=>x.id==='ballon-dor');assert.equal(e.gallery,'hall');assert.equal(e.year,'1956');assert.ok(e.sources.length>=4);
 for(const s of [...e.sources,...D.SOURCES,D.TROPHY_SOURCE])assert.match(s.url,/^https:\/\/(en|fr)\.wikipedia\.org\/wiki\//);
 console.log('PASS data: 69 men’s awards (2020 none), 1 goalkeeper, 3 defenders, Messi 8, women since 2018 (Hegerberg, Putellas ×2, Bonmatí ×3), three criteria');}

// 2. The trophy on the turntable scale: crank, take apart, the scale's needle.
{assert.deepEqual({...D.TROPHY},{kg:15,maker:'Mellerio dits Meller',city:'Paris',hours:100,artisans:5,months:6});
 const t=D.TROPHY_LAYERS.map(l=>l.text).join(' ');for(const re of [/brass/,/Mellerio dits Meller/,/Paris/,/pyrite/,/unique/,/15 kg/,/100 hours/,/Five craftspeople/])assert.match(t,re);
 assert.deepEqual(D.TROPHY_LAYERS.map(l=>l.id),['ball','block','scale']);
 assert.equal(D.TROPHY_SOURCE.url,'https://fr.wikipedia.org/wiki/Ballon_d%27or');
 // the ball's seams are a real football's: a truncated icosahedron has 90 edges (12 pentagons, 20 hexagons)
 assert.match(ws,/SEAMS:V\[\]\[\]/);const P=W.projectionFor(1200,700,0,0,40,26,0),Pa=W.projectionFor(1200,700,0,1,40,26,0);
 const v={station:0,spin:0,explode:0,pulls:0,pull:0,roll:1,plate:0,place:1,needle:15,needleB:15};
 const a0=W.anchors(v,Pa),a1=W.anchors({...v,explode:1},Pa);assert.ok(a1.ball[1]<a0.ball[1]-40&&a1.block[1]<a0.block[1]-10&&a1.scale[1]===a0.scale[1],'apart: ball and block lift, the scale stays');
 assert.ok(Pa.scale<P.scale,'apart: the camera makes room');
 assert.match(exp,/a\.needle=step\(a\.needle,a\.explode>\.08\?0:TROPHY\.kg/,'the scale reads 15 kg, and 0 when the trophy is lifted off');
 const h=W.hitTargets(v,P),h2=W.hitTargets({...v,spin:Math.PI/2},P);assert.notDeepEqual(h[0].at,h2[0].at,'the crank handle goes round with the spin');
 assert.match(ws,/<GoldBall P=\{P\} c=\{ballC\} r=\{40\} spin=\{v\.spin\}\/>/,'the crank turns the ball');assert.match(ws,/rot\(\[\[/,'and its pyrite block');
 console.log('PASS trophy: brass ball by Mellerio dits Meller (Paris), pyrite block (unique), 15 kg, 100 hours by five; crank spins it, the slider lifts it apart, the scale drops to 0');}

// 3. The tally machine: each pull counts one more era.
{assert.equal(D.ERAS.length,8);assert.equal(D.ERAS[0].from,1956);assert.equal(D.ERAS.at(-1).to,2025);
 for(let i=1;i<D.ERAS.length;i++)assert.equal(D.ERAS[i].from,D.ERAS[i-1].to+1,'eras join up');
 assert.deepEqual(D.tally(0),{year:0,mf:0,df:0,gk:0,women:0});
 let last=D.tally(0);for(let p=1;p<=8;p++){const t=D.tally(p);for(const k of ['mf','df','gk','women'])assert.ok(t[k]>=last[k],'drums only count up');assert.equal(t.year,D.ERAS[p-1].to);last=t;}
 assert.deepEqual(D.tally(8),{year:2025,mf:64,df:4,gk:1,women:7},'the brief: attack/midfield 64, defenders 4, goalkeeper 1; women’s 7');
 assert.equal(D.tally(2).gk,1,'Yashin shows in the 1960s');assert.equal(D.tally(6).women,0);assert.equal(D.tally(7).women,2,'the women’s drum starts in 2018');
 let men=0,women=0;D.ERAS.forEach((_,i)=>{const w=D.eraWinners(i);men+=w.men.length;women+=w.women.length;});assert.equal(men,69);assert.equal(women,7);
 assert.match(exp,/setPulls\(p=>Math\.min\(ERAS\.length,p\+1\)\)/);assert.match(ws,/data-drum=\{id\} data-value=\{now\}/);assert.match(ws,/data-plate=\{ERAS\[v\.pulls-1\]\.label\}/);
 console.log('PASS tally: 8 eras, the drums count up to 64 / 4 / 1 and 7 women’s, every era plate lists its winners');}

// 4. The ballot dial.
{assert.deepEqual([...D.POINTS],[15,12,10,8,7,5,4,3,2,1]);assert.equal(D.VOTERS,100);assert.equal(D.SHORTLIST,30);
 assert.equal(D.pointsFor(1),15);assert.equal(D.pointsFor(10),1);assert.equal(D.pointsFor(11),0);
 for(let p=1;p<=10;p++){const rad=(-135+(p-1)*30)*Math.PI/180;assert.equal(W.placeFromAngle(rad),p,'the dial’s detents map to places');}
 assert.match(exp,/a\.needleB=step\(a\.needleB,pointsFor\(place\)/,'the gauge needle follows the points');
 console.log('PASS ballot: 100 journalists, top 10 from 30, 15-12-10-8-7-5-4-3-2-1; the dial’s ten detents, the gauge follows');}

// 5. The page: contract, no photos, no emoji, 44 px, heat, reduced motion, registry.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);assert.match(exp,/<PaperRoom id="ballon-dor"/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((exp.match(/<StartDock /g)||[]).length,1,'ONE start button');
 assert.equal((exp.match(/onComplete=\{onComplete\}/g)||[]).length,1);assert.doesNotMatch(exp,/onComplete(\?\.)?\(/);assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.match(exp,/<StepCheck items=\{QUIZ\}/);
 for(const hk of ['data-phase','data-station','data-pulls','data-place','data-bdo-next','data-bdo-pull','data-bdo-finish','data-bdo-era'])assert.ok(exp.includes(hk),'hook '+hk);
 assert.match(exp,/<summary>Sources<\/summary>/);assert.match(exp,/exhibit\.forYourGame/);assert.match(exp,/TROPHY_SOURCE/);
 assert.ok(!/<img|<image|background-image|url\(http/i.test(exp+ws+css),'no photos or pictures of real people');
 const emoji=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
 for(const f of files)assert.doesNotMatch(code(read(dir+f)),emoji,'no emoji or arrow glyphs in '+f);
 for(const [w,hh] of [[390,560],[1360,640]])for(const station of [0,1,2]){const P=W.projectionFor(w,hh,station,0,40,26,0);
  for(const t of W.hitTargets({station,spin:0,explode:0,pulls:0,pull:0,roll:1,plate:0,place:1,needle:15,needleB:15},P))assert.ok(t.r>=22,`${t.c} 44 px at ${w}`);}
 assert.match(ws,/tabIndex=\{0\} role=\{x\.role\}/,'every control is focusable');assert.match(exp,/ArrowUp/);
 assert.match(css,/min-height:44px/);
 for(const f of files.filter(f=>/\.tsx?$/.test(f)))assert.doesNotMatch(read(dir+f),/requestAnimationFrame|setInterval|setTimeout/,'no own loop or timers in '+f);
 assert.match(exp,/usePaperLoop\(dt=>\{[\s\S]*?bump\(\);return more;\},stageRef,reduced\)/,'one shared loop that stops at rest; instant under reduced motion');
 assert.match(css,/prefers-reduced-motion:reduce/);
 const reg=read('components/museum/experiences/index.tsx');assert.match(reg,/'ballon-dor':load\(\(\)=>import\('\.\/ballon-dor\/Experience'\)\)/);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/ballon-dor/page.tsx')),'lab route');
 assert.ok(require('../lib/analytics/islandIds.ts').ACTIVITY_IDS.includes('exhibit_ballon-dor'));
 console.log('PASS page: one start, quick check → Ending → onComplete once, sources, no photos, no emoji, 44 px targets, keyboard, shared loop, reduced motion, registry');}
console.log('museum-exp-ballon-dor: all passed');
