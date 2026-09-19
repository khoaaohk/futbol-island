const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json');
function fixture(){
 let storageReads=0;const cache=new Map(),storage=new Map(),T=req('three');
 const context=vm.createContext({console,Math,Set,Map,window:{addEventListener(){},removeEventListener(){}},localStorage:{getItem:k=>{storageReads++;return storage.get(k)??null},setItem:(k,v)=>storage.set(k,v)},document:{createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},fillText(){}})})}});
 function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}
 const q=load('lib/town/coinQuest.ts'),p=load('lib/town/coinProgress.ts'),{createCoinHunt}=load('lib/graphics/coinHunt.ts'),{createRooftopTravel}=load('lib/town/rooftopTravel.ts');const collected=[],finished=[];const hunt=createCoinHunt(new T.Scene(),s=>collected.push(s.id),()=>{},s=>finished.push(s.id)),props=[];hunt.connectCollisions([],props);hunt.update(.016,{x:0,y:0,z:0},true,true);return {q,p,hunt,props,collected,finished,createWalkBall:load('lib/town/walkBall.ts').createWalkBall,createRooftopTravel,get storageReads(){return storageReads}};
}
for(const mode of ['walk','bike','scooter','moped']){
 const f=fixture(),s=f.q.COIN_QUEST.find(c=>c.id==='market'),p={x:s.x,z:s.z+4},v={x:0,z:0},r=f.createRooftopTravel([],[],p,f.props);r.reset(p.x,p.z,s.y);
 for(let i=0;i<180;i++)r.update(1/60,p,v,{x:0,z:-1,sprint:false},mode);
 assert(p.z>s.z+.65,mode+' must stop before unopened parcel');assert(!r.canLand(s.x,s.z),'kick parcel cannot receive flight landing');
 assert(f.hunt.hit(s.x,s.y+.4,s.z+.7,0,-4),'kick opens parcel');const c=f.props.find(c=>c.x===s.x&&c.z===s.z);assert.equal(c.w,0);assert.equal(c.d,0);assert.equal(c.top,s.y);assert.equal(r.surface(s.x,s.z),s.y,'live landing surface disappears');assert(r.canLand(s.x,s.z));
 for(let i=0;i<100;i++)r.update(1/60,p,v,{x:0,z:-1,sprint:false},mode);
 assert(p.z<s.z-1,mode+' can pass revealed parcel');f.hunt.dispose();
}
{
 const f=fixture(),s=f.q.COIN_QUEST.find(c=>c.id==='north'),p={x:s.x,z:s.z},r=f.createRooftopTravel([],[],p,f.props);assert.equal(r.surface(s.x,s.z),s.y+.55);assert(r.canLand(s.x,s.z),'padded lid is a safe flight destination');
 f.hunt.land({x:s.x,y:s.y+3,z:s.z});assert(!f.p.readCoinProgress().revealed.includes(s.id),'passing above is not landing');f.hunt.land({x:s.x,y:s.y+.55,z:s.z});assert(f.p.readCoinProgress().revealed.includes(s.id));assert.equal(r.surface(s.x,s.z),s.y);assert(r.canLand(s.x,s.z));assert.equal(f.hunt.stats.reveals,1);f.hunt.land({x:s.x,y:s.y,z:s.z});assert.equal(f.hunt.stats.reveals,1,'duplicate impact does not reveal twice');
 f.hunt.update(.016,{x:s.x,y:s.y,z:s.z},false,true);const other=f.q.COIN_QUEST.find(c=>c.kind==='kick'&&!c.wall);assert(!f.hunt.hit(other.x,other.y+.4,other.z,0,-4),'lessons pause target hits');f.hunt.dispose();
}
{
 const f=fixture(),s=f.q.COIN_QUEST.find(c=>c.wall);assert(s,'wall target exists');const w=s.wall;
 assert(!f.hunt.hit(w.x,w.y,w.z-.15,0,5),'rear approach cannot open front wall target');
 assert(!f.hunt.hit(w.x,w.y,w.z+.15,5,0),'sideways graze cannot open front wall target');
 assert(f.hunt.hit(w.x,w.y,w.z+.15,0,-5),'front kick opens wall target');assert(f.p.readCoinProgress().revealed.includes(s.id));f.hunt.dispose();
}
console.log('PASS solid parcels: walk/bike/scooter/moped blocked then clear; safe pad landing opens once and resets live surface; paused hits blocked; wall front-only shots');
// Hidden trunks are solid too; opened props must not leave zero-size blockers.
for(const mode of ['walk','bike','scooter','moped']){
 const f=fixture(),s=f.q.COIN_QUEST.find(c=>c.id==='store'),p={x:s.x,z:s.z+4},v={x:0,z:0},r=f.createRooftopTravel([],[],p,f.props);r.reset(p.x,p.z,0);
 for(let i=0;i<180;i++)r.update(1/60,p,v,{x:0,z:-1,sprint:true},mode);
 assert(p.z>s.z+.5,'hidden trunk blocks '+mode);f.hunt.dispose();
}
{
 const f=fixture(),s=f.q.COIN_QUEST.find(c=>c.grass);assert(!f.hunt.hit(s.x,.1,s.z,0,-9),'grass hatches cannot be kicked open');f.hunt.land({x:s.x,y:.14,z:s.z});assert(!f.p.readCoinProgress().revealed.includes(s.id),'standing on grass is not a drop');f.hunt.update(.016,{x:s.x,y:5,z:s.z},true,true);f.hunt.land({x:s.x,y:.14,z:s.z});assert(f.p.readCoinProgress().revealed.includes(s.id),'drop opens grass hatch');f.hunt.dispose();
}
{
 const f=fixture(),s=f.q.COIN_QUEST.find(c=>c.ramp);f.hunt.update(.016,{x:s.x,y:s.y,z:s.z},true,true);assert(!f.p.readCoinProgress().collected.includes(s.id),'flying through cannot bypass ramp');f.hunt.update(.016,{x:s.x,y:s.y,z:s.z},true,true,s.ramp);assert(f.p.readCoinProgress().collected.includes(s.id));f.hunt.dispose();
}
console.log('PASS hidden trunk collision, landing-only grass hatches, and ramp-only airborne collectible');

{
 const f=fixture();let meshes=0,shadows=0;f.hunt.root.traverse(o=>{if(o.isMesh){meshes++;if(o.castShadow)shadows++;}});assert(meshes<f.q.COIN_QUEST.length*3+5,'hunt geometry is batched');assert(shadows<30,'tiny hunt details do not cast shadows');
 f.hunt.update(.1,{x:1000,y:0,z:1000},true,false);assert.equal(f.hunt.stats.animated,0,'distant balls stop animating');const s=f.q.COIN_QUEST.find(c=>c.id==='store');f.hunt.update(.1,{x:s.x+3,y:0,z:s.z},true,false);assert(f.hunt.stats.animated>0,'nearby balls still animate');
 f.hunt.moveTruck(7,{x:10,y:1,z:10},true);const reads=f.storageReads;for(let i=0;i<120;i++)f.hunt.moveTruck(7,{x:10+i,y:1,z:10},true);assert.equal(f.storageReads,reads,'collected truck balls never reread storage');assert.equal(f.hunt.stats.collections,1,'truck collection happens once');f.hunt.dispose();
 console.log('PASS batched geometry, reduced shadow casters, distant animation gating and no repeated truck storage reads');
}

{
 const f=fixture(),s=f.q.COIN_QUEST.find(c=>c.truck!==undefined);
 f.hunt.moveTruck(s.truck,{x:0,y:1,z:0},true);
 assert.deepEqual(f.collected,[s.id]);assert.equal(f.finished.length,0,'pickup must not open lesson');
 const far={x:-500,y:0,z:-500};
 for(let i=0;i<20;i++)f.hunt.update(.05,far,true,false);
 assert.equal(f.finished.length,0,'lesson waits while collection animation is active');
 for(let i=0;i<40;i++)f.hunt.update(.05,far,false,false);
 assert.equal(f.finished.length,0,'paused effects cannot complete by wall-clock timeout');
 for(let i=0;i<20;i++)f.hunt.update(.05,far,true,false);
 assert.deepEqual(f.finished,[s.id],'lesson delivered once after effect settles');
 for(let i=0;i<40;i++)f.hunt.update(.05,far,true,false);
 assert.equal(f.finished.length,1);f.hunt.dispose();
}
console.log('PASS collection-to-lesson handoff: complete animation first, pause-safe, once only');

// Former school parcels now sit as elevated round targets beside the futsal sign.
for(const id of ['school','parcel-school']){
 const f=fixture(),s=f.q.COIN_QUEST.find(c=>c.id===id),wall=s.wall;
 assert(wall.round&&wall.high);assert.equal(wall.y,6.7);assert.equal(s.y,0);assert.equal(s.z,49);
 assert(!f.props.some(c=>c.x===s.x&&c.z===s.z),'no ground box under high target');
 assert(!f.hunt.hit(wall.x+1.8,wall.y,wall.z+.15,0,-5),'outside round target does not reveal');
 const player={x:s.x,y:0,z:59,yaw:Math.PI},ball=f.createWalkBall();ball.reset(player);ball.shoot(player,Math.PI,.5);
 const env={floor:()=>0,blocked:(x,z,y)=>{if(f.hunt.hit(x,y,z,ball.state.vx,ball.state.vz))return false;return z<=46.2;},hit:(x,y,z,vx,vz)=>f.hunt.hit(x,y,z,vx,vz),impact(){},strike(){}};
 for(let i=0;i<100;i++)ball.update(1/60,player,env);
 assert(f.p.readCoinProgress().revealed.includes(id),'held high shot reaches '+id);
 f.hunt.update(.7,{x:s.x,y:0,z:s.z},true,true);assert(f.p.readCoinProgress().collected.includes(id),'revealed ball collectable on south walkway');
 f.hunt.dispose();
}
console.log('PASS relocated futsal round targets: high shots clear garage wall, circular hit area, ground pickup, no floor obstacle');

// All ten new spacing discoveries are elevated kick-only targets, with long-shot access.
{
 const catalog=fixture();const spots=catalog.q.COIN_QUEST.slice(40,50);assert.equal(spots.length,10);catalog.hunt.dispose();
 for(const s of spots){
  assert.equal(s.kind,'kick');assert(s.wall.high&&s.wall.round);assert(s.wall.y>=5.5);assert.equal(s.y,0);assert(!s.grass&&s.truck===undefined&&!s.ramp);
  const f=fixture(),wall=s.wall,east=wall.facing==='east',yaw=east?-Math.PI/2:Math.PI,player={x:east?wall.x+18:s.x,y:0,z:east?wall.z:wall.z+18,yaw};
  f.hunt.land({x:s.x,y:0,z:s.z});assert(!f.p.readCoinProgress().revealed.includes(s.id),'landing cannot open '+s.id);
  for(const charge of [0,((wall.y+.6)*38-3.2*17.35)/(52*17.35-(wall.y+.6)*22)]){
   const ball=f.createWalkBall();ball.reset(player);ball.shoot(player,yaw,charge);
   const env={floor:()=>0,blocked:(x,z,y)=>{if(f.hunt.hit(x,y,z,ball.state.vx,ball.state.vz))return false;return east?x<=wall.x-.7:z<=wall.z-.7;},hit:(x,y,z,vx,vz)=>f.hunt.hit(x,y,z,vx,vz),impact(){},strike(){}};
   for(let i=0;i<120;i++)ball.update(1/60,player,env);
   assert.equal(f.p.readCoinProgress().revealed.includes(s.id),charge>0,(charge?'long charged kick reaches ':'tap cannot reach ')+s.id);
  }
  f.hunt.update(.7,{x:s.x,y:0,z:s.z},true,true);assert(f.p.readCoinProgress().collected.includes(s.id),'ground pickup '+s.id);f.hunt.dispose();
 }
}
console.log('PASS ten high spacing targets: long charged shots required, no landing shortcut, grounded pickup');

{
 const f=fixture(),east=f.q.COIN_QUEST.filter(s=>s.wall?.facing==='east');assert.equal(east.length,8);
 for(const s of east){const w=s.wall;assert(!f.hunt.hit(w.x+.1,w.y,w.z,8,0),'Wrong direction cannot open '+s.id);assert(f.hunt.hit(w.x+.1,w.y,w.z,-8,0),'East approach opens '+s.id);assert(!f.hunt.hit(w.x+.1,w.y,w.z,-8,0),'No duplicate reveal');f.hunt.update(.7,{x:s.x,y:s.y,z:s.z},true,true);assert(f.p.readCoinProgress().collected.includes(s.id),'Ground ball collectible east of wall');}
 f.hunt.dispose();console.log('PASS eight east targets: direction, reveal deduplication and ground collection');
}
const aerialFixture=fixture(),aerialSpots=aerialFixture.q.COIN_QUEST.filter(s=>s.parachute);aerialFixture.hunt.dispose();assert.equal(aerialSpots.length,5);
for(const s of aerialSpots){
 const f=fixture(),p={x:s.x+2,y:s.y+1,z:s.z};
 assert(!f.props.some(c=>c.x===s.x&&c.z===s.z),'floating balls have no solid box');
 f.hunt.update(.1,p,true,false,null,false);assert(!f.collected.includes(s.id),'flight cannot collect parachute ball');
 f.hunt.update(.1,{...p,y:0},true,false,null,true);assert(!f.collected.includes(s.id),'parachute must be at ball height');
 f.hunt.update(.1,p,true,false,null,true);assert(f.collected.includes(s.id),'open parachute collects with generous clearance');
 f.hunt.update(.1,p,true,false,null,true);assert.equal(f.collected.filter(id=>id===s.id).length,1);f.hunt.dispose();
}
console.log('PASS five parachute-only balls: altitude, flight exclusion, generous pickup and no solid props');

{const f=fixture(),s=f.q.COIN_QUEST.find(s=>s.parachute),p={x:s.x+10,y:s.y+10,z:s.z},g=f.hunt.root.getObjectByName("coin-spot-"+s.id),ring=g.getObjectByName("parachute-ball-highlight");f.hunt.update(.1,p,true,false,null,false);assert(!ring.visible);f.hunt.update(.1,p,true,false,null,true);assert(ring.visible);f.hunt.update(.1,{x:1000,y:s.y,z:1000},true,false,null,true);assert(!ring.visible);f.hunt.dispose();console.log("PASS parachute highlights activate only during nearby descent");}
