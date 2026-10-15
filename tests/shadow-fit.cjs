// Sun shadow fit (Oct 14 2026, Summit Isle report "weird shading that cuts off": a tree shadow ended on a long straight diagonal).
// The old fit assumed flat ground at y = 0 and pinned the sun target to y = 0, so on Summit Isle (ground 0–55 m) the shadow box was
// ~310 m wide and still missed the sides of the view. lib/graphics/islandShadows.ts createIslandShadowFit now fits what the camera
// sees, terrain heights included. This test checks, at the main island, Coral Cay, Summit Isle's slopes and top, and the jetpack
// cruise, for phone / desktop / ultrawide views:
//  1. every visible ground point within the reach (and 10 m above it) lies inside the shadow box, OUTSIDE its edge-fade band, and
//     between near and far; casters 40 m above the ground stay in front of far and behind near;
//  2. flat-ground views keep the old texel density (box no bigger than the old fit), the summit's box is far smaller than before;
//  3. as the camera moves the box centre stays on whole texels and the box size holds still (no shimmer);
//  4. the shadow edge fades softly (shader chunk patched, installed before the warm-up compile) and Town uses the fit.
const assert=require('node:assert/strict'),fs=require('node:fs'),T=require('three');
const {createLoader,browser}=require('./summit-harness.cjs');browser();
const load=createLoader();
const S=load('lib/graphics/islandShadows.ts'),F=load('lib/graphics/shadowEdgeFade.ts');
const ground=S.islandGroundForShadows,FADE=F.SHADOW_EDGE_FADE;

function walkCamera(px,pz,aspect,above=0){
 const g=ground(px,pz),cam=new T.PerspectiveCamera(40,aspect,1,500);
 cam.position.set(px+18,23+g+above,pz+30);cam.lookAt(cam.position.x-16,cam.position.y-23,cam.position.z-33);cam.updateMatrixWorld();return cam;
}
function rig(mapSize=2048){const scene=new T.Scene(),light=new T.DirectionalLight();light.shadow.mapSize.set(mapSize,mapSize);scene.add(light,light.target);return {scene,light,fit:S.createIslandShadowFit(light)};}
function coverage(cam,light,scene,label){
 scene.updateMatrixWorld(true);light.shadow.updateMatrices(light);const c=light.shadow.camera,ray=new T.Vector3(),p=new T.Vector3(),q=new T.Vector3();let n=0;
 for(let i=0;i<=16;i++)for(let j=0;j<=16;j++){
  ray.set(-1+i/8,-1+j/8,.5).unproject(cam).sub(cam.position).normalize();let t=0,hit=false;
  for(;t<=S.SHADOW_REACH;t+=.5){p.copy(cam.position).addScaledVector(ray,t);if(p.y<=ground(p.x,p.z)){hit=true;break;}}
  if(!hit)continue;// past the reach shadows fade out by design (never cut)
  for(const h of [0,10]){q.set(p.x,p.y+h,p.z).project(c);n++;
   assert.ok(Math.abs(q.x)<=1-2*FADE&&Math.abs(q.y)<=1-2*FADE,`${label}: visible ground at ${p.x.toFixed(0)},${p.y.toFixed(0)},${p.z.toFixed(0)} (+${h}) in the fade band or outside: ${q.x.toFixed(3)},${q.y.toFixed(3)}`);
   assert.ok(q.z>=-1&&q.z<=1,`${label}: receiver depth outside near/far (${q.z.toFixed(3)})`);}
  // a caster 40 m above this ground point (a tall tree or tower up-sun, the flying player) is still drawn into the map
  q.set(p.x,p.y+40,p.z).project(c);assert.ok(q.z>=-1&&q.z<=1,`${label}: caster 40 m above the ground clipped by near/far (${q.z.toFixed(3)})`);
 }
 assert.ok(n>40,`${label}: too few visible ground samples (${n})`);return c;
}

// 1. Coverage at every place and screen shape.
const PLACES={'main square':[95,-30],'coral cay':[612,-150],'summit kick post':[645.5,135],'summit terrace':[632,118],'summit slope south':[660,160],
 'summit slope west':[600,110],'summit slope east':[680,130],'summit beach':[700,200]};
const ASPECTS={phone:390/844,desktop:1440/900,ultrawide:2.4};
const boxes={};
for(const [place,[x,z]] of Object.entries(PLACES))for(const [shape,aspect] of Object.entries(ASPECTS))for(const above of [0,28]){
 const label=`${place} ${shape}${above?' jetpack cruise':''}`,cam=walkCamera(x,z,aspect,above),{scene,light,fit}=rig();fit.update(cam);
 const c=coverage(cam,light,scene,label);boxes[label]={w:c.right-c.left,h:c.top-c.bottom};
 assert.ok(Math.abs(light.shadow.normalBias-2*Math.max(c.right-c.left,c.top-c.bottom)/2048)<1e-9,`${label}: normal bias is 2 texels`);
}
// 2. Texel density: flat ground no worse than the old fit (phone 115 × 49 m, desktop 122 × 98 m); Summit Isle's top far tighter than
// the old 307–330 m wide box (which still clipped the view's sides).
for(const place of ['main square','coral cay']){
 assert.ok(boxes[place+' phone'].w<=118&&boxes[place+' phone'].h<=50,`${place} phone box ${JSON.stringify(boxes[place+' phone'])}`);
 assert.ok(boxes[place+' desktop'].w<=126&&boxes[place+' desktop'].h<=98,`${place} desktop box ${JSON.stringify(boxes[place+' desktop'])}`);}
for(const shape of ['phone','desktop'])assert.ok(boxes['summit kick post '+shape].w<=.7*(shape==='phone'?307:330),`summit ${shape} box ${JSON.stringify(boxes['summit kick post '+shape])}`);

// 3. Moving camera: walk the summit trail and the square; the centre stays on whole texels, the size holds still between refits,
// and every frame still covers the view.
for(const [label,path] of [['square walk',[[60,-40],[130,-20]]],['summit climb',[[690,190],[645,135]]]]){
 const {scene,light,fit}=rig(1024);let sizes=new Set(),frames=0;const right=S.sunBasis().right,up=S.sunBasis().up;
 for(let k=0;k<=120;k++){const s=k/120,x=path[0][0]+(path[1][0]-path[0][0])*s,z=path[0][1]+(path[1][1]-path[0][1])*s;
  const cam=walkCamera(x,z,390/844);fit.update(cam);frames++;const c=light.shadow.camera;sizes.add(c.right+'x'+c.top);
  const texel=(c.right-c.left)/1024,tx=light.target.position.dot(right)/texel,ty=light.target.position.dot(up)/((c.top-c.bottom)/1024);
  assert.ok(Math.abs(tx-Math.round(tx))<1e-6&&Math.abs(ty-Math.round(ty))<1e-6,`${label}: target off the texel grid (${tx}, ${ty})`);
  assert.ok(light.position.distanceTo(light.target.position)>400,'sun stays far up-sun of its target');
  if(k%10===0)coverage(cam,light,scene,`${label} frame ${k}`);}
 assert.ok(sizes.size<=(label==='square walk'?1:12),`${label}: box resized ${sizes.size} times over ${frames} frames`);
}
// A still camera does not refit (idle frames cost a few dot products).
{const {fit}=rig(),cam=walkCamera(95,-30,1.6);fit.update(cam);const r=fit.stats.refits;for(let i=0;i<10;i++)fit.update(cam);assert.equal(fit.stats.refits,r,'still camera: no refit');}

// 4. Soft edge instead of a hard cut; installed before any shader compiles; Town wiring.
{const chunk=T.ShaderChunk.shadowmap_pars_fragment;assert.match(chunk,/fi-shadow-edge-fade/);assert.ok(chunk.includes(`smoothstep( 0.0, ${FADE.toFixed(3)}, shadowEdge )`),"edge fade smoothstep");
 assert.equal(chunk.split('fi-shadow-edge-fade').length,2,'patched once');assert.equal(F.installShadowEdgeFade(),true,'idempotent');
 assert.equal(T.ShaderChunk.shadowmap_pars_fragment.split('fi-shadow-edge-fade').length,2,'still patched once');
 const read=p=>fs.readFileSync(p,'utf8');
 assert.match(read('lib/town/islandWarm.ts'),/import '@\/lib\/graphics\/shadowEdgeFade';/,'the warm-up compile sees the patched chunk');
 assert.match(read('lib/graphics/islandShadows.ts'),/from '\.\/shadowEdgeFade'/);
 const town=read('components/Town.tsx');assert.match(town,/const islandShadowFit=createIslandShadowFit\(sun\);/);assert.match(town,/else islandShadowFit\.update\(camera\);/);
 assert.doesNotMatch(town,/fitIslandShadows/,'the flat-ground fit is gone');}
console.log('Shadow fit: view coverage incl. terrain heights (main island, Coral Cay, Summit slopes/top, jetpack), texel snapping, soft edge fade passed.');
