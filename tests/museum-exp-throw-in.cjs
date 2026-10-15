// throw-in "The throw-in" (Oct 14 2026 redo: THE THROW-IN TRAINER; user: "make it possible to turn knobs and things to make it do
// something", like the stadiums' breakdown). Checks: the case facts and sources (IFAB Law 15; 1863, 1877, 1883); every control's
// effect on the mannequin and the referee's box (foot carriages across the 12 cm line, the lift lever's three notches, the hands
// switch, the arm knob's green arc measured on the figure); the throw (aim dial, power slide, team-mates, a marked man, a foul
// throw goes to the other team, every defender 2 m away); the exploded layers; the contract (one start, onComplete once,
// Ending, quick check), no emoji, 44 px targets, the shared loop (0 rAF at rest) and reduced motion.
// usage: node tests/museum-exp-throw-in.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const root=path.join(__dirname,'..'),dir='components/museum/experiences/throw-in/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),M=require('../'+dir+'model.ts'),C=require('../'+dir+'content.ts'),R=require('../'+dir+'Rig.tsx');
const files=fs.readdirSync(path.join(root,dir)).filter(f=>/\.(tsx?|css)$/.test(f)),exp=read(dir+'Experience.tsx'),rig=read(dir+'Rig.tsx'),css=read(dir+'ti.module.css');
const code=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"`\\])\/\/.*$/gm,'$1');

// 1. Facts and sources.
{const e=X.EXHIBITS.find(x=>x.id==='throw-in');assert.ok(e);assert.equal(e.gallery,'skills');assert.equal(e.year,'1863');assert.equal(e.need,0);
 assert.match(e.facts[0],/whole ball goes over the touchline.*did not touch it last/);
 assert.match(e.facts[1],/faces the pitch.*part of each foot on the line or on the ground behind it.*both hands from behind and over the head/);
 assert.match(e.facts[2],/cannot score straight from a throw-in.*at least 2 metres/);assert.match(e.facts[3],/1863.*first player to touch.*right angles.*1883/);
 const urls=[...e.sources,...C.SOURCES].map(s=>s.url);for(const u of urls)assert.match(u,/^https:\/\//);
 assert.ok(urls.includes('https://www.theifab.com/laws/latest/the-throw-in/'),'IFAB Law 15');assert.ok(urls.some(u=>/wiki\/Throw-in$/.test(u)));
 const hist=C.HISTORY.map(h=>h.tag+' '+h.text).join(' ');for(const k of ['1863','right angles','1877','any direction','1883','both hands','2 m'])assert.ok(hist.includes(k),'history: '+k);
 assert.match(exp,/exhibit\.facts\.map/);assert.match(exp,/exhibit\.forYourGame/);assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.SOURCES\]/);assert.match(exp,/MODEL_NOTE/);
 console.log('PASS facts: Law 15 (who throws, feet, two hands over the head, no goal direct, 2 m) and 1863 / 1877 / 1883; IFAB + Wikipedia');}

// 2. Every control of the trainer, and what the referee's box says.
{const F=M.FAIR_RIG,j=r=>M.judge({...F,...r});
 assert.deepEqual(M.judge(F),{fair:true,fouls:[]},'the fair setting');
 // foot carriages: the line is 12 cm, the foot 26 cm; part of the foot on the line is enough
 assert.equal(M.LINE_W,12);assert.equal(M.footZone(-20),'behind');assert.equal(M.footZone(0),'on');assert.equal(M.footZone(25),'on','heel still on the line');assert.equal(M.footZone(26),'pitch');
 assert.equal(j({footL:25}).fair,true);assert.deepEqual(j({footR:30}).fouls,['feet']);assert.ok(M.FOOT_MIN<0&&M.FOOT_MAX>26,'the carriage rails reach both sides of the line');
 // lift lever: flat and heel-up are fair (toes on the ground), off the ground is a foul; it lifts the BACK foot
 assert.equal(j({lift:1}).fair,true,'heel up, toes down is fair');assert.deepEqual(j({lift:2}).fouls,['ground']);
 assert.equal(M.backFoot({...F,footL:-10,footR:5}),'L');assert.equal(M.backFoot({...F,footL:10,footR:-5}),'R');
 const flat=M.joints(F),heel=M.joints({...F,lift:1}),up=M.joints({...F,lift:2}),b=M.backFoot(F);
 assert.equal(heel['toe'+b][2],flat['toe'+b][2],'heel up: the toes stay down');assert.ok(heel['heel'+b][2]>flat['heel'+b][2]+5,'heel up: the heel rises');
 assert.ok(up['toe'+b][2]>flat['toe'+b][2]+8&&up['heel'+b][2]>flat['heel'+b][2]+8,'off the ground: the whole foot rises');
 // hands switch
 assert.deepEqual(j({hands:1}).fouls,['hands']);const one=M.joints({...F,hands:1});assert.ok(one.haL[2]<one.pelvis[2]+20,'one hand: the other arm drops to the side');
 // arm knob: its green arc starts where the ball is above and behind the head, measured on the figure
 assert.ok(M.OVER_FROM>.3&&M.OVER_FROM<1);assert.equal(M.overHead({...F,arm:M.OVER_FROM}),true);assert.equal(M.overHead({...F,arm:M.OVER_FROM-.02}),false);
 const chest=M.joints({...F,arm:0}),back=M.joints({...F,arm:1});assert.ok(chest.ball[2]<chest.head[2]&&chest.ball[1]>chest.head[1],'knob at 0: ball in front of the chest');
 assert.ok(back.ball[2]>back.head[2]&&back.ball[1]<back.head[1],'knob at 1: ball behind and over the head');
 assert.deepEqual(j({arm:.2}).fouls,['over']);
 // every reason, in the order of the four flags; the start setting is foul three ways
 assert.deepEqual(M.judge({footL:40,footR:40,lift:2,hands:1,arm:0}).fouls,['feet','ground','hands','over']);
 assert.deepEqual(M.judge(M.START_RIG).fouls,['feet','hands','over'],'the trainer starts foul, the kid fixes it');
 for(const c of M.CHECKS)assert.ok(M.REASON[c].length>15&&M.CHECK_NAME[c]);
 assert.equal(M.afterFoul(),'other team');assert.equal(M.throwTo('red'),'blue');assert.equal(M.directIntoGoal('theirs'),'goal kick');assert.equal(M.directIntoGoal('ours'),'corner kick');
 // the knob drawing maps both ways
 for(const a of [0,.25,.5,.75,1]){const rad=(-135+a*270)*Math.PI/180;assert.ok(Math.abs(R.armFromDial(rad)-a)<1e-9);}
 assert.match(rig,/data-flag=\{c\} data-up=\{bad\|\|undefined\}/,'a flag flips up per failed check');assert.match(rig,/data-lamp=\{fair\?'fair':'foul'\}/);assert.match(rig,/data-whistle=\{fair\?'down':'up'\}/);
 assert.match(exp,/const verdict=judge\(rig\)/,'the referee judges every change at once');
 console.log('PASS controls: foot carriages (12 cm line, part of the foot), lift lever (heel up fair, off the ground foul), hands switch, arm knob arc measured on the figure; flags, lamp, whistle');}

// 3. The throw: aim dial, power slide, team-mates and defenders on rails.
{assert.equal(M.MIN_GAP,200);for(const r of M.ROUNDS)for(const d of r.defs)assert.ok(Math.hypot(d.x,d.y-M.LINE_W)>=M.MIN_GAP,'every defender 2 m from the thrower');
 const F=M.FAIR_RIG;
 for(const r of M.ROUNDS){const t=r.mates[r.target],s=M.solve(t);assert.ok(Math.abs(s.aim)<=M.AIM_MAX&&s.power>=0&&s.power<=1,r.id+': reachable');
  assert.equal(M.resolve(r,s.aim,s.power,F).result,'caught',r.id+': on target is caught');
  assert.equal(M.resolve(r,s.aim,s.power,{...F,hands:1}).result,'foul',r.id+': a foul throw goes to the other team');
  assert.equal(M.resolve(r,s.aim,Math.min(1,s.power+.45),F).result==='caught',false,r.id+': too hard misses');}
 const free=M.ROUNDS[2],marked=M.solve(free.mates[1]);assert.equal(M.resolve(free,marked.aim,marked.power,F).result,'intercepted','the marked man: intercepted');
 const [lx,ly]=M.landing(0,0);assert.equal(lx,0);assert.equal(ly,M.LINE_W+M.MIN_D);const [x2]=M.landing(30,.5);assert.ok(x2>0,'+ aim goes right along the line');
 assert.ok(M.distanceOf(1)>M.distanceOf(0));assert.ok(M.flightTime(1)>M.flightTime(0));assert.ok(M.lobZ(.5,.5)>M.lobZ(.5,0));
 assert.match(exp,/aim===0\?'Straight':aim<0/);assert.match(exp,/RESULT\.foul\.line/);
 console.log('PASS throw: every round winnable with the aim dial + power slide, too hard misses, the marked man is intercepted, a foul throw goes to the other team, defenders 2 m away');}

// 4. The breakdown: the mannequin pulls apart into four labelled layers.
{assert.deepEqual(R.LAYERS.map(l=>l.id),['feet','body','arms','ball']);for(const l of R.LAYERS)assert.ok(C.LAYER_TEXT[l.id].text.length>10);
 const P=R.projectionFor(390,600,0,40,26),P2=R.projectionFor(390,600,0,40,26,1);assert.ok(P2.scale<=P.scale&&R.projectionFor(1360,640,0,40,26,1).scale<R.projectionFor(1360,640,0,40,26).scale,'apart: the camera makes room');
 const v={rig:M.FAIR_RIG,aim:0,power:.3,zoom:0,explode:1,round:0,phase:'build',fly:null,slide:1,press:0,whistle:0};
 const an=R.anchors(v,P2),an0=R.anchors({...v,explode:0},P2);assert.ok(an.ball[1]<an0.ball[1]-20&&Math.abs(an.feet[1]-an0.feet[1])<1e-6,'the upper layers lift, the feet stay');
 assert.match(exp,/<Slider name="apart" label="Take it apart"/);
 console.log('PASS breakdown: feet, body, arms, hands lift apart with a slider, each labelled with what Law 15 asks');}

// 5. Contract, no emoji, 44 px, heat, reduced motion.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);assert.match(exp,/<PaperRoom id="throw-in"/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((exp.match(/<StartDock /g)||[]).length,1,'ONE start button');assert.doesNotMatch(exp,/<Intro /);
 assert.equal((exp.match(/onComplete=\{onComplete\}/g)||[]).length,1);assert.doesNotMatch(exp,/onComplete(\?\.)?\(/);assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.match(exp,/<StepCheck /);
 for(const h of ['data-phase','data-rig','data-verdict','data-situation','data-result','data-points','data-ti-checks','data-ti-to-pitch','data-ti-go','data-ti-score'])assert.ok(exp.includes(h),'hook '+h);
 const emoji=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
 for(const f of files)assert.doesNotMatch(code(read(dir+f)),emoji,'no emoji or arrow glyphs in '+f);
 for(const t of [...X.EXHIBITS.find(x=>x.id==='throw-in').facts,JSON.stringify(C)])assert.doesNotMatch(t,emoji);
 for(const [w,h] of [[390,560],[1360,640]])for(const zoom of [0,1]){const P=R.projectionFor(w,h,zoom,40,26);
  for(const t of R.hitTargets({rig:M.FAIR_RIG,aim:0,power:.3,zoom,explode:0,round:0,phase:'throw',fly:null,slide:1,press:0,whistle:0},P))assert.ok(t.r>=22,`${t.c} hit target 44 px across at ${w}`);}
 assert.match(rig,/tabIndex=\{0\} role=\{hh\.role\}/,'every control is focusable');assert.match(exp,/ArrowUp/);assert.match(exp,/k==='Enter'\|\|k===' '/);
 assert.match(css,/\.checks li\{[^}]*min-height:44px/);
 for(const f of files.filter(f=>/\.tsx?$/.test(f)))assert.doesNotMatch(read(dir+f),/requestAnimationFrame|setInterval|setTimeout/,'no own loop or timers in '+f);
 assert.match(exp,/usePaperLoop\(dt=>\{[\s\S]*?bump\(\);return more;\},stageRef,reduced\)/,'one shared loop that stops when nothing moves, instant under reduced motion');
 assert.match(css,/prefers-reduced-motion/);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/throw-in/page.tsx')));assert.match(read('components/museum/experiences/index.tsx'),/'throw-in':load\(\(\)=>import\('\.\/throw-in\/Experience'\)\)/);
 console.log('PASS contract: Paper room, Back + Escape, one centred start, hooks, quick check → Ending → onComplete once, no emoji, 44 px targets, keyboard, shared loop, reduced motion, lab + registry');}
console.log('museum-exp-throw-in: all passed');
