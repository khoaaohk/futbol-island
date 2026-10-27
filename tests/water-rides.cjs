// Rides on the island friends (water P1b, Oct 15 2026; user: "when near a manta ray or whale shark, have a btn that comes up to
// say hang on, on click the drag the character through the water faster"; lib/town/water/animalRides.ts, docs/swimming-research.md
// "P1b implemented"): the prompt text and range, the 10 Hz proximity tick, attach / detach, the speed multipliers, the one-lap
// auto-end, Let go, the real manta / whale-shark hooks (held surfaced on the existing mesh, no new mesh or material), the HUD
// cluster, analytics ids and the Town wiring.
// Run: node tests/water-rides.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,require:id=>id==='three'?T:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const R=load('lib/town/water/animalRides.ts'),W=load('lib/town/water/waterDepth.ts'),H=load('lib/town/water/waterHud.ts');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const near=(a,b,eps,msg)=>assert(Math.abs(a-b)<=eps,`${msg}: ${a} vs ${b}`);

/** A fake friend on a circle of radius `r` round (cx, 0): 96 samples, like a manta loop. */
function circleFriend(kind='manta',r=30,cx=0){const points=[],n=96;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;points.push({x:cx+Math.cos(a)*r,z:Math.sin(a)*r});}
 const lengths=[0];for(let i=1;i<=n;i++){const a=points[i-1],b=points[i%n];lengths.push(lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z));}
 return {kind,id:kind+'-test',points,lengths,total:lengths[n],u:0,available:true,ridden:false,free:false,fx:0,fz:0,fyaw:0,speed:kind==='whale'?.9:1.4,boost:1,bend:0,bendYaw:0};}

ok('the prompt and Let go copy, the range, the speed multipliers and the lesson',()=>{
 assert.equal(R.RIDE_PROMPT,'Hang on!');assert.equal(R.LET_GO_LABEL,'Let go');
 assert.equal(R.RIDE_RANGE,5,'~5 m from the animal');
 assert.equal(R.RIDE_MULT.manta,1.6);assert.equal(R.RIDE_MULT.whale,1.3);
 near(R.rideSpeed('manta'),1.6*W.SWIM_FAST_SPEED,1e-9,'manta = 1.6 × the sprint swim');near(R.rideSpeed('whale'),1.3*W.SWIM_FAST_SPEED,1e-9,'whale shark = 1.3 × the ride baseline');
 assert(R.rideSpeed('manta')>R.rideSpeed('whale')&&R.rideSpeed('whale')>W.SWIM_FAST_SPEED,'both faster than the ride baseline sprint');
 assert(R.RIDE_WAKE.whale>R.RIDE_WAKE.manta&&R.RIDE_WAKE.manta>1.25,'a bigger wake than the sprint swim, biggest behind the whale shark');
 assert.equal(`${R.RIDE_LESSON.title}: ${R.RIDE_LESSON.text[0].toLowerCase()+R.RIDE_LESSON.text.slice(1)}`,/* the toast: the title in bold, then the line */'Ride the wave: a counter-attack is fastest when you move with the play, not against it.');
 assert.equal(R.RIDE_LESSON.kind,'Coaching idea');assert.equal(R.RIDE_LESSON_KEY,'fi2-ride-lesson-v1');
 assert.equal(R.RIDE_TICK,1/W.WATER_PROBE_HZ,'the proximity test runs at the water probe rate');
});

ok('loopPoint walks the loop by arc length and gives the heading as the rig yaw',()=>{
 const sq={points:[{x:0,z:0},{x:10,z:0},{x:10,z:10},{x:0,z:10}],lengths:[0,10,20,30,40],total:40},o={x:0,z:0,yaw:0};
 R.loopPoint(sq.points,sq.lengths,sq.total,5,o);near(o.x,5,1e-9,'x');near(o.z,0,1e-9,'z');near(o.yaw,Math.PI/2,1e-9,'heading +x');
 R.loopPoint(sq.points,sq.lengths,sq.total,25,o);near(o.x,5,1e-9,'x');near(o.z,10,1e-9,'z');near(Math.abs(o.yaw),Math.PI/2,1e-9,'heading −x');
 R.loopPoint(sq.points,sq.lengths,sq.total,45,o);near(o.x,5,1e-9,'wraps past the total');
});

ok('the "Hang on!" prompt range: within 5 m of the body, swimming only, at most 10 times a second',()=>{
 const f=circleFriend('manta',30),rides=R.createAnimalRides(()=>[f]);// the manta starts at (30, 0)
 const edge=30+R.RIDE_BODY.manta+R.RIDE_RANGE;
 assert.equal(rides.scan(1/60,edge+.3,0,true),null,'just out of range: no prompt');
 rides.scan(.2,edge-.3,0,true);assert.equal(rides.state.near,f,'in range: the prompt');near(rides.state.nearDist,R.RIDE_RANGE-.3,1e-6,'distance to the body');
 // Between probe ticks nothing is recomputed (one sample per 0.1 s).
 assert.equal(rides.scan(1/60,edge+20,0,true),f,'the next frame keeps the last pick (10 Hz)');
 assert.equal(rides.scan(.1,edge+20,0,true),null,'the next tick drops it');
 rides.scan(.2,edge-1,0,true);assert.equal(rides.state.near,f);
 assert.equal(rides.scan(1/60,edge-1,0,false),null,'wading / flying / on land: no prompt at all');
 f.available=false;assert.equal(rides.scan(.2,edge-1,0,true),null,'an animal that is not drawn (far island, hot tier) never prompts');f.available=true;
 const w=circleFriend('whale',40,200),both=R.createAnimalRides(()=>[f,w]);
 both.scan(.2,240+R.RIDE_BODY.whale+4,0,true);assert.equal(both.state.near,w,'the whale shark reaches farther (its 13 m body)');
});

const STICK={x:0,z:0},OPEN=()=>true;
ok('attach: the rider is held at the grip point, the animal is FREE (steered) and eases up to 1.6x / 1.3x the sprint swim with the stick pushed',()=>{
 for(const kind of ['manta','whale']){
  const f=circleFriend(kind,30),rides=R.createAnimalRides(()=>[f]),pos={x:30+R.RIDE_BODY[kind],z:0},vel={x:0,z:0};
  rides.scan(.2,pos.x,pos.z,true);const g=rides.grab(W.SWIM_SPEED);
  assert.equal(g.grabbed,kind);assert.equal(rides.riding,true);assert.equal(f.ridden,true,'the graphics module holds the animal');assert.equal(f.free,true,'free mode: the ride owns its pose');
  assert.equal(rides.scan(.2,pos.x,pos.z,true),null,'no prompt while riding');
  const stick={x:0,z:1};// keep pushing along +z (straight on from the start heading, within the turn limit)
  for(let i=0;i<300;i++)rides.step(1/60,pos,vel,{x:Math.sin(f.fyaw),z:Math.cos(f.fyaw)},OPEN,50);
  near(Math.hypot(vel.x,vel.z),R.rideSpeed(kind),.06*R.rideSpeed(kind),kind+' ride speed after 5 s');
  const gr=R.RIDE_GRIP[kind];near(Math.hypot(pos.x-f.fx-Math.sin(f.fyaw)*gr,pos.z-f.fz-Math.cos(f.fyaw)*gr),0,1e-6,kind+' at the grip point of the free animal');
  near(Math.atan2(vel.x,vel.z),f.fyaw,1e-6,'moving along the heading');void stick;
 }
});

ok('free steer: the heading follows the stick at a limited, smooth turn rate; the body rolls into the turn; released = slower, same heading',()=>{
 const f=circleFriend('manta',30),rides=R.createAnimalRides(()=>[f]),pos={x:32.6,z:0},vel={x:0,z:0};rides.scan(.2,pos.x,pos.z,true);rides.grab(3);
 const y0=f.fyaw;let maxTurn=0,maxRoll=0,prev=f.fyaw;
 for(let i=0;i<30;i++){rides.step(1/60,pos,vel,{x:Math.sin(y0+Math.PI/2),z:Math.cos(y0+Math.PI/2)},OPEN,50);maxTurn=Math.max(maxTurn,Math.abs(Math.atan2(Math.sin(f.fyaw-prev),Math.cos(f.fyaw-prev)))*60);prev=f.fyaw;maxRoll=Math.max(maxRoll,Math.abs(rides.state.roll));}
 assert(maxTurn<=R.RIDE_TURN+1e-6,'turn rate limited ('+maxTurn.toFixed(2)+')');assert(maxTurn>.3,'it does turn');assert(maxRoll>.05&&maxRoll<=R.RIDE_ROLL_MAX+1e-9,'leans into the turn');
 for(let i=0;i<240;i++)rides.step(1/60,pos,vel,{x:Math.sin(y0+Math.PI/2),z:Math.cos(y0+Math.PI/2)},OPEN,50);
 near(Math.atan2(Math.sin(f.fyaw-y0-Math.PI/2),Math.cos(f.fyaw-y0-Math.PI/2)),0,.02,'settles on the stick bearing');
 for(let i=0;i<300;i++)rides.step(1/60,pos,vel,STICK,OPEN,50);
 near(Math.hypot(vel.x,vel.z),R.rideSpeed('manta')*R.RIDE_IDLE,.2,'stick released: it cruises slower');near(f.fyaw,y0+Math.PI/2,.02,'and keeps its heading');
});

ok('shore stop: land ahead brakes it to a stop (turning still works), the shallows end the ride, the range edge holds it; the time cap ends a long ride',()=>{
 const f=circleFriend('whale',30),rides=R.createAnimalRides(()=>[f]),pos={x:30+R.RIDE_BODY.whale,z:0},vel={x:0,z:0};rides.scan(.2,pos.x,pos.z,true);rides.grab(3);
 const wall=x=>x<30+R.RIDE_BODY.whale+60&&true;// land from x >= startX + 40 onwards: nothing swimmable there
 const startX=f.fx,ok2=(x,z)=>x<startX+40;
 for(let i=0;i<60*20;i++)rides.step(1/60,pos,vel,{x:1,z:0},ok2,50);// push at the land
 assert.equal(rides.riding,true,'still riding');assert(f.fx<startX+40,'never onto land');assert(Math.hypot(vel.x,vel.z)<.05,'stopped');void wall;
 for(let i=0;i<120;i++)rides.step(1/60,pos,vel,{x:-1,z:0},ok2,50);assert(Math.hypot(vel.x,vel.z)>2,'turned away and swims off again');
 assert.equal(rides.step(1/60,pos,vel,STICK,ok2,R.RIDE_SHORE_D-.1).ended,'shore','clearance under the swim depth ends the ride');
 const g=circleFriend('manta'),r2=R.createAnimalRides(()=>[g]),p2={x:32.6,z:0};r2.scan(.2,p2.x,p2.z,true);r2.grab(1);let ended='',t=0;
 while(!ended&&t<200){ended=r2.step(R.RIDE_DT_MAX,p2,vel,{x:Math.sin(g.fyaw),z:Math.cos(g.fyaw)},OPEN,50).ended;t+=R.RIDE_DT_MAX;if(g.fx*g.fx>1e12)break;}
 assert.equal(ended,'time');near(t,R.RIDE_MAX_TIME,.2,'the ~90 s cap');assert.equal(g.ridden,false);
});

ok('shore kick-off (Oct 24 2026): the hull probe ends the ride before any of the body reaches the sand, straight / 45° / curved / boosted, and the swim back never beaches it',()=>{
 const S2=Math.SQRT1_2,shores={
  straight:S=>[(x,z)=>z>S,{x:30,z:S+10}],
  diagonal:S=>[(x,z)=>(x+z)*S2>S,{x:S*S2+10,z:S*S2+10}],
  headland:S=>[(x,z)=>Math.hypot(x-30,z-(S+20))<20,{x:30,z:S+20}],
  lagoon:S=>[(x,z)=>Math.hypot(x,z)>S,{x:0,z:S+10}]};
 // The stick aims at a point on / behind the shore, offset by a bearing: 0 = head on, .7 rad = oblique, 1.2 rad = a grazing spiral
 // (sliding sideways along the shore), weave = swinging ±.7 rad. A constant offset spirals in, so every run reaches the shore.
 const sticks={head:()=>0,oblique:()=>.7,graze:()=>1.2,weave:t=>.7*Math.sin(t*1.7)};
 let runs=0;
 for(const kind of ['whale','manta'])for(const [sn,mk] of Object.entries(shores))for(const S of [40,55,80])for(const [kn,stick] of Object.entries(sticks))for(const boost of [3,R.rideSpeed(kind)*R.DART_MULT])for(const dt of [1/60,1/24]){
  const [land,aim]=mk(S),f=circleFriend(kind,30),rides=R.createAnimalRides(()=>[f]),pos={x:30+R.RIDE_BODY[kind],z:0},vel={x:0,z:0},h=R.RIDE_HULL[kind];
  const okW=(x,z)=>!land(x,z),tag=`${kind} ${sn} S=${S} ${kn} v0=${boost.toFixed(1)} dt=${dt.toFixed(3)}`;
  const body=()=>{const fx=Math.sin(f.fyaw),fz=Math.cos(f.fyaw),rx=fz,rz=-fx;
   for(const [a,s] of [[h.bow,0],[h.bow*.5,h.side*.8],[h.bow*.5,-h.side*.8],[0,h.side],[0,-h.side],[-h.tail,0]])if(land(f.fx+fx*a+rx*s,f.fz+fz*a+rz*s))return `(${a},${s})`;return '';};
  rides.scan(.2,pos.x,pos.z,true);assert.equal(rides.grab(boost).grabbed,kind);
  let ended='',t=0,ev=null,slow=0;
  while(!ended&&t<R.RIDE_MAX_TIME-1){const d=(++slow%97===0)?.25:dt;/* now and then a slow frame */const b=Math.atan2(aim.x-f.fx,aim.z-f.fz)+stick(t),e=rides.step(d,pos,vel,{x:Math.sin(b),z:Math.cos(b)},okW,50,land);t+=d;
   const hit=body();assert.equal(hit,'',`${tag}: body sample ${hit} on land at t=${t.toFixed(2)}`);if(e.ended){ended=e.ended;ev={...e};}}
  assert.equal(ended,'shore',`${tag}: the ride ends at the shore`);
  assert(!land(ev.x,ev.z),`${tag}: the rider is in the water`);
  const nose=h.bow+h.margin*.5;assert(!land(f.fx+Math.sin(f.fyaw)*nose,f.fz+Math.cos(f.fyaw)*nose),`${tag}: kicked off before the nose (+${(h.margin*.5).toFixed(2)} m) reaches the sand`);
  for(const k of [1,2,3])assert(!land(ev.x+Math.sin(ev.yaw)*k,ev.z+Math.cos(ev.yaw)*k),`${tag}: tossed into the water, not onto land`);
  assert(ev.speed<=R.RIDE_SHORE_TOSS_V+1e-9,`${tag}: a small toss`);
  let r=0;while(rides.darting&&r<30){rides.dartStep(dt);r+=dt;if(f.free){const hit2=body();assert.equal(hit2,'',`${tag}: swim back beached at ${hit2} t=${r.toFixed(2)}`);}}
  runs++;
 }
 assert(runs>=2*4*3*4*2*2,'all the runs');
 // Range edge (not land): no `land` test, the old hold still applies (covered by "shore stop"); a land test that never hits never ends it.
 const f=circleFriend('whale',30),rides=R.createAnimalRides(()=>[f]),pos={x:36,z:0},vel={x:0,z:0};rides.scan(.2,pos.x,pos.z,true);rides.grab(3);
 for(let i=0;i<600;i++)assert.equal(rides.step(1/60,pos,vel,STICK,OPEN,50,()=>false).ended,'','open sea: no kick-off');
});

ok('exit: Let go swims the animal back to its loop and hands over without a pop; the swimmer is untouched',()=>{
 for(const kind of ['manta','whale']){
  const f=circleFriend(kind,30),rides=R.createAnimalRides(()=>[f]),pos={x:30+R.RIDE_BODY[kind],z:0},vel={x:0,z:0};rides.scan(.2,pos.x,pos.z,true);rides.grab(3);
  for(let i=0;i<60*12;i++)rides.step(1/60,pos,vel,{x:0,z:-1},OPEN,50);// swim well off the loop
  const away=Math.hypot(f.fx,f.fz);assert(Math.abs(away-30)>15,'far from its loop ('+away.toFixed(1)+')');
  rides.letGo();assert.equal(rides.darting,true);assert.equal(f.ridden,false);assert.equal(f.free,true,'the mesh stays free while it swims back');
  assert.equal(rides.scan(.2,pos.x,pos.z,true),null,'no Hang on! while it swims back');
  let t=0,maxJump=0,px=f.fx,pz=f.fz,wakes=0,out={x:0,z:0,yaw:0},lastFree=true,handover=null;
  while(rides.darting&&t<40){rides.dartStep(1/60);t+=1/60;
   let x,z;if(f.free){x=f.fx;z=f.fz;}else{const o={x:0,z:0,yaw:0};R.loopPoint(f.points,f.lengths,f.total,f.u,o);x=o.x+Math.cos(o.yaw)*f.bend;z=o.z-Math.sin(o.yaw)*f.bend;if(lastFree)handover=Math.hypot(x-px,z-pz);}
   maxJump=Math.max(maxJump,Math.hypot(x-px,z-pz));px=x;pz=z;lastFree=f.free;if(rides.dartWakeDue(out))wakes++;}
  assert(t<20,kind+' is back in time ('+t.toFixed(1)+' s)');assert.equal(f.free,false);assert.equal(f.boost,1);assert.equal(f.bend,0);assert.equal(f.bendYaw,0);
  assert(maxJump<R.dartSpeed(0,0,20,1)/30+1,'no teleport pop (largest step '+maxJump.toFixed(2)+' m)');assert(handover!==null&&handover<4,'handover step small');assert(wakes>=2,'a wake while it is fast');
 }
 // No allocation while riding / returning: the state record's keys never change.
 {const f=circleFriend('manta'),rides=R.createAnimalRides(()=>[f]),pos={x:32.6,z:0},vel={x:0,z:0},keys=JSON.stringify(Object.keys(rides.state));rides.scan(.2,pos.x,pos.z,true);rides.grab(1);
  for(let i=0;i<120;i++)rides.step(1/60,pos,vel,{x:1,z:1},OPEN,50);rides.letGo();for(let i=0;i<600;i++)rides.dartStep(1/60);assert.equal(JSON.stringify(Object.keys(rides.state)),keys,'no new state');
  const src=read('lib/town/water/animalRides.ts'),body=src.slice(src.indexOf('step(dt:number,pos'),src.indexOf('One frame of the dart'));assert(!/new |\[\.\.\.|\.map\(|\.filter\(|=>/.test(body.replace(/=>/g,'')),'step allocates nothing');}
});

ok('Let go ends early; a vanished animal lets go too',()=>{
 const f=circleFriend('whale',40),rides=R.createAnimalRides(()=>[f]),pos={x:40+R.RIDE_BODY.whale,z:0},vel={x:0,z:0};
 rides.scan(.2,pos.x,pos.z,true);rides.grab(1);for(let i=0;i<60;i++)rides.step(1/60,pos,vel,STICK,OPEN,50);
 assert.equal(rides.letGo().ended,'off');assert.equal(f.ridden,false);assert.equal(rides.riding,false);
 assert.equal(rides.letGo().ended,'','letting go twice does nothing');
 while(rides.darting)rides.dartStep(.1);/* it darts off first (no prompt over it meanwhile) */
 rides.scan(.2,pos.x,pos.z,true);rides.grab(1);f.available=false;assert.equal(rides.step(1/60,pos,vel,STICK,OPEN,50).ended,'gone');assert.equal(f.ridden,false);
 const g=R.createAnimalRides(()=>[]);assert.equal(g.grab(1).grabbed,'','nothing near: no grab');
});

ok('the real animals: every manta and the whale shark are friends; a ridden manta stays its soft silhouette like the whale shark (no dark mesh, no new mesh or material)',()=>{
 const heat=load('lib/graphics/heatTier.ts');heat.forceHeatTier(0);
 const {createCayMantas}=load('lib/graphics/cayMantas.ts'),{createWhaleShark}=load('lib/graphics/whaleShark.ts');
 const scene=new T.Scene(),mantas=createCayMantas(scene,{phone:true}),whale=createWhaleShark(scene);
 const inventory=()=>{const meshes=new Set(),mats=new Set(),geos=new Set();scene.traverse(o=>{if(o.isMesh){meshes.add(o);geos.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));}});return {meshes:meshes.size,mats:mats.size,geos:geos.size};};
 const before=inventory();
 assert.equal(mantas.friends.length,mantas.islands.reduce((n,r)=>n+r.tracks.length,0),'one friend per manta loop');
 assert(mantas.friends.every(f=>f.kind==='manta'&&f.total>0&&f.lengths.length===f.points.length+1));
 assert.equal(whale.friend.kind,'whale');assert.equal(whale.friend.total,whale.friend.lengths[whale.friend.points.length]);
 // Stand by a Summit Isle manta and wake its island.
 const isle=mantas.islands.find(r=>r.island==='summit'),f=mantas.friends.find(x=>x.id===isle.tracks[0].loop.id);
 const o={x:0,z:0,yaw:0};R.loopPoint(f.points,f.lengths,f.total,f.u,o);
 const cam=new T.PerspectiveCamera(60,390/844,.1,900),frustum=new T.Frustum(),vp=new T.Matrix4();cam.position.set(o.x+10,25,o.z+20);cam.lookAt(o.x,0,o.z);cam.updateMatrixWorld();vp.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);frustum.setFromProjectionMatrix(vp);
 const player={x:o.x+3,z:o.z};mantas.update(1/30,false,frustum,player);whale.update(1/30,false,frustum,player);
 assert.equal(f.available,true,'the near manta is available');
 const rides=R.createAnimalRides(()=>[...mantas.friends,whale.friend]);rides.scan(.2,player.x,player.z,true);assert.equal(rides.state.near,f,'the near manta prompts');
 rides.grab(2);assert.equal(isle.surface.visible,false,'no dark surfacing mesh while ridden (user: "no black")');
 const pos={x:player.x,z:player.z},vel={x:0,z:0},m=new T.Matrix4(),p=new T.Vector3(),s=new T.Vector3(),q=new T.Quaternion();
 for(let i=0;i<30;i++){rides.step(1/30,pos,vel,STICK,OPEN,50);mantas.update(1/30,true/* reduced motion: the ride still moves */,new T.Frustum()/* looking away */,pos);}
 const idx=isle.tracks.indexOf(isle.tracks.find(t=>t.loop.id===f.id));
 isle.under.getMatrixAt(idx,m);m.decompose(p,q,s);near(s.x,1.2,1e-6,'drawn as its silhouette instance while held');near(s.y,1.2,1e-6,'a full 3D manta, swimming 0.9-1.5 m under the surface (MANTA_DEPTH)');near(p.y,-.43-R.RIDE_BACK.manta-.26,.02,'ridden (Oct 20 2026, "same with ray"): risen until its back is RIDE_BACK under the water line, right under the rider');
 near(p.x,f.fx,1e-3,'the silhouette is where the ride put it (the free pose)');assert.equal(f.free,true);assert.equal(isle.surface.visible,false,'never also drawn as the dark mesh');
 // The same treatment as the whale shark: a translucent water-tinted basic material, no vertex colours (the dark top), no lighting.
 const mm=isle.under.material,wm=whale.mesh.material;
 assert(mm.isMeshBasicMaterial&&wm.isMeshBasicMaterial&&!mm.transparent&&mm.depthWrite===true&&mm.vertexColors&&wm.depthWrite===true,'the whale shark\'s silhouette treatment, solid (Oct 19 2026: coral never shows through)');
 assert.equal(mm.opacity,1,'solid');assert.equal(wm.opacity,1);assert(wm.depthWrite===true);
 assert(mantas.islands.every(r=>r.under.material===mm),'one shared material for every manta');
 assert.deepEqual(inventory(),before,'no new mesh, material or geometry');
 rides.letGo();assert.equal(isle.surface.visible,false,'let go: still no surfacing mesh');
 // The dart moves the real manta: faster than its loop pace, bent aside, then back.
 const fx0=f.fx,fz0=f.fz;for(let i=0;i<15;i++){rides.dartStep(1/30);mantas.update(1/30,false,frustum,player);}
 assert(f.free&&Math.hypot(f.fx-fx0,f.fz-fz0)>15/30*f.speed*1.4,'the manta swims back toward its loop');isle.under.getMatrixAt(idx,m);m.decompose(p,q,s);near(p.x,f.fx,1e-3,'drawn at the free pose');
 for(let i=0;i<900&&rides.darting;i++){rides.dartStep(1/30);mantas.update(1/30,false,frustum,player);}assert.equal(rides.darting,false);assert.equal(f.boost,1);assert.equal(f.free,false);
 // The whale shark: the ride owns u, the one mesh follows.
 const u0=whale.friend.u;whale.friend.ridden=true;whale.friend.u=(u0+30)%whale.friend.total;whale.update(1/30,true,new T.Frustum(),{x:whale.mesh.position.x,z:whale.mesh.position.z});
 R.loopPoint(whale.friend.points,whale.friend.lengths,whale.friend.total,whale.friend.u,o);near(whale.mesh.position.x,o.x,1e-3,'the whale shark follows the ride');near(whale.mesh.position.z,o.z,1e-3,'the whale shark follows the ride');
 whale.friend.ridden=false;assert.deepEqual(inventory(),before,'still nothing new');
 heat.forceHeatTier(null);mantas.dispose();whale.dispose();
});

ok('the ride sound: a rushing-water bed on the effects bus, started on grab-on, a dart rush on Let go, stopped on hide; no timer left',()=>{
 // A minimal Web Audio + DOM stand-in, enough to run islandSound.ts for real.
 const nodes=[],timers=new Set();let now=0;
 const param=v=>({value:v,setValueAtTime(x){this.value=x;},linearRampToValueAtTime(x){this.value=x;},exponentialRampToValueAtTime(x){this.value=x;},setTargetAtTime(x){this.value=x;},cancelScheduledValues(){}});
 const node=type=>{const n={type,connected:0,started:false,stopped:false,connect(){this.connected++;},disconnect(){this.connected=0;}};nodes.push(n);return n;};
 class Ctx{constructor(){this.sampleRate=8000;this.state='running';this.destination=node('dest');}get currentTime(){return now;}
  createGain(){return Object.assign(node('gain'),{gain:param(1)});}createBiquadFilter(){return Object.assign(node('filter'),{frequency:param(350),Q:param(1)});}
  createOscillator(){return Object.assign(node('osc'),{frequency:param(440),start(){this.started=true;},stop(){this.stopped=true;}});}
  createBufferSource(){return Object.assign(node('source'),{playbackRate:param(1),loop:false,start(){this.started=true;},stop(){this.stopped=true;this.onended?.();}});}
  createBuffer(c,n){const d=new Float32Array(n);return {getChannelData:()=>d,length:n};}resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}close(){return Promise.resolve();}}
 const listeners={};const document={hidden:false,addEventListener(t,f){(listeners[t]??=[]).push(f);},removeEventListener(t,f){listeners[t]=(listeners[t]||[]).filter(x=>x!==f);},dispatchEvent(e){(listeners[e.type]||[]).forEach(f=>f(e));}};
 class CustomEvent{constructor(type,o){this.type=type;this.detail=o?.detail;}}
 const ctx={exports:{},module:{exports:{}},Math,Map,Set,Float32Array,Promise,performance:{now:()=>now*1000},document,window:{AudioContext:Ctx},navigator:{},
  setTimeout:(f,ms)=>{const h={f,ms};timers.add(h);return h;},clearTimeout:h=>timers.delete(h),require:()=>({})};ctx.module.exports=ctx.exports;
 vm.runInNewContext(ts.transpileModule(read('lib/audio/islandSound.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,ctx);
 const snd=ctx.exports.createIslandSound(false,.5);snd.unlock();
 const cue=(c,g)=>document.dispatchEvent(new CustomEvent('fi2-job-cue',{detail:{cue:c,gain:g}}));
 const live=()=>nodes.filter(n=>n.type==='source'&&n.loop&&n.started&&!n.stopped);
 cue('ride-start',1);assert.equal(snd.debug.rush,true,'the rush plays while riding');assert.equal(live().length,1,'ONE looped noise source');
 const src=live()[0];assert(src.connected>=1,'through a filter and gain onto the effects bus');
 now+=2;cue('ride-start',1);assert.equal(live().length,1,'a second grab never stacks a second bed');
 // The shared idle check (scheduled by the unlock, before the ride) finds it audible: the context stays awake, nothing new is scheduled.
 for(const h of [...timers]){timers.delete(h);h.f();}assert.equal(timers.size,0,'no timer while it plays');assert.equal(snd.debug.idleSuspends,0,'never idle-suspended mid-ride');assert.equal(live().length,1);
 cue('ride-dart');assert.equal(snd.debug.rush,false);assert.equal(src.stopped,true,'Let go: the rush swells and fades out (its stop scheduled on the audio clock)');
 assert(timers.size<=1,'at most the idle-suspend check is left (the shared 2 s idle rule), no ride timer');
 cue('ride-start',.8);assert.equal(live().length,1);document.hidden=true;snd.visibility();assert.equal(live().length,0,'page hide: silenced');
 document.hidden=false;snd.visibility();assert.equal(live().length,1,'back to the page mid-ride: the bed comes back');
 snd.setMuted(true);assert.equal(live().length,0,'mute: silenced');snd.setMuted(false);assert.equal(live().length,1);
 cue('ride-stop');assert.equal(live().length,0,'a map trip: stopped');snd.setMuted(false);assert.equal(live().length,0,'and it stays stopped after the ride');
 assert.equal(snd.debug.counts['cue:ride-start'],3);assert.equal(snd.debug.counts['cue:ride-dart'],1);assert.equal(snd.debug.counts['cue:ride-stop'],1);
 snd.dispose();
 const town=read('components/Town.tsx');
 assert(/rideSound\('ride-start'/.test(town)&&/rideSound\(re\.ended==='gone'\?'ride-stop':'ride-dart'\)/.test(town),'Town starts it on grab-on and darts / stops it as the ride ends');
 assert(/sound\.move\(rideRef\.current,[^;]*active&&!animalRides\.riding/.test(town),'no footstep / stroke ticks while riding');
});

ok('HUD: riding swaps the water cluster for the single Let go action (icon-only), the prompt is the island prompt style',()=>{
 const b=H.waterButtonsFor({inWater:true,swimming:true,flyOk:true,riding:true});
 assert.equal(b,H.RIDING_BUTTONS);assert.equal(JSON.stringify(b.filter(x=>x.enabled).map(x=>x.id)),'["letgo"]','one live action: Let go');
 assert.equal(H.RIDE_LET_GO.label,'Let go');assert.equal(H.RIDE_LET_GO.icon,'letgo');
 assert.equal(H.waterButtonsFor({inWater:true,swimming:true,flyOk:false,riding:false}),H.WATER_BUTTONS,'not riding: the swim cluster as before');
 const job=read('components/JobActionButton.tsx');assert(/WATER_IDS=new Set\(\[[^\]]*'letgo'/.test(job),'Let go is icon-only like the other water buttons');
 assert(/letgo:'M/.test(read('components/TravelIcon.tsx')),'the Let go icon exists');
 const town=read('components/Town.tsx');
 assert(/<button type="button" className="store-enter-prompt" data-ride-grab=""[^>]*onClick=\{\(\)=>rideActions\.current\(\)\}>\{RIDE_PROMPT\}<\/button>/.test(town),'the floating prompt is a store-enter-prompt button (the Talk / Fish / Sell style and press rule)');
 assert(/cands\.push\(\{kind:'enter',key:rideWant\.key/.test(town),'the prompt competes in the HUD arbiter like the other proximity actions');
 assert(/<SwimLessonToast blocked=\{toastBlocked\} which="ride"\/>/.test(town)&&/which==='ride'\?waterStore\.get\(\)\.rideLesson/.test(read('components/SwimLessonToast.tsx')),'the lesson toast, once per device');
});

ok('heat + wiring: the scan on the probe tick only, the ride step only while riding, no timers, no new meshes',()=>{
 const src=read('lib/town/water/animalRides.ts');
 assert(!/setTimeout|setInterval|requestAnimationFrame|new T\.|from 'three'/.test(src),'pure: no timers, loops or three.js');
 const town=read('components/Town.tsx');
 assert(/animalRides\.scan\(dt,location\.x,location\.z,water\.inWater&&water\.state\.phase==='swim'\)/.test(town),'the scan runs only while swimming (10 Hz inside)');
 assert(/if\(animalRides\.riding&&water\.swimming&&rideRef\.current==='walk'\)\{rideEnded\(animalRides\.step\(dt,location,velocity,rideSteer,waterWalk\.allow,waterProbe\.d,waterProbe\.isLand\)\)/.test(town),'the ride drives the movement (with the dry-land test for the hull probe)');
 assert(/pose\.kind='hold'/.test(town)&&/s\.kind==='hold'/.test(read('lib/graphics/swimPose.ts')),'the hold-on pose');
 assert(/pose\.kind='hold';pose\.effort=rs\.roll;pose\.fast=0;ev\.wake=false;ev\.stroke=0;/.test(town),'the swim strokes\' wake is off while riding (the ride has its own)');
 assert(/RIDE_CAM_LIFT/.test(town),'a slightly higher follow while riding');
 assert(/countRideStart\(re\.grabbed\)/.test(town)&&/countRideLap\(\)/.test(town)&&/countRideOff\(\)/.test(town),'analytics at the grab, the lap and the early let go');
 const ids=load('lib/analytics/countIds.ts');for(const id of ['wa:ride_manta','wa:ride_whale','wa:ride_lap','wa:ride_off'])assert(ids.FIXED_COUNT_IDS.includes(id),id+' is a known counter');
 assert(/counters[\s\S]*ride the[\s\S]*existing learning-counter channel \(`k`\) and need no migration/.test(read('supabase/migrations/20261017_analytics_water.sql')),'wa: ids ride the k channel (no migration)');
 assert(/wa:ride_manta/.test(read('app/admin/WaterSection.tsx')),'the admin Water section shows the rides');
 assert(/ride\.cjs|water-rides\.cjs/.test(read('package.json')),'registered in npm test');
});

// Oct 20 2026 (user, screenshots: "when riding the whale, they are not together", "same with ray"): the rider sits ON the animal.
ok('the seat: a grab glides from the swimmer onto the back (no pop); the drawn pose is ONE interpolation for the animal and the rider; the rider faces its heading',()=>{
 assert(R.RIDE_GRIP.whale>.5&&R.RIDE_GRIP.whale+.1<3.4,'the whale shark seat: behind the head (x 3.4), ahead of the first dorsal (x .5)');
 assert(Math.abs(R.RIDE_GRIP.manta)<.3,'the manta seat: the disc centre');
 assert(R.RIDE_BACK.whale<=.2&&R.RIDE_BACK.manta<=.2&&R.RIDE_SEAT_LIFT>0&&R.RIDE_RISE>=4,'risen to just under the rider, quickly');
 for(const kind of ['manta','whale']){
  const f=circleFriend(kind,30),rides=R.createAnimalRides(()=>[f]),pos={x:30+R.RIDE_BODY[kind]+2,z:-1},vel={x:0,z:0},start={...pos};
  rides.scan(.2,pos.x,pos.z,true);rides.grab(1,pos.x,pos.z,Math.PI/2);
  rides.step(1/60,pos,vel,STICK,OPEN,50);
  assert(Math.hypot(pos.x-start.x,pos.z-start.z)<.3,kind+': the first frame stays where the swimmer was (a glide, not a jump): '+Math.hypot(pos.x-start.x,pos.z-start.z));
  for(let i=0;i<60;i++)rides.step(1/60,pos,vel,{x:1,z:0},OPEN,50);
  const gr=R.RIDE_GRIP[kind],seat=()=>({x:f.fx+Math.sin(f.fyaw)*gr,z:f.fz+Math.cos(f.fyaw)*gr});
  near(Math.hypot(pos.x-seat().x,pos.z-seat().z),0,.01,kind+' on the seat after 1 s');
  near(f.dx,f.fx,1e-9,'without present() the drawn pose is the tick pose');near(f.bank,rides.state.roll,1e-9,'the animal banks with the rider');
  assert(Math.abs(f.bank)>.05,'steering banks it');
  // present: halfway between two ticks, the animal and the rider are drawn from the same interpolated pose.
  const px=f.fx,pz=f.fz,pyaw=f.fyaw;rides.step(1/60,pos,vel,{x:1,z:0},OPEN,50);const out={x:0,z:0};
  assert.equal(rides.present(.5,out),true);near(f.dx,(px+f.fx)/2,1e-9,'drawn x interpolated');near(f.dz,(pz+f.fz)/2,1e-9,'drawn z interpolated');
  near(out.x,f.dx+Math.sin(f.dyaw)*gr,.002,kind+' rider drawn on the drawn animal (x)');near(out.z,f.dz+Math.cos(f.dyaw)*gr,.002,kind+' rider drawn on the drawn animal (z)');
  near(rides.state.drawYaw,f.dyaw,.01,'the rider faces the drawn heading');void pyaw;
  rides.letGo('off');assert.equal(rides.present(.5,out),false,'not riding: nothing drawn');assert(Math.abs(f.bank)<=Math.abs(rides.state.roll)+1,'bank kept to ease out');
  for(let i=0;i<120;i++)rides.dartStep(1/60);assert(Math.abs(f.bank)<.01,'the bank eases out after the ride');
 }
});

ok('the risen animal: the whale shark / manta rise until the back is RIDE_BACK under the water, the seat on the back, banking about the back, sinking after',()=>{
 const {createCayMantas}=load('lib/graphics/cayMantas.ts'),{createWhaleShark,WHALE_DEPTH,STATIONS}=load('lib/graphics/whaleShark.ts');
 const scene=new T.Scene(),whale=createWhaleShark(scene),mantas=createCayMantas(scene,{phone:true}),f=whale.friend,WATER=-.43;
 // The model's back at the seat (+x forward): the body's top there is the back (STATIONS x, ht), within a few cm of backTop.
 const at=x=>{for(let i=1;i<STATIONS.length;i++){const [x0,,h0]=STATIONS[i-1],[x1,,h1]=STATIONS[i];if(x<=x0&&x>=x1)return h0+(h1-h0)*(x0-x)/(x0-x1);}return 0;};
 near(at(R.RIDE_GRIP.whale+.1),WHALE_DEPTH.backTop,.06,'the seat is on the highest part of the back');
 const o={x:0,z:0,yaw:0};R.loopPoint(f.points,f.lengths,f.total,f.u,o);const player={x:o.x,z:o.z},fr=new T.Frustum();
 const rides=R.createAnimalRides(()=>[f]);rides.scan(.2,o.x+1,o.z,true);assert.equal(rides.state.near,f);rides.grab(1,o.x+1,o.z,0);
 const pos={x:o.x+1,z:o.z},vel={x:0,z:0},back=()=>whale.mesh.position.y+WHALE_DEPTH.backTop;
 whale.update(1/60,false,fr,player);assert(back()<WATER-1,'starts at its swimming depth: '+back());
 for(let i=0;i<60;i++){rides.step(1/60,pos,vel,{x:1,z:0},OPEN,50);rides.present(1,pos);whale.update(1/60,false,fr,pos);}
 near(back(),WATER-R.RIDE_BACK.whale,.05,'risen: the back just under the rider');
 // The seat in model space, through the drawn matrix: under the rider (horizontal gap < 1 cm, banked or not).
 const seat=new T.Vector3(R.RIDE_GRIP.whale,WHALE_DEPTH.backTop,0).applyMatrix4(whale.mesh.matrix);
 assert(Math.abs(f.bank)>.05,'banking in the turn');near(Math.hypot(seat.x-pos.x,seat.z-pos.z),0,.01,'the rider on the seat (horizontal gap)');near(seat.y,WATER-R.RIDE_BACK.whale,.05,'the seat height');
 rides.letGo('off');for(let i=0;i<150;i++){rides.dartStep(1/60);whale.update(1/60,false,fr,pos);}
 assert(back()<WATER-1,'sinks back to its swimming depth after the ride: '+back());
 const src=read('lib/graphics/cayMantas.ts');assert.match(src,/t\.rise\+=\(\(t\.ridden\?1:0\)-t\.rise\)\*\(1-Math\.exp\(-dt\*RIDE_RISE\)\)/,'the manta rises the same way');
 assert.match(src,/pos\.x=t\.dx;pos\.z=t\.dz;yaw=t\.dyaw-Math\.PI\/2;/,'the manta is drawn at the drawn pose');void mantas;
 assert.match(read('lib/graphics/whaleShark.ts'),/if\(fx&&!reduced&&!state\.ridden/,'no own trail ripples between the whale and its rider while ridden');
});

ok('Town wiring: one interpolation, the seat lift, the rider facing the animal, the ride wake ON the animal, no swim ripples while riding',()=>{
 const town=read('components/Town.tsx');
 assert.match(town,/animalRides\.grab\(Math\.hypot\(velocity\.x,velocity\.z\),location\.x,location\.z,player\.root\.rotation\.y\)/,'the grab glides from the swimmer');
 assert.match(town,/visualLocation\.z=active\?T\.MathUtils\.lerp\(previousLocation\.z,location\.z,blend\):location\.z;\n\s*animalRides\.present\(active\?blend:1,visualLocation\);/,'present right after the rider\'s own interpolation');
 assert(town.indexOf('animalRides.present(')<town.indexOf('world.updateSharks('),'before the animals are placed');
 assert.match(town,/if\(animalRides\.riding\)player\.root\.rotation\.y=animalRides\.state\.drawYaw;/,'the rider faces the drawn heading');
 assert.match(town,/groundY\+=rideSeat\*RIDE_SEAT_LIFT;/,'the seat lift');
 assert.match(town,/RIDE_WAKE_AT\[f\.kind\]/,'the ride wake rings sit on the animal');
 assert.match(town,/ring\.visible=[^;]*!\(water\.inWater&&water\.state\.phase==='swim'\)/,'no foot ring in the sea (riding included)');
});

if(failed){console.log(`\n${failed} failed`);process.exit(1);}
console.log('\nwater-rides: all passed');
