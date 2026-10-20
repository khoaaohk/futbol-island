// Swimmer clear disc (Oct 19 2026, docs/water-look-research.md §4 phase 1, docs/performance-guide.md "Swimmer clear disc"):
// the ocean only blends (and only reads the disc uniform) while a swim pose is up, and every render-state flag is restored
// exactly when the swim fades out; the seabed quad shows only then; the bean underwater look is a per-material uniform gate
// (0 = no-op for every other character); the swim depth constants stay pinned. Run: node tests/swim-clear.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const T=require('three');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const WS=load('lib/graphics/waterSurface.ts'),SC=load('lib/graphics/swimClear.ts');

const scene=new T.Scene(),mat=new T.MeshStandardMaterial();WS.patchOceanMaterial(mat);
const ocean=new T.Mesh(new T.PlaneGeometry(1,1),mat);ocean.name='surrounding-ocean';scene.add(ocean);
const snap=()=>({blendSrcAlpha:mat.blendSrcAlpha,blendDstAlpha:mat.blendDstAlpha,blendEquationAlpha:mat.blendEquationAlpha,blending:mat.blending,blendSrc:mat.blendSrc,blendDst:mat.blendDst,blendEquation:mat.blendEquation,depthWrite:mat.depthWrite,transparent:mat.transparent,renderOrder:ocean.renderOrder});
const before=snap();
const clear=SC.createSwimClear(scene),bed=scene.getObjectByName('swim-seabed');
const part={material:{beanUniforms:{beanUnder:{value:0}}}},body=[part],U=WS.SWIM_CLEAR_UNIFORMS,xz=U.uSwimXZ.value;
const step=(w,n=1,dt=1/60)=>{for(let i=0;i<n;i++)clear.update(dt,10,-4,.3,w,1.6,-.43,1,body);};

ok('off: nothing changes while nobody swims',()=>{
 step(0,30);assert.deepEqual(snap(),before);assert.equal(bed.visible,false);assert.equal(U.uSwimClear.value,0);assert.equal(part.material.beanUniforms.beanUnder.value,0);assert.equal(clear.open,false);
});
ok('on: blended, depth kept, late order, seabed under the swimmer, body tinted, eased in',()=>{
 step(1,3);assert.equal(clear.open,true);assert.equal(mat.blending,T.CustomBlending);assert.equal(mat.blendSrc,T.SrcAlphaFactor);assert.equal(mat.blendDst,T.OneMinusSrcAlphaFactor);assert.equal(mat.blendSrcAlpha,T.ZeroFactor);assert.equal(mat.blendDstAlpha,T.OneFactor,'the canvas alpha stays 1');
 assert.equal(mat.depthWrite,true,'keeps writing depth: under-surface sprites stay hidden');assert.equal(mat.transparent,false,'stays in the opaque list');assert(ocean.renderOrder>=.25);
 assert(U.uSwimClear.value>0&&U.uSwimClear.value<.5,'eased, not snapped: '+U.uSwimClear.value);
 assert.equal(bed.visible,true);assert(Math.abs(bed.position.x-10)<1e-9&&Math.abs(bed.position.z+4)<1e-9);assert(bed.position.y<=-.43-1.55+1e-9,'the bed sits under the legs');
 step(1,40);assert.equal(U.uSwimClear.value,1);assert.equal(part.material.beanUniforms.beanUnder.value,1);assert.equal(U.uSwimXZ.value,xz,'no new vector per frame');
});
ok('exit: eased out, then every flag restored exactly and the bed hidden',()=>{
 step(0,5);assert.equal(clear.open,true,'still fading');assert(U.uSwimClear.value>0&&U.uSwimClear.value<1);
 step(0,40);assert.deepEqual(snap(),before);assert.equal(clear.open,false);assert.equal(bed.visible,false);assert.equal(U.uSwimClear.value,0);assert.equal(part.material.beanUniforms.beanUnder.value,0);
 // Re-entry works the same way and dispose restores mid-swim.
 step(1,10);assert.equal(clear.open,true);clear.dispose();assert.deepEqual(snap(),before);assert.equal(part.material.beanUniforms.beanUnder.value,0);assert.equal(scene.getObjectByName('swim-seabed'),undefined);
});
ok('shaders: the disc runs only in the blended ocean program; the bean gate is a uniform, per material',()=>{
 const sh={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};mat.onBeforeCompile(sh);
 assert.match(sh.fragmentShader,/#ifndef OPAQUE\n[\s\S]*diffuseColor\.a=min\(swimClearAlpha\(vWaterXZ,d\),clearWinAlpha\(wm,clearWinD\(vWaterXZ,d\)\)\);\n\s*diffuseColor\.a\+=\(1\.-diffuseColor\.a\)\*min\(waterStreak\*\.2,\.25\)\*\(1\.-uSwimClear\*[^\n]*\);\}\n\s*#endif\n[\s\S]*#ifdef OPAQUE\n\s*outgoingLight\+=waterGlim;\n\s*#else\n[^\n]*diffuseColor\.a=a2;\}\n\s*#endif\n\s*#include <opaque_fragment>/);
 // Surface glimmer (Oct 19 2026): ALU light streaks + glitter accent (no texture read), last, coloured by the sun light.
 {const g=WS.WATER_GLIMMER_GLSL;assert(!/texture2D|texture\(/.test(g),'glimmer: no texture reads');assert.match(g,/directionalLights\[0\]\.color/);assert.match(g,/if\(uWaterDetail<\.5\)return vec3\(0\.\);/,'still path: no glitter');assert.match(sh.fragmentShader,/waterStreak=st\*reachS\*[^;]*\(uWaterDetail<\.5\?\.55:1\.\);/,'still path: faint static streaks');assert(!/texture2D\(map,p[12]/.test(sh.fragmentShader)&&/waterRibbon\(mat2/.test(sh.fragmentShader),'streaks: ALU ribbons, no texture read');assert(!/waterGlint|totalEmissiveRadiance\+=/.test(sh.fragmentShader),'the old ripple-crossing glint is gone');}
 assert.equal(sh.uniforms.uSwimClear,U.uSwimClear);assert.equal(mat.customProgramCacheKey(),'island-ocean-water-v8');
 // Diving in deep water clears the disc further (0.86 -> 0.36), one more float uniform.
 assert.match(sh.fragmentShader,/mix\(0\.86,0\.36,uSwimDive\)/);assert.equal(sh.uniforms.uSwimDive,U.uSwimDive);
 const B=load('lib/graphics/beanSkin.ts'),m1=new B.BeanMaterial('body'),m2=m1.clone();
 assert.equal(m1.beanUniforms.beanUnder.value,0);assert.notEqual(m1.beanUniforms.beanUnder,m2.beanUniforms.beanUnder,'a clone (batches) never shares the gate');
 const bs={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};m1.onBeforeCompile(bs);
 assert.match(bs.fragmentShader,/if\(beanUnder>0\.\)\{/);assert.match(bs.vertexShader,/vBeanW=\(modelMatrix\*beanWp\)\.xyz;/);assert.equal(bs.uniforms.beanUnder,m1.beanUniforms.beanUnder);
});
ok('swim depth: root raised to 1.0, pinned to the pose water line; Town wiring',()=>{
 const W=load('lib/town/water/waterDepth.ts'),P=load('lib/graphics/swimPose.ts');
 assert.equal(W.SWIM_ROOT_DEPTH,1);assert.equal(P.WATER_LINE,W.SWIM_ROOT_DEPTH);
 const pose=fs.readFileSync('lib/graphics/swimPose.ts','utf8');assert.doesNotMatch(pose,/target\[P_Y\]=(1\.0|\.9)\b/,'pelvis heights are relative to WATER_LINE');
 const town=fs.readFileSync('components/Town.tsx','utf8');assert.match(town,/swimClear\.update\(dt,player\.root\.position\.x,player\.root\.position\.z,player\.root\.rotation\.y,water\.inWater\?water\.pose\.w:0,waterProbe\.depth,WATER_LEVEL,SWIM_ROOT_DEPTH(?:\+water\.state\.dive)?,beanSkinOf\(player\)\?\.meshes\?\?null(?:,water\.state\.under)?\);/);
 assert.match(town,/return\(\)=>\{idleInput\.abort\(\);swimClear\.dispose\(\);/);
 const src=fs.readFileSync('lib/graphics/swimClear.ts','utf8'),upd=src.slice(src.indexOf('update(dt'),src.indexOf('get strength'));assert(!/new |=\s*\[|\{\.\.\.|=>\s*\(\{/.test(upd),'update() allocates');
});
ok('dive: the disc clears early in the descent (head first is still seen), and the camera centres the diver on the view axis',()=>{
 const c=SC.createSwimClear(new T.Scene());U.uSwimDive.value=0;for(let i=0;i<60;i++)c.update(1/60,0,0,0,1,1.6,-.43,1,null,1/SC.SWIM_DIVE_CLEAR);
 assert(U.uSwimDive.value>.97,'full dive clear a third of the way under: '+U.uSwimDive.value);c.dispose();
 const town=fs.readFileSync('components/Town.tsx','utf8');assert(!/camTarget\.y-=water\.state\.dive/.test(town),'the root already carries the camera down: no second drop');
 assert.match(town,/camTarget\.x\+=\(visualLocation\.x\+16\*hy-camTarget\.x\)\*u;camTarget\.z\+=\(visualLocation\.z\+33\*hy-camTarget\.z\)\*u;/);
});
ok('dive near Summit Isle (user, Oct 20 2026: "when diving near the shore, the player is not in view"): the summit camera reads the water line, not the diver',()=>{
 const SI=load('lib/town/summitIsle.ts'),WD=load('lib/town/water/waterDepth.ts');
 for(const [x,z] of [[560,10],[602,-11],[742,10]]){
  const deep={...SI.summitCameraFrame(x,z,WD.SWIM_ROOT_Y-1.6,x+16,20,z+33)},line={...SI.summitCameraFrame(x,z,WD.WATER_LEVEL,x+16,20,z+33)};
  assert(deep.lift>1,'the diver root reads the sea as hill (the old bug): '+JSON.stringify(deep));assert.equal(line.lift,0,'from the water line no rise at '+x+','+z);assert.equal(line.pull,1);}
 const town=fs.readFileSync('components/Town.tsx','utf8');
 assert.match(town,/summitCamera\.update\(visualLocation\.x,visualLocation\.z,water\.inWater\?Math\.max\(groundY,WATER_LEVEL\):groundY,/,'Town passes the water line in the sea');
});

if(failed){console.log(`SWIM_CLEAR_FAIL ${failed}`);process.exit(1);}
console.log('SWIM_CLEAR_PASS disc gated by swim weight, exact restore on exit, seabed quad only while swimming, bean gate per material, root 1.0');
