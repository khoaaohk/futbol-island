const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Float64Array,URLSearchParams});return m.exports;}
const {createArcadeRoomCrowd}=load(path.join(ROOT,'lib/arcade/arcadeRoomCrowd.ts'));
for(const mobile of [false,true])for(const fps of [15,30,60]){
 const scene=new T.Scene(),cabinets=[[-7.5,-10,0],[-1.5,-10,0],[7.5,-10,0],[-4.5,-10,0],[4.5,-10,0]].map(([x,z,yaw])=>({x,z,yaw})),bounds={minX:-14,maxX:14,minZ:-11,maxZ:12};
 const crowd=createArcadeRoomCrowd({scene,mobile,cabinets,bounds});assert.equal(crowd.debugStates.length,mobile?3:5);assert.equal(crowd.debugStates.at(-1).x,2);assert.equal(crowd.debugStates.at(-1).z,8);assert.equal(crowd.debugStates.at(-1).phase,'entry');const refs=[...crowd.debugStates],start={...refs[0]},phases=new Set();
 for(let f=0;f<fps*100;f++){crowd.update(1/fps,f/fps,99,99);for(let i=0;i<refs.length;i++){const s=crowd.debugStates[i];assert.equal(s,refs[i]);assert(Number.isFinite(s.x+s.z));assert(s.x>=bounds.minX&&s.x<=bounds.maxX&&s.z>=bounds.minZ&&s.z<=bounds.maxZ);phases.add(s.phase);for(let j=0;j<i;j++)assert(Math.hypot(s.x-crowd.debugStates[j].x,s.z-crowd.debugStates[j].z)>=.829,'visitor bodies never overlap while crossing or playing');}}
 assert(refs.some(s=>s.visits>0),'walk to another cabinet and resume play');assert(refs.some(s=>s.cabinet!==s.id),'visitors change cabinets');assert(phases.has('cross')&&phases.has('play'));
 crowd.dispose();crowd.dispose();assert.equal(scene.children.length,0,'all crowd objects removed');const snapshot=JSON.stringify(refs);crowd.update(1,200,0,0);assert.equal(JSON.stringify(refs),snapshot,'disposed crowd cannot animate');
 // New crowd yields at its station without the main player being pushed.
 const yielding=createArcadeRoomCrowd({scene,mobile,cabinets,bounds});yielding.update(1/fps,0,start.x,start.z);assert(yielding.debugStates[0].greeting,'nearby visitor acknowledges player');for(let f=0;f<fps*2;f++)yielding.update(1/fps,f/fps,start.x,start.z);assert(yielding.debugStates[0].yielding);assert.equal(yielding.debugStates[0].greeting,false,'greeting ends instead of repeating while player stays nearby');assert(Math.hypot(yielding.debugStates[0].x-start.x,yielding.debugStates[0].z-start.z)>.35);yielding.dispose();
 console.log('ARCADE_ROOM_CROWD_PASS',JSON.stringify({mobile,fps,phases:[...phases]}));
}

const {separateArcadeBody}=load(path.join(ROOT,'lib/arcade/arcadeBodyCollision.ts'));
for(const fps of [15,30,60]){const other={x:0,z:0},body={x:-3,z:0};for(let i=0;i<fps*3;i++){body.x+=4.3/fps;separateArcadeBody(body,other);assert(Math.hypot(body.x,body.z)>=.839);}assert(body.x<-.83,'holding straight into a person cannot pass through');body.z=.2;for(let i=0;i<fps*3;i++){body.x+=3/fps;body.z+=1/fps;separateArcadeBody(body,other);assert(Math.hypot(body.x,body.z)>=.839);}assert(body.x>1,'diagonal input slides around the person');}
console.log('ARCADE_PLAYER_BODY_PASS: head-on blocking and tangential sliding at15/30/60Hz');

const {socialRoutine,socialPath,createSocialPose}=load(path.join(ROOT,'lib/arcade/arcadeSocial.ts'));
const variants=new Set();for(let id=0;id<5;id++){const routine=socialRoutine(id,'wave');variants.add(routine.name);assert(routine.seconds<10);const pose=createSocialPose(),motion={};for(let age=0;age<routine.seconds;age+=.05){pose(motion,routine,age,false,false);if(motion.skill)assert(Number.isFinite(motion.skill.progress)&&motion.skill.progress>=0&&motion.skill.progress<=1);}}
assert.equal(variants.size,5,'visitors have distinct signature exchanges');
const clearFloor=(x,z)=>!(x>-.8&&x<.8&&z> -2&&z<2);const route=socialPath({x:-3,z:0},{x:3,z:0},clearFloor);assert(route&&route.length<100);assert(route.every(p=>clearFloor(p.x,p.z)),'approach goes around furniture');assert.equal(socialPath({x:-3,z:0},{x:3,z:0},(x,z)=>Math.abs(x)>.7),null,'unreachable target is rejected');
for(const mobile of [false,true]){const scene=new T.Scene(),cabinets=[[-7.5,-10,0],[-1.5,-10,0],[7.5,-10,0],[-4.5,-10,0],[4.5,-10,0]].map(([x,z,yaw])=>({x,z,yaw})),crowd=createArcadeRoomCrowd({scene,mobile,cabinets,bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12}});for(const npc of crowd.debugStates){const routine=socialRoutine(npc.id,'celebrate'),initial={...npc};assert(crowd.reserve(npc.id,routine));for(let frame=0;frame<90;frame++){crowd.setSocialAge(npc.id,frame/30);crowd.update(1/30,frame/30,npc.x+1.2,npc.z);}assert(npc.social);assert(Math.hypot(npc.x-initial.x,npc.z-initial.z)<.01,'selected NPC waits rather than continuing its patrol');crowd.release(npc.id);crowd.update(1/30,4,99,99);assert.equal(npc.social,false,'release restores normal routine');}crowd.dispose();}
console.log('ARCADE_SOCIAL_ENGINE_PASS: five variants, shared native poses, obstacle paths, unavailable routes, NPC reserve/release');

for(let id=0;id<6;id++)for(const action of ['wave','jump','applaud','celebrate']){const routines=[0,1,2].map(n=>socialRoutine(id,action,id===5,n));assert.equal(new Set(routines.map(r=>r.beats.join(','))).size,3,'each NPC/action rotates three different exchanges');for(const routine of routines){assert(routine.seconds<10);for(const partner of [false,true]){const motion={},pose=createSocialPose();for(let t=0;t<routine.seconds;t+=.07){pose(motion,routine,t,partner,false);if(motion.skill)assert(motion.skill.progress>=0&&motion.skill.progress<=1);if(motion.jump)assert(motion.jump.progress>=0&&motion.jump.progress<=1);}}}}
console.log('ARCADE_SOCIAL_VARIETY_PASS: three variants per NPC and action, both partner poses bounded');

// The same island reactions stop the arcade rig, show stars, then release its route.
{
 const {createBallReactions}=load(path.join(ROOT,'lib/graphics/ballReactions.ts')),scene=new T.Scene(),camera=new T.PerspectiveCamera(),reactions=createBallReactions(scene),crowd=createArcadeRoomCrowd({scene,mobile:true,reactions,cabinets:[{x:0,z:-7,yaw:0},{x:6,z:-7,yaw:0},{x:-6,z:-7,yaw:0}],bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12}}),npc=crowd.debugStates[0],id='arcade-visitor-0';
 assert(reactions.hit({id,x:npc.x,y:0,z:npc.z},38,0));reactions.get(id).distance=0;
 for(let i=0;i<30;i++){reactions.update(1/60,camera,false,true);crowd.update(1/60,i/60,12,12);}
 const rig=scene.getObjectByName(id);assert(rig.rotation.x>1,'arcade visitor falls using island reaction');assert.equal(reactions.get(id).stars.children.length,3);
 for(let i=0;i<240;i++){reactions.update(1/60,camera,false,true);crowd.update(1/60,1+i/60,12,12);}
 assert.equal(reactions.get(id),undefined);assert(Math.abs(rig.rotation.x)<.1,'visitor stands again');crowd.dispose();reactions.dispose();assert.equal(scene.children.length,0);console.log('ARCADE_KNOCKDOWN_PASS');
}

// Block the central aisle, then clear it: every visitor must resume useful routes.
for(const fps of [15,30,60]){
 const scene=new T.Scene(),cabinets=[[-7.5,-10,0],[-1.5,-10,0],[7.5,-10,0],[-4.5,-10,0],[4.5,-10,0]].map(([x,z,yaw])=>({x,z,yaw})),crowd=createArcadeRoomCrowd({scene,mobile:false,cabinets,bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12}});
 for(let f=0;f<fps*220;f++){const blocked=f<fps*90;crowd.update(1/fps,f/fps,blocked?0:99,blocked?0:99);const people=crowd.debugStates;for(let i=0;i<people.length;i++)for(let j=0;j<i;j++)assert(Math.hypot(people[i].x-people[j].x,people[i].z-people[j].z)>=.829);}
 assert(crowd.debugStates.every(n=>n.visits>=2),'every visitor leaves congestion and reaches multiple cabinets');console.log('ARCADE_CONGESTION_PASS',fps,crowd.debugStates.map(n=>n.visits));crowd.dispose();
}

for(const action of ['wave','jump','applaud','celebrate'])for(let variant=0;variant<3;variant++){
 const patterns=Array.from({length:6},(_,id)=>socialRoutine(id,action,id===5,variant).beats.join(','));assert.equal(new Set(patterns).size,6,'each visitor has a distinct '+action+' exchange, variant '+variant);
}
for(let id=0;id<6;id++)for(let variant=0;variant<3;variant++)assert.equal(new Set(['wave','jump','applaud','celebrate'].map(action=>socialRoutine(id,action,id===5,variant).beats.join(','))).size,4,'all four buttons differ for each NPC');
for(const action of ['wave','jump','applaud','celebrate'])for(let variant=0;variant<3;variant++)assert(!socialRoutine(5,action,true,variant).beats.some(b=>['hop','bounce','keepUps','cheerRelay'].includes(b)),'counter attendant stays behind counter');
console.log('NPC_DISTINCT_ACTIONS_PASS: 72 authored exchanges, individual tempo, safe counter routines');
{// Nov 17 2026 (owner: every game side by side in the back, the gashapon pair in the middle): the row helper keeps up to 10 cabinets
 // inside the room, and with the hub's aisleGap no visitor ever walks through the centre pair, even walking out and back in (party).
 const C=load(path.join(ROOT,'lib/arcade/arcadeCatalog.ts')),{GASHAPON_MACHINES,GASHA_SIZE}=load(path.join(ROOT,'lib/gashapon/machines.ts'));
 const row=C.arcadeHubCabinets().filter(c=>c.id!==C.ARCADE_TABLE_ID);assert.equal(JSON.stringify(row.map(c=>c.id).sort()),JSON.stringify([...C.ARCADE_ROW].sort()),'every upright cabinet is in the row');
 assert(row.every(c=>c.z===C.ARCADE_ROW_Z&&c.yaw===0),'one straight row facing the door');const xs=C.ARCADE_ROW.map(id=>row.find(c=>c.id===id).x);
 for(let i=1;i<xs.length;i++)assert(Math.abs(xs[i]-xs[i-1]-C.arcadeRowPitch())<.011,'evenly spaced, west to east in ARCADE_ROW order');assert(Math.abs(xs[0]+xs.at(-1))<.011,'centred on x 0');
 assert.equal(C.arcadeRowPitch(6),3);for(const n of [9,10]){const p=C.arcadeRowPitch(n);assert((n-1)/2*p<=11+1e-9&&p>1.9+.5,n+' cabinets fit inside x ±11 with a gap between bodies');}
 const pair=GASHAPON_MACHINES.filter(m=>m.zone==='arcade');assert(pair.every(m=>Math.abs(m.x)<1&&m.z>=0&&m.z<=1&&m.yaw===0),'the pair stands mid-floor facing the door');
 for(const mobile of [false,true]){const scene=new T.Scene(),cabinets=['pinball','runner','puzzle','kitrush','tennis'].map(id=>row.find(c=>c.id===id)),crowd=createArcadeRoomCrowd({scene,mobile,cabinets,bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12},aisleGap:1.8});
  let visits=0;for(let f=0;f<30*90;f++){if(f===30*20)crowd.setFriendSlots(2);if(f===30*45)crowd.setFriendSlots(0);crowd.update(1/30,f/30,13,10);
   for(const n of crowd.debugStates){if(n.away)continue;for(const m of pair)assert(!(Math.abs(n.x-m.x)<GASHA_SIZE.w/2+.3&&Math.abs(n.z-m.z)<GASHA_SIZE.d/2+.3),`visitor ${n.id} walked through ${m.id} (${n.x.toFixed(2)}, ${n.z.toFixed(2)})`);}}
  for(const n of crowd.debugStates)visits+=n.visits;assert(visits>=crowd.debugStates.length,'visitors still go from cabinet to cabinet along the row');crowd.dispose();}
 // Nov 17 2026 bug: a walk to a cabinet (Squad Snake first seen) stopped short beside the visitor playing it, because a visitor stands 0.7 m
 // to the side of the cabinet's walk-up spot (closer than the body spacing) and the walk never arrived. Every cabinet now gets a free spot.
 {const {arcadeFreeSpot,ARCADE_BODY_SPACING}=load(path.join(ROOT,'lib/arcade/arcadeBodyCollision.ts')),all=C.arcadeHubCabinets(),scene=new T.Scene(),crowd=createArcadeRoomCrowd({scene,mobile:false,cabinets:all,bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12}});
  let blockedBefore=0,checked=0;for(let f=0;f<30*40;f++){crowd.update(1/30,f/30,13,10);if(f%15)continue;
   for(const v of crowd.debugStates){if(v.away||v.phase!=='play')continue;const c=all[v.cabinet];if(!c||c.id===C.ARCADE_TABLE_ID)continue;const bx=c.x+Math.sin(c.yaw)*1.8,bz=c.z+Math.cos(c.yaw)*1.8,out={x:0,z:0};
    if(crowd.debugStates.some(o=>!o.away&&Math.hypot(bx-o.x,bz-o.z)<ARCADE_BODY_SPACING))blockedBefore++;
    assert(arcadeFreeSpot(bx,bz,Math.cos(c.yaw),-Math.sin(c.yaw),crowd.debugStates.filter(o=>!o.away),out),`${c.id}: a free walk-up spot exists`);checked++;
    for(const o of crowd.debugStates)if(!o.away)assert(Math.hypot(out.x-o.x,out.z-o.z)>=ARCADE_BODY_SPACING,`${c.id}: the walk-up spot is clear of visitor ${o.id}`);assert(Math.hypot(out.x-bx,out.z-bz)<=.81,`${c.id}: still in front of the cabinet`);}}
  assert(checked>20&&blockedBefore>0,`visitors at play were checked (${checked}) and the old centre spot was blocked (${blockedBefore})`);crowd.dispose();
  const scn=fs.readFileSync(path.join(ROOT,'lib/arcade/arcadeRoomScene.ts'),'utf8');assert(/arcadeFreeSpot\(walkSpot\.x,walkSpot\.z,walkSpot\.lx,walkSpot\.lz,people,target\)/.test(scn)&&/walkStall>\.6/.test(scn)&&/arcadeDetour\(x,z,target,people,walkDetours<3\)/.test(scn),'the room walk uses the free spot, steps round a visitor who stopped in the lane, and gives up a blocked waypoint');
  {const {arcadeDetour}=load(path.join(ROOT,'lib/arcade/arcadeBodyCollision.ts')),v={x:0,z:-1},d=arcadeDetour(0,0,{x:0,z:-5},[v]);assert(d&&Math.hypot(d.x-v.x,d.z-v.z)>=ARCADE_BODY_SPACING&&d.z<0,'a visitor standing in the lane gets a waypoint round it');assert.equal(arcadeDetour(0,0,{x:0,z:-5},[{x:0,z:1}]),null,'a body behind the walker is not in the way');}}
 console.log('ARCADE_BACK_ROW_PASS',JSON.stringify({pitch:[6,9,10].map(n=>+C.arcadeRowPitch(n).toFixed(2)),xs}));
}
