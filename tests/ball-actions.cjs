const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math});return mod.exports;}
const {createWalkBall}=load('lib/town/walkBall.ts'),{createRideTricks}=load('lib/town/rideTricks.ts');
let player={x:0,z:0,y:0,yaw:0},hits=0,strikes=0;const env={floor:()=>0,blocked:(x,z)=>z>3&&z<3.1,impact:()=>hits++,strike:()=>strikes++},ball=createWalkBall();
for(let i=0;i<300;i++){player.x+=.1;ball.update(1/60,player,env);assert.ok(Math.hypot(ball.state.x-player.x,ball.state.z-player.z)<.7);}
ball.shoot(player,0);for(let i=0;i<18;i++)ball.update(1/60,player,env);assert.equal(ball.state.mode,'windup');assert.equal(strikes,0);for(let i=0;i<14;i++)ball.update(1/60,player,env);assert.equal(strikes,1);assert.ok(hits>0,'Swept shot hits thin obstacle');assert.ok(ball.state.vz<0,'Shot rebounds');
for(let i=0;i<180;i++)ball.update(1/60,player,env);assert.equal(ball.state.mode,'attached');
ball.juggle(player);let min=10,max=0;for(let i=0;i<100;i++){ball.update(1/60,player,env);min=Math.min(min,ball.state.y);max=Math.max(max,ball.state.y);}assert.ok(max-min>.9);ball.juggle(player);assert.equal(ball.state.mode,'attached');
for(const mode of ['scooter','bike','moped'])for(const action of [0,1]){const trick=createRideTricks();trick.start(mode,action);let motion=0;for(let i=0;i<150;i++){const pose=trick.update(1/60,mode,false);assert.ok(Object.values(pose).every(Number.isFinite));motion+=Object.values(pose).reduce((a,b)=>a+Math.abs(b),0);}assert.ok(motion>1);assert.equal(trick.state.active,false);assert.deepEqual(JSON.stringify(trick.update(1/60,mode,false)),JSON.stringify({lift:0,pitch:0,yaw:0,stand:0,roll:0}));}
console.log('Ball/actions: attached following, windup contact, hard shot swept rebound, auto-return, juggle toggle, six finite tricks and reset passed.');
const tread=(x,z)=>Math.max(0,Math.min(10,Math.floor((74-x)/.4)*.25));
for(const yaw of [-Math.PI/2,Math.PI/2])for(const mode of ['attached','charging','windup']){
 const stairBall=createWalkBall();for(let x=73.8;x>58;x-=.13){const p={x,z:179,y:tread(x,179),yaw};stairBall.reset(p);if(mode==='charging')stairBall.beginCharge(p,yaw);if(mode==='windup')stairBall.shoot(p,yaw);stairBall.update(.016,p,{...env,floor:tread,blocked:()=>false});const b=stairBall.state;for(const [dx,dz] of [[0,0],[.2,0],[-.2,0],[0,.2],[0,-.2]])assert(b.y>=tread(b.x+dx,b.z+dz)+.199,'ball clears stair tread across its footprint');}
}
console.log('PASS stair-ball clearance ascending/descending, attached/charging/windup');
