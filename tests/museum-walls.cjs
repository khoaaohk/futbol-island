// Museum walls that read as walls (Oct 14 2026, user: "fix this wall, it blends in and hard to tell it's a wall"; the wing's
// east wall seen from the hall had a −x face the floor's own grey and sliced the player behind it with its vertical edge).
// 1. Tones: every wall face renders clearly lighter (lit, cap) or darker (shaded) than the floor, with a darker rim and skirting;
//    the old gallery-white −x face did not (documents the bug).
// 2. Every wall in the plan is built with a skirting line and a floor contact-shadow band that lies on the floor.
// 3. Occlusion: from the default follow camera the reported spots really are hidden by a wall, and the cutaway removes every
//    wall fragment between the camera and the player's body there; walls behind the player, or far from them on screen, stay.
// 4. Heat: walls join the merged static / soft-shadow meshes (no new meshes or draws), the cutaway is two uniforms set in the
//    frame loop only (which still sleeps at rest), and the GLSL matches the CPU mirror.
// usage: node tests/museum-walls.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),T=require('three');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const W=require('../lib/museum/museumWalls.ts'),L=require('../lib/museum/museumLayout.ts');
const UP={x:0,y:1,z:0},WEST={x:-1,y:0,z:0},SOUTH={x:0,y:0,z:1},EAST={x:1,y:0,z:0},NORTH={x:0,y:0,z:-1};

// 1. Tones vs the floor.
{const floor=W.rendered(W.FLOOR_ALBEDO,UP),tone=k=>new T.Color(W.WALL_TONES[k]),L_=c=>W.luminance(c);
 const c=k=>W.contrast(tone(k),floor);
 assert.ok(L_(tone('lit'))>L_(floor)&&c('lit')>=1.15,`lit faces clearly lighter than the floor (${c('lit').toFixed(2)}:1)`);
 assert.ok(L_(tone('cap'))>L_(tone('lit')),'the top cap is the brightest');
 assert.ok(L_(tone('shade'))<L_(floor)&&c('shade')>=1.25,`shaded faces clearly darker than the floor (${c('shade').toFixed(2)}:1)`);
 assert.ok(W.contrast(tone('rim'),tone('cap'))>=3&&W.contrast(tone('rim'),tone('shade'))>=1.8,'a crisp rim against the cap and the shaded face');
 assert.ok(L_(tone('skirt'))<L_(floor)&&W.contrast(tone('skirt'),floor)>=1.5&&W.contrast(tone('skirt'),tone('lit'))>=1.8,'a darker skirting line at the foot');
 assert.equal(W.toneFor(UP),'cap');assert.equal(W.toneFor(SOUTH),'lit');for(const n of [WEST,EAST,NORTH])assert.equal(W.toneFor(n),'shade');
 // The baked vertex colour lands on the target tone whatever the face's lighting.
 for(const n of [UP,WEST,SOUTH,EAST,NORTH])for(const k of ['cap','lit','shade','rim','skirt']){const a=W.faceAlbedo(W.WALL_TONES[k],n),e=W.faceIrradiance(n),t=new T.Color(W.WALL_TONES[k]);
  assert.ok(Math.abs(a.r*e.r-t.r)<1e-6&&Math.abs(a.g*e.g-t.g)<1e-6&&Math.abs(a.b*e.b-t.b)<1e-6,k+' round-trips');}
 // Before: gallery white #f7f5f0 everywhere; its −x face (the long face the camera sees on the wing's east wall) matched the floor.
 const old=W.contrast(W.rendered('#f7f5f0',WEST),floor);assert.ok(old<1.05,`the old −x face was the floor's tone (${old.toFixed(3)}:1)`);
 console.log(`PASS tones: lit ${c('lit').toFixed(2)}:1 lighter, shaded ${c('shade').toFixed(2)}:1 darker than the floor (was ${old.toFixed(2)}:1), cap brightest, rim and skirting lines`);}

// 2. The wall list.
const walls=W.museumWalls();
{const ids=walls.map(w=>w.id);
 for(const id of ['back','wing-west','hall-east','west-north','west-south','lintel','partition-west','partition-east','wing-partition','sill-west','sill-east','sill-wing'])assert.ok(ids.includes(id),'wall '+id);
 assert.equal(new Set(ids).size,ids.length,'no wall built twice');
 const inside=(x,z)=>(x>=L.WING.x0-1e-6&&x<=L.WING.x1+1e-6&&z>=-L.ROOM.halfD-1e-6&&z<=L.WING.z1+1e-6)||(x>=L.WING.x1-1e-6&&x<=L.ROOM.halfW+1e-6&&z>=-L.ROOM.halfD-1e-6&&z<=L.ROOM.halfD+1e-6);
 for(const w of walls){
  if(w.id==='lintel'){assert.ok(!w.skirt&&!w.ao.length&&w.y0>2,'the lintel floats: no skirting, no floor band');continue;}
  assert.ok(w.skirt&&w.ao.length,w.id+': skirting and a contact-shadow band');assert.equal(w.y0,0);
  for(const a of w.ao){const alongX=a.side[1]==='z',s=a.side[0]==='+'?1:-1,face=alongX?w.z+s*w.d/2:w.x+s*w.w/2,out=face+s*W.AO_WIDTH*.5;
   for(const t of [a.a+.01,(a.a+a.b)/2,a.b-.01]){const [x,z]=alongX?[t,out]:[out,t];assert.ok(inside(x,z),`${w.id} ${a.side}: band on the floor at ${x.toFixed(2)},${z.toFixed(2)}`);}}}
 // The walls match the collision plan (the west stubs, both partitions and the wing's).
 const obs=L.museumObstacles(),covered=w=>obs.some(o=>o.minX<=w.x-w.w/2+.05&&o.maxX>=w.x+w.w/2-.05&&o.minZ<=w.z-w.d/2+.05&&o.maxZ>=w.z+w.d/2-.05);
 for(const id of ['west-north','partition-west','partition-east','wing-partition'])assert.ok(covered(walls.find(w=>w.id===id)),id+' is solid');
 console.log(`PASS walls: ${walls.length} walls, every standing one with skirting and a floor band (${walls.reduce((n,w)=>n+w.ao.length,0)} bands)`);}

// 3. Occlusion from the default follow camera (orthographic: only its direction matters), and the cutaway.
{const camYaw=-.36,offset=new T.Vector3(Math.sin(camYaw)*12.5,10.8-.6,Math.cos(camYaw)*12.5),toCam=offset.clone().normalize();
 const boxes=walls.map(w=>({id:w.id,b:new T.Box3(new T.Vector3(w.x-w.w/2-W.LIP,w.y0,w.z-w.d/2-W.LIP),new T.Vector3(w.x+w.w/2+W.LIP,w.y0+w.h+.002,w.z+w.d/2+W.LIP))}));
 /** The follow camera over a player at (px, pz), and the cutaway's uniforms as the frame loop sets them. */
 const view=(px,pz,on=true)=>{const c=new T.OrthographicCamera(-8,8,6,-6,.1,80);c.position.set(px,.6,pz).add(offset);c.lookAt(px,.6,pz);c.updateMatrixWorld();
  const u=W.cutUniforms();W.updateCut(u,on,px,pz,c);return {u,keep:(p,n)=>W.cutKeep(u,p,p.clone().applyMatrix4(c.matrixWorldInverse),n)};};
 /** A box's face normal at a point on its surface. */
 const normalAt=(b,p)=>{const e=1e-4;return p.x<=b.min.x+e?{x:-1,y:0,z:0}:p.x>=b.max.x-e?{x:1,y:0,z:0}:p.z<=b.min.z+e?{x:0,y:0,z:-1}:p.z>=b.max.z-e?{x:0,y:0,z:1}:p.y>=b.max.y-e?{x:0,y:1,z:0}:{x:0,y:-1,z:0};};
 const ray=new T.Ray(),hit=new T.Vector3(),far=new T.Vector3();
 /** For points over the player's body: is a wall between it and the camera, and does the cutaway clear all of it? */
 function probe(px,pz){const {keep}=view(px,pz);let hidden=0,kept=0;const ids=new Set();
  for(const y of [.05,.4,.8,1.2,1.5])for(const dx of [-.2,0,.2])for(const dz of [-.2,0,.2]){const p=new T.Vector3(px+dx,y,pz+dz);ray.set(p,toCam);
   for(const {id,b} of boxes){if(!ray.intersectBox(b,hit))continue;hidden++;ids.add(id);
    // The face the camera sees on this line of sight: where it leaves the box toward the camera (the face it enters by points
    // away from the camera and is back-face culled).
    new T.Ray(hit.clone().addScaledVector(toCam,40),toCam.clone().negate()).intersectBox(b,far);const n=normalAt(b,far);
    assert.ok(n.x*toCam.x+n.y*toCam.y+n.z*toCam.z>0);kept=Math.max(kept,keep(far,n));}}
  return {hidden,kept,walls:[...ids]};}
 const spots=[['the report: the hall side of the wing’s east wall (Hall of Fame)',-11.55,6.9,'west-south'],['the same wall further in',-11.55,5.9,'west-south'],
  ['the north stub',-11.5,-6.6,'west-north'],['behind the kit-wall partition',-6,-.75,'partition-west'],['behind the wing partition',-18,-2.2,'wing-partition']];
 for(const [name,px,pz,wall] of spots){assert.ok(!L.museumBlocked(px,pz,L.museumObstacles()),name+': a spot you can stand on');const r=probe(px,pz);
  assert.ok(r.hidden>0&&r.walls.includes(wall),`${name}: ${wall} stands between the camera and the player (${r.walls})`);
  assert.equal(r.kept,0,`${name}: the cutaway clears every wall fragment in front of the body`);}
 // Never cut: walls behind the player, however tall (the back wall, the partition from the front, the east wall), checked over a
 // grid of their faces round the player.
 const grid=(fn)=>{let max=1;for(let a=-1.5;a<=1.5;a+=.1)for(let y=0;y<=3.6;y+=.1)max=Math.min(max,fn(a,y));return max;};
 {const {keep}=view(0,-7.4);assert.equal(grid((a,y)=>Math.min(keep(new T.Vector3(a,y,-8),{x:0,y:0,z:1}),keep(new T.Vector3(a,3.6,-8-a/10),{x:0,y:1,z:0}))),1,'the back wall behind a player standing against it stays');}
 {const {keep}=view(-6,.45);assert.equal(grid((a,y)=>y>1.5?1:keep(new T.Vector3(-6+a,y,.12),{x:0,y:0,z:1})),1,'the partition behind a player in front of it stays');}
 {const {keep}=view(11.4,0);assert.equal(grid((a,y)=>keep(new T.Vector3(11.99,y,a),{x:-1,y:0,z:0})),1,'the hall’s east wall behind the player stays');}
 {const {keep}=view(-11.55,6.9);
  assert.ok(keep(new T.Vector3(-11.88,1,7.6),{x:-1,y:0,z:0})<1,'in front, near the player: cut');assert.equal(keep(new T.Vector3(-11.88,1,10.5),{x:-1,y:0,z:0}),1,'the rest of the wall stays (a small hole only)');
  assert.equal(view(-11.55,6.9,false).keep(new T.Vector3(-11.88,1,7.6),{x:-1,y:0,z:0}),1,'cut off (the player hidden, e.g. zoomed): nothing removed');}
 // The dither ring: the kept fraction rises smoothly from the inner radius to the edge, solidly open inside.
 {const u=W.cutUniforms();u.uCutOn.value=1;u.uCutDir.value.set(0,1);let prev=-1;
  for(let r=0;r<=1.0001;r+=.05){const k=W.cutKeep(u,{x:0,y:1,z:1},{x:r*W.CUT.rx,y:0},{x:0,y:0,z:1});assert.ok(k>=prev);prev=k;}
  assert.equal(W.cutKeep(u,{x:0,y:1,z:1},{x:.5*W.CUT.rx,y:0},{x:0,y:0,z:1}),0);assert.equal(W.cutKeep(u,{x:0,y:1,z:1},{x:W.CUT.rx,y:0},{x:0,y:0,z:1}),1);
  assert.equal(W.cutKeep(u,{x:0,y:1,z:1},{x:0,y:0},{x:0,y:0,z:-1}),1,'a face the player stands in front of is never cut');}
 console.log(`PASS occlusion: ${spots.length} spots hidden behind a wall from the follow camera are fully cut away; walls behind or away from the player stay`);}

// 4. Heat and wiring.
{const scene=read('lib/museum/museumScene.ts'),src=read('lib/museum/museumWalls.ts');
 assert.ok(!/new T\.(Mesh|InstancedMesh)|requestAnimationFrame|setInterval|setTimeout/.test(src),'museumWalls makes no meshes and runs no loop');
 assert.match(scene,/for\(const s of museumWalls\(\)\)\{/,'the scene builds every wall from the list');
 assert.match(scene,/function wallBox\([^]*?boxes\.push\(g\);\}/,'wall boxes join the merged static mesh');assert.match(scene,/function aoBand\([^]*?shades\.push\(g\);\}/,'floor bands join the soft-shadow mesh');
 assert.match(scene,/const staticMesh=new T\.Mesh\(mergeGeometries\(boxes,false\)!,wallMat\)/,'one static mesh, now with the cutaway material');
 assert.match(scene,/addCutaway\(wallMat,cut\);addCutaway\(printMat,cut\)/,'walls and the prints hung on them share the two uniforms');
 // The uniforms are written inside tick (the loop that only runs while something moves) and nowhere else.
 const tick=scene.slice(scene.indexOf('function tick('),scene.indexOf('renderer.render(scene,camera);draws++'));
 assert.match(tick,/updateCut\(cut,player\.root\.visible,x,z,camera\);/,'updated in the frame loop, right before the render');
 assert.equal((scene.match(/updateCut\(|cut\.uCut/g)||[]).length,1,'and nowhere else');
 assert.match(scene,/if\(settle>0\|\|leaving\)frame=requestAnimationFrame\(tick\);else/,'the loop still sleeps at rest');
 for(const v of [W.CUT.rx,W.CUT.ry,W.CUT.inner,W.CUT.margin])assert.ok(W.CUT_GLSL.includes(v.toFixed(3)),'GLSL uses CUT '+v);
 assert.match(W.CUT_GLSL,/dot\(vCutN,vec3\(uCutPlayer\.x,[.\d]+,uCutPlayer\.y\)-vCutWorld\)<0\./,'only faces the player is behind');assert.match(W.CUT_GLSL,/dot\(vCutWorld\.xz-uCutPlayer,uCutDir\)>/,'only fragments on the camera\'s side of the player');
 // The patched shader compiles into the materials' own chunks (no extra pass).
 const mat=new T.MeshLambertMaterial({vertexColors:true}),u=W.cutUniforms();W.addCutaway(mat,u);
 const sh={uniforms:{},vertexShader:T.ShaderLib.lambert.vertexShader,fragmentShader:T.ShaderLib.lambert.fragmentShader};mat.onBeforeCompile(sh);
 assert.ok(sh.vertexShader.includes('vCutView=mvPosition.xyz')&&sh.fragmentShader.includes('discard')&&sh.uniforms.uCutCentre===u.uCutCentre,'Lambert patched');
 const bsh={uniforms:{},vertexShader:T.ShaderLib.basic.vertexShader,fragmentShader:T.ShaderLib.basic.fragmentShader};
 const bm=new T.MeshBasicMaterial();W.addCutaway(bm,u);bm.onBeforeCompile(bsh);assert.ok(bsh.vertexShader.includes('vCutView=mvPosition.xyz')&&bsh.fragmentShader.includes('discard'),'Basic patched');
 console.log('PASS heat: walls merged into the existing static and soft-shadow meshes, cutaway = 4 uniforms set only while the loop runs');}
