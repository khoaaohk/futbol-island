// shirts · "The kit room, matchday 1928" in the anatomy Paper style (Oct 12 2026 restyle; user: "these games should not be the
// pixel style. only the penalty kick should be pixel game", "larger and fill the entire screen", then every exhibit except the
// penalty kick in the anatomy isometric technical-illustration look). Checks: the case's facts, the sourced history (data.ts,
// eras.ts, unchanged), the host contract, no pixel kit left, the Paper look on the shared anatomy kit, a play area that fills the
// screen at 1440 × 900, 1845 × 1110 and 390 × 844, heat (no frame loop; a clock only during a half), the game rules (numbers on
// the 2-3-5, the Law 4 dye vats, points and clock), reduced motion, and the kit room rendered in Node with tappable pegs and vats.
// usage: node tests/museum-exp-shirts.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const root=path.join(__dirname,'..'),dir='components/museum/experiences/shirts/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),D=require('../'+dir+'data.ts'),E=require('../'+dir+'eras.ts'),M=require('../'+dir+'model.ts'),C=require('../'+dir+'content.ts');
const B=require('../components/museum/experiences/anatomy/bench.tsx'),S=require('../'+dir+'scene.tsx'),K=require('../components/museum/experiences/anatomy/iso-kit.ts');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const exp=read(dir+'Experience.tsx'),model=read(dir+'model.ts'),scene=read(dir+'scene.tsx'),bench=read('components/museum/experiences/anatomy/bench.tsx'),loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts'),css=read(dir+'Experience.module.css');
const e=X.EXHIBITS.find(x=>x.id==='shirts');
const files=fs.readdirSync(path.join(root,dir)).sort();
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');

// 1. Facts and sources: the case's facts word for word, the 1928 / 2-3-5 / 1933 extras, the decades, every source.
{for(const i of [0,1,2])assert.match(exp,new RegExp(`exhibit\\.facts\\[${i}\\]`),`fact ${i+1} is shown`);assert.match(exp,/take=\{exhibit\.forYourGame\}/);
 assert.match(e.facts[1],/1 the goalkeeper, 9 the striker, 10 the playmaker/);
 assert.equal(D.spotOf(1).role,'Goalkeeper');assert.match(D.spotOf(9).role,/striker/i);assert.match(D.spotOf(10).role,/playmaker/i);
 for(const k of ['firstDay','shape','cupFinal'])assert.ok(exp.includes(`EXTRA_FACTS.${k}`),`${k} is shown`);
 assert.match(D.EXTRA_FACTS.firstDay,/25 August 1928, Arsenal and Chelsea/);assert.match(D.EXTRA_FACTS.cupFinal,/1933 FA Cup final, Everton wore 1 to 11 and Manchester City wore 12 to 22/);
 assert.match(exp,/MILESTONES\.map/,'the decades are kept, with their sources');assert.ok(E.MILESTONES.some(m=>m.year===1928)&&E.MILESTONES.some(m=>m.year===1993));
 const urls=D.SOURCES.map(s=>s.url);for(const u of ['https://en.wikipedia.org/wiki/Squad_number_(association_football)','https://www.theifab.com/laws/latest/the-players-equipment/','https://en.wikipedia.org/wiki/1933_FA_Cup_final','https://www.arsenal.com/feature/27.-gunners-wear-numbered-shirts-aX7y25h6rQhY'])assert.ok(urls.includes(u),'cites '+u);
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.SOURCES,\.\.\.DECADE_SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 assert.match(C.PRACTICE_NOTE,/practice game/);assert.match(exp,/\{PRACTICE_NOTE\}/);
 console.log('PASS facts: case facts word for word, 1928 / 2-3-5 / 1933, the decades, all sources, practice game labelled');}

// 2. Contract: dialog, one shared Back, Escape, onComplete only via Ending after the game and the quick check.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);
 assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(exp,/data-museum-experience="shirts"/);
 assert.equal((exp.match(/<ExperienceBack onClose=\{onClose\}\/>/g)||[]).length,1);assert.doesNotMatch(exp,/NavigationButton|immediate/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((code(exp).match(/onComplete/g)||[]).length,3,'received, then only handed to Ending');
 assert.match(exp,/\{checked&&<Ending [^\n]*onComplete=\{onComplete\} reached=\{checked\}\/>\}/);assert.match(exp,/const checked=picked!=null/);
 assert.match(exp,/phase==='score'&&<div className=\{s\.panel\} data-score-panel>/);assert.match(exp,/<StepCheck items=\{\[CHECK\]\}/);
 for(const h of ['data-phase','data-shirt','data-job','data-score','data-peg','data-vat','data-start-colours','data-play-again','data-peg-3d','data-vat-3d','data-clash','data-stamp'])assert.ok(exp.includes(h)||scene.includes(h),'hook '+h);
 assert.equal(C.BEST_KEY,'futbol.museum.shirts.rushBest','the progress key is kept');assert.match(exp,/try\{localStorage\.setItem\(BEST_KEY/);
 assert.match(read('app/museum-lab/shirts/page.tsx'),/<Lab id="shirts"/);assert.match(read('components/museum/experiences/index.tsx'),/'shirts':load\(\(\)=>import\('\.\/shirts\/Experience'\)\)/);
 console.log('PASS contract: dialog, shared Back, Escape, onComplete only after game + quick check, hooks, progress key, lab route');}

// 3. Style: no pixel kit; the anatomy kit in the Paper tint; one red accent (your team).
{for(const f of files){const src=read(dir+f);assert.doesNotMatch(src,/pixeliso/,f+' imports no pixeliso / pixeliso-laws');
  assert.doesNotMatch(src,/#000048|PK Press Start|PK Pixelify|Mega Drive|crispEdges/i,f+': no pixel palette, fonts or navy ground');}
 assert.deepEqual(files,['Experience.module.css','Experience.tsx','content.ts','data.ts','eras.ts','model.ts','scene.tsx']);
 assert.match(bench,/from '\.\/iso-kit'/);assert.match(exp,/from '\.\.\/anatomy\/bench'/);assert.match(exp,/dangerouslySetInnerHTML=\{\{__html:ISO_CSS\}\}/);
 assert.match(exp,/className=\{`\$\{g\.room\} iso \$\{s\.root\}`\} data-theme="light"/);
 assert.match(css,/\.root\.root\[data-theme\]\{--anatomy-page:#e0e0db;--anatomy-card:#e0e0db;--anatomy-paper:#f7f7f3/,'Paper ground and solids');
 assert.match(exp,/'--accent':'#e4322b'/);assert.equal(S.RED,'#e4322b');
 console.log('PASS style: no pixeliso, no pixel palette / fonts / navy; anatomy kit, Paper tint, one red accent');}

// 4. Fill the screen.
{assert.match(css,/\.screen\{box-sizing:border-box;height:100vh;height:100dvh;display:grid;grid-template-rows:auto minmax\(0,1fr\) auto/);
 assert.match(css,/\.svg\{position:absolute;inset:0;width:100%;height:100%;touch-action:none/);
 assert.match(exp,/data-play-area data-fill-screen/);assert.match(exp,/viewBox=\{`0 0 \$\{W\} \$\{H\}`\}/);assert.match(exp,/const box=useBox\(card\)/);
 for(const [W,H] of [[1400,660],[1805,860],[370,520]]){const F=B.frameFor(W>=H*1.05?'wide':'tall'),pts=S.roomPoints(),pad=Math.round(Math.max(16,Math.min(W,H)*.045));
  const P=B.fit(F,pts,W,H-34,pad,F.o==='wide'?36:50),xy=pts.map(([a,b,z])=>K.iso([...B.at(F,a,b),z],P));
  const w=Math.max(...xy.map(p=>p[0]))-Math.min(...xy.map(p=>p[0])),h=Math.max(...xy.map(p=>p[1]))-Math.min(...xy.map(p=>p[1]));
  assert.ok(w/W>.8||h/(H-34)>.8,`the kit room fills the ${W}×${H} card (${Math.round(w/W*100)}% × ${Math.round(h/(H-34)*100)}%)`);}
 console.log('PASS fill: 100dvh screen, card = 1fr, viewBox = measured card, the kit room fills ≥ 80% at 1440, 1845 and 390');}

// 5. Heat: no frame loop at all; the stamp is a CSS transition; the clock only during a half, paused in a hidden tab.
{for(const src of [exp,model,scene])assert.doesNotMatch(src,/requestAnimationFrame|setInterval|useRaf\(/);
 assert.match(scene,/transition:'transform \.16s/,'the stamp drops by a transform transition');
 assert.match(exp,/const running=\(phase==='numbers'\|\|phase==='colours'\)&&!reduced/,'the clock runs only during a half, never under reduced motion');
 assert.match(exp,/if\(document\.hidden\)\{tick\(\);return;\}/,'a hidden tab pauses the clock');assert.match(exp,/return\(\)=>clearTimeout\(id\)/);
 assert.match(exp,/useEffect\(\(\)=>\(\)=>timers\.current\.forEach\(clearTimeout\),\[\]\)/);
 console.log('PASS heat: no frame loop, CSS stamp, clock only while playing (paused when hidden), timers cleared');}

// 6. Numbers: shirts in any order, the right peg, points with a streak, the 2-3-5 on the board.
{const p=M.pile(()=>.3);assert.deepEqual([...p].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9,10,11]);
 assert.equal(M.shirtPoints(0),10);assert.equal(M.shirtPoints(2),20);assert.equal(M.shirtPoints(9),30,'streak bonus capped');
 assert.equal(M.timeBonus(12.7),12);assert.equal(M.timeBonus(-3),0);
 assert.match(D.hintFor(9,D.spotOf(4)),/further forward/);assert.match(D.hintFor(7,D.spotOf(11)),/more to the right/);
 const pegs=D.SPOTS.map(s=>({n:s.n,...M.pegOf(s)}));
 for(const q of pegs)assert.ok(q.a>=M.BOARD.a0&&q.a<=M.BOARD.a1&&q.b>=M.BOARD.b0&&q.b<=M.BOARD.b1,'peg on the board '+q.n);
 const at=n=>pegs.find(q=>q.n===n);assert.ok(at(1).a<at(2).a&&at(2).a<at(5).a&&at(5).a<at(9).a,'the keeper by our goal, then backs, halves, forwards');
 assert.ok(at(7).b>at(9).b&&at(9).b>at(11).b,'right winger on our right, left winger on our left');
 for(const s of D.SPOTS)for(const o of D.SPOTS){const a=M.pegOf(s),b=M.awayOf(o);assert.ok(Math.hypot(a.a-b.a,a.b-b.b)>14,'no two players stand in each other');}
 assert.match(exp,/near&&near\.d<Math\.max\(34,Math\.min\(W,H\)\*\.06\)\)hang\(near\.n\)/,'drop the shirt on a peg');
 console.log('PASS numbers: any order, 10 + streak (cap 30), the hints, the 2-3-5 on the board, drag-and-drop or tap');}

// 7. Colours: Law 4 one pick at a time: all five kits must look different (the same pairs as data.lawChecks).
{assert.equal(M.HOME,'red');assert.deepEqual(M.JOBS.map(j=>j.key),['away','homeGk','awayGk','referee']);
 assert.equal(M.dye('away','orange',{home:'red'}).ok,false,'orange clashes with red');assert.match(M.dye('away','orange',{home:'red'}).say,/too close to your team/);
 assert.equal(M.dye('away','orange',{home:'red'}).with,'home','the clash names who it looks like (the red wire)');
 assert.equal(M.dye('away','white',{home:'red'}).ok,true);
 const kits={home:'red',away:'white'};assert.equal(M.dye('homeGk','white',kits).ok,false,'a keeper may not wear the other team’s colour');
 assert.equal(M.dye('homeGk','green',kits).ok,true);kits.homeGk='green';
 assert.equal(M.dye('awayGk','green',kits).ok,false,'the keepers differ from each other');assert.equal(M.dye('awayGk','yellow',kits).ok,true);kits.awayGk='yellow';
 assert.equal(M.dye('referee','black',kits).ok,true);kits.referee='black';
 assert.ok(D.lawChecks({home:'red',away:'white',homeGk:'green',awayGk:'yellow',referee:'black'}).every(c=>c.ok),'a full set that passes the vats passes all three Law 4 checks');
 assert.equal(M.KIT_POINTS,20);assert.equal(M.CLASH_PENALTY,5);assert.equal(M.NUM_SECONDS,40);assert.equal(M.COL_SECONDS,30);
 console.log('PASS colours: clashes refused with the reason, keepers apart from everyone, a dyed set passes Law 4');}

// 8. The kit room rendered in Node (both frames): dense parts, eleven pegs as buttons, eight vats, players, a clash wire.
{for(const o of ['wide','tall']){const F=B.frameFor(o),P=B.fit(F,S.roomPoints(),1200,700,30);
  const html=renderToStaticMarkup(React.createElement('svg',null,React.createElement(S.RoomStatic,{F,P}),React.createElement(S.Clock,{F,P,secs:31,hot:false}),
   React.createElement(S.TrayShirt,{F,P,n:10,color:'#e4322b'}),React.createElement(S.Stamp,{F,P,down:false}),React.createElement(S.Vats,{F,P,flash:null,wrong:null,onPick:()=>{},disabled:false}),
   React.createElement(S.BoardLive,{F,P,hung:new Set([1,9]),kits:{home:'red'},job:null,wrongPeg:null,flashPeg:null,clashWith:null,onPeg:()=>{},pegsLive:true})));
  assert.ok((html.match(/<path/g)||[]).length>200,o+': a dense kit room ('+(html.match(/<path/g)||[]).length+' paths)');assert.match(html,/class="iso-halo"/);
  assert.equal((html.match(/data-peg-3d=/g)||[]).length,9,'nine empty pegs');assert.equal((html.match(/role="button"/g)||[]).length,9+8,'pegs and vats are buttons');
  assert.match(html,/data-fig="home-9"/);assert.match(html,/data-tray-shirt="10"/);assert.match(html,/data-clock="31"/);
  const col=renderToStaticMarkup(React.createElement('svg',null,React.createElement(S.BoardLive,{F,P,hung:new Set(D.SPOTS.map(s=>s.n)),kits:{home:'red'},job:'away',wrongPeg:null,flashPeg:null,clashWith:'home',onPeg:()=>{},pegsLive:false})));
  assert.equal((col.match(/data-fig="away-/g)||[]).length,11,'the other team waits to be dyed');assert.match(col,/data-clash="home"/,'the clash wire');}
 console.log('PASS render: kit room rendered in Node in both frames, > 200 paths, pegs + vats as buttons, players, clash wire');}

// 9. Reduced motion: turn-based (no clock, no stamp drop), every rule the same; every target is a button.
{assert.match(exp,/const press=useCallback\(\(\)=>\{if\(reduced\)return;/,'no stamp motion');
 assert.match(exp,/reduced\?0:timeBonus\(left\)/,'no time bonus without a clock');
 assert.match(exp,/data-peg=\{sp\.n\}/);assert.match(exp,/data-vat=\{id\}/);assert.match(exp,/aria-label=\{`Formation: where does shirt/);
 assert.match(scene,/tabIndex=\{pegsLive\?0:-1\}/,'pegs are keyboard buttons');assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 console.log('PASS reduced motion: no clock, no stamp drop, same rules; pegs, vats, pad and swatches are buttons');}
