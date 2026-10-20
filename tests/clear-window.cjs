// Clear water window (Oct 19 2026, docs/water-look-research.md §3, docs/performance-guide.md "Clear water window"): the ocean
// blends and the seabed + coral show only near the shallows on heat tiers 0-2 (never tiers 3-4 / Battery saver, never while
// fishing); the ocean's render state comes back exactly when it closes (also when the swim disc shares it); coral counts stay
// capped, inside the depth band, under the surface; tier 2 keeps coral near; update() allocates nothing.
// Run: node tests/clear-window.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const T=require('three');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const WS=load('lib/graphics/waterSurface.ts'),SC=load('lib/graphics/swimClear.ts'),CW=load('lib/town/water/clearWindow.ts'),UW=load('lib/town/fishing/underwater.ts');

const scene=new T.Scene(),mat=new T.MeshStandardMaterial();WS.patchOceanMaterial(mat);
const ocean=new T.Mesh(new T.PlaneGeometry(1,1),mat);ocean.name='surrounding-ocean';scene.add(ocean);
const snap=()=>({blending:mat.blending,blendSrc:mat.blendSrc,blendDst:mat.blendDst,blendEquation:mat.blendEquation,blendSrcAlpha:mat.blendSrcAlpha,blendDstAlpha:mat.blendDstAlpha,blendEquationAlpha:mat.blendEquationAlpha,depthWrite:mat.depthWrite,transparent:mat.transparent,renderOrder:ocean.renderOrder});
const before=snap();
// A straight beach along x = 0 (sea at x > 0, depth growing off it), plus a rock at (6, 6).
const field={distance:(x,z)=>x,lift:(x,z)=>x<=0||Math.hypot(x-6,z-6)<2?.6:-.5};
let haveField=true;const win=CW.createClearWindow(scene,()=>haveField?field:null),U=WS.CLEAR_WIN_UNIFORMS.uClearWin.value;
const step=(n,x,z,tier,fishing=false,dt=1/60)=>{for(let i=0;i<n;i++)win.update(dt,x,z,tier,fishing);};
const group=scene.getObjectByName('clear-water-window');

ok('off: tiers 3-4 (Battery saver is tier 4), fishing, open sea, no field: nothing changes',()=>{
 for(const [x,tier,fishing] of [[5,3,false],[5,4,false],[5,0,true],[300,0,false]]){step(40,x,0,tier,fishing);assert.deepEqual(snap(),before);assert.equal(group.visible,false);assert.equal(U.z,0);assert.equal(win.open,false);}
 haveField=false;step(40,5,0,0);assert.deepEqual(snap(),before);haveField=true;
});
ok('on (tier 0 in the shallows): blended, depth kept, late order, eased in, seabed snapped, one Vector4',()=>{
 const vec=U;step(3,5,3,0);assert.equal(win.open,true);assert.equal(mat.blending,T.CustomBlending);assert.equal(mat.depthWrite,true);assert.equal(mat.transparent,false);assert(ocean.renderOrder>=.25);
 assert(U.z>0&&U.z<.2,'eased: '+U.z);step(60,5,3,0);assert.equal(U.z,1);assert.equal(U.x,5);assert.equal(U.y,3);assert.equal(WS.CLEAR_WIN_UNIFORMS.uClearWin.value,vec,'no new vector');
 assert.equal(group.visible,true);assert.equal(win.bed.position.x,0);assert.equal(win.bed.position.z,0);assert.equal(win.bed.position.y,UW.UW_SURFACE);
 step(1,12,3,0);assert.equal(win.bed.position.x,20,'re-snaps in 20 m steps');step(1,5,3,0);
});
const top=g=>{g.computeBoundingBox();return g.boundingBox.max.y;};
const each=(fn)=>{const M=new T.Matrix4(),P=new T.Vector3(),Q=new T.Quaternion(),S=new T.Vector3();for(const [kind,mesh] of Object.entries(win.meshes))for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,M);M.decompose(P,Q,S);fn(kind,P.clone(),S.clone(),mesh);}};
ok('coral + grass: capped, one InstancedMesh per kind, in the depth band, off land / rocks, under the surface',()=>{
 const st=win.stats;assert(st.formations>5&&st.formations<=CW.CLEAR_TIERS[0].cap,'formations '+st.formations);assert(st.grass>5&&st.grass<=CW.CLEAR_TIERS[0].grass,'grass '+st.grass);
 assert.equal(Object.keys(win.meshes).length,4);for(const m of Object.values(win.meshes))assert(m.isInstancedMesh&&m.instanceMatrix.count<=CW.CLEAR_REEF.grassCap);
 let n=0;each((kind,P,S,mesh)=>{n++;const d=field.distance(P.x,P.z),depth=UW.uwDepthAt(d,CW.CLEAR_BED.floor);assert(d>=1.5,'off the sand: '+d);assert(field.lift(P.x,P.z)<0,'not on the rock');
  const band=kind==='grass'?CW.CLEAR_REEF.grassDepth:CW.CLEAR_REEF.depth;assert(depth>=band[0]-1e-6&&depth<=band[1]+1e-6,'depth '+depth);
  assert(P.y+top(mesh.geometry)*S.y<UW.UW_SURFACE-.1,'under the surface ('+kind+')');assert(Math.hypot(P.x,P.z-0)<=CW.CLEAR_TIERS[0].win+16+1e-6);});
 assert.equal(n,win.stats.formations+win.stats.grass);
 const a=[];each((k,P)=>a.push(k+P.x.toFixed(2)+P.z.toFixed(2)));step(1,12,3,0);step(1,5,3,0);const b=[];each((k,P)=>b.push(k+P.x.toFixed(2)+P.z.toFixed(2)));assert.deepEqual(b,a,'seeded on the world grid: same coral after a re-snap');
});
ok('tier 2: coral only near the player, the window still open',()=>{
 step(2,5,3,2);assert.equal(win.open,true);assert.equal(win.stats.radius,CW.CLEAR_TIERS[2].win+16);assert(win.stats.formations<=CW.CLEAR_TIERS[2].cap&&win.stats.grass<=CW.CLEAR_TIERS[2].grass);assert.equal(win.stats.fish+win.stats.turtles+win.stats.jellies+win.stats.crabs,0,'no sea life at tier 2');
 step(2,5,3,1);assert(win.stats.formations<=CW.CLEAR_TIERS[1].cap);step(2,5,3,0);assert.equal(win.stats.radius,CW.CLEAR_TIERS[0].win+16);
});
ok('stable: moving the window never changes the coral, grass or creatures inside it (world-anchored)',()=>{
 const snapshot=(r)=>{const out=[];const M=new T.Matrix4(),P=new T.Vector3(),Q=new T.Quaternion(),S=new T.Vector3();
  for(const [kind,m] of Object.entries(win.meshes))for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.decompose(P,Q,S);if(Math.hypot(P.x-40,P.z)<=r)out.push(kind+P.x.toFixed(2)+','+P.z.toFixed(2)+','+S.x.toFixed(2));}
  for(const [kind,l] of Object.entries(win.life))for(let i=0;i<l.mesh.count;i++){l.mesh.getMatrixAt(i,M);P.setFromMatrixPosition(M);if(Math.hypot(P.x-40,P.z)<=r)out.push(kind+P.x.toFixed(2)+','+P.z.toFixed(2)+','+l.a.getX(i).toFixed(3));}
  return out.sort();};
 step(2,5,3,0);const a=snapshot(55);assert(a.length>10,'some content '+a.length);
 for(const z of [20,-25,40,-60]){step(2,5,z,0);}step(2,5,3,0);assert.deepEqual(snapshot(55),a,'same content in the same place after the window moved');
});
ok('sea life: per tier counts, in water, one mesh per kind, off at tier 2 and reduced motion, window radius by camera height, look point',()=>{
 step(2,5,3,0);const st=win.stats,L=CW.CLEAR_LIFE;assert(st.fish>0&&st.fish%L.fish.per===0&&st.fish<=L.fish.tier[0],'fish '+st.fish);assert(st.crabs>0&&st.crabs<=L.crab.tier[0]);assert(st.jellies<=L.jelly.tier[0]&&st.turtles<=L.turtle.tier[0]);
 assert.deepEqual(Object.keys(win.life),['fish','turtle','jelly','crab']);for(const l of Object.values(win.life))assert(l.mesh.isInstancedMesh&&l.mesh.count<=l.mesh.instanceMatrix.count);
 for(const [kind,l] of Object.entries(win.life))for(let i=0;i<l.mesh.count;i++){const M=new T.Matrix4(),P=new T.Vector3();l.mesh.getMatrixAt(i,M);P.setFromMatrixPosition(M);const d=field.distance(P.x,P.z),depth=UW.uwDepthAt(d,CW.CLEAR_BED.floor);if(kind==='crab')assert(depth>=L.crab.depth[0]-1e-6&&depth<=L.crab.depth[1]+1e-6,'crab depth '+depth);else assert(d>=L[kind].minD,kind+' home '+d);assert(Math.abs(P.y-UW.UW_SURFACE)<1e-5);}
 step(2,5,3,1);assert(win.stats.fish<=L.fish.tier[1]&&win.stats.crabs<=L.crab.tier[1]);step(2,5,3,2);assert.equal(win.stats.fish+win.stats.crabs+win.stats.jellies+win.stats.turtles,0);step(2,5,3,0);
 // The camera: a high camera looking down-ahead pulls the window centre toward the water point it sees (within the tier's reach).
 const cam=new T.PerspectiveCamera(40,1,1,500);cam.position.set(5,UW.UW_SURFACE+40,3);cam.lookAt(60,UW.UW_SURFACE,3);cam.updateMatrixWorld(true);
 for(let i=0;i<300;i++)win.update(1/60,5,3,0,false,cam);assert(win.stats.look[0]>20&&win.stats.look[0]<=5+CW.CLEAR_TIERS[0].reach+.01,'look '+win.stats.look[0]);assert.equal(U.w,CW.CLEAR_TIERS[0].win,'full radius high up');
 cam.position.set(5,UW.UW_SURFACE+3,3);cam.updateMatrixWorld(true);win.update(1/60,5,3,0,false,cam);assert(Math.abs(U.w-CW.CLEAR_TIERS[0].win*.7)<1e-6,'smaller radius with a low camera');
 for(let i=0;i<400;i++)win.update(1/60,5,3,0,false,null);
 // Gate off or still path: no creatures.
 WS.WATER_UNIFORMS.uWaterDetail.value=0;step(2,5,3,0);assert.equal(win.stats.fish+win.stats.crabs,0,'still path: none');WS.WATER_UNIFORMS.uWaterDetail.value=2;step(2,5,3,0);assert(win.stats.fish>0);
});
ok('exact restore: eased out at tier 4, then every flag back; shared with the swim disc',()=>{
 step(5,5,3,4);assert.equal(win.open,true,'eases out');step(60,5,3,4);assert.equal(win.open,false);assert.deepEqual(snap(),before);assert.equal(group.visible,false);assert.equal(U.z,0);
 const swim=SC.createSwimClear(scene);step(60,5,3,0);swim.update(1/60,5,3,0,1,1.6,-.42,1,null);assert.equal(win.open&&swim.open,true);
 step(60,5,3,4);assert.equal(win.open,false);assert.equal(mat.blending,T.CustomBlending,'the disc still holds the blend');assert(ocean.renderOrder>=.25);
 for(let i=0;i<60;i++)swim.update(1/60,5,3,0,0,1.6,-.42,1,null);assert.deepEqual(snap(),before);
 step(60,5,3,0);swim.update(1/60,5,3,0,1,1.6,-.42,1,null);for(let i=0;i<60;i++)swim.update(1/60,5,3,0,0,1.6,-.42,1,null);assert.equal(mat.blending,T.CustomBlending,'the window still holds it');
 win.dispose();swim.dispose();assert.deepEqual(snap(),before);assert.equal(scene.getObjectByName('clear-water-window'),undefined);
});
ok('shaders: the window runs only in the blended ocean program; seabed reads the island field; reef sways off the clock',()=>{
 const sh={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};mat.onBeforeCompile(sh);
 const i=sh.fragmentShader.indexOf('#ifndef OPAQUE\n    {float wm=clearWinMask');assert(i>0);assert.equal(sh.uniforms.uClearWin,WS.CLEAR_WIN_UNIFORMS.uClearWin);
 const s2=new T.Scene(),w2=CW.createClearWindow(s2,()=>field);
 const bed={uniforms:{},vertexShader:T.ShaderLib.lambert.vertexShader,fragmentShader:T.ShaderLib.lambert.fragmentShader};w2.bed.material.onBeforeCompile(bed);
 assert.match(bed.vertexShader,/isleSample\(wxz\)/);assert.match(bed.fragmentShader,/cwCaustic\(vCwPos\.xz\)/);assert(bed.uniforms.uIsleTex&&bed.uniforms.uWaterNoise.value);
 const reef={uniforms:{},vertexShader:T.ShaderLib.lambert.vertexShader,fragmentShader:T.ShaderLib.lambert.fragmentShader};w2.meshes.mound.material.onBeforeCompile(reef);
 assert.match(reef.vertexShader,/aSway\*vec2\(sin\(uWaterTime/);assert.notEqual(reef.uniforms.uUwShallow,UW.UW_UNIFORMS.uUwShallow,'own water look, not the last fishing theme');w2.dispose();
});
ok('no allocation per frame; Town wiring',()=>{
 const src=fs.readFileSync('lib/town/water/clearWindow.ts','utf8'),upd=src.slice(src.indexOf('update(dt:number'),src.indexOf('get strength'));
 assert(!/new |=\s*\[|\{\.\.\.|=>\s*\(\{|\.map\(|\.filter\(/.test(upd),'update() allocates');
 const sc=src.slice(src.indexOf('const scatter='),src.indexOf('const U=CLEAR_WIN'));assert(!/new |\.map\(|\.push\(/.test(sc),'scatter allocates');
 const town=fs.readFileSync('components/Town.tsx','utf8');assert.match(town,/clearWin\.update\(dt,player\.root\.position\.x,player\.root\.position\.z,heat\.tier\+\(quality\.phone&&heat\.tier>=2\?1:0\),WATER_UNIFORMS\.uShore\.value,camera\);swimClear\.hideBed=clearWin\.strength>0;/);
 assert.match(town,/swimClear\.dispose\(\);clearWin\.dispose\(\);/);
});
if(failed){console.log(`CLEAR_WINDOW_FAIL ${failed}`);process.exit(1);}
ok('reef boost round every shore fishing spot: a clear pool at the float, denser coral round it, a hue family each',()=>{
 const cat=load('lib/town/fishing/fishCatalog.ts'),R=CW.REEF_BOOST;
 for(const s of cat.FISH_SPOTS.filter(s=>!s.deep)){const b=s.buoy,lx=b.x-s.x,lz=b.z-s.z,l=Math.hypot(lx,lz),nx=-lz/l,nz=lx/l;
  assert(CW.reefBoostAt(b.x,b.z).clear,s.id+': nothing at the float');assert(CW.reefBoostAt(s.x+lx*.8+nx*3,s.z+lz*.8+nz*3).clear,s.id+': quick-cast stretch clear');
  const side=CW.reefBoostAt(b.x+nx*(R.core-1),b.z+nz*(R.core-1));assert(!side.clear&&side.b>.99,s.id+': full boost beside the pool');
  assert.equal(CW.reefBoostAt(b.x+nx*(R.R+30),b.z+nz*(R.R+30)).b,0,s.id+': normal density far off');}
});
console.log('CLEAR_WINDOW_PASS gated by tier / fishing / shallows, exact restore (shared with the swim disc), capped coral in the depth band, no allocation');
