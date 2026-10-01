// Coral Cay ball hunt (Sep 29 2026): twenty new balls take the hunt to 100. Every spot is re-checked here against the
// geometry the island actually builds (world.ts + coralCayWorld.ts, positions from coralCay.ts helpers), so a reshaped
// causeway or cay that strands a ball fails this test: walkable ground or the flight corridor, clear of every obstacle,
// spaced from every other ball, one lesson + scene + practice prompt + source each, and save migration for 80-ball players.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}

const {COIN_QUEST,sanitizeCoinProgress,coinRewardEarned,allCostumesEarned,PRE_CORAL_CAY_IDS,costumeEarned,COSTUME_UNLOCK_ORDER,COIN_REWARD_ID}=load('lib/town/coinQuest.ts');
const {CORAL_CAY_SPOTS}=load('lib/town/coralCayBalls.ts'),{BALL_HUNT_SOURCES}=load('lib/town/ballHuntSources.ts'),{BALL_HUNT_LESSONS,BALL_HUNT_PRACTICE,SCENES}=load('lib/town/ballHuntLessons.ts');
const cay=load('lib/town/coralCay.ts'),{blocked,flightBlocked,insideObstacle}=load('lib/town/simulation.ts'),{onLand}=load('lib/town/landmass.ts');
const world=load('lib/town/world.ts').buildTown(new T.Scene());

// 1. Count, ids, order: 100 balls, the new twenty appended after the original eighty.
assert.equal(COIN_QUEST.length,100,'the hunt has 100 balls');assert.equal(new Set(COIN_QUEST.map(s=>s.id)).size,100,'ids are unique');
assert.equal(CORAL_CAY_SPOTS.length,20);assert.deepEqual(COIN_QUEST.slice(80).map(s=>s.id),CORAL_CAY_SPOTS.map(s=>s.id),'new balls are appended');
assert.equal(PRE_CORAL_CAY_IDS.length,80);assert.deepEqual(PRE_CORAL_CAY_IDS,COIN_QUEST.slice(0,80).map(s=>s.id));

// 2. Every new ball has its own lesson, scene, practice prompt and at least one authoritative source.
const oldKinds=new Set(COIN_QUEST.slice(0,80).map(s=>BALL_HUNT_LESSONS[s.id].kind));
for(const s of CORAL_CAY_SPOTS){const l=BALL_HUNT_LESSONS[s.id];assert(l&&SCENES[l.kind]&&BALL_HUNT_PRACTICE[s.id],`${s.id} has a lesson, scene and practice prompt`);
 assert(!oldKinds.has(l.kind),`${s.id} teaches a concept none of the first 80 balls teach`);
 const src=BALL_HUNT_SOURCES[s.id];assert(Array.isArray(src)&&src.length>=1&&src.every(r=>r.title&&/^https:\/\//.test(r.url)),`${s.id} records a source`);
 assert(s.clue.length>20&&s.detail.length>40&&s.teaching.length>=90,`${s.id} clue, detail and teaching`);}
console.log('PASS 100 balls, unique ids, 20 appended Coral Cay balls, each with its own new concept, scene, practice prompt and source');

// 3. Where they are: roughly eight on the causeway, three or four on the sandbars, eight or nine on the cay.
const where=s=>s.parachute?'flight':s.wall&&cay.onCay(s.x,s.z)?'cay':cay.onSandbarStop(s.x,s.z)?'sandbar':cay.onCay(s.x,s.z)?'cay':cay.onCauseway(s.x,s.z)?'causeway':'?';
const region=s=>where(s)==='flight'?'causeway':where(s);
const tally={};for(const s of CORAL_CAY_SPOTS)tally[region(s)]=(tally[region(s)]||0)+1;
// The welcome-arch target stands on the cay end of the causeway: it counts with the causeway balls.
if(CORAL_CAY_SPOTS.some(s=>s.id==='cay-arch'&&region(s)==='cay')){tally.cay--;tally.causeway++;}
assert(!tally['?'],'every ball is somewhere walkable or flyable: '+JSON.stringify(tally));
assert(tally.causeway>=7&&tally.causeway<=9&&tally.sandbar>=3&&tally.sandbar<=4&&tally.cay>=8&&tally.cay<=9,'spread '+JSON.stringify(tally));
const mech=new Set(CORAL_CAY_SPOTS.map(s=>s.manhole?'manhole':s.buoy?'buoy':s.parachute?'sky':s.wall?'wall':s.y>0?'roof':s.kind));
for(const m of ['manhole','buoy','sky','wall','roof','hidden','kick','landing'])assert(mech.has(m),'mechanic mix includes '+m);
console.log('PASS spread',JSON.stringify(tally),'mechanics',[...mech].join(', '));

// 4. Reachable and never inside geometry, against the built world.
const obstacles=world.obstacles,buildings=world.buildings,roof=world.roofObstacles;
const footprint=s=>s.kind==='hidden'?{x:s.x,z:s.z+.2,w:1.5,d:.8}:{x:s.x,z:s.z,w:1.6,d:1.3};
const overlaps=(a,o)=>Math.abs(a.x-o.x)<(a.w+o.w)/2&&Math.abs(a.z-o.z)<(a.d+o.d)/2;
for(const s of CORAL_CAY_SPOTS){
 if(s.parachute){
  assert(!flightBlocked(s.x,s.z)&&cay.inCayFlightZone(s.x,s.z),`${s.id} is inside the flight corridor`);
  if(s.buoy){assert(!onLand(s.x,s.z)&&cay.distanceToCayLand(s.x,s.z)>2,'the buoy floats in the sea, off every walkable deck');assert.equal(s.y,0,'the ball rests on the buoy at sea level');
   const f=cay.causewayFrame(s.x,s.z,true),offRail=f.dist-cay.CAUSEWAY.railHalf;assert(offRail>=6&&offRail<=10,`the buoy is 6–10 m off the rail (${offRail.toFixed(1)} m)`);
   const k=s.kickFrom;assert(k&&cay.onCauseway(k.x,k.z)&&!blocked(k.x,k.z,obstacles,.35),'the chalk-marked kicking spot is on the walkable deck');
   const kd=Math.hypot(s.x-k.x,s.z-k.z);assert(kd>=6&&kd<=13,`a fair shot: ${kd.toFixed(1)} m from the mark`);
   const sharks=Math.min(...cay.SHARK_LOOPS.flatMap(l=>l.points).map(q=>Math.hypot(q.x-s.x,q.z-s.z)));assert(sharks>=10,`sharks pass at least 10 m from the buoy (${sharks.toFixed(1)} m)`);}
  else assert(s.y>=60,'high aerial ball');
  continue;}
 if(s.y>0){// Rooftop: on a building roof of exactly this height, clear of its edges and roof props.
  const b=buildings.find(b=>Math.abs(b.height-s.y)<.05&&Math.abs(s.x-b.x)<b.w/2-1&&Math.abs(s.z-1.35-b.z)<b.d/2-1&&Math.abs(s.z-b.z)<b.d/2-.6);assert(b,`${s.id} sits on a roof at its own height`);
  assert(!roof.some(o=>insideObstacle(s.x,s.z,o,.8)),`${s.id} clear of roof props`);continue;}
 assert(cay.isOnCayLand(s.x,s.z),`${s.id} is on Coral Cay ground (${s.x},${s.z})`);
 if(s.manhole){assert(cay.causewayFrame(s.x,s.z).dist<.5,'the causeway cover is in the middle of the road');continue;}
 if(s.wall){assert(!blocked(s.x,s.z,obstacles,.4),`${s.id} pickup is walkable`);
  const face=s.wall.facing==='east'?{x:s.wall.x-.4,z:s.wall.z}:{x:s.wall.x,z:s.wall.z-.4};
  assert(obstacles.some(o=>insideObstacle(face.x,face.z,o))||buildings.some(b=>insideObstacle(face.x,face.z,b)),`${s.id} target is mounted on real geometry`);
  const dx=s.wall.facing==='east'?1:0,dz=dx?0:1;for(let d=2.5;d<=9;d+=.5)assert(!blocked(s.wall.x+dx*d,s.wall.z+dz*d,obstacles,.35),`${s.id} has a clear shooting approach at ${d} m`);continue;}
 const fp=footprint(s);assert(!obstacles.some(o=>overlaps(fp,o)),`${s.id} box does not overlap any obstacle`);
 assert(!buildings.some(o=>overlaps(fp,o)),`${s.id} box is not inside a building`);
 for(const [px,pz] of [[fp.x-fp.w/2,fp.z-fp.d/2],[fp.x+fp.w/2,fp.z-fp.d/2],[fp.x-fp.w/2,fp.z+fp.d/2],[fp.x+fp.w/2,fp.z+fp.d/2]])assert(cay.isOnCayLand(px,pz),`${s.id} box stands fully on the ground`);
 if(s.kind==='hidden')assert(!blocked(s.x,s.z-1.35,obstacles,.3)&&cay.isOnCayLand(s.x,s.z-1.35),`${s.id} ball pickup point is walkable`);
 // QA11 D-1: the hostel ball's pickup (behind its bag) is reached by walking straight south off the verandah (no phantom rail).
 if(s.id==='cay-rest')for(let z=cay.HOSTEL.z+cay.HOSTEL.d/2+.4;z<=s.z-1.35;z+=.1)assert(!blocked(s.x,z,obstacles,.3),`cay-rest: straight walk from the verandah is clear at z ${z.toFixed(1)}`);
 else{let open=0;for(let a=0;a<16;a++){const x=s.x+Math.sin(a*Math.PI/8)*2.6,z=s.z+Math.cos(a*Math.PI/8)*2.6;if(cay.isOnCayLand(x,z)&&!blocked(x,z,obstacles,.35))open++;}assert(open>=4,`${s.id} can be approached to kick (${open}/16 sides)`);}
}
// 4b. The buoy ball (Sep 29 2026 fix): the ball rests on the buoy, a shot from the chalk mark collects it, the parachute still works.
{const b=CORAL_CAY_SPOTS.find(s=>s.buoy),k=b.kickFrom;
 // A fresh module graph per scenario: coin progress is module state, so one scenario's collection cannot hide another's.
 const make=()=>{cache.clear();const got=[],h=load('lib/graphics/coinHunt.ts').createCoinHunt(new T.Scene(),s=>got.push(s.id),()=>{});return {h,got};};
 {const {h}=make(),g=h.root.getObjectByName('coin-spot-'+b.id);g.updateWorldMatrix(true,true);const parcel=g.children[0],coin=g.children[1];
  const top=new T.Box3().setFromObject(parcel,true);/* the buoy top directly under the ball (the gold rim around it is a cup, not the top) */
  const pos=h.buoyScenery.children[0].geometry.getAttribute('position');let collar=-Infinity;for(let i=0;i<pos.count;i++){if(Math.hypot(pos.getX(i)-b.x,pos.getZ(i)-b.z)<.3)collar=Math.max(collar,pos.getY(i));}
  const ballBottom=coin.getWorldPosition(new T.Vector3()).y-.34;assert(ballBottom-collar>=0&&ballBottom-collar<=.5,`the ball sits on the buoy top (gap ${(ballBottom-collar).toFixed(2)} m)`);
  assert(Math.hypot(coin.getWorldPosition(new T.Vector3()).x-b.x,coin.getWorldPosition(new T.Vector3()).z-b.z)<.01,'the ball is centred on the buoy');void top;h.dispose();}
 // Kick: the ball flies out over the sea (ballSea.ts), so a shot that reaches the buoy collects it; a wide one does not.
 // Full flight from the chalk mark with the real walking ball is in tests/ball-sea.cjs.
 const dx=b.x-k.x,dz=b.z-k.z,l=Math.hypot(dx,dz);
 {const {h,got}=make();const scenery=h.buoyScenery;assert(scenery.parent&&scenery.visible&&scenery.children.length===1,'the buoy is persistent scenery (one packed draw) before collection');
  assert(h.aim({x:k.x,y:0,z:k.z},Math.atan2(dx,dz)+.9,()=>false)!==null&&h.aim({x:k.x,y:0,z:k.z},Math.atan2(dx,dz)+1.3,()=>false)===null,'kick assist turns a shot within ±60° toward the buoy, not one facing away');
  h.update(.1,{x:k.x,y:0,z:k.z},true,true);assert(!h.hit(b.x+3.5,.3,b.z,dx/l*14,dz/l*14),'a shot 3.5 m wide of the buoy misses');assert(!got.length);
  assert(h.hit(b.x-dx/l*1.5,.4,b.z-dz/l*1.5,dx/l*14,dz/l*14),'a shot reaching the buoy collects it');assert.deepEqual([...got],[b.id]);
  h.update(.1,{x:k.x,y:0,z:k.z},true,true);const g=h.root.getObjectByName('coin-spot-'+b.id);assert(!g.visible,'the ball is gone once found');
  assert(scenery.parent&&scenery.visible,'the buoy itself stays after the ball is found');assert(h.buoySolid(b.x+.5,.3,b.z)&&!h.buoySolid(b.x+2,.3,b.z)&&!h.buoySolid(b.x,2,b.z),'the found buoy is a solid the ball bounces off');
  assert(!h.hit(b.x-.5,.3,b.z,14,0),'hitting the found buoy again gives no reward');assert.equal(got.length,1);h.dispose();}
 // Parachute: a descent over the buoy still collects it, with a generous radius.
 {const {h,got}=make();h.update(.1,{x:b.x+3.5,y:4,z:b.z},true,false,null,false);assert(!got.length,'flying past without the parachute does not collect');
  h.update(.1,{x:b.x+3.5,y:4,z:b.z},true,false,null,true);assert.deepEqual([...got],[b.id],'an open parachute within 4.5 m collects it');h.dispose();}
 console.log(`PASS buoy: ball on the buoy top; a shot reaching it collects it (mark ${l.toFixed(1)} m away), wide shots miss, kick assist, parachute pickup; the buoy stays as solid scenery after`);}
console.log('PASS every new ball: on walkable cay ground, a roof or inside the flight corridor; boxes clear of obstacles; kick approaches and pickups open; the buoy over open water, off the deck');

// 5. No two balls too close (the trucks move, so they are skipped).
let closest=Infinity;const fixed=COIN_QUEST.filter(s=>s.truck===undefined);
for(const a of CORAL_CAY_SPOTS)for(const b of fixed){if(a===b)continue;const d=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);closest=Math.min(closest,d);assert(d>=10,`${a.id} and ${b.id} are only ${d.toFixed(1)} m apart`);}
console.log(`PASS spacing: every Coral Cay ball is at least 10 m from every other ball (closest ${closest.toFixed(1)} m)`);

// 6. Saved progress: nothing is taken away from players who found all 80 before Coral Cay.
const old80={version:4,revealed:PRE_CORAL_CAY_IDS,collected:PRE_CORAL_CAY_IDS,hint:null,celebrated:true,rewardUnlocked:false};
const m=sanitizeCoinProgress(old80);assert.equal(m.version,5);assert(m.rewardUnlocked&&coinRewardEarned(m),'an 80-ball save keeps the Matchday Fox');assert(allCostumesEarned(m)&&COSTUME_UNLOCK_ORDER.every(id=>costumeEarned(m,id)),'and every costume');
assert(!m.celebrated,'the new 100-ball finale is still ahead of them');assert.equal(m.collected.length,80);
const again=sanitizeCoinProgress(JSON.parse(JSON.stringify(m)));assert(again.rewardUnlocked&&again.allCostumesUnlocked,'the grandfathered unlock survives a re-save as version 5');
assert(!coinRewardEarned(sanitizeCoinProgress({...old80,collected:PRE_CORAL_CAY_IDS.slice(0,79)})),'79 of the old 80 does not unlock the fox');
assert(!coinRewardEarned(sanitizeCoinProgress({...old80,version:5})),'a new (version 5) save needs all 100');
const partial=sanitizeCoinProgress({version:4,collected:PRE_CORAL_CAY_IDS.slice(0,60)});assert(!partial.rewardUnlocked&&COSTUME_UNLOCK_ORDER.filter(id=>costumeEarned(partial,id)).length===18,'a 60-ball save keeps its 18 club costumes');
assert(!costumeEarned(partial,COIN_REWARD_ID));
console.log('PASS migration: 80-ball saves keep the fox and every costume, finale reset for 100; partial and new saves unchanged');
})().catch(e=>{console.error(e);process.exit(1);});
