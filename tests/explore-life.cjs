// Explore life (Oct 21-22 2026; docs/swimming-research.md §13, docs/performance-guide.md "Explore life"): the held rise, solid
// collision, the heat savings and the realism pieces of the reef room (pure helpers, budgets, source checks).
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let passed=0;const ok=(name,fn)=>{try{fn();passed++;console.log('ok  ',name);}catch(e){console.error('FAIL',name);throw e;}};
const D=load('lib/town/water/diveSpots.ts'),S=load('lib/town/water/diveSession.ts'),J=load('lib/town/water/diveJourney.ts');

ok('held rise: ▲ eases in to 2x and carries all the way to the top; ▼ is gentler; a tap is a small step; release holds',()=>{
 assert.equal(S.diveLiftSpeed(0,1),1);assert.equal(S.diveLiftSpeed(0,-1),1);assert(Math.abs(S.diveLiftSpeed(5,1)-S.DIVE_LIFT.up)<1e-9);assert(Math.abs(S.diveLiftSpeed(5,-1)-S.DIVE_LIFT.down)<1e-9);
 assert(S.DIVE_LIFT.up>S.DIVE_LIFT.down&&S.DIVE_LIFT.down>1);let p=0;for(let t=0;t<=2;t+=.05){const v=S.diveLiftSpeed(t,1);assert(v>=p-1e-12);p=v;}
 const spot=D.diveSpotById('turtle-pool'),s=S.createDiveSession();s.scan(.2,spot.x,spot.z,true);assert(s.start());
 for(let i=0;i<90;i++)s.step(1/30,{sx:0,sy:0,lift:-1});const low=s.state.y;
 s.step(1/30,{sx:0,sy:0,lift:1});s.step(1/30,{sx:0,sy:0,lift:1});s.step(1/30,{sx:0,sy:0,lift:0});const tap=s.state.y-low;assert(tap>0&&tap<.3,'a tap is a small step: '+tap.toFixed(3));
 for(let i=0;i<20;i++)s.step(1/30,{sx:0,sy:0,lift:0});const held=s.state.y;for(let i=0;i<30;i++)s.step(1/30,{sx:0,sy:0,lift:0});assert(Math.abs(s.state.y-held)<.05,'release holds the depth');
 let n=0;while(!s.state.atTop&&n<300){s.step(1/30,{sx:0,sy:0,lift:1});n++;}assert(s.state.atTop,'held ▲ reaches the top');assert(n<150,'within 5 s: '+n);
 assert(s.state.y<=D.DIVE_SURFACE_Y+1e-6,'never above the water');assert.equal(s.state.depthT,0);
});

const R=load('lib/graphics/diveRoom.ts'),SD=load('lib/town/water/diveSolids.ts'),DL=load('lib/town/water/diveDelight.ts'),SP=load('lib/town/water/diveSparkle.ts');
const rooms=new Map();const roomOf=z=>{if(!rooms.has(z.id))rooms.set(z.id,R.createDiveRoom(z,{phone:true,reduced:false,found:[],pickups:J.journeyPickups(z)}));return rooms.get(z.id);};
ok('solids: every zone has its solid things (the wreck, rocks, the arch, the goal, crates), all from the room build; grid keeps the test small',()=>{
 const rows=[];for(const z of D.DIVE_SPOTS){const w=roomOf(z).solids,tags={};for(const s of w.solids)tags[s.tag]=(tags[s.tag]||0)+1;
  if(z.theme.wreck)for(const t of ['keel','rib','plank'])assert(tags[t]>0,z.id+' '+t);
  if(z.theme.signature==='goal')assert(tags['goal-post']===2&&tags['goal-bar']===1,z.id+' goal');
  if(z.theme.signature==='arch')assert(tags.arch>=10,z.id+' arch');
  assert(tags.rock>0&&tags.clam===1&&tags.chest===1,z.id);
  let mx=0;for(let c=0;c<w.start.length-1;c++)mx=Math.max(mx,w.start[c+1]-w.start[c]);assert(mx<=40,z.id+' at most 40 solids in a cell: '+mx);
  rows.push(`${z.id}:${w.n}(max ${mx}/cell)`);}
 console.log('     solids: '+rows.join(' '));
});
ok('swimming never ends inside a solid and never tunnels (straight swims and turns from many starts, 15 / 30 / 60 Hz)',()=>{
 let worst=0,steps=0;
 for(const z of D.DIVE_SPOTS){const w=roomOf(z).solids;let seed=z.blob*977+3;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(const hz of [15,30,60])for(let k=0;k<14;k++){const s=S.createDiveSession();s.scan(.2,z.x,z.z,true);assert(s.start());s.setSolids(w);
   const a=rnd()*Math.PI*2,d=rnd()*(D.DIVE_ROOM_R-6);s.state.x=Math.cos(a)*d;s.state.z=Math.sin(a)*d;s.state.yaw=rnd()*Math.PI*2;s.step(1/hz,{sx:0,sy:0,lift:0});
   const turn=(rnd()-.5)*.6,lift=rnd()<.3?1:rnd()<.5?-1:0;
   for(let i=0;i<hz*7&&s.state.phase==='diving';i++){s.step(1/hz,{sx:turn,sy:-1,lift:i%40<20?lift:0});steps++;
    const p=SD.divePenetration(w,s.state.x,s.state.y+SD.DIVE_BODY.cy,s.state.z,SD.DIVE_BODY.r);worst=Math.max(worst,p);
    assert(p<=.02,`${z.id} inside a solid by ${p.toFixed(3)} at ${s.state.x.toFixed(2)},${s.state.y.toFixed(2)},${s.state.z.toFixed(2)} (${hz} Hz)`);}}}
 console.log(`     ${steps} steps, worst penetration ${worst.toFixed(4)} m`);
});
ok('a 1.45 m gap passes, 1.15 m is blocked (2 × (body + pad) = 1.3 m); swimming into a wall at 45° slides along it',()=>{
 const I=[1,0,0,0,1,0,0,0,1];
 const pass=(gap)=>{const w2=SD.diveSolidWorld([SD.diveSolidBox('a',-(gap/2+.8),0,0,I,.8,2,.04),SD.diveSolidBox('b',gap/2+.8,0,0,I,.8,2,.04)]);
  const p={x:0,y:0,z:-2},n={x:0,y:0,z:0};for(let i=0;i<40;i++){p.z+=.1;SD.divePushOut(w2,p,SD.DIVE_BODY.r,n);}return p.z>1;};
 assert(pass(1.45),'1.45 m passes');assert(!pass(1.15),'1.15 m is blocked');
 const wall=SD.diveSolidWorld([SD.diveSolidBox('wall',0,0,0,I,10,3,.04)]),p={x:-3,y:0,z:-2},n={x:0,y:0,z:0};
 for(let i=0;i<40;i++){p.x+=.1;p.z+=.1;SD.divePushOut(wall,p,SD.DIVE_BODY.r,n);}assert(p.x>.9&&p.z<0,'slides along the wall: '+p.x.toFixed(2)+','+p.z.toFixed(2));
});
ok('every pickup, find, the friend and today\'s sparkle stay reachable from the start (a free-space grid of the water)',()=>{
 for(const z of D.DIVE_SPOTS){const w=roomOf(z).solids,fl=z.floor,s=S.createDiveSession();s.scan(.2,z.x,z.z,true);assert(s.start());
  const G=.6,N=Math.ceil(D.DIVE_ROOM_R*2/G),LV=6,idx=(i,j,l)=>(l*N+j)*N+i,free=new Uint8Array(N*N*LV),seen=new Uint8Array(N*N*LV),rng={min:0,max:0};
  const pos=(i,j,l)=>{const x=-D.DIVE_ROOM_R+(i+.5)*G,zz=-D.DIVE_ROOM_R+(j+.5)*G;D.diveDepthRange(x,zz,fl,rng);return {x,z:zz,y:rng.max-(rng.max-rng.min)*l/(LV-1)};};
  for(let l=0;l<LV;l++)for(let j=0;j<N;j++)for(let i=0;i<N;i++){const p=pos(i,j,l);if(Math.hypot(p.x,p.z)>D.DIVE_ROOM_R-1)continue;free[idx(i,j,l)]=SD.divePenetration(w,p.x,p.y+SD.DIVE_BODY.cy,p.z,SD.DIVE_BODY.r)>0?0:1;}
  const ci=x=>Math.max(0,Math.min(N-1,Math.floor((x+D.DIVE_ROOM_R)/G)));let q=[];
  for(let l=0;l<LV;l++){const k=idx(ci(s.state.x),ci(s.state.z),l);if(free[k]){seen[k]=1;q.push(k);}}assert(q.length,z.id+' start is free');
  while(q.length){const nq=[];for(const k of q){const l=Math.floor(k/(N*N)),j=Math.floor(k/N)%N,i=k%N;
   for(const [di,dj,dl] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const a=i+di,b=j+dj,c=l+dl;if(a<0||b<0||c<0||a>=N||b>=N||c>=LV)continue;const m=idx(a,b,c);if(free[m]&&!seen[m]){seen[m]=1;nq.push(m);}}}q=nq;}
  const near=(x,y,zz,r,name)=>{for(let l=0;l<LV;l++)for(let j=0;j<N;j++)for(let i=0;i<N;i++){if(!seen[idx(i,j,l)])continue;const p=pos(i,j,l);if(Math.hypot(p.x-x,p.y-y,p.z-zz)<=r)return;}assert.fail(`${z.id}: ${name} unreachable`);};
  J.journeyPickups(z).forEach((p,i)=>near(p.x,p.y,p.z,J.PICKUP_RANGE,'pickup '+i));
  const fp={x:0,y:0,z:0};for(const f of z.finds){D.diveFindPoint(f,fp,fl);near(fp.x,fp.y,fp.z,D.DIVE_FIND_RANGE,'find '+f.id);}
  const fh=DL.friendHome(z);near(fh.x,fh.y,fh.z,DL.EMOTE.range,'friend');
  for(const day of ['2026-10-21','2026-10-22','2026-11-03']){const sp=SP.sparkleSpot(z,day);near(sp.x,sp.y+1,sp.z,SP.SPARKLE.reach,'sparkle '+day);}}
});
ok('collision: no allocation in the step or the push-out; the camera pulls in at the first solid; the push-out is cheap',()=>{
 const src=read('lib/town/water/diveSolids.ts');for(const fn of ['function pen(','export function divePushOut','export function diveClearFrac']){const b=src.slice(src.indexOf(fn),src.indexOf('\n}',src.indexOf(fn)));assert(!/new [A-Z]|\[\]|=>\{/.test(b.replace(/\/\/.*$/gm,'')),'no allocation in '+fn);}
 const ss=read('lib/town/water/diveSession.ts'),c=ss.slice(ss.indexOf(' function collide('),ss.indexOf('state.x=cp.x;'));assert(!/new [A-Z]|\[\]/.test(c));
 assert(read('lib/graphics/diveRoom.ts').includes('diveClearFrac(world,'),'the follow camera checks the solids');
 const w=roomOf(D.diveSpotById('captains-cup')).solids,p={x:0,y:0,z:0},n={x:0,y:0,z:0},t0=process.hrtime.bigint();
 for(let i=0;i<20000;i++){p.x=(i%40)-20;p.y=-2;p.z=((i*7)%40)-20;SD.divePushOut(w,p,.5,n);}const us=Number(process.hrtime.bigint()-t0)/1e3/20000;
 console.log(`     push-out ${us.toFixed(2)} µs per call, at most ${w.maxTested} solids tested`);assert(us<50);
});
console.log(`\nexplore-life: ${passed} passed`);
