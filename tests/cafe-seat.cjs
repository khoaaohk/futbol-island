// The Café by the Sea view seat + the café name swap (Nov 25 2026; lib/town/cafeSeat.ts, seasideCafe.ts CAFE_VIEW_SEAT,
// seasideCafeWorld.ts, world.ts). Builds the real island in Node and checks: the names (the seaside café is "Café by the Sea", the
// town café "Half-Time Café", no old name left on either; persisted ids unchanged), the bench faces Summit Isle, the sit point is
// free of every collider (you can sit, stand and walk out west), the table / bench / back are colliders a walker cannot pass
// through, the seat is on the deck (not over the rail), the Sit offer stays clear of Malia's talk range and the Visit café prompt,
// the sit machine (sit, held, stick gets up, reduced motion snaps), the camera frame looks toward the summit over the sea, and every
// view note is one line with a listed source. usage: node tests/cafe-seat.cjs
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const base=path.resolve(__dirname,'..');
(async()=>{
 const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
 const {L,world,sim,obstacles}=await loadIslandWorld(base);
 const C=L('lib/town/seasideCafe.ts'),S=L('lib/town/cafeSeat.ts'),SI=L('lib/town/summitIsle.ts'),seats=L('lib/town/stadiumSeats.ts');
 const read=f=>fs.readFileSync(path.join(base,f),'utf8');
 // 1. Names: swapped everywhere a player sees them; ids that may be persisted stay.
 assert.equal(C.CAFE_NAME,'Café by the Sea');assert.equal(C.CAFE_MAP.label,'CAFÉ BY THE SEA');assert.match(C.CAFE_OWNER.role,/^Café by the Sea owner$/);
 assert.ok(world.buildings.some(b=>b.name==='CAFÉ BY THE SEA'),'seaside café building entry');
 assert.ok(world.buildings.some(b=>b.name==='HALF-TIME CAFÉ')&&world.buildings.some(b=>b.name==='HALF-TIME CAFÉ NORTH WING'),'town café keeps its lookups under the new key');
 assert.ok(!world.buildings.some(b=>/CAFE BY THE SEA/.test(b.name)),'no old town key left');
 const world_ts=read('lib/town/world.ts');assert.ok(!/CAFE BY THE SEA/.test(world_ts),'world.ts: old key gone');assert.equal((world_ts.match(/'HALF-TIME CAFÉ'/g)||[]).length,8,'every town-café lookup renamed together');
 assert.ok(/'HALF-TIME CAFÉ'/.test(read('lib/town/buildingStyles.ts')),'landmark list renamed with it');
 const cq=read('lib/town/coinQuest.ts');assert.ok(/"id": "high-promenade", "name": "Half-Time Caf\\u00e9/.test(cq)&&!/Cafe By The Sea/.test(cq),'coin quest: label renamed, id kept');
 assert.ok(/registerLandableDeck\(\{id:'half-time-cafe'/.test(read('lib/town/seasideCafe.ts')),'deck id kept (internal)');
 for(const f of ['lib/town/seasideCafeWorld.ts','lib/town/npcFresh/part7.ts','components/Town.tsx','components/IslandOverview.tsx'])
  assert.ok(!/Half-Time Café|HALF-TIME CAFÉ|'HALF-TIME'/.test(read(f)),`${f}: the seaside café no longer says Half-Time`);
 {const malia=read('lib/town/townsfolkCast.ts').split('\n').find(l=>/'cay-malia'/.test(l));assert.ok(/Café by the Sea owner/.test(malia)&&!/Half-Time/.test(malia),'cast: Malia');
  assert.ok(/'cafe-oren'.*Half-Time Café rule/.test(read('lib/town/townsfolkCast.ts')),'the town café regular teaches with its new name');}
 {const sc=read('lib/town/seasideCafe.ts').replace('the café in town is named after them: the Half-Time Café!','');assert.ok(!/Half-Time Café|HALF-TIME/.test(sc),'seasideCafe.ts: only the cross-link to the town café says Half-Time');}
 assert.ok(/café in town is named after them: the Half-Time Café/.test(C.CAFE_OWNER.topics.find(t=>t.id==='halftime').answer),'Malia points to the town café');
 // 2. The bench faces Summit Isle; the table is in front of it (between the bench and the summit), the seat on the front deck.
 const V=C.CAFE_VIEW_SEAT,b=Math.atan2(SI.SUMMIT_CENTER.x-V.sit.x,SI.SUMMIT_CENTER.z-V.sit.z);
 assert.ok(Math.abs(Math.atan2(Math.sin(V.yaw-b),Math.cos(V.yaw-b)))<.02,'faces the summit');
 assert.ok((V.table.x-V.sit.x)*V.ux+(V.table.z-V.sit.z)*V.uz>.8,'table in front');
 assert.ok(C.onCafeDeck(V.sit.x,V.sit.z)&&C.onCafeDeck(V.bench.x,V.bench.z),'on the deck');
 assert.equal(C.CAFE_TABLES[2].chairs,0);assert.equal(C.CAFE_TABLES.length,5,'a table moved, none added');
 // 3. Colliders: the sit point is free (sit / stand never stuck), the way out west is free, the table and back block a walker.
 const solid=obstacles.filter(o=>!o.stepAccess);// the deck and steps are walk surfaces (stepAccess), not walls
 assert.ok(!sim.blocked(V.sit.x,V.sit.z,solid),'sit point free');
 const sx=Math.cos(V.yaw),sz=-Math.sin(V.yaw);
 assert.ok(!sim.blocked(V.sit.x-.6*sx,V.sit.z-.6*sz,solid)&&!sim.blocked(V.sit.x-1.2*sx,V.sit.z-1.2*sz,solid),'the west end is the way out');
 assert.ok(sim.blocked(V.table.x,V.table.z,solid),'table blocks');assert.ok(sim.blocked(V.bench.x-.6*V.ux,V.bench.z-.6*V.uz,solid),'backrest blocks');
 assert.ok(sim.blocked(V.bench.x+.72*sx,V.bench.z+.72*sz,solid),'east end (by the rail) blocks');
 // 4. Prompts: the Sit offer never overlaps Malia's talk range (2.2 m: stadiumSit TALK_FIRST) nor the Visit café reach.
 assert.ok(Math.hypot(V.sit.x-C.CAFE_OWNER.x,V.sit.z-C.CAFE_OWNER.z)>V.reach+2.2+1,'clear of Malia');
 assert.ok(Math.hypot(V.sit.x-C.CAFE.x,V.sit.z-C.CAFE.z)>C.CAFE_PROMPT.reach+V.reach*0,'outside the Visit café reach');
 assert.ok(S.cafeSeatNear(V.sit.x-.8,V.sit.z,C.CAFE.floor)&&!S.cafeSeatNear(V.sit.x-.8,V.sit.z,0)&&!S.cafeSeatNear(V.sit.x-3,V.sit.z,C.CAFE.floor),'offer: on the deck, close by');
 // 5. The sit machine (shared with the stadium): sit, held, the stick gets up; reduced motion snaps.
 const notes=[];const seat=S.createCafeSeat({wake(){},note:t=>notes.push(t)});
 assert.equal(seat.want(V.sit.x-.8,V.sit.z,C.CAFE.floor,true).key,S.CAFE_SEAT_KEY);
 const got=seat.press(false);assert.ok(got&&Math.abs(got.x-V.sit.x)<1e-9,'sits');assert.equal(notes.length,1,'one view note');
 const keys=new Set();for(let i=0;i<40;i++)assert.ok(seat.holdPlayer(1/60,{x:0,z:0},keys,{walk:true,x:V.sit.x,z:V.sit.z,reduced:false}));
 assert.ok(seat.trick()&&seat.trick().w>.99,'seated pose fully on');
 seat.holdPlayer(1/60,{x:1,z:0},keys,{walk:true,x:V.sit.x,z:V.sit.z,reduced:false});for(let i=0;i<40;i++)seat.holdPlayer(1/60,{x:0,z:0},keys,{walk:true,x:V.sit.x,z:V.sit.z,reduced:false});
 assert.ok(!seat.seated&&seat.trick()===undefined,'the stick gets up');
 seat.want(V.sit.x-.8,V.sit.z,C.CAFE.floor,true);seat.press(true);assert.ok(seat.seated&&seat.trick().w===1,'reduced: snaps in');seat.press(true);assert.ok(!seat.seated&&seat.trick()===undefined,'reduced: snaps out');
 assert.notEqual(notes[0],notes[1],'the note rotates');
 // 6. Camera: behind and above the seat, looking at the summit (over the sea: the frame's ground track leaves the deck southward).
 for(const portrait of [false,true]){const f=S.cafeViewFrame(portrait);assert.ok(f.y>C.CAFE.floor+1.5,'eye height');
  const fx=f.lx-f.x,fz=f.lz-f.z,dir=Math.atan2(fx,fz);assert.ok(Math.abs(Math.atan2(Math.sin(dir-b),Math.cos(dir-b)))<.05,'looks at the summit');}
 // 7. Notes: one line each, every source listed (URL for the Laws).
 for(const n of S.CAFE_VIEW_NOTES){assert.ok(n.text.length<=120&&!/\n/.test(n.text),'one line');const src=S.CAFE_VIEW_SOURCES[n.source];assert.ok(src,'source listed');if(/^law/.test(n.source))assert.match(src.url,/^https:\/\/www\.theifab\.com\//);}
 // 8. Cheap: the sit runtime has no rAF / timer; the bench joins the deck batch (built with the island's box helper).
 const src=read('lib/town/cafeSeat.ts');assert.ok(!/requestAnimationFrame|setInterval|setTimeout/.test(src));
 assert.ok(/skip\(box\(B\.w,\.12,\.65/.test(read('lib/town/seasideCafeWorld.ts')),'bench built from the batched box helper');
 assert.ok(seats.createSitMachine,'reuses the stadium sit machine');
 console.log('cafe-seat: ok');
})().catch(e=>{console.error(e);process.exit(1);});
