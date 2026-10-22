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
const C=load('lib/town/water/diveCurrent.ts');
ok('heat: the room draws at 1.25 moving / 1.5 still on phones (desktop uncapped), 12 fps after a minute of rest; wired in the dive branch',()=>{
 assert.equal(C.divePixelCap(true,true),1.25);assert.equal(C.divePixelCap(true,false),1.5);assert.equal(C.divePixelCap(false,true),Infinity);
 assert.equal(C.diveRestFrame(0,1e6),0);assert.equal(C.diveRestFrame(50,1000),50);assert(Math.abs(C.diveRestFrame(50,60000)-1000/12)<1e-9);assert.equal(C.diveRestFrame(1000/15,90000),1000/12);
 const Q=load('lib/graphics/quality.ts'),m=new Q.MotionResolution(1.75,true);assert.equal(m.update(0,true,false,false,1.25),1.25);assert.equal(m.update(10,true),1.5);
 const town=read('components/Town.tsx');assert(town.includes('divePixelCap(quality.phone,!dive.resting)')&&town.includes('diveRestFrame(rest0,'));
});
ok('heat: school fish use the 92-triangle reef fish (was 380-430); every phone room has fewer triangles than the baseline, draws unchanged',()=>{
 const F=load('lib/graphics/diveFish.ts');for(const id of Object.keys(F.REEF_FISH)){const g=F.reefFishModel(id).geometry;assert(g.getAttribute('position').count/3<=C.DIVE_SCHOOL_FISH_TRIS,id);assert(!g.index);g.dispose();}
 // baseline (Oct 21 2026, before Explore life): phone draws / triangles per zone
 const BASE={'captains-cup':[17,63817],'pauls-grotto':[16,46932],'kelp-trawler':[15,51964],'ray-meadow':[15,30828],'moon-arch':[14,41386],'ball-crate':[16,68122],'turtle-pool':[14,41763]};
 const rows=[];for(const z of D.DIVE_SPOTS){const st=roomOf(z).stats(),[d,t]=BASE[z.id];assert(st.draws<=d,z.id+' draws '+st.draws);assert(st.triangles<=t,z.id+' triangles '+st.triangles);rows.push(`${z.id}:${st.draws}/${st.triangles}`);}
 console.log('     phone rooms (draws/triangles): '+rows.join(' '));
});
ok('see-through when close: soft things fade from 1 at 2.5 m to 0.15 at 0.8 m (diver or the camera line), dithered, from the shared uniforms; solids never fade',()=>{
 const P=load('lib/graphics/proximityFade.ts');assert.equal(P.proximityFade(10),1);assert.equal(P.proximityFade(P.PROXIMITY_FADE.far),1);assert(Math.abs(P.proximityFade(0)-.15)<1e-9);assert(Math.abs(P.proximityFade(.8)-.15)<1e-9);
 let prev=0;for(let d=0;d<=3;d+=.05){const v=P.proximityFade(d);assert(v>=prev-1e-12&&v>=.15&&v<=1);prev=v;}
 const src=read('lib/graphics/diveRoom.ts');assert.equal((src.match(/dvProxFade\(/g)||[]).length,3,'fish, sway, the friend');assert.equal((src.match(/dvDitherDiscard\(vDvFade\)/g)||[]).length,3);
 assert(src.includes('const seeThrough=!(opt.calm||opt.lite)'),'compiled out when calm / lite');assert(!/reefMat[^\n]*PROXIMITY/.test(src),'the reef (rocks, wreck) never fades');
 assert(P.PROXIMITY_DITHER_GLSL.includes('discard')&&!/new |\[\]/.test(P.PROXIMITY_FADE_GLSL));
});
ok('water movement: one current and swell (bounded sway, travelling down-current), plants / plankton / rays / camera follow it',()=>{
 const K=C.DIVE_CURRENT;assert(Math.abs(Math.hypot(K.dir[0],K.dir[1])-1)<1e-9);
 let mx=0;for(let t=0;t<30;t+=.13)for(let x=-20;x<=20;x+=5){const s=C.diveSwell(t,x,x*.5);assert(s>=-1&&s<=1);for(const w of [0,.5,1]){const v=C.diveSway(t,x,0,w,1.3);assert(Math.abs(v)<=(K.surge*1.35+K.flutter)*w*w+1e-9);mx=Math.max(mx,Math.abs(v));}}
 assert(mx>.15,'it really sways');assert.notEqual(C.diveSwell(2,0,0).toFixed(3),C.diveSwell(2,10,0).toFixed(3),'neighbours lean one after another');
 const src=read('lib/graphics/diveRoom.ts');assert.equal((src.match(/\$\{DIVE_CURRENT_GLSL\}|\+DIVE_CURRENT_GLSL/g)||[]).length,3,'sway, plankton, rays share the current');assert(src.includes('DIVE_BREATH_M*Math.sin('));
});
ok('light: absorption (red first, floored), wide soft shafts along one sun direction within the old ray triangles, Snell\'s window rim',()=>{
 const a=C.diveAbsorb(0),b=C.diveAbsorb(5),c=C.diveAbsorb(50);assert(a[0]===1&&a[1]===1&&a[2]===1);assert(b[0]<b[1]&&b[1]<b[2],'red fades first');for(let i=0;i<3;i++)assert(c[i]>=C.DIVE_ABSORB.floor[i]-1e-9);
 for(const z of [D.diveSpotById('captains-cup')]){let rays=null;roomOf(z).scene.traverse(o=>{if(o.name==='dive-rays')rays=o;});assert(rays.geometry.getAttribute('position').count/3<=44,'phone rays within the old 44 triangles');}
 const src=read('lib/graphics/diveRoom.ts');assert(src.includes('dvRw=dvDep*1.134'),'Snell window');assert(src.includes('vDvAbs=dvAbsorb('),'absorption per vertex (no fragment exp)');
});
ok('life: living coral colour, bottom dwellers in the reef draw, fish surge and coast, the diver glides with arms back and breathes out in bursts',()=>{
 const src=read('lib/graphics/diveRoom.ts');assert(src.includes('const live=(c:C')&&src.includes('sea stars, urchins'));assert(src.includes('float dvTp=dvT+'));assert(src.includes('mod(uDiveTime-fract(aB.w)*.45,3.4)'));
 assert(read('lib/graphics/swimPose.ts').includes('streamlined glide'));
});
ok('▲ at the top surfaces: held there 0.35 s (or a fresh tap at the top) rises out the old Surface way; no Surface button remains',()=>{
 assert.equal(S.DIVE_TOP_SURFACE_S,.35);let h=0;for(let i=0;i<10;i++)h=S.diveTopHold(h,true,1,1/30);assert(!S.diveTopSurfaces(h,1,1,true));for(let i=0;i<1;i++)h=S.diveTopHold(h,true,1,1/30);assert(S.diveTopSurfaces(h,1,1,true),'0.35 s');
 assert.equal(S.diveTopHold(.3,false,1,.1),0);assert.equal(S.diveTopHold(.3,true,0,.1),0);assert(S.diveTopSurfaces(0,1,0,true),'a fresh tap at the top');assert(!S.diveTopSurfaces(0,1,0,false));
 const spot=D.diveSpotById('ray-meadow'),s=S.createDiveSession();s.scan(.2,spot.x,spot.z,true);assert(s.start());let n=0;while(s.state.phase==='diving'&&n<400){s.step(1/30,{sx:0,sy:0,lift:1});n++;}
 assert.equal(s.state.phase,'rising');assert.equal(s.state.risingFor,'tap','the same exit as the old Surface button');
 const H=load('lib/town/water/waterHud.ts');assert(!('DIVE_SURFACE' in H)&&!H.REEF_BUTTONS.some(b=>b.id==='surface')&&!H.REEF_BUTTONS_FLY.some(b=>b.id==='surface'));
 assert(!/\[data-job-action=surface\]/.test(read('app/globals.css')),'no Surface cell');
});
ok('every room shader patch resolves (no stray ${...} in the GLSL, every hook found), lite and full',()=>{
 for(const lite of [false,true]){const z=D.diveSpotById('captains-cup'),room=R.createDiveRoom(z,{phone:true,reduced:false,found:[],pickups:J.journeyPickups(z),lite,friend:{kind:'crab',x:0,y:0,z:0}});
  room.scene.traverse(o=>{const m=o.material;if(!m)return;const lib=m.isMeshLambertMaterial?T.ShaderLib.lambert:m.isMeshBasicMaterial?T.ShaderLib.basic:null;
   if(m.onBeforeCompile&&lib&&m.onBeforeCompile.toString().length>20){const sh={uniforms:{},vertexShader:lib.vertexShader,fragmentShader:lib.fragmentShader};m.onBeforeCompile(sh);
    for(const k of ['vertexShader','fragmentShader'])assert(!sh[k].includes('${'),`${o.name} ${k} has a stray \${`);}
   if(m.isShaderMaterial)for(const k of ['vertexShader','fragmentShader'])assert(!m[k].includes('${'),o.name);});room.dispose();}
});
console.log(`\nexplore-life: ${passed} passed`);
