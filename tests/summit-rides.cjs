// Summit Isle on the ground (Oct 13 2026, user: "also allow to ride bikes, scooters, and mopeds up and down the mountain", "allow
// riding down and up the island, the paths is blocking that. also the path is not all connected and not usable", "don't allow
// going into trees and bushes", "also allow landing on different areas of the mountain").
//  - The trail network is one connected route (sandbar → climb → summit gate, the east beach path joining the climb), within the
//    walk limit everywhere, ground-following, and clear of every collider for a ride.
//  - Scooter, bike and moped ride the trail up and back down and straight up and down the foothills at 60 Hz ticks: no falls or
//    launches, slower uphill, a capped speed downhill; drawn at 20/30/60 fps through the suspension: smoother than the raw
//    ground, never further from the wheels' ground than its travel, the pitch easing.
//  - Trees and bushes are solid to walkers and rides; the jetpack flies over them.
//  - Landing: any walkable spot clear of trees lands; steep faces refuse and the nearest walkable spot is offered instead.
// Then (user: "still stuck and can't go up the mountain with the bike", "some areas can't go down", "the trail is also very
// disconnected", "when going down the mountain, have it jump off ledges and animate the landing"):
//  - Hill assist: from 16 sampled slope points round the mountain (and the two spots in the user's screenshots) each ride, steered
//    straight at the summit gate (round the pitch's fence), arrives in time and never stalls; steered straight at the nearest
//    beach, gets there too. At 20/30/60 fps (Town's 60 Hz ticks, the stick read once per drawn frame).
//  - The trail is drawn as one continuous ribbon: straight down onto SUMMIT_PATHS (7 points across its width every 0.25 m), the
//    first thing hit is the path, facing up, at ≥ 99% of the points; drawn within a few cm of the walked ground.
//  - Hops: going downhill fast off a crest leaves the ground (> 0.2 s in the air), lands, never below the ground or absurdly high;
//    none when slow, none on the trail; the touchdown compresses the drawn ride's suspension.
// usage: node tests/summit-rides.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Float32Array,Float64Array,Uint8Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const S=load('lib/town/summitIsle.ts'),RS=load('lib/town/rideSlope.ts'),{createRooftopTravel}=load('lib/town/rooftopTravel.ts');
const {blocked,insideObstacle,flightBlocked,TRUNK_CLEARANCE}=load('lib/town/simulation.ts'),{TRAVEL_MODES}=load('lib/town/travelModes.ts'),{fieldSurfaceHeight}=load('lib/town/venues.ts');
const T=require('three');
// The island's own colliders (trees, palms, bushes, rocks, the fence, props), from the real build with stub tools.
const obstacles=[],assets=[],town=new T.Group();{const W=load('lib/town/summitIsleWorld.ts'),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
 W.buildSummitIsle({box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,10));m.position.set(x,y,z);return m;},
  sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},town,obstacles,assets,surfaceAreas:[]});
 // The activity props too (the Summit Kick post once stood on the trail's last metres into the gate).
 load('lib/town/summitActivitiesWorld.ts').buildSummitActivityProps({box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,8));m.position.set(x,y,z);return m;},
  put:(g,c,x,y,z)=>{const m=mk(g);m.position.set(x,y,z);return m;},sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},obstacles});
 // The painting easel's easel, stool and paint table (Oct 14 2026) are colliders on the west slope too.
 load('lib/town/paintEaselWorld.ts').buildPaintEasel({box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,8));m.position.set(x,y,z);return m;},put:(g,c,x,y,z)=>{const m=mk(g);m.position.set(x,y,z);return m;},obstacles});}
const P=S.SUMMIT_PATHS,L=S.SUMMIT_LANDMARKS;

// ---- One connected trail network.
const dense=line=>{const out=[];for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.5));for(let k=0;k<n;k++)out.push({x:a.x+(b.x-a.x)*k/n,z:a.z+(b.z-a.z)*k/n});}out.push(line[line.length-1]);return out;};
{const near=(p,line)=>Math.min(...dense(line).map(q=>Math.hypot(q.x-p.x,q.z-p.z)));
 assert(Math.hypot(P[0][P[0].length-1].x-P[1][0].x,P[0][P[0].length-1].z-P[1][0].z)<.3,'the sandbar path runs into the climb');
 assert(near(P[2][P[2].length-1],P[1])<.3,'the east beach path joins the climb (it used to stop 45 m short)');
 assert(Math.hypot(P[0][0].x-L.sandbarLanding.x,P[0][0].z-L.sandbarLanding.z)<3,'starts at the sandbar landing');
 assert(Math.hypot(P[1][P[1].length-1].x-L.gate.x,P[1][P[1].length-1].z-L.gate.z)<3,'ends at the summit gate');
 for(const line of P){const d=dense(line);for(let i=1;i<d.length;i++){const a=d[i-1],b=d[i],run=Math.hypot(b.x-a.x,b.z-a.z);assert(run<.6,'no gaps along a path');
   const rise=Math.abs(S.summitGround(b.x,b.z)-S.summitGround(a.x,a.z));assert(rise/run<=S.SUMMIT_WALK_SLOPE,'within the walk limit along its whole length');}
  for(const q of d){assert(S.onSummitLand(q.x,q.z),`walkable at ${q.x.toFixed(1)},${q.z.toFixed(1)}`);
   assert(!blocked(q.x,q.z,obstacles,.8),`no collider blocks a ride at ${q.x.toFixed(1)},${q.z.toFixed(1)}`);}}
 // The tread is level across (ground-following, no floating or buried strip): 1.5 m either side of the centre line (not at the
 // east path's join, where two treads meet at an angle).
 for(const line of P){const d=dense(line);for(let i=1;i<d.length-1;i+=5){const a=d[i-1],b=d[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,q=d[i];
  const join=P[2][P[2].length-1];if(S.terraceWeight(q.x,q.z)>0||Math.hypot(q.x-join.x,q.z-join.z)<16)continue;const across=Math.abs(S.summitGround(q.x+nx*1.5,q.z+nz*1.5)-S.summitGround(q.x-nx*1.5,q.z-nz*1.5));assert(across<.35,`a level tread across the trail at ${q.x.toFixed(1)},${q.z.toFixed(1)} (${across.toFixed(2)} m)`);}}
 // Stepping off the trail sideways is never walled in where the slope beside it is walkable (the cut banks are gentle).
 let sideways=0,open=0;for(const line of P)for(const q of dense(line).filter((_,i)=>i%10===5)){for(const s of [-1,1]){const k=dense(line).indexOf(q),n=dense(line)[Math.min(k+1,dense(line).length-1)],dx=n.x-q.x,dz=n.z-q.z,l=Math.hypot(dx,dz)||1,ox=q.x-dz/l*s*8,oz=q.z+dx/l*s*8;
   if(!S.onSummitLand(ox,oz)||S.summitSlope(ox,oz)>.45)continue;sideways++;let ok=true;for(let t=0;t<=8;t+=.5)if(!S.onSummitLand(q.x+(ox-q.x)*t/8,q.z+(oz-q.z)*t/8))ok=false;if(ok)open++;}}
 assert(sideways>20&&open/sideways>.9,`off the trail onto gentle ground, sideways: ${open}/${sideways} open`);}

// ---- Riding: up the trail to the summit gate and back down, on each ride, at 60 Hz ticks (Town's fixed step).
function ride(mode,route){const p={...route[0]},v={x:0,z:0},roof=createRooftopTravel([],obstacles,p);roof.reset(p.x,p.z);const out=[];let k=0;
 for(let i=0;i<60*300&&k<route.length-1;i++){while(k<route.length-1&&Math.hypot(route[k].x-p.x,route[k].z-p.z)<3)k++;const c=route[k],dx=c.x-p.x,dz=c.z-p.z,d=Math.hypot(dx,dz)||1,px=p.x,pz=p.z;
  roof.update(1/60,p,v,{x:dx/d,z:dz/d,sprint:false},mode);out.push({px,pz,x:p.x,z:p.z,h:roof.state.height,g:fieldSurfaceHeight(p.x,p.z),sp:Math.hypot(v.x,v.z),falling:roof.state.falling,air:roof.state.air,grade:RS.summitGrade(p.x,p.z,dx/d,dz/d)});}
 return {out,done:k>=route.length-1};}
function draw(ticks,fps,mode,suspended){const out=[],susp=RS.createRideSuspension(),front=(mode==='scooter'?.5:.62)*1.12,rear=(mode==='scooter'?.4:.53)*1.12;
 for(let f=0;f/fps<ticks.length/60-1/60;f++){const t=f/fps,i=Math.min(ticks.length-1,Math.floor(t*60)),a=t*60-i,k=ticks[i],x=k.px+(k.x-k.px)*a,z=k.pz+(k.z-k.pz)*a,n=ticks[Math.min(ticks.length-1,i+3)],yaw=Math.atan2(n.x-k.px,n.z-k.pz);
  const hf=fieldSurfaceHeight(x+Math.sin(yaw)*front,z+Math.cos(yaw)*front),hr=fieldSurfaceHeight(x-Math.sin(yaw)*rear,z-Math.cos(yaw)*rear),wheels=(hf*rear+hr*front)/(front+rear),pitch=Math.atan2(hr-hf,front+rear);
  const s=suspended?susp.update(1/fps,wheels,pitch):{y:wheels,pitch};out.push({y:s.y,pitch:s.pitch,wheels});}
 return out;}
const p99=a=>{const s=a.map(Math.abs).sort((x,y)=>x-y);return s[Math.floor(s.length*.99)];};
const rideStats={};
const up=[...P[0],...P[1]],down=[...up].reverse();
for(const mode of ['scooter','bike','moped']){const M=TRAVEL_MODES[mode],C=RS.RIDE_CLIMB[mode];
 for(const [dir,route] of [['up',up],['down',down]]){const r=ride(mode,route);assert(r.done,`${mode} rides the whole trail ${dir}`);
  assert(!r.out.some(t=>t.falling||t.air),`${mode} ${dir}: never launches, hops or falls off a bump on the trail`);
  for(const t of r.out)assert(Math.abs(t.h-t.g)<1e-6,`${mode} ${dir}: wheels on the ground (never below it)`);
  const maxSp=Math.max(...r.out.map(t=>t.sp));assert(maxSp<=M.maxSpeed*C.maxDown+.05,`${mode} ${dir}: speed capped (${maxSp.toFixed(1)} m/s)`);
  const climbing=r.out.filter(t=>t.grade>.2),speedUp=climbing.reduce((s,t)=>s+t.sp,0)/Math.max(1,climbing.length);
  if(dir==='up'){assert(climbing.length>200&&speedUp<M.maxSpeed*.8,`${mode} slows uphill (${speedUp.toFixed(1)} of ${M.maxSpeed} m/s on the climb)`);rideStats[mode+'Up']=speedUp;}
  for(const fps of [20,30,60]){const raw=draw(r.out,fps,mode,false),eased=draw(r.out,fps,mode,true),dt=1/fps,acc=a=>a.slice(2).map((q,i)=>(q.y-2*a[i+1].y+a[i].y)/dt/dt),pr=a=>a.slice(1).map((q,i)=>(q.pitch-a[i].pitch)/dt);
   for(const e of eased)assert(Math.abs(e.y-e.wheels)<=RS.RIDE_SUSPENSION_TRAVEL+1e-6,'the drawn ride stays within its suspension travel of the wheels');
   const jrms=a=>{const q=acc(a);let s=0;for(let i=1;i<q.length;i++)s+=((q[i]-q[i-1])/dt)**2;return Math.sqrt(s/(q.length-1));};
   const ar=p99(acc(raw)),ae=p99(acc(eased)),jr=jrms(raw),je=jrms(eased),prr=p99(pr(raw)),pre=p99(pr(eased));
   assert(je<=jr*(fps<=20?1:.85),`${mode} ${dir} @${fps}: the drawn ride judders less than the ground (jerk rms ${je.toFixed(0)} vs ${jr.toFixed(0)} m/s³)`);
   assert(ae<=ar*1.3+2,`${mode} ${dir} @${fps}: and no harder pushes (p99 ${ae.toFixed(0)} vs ${ar.toFixed(0)} m/s²)`);
   assert(pre<prr*.75&&pre<3.2,`${mode} ${dir} @${fps}: the pitch eases (p99 ${pre.toFixed(2)} vs ${prr.toFixed(2)} rad/s)`);
   const key=mode+' '+dir;(rideStats[key]??=[]).push([fps,jr,je,prr,pre]);}}}
// Straight up and down gentle slope lines (foothills within the limit), on each ride: no falls, no blocks, back where it began.
{let lines=0;for(let deg=0;deg<360;deg+=20){const a=deg*Math.PI/180,b=S.beachPoint(a,1.2),top=S.heightPoint(a,6);let ok=true;
  for(let t=0;t<=1;t+=.02){const x=b.x+(top.x-b.x)*t,z=b.z+(top.z-b.z)*t;if(!S.onSummitLand(x,z)||blocked(x,z,obstacles,.8)||S.summitSlope(x,z)>.5){ok=false;break;}}
  if(!ok)continue;lines++;
  for(const mode of ['bike','moped','scooter']){const r=ride(mode,[b,top,b]);assert(r.done,`${mode} straight up and down the ${deg}° slope`);assert(!r.out.some(t=>t.falling),`${mode} on the ${deg}° slope: no launch`);}}
 assert(lines>=6,`several straight slope lines ridden (${lines})`);}
// Speed scale: level 1; uphill slower; downhill a little faster, capped; walking and the jetpack untouched.
for(const mode of ['scooter','bike','moped']){assert.equal(RS.rideSlopeScale(mode,0),1);assert(RS.rideSlopeScale(mode,.3)<1&&RS.rideSlopeScale(mode,.3)>.4);assert(RS.rideSlopeScale(mode,-.6)<=RS.RIDE_CLIMB[mode].maxDown);}
assert.equal(RS.rideSlopeScale('walk',.5),1);assert.equal(RS.rideSlopeScale('jetpack',.5),1);assert.equal(RS.summitGrade(103,-8,1,0),0,'no grade off the island');
// Hill assist: never under the crawl uphill, braked on a steep descent (and still capped), walking untouched.
for(const mode of ['scooter','bike','moped']){const M=TRAVEL_MODES[mode].maxSpeed,c=RS.RIDE_CRAWL[mode];for(const g of [.3,.8,1.5,3])assert(RS.hillSpeedScale(mode,g)*M>=c-1e-9,`${mode}: at least the crawl up a ${g} grade`);
 assert(RS.hillSpeedScale(mode,-1.2)<RS.hillSpeedScale(mode,-.4)&&RS.hillSpeedScale(mode,-.4)<=RS.RIDE_CLIMB[mode].maxDown,`${mode}: braked down a steep slope, capped on a gentle one`);}
assert.equal(RS.hillSpeedScale('walk',.9),1);
{const h=RS.createHillAssist();const p=S.heightPoint(225*Math.PI/180,30),g=RS.summitGradient(p.x,p.z,{gx:0,gz:0}),m=Math.hypot(g.gx,g.gz);assert(m>RS.RIDE_MAX_CLIMB.bike,'a steep test spot');
 const a=h.steer('bike',p.x,p.z,g.gx/m,g.gz/m);assert(a.assisted&&Math.abs(Math.hypot(a.x,a.z)-1)<1e-9&&Math.abs(a.grade-RS.RIDE_MAX_CLIMB.bike)<1e-9,'straight up a steep face: turned across it, climbing at the limit');
 const b=h.steer('bike',p.x,p.z,-g.gx/m,-g.gz/m);assert(!b.assisted&&b.x===-g.gx/m,'straight down: untouched');}

// ---- Hill assist: straight at the summit gate / the nearest beach from all round the mountain, never stalling, at 20/30/60 fps.
const PK=S.SUMMIT_PEAK,F=S.SUMMIT_FENCE,PI=S.SUMMIT_PITCH,GO={x:L.gate.x,z:L.gate.z+1.5};
// "Steer toward the summit": straight at the gate; when the pitch's fence is in the way, via the corner of a 4.5 m berth round it.
const inFenceBox=(a,b)=>{const RX=F.halfX+2.2,RZ=F.halfZ+1.6;let t0=0,t1=1;for(const [p0,d,lo,hi] of [[a.x-PI.x,b.x-a.x,-RX+.5,RX-.5],[a.z-PI.z,b.z-a.z,-RZ+.5,RZ-.5]]){if(Math.abs(d)<1e-9){if(p0<lo||p0>hi)return false;continue;}let u=(lo-p0)/d,v=(hi-p0)/d;if(u>v)[u,v]=[v,u];t0=Math.max(t0,u);t1=Math.min(t1,v);if(t0>t1)return false;}return true;};
// The detour corners sit 7 m out from the fence (Oct 14 2026: at 4.5 m the south-west corner fell on the bench by the fence, and
// the straight-line test rider ground along it once the telescope stand no longer nudged it east first).
const toGate=p=>{if(Math.hypot(p.x-GO.x,p.z-GO.z)<3.5)return null;if(!inFenceBox(p,GO))return GO;const sx=p.x<PI.x?-1:1,south={x:PI.x+sx*(F.halfX+7),z:PI.z+F.halfZ+7},north={x:south.x,z:PI.z-F.halfZ-7};return inFenceBox(p,south)?north:south;};
const toBeach=p=>S.summitGround(p.x,p.z)<.4?null:S.beachPoint(Math.atan2(p.z-PK.z,p.x-PK.x),.5);
function drive(mode,start,target,fps,secs){const p={...start},v={x:0,z:0},roof=createRooftopTravel([],obstacles,p);roof.reset(p.x,p.z);const stick={x:0,z:0,sprint:mode==='walk'};
 const crawl=(RS.RIDE_CRAWL[mode]??1)*.8;let acc=0,slow=0,worstSlow=0,ticks=0,hops=[],below=0,peak=0,minSp=Infinity;
 for(let f=0;f<fps*secs;f++){const t=target(p);if(!t)return {ok:true,secs:ticks/60,worstSlow,hops,below,peak,p};const dx=t.x-p.x,dz=t.z-p.z,d=Math.hypot(dx,dz)||1;stick.x=dx/d;stick.z=dz/d;
  acc+=1/fps;while(acc>=1/60-1e-9){acc-=1/60;roof.update(1/60,p,v,stick,mode);ticks++;const sp=Math.hypot(v.x,v.z),g=fieldSurfaceHeight(p.x,p.z);
   if(roof.state.height<g-1e-6)below++;if(roof.state.air)peak=Math.max(peak,roof.state.height-g);if(roof.state.landImpact>0)hops.push({air:roof.state.lastAir,impact:roof.state.landImpact,x:p.x,z:p.z});
   if(ticks>45&&sp<crawl)slow++;else slow=0;worstSlow=Math.max(worstSlow,slow/60);}}
 return {ok:false,secs,worstSlow,hops,below,peak,p};}
const START=[];for(let k=0;k<16;k++){const a=k/16*Math.PI*2;START.push({...S.heightPoint(a,k%2?14:30),tag:`${(k*22.5).toFixed(1)}°`});}
START.push({x:716,z:98,tag:'screenshot: between the trail lines, east face'},{x:548,z:126,tag:'screenshot: west slope above the beach'});
const assist={};let allHops=[],hopPeak=0,hopStart=null;
for(const mode of ['bike','scooter','moped'])for(const fps of [20,30,60])for(const [dir,target,limit] of [['up',toGate,45],['down',toBeach,25]]){let slowest=0,worst=0;
 for(const s of START){const r=drive(mode,s,target,fps,limit+15);assert(r.ok&&r.secs<=limit,`${mode} @${fps} fps ${dir} from ${s.tag} (${s.x.toFixed(0)},${s.z.toFixed(0)}): arrives in ${limit} s (${r.ok?r.secs.toFixed(1)+' s':'not at all, stopped at '+r.p.x.toFixed(0)+','+r.p.z.toFixed(0)})`);
  assert(r.worstSlow<=1,`${mode} @${fps} fps ${dir} from ${s.tag}: never below the crawl for over 1 s (${r.worstSlow.toFixed(2)} s)`);
  assert.equal(r.below,0,`${mode} ${dir} from ${s.tag}: never below the ground`);slowest=Math.max(slowest,r.secs);worst=Math.max(worst,r.worstSlow);if(dir==='down'){allHops.push(...r.hops.map(h=>({...h,mode,fps})));hopPeak=Math.max(hopPeak,r.peak);if(!hopStart&&mode==='bike'&&fps===60&&r.hops.some(h=>h.air>.3))hopStart=s;}}
 const k=mode+' '+dir;assist[k]=assist[k]??{slowest:0,worst:0,n:0};assist[k].slowest=Math.max(assist[k].slowest,slowest);assist[k].worst=Math.max(assist[k].worst,worst);assist[k].n+=START.length;}

// ---- Hops off crests going downhill: they happen, last 0.2–1.5 s, land, never absurdly high; the same at every frame rate (the
// physics is Town's fixed 60 Hz tick); none when slow; the drawn ride's suspension compresses on the touchdown.
{const SH=load('lib/town/slopeHop.ts');
 const long=allHops.filter(h=>h.air>.2);assert(long.length>=10,`hops off the crests on the way down (${long.length} over 0.2 s)`);
 for(const h of allHops){assert(h.air<=SH.HOP_MAX_TIME+1e-9,`a hop lasts at most ${SH.HOP_MAX_TIME} s (${h.air.toFixed(2)})`);assert(S.onSummitGround(h.x,h.z),'lands on the island');}
 const per={};for(const h of allHops){const k=h.mode+h.fps;per[k]=(per[k]??0)+1;}for(const mode of ['bike','scooter','moped']){const n=[20,30,60].map(f=>per[mode+f]??0);assert(Math.max(...n)-Math.min(...n)<=Math.max(2,Math.max(...n)*.25),`${mode}: about as many hops at 20/30/60 fps (${n.join('/')})`);}
 // Peak height over the ground, all rides and points.
 const peak=hopPeak;assert(peak<=SH.HOP_CEILING+.05,`never absurdly high (${peak.toFixed(2)} m over the ground at most)`);
 // Slow: a crawl (half stick on the scooter, walking) never leaves the ground.
 for(const s of START){const p={...s},v={x:0,z:0},roof=createRooftopTravel([],obstacles,p);roof.reset(p.x,p.z);for(let i=0;i<60*20;i++){const t=toBeach(p);if(!t)break;const dx=t.x-p.x,dz=t.z-p.z,d=Math.hypot(dx,dz)||1;roof.update(1/60,p,v,{x:dx/d*.3,z:dz/d*.3,sprint:false},'scooter');assert(!roof.state.air,'no hop at a crawl');}}
 // The touchdown compresses the drawn ride (the suspension dips below its wheels' ground, then recovers).
 {const s=hopStart;assert(s,'a hop to draw');const p={...s},v={x:0,z:0},roof=createRooftopTravel([],obstacles,p);roof.reset(p.x,p.z);const susp=RS.createRideSuspension();let dip=0,landed=-1,after=0;
  for(let i=0;i<60*25;i++){const t=toBeach(p);if(!t)break;const dx=t.x-p.x,dz=t.z-p.z,d=Math.hypot(dx,dz)||1;roof.update(1/60,p,v,{x:dx/d,z:dz/d,sprint:false},'bike');const g=fieldSurfaceHeight(p.x,p.z),y=susp.update(1/60,roof.state.height,0).y;
   if(roof.state.landImpact>0&&roof.state.lastAir>.3&&landed<0)landed=i;if(landed>=0&&i-landed<30)dip=Math.max(dip,g-y);if(landed>=0&&i-landed===45)after=Math.abs(y-g);}
  assert(landed>=0&&dip>.03&&after<.05,`the landing compresses the suspension (${(dip*100).toFixed(0)} cm) and it recovers (${(after*100).toFixed(1)} cm off after 0.75 s)`);rideStats.hop={dip,n:allHops.length,long:long.length,peak,maxAir:Math.max(...allHops.map(h=>h.air))};}}

// ---- The trail drawn as one continuous ribbon over SUMMIT_PATHS (no wedges, gaps or terrain poking through).
{const meshes=[];town.traverse(o=>{if(o.isMesh&&/^summit-isle-ground-/.test(o.name))meshes.push(o);});town.updateMatrixWorld(true);
 const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0),from=new T.Vector3(),PATH=new T.Color('#c4c39c'),W=S.SUMMIT_PATH_WIDTH;let total=0,hit=0,dev=0;
 for(const path of P)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],l=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(l/.25),tx=(b.x-a.x)/l,tz=(b.z-a.z)/l;
  for(let k=0;k<n;k++){const cx=a.x+(b.x-a.x)*k/n,cz=a.z+(b.z-a.z)*k/n;for(const f of [-.9,-.6,-.3,0,.3,.6,.9]){const x=cx-tz*f*W/2,z=cz+tx*f*W/2;total++;
   ray.set(from.set(x,200,z),down);const h=ray.intersectObjects(meshes,false)[0];if(!h)continue;const c=h.object.geometry.getAttribute('color');
   const r=c.getX(h.face.a)/c.getY(h.face.a),bl=c.getZ(h.face.a)/c.getY(h.face.a);if(Math.abs(r-PATH.r/PATH.g)<.03&&Math.abs(bl-PATH.b/PATH.g)<.03&&h.face.normal.y>0){hit++;if(!f)dev=Math.max(dev,Math.abs(h.point.y-(S.summitGround(x,z)-S.SUMMIT_VISUAL_DROP)));}}}}
 assert(hit/total>=.99,`the trail ribbon covers ${(hit/total*100).toFixed(2)}% of its width along SUMMIT_PATHS (≥ 99%)`);
 assert(dev<.4,`drawn within ${dev.toFixed(2)} m of the walked ground along its centre`);rideStats.ribbon={cover:hit/total,dev};}

// ---- Trees and bushes are solid (walk and ride), the jetpack flies over them.
{const trees=assets.filter(a=>a.kind==='tree'||a.kind==='palm');assert(trees.length>20,'trees and palms on the island');
 for(const t of trees.slice(0,40)){const o=obstacles.find(o=>Math.abs(o.x-t.x)<1e-6&&Math.abs(o.z-t.z)<1e-6);assert(o&&o.cornerRadius>=TRUNK_CLEARANCE,'a round trunk collider');
  assert(blocked(t.x+.3,t.z,obstacles,.32)&&blocked(t.x,t.z+.6,obstacles,.8),'walkers and rides cannot enter the trunk');
  // Walk straight at it from 6 m: stopped outside the trunk, and slides past when aiming off-centre.
  if(!S.onSummitLand(t.x-6,t.z)||!S.onSummitLand(t.x+6,t.z))continue;const {stepPlayer}=load('lib/town/simulation.ts');
  const p={x:t.x-6,z:t.z},v={x:0,z:0};for(let i=0;i<240;i++)stepPlayer(p,v,{x:1,z:0,sprint:false},1/60,obstacles);assert(p.x<t.x-o.w/2,'a walker stops at the tree');}
 const bushes=obstacles.filter(o=>o.cornerRadius&&o.cornerRadius>.3&&!trees.some(t=>Math.abs(t.x-o.x)<1e-6&&Math.abs(t.z-o.z)<1e-6));assert(bushes.length>10,`bushes are solid too (${bushes.length})`);
 const lift=S.createSummitFlightLift();let h=0;for(let i=0;i<120;i++)h=28+lift.update(trees[0].x,trees[0].z,0,0,28,1/60);
 assert(!flightBlocked(trees[0].x,trees[0].z)&&h>(trees[0].canopyHeight??0)+2,'the jetpack hovers over the canopy');}

// ---- Landing: walkable spots clear of trees land (slopes, ridges, gullies, beaches, the trail); steep faces refuse and the
// nearest walkable spot is offered instead; the touchdown height is the ground there.
{const {SUMMIT_HUTS:HUTS,HUT_LAND_RADIUS:HUT_LAND}=load('lib/town/summitBalls.ts');const roof=createRooftopTravel([],obstacles,{x:L.pitch.x,z:L.pitch.z});let landed=0,refused=0,steepTried=0;const kinds={slope:0,beach:0,trail:0,steep:0};
 const B=S.SUMMIT_BOX;for(let x=B.minX+3;x<B.maxX;x+=9)for(let z=B.minZ+3;z<B.maxZ;z+=9){if(S.summitGround(x,z)<=0)continue;const can=roof.canLand(x,z),walk=S.onSummitLand(x,z),inTree=obstacles.some(o=>insideObstacle(x,z,o,0));
  // A hut's apex (summitBalls.ts hutRoofSteps, Oct 15 2026: the huts' roofs are landable) is checked in tests/summit-balls.cjs.
  if(can&&HUTS.some(h=>Math.hypot(x-h.x,z-h.z)<=HUT_LAND)){assert(roof.surface(x,z)>S.summitGround(x,z)+2,'a hut landing is on its roof');continue;}
  if(can){landed++;assert(walk&&!inTree,`lands only on walkable ground clear of trees (${x},${z})`);assert.equal(roof.surface(x,z),S.summitGround(x,z),'touchdown on the ground itself');
   const sl=S.summitSlope(x,z),g=S.summitGround(x,z);if(g<.5)kinds.beach++;else if(sl>.2)kinds.slope++;}
  else{refused++;if(!walk&&S.summitSlope(x,z)>S.SUMMIT_TRAIL_BANK_SLOPE){steepTried++;const alt=roof.findLanding(x,z);assert(alt&&roof.canLand(alt.x,alt.z)&&Math.hypot(alt.x-x,alt.z-z)<40,`a steep face (${x},${z}) offers a walkable spot nearby`);kinds.steep++;}}}
 for(const q of dense(P[1]).filter((_,i)=>i%40===0))if(roof.canLand(q.x,q.z))kinds.trail++;
 assert(landed>300&&kinds.slope>50&&kinds.beach>50&&kinds.trail>5&&steepTried>20,`landings: ${JSON.stringify(kinds)} (${landed} spots land, ${refused} refused)`);}
// ---- Wiring: rooftop slows rides on slopes, Town draws them through the suspension.
{const roof=fs.readFileSync('lib/town/rooftopTravel.ts','utf8'),town=fs.readFileSync('components/Town.tsx','utf8'),sim=fs.readFileSync('lib/town/simulation.ts','utf8');
 assert(roof.includes('hill.steer(')&&roof.includes('hop.step(')&&sim.includes('groundBlocked(x,z,obstacles,collisionRadius)')&&town.includes('rideSuspension.update(')&&town.includes('landingDust.trigger(')&&town.includes('sound.land('),'wired');}
const fmt=k=>rideStats[k].map(([f,jr,je,prr,pre])=>`${f}fps jerk rms ${jr.toFixed(0)}→${je.toFixed(0)} m/s³, pitch p99 ${prr.toFixed(1)}→${pre.toFixed(1)} rad/s`).join('; ');
const as=k=>`${k} ≤ ${assist[k].slowest.toFixed(0)} s`;
console.log(`PASS summit rides: hill assist from ${START.length} slope points × 3 rides × 20/30/60 fps, straight at the summit gate (${as('bike up')}, ${as('scooter up')}, ${as('moped up')}) and down to the beach (${as('bike down')}), never under the crawl > ${Math.max(...Object.values(assist).map(a=>a.worst)).toFixed(2)} s; ${rideStats.hop.n} hops down the slopes (${rideStats.hop.long} over 0.2 s, longest ${rideStats.hop.maxAir.toFixed(2)} s, ≤ ${rideStats.hop.peak.toFixed(1)} m up, landing dip ${(rideStats.hop.dip*100).toFixed(0)} cm); trail ribbon covers ${(rideStats.ribbon.cover*100).toFixed(2)}% (within ${rideStats.ribbon.dev.toFixed(2)} m of the ground); one connected trail (sandbar → summit gate, east beach joining), rides up and down it and straight up/down the foothills with no launches; uphill climb speeds scooter ${rideStats.scooterUp.toFixed(1)}, bike ${rideStats.bikeUp.toFixed(1)}, moped ${rideStats.mopedUp.toFixed(1)} m/s; moped down: ${fmt('moped down')}; trees and bushes solid, flown over; landings on slopes, beaches and the trail, steep faces redirected`);
