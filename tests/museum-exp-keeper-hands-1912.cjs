// keeper-hands-1912 · "The goalkeeper's hands" (Oct 14 2026 redo: THE GLOVE-ZONE GANTRY and THE GLOVE STAND). Checks: the case
// and its sourced facts; every control's effect (the two cranks and their leadscrews, the Law switch and its lamps and lit area,
// the keeper's gloves open / closed, the distance gauge, the glove stand's crank and slider, the glove eras' layers); the hand-zone
// rule per era on a to-scale half pitch (Law 1); the four things to find; the game tie; the shared contract (Paper room + Back,
// ONE centred start button, StepCheck → Ending → onComplete once, the shared Paper loop only: 0 rAF at rest, reduced motion at once;
// 44 px targets, keys, no emoji or glyph arrows, registry + lab route).
// usage: node tests/museum-exp-keeper-hands-1912.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const id='keeper-hands-1912',dir=`components/museum/experiences/${id}/`;
const X=require('../lib/endgame/museum.ts'),e=X.EXHIBITS.find(x=>x.id===id),M=require('../'+dir+'model.ts'),C=require('../'+dir+'content.ts');
const files=fs.readdirSync(path.join(root,dir)).sort(),src=Object.fromEntries(files.map(f=>[f,read(dir+f)]));
const exp=src['Experience.tsx'],board=src['Board.tsx'],glove=src['Glove.tsx'],css=src['Experience.module.css'];

// 1. The case and its facts.
{assert.ok(e);assert.equal(e.gallery,'tactics');assert.equal(e.year,'1912');assert.equal(e.need,0);
 assert.match(e.facts[0],/Before 1912, a goalkeeper could handle the ball anywhere in their own half/);assert.match(e.facts[1],/only inside their own penalty area/);assert.match(e.facts[2],/1970s/);
 assert.ok(e.forYourGame.length>20);assert.match(e.forYourGame,/Inside your box/);assert.match(e.forYourGame,/stay home/);
 const urls=[...e.sources,...C.SOURCES].map(s=>s.url).join(' ');
 for(const p of ['Goalkeeper_(association_football)','Laws_of_the_Game_(association_football)','Kit_(association_football)','fouls-and-misconduct','the-field-of-play','Leigh_Richmond_Roose'])assert.ok(urls.includes(p),'cites '+p);
 for(const s of [...e.sources,...C.SOURCES])assert.match(s.url,/^https:\/\//);
 // The glove lines are the Kit article's: rarely worn before the 1970s; since the 1980s finger protectors, segmentation, grip palms; cuts.
 assert.match(C.LAYER_TEXT.spines.line,/bending backwards/);assert.match(C.LAYER_TEXT.back.line,/segments/);assert.match(C.LAYER_TEXT.palm.line,/protect the hand and to grip/);
 assert.match(C.LAYER_TEXT.hand.line,/1970s/);assert.match(C.GLOVE_FACT,/flat palm[^.]*roll finger[^.]*negative/);
 const all=[...e.facts,e.forYourGame,...Object.values(C.EXTRA),...C.CHECKS.flatMap(c=>[c.q,c.why,...c.options])].join('\n');
 assert.equal((all.match(/1992|back to them on purpose|back-pass/gi)||[]).length,2,'the 1992 rule stays one line');
 assert.equal(C.CHECKS.length,4);for(const c of C.CHECKS){assert.ok(c.right>=0&&c.right<c.options.length&&c.why.length>10);assert.equal(new Set(c.options).size,c.options.length);}
 assert.equal(C.BEATS.length,3);assert.ok(C.MODEL_NOTE.length>20);
 console.log('PASS facts: own half before 1912, the penalty area since, gloves from the 1970s; glove layers from the Kit article; back-pass one line; all sourced');}

// 2. The rule on the to-scale half pitch.
{assert.equal(M.BOX.hw,M.GOAL_W/2+16.5);assert.equal(M.BOX.d,16.5);assert.equal(M.HALF.d,52.5);
 const cases=[[0,0,true,true],[0,11,true,true],[20.16,16.5,true,true],[-20.16,0,true,true],[0,16.6,true,false],[20.3,5,true,false],[0,30,true,false],[-30,50,true,false],[0,52.5,true,false],[0,53,false,false],[40,10,false,false]];
 for(const [x,y,b,a] of cases){assert.equal(M.handsOK('before',x,y),b,`before (${x},${y})`);assert.equal(M.handsOK('after',x,y),a,`after (${x},${y})`);}
 for(let x=-34;x<=34;x+=2)for(let y=0;y<=52.5;y+=1.5)if(M.handsOK('after',x,y))assert.ok(M.handsOK('before',x,y));
 assert.equal(M.sayHands('after',0,25).big,'No hands');assert.match(M.sayHands('after',0,25).line,/25 m out/);
 console.log(`PASS rule: ${cases.length} spots x 2 eras (lines count as inside), the 1912 zone sits inside the old one`);}

// 3. The controls and what each does.
{// Cranks: one turn = 8 m along its screw; the keeper stops at the touchline, the goal line and halfway.
 assert.equal(M.LEAD,8);assert.deepEqual(M.crank([0,10],'x',1),[8,10]);assert.deepEqual(M.crank([0,10],'y',.5),[0,14]);assert.deepEqual(M.crank([0,10],'y',-3),[0,0]);
 assert.deepEqual(M.crank([30,10],'x',2),[34,10]);assert.deepEqual(M.crank([0,50],'y',1),[0,52.5]);
 assert.deepEqual(M.crank([0,0],'x',M.KEY_TURN),[1,0],'one arrow key = an eighth of a turn = 1 m');
 assert.ok(Math.abs(M.crankAngle(8)-Math.PI*2)<1e-9,'the handle turns with the screw: 8 m = one full turn');
 assert.match(board,/ang=\{crankAngle\(kx\)\}/);assert.match(board,/ang=\{crankAngle\(ky\)\}/);
 assert.match(exp,/moveTo\(crank\(d\.base as \[number,number\],d\.id==='xcrank'\?'x':'y',da\/\(Math\.PI\*2\)\),false\)/,'dragging a crank round turns its screw');
 // The Law switch: flips between the eras, lights its lamp and the allowed area.
 assert.equal(M.flip('before'),'after');assert.equal(M.flip('after'),'before');
 assert.match(board,/\{zone\('half',half,era==='before'\)\}\{zone\('box',box,era==='after'\)\}/,'the lit area: the whole half before 1912, the box after');
 assert.match(board,/lampAt\(S\.x-15,era==='before'\)\}\{lampAt\(S\.x\+15,era==='after'\)/);
 assert.match(exp,/if\(d\.id==='switch'\)\{setEra\(flip\(era\)\);return;\}/);
 // The keeper's hands: open round the ball where allowed, fists and the ball at the feet where not.
 assert.match(board,/ok\?<g data-glove="open">/);assert.match(board,/<g data-glove="fist">/);assert.match(board,/data-keeper-ball=\{ok\?'held':'feet'\}/);
 assert.match(exp,/bv\.current\.ok=handsOK\(era,bv\.current\.pos/);
 // The distance gauge: the needle reads metres out (a full turn = 60 m); the band is the allowed reach.
 assert.match(board,/needleD\(G\.x,G\.y,top,G\.R,ky\/60,P\)/);assert.match(board,/const reach=era==='before'\?HALF\.d:BOX\.d/);
 // The glove stand: the crank (one turn = fully apart) and the slider; the eras' layers.
 assert.equal(M.apartOfTurns(.5),.5);assert.equal(M.apartOfTurns(3),1);assert.equal(M.apartOfTurns(-1),0);
 assert.deepEqual(M.LAYERS,['palm','hand','spines','back','strap']);
 assert.deepEqual(M.gloveLayers('bare'),['hand']);assert.deepEqual(M.gloveLayers('1970s'),['palm','hand','back']);assert.deepEqual(M.gloveLayers('today'),['palm','hand','spines','back','strap']);
 for(let i=1;i<M.LAYERS.length;i++){assert.ok(M.layerZ(i,0)>M.layerZ(i-1,0)+M.LAYER_T[M.LAYERS[i-1]]-1e-9,'assembled layers stack without overlapping');assert.ok(M.layerZ(i,1)-M.layerZ(i-1,1)>=30,'apart: 30 units between carriers');}
 assert.match(glove,/style=\{\{opacity:on\?1:\.14/,'a layer the era did not have fades to a ghost');
 assert.match(exp,/label="Take it apart"/);assert.match(exp,/data-layer-label=\{l\}/);
 assert.match(exp,/if\(phase==='play'&&gEra==='today'&&apart>\.9\)find\('glove'\)/);
 console.log('PASS controls: cranks (8 m a turn, stops, keys 1 m), Law switch (lamps + lit area), gloves open/fists, distance gauge, glove crank + slider, eras of layers');}

// 4. The things to find, then the check.
{assert.equal(M.taskAt('before',0,30),'old-far');assert.equal(M.taskAt('before',0,5),null);assert.equal(M.taskAt('after',0,30),'new-out');assert.equal(M.taskAt('after',0,5),'new-in');
 assert.match(exp,/const ALL:[^=]*=\[\.\.\.TASKS,\{id:'glove'/);assert.match(exp,/disabled=\{!allFound\}/,'the quick check opens after all four');
 assert.match(C.CHECKS[1].q,/25 metres/);assert.match(C.CHECKS[2].why,/Keeper!/);assert.match(C.CHECKS[3].options[C.CHECKS[3].right],/bending backwards/);
 console.log('PASS finds: catch outside the box before 1912, step out and catch in after, take the glove apart; then the check');}

// 5. Contract, heat, reduced motion, targets, style.
{assert.match(exp,/<PaperRoom id="keeper-hands-1912"/);assert.match(read('components/museum/experiences/anatomy/PaperRoom.tsx'),/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.doesNotMatch(exp,/NavigationButton|<ExperienceBack/);assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((code(exp).match(/<StartDock /g)||[]).length,1,'ONE start button');assert.doesNotMatch(code(exp),/data-start[ =]|<Intro /);
 assert.match(exp,/<StepCheck key=\{round\} items=\{CHECKS\}/);assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.match(exp,/onDone=\{\(\)=>setChecked\(true\)\}/);
 assert.equal((code(exp).match(/onComplete/g)||[]).length,3,'onComplete only reaches the Ending');
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 for(const [f,t] of Object.entries(src))assert.doesNotMatch(code(t),/requestAnimationFrame|setInterval|setTimeout|<canvas|getContext\(/,f+': no loop or timer of its own');
 assert.match(exp,/usePaperLoop\(dt=>\{/);assert.match(exp,/return moving;\},stageRef,reduced\);/,'the shared loop stops at rest; reduced motion passed in');
 {let q=[];global.requestAnimationFrame=f=>{q.push(f);return q.length;};global.cancelAnimationFrame=()=>{};
  const {createPaperLoop}=require('../components/museum/experiences/anatomy/paper-loop.ts');
  let n=0;const l=createPaperLoop(()=>++n<4);assert.equal(q.length,0);l.wake();let k=0;while(q.length&&k<40){q.shift()(16*++k);}assert.equal(q.length,0,'0 frames at rest');
  let m=0;createPaperLoop(()=>++m<25,{reduced:true}).wake();assert.equal(m,25,'reduced motion: to the end at once');
  delete global.requestAnimationFrame;delete global.cancelAnimationFrame;}
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)\{/);assert.match(exp,/'data-reduced':reduced\|\|undefined/);
 for(const m of css.matchAll(/min-height:(\d+)px/g))assert.ok(Number(m[1])>=44,'min-height '+m[1]);
 assert.match(board,/r=\{Math\.max\(26,\(r\+4\)\*s\)\} data-hit=\{hit\} tabIndex=\{0\} role="slider"/,'crank targets at least 52 px');
 assert.match(board,/r=\{Math\.max\(26,22\*s\)\} data-hit="switch" tabIndex=\{0\} role="switch"/);
 assert.match(exp,/if\(\(id==='xcrank'\|\|id==='ycrank'\)&&dir\)/,'arrow keys turn the focused crank');assert.match(exp,/if\(id==='switch'&&\(dir\|\|e\.key===' '\|\|e\.key==='Enter'\)\)/,'Enter / Space flips the switch');
 assert.match(exp,/if\(id==='glovecrank'&&dir\)/);
 const EMOJI=/\p{Extended_Pictographic}|️/u,ARROW=/[▶▸◀◂►→←➡⬅✅❌✔✖⟲⟳]/u;
 for(const [f,t] of Object.entries(src)){assert.doesNotMatch(t,EMOJI,'no emoji in '+f);assert.doesNotMatch(code(t),ARROW,'no glyph arrows in '+f);}
 assert.doesNotMatch([...e.facts,e.forYourGame,e.title].join(' '),EMOJI);
 assert.match(read('components/museum/experiences/index.tsx'),new RegExp(`'${id}':load\\(\\(\\)=>import\\('\\./${id}/Experience'\\)\\)`));
 assert.match(read('components/museum/experiences/index.tsx'),new RegExp(`const IDS=\\[[^\\]]*'${id}'`));
 assert.match(read(`app/museum-lab/${id}/page.tsx`),new RegExp(`guardLabRoute\\(\\);return <Lab id="${id}"`));
 console.log('PASS contract: Paper room + shared Back, Escape, one centred start, check then ending then onComplete once, shared loop only (0 frames at rest, reduced = instant), 44 px+, keys, no emoji, registry + lab');}
console.log('museum-exp-keeper-hands-1912: all passed');
