// DRIP FC Stadium (Nov 13 2026, owner): the taller roof fascia banner (size, aspect, offsets, frame proud of the slab, seated
// sightlines under the front frame) and flight bumps: flying into a floodlight mast or head, a roof, the big screen, the gate or a
// plaza flag knocks the flyer back with the flyer spin instead of passing through; nothing is tested away from the stadium.
// usage: node tests/stadium-flight-bump.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}},store=new Map();
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:()=>{},removeEventListener:()=>{},matchMedia:()=>({matches:false})},requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(id.slice(2)+'.ts'):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(path.resolve(base,f),'utf8');
const Q=load('lib/town/stadiumSeats.ts'),L=load('lib/town/westParkLayout.ts'),SL=load('lib/stadium/sponsors/slots.ts'),LY=load('lib/stadium/sponsors/layout.ts');
const FL=load('lib/town/stadiumFlight.ts'),sim=load('lib/town/simulation.ts'),W=load('lib/town/stadiumWorld.ts'),FD=load('lib/town/stadiumFeed.ts'),PF=load('lib/town/plazaFlags.ts');
const S=L.STADIUM,R=Q.ROOF;

// 1. The fascia banner: 1.6–2× its old 1.6 m, inside its (taller) frame, proud of it, whole 8:1 repeats (adidas never squashed).
{const lay=Q.stadiumSponsorLayout(),spec=SL.SLOT_SPECS.fascia,fb=R.y-R.frameBelow,ft=R.y+R.frameAbove;
 for(const f of lay.fascia){
  assert(f.h>=1.6*1.6&&f.h<=1.6*2,`banner ${f.h} m tall (1.6–2× the old 1.6 m)`);
  assert(f.y-f.h/2>fb+.05&&f.y+f.h/2<ft-.05,'banner inside the frame face, top and bottom');
  assert(f.y+f.h/2-(R.y-.1+.8)>.8,'grown mostly upward');
  assert(Math.abs(Math.abs(f.x)-(R.back+Q.FRAME_PROUD+Q.FASCIA_PROUD))<1e-9&&Q.FASCIA_PROUD>=.1,'banner proud of the frame face');
  const rep=LY.repeatsFor(f,spec.aspect);assert(Math.abs(f.w/(f.h*rep)/spec.aspect-1)<.01,`whole repeats: ${rep} × ${spec.aspect}:1`);assert(rep>=3);}
 assert(Math.abs(spec.cell[0]/spec.cell[1]/spec.aspect-1)<.01&&spec.cell[1]>=78,'cell keeps 8:1, more pixels for the taller banner');
 // Frame proud of the slab everywhere (no coplanar face: back, top, bottom, ends) and the front frame unchanged.
 assert(R.y+R.frameAbove>R.y+R.thick/2+.5&&R.y-R.frameBelow<R.y-R.thick/2-.5,'frame clears the slab top and underside');
 assert(Q.FRAME_PROUD>=.03,'frame ends and back proud of the slab');
 const world=src('lib/town/stadiumWorld.ts');
 assert(/standRect\(s,ROOF\.back-\.12,ROOF\.back\+P,a0-P,a1\+P\),ROOF\.y-ROOF\.frameBelow,ROOF\.y\+ROOF\.frameAbove/.test(world),'frame built proud at its ends and back');
 assert(Q.FRONT_FRAME.below===.5&&Q.FRONT_FRAME.above===.3&&/ROOF\.y-FRONT_FRAME\.below,ROOF\.y\+FRONT_FRAME\.above/.test(world),'front frame as before');}

// 2. Sightlines: from every top-row seat (head and both stand cameras) the whole pitch, near to far touchline, passes under the
//    front frame; the taller back fascia is behind every seat and camera.
{const W2=S.pitchW/2,frontBottom=R.y-Q.FRONT_FRAME.below;
 for(const s of Q.STANDS.filter(q=>q.roof)){
  const row=Q.ROWS-1,seatD=s.inner+row*Q.ROW_DEPTH+Q.SEAT_ROOT,seatY=Q.rowHeight(row);
  for(const a of [-40,0,40]){const p=Q.standWorld(s,seatD,a),seat={id:'t',stand:s.id,row,x:p.x,z:p.z,y:seatY,yaw:Q.standYaw(s)};
   const eyes=[{d:seatD,y:seatY+Q.SEAT_TOP+.75}];for(const raised of [false,true]){const v=Q.seatView(seat,raised);eyes.push({d:Q.standLocal(s,v.x,v.z).d,y:v.y});}
   for(const e of eyes){assert(e.d<R.back-.12-.5,'every seat and stand camera is in front of the back fascia');
    for(const td of [W2,-W2]){const yAt=e.y+(0-e.y)*(e.d-R.front)/(e.d-td);assert(yAt<frontBottom-.5,`top row (${s.id}, ${a}) sees the ${td>0?'near':'far'} touchline under the front frame (${yAt.toFixed(2)} m)`);}}}}}

// 3. Colliders match the build: masts 0.45 × 30 m, heads at 30.5 m, the screen frame, the flag poles.
{const sol=FL.stadiumFlightSolids(),k=n=>sol.filter(q=>q.kind===n);
 assert.equal(k('mast').length,4);assert.equal(k('head').length,4);assert.equal(k('roof').length,4);assert.equal(k('fascia').length,2);
 assert.equal(k('screen').length,1);assert.equal(k('screenPost').length,2);assert(k('gate').length===3&&k('sign').length===1);
 assert.equal(k('flag').length,28);assert(k('stand').length>=5);assert(sol.length<90,'a cheap list');
 const w=src('lib/town/stadiumWorld.ts');assert(/cylinder\(\.45,30,'#d9d6cc',m\.x,15,m\.z\)/.test(w)&&/box\(6\.4,3\.8,\.3,/.test(w),'mast + head sizes as built');
 const scr=k('screen')[0];assert(Math.abs(scr.hw*2-FD.SCREEN_FRAME.w)<1e-9&&Math.abs(scr.y1-scr.y0-FD.SCREEN_FRAME.h)<1e-9,'screen frame');
 for(const [i,p] of W.screenPosts().entries()){const q=k('screenPost')[i];assert(Math.abs(q.x-p.x)<1e-9&&Math.abs(q.y1-p.top)<1e-9&&q.hw===W.SCREEN_POST.r);}
 const fp=k('flag').filter(q=>q.round);assert(fp.every(q=>Math.abs(q.y1-(PF.FLAG.poleH+PF.FLAG.cap))<.01),'flag pole height');
 const fs2=k('fascia')[0];assert(Math.abs(fs2.y1-(R.y+R.frameAbove))<1e-9&&Math.abs(fs2.y0-(R.y-R.frameBelow))<1e-9,'fascia collider = the taller frame');}

// 4. Flying into things bounces (stepPlayer jetpack + resolve, as Town.tsx does); flying over or away does not.
function fly(F,start,dir,y,seconds=1.6){
 const p={x:start.x,z:start.z},v={x:dir.x*34,z:dir.z*34},log={bumps:0,minGap:Infinity,awayAfter:false,firstOut:null};
 for(let i=0;i<Math.round(seconds*60);i++){const ox=p.x,oz=p.z;sim.stepPlayer(p,v,{x:dir.x,z:dir.z,sprint:false},1/60,[],'jetpack');
  const r=F.resolve(p,ox,oz,y,v,false);if(r.fresh){log.bumps++;if(!log.firstOut)log.firstOut={vx:v.x,vz:v.z,nx:r.contact.nx,nz:r.contact.nz,kind:r.contact.solid.kind};}
  F.update(1/60,false);assert(!F.test(p.x,p.z,y),`never inside a solid (${p.x.toFixed(2)}, ${p.z.toFixed(2)} at ${y})`);}
 return {...log,p};}
{const m=Q.MASTS[0];// north-west corner mast (-1,-1)
 // Below the heads (feet 25 m), straight at the mast's centre: the mast bumps and knocks back west.
 let F=FL.createStadiumFlight();let r=fly(F,{x:m.x-30,z:m.z},{x:1,z:0},25,1.4);
 assert(r.bumps>=1&&r.firstOut.kind==='mast','into a mast: a bump '+JSON.stringify(r.firstOut));assert(r.firstOut.vx<-5,'knocked back away from the mast');assert(r.p.x<m.x,'never through the mast');
 // At cruise height (28 m, the owner's flight) the head panel round the mast's top is hit first: knocked off its face.
 {const G=FL.createStadiumFlight(),q=fly(G,{x:m.x-30,z:m.z},{x:1,z:0},28,1.4);assert(q.bumps>=1&&['head','mast'].includes(q.firstOut.kind),'cruise into a mast top: a bump');
  assert(q.firstOut.vx*q.firstOut.nx+q.firstOut.vz*q.firstOut.nz>=FL.FLIGHT_BUMP.minOut-1e-6,'leaves outward');}
 assert(F.react.on||F.stats.bumps>=1,'the flyer spin reaction started');
 {const G=FL.createStadiumFlight(),p={x:m.x-5,z:m.z},v={x:30,z:0};G.resolve(p,m.x-5,m.z,28,v);p.x=m.x;G.resolve(p,m.x-5,m.z,28,v);assert(G.react.on&&G.pose&&G.react.kind===3,'friend-bump flyer kind (spin-away)');G.update(.3,false);assert(G.pose.on&&Math.abs(G.pose.yaw)>0,'spin overlay drawn');G.update(1,false);assert(!G.pose.on,'and over in a second');}
 // The head panel (above the mast's top), across its face.
 const yaw=Math.atan2(-m.sx,-m.sz),fx=Math.sin(yaw),fz=Math.cos(yaw);F=FL.createStadiumFlight();
 r=fly(F,{x:m.x+fx*20,z:m.z+fz*20},{x:-fx,z:-fz},31,1.2);assert(r.bumps>=1&&r.firstOut.kind==='head','into the head panel: a bump');
 assert(r.firstOut.vx*fx+r.firstOut.vz*fz>5,'knocked back off the lamp face');
 // Over everything: no bump.
 F=FL.createStadiumFlight();r=fly(F,{x:m.x-30,z:m.z},{x:1,z:0},33,1.4);assert.equal(r.bumps,0,'above the mast heads: clear');}
{// The west roof: from the park at slab height, then at fascia height above the slab, then over the frame.
 const west=Q.STANDS[0],out=Q.standWorld(west,R.back+20,0),inn=Q.standWorld(west,0,0),d={x:Math.sign(inn.x-out.x),z:0};
 for(const [y,kind] of [[11.5,'fascia'],[13.5,'fascia']]){const F=FL.createStadiumFlight(),r=fly(F,out,d,y,1);assert(r.bumps>=1&&r.firstOut.kind===kind,`roof edge at ${y} m: ${r.firstOut&&r.firstOut.kind}`);assert(r.firstOut.vx*d.x<-5,'knocked back');}
 {const F=FL.createStadiumFlight(),r=fly(F,out,d,R.y+R.frameAbove+.05,1);assert.equal(r.bumps,0,'over the fascia frame: clear');}
 // Under the roof from the pitch side at slab height: the front frame / slab.
 {const F=FL.createStadiumFlight(),st=Q.standWorld(west,20,0),r=fly(F,st,{x:-d.x,z:0},12,1.2);assert(r.bumps>=1&&r.firstOut.kind==='roof','into the roof front');}}
{// The big screen from the pitch at 12 m, and its post at 4 m.
 const z=S.z+Q.SCREEN.z;let F=FL.createStadiumFlight(),r=fly(F,{x:S.x+2,z:z-25},{x:0,z:1},12,1.2);assert(r.bumps>=1&&r.firstOut.kind==='screen'&&r.firstOut.vz<-5,'into the big screen: knocked back');
 const post=W.screenPosts()[0];F=FL.createStadiumFlight();r=fly(F,{x:post.x,z:z+20},{x:0,z:-1},4,1.2);assert(r.bumps>=1&&r.firstOut.kind==='screenPost'&&r.firstOut.vz>5,'into a screen post from the park: '+(r.firstOut&&r.firstOut.kind));
 F=FL.createStadiumFlight();r=fly(F,{x:S.x,z:z-25},{x:0,z:1},Q.SCREEN.y+Q.SCREEN.h/2+.6,1.2);assert.equal(r.bumps,0,'over the screen: clear');}
{// The gate arch / sign from the plaza at 11 m; a plaza flag at 3 m (the flag index comes back for its reaction).
 let F=FL.createStadiumFlight(),r=fly(F,{x:Q.GATE_ARCH_X+25,z:L.STADIUM_GATE.z},{x:-1,z:0},11,1.2);assert(r.bumps>=1&&(r.firstOut.kind==='sign'||r.firstOut.kind==='gate'),'into the gate sign');
 const p=Q.plazaFlagPoles()[3];F=FL.createStadiumFlight();const p0={x:p.x,z:p.z-15},v={x:0,z:20};let flag=-1;
 for(let i=0;i<60;i++){const ox=p0.x,oz=p0.z;sim.stepPlayer(p0,v,{x:0,z:1,sprint:false},1/60,[],'jetpack');const rr=F.resolve(p0,ox,oz,3,v);if(rr.fresh){flag=rr.contact.solid.flag;break;}}
 assert.equal(flag,3,'into plaza flag 3: its index for the sway');}
{// Jet actions: the step test refuses a stadium solid and knock() plays the reaction once per re-arm.
 const F=FL.createStadiumFlight(),m=Q.MASTS[1];assert(F.solid(m.x,m.z,20));assert(F.knock(false)&&F.react.on);assert(!F.solid(m.x,m.z,40),'over the masts');assert(!F.knock(false),'re-arm');}
{// Far away: one rectangle test, no solid loop; the broad phase covers the bowl and the plaza.
 const F=FL.createStadiumFlight();for(const [x,z] of [[0,0],[100,-50],[-40,-30]])assert(!F.test(x,z,28));assert.equal(F.stats.tests,0,'nothing tested away from the stadium');
 assert(F.bounds.x0<S.x-S.bowlW/2&&F.bounds.x1>Math.max(...Q.plazaFlagPoles().map(p=>p.x)),'bounds take in the bowl and the plaza (to its last flag pole)');}
{// Town wiring: only the flight branches resolve (walking unchanged); jet actions block on it; the overlay rides the friend-bump hook.
 const town=src('components/Town.tsx');
 assert.equal((town.match(/stadiumFlight\.resolve\(/g)||[]).length,2,'two flight call sites');
 assert(/stepPlayer\(location,velocity,\{x:ix,z:iz,sprint:false\},dt,\[\],'jetpack'\);\s*if\(stadiumFlight\.resolve\(location,ox,oz,flight\.height,velocity,reduced\)\.fresh\)/.test(town),'free flight');
 assert(/lighthouseSolid\(x,z,flight\.height\)\|\|stadiumFlight\.solid\(x,z,flight\.height\)/.test(town),'jet actions');
 assert(/stadiumFlight\.pose\.on\?stadiumFlight\.pose:null;if\(lb\)applyLocalBump/.test(town),'drawn with applyLocalBump');
 assert(/world\.plazaFlags\.react\(fp\.x,fp\.z,push,reduced\)/.test(town.slice(town.indexOf('const stadiumBump'))),'a bumped flag sways');}
console.log('stadium fascia + flight bumps: ok');
})().catch(e=>{console.error(e);process.exit(1);});
