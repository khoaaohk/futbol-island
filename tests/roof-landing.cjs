// Landable roofs everywhere (Oct 14 2026, user: "allow landing on the patio roof. right now it's going through it", then "apply that
// throughout all other buildings"). Run: node tests/roof-landing.cjs
//  1. The audit: the whole island built the way the game builds it (world.ts in a sandbox), every mesh measured before the static
//     batching. Wherever a flat face you can see from above (the first thing a ray straight down meets, facing up) is ≥ 1.6 m over
//     the ground, on a piece ≥ 1 m across both ways and ≥ 1.5 m², and a jetpack or parachute landing there would be accepted
//     (canLand from the sky), the landing stands on that face (rooftopTravel surface within 0.4 m): nothing you can see from above
//     lets you fall through it. Smaller pieces (signs, lamps, rails, boards), rounded or pointed ones (tree and palm crowns,
//     umbrellas, hut cones: a landing there is moved to the nearest landable spot) are the documented exclusions.
//  2. Landing samples on a few buildings per island (the hostel's verandah roof, shop awnings, the main island's roofs, the zipline's
//     deck and tower), each landed, walked across and walked off (a normal drop to the ground, no recovery stun for a low canopy).
//  3. Walk-under: the porch below the verandah roof (and the pavements under awnings) stay walkable at ground height for the player,
//     the NPCs' view and a ride, never popping up onto the canopy; the zipline cable still clears every canopy.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

// The island, built with buildTownSteps so every mesh can be measured before the batching pass merges them.
async function buildWorld(){
 const req=require('node:module').createRequire(ROOT+'/package.json'),T=req('three');
 const utils=await import(ROOT+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
 const cache=new Map(),gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const context=vm.createContext({console,Math,Set,Map,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
 const resolve=(file,id)=>{const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);for(const e of ['.ts','.tsx','/index.ts',''])if(fs.existsSync(base+e)&&fs.statSync(base+e).isFile())return base+e;throw new Error('cannot resolve '+id);};
 function load(name){const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):req(id));
  cache.set(file,mod.exports);return mod.exports;}
 const scene=new T.Scene(),meshes=new Set(),gen=load('lib/town/world.ts').buildTownSteps(scene);let world;
 for(;;){const r=gen.next();scene.traverse(o=>{if(o.isMesh&&!String(o.name).startsWith('island-chunk-'))meshes.add(o);});if(r.done){world=r.value;break;}}
 return {T,load,world,meshes:[...meshes]};
}

(async()=>{
const {T,load,world,meshes}=await buildWorld();
const V=load('lib/town/venues.ts'),{createRooftopTravel,CANOPY_STEP}=load('lib/town/rooftopTravel.ts'),CS=load('lib/town/canopySurfaces.ts'),CC=load('lib/town/coralCay.ts'),Z=load('lib/town/zipline.ts');
const travel=()=>createRooftopTravel([...world.buildings,...world.walkSurfaces],world.obstacles,{x:0,z:0},world.roofObstacles,()=>0,world.landingExclusions,world.canopies);
const rt=travel();
// Foliage and sheets are not roofs (tree and palm crowns, signs' planes, cables): the documented exclusions; so is a cone taller
// than 1.3 × its radius (a pine).
const NOT_ROOF=/Sphere|Icosahedron|Dodecahedron|Octahedron|Tetrahedron|Torus|Tube|Plane|Circle|Ring|Capsule|Lathe/;
// Every mesh's world bounds, indexed in 6 m cells for the rays straight down.
const box=new T.Box3(),all=[],cells=new Map(),CELL=6;
for(const m of meshes){if(!m.geometry||m.userData.umbrellaAnimated)continue;m.updateWorldMatrix(true,false);box.setFromObject(m);if(box.isEmpty())continue;
 const e={m,minX:box.min.x,maxX:box.max.x,minZ:box.min.z,maxZ:box.max.z,minY:box.min.y,maxY:box.max.y};all.push(e);
 for(let i=Math.floor(e.minX/CELL);i<=Math.floor(e.maxX/CELL);i++)for(let j=Math.floor(e.minZ/CELL);j<=Math.floor(e.maxZ/CELL);j++){const k=i+','+j;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(e);}}
const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0),nm=new T.Matrix3();
/** The first thing straight down from high above (x, z): mesh, point and up-facing normal. */
function firstHit(x,z){let best=null;for(const e of cells.get(Math.floor(x/CELL)+','+Math.floor(z/CELL))??[]){if(x<e.minX||x>e.maxX||z<e.minZ||z>e.maxZ||best&&e.maxY<best.point.y)continue;
 ray.set(new T.Vector3(x,e.maxY+1,z),down);ray.far=e.maxY-e.minY+2;const hits=[];e.m.raycast(ray,hits);for(const h of hits)if(!best||h.point.y>best.point.y)best={...h,e};}
 if(best&&best.face){nm.getNormalMatrix(best.e.m.matrixWorld);best.up=best.face.normal.clone().applyMatrix3(nm).normalize().y;}return best;}

await ok('the audit: no roof, canopy, awning or deck you can see from above lets a landing through it',()=>{
 let checked=0,pieces=0,excluded=0,pitched=0;const gaps=new Map();
 for(const e of all){const w=e.maxX-e.minX,d=e.maxZ-e.minZ,cx=(e.minX+e.maxX)/2,cz=(e.minZ+e.maxZ)/2;
  if(w<CS.CANOPY_MIN_SIDE||d<CS.CANOPY_MIN_SIDE||w*d<CS.CANOPY_MIN_AREA||e.maxY-V.fieldSurfaceHeight(cx,cz)<CS.CANOPY_MIN_LIFT)continue;
  if(NOT_ROOF.test(e.m.geometry.type)||e.m.geometry.type==='ConeGeometry'&&!CS.roofLikeCone(w,d,e.maxY-e.minY)){excluded++;continue;}
  let seen=0;
  for(const fx of [-.3,0,.3])for(const fz of [-.3,0,.3]){const x=cx+fx*w,z=cz+fz*d,h=firstHit(x,z);
   if(!h||h.e!==e||Math.abs(h.up)<CS.CANOPY_STEEP_UP||h.point.y-V.fieldSurfaceHeight(x,z)<CS.CANOPY_MIN_LIFT)continue;
   // A custom or merged mesh (Summit Isle's baked trees, rocks and huts): its level faces only (a crown's facets are foliage).
   if(Math.abs(h.up)<CS.CANOPY_FLAT_UP&&!/Cone|Box|Extrude|Cylinder|Shape/.test(e.m.geometry.type))continue;seen++;if(Math.abs(h.up)<CS.CANOPY_FLAT_UP)pitched++;
   if(!rt.canLand(x,z,Infinity))continue;// a landing here is moved to the nearest landable spot (never through anything)
   // Landable: it must stand on the face (a pitched one refuses the landing instead: moved beside it, sliding off).
   checked++;const s=rt.surface(x,z,Infinity);
   if(Math.abs(h.up)<CS.CANOPY_FLAT_UP?s<h.point.y-.4:Math.abs(s-h.point.y)>.4){const k=`${cx.toFixed(1)},${cz.toFixed(1)} ${w.toFixed(1)}×${d.toFixed(1)} m top ${e.maxY.toFixed(2)}`;gaps.set(k,(gaps.get(k)??'')+` (${x.toFixed(1)},${z.toFixed(1)}: face ${h.point.y.toFixed(2)} m, lands at ${s.toFixed(2)} m)`);}}
  if(seen)pieces++;}
 assert(pieces>300&&checked>800,`audited ${pieces} pieces seen from above, ${checked} landable points`);
 assert.equal(gaps.size,0,`landings that fall through what you see:\n  ${[...gaps].slice(0,40).map(([k,v])=>k+v).join('\n  ')}`);
 console.log(`  audit: ${pieces} flat pieces ≥ ${CS.CANOPY_MIN_SIDE} m and ≥ ${CS.CANOPY_MIN_AREA} m² seen from above at ≥ ${CS.CANOPY_MIN_LIFT} m, ${checked} landable points all stand on what they show; ${excluded} foliage/sheet pieces excluded; ${pitched} points on pitched faces; ${world.canopies.filter(c=>!c.steep).length} canopy floors, ${world.canopies.filter(c=>c.steep).length} pitched roofs to slide off`);
});

// Land from the sky at (x, z), then walk the stick (sx, sz) for `secs`: where it stands, falls and lands.
function landAndWalk(x,z,sx,sz,secs,mode='walk'){const r=travel(),p={x,z},v={x:0,z:0};assert(r.canLand(x,z,Infinity),`landable at ${x.toFixed(1)},${z.toFixed(1)}`);
 const top=r.surface(x,z,Infinity);r.reset(x,z,top);const out={top,start:r.state.height,fell:false,stun:false,heights:[]};
 for(let i=0;i<secs*60;i++){r.update(1/60,p,v,{x:sx,z:sz,sprint:false},mode);if(r.state.falling)out.fell=true;if(r.state.recovery>0)out.stun=true;out.heights.push(r.state.height);}
 out.end=r.state.height;out.p=p;out.ground=V.fieldSurfaceHeight(p.x,p.z);return out;}

await ok('the Coral Cay Hostel verandah roof: landed on, walked along, walked off; the porch below stays walkable',()=>{
 const H=CC.HOSTEL,vz=H.z+H.d/2+H.verandah.d/2;
 // From the sky onto the tin roof's middle: it stands there (≈ 3.2–3.45 m), not on the porch.
 const s=rt.surface(H.x,vz,Infinity);assert(s>3&&s<3.6,`stands on the verandah roof (${s.toFixed(2)} m)`);
 assert(rt.findLanding(H.x,vz)&&Math.abs(rt.surface(rt.findLanding(H.x,vz).x,rt.findLanding(H.x,vz).z,Infinity)-s)<.4,'the landing search keeps the roof');
 // Walk along it (east), it stays up; then off its front edge (south): a drop to the ground, no stun from 3 m.
 const along=landAndWalk(H.x-5,vz,1,0,1.5);assert(!along.fell&&along.end>3,`walks along the roof (${along.end.toFixed(2)} m)`);
 assert(Math.max(...along.heights)-Math.min(...along.heights)<.4,'level enough to walk (the slope is a few cm a strip)');
 const off=landAndWalk(H.x,vz,0,1,4);assert(off.fell&&off.end<.5&&off.p.z>vz+H.verandah.d/2,`walked off its edge: down to the ground (${off.end.toFixed(2)} m at z ${off.p.z.toFixed(1)})`);
 // The porch below: the ground's view (NPCs, balls) and a player walking or riding under it stay at the porch's height.
 assert(rt.surface(H.x,vz)<.4&&rt.canLand(H.x+2,vz),'the NPCs\' view of the porch: ground, walkable');
 for(const mode of ['walk','bike']){const r=travel(),p={x:H.x-H.w/2+1,z:vz},v={x:0,z:0};r.reset(p.x,p.z);let hi=0;
  for(let i=0;i<240;i++){r.update(1/60,p,v,{x:1,z:0,sprint:false},mode);hi=Math.max(hi,r.state.height);}
  assert(hi<.5&&p.x>H.x,`${mode} under the verandah roof stays on the porch (highest ${hi.toFixed(2)} m, reached x ${p.x.toFixed(1)})`);}
 // The zipline's stair and cable: the stair still lands on the verandah path, and the cable's rider clears every canopy.
 const bottom=Z.ZIP_STAIR.bottom;assert(rt.surface(bottom.x,bottom.z)<.4,'the zipline stair ends on the ground');
 for(const c of Z.cableSamples(400))for(const k of world.canopies)if(Math.abs(c.x-k.x)<k.w/2+.4&&Math.abs(c.z-k.z)<k.d/2+.4&&c.t<.985)assert(c.feet>k.height+.3,`the zipline rider clears the canopy at ${k.x.toFixed(1)},${k.z.toFixed(1)}`);
});

await ok('landing samples: a few buildings and canopies on each island stand where they show',()=>{
 // The biggest canopies on each island (main island x < 330, Coral Cay, Summit Isle x > 400 and z > 0), and two roofs each.
 const island=c=>c.x>400&&c.z>0?'summit':c.x>330||c.z<-60&&c.x>230?'cay':'main';const by={main:[],cay:[],summit:[]};
 for(const c of world.canopies)if(!c.steep)by[island(c)].push(c);for(const k of Object.keys(by))by[k].sort((a,b)=>b.w*b.d-a.w*a.d);
 let landed=0;
 for(const k of ['main','cay']){assert(by[k].length>=3,`${k}: canopies registered (${by[k].length})`);
  for(const c of by[k].slice(0,4)){const h=firstHit(c.x,c.z);if(!rt.canLand(c.x,c.z,Infinity))continue;assert(h&&Math.abs(rt.surface(c.x,c.z,Infinity)-h.point.y)<.4,`${k} canopy at ${c.x.toFixed(1)},${c.z.toFixed(1)}`);landed++;}}
 for(const b of world.buildings.filter((b,i)=>i%25===0)){if(!rt.canLand(b.x,b.z,Infinity))continue;const h=firstHit(b.x,b.z);if(!h)continue;assert(rt.surface(b.x,b.z,Infinity)>=h.point.y-.4,`the roof of ${b.name??'a building'} at ${b.x.toFixed(0)},${b.z.toFixed(0)}`);landed++;}
 // The zipline deck on the hostel roof and the tower deck on Summit Isle.
 assert(Math.abs(rt.surface(Z.ZIP_LAND.x,Z.ZIP_LAND.z,Infinity)-Z.ZIP_DECK.height)<.01&&Math.abs(rt.surface(Z.ZIP_TOWER.x,Z.ZIP_TOWER.z,Infinity)-Z.ZIP_TOWER.deck)<.01,'the zipline decks');
 assert(landed>=8,`landed on ${landed} sampled roofs and canopies`);
});

await ok('walk-under: pavements below awnings and canopies stay at ground height for walkers and the NPCs\' view',()=>{
 const {blocked}=load('lib/town/simulation.ts');let n=0;
 for(const c of world.canopies){if(n>=40||c.height-V.fieldSurfaceHeight(c.x,c.z)>4)continue;
  // A spot under it with room to walk (not a counter or a stall's table).
  const spot=[[0,0],[-.3,0],[.3,0],[0,-.3],[0,.3]].map(([fx,fz])=>({x:c.x+fx*c.w,z:c.z+fz*c.d})).find(p=>!blocked(p.x,p.z,world.obstacles,.45));if(!spot)continue;
  n++;const g=V.fieldSurfaceHeight(spot.x,spot.z);assert(Math.abs(rt.surface(spot.x,spot.z)-g)<.4,`the ground's view under the canopy at ${c.x.toFixed(1)},${c.z.toFixed(1)}`);
  const r=travel(),p={...spot},v={x:0,z:0};r.reset(p.x,p.z);let hi=0;for(let i=0;i<40;i++){r.update(1/60,p,v,{x:.6,z:.6,sprint:false},'walk');hi=Math.max(hi,r.state.height-V.fieldSurfaceHeight(p.x,p.z));}
  assert(hi<.4,`walking under the canopy at ${c.x.toFixed(1)},${c.z.toFixed(1)} stays on the ground (up to ${hi.toFixed(2)} m)`);}
 assert(n>=15,`walked under ${n} canopies`);
 assert(CANOPY_STEP<=.5,'a canopy is a floor only from just below it');
});

if(failed){console.log(`roof-landing: ${failed} failed`);process.exit(1);}else console.log('roof-landing: all passed');
})();
