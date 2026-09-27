const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Float64Array,URLSearchParams});return m.exports;}
const {createArcadeRoomCrowd}=load(path.join(ROOT,'lib/arcade/arcadeRoomCrowd.ts'));
for(const mobile of [false,true])for(const fps of [15,30,60]){
 const scene=new T.Scene(),cabinets=[[-8,-7,0],[0,-10,0],[8,-7,0],[-9,4,.55],[9,4,-.55]].map(([x,z,yaw])=>({x,z,yaw})),bounds={minX:-14,maxX:14,minZ:-11,maxZ:12};
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
for(const mobile of [false,true]){const scene=new T.Scene(),cabinets=[[-8,-7,0],[0,-10,0],[8,-7,0],[-9,4,.55],[9,4,-.55]].map(([x,z,yaw])=>({x,z,yaw})),crowd=createArcadeRoomCrowd({scene,mobile,cabinets,bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12}});for(const npc of crowd.debugStates){const routine=socialRoutine(npc.id,'celebrate'),initial={...npc};assert(crowd.reserve(npc.id,routine));for(let frame=0;frame<90;frame++){crowd.setSocialAge(npc.id,frame/30);crowd.update(1/30,frame/30,npc.x+1.2,npc.z);}assert(npc.social);assert(Math.hypot(npc.x-initial.x,npc.z-initial.z)<.01,'selected NPC waits rather than continuing its patrol');crowd.release(npc.id);crowd.update(1/30,4,99,99);assert.equal(npc.social,false,'release restores normal routine');}crowd.dispose();}
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
 const scene=new T.Scene(),cabinets=[[-8,-7,0],[0,-10,0],[8,-7,0],[-9,4,.55],[9,4,-.55]].map(([x,z,yaw])=>({x,z,yaw})),crowd=createArcadeRoomCrowd({scene,mobile:false,cabinets,bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12}});
 for(let f=0;f<fps*220;f++){const blocked=f<fps*90;crowd.update(1/fps,f/fps,blocked?0:99,blocked?0:99);const people=crowd.debugStates;for(let i=0;i<people.length;i++)for(let j=0;j<i;j++)assert(Math.hypot(people[i].x-people[j].x,people[i].z-people[j].z)>=.829);}
 assert(crowd.debugStates.every(n=>n.visits>=2),'every visitor leaves congestion and reaches multiple cabinets');console.log('ARCADE_CONGESTION_PASS',fps,crowd.debugStates.map(n=>n.visits));crowd.dispose();
}

for(const action of ['wave','jump','applaud','celebrate'])for(let variant=0;variant<3;variant++){
 const patterns=Array.from({length:6},(_,id)=>socialRoutine(id,action,id===5,variant).beats.join(','));assert.equal(new Set(patterns).size,6,'each visitor has a distinct '+action+' exchange, variant '+variant);
}
for(let id=0;id<6;id++)for(let variant=0;variant<3;variant++)assert.equal(new Set(['wave','jump','applaud','celebrate'].map(action=>socialRoutine(id,action,id===5,variant).beats.join(','))).size,4,'all four buttons differ for each NPC');
for(const action of ['wave','jump','applaud','celebrate'])for(let variant=0;variant<3;variant++)assert(!socialRoutine(5,action,true,variant).beats.some(b=>['hop','bounce','keepUps','cheerRelay'].includes(b)),'counter attendant stays behind counter');
console.log('NPC_DISTINCT_ACTIONS_PASS: 72 authored exchanges, individual tempo, safe counter routines');
