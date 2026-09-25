// Role movement + momentum model in lib/town/match/matchSim.ts (docs/body-mechanics/BODY_MECHANICS.md):
// per-role top speed / accel / brake, keeper burst, plants on sharp cuts, backpedal with hysteresis,
// 0..1 outputs for the rig and seeded determinism.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),path=require('node:path');
const cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});cache.set(file,m.exports);return m.exports;}
const {MatchSim,ROLE_MOVEMENT}=load(path.resolve('lib/town/match/matchSim.ts'));
const DT=1/30;
const RM={...ROLE_MOVEMENT};
for(const r of ['gk','def','mid','fwd'])RM[r]={...RM[r]};

// ---- contract shape ----
assert.deepStrictEqual(Object.keys(RM).sort(),['def','fwd','gk','mid']);
for(const [r,v] of Object.entries(RM))for(const k of ['speed','accel','brake','turn','burst'])assert(Number.isFinite(v[k])&&v[k]>0,`${r}.${k} is a positive number`);
assert(RM.fwd.speed>RM.mid.speed&&RM.mid.speed>RM.def.speed,'role top-speed order fwd > mid > def');
assert(RM.def.brake>RM.fwd.brake&&RM.gk.brake>RM.fwd.brake,'defenders and keepers stop harder than forwards');
assert(RM.fwd.turn>RM.mid.turn&&RM.mid.turn>RM.def.turn,'forwards are the most agile, defenders the least');
assert(RM.gk.burst>1&&RM.fwd.burst===1&&RM.mid.burst===1&&RM.def.burst===1,'only the keeper bursts');

// A quiet laboratory: live play, loose ball parked far away, nobody pressing or chasing,
// everyone else holding their spot (targets = position) so only the subject moves.
function lab(format='11v11',seed=5){
 const s=new MatchSim(seed,format);
 s.restart=null;s.goalHold=0;s.ball.owner=null;Object.assign(s.ball,{x:135,y:200,vx:0,vy:0,target:null,intBy:null});
 s.presserId=null;s.chaserIds.clear();
 for(const id of s.ids){const p=s.players[id];p.vx=0;p.vy=0;s.targets[id]={x:p.x,y:p.y};}
 return s;
}
function hold(s,except){for(const id of s.ids)if(!except.includes(id)){const p=s.players[id];s.targets[id]={x:p.x,y:p.y};}}
const speedOf=p=>Math.hypot(p.vx,p.vy);
const players=(s,role)=>s.ids.filter(id=>s.players[id].role===role&&s.players[id].team==='gold');

// ---- top speed: forward > midfielder > defender ----
function topSpeed(role){
 const s=lab(),id=players(s,role)[0],p=s.players[id];
 Object.assign(p,{x:20,y:200,vx:0,vy:0});
 let top=0;
 for(let i=0;i<75;i++){hold(s,[id]);s.targets[id]={x:p.x+60,y:200};s.integrate(DT);top=Math.max(top,speedOf(p));}
 return top;
}
const top={fwd:topSpeed('fwd'),mid:topSpeed('mid'),def:topSpeed('def')};
assert(top.fwd>top.mid&&top.mid>top.def,`top speed fwd ${top.fwd.toFixed(1)} > mid ${top.mid.toFixed(1)} > def ${top.def.toFixed(1)}`);
assert(Math.abs(top.fwd/top.mid-RM.fwd.speed/RM.mid.speed)<.02,'forward/midfield top-speed ratio follows ROLE_MOVEMENT.speed');
assert(Math.abs(top.def/top.mid-RM.def.speed/RM.mid.speed)<.02,'defender/midfield top-speed ratio follows ROLE_MOVEMENT.speed');

// ---- acceleration: a forward winds up quicker than a defender ----
function after(role,steps){const s=lab(),id=players(s,role)[0],p=s.players[id];Object.assign(p,{x:20,y:200,vx:0,vy:0});for(let i=0;i<steps;i++){hold(s,[id]);s.targets[id]={x:p.x+60,y:200};s.integrate(DT);}return speedOf(p);}
assert(after('fwd',4)>after('def',4)*1.1,'forwards accelerate harder than defenders from a standing start');

// ---- keeper burst within 4 u of a live loose ball ----
function gkFirstStep(ballOffset,owned){
 const s=lab();const p=s.players.gk;Object.assign(p,{x:135,y:340,vx:0,vy:0});
 Object.assign(s.ball,{x:135,y:340-ballOffset});if(owned)s.ball.owner='st';
 hold(s,['gk']);s.targets.gk={x:135,y:290};s.integrate(DT);return speedOf(p);
}
const near=gkFirstStep(3),far=gkFirstStep(30),ownedNear=gkFirstStep(3,true);
assert(Math.abs(near/far-RM.gk.burst)<.01,`keeper springs ×${RM.gk.burst} within 4 u of a loose ball (got ×${(near/far).toFixed(3)})`);
assert(Math.abs(ownedNear-far)<1e-9,'no burst when the ball is under control');
{const s=lab();s.restart={kind:'goalkick'};const p=s.players.gk;Object.assign(p,{x:135,y:340,vx:0,vy:0});Object.assign(s.ball,{x:135,y:337});
 // a dead ball (restart) is not a live ball — only integrate is exercised here
 hold(s,['gk']);s.targets.gk={x:135,y:290};s.integrate(DT);assert(Math.abs(speedOf(p)-far)<1e-9,'no burst at a dead-ball restart');}

// ---- braking: defenders stop harder than forwards; brake output reads the stop ----
function stop(role){const s=lab(),id=players(s,role)[0],p=s.players[id];Object.assign(p,{x:60,y:200,vx:70,vy:0});hold(s,[]);s.integrate(DT);return {v:speedOf(p),brake:p.brake,plant:p.plant};}
const sd=stop('def'),sf=stop('fwd');
assert(sd.v<sf.v,`defender sheds more speed in one frame (${sd.v.toFixed(1)} < ${sf.v.toFixed(1)})`);
assert(sd.brake>0&&sd.brake<=1&&sf.brake>0&&sf.brake<=1,'brake output is a 0..1 read of the stop');
assert.equal(sd.plant,0,'a stop on the spot is braking, not a plant');

// ---- plants: sharp cut at speed yes; gentle curve, slow cut and arrival stop no ----
function cut(role,{angle,dist=40,v=70,steps=30}){
 const s=lab(),id=players(s,role)[0],p=s.players[id];Object.assign(p,{x:60,y:200,vx:v,vy:0});
 const a=angle*Math.PI/180;const trace=[];
 for(let i=0;i<steps;i++){hold(s,[id]);
  // the target stays `dist` ahead along the new line (a moving run, not an arrival)
  const tx=p.x+Math.cos(a)*dist,ty=p.y+Math.sin(a)*dist;s.targets[id]={x:tx,y:ty};
  s.integrate(DT);trace.push({plant:p.plant,brake:p.brake,v:speedOf(p),vx:p.vx,vy:p.vy});}
 return trace;
}
for(const role of ['fwd','mid','def']){
 const t=cut(role,{angle:100});
 assert(t[0].plant>=.5,`${role}: a 100° cut at speed plants hard (${t[0].plant.toFixed(2)})`);
 assert(t[0].brake>0,`${role}: the plant reads as braking`);
 const minV=Math.min(...t.map(f=>f.v));
 assert(minV<70*.6,`${role}: the plant bleeds speed before the new line (${minV.toFixed(1)})`);
 const end=t[t.length-1];
 assert(end.v>minV+20&&end.vy>Math.abs(end.vx),`${role}: re-accelerates along the new line`);
 const i6=t.findIndex((f,i)=>i>0&&f.plant===0);
 assert(i6>0&&i6*DT<=.25,`${role}: plant impulse fades in ~0.2 s (${(i6*DT).toFixed(2)} s)`);
 assert.equal(t.filter((f,i)=>f.plant>(i?t[i-1].plant:0)).length,1,`${role}: one impulse, not a chain`);
}
{const f=Math.min(...cut('fwd',{angle:100}).map(x=>x.v)),d=Math.min(...cut('def',{angle:100}).map(x=>x.v));
 assert(d<f,`a defender bleeds more of his speed in a cut than a nimble forward (${d.toFixed(1)} < ${f.toFixed(1)})`);}
assert(cut('mid',{angle:30}).every(f=>f.plant===0),'a gentle 30° curve never plants');
assert(cut('mid',{angle:60}).every(f=>f.plant===0),'60° (under the ~70° threshold) never plants');
assert(cut('mid',{angle:100,v:15}).every(f=>f.plant===0),'a slow change of direction is a step, not a plant');
{const s=lab(),p=s.players.cm;Object.assign(p,{x:100,y:200,vx:70,vy:0});let maxPlant=0,maxBrake=0;
 for(let i=0;i<30;i++){hold(s,['cm']);s.targets.cm={x:96,y:200};s.integrate(DT);maxPlant=Math.max(maxPlant,p.plant);maxBrake=Math.max(maxBrake,p.brake);}
 assert.equal(maxPlant,0,'overshooting a target just behind is an arrival stop, not a plant');
 assert(maxBrake>.5,'…which reads as a hard brake instead');}

// ---- backpedal: engage near, hysteresis 28/36, dwell, face the carrier ----
function defending(){
 const s=lab('11v11',9);const d=s.players.lcb,c=s.players.dst;
 Object.assign(d,{x:100,y:280,vx:0,vy:0});Object.assign(c,{x:100,y:240,vx:0,vy:0});s.ball.owner='dst';Object.assign(s.ball,{x:100,y:238});
 return {s,d,c};
}
function bpStep(s,d,c,back){hold(s,['lcb']);s.presserId=null;s.chaserIds.clear();c.y=d.y-40;s.targets.dst={x:c.x,y:c.y};s.targets.lcb={x:d.x,y:d.y+back};s.integrate(DT);return {bp:d.backpedal,v:speedOf(d),fx:d.faceX,fy:d.faceY};}
{
 const {s,d,c}=defending();const maxV=top.def; // same legs as the top-speed run
 const tr=[];for(let i=0;i<30;i++)tr.push(bpStep(s,d,c,20));
 assert.equal(tr[0].bp,0,'the decision dwells a moment before engaging');
 const on=tr[tr.length-1];
 assert(on.bp>.95,'a defender with the carrier in front and his spot 20 u toward goal backpedals');
 assert(Math.abs(on.fx)<.05&&on.fy<-.99,'…facing the carrier (unit vector up the pitch)');
 assert(Math.max(...tr.slice(12).map(f=>f.v))<=maxV*.62+.5,'backpedal pace is capped at .62 × top speed');
 // hysteresis: 32 u keeps him backpedalling once engaged…
 for(let i=0;i<20;i++){const f=bpStep(s,d,c,32);assert(f.bp>.95,'32 u (inside the 36 u release) keeps the backpedal');}
 // …a one-frame wobble does not flicker the state…
 {const w=bpStep(s,d,c,60);assert(w.bp>.95,'a single-frame wobble does not drop the backpedal');for(let i=0;i<3;i++)assert(bpStep(s,d,c,20).bp>.95);}
 // …and a far recovery target turns him to run at full pace
 const off=[];for(let i=0;i<40;i++)off.push(bpStep(s,d,c,60));
 assert(off[off.length-1].bp===0&&off[off.length-1].fx===0&&off[off.length-1].fy===0,'a recovery run 60 u away releases the backpedal and the facing');
 assert(Math.max(...off.map(f=>f.v))>maxV*.8,'released, he turns and recovers at full speed');
 const bps=off.map(f=>f.bp),drop=bps.findIndex(b=>b<.95);assert(drop>=3,'release waits out the dwell');for(let i=drop+1;i<bps.length;i++)assert(bps[i]<=bps[i-1],'once released the backpedal output ramps out monotonically (no flicker)');
 assert(bps.slice(drop+2).every(b=>b===0),`the released output is gone within ~.07 s (${bps.slice(drop,drop+4).map(b=>b.toFixed(2))})`);
 off.forEach((f,i)=>{if(i>=drop&&f.v>maxV*.62*1.15)assert.equal(f.bp,0,`recovering at ${f.v.toFixed(1)} u/s (over the retreat cap) shows no backpedal`);});
}
{const {s,d,c}=defending();for(let i=0;i<30;i++)assert.equal(bpStep(s,d,c,32).bp,0,'32 u does not ENGAGE the backpedal (28 u on)');}
{const {s,d,c}=defending();s.ball.owner=null;for(let i=0;i<20;i++){hold(s,['lcb']);s.targets.lcb={x:d.x,y:d.y+20};s.integrate(DT);}assert.equal(d.backpedal,0,'no carrier, no backpedal');}
{const {s,d,c}=defending();for(let i=0;i<20;i++){hold(s,['lcb']);s.presserId='lcb';s.targets.dst={x:c.x,y:c.y};s.targets.lcb={x:d.x,y:d.y+20};s.integrate(DT);}assert.equal(d.backpedal,0,'the presser lunges, he never backpedals');}
{const s=lab('11v11',9);const g=s.players.gk,c=s.players.dst;Object.assign(g,{x:135,y:340});Object.assign(c,{x:135,y:300});s.ball.owner='dst';
 for(let i=0;i<20;i++){hold(s,['gk']);s.targets.gk={x:135,y:g.y+15};s.integrate(DT);}assert.equal(g.backpedal,0,'keepers never backpedal');}

// ---- outputs stay in range through real matches; seeded determinism ----
function run(format,seed,seconds){const s=new MatchSim(seed,format);const log=[];let sawPlant=0,sawBack=0,sawBrake=0;
 for(let i=0;i<seconds*30;i++){s.step(DT);
  for(const id of s.ids){const p=s.players[id];
   for(const k of ['brake','backpedal','plant']){assert(Number.isFinite(p[k])&&p[k]>=0&&p[k]<=1,`${format} ${id}.${k}=${p[k]} stays in 0..1`);}
   const fl=Math.hypot(p.faceX,p.faceY);assert(fl===0||Math.abs(fl-1)<1e-6,`${id} facing is a unit vector or zero`);
   if(p.backpedal===0)assert(fl===0,'facing only set while backpedalling');
   if(p.isGK)assert.equal(p.backpedal,0,'keeper never backpedals');
   sawPlant=Math.max(sawPlant,p.plant);sawBack=Math.max(sawBack,p.backpedal);sawBrake=Math.max(sawBrake,p.brake);}
  if(i%15===0)log.push(s.ids.map(id=>{const p=s.players[id];return [p.x,p.y,p.vx,p.vy,p.brake,p.backpedal,p.plant,p.faceX,p.faceY];}));}
 return {log,score:{...s.score},sawPlant,sawBack,sawBrake};}
for(const format of ['futsal','7v7','9v9','11v11']){
 const a=run(format,31,40),b=run(format,31,40);
 assert.deepStrictEqual(a.log,b.log,`${format}: same seed → identical movement and body outputs`);
 assert.deepStrictEqual(a.score,b.score);
 assert(a.sawPlant>=.5&&a.sawBack>.9&&a.sawBrake>.5,`${format}: plants, backpedals and brakes all occur in live play`);
 const c=run(format,32,10);assert.notDeepStrictEqual(c.log,a.log.slice(0,c.log.length),'a different seed plays differently');
}
console.log('role-movement: ok',JSON.stringify({top:Object.fromEntries(Object.entries(top).map(([k,v])=>[k,+v.toFixed(1)])),gkBurst:+(near/far).toFixed(3)}));
