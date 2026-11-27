// Path into the street + sand in the grass (owner, Nov 26 2026: "fix this going into the street", "also fix ... the sand in the grass area").
// Builds the real island (world.ts) with the three ground layers on (the shipped state) and with each one off, and checks:
//  1. nothing path-coloured lies over a street: cast straight down over every place a path's area overlaps a street (carriageway
//     or pavement), the top ground surface is the street's own (within 3 cm): a path slab that ran on past the kerb showed as a pale
//     tongue on the sunk asphalt (?depth=1) and through a dropped kerb (townDepth.ts clipToStreets);
//  2. the lawn's path wear sheets and lips (surfaceEdges.ts) never lie on a street (3 cm tolerance);
//  3. no sand pocket in a lawn: along each side of every path on the main island and Coral Cay, the lawn does not
//     stop short of the path between two stretches of lawn (the Palm Coast promenade: shoreline.ts PALM_COAST_PROMENADE).
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const base=process.cwd(),T=require('three'),ts=require('typescript');
const insidePoly=(poly,x,z)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};
const inRect=(r,x,z,m=0)=>Math.abs(x-r.x)<r.w/2-m&&Math.abs(z-r.z)<r.d/2-m;
(async()=>{
 const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
 let streets=null;const report=[];
 for(const [label,elev,depth,surf] of [['all on',1,1,1],['elev off',0,1,1],['depth off',1,0,1],['surf off',1,1,0],['all off',0,0,0]]){
  const cache=new Map(),gradient={addColorStop(){}};const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
  function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,console,Math,performance,Float32Array,window:{matchMedia:()=>({matches:false})},document:{createElement:()=>({getContext:()=>ctx})},require:id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
  const EL=load(base+'/lib/town/elevation.ts'),D=load(base+'/lib/town/townDepth.ts'),SE=load(base+'/lib/town/surfaceEdges.ts'),DR=load(base+'/lib/town/elevationDrape.ts');
  EL.setElevation(!!elev);D.setTownDepth(!!depth);SE.setSurfaces(!!surf);
  let input=null,surfIn=null;const sd=D.setDepthStreets;D.setDepthStreets=i=>{input=i;return sd(i);};const si=SE.setSurfaceInput;SE.setSurfaceInput=i=>{surfIn=i;return si(i);};
  const scene=new T.Scene(),world=load(base+'/lib/town/world.ts').buildTown(scene);scene.updateMatrixWorld(true);
  if(input)streets={roads:input.roads,junctions:input.junctions,paths:input.hard.filter(h=>h.kind==='path')};
  assert.ok(streets,'the first build (depth on) records the streets');
  const asphalt=[...streets.roads.map(r=>({x:r.x,z:r.z,w:r.vertical?r.carriageway:r.w,d:r.vertical?r.d:r.carriageway})),...streets.junctions.map(j=>({x:j.x,z:j.z,w:8,d:8}))];
  const foot=[...streets.roads.map(r=>({x:r.x,z:r.z,w:r.w,d:r.d})),...streets.junctions.map(j=>({x:j.x,z:j.z,w:12,d:12}))];
  const meshes=[];scene.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.visible)meshes.push(o);});
  const rc=new T.Raycaster(),down=new T.Vector3(0,-1,0),up=elev?DR.DRAPE_UP:0;
  // 1. over every path / street overlap: the top ground surface is the street's (paint and kerb stones sit within 3 cm)
  let probes=0;const bad=new Map();
  for(const p of streets.paths)for(const r of foot){const x0=Math.max(p.x-p.w/2,r.x-r.w/2),x1=Math.min(p.x+p.w/2,r.x+r.w/2),z0=Math.max(p.z-p.d/2,r.z-r.d/2),z1=Math.min(p.z+p.d/2,r.z+r.d/2);if(x1-x0<=.03||z1-z0<=.03)continue;
   for(let x=x0+.25;x<x1;x+=.5)for(let z=z0+.25;z<z1;z+=.5){const onAsphalt=asphalt.some(a=>inRect(a,x,z,.35)),onPave=!onAsphalt&&!asphalt.some(a=>inRect(a,x,z,-.45));if(!onAsphalt&&!onPave)continue;/* the kerb band itself: kerb stones */
    rc.set(new T.Vector3(x,5,z),down);const top=rc.intersectObjects(meshes,false).find(h=>h.point.y<.1);if(!top)continue;probes++;
    const want=(onAsphalt?D.DRAWN.asphalt:D.DRAWN.pave)+D.depthLift(x,z)+EL.regionLift(x,z)+(EL.regionLift(x,z)>0?up:0);
    const slab=D.DRAWN.path+EL.regionLift(x,z)+(EL.regionLift(x,z)>0?up:0);/* on a pavement: a path slab's top showing through a dropped kerb */
    if(onAsphalt?top.point.y>want+.03:Math.abs(top.point.y-slab)<.006&&top.point.y>want+.03){const k=`${p.x},${p.z} (${p.w}x${p.d})`;if(!bad.has(k))bad.set(k,`${x.toFixed(1)},${z.toFixed(1)} ${onAsphalt?'asphalt':'pavement'} top ${top.point.y.toFixed(3)} street ${want.toFixed(3)}`);}}}
  assert.ok(probes>300,'probes over path / street overlaps: '+probes);
  assert.equal(bad.size,0,label+': path slab over a street at\n  '+[...bad].map(([k,v])=>k+': '+v).join('\n  '));
  // 1b. rounded street corners (owner, Nov 26 2026): over each corner's new asphalt the top surface is the asphalt (no pavement, path or
  //     lawn left over it, no hole); just inside the curve it is the pavement (or its dropped-kerb ramp), never a hole down to the lawn
  if(depth){let cp=0;const cbad=[];for(const f of D.depthStreets().asphalt.fillets){for(let k=.5;k<8;k+=1)for(const [rho,on] of [[f.r+.9,'asphalt'],[f.r+1.6,'asphalt'],[f.r-.6,'pave'],[f.r-1.2,'pave']]){
    const [x,z]=D.filletPoint(f,k,rho);if(on==='asphalt'&&!((x-f.vx)*f.bx+(z-f.vz)*f.bz>-.5&&(x-f.vx)*f.ax+(z-f.vz)*f.az>-.5))continue;
    rc.set(new T.Vector3(x,5,z),down);const top=rc.intersectObjects(meshes,false).find(h=>h.point.y<.1);cp++;
    const want=(on==='asphalt'?D.DRAWN.asphalt:D.DRAWN.pave)+D.depthLift(x,z)+EL.regionLift(x,z)+(EL.regionLift(x,z)>0?up:0);
    if(!top||Math.abs(top.point.y-want)>.03)cbad.push(`${on} at ${x.toFixed(2)},${z.toFixed(2)}: top ${top?top.point.y.toFixed(3):'none'} want ${want.toFixed(3)}`);}}
   assert.ok(cp>600,'rounded-corner probes '+cp);assert.deepEqual(cbad.slice(0,6),[],label+': rounded corners');
   // path to deck (owner, Nov 26 2026): the South Pier boardwalk's west end and the two picnic patios meet the deck (paved to its edge, no rail across)
   const pathAt=(x,z)=>streets.paths.some(p=>inRect(p,x,z,-.01));
   for(const [x,z] of [[48.9,209.2],[48.9,212.8],[46,212.5],[95,206.9],[118,206.9],[95,203.7],[118,203.7]])assert.ok(pathAt(x,z),'paved up to the deck at '+x+','+z);
   for(let z=209.1;z<213;z+=.2)assert.ok(!world.obstacles.some(o=>Math.abs(49-o.x)<o.w/2+.2&&Math.abs(z-o.z)<o.d/2),'the boardwalk west rail is open at z '+z.toFixed(1));
   assert.ok(world.obstacles.some(o=>Math.abs(49-o.x)<.1&&Math.abs(208-o.z)<.1)&&world.obstacles.some(o=>Math.abs(49-o.x)<.1&&o.z>213),'the rest of the west rail still blocks');
   // Leftovers B (Nov 26 2026 night): the pavements' inner (lawn-side) corners round too: the corner they gain is paving at the
   // pavement's height (no lawn or hole showing through), and most of the 44 block corners take it (a corner with something standing there stays square)
   {const FF=D.depthStreets().foot.fillets,ibad=[];assert.ok(FF.length>=30,'inner rounded corners in the town: '+FF.length);
    for(const f of FF)for(const q of [.12,.25]){const x=f.vx+(f.bx+f.ax)*f.r*q,z=f.vz+(f.bz+f.az)*f.r*q;rc.set(new T.Vector3(x,5,z),down);const top=rc.intersectObjects(meshes,false).find(h=>h.point.y<.1);
     const want=D.DRAWN.pave+D.depthLift(x,z)+EL.regionLift(x,z)+(EL.regionLift(x,z)>0?up:0);if(!top||Math.abs(top.point.y-want)>.03)ibad.push(`${x.toFixed(2)},${z.toFixed(2)}: ${top?top.point.y.toFixed(3):'none'} want ${want.toFixed(3)}`);}
    assert.deepEqual(ibad.slice(0,6),[],label+': inner corners paved');report.push(label+': '+FF.length+' inner rounded corners');}
   // ... and the Coral Cay sandbar spurs' boardwalks open onto the causeway with nothing on their first metres (the rail-end boulders sat there)
   {const CC=load(base+'/lib/town/coralCay.ts'),sbad=[];for(const sb of CC.SANDBARS){const zr=sb.spur.roadZ+sb.side*CC.CAUSEWAY.railHalf;
     for(let dx=-1.7;dx<=1.7;dx+=.34)for(const dz of [.2,.6,1,1.4]){const x=sb.spur.x+dx,z=zr+sb.side*dz;rc.set(new T.Vector3(x,5,z),down);const top=rc.intersectObjects(meshes,false).find(h=>h.point.y<.9);if(top&&top.point.y>.06)sbad.push(`${x.toFixed(1)},${z.toFixed(1)} ${top.point.y.toFixed(2)}`);}}
    assert.deepEqual(sbad.slice(0,6),[],label+': spur openings clear');}
   report.push(label+': '+cp+' rounded-corner probes');}
  // 2. the lawn's wear sheets and lips stay off the streets
  let edgeTris=0,onStreet=0;if(surf&&surfIn){SE.setSurfaceInput(surfIn);const e=SE.mainLawnEdges();const P=e.position;
   for(let i=0;i<e.index.length;i+=3){const a=e.index[i]*3,b=e.index[i+1]*3,c=e.index[i+2]*3,cx=(P[a]+P[b]+P[c])/3,cz=(P[a+2]+P[b+2]+P[c+2])/3;if(e.edge[e.index[i]*2+1]<1.5)continue;/* the rim (no wear code): its bare side lies under the street by design */
    edgeTris++;if(foot.some(r=>inRect(r,cx,cz,.03)))onStreet++;}
   assert.ok(edgeTris>200,'lip / wear triangles '+edgeTris);assert.equal(onStreet,0,label+': lip / wear triangles on a street: '+onStreet);}
  // 3. sand in the grass: along a path's side the lawn never stops short between two stretches of lawn
  const S=load(base+'/lib/town/shoreline.ts'),C=load(base+'/lib/town/coralCay.ts');const notches=[];
  const sides=(poly,paths,tag)=>{for(const p of paths)for(const along of [true,false]){const L=along?p.w:p.d;if(L<6)continue;for(const s of [-1,1]){const row=[];
    for(let u=-L/2+.5;u<=L/2-.5;u+=1){const x=along?p.x+u:p.x+s*(p.w/2+.6),z=along?p.z+s*(p.d/2+.6):p.z+u;if(foot.some(r=>inRect(r,x,z,-.3))||paths.some(q=>q!==p&&inRect(q,x,z,-.3)))row.push(null);else row.push(insidePoly(poly,x,z));}
    const first=row.indexOf(true),last=row.lastIndexOf(true);for(let i=first+1;i<last;i++)if(row[i]===false){
     /* a pocket: the lawn resumes within 6 m further out (a beach side, where sand runs on to the sea, is the coast's own curve) */
     const u=-L/2+.5+i,pocket=[1,2,3,4,5,6].some(k=>insidePoly(poly,along?p.x+u:p.x+s*(p.w/2+.6+k),along?p.z+s*(p.d/2+.6+k):p.z+u));if(!pocket)continue;notches.push(`${tag} path ${p.x},${p.z} side ${along?'z':'x'}${s>0?'+':'-'} at u ${(-L/2+.5+i).toFixed(1)}`);break;}}}};
  sides(S.INTERIOR_GRASS,streets.paths.filter(p=>insidePoly(S.INTERIOR_GRASS,p.x,p.z)||insidePoly(S.INTERIOR_GRASS,p.x-p.w/2,p.z-p.d/2)||insidePoly(S.INTERIOR_GRASS,p.x+p.w/2,p.z+p.d/2)),'main');
  sides(C.CAY_LAWN,C.HOSTEL_PATHS.map(([x,z,w,d])=>({x,z,w,d})),'cay');
  // Known, left for the owner (Nov 26 2026): the east beach path at (221, 100) runs straight while the lawn's coast curves away west of it
  // (up to ~16 m of sand at z 90-98): the approved beach shape, not a lawn block; listed in SHIP-TRIAGE "Path into the street".
  const KNOWN=['main path 221,100 side x-'];
  assert.deepEqual(notches.filter(n=>!KNOWN.some(k=>n.startsWith(k))),[],label+': the lawn stops short of a path (sand in the grass)');
  const clips=D.pathClips.value;if(depth)assert.ok(clips.length>=8,'path slabs trimmed at the street: '+clips.length);
  // 4. hard lawn corners on the beach (owner shot 142, Nov 26 night, (-233,-187)): (a) the raised west side's lawn patch never stands
  //    over the sand outside the lawn (its 2 m cells straddle the coast: a row of them laid a straight edge and grass points on the
  //    beach); (b) every stretch of the main lawn's coast carries the soft torn fringe (the lift lattice's 1 cm bleed had cut it).
  if(elev&&surf){const W=load(base+'/lib/town/westTerrain.ts'),patch=W.westLawnPatch(2),PP=patch.position,G=S.INTERIOR_GRASS,EL2=EL;let pts=0;const hard=[];
   for(let t=0;t<patch.index.length;t+=3){const a=patch.index[t]*3,b=patch.index[t+1]*3,c=patch.index[t+2]*3;
    for(const [u,v] of [[1/3,1/3],[.8,.1],[.1,.8],[.1,.1],[.45,.45],[.45,.1],[.1,.45]]){const w=1-u-v,x=PP[a]*u+PP[b]*v+PP[c]*w,y=PP[a+1]*u+PP[b+1]*v+PP[c+1]*w-.112,z=PP[a+2]*u+PP[b+2]*v+PP[c+2]*w;pts++;
     if(y>-.105&&!insidePoly(G,x,z)&&EL2.ringDistance(G,x,z)>.35)hard.push(`${x.toFixed(1)},${z.toFixed(1)} y ${y.toFixed(3)}`);}}
   assert.ok(pts>1000,'patch samples '+pts);assert.deepEqual(hard.slice(0,6),[],label+': lawn patch over the beach sand');
   SE.setSurfaceInput(surfIn);const e=SE.mainLawnEdges(),EP=e.position,cells=new Map();for(let i=0;i<EP.length;i+=3){const k=Math.floor(EP[i]/4)+':'+Math.floor(EP[i+2]/4);cells.set(k,(cells.get(k)??0)+1);}
   const near=(x,z)=>{for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)if(cells.has((Math.floor(x/4)+i)+':'+(Math.floor(z/4)+j)))return true;return false;},bare=[];
   for(let i=0;i<G.length;i++){const p=G[i],q=G[(i+1)%G.length],mx=(p.x+q.x)/2,mz=(p.z+q.z)/2;if(mx>=450||EL.regionLift(mx,mz)>SE.FRINGE_LIFT)continue;if(!near(mx,mz))bare.push(`${mx.toFixed(0)},${mz.toFixed(0)}`);}
   assert.deepEqual(bare,[],label+': coast stretches without the torn fringe (hard lawn edge on the sand)');
   report.push(`${label}: ${pts} lawn-patch samples off the sand, fringe on every coast stretch`);}
  report.push(`${label}: ${probes} probes, ${edgeTris} lip/wear triangles, ${depth?clips.length:0} slabs trimmed`);
 }
 // the clip itself: an end on the street is trimmed back to it; a street across the middle is reported, not guessed
 {const load2=require('./layer-flags-helper.cjs').loaderWithQuery('?depth=1'),D=load2('lib/town/townDepth.ts');
  const c=D.clipToStreets({x:0,z:0,w:3,d:13},[{x:0,z:9,w:40,d:12}]);assert.ok(c.trimmed&&c.whole&&!c.stuck&&Math.abs(c.z+1.75)<1e-9&&Math.abs(c.d-9.5)<1e-9,'one end trimmed: '+JSON.stringify(c));
  assert.ok(D.clipToStreets({x:0,z:0,w:3,d:13},[{x:0,z:0,w:40,d:4}]).stuck,'a street across the middle is reported');
  assert.equal(D.clipToStreets({x:0,z:0,w:3,d:13},[{x:0,z:0,w:40,d:40}]).whole,false,'a slab wholly on the street is gone');}
 console.log('  '+report.join('\n  '));console.log('path-on-road: ok');
})().catch(e=>{console.error(e);process.exit(1);});
