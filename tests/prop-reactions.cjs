// Kicked world props react (user request, Oct 3 2026; lib/graphics/propReactions.ts): a damped reaction that ends and restores
// the merged buffer bit for bit, a per-prop cooldown, reduced motion (sound only, no motion), and zero work while idle.
// Part 2 builds the real town headless and checks that every recorded vertex run really is that prop (merge offsets).
// usage: node tests/prop-reactions.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');

(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,Infinity,NaN,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const R=load('lib/graphics/propReactions.ts');

// ---- Part 1: two props merged into one buffer, as world.ts's batching pass leaves them (plus an untouched neighbour).
function merged(){
 const lamp=new T.CylinderGeometry(.065,.065,4.2,8).translate(10,2.1,5),bench=new T.BoxGeometry(2,.5,.7).translate(20,.25,5),other=new T.BoxGeometry(1,1,1).translate(15,.5,5);
 const counts=[lamp,other,bench].map(g=>g.getAttribute('position').count),geo=utils.mergeGeometries([lamp,other,bench]);
 const attribute=geo.getAttribute('position'),pool=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial(),1);
 pool.setMatrixAt(0,new T.Matrix4().compose(new T.Vector3(10,0,5),new T.Quaternion(),new T.Vector3(10,1,10)));
 const specs=[
  {kind:'lamp',parts:[{attribute,start:0,count:counts[0]}],min:{x:9.9,y:0,z:4.9},max:{x:10.1,y:4.2,z:5.1},light:{mesh:pool,index:0}},
  {kind:'bench',parts:[{attribute,start:counts[0]+counts[1],count:counts[2]}],min:{x:19,y:0,z:4.65},max:{x:21,y:.5,z:5.35}},
 ];
 return {geo,attribute,pool,specs,counts,snapshot:()=>Float32Array.from(attribute.array)};
}
{
 const m=merged(),r=R.createPropReactions(m.specs),before=m.snapshot(),poolBefore=Float32Array.from(m.pool.instanceMatrix.array);
 // Idle: nothing written, nothing uploaded, one check per frame.
 let writes=0;const set=m.attribute.setXYZ.bind(m.attribute);m.attribute.setXYZ=(...a)=>{writes++;return set(...a);};
 for(let i=0;i<120;i++)r.update(1/60,false);
 assert.equal(writes,0,'idle frames write no vertices');assert.equal(r.stats.idleUpdates,120);assert.equal(r.stats.activeUpdates,0);assert.equal(r.active,false);
 assert.equal(m.attribute.updateRanges.length,0,'idle frames upload nothing');
 // Hit detection: the prop the ball touches, nothing in open space.
 assert.equal(r.find(10,1,5.2),0,'lamp post');assert.equal(r.find(20.8,.3,5),1,'bench');assert.equal(r.find(15,.5,5),-1,'unregistered neighbour');assert.equal(r.find(10,9,5),-1,'over the top');
 // Too soft: a gentle roll does nothing.
 assert.equal(r.hit(10,1,5.2,0,1.5),null,'below the lamp threshold');assert.equal(r.active,false);
 // A shot: sway starts, only the lamp's run moves, the cue comes back.
 assert.equal(r.hit(10,1,5.2,0,28),'clank');assert.equal(r.active,true);
 r.update(.12,false);const mid=m.snapshot();
 let lampMoved=0,maxTop=0;for(let v=0;v<m.counts[0];v++){const d=Math.hypot(mid[v*3]-before[v*3],mid[v*3+1]-before[v*3+1],mid[v*3+2]-before[v*3+2]);if(d>1e-6)lampMoved++;if(before[v*3+1]>4)maxTop=Math.max(maxTop,mid[v*3+2]-before[v*3+2]);}
 assert(lampMoved>0,'lamp sways');assert(maxTop>.25&&maxTop<.5,'the top leans with the ball, visibly but well under half a metre: '+maxTop.toFixed(3));
 for(let i=m.counts[0]*3;i<before.length;i++)assert.equal(mid[i],before[i],'neighbour and bench untouched');
 for(let v=0;v<m.counts[0];v++)if(before[v*3+1]<.001)assert(Math.abs(mid[v*3+1]-before[v*3+1])<.03&&Math.abs(mid[v*3+2]-before[v*3+2])<.03,'the base stays planted (within 3 cm)');
 assert(m.pool.instanceMatrix.array[0]<poolBefore[0],'night pool flickers dimmer, never brighter');
 const ranges=m.attribute.updateRanges;assert(ranges.length>0&&ranges.every(u=>u.start>=0&&u.start+u.count<=m.counts[0]*3),'only the lamp range is uploaded');
 // Cooldown: an immediate second hit is ignored (no stacking).
 assert.equal(r.hit(10,1,5.2,0,40),null,'cooling down');
 // Damping ends: after the duration the buffer is restored bit for bit and the updater sleeps again.
 for(let i=0;i<60;i++)r.update(1/60,false);
 assert.equal(r.active,false,'reaction ended');assert.deepEqual(m.snapshot(),before,'exact restore');assert.deepEqual(Float32Array.from(m.pool.instanceMatrix.array),poolBefore,'pool restored');
 const w=writes,a=r.stats.activeUpdates;for(let i=0;i<60;i++)r.update(1/60,false);assert.equal(writes,w,'asleep after');assert.equal(r.stats.activeUpdates,a);
 // Ready again after the cooldown.
 r.update(R.PROP_REACTIONS.lamp.cooldown,false);assert.equal(r.hit(10,1,5.2,0,28),'clank','ready after cooldown');for(let i=0;i<60;i++)r.update(1/60,false);assert.deepEqual(m.snapshot(),before);
 // Paused frames (dt 0) freeze a reaction rather than ending it.
 r.update(5,false);r.hit(20.8,.3,5,-30,0);r.update(.05,false);const frozen=m.snapshot();for(let i=0;i<30;i++)r.update(0,false);assert.deepEqual(m.snapshot(),frozen,'paused');assert.equal(r.active,true);
 for(let i=0;i<60;i++)r.update(1/60,false);assert.deepEqual(m.snapshot(),before);
 console.log('PASS idle sleep, threshold, sway of one run only, base planted, flicker, cooldown, damping ends with an exact restore, pause');
}
{
 // Reduced motion: the sound cue still comes back, nothing moves, nothing wakes up.
 const m=merged(),r=R.createPropReactions(m.specs),before=m.snapshot();
 assert.equal(r.hit(10,1,5.2,0,28,true),'clank','sound kept');assert.equal(r.active,false,'no motion');assert.equal(r.stats.reducedHits,1);
 r.update(.1,true);assert.deepEqual(m.snapshot(),before);assert.equal(r.stats.activeUpdates,0);
 assert.equal(r.hit(10,1,5.2,0,28,true),null,'cooldown applies to the sound too');
 // Switching to reduced motion mid-reaction restores at once.
 r.update(2,false);assert.equal(r.hit(20.8,.3,5,-30,0,false),'thunk');r.update(.05,false);assert.notDeepEqual(m.snapshot(),before);r.update(.016,true);assert.deepEqual(m.snapshot(),before);assert.equal(r.active,false);
 console.log('PASS reduced motion: cue only, no vertex writes, immediate restore');
}
{
 // Bounded: at most MAX_ACTIVE props animate; further hits keep their sound. Strength scales with the shot.
 const geos=[],specs=[];for(let i=0;i<R.MAX_ACTIVE+2;i++){const g=new T.BoxGeometry(.4,1,.4).translate(i*10,.5,0);geos.push(g);}
 const geo=utils.mergeGeometries(geos),attribute=geo.getAttribute('position');let start=0;
 geos.forEach((g,i)=>{const count=g.getAttribute('position').count;specs.push({kind:'post',parts:[{attribute,start,count}],min:{x:i*10-.2,y:0,z:-.2},max:{x:i*10+.2,y:1,z:.2}});start+=count;});
 const r=R.createPropReactions(specs),before=Float32Array.from(attribute.array);
 for(let i=0;i<specs.length;i++)assert.equal(r.hit(i*10,.5,.25,0,-20),'tap');
 assert.equal(r.stats.started,R.MAX_ACTIVE);assert.equal(r.stats.dropped,2);
 for(let i=0;i<60;i++)r.update(1/60,false);assert.deepEqual(Float32Array.from(attribute.array),before);assert.equal(r.active,false);
 // Fence ripple: only the vertices near the hit are rewritten.
 const posts=[];for(let i=0;i<20;i++)posts.push(new T.CylinderGeometry(.06,.06,1,6).translate(i,.5,0));
 const fence=utils.mergeGeometries(posts),fa=fence.getAttribute('position'),f=R.createPropReactions([{kind:'fence',parts:[{attribute:fa,start:0,count:fa.count}],min:{x:0,y:0,z:-.1},max:{x:19,y:1,z:.1}}]);
 f.hit(10,.6,.3,0,-20);f.update(.03,false);const fr=fa.updateRanges[fa.updateRanges.length-1];assert(fr.count<fa.count*3*.5,'ripple uploads a local range only');
 for(let i=0;i<60;i++)f.update(1/60,false);
 console.log('PASS at most '+R.MAX_ACTIVE+' animate at once (extra hits sound only), ripple rewrites a local range');
}

// ---- Part 2: the real town. Every tagged prop's run lies inside its own bounds, so the merge offsets are right.
{
 const world=load('lib/town/world.ts').buildTown(new T.Scene()),specs=world.propSpecs,kinds={};
 for(const s of specs){kinds[s.kind]=(kinds[s.kind]??0)+1;
  for(const p of s.parts){assert(p.count>0&&p.start>=0&&p.start+p.count<=p.attribute.count,'run inside its buffer');
   for(let v=p.start;v<p.start+p.count;v++){const x=p.attribute.getX(v),y=p.attribute.getY(v),z=p.attribute.getZ(v);
    assert(x>=s.min.x-1e-3&&x<=s.max.x+1e-3&&y>=s.min.y-1e-3&&y<=s.max.y+1e-3&&z>=s.min.z-1e-3&&z<=s.max.z+1e-3,s.kind+' vertex '+v+' outside its own prop bounds (merge offset wrong)');}}}
 // Each prop type the audit lists is registered (counts are a floor: placement searches may drop a few).
 for(const [kind,n] of Object.entries({lamp:60,bench:30,table:20,tree:30,palm:40,planter:20,bush:10,sign:8,signal:10,fence:5,net:3,pole:3,flag:10,crate:6,bike:2,post:2,bollard:7,lifebuoy:4}))assert((kinds[kind]??0)>=n,kind+': '+(kinds[kind]??0)+' < '+n);
 // East Pier kerb props now stop the ball: each one has a footprint, which sits outside the walkable width (walkHalf) so
 // the walkway, the plaza, the kick spot and the lighthouse stay reachable.
 {const pier=load('lib/town/eastPier.ts'),P=pier.EAST_PIER;
  for(const s of specs.filter(s=>['bollard','lifebuoy'].includes(s.kind)||(s.kind==='lamp'&&pier.underEastPier((s.min.x+s.max.x)/2,(s.min.z+s.max.z)/2)))){
   const cx=(s.min.x+s.max.x)/2,cz=(s.min.z+s.max.z)/2,o=world.obstacles.find(o=>Math.abs(o.x-cx)<.1&&Math.abs(o.z-cz)<.1&&o.w<=.6);
   assert(o,s.kind+' at '+cx.toFixed(1)+','+cz.toFixed(1)+' has a ball footprint');
   const inner=pier.jettyOffset(cx,cz)-Math.max(o.w,o.d)/2;assert(inner>P.walkHalf,s.kind+' footprint stays off the walkway ('+inner.toFixed(2)+' m from the centre line)');}
  assert(pier.onEastPier(pier.PIER_KICK_SPOT.x,pier.PIER_KICK_SPOT.z),'kick spot still on the walkway');
  // Walk the whole jetty: every centre-line sample, and ±1.2 m either side, is clear of every small kerb footprint at the
  // player's padding (.4), so the walk to the plaza, the lighthouse, the fishing spot and the kick spot is unchanged.
  const {insideObstacle}=load('lib/town/simulation.ts'),kerb=world.obstacles.filter(o=>o.w<=.6&&o.d<=.6&&pier.underEastPier(o.x,o.z));
  assert(kerb.length>=7+4+2,'kerb footprints: '+kerb.length);
  for(const p of pier.JETTY_PATH)for(const d of [-1.2,0,1.2]){const q=pier.jettySide(p,d);if(!pier.onEastPier(q.x,q.z))continue;assert(!kerb.some(o=>insideObstacle(q.x,q.z,o,.4)),'walkway clear at s='+p.s.toFixed(1)+' d='+d);}
  for(const [name,q] of Object.entries({kick:pier.PIER_KICK_SPOT,fishing:pier.EAST_PIER_FISHING,...pier.EAST_PIER_NPC_SPOTS}))assert(!kerb.some(o=>insideObstacle(q.x,q.z,o,.6)),name+' spot clear');}
 const lit=specs.filter(s=>s.kind==='lamp'&&s.light).length;assert(lit>=kinds.lamp*.9,'lamps find their night pool: '+lit+'/'+kinds.lamp);
 const r=R.createPropReactions(specs),biggest=Math.max(...specs.map(s=>s.parts.reduce((n,p)=>n+p.count,0)));
 assert(biggest<=R.MAX_PROP_VERTICES,'every prop can animate (largest '+biggest+' vertices)');
 // A real street lamp: hit it, only its own run changes, then an exact restore.
 const lamp=specs.find(s=>s.kind==='lamp'),cx=(lamp.min.x+lamp.max.x)/2,cz=(lamp.min.z+lamp.max.z)/2,attr=lamp.parts[0].attribute,before=Float32Array.from(attr.array);
 assert.equal(r.hit(cx+.3,1,cz,-30,0),'clank');r.update(.1,false);
 let changed=0;for(let i=0;i<attr.array.length;i++)if(attr.array[i]!==before[i]){changed++;const v=Math.floor(i/3);assert(lamp.parts.some(p=>p.attribute===attr&&v>=p.start&&v<p.start+p.count),'only the lamp moves');}
 assert(changed>0);for(let i=0;i<60;i++)r.update(1/60,false);assert.deepEqual(Float32Array.from(attr.array),before,'real buffer restored');
 // Field floodlights and goals (lib/town/fields.ts): same check in their venue-local buffers.
 const fields=load('lib/town/fields.ts').buildFormatFields(new T.Scene());
 for(const s of fields.propSpecs)for(const p of s.parts)for(let v=p.start;v<p.start+p.count;v++){const x=p.attribute.getX(v)+s.offset.x,z=p.attribute.getZ(v)+s.offset.z;assert(x>=s.min.x-1e-3&&x<=s.max.x+1e-3&&z>=s.min.z-1e-3&&z<=s.max.z+1e-3,s.kind+' run outside its bounds');}
 const fk={};for(const s of fields.propSpecs)fk[s.kind]=(fk[s.kind]??0)+1;assert.equal(fk.pole,20,'20 floodlight posts');assert.equal(fk.goal,8,'8 goals');
 console.log('PASS real town: '+specs.length+' props '+JSON.stringify(kinds)+' + '+JSON.stringify(fk)+'; runs match their props, lamp hit and exact restore');
 world.dispose();fields.dispose();
}
})().catch(e=>{console.error(e);process.exit(1);});
