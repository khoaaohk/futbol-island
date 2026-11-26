// Coral Cay roundabout and its causeway junctions (Oct 15 2026, user: "fix the roundabout, the road is covering that").
// The cay's beach sand shared one cached material with a slope-scaled polygon offset (factor -2), which on a phone at the
// reduced heat-tier resolution outranked the paving 8-10 cm above it: the beach drew over the ring, both arms and their
// pavements, leaving the zebra floating on sand. Builds the real island (world.ts) and casts rays straight down over the
// roundabout and both arms to check the layer stack the GPU has to resolve:
//  - no ground layer under the paving carries a slope-scaled (factor) polygon offset that could outrank it;
//  - every layer under the paving is at least 4 cm lower (nothing nearly coplanar);
//  - road surfaces never stack (one asphalt/pavement layer per point: the arm ribbons end where the ring's flare starts);
//  - the kerbed island covers the ring's hole (no lawn or sand showing between them) and sits above the asphalt;
//  - every zebra / give-way stripe lies on asphalt, and every paved point has land under it (no paving out over the sea).
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const base=process.cwd(),T=require('three'),ts=require('typescript');
(async()=>{
 const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
 // Nov 26 2026 (the ground layers ship ON): the whole check runs twice, with the three layers on (the shipped state) and off (`?elev=0&depth=0&surf=0`).
 // With elevation on, a road piece that reaches rising ground is draped: it follows the ground and rides DRAPE_UP above it (so the pinned ring sits 2 cm higher),
 // and its paint keeps its designed clearance over it (elevationDrape.ts: the marking pass; before it the boulevard dashes were buried / floating by ~10 cm).
 for(const layersOn of [true,false]){
 const cache=new Map(),gradient={addColorStop(){}};const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,console,Math,performance,Float32Array,window:{matchMedia:()=>({matches:false})},document:{createElement:()=>({getContext:()=>ctx})},require:id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
 const EL=load(base+'/lib/town/elevation.ts');EL.setElevation(layersOn);load(base+'/lib/town/townDepth.ts').setTownDepth(layersOn);load(base+'/lib/town/surfaceEdges.ts').setSurfaces(layersOn);
 const up=layersOn?load(base+'/lib/town/elevationDrape.ts').DRAPE_UP:0,G=(x,z)=>EL.regionLift(x,z);
 const scene=new T.Scene();load(base+'/lib/town/world.ts').buildTown(scene);scene.updateMatrixWorld(true);
 const cay=load(base+'/lib/town/coralCay.ts'),R=cay.ROUNDABOUT;
 const ASPHALT='737c75',PAVEMENT='eddfbb',STRIPE='f5eed5',LAWN='739568',KERB='d2bc94',SAND='f1d6a1',OCEAN='surrounding-ocean';
 // The sand material itself: no slope-scaled offset (that is what outranked the paving).
 const sandMats=new Set();scene.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&o.material.color?.getHexString()===SAND&&o.name.startsWith('island-chunk-'))sandMats.add(o.material);});
 assert(sandMats.size>=1,'the cay sand is batched');
 for(const m of sandMats)assert(!(m.polygonOffset&&m.polygonOffsetFactor<0),'cay sand has no slope-scaled polygon offset (it outranked the roundabout paving)');
 const HALF=26,STEP=.4,area=new T.Box3(new T.Vector3(R.x-HALF,-2,R.z-HALF),new T.Vector3(R.x+HALF,1.2,R.z+HALF));
 const meshes=[];scene.traverse(o=>{if(o.isMesh&&o.visible&&!o.isInstancedMesh){o.geometry.computeBoundingBox();if(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld).intersectsBox(area))meshes.push(o);}});
 const rc=new T.Raycaster(),down=new T.Vector3(0,-1,0),hex=h=>Array.isArray(h.object.material)?'':h.object.material.color?.getHexString?.()??'';
 const isRoadColour=h=>hex(h)===ASPHALT||hex(h)===PAVEMENT;
 // A road surface: at its built height on flat ground (a draped piece rides `up` higher); on the arm's grade a draped cell is a chord of the height function (3 cm either way).
 const isRoad=h=>{const g=G(h.point.x,h.point.z),y=h.point.y-g,slack=g>0?.03:0;return isRoadColour(h)&&y>-.03-slack&&y<.001+up+slack;};
 const ARM_HALF=cay.CAUSEWAY.deckHalf+.5;
 let pebbles=0,paved=0,stacked=0,coplanar=0,offsetBelow=0,overSea=0,stripes=0,stripeOff=0,ringHole=0,islandLow=0;const bad=[];
 for(let x=R.x-HALF;x<=R.x+HALF;x+=STEP)for(let z=R.z-HALF;z<=R.z+HALF;z+=STEP){
  const g=G(x,z);rc.set(new T.Vector3(x,1.2+g,z),down);const hits=rc.intersectObjects(meshes,false).filter(h=>h.face.normal.y>.5||h.object.name===OCEAN);
  if(!hits.length)continue;const r=Math.hypot(x-R.x,z-R.z);
  // The island: inside the kerb, the top surface is the lawn or the kerb, well above the asphalt.
  if(r<R.roadInner-.05){const top=hits[0];if(hex(top)!==LAWN&&hex(top)!==KERB&&top.point.y<.25)islandLow++;}
  // Between the kerb and the ring's hole edge nothing but kerb may show (the old 6.6 m octagon left lawn/sand there).
  if(r>R.island-.6&&r<R.roadInner+.02&&!(hex(hits[0])===KERB||hex(hits[0])===LAWN||hits[0].point.y>.2)){ringHole++;bad.push(['hole',x.toFixed(1),z.toFixed(1),hex(hits[0])]);}
  if(hex(hits[0])===STRIPE&&hits[0].point.y>g&&hits[0].point.y<g+up+.03+(g>0?.03:0)){stripes++;const under=hits[1],gap=under?hits[0].point.y-under.point.y:0;/* paint: 1.4-2.4 cm over the asphalt as built, wherever the asphalt is */if(!under||hex(under)!==ASPHALT||gap<.012||gap>.04||(g===0&&!layersOn&&Math.abs(under.point.y+.01)>.002)||(g===0&&Math.abs(under.point.y+.01-up)>.012)){stripeOff++;bad.push(['stripe',x.toFixed(1),z.toFixed(1),under&&hex(under)]);}}
  // The ring (to its pavement and flares) and the two arms only: on the raised cay the footpaths that climb away from the boulevard are path slabs with their own lip and wear (tests/surface-edges.cjs).
  if(r>R.roadOuter+3.5&&Math.abs(z-R.z)>ARM_HALF)continue;
  const roadIdx=hits.findIndex(isRoad);if(roadIdx<0)continue;paved++;const road=hits[roadIdx];
  const below=hits.slice(roadIdx+1);
  // Pebbles poking up through the paving (the tide-line rocks of the cay's west shore ran under the ring).
  if(r>R.island+.1&&hits.slice(0,roadIdx).some(h=>hex(h)===KERB&&h.point.y<.3)){pebbles++;if(pebbles<6)bad.push(['pebble',x.toFixed(1),z.toFixed(1)]);}
  if(below.some(h=>isRoadColour(h)&&road.point.y-h.point.y<.012/* a footpath slab starts 1.75 cm under the pavement it leaves (same paint, as before) */)){stacked++;if(stacked<6)bad.push(['stacked',x.toFixed(1),z.toFixed(1)]);}
  for(const h of below){if(h.object.name===OCEAN)continue;/* same paint under the same paint cannot show a seam */if(road.point.y-h.point.y<.04&&hex(h)!==hex(road)){coplanar++;if(coplanar<6)bad.push(['coplanar',x.toFixed(1),z.toFixed(1),hex(h),h.point.y.toFixed(3)]);}
   const m=h.object.material;if(m.polygonOffset&&m.polygonOffsetFactor<0){offsetBelow++;if(offsetBelow<6)bad.push(['offset',x.toFixed(1),z.toFixed(1),hex(h)]);}}
  // The ring itself (to its pavement's outer edge) stands on the cay; the causeway arm is a deck over the water by design.
  if(r<R.roadOuter+3&&!below.some(h=>h.object.name!==OCEAN&&h.point.y>-1))overSea++;
 }
 console.log(JSON.stringify({pebbles,paved,stacked,coplanar,offsetBelow,overSea,stripes,stripeOff,ringHole,islandLow}));
 if(bad.length)console.log('first problems',JSON.stringify(bad.slice(0,12)));
 assert(paved>3000,'the ring and both arms are paved: '+paved);
 assert.equal(offsetBelow,0,'no layer under the paving carries a slope-scaled polygon offset that could draw over it');
 assert.equal(coplanar,0,'every layer under the paving is at least 4 cm lower');
 assert.equal(stacked,0,'road surfaces never stack: each arm ends where the ring\'s flare begins (no road segment overlaps the ring)');
 assert.equal(pebbles,0,'no rocks poke up through the roundabout or the arms');
 assert.equal(islandLow,0,'the kerbed island is the top surface inside the ring');
 assert.equal(ringHole,0,'the kerb covers the ring\'s hole: no lawn or sand between the island and the asphalt');
 assert(stripes>40,'zebra and give-way stripes found: '+stripes);
 assert.equal(stripeOff,0,'every zebra / give-way stripe sits on asphalt (none on sand or pavement)');
 assert.equal(overSea,0,'the roundabout stands on land: no ring paving out over the sea');
 console.log('roundabout junctions (layers '+(layersOn?'on':'off')+'): clean layer stack, no overlaps, crossings on asphalt');
 }
})().catch(e=>{console.error(e);process.exit(1);});
