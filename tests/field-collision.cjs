// Solid live-field players (lib/town/fieldCollision.ts): no overlap, slide keeps progress, soft bump only,
// nothing off the field, and the match sim is untouched by any bump.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,JSON,Map,Set,Object,Array,Number,Infinity,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const FC=load('lib/town/fieldCollision.ts'),{VENUES,fieldPoint}=load('lib/town/venues.ts'),{MatchSim}=load('lib/town/match/matchSim.ts');
const {createFieldCollision,fieldBodyRadius,FIELD_BODY_MIN,FIELD_BODY_MAX,FIELD_BODY_DEFAULT,RIDE_PAD}=FC;
const REGULAR_GROUND=[-.08,.2,0,.24,.13,.265,.28,.27,.43,.25,.55,.22,.65,.16];
const rig=(x,z,extra={})=>({root:{visible:true,position:{x,z},scale:{x:1},rotation:{y:0},userData:{beanBody:{ground:REGULAR_GROUND}},...extra}});
const entryAt=(venue,bodies)=>({venue,root:{visible:true},rigs:new Map(bodies.map((b,i)=>['p'+i,b]))});
const v7=VENUES.find(v=>v.id==='7v7'),futsal=VENUES.find(v=>v.id==='futsal');
const SPEED={walk:6,scooter:8,bike:10,moped:12};
// Same integration as stepPlayer: velocity blends toward the stick, then the collision tick runs.
function drive(fc,pos,vel,dir,ride,entries,ticks,height=0,onTick){
 const dt=1/60,blend=1-Math.exp(-dt*9);let bumps=0;
 for(let i=0;i<ticks;i++){
  vel.x+=(dir.x*SPEED[ride]-vel.x)*blend;vel.z+=(dir.z*SPEED[ride]-vel.z)*blend;pos.x+=vel.x*dt;pos.z+=vel.z*dt;
  const e=fc.step(dt,pos,vel,{entries,height,ride});if(e)bumps++;onTick?.(e,i);fc.updateNudges(dt);
 }return bumps;
}
let checks=0;

// Radius from the bean body dims (+ limb pad), clamped to .35–.45 m.
const r=fieldBodyRadius({beanBody:{ground:REGULAR_GROUND}},1);assert(r>=FIELD_BODY_MIN&&r<=FIELD_BODY_MAX,'bean radius in range '+r);
assert.equal(fieldBodyRadius({},1),FIELD_BODY_DEFAULT,'rig without bean dims uses the default');
assert.equal(fieldBodyRadius({beanBody:{ground:[0,.6]}},2),FIELD_BODY_MAX,'clamped high');assert.equal(fieldBodyRadius({beanBody:{ground:[0,.05]}},.5),FIELD_BODY_MIN,'clamped low');

// 1. Straight at a player (walk + every ground ride): never closer than the sum of the radii.
for(const ride of Object.keys(SPEED)){
 const fc=createFieldCollision(),body=rig(v7.x,v7.z),entries=[entryAt(v7,[body])],reach=FIELD_BODY_DEFAULT+(RIDE_PAD[ride]??0)+r;
 const pos={x:v7.x,z:v7.z+6},vel={x:0,z:0};let minD=Infinity;
 const bumps=drive(fc,pos,vel,{x:0,z:-1},ride,entries,240,0,()=>{minD=Math.min(minD,Math.hypot(pos.x-v7.x,pos.z-v7.z));checks++;});
 assert(minD>=reach-1e-9,ride+': no overlap ('+minD.toFixed(3)+' < '+reach.toFixed(3)+')');
 assert(bumps>=1,ride+': contact gives a bump');assert(bumps<=240/27+1,ride+': bump is rate-limited ('+bumps+')');
 assert(Math.abs(fc.wobble.squash)<=.2,'wobble stays subtle');
}

// 2. At an angle: slides round and keeps making progress along the travel line.
for(const ride of ['walk','bike']){
 const fc=createFieldCollision(),entries=[entryAt(v7,[rig(v7.x,v7.z)])],dir={x:Math.sin(.35),z:-Math.cos(.35)};
 const pos={x:v7.x-6*dir.x+.45*dir.z,z:v7.z-6*dir.z-.45*dir.x},vel={x:0,z:0},start={...pos};
 const free={x:start.x,z:start.z},freeVel={x:0,z:0};drive(createFieldCollision(),free,freeVel,dir,ride,[],90);
 drive(fc,pos,vel,dir,ride,entries,90);
 const along=(p)=>(p.x-start.x)*dir.x+(p.z-start.z)*dir.z;
 assert(along(pos)>6.5,ride+': got past the player ('+along(pos).toFixed(2)+' m)');
 assert(along(pos)>along(free)*.8,ride+': slide keeps ≥80 % of the free-run progress');
 assert(Math.hypot(pos.x-v7.x,pos.z-v7.z)>=FIELD_BODY_DEFAULT+(RIDE_PAD[ride]??0)+r-1e-9,'still outside');checks++;
}

// 3. Never a knockdown / fall / daze: the module has no path to them, and the bump is only a nudge.
const src=fs.readFileSync('lib/town/fieldCollision.ts','utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'');
for(const word of ['knockdown','knockdownLift','recovery','falling','stunAge','dizzy','crash','ballReactions','spinCrash'])assert(!src.includes(word),'no '+word+' in the bump code');
{const fc=createFieldCollision(),body=rig(v7.x,v7.z),pos={x:v7.x,z:v7.z+6},vel={x:0,z:0};let maxNudge=0,maxLean=0;
 drive(fc,pos,vel,{x:0,z:-1},'moped',[entryAt(v7,[body])],60,0,()=>{const n=body.root.userData.fieldNudge;if(n){maxNudge=Math.max(maxNudge,Math.hypot(n.x,n.z));maxLean=Math.max(maxLean,Math.abs(n.lean));}});
 assert(maxNudge>0&&maxNudge<=.13,'sim player sidestep is tiny ('+maxNudge.toFixed(3)+' m)');assert(maxLean<=.15,'lean is tiny');
 drive(fc,pos,vel,{x:0,z:0},'moped',[entryAt(v7,[body])],60);assert.equal(body.root.userData.fieldNudge,undefined,'nudge decays away');
 const fake={scale:{x:1,y:1,z:1,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0,z:0}};
 const fc2=createFieldCollision(),p2={x:v7.x,z:v7.z+3},v2={x:0,z:0};drive(fc2,p2,v2,{x:0,z:-1},'moped',[entryAt(v7,[rig(v7.x,v7.z)])],40);
 let minY=1,maxRoll=0;for(let i=0;i<90;i++){fake.scale.set(1,1,1);fake.rotation.z=0;fc2.pose(fake,1/60);minY=Math.min(minY,fake.scale.y);maxRoll=Math.max(maxRoll,Math.abs(fake.rotation.z));}
 assert(minY>=.9&&maxRoll<=.12,'character squash/roll stays subtle (y '+minY.toFixed(3)+', roll '+maxRoll.toFixed(3)+')');checks++;}

// 4. Off the field: nothing happens (outside the pitch, other height, hidden field, jetpack, disabled).
{const fc=createFieldCollision(),body=rig(v7.x+v7.width/2+3,v7.z),pos={x:body.root.position.x+.1,z:v7.z},vel={x:0,z:-3};
 assert.equal(fc.step(1/60,pos,vel,{entries:[entryAt(v7,[body])],height:0,ride:'walk'}),null);assert.equal(pos.x,body.root.position.x+.1,'no push off the pitch');
 const roof=rig(futsal.x,futsal.z),p={x:futsal.x+.1,z:futsal.z},vv={x:0,z:0};
 fc.step(1/60,p,vv,{entries:[entryAt(futsal,[roof])],height:0,ride:'walk'});assert.equal(p.x,futsal.x+.1,'street level ignores the rooftop court');
 fc.step(1/60,p,vv,{entries:[entryAt(futsal,[roof])],height:6,ride:'walk'});assert(p.x>futsal.x+.7,'on the rooftop court the futsal players are solid');
 for(const ctx of [{ride:'jetpack'},{ride:'walk',disabled:true}]){const q={x:v7.x+.1,z:v7.z};fc.step(1/60,q,{x:0,z:0},{entries:[entryAt(v7,[rig(v7.x,v7.z)])],height:0,...ctx});assert.equal(q.x,v7.x+.1,'skipped: '+JSON.stringify(ctx));}
 const hidden=entryAt(v7,[rig(v7.x,v7.z)]);hidden.root.visible=false;const h={x:v7.x+.1,z:v7.z};fc.step(1/60,h,{x:0,z:0},{entries:[hidden],height:0,ride:'walk'});assert.equal(h.x,v7.x+.1,'hidden field skipped');
 const blockedWall={x:v7.x+.1,z:v7.z};fc.step(1/60,blockedWall,{x:0,z:0},{entries:[entryAt(v7,[rig(v7.x,v7.z)])],height:0,ride:'walk',canMove:()=>false});assert.equal(blockedWall.x,v7.x+.1,'never pushed into a wall');
 const s0=fc.stats.bodies;const far={x:0,z:300};for(let i=0;i<600;i++)fc.step(1/60,far,{x:0,z:0},{entries:[entryAt(v7,[rig(v7.x,v7.z)])],height:0,ride:'walk'});assert.equal(fc.stats.bodies,s0,'broad phase: no per-player work off the field');checks++;}

// 5. The sim is unchanged: same seed stepped with and without a character bumping through the players.
for(const venue of VENUES){
 const a=new MatchSim(270,venue.id),b=new MatchSim(270,venue.id),fc=createFieldCollision();
 const rigs=new Map(Object.keys(b.players).map(id=>[id,rig(0,0)])),entries=[{venue,root:{visible:true},rigs}];
 const pos={x:venue.x-venue.width/2+1,z:venue.z},vel={x:0,z:0},height=venue.elevation??0;let bumps=0;
 for(let i=0;i<900;i++){
  a.step(1/60*.32);b.step(1/60*.32);
  for(const [id,g] of rigs){const p=fieldPoint(venue,b.players[id]),n=g.root.userData.fieldNudge;g.root.position.x=p.x+(n?.x??0);g.root.position.z=p.z+(n?.z??0);}
  // Chase the nearest player so contacts keep happening.
  let best=null,bd=Infinity;for(const g of rigs.values()){const d=Math.hypot(g.root.position.x-pos.x,g.root.position.z-pos.z);if(d<bd){bd=d;best=g;}}
  const dx=best.root.position.x-pos.x,dz=best.root.position.z-pos.z,l=Math.hypot(dx,dz)||1;vel.x=dx/l*5;vel.z=dz/l*5;pos.x+=vel.x/60;pos.z+=vel.z/60;
  if(fc.step(1/60,pos,vel,{entries,height,ride:i%300<150?'walk':'bike'}))bumps++;fc.updateNudges(1/60);
 }
 assert(bumps>3,venue.id+': the character bumped players ('+bumps+')');
 assert.deepEqual(JSON.parse(JSON.stringify({p:b.players,ball:b.ball,score:b.score})),JSON.parse(JSON.stringify({p:a.players,ball:a.ball,score:a.score})),venue.id+': sim unchanged by bumps');checks++;
}

// 6. Island townsfolk (islandNpcs entries, passed as-is): solid, slide, soft bump, Talk still in range, route untouched.
const npcAt=(x,z,y=0,extra={})=>({id:'npc'+x,position:{x,y,z},distance:Infinity,stunned:false,ride:null,rig:{root:{visible:true,position:{x,z},scale:{x:1},rotation:{y:0,z:0},userData:{beanBody:{ground:REGULAR_GROUND}}}},...extra});
function driveNpc(fc,pos,vel,dir,ride,npcs,ticks,height=0,onTick){
 const dt=1/60,blend=1-Math.exp(-dt*9);let bumps=0;
 for(let i=0;i<ticks;i++){
  // islandNpcs.update measures `distance` each frame; the collision reuses it as its broad phase.
  for(const n of npcs)n.distance=Math.hypot(n.position.x-pos.x,n.position.z-pos.z,n.position.y-height);
  vel.x+=(dir.x*SPEED[ride]-vel.x)*blend;vel.z+=(dir.z*SPEED[ride]-vel.z)*blend;pos.x+=vel.x*dt;pos.z+=vel.z*dt;
  const e=fc.step(dt,pos,vel,{entries:[],npcs,height,ride});if(e){bumps++;assert.equal(e.kind,'npc');}fc.updateNudges(dt);fc.applyNpcNudges();onTick?.(e,i);
 }return bumps;
}
const TALK_RANGE=+/nearest=\(player:Position,maxDistance=(\d+(?:\.\d+)?)\)/.exec(fs.readFileSync('lib/graphics/islandNpcs.ts','utf8'))[1];
for(const ride of Object.keys(SPEED)){
 const fc=createFieldCollision(),npc=npcAt(100,-10),route={...npc.position},reach=FIELD_BODY_DEFAULT+(RIDE_PAD[ride]??0)+r;
 const pos={x:100,z:-4},vel={x:0,z:0};let minD=Infinity,maxOff=0;
 const bumps=driveNpc(fc,pos,vel,{x:0,z:-1},ride,[npc],240,0,()=>{minD=Math.min(minD,Math.hypot(pos.x-100,pos.z+10));maxOff=Math.max(maxOff,Math.hypot(npc.rig.root.position.x-100,npc.rig.root.position.z+10));checks++;});
 assert(minD>=reach-1e-9,ride+': no overlap with a townsperson ('+minD.toFixed(3)+')');assert(bumps>=1&&bumps<=10,ride+': soft, rate-limited bump ('+bumps+')');
 assert.deepEqual(npc.position,route,ride+': the NPC route position is never changed');assert(maxOff>0&&maxOff<=.12,ride+': the drawn NPC only sidesteps a little ('+maxOff.toFixed(3)+')');
 assert(minD<TALK_RANGE,'pressed against a townsperson the character is still within Talk range ('+TALK_RANGE+' m)');
 driveNpc(fc,pos,vel,{x:0,z:0},ride,[npc],60);assert.equal(npc.rig.root.position.x,100,'drawn NPC settles back on its route spot');assert.equal(npc.rig.root.rotation.z,0,'lean settles');
}
{const fc=createFieldCollision(),npc=npcAt(100,-10),dir={x:Math.sin(.35),z:-Math.cos(.35)},start={x:100-6*dir.x+.45*dir.z,z:-10-6*dir.z-.45*dir.x},pos={...start},vel={x:0,z:0};
 driveNpc(fc,pos,vel,dir,'walk',[npc],90);const along=(pos.x-start.x)*dir.x+(pos.z-start.z)*dir.z;assert(along>6.5,'slides round a townsperson ('+along.toFixed(2)+' m)');
 const riding=npcAt(100,-10,0,{ride:{}}),p2={x:100,z:-4},v2={x:0,z:0};let m2=Infinity;driveNpc(createFieldCollision(),p2,v2,{x:0,z:-1},'walk',[riding],180,0,()=>{m2=Math.min(m2,Math.hypot(p2.x-100,p2.z+10));});assert(m2>=FIELD_BODY_DEFAULT+r+.1-1e-9,'a skateboarding/scooter NPC is a little wider');checks++;}
{const fc=createFieldCollision(),far=npcAt(100,-10);far.distance=5;const p={x:100.1,z:-10},v={x:0,z:0};const b0=fc.stats.npcBodies;
 fc.step(1/60,p,v,{entries:[],npcs:[far],height:0,ride:'walk'});assert.equal(p.x,100.1,'NPC beyond the broad phase is skipped (distance from islandNpcs)');assert.equal(fc.stats.npcBodies,b0,'no per-NPC work when nobody is near');
 const near=npcAt(100,-10);near.distance=.1;for(const ctx of [{ride:'jetpack'},{ride:'walk',disabled:true},{ride:'walk',height:6},{ride:'walk',stunned:true}]){const q={x:100.1,z:-10};const n={...near,stunned:!!ctx.stunned};fc.step(1/60,q,{x:0,z:0},{entries:[],npcs:[n],height:ctx.height??0,...ctx});assert.equal(q.x,100.1,'NPC skipped: '+JSON.stringify(ctx));}
 checks++;}
// Own rides never knock townsfolk (or field players) over; a truck still does. Talk/tap paths are unchanged.
{const t=fs.readFileSync('components/Town.tsx','utf8');assert(/if\(hitTruck\)for\(const e of islandNpcs\.entries\)strike\(/.test(t),'own rides never knock townsfolk over (truck only)');
 assert(/npcs:islandNpcs\.entries/.test(t)&&/islandNpcs\.update\([^\n]*\);fieldBump\.applyNpcNudges\(\);/.test(t),'Town passes islandNpcs entries and draws the nudge after the NPC update');
 assert(/islandNpcs\.nearest\(visitor\)/.test(t)&&/islandNpcs\.pick\(characterRay\)/.test(t),'Talk (nearest) and tap (pick) still come from islandNpcs');
 assert(!/npc\.position\.[xyz]\s*[+-]?=(?!=)/.test(src.slice(src.indexOf('function applyNpcNudges'),src.indexOf('function pose'))),'applyNpcNudges never writes the NPC route position');checks++;}

// fieldRuntime draws the nudge render-only (never writes the sim), and Town wires the hook.
const runtime=fs.readFileSync('lib/town/fieldRuntime.ts','utf8');assert(/userData\.fieldNudge/.test(runtime)&&!/sim\.players\[[^\]]+\]\.[xy]\s*[+-]?=\s*[^=]*fieldNudge/.test(runtime),'fieldRuntime applies the nudge to the rig only');
const town=fs.readFileSync('components/Town.tsx','utf8');assert(/fieldBump\.step\(/.test(town)&&/fieldBump\.updateNudges\(/.test(town)&&/fieldBump\.pose\(/.test(town),'Town wires step, nudges and pose');
assert(/for\(const e of games\.entries\)if\(hitTruck&&/.test(town),'own rides never knock live-field players down (only trucks)');
console.log('PASS field collision:',checks,'checks — no overlap on foot and 3 rides, slide progress, soft bump only, off-field no-op, sim unchanged on',VENUES.length,'venues; townsfolk solid with Talk in range');
