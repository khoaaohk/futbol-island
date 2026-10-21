// Seamless Explore (Oct 21 2026; lib/town/water/diveEdge.ts): swim into a reef zone under the water and you are in its room, swim out
// past the room's rim and you are back on the island, still under, just outside the zone. Hysteresis, cooldown, the mapping both
// ways for all 7 zones, the breath carried across, no toggle storm along the edge, and the frame-loop wiring.
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
const D=load('lib/town/water/diveSpots.ts'),E=load('lib/town/water/diveEdge.ts'),S=load('lib/town/water/diveSession.ts'),L=load('lib/town/water/diveLayout.ts');
const {DIVE_EDGE}=E,dive=()=>'dive';

ok('hysteresis numbers: in 1 m inside the blob, arrive 1.5 m inside the rim, out 2 m past it, land 3 m outside, 1.5 s cooldown',()=>{
 assert.deepEqual([DIVE_EDGE.enterIn,DIVE_EDGE.placeIn,DIVE_EDGE.exitOut,DIVE_EDGE.landOut,DIVE_EDGE.cooldown],[1,1.5,2,3,1.5]);
 assert(DIVE_EDGE.rimMax+DIVE_EDGE.exitOut<=D.DIVE_ROOM_R,'the way out is inside the built room');
 assert(!/from 'three'|document\.|window\./.test(read('lib/town/water/diveEdge.ts')),'pure');
});

ok('all 7 zones: island -> room -> island at 48 bearings (the rim is the layout outline, capped), round trips land near the entry',()=>{
 assert.equal(D.DIVE_SPOTS.length,7);
 for(const s of D.DIVE_SPOTS){const lay=L.diveLayout(s);
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2,c=Math.cos(a),sn=Math.sin(a),R=D.diveBlobR(s,a);
   // The rim: the layout's outline in room metres, capped at rimMax.
   const o=lay.outline[i];assert(Math.abs(E.diveEdgeRim(s,a)-Math.min(DIVE_EDGE.rimMax,Math.hypot(o.x,o.z)))<1e-6,s.id+' rim = outline');
   // Hysteresis on the island: 0.5 m inside is not yet in; 1.2 m inside is.
   assert.equal(E.diveEdgeSpotAt(s.x+c*(R-.5),s.z+sn*(R-.5)),null,s.id+' 0.5 m inside: not yet');
   const ix=s.x+c*(R-1.2),iz=s.z+sn*(R-1.2);assert.equal(E.diveEdgeSpotAt(ix,iz)?.id,s.id,s.id+' 1.2 m inside: in');
   // Heading inward (from outside), the facing carries on; the room point is on the same bearing, inside the rim by placeIn.
   const inward=Math.atan2(-c,-sn),r=E.diveEdgeToRoom(s,ix,iz,inward);
   assert(E.diveEdgeBeyond(s,r.x,r.z)<=-DIVE_EDGE.placeIn+1e-6,s.id+' arrives inside the rim');assert(Math.abs(Math.atan2(Math.sin(Math.atan2(r.z,r.x)-a),Math.cos(Math.atan2(r.z,r.x)-a)))<1e-6,'same bearing');
   assert(Math.abs(r.yaw-inward)<1e-9||Math.abs(Math.abs(r.yaw-inward)-2*Math.PI)<1e-9,'heading kept');
   // Arriving at the rim heading OUT (a dive pressed on the edge facing away): turned inward, never straight back out.
   const out=E.diveEdgeToRoom(s,ix,iz,Math.atan2(c,sn));if(E.diveEdgeBeyond(s,out.x,out.z)>-DIVE_EDGE.placeIn-1e-3)assert(Math.sin(out.yaw)*-c+Math.cos(out.yaw)*-sn>.9,'turned inward at the rim');
   // Straight back out: 2 m past the rim on the same bearing -> 3 m outside the blob, facing outward; near the entry point.
   const k=(E.diveEdgeRim(s,a)+DIVE_EDGE.exitOut)/Math.hypot(r.x,r.z),x=E.diveEdgeToIsland(s,r.x*k,r.z*k,Math.atan2(c,sn),dive);
   assert(x.under,'still under');near(E.diveEdgeInside(s,x.x,x.z),-DIVE_EDGE.landOut,1e-6,s.id+' 3 m outside');
   assert(Math.hypot(x.x-ix,x.z-iz)<DIVE_EDGE.enterIn+DIVE_EDGE.landOut+.5,s.id+' round trip lands near the entry: '+Math.hypot(x.x-ix,x.z-iz).toFixed(2));
   assert.equal(E.diveEdgeSpotAt(x.x,x.z),null,'the landing point never re-enters by itself');
   assert(Math.sin(x.yaw)*c+Math.cos(x.yaw)*sn>.2,'facing outward');}
  // The tap path's start point (DIVE_START) is well inside every room's rim.
  assert(E.diveEdgeBeyond(s,S.DIVE_START.x,S.DIVE_START.z)<0,s.id+' DIVE_START inside the rim');}
});

ok('the way out: no land, no other zone; too shallow there -> swim up; nothing at all -> the buoy',()=>{
 const s=D.DIVE_SPOTS[0];let calls=0;
 const x1=E.diveEdgeToIsland(s,30,0,Math.PI/2,(x,z)=>{calls++;return x<s.x+D.diveBlobR(s,0)+7?'no':'dive';});assert(x1.under&&x1.x>=s.x+D.diveBlobR(s,0)+7,'further out past the land');assert(calls<=10,'bounded');
 const x2=E.diveEdgeToIsland(s,30,0,0,()=>'swim');assert.equal(x2.under,false,'shallow: comes up');near(E.diveEdgeInside(s,x2.x,x2.z),-3,1e-6,'');
 const x3=E.diveEdgeToIsland(s,30,0,0,()=>'no',undefined,D.DIVE_SPOTS,s.surface);assert.deepEqual([x3.x,x3.z,x3.under],[s.surface.x,s.surface.z,false]);
 // Two zones side by side: the exit toward the neighbour skips its blob (+ the margin), so the two never hand the diver back and forth.
 const a={id:'a',x:0,z:0,radius:10,blob:3},b={id:'b',x:23,z:0,radius:8,blob:5};
 const x4=E.diveEdgeToIsland(a,30,0,Math.PI/2,dive,undefined,[a,b]);assert(E.diveEdgeInside(b,x4.x,x4.z)<=-DIVE_EDGE.landOut||!x4.under,'not inside the neighbour');
 // The real zones are far apart: no blob (+ margins) touches another.
 for(const p of D.DIVE_SPOTS)for(const q of D.DIVE_SPOTS)if(p!==q)assert(Math.hypot(p.x-q.x,p.z-q.z)>D.DIVE_BLOB_MAX*(p.radius+q.radius)+2*DIVE_EDGE.landOut,p.id+'/'+q.id);
});

ok('session: in across the edge keeps the breath (no refill), the same drain; out past the rim -> surfaced "edge"; cooldown + re-arm',()=>{
 const s=D.DIVE_SPOTS[3],ss=S.createDiveSession();ss.state.breath=.6;
 assert.equal(ss.enterAt(s,0,-5,Math.PI,2,.4),true);assert.equal(ss.state.breath,.6,'no refill on the way in');assert(ss.state.viaEdge&&ss.events.started);
 near(Math.hypot(ss.state.vx,ss.state.vz),2,1e-9,'speed carried');assert.equal(ss.enterAt(s,0,0,0,0,.4),false,'already in');
 for(let i=0;i<30;i++)ss.step(1/30,{sx:0,sy:0,lift:0});const b1=ss.state.breath;assert(b1<.6&&b1>.6-1.1/S.BREATH_SECONDS,'drains at the glide rate');
 // Swim straight out (heading -z, the facing): at the rim + 2 m the room hands back.
 ss.state.yaw=Math.PI;let ev='',t=0;while(!ev&&t<20){ss.step(1/30,{sx:0,sy:-1,lift:0});ev=ss.events.surfaced;t+=1/30;}
 assert.equal(ev,'edge');assert.equal(ss.state.phase,'surface');assert(ss.state.hold>0&&ss.state.edgeCd>0,'re-arm + cooldown');
 const at=E.diveEdgeBeyond(s,ss.state.x,ss.state.z);assert(at>=DIVE_EDGE.exitOut-1e-6&&at<DIVE_EDGE.exitOut+.2,'left 2 m past the rim: '+at.toFixed(2));
 const b2=ss.state.breath;ss.duck(.5,true);ss.scan(.5,0,0,true);assert(ss.state.breath<b2,'under on the island: the same breath drains, no refill');
 assert.equal(ss.enterAt(s,0,0,0,0,.4),false,'cooldown: no instant way back in');
 for(let i=0;i<25;i++){ss.duck(.1,true);ss.scan(.1,0,0,true);}assert.equal(ss.enterAt(s,0,0,0,0,.4),true,'after the wait it works again');
 // During the cooldown after coming in the rim holds like a wall (no instant way back out).
 const s2=S.createDiveSession();s2.enterAt(s,0,-14,Math.PI,3,.4);let e2='';for(let i=0;i<30&&!e2;i++){s2.step(1/30,{sx:0,sy:-1,lift:0});e2=s2.events.surfaced;}assert.equal(e2,'','held during the cooldown');
 // Nearly out of breath: the edge does not take you in.
 const s3=S.createDiveSession();s3.state.breath=.01;assert.equal(s3.enterAt(s,0,0,0,0,.4),false);
 assert(E.diveEdgeDepthT(0)<E.diveEdgeDepthT(1.6)&&E.diveEdgeDepthT(9)<=1,'island depth -> water column');
});

ok('no toggle storm: wobbling along the edge for 60 s crosses at most once per cooldown, and a straight swim crosses once',()=>{let total=0;
 for(const s of D.DIVE_SPOTS){const ss=S.createDiveSession();let ix=0,iz=0,ang=0,times=[],t=0,inRoom=false;const sc=D.diveWreckIslandScale(s),q={x:0,z:0,yaw:0};
  ang=.3;const place=w=>{const R=D.diveBlobR(s,ang)+w;ix=s.x+Math.cos(ang)*R;iz=s.z+Math.sin(ang)*R;};place(2);
  for(let f=0;f<60*30;f++,t+=1/30){const w=1.6*Math.sin(t*2.1);// weaving 1.6 m either side of the edge while circling it
   if(!inRoom){ang+=1/30*.06;place(w);ss.duck(1/30,true);ss.scan(1/30,ix,iz,true);ss.state.breath=1;
    const z=E.diveEdgeSpotAt(ix,iz,D.DIVE_SPOTS);if(z){E.diveEdgeToRoom(z,ix,iz,ang+Math.PI/2,q);if(ss.enterAt(z,q.x,q.z,q.yaw,2,.4)){inRoom=true;times.push(t);}}}
   else{ss.state.breath=1;const a=Math.atan2(ss.state.z,ss.state.x),rim=E.diveEdgeRim(s,a),rr=rim+1.6*Math.sin(t*2.1)+.6;// the same weave in room metres
    ss.state.x=Math.cos(a)*Math.min(rr,Math.hypot(ss.state.x,ss.state.z)+.2);ss.state.z=Math.sin(a)*Math.min(rr,Math.hypot(ss.state.x,ss.state.z)+.2);
    ss.state.yaw=Math.atan2(Math.cos(a),Math.sin(a));ss.step(1/30,{sx:0,sy:-.3,lift:0});
    if(ss.events.surfaced==='edge'){inRoom=false;times.push(t);ang=Math.atan2(ss.state.z,ss.state.x);place(DIVE_EDGE.landOut);}}}
  for(let i=1;i<times.length;i++)assert(times[i]-times[i-1]>=DIVE_EDGE.cooldown-1e-6,s.id+' toggled after '+(times[i]-times[i-1]).toFixed(2)+' s');
  assert(times.length<=60/DIVE_EDGE.cooldown,s.id+" "+times.length);total+=times.length;void sc;}
 assert(total>=7,"the weave does cross: "+total);
});

ok('runtime: edgeEnter builds the room at the matching point (banner, no tap), the way out hands the island point back, rig home',()=>{
 const RT=load('lib/town/water/diveRuntime.ts');const islandScene=new T.Scene(),root=new T.Group();islandScene.add(root);let entered=null,surfaced='';
 const ports={scene:islandScene,renderer:{render:()=>{}},camera:new T.PerspectiveCamera(50,1),player:{root,update:()=>{}},phone:true,reduced:()=>false,ui:()=>null,place:()=>{},hide:()=>{},
  entered:(_,e)=>{entered=e;},surfaced:(_,r)=>{surfaced=r;},found:()=>{},credit:()=>{},low:()=>{},out:()=>{},fly:()=>false,water:()=>'dive'};
 const rt=RT.createDiveRuntime(ports),s=D.DIVE_SPOTS[6],R=D.diveBlobR(s,Math.PI/2);rt.session.state.breath=.7;
 assert.equal(rt.edgeEnter(s.x,s.z+R+1,Math.PI,2,1),false,'outside: nothing');assert.equal(rt.edgeEnter(s.x,s.z+R-.4,Math.PI,2,1),false,'not by the margin yet');
 assert.equal(rt.edgeEnter(s.x,s.z+R-1.3,Math.PI,2,1),true);assert.equal(entered,true);assert(rt.diving&&rt.room);assert.equal(root.parent,rt.room.scene);
 assert.equal(RT.diveStore.get().banner,RT.diveEdgeEntering(s.name));assert.equal(rt.session.state.breath,.7);assert(rt.session.state.z>0,'arrives on the south (+z) side');
 rt.session.state.yaw=0;rt.session.state.edgeCd=0;for(let i=0;i<300&&rt.diving;i++)rt.frame(1/30,{sx:0,sy:-1,lift:0},400,300);
 assert.equal(surfaced,'edge');assert.equal(rt.diving,false);assert.equal(root.parent,islandScene,'the rig is back on the island');assert.equal(rt.room,null,'room disposed');
 const e=rt.edgeExit;assert(e.under);near(E.diveEdgeInside(s,e.x,e.z),-3,1e-6,'');assert(e.z>s.z,'out on the south side');assert.equal(RT.diveStore.get().banner,RT.DIVE_EDGE_LEAVING);
 assert.equal(rt.edgeEnter(s.x,s.z+R-1.3,Math.PI,2,1),false,'no instant way back in');rt.dispose();
});

ok('frame loop + HUD + analytics wiring (Town.tsx)',()=>{
 const town=read('components/Town.tsx'),a=town.indexOf('    function animate(now:number){'),body=town.slice(a);
 const duck=town.indexOf('const de=dive.duck(dt,water.inWater&&water.state.diving&&!dive.diving)'),enter=town.indexOf("dive.edgeEnter(location.x,location.z,player.root.rotation.y,Math.hypot(velocity.x,velocity.z),water.state.dive)");
 assert(duck>0&&enter>duck&&enter-duck<900,'edge entry right after the duck-dive breath, in the island step');
 assert(town.slice(duck,enter).includes("water.state.diving&&water.state.under>.35&&water.state.phase==='swim'&&!animalRides.riding&&rideRef.current==='walk'"),'only a walking duck-diver');
 const branch=body.indexOf('if(dive.diving){const restFrame=idleRide.interval(now,dive.resting,');assert(branch>0&&body.indexOf('const waterIdle=water.resting();')>branch,'the island stays frozen in the room (the dive branch first)');
 assert(town.includes("if(reason==='edge'){const e=dive.edgeExit,")&&town.includes('if(!(e.under&&water.underNow()))'),'the way out: under at once (or swim up)');
 assert(town.includes('camera.position.x+=e.x-visualLocation.x;camera.position.z+=e.z-visualLocation.z;'),'the camera moves with the diver');
 assert(town.includes("if(edge){showUnderTint(spot.theme.water);}"),'the soft blend in, no splash');
 assert(town.includes("water:(x,z)=>{if(waterProbe.isLand(x,z)||!waterProbe.allowed(x,z))return 'no';"),'no land, no pier');
 assert(town.includes('swimClear.dispose();clearWin.dispose();'),'dispose order kept');
 const W=read('lib/town/water/waterState.ts');assert(W.includes('function underNow(){if(!canDive())return false;state.diving=true;state.under=1;'));
 const CID=load('lib/analytics/countIds.ts');for(const id of ['wa:dive_enter_edge','wa:dive_exit_edge'])assert(CID.isCountId(id),id);
 assert(read('app/admin/WaterSection.tsx').includes("value(rows,'wa:dive_enter_edge')")&&read('app/admin/WaterSection.tsx').includes("value(rows,'wa:dive_exit_edge')"),'admin Water tile');
 assert(read('components/DiveHud.tsx').includes('className="dive-edge-chip"')&&read('app/globals.css').includes('@media(prefers-reduced-motion:reduce){.dive-edge-chip{animation:none}}'),'the edge chip (still with reduced motion)');
});

function near(a,b,eps,msg){assert(Math.abs(a-b)<=eps,`${msg} ${a} vs ${b}`);}
console.log(`\ndive-edge: ${passed} passed`);
