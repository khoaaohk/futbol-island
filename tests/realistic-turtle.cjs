// Realistic sea turtle (Oct 21 2026, user: "turtles need to be more realistic"; lib/graphics/seaTurtle.ts): triangle budget per LOD
// band, proportions, instance caps, one draw per scene (the LOD is picked per instance in the shader), animation in the vertex shader
// only (no new per-frame matrix writes), heat switches (low band at tier 2+, still at tier 3-4 / Battery saver / reduced motion).
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let passed=0;const ok=(name,fn)=>{try{fn();passed++;console.log('ok  ',name);}catch(e){console.error('FAIL',name);throw e;}};
const mem=new Map();G.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
const S=load('lib/graphics/seaTurtle.ts');
const tris=g=>(g.index?g.index.count:g.getAttribute('position').count)/3;
const fake=()=>({uniforms:{},vertexShader:'#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>\n#include <project_vertex>',fragmentShader:'#include <common>\n#include <color_fragment>\n#include <emissivemap_fragment>\n#include <opaque_fragment>\n#include <fog_fragment>'});

ok('triangle budget per LOD band: full ≤ 450, low ~150, far silhouette ≤ 40, the friend ≤ 340; one geometry holds the three bands',()=>{
 const n={};for(const d of ['full','mid','low','far']){const g=S.seaTurtleBand(d);n[d]=tris(g);assert(!g.index&&g.getAttribute('color')&&g.getAttribute('aTw'),d+': non-indexed, vertex colours, aTw');g.dispose();}
 assert(n.full<=450&&n.full>=380,'full '+n.full);assert(n.low>=120&&n.low<=180,'low '+n.low);assert(n.far<=40,'far '+n.far);assert(n.mid>=60&&n.mid<=340,'mid '+n.mid);
 const g=S.seaTurtleGeometry(),tw=g.getAttribute('aTw');assert.equal(tris(g),n.full+n.low+n.far);
 const band=[0,0,0];for(let i=0;i<tw.count;i++)band[tw.getW(i)]++;assert.deepEqual(band.map(v=>v/3),[n.full,n.low,n.far],'bands tagged in aTw.w');
 for(let i=0;i<tw.count;i++)assert(tw.getX(i)>=1&&tw.getX(i)<=5,'every vertex has a part');
 console.log(`     triangles: full ${n.full}, low ${n.low}, far ${n.far}, friend ${n.mid}`);g.dispose();});

ok('proportions: head ~15% of the shell, front flippers ~70%, hind shorter, shell ~0.75 as wide as long; room shell 0.9-1.0 m',()=>{
 const P=S.seaTurtleProportions(),sh=P.shell;
 assert(P.head/sh>=.13&&P.head/sh<=.2,'head '+P.head/sh);assert(P.front/sh>=.65&&P.front/sh<=.75,'front '+P.front/sh);assert(P.hind<P.front*.6,'hind shorter');assert(P.shellWidth/sh>=.68&&P.shellWidth/sh<=.85,'width '+P.shellWidth/sh);
 // Measured on the full band: the front blade reaches ~its length from the shoulder; the beak tip leads the skull.
 const g=S.seaTurtleBand('full'),p=g.getAttribute('position'),tw=g.getAttribute('aTw');let reach=0,headMin=0,shellMin=0,shellMax=0;
 for(let i=0;i<p.count;i++){const part=tw.getX(i),x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  if(part===2)reach=Math.max(reach,Math.hypot(x+.17,y+.02,Math.abs(z)-.19));if(part===4)headMin=Math.min(headMin,x);if(part===1){shellMin=Math.min(shellMin,x);shellMax=Math.max(shellMax,x);}}
 assert(Math.abs((shellMax-shellMin)-sh)<.04,'shell length '+(shellMax-shellMin));assert(reach/sh>=.62&&reach/sh<=.8,'front reach '+reach/sh);assert(Math.abs(-headMin-.437)<.005,'beak tip');
 const room=read('lib/graphics/diveRoom.ts').match(/seed:i,scale:1\.5\+r\(\)\*([\d.]+)\}\)\),'turtle',seaTurtleModel/);assert(room,'room turtle scale');
 const lo=sh*1.5,hi=sh*(1.5+ +room[1]);assert(lo>=.9&&hi<=1.05,'room shell '+lo.toFixed(2)+'-'+hi.toFixed(2)+' m');g.dispose();});

ok('normals face out (smooth within each part), and other creatures carry aTw zeros (shared material: untouched)',()=>{
 for(const d of ['full','low','far']){const g=S.seaTurtleBand(d),p=g.getAttribute('position').array,n=g.getAttribute('normal').array;let bad=0;
  for(let i=0;i<p.length;i+=9){const u=[p[i+3]-p[i],p[i+4]-p[i+1],p[i+5]-p[i+2]],v=[p[i+6]-p[i],p[i+7]-p[i+1],p[i+8]-p[i+2]],f=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
   if(f[0]*(n[i]+n[i+3]+n[i+6])+f[1]*(n[i+1]+n[i+4]+n[i+7])+f[2]*(n[i+2]+n[i+5]+n[i+8])<0)bad++;}
  assert(bad<=p.length/9*.03,d+': '+bad+' faces against their normals');g.dispose();}
 const CC=load('lib/town/water/clearCreatures.ts');for(const k of ['fish','jelly','crab']){const g=CC.creatureGeometry(k),a=g.getAttribute('aTw');assert(a&&a.array.every(v=>v===0),k+' aTw zeros');g.dispose();}
 const t=CC.creatureGeometry('turtle');assert(t.getAttribute('aTw')&&t.getAttribute('aW'),'the clear-window turtle is the sea turtle');t.dispose();});

ok('the shader library: stPose (stroke / glide / trim / head / body) and stKeep (LOD per instance); heat controls',()=>{
 const gl=S.SEA_TURTLE_GLSL;for(const s of ['attribute vec4 aTw','void stPose(','float stKeep(','fract(t*.25+ph)','14.0','40.0'])assert(gl.includes(s),s);
 assert.deepEqual({...S.seaTurtleControls(0,false)},{anim:1,minLod:0});assert.deepEqual({...S.seaTurtleControls(2,false)},{anim:1,minLod:1});
 assert.equal(S.seaTurtleControls(3,false).anim,0);assert.equal(S.seaTurtleControls(4,false).anim,0);assert.equal(S.seaTurtleControls(0,true).anim,0);
 const m=S.seaTurtleModel({lite:true,still:true});assert.deepEqual(m.turtle.uniforms.uStCtl.value.toArray(),[0,1]);assert.equal(m.anim.amp,0,'no fish wag');m.geometry.dispose();
 const f=S.seaTurtleModel();assert.deepEqual(f.turtle.uniforms.uStCtl.value.toArray(),[1,0]);f.geometry.dispose();});

ok('Explore room (Turtle Pool): ONE turtle draw (4 instances), posed in its shader; Shelly is in the pickups draw; lite / calm switch the controls',()=>{
 const D=load('lib/town/water/diveSpots.ts'),J=load('lib/town/water/diveJourney.ts'),R=load('lib/graphics/diveRoom.ts'),z=D.DIVE_SPOTS.find(s=>s.id==='turtle-pool');
 const room=R.createDiveRoom(z,{phone:false,reduced:false,found:[],pickups:J.journeyPickups(z),friend:{kind:'turtle',x:0,y:1,z:0}});
 const turtles=[];room.scene.traverse(o=>{if(o.name==='dive-fish-turtle')turtles.push(o);});assert.equal(turtles.length,1,'one turtle mesh');
 const g=turtles[0].geometry;assert(g.instanceCount<=4&&g.instanceCount>=1,'instances '+g.instanceCount);assert(g.getAttribute('aTw'),'aTw copied');
 const sh=fake();turtles[0].material.onBeforeCompile(sh);assert(sh.vertexShader.includes('stPose(stP,stN,dvT')&&sh.vertexShader.includes('stKeep(distance(cameraPosition,dvP)'),'posed in the fish shader');
 assert.equal(sh.uniforms.uStCtl.value.x,1);assert.equal(turtles[0].material.customProgramCacheKey(),'dive-fish-v3-turtle');assert.equal(turtles[0].material.map,null,'no texture');
 const fishSh=fake();let other=null;room.scene.traverse(o=>{if(!other&&o.name.startsWith('dive-fish-')&&o.name!=='dive-fish-turtle')other=o;});other.material.onBeforeCompile(fishSh);
 assert(!fishSh.vertexShader.includes('stPose')&&fishSh.vertexShader.includes('vec3 stP=position,stN=normal;'),'other fish: unchanged maths');
 const st=room.stats();console.log('     Turtle Pool room (desktop): draws '+st.draws+', triangles '+st.triangles);room.dispose();
 const calm=R.createDiveRoom(z,{phone:true,reduced:false,found:[],lite:true,calm:true});let t=null;calm.scene.traverse(o=>{if(o.name==='dive-fish-turtle')t=o;});
 const s2=fake();t.material.onBeforeCompile(s2);assert.deepEqual(s2.uniforms.uStCtl.value.toArray(),[0,1],'lite: low band; calm: still');calm.dispose();
 let n=0;for(const q of R.friendParts('turtle')){n+=tris(q.g);assert(q.g.userData.paint,'keeps its paint');}assert(n<=340,'friend '+n);
 assert.equal(R.friendParts('turtle').filter(q=>q.limb===1).length,1,'front flippers wave');});

ok('zone life and the clear window: one turtle draw each, the same library, no new per-frame matrix writes',()=>{
 const Z=load('lib/graphics/zoneLife.ts'),scene=new T.Scene(),zl=Z.createZoneLife(scene,{phone:false});const m=zl.meshes.turtle;
 assert(m.isInstancedMesh&&m.instanceMatrix.count<=8,'cap '+m.instanceMatrix.count);let n=0;scene.traverse(o=>{if(o.name==='zone-life-turtle')n++;});assert.equal(n,1);
 const sh=fake();m.material.onBeforeCompile(sh);assert(sh.vertexShader.includes('stPose(stP,objectNormal,uStTime')&&sh.vertexShader.includes('gl_InstanceID'),'zone life posed per instance');zl.dispose();
 const CW=load('lib/town/water/clearWindow.ts');assert(CW.CLEAR_LIFE.turtle.max<=3);const mt=CW.underMaterial('turtle',{}),s2=fake();mt.onBeforeCompile(s2);
 assert(s2.vertexShader.includes('stPose(stP,objectNormal,uWaterTime')&&s2.vertexShader.includes('stKeep(distance(cameraPosition.xz'),'clear window posed');
 const s3=fake();CW.underMaterial('fish',{}).onBeforeCompile(s3);assert(!s3.vertexShader.includes('stPose'),'fish untouched');
 // Shader-only animation: the turtle code writes no matrices; zoneLife still writes ONE matrix per creature in place(); the room's frame never touches turtles.
 const src=read('lib/graphics/seaTurtle.ts');assert(!/setMatrixAt|instanceMatrix\.needsUpdate|requestAnimationFrame/.test(src));
 const zs=read('lib/graphics/zoneLife.ts'),place=zs.slice(zs.indexOf('function place('),zs.indexOf('function update('));assert.equal((place.match(/setMatrixAt/g)||[]).length,1);
 const ds=read('lib/graphics/diveRoom.ts'),frame=ds.slice(ds.indexOf('  frame(t:number'));assert(!/turtle/i.test(frame.slice(0,frame.indexOf('\n  },')>0?frame.indexOf('\n  },'):4000)),'room frame: no turtle work');});

console.log(`realistic-turtle: ${passed} passed`);
