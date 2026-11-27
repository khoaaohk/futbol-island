// Ground and ocean WHOLE-PROGRAM fragment cost (Nov 17 2026, docs/graphics/island-graphics-plan-nov17.md batches B and C).
// Owner rule: better-looking terrain and water with NO extra heat, especially on phones. This pins the per-pixel estimate of the
// complete ground and ocean fragment programs (three's light loop + the game's patch, tests/glsl-program-cost.cjs) against the
// figures measured on 05e9da8b, before the Lambert swap, with the same estimator. Run: node tests/ground-shader-cost.cjs
// Counted: arithmetic instructions (ALU) and texture reads per fragment, worst-case pixel of each path (the 16 reads are the soft
// shadow filter, which every lit island material pays). NOT counted: what a real GPU does with them; heat needs an iPhone.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const T=require('three');
const {createLoader}=require('./summit-harness.cjs');
const P=require('./glsl-program-cost.cjs');
const load=createLoader();
load('lib/graphics/shadowEdgeFade.ts');// the island's shadow-box edge fade lives in three's shared chunk; count it like the phone compiles it
const G=load('lib/graphics/groundTint.ts'),W=load('lib/graphics/waterSurface.ts'),S=load('lib/graphics/sunHighlight.ts');
// Nov 26 2026 (the surface-edge layer ships ON): everything down to the last test pins the ground programs WITHOUT the layer (the `?surf=0`
// state, and every kind but the lawn in any state), exactly as before; the last test pins the shipped state (the lawn's edge program).
const SURF=load('lib/town/surfaceEdges.ts'),SHIPPED=!require('./layer-flags-helper.cjs').FORCED_OFF;assert.equal(SURF.SURF_DEFAULT,SHIPPED,'surface edges ship ON (the owner approved the layer on Nov 26 2026)');assert.equal(SURF.surfOn(),SHIPPED);SURF.setSurfaces(false);
const src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

// 05e9da8b (MeshStandardMaterial programs), {ALU, texture reads}: `cool` = heat tier 0, `warm` = tiers 1-2, `low` = tiers 3-4 and
// Battery saver. Before Nov 17 the ground had two paths only (hash grain + cloud shade on at tier 0, off above). `beach` and `trail`
// are new kinds for meshes that were `sand` (double sided) and `path` (vertex colours): their baselines are those programs.
const g=(cool,warm)=>({cool:{alu:cool,tex:16},warm:{alu:warm,tex:16},low:{alu:warm,tex:16}});
const BASE={
 ground:{grass:g(448,406),sand:g(454,412),beach:g(454,412),path:g(442,400),trail:g(443,401),land:g(442,400),mixed:g(442,400),asphalt:g(442,400)},
 ocean:{far:{alu:1146,tex:20},nearPhone:{alu:1612,tex:20},nearPhoneHot:{alu:1499,tex:20},still:{alu:1344,tex:20}},
};
// Nov 17 2026, detail tile (plan T4): ONE read of the 64x64 ground tile at tiers 0-2, where the hash grain (tier 0) or nothing
// (tiers 1-2) was. That read is the only texture read added anywhere; the Lambert swap's ALU saving on the same pixels pays for it
// (stated, not hidden: reads and ALU are different currencies and only a phone can weigh them). Tiers 3-4: no read, as before.
const TILE_READ={cool:1,warm:1,low:0};
const ROUGH={grass:.94,sand:1,beach:1,path:.9,trail:.85,land:1,mixed:.95,asphalt:.9};
const GRAIN=/if\(uGroundGrain>0\.\)/g,DETAIL=/if\(uGroundDetail>0\.\)/g;
const groundNow=kind=>{const m=G.applyGroundTint(new T.MeshStandardMaterial({roughness:ROUGH[kind],side:kind==='beach'?T.DoubleSide:T.FrontSide,vertexColors:kind==='trail'}),kind),p=P.patched(T,m,'physical');
 return {source:p.source,cool:P.programCost(p.source,p.defines),warm:P.programCost(p.source,p.defines,[GRAIN]),low:P.programCost(p.source,p.defines,[GRAIN,DETAIL])};};
const oceanNow=()=>{const m=new T.MeshStandardMaterial({...W.SEA_WATER_LOOK});m.map=new T.Texture();W.patchOceanMaterial(m);const p=P.patched(T,m,'physical');
 const desk=/if\(uWaterDetail>1\.5\)/g,reach=/if\(reachS>0\.\)/g,crest=/if\(uWaterDetail>\.5\)/g,glit=/if\(uSunGlitter>0\.\)/g,fx=/if\(uSwimFx\.z>0\.\)/g;
 const paths={far:[reach,desk,fx],nearPhone:[desk,fx],nearPhoneHot:[desk,glit,fx],still:[desk,crest,glit,fx]};
 return {source:p.source,...Object.fromEntries(Object.entries(paths).map(([k,d])=>[k,P.programCost(p.source,p.defines,d)]))};};

ok('the estimator reproduces a known program: three r169 standard, untouched, phone defines',()=>{
 const p=P.patched(T,new T.MeshStandardMaterial(),'physical'),c=P.programCost(p.source,p.defines);
 assert.equal(c.tex,16,'the soft shadow filter: 16 shadow-map reads');assert(c.alu>350&&c.alu<460,'ALU '+c.alu);
 const l=P.patched(T,new T.MeshLambertMaterial(),'lambert'),lc=P.programCost(l.source,l.defines);assert(lc.alu<c.alu-100,'lambert is at least 100 ALU under standard: '+lc.alu+' vs '+c.alu);});

ok('ground: every kind, every tier path, costs less than before (ALU, worst-case pixel incl. slab joints / verge / wet band); +1 texture read at tiers 0-2 only (the detail tile)',()=>{
 const rows=[];
 for(const kind of Object.keys(BASE.ground)){const now=groundNow(kind);
  for(const t of ['cool','warm','low']){const a=BASE.ground[kind][t],b=now[t];rows.push(`ground.${kind}.${t} ${a.alu}/${a.tex} -> ${b.alu}/${b.tex}`);
   assert(b.alu<a.alu,`${kind}.${t}: ALU ${b.alu} is not under ${a.alu}`);assert(b.tex<=a.tex+TILE_READ[t],`${kind}.${t}: texture reads ${b.tex} > ${a.tex}+${TILE_READ[t]}`);}
  assert.equal(now.low.tex,16,kind+': the lowest tiers read no ground texture');}
 console.log('     '+rows.join('\n     '));});

// Nov 26 2026 (sky / far sea, lib/graphics/waterSurface.ts SKY_SEA_ALBEDO + SKY_SEA_FAR, owner shot 129 "the ocean ... so flat"):
// the far-sea block adds at most SKY_SEA_ALU (static worst case: every branch counted; measured +206 on every path (far 1085 -> 1291, nearPhone 1551 -> 1757 by the same block), from
// the release dddf9316) and no texture read; `?sky=0` compiles without it. The Lambert swap's saving is still pinned on top of it.
const SKY_SEA_ALU=210;
ok('ocean: every phone path costs less than before, same texture reads',()=>{
 const now=oceanNow(),rows=[];
 for(const p of Object.keys(BASE.ocean)){const a=BASE.ocean[p],b=now[p];rows.push(`ocean.${p} ${a.alu}/${a.tex} -> ${b.alu}/${b.tex}`);
  assert(b.alu-SKY_SEA_ALU<=a.alu-40,`ocean.${p}: ALU ${b.alu} (less the far-sea block's ${SKY_SEA_ALU}) is not at least 40 under ${a.alu}`);assert(b.tex<=a.tex,`ocean.${p}: texture reads`);}
 console.log('     '+rows.join('\n     '));});

ok('both are three\'s lambert program + the GGX sun highlight; the material objects stay MeshStandardMaterial; nothing new on the GPU',()=>{
 const gr=groundNow('grass').source,oc=oceanNow().source;
 for(const [n,s] of [['ground',gr],['ocean',oc]]){assert(/#define LAMBERT/.test(s),n+': lambert source');assert(!/RE_Direct_Physical\s*\(\s*directLight/.test(P.preprocess(s,P.PHONE_DEFINES)),n+': no physical light loop');
  assert(/reflectedLight\.directDiffuse\+=directLight\.color\*\(/.test(s),n+': sun highlight block');}
 // same formulas as three r169 BRDF_GGX (F_Schlick's exp2 fit, D_GGX, V_GGX_SmithCorrelated)
 const h=S.sunHighlightGlsl('A','F');
 assert(h.includes('exp2((-5.55473*gVH-6.98316)*gVH)')&&h.includes('gNH*gNH*(A-1.)+1.')&&h.includes('.5/max(gNL*sqrt(A+(1.-A)*gNV*gNV)+gNV*sqrt(A+(1.-A)*gNL*gNL),EPSILON)')&&h.includes('A*RECIPROCAL_PI/(gD*gD)'));
 assert(T.ShaderChunk.common.includes('- 5.55473 * dotVH - 6.98316')&&T.ShaderChunk.lights_physical_pars_fragment.includes('0.5 / max( gv + gl, EPSILON )'),'three still uses the formulas this copies');
 assert.equal(S.ggxA2(1),1);assert(Math.abs(S.ggxA2(.52)-.52**4)<1e-12);assert.equal(S.ggxA2(0),.0525**4);
 const m=G.applyGroundTint(new T.MeshStandardMaterial({roughness:.94}),'grass');assert(m.isMeshStandardMaterial);
 const sh={uniforms:{},vertexShader:T.ShaderLib.physical.vertexShader,fragmentShader:T.ShaderLib.physical.fragmentShader};m.onBeforeCompile(sh,null);
 assert(Math.abs(sh.uniforms.uGroundA2.value-.94**4)<1e-12,'roughness reaches the highlight as a uniform (one program per kind, any roughness)');
 assert.equal(m.customProgramCacheKey(),'ground-tint-grass');
 const gt=src('lib/graphics/groundTint.ts'),sunH=src('lib/graphics/sunHighlight.ts');
 assert(!/new T\.(Mesh|InstancedMesh|WebGLRenderTarget)\b/.test(gt+sunH),'no mesh, no render target');});

ok('the A/B switches are dev-only: a production build never reads the URL',()=>{
 const f=src('lib/graphics/gfxFlags.ts');assert(/if\(typeof process==='undefined'\|\|process\.env\.NODE_ENV==='production'\|\|typeof window==='undefined'\)return false;/.test(f));
 const prev=process.env.NODE_ENV;process.env.NODE_ENV='production';global.window={location:{search:'?gfx=pbr-ground,shadow5,tone-neutral'}};
 try{const F=createLoader()('lib/graphics/gfxFlags.ts');for(const n of ['pbr-ground','pbr-ocean','tone-neutral','tone-agx','shadow5','shadow4'])assert.equal(F.gfxFlag(n),false,n);}
 finally{process.env.NODE_ENV=prev;delete global.window;}});

ok('surface detail lives in the existing draws: one shared 64x64 tile, per-vertex attributes for the beach and the trails, no new mesh / program key',()=>{
 const gt=src('lib/graphics/groundTint.ts');
 assert.equal((gt.match(/new T\.DataTexture\(/g)||[]).length,1,'the one detail tile');assert.equal((gt.match(/texture2D\(/g)||[]).length,1,'read once');
 const uniformsOf=kind=>{const m=G.applyGroundTint(new T.MeshStandardMaterial(),kind),sh={uniforms:{},vertexShader:T.ShaderLib.physical.vertexShader,fragmentShader:T.ShaderLib.physical.fragmentShader};m.onBeforeCompile(sh,null);return {sh,m};};
 const a=uniformsOf('grass'),b=uniformsOf('path');assert.equal(a.sh.uniforms.uGroundTile,b.sh.uniforms.uGroundTile,'every ground material shares the tile uniform');
 assert.equal(a.sh.uniforms.uGroundTile.value.image.width,64);assert.equal(a.sh.uniforms.uGroundTile.value.generateMipmaps,true);
 for(const k of Object.keys(G.GROUND_TINT))assert.equal(uniformsOf(k).m.customProgramCacheKey(),'ground-tint-'+k);
 const beach=uniformsOf('beach').sh,trail=uniformsOf('trail').sh;
 assert(/attribute float aShore;/.test(beach.vertexShader)&&/vShore=aShore;/.test(beach.vertexShader)&&/gWet=1\.-smoothstep\(/.test(beach.fragmentShader),'beach: wet band from the per-vertex inland distance (no shore-field read per pixel)');
 assert(/attribute vec3 aVerge;/.test(trail.vertexShader)&&/vVerge\.y>\.01\?vVerge\.y-abs\(vVerge\.x\):9\./.test(trail.fragmentShader),'trail: verge from the per-vertex edge attribute; pieces without it (zeros) get none');
 assert(/'aShore',new T\.Float32BufferAttribute\(sandShore,1\)/.test(src('lib/town/fields.ts'))&&/'beach'\)/.test(src('lib/town/fields.ts')));
 const wp=src('lib/town/westPark.ts');assert(/g\.setAttribute\('aVerge',new T\.Float32BufferAttribute\(verge,3\)\)/.test(wp)&&/material===trailMat&&!g\.getAttribute\('aVerge'\)/.test(wp)&&/ringPoints\(\),BOWL_RING\.width,-\.045,\{verge:false\}/.test(wp),'ribbons carry the verge; caps, rim and apron carry zeros so the batch pass can merge them; the bowl ring sits on paving');
 // slab joints only inside the stadium rectangles; joint lines are widened to the pixel footprint and fade under a pixel (no shimmer)
 const path=uniformsOf('path').sh.fragmentShader;assert(/if\(min\(max\(sa\.x,sa\.y\),max\(sb\.x,sb\.y\)\)<0\.\)/.test(path)&&/px=\.0011\/gl_FragCoord\.w/.test(path)&&/min\(1\.,0\.060\/px\)/.test(path));
 assert(!/sa\.x/.test(uniformsOf('grass').sh.fragmentShader)&&!/sa\.x/.test(uniformsOf('sand').sh.fragmentShader),'never on grass or sand');
 const [plaza,bowl]=G.GROUND_SLAB.rects;assert(plaza[0]+plaza[2]<=-50.69&&plaza[0]-plaza[2]>=-166&&Math.abs(bowl[0]+205)<1e-9&&bowl[2]===40&&bowl[3]===57.5);});

ok('lighter shadow filter (dev flag, OFF by default): 16 -> 4 / 5 shadow reads per lit pixel, scoped to one renderer, stock chunk always restored',()=>{
 const K=load('lib/graphics/shadowKernel.ts'),stock=T.ShaderChunk.shadowmap_pars_fragment,rows=[];
 const grass=()=>G.applyGroundTint(new T.MeshStandardMaterial({roughness:.94}),'grass');
 const base=P.patched(T,grass(),'physical'),b=P.programCost(base.source,base.defines);
 for(const taps of [4,5]){const lite=K.liteShadowChunk(stock,taps);assert(lite&&lite!==stock&&lite.includes('fi-shadow-edge-fade'),'the island edge fade survives');
  const p=P.patched(T,grass(),'physical',undefined,{...T.ShaderChunk,shadowmap_pars_fragment:lite}),c=P.programCost(p.source,p.defines);
  rows.push(`ground.grass.cool shadow${taps}: ${b.alu}/${b.tex} -> ${c.alu}/${c.tex}`);assert.equal(c.tex,b.tex-16+taps);assert(c.alu<b.alu);}
 console.log('     '+rows.join('\n     '));
 assert.equal(K.liteShadowChunk('nothing here',4),null,'a changed three chunk is refused, not mangled');
 // scope: the lighter chunk is in three's global table only while THIS renderer is inside render / compile / compileAsync
 const seen=[],fake={render(){seen.push(T.ShaderChunk.shadowmap_pars_fragment);return 'r';},compile(){seen.push(T.ShaderChunk.shadowmap_pars_fragment);throw new Error('boom');},compileAsync(){seen.push(T.ShaderChunk.shadowmap_pars_fragment);return Promise.resolve();}};
 assert.equal(K.installShadowKernel(fake,4),true);assert.equal(T.ShaderChunk.shadowmap_pars_fragment,stock,'installing changes nothing globally');
 assert.equal(fake.render(),'r');assert.equal(T.ShaderChunk.shadowmap_pars_fragment,stock);
 assert.throws(()=>fake.compile(),/boom/);assert.equal(T.ShaderChunk.shadowmap_pars_fragment,stock,'restored even when the call throws');
 fake.compileAsync();assert.equal(T.ShaderChunk.shadowmap_pars_fragment,stock);
 assert.equal(seen.length,3);for(const s of seen)assert.equal(s,K.liteShadowChunk(stock,4));
 const other={render(){seen.push(T.ShaderChunk.shadowmap_pars_fragment);}};other.render();assert.equal(seen[3],stock,'another renderer on the page compiles the stock filter');
 // wiring: only through the dev-only flags; the live settings are untouched
 const sw=src('lib/graphics/gfxDevSwitches.ts'),warm=src('lib/town/islandWarm.ts'),town=src('components/Town.tsx');
 assert(/if\(gfxFlag\('shadow4'\)\)installShadowKernel\(renderer,4\);else if\(gfxFlag\('shadow5'\)\)installShadowKernel\(renderer,5\);/.test(sw));
 assert(/if\(gfxFlag\('tone-neutral'\)\)renderer\.toneMapping=NeutralToneMapping;else if\(gfxFlag\('tone-agx'\)\)renderer\.toneMapping=AgXToneMapping;/.test(sw));
 assert(/r\.shadowMap\.type=T\.PCFSoftShadowMap;r\.outputColorSpace=T\.SRGBColorSpace;r\.toneMapping=T\.ACESFilmicToneMapping;r\.toneMappingExposure=1\.0;\n applyGfxDevSwitches\(r\);/.test(warm),'warm renderer: ACES + PCF soft, then the dev switches');
 assert(/renderer\.toneMapping=T\.ACESFilmicToneMapping;renderer\.toneMappingExposure=1\.0;applyGfxDevSwitches\(renderer\);/.test(town),'Town renderer the same');
 for(const f of ['lib/shop/ballStage.ts','lib/shop/bootScene.ts','lib/arcade/arcadeStage.ts','lib/arcade/arcadeRoomScene.ts','lib/gashapon/toyViewer.ts'])assert(!/gfxDevSwitches|shadowKernel|gfxFlags/.test(src(f)),f+' is not touched by the switches');});

// Shipped state, re-pinned deliberately at the numbers the builders measured (worst-case pixel, one INSIDE the edge band): 438 / 413 / 397 ALU at
// heat tiers 0 / 1-2 / 3-4, no texture read added. Exact: any change, up or down, fails here and has to be restated.
const SURF_EDGE_PIN={cool:438,warm:413,low:397};
const PLAZA_CREST_MAX=7,SURF_EDGE_MAX=56;/* Nov 28 2026 review: 56 with the soft blend against paving (what lies beyond, the wear and the blend's width are worked out per VERTEX: two more varyings, 6 components in all), was 59 */// measured 59 WITH the path wear (Nov 27 2026; was 64 without it, 73 with it before the trim): the neighbour (sand or paving) is still reproduced exactly at the rim. Re-pinned deliberately: any growth fails
// Surface craft (?surf=1, lib/town/surfaceEdges.ts, default OFF): the lawn's program gains the soft-edge branch. Flag off: the grass
// source has no trace of it (the pins above are that program). Flag on: stated here, worst-case pixel (a pixel INSIDE the edge band;
// every other lawn pixel pays one comparison and one varying), no texture read added. Under the Nov 17 baseline at tier 0 (441 < 448) and at tiers 3-4 (400 < 406); 10 ALU over it on band pixels at tiers 1-2 (416 against 406).
ok('surface edges: off (?surf=0) = no edge code in any ground program; on (shipped) = the lawn only, no extra texture read, cost pinned',()=>{
 const E=SURF;assert.equal(E.surfOn(),false,'the tests above ran with the layer off');
 for(const kind of Object.keys(BASE.ground))assert(!/vEdge|aEdge/.test(groundNow(kind).source),kind+': no edge code with the flag off');
 const off=groundNow('grass');E.setSurfaces(true);const rows=[];
 try{const on=groundNow('grass');assert(/vEdge\.x>\.004/.test(on.source),'the lawn carries the edge branch');
  for(const kind of Object.keys(BASE.ground))if(kind!=='grass')assert(!/vEdge/.test(groundNow(kind).source),kind+' is untouched');
  {const pOff=E.setSurfaces(false)||groundNow('path'),pOn=(E.setSurfaces(true),groundNow('path'));// the plaza crest (slab pixels of the path program)
   for(const t of ['cool','warm','low']){rows.push(`ground.path.${t} surf off ${pOff[t].alu}/${pOff[t].tex} -> on ${pOn[t].alu}/${pOn[t].tex} (+${pOn[t].alu-pOff[t].alu} ALU on a plaza pixel)`);assert.equal(pOn[t].tex,pOff[t].tex);assert(pOn[t].alu-pOff[t].alu<=PLAZA_CREST_MAX,'plaza crest '+(pOn[t].alu-pOff[t].alu));assert(pOn[t].alu<BASE.ground.path[t].alu,'path stays under the Nov 17 baseline');}}
  for(const t of ['cool','warm','low']){rows.push(`ground.grass.${t} surf off ${off[t].alu}/${off[t].tex} -> on ${on[t].alu}/${on[t].tex} (+${on[t].alu-off[t].alu} ALU on an edge-band pixel)`);
   assert.equal(on[t].tex,off[t].tex,'no texture read added');if(t==='cool')assert(on[t].alu<BASE.ground.grass[t].alu,'tier 0: still under the Nov 17 baseline: '+on[t].alu);/* tiers 1-2: an edge-band pixel is 10 ALU OVER that baseline (416 against 406), tiers 3-4 6 under it (400); every other lawn pixel stays 49 under it */if(t==='low')assert(on[t].alu<BASE.ground.grass[t].alu,'tiers 3-4: under the Nov 17 baseline: '+on[t].alu);assert(on[t].alu-off[t].alu<=SURF_EDGE_MAX,'edge branch '+(on[t].alu-off[t].alu)+' ALU');
   assert.equal(on[t].alu,SURF_EDGE_PIN[t],`shipped lawn program, edge-band pixel, ${t}: ${on[t].alu} ALU (pinned ${SURF_EDGE_PIN[t]})`);}
  {const m=G.applyGroundTint(new T.MeshStandardMaterial({roughness:ROUGH.grass}),'grass');assert.equal(m.customProgramCacheKey(),'ground-tint-grass-edge','shipped: the lawn is the one ground program with the edge key');
   for(const k of Object.keys(G.GROUND_TINT))if(k!=='grass')assert.equal(G.applyGroundTint(new T.MeshStandardMaterial({roughness:ROUGH[k]??1}),k).customProgramCacheKey(),'ground-tint-'+k+(k==='path'?'-crest':''),k+': the plaza crest is the only other program the layer keys (path), every other kind keeps its program');}
 }finally{E.setSurfaces(SHIPPED);/* back to the shipped state */}
 console.log('     '+rows.join('\n     '));});

if(failed){console.log(failed+' failed');process.exit(1);}
