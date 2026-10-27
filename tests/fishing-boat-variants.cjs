// Deep-sea boat looks (Oct 26 2026, user: "the deep-sea fishing boats look identical"): every boat has its own deterministic size
// and paint (BOAT_LOOKS in lib/town/fishing/deepSeaBoatData.ts), every size-dependent rule (hull footprint, onHull, deck, stand,
// captain, prompt, swell) follows the scaled data, and the build stays inside the cost caps (one merged mesh per boat, one cached
// geometry per look, one shared material, no per-frame allocation).
// Run: node tests/fishing-boat-variants.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const T=require('three');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const D=load('lib/town/fishing/deepSeaBoatData.ts'),G=load('lib/town/fishing/deepSeaBoat.ts'),M=load('lib/town/fishing/boatMotion.ts');
const C=load('lib/town/fishing/boatCaptains.ts'),cat=load('lib/town/fishing/fishCatalog.ts');
const src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const boats=D.DEEP_SEA_BOATS;
const sizeSig=l=>`${l.scale.length}x${l.scale.beam}x${l.scale.freeboard}`;
const paintSig=l=>[l.hull,l.boot,l.stripe,l.trim,l.cabin,l.cabinBand,l.roof,l.fender].join();

ok('each boat has its own size and palette signature, same family',()=>{
 assert(boats.length>=2);
 assert.equal(new Set(boats.map(b=>b.look.key)).size,boats.length,'look keys');
 assert.equal(new Set(boats.map(b=>sizeSig(b.look))).size,boats.length,'size signatures');
 assert.equal(new Set(boats.map(b=>paintSig(b.look))).size,boats.length,'palette signatures');
 const L=boats.map(b=>b.look.scale.length);assert(Math.max(...L)>=.98&&Math.max(...L)<=1.1&&Math.min(...L)>=.75&&Math.min(...L)<=.85,'one ~1.0x, one ~0.8x: '+L);
 for(let i=0;i<boats.length;i++)for(let j=i+1;j<boats.length;j++){const a=boats[i].look,b=boats[j].look;
  const paint=['hull','boot','stripe','trim','roof','fender'].filter(k=>a[k]!==b[k]).length;assert(paint>=5,`${a.key} vs ${b.key}: only ${paint} paint differences`);
  const detail=[String(a.canopy),a.mast,a.clutter,a.rods.side+'/'+a.rods.transom,a.number,a.ring.join()].filter((v,k)=>v!==[String(b.canopy),b.mast,b.clutter,b.rods.side+'/'+b.rods.transom,b.number,b.ring.join()][k]).length;
  assert(detail>=4,`${a.key} vs ${b.key}: only ${detail} detail differences`);}
 for(const b of boats){const l=b.look;assert(/^\d{1,2}$/.test(l.number));for(const k of ['hull','boot','stripe','trim','deck','seam','cabin','cabinBand','roof','roofEdge','flag','flagMark','fender'])assert(/^#[0-9a-f]{6}$/.test(l[k]),l.key+'.'+k);
  for(const v of Object.values(l.scale))assert(v>=.75&&v<=1.15,l.key+': scale within the family');}
});

ok('deterministic: a fresh load gives the same looks, data and geometry',()=>{
 const D2=createLoader()('lib/town/fishing/deepSeaBoatData.ts');
 const snap=d=>JSON.stringify(d.DEEP_SEA_BOATS.map(b=>({look:b.look,hull:b.hull,deck:b.deck,stand:b.stand,afloat:b.afloat,prompt:b.prompt,cap:b.captainLocal})));
 assert.equal(snap(D2),snap(D));
 for(const b of boats){const g1=G.boatGeometry(b.look),g2=G.boatGeometry(b.look);
  assert.deepEqual(Array.from(g1.getAttribute('position').array),Array.from(g2.getAttribute('position').array),b.spotId+': same mesh');
  assert.deepEqual(Array.from(g1.getAttribute('color').array),Array.from(g2.getAttribute('color').array),b.spotId+': same paint');g1.dispose();g2.dispose();}
 assert(!/Math\.random|Date\.now|performance\.now/.test(src('lib/town/fishing/deepSeaBoatData.ts')+src('lib/town/fishing/deepSeaBoat.ts')),'no runtime randomness');
});

ok('footprint, onHull and afloat match the scaled dims; the mesh matches the footprint',()=>{
 for(const b of boats){const s=b.look.scale,h=b.hull;
  assert(Math.abs(h.x0-D.BOAT_HULL.x0*s.length)<1e-9&&Math.abs(h.x1-D.BOAT_HULL.x1*s.length)<1e-9&&Math.abs(h.halfBeam-D.BOAT_HULL.halfBeam*s.beam)<1e-9,b.spotId+': hull = base x scale');
  const inside=(lx,lz)=>{const p=b.toWorld(lx,lz);return b.onHull(p.x,p.z)&&D.onBoatHull(p.x,p.z);};
  assert(inside(h.x0+.05,0)&&inside(h.x1-.05,0)&&inside(0,h.halfBeam-.05)&&inside(0,-h.halfBeam+.05),b.spotId+': onHull inside the edges');
  assert(!inside(h.x0-.05,0)&&!inside(h.x1+.05,0)&&!inside(0,h.halfBeam+.05),b.spotId+': onHull ends at the scaled edges');
  for(const [u,v] of [[h.x0,-h.halfBeam],[h.x1,h.halfBeam],[h.x0,h.halfBeam],[h.x1,-h.halfBeam]]){const p=b.toWorld(u,v),a=b.afloat;assert(p.x>a.x0&&p.x<a.x1&&p.z>a.z0&&p.z<a.z1,b.spotId+': afloat covers the hull');}
  // The hull's mesh (below the deck) spans the scaled footprint (foam collar and fenders a little proud of it).
  const g=G.boatGeometry(b.look),pos=g.getAttribute('position');let x0=1e9,x1=-1e9,z1=0;
  for(let i=0;i<pos.count;i++){if(pos.getY(i)>b.deckY-.05)continue;x0=Math.min(x0,pos.getX(i));x1=Math.max(x1,pos.getX(i));z1=Math.max(z1,Math.abs(pos.getZ(i)));}
  assert(Math.abs(x0-h.x0)<.25&&Math.abs(x1-h.x1)<.25&&z1>=h.halfBeam&&z1<h.halfBeam+.3,`${b.spotId}: mesh ${x0.toFixed(2)}..${x1.toFixed(2)} ±${z1.toFixed(2)} vs hull`);
  // The deck floor in the mesh sits at the data's deck height; the waterline foam stays at the sea surface.
  let deckTop=false,foamY=[];const foam=g.getAttribute('foam');for(let i=0;i<pos.count;i++){if(Math.abs(pos.getY(i)-b.deckY)<1e-4)deckTop=true;if(foam.getX(i)>.5)foamY.push(pos.getY(i));}
  assert(deckTop,b.spotId+': mesh deck at deckY '+b.deckY);assert(Math.min(...foamY)>=-.431&&Math.max(...foamY)<-.39,b.spotId+': foam collar on the water');
  assert(Math.abs(b.deckY-D.lookY(b.look,D.BOAT_DECK_Y))<1e-9&&b.deck.height===b.deckY&&b.deckY>.5&&b.deckY<1.2,b.spotId+': deck height counts as on foot');
  g.dispose();}
 // Neighbours: the boats' boxes never overlap.
 for(let i=0;i<boats.length;i++)for(let j=i+1;j<boats.length;j++){const a=boats[i].afloat,c=boats[j].afloat;assert(a.x1<c.x0||c.x1<a.x0||a.z1<c.z0||c.z1<a.z0,'afloat boxes apart');}
});

ok('deck, stand, captain and prompt sit on each boat at its size',()=>{
 boats.forEach((b,i)=>{const dk=b.deck,sl=b.standLocal,cap=C.BOAT_CAPTAINS[i];
  assert(dk.w>=4&&dk.d>=2.5&&dk.w*dk.d>=10,`${b.spotId}: deck room for angler + captain (${dk.w.toFixed(2)} x ${dk.d.toFixed(2)})`);
  const c=b.toLocal(dk.x,dk.z);assert(Math.abs(c.x-sl.x)<1e-9&&Math.abs(c.z)<1e-9,b.spotId+': the stand is on the deck centre line');
  assert(c.x-dk.w/2>b.hull.x0&&c.x+dk.w/2<.6*b.look.scale.length+1e-9&&dk.d/2<b.hull.halfBeam-.1,b.spotId+': deck inside the bulwarks, aft of the wheelhouse');
  const cl=b.toLocal(cap.x,cap.z);assert(Math.abs(cl.x-b.captainLocal.x)<1e-9&&Math.abs(cl.z-b.captainLocal.z)<1e-9,cap.name+': at the boat\'s captain point');
  assert(Math.abs(cl.x-sl.x)<=dk.w/2-.3&&Math.abs(cl.z)<=dk.d/2-.3&&cl.z<0,cap.name+': on the deck, port side');
  assert(Math.hypot(cap.x-b.stand.x,cap.z-b.stand.z)>=2.2,cap.name+': clear of the stand');
  assert(Math.abs(cap.floor()-b.deckY)<1e-9,cap.name+': feet on this boat\'s deck');
  const spot=cat.spotById(b.spotId);assert(spot.boat.floor===b.deckY&&spot.x===b.stand.x&&spot.z===b.stand.z,b.spotId+': the fishing spot uses this boat\'s deck');
  const p=b.toLocal(b.prompt.x,b.prompt.z);assert(p.x>b.hull.x0&&p.x<0&&b.prompt.y>b.deckY+2,b.spotId+': the Fish prompt over this deck');});
});

ok('swell follows the size and stays inside the limits',()=>{
 const peak=(look,fishing)=>{const r=M.createBoatRide();let h=0,t=0;for(let i=0;i<1200;i++){t+=1/60;const m=M.stepBoatMotion(r,1/60,t,.3,{fishing,reduced:false,swell:look.swell,kick:i%200===0,lean:fishing?Math.sin(i/90):0});
  h=Math.max(h,Math.abs(m.heave));assert(Math.abs(m.heave)<=M.BOAT_LIMITS.heave&&Math.abs(m.pitch)<=M.BOAT_LIMITS.tilt&&Math.abs(m.roll)<=M.BOAT_LIMITS.tilt);}return h;};
 const big=boats.reduce((a,b)=>a.look.scale.length>=b.look.scale.length?a:b),small=boats.reduce((a,b)=>a.look.scale.length<b.look.scale.length?a:b);
 assert(small.look.swell>big.look.swell&&small.look.swell<=1.25,'the smaller boat rides a little livelier');
 assert(peak(small.look,true)>peak(big.look,true),'smaller boat heaves more');
 assert(/swell:look\.swell/.test(src('lib/town/fishing/deepSeaBoat.ts')),'the build passes its look\'s swell');
});

ok('cost caps: one mesh per boat, one cached geometry per look, one material, bounded triangles, no per-frame allocation',()=>{
 const tris=boats.map(b=>{const g=G.boatGeometry(b.look),n=g.getAttribute('position').count/3;g.dispose();return n;});
 const parts=boats.map(b=>{const p=G.boatParts(b.look);p.forEach(x=>x.geometry.dispose());return p.length;});
 for(let i=0;i<boats.length;i++)assert(tris[i]<=4500&&parts[i]<=160,`${boats[i].spotId}: ${tris[i]} triangles, ${parts[i]} parts`);
 assert(Math.max(...parts)-Math.min(...parts)<=30,'variants differ by a few parts, not a new model: '+parts);
 const s=src('lib/town/fishing/deepSeaBoat.ts');
 assert.equal((s.match(/new T\.Mesh\(/g)||[]).length,1,'one mesh per boat');
 assert((s.match(/foamMaterial\(\)/g)||[]).length===2,'one material factory call site (shared)');
 const upd=s.slice(s.indexOf('update(c:DeepSeaBoatUpdate){'),s.indexOf('ride(on:boolean)'));assert(upd.length>100&&!/new |\{\.\.\.|\[\.\.\./.test(upd.replace(/\/\/.*$/gm,'')),'update() allocates nothing');
 // The cache: two builders of the same look share one geometry; all released on dispose.
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(50,1,.1,1000),b=boats[1];camera.position.set(b.mooring.x,10,b.mooring.z+20);camera.lookAt(b.mooring.x,0,b.mooring.z);camera.updateMatrixWorld();
 const a1=G.createDeepSeaBoat(scene,b),a2=G.createDeepSeaBoat(scene,b),a0=G.createDeepSeaBoat(scene,boats[0]);
 for(const x of [a1,a2,a0])x.update({x:b.mooring.x,z:b.mooring.z,camera,elapsed:0,reduced:false,dt:1/60});
 assert(a1.built&&a2.built&&a0.built&&G.boatGeometryCount()===2,'two looks cached once each: '+G.boatGeometryCount());
 const meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});assert.equal(meshes.length,3);assert(meshes[0].geometry===meshes[1].geometry||meshes[1].geometry===meshes[2].geometry||meshes[0].geometry===meshes[2].geometry,'same look shares geometry');
 assert.equal(new Set(meshes.map(m=>m.material)).size,1,'one material for every boat');
 assert(Math.abs(a1.deck.height-b.deckY)<.1,'live deck at this boat\'s height');
 a1.dispose();a2.dispose();a0.dispose();assert.equal(G.boatGeometryCount(),0,'released');
});

if(failed){console.log(`FISHING_BOAT_VARIANTS_FAIL ${failed}`);process.exit(1);}
console.log('FISHING_BOAT_VARIANTS_PASS');
