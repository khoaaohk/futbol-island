// Multiplayer Phase 0, Task E: remote avatars + Town glue (docs/multiplayer-workplan.md). Source + pure checks, no browser.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const stub=()=>new Proxy(function(){},{get:(_,k)=>k==='__esModule'?false:stub(),apply:()=>stub(),construct:()=>({})});
// TS loader: relative imports resolve to .ts; `over` maps a module's file name (no extension) to a replacement export object.
function load(file,over={},env={}){
 const m={exports:{}},full=path.join(root,file);
 const out=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,process:{env},document:{createElement:()=>({getContext:()=>null,width:0,height:0})},
  Date,Math,Number,Set,Map,Float64Array,Uint8Array,Promise,
  require:id=>{
   if(id==='three')return T;
   if(id.startsWith('.')){
    const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);
    if(over[key])return over[key];
    for(const ext of ['.ts','/index.ts'])if(fs.existsSync(rel+ext))return load(path.relative(root,rel+ext),over,env);
   }
   return require(id);
  }});
 return m.exports;
}

// 1. remoteCap table
{
 const {remoteCap}=load('lib/graphics/remoteAvatars.ts',{player:{},playerBatch:{},heatTier:{},celebrations:{},customization:{},look:{}});
 assert.deepEqual([0,1,2,3,4].map(t=>remoteCap(t,true,false)),[5,5,3,1,0],'phone cap by tier 5/5/3/1/0');
 assert.deepEqual([0,1,2,3,4].map(t=>remoteCap(t,false,false)),[5,5,5,5,5],'desktop cap is 5');
 for(const t of [0,1,2,3,4]){assert.equal(remoteCap(t,true,true),0,'saver phone');assert.equal(remoteCap(t,false,true),0,'saver desktop');}
}

// 2. caps apply at admission only; Battery saver fades everyone out over 1 s
function harness(){
 const state={tier:0,saver:false,created:0,drawn:0,batchDisposed:false};
 const over={
  player:{createPlayer:()=>{state.created++;return {root:new T.Group(),setAppearance(){},setBeanLook(){},setExpression(){},update(){},dispose(){}};}},
  playerBatch:{playerBatch:()=>({begin(){state.drawn=0;},draw(){state.drawn++;},end(){},dispose(){state.batchDisposed=true;}})},
  heatTier:{effectiveTier:()=>state.tier,batterySaverOn:()=>state.saver},
  celebrations:{applyCelebrationArms(){},celebrationMotion(){}},
  customization:{beanLookFor:()=>({}),playerOutfit:()=>({})},
  look:{wireToLook:l=>l},
 };
 const mod=load('lib/graphics/remoteAvatars.ts',over);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(60,1,.1,500);camera.position.set(0,5,10);camera.lookAt(0,0,0);
 const avatars=mod.createRemoteAvatars(scene,{phone:true,maxFor:(t,p)=>mod.remoteCap(t,p,false)});
 const poses=new Map();
 const pose=(i)=>({x:i-2,y:0,z:0,yaw:0,speed:0,mode:13,zone:0,fade:1});
 const all=ids=>{poses.clear();for(const i of ids)poses.set(i,pose(i));};
 return {state,avatars,camera,poses,all,mod};
}
{
 const h=harness(),look=new Array(12).fill(0);
 h.state.tier=3; // cap 1
 for(const id of [1,2,3])h.avatars.upsert(id,look,'Red Zebra');
 assert.equal(h.state.created,1,'tier 3 admits one friend');
 h.state.tier=0; h.all([1,2,3]);
 h.avatars.update(1.1,h.poses,h.camera,false);
 assert.equal(h.state.created,3,'the capped friends are admitted once the cap allows');
 assert.equal(h.avatars.shown,3);
 h.state.tier=4; // cap 0: nobody already shown is removed or hidden
 h.avatars.upsert(4,look,'Blue Fox');h.all([1,2,3,4]);
 h.avatars.update(1.1,h.poses,h.camera,false);
 assert.equal(h.state.created,3,'tier 4 admits no new friend');
 assert.equal(h.avatars.shown,3,'a tier change never hides a friend already shown');
 h.avatars.remove(1);h.state.tier=2;h.all([2,3,4]);
 h.avatars.update(1.1,h.poses,h.camera,false);
 assert.equal(h.state.created,4,'a freed slot admits the waiting friend (tier 2, cap 3)');
 assert.equal(h.avatars.shown,3);
 // far friends (> 160 m) are not drawn
 h.poses.set(2,{x:500,y:0,z:0,yaw:0,speed:0,mode:13,zone:0,fade:1});h.avatars.update(.016,h.poses,h.camera,false);
 assert.equal(h.avatars.shown,2,'beyond 160 m is not drawn');
 h.avatars.dispose();assert.equal(h.state.batchDisposed,true,'dispose frees the batch');
}
{
 const h=harness(),look=new Array(12).fill(0);
 h.avatars.upsert(1,look,'Red Zebra');h.all([1]);
 h.avatars.update(.016,h.poses,h.camera,false);assert.equal(h.avatars.shown,1);
 h.state.saver=true;
 h.avatars.update(.5,h.poses,h.camera,false);assert.equal(h.avatars.shown,1,'still fading at 0.5 s');
 h.avatars.update(.6,h.poses,h.camera,false);assert.equal(h.avatars.shown,0,'faded out after 1 s');
 h.avatars.upsert(2,look,'Blue Fox');assert.equal(h.state.created,1,'saver: cap 0 admits nobody new');
}

// 2b. colour rings: ONE instanced mesh, colour per member, hidden with the avatar, local ring only when asked
{
 const h=harness(),look=new Array(12).fill(0),ringsOf=()=>h.avatars.root.children.filter(o=>o.name==='remote-avatar-rings');
 assert.equal(ringsOf().length,1,'one ring mesh in the whole remote layer');
 const ring=ringsOf()[0];assert.ok(ring.isInstancedMesh&&ring.instanceMatrix.count===8,'instanced, capacity 8');
 assert.equal(ring.castShadow,false);assert.equal(ring.frustumCulled,false);
 h.avatars.upsert(1,look,'Blue Fox',{hex:'#0072B2',glyph:'F'});h.avatars.upsert(2,look,'Orange Owl',{hex:'#E69F00',glyph:'O'});
 h.all([1,2]);h.avatars.update(.016,h.poses,h.camera,false);
 assert.equal(ring.count,2,'a ring per shown friend');
 const c=new T.Color(),c0=new T.Color(),c1=new T.Color();ring.getColorAt(0,c0);ring.getColorAt(1,c1);
 assert.equal(c0.getHexString(),new T.Color('#0072B2').getHexString(),'ring 0 = member 1 colour');assert.equal(c1.getHexString(),new T.Color('#E69F00').getHexString(),'ring 1 = member 2 colour');
 // ring sits at the feet and grows with camera distance (capped 4x)
 const m=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();
 ring.getMatrixAt(0,m);m.decompose(p,q,s);assert.ok(Math.abs(p.x-(-1))<1e-6&&p.y>0&&p.y<.2,'flat at the avatar feet');const near=s.x;
 h.camera.position.set(0,5,80);h.camera.lookAt(0,0,0);h.avatars.update(.016,h.poses,h.camera,false);
 ring.getMatrixAt(0,m);m.decompose(p,q,s);assert.ok(s.x>near*2.5&&s.x<=.55*4+1e-6,'bigger from far, capped at 4x');
 // hidden when culled (behind the camera), too far, or Battery saver
 h.camera.position.set(0,5,10);h.camera.lookAt(0,0,0);
 h.poses.set(1,{x:500,y:0,z:0,yaw:0,speed:0,mode:13,zone:0,fade:1});h.avatars.update(.016,h.poses,h.camera,false);assert.equal(ring.count,1,'beyond 160 m: no ring');
 h.poses.set(1,{x:0,y:0,z:400,yaw:0,speed:0,mode:13,zone:0,fade:1});h.avatars.update(.016,h.poses,h.camera,false);assert.equal(ring.count,1,'off screen: no ring');
 h.all([1,2]);
 // the local ring: only when passed, in its own colour, counted in the same mesh
 const local={x:3,y:0,z:0,hex:'#009E73'};
 h.avatars.update(.016,h.poses,h.camera,false,local);assert.equal(ring.count,3,'friends + local in the same mesh');
 ring.getColorAt(2,c);assert.equal(c.getHexString(),new T.Color('#009E73').getHexString(),'local ring colour');
 h.avatars.update(.016,h.poses,h.camera,false,null);assert.equal(ring.count,2,'no local ring when null');
 h.state.saver=true;for(let i=0;i<4;i++)h.avatars.update(.5,h.poses,h.camera,false,local);assert.equal(ring.count,0,'Battery saver: no rings at all');
 h.state.saver=false;
 // before any friend exists the local ring still shows (host alone in a live party)
 const h2=harness();const r2=h2.avatars.root.children.find(o=>o.name==='remote-avatar-rings');
 h2.avatars.update(.016,h2.poses,h2.camera,false,{x:0,y:0,z:0,hex:'#0072B2'});assert.equal(r2.count,1);
 h2.avatars.update(.016,h2.poses,h2.camera,false);assert.equal(r2.count,0);
 h2.avatars.dispose();h.avatars.dispose();
}
// source scan: update() allocates nothing per frame (no `new`, no object / array literals, no closures), one extra draw call
{
 const src=read('lib/graphics/remoteAvatars.ts'),body=src.slice(src.indexOf('update(dt,poses,camera,reduced,local){'),src.indexOf('dispose(){'));
 const ring=src.slice(src.indexOf('function ringAdd'),src.indexOf('const labels='));
 assert.ok(body.length>500);
 for(const [what,b] of [['update',body],['ringAdd',ring]]){assert(!/\bnew\s/.test(b),what+' allocates nothing (no new)');assert(!/\.clone\(|\.map\(|\.filter\(|=>\s*\{?[^;]*\}/.test(b.replace(/=>\s*\{\s*\}/g,'')),what+' no closures / array copies');}
 assert.equal((src.match(/new T\.InstancedMesh/g)||[]).length,1,'exactly one instanced ring mesh');
 assert(/RING_CAPACITY=8/.test(src)&&/castShadow=false/.test(src.slice(src.indexOf('rings.name'),src.indexOf('rings.name')+300)),'capacity 8, no shadows');
 assert(/polygonOffset/.test(src)&&!/new T\.(Sprite|Mesh)\([^)]*ring/i.test(src),'no per-friend ring meshes');
 const bridge=read('lib/multiplayer/townBridge.ts');
 assert(/conn\.status === 'live' && meHex !== ''/.test(bridge)&&/showRing \? ring : null/.test(bridge),'local ring only while live');
 assert(/glyph:\s*m\.animalGlyph/.test(bridge),'label gets the glyph and colour');
}

// 3. sources: no shadow registration, one batch (capacity 8), no forbidden imports
const files=['lib/graphics/remoteAvatars.ts','lib/multiplayer/townBridge.ts'];
for(const f of files){
 const src=read(f);
 assert(!/shadowVisibility|npcShadows/.test(src),f+' must not reference shadowVisibility/npcShadows');
 assert(!/lib\/saves|lib\/analytics|\.\.\/saves|\.\.\/analytics/.test(src),f+' must not import saves/analytics');
 assert(!/requestAnimationFrame|setInterval|setTimeout/.test(src),f+' adds no loop or timer');
}
assert(/playerBatch\(drawn,BATCH_CAPACITY\)/.test(read('lib/graphics/remoteAvatars.ts'))&&/BATCH_CAPACITY=8/.test(read('lib/graphics/remoteAvatars.ts')),'one playerBatch of 8');
assert(/castShadow=false/.test(read('lib/graphics/remoteAvatars.ts')),'batched friends never cast shadows');

{ // review #22: an emote ages (and expires) even when the friend is off screen, indoors or too far to draw
 const ra=read('lib/graphics/remoteAvatars.ts'),age=ra.indexOf('e.emoteAge+=dt'),early=ra.indexOf('if(!rig||!e.label||!e.bubble)continue'),hide=ra.indexOf('hideEntry(e);continue');
 assert(age>0&&age<early&&early<hide&&ra.split('e.emoteAge+=dt').length===2,'emote age advances once per update, before the visibility early-outs');
}

// 4. Town.tsx: at most 6 lines of party glue, and the pinned dispose order is intact
{
 const town=read('components/Town.tsx'),lines=town.split('\n').filter(l=>/createPartyRuntime|partyLocal|\bparty\?\.|PartyHost|townBridge/.test(l));
 assert(lines.length<=8,'Town.tsx party lines: '+lines.length+' (max 8: the PartyHost mount adds the import and the JSX)');
 assert(lines.length>=4,'Town.tsx wires import, init, update and dispose');
 assert(town.includes('swimClear.dispose();clearWin.dispose();'),'dispose order kept');
 assert(town.indexOf('party?.update(')<town.indexOf('islandNpcs.update('),'update sits next to islandNpcs.update');
}

// 5. flag off: createPartyRuntime returns null (and builds nothing)
{
 let built=0;
 const over={remoteAvatars:{createRemoteAvatars:()=>{built++;return {};},remoteCap:()=>0},heatTier:{batterySaverOn:()=>false},customization:{loadCustomization:()=>({})},
  connection:{createPartyConnection:()=>{built++;return {};}},look:{lookToWire:()=>[]},store:{partyStore:{get:()=>({}),subscribe:()=>()=>{}}},
  index:{bindConnection:()=>()=>{},onPoses:()=>()=>{}},interp:{createInterp:()=>({})}};
 const off=load('lib/multiplayer/townBridge.ts',over,{});
 assert.equal(off.createPartyRuntime({scene:new T.Scene(),viewGate:{addUnitRoots(){}},local:()=>({}),phone:false,reducedMotion:()=>false}),null,'flag off returns null');
 assert.equal(built,0,'flag off builds nothing');
 const off0=load('lib/multiplayer/townBridge.ts',over,{NEXT_PUBLIC_MULTIPLAYER:'0'});
 assert.equal(off0.createPartyRuntime({scene:new T.Scene(),viewGate:{addUnitRoots(){}},local:()=>({}),phone:false,reducedMotion:()=>false}),null);
}

// 8. first-name labels + Hide / Mute are applied to the drawn avatars
{
 const h=harness(),look=new Array(12).fill(0);
 const labels=()=>h.avatars.root.children.find(c=>c.name==='remote-avatar-labels').children.filter(c=>c.name==='remote-name');
 h.avatars.upsert(1,look,'Red Zebra',{hex:'#D62828',glyph:'Z'});
 h.avatars.upsert(2,look,'Emma',{hex:'#0072B2',glyph:'F',sub:'Blue Fox'});
 h.all([1,2]);h.avatars.update(.016,h.poses,h.camera,false);
 assert.equal(h.avatars.shown,2);
 const [l1,l2]=labels();
 assert.ok(l2.scale.y>l1.scale.y,'a label with the made-up name underneath is taller');
 const tex2=l2.material.map;
 h.avatars.upsert(2,look,'Blue Fox',{hex:'#0072B2',glyph:'F'}); // the host reset the name
 assert.notEqual(l2.material.map,tex2,'label texture is rebuilt on reset');
 assert.ok(Math.abs(l2.scale.y-l1.scale.y)<1e-9,'label back to the single-line size');
 // Hide: not drawn at all (avatar, label, bubble); Show brings it back
 h.avatars.emote(2,1);
 h.avatars.setHidden(new Set([2]));h.avatars.update(.016,h.poses,h.camera,false);
 assert.equal(h.avatars.shown,1,'hidden friend is not drawn');
 assert.equal(l2.visible,false,'hidden friend label is hidden');
 const bubbles=h.avatars.root.children.find(c=>c.name==='remote-avatar-labels').children.filter(c=>c.name==='remote-emote');
 assert.ok(bubbles.every(b=>!b.visible||b===bubbles[0]),'bubble state');assert.equal(bubbles[1].visible,false,'hidden friend emote bubble is hidden');
 h.avatars.emote(2,1);h.avatars.update(.016,h.poses,h.camera,false);assert.equal(bubbles[1].visible,false,'no emote while hidden');
 h.avatars.setHidden(new Set());h.avatars.update(.016,h.poses,h.camera,false);
 assert.equal(h.avatars.shown,2,'Show brings the friend back');
 // Mute: emotes are not shown, the friend stays visible
 h.avatars.setMuted(new Set([2]));h.avatars.emote(2,1);h.avatars.update(.016,h.poses,h.camera,false);
 assert.equal(h.avatars.shown,2,'muted friend stays drawn');assert.equal(bubbles[1].visible,false,'muted friend emote not shown');
 h.avatars.emote(1,1);h.avatars.update(.016,h.poses,h.camera,false);assert.equal(bubbles[0].visible,true,'other friends emotes still show');
 const bridge=read('lib/multiplayer/townBridge.ts'),town=read('components/Town.tsx');
 assert(/setHiddenFriends/.test(bridge)&&/avatars\.setHidden\(hiddenIds\)/.test(bridge)&&/onHiddenChange=\{setHiddenFriends\}/.test(town)&&/onMutedChange=\{setMutedFriends\}/.test(town),'PartyHost Hide / Mute reach the avatars');
 assert(/displayName\(m\)/.test(bridge)&&/sub: m\.nick \? m\.name/.test(bridge),'label uses the first name with the made-up name small underneath');
}
console.log('mp-avatars ok');
