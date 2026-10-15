// copa-america-1916 · "The oldest cup for nations" (Oct 14 2026 redo: the tournament machine). Checks: the case and its sourced
// facts; every control's effect in the model and the drawing (the crank's drum detents play the six real 1916 matches, the flip
// table's numbers and order, the map plate's threads; the timeline carriage drops each continent's first cup in its year; the
// trophy lifts apart into five labelled parts); the shared contract and museum rules (one centred start, onComplete once, no
// emoji, ≥ 44 px targets, keyboard, no rAF at rest, reduced motion).
// usage: node tests/museum-exp-copa-america-1916.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const Mod=require('module'),orig=Mod._resolveFilename;Mod._resolveFilename=function(r,...a){if(r.startsWith('@/'))r=path.join(__dirname,'..',r.slice(2));return orig.call(this,r,...a);};
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const EMOJI=/\p{Extended_Pictographic}|️/u,ARROW=/[▶▸◀◂►→←➡⬅✅❌✔✖⟲⟳‹›]/u;
const glyphFree=(s,what)=>{const e=s.match(EMOJI),a=code(s).match(ARROW);assert.ok(!e,`${what}: emoji ${e?.[0]}`);assert.ok(!a,`${what}: arrow glyph ${a?.[0]} (use StepIcon)`);};
const id='copa-america-1916',dir='components/museum/experiences/copa-america-1916/';
const X=require('../lib/endgame/museum.ts'),e=X.EXHIBITS.find(x=>x.id===id);
const files=fs.readdirSync(path.join(root,dir)).sort(),src=Object.fromEntries(files.map(f=>[f,read(dir+f)]));
const exp=src['Experience.tsx'],css=src['Experience.module.css'],scene=src['scene.ts'];
const C=require('../'+dir+'content.ts'),M=require('../'+dir+'model.ts'),S=require('../'+dir+'scene.ts'),k=require('../components/museum/experiences/anatomy/iso-kit.ts');

// 1. The case, the facts, the cups and their sources.
{assert.ok(e);assert.equal(e.gallery,'firsts');assert.equal(e.year,'1916');assert.equal(e.need,0);
 assert.match(e.facts[0],/Argentina in July 1916, between Argentina, Brazil, Chile and Uruguay/);assert.match(e.facts[1],/round robin/);assert.match(e.facts[1],/Uruguay won/);
 assert.match(e.facts[2],/oldest continental tournament for national teams that is still played/);
 assert.deepEqual(M.CUPS.map(c=>[c.id,c.year,c.host,c.winner]),[['copa',1916,'Argentina','Uruguay'],['asia',1956,'Hong Kong','South Korea'],['africa',1957,'Sudan','Egypt'],['europe',1960,'France','Soviet Union'],['concacaf',1963,'El Salvador','Costa Rica'],['oceania',1973,'New Zealand','New Zealand']]);
 const urls=[...e.sources,...C.SOURCES].map(s=>s.url).join(' ');
 for(const p of ['1916_South_American_Championship','Copa_Am%C3%A9rica','AFC_Asian_Cup','Africa_Cup_of_Nations','1960_European_Nations%27_Cup','CONCACAF_Gold_Cup','OFC_Men%27s_Nations_Cup'])assert.ok(urls.includes(p),'cites '+p);
 assert.match(C.EXTRA.conmebol,/9 July/);assert.match(C.EXTRA.name,/1975/);assert.match(C.EXTRA.gradin,/3 goals/);
 assert.match(C.EXTRA.trophy,/3,000 Swiss francs/);assert.match(C.EXTRA.trophy,/77 cm/);assert.match(C.EXTRA.trophy,/9 kg/);assert.match(C.EXTRA.trophy,/three-level wooden base/);
 assert.match(C.MODEL_NOTE,/model/);assert.match(C.MODEL_NOTE,/not the 1916 shirts/,'the peg colours are not claimed as kits');
 assert.equal(C.BEATS.length,3);for(const c of C.CHECKS){assert.ok(c.options.length>=2&&c.right>=0&&c.right<c.options.length&&c.why.length>10);assert.equal(new Set(c.options).size,c.options.length);}
 assert.equal(C.CHECKS[2].options[C.CHECKS[2].right],'3');
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 console.log('PASS facts: 1916 in Argentina, four teams, a round robin, Uruguay; six continental cups; the trophy (1916, 3,000 Swiss francs, 77 cm, 9 kg, three-level base); all sourced');}

// 2. 1916: six real results, 2 points a win, the final table.
{assert.equal(M.MATCHES_1916.length,M.roundRobinGames(4));const pairs=new Set(M.MATCHES_1916.map(m=>[m.home,m.away].sort().join('-')));assert.equal(pairs.size,6,'everyone plays everyone once');
 const t=M.table();assert.deepEqual(t.map(r=>[r.team,r.p,r.w,r.d,r.l,r.gf,r.ga,r.pts]),[['Uruguay',3,2,1,0,6,1,5],['Argentina',3,1,2,0,7,2,4],['Brazil',3,0,2,1,3,4,2],['Chile',3,0,1,2,2,11,1]]);
 assert.equal(M.table(0).every(r=>r.pts===0),true);assert.equal(M.table(1)[0].team,'Uruguay');assert.equal(M.MATCHES_1916.reduce((a,m)=>a+m.hg+m.ag,0),18);
 assert.match(M.MATCHES_1916[5].note,/16 July/);assert.equal(M.WIN_POINTS,2);
 console.log('PASS 1916: six matches (a full round robin, 18 goals), the table Uruguay 5, Argentina 4, Brazil 2, Chile 1');}

// 3. The crank and the fixture drum: one face per detent, the drum's position IS how many matches are played.
{assert.equal(M.FACES,8);assert.equal(M.LAST_STATE,7);assert.ok(Math.abs(M.STEP-Math.PI/4)<1e-12);
 for(let s=0;s<=7;s++){assert.equal(M.stateAt(M.phiOf(s)),s);assert.equal(M.stateAt(M.phiOf(s)+M.STEP*.4),s,'a detent holds within half a step');}
 assert.equal(M.stateAt(-1),0);assert.equal(M.stateAt(99),7);assert.equal(M.clampPhi(-1),0);assert.equal(M.clampPhi(99),7*M.STEP,'end stops');
 assert.deepEqual([0,1,6,7].map(M.playedAt),[0,1,6,6],'the last face is the champions, not a seventh match');
 // threads on the map plate: one per match played; after six, every pair of pegs is joined
 assert.equal(M.threadsAt(0).length,0);assert.equal(M.threadsAt(3).length,3);assert.ok(M.threadsAt(3)[2].now&&!M.threadsAt(3)[1].now,'the newest thread is picked out');
 const joined=new Set(M.threadsAt(6).map(t=>[t.a,t.b].sort().join('-')));assert.equal(joined.size,6,'six threads join all six pairs');
 for(const t of M.TEAMS){assert.equal(M.TAG[t].length,3);const [lo,la]=M.PEG_AT[t];assert.ok(lo<-34&&lo>-82&&la<13&&la>-56,t+' peg on the continent');}
 console.log('PASS drum: 8 faces, 45° detents with end stops, state 0..7, six matches then the champions; threads join every pair');}

// 4. The timeline rail: each cup drops in its year; South America alone for 40 years.
{assert.deepEqual(M.droppedBy(1915),[]);assert.deepEqual(M.droppedBy(1916),['copa']);assert.deepEqual(M.droppedBy(1955),['copa']);assert.deepEqual(M.droppedBy(1957),['copa','asia','africa']);assert.equal(M.droppedBy(1980).length,6);
 assert.equal(M.headStart(),40);assert.equal(M.clampYear(1800),1910);assert.equal(M.clampYear(2050),1980);
 assert.match(M.railSay(1930),/still only South America\. 14 years alone/);assert.match(M.railSay(1957),/Africa Cup of Nations, in Sudan\. Egypt won it/);assert.match(M.railSay(1912),/no continent/);
 for(const y of [1910,1916,1956,1980])assert.ok(Math.abs(S.yearOfX(S.xOfYear(y))-y)<1e-9,'the ruler and the carriage agree');
 assert.ok(S.xOfYear(1980)>S.xOfYear(1910));
 console.log('PASS timeline: cups drop in their years, 40 years alone, the carriage reads the ruler');}

// 5. The trophy's parts.
{assert.deepEqual(M.TROPHY_PARTS.map(p=>p.id),['cup','tier1','tier2','tier3','plaques']);for(const p of M.TROPHY_PARTS)assert.ok(p.line.length>20&&p.line.length<140);
 assert.match(M.TROPHY_PARTS[0].line,/3,000 Swiss francs/);assert.match(M.TROPHY_PARTS[1].line,/Before 1979/);
 console.log('PASS trophy: cup, three wooden levels and the plaques, each with a sourced line');}

// 6. The drawing: pure, renders in Node, and every control changes it.
{assert.doesNotMatch(scene,/document\.|window\.|requestAnimationFrame/,'scene.ts is pure');
 const P=k.fitProjection(S.stationPoints('all'),1200,700,{pad:20,azimuth:50,elevation:30});
 const rowsOf=n=>{const o={};M.table(n).forEach((r,i)=>o[r.team]=i);return o;},drops=y=>Object.fromEntries(M.CUPS.map(c=>[c.id,c.year<=y?1:0]));
 const V=(o={})=>({phi:0,state:0,rows:rowsOf(0),flips:{},year:1910,drops:drops(1910),apart:0,...o});
 const r0=S.render(P,V());assert.ok(r0.svg.length>30000,'a dense drawing');assert.ok((r0.svg.match(/iso-solid/g)||[]).length>=50&&(r0.svg.match(/<path/g)||[]).length>=500,'50+ solids, 500+ paths ('+(r0.svg.match(/iso-solid/g)||[]).length+', '+(r0.svg.match(/<path/g)||[]).length+')');
 const r3=S.render(P,V({phi:M.phiOf(3),state:3,rows:rowsOf(3)}));
 assert.notEqual(r3.svg,r0.svg);assert.match(r3.svg,/BRA 1-1 CHI/,'the drum shows the third match');
 assert.equal((r3.svg.match(/stroke="var\(--acc\)" stroke-width="2"/g)||[]).length,1,'one newest thread in the accent');
 const rf=S.render(P,V({phi:M.phiOf(3),state:3,rows:rowsOf(3),flips:{'Brazil-0':.3}}));assert.match(rf.svg,/data-flap/,'a changing tile flips');
 const rY=S.render(P,V({year:1960,drops:drops(1960)})),cupsIn=s=>(s.match(/<g opacity="1\.00">/g)||[]).length;
 assert.equal(cupsIn(r0.svg),0);assert.equal(cupsIn(rY.svg),4,'four cups in their slots by 1960');assert.match(rY.svg,/40 YEARS ALONE/);
 assert.notEqual(rY.anchors.carriage.join(),r0.anchors.carriage.join(),'the carriage rides the rail');
 const rA=S.render(P,V({apart:1}));assert.deepEqual(Object.keys(r0.anchors.parts),[]);assert.deepEqual(Object.keys(rA.anchors.parts).sort(),['cup','plaques','tier1','tier2','tier3']);
 assert.ok(rA.anchors.trophy[1]<r0.anchors.trophy[1],'the cup lifts');
 const rT=S.render(P,V({team:'Chile',phi:M.phiOf(6),state:6,rows:rowsOf(6)}));assert.match(rT.svg,/#2f3a55/,'a picked team lights its row');
 const Ptall=k.fitProjection(S.stationPoints('cup'),360,600,{pad:6,azimuth:18,elevation:38});assert.match(S.render(Ptall,V({phi:M.phiOf(1),state:1,rows:rowsOf(1)})).svg,/>URU<\/text>/,'on a phone the drum stacks its words');
 console.log('PASS drawing: the crank turns the drum and plays matches, tiles flip, threads pull, cups drop, the carriage rides, the trophy lifts apart, a peg lights its row');}

// 7. Contract, the room, one start, onComplete once, no emoji.
{assert.match(exp,new RegExp(`<PaperRoom id="${id}"`));assert.doesNotMatch(exp,/NavigationButton|ExperienceBack|immediate/);
 assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((code(exp).match(/onComplete/g)||[]).length,3,'onComplete only reaches the Ending');
 assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.match(exp,/onDone=\{\(\)=>setChecked\(true\)\}/);assert.match(exp,/<StepCheck key=\{round\} items=\{CHECKS\}/);
 assert.equal((exp.match(/<StartDock /g)||[]).length,1,'ONE start button (the shared centred StartDock)');assert.doesNotMatch(exp,/data-start\b/);
 assert.match(exp,/const canCheck=done\.cup&&done\.line&&done\.trophy/);assert.match(exp,/disabled=\{!canCheck\}/);
 for(const [f,s] of Object.entries(src))glyphFree(s,f);glyphFree([...e.facts,e.forYourGame,e.title].join(' '),'case text');
 console.log('PASS contract: Paper room + shared Back, Escape, one centred start, quick check then the ending, onComplete once, no emoji or arrow glyphs');}

// 8. Touch and keyboard.
{for(const m of css.matchAll(/min-height:(\d+)px/g))assert.ok(Number(m[1])>=44,`min-height ${m[1]}px`);
 assert.match(exp,/hitR=\(r:number\)=>Math\.max\(24,r\)/);
 for(const h of ['carriage','crank','peg','trophy'])assert.match(exp,new RegExp(`data-hit="${h}"[^>]*tabIndex=\\{0\\}`),h+' is focusable');
 assert.match(exp,/onKeyDown=\{keyCrank\}/);assert.match(exp,/onKeyDown=\{keyCarriage\}/);assert.match(exp,/onKeyDown=\{keyTrophy\}/);
 assert.match(exp,/PageUp:10,PageDown:-10/);assert.match(exp,/r=\{22\} className=\{s\.badgeHit\}/);assert.match(exp,/<Slider name="apart"/);
 assert.match(exp,/<Seg label="Station"/,'the stations switch with real buttons');
 console.log('PASS targets: crank, drum, pegs, carriage, rail, trophy and badges are ≥ 44 px, each with a keyboard way in');}

// 9. Heat and reduced motion.
{for(const [f,s] of Object.entries(src))assert.ok(!/requestAnimationFrame|setInterval|setTimeout|useRaf|<canvas|WebGL/.test(code(s)),f+': no loop of its own, no timers, no canvas');
 assert.match(exp,/usePaperLoop\(\(dt\)=>/);assert.match(exp,/,cardRef,reduced\);/);assert.match(exp,/return moving;/);
 assert.match(exp,/V\.flips\[`\$\{t\}-\$\{i\}`\]=reduced\?1:0/,'reduced motion: tiles land at once');assert.match(exp,/if\(reduced\)V\.rows=\{\.\.\.V\.rowsT\}/);
 assert.match(exp,/let moving=!!V\.drag&&!reduced;/,'reduced motion: a drag never spins the loop to its end');
 assert.match(exp,/if\(reduced\)\{\/\/ reduced motion: everything lands at once/);
 assert.match(exp,/t:reduced\?1:0/,'reduced motion: the camera cuts');assert.match(exp,/if\(!easeIt\|\|reduced\)\{V\.apart=V\.apartT/);
 assert.match(exp,/const reduced=useReduced\(\)/);assert.match(exp,/'data-reduced':reduced\|\|undefined/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)\{/);
 assert.doesNotMatch(scene+css,/<filter|feGaussian|mix-blend|backdrop-filter/);
 console.log('PASS heat: one shared loop, only while a control is used or settling; 0 frames at rest; reduced motion lands at once');}

{assert.match(read('components/museum/experiences/index.tsx'),new RegExp(`'${id}':load\\(\\(\\)=>import\\('\\./${id}/Experience'\\)\\)`));
 assert.match(read(`app/museum-lab/${id}/page.tsx`),new RegExp(`guardLabRoute\\(\\);return <Lab id="${id}"`));console.log('PASS registry + lab route');}
console.log('museum-exp-copa-america-1916: all passed');
