// Ghost friend (owner, real phones, Oct 23 2026): a Busy / Away friend timed out of the party; their field, ring and label went but
// their body kept standing. Cause: remoteAvatars.update's empty-list early-out never called batch.begin()/end(), so the instanced
// body meshes kept the last frame's count. This drives the REAL playerBatch with a stub rig (one real mesh) and counts what is drawn.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(file,over={}){
 const m={exports:{}},full=path.join(root,file);
 const out=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,process:{env:{}},document:{createElement:()=>({getContext:()=>null,width:0,height:0})},
  Date,Math,Number,Set,Map,WeakMap,Float64Array,Float32Array,Int32Array,Uint8Array,Promise,JSON,Array,Object,Error,console,
  require:id=>{
   if(id==='three')return T;
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);if(over[key])return over[key];
    for(const ext of ['.ts','/index.ts'])if(fs.existsSync(rel+ext))return load(path.relative(root,rel+ext),over);}
   return require(id);
  }});
 return m.exports;
}
const {Mode,Zone,PoseFlag}=load('multiplayer/protocol/index.ts');
const geo=new T.BoxGeometry(.5,1.8,.5),mat=new T.MeshStandardMaterial({color:'#c08040'});
function harness(){
 const st={cap:5,live:0};
 const over={
  player:{createPlayer:()=>{st.live++;const r=new T.Group();r.add(new T.Mesh(geo,mat));return {root:r,setAppearance(){},setBeanLook(){},setExpression(){},update(){},dispose(){st.live--;r.removeFromParent();}};}},
  heatTier:{effectiveTier:()=>0,batterySaverOn:()=>false},
  celebrations:{applyCelebrationArms(){},celebrationMotion(){},applyRideEmote(){}},emotePose:{applyEmoteArms(){},emoteBody(){return {called:0,jump:undefined};}},
  customization:{beanLookFor:()=>({}),playerOutfit:()=>({})},look:{wireToLook:l=>l},
 };
 const mod=load('lib/graphics/remoteAvatars.ts',over);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(50,1,.1,500);camera.position.set(0,6,14);camera.lookAt(0,0,0);
 const a=mod.createRemoteAvatars(scene,{phone:true,maxFor:()=>st.cap,groundAt:()=>0});
 // Bodies drawn: instanced batch meshes (named by the batch scene) that are visible with a count, plus any loose rig mesh in the scene.
 const bodies=()=>{let n=0;scene.traverse(o=>{let vis=true;for(let p=o;p;p=p.parent)if(!p.visible){vis=false;break;}if(!vis)return;
  if(o.isInstancedMesh&&o.geometry.type==='BoxGeometry')n+=o.count;else if(o.isMesh&&!o.isInstancedMesh&&o.geometry===geo)n++;});return n;};
 const fieldsDrawn=()=>{let n=0;scene.traverse(o=>{if(o.isInstancedMesh&&o.visible&&o.geometry.type!=='BoxGeometry'&&o.parent===a.root&&o.count>0&&/field/i.test(o.name))n+=o.count;});return n;};
 return {a,st,scene,camera,bodies,fieldsDrawn};
}
const LOOK=new Array(12).fill(0);
const P=(x,mode,extra={})=>({x,y:0,z:0,yaw:0,speed:0,mode,zone:Zone.Main,fade:1,flags:0,...extra});
const run=(h,poses,s=1,dt=.05)=>{for(let t=0;t<s;t+=dt)h.a.update(dt,poses,h.camera,false,{x:0,y:0,z:0,hex:'#0072B2'});};
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};

for(const [label,pose] of [['busy',P(0,Mode.Busy)],['away',P(0,Mode.Idle,{flags:PoseFlag.Hidden})],['active',P(0,Mode.Idle)]]){
 t('the last friend ('+label+') times out: no body left drawn',()=>{
  const h=harness();h.a.upsert(7,LOOK,'Ayako',{hex:'#E69F00'});const poses=new Map([[7,pose]]);
  run(h,poses,1.5);assert.equal(h.bodies(),1,'drawn while in the party');
  h.a.remove(7);poses.delete(7);run(h,poses,.5);
  assert.equal(h.bodies(),0,'ghost body after the last friend left ('+label+')');assert.equal(h.st.live,0,'rig released');assert.equal(h.fieldsDrawn(),0,'no field');
 });
}
t('one of two friends leaves: only the other is drawn',()=>{
 const h=harness();h.a.upsert(1,LOOK,'A');h.a.upsert(2,LOOK,'B');const poses=new Map([[1,P(-2,Mode.Busy)],[2,P(2,Mode.Idle)]]);
 run(h,poses,1.5);assert.equal(h.bodies(),2);h.a.remove(1);poses.delete(1);run(h,poses,.3);assert.equal(h.bodies(),1);
});
t('removed while demoted (rig shrinking) / after the rig was dropped',()=>{
 for(const wait of [.1,1]){
  const h=harness();h.a.upsert(3,LOOK,'C');const poses=new Map([[3,P(0,Mode.Busy)]]);run(h,poses,1.5);
  h.st.cap=0;run(h,poses,1.05+wait);h.a.remove(3);poses.delete(3);run(h,poses,.3);
  assert.equal(h.bodies(),0,'demoted then removed ('+wait+' s)');assert.equal(h.st.live,0);
 }
});
t('removed while hidden (Hide) and while fading at the door (indoors)',()=>{
 const h=harness();h.a.upsert(4,LOOK,'D');const poses=new Map([[4,P(0,Mode.Busy)]]);run(h,poses,1.5);
 h.a.setHidden(new Set([4]));run(h,poses,.2);assert.equal(h.bodies(),0,'hidden');h.a.remove(4);poses.delete(4);h.a.setHidden(new Set());run(h,poses,.3);assert.equal(h.bodies(),0);
 const g=harness();g.a.upsert(5,LOOK,'E');const p2=new Map([[5,P(0,Mode.Idle)]]);run(g,p2,1.5);
 p2.set(5,{...P(0,Mode.Idle),zone:Zone.Indoors});run(g,p2,.1);g.a.remove(5);p2.delete(5);run(g,p2,.3);assert.equal(g.bodies(),0,'removed mid door fade');
});
t('a frame for the id after it left (stale pose still in the map) draws nothing',()=>{
 const h=harness();h.a.upsert(6,LOOK,'F');const poses=new Map([[6,P(0,Mode.Busy)]]);run(h,poses,1.5);
 h.a.remove(6);run(h,poses,.5);assert.equal(h.bodies(),0,'a pose without a roster entry is never drawn');
});
t('the party ends (empty last frame) with friends still listed: nothing drawn',()=>{
 const h=harness();h.a.upsert(8,LOOK,'G');const poses=new Map([[8,P(0,Mode.Busy)]]);run(h,poses,1.5);
 h.a.remove(8);poses.clear();h.a.update(.016,poses,h.camera,false,null);assert.equal(h.bodies(),0);
});
// Ghost plume (owner, Oct 23 2026, build 323ec0b8): a FLYING friend; the party ends; the runtime draws one last empty frame and then
// sleeps. The plume's particles fade over later frames, so that one frame froze 24 of them on screen for good (scripts/check-mp-ghost-live.cjs).
const jetsDrawn=h=>{let n=0;h.scene.traverse(o=>{if(o.name==='remote-jet-plumes'&&o.visible)n+=o.count;});return n;};
const layerDrawn=h=>{let n=0;h.a.root.traverse(o=>{for(let q=o;q;q=q.parent){if(!q.visible)return;if(q===h.a.root)break;}if(o.isInstancedMesh)n+=o.count;else if(o.isMesh||o.isSprite)n++;});return n;};
t('a flying friend leaves (party still live): body and plume gone once frames go on',()=>{
 const h=harness();h.a.upsert(9,LOOK,'H',{hex:'#E69F00'});const poses=new Map([[9,P(1,Mode.Jetpack,{y:4,speed:6})]]);
 run(h,poses,1.5);assert.ok(jetsDrawn(h)>0,'plume while flying');assert.equal(h.bodies(),1);
 h.a.remove(9);poses.delete(9);run(h,poses,1);assert.equal(h.bodies(),0);assert.equal(jetsDrawn(h),0,'ghost plume after the friend left');
});
t('the party ends while a friend flies: the ONE last empty frame (reduced = flush) leaves nothing, and the layer is hidden',()=>{
 const h=harness();h.a.upsert(10,LOOK,'I');const poses=new Map([[10,P(1,Mode.Jetpack,{y:4,speed:6})]]);run(h,poses,1.5);assert.ok(jetsDrawn(h)>0);
 h.a.remove(10);poses.clear();h.a.update(.016,poses,h.camera,true,null);
 assert.equal(h.bodies(),0);assert.equal(jetsDrawn(h),0,'plume frozen by the last frame');assert.equal(layerDrawn(h),0,'any friend layer left drawn');
 const src=read('lib/multiplayer/townBridge.ts'),room=read('lib/multiplayer/roomParty.ts');
 for(const [name,s] of [['townBridge',src],['roomParty',room]]){
  assert.match(s,/avatars\.update\(dt, poses, camera, true, null\)/,name+': the last frame flushes every fade');
  assert.match(s,/avatars\.root\.visible = false;/,name+': the friend layer is hidden while not in a party');
 }
});
// roomParty only upserts from the roster (a late S.Poses / S.Live frame for a removed id cannot re-create the avatar)
t('upsert comes from the roster only',()=>{
 const src=read('lib/multiplayer/roomParty.ts')+read('lib/multiplayer/townBridge.ts');
 assert.equal((src.match(/avatars\.upsert\(/g)||[]).length,1,'one upsert call (roster sync)');
});
console.log('mp-ghost-avatar: '+n+' checks passed');
