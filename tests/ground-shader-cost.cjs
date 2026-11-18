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
const src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

// 05e9da8b (MeshStandardMaterial programs), {ALU, texture reads}: `cool` = heat tier 0, `warm` = tiers 1-2, `low` = tiers 3-4 and
// Battery saver. Before Nov 17 the ground had two paths only (grain + cloud shade on at tier 0, off above).
const g=(cool,warm)=>({cool:{alu:cool,tex:16},warm:{alu:warm,tex:16},low:{alu:warm,tex:16}});
const BASE={
 ground:{grass:g(448,406),sand:g(454,412),path:g(442,400),land:g(442,400),mixed:g(442,400),asphalt:g(442,400)},
 ocean:{far:{alu:1146,tex:20},nearPhone:{alu:1612,tex:20},nearPhoneHot:{alu:1499,tex:20},still:{alu:1344,tex:20}},
};
const ROUGH={grass:.94,sand:1,path:.9,land:1,mixed:.95,asphalt:.9};
const GRAIN=/if\(uGroundGrain>0\.\)/g,DETAIL=/if\(uGroundDetail>0\.\)/g;
const groundNow=kind=>{const m=G.applyGroundTint(new T.MeshStandardMaterial({roughness:ROUGH[kind]}),kind),p=P.patched(T,m,'physical');
 return {source:p.source,cool:P.programCost(p.source,p.defines),warm:P.programCost(p.source,p.defines,[GRAIN]),low:P.programCost(p.source,p.defines,[GRAIN,DETAIL])};};
const oceanNow=()=>{const m=new T.MeshStandardMaterial({...W.SEA_WATER_LOOK});m.map=new T.Texture();W.patchOceanMaterial(m);const p=P.patched(T,m,'physical');
 const desk=/if\(uWaterDetail>1\.5\)/g,reach=/if\(reachS>0\.\)/g,crest=/if\(uWaterDetail>\.5\)/g,glit=/if\(uSunGlitter>0\.\)/g,fx=/if\(uSwimFx\.z>0\.\)/g;
 const paths={far:[reach,desk,fx],nearPhone:[desk,fx],nearPhoneHot:[desk,glit,fx],still:[desk,crest,glit,fx]};
 return {source:p.source,...Object.fromEntries(Object.entries(paths).map(([k,d])=>[k,P.programCost(p.source,p.defines,d)]))};};

ok('the estimator reproduces a known program: three r169 standard, untouched, phone defines',()=>{
 const p=P.patched(T,new T.MeshStandardMaterial(),'physical'),c=P.programCost(p.source,p.defines);
 assert.equal(c.tex,16,'the soft shadow filter: 16 shadow-map reads');assert(c.alu>350&&c.alu<460,'ALU '+c.alu);
 const l=P.patched(T,new T.MeshLambertMaterial(),'lambert'),lc=P.programCost(l.source,l.defines);assert(lc.alu<c.alu-100,'lambert is at least 100 ALU under standard: '+lc.alu+' vs '+c.alu);});

ok('ground: every kind, every tier path, costs less than before (ALU) and reads no more textures than its allowance',()=>{
 const rows=[];
 for(const kind of Object.keys(BASE.ground)){const now=groundNow(kind);
  for(const t of ['cool','warm','low']){const a=BASE.ground[kind][t],b=now[t];rows.push(`ground.${kind}.${t} ${a.alu}/${a.tex} -> ${b.alu}/${b.tex}`);
   assert(b.alu<=a.alu-40,`${kind}.${t}: ALU ${b.alu} is not at least 40 under ${a.alu}`);assert(b.tex<=a.tex,`${kind}.${t}: texture reads ${b.tex} > ${a.tex}`);}}
 console.log('     '+rows.join('\n     '));});

ok('ocean: every phone path costs less than before, same texture reads',()=>{
 const now=oceanNow(),rows=[];
 for(const p of Object.keys(BASE.ocean)){const a=BASE.ocean[p],b=now[p];rows.push(`ocean.${p} ${a.alu}/${a.tex} -> ${b.alu}/${b.tex}`);
  assert(b.alu<=a.alu-40,`ocean.${p}: ALU ${b.alu} is not at least 40 under ${a.alu}`);assert(b.tex<=a.tex,`ocean.${p}: texture reads`);}
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

if(failed){console.log(failed+' failed');process.exit(1);}
