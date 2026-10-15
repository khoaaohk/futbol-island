// free-kick-wall "Free kicks and the wall" (Oct 14 2026 REDO; user: "make it possible to turn knobs and things to make it do
// something … the stadiums did a great job of showing the breakdown of the layers"). The exhibit is now one instrument, the
// FREE-KICK TEST BENCH. Checks: the facts and sources; the rules (9.15 m, the referee's fix, the 1 m rule); every control's effect
// (the power knob, the lift lever, the contact pin, the turntable, the wall's carriage) on the model AND on the drawing (knob angle
// round trip, the lever's tip, the pin, the leg's back-swing); the three walls (over / round / under) each beaten by its own way and
// not by the start setting; the height staff's telltale; the breakdown's five parts; the exhibit contract (one centred start, quick
// check → Ending → onComplete once, no emoji, 44 px, no own loop, reduced motion, lab + registry).
// usage: node tests/museum-exp-free-kick-wall.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const Module=require('node:module'),orig=Module._resolveFilename;
Module._resolveFilename=function(req,...a){if(req.startsWith('@/'))req=path.join(__dirname,'..',req.slice(2));try{return orig.call(this,req,...a);}catch(e){for(const x of ['.ts','.tsx']){try{return orig.call(this,req+x,...a);}catch{}}throw e;}};
require.extensions['.css']=m=>{m.exports=new Proxy({},{get:(_,k)=>String(k)});};
const root=path.join(__dirname,'..'),dir='components/museum/experiences/free-kick-wall/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),M=require('../'+dir+'model.ts'),C=require('../'+dir+'content.ts');
const R=require('../'+dir+'rig-parts.tsx'),B=require('../'+dir+'Bench.tsx');
const files=fs.readdirSync(path.join(root,dir)).filter(f=>/\.(tsx?|css)$/.test(f)),exp=read(dir+'Experience.tsx'),bench=read(dir+'Bench.tsx'),css=read(dir+'fk.module.css');
const shared=['components/museum/experiences/modern/StartDock.tsx','components/museum/experiences/modern/startDock.module.css'].map(read).join('\n');

// 1. Facts and sources.
{const e=X.EXHIBITS.find(x=>x.id==='free-kick-wall');assert.ok(e,'the case exists');
 assert.equal(e.gallery,'skills');assert.equal(e.year,'1872');
 assert.match(e.facts[0],/9\.15 metres \(10 yards\)/);assert.match(e.facts[1],/three or more defenders.*at least 1 metre.*2019/);
 assert.match(e.facts[2],/direct free kick.*indirect.*raises an arm/);assert.match(e.facts[3],/1872, for handball.*1903/);
 assert.ok(e.sources.some(s=>s.url==='https://www.theifab.com/laws/latest/free-kicks/'),'IFAB Law 13 cited');
 for(const s of [...e.sources,...C.SOURCES])assert.match(s.url,/^https:\/\//);
 assert.ok(C.SOURCES.some(s=>/Vanishing_spray/.test(s.url)),'the foam line is cited');
 const hist=C.HISTORY.map(h=>h.tag+' '+h.text).join(' ');for(const k of ['fair catch','1872','1903','6 yards to 10 yards','2014','within a minute','2019','2020s','lying down'])assert.ok(hist.includes(k),'history: '+k);
 assert.match(exp,/exhibit\.facts\.map/);assert.match(exp,/exhibit\.forYourGame/);assert.match(exp,/<summary>Sources<\/summary>/);
 assert.match(C.MODEL_NOTE,/teaching model/);assert.match(exp,/MODEL_NOTE/);
 assert.equal(C.CHECKS.length,3);for(const c of C.CHECKS){assert.ok(c.right>=0&&c.right<c.options.length);assert.ok(c.why.length>20);}
 console.log('PASS facts: Law 13 (9.15 m, 1 m since 2019, direct / indirect), the history (2014 foam, 2020s lying player), sources, model labelled');}

// 2. The rules.
{assert.equal(M.WALL_MIN,9.15);assert.equal(M.ATTACK_GAP,1);assert.ok(M.CREEP<M.WALL_MIN,'the wall starts too close');
 assert.equal(M.wallLegal({dist:8}),false);assert.equal(M.wallLegal({dist:9.15}),true);
 assert.equal(M.refFix({n:4,dist:7.4,aim:-1}).dist,9.15,'the referee moves it back to exactly 9.15 m');assert.equal(M.refFix({dist:12}).dist,12,'further away: left alone');
 const w={n:4,dist:9.15,aim:M.wallAim(4)},g=M.wallGeom(w);assert.ok(Math.abs(Math.hypot(g.c.x-M.SPOT.x,g.c.y-M.SPOT.y)-9.15)<1e-9);
 const a=g.a,lineX=M.SPOT.x+(a.x-M.SPOT.x)*M.SPOT.y/(M.SPOT.y-a.y);assert.ok(Math.abs(lineX-(M.NEAR_POST-.3))<.01,'the wall’s outer end covers the near post');
 const att=M.attackerSpot(w);assert.ok(Math.abs(M.distToWall(att,w)-1)<1e-6,'the breakdown’s attacker stands exactly 1 m away');assert.equal(M.attackerLegal(att,w),true);
 assert.equal(M.attackerLegal({x:g.c.x-g.u.x*.4,y:g.c.y-g.u.y*.4},w),false,'40 cm away: too close');
 assert.match(exp,/rollWheel/);assert.match(exp,/refFix\(w\)/);assert.match(exp,/data-fk-measure/);assert.match(exp,/data-fk-wheel/);
 console.log('PASS rules: the wall creeps in, the wheel measures 9.15 m and the referee moves it back; the wall covers the near post; 1 m from a wall of three or more');}

// 3. Every control does something, on the model and on the drawing.
{const P={origin:[400,300],scale:3,azimuth:54,elevation:38};
 // POWER knob: winds the spring → faster ball, a further back-swing, and the knob's pointer turns (value ↔ angle round trip)
 assert.ok(M.speedOf(1)>M.speedOf(.5)&&M.speedOf(.5)>M.speedOf(0),'more power, more speed');assert.equal(M.kmh(M.speedOf(0)),58);assert.equal(M.kmh(M.speedOf(1)),108);
 assert.ok(M.cockOf(1)>M.cockOf(0),'the leg is pulled back further');
 for(const v of [0,.25,.5,.8,1]){const a=R.knobAngle(B.CTL.power,P,v),k=B.CTL.power,r=k.R*.8,[sx,sy]=require('../components/museum/experiences/anatomy/iso-kit.ts').iso([k.x+Math.sin(a)*r,k.y-Math.cos(a)*r,k.z+7.6],P);
  assert.ok(Math.abs(R.knobValue(k,P,sx,sy)-v)<1e-6,`the knob reads back ${v}`);}
 // LIFT lever: more lift = higher at the wall; the lever's tip moves
 const base={power:.5,lift:8,contact:0,aim:0},w={n:4,dist:9.15,aim:M.wallAim(4),jump:false,lying:false};
 const z=l=>M.atWall(M.flight({...base,lift:l}).pts,w).p.z;assert.ok(z(20)>z(12)&&z(12)>z(6),'more lift, higher over the wall');
 assert.notDeepEqual(B.leverTip(4,'x'),B.leverTip(26,'x'));assert.ok(B.leverTip(26,'x')[0]>B.leverTip(4,'x')[0],'pulled towards you for more lift');assert.ok(B.leverTip(26,'y')[1]>B.leverTip(4,'y')[1]);
 // CONTACT pin: left of the middle curls RIGHT, right of the middle curls LEFT (the Magnus effect); the pin slides
 const end=c=>M.flight({...base,contact:c}).pts.at(-1).x;assert.ok(end(-1)>end(0)+3&&end(1)<end(0)-3,'contact left → curls right; contact right → curls left');
 assert.equal(M.curveOf(-1),1);assert.equal(M.curveOf(1),-1);assert.ok(B.pinAt(1)[1]<B.pinAt(-1)[1],'the pin moves to the kicker’s right');
 // TURNTABLE: aim turns the leg and the line
 assert.ok(M.aimX(10)>M.aimX(0)&&M.aimX(-10)<M.aimX(0),'+ aims right');const f0=B.rigFrame(0).f,f1=B.rigFrame(15).f;assert.ok(Math.hypot(f0[0]-f1[0],f0[1]-f1[1])>.2,'the gantry turns');
 // the wall's carriage: a closer wall is illegal and gets fixed
 assert.ok(M.wallLegal({dist:9.4})&&!M.wallLegal({dist:8.9}));
 // the late curl: the ball bends more in the second half of its flight
 const pts=M.flight({...base,contact:-1}).pts,mid=pts[Math.floor(pts.length/2)],straight=p=>M.SPOT.x+(M.aimX(0)-M.SPOT.x)*p.d/pts.at(-1).d;
 assert.ok(Math.abs(mid.x-straight(mid))<Math.abs(pts.at(-1).x-straight(pts.at(-1)))/3,'most of the bend comes late');
 for(const id of ['power','lift','contact','aim'])assert.match(bench,new RegExp(`<Hit key="${id}" id="${id}"`),'the '+id+' control is a real slider on the bench');
 assert.match(read(dir+'rig-parts.tsx'),/role:'slider',tabIndex:0/);assert.match(exp,/k\.startsWith\('Arrow'\)/,'arrow keys turn the focused control');assert.match(exp,/k==='Enter'\|\|k===' '/,'Enter / Space kicks');
 console.log('PASS controls: power knob (speed, back-swing, angle round trip), lift lever (height at the wall), contact pin (curl direction, late bend), turntable (aim), wall carriage; all focusable sliders with arrow keys');}

// 4. The three walls.
{const seen=new Set();for(const id of M.CHALLENGE_IDS){const w=M.wallFor(id),s=M.kick(M.SOLUTION[id],w);
  assert.equal(s.result,'goal',id+': the solution scores');assert.equal(s.via,M.CHALLENGE[id].via,id+': …its own way');assert.ok(M.passes(id,s));seen.add(s.via);
  assert.equal(M.passes(id,M.kick(M.START,w)),false,id+': the start setting does not beat it');
  assert.ok(s.wallZ!=null,'the telltale records the height at the wall');}
 assert.equal(seen.size,3,'over, round and under');
 const jw=M.wallFor('under'),low=M.kick(M.SOLUTION.under,jw);assert.ok(low.wallZ+M.BALL_R<=M.JUMP,'under: below the jumping wall’s feet');
 assert.equal(M.kick(M.SOLUTION.under,{...jw,jump:false}).result,'blocked','…a standing wall stops it');
 assert.equal(M.kick(M.SOLUTION.under,{...jw,lying:true}).result,'blocked','…and so does a player lying behind it');
 const ow=M.wallFor('over'),hi=M.kick(M.SOLUTION.over,ow);assert.ok(hi.wallZ-M.BALL_R>=M.STAND_TOP,'over: above their heads');
 assert.equal(M.kick({...M.SOLUTION.over,power:1},ow).result,'over','too much power: over the bar');
 assert.equal(M.kick({...M.SOLUTION.round,contact:0},M.wallFor('round')).result==='goal',false,'round: without the curl it misses');
 console.log('PASS walls: over a standing wall, round a jumping wall (needs the curl), under a jumping wall (a standing wall or a lying player stops it)');}

// 5. The breakdown.
{assert.deepEqual([...M.PARTS],['line','players','jump','lying','gap']);for(const p of M.PARTS){assert.ok(C.PART_NAME[p]&&C.PART_TEXT[p].length>40,p);assert.ok(M.APART[p]);}
 assert.equal(M.APART.jump.z,M.JUMP,'apart, the players are up by their jump');
 const a=B.partAnchors({origin:[400,300],scale:3,azimuth:54,elevation:38},M.wallFor('under'),1);for(const p of M.PARTS)assert.ok(a[p].every(Number.isFinite),'anchor '+p);
 assert.match(exp,/data-apart-slider/);assert.match(exp,/data-part-label/);assert.match(exp,/data-part=\{id\}/);assert.match(css,/\.badgeHit\{[^}]*width:44px;height:44px/);
 console.log('PASS breakdown: five parts (foam line, players, jump, lying player, 1 m gap), each named and explained, anchored, slider + labels / badges');}

// 6. Contract, no emoji, 44 px, heat, reduced motion.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);assert.match(exp,/<PaperRoom id="free-kick-wall"/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((exp.match(/<StartDock /g)||[]).length,1,'ONE start button');assert.doesNotMatch(exp,/<Intro /);assert.match(shared,/\.dock\{[^}]*align-items:center[^}]*text-align:center/,'centred');
 assert.match(exp,/<StepCheck /);assert.equal((exp.match(/onComplete=\{onComplete\}/g)||[]).length,1);assert.doesNotMatch(exp,/onComplete(\?\.)?\(/);assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);
 for(const h of ['data-phase','data-wall','data-measured','data-challenge','data-passed','data-last','data-via','data-controls','data-fk-shoot','data-fk-show','data-fk-next','data-fk-score','data-fk-to-kick'])assert.ok(exp.includes(h),'hook '+h);
 const emoji=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{2B00}-\u{2BFF}\u{FE0F}]/u,code=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"`\\])\/\/.*$/gm,'$1');
 for(const f of files)assert.doesNotMatch(code(read(dir+f)),emoji,'no emoji or arrow glyphs in '+f);for(const t of [...X.EXHIBITS.find(x=>x.id==='free-kick-wall').facts,JSON.stringify(C)])assert.doesNotMatch(t,emoji);
 assert.match(read(dir+'Bench.tsx'),/Math\.max\(22,10\*k\)/,'knob hit targets at least 44 px across');assert.match(css,/\.slider input\{[^}]*height:44px/);assert.match(css,/\.wheelHit\{[^}]*width:48px;height:48px/);
 assert.match(read('components/museum/experiences/anatomy/paper.module.css'),/\.btn,\.ghost,\.seg button\{min-height:46px/);assert.match(read('components/museum/experiences/modern/startDock.module.css'),/\.start\{[^}]*min-height:52px/);
 for(const f of files.filter(f=>/\.tsx?$/.test(f)))assert.doesNotMatch(read(dir+f),/requestAnimationFrame|setInterval/,'no own loop in '+f);
 assert.match(exp,/usePaperLoop\([\s\S]*?\},stageRef,reduced\)/,'the shared loop: sleeps off-screen, runs to the end at once under reduced motion');assert.match(exp,/bump\(\);return more;/,'it stops when nothing moves');
 assert.match(exp,/if\(reduced\)\{ex\.current=\{e:1,eT:1\}/,'reduced motion: the wall comes apart at once');assert.match(css,/prefers-reduced-motion/);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/free-kick-wall/page.tsx')));assert.match(read('app/museum-lab/free-kick-wall/page.tsx'),/guardLabRoute\(\)/);
 assert.match(read('components/museum/experiences/index.tsx'),/'free-kick-wall':load\(\(\)=>import\('\.\/free-kick-wall\/Experience'\)\)/);
 console.log('PASS contract: Paper room, Back + Escape, one centred start, data hooks, quick check → Ending → onComplete once, no emoji, 44 px targets, no own loop, reduced motion, lab + registry');}
