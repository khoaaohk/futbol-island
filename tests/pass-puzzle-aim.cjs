// Pass Puzzles: aim anywhere in the goal (Nov 11 2026, lib/passPuzzle/aim.ts). Run: node tests/pass-puzzle-aim.cjs
// 1 plain strokes and every authored route behave exactly as before (baseline captured before the engine change);
// 2 the keeper's reach against a placed shot shrinks with distance and height; 3 top corners beat a centred keeper from a
// clean chance; 4 shots at the keeper are saved; 5 post / bar / over / wide; 6 scatter is monotone in distance, pressure
// and height; 7 determinism and replay parity; 8 the stroke reader; 9 the trade-off; 10 the coaching lines; 11 wiring.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {capture}=require('./fixtures/pass-puzzle-aim-capture.cjs'),ROOT=path.join(__dirname,'..');
const lib=f=>require(path.join(ROOT,'lib','passPuzzle',f));
const A=lib('aim.ts'),{createPuzzle,predict,replay,readStroke}=lib('index.ts'),{geoOf}=lib('physics.ts'),S=lib('sim.ts');
const base={id:'aim-test',pack:'test',title:'Aim',concept:'shooting',brief:{},hint:{},lesson:'',pitch:{halfWidth:30,length:100,goalWidth:7.32},carrier:0,attackers:[{x:0,z:38}],defenders:[],keeper:{x:0,z:49},attempts:3,require:{minPasses:0,finish:'goal'}};
const geo=geoOf(base),HG=geo.halfGoal,BAR=geo.barH;
const scene=(d,o={})=>({...base,...o,attackers:[{x:o.ax??0,z:50-d}]});
const shot=(place,power=.6,x=place?Math.max(-HG+.25,Math.min(HG-.25,place.x)):0)=>{const k={kind:'shot',target:{x,z:50},curl:0,loft:0,power};if(place)k.place=place;return k;};
const play=(sc,k)=>{
 // A kick whose place is flagged `ideal` is struck clean (no scatter): the engine is driven directly, as predict() does, because world.kick() strips the flag.
 if(k.place?.ideal){const ctx=S.makeCtx(sc),s=S.initialState(ctx),types=[],evs=[],emit=e=>{types.push(e.type);evs.push(e);};assert(S.beginKick(s,k));for(let i=0;i<120*12&&s.phase!=='success'&&s.phase!=='fail'&&!(s.phase==='aiming'&&i>5);i++)S.tick(ctx,s,emit);return{s,types,evs,goal:s.phase==='success'};}
 const w=createPuzzle(sc),types=[],evs=[];w.on(e=>{types.push(e.type);evs.push(e);});assert(w.kick(k));for(let i=0;i<120*12&&w.state.phase!=='success'&&w.state.phase!=='fail'&&!(w.state.phase==='aiming'&&i>5);i++)w.step(1/120);return{w,s:w.state,types,evs,goal:w.state.phase==='success'};};
const ideal=p=>({...p,ideal:true});

// 1. Regression: 92 authored routes (heading on and off) and 420 plain strokes at the goal end exactly as they did before.
{const now=capture(),was=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','pass-puzzle-aim-baseline.json'),'utf8'));
 assert(Object.keys(was.routes).length>=90&&Object.keys(was.shots).length>=400,'baseline is wide');
 for(const g of ['routes','shots'])for(const k of Object.keys(was[g]))assert.equal(now[g][k],was[g][k],`${g} ${k} unchanged`);
 assert(Object.values(was.shots).some(v=>v.includes('|success|'))&&Object.values(was.shots).some(v=>v.includes('|fail|save|')),'baseline holds goals and saves');
 // A plain kick carries no placement, no scatter and the old keeper.
 const r=play(scene(12),shot(null,.6,3.2));assert.equal(r.s.flight.aim,undefined);assert.equal(r.s.keeper.high,undefined);assert(r.goal);}

// 2. Keeper reach against a placed shot: shrinks with height (reach and speed), and with distance to the spot.
{assert.equal(A.keeperReachScale(.3),1);assert.equal(A.keeperSpeedScale(.9),1);assert(A.keeperReachScale(2.1)<=.5+1e-9&&A.keeperSpeedScale(2.1)<=.45+1e-9);
 let pr=2,ps=2;for(let y=0;y<=2.6;y+=.1){const r=A.keeperReachScale(y),s=A.keeperSpeedScale(y);assert(r<=pr+1e-12&&s<=ps+1e-12,'monotone in height');pr=r;ps=s;}
 // A straight ball across the keeper at a fixed height: the higher it is, the nearer it must pass to be reached.
 const pathAt=(off,y)=>{const pts=[];for(let k=0;k<40;k++)pts.push(off,y,40+k*.25);return{tick0:0,pts};};
 const farthest=y=>{let best=0;for(let off=0;off<=8;off+=.1)if(S.planKeeperPlaced(pathAt(off,y),0,{x:0,z:49},.2))best=off;return best;};
 const low=farthest(.4),mid=farthest(1.5),top=farthest(2.1);assert(low>mid+.5&&mid>top+.3,`reach by height ${low} ${mid} ${top}`);assert.equal(farthest(2.6),0,'above his hands');
 // The same centred keeper: a corner he saves from far out goes in from close (less time to get across).
 const far=predict(createPuzzle(scene(30)),shot(ideal({x:3.2,y:.5}),.5)).end,near=predict(createPuzzle(scene(10)),shot(ideal({x:3.2,y:.5}),.5)).end;assert.equal(near,'goal');assert.notEqual(far,'goal');
 // Off to one side he leaves the far corner (and the top of it) open and covers the near one.
 const shifted=scene(22,{keeper:{x:2,z:49}});assert.equal(predict(createPuzzle(shifted),shot(ideal({x:-3.2,y:.5}),.5)).end,'goal');assert.equal(predict(createPuzzle(shifted),shot(ideal({x:-3.2,y:2.1}),.5)).end,'goal');assert.notEqual(predict(createPuzzle(shifted),shot(ideal({x:3.2,y:.5}),.5)).end,'goal');}

// 3. Top corners beat a centred keeper from a clean chance, at a range where the low corner no longer does.
{for(const side of [-1,1]){const r=play(scene(16),shot({x:side*3.1,y:2.0},.6));assert(r.goal,'top corner from 16 m, side '+side);assert(r.s.flight.aim.sigma<.3);assert(r.evs.find(e=>e.type==='goal').at.y>1.4,'it went in high');}
 const d=22,low=predict(createPuzzle(scene(d)),shot(ideal({x:3.2,y:.4}),.5)).end,top=predict(createPuzzle(scene(d)),shot(ideal({x:3.2,y:2.1}),.5)).end;assert.notEqual(low,'goal');assert.equal(top,'goal','the top corner is the harder save');
 // and the plain low stroke from there is the same save the low placed shot is
 assert.notEqual(predict(createPuzzle(scene(d)),shot(null,.5,3.2)).end,'goal');}

// 4. Shots at the keeper are saved, low or high.
for(const y of [.5,1.2,2.0])for(const d of [10,16,24]){const r=play(scene(d),shot({x:.3,y},.6));assert(!r.goal,`at the keeper y ${y} from ${d}`);assert(r.types.includes('save')||r.types.includes('parry'),'the keeper touched it');}

// 5. The frame and beyond: post, bar, over, wide (no keeper, struck clean).
{const open=scene(14,{keeper:undefined});
 const post=play(open,shot(ideal({x:HG,y:1.0})));assert(post.types.includes('woodwork'),'post');assert.equal(post.evs.find(e=>e.type==='woodwork').part,'post');assert(!post.goal);
 const bar=play(open,shot(ideal({x:0,y:BAR})));assert.equal(bar.evs.find(e=>e.type==='woodwork')?.part,'bar');assert(!bar.goal);
 const over=play(open,shot(ideal({x:1,y:BAR+.9})));assert.deepEqual([over.goal,over.s.result.reason],[false,'out']);assert(!over.types.includes('woodwork'));assert(over.evs.at(-1).at.y>BAR);
 const wide=play(open,shot(ideal({x:HG+1,y:.8})));assert.deepEqual([wide.goal,wide.s.result.reason],[false,'out']);assert(Math.abs(wide.evs.at(-1).at.x)>HG);
 assert.equal(predict(createPuzzle(open),shot(ideal({x:HG,y:1}))).hitsPost,true,'the preview knows');
 // the player may point off the frame, but only so far
 const c=A.clampPlace(geo,{x:99,y:99});assert.equal(c.x,HG+A.AIM_WIDE);assert.equal(c.y,BAR+A.AIM_OVER);assert.equal(A.clampPlace(geo,{x:0,y:-3}).y,A.AIM_LOW_Y);
 // one woodwork event per knock
 assert.equal(post.types.filter(t=>t==='woodwork').length,1);}

// 6. Scatter: monotone in distance, pressure and height; nothing at all from point-blank and calm; bounded.
{let p=-1;for(let d=0;d<=40;d+=2){const s=A.scatterSigma(d,.3,.8);assert(s>=p);p=s;}
 p=-1;for(let q=0;q<=1.001;q+=.1){const s=A.scatterSigma(15,q,.8);assert(s>p);p=s;}
 p=-1;for(let h=0;h<=1.001;h+=.1){const s=A.scatterSigma(15,.3,h);assert(s>p);p=s;}
 assert.equal(A.scatterSigma(0,0,1),0);assert(A.scatterSigma(200,1,1)<=A.SCATTER_MAX);
 assert(A.scatterSigma(8,0,0)<.03,'a calm low finish from close in is reliable');assert(A.scatterSigma(28,1,1)>.8,'a rushed top corner from far out is not');
 // pressure comes from the nearest defender to the shooter
 const at=d=>A.shotPressure([{p:{x:d,z:0}},{p:{x:20,z:0}}],{x:0,z:0});assert.equal(at(5),0);assert.equal(at(1),1);assert(at(2.2)>at(3)&&at(3)>0);assert.equal(A.shotPressure([],{x:0,z:0}),0);
 // the strike lands inside its scatter circle; the unit offsets fill the disc both ways
 let lo=0,hi=0,lf=0,rt=0;for(let i=0;i<200;i++){const u=A.scatterUnit(i,7,-3,i*13);assert(Math.hypot(u.dx,u.dy)<=1+1e-9);if(u.dy<-.3)lo++;if(u.dy>.3)hi++;if(u.dx<-.3)lf++;if(u.dx>.3)rt++;}assert(lo>30&&hi>30&&lf>30&&rt>30,'spread all round');
 const r=play(scene(24,{keeper:undefined,defenders:[{x:1,z:26.5}]}),shot({x:2,y:1.8})),a=r.s.flight.aim;assert(a.pressure>.5&&a.dist>23);assert(Math.hypot(a.x-a.aimX,a.y-a.aimY)<=a.sigma+1e-9);assert(Math.hypot(a.x-a.aimX,a.y-a.aimY)>0);
 assert.equal(A.heightShare(geo,.3),0);assert(Math.abs(A.heightShare(geo,BAR-.25)-1)<1e-9);assert(Math.abs(A.heightOf(geo,1)-(BAR-.25))<1e-9);}

// 7. Determinism: the same state and aim give the same strike, live, again and in a replay; the preview flag is never recorded.
{const sc=scene(20,{defenders:[{x:2,z:31}]}),k=shot({x:-3,y:2.0},.7),a=play(sc,k),b=play(sc,k);assert.deepEqual(a.s,b.s);assert.deepEqual(a.types,b.types);
 const rp=replay(a.w.attemptStart(),a.w.inputs(),1);rp.run();assert.deepEqual(rp.world.state.ball,a.s.ball);assert.equal(rp.world.state.phase,a.s.phase);assert.deepEqual(rp.world.state.flight.aim,a.s.flight.aim);
 const w=createPuzzle(sc);w.kick(shot(ideal({x:-3,y:2.0}),.7));assert.deepEqual(w.inputs()[0].kick.place,{x:-3,y:2.0},'ideal is stripped from a real kick');
 // the preview is the clean strike: no scatter
 const w2=createPuzzle(sc),p1=predict(w2,shot(ideal({x:-3,y:2.0}),.7)),p2=predict(w2,shot(ideal({x:-3,y:2.0}),.7));assert.deepEqual(p1,p2);assert.equal(w2.state.phase,'aiming','predict leaves the world alone');
 // snapshots carry it
 const w3=createPuzzle(sc);w3.kick(k);for(let i=0;i<70;i++)w3.step(1/120);const snap=w3.snapshot(),w4=createPuzzle(sc);w4.restore(snap);for(let i=0;i<600;i++){w3.step(1/120);w4.step(1/120);}assert.deepEqual(w3.state,w4.state);}

// 8. The stroke reader: with a pointed-at spot the stroke is a placed shot; without one it reads exactly as before.
{const w=createPuzzle(scene(14)),b=w.state.ball.p,pts=[];for(let i=0;i<=10;i++)pts.push({x:b.x+3*i/10,z:b.z+16*i/10,t:i*.04});
 const plain=readStroke(pts,w),again=readStroke(pts,w,{});assert.deepEqual(plain,again);assert.equal(plain.kind,'shot');assert.equal(plain.place,undefined);
 const placed=readStroke(pts,w,{place:{x:-3.3,y:2.1}});assert.equal(placed.kind,'shot');assert.deepEqual(placed.place,{x:-3.3,y:2.1});assert.equal(placed.loft,0);assert.equal(placed.receiver,undefined);assert(Math.abs(placed.target.x)<=HG-.25);
 const pass=[];for(let i=0;i<=10;i++)pass.push({x:b.x-8*i/10,z:b.z+2*i/10,t:i*.04});assert.equal(readStroke(pass,w,{place:{x:0,y:1.5}}).kind,'shot','a pointed-at spot always shoots');
 assert.equal(readStroke(pts,w,{place:{x:0,y:9}}).place.y,BAR+A.AIM_OVER);assert.equal(readStroke(pts,w,{place:{x:NaN,y:1}}).place,undefined);}

// 9. The trade-off (the lesson): from close and calm any corner is safe; far out under pressure the top corner often misses,
//    while low into the corner still goes in.
{const spots=[];for(let i=0;i<30;i++)spots.push({x:(i%2?1:-1)*(HG-.35-.01*(i%5)),y:BAR-.4-.012*(i%7)});
 const rate=(sc,list)=>list.filter(p=>play(sc,shot(p,.8)).goal).length/list.length;
 const calm=scene(9,{keeper:undefined}),rushed=scene(27,{keeper:undefined,defenders:[{x:-.8,z:22.4}]});
 assert.equal(rate(calm,spots),1,'calm top corners from 9 m all go in');
 const far=rate(rushed,spots);assert(far<.75&&far>.05,'rushed top corners from 27 m miss often, not always: '+far);
 const lows=spots.map(p=>({x:Math.sign(p.x)*(HG-.6),y:.45}));/* half a metre inside the post: still the corner */assert.equal(rate(rushed,lows),1,'low into the corner stays reliable');assert.equal(rate(calm,lows),1);
 // and what the misses look like: over the bar, wide or woodwork
 const misses=spots.map(p=>play(rushed,shot(p,.8))).filter(r=>!r.goal);for(const r of misses)assert(r.types.includes('woodwork')||r.s.result?.reason==='out',JSON.stringify([r.types,r.s.result,r.s.flight?.aim,r.s.phase]));}

// 10. The coaching line names what happened.
{const kind=(sc,k)=>{const r=play(sc,k);return A.finishFromEvents(geo,r.evs,sc.keeper?sc.keeper.x:null,r.s.flight?.aim);};
 const open=scene(12,{keeper:undefined});
 assert.equal(kind(scene(10),shot(ideal({x:3.2,y:.5}))).kind,'low-corner');assert.match(kind(scene(10),shot(ideal({x:3.2,y:.5}))).line,/Low into the corner: the keeper could not get down in time/);
 assert.equal(kind(scene(14),shot(ideal({x:-3.1,y:2.05}))).kind,'top-corner');assert.equal(kind(scene(14),shot(ideal({x:.2,y:1}))).kind,'at-keeper');assert.match(kind(scene(14),shot(ideal({x:.2,y:1}))).line,/Too close to the keeper/);
 assert.equal(kind(scene(30),shot(ideal({x:3.2,y:.5}),.5)).kind,'keeper-across');
 assert.equal(kind(open,shot(ideal({x:HG,y:1}))).kind,'post');assert.equal(kind(open,shot(ideal({x:0,y:BAR}))).kind,'bar');assert.equal(kind(open,shot(ideal({x:1,y:BAR+.9}))).kind,'over');assert.equal(kind(open,shot(ideal({x:HG+1,y:.8}))).kind,'wide');
 const stretched=A.finishStory(geo,'out',{x:1,y:3},null,{x:1,y:3,aimX:1,aimY:2.2,sigma:.9,pressure:.8,dist:26});assert.match(stretched.line,/Over the bar: you were stretching/);
 assert.equal(kind(scene(10),shot(null,.6,3.2)).kind,'low-corner','a plain low shot gets its line too');
 assert.equal(A.finishFromEvents(geo,[{type:'kick',kind:'pass-feet',at:{x:0,y:0}},{type:'intercept',at:{x:0,y:0}}],0),null,'passes are not its business');
 for(const y of [true,false])for(const e of ['goal','save','post','bar','out'])for(const at of [{x:3.3,y:.4},{x:3.3,y:2.2},{x:0,y:2.2},{x:0,y:.5},{x:5,y:.5},{x:0,y:3}]){const s=A.finishStory(geo,e,at,0,null,y);assert(s.line.length>10&&s.line.length<=96,'short line: '+s.line);}
 assert.equal(A.aimWord(geo,3.3,2.2),'TOP BINS');assert.equal(A.aimWord(geo,-3.3,.5),'LOW CORNER');assert.equal(A.aimWord(geo,0,BAR+.3),'OVER');assert.equal(A.aimWord(geo,HG+.5,1),'WIDE');}

// 11. Wiring: the arcade points the finger's ray at the goal face, shows the panel on input only, keeps the audio bus and the save key.
{const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),tsx=read('components/games/PassPuzzleGame.tsx'),scn=read('lib/arcade/passPuzzleScene.ts'),aud=read('lib/arcade/passPuzzleAudio.ts'),css=read('components/games/PassPuzzleGame.module.css'),pkg=read('package.json');
 assert.match(scn,/function pickGoal\(clientX:number,clientY:number,bounds\?:DOMRect\)/);assert.match(scn,/pickGoal,toScreen,render,dispose/);assert.match(scn,/puzzle-aim-reticle/);assert.match(scn,/net\.y=Math\.max\(\.5,e\.at\.y\*Y_SCALE\)/,'the net bulges where the ball went in');assert.match(scn,/case 'woodwork':stage\.burst/);
 assert.match(tsx,/const readAim=\(points:StrokePoint\[\],world:PuzzleWorld,st:AimStroke,ideal:boolean\)/);assert.match(tsx,/readAim\(points,world,st,true\)/,'the preview is the clean strike');assert.match(tsx,/readAim\(points,world,st,false\)\.kick/,'the release is the real one');
 assert.match(tsx,/data-aim-panel data-on="false" aria-hidden="true"/);assert.match(tsx,/data-aim-cue/);assert.match(tsx,/aimCue\?:boolean/);assert.match(tsx,/const PROGRESS_KEY='fi2-pass-puzzles-v1'/,'save data stays under the existing key');
 assert.doesNotMatch(tsx.slice(tsx.indexOf('const showAim='),tsx.indexOf('// Pointer: a stroke always starts')),/requestAnimationFrame|setInterval/,'the aim panel has no loop of its own');
 assert.match(tsx,/data-shot-line/);assert.match(tsx,/FINISH_WORD/);assert.match(tsx,/puzzleWoodwork\(ctx,e\.part==='bar'\)/);assert.match(tsx,/puzzleNetHigh\(ctx\)/);
 assert.match(aud,/export function puzzleWoodwork/);assert.match(aud,/export function puzzleNetHigh/);assert.equal((aud.match(/createDynamicsCompressor\(\)/g)||[]).length,1,'one limiter, wired once');
 assert.match(css,/\.aimPanel\{[^}]*pointer-events:none/);assert.doesNotMatch(css.slice(css.indexOf('.aimPanel{'),css.indexOf('.aimCue{')),/animation:/,'the panel does not animate');
 assert.match(pkg,/node tests\/pass-puzzle-aim\.cjs/,'in the test chain');}
console.log('PASS pass-puzzle aim: plain strokes and 92 routes unchanged, spatial keeper, top corners, saves at the keeper, post/bar/over/wide, monotone scatter, determinism, stroke reader, trade-off, coaching lines, wiring');
