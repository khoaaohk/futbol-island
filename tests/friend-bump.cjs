// Friend bumps (owner, Oct 23 2026: a kid-friendly animation when two party friends run into each other; docs/multiplayer-friend-bumps.md).
// Pure checks on lib/town/friendBump.ts (families, thresholds, closing speed, cooldown + re-arm, curves start / end at rest, rides keep their
// tyres down, reduced motion, no per-frame allocation) and on the drawn layer lib/graphics/friendBump.ts (skipped states: hidden, muted,
// shielded, indoors, fading, not shown, Battery saver), plus the wiring (remoteAvatars, townBridge, Town around the render only).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),req=require('node:module').createRequire(ROOT+'/package.json');
const fakeDoc={createElement:()=>({width:0,height:0,getContext:()=>null})};
function load(file){
 const full=path.join(ROOT,file),m={exports:{}};
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,Int16Array,Float64Array,Uint8Array,Map,Infinity,NaN,document:fakeDoc,require:id=>{
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id);return load(path.relative(ROOT,rel+'.ts'));}
   return req(id);}});
 return m.exports;
}
const B=load('lib/town/friendBump.ts'),{Mode,Zone}=load('multiplayer/protocol/types.ts');
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const body=(id,mode,x,y,z,vx=0,vz=0)=>{const b=B.createBumpBody();Object.assign(b,{id,mode,fam:B.bumpFamily(mode),x,y,z,vx,vz});return b;};
const DT=1/60;

t('families: walk / run / idle, the three rides, the jetpack; everything else never bumps',()=>{
 for(const m of [Mode.Walk,Mode.Run,Mode.Idle])assert.equal(B.bumpFamily(m),B.FAM.Walk);
 for(const m of [Mode.Bike,Mode.Scooter,Mode.Moped])assert.equal(B.bumpFamily(m),B.FAM.Ride);
 assert.equal(B.bumpFamily(Mode.Jetpack),B.FAM.Fly);
 for(const m of [Mode.Parachute,Mode.Zipline,Mode.Swim,Mode.Dive,Mode.AnimalRide,Mode.Fishing,Mode.Busy])assert.equal(B.bumpFamily(m),B.FAM.None);
});

t('two walkers running into each other bump once: both react, pushed apart, one hit with the midpoint',()=>{
 const d=B.createBumpDetector(),a=body(-1,Mode.Run,0,0,0,0,3),b=body(4,Mode.Walk,0,0,1,0,-1);
 assert.equal(B.detectBumps(d,[a,b],2,DT),1);
 assert(a.react.on&&b.react.on);assert.equal(a.react.kind,B.KIND.Walk);
 assert(a.react.nz<-.99&&b.react.nz>.99,'each one is nudged away from the other');
 assert.equal(a.react.side,-b.react.side);
 const h=d.hits[0];assert.equal(h.z,.5);assert.equal(h.kind,B.FAM.Walk);
 assert.equal(B.detectBumps(d,[a,b],2,DT),0,'not again next frame');
});

t('thresholds: 1.2 m touch, height gap 0.8 m on the ground / 1.5 m flying, closing speed, same family only',()=>{
 const one=(a,b)=>B.detectBumps(B.createBumpDetector(),[a,b],2,DT);
 assert.equal(one(body(1,Mode.Walk,0,0,0,0,2),body(2,Mode.Walk,0,0,1.25)),0,'1.25 m apart: no touch');
 assert.equal(one(body(1,Mode.Walk,0,0,0,0,2),body(2,Mode.Walk,0,0,1.15)),1);
 assert.equal(one(body(1,Mode.Walk,0,0,0,0,2),body(2,Mode.Walk,0,.9,.5)),0,'a friend on a step / roof above');
 assert.equal(one(body(1,Mode.Jetpack,0,10,0,0,4),body(2,Mode.Jetpack,0,11.4,.6)),1,'flyers: 1.4 m up still bumps');
 assert.equal(one(body(1,Mode.Jetpack,0,10,0,0,4),body(2,Mode.Jetpack,0,11.6,.6)),0,'flyers: 1.6 m up does not');
 assert.equal(one(body(1,Mode.Walk,0,0,0),body(2,Mode.Walk,0,0,.6)),0,'two friends standing close never bonk');
 assert.equal(one(body(1,Mode.Walk,0,0,0,0,-2),body(2,Mode.Walk,0,0,.6)),0,'walking away is not a bump');
 assert.equal(one(body(1,Mode.Walk,0,0,0,0,3),body(2,Mode.Bike,0,0,.6)),0,'a walker and a bike: different families');
 assert.equal(one(body(1,Mode.Walk,0,0,0,0,3),body(2,Mode.Jetpack,0,0,.6)),0);
 assert.equal(one(body(1,Mode.Swim,0,0,0,0,3),body(2,Mode.Swim,0,0,.6)),0,'swimmers never');
 const a=body(1,Mode.Bike,0,0,0,0,5),b=body(2,Mode.Scooter,0,0,1);assert.equal(one(a,b),1,'a bike and a scooter: both rides');
 assert.equal(a.react.kind,B.KIND.Ride);assert.equal(b.react.kind,B.KIND.Ride);
 const f=body(1,Mode.Jetpack,0,5,0,0,6),g=body(2,Mode.Jetpack,.3,5.5,.8);assert.equal(one(f,g),1);assert.equal(f.react.kind,B.KIND.Fly);assert.equal(f.react.dur,1);
});

t('cooldown + re-arm: staying close never retriggers; parting past 1.7 m and coming back after the 2.5 s cooldown does',()=>{
 const d=B.createBumpDetector(),a=body(1,Mode.Run,0,0,0,0,3),b=body(2,Mode.Walk,0,0,1);
 let fired=0;const step=(s)=>{for(let i=0;i<Math.round(s/DT);i++)fired+=B.detectBumps(d,[a,b],2,DT);};
 step(4);assert.equal(fired,1,'held together 4 s: one bump');
 b.z=3;step(.5);b.z=1;step(.1);assert.equal(fired,2,'parted, cooled down, back: a second bump');
 b.z=3;step(.5);b.z=1;step(.1);assert.equal(fired,2,'back within the cooldown: none');
 step(3);b.z=1.5;step(.5);b.z=1;step(.1);assert.equal(fired,2,'only 1.5 m apart (inside the re-arm ring): still none');
 b.z=2;step(.5);b.z=1;step(.1);assert.equal(fired,3);
 // a real approach: they glide in through the 1.7 m ring over several frames (both moving), still one bump
 b.z=4;step(3);b.z=2.5;for(let i=0;i<40&&b.z>.5;i++){b.z-=.06;fired+=B.detectBumps(d,[a,b],2,DT);}assert.equal(fired,4,'gliding in frame by frame bumps once');
});

t('pair table: fixed size, many pairs never grow it, a cleared table starts over',()=>{
 const d=B.createBumpDetector(),bs=[];for(let i=0;i<B.BUMP_BODIES;i++)bs.push(body(i,Mode.Run,i*.1,0,0,0,i%2?2:-2));
 B.detectBumps(d,bs,bs.length,DT);assert.equal(d.used.length,B.BUMP_PAIRS);assert(d.hitN<=d.hits.length);
 B.resetBumps(d);assert.equal([...d.used].reduce((a,b)=>a+b,0),0);
 assert.equal(B.detectBumps(d,bs,99,DT)>=0,true,'n is clamped to BUMP_BODIES');
});

t('curves: 0.6..1.0 s, start and end at rest, rides keep both tyres down (yaw / roll / skid only), reduced motion = no motion',()=>{
 const P=B.createBumpPose();
 for(const [mode,kind] of [[Mode.Walk,B.KIND.Walk],[Mode.Bike,B.KIND.Ride],[Mode.Moped,B.KIND.Ride],[Mode.Scooter,B.KIND.Ride],[Mode.Jetpack,B.KIND.Fly]]){
  const r=B.createBumpReact();B.startBump(r,mode,1,0,1,1);assert.equal(r.kind,kind);assert(r.dur>=.6&&r.dur<=1);
  B.bumpPose(r,false,P);assert(Math.abs(P.back)<1e-9&&Math.abs(P.lift)<1e-9&&Math.abs(P.squash-1)<1e-9&&Math.abs(P.roll)<1e-9);
  let moved=0;
  while(r.on){B.stepBump(r,DT);B.bumpPose(r,false,P);
   if(kind===B.KIND.Ride){assert.equal(P.squash,1);assert.equal(P.bulge,1);assert.equal(P.lift,0);assert(Math.abs(P.roll)<.1,'a gentle lean');}
   assert(P.back>=-1e-9&&P.back<=.61);assert(P.squash>.8&&P.bulge<1.1);moved=Math.max(moved,Math.abs(P.yaw)+Math.abs(P.roll)+P.back);}
  assert(moved>.1,'it visibly reacts');
  B.bumpPose(r,false,P);assert.deepEqual({...P},{back:0,lift:0,squash:1,bulge:1,yaw:0,roll:0},'back on the real pose');
  // just before the end: a flyer's spin is a whole turn (no snap), everyone else is nearly at rest
  r.on=true;r.age=r.dur-1e-4;B.bumpPose(r,false,P);const y=((P.yaw%(2*Math.PI))+2*Math.PI)%(2*Math.PI);assert(Math.min(y,2*Math.PI-y)<.01);assert(Math.abs(P.back)<.01&&Math.abs(P.roll)<.01);
  r.age=r.dur/2;B.bumpPose(r,true,P);assert.deepEqual({...P},{back:0,lift:0,squash:1,bulge:1,yaw:0,roll:0},'reduced motion: no wobble');
 }
});

t('no allocation per frame: source has no object / array / closure creation in the per-frame functions, heap stays flat',()=>{
 const src=read('lib/town/friendBump.ts');
 for(const fn of ['detectBumps','findPair','claimPair','startBump','stepBump','bumpPose']){
  const i=src.indexOf('function '+fn+'('),j=src.indexOf('\n}\n',i);assert(i>=0&&j>i,fn);const body=src.slice(src.indexOf('{',src.indexOf(')',i)),j);
  assert(!/\bnew\s|\[\]|=>|\{\s*[a-zA-Z]+\s*:/.test(body),fn+' allocates');
 }
 if(global.gc){
  const P0=B.createBumpPose(),d=B.createBumpDetector(),bs=[];for(let i=0;i<7;i++)bs.push(body(i,i%3?Mode.Walk:Mode.Jetpack,i*.9,0,0,0,1));
  for(let i=0;i<2000;i++)B.detectBumps(d,bs,7,DT);global.gc();const h0=process.memoryUsage().heapUsed;
  for(let i=0;i<200000;i++){B.detectBumps(d,bs,7,DT);for(const b of bs){B.stepBump(b.react,DT);B.bumpPose(b.react,false,P0);}}
  global.gc();const grew=process.memoryUsage().heapUsed-h0;assert(grew<256*1024,'heap grew '+grew);
 }
});

t('drawn layer: hidden, muted, shielded, indoors, fading, not shown and Battery saver friends are skipped; the local player bumps a friend',()=>{
 const T=req('three'),G=load('lib/graphics/friendBump.ts');
 const mk=(id,over={})=>({id,hidden:false,muted:false,shield:false,door:1,shown:true,rig:{root:new T.Object3D()},bump:B.createBumpReact(),...over});
 const pose=(x,z,mode=Mode.Walk,over={})=>({x,y:0,z,yaw:Math.PI,speed:2,mode,zone:Zone.Main,fade:1,...over});
 const run=(entry,p,local,saver=false)=>{const L=G.createFriendBumps(new T.Object3D());const poses=new Map([[entry.id,p]]);L.detect(DT,[entry],poses,local,false,saver);L.detect(DT,[entry],poses,local,false,saver);return L;};
 const me={x:0,y:0,z:0,mode:Mode.Walk};
 let L=run(mk(3),pose(0,.8),me);assert.equal(L.fired,1,'me + a friend walking into me');assert(L.local.on);
 L.update(.05);L.dispose();
 for(const [why,e,p,l,s] of [['hidden',mk(3,{hidden:true}),pose(0,.8),me],['muted',mk(3,{muted:true}),pose(0,.8),me],['shielded',mk(3,{shield:true}),pose(0,.8),me],
  ['at the door',mk(3,{door:.5}),pose(0,.8),me],['indoors',mk(3),pose(0,.8,Mode.Walk,{zone:Zone.Indoors}),me],['fading in',mk(3),pose(0,.8,Mode.Walk,{fade:.5}),me],
  ['not drawn',mk(3,{shown:false}),pose(0,.8),me],['no rig (beyond the cap)',mk(3,{rig:null}),pose(0,.8),me],['Battery saver',mk(3),pose(0,.8),me,true],
  ['no local (indoors / busy)',mk(3),pose(0,.8),null],['a flyer vs me walking',mk(3),pose(0,.8,Mode.Jetpack),me]]){
  L=run(e,p,l,s);assert.equal(L.fired,0,why);assert(!L.local.on,why);L.dispose();
 }
 // overlay on a friend's rig root: applied, then the yaw undone before the next frame
 const e=mk(3),r=e.rig.root;B.startBump(e.bump,Mode.Jetpack,1,0,1,1);e.bump.age=.3;r.rotation.y=.5;
 assert(G.applyBump(r,e.bump,false,1.12));assert(r.rotation.y!==.5&&r.position.x>0);G.unBump(r,e.bump);assert(Math.abs(r.rotation.y-.5)<1e-9);
 assert.equal(G.applyBump(r,e.bump,true,1.12),false,'reduced motion: no overlay');
 // local overlay: on for the render, restored exactly
 const pl=new T.Object3D(),veh=new T.Object3D();pl.position.set(1,2,3);pl.rotation.y=.4;pl.scale.setScalar(1.12);
 const lb={...B.createBumpPose(),on:true,nx:1,nz:0,back:.2,squash:.9,bulge:1.05,yaw:.3,roll:.1,lift:0};
 G.applyLocalBump(lb,pl,veh);assert(pl.position.x>1&&pl.scale.y<1.12&&veh.rotation.y>0);G.restoreLocalBump(pl,veh);
 assert.deepEqual([pl.position.x,pl.position.y,pl.position.z,pl.rotation.y,pl.rotation.z,pl.scale.x,pl.scale.y],[1,2,3,.4,0,1.12,1.12]);assert.equal(veh.rotation.y,0);
});

t('wiring: remoteAvatars detects before its pass and overlays the rig, townBridge exposes the local overlay, Town applies it only around the render',()=>{
 const ra=read('lib/graphics/remoteAvatars.ts'),tb=read('lib/multiplayer/townBridge.ts'),town=read('components/Town.tsx'),pkg=read('package.json');
 assert(ra.indexOf('bumps.detect(dt,list,poses,local,reduced,saver)')<ra.indexOf('batch.begin();fields.begin();let shown=0;'));
 assert(/unBump\(root3,e\.bump\)/.test(ra)&&/applyBump\(root3,e\.bump,reduced,BODY_SCALE\*k\*e\.out\)/.test(ra)&&/bumps\.dispose\(\)/.test(ra));
 assert(/get localBump\(\) \{ return core\.live && meRingOn \? avatars\.localBump : null; \}/.test(tb));
 assert(/if\(lb&&lb\.on\)applyLocalBump\(lb,player\.root,vehicle\.root\);\/\*[^*]*\*\/heat\.beforeRender\(location[^;]*\);renderer\.render\(scene,camera\);[^\n]*?islandFrameAt\.current=performance\.now\(\);if\(stickPaint\.current\)\{[^}]*\}if\(lb&&lb\.on\)restoreLocalBump\(player\.root,vehicle\.root\);/.test(town),'applied just before the render, restored right after');
 for(const f of ['lib/graphics/friendBump.ts','lib/town/friendBump.ts'])for(const l of read(f).split('\n').filter(l=>/^import/.test(l)&&/protocol/.test(l)))assert(/protocol\/types'/.test(l),'no protocol change: reads the mode / zone enums only');
 assert(pkg.includes('tests/friend-bump.cjs'));
});
console.log(`friend-bump: ${n} checks passed`);
