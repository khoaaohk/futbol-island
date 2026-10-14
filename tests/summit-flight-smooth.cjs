// Summit Isle flight smoothing (Oct 13 2026, user: "when flying up and down the mountain, it's a little bumpy, can we have that be
// more smooth?", then "it's making the character fly really high and unable to land"). Flies the jetpack over and round the
// mountain on many headings at 20, 30 and 60 fps (Town's tick is a fixed 60 Hz, but the lift is checked at every frame rate) and
// asserts: no bumps (vertical acceleration and jerk caps), never inside the rock (a margin over the real ground, the hard floor
// never needed), the same path at every frame rate, no soaring on take-off, landings on the pitch / a slope / a beach, exact
// zero lift over Coral Cay and the main island, and a camera pull-in that eases instead of popping.
// usage: node tests/summit-flight-smooth.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Float32Array,Float64Array,Uint8Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const S=load('lib/town/summitIsle.ts'),{createRooftopTravel}=load('lib/town/rooftopTravel.ts'),{stepPlayer}=load('lib/town/simulation.ts');
const PK=S.SUMMIT_PEAK,D=Math.PI/180;

// ---- The envelope: smooth, and never under the ground it was built from.
{const g=S.summitHeightGrid();assert(g.nx*g.nz<60000,'a small grid (built once)');
 let under=0;for(let x=S.SUMMIT_BOX.minX;x<S.SUMMIT_BOX.maxX;x+=1.3)for(let z=S.SUMMIT_BOX.minZ;z<S.SUMMIT_BOX.maxZ;z+=1.3)under=Math.max(under,S.summitGround(x,z)-S.summitEnvelope(x,z));
 assert(under<1.5,`the envelope stays over the ground (worst ${under.toFixed(2)} m under, inside the 9 m clearance)`);
 assert(Math.abs(S.summitGridGround(PK.x,PK.z)-S.summitGround(PK.x,PK.z))<.05,'the grid ground matches the real ground');}

// ---- Flight paths: the jetpack's own steering (velocity eases toward 34 m/s at the stick, 5/s), at the 28 m cruise height.
function fly(carrot,T,fps,base=28){const dt=1/fps,lift=S.createSummitFlightLift(),out=[];const p={...carrot(0,null)},v={x:0,z:0};
 {const c=carrot(0,p),dx=c.x-p.x,dz=c.z-p.z,d=Math.hypot(dx,dz)||1;v.x=dx/d*34;v.z=dz/d*34;}
 for(let i=0;i<=Math.round(T*fps);i++){if(i){const c=carrot(i*dt,p),dx=c.x-p.x,dz=c.z-p.z,d=Math.hypot(dx,dz)||1,b=1-Math.exp(-dt*5);v.x+=(dx/d*34-v.x)*b;v.z+=(dz/d*34-v.z)*b;p.x+=v.x*dt;p.z+=v.z*dt;}
  out.push({t:i*dt,h:base+lift.update(p.x,p.z,v.x,v.z,base,dt),g:S.summitGround(p.x,p.z)});}
 return {out,dt,floorHits:lift.floorHits};}
const PATHS={};
for(let deg=0;deg<360;deg+=30){const a=deg*D,s={x:PK.x-Math.cos(a)*230,z:PK.z-Math.sin(a)*230},e={x:PK.x+Math.cos(a)*400,z:PK.z+Math.sin(a)*400};PATHS['across from '+deg+'°']=[(t,p)=>p?e:s,18];}
for(const R of [45,60,80,100])PATHS['round the peak at '+R+' m']=[(t,p)=>{if(!p)return {x:PK.x,z:PK.z-260};const r=Math.hypot(p.x-PK.x,p.z-PK.z),th=Math.atan2(p.z-PK.z,p.x-PK.x),lead=r>R+25?.25:.6;return {x:PK.x+Math.cos(th+lead)*R,z:PK.z+Math.sin(th+lead)*R};},28];
PATHS['zig-zag over spurs and gullies']=[(t,p)=>{if(!p)return {x:PK.x-200,z:PK.z-60};return {x:p.x+30,z:PK.z+(Math.floor(t/2.4)%2?55:-55)};},14];
const ACCEL_MAX=12,JERK_MAX=30,MARGIN=FLOOR=>FLOOR+2;
const stats={};
for(const [name,[carrot,T]] of Object.entries(PATHS)){const runs={};
 for(const fps of [20,30,60]){const r=fly(carrot,T,fps),o=r.out,dt=r.dt;let amax=0,jmax=0,clear=Infinity,prevA=null;
  for(let i=0;i<o.length;i++){clear=Math.min(clear,o[i].h-o[i].g);if(i>=2){const a=(o[i].h-2*o[i-1].h+o[i-2].h)/dt/dt;amax=Math.max(amax,Math.abs(a));if(prevA!==null)jmax=Math.max(jmax,Math.abs(a-prevA)/dt);prevA=a;}}
  assert(amax<=ACCEL_MAX,`${name} @${fps} fps: vertical acceleration ${amax.toFixed(1)} m/s² (≤ ${ACCEL_MAX})`);
  assert(jmax<=JERK_MAX,`${name} @${fps} fps: vertical jerk ${jmax.toFixed(1)} m/s³ (≤ ${JERK_MAX}: no bumps)`);
  assert(clear>=MARGIN(S.FLIGHT_FLOOR),`${name} @${fps} fps: ${clear.toFixed(1)} m over the ground at the closest`);
  assert.equal(r.floorHits,0,`${name} @${fps} fps: the hard floor is never needed`);
  runs[fps]=o;stats.amax=Math.max(stats.amax??0,amax);stats.jmax=Math.max(stats.jmax??0,jmax);stats.clear=Math.min(stats.clear??Infinity,clear);}
 // The same flight at every frame rate (sampled every 0.1 s).
 let diff=0;for(let k=0;k<runs[20].length;k+=2){const t=runs[20][k].t,a=runs[60][Math.round(t*60)],b=runs[30][Math.round(t*30)];if(a&&b)diff=Math.max(diff,Math.abs(runs[20][k].h-a.h),Math.abs(b.h-a.h));}
 assert(diff<1,`${name}: 20/30/60 fps agree within ${diff.toFixed(2)} m`);stats.diff=Math.max(stats.diff??0,diff);
 // It climbs over the top, and is back at the cruise height well past the island.
 if(name.startsWith('across')){const o=runs[60];assert(Math.max(...o.map(p=>p.h))>=S.SUMMIT_HEIGHT+5,`${name}: clears the summit`);assert(o[o.length-1].h<28.5,`${name}: settles back to the cruise height`);}}

// ---- Settling back after the peak is gentle (the sink rate cap), and no sudden drop.
{const o=fly(PATHS['across from 0°'][0],18,60).out;let sink=0;for(let i=1;i<o.length;i++)sink=Math.max(sink,(o[i-1].h-o[i].h)*60);assert(sink<=S.FLIGHT_MAX_SINK+.05,`descends at ≤ ${S.FLIGHT_MAX_SINK} m/s (${sink.toFixed(2)})`);}

// ---- Away from the mountain (Coral Cay, the main island, open sea): exactly the normal flight, no work after four comparisons.
{const lift=S.createSummitFlightLift();for(const [x,z] of [[103,-8],[600,-150],[700,-200],[-50,100]])for(let i=0;i<30;i++)assert.equal(lift.update(x,z,30,0,28,1/60),0,`no lift at ${x},${z}`);
 assert.equal(S.createSummitFlightLift().update(640,-120,0,34,28,1/60),0,'none over Coral Cay');}

// ---- Town's jetpack: take off near / on the island, fly over it, ask to land. Never soars; lands on the ground below.
function townFlight(start,dir,flySecs){const loc={...start},vel={x:0,z:0},roof=createRooftopTravel([],[],loc);roof.reset(loc.x,loc.z);const lift=S.createSummitFlightLift();
 const flight={cruise:28,height:roof.state.height,start:roof.state.height,takeoff:0,landTime:-1,landHeight:0,landing:null};const dt=1/60;let top=0,minClear=Infinity;
 const liftJetpack=()=>{flight.takeoff=Math.min(1.05,flight.takeoff+dt);const q=flight.takeoff/1.05-1;flight.height=flight.start+(flight.cruise-flight.start)*(1+1.9*q*q*q+.9*q*q);};
 for(let i=0;i<60*60;i++){const t=i*dt;if(t>=flySecs&&!flight.landing)flight.landing=roof.findLanding(loc.x,loc.z);
  const target=flight.landing;
  if(target){const dx=target.x-loc.x,dz=target.z-loc.z,d=Math.hypot(dx,dz);
   if(d>.1){liftJetpack();flight.height+=lift.update(loc.x,loc.z,dx/d*20,dz/d*20,flight.height,dt);if(flight.takeoff>=1.05){const s=Math.min(d,dt*20);loc.x+=dx/d*s;loc.z+=dz/d*s;}}
   else{const floor=roof.surface(target.x,target.z);if(flight.landTime<0){flight.landTime=0;flight.landHeight=flight.height;}flight.landTime=Math.min(.95,flight.landTime+dt);const u=Math.min(1,flight.landTime/.95/.72);flight.height=flight.landHeight+(floor-flight.landHeight)*u*u*(3-2*u);
    if(flight.landTime>=.95)return {landed:true,height:flight.height,floor,top,minClear,at:{...loc}};}}
  else{liftJetpack();const dl=Math.hypot(dir.x,dir.z),look=flight.takeoff<1.05&&dl>.01?34/Math.max(1,dl):0;flight.height+=lift.update(loc.x,loc.z,look?dir.x*look:vel.x,look?dir.z*look:vel.z,flight.height,dt);if(flight.takeoff>=1.05)stepPlayer(loc,vel,{x:dir.x,z:dir.z,sprint:false},dt,[],'jetpack');}
  top=Math.max(top,flight.height);if(flight.takeoff>=1.05&&flight.landTime<0)minClear=Math.min(minClear,flight.height-S.summitGround(loc.x,loc.z));}
 return {landed:false,top};}
const L=S.SUMMIT_LANDMARKS,clearances=[];
for(const [label,start,dir,secs] of [['sandbar, up the north face',L.sandbarLanding,{x:.3,z:1},4],['sandbar, over the summit',L.sandbarLanding,{x:.25,z:.9},6],['west beach, onto the slopes',L.westBeach,{x:1,z:0},3],['east beach, over the top',L.eastBeach,{x:-1,z:0},5],['the pitch, straight back down',L.pitch,{x:0,z:0},2.5],['north beach, along the coast',L.northBeach,{x:1,z:.15},6]]){
 const r=townFlight(start,dir,secs);assert(r.landed,`${label}: lands`);
 assert(r.top<S.SUMMIT_HEIGHT+16,`${label}: never soars (top ${r.top.toFixed(1)} m)`);
 assert(Math.abs(r.height-r.floor)<.02,`${label}: feet on the ground after landing`);
 // Every take-off keeps a real margin over the rock, the steep north face straight after the sandbar take-off included (Oct 13
 // 2026: that one skimmed ~2 m over the top; the lift now looks where the stick points during the take-off, as Town does).
 assert(r.minClear>=4,`${label}: at least 4 m over the ground all the way (closest ${r.minClear.toFixed(1)} m)`);clearances.push(r.minClear);}

// ---- The camera pull-in: continuous (no ladder of steps) and eased (rock coming between closes in over ~0.2 s, never a pop).
{const p=S.heightPoint(-Math.PI/2,14),h=S.summitGround(p.x,p.z);const raw=S.summitCameraPull(p.x,p.z,h,p.x+18,h+23,p.z+30);assert(raw<1,'pulled in on the north slopes');
 const cam=S.createSummitCameraPull();let prev=1,step=0;for(let i=0;i<60;i++){const f=cam.update(p.x,p.z,h,p.x+18,h+23,p.z+30,1/30);step=Math.max(step,Math.abs(f-prev));prev=f;}
 assert(Math.abs(prev-raw)<.01,'eases to the pull-in');assert(step<.2,`no pop: at most ${(step*100).toFixed(0)}% of the offset per frame`);
 assert.equal(S.createSummitCameraPull().update(103,-8,0,121,23,22,1/30),1,'no change away from the island');
 // Sliding the player along a slope: the raw pull-in changes in small steps, the eased one even less.
 const c2=S.createSummitCameraPull();{const q=S.heightPoint(-Math.PI/2,14),y=S.summitGround(q.x,q.z);for(let i=0;i<60;i++)c2.update(q.x,q.z,y,q.x+18,y+23,q.z+30,1/30);}
 let rawStep=0,easedStep=0,pr=null,pe=null;for(let i=0;i<240;i++){const a=-Math.PI/2+i*.01,q=S.heightPoint(a,14),y=S.summitGround(q.x,q.z),r=S.summitCameraPull(q.x,q.z,y,q.x+18,y+23,q.z+30),e=c2.update(q.x,q.z,y,q.x+18,y+23,q.z+30,1/30);if(pr!==null){rawStep=Math.max(rawStep,Math.abs(r-pr));easedStep=Math.max(easedStep,Math.abs(e-pe));}pr=r;pe=e;}
 assert(easedStep<=rawStep+1e-9&&easedStep<.1,`eased camera steps ${easedStep.toFixed(3)} ≤ raw ${rawStep.toFixed(3)}`);}

// ---- Framing after a landing on a slope (Oct 13 2026: it zoomed to 12% of the offset, into the player's back): the camera rises
// first, dollies in only where rising 8 m is not enough, never closer than 35%, and keeps a clear sight line.
{let pts=0,pulled=0,minPull=1,blocked=0;const B=S.SUMMIT_BOX,g=S.summitGridGround;
 for(let x=B.minX;x<B.maxX;x+=5)for(let z=B.minZ;z<B.maxZ;z+=5){const y=S.summitGround(x,z);if(y<.5)continue;pts++;const f=S.summitCameraFrame(x,z,y,x+18,y+23,z+30);
  minPull=Math.min(minPull,f.pull);if(f.pull<1){pulled++;assert(f.lift>=S.CAMERA_LIFT_FREE-1e-6,'dollies in only once risen');}
  const cx=x+18*f.pull,cz=z+30*f.pull,cy=y+23*f.pull+f.lift;if(g(cx,cz)+2.4>cy)blocked++;}
 assert(minPull>=S.CAMERA_MIN_PULL-1e-9,`never closer than ${S.CAMERA_MIN_PULL} (${minPull.toFixed(2)})`);
 assert(pulled/pts<.15,`the normal distance almost everywhere (pulled in at ${pulled} of ${pts} spots)`);assert.equal(blocked,0,'the camera never inside the hill');
 // Eased: the rise never jumps either.
 const cam=S.createSummitCameraPull(),q=S.heightPoint(-Math.PI/2,20),y=S.summitGround(q.x,q.z);let prev=0,step=0;for(let i=0;i<60;i++){cam.update(q.x,q.z,y,q.x+18,y+23,q.z+30,1/30);step=Math.max(step,Math.abs(cam.lift-prev));prev=cam.lift;}
 assert(cam.lift>S.CAMERA_LIFT_FREE&&step<3,`the rise eases in (≤ ${step.toFixed(2)} m per frame)`);
 const town=fs.readFileSync('components/Town.tsx','utf8');assert(town.includes('camTarget.y+=summitCamera.lift'),'Town lifts the camera');}

// ---- Wiring and heat: Town uses the eased lift and camera, resets the lift on take-off; per frame only grid reads.
{const town=fs.readFileSync('components/Town.tsx','utf8'),src=fs.readFileSync('lib/town/summitIsle.ts','utf8');
 assert(town.includes('summitCamera.update(')&&town.includes('summitFlight.reset()')&&town.includes('createSummitFlightLift()'),'Town wires the eased lift and camera');
 const body=src.slice(src.indexOf('export function createSummitFlightLift'));const update=body.slice(0,body.indexOf('\n}\n'));
 assert.equal((update.match(/summitGround\(/g)||[]).length,1,'one real ground read per update (the hard floor); the rest are grid reads');}
console.log(`PASS summit flight smooth: ${Object.keys(PATHS).length} paths × 20/30/60 fps; max vertical accel ${stats.amax.toFixed(1)} m/s², jerk ${stats.jmax.toFixed(1)} m/s³, closest ${stats.clear.toFixed(1)} m over the ground, fps spread ${stats.diff.toFixed(2)} m; take-offs never soar and keep ≥ ${Math.min(...clearances).toFixed(1)} m over the rock; landings on the pitch, slopes and beaches; camera pull-in eased`);
