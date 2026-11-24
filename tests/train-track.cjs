// The Island Line, Phase 1 (Nov 23 2026; plan .claude/worktrees/_recovery-nov20/train/PLAN.md): track and scenery. Run: node tests/train-track.cjs
//  1. the line (lib/town/trainTrack.ts, pure): a closed ~2.54 km loop, evenly tabled, smallest curve ≥ 20 m, trackAt / trackNearest
//  2. stops in order (North → West Beach → South → Summit Isle → Coral Cay), each with its football line; nine crossings on land
//  3. heights: trestle ramps ≤ 5.5 %, the tunnel straight and level, Summit Isle's ground carved to the bed (and the hill kept over the tunnel)
//  4. the built world: it builds, props are off the line, stations have colliders and one-step platforms, swimmers meet the piers
//  5. heat and wiring: one board material for all five stations, the tube is its own gated mesh, Town and world wired
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
(async()=>{
 const {T,L,world,obstacles}=await loadIslandWorld(ROOT);
 const tt=L('lib/town/trainTrack.ts'),tl=L('lib/town/trainLayout.ts'),su=L('lib/town/summitIsle.ts'),K=tt.TrackKind,TR=tt.TRACK;
 // 1. the line
 assert(TR.length>2500&&TR.length<2580,`loop length ${TR.length}`);
 for(let i=0;i<TR.n;i++){const k=(i+1)%TR.n,d=Math.hypot(TR.x[k]-TR.x[i],TR.z[k]-TR.z[i]);assert(Math.abs(d-tt.TRACK_DS)<.25,`row ${i} step ${d}`);}
 {let minR=1e9;for(let i=0;i<TR.n;i++){const a=(i-3+TR.n)%TR.n,b=(i+3)%TR.n,ang=Math.acos(Math.max(-1,Math.min(1,TR.tx[a]*TR.tx[b]+TR.tz[a]*TR.tz[b])));minR=Math.min(minR,6*tt.TRACK_DS/Math.max(ang,1e-6));}assert(minR>=20,`smallest curve ${minR}`);}
 {const p=tt.trackAt(500),q=tt.trackAt(500+TR.length);assert(Math.abs(p.x-q.x)<1e-9&&Math.abs(p.z-q.z)<1e-9,'trackAt wraps');
  const n=tt.leftNormal(p.tx,p.tz),hit=tt.trackNearest(p.x+n.x*2,p.z+n.z*2);assert(hit&&Math.abs(hit.d-2)<.05&&hit.side===1&&Math.abs(hit.s-500)<.5,'nearest: 2 m left of s 500');
  assert.equal(tt.trackNearest(0,0),null,'island square is nowhere near the line');}
 // 2. stops and crossings
 const order=['west','south','summit','cay','north'],S=Object.fromEntries(tt.TRAIN_STATIONS.map(s=>[s.id,s]));
 for(let i=1;i<order.length;i++)assert(S[order[i]].s>S[order[i-1]].s,`${order[i]} after ${order[i-1]}`);
 for(const [id,want] of [['west',586],['south',1243],['summit',1601],['cay',2056],['north',2522]])assert(Math.abs(S[id].s-want)<8,`${id} stop at ~${want} m (plan §5): ${S[id].s}`);
 for(const s of tt.TRAIN_STATIONS)assert(/No\. \d/.test(s.shirt)&&s.shirt.length<48,`${s.id}: a short shirt-number line`);
 const prof=tl.trainLayout().profile,kindAt=s=>prof.kind[Math.round(tt.wrapS(s)/tt.TRACK_DS)%TR.n];
 assert.equal(tt.TRAIN_CROSSINGS.length,9,'nine level crossings (Phase 4: + the west park trails and the Beach Kitchen square)');assert.equal(tt.TRAIN_CROSSINGS.filter(c=>!c.ped).map(c=>c.id).join(),'causeway','every crossing but the causeway road is a footpath one');for(const c of tt.TRAIN_CROSSINGS)assert.equal(kindAt(c.s),K.Land,`${c.id} crossing on land`);
 for(const s of tt.TRAIN_STATIONS)assert.equal(kindAt(s.s),K.Land,`${s.id} station on land`);
 // 3. heights
 for(let i=0;i<TR.n;i++){const k=(i+1)%TR.n,g=Math.abs(prof.bed[k]-prof.bed[i])/tt.TRACK_DS;assert(g<=.055,`grade ${g.toFixed(3)} at s ${i*tt.TRACK_DS|0}`);assert(prof.bed[i]>=-1e-6&&prof.bed[i]<=tt.TUNNEL_BED+1e-6);}
 {const W=tt.TUNNEL.west,E=tt.TUNNEL.east,len=E.s-W.s;assert(len>160&&len<195,`tunnel ${len} m`);
  // (≤ 1 m off the portal-to-portal chord: the east portal sits 2.5 m out on the start of the curve since Nov 23, measured 0.92)
  for(let s=W.s+4;s<=E.s-4;s+=4){const p=tt.trackAt(s),dev=Math.abs((p.x-W.x)*(E.z-W.z)-(p.z-W.z)*(E.x-W.x))/Math.hypot(E.x-W.x,E.z-W.z);assert(dev<1,`tunnel straight (${dev.toFixed(2)} m off at ${s|0})`);
   if(s>W.s+6&&s<E.s-6){assert.equal(kindAt(s),K.Tunnel);assert(su.summitGround(p.x,p.z)>tt.TUNNEL_BED+6.2,`hill over the tube at ${s|0}`);}}}
 for(let s=tt.SUMMIT_TRACK.landWest;s<=tt.SUMMIT_TRACK.landEast;s+=3){if(tt.inTunnelS(s))continue;const p=tt.trackAt(s);assert(Math.abs(su.summitGround(p.x,p.z)-tt.summitBedAt(s))<.06,`Summit ground carved to the bed at s ${s|0}`);}
 {const st=tt.trackAt(S.summit.s);assert(Math.abs(su.summitGround(st.x,st.z)-tt.SUMMIT_STATION_BED)<.02,'Summit station on its flat');}
 // 4. the built world
 assert(world.train,'the Island Line builds');assert(world.train.movedProps()>=30,`small props stepped off the line (${world.train.movedProps()})`);
 const stationVending=L('lib/town/vendingCatalog.ts').VENDING_MACHINES.filter(m=>m.station);assert.equal(stationVending.length,5,'Phase 4: a drink machine on every platform');// they stand on the platform by design (tests/train-station-npcs.cjs places them)
 const near=obstacles.filter(o=>!o.train&&!stationVending.some(m=>Math.hypot(m.x-o.x,m.z-o.z)<.05)&&Math.max(o.w,o.d)<=3&&tl.trackPushOut(o.x,o.z,Math.max(o.w,o.d)/2));assert.equal(near.length,0,`colliders on the line: ${near.slice(0,4).map(o=>`${o.x|0},${o.z|0}`).join(' ')}`);
 for(const s of tt.TRAIN_STATIONS){const c=tt.trackAt(s.s),n=tt.leftNormal(c.tx,c.tz),hx=c.x+n.x*s.side*(s.id==='south'?4.4:5.6),hz=c.z+n.z*s.side*(s.id==='south'?4.4:5.6);
  assert(obstacles.some(o=>o.train&&Math.abs(o.x-hx)<o.w/2+.8&&Math.abs(o.z-hz)<o.d/2+.8),`${s.id}: the house is solid`);
  const px=c.x+n.x*s.side*3.4,pz=c.z+n.z*s.side*3.4;assert(world.walkSurfaces.some(w=>w.stepUp===.6&&Math.abs(px-w.x)<=w.w/2&&Math.abs(pz-w.z)<=w.d/2&&Math.abs(w.height-(prof.bed[Math.round(s.s/tt.TRACK_DS)%TR.n]+tt.STATION_PLATFORM_Y))<.01),`${s.id}: platform walkable, one step up`);}
 {const lay=tl.trainLayout();assert(lay.piers.length>=40,'trestle piers');assert(tl.trainSwimBlocked(lay.columns[0],lay.columns[1]),'a swimmer meets a pier column');
  const p=lay.piers[5];assert(!tl.trainSwimBlocked(p.x+p.tx*4,p.z+p.tz*4),'and swims between piers, under the deck');}
 assert(!world.obstacles.some(o=>o.train&&Math.abs(o.x-80)<1&&Math.abs(o.z+207)<1.5),'the North Beach path crossing stays open');
 // 5. heat and wiring
 const scene=new T.Scene();const boards=new Set();let tube=null;
 const w2=L('lib/town/world.ts').buildTown(scene);scene.traverse(o=>{if(o.name==='train-tunnel-tube')tube=o;if(o.isMesh&&o.material&&o.material.map&&o.material.map.image&&o.material.map.image.width===1024&&o.material.map.image.height===1024)boards.add(o.material);});
 assert(tube&&tube.parent&&tube.parent.name==='train-tunnel','the tunnel tube is its own mesh (visible at build for the warm compile; update() gates it)');
 assert(boards.size<=1,`one station board material (${boards.size})`);
 const cam=new T.PerspectiveCamera();cam.position.set(tt.TUNNEL.west.x-20,12,tt.TUNNEL.west.z+20);cam.updateMatrixWorld(true);w2.train.update(cam);assert(tube.visible,'shown near the west portal');
 cam.position.set(100,20,0);cam.updateMatrixWorld(true);w2.train.update(cam);assert(!tube.visible,'hidden in town');
 assert(/trainSwimBlocked\(x,z\)/.test(read('components/Town.tsx')),'Town: swimmers meet the piers');assert(/buildTrainWorld\(/.test(read('lib/town/world.ts')),'world builds the line');
 // Nov 23 2026 owner fixes. (a) Walking on the line: feet on the sleepers on land rows, on the deck at every crossing (all 5,
 // the causeway's 16 m included), sloping down to the ground off the ballast; Town feeds it to rooftopTravel's surface.
 {const P=tl.trainLayout().profile;let n=0;
  for(let i=0;i<TR.n;i+=37){if(P.kind[i]!==K.Land||P.kind[(i+1)%TR.n]!==K.Land||tt.TRAIN_CROSSINGS.some(c=>Math.abs(c.s-i*tt.TRACK_DS)<12))continue;const p=tt.trackAt(i*tt.TRACK_DS+.5),bed=tt.bedAt(P,i*tt.TRACK_DS+.5),nn=tt.leftNormal(p.tx,p.tz);
   for(const v of [0,.6,-1.2]){const h=tl.trainWalkHeight(p.x+nn.x*v,p.z+nn.z*v);assert(Math.abs(h-(bed+tl.TRAIN_WALK_TOP))<.02,`on the line at s ${i*2} (${v} m): ${h.toFixed(2)} vs bed ${bed.toFixed(2)}`);}
   const off=tl.trainWalkHeight(p.x+nn.x*6,p.z+nn.z*6);assert(off===0,'6 m off the line: ground');n++;}
  assert(n>=18,'sampled land rows '+n);
  for(const c of tt.TRAIN_CROSSINGS)for(const du of [-c.width/2+.3,0,c.width/2-.3]){const p=tt.trackAt(c.s+du),bed=tt.bedAt(P,c.s+du),h=tl.trainWalkHeight(p.x,p.z);assert(Math.abs(h-(bed+.31))<.02,`crossing ${c.id} at ${du.toFixed(1)}: ${h.toFixed(2)}`);}
  assert(/trainWalkHeight\(x,z\)/.test(read('components/Town.tsx')),'Town: walk height on the line');}
 // (b) Beach props, lawns and decals keep 3 m off the ballast (foot ~1.9 m): umbrellas (centre) >= 4.5 m, lawn edges >= 4.9 m, decals guarded.
 {const near=(x,z,r)=>tt.trackNearest(x,z,r);const B=L('lib/town/beachLoungers.ts'),S=L('lib/town/shoreline.ts'),W=L('lib/town/westParkLayout.ts');
  const ums=[...B.PALM_COAST_UMBRELLAS,...S.NORTH_BEACH_UMBRELLAS,...world.assets.filter(a=>a.kind==='beach-umbrella')];
  for(const u of ums)assert(!near(u.x,u.z,4.5),`umbrella at ${u.x},${u.z} is off the line`);
  for(const l of W.PARK_LAWNS)for(let a=0;a<360;a+=4){const t=a*Math.PI/180;assert(!near(l.x+Math.cos(t)*l.rx,l.z+Math.sin(t)*l.rz,4.9),`lawn ${l.x},${l.z} edge off the line`);}
  assert(/offLine\(x,z\)&&/.test(read('lib/town/groundDecalSites.ts')),'decals keep off the line');
  // (c) the sand ribbon never folds over itself (coplanar layers flickered at the South beach's SE corner)
  const Q=S.SHORE_SAND;for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length];assert((b.outer.x-a.outer.x)*(b.inner.x-a.inner.x)+(b.outer.z-a.outer.z)*(b.inner.z-a.inner.z)>0,`sand ribbon folds at ${a.outer.x.toFixed(0)},${a.outer.z.toFixed(0)}`);}}
 assert(!/requestAnimationFrame|setInterval|setTimeout/.test(read('lib/town/trainWorld.ts')+read('lib/town/trainTrack.ts')+read('lib/town/trainLayout.ts')),'nothing animates');
 console.log('train-track: ok');
})().catch(e=>{console.error(e);process.exit(1);});
