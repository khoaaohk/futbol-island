const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const {VENUES,FIELD_SURFACE_Y}=load('lib/town/venues.ts'),{sweepGoalFrame}=load('lib/town/goalCollisions.ts'),{goalFinish}=load('lib/town/goalFinish.ts'),{createWalkBall}=load('lib/town/walkBall.ts'),{MatchSim}=load('lib/town/match/matchSim.ts'),{createLiveBallPhysics}=load('lib/town/liveBallPhysics.ts');
const hit={x:0,y:0,z:0,t:0,nx:0,ny:0,nz:0,part:'post'};let sweeps=0,finishes=0,rebounds=0;
for(const v of VENUES)for(const end of [-1,1]){
 const z=v.z+end*v.length/2,base=(v.elevation||0)+FIELD_SURFACE_Y,top=base+v.goalHeight;
 for(const part of ['left','right','bar']){
  const x=v.x+(part==='bar'?0:(part==='left'?-1:1)*v.goalWidth/2),y=part==='bar'?top:base+.7;
  assert(sweepGoalFrame({x,y,z:z-end*2},{x,y,z:z+end*2},.19,hit,[v]),`${v.id} ${part}: fast shot hits frame`);
  assert.equal(hit.part,part==='bar'?'crossbar':'post');assert(hit.nz*end<-.99,'contact normal reflects toward pitch');sweeps++;
  const b=createWalkBall(),p={x,y:base,z:z-end*2,yaw:end>0?0:Math.PI};b.reset(p);Object.assign(b.state,{mode:'shot',x,y,z:z-end*.7,vx:0,vy:0,vz:end*60});let impacts=0;
  const env={floor:()=>base,blocked:()=>false,impact(){impacts++},strike(){},frame:(a,b)=>sweepGoalFrame(a,b,.2,hit,[v])?hit:null};
  for(let i=0;i<6;i++)b.update(1/120,p,env);
  assert(impacts>0&&b.state.vz*end<0,'walking ball rebounds rather than passing through '+part);rebounds++;
 }
 assert(!sweepGoalFrame({x:v.x,y:base+.7,z:z-end*2},{x:v.x,y:base+.7,z:z+end*2},.19,hit,[v]),'goal mouth remains open');
 assert(!sweepGoalFrame({x:v.x,y:top+.6,z:z-end*2},{x:v.x,y:top+.6,z:z+end*2},.19,hit,[v]),'overbar shot clears the frame');
 for(const corner of [-1,1])for(const range of [6,18]){
  const p={x:v.x,y:base,z:z-end*range,yaw:Math.atan2(corner*.03,end)},target=goalFinish(p,1,[v]);
  assert(target,'goal assist selected');assert((target.x-v.x)*corner>0,'input selects intended corner');
  const ball=createWalkBall();ball.reset(p);ball.shoot(p,p.yaw,1,target);let crossing=null,prev={...ball.state};
  for(let i=0;i<240&&!crossing;i++){
   ball.update(1/120,p,{floor:()=>base,blocked:()=>false,impact(){},strike(){},frame:(a,b)=>sweepGoalFrame(a,b,.2,hit,[v])?hit:null});
   if(prev.mode==='shot'&&(prev.z-z)*end<0&&(ball.state.z-z)*end>=0){const q=(z-prev.z)/(ball.state.z-prev.z);crossing={x:prev.x+(ball.state.x-prev.x)*q,y:prev.y+(ball.state.y-prev.y)*q};}
   prev={...ball.state};
  }
  assert(crossing,`${v.id} powered shot reaches goal`);assert(Math.abs(crossing.x-v.x)<v.goalWidth/2-.2,'inside post');assert(crossing.y>top-.65&&crossing.y<top-.2,'inside upper corner: '+JSON.stringify({id:v.id,crossing,top}));finishes++;
 }
}
assert.equal(goalFinish({x:1000,y:0,z:1000,yaw:0},1,VENUES),undefined,'no goal assist away from pitches');
// Live shots share the frame sweep and high placement, on both attacking ends.
const live=[];
for(const v of VENUES)for(const team of ['gold','blue'])for(const kind of ['goal','post','bar']){
 const s=new MatchSim(47,v.id);s.restart=null;s.goalHold=0;s.possession=team;
 const shooter=Object.values(s.players).find(p=>p.team===team&&!p.isGK),gy=team==='gold'?8:392,end=team==='gold'?-1:1;
 for(const p of Object.values(s.players)){p.x=250;p.y=200;p.vx=p.vy=0;}
 Object.assign(shooter,{x:135,y:gy-end*60});s.ball.owner=shooter.id;
 const xg=Math.max(.05,.34-(60-28)*.0035)*s.T.finish;let n=0;
 s.rng=()=>n++===0?(kind==='goal'?.01:kind==='post'?xg+.03:xg+.09):.3;
 s.doShot(shooter.id);const timeScale=v.id==='futsal'?.48:.32,physics=createLiveBallPhysics(timeScale,v);let peak=0;
 for(let i=0;i<300&&s.goalHold===0&&s.frameContact.serial===0;i++){s.ballLogic(timeScale/120);peak=Math.max(peak,physics.step(s,timeScale/120,!s.ball.owner));}
 if(kind==='goal'){assert(s.goalHold>0,`${v.id} ${team} upper finish scores`);assert(peak+.295>v.goalHeight*.75,'high finish reaches upper net');}
 else{assert(s.frameContact.serial>0,`${v.id} ${team} ${kind} hits frame`);assert.equal(s.frameContact.part,kind==='bar'?'crossbar':'post');assert.equal(s.score.gold+s.score.blue,0,'frame contact is not a goal');assert(Math.abs(s.ball.vx)>1||s.ball.vy*end<0,'live frame hit produces a deflection');}
 live.push({format:v.id,team,kind,peak:+peak.toFixed(2)});
}
// Tactical air balls: cross to an open runner, switch away from an overload, reject a covered landing.
for(const format of ['7v7','9v9','11v11'])for(const kind of ['cross','switch']){
 const s=new MatchSim(61,format),ids=s.goldIds.filter(id=>!s.players[id].isGK),a=s.players[ids[0]],b=s.players[ids[1]];
 s.restart=null;s.stats.time=1;s.nextAerial=0;
 for(const id of s.goldIds)s.players[id].isGK=id!==a.id&&id!==b.id;
 for(const id of s.blueIds)Object.assign(s.players[id],{x:250,y:20,vx:0,vy:0});
 Object.assign(a,{x:35,y:kind==='cross'?90:220,vx:0,vy:0});Object.assign(b,{x:kind==='cross'?135:225,y:kind==='cross'?55:210,vx:0,vy:0});
 if(kind==='switch')for(const [i,id]of s.blueIds.slice(0,2).entries())Object.assign(s.players[id],{x:45+i*10,y:230});
 assert.equal(s.bestAerial(a.id),b.id,format+' identifies '+kind);assert.equal(s.aerialKind,kind);
 s.ball.owner=a.id;s.doLoft(a.id,b.id,kind);assert(s.ball.lofted&&s.lastKick.loft>=3);assert.equal(s.stats[kind==='cross'?'crosses':'switches'],1);assert(s.nextAerial>s.stats.time,'bounded frequency');
 s.nextAerial=0;Object.assign(s.players[s.blueIds[0]],{x:b.x,y:b.y});assert.equal(s.bestAerial(a.id),null,'covered receiving lane rejected');
}
console.log('GAME_ENGINE_UPGRADE_PASS',{sweeps,rebounds,finishes,live});
