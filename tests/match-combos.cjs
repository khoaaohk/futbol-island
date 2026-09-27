// Combos lane (docs/bean-characters/CONTRACT.md): combination plays and rebounds in live matches
// (lib/town/match/combos.ts via the [combos] hooks in matchSim.ts). Covers the rebound path
// (parry → live ball → first-time follow-up), one-two and cut-back sequences, the context rules
// for futsal sole rolls / flick-ups / rainbow flicks, determinism per seed and the view timing.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const {MatchSim}=load('lib/town/match/matchSim.ts');
const C=load('lib/town/match/combos.ts');
const src=fs.readFileSync('lib/town/match/matchSim.ts','utf8');
assert((src.match(/\[combos\]/g)||[]).length>=14,'the sim carries every marked [combos] hook');
/** A queue of rolls for the combos' private RNG (then a fixed tail). */
const rolls=(c,list,tail=.5)=>{let i=0;c.rng=()=>i<list.length?list[i++]:tail;};
/** An empty pitch: every outfield opponent parked far away (deep in their own corner). */
function clearFoes(s,team='blue',x=250,y=null){for(const id of team==='blue'?s.blueIds:s.goldIds){const p=s.players[id];if(p.isGK)continue;Object.assign(p,{x,y:y??(team==='blue'?30:370),vx:0,vy:0});}}
function live(s){s.restart=null;s.goalHold=0;s.windupScale=0;return s;}
const stepUntil=(s,cond,max=3)=>{for(let t=0;t<max;t+=1/60){s.step(1/60);if(cond())return true;}return false;};

// ---- switch ----
C.comboSettings.enabled=false;assert.equal(new MatchSim(3,'7v7').combos,null,'switched off: no combos object, the sim runs unchanged');
C.comboSettings.enabled=true;assert(new MatchSim(3,'7v7').combos,'on by default');

// ---- rebound: parry into the danger zone → live ball → first-time follow-up ----
function reboundScenario(seed,list,cover=false){
 const s=live(new MatchSim(seed,'11v11'));clearFoes(s);s.windupScale=.32; // live pace: the keeper stays down ~.85 real s
 const g=s.players.dgk;Object.assign(g,{x:128,y:14});
 Object.assign(s.players.st,{x:140,y:40,vx:0,vy:0});Object.assign(s.players.lw,{x:90,y:70});Object.assign(s.players.rw,{x:190,y:80});
 if(cover)Object.assign(s.players.dlcb,{x:132,y:30});
 s.possession='gold';s.ball.owner=null;Object.assign(s.ball,{x:128,y:14,vx:-40,vy:-60,height:.4,target:null,intBy:null});s.ballIsShot=false;s.lastFrom='dgk';s.ballFlight=.25;
 rolls(s.combos,list);
 const shots0=s.stats.shots,kicks0=s.kicks;
 s.combos.onParry('dgk','parry');
 return {s,shots0,kicks0};
}
{
 // rolls: danger (.1), land x/y, winner = attacker (.1 < pA), kind = tap-in (.1)
 const {s,shots0,kicks0}=reboundScenario(5,[.1,.5,.5,.1,.1]);
 const c=s.combos,rb=c.rebound;
 assert(rb&&rb.team==='gold'&&rb.gk==='dgk','a parry into the six-yard area opens a rebound for the shooting side');
 assert.equal(rb.winner,'st','the striker who gambled is first to the loose ball');
 assert.equal(s.ball.target,'st','the ball is live and runs to the winner of the race');
 assert(s.kicks===kicks0+1&&s.ball.owner===null,'the rebound is a real ball flight (render arc) and stays in play');
 assert(c.finish&&c.finish.to==='st'&&c.finish.kind==='rebound','a first-time follow-up is armed for him');
 assert(c.pinned('dgk'),'the keeper who parried at full stretch is still on the grass');
 assert(Math.abs(s.ball.y-14)<1&&s.ball.vy>0,'the parry comes back out into the danger zone');
 assert(stepUntil(s,()=>s.stats.shots>shots0),'the follow-up is struck');
 assert(s.ball.owner===null&&s.shotActive||s.goalHold>0,'struck first time: no trap, the ball flies straight at goal');
 assert.equal(c.counts.rebound,1);assert.equal(c.counts.reboundShot,1,'the rebound shot is counted');
 assert.equal(s.lastFrom,'st','the follow-up is his');
 // a decided goal goes in, anything else is snatched wide while the keeper is down (never "saved" by a lying keeper)
 stepUntil(s,()=>s.goalHold>0||!!s.restart,2);
 assert(s.goalHold>0||s.restart&&s.restart.kind==='goalkick','the follow-up is a goal or goes wide for a goal kick');
}
{
 // The defender wins the race: he gets there first, no finish is armed for anyone.
 const {s}=reboundScenario(5,[.1,.5,.5,.99,.1],true);
 assert(s.combos.rebound&&s.combos.rebound.winner&&s.players[s.combos.rebound.winner].team==='blue','a lost race is won by the covering defender');
 assert.equal(s.combos.finish,null,'no follow-up for the defence');
}
{
 // Most parries are pushed wide: a loose ball, no planned finish, the keeper briefly down.
 const {s}=reboundScenario(5,[.9]);
 assert(s.combos.rebound&&s.combos.rebound.winner===null&&s.combos.finish===null,'a wide parry is a scramble with no pre-planned finish');
 assert.equal(s.combos.counts.rebound,0,'only danger-zone parries count as rebounds');
}
{
 // Header and volley rebounds loop up (lofted) and are met at head / knee height.
 const h=reboundScenario(5,[.1,.5,.5,.1,.9]).s;assert(h.ball.lofted&&h.headerBall&&h.aerial&&h.aerial.peak>1.8,'a rebound looping up is a header chance');
 const v=reboundScenario(5,[.1,.5,.5,.1,.6]).s;assert(v.ball.lofted&&!v.headerBall&&v.acrobatic&&v.acrobatic.to==='st','a knee-high rebound is volleyed (the acrobatic finish drives the volley pose)');
}
// Natural matches: rebounds happen, occasionally score, and replay identically per seed.
function runMatch(seed,format,secs){const s=new MatchSim(seed,format),log=[];let rb=null;
 for(let t=0;t<secs*30;t++){s.step(1/30);const r=s.combos.rebound;if(r&&r!==rb){log.push([Math.round(s.stats.time*100),r.team,r.winner,r.gk]);}rb=r;}
 return {s,log};}
{
 const a=runMatch(101,'7v7',180),b=runMatch(101,'7v7',180);
 assert.deepEqual(a.log,b.log,'rebounds replay identically for a seed');
 assert.deepEqual(a.s.combos.counts,b.s.combos.counts,'every combo count replays identically');
 assert.deepEqual(a.s.score,b.s.score);
 const f=runMatch(55,'futsal',120),g=runMatch(55,'futsal',120);assert.deepEqual(f.s.combos.counts,g.s.combos.counts,'futsal is deterministic too');
 let rebounds=0,shots=0,goals=0;
 for(let i=0;i<20;i++){const m=runMatch(300+i*13,i%2?'7v7':'futsal',180).s.combos.counts;rebounds+=m.rebound+m.reboundPost;shots+=m.reboundShot;goals+=m.reboundGoal;}
 assert(rebounds>=20,'rebounds happen in real matches ('+rebounds+' in 20 games)');
 assert(shots>=4&&goals>=1&&goals<shots*.8&&goals<=10,'rebound goals happen occasionally, not every time ('+goals+' goals from '+shots+' follow-ups in 20 games)');
}

// ---- one-two: pass, run beyond the wall, the return is finished first time ----
{
 const s=live(new MatchSim(9,'7v7'));clearFoes(s);s.possession='gold';
 Object.assign(s.players.lm,{x:110,y:95,vx:0,vy:0});Object.assign(s.players.cm,{x:135,y:75,vx:0,vy:0});
 s.ball.owner='lm';s.doPass('lm','cm');assert(s.combination&&s.combination.runner==='lm','the pass opens a wall-pass run');
 stepUntil(s,()=>s.ball.owner==='cm',2);assert.equal(s.ball.owner,'cm','the wall receives');
 Object.assign(s.players.lm,{x:128,y:48});const shots0=s.stats.shots;
 s.doPass('cm','lm');assert.equal(s.stats.combinationReturns,1,'the wall plays it back');
 s.combos.step(0);
 assert(s.combos.finish&&s.combos.finish.to==='lm'&&s.combos.finish.kind==='oneTwo','the runner will finish the return first time');
 assert.equal(s.combos.counts.oneTwo,1);
 assert(stepUntil(s,()=>s.stats.shots>shots0,2),'one-two finished first time');
 assert.equal(s.lastFrom,'lm');assert.equal(s.combos.counts.oneTwoShot,1);
}

// ---- box attack from wide: runners set, then the cut-back to the arriving midfielder ----
function boxScenario(){
 const s=live(new MatchSim(4,'11v11'));clearFoes(s);s.possession='gold';
 Object.assign(s.players.lw,{x:40,y:40,vx:0,vy:-20});Object.assign(s.players.st,{x:128,y:34});Object.assign(s.players.rw,{x:175,y:50});Object.assign(s.players.cm,{x:122,y:52});
 s.ball.owner='lw';Object.assign(s.ball,{x:40,y:36});s.passCd=0;s.hold=0;return s;
}
{
 const s=boxScenario(),c=s.combos;
 rolls(c,[.1,0,0,0,0,0,0]);
 assert.equal(c.onBall('lw',false,'dlb',40),true,'a wide carrier in the final third sets up a box attack');
 assert(c.plan&&c.plan.kind==='box'&&c.plan.near&&c.plan.far,'near-post and far-post runners are picked');
 assert.equal(c.plan.cut,'cm','the midfielder arrives at the penalty spot for the cut-back');
 for(const id of [c.plan.near,c.plan.far,'cm']){const t=c.runTarget(id);assert(t&&Math.abs(t.y-8)<45,'the runners attack the box ('+id+')');}
 const t=c.runTarget('lw');assert(t&&t.y<s.players.lw.y,'the crosser drives on toward the byline');
 const shots0=s.stats.shots;
 assert.equal(c.onBall('lw',false,'dlb',40),true,'with runners in place the ball is delivered');
 assert.equal(s.ball.target,'cm','the cut-back goes BACK to the free midfielder (open, lane clear)');
 c.step(0);
 assert(c.finish&&c.finish.to==='cm'&&c.finish.kind==='cutback','the cut-back is armed for a first-time finish');
 assert.equal(c.counts.cutback,1);assert.equal(c.counts.boxAttack,1);
 assert(stepUntil(s,()=>s.stats.shots>shots0,2),'the arriving midfielder strikes it first time');
 assert.equal(s.lastFrom,'cm');
}
{
 // Far-post header: with the cut-back and near post closed, the high ball to the far post is headed (a jump header, not an acrobatic kick).
 const s=boxScenario(),c=s.combos;rolls(c,[.1,0,0,0,0,0,0]);
 c.onBall('lw',false,'dlb',40);
 const mark=(id)=>{const p=s.players[id];Object.assign(s.players.dcm,{x:p.x+2,y:p.y+1});};
 Object.assign(s.players.dlcb,{x:s.players.cm.x+1,y:s.players.cm.y});mark(c.plan.near);
 Object.assign(s.players[c.plan.far],{x:152,y:34}); // arriving at the far post
 s.windupScale=0;c.onBall('lw',false,'dlb',40);
 assert.equal(s.ball.target,c.plan.far,'the far-post runner is picked');
 c.step(0);
 assert(s.ball.lofted&&s.headerBall&&s.acrobatic===null,'a high far-post cross: a header chance');
 assert(c.finish&&c.finish.kind==='farPost','the header is armed as a first-time finish');
}

// ---- futsal skills only in context ----
function futsal(){const s=live(new MatchSim(8,'futsal'));clearFoes(s);s.windupScale=.48;s.possession='gold';s.passCd=0;return s;}
function faceUp(s,{speed=40,foe=[100,144],carrier=[100,150],foeV=20}={}){Object.assign(s.players.lm,{x:carrier[0],y:carrier[1],vx:0,vy:-speed});s.ball.owner='lm';Object.assign(s.ball,{x:carrier[0],y:carrier[1]-4});Object.assign(s.players.dlm,{x:foe[0],y:foe[1],vx:0,vy:foeV});}
{
 // square in front, close, space behind, running at him → flick-up (or, at pace and rarely, the rainbow)
 let s=futsal();faceUp(s,{speed:20});rolls(s.combos,[.01,.01]);
 const f=s.players.dlm;
 assert.equal(s.combos.onBall('lm',true,'dlm',Math.hypot(f.x-100,f.y-150)),true,'a close defender square in front: the flick-up');
 assert.equal(s.combos.skill.kind,'flickUp','slow approach: flick-up, never the rainbow');
 s=futsal();faceUp(s,{speed:40});rolls(s.combos,[.01,.01]);s.combos.onBall('lm',true,'dlm',6);
 assert.equal(s.combos.skill.kind,'flickUp','a defender lunging in gets the flick-up, not the rainbow');
 s=futsal();faceUp(s,{speed:40,foeV:0});rolls(s.combos,[.01,.01]);s.combos.onBall('lm',true,'dlm',6);
 assert.equal(s.combos.skill.kind,'rainbow','at pace against a flat-footed defender the showpiece rainbow flick can come out');
 const sk=s.combos.skill;assert(sk.contact>sk.start,'the flick waits for the pose\'s ball contact');
 const kicks0=s.kicks;stepUntil(s,()=>s.kicks>kicks0,1);
 assert(s.ball.lofted&&s.ball.owner===null,'at the contact the ball is flicked into the air');
 assert(s.lastKick.goalY<144-5&&s.ball.vy<0,'over the defender, into the space behind him');
 assert(s.aerial&&s.aerial.peak>=2,'the rainbow loops high over his head');
}
{
 // no flick: defender beside/behind, too far, space behind covered, or in his own third
 const ok=(setup,msg)=>{const s=futsal();setup(s);rolls(s.combos,[0,0,0,0]);s.combos.onBall('lm',true,'dlm',Math.hypot(s.players.dlm.x-s.players.lm.x,s.players.dlm.y-s.players.lm.y));assert(!['flickUp','rainbow'].includes(s.combos.skill.kind)||s.combos.skill.serial===0,msg);};
 ok(s=>faceUp(s,{foe:[100,156]}),'no flick over a defender who is behind him');
 ok(s=>faceUp(s,{foe:[112,150]}),'no flick over a defender beside him');
 ok(s=>faceUp(s,{foe:[100,135]}),'no flick when the defender is still 15 u away');
 ok(s=>{faceUp(s);Object.assign(s.players.dcb,{x:100,y:134});},'no flick when a second defender covers the space behind');
 ok(s=>faceUp(s,{carrier:[100,330],foe:[100,324]}),'no skills in his own third');
}
{
 // sole roll: futsal, a presser within reach, not at a sprint → the ball rolls across, away from him
 const s=futsal();Object.assign(s.players.lm,{x:100,y:200,vx:0,vy:0});s.ball.owner='lm';Object.assign(s.players.dlm,{x:106,y:196});
 rolls(s.combos,[.9,.1]); // (the first roll passes on a take-on)
 assert.equal(s.combos.onBall('lm',true,'dlm',7.2),true);assert.equal(s.combos.skill.kind,'soleRoll','shield under pressure with the sole roll');
 const t=s.combos.runTarget('lm');assert(t&&t.x<100,'he rolls it away from the presser\'s side');
 const o=live(new MatchSim(8,'7v7'));clearFoes(o);o.possession='gold';Object.assign(o.players.lm,{x:100,y:200,vx:0,vy:0});o.ball.owner='lm';Object.assign(o.players.dlm,{x:106,y:196});
 rolls(o.combos,[.1]);o.combos.onBall('lm',true,'dlm',7.2);assert.notEqual(o.combos.skill.kind==='soleRoll'&&o.combos.skill.serial>0,true,'the sole roll is a futsal skill');
}
{
 // In real futsal matches every flick / rainbow is taken facing a close defender in front; the rainbow stays rare.
 const P=C.Combos.prototype,orig=P.startLob;let seen=0,bad=0,rainbows=0;
 P.startLob=function(o,f,kind,land){seen++;if(kind==='rainbow')rainbows++;const d=Math.hypot(f.x-o.x,f.y-o.y),ahead=(f.y-o.y)*this.h.dirY(o.team)/d;if(!(d>3&&d<9&&ahead>.6))bad++;return orig.call(this,o,f,kind,land);};
 for(let i=0;i<10;i++){const s=new MatchSim(700+i*31,'futsal');for(let t=0;t<180*30;t++)s.step(1/30);}
 P.startLob=orig;
 assert(seen>=5,'flicks happen in futsal matches ('+seen+' in 10 games)');
 assert.equal(bad,0,'every flick is taken over a close defender square in front');
 assert(rainbows<=6,'the rainbow flick stays an occasional showpiece ('+rainbows+' in 10 games)');
}

// ---- view: skill poses timed to the sim's ball contact ----
{
 // flick-up: lane B's signature move pose, its contact on the sim's flick
 const s=futsal();faceUp(s,{speed:20});rolls(s.combos,[.01,.9]);s.combos.onBall('lm',true,'dlm',6);
 const v=C.createComboView(),m={};v.consume(s,0);v.apply('lm',m,0);
 assert(m.move&&m.move.kind==='flickUp'&&m.skill===undefined,'the flick-up runs lane B\'s signature pose');
 const T=C.SKILL_TIMING.flickUp,rate=s.windupScale;
 v.consume(s,(s.combos.skill.contact-s.stats.time)/rate);m.move=undefined;v.apply('lm',m,0);
 assert(Math.abs(m.move.progress-T.contact)<1e-6,'the pose reaches its ball contact exactly when the sim flicks the ball');
 v.consume(s,T.seconds);m.move=undefined;v.apply('lm',m,0);assert.equal(m.move,undefined,'the pose ends');
}
{
 // rainbow: the skill-moves lane's rainbowFlick, heel flick timed to the sim's launch; the ball follows its authored path
 const {SKILL_MOVES}=load('lib/graphics/skillMoves.ts');
 const s=futsal();faceUp(s,{speed:40,foeV:0});rolls(s.combos,[.01,.01]);s.combos.onBall('lm',true,'dlm',6);
 const v=C.createComboView(),m={};v.consume(s,0);v.apply('lm',m,.3);
 assert(m.skill&&m.skill.type==='rainbowFlick','the rainbow flick drives PlayerMotion.skill');
 assert.equal(C.SKILL_TIMING.rainbow.seconds,1.3,'a quicker live rainbow (1.3 s, the lab plays it over '+SKILL_MOVES.rainbowFlick.seconds+' s)');
 const lead=(s.combos.skill.contact-s.stats.time)/s.windupScale;
 assert(Math.abs(lead-C.SKILL_TIMING.rainbow.contact*C.SKILL_TIMING.rainbow.seconds)<1e-9,'the sim flicks the ball at the pose\'s heel-flick contact');
 v.consume(s,lead*.5);v.apply('lm',m,.3);assert(m.skill.progress>0&&m.skill.progress<C.SKILL_TIMING.rainbow.contact,'mid build-up');
 assert(Math.abs(m.facing-.3)<.2&&m.turnSmoothing===30,'he keeps the heading the move started in');
 const ball={x:9,y:.19,z:9};v.ball('lm',ball,{x:0,z:0},1);assert(Math.hypot(ball.x,ball.z)<.6&&ball.y>.19,'the ball rolls up the back of his leg, at his feet (not the old dribble spot)');
 const j={jump:{progress:.4,height:.3},reaction:'header',kick:.5};v.settle(j);assert.equal(j.kick,undefined,'a jumping header has no leg swing on top');
}
{
 // 1v1: the sim's knock past the defender is held until the skill's push contact, then released as the sim chose it
 const s=live(new MatchSim(6,'11v11'));clearFoes(s);s.windupScale=.32;s.possession='gold';
 Object.assign(s.players.lw,{x:60,y:150,vx:0,vy:-50});s.ball.owner='lw';Object.assign(s.players.dlb,{x:62,y:142});
 s.touchX=5;s.touchY=-7;s.trapT=s.trapDur=.22;s.recv.id='lw';s.protect=.3;rolls(s.combos,[.4]); // as the sim's knock leaves it
 s.combos.onBeatMan('lw','dlb',1);
 const k=s.combos.skill;assert(['stepover','feint'].includes(k.kind),'a stepover or body feint sells it ('+k.kind+')');
 assert.equal(s.trapT,0,'the knock waits for the pose');
 const t=s.combos.runTarget('lw');assert(t&&Math.hypot(t.x-60,t.y-150)<1,'he stands over the ball meanwhile');
 while(s.stats.time<k.contact-1e-9){s.stats.time+=1/120;s.combos.step(1/120);}
 s.stats.time+=1/120;s.combos.step(1/120);
 assert(s.trapT>0&&s.touchX===5&&s.touchY===-7&&s.recv.id==='lw','at the contact the sim\'s own knock is released');
}
// ---- render: a flagged lofted launch starts where the ball is (keeper's hands / heel), same apex and landing ----
{
 const {createLiveBallPhysics}=load('lib/town/liveBallPhysics.ts');
 const arc=(flag,h0Before)=>{
  const phys=createLiveBallPhysics(.32),sim={kicks:0,lastKick:{height:0,loft:0,dur:0,shotHeight:0,fromY:0,goalY:0,aimX:135},ball:{height:h0Before,owner:null},frameContact:{serial:0},shotActive:false,goalHold:0,combos:{launchLift:{kicks:-1,h:0}}};
  sim.kicks=1;sim.lastKick.height=h0Before;phys.step(sim,.01,true); // a driven ball rising toward h0Before
  for(let i=0;i<200&&phys.height<h0Before*.97;i++)phys.step(sim,.005,true);
  const before=phys.height;
  sim.kicks=2;Object.assign(sim.lastKick,{height:0,loft:1.6,dur:.5});if(flag!==undefined){sim.combos.launchLift.kicks=2;sim.combos.launchLift.h=flag;}
  const hs=[];for(let t=0;t<.5-1e-9;t+=.005){phys.step(sim,.005,true);hs.push(phys.height);}
  return {before,first:hs[0],peak:Math.max(...hs),landIdx:hs.findIndex((h,i)=>i>5&&h<.02)};
 };
 const plain=arc(undefined,.7),keep=arc(NaN,.7),heel=arc(.23,.7);
 assert(plain.first<.1,'an ordinary loft still starts on the grass');
 assert(Math.abs(keep.first-keep.before)<.1,'a parried rebound leaves from where the ball was (the keeper\'s hands): no dip');
 assert(Math.abs(heel.first-.23)<.08,'the rainbow leaves from the heel');
 for(const a of [plain,keep,heel])assert(Math.abs(a.peak-1.6)<.03,'the apex is the sim\'s');
 assert(Math.abs(keep.landIdx-plain.landIdx)<=3&&Math.abs(heel.landIdx-plain.landIdx)<=3,'and it lands when the sim says');
}
// ---- batch 2 moves (docs/player-moves/MOVES.md § F) ----
{
 // 1v1: context picks the version of the move (no extra roll): cuts, a fake shot in range, a nutmeg on a close square defender.
 const beat=(r,setup)=>{const s=live(new MatchSim(6,'11v11'));clearFoes(s);s.windupScale=.32;s.possession='gold';setup(s);s.ball.owner='lw';s.touchX=5;s.touchY=-7;s.trapT=s.trapDur=.22;s.recv.id='lw';rolls(s.combos,[r]);s.combos.onBeatMan('lw','dlb',1);return s.combos.skill.kind;};
 const far=s=>{Object.assign(s.players.lw,{x:60,y:250,vx:0,vy:-60});Object.assign(s.players.dlb,{x:70,y:240});};
 assert.equal(beat(.65,far),'insideCut','a cut: the inside of the foot');assert.equal(beat(.75,far),'outsideCut','and half of them with the outside');
 assert.equal(beat(.5,far),'feint','a feint far from goal stays a feint');
 const shoot=s=>{Object.assign(s.players.lw,{x:128,y:80,vx:0,vy:-50});Object.assign(s.players.dlb,{x:130,y:70});};
 assert.equal(beat(.5,shoot),'fakeShot','a feint in shooting range with the defender in the way becomes a fake shot');
 const tight=s=>{Object.assign(s.players.lw,{x:60,y:250,vx:0,vy:-50});Object.assign(s.players.dlb,{x:61,y:242});};
 assert.equal(beat(.35,tight),'nutmeg','a stepover against a close, square defender becomes a nutmeg');assert.equal(beat(.42,tight),'stepover','otherwise the stepover');
 for(const k of ['insideCut','outsideCut','fakeShot','nutmeg'])assert(C.SKILL_MOVE[k]===k&&C.SKILL_TIMING[k].contact>0&&C.COMBO_KEYS.includes(k),k+': timed and counted');
}
{
 // How a shot is struck and how a keeper distributes (pure picks, render only).
 const g={x:135,y:30};
 assert.equal(C.shotStyle({x:135,y:60},8,g,20,.1,'9v9'),'chipShot','through on a keeper off his line: chip');
 assert.equal(C.shotStyle({x:135,y:60},8,{x:135,y:12},20,.1,'9v9'),null,'a keeper on his line: no chip');
 assert.equal(C.shotStyle({x:140,y:40},8,{x:135,y:10},5,.1,'futsal'),'toePoke','close in with a defender about to block: toe poke');
 assert.equal(C.shotStyle({x:130,y:120},8,{x:135,y:10},30,.1,'11v11'),'knuckleball','a long central shot: knuckleball');
 assert.equal(C.shotStyle({x:130,y:120},8,{x:135,y:10},30,.1,'7v7'),null,'long shots are common in 7v7: only rarely a knuckleball');
 assert.equal(C.shotStyle({x:175,y:50},8,{x:135,y:10},30,.05,'11v11'),'trivela','from a tight angle: trivela');
 assert.equal(C.shotStyle({x:175,y:50},8,{x:135,y:10},30,.25,'11v11'),'finesseShot','or a curl to the far post');
 assert.equal(C.shotStyle({x:135,y:40},8,{x:135,y:10},30,.1,'11v11'),null,'an ordinary central shot stays ordinary');
 assert.equal(C.keeperStyle('pass',40,'7v7'),'keeperRoll');assert.equal(C.keeperStyle('pass',110,'7v7'),'keeperThrow');
 assert.equal(C.keeperStyle('loft',150,'11v11'),'keeperPunt');assert.equal(C.keeperStyle('clear',150,'7v7'),'keeperThrow','no punts in 7v7 (US Youth Soccer)');assert.equal(C.keeperStyle('clear',150,'futsal'),'keeperThrow');
}
{
 // View timing on a scripted match state: the keeper's release lands on the sim's release; a tackle's block on the
 // tackle; the scorer thanks the team-mate who passed to him; a robbed wind-up drops its pose.
 const {SKILL_MOVES}=load('lib/graphics/skillMoves.ts');
 const touches=Array.from({length:8},()=>({serial:0,kind:'receive',id:'',other:null,team:'gold',height:0,speed:0,heavy:false,time:0}));
 const P={g:{id:'g',x:135,y:380,vx:0,vy:0,team:'gold',isGK:true},a:{id:'a',x:125,y:330,vx:0,vy:0,team:'gold'},b:{id:'b',x:150,y:200,vx:0,vy:-40,team:'gold'},k:{id:'k',x:135,y:10,vx:0,vy:0,team:'blue',isGK:true},d:{id:'d',x:150,y:190,vx:0,vy:0,team:'blue'}};
 const sim={windupScale:.32,venue:{id:'9v9',width:45.7,length:73.2},combos:null,players:P,ids:Object.keys(P),ball:{owner:'g'},kickWindup:null,kicks:3,touches,touchSerial:0,stats:{time:0},score:{gold:0,blue:0}};
 const push=(kind,id,other,speed=0)=>{sim.touchSerial++;Object.assign(touches[(sim.touchSerial-1)%8],{serial:sim.touchSerial,kind,id,other,speed});};
 const v=C.createComboView(),m={};v.consume(sim,0);
 sim.kickWindup={id:'g',kind:'pass',to:'a',t:.16,dur:.16,tx:125,ty:330,turn:0};v.consume(sim,1/60);v.apply('g',m,0);
 assert(m.skill&&m.skill.type==='keeperRoll','a short keeper pass is rolled out');assert(v.holds('g'),'the ball is in his hands');
 const lead=.16/.32;for(let t=0;t<lead-1/60-1e-9;t+=1/60)v.consume(sim,1/60);v.apply('g',m,0);
 assert(Math.abs(m.skill.progress-C.KEEPER_RELEASE.keeperRoll)<.03,'the roll lets go as the sim releases ('+m.skill.progress.toFixed(3)+')');
 sim.kickWindup=null;sim.ball.owner=null;sim.kicks++;v.consume(sim,.02);assert(!v.holds('g'),'released');
 // the ball in his hands follows the move's hand path
 {const v2=C.createComboView();v2.consume(sim,0);sim.ball.owner='g';sim.kickWindup={id:'g',kind:'pass',to:'b',t:.2,dur:.2,tx:150,ty:200,turn:0};v2.consume(sim,.02);v2.consume(sim,.2);v2.apply('g',m,0);const ball={x:0,y:1,z:0};v2.ball('g',ball,{x:0,z:0},1,.295);
  assert(v2.skillOf('g').type==='keeperThrow'&&ball.y>1,'a long keeper pass is thrown overarm, the ball held up in the hand');
  v2.consume(sim,.02);sim.kickWindup=null;sim.ball.owner='d';v2.consume(sim,.02);v2.apply('g',m,0);assert.equal(m.skill,undefined,'robbed mid wind-up: no ghost throw');sim.ball.owner=null;}
 // tackle: block (front-on), timed to meet the sim's tackle within .1 s, no ball override
 push('tackle','d','b',5);v.consume(sim,1/60);v.apply('d',m,0);assert(m.skill&&m.skill.type==='blockTackle','a standing tackle front-on is a block tackle');
 assert(m.skill.progress>0,'joined at the lunge');for(let t=0;t<.1;t+=1/60)v.consume(sim,1/60);v.apply('d',m,0);assert(Math.abs(m.skill.progress-SKILL_MOVES.blockTackle.contacts[0].p)<.05,'the block meets the tackle');
 {const ball={x:9,y:.3,z:9};v.ball('d',ball,{x:0,z:0},1,.295);assert(ball.x===9,'the won ball is the sim\'s (its trap eases it to his feet)');}
 push('tackle','d','b',40);v.consume(sim,1/60);assert(v.skillOf('d').progress>.3,'a slide (at pace) stays the choreo slide: no new pose');
 // pass then goal: thank the passer (facing him), else an airplane or knee slide that faces the run
 sim.ball.owner='a';v.consume(sim,.1);sim.ball.owner='b';v.consume(sim,.1);sim.ball.owner=null;push('goal','b',null);sim.score.gold=1;v.consume(sim,.3);v.consume(sim,.2);
 const mm={};v.apply('b',mm,0);assert(mm.skill&&mm.skill.type==='thankPasser','the scorer thanks the team-mate who passed to him');
 for(let t=0;t<1.2;t+=1/60)v.consume(sim,1/60);v.apply('b',mm,0);const toA=Math.atan2((P.a.x-P.b.x)*45.7/250,(P.a.y-P.b.y)*73.2/380);assert(Math.abs(Math.atan2(Math.sin(mm.facing-toA),Math.cos(mm.facing-toA)))<.2,'pointing at the passer');
 push('goal','d',null);sim.score.blue=1;v.consume(sim,.3);v.consume(sim,.2);const md={};v.apply('d',md,0);assert(md.skill&&['airplane','kneeSlide'].includes(md.skill.type)&&md.facing===undefined,'no assist: an airplane or knee slide on his own run');
 for(const k of C.VIEW_MOVES)assert(Number.isFinite(v.counts[k]),k+' counted');
}
{
 // Render arcs: a chip loops over the keeper only on a goal; a knuckleball darts; no style = the old arc.
 const {createLiveBallPhysics}=load('lib/town/liveBallPhysics.ts');
 const run=(style,outcome)=>{const phys=createLiveBallPhysics(.32,{goalHeight:2,goalWidth:6,width:45}),sim={kicks:1,lastKick:{height:.5,loft:0,dur:0,shotHeight:.6,fromY:200,goalY:8,aimX:135},ball:{y:200,height:0,owner:null},frameContact:{serial:0},shotActive:true,goalHold:0,saveOutcome:outcome,combos:null};
  const hs=[],off=[];for(let i=0;i<40;i++){sim.ball.y=200-i*4.8;phys.step(sim,.01,true,style);hs.push(phys.height);off.push(phys.shotOffset);}return {hs,off};};
 const plain=run(null,'goal'),chip=run('chipShot','goal'),saved=run('chipShot','catch'),knuckle=run('knuckleball','goal');
 assert(Math.max(...chip.hs)>Math.max(...plain.hs)+1.2,'the chip loops high over the keeper');assert.deepEqual(saved.hs,plain.hs,'a chip the keeper saves keeps the sim\'s height');
 assert.deepEqual(run(null,'goal').hs,plain.hs,'no style: unchanged');let turns=0;const d=knuckle.off.map((o,i)=>o-plain.off[i]);for(let i=2;i<d.length;i++)if((d[i]-d[i-1])*(d[i-1]-d[i-2])<0)turns++;assert(turns>=2,'the knuckleball darts side to side');
}
// ---- futsal take-on: over the ball until the touch, then away from the defender along the move's exit ----
{
 const s=futsal();Object.assign(s.players.lm,{x:100,y:200,vx:0,vy:-30});s.ball.owner='lm';Object.assign(s.players.dlm,{x:101,y:193,vx:0,vy:0});
 rolls(s.combos,[.9,.1,.4]); // no flick (.9), a take-on (.1), which move (.4)
 assert.equal(s.combos.onBall('lm',true,'dlm',7),true);const k=s.combos.skill;
 assert(['stepover','croqueta','elastico','scissors','feint','fakeShot'].includes(k.kind),'a square defender: a keep-ball skill ('+k.kind+')');assert.equal(s.combos.counts.takeOn,1);
 const hold=s.combos.runTarget('lm');assert(Math.hypot(hold.x-100,hold.y-200)<.5,'over the ball until the touch');assert.equal(s.combos.onBall('lm',true,'dlm',7),true,'no new decision meanwhile');
 while(s.stats.time<k.contact+1e-6){s.stats.time+=1/120;s.combos.step(1/120);}
 const exit=s.combos.runTarget('lm');assert(exit&&Math.hypot(exit.x-100,exit.y-200)>5,'then out along the exit');
 assert(Math.hypot(exit.x-101,exit.y-193)>Math.hypot(100-101,200-193),'away from the defender');
 C.comboSettings.futsalCreative=false;const s2=futsal();Object.assign(s2.players.lm,{x:100,y:200,vx:0,vy:-30});s2.ball.owner='lm';Object.assign(s2.players.dlm,{x:101,y:193});rolls(s2.combos,[.9,.1,.4]);s2.combos.onBall('lm',true,'dlm',7);assert.equal(s2.combos.counts.takeOn,0,'layer off: no take-on');C.comboSettings.futsalCreative=true;
}
// ---- futsal, the creative game: frequency bounds over real matches (combos + view, as fieldRuntime runs them) ----
{
 const run=(creative,seeds)=>{C.comboSettings.futsalCreative=creative;const tot={games:0,goals:0,feed:0,c:{},v:{}};
  for(const seed of seeds){const s=new MatchSim(11+seed*17,'futsal'),v=C.createComboView();let fs0=s.combos.feed.serial;
   for(let t=0;t<5400;t++){s.step(1/30);v.consume(s,(1/30)/s.windupScale);if(s.combos.feed.serial!==fs0){tot.feed++;fs0=s.combos.feed.serial;}}
   tot.games++;tot.goals+=s.score.gold+s.score.blue;for(const [k,n] of Object.entries(s.combos.counts))tot.c[k]=(tot.c[k]||0)+n;for(const [k,n] of Object.entries(v.counts))tot.v[k]=(tot.v[k]||0)+n;}
  C.comboSettings.futsalCreative=true;const g=k=>(tot.c[k]||0)/tot.games,w=k=>(tot.v[k]||0)/tot.games;return {g,w,tot,feed:tot.feed/tot.games};};
 const seeds=[4101,4102,4103,4104],on=run(true,seeds),off=run(false,seeds.slice(0,2));
 const dribbles=['stepover','croqueta','elastico','scissors','feint','roulette','dragBack','cruyff','insideCut','outsideCut','nutmeg','fakeShot','soleRoll'];
 const shots=['toePoke','chipShot','finesseShot','trivela','knuckleball'],sum=(f,ks)=>ks.reduce((a,k)=>a+f(k),0);
 const drib=sum(on.g,dribbles),shot=sum(on.w,shots),creative=drib+sum(on.g,['flickUp','rainbow','shield'])+shot+on.w('backHeel');
 console.log('futsal creative per game:',JSON.stringify({takeOn:on.g('takeOn'),dribbles:+drib.toFixed(2),shotStyles:+shot.toFixed(2),creative:+creative.toFixed(1),feed:on.feed,before:+(sum(off.g,dribbles)+sum(off.w,shots)).toFixed(1)}));
 assert(on.g('takeOn')>=3&&on.g('takeOn')<=10,'futsal take-ons: several a game, not constant ('+on.g('takeOn')+')');
 assert(creative>=18&&creative<=40,'futsal: 3–6 creative moves per real minute (6.25 min a game): '+creative.toFixed(1));
 assert(new Set(dribbles.filter(k=>(on.tot.c[k]||0)>0)).size>=9,'futsal uses the whole dribbling library: '+dribbles.filter(k=>on.tot.c[k]>0).join());
 assert(shot>=4&&new Set(shots.filter(k=>on.tot.v[k]>0)).size>=4,'futsal finishing kit: toe pokes, chips, curls, trivelas, knuckleballs ('+shot+')');
 assert(on.w('toePoke')>=1,'the toe poke is the common futsal finish');
 assert(on.g('rainbow')<=1,'the rainbow flick stays a rare showpiece');
 assert.equal(on.w('keeperPunt'),0,'futsal keepers never punt');assert(on.w('keeperRoll')+on.w('keeperThrow')>=8,'futsal keepers roll and throw it out');
 assert(on.feed<=60,'the teaching feed reads (at most ~10 lines a minute): '+on.feed);
 assert.equal(off.g('takeOn'),0,'futsalCreative off: the batch-2 game (no take-ons)');assert(sum(off.g,dribbles)+sum(off.w,shots)<drib+shot-5,'the creative layer is clearly more creative than before');
 // Grass formats are untouched by the futsal layer.
 C.comboSettings.futsalCreative=false;const a=new MatchSim(31,'7v7');for(let t=0;t<1800;t++)a.step(1/30);C.comboSettings.futsalCreative=true;const b=new MatchSim(31,'7v7');for(let t=0;t<1800;t++)b.step(1/30);
 assert.deepEqual([a.score,a.stats.shots,a.combos.counts],[b.score,b.stats.shots,b.combos.counts],'7v7 is identical with the futsal layer on or off');
}
console.log('match-combos: ok');
