// DRIP FC Stadium (Nov 13 2026, owner): the big screen's back face (posts under the frame; a throttled broadcast feed only near a
// live match with the back face in view, the static card otherwise) and Stadium Plaza's waving, kickable national flags.
// usage: node tests/stadium-feed-flags.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}},store=new Map();
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:()=>{},removeEventListener:()=>{},matchMedia:()=>({matches:false})},requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(id.slice(2)+'.ts'):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(path.resolve(base,f),'utf8');
const F=load('lib/town/stadiumFeed.ts'),W=load('lib/town/stadiumWorld.ts'),Q=load('lib/town/stadiumSeats.ts'),L=load('lib/town/westParkLayout.ts'),H=load('lib/graphics/heatTier.ts');
const S=L.STADIUM;

// 1. The posts meet the frame from below and stay inside its depth: they never cross the front or the back face.
{const fz=S.z+Q.SCREEN.z,bottom=Q.SCREEN.y-F.SCREEN_FRAME.h/2;
 for(const p of W.screenPosts()){
  assert(Math.abs(p.top-bottom)<1e-9,'post top = the frame underside');
  assert(p.z-W.SCREEN_POST.r>fz-F.SCREEN_FRAME.depth/2&&p.z+W.SCREEN_POST.r<fz+F.SCREEN_FRAME.depth/2,'post inside the frame depth (front and back faces clear)');
  assert(Math.abs(p.x-S.x)+W.SCREEN_POST.r<F.SCREEN_FRAME.w/2,'post under the frame');}
 assert(F.BACK_FACE.z>fz+F.SCREEN_FRAME.depth/2&&F.BACK_FACE.z-(fz+F.SCREEN_FRAME.depth/2)<.05,'the back picture just proud of the back face');
 assert(/screenPosts\(\)\[sx<0\?0:1\];skip\(cylinder\(SCREEN_POST\.r,p\.top/.test(src('lib/town/stadiumWorld.ts')),'stadiumWorld builds the posts from screenPosts()');}

// 2. Feed gates: off far away, card unless live and near, card at the lowest tier; throttled to 7 / 4 fps.
{assert.equal(F.feedMode({dc:300,live:true,tier:0}),'off');
 assert.equal(F.feedMode({dc:50,live:false,tier:0}),'card');assert.equal(F.feedMode({dc:F.FEED_RADIUS+5,live:true,tier:0}),'card');
 assert.equal(F.feedMode({dc:50,live:true,tier:H.LOWEST_TIER}),'card','Battery saver / hottest tier: the static card');
 assert.equal(F.feedMode({dc:50,live:true,tier:1}),'feed');
 assert(Math.abs(F.feedInterval(false,0)-1000/7)<1e-9&&F.feedInterval(true,0)===250&&F.feedInterval(false,2)===250,'7 fps desktop, 4 fps phones / hot');
 assert(F.FEED_SIZE.w*F.FEED_SIZE.h<=256*144,'low-res target');}

// 3. The feed itself, with a counting renderer: renders only near + live + back face in view, at the throttled rate, hides the
//    crowd, the front screen and itself while it draws, reuses the shadow map, and disposes its target.
{const parent=new T.Group(),renders=[];let rt=null;const disposed=[];
 const renderer={shadowMap:{autoUpdate:true,needsUpdate:true},getRenderTarget:()=>rt,setRenderTarget:t=>{rt=t;},
  render:(scene,cam)=>{renders.push({target:rt,cam,auto:renderer.shadowMap.autoUpdate,needs:renderer.shadowMap.needsUpdate,crowd:crowd.visible,front:front.visible,self:feed.mesh.visible});}};
 const crowd=new T.Object3D(),front=new T.Object3D(),scene=new T.Scene();
 const feed=F.createStadiumFeed(parent,{phone:false});
 const behind=new T.PerspectiveCamera(60,16/9,.5,500);behind.position.set(S.x,8,F.BACK_FACE.z+40);behind.lookAt(S.x,F.BACK_FACE.y,F.BACK_FACE.z);behind.updateMatrixWorld();
 const away=behind.clone();away.lookAt(S.x,8,F.BACK_FACE.z+200);away.updateMatrixWorld();
 const pitch=new T.PerspectiveCamera(60,16/9,.5,500);pitch.position.set(S.x,10,S.z);pitch.lookAt(S.x,F.BACK_FACE.y,F.BACK_FACE.z);pitch.updateMatrixWorld();
 const ball={x:S.x+3,z:S.z-10},up=(cam,t,dc=60,b=ball,tier=0)=>feed.update(renderer,scene,cam,t,dc,b,tier,[crowd,front]);
 assert.equal(up(behind,0,300),false);assert.equal(feed.mesh,null,'far away: nothing built');
 up(behind,0,60,null);assert.equal(feed.showing,'card');assert.equal(renders.length,0,'no match: the card, no render');
 up(pitch,10);assert.equal(renders.length,0,'seen from the pitch side (front): no feed render');
 up(away,20);assert.equal(renders.length,0,'back face out of the frustum: no feed render');
 assert.equal(up(behind,100),true);assert.equal(renders.length,1,'near + live + in view: one render');
 const r0=renders[0];assert(r0.target&&r0.target.width===256&&r0.target.height===144,'into the 256 x 144 target');
 assert(r0.cam!==behind&&r0.cam.far===F.FEED_FAR,'the broadcast camera, short far plane');
 assert(!r0.crowd&&!r0.front&&!r0.self,'crowd, front screen and the back face hidden while it renders (no recursion)');
 assert(!r0.auto&&!r0.needs,'no shadow pass for the feed');
 assert(crowd.visible&&front.visible&&feed.mesh.visible&&renderer.shadowMap.autoUpdate&&renderer.shadowMap.needsUpdate&&rt===null,'all restored after');
 assert.equal(feed.mesh.material.map,feed.target.texture,'the back face shows the feed');
 for(let t=110;t<1100;t+=10)up(behind,t);
 assert(renders.length>=7&&renders.length<=8,'about 7 renders a second, not every frame: '+renders.length);
 up(behind,2000,60,ball,H.LOWEST_TIER);assert.equal(feed.showing,'card','lowest tier: back to the card');
 const n=renders.length;up(behind,3000,60,null);assert.equal(renders.length,n);assert.equal(feed.showing,'card','match over: the card');
 const phone=F.createStadiumFeed(parent,{phone:true}),pr=renders.length;for(let t=0;t<1000;t+=10)phone.update(renderer,scene,behind,t,60,ball,0,[]);
 assert.equal(renders.length-pr,4,'phones: 4 renders a second');
 const tgt=feed.target;tgt.addEventListener('dispose',()=>disposed.push('rt'));feed.dispose();phone.dispose();
 assert.deepEqual(disposed,['rt'],'teardown disposes the render target');assert(!parent.children.some(o=>o.name==='stadium-screen-back'),'meshes removed');
 const sit=src('lib/town/stadiumSit.ts'),town=src('components/Town.tsx');
 assert(/feed\.update\(renderer,scene,camera,nowMs,dc,live\?ball:null,tier,\[screen\.mesh,crowd\.mesh\]\)/.test(sit),'stadiumSit feeds dc, the live ball and the hide list');
 assert(/stadiumSit\.feed\(renderer,scene,camera,now,heat\.tier\);[^\n]*\n\s*if\(meTumble/.test(town),'Town calls it right before the main render');
 assert(/disposers\.add\(\(\)=>stadiumSit\.dispose\(\)\)/.test(town),'and disposes it');}

// 4. Plaza flags: the twelve nations, alternating, never two alike side by side or across the walk.
const PF=load('lib/town/plazaFlags.ts');
{const order=[...PF.plazaFlagOrder(14)],poles=Q.plazaFlagPoles();
 assert.equal(poles.length,14);
 assert.deepEqual([...PF.PLAZA_NATIONS],['brazil','argentina','france','germany','spain','england','italy','portugal','netherlands','mexico','usa','japan','uruguay']);
 assert.deepEqual(order,['usa','brazil','france','spain','italy','netherlands','brazil','japan','argentina','germany','england','portugal','mexico','uruguay']);
 assert.equal(new Set(order).size,13,'all thirteen fly');assert.equal(order.filter(n=>n==='argentina').length,1,'Argentina once');
 assert(poles[0].x<poles[1].x&&poles[7].x<poles[8].x,'pole 0 on each side is the west (stadium gate) end');assert.deepEqual([order[0],order[7]],['usa','japan'],'the US and Japan at the front by the stadium');
 for(let i=0;i<7;i++){assert.notEqual(order[i],order[i+7],'across the walk '+i);if(i<6){assert.notEqual(order[i],order[i+1],'north side '+i);assert.notEqual(order[i+7],order[i+8],'south side '+i);}}
 // Each flag draws its own cell; the US gets stripes and a canton, England a cross, Japan a disc.
 const log=[],rec=new Proxy({},{get:(t,k)=>k in t?t[k]:(...a)=>log.push([k,...a]),set:(t,k,v)=>{t[k]=v;return true;}});
 PF.drawNationFlag(rec,'usa',0,0,128,80);assert(log.filter(k=>k[0]==='fillRect').length>=14&&log.filter(k=>k[0]==='arc').length>=20,'US: 13 stripes + canton, stars');
 const cells=PF.PLAZA_NATIONS.map(PF.flagCell);for(const c of cells)assert(c.x+c.w<=PF.FLAG_CANVAS.w&&c.y+c.h<=PF.FLAG_CANVAS.h&&!(c.y<292&&c.y+c.h>276&&c.x<320&&c.x+c.w>256),'cells inside the canvas, clear of the solid patches');}

// 5. The flags in the built town: one mesh, waving shader, 'flag' prop specs on its own buffer; the old box flags are gone.
{const world=load('lib/town/world.ts').buildTown(new T.Scene()),scene=world.dynamicScenery.parent,fl=world.plazaFlags;
 const meshes=[];scene.traverse(o=>{if(o.name==='plaza-flags')meshes.push(o);});assert.equal(meshes.length,1,'one flag mesh');
 const m=meshes[0];assert(m.userData.ownDraw&&!m.castShadow&&m.material.map===fl.texture,'own single draw, one texture, no shadow');
 assert.equal(m.geometry.getAttribute('position').count,fl.perFlag*14);
 const flagSpecs=world.propSpecs.filter(s=>s.parts.some(p=>p.attribute===m.geometry.getAttribute('position')));
 assert.equal(flagSpecs.length,14);assert(flagSpecs.every(s=>s.kind==='flag'),'they sway like flags');
 assert(!/flagColours/.test(src('lib/town/westPark.ts')),'the old team-colour box flags are gone');
 // The shader: per-flag phase + flutter, pinned at the hoist.
 const sh={uniforms:{},vertexShader:'#include <common>\n#include <beginnormal_vertex>\n#include <begin_vertex>'};m.material.onBeforeCompile(sh);
 assert(/uniform float uKick\[14\]/.test(sh.vertexShader)&&/aFlag\*1\.7/.test(sh.vertexShader)&&/transformed\.z\+=fWave/.test(sh.vertexShader),'wave wired');
 assert.equal(sh.uniforms.uKick.value,fl.kick);assert.equal(Math.abs(PF.waveOffset(0,3,2,1)),0,'hoist edge stays on the pole');assert.equal(PF.waveOffset(-1,3,2,1),0,'poles never wave');
 assert(Math.abs(PF.waveOffset(1,0,0,1))!==Math.abs(PF.waveOffset(1,0,1,1)),'per-flag phase');
 // Wave clock + flutter: no work while calm; react kicks the nearest flag and decays to zero.
 fl.update(.1);assert(fl.uniforms.uTime.value>0);const t0=fl.uniforms.uTime.value;fl.update(.1,true);assert.equal(fl.uniforms.uTime.value,t0,'reduced motion: still');
 const ku=fl.stats.kickUpdates;fl.update(.1);assert.equal(fl.stats.kickUpdates,ku,'idle: no flutter work');
 const p3=fl.poles[3];assert.equal(fl.react(p3.x+.2,p3.z,14),3);assert(fl.kick[3]>.9);assert.equal(fl.react(p3.x,p3.z,14,true),-1,'reduced: no flutter');
 for(let i=0;i<40;i++)fl.update(.05);assert.equal(fl.kick[3],0,'flutter ends');
 // Walking into a pole: once per contact, again after stepping away; nothing off the plaza.
 assert.equal(fl.bump(0,0),-1);assert.equal(fl.bump(p3.x+.4,p3.z),3);assert.equal(fl.bump(p3.x+.35,p3.z),-1,'once per contact');
 fl.bump(p3.x+3,p3.z);assert.equal(fl.bump(p3.x-.4,p3.z),3,'again after stepping away');
 // A ball hit sways pole and cloth together through propReactions, then restores exactly.
 const R=load('lib/graphics/propReactions.ts'),pr=R.createPropReactions(fl.propSpecs),pos=m.geometry.getAttribute('position'),before=Float32Array.from(pos.array);
 assert.equal(pr.hit(p3.x,1.2,p3.z,12,0),'spring');pr.update(.12);
 const moved=k=>{let n=0;for(let v=k*fl.perFlag;v<(k+1)*fl.perFlag;v++)if(Math.abs(pos.array[v*3]-before[v*3])>1e-4)n++;return n;};
 assert(moved(3)>fl.perFlag*.5&&moved(2)===0&&moved(4)===0,'only that flag sways, pole and cloth together');
 for(let i=0;i<30;i++)pr.update(.05);assert.deepEqual(Array.from(pos.array),Array.from(before),'exact restore');
 const town=src('components/Town.tsx');
 assert(/if\(propHit==='spring'\)world\.plazaFlags\.react\(x,z,sp,reduced\)/.test(town),'a ball hit flutters the flag');
 assert(/world\.plazaFlags\.bump\(location\.x,location\.z\)[^\n]*propReactions\.hit\(fp\.x,1,fp\.z/.test(town),'walking into a pole sways it');
 assert(/world\.plazaFlags\.update\(/.test(town),'the wave clock runs');}
console.log('stadium feed + plaza flags: ok');
})().catch(e=>{console.error(e);process.exit(1);});
