const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n==='three'?T:n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math});return m.exports;}
const {createLiveBallPhysics,BALL_RESTITUTION}=load('lib/town/liveBallPhysics.ts'),{MatchSim}=load('lib/town/match/matchSim.ts');
const SCALE=.32,DT=SCALE/60; // one real 60 Hz frame of sim time at live playback speed
const fake=()=>({kicks:0,lastKick:{height:0,loft:0,dur:0},ball:{height:0}});

// 1. A loft is a true parabola with the sim's apex and flight time, lands on the sim's schedule, then bounces and settles.
{
 const sim=fake(),b=createLiveBallPhysics(SCALE);b.step(sim,DT,true);
 sim.kicks++;Object.assign(sim.lastKick,{loft:4.4,dur:.55});
 let peak=0,peakT=0,land=-1,bounces=0,t=0,prev=0;
 for(let i=0;i<600;i++){t+=DT;const h=b.step(sim,DT,true);if(h>peak){peak=h;peakT=t;}if(land<0&&t>.1&&h===0)land=t;if(b.landing>0)bounces++;prev=h;}
 assert(Math.abs(peak-4.4)<.05,'loft apex matches the sim: '+peak);
 assert(Math.abs(peakT-.275)<.01,'apex at mid-flight: '+peakT);
 assert(Math.abs(land-.55)<.01,'lands when the sim lands: '+land);
 assert(bounces>=2,'a landing ball bounces: '+bounces);assert.equal(prev,0,'and settles');
}
// 2. A driven shot rises under the character's gravity to the sim's height, each bounce keeps restitution .53.
{
 const sim=fake(),b=createLiveBallPhysics(SCALE);b.step(sim,DT,true);
 sim.kicks++;Object.assign(sim.lastKick,{height:1,loft:0,dur:0});
 let peak=0,landings=[];for(let i=0;i<900;i++){const h=b.step(sim,DT,true);peak=Math.max(peak,h);if(b.landing>0)landings.push(b.landing);}
 assert(Math.abs(peak-1)<.03,'shot apex is the sim height: '+peak);
 assert(landings.length>=2,'shot bounces');
 assert(Math.abs(landings[1]/landings[0]-BALL_RESTITUTION)<.03,'restitution matches the walking ball: '+landings[1]/landings[0]);
 assert(Math.abs(landings[0]-Math.sqrt(2*13*1))<.25,'impact speed is real gravity (13 m/s2) in real seconds: '+landings[0]);
}
// 3. A held ball follows the sim; a new kick while held never replays later.
{
 const sim=fake(),b=createLiveBallPhysics(SCALE);sim.ball.height=.3;assert.equal(b.step(sim,DT,false),.3);
 sim.kicks++;sim.lastKick.height=1;b.step(sim,DT,false);sim.ball.height=0;let top=0;for(let i=0;i<120;i++)top=Math.max(top,b.step(sim,DT,true));assert(top<=.3+1e-9,'a kick seen while held is consumed (no late launch); the ball just drops: '+top);assert.equal(b.height,0,'and comes to rest');
}
// 4. Rolling turns about the axis perpendicular to travel; the air keeps spin.
{
 const b=createLiveBallPhysics(SCALE),ball=new T.Object3D();b.roll(ball,true);
 for(let i=0;i<10;i++){ball.position.z+=.1;b.roll(ball,true);}
 const top=new T.Vector3(0,1,0).applyQuaternion(ball.quaternion);assert(Math.abs(top.x)<1e-6,'rolling along z turns about x only');
 const angle=2*Math.acos(Math.min(1,Math.abs(ball.quaternion.w)));assert(Math.abs(angle-((1/.19)%(2*Math.PI)))<1e-3||Math.abs(2*Math.PI-angle-((1/.19)%(2*Math.PI)))<1e-3,'rolls distance / radius');
}
// 5. Live sim kicks drive it: heights stay finite and non-negative for a whole match.
{
 const sim=new MatchSim(271,'11v11'),b=createLiveBallPhysics(SCALE);let max=0,kicks=0;
 for(let i=0;i<60*120;i++){sim.step(DT);const h=b.step(sim,DT,!sim.ball.owner);assert(Number.isFinite(h)&&h>=0);max=Math.max(max,h);}
 kicks=sim.kicks;assert(kicks>20,'sim counts launches: '+kicks);assert(max>.4&&max<6,'real arcs in a live match: '+max);
 console.log('LIVE_BALL_PHYSICS_PASS',{kicks,maxHeight:+max.toFixed(2)});
}
// Patterned balls must not spin while stationary/paused; air spin uses elapsed time.
{
 const b=createLiveBallPhysics(SCALE),ball=new T.Object3D();b.roll(ball,true);ball.position.z=.3;b.roll(ball,true);
 const moving=ball.quaternion.clone();b.roll(ball,true);assert(ball.quaternion.equals(moving),'grounded stationary ball stops rotating');
 ball.position.z=.6;b.roll(ball,true);const paused=ball.quaternion.clone();for(let i=0;i<60;i++)b.roll(ball,false,0);assert(ball.quaternion.equals(paused),'paused flight does not spin');
}
// Walk-ball parity (Nov 4 2026): the flight spins with its travel like the walking ball's shot, capped at AIR_SPIN.
{
 const {AIR_SPIN}=load('lib/town/liveBallPhysics.ts'),b=createLiveBallPhysics(SCALE),ball=new T.Object3D();b.roll(ball,true,1/60);
 let last=ball.quaternion.clone(),rate=0;for(let i=0;i<60;i++){ball.position.x+=.05;b.roll(ball,false,1/60);rate=ball.quaternion.angleTo(last)*60;last=ball.quaternion.clone();}
 assert(Math.abs(rate-.05*60/.19)<.5,'air topspin follows travel (3 m/s → 15.8 rad/s): '+rate);
 for(let i=0;i<60;i++){ball.position.x+=1;b.roll(ball,false,1/60);rate=ball.quaternion.angleTo(last)*60;last=ball.quaternion.clone();}
 assert(Math.abs(rate-AIR_SPIN)<1,'a fast drive is capped so it never strobes: '+rate);
}
// Live ball sounds: the walking ball's kick / bounce / receive, volume by speed, consumed silently when unheard.
{
 const {createLiveBallSound,LIVE_BALL_SOUND}=load('lib/town/liveBallSound.ts'),{VENUES,BEACH_VENUE}=load('lib/town/venues.ts');
 const venue=VENUES.find(v=>v.id==='7v7'),sim=new MatchSim(270+41,'7v7'),b=createLiveBallPhysics(SCALE,venue),s=createLiveBallSound(venue,SCALE),heard={kick:0,bounce:0,receive:0},gains=[];
 // Nov 8 2026: the Nov 5 layered one-shots (thump/tick/thud/poke/swish/crowd) also go through `play`. The pass 'tick' is
 // deliberately S.tick*level (0.55 × kick level, ~0.19-0.55) so it sits under the kick, i.e. below `quiet` by design.
 // So [quiet, 1] is checked on the three base sounds only; layers just need a gain in (0, 1].
 const layers=[];const play=(kind,gain)=>{if(kind in heard){heard[kind]++;gains.push(gain);}else layers.push(gain);};
 for(let i=0;i<60*90;i++){sim.step(DT);b.step(sim,DT,!sim.ball.owner);s.update(sim,b.landing,play);}
 assert(heard.kick>10&&heard.receive>5&&heard.bounce>0,'a 7v7 match plays kicks, traps and bounces: '+JSON.stringify(heard));
 assert(gains.every(g=>g>=LIVE_BALL_SOUND.quiet-1e-9&&g<=1),'gains stay in [quiet, 1]');
 assert(layers.length>0&&layers.every(g=>g>0&&g<=1),'layered one-shot gains stay in (0, 1]');
 assert(new Set(gains.map(g=>g.toFixed(2))).size>3,'volume varies with ball speed');
 const before={...heard};for(let i=0;i<60*20;i++){sim.step(DT);b.step(sim,DT,!sim.ball.owner);s.update(sim,b.landing,null);}
 s.update(sim,0,play);assert.deepEqual(heard,before,'touches made while unheard never replay later');
 const posts={n:0};sim.frameContact.serial++;s.update(sim,0,(k,g)=>{if(k==='bounce'&&g===1)posts.n++;});assert.equal(posts.n,1,'a post / bar hit is a full bounce');
 const beach=new MatchSim(7,'beach'),bs=createLiveBallSound(BEACH_VENUE,.48);let gkKick=0;bs.update(beach,0,null);
 for(let i=0;i<60*120;i++){const before=beach.touchSerial;beach.step(.48/60);let gk=false;for(let n=before+1;n<=beach.touchSerial;n++){const ev=beach.touches[(n-1)%beach.touches.length];if(ev.kind==='kick'&&beach.players[ev.id]?.isGK)gk=true;}bs.update(beach,0,k=>{if(gk&&k==='kick')gkKick++;});}
 console.log('LIVE_BALL_SOUND_PASS',heard,{gkKickWhileThrow:gkKick});
}
