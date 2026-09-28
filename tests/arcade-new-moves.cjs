const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const tennis=load('lib/games/soccerTennis.ts'),pinball=load('lib/games/soccerPinball.ts'),runner=load('lib/arcade/runnerGame.ts'),strikers=load('lib/arcade/strikerMatch.ts');
for(const hz of [30,60,120]){
 const t=tennis.createTennis();t.phase='rally';t.rally=2;t.bounceAge=.12;Object.assign(t.ball,{x:.1,y:5.2,z:.3,last:'rival',crossed:true,bounces:1,vx:0,vy:0,vz:2});tennis.requestTennisKick(t);tennis.tickTennis(t,1/hz);assert.equal(t.perfectTouches,1,'balanced early bounce rewards timing');assert.match(t.message,/PERFECT/);
 const p=pinball.createPinballState();pinball.launchPinball(p);Object.assign(p.ball,{x:180,y:550,vy:200});assert(pinball.nudgePinball(p));assert(p.ball.vy<0);assert.equal(p.nudges,0);assert(!pinball.nudgePinball(p),'no nudge spam');
 const r=runner.createRunnerGame();runner.runnerJump(r);for(let n=0;n<Math.round(hz*.25);n++)runner.tickRunner(r,1/hz);assert(r.y>.45);assert(runner.runnerShoot(r),'shoot while airborne');assert(r.lastVolley);assert(r.shots.find(s=>s.active).height>.5);assert.equal(r.balls,0,'volley consumes a ball');
 const g=strikers.createStrikerMatch(),s=g.state,i=strikers.strikerInput();for(const p of s.players)if(p.team===1)p.stun=10;i.pass=true;g.step(1/hz,i);i.pass=false;const receiver=s.selected;let queued=false,returned=false;
 for(let n=0;n<hz*4;n++){if(!queued&&Math.hypot(s.players[receiver].x-s.ball.x,s.players[receiver].z-s.ball.z)<3){i.pass=true;queued=true;}g.step(1/hz,i);i.pass=false;if(s.message.startsWith('ONE-TWO')){returned=true;break;}}
 assert(returned,'queued first-time return fires on receipt');assert.equal(s.selected,0,'control returns to the original passer');assert.equal(s.queuedPass,0);assert(s.passes[0]>=1);
}
console.log('PASS new tennis timing, limited pinball nudge, aerial volley, one-two pass at 30/60/120Hz');
