// Futbol Tennis first-touch grades, rival telegraph, wrong-footing, point reasons and event counters.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const t=load('lib/games/soccerTennis.ts');
const advance=(s,seconds,hz=120)=>{for(let i=0;i<Math.round(seconds*hz);i++)t.tickTennis(s,1/hz);};
function receive(ball,you={},extra={}){const s=t.createTennis(47);s.phase='rally';s.rally=3;Object.assign(s,extra);Object.assign(s.you,{x:0,y:5.3,targetX:0,targetY:5.3,vx:0,vy:0},you);Object.assign(s.ball,{vx:0,vy:0,vz:0,last:'rival',crossed:true,bounces:1},ball);t.requestTennisKick(s);t.tickTennis(s,1/120);assert.equal(s.ball.last,'you','fixture kick happened');return s;}
for(const hz of [30,60,120]){
 // 1. Grades name the habit that cost the touch.
 const perfect=t.createTennis();perfect.phase='rally';perfect.bounceAge=.12;Object.assign(perfect.ball,{x:.1,y:5.2,z:.3,vx:0,vy:0,vz:2,last:'rival',crossed:true,bounces:1});t.requestTennisKick(perfect);t.tickTennis(perfect,1/hz);
 assert.equal(perfect.touchGrade,'perfect');assert.equal(perfect.touchSide,'you');
}
assert.equal(receive({x:.25,y:5.2,z:.35},{},{bounceAge:.4}).touchGrade,'good','planted touch after the bounce is good');
assert.equal(receive({x:1.15,y:5.3,z:.3},{},{bounceAge:.4}).touchGrade,'stretched','reaching wide is stretched');
assert.equal(receive({x:.7,y:5.3,z:1.12,bounces:0},{},{bounceAge:9,level:6}).touchGrade,'early','waist-high lunge from the side, before the bounce, is early');
// Chest trap: in line with a chest-high ball, an ordinary touch is cushioned on the chest.
const chest=receive({x:.2,y:5.1,z:1.05,vz:-1,bounces:0},{},{bounceAge:9,level:6}); // court 6: no bounce-wait assist
assert.equal(chest.lastShot,'chest');assert.equal(chest.you.kickStyle,5);assert.equal(chest.touchGrade,'good','an in-line chest trap is graded like other touches, not as early');assert.match(chest.message,/CHEST TRAP/);
assert(chest.ball.vy<0&&t.tennisLanding(chest).y<-1,'the cushioned ball floats back over');
assert(Math.hypot(chest.ball.vx,chest.ball.vy)<Math.hypot(receive({x:.2,y:5.1,z:.45,bounces:1},{},{bounceAge:.4}).ball.vy,1)*1.05,'chest return is softer than a normal drive');
const late=receive({x:.62,y:5.3,z:.2,vz:-1},{},{bounceAge:1.05});assert.equal(late.touchGrade,'late','a ball left to die after the bounce is late');
assert.match(late.message,/LATE/);
// 2. The rival commits before contact; earlier courts commit sooner (a longer, fairer read).
assert(t.tennisCommitRange(1)>t.tennisCommitRange(5)+1,'harder courts disguise the shot longer');
for(const level of [1,5]){
 const s=t.createTennis(9,level);s.phase='rally';s.rally=3;Object.assign(s.you,{x:2.5,y:6.4,targetX:2.5,targetY:6.4});Object.assign(s.rival,{x:0,y:-5.3,targetX:0,targetY:-5.3});
 Object.assign(s.ball,{x:.1,y:-.5,z:1.6,vx:0,vy:-4.5,vz:.4,last:'you',crossed:true,bounces:0});
 let committedAt=null,plan=null,planX=0;const kicks=s.kickCount;
 for(let i=0;i<120*3&&s.kickCount===kicks;i++){t.tickTennis(s,1/120);if(committedAt===null&&s.rivalPlan){committedAt=Math.hypot(s.ball.x-s.rival.x,s.ball.y-s.rival.y);plan=s.rivalPlan;planX=s.rivalPlanX;}}
 assert(committedAt!==null&&s.kickCount>kicks,`court ${level} commits, then plays`);
 assert(committedAt<=t.tennisCommitRange(level)+.06&&committedAt>t.tennisCommitRange(level)-.5,`court ${level} commit distance ${committedAt}`);
 assert.equal(plan,'drop','camping deep invites the planned short ball');
 if(level===1){assert.equal(s.lastShot,'drop','court 1 plays exactly what it telegraphed');assert(Math.sign(t.tennisLanding(s).x)===Math.sign(planX),'and to the side it showed');assert.equal(planX<0,true,'away from you');}
 assert.equal(s.rivalPlan,null,'plan clears at contact');
}
// 3. Wrong-footing: playing against the rival's momentum costs it a visible stumble.
function wrong(aim){const s=t.createTennis(5);s.phase='rally';s.rally=4;s.bounceAge=.4;Object.assign(s.rival,{x:1,y:-5.3,targetX:4,targetY:-5.3,vx:3,vy:0});Object.assign(s.ball,{x:.1,y:5.1,z:.4,vx:0,vy:0,vz:1,last:'rival',crossed:true,bounces:1});t.requestTennisKick(s,aim);t.tickTennis(s,1/120);return s;}
const beaten=wrong(-1),easy=wrong(1);
assert.equal(beaten.wrongFooted,1);assert(beaten.rivalStumble>.4);assert.match(beaten.message,/WRONG-FOOTED/);
assert.equal(easy.wrongFooted,0,'a ball into its running path is not wrong-footing');
const x0=beaten.rival.x;beaten.aiReaction=0;t.tickTennis(beaten,.08);const stumbling=Math.abs(beaten.rival.x-x0);
const x1=easy.rival.x;easy.aiReaction=0;t.tickTennis(easy,.08);assert(stumbling<Math.abs(easy.rival.x-x1)+1e-6,'stumbling rival covers less ground');
// 4. Long rallies speed the rival up (tension), with its contact quality still falling.
function runner(rally){const s=t.createTennis(3);s.phase='rally';s.rally=rally;s.aiReaction=99;Object.assign(s.rival,{x:-3,y:-5.3,targetX:3,targetY:-5.3});Object.assign(s.ball,{x:0,y:3,z:3,vx:0,vy:0,vz:0,last:'rival',crossed:true,bounces:0});s.rival.targetX=3;for(let i=0;i<30;i++){s.rival.targetX=3;t.tickTennis(s,1/120);}return s.rival.x+3;}
assert(runner(10)>runner(0)*1.08,'rally tempo ramps rival speed');
// 5. Point reasons name the football idea.
const net=t.createTennis();net.phase='rally';Object.assign(net.ball,{x:0,y:.01,z:.6,vx:0,vy:-5,vz:0,last:'you',crossed:false});const netEvents=net.netEvents;advance(net,.6);
assert.equal(net.pointKind,'net');assert.equal(net.netEvents,netEvents+1);assert.equal(net.netKind,'net');assert.equal(net.score.rival,1);
const space=t.createTennis();space.phase='rally';space.aiReaction=99;Object.assign(space.ball,{x:3,y:-4,z:.18,vx:0,vy:0,vz:-1,last:'you',crossed:true});const bounces=space.bounceEvents;advance(space,1.2);
assert.equal(space.bounceEvents,bounces+2);assert.equal(space.pointKind,'space');assert.match(space.message,/open space/);
const letgo=t.createTennis();letgo.phase='rally';letgo.aiReaction=99;letgo.rivalLetGo=true;Object.assign(letgo.ball,{x:4.7,y:-7.6,z:.18,vx:0,vy:0,vz:-1,last:'you',crossed:true});advance(letgo,1.2);
assert.equal(letgo.pointKind,'letgo');assert.match(letgo.message,/let it go/);assert.equal(letgo.score.you,1);
// 6. Deterministic, finite, completable with the new layers in place.
const a=t.createTennis(8),b=t.createTennis(8);for(const g of [a,b]){t.beginTennis(g);t.requestTennisKick(g);advance(g,8);}assert.deepEqual(a,b,'seeded simulation stays repeatable');
for(const level of [1,3,5]){const s=t.createTennis(21,level);t.beginTennis(s);for(let i=0;i<120*480&&s.phase!=='over';i++){if(s.phase==='serve')t.requestTennisKick(s);if(s.phase==='rally'&&s.ball.last==='rival'){const l=t.tennisReceivingPoint(s);t.setTennisTarget(s,l.x,l.y);t.requestTennisKick(s);}t.tickTennis(s,1/120);}
 assert.equal(s.phase,'over',`court ${level} completes`);assert(Number.isFinite(s.ball.x+s.ball.y+s.ball.z));}
console.log('PASS tennis touch grades, rival telegraph + commit ramp, wrong-footing, rally tempo, point reasons, event counters');
