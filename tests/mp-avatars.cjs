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
 const {remoteCap}=load('lib/graphics/remoteAvatars.ts',{player:{},playerBatch:{},heatTier:{},celebrations:{},emotePose:{},customization:{},look:{}});
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
  celebrations:{applyCelebrationArms(){},celebrationMotion(){}},emotePose:{applyEmoteArms(){},emoteBody(){return {called:0,jump:undefined};}},
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
 for(const id of [1,2,3])h.avatars.upsert(id,look,'Red');
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
 h.avatars.upsert(1,look,'Red');h.all([1]);
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
 const ring=ringsOf()[0];assert.ok(ring.isInstancedMesh&&ring.instanceMatrix.count===21,'instanced, capacity party max + 1 = 21');
 assert.equal(ring.castShadow,false);assert.equal(ring.frustumCulled,false);
 h.avatars.upsert(1,look,'Blue',{hex:'#0072B2'});h.avatars.upsert(2,look,'Orange',{hex:'#E69F00'});
 h.all([1,2]);h.avatars.update(.016,h.poses,h.camera,false);
 assert.equal(ring.count,2,'a ring per shown friend');
 const c=new T.Color(),c0=new T.Color(),c1=new T.Color();ring.getColorAt(0,c0);ring.getColorAt(1,c1);
 assert.equal(c0.getHexString(),new T.Color('#0072B2').getHexString(),'ring 0 = member 1 colour');assert.equal(c1.getHexString(),new T.Color('#E69F00').getHexString(),'ring 1 = member 2 colour');
 // ring sits at the feet and grows with camera distance (capped 4x)
 const m=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();
 ring.getMatrixAt(0,m);m.decompose(p,q,s);assert.ok(Math.abs(p.x-(-1))<1e-6&&p.y>0&&p.y<.2,'flat at the avatar feet');const near=s.x;
 h.camera.position.set(0,5,80);h.camera.lookAt(0,0,0);h.avatars.update(.016,h.poses,h.camera,false);
 ring.getMatrixAt(0,m);m.decompose(p,q,s);assert.ok(s.x>near*2.5&&s.x<=1*4+1e-6,'bigger from far, capped at 4x');
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
 assert(/RING_CAPACITY=PARTY_MAX\+1/.test(src)&&/castShadow=false/.test(src.slice(src.indexOf('rings.name'),src.indexOf('rings.name')+300)),'capacity 21, no shadows');
 assert(/polygonOffset/.test(src)&&!/new T\.(Sprite|Mesh)\([^)]*ring/i.test(src),'no per-friend ring meshes');
 const bridge=read('lib/multiplayer/townBridge.ts');
 assert(/conn\.status === 'live' && meHex !== ''/.test(bridge)&&/showRing \? ring : null/.test(bridge),'local ring only while live');
 assert(/\{ hex: m\.colourHex \}/.test(bridge)&&!/glyph|animal/i.test(bridge),'label gets the colour dot only, no animal glyph');
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
 const ra=read('lib/graphics/remoteAvatars.ts'),age=ra.indexOf('e.emoteAge+=dt'),early=ra.indexOf('if(!e.label||!e.bubble)continue'),hide=ra.indexOf('hideEntry(e);continue');
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
 h.avatars.upsert(1,look,'Red',{hex:'#D62828'});
 h.avatars.upsert(2,look,'Emma',{hex:'#0072B2'});
 h.all([1,2]);h.avatars.update(.016,h.poses,h.camera,false);
 assert.equal(h.avatars.shown,2);
 const [l1,l2]=labels();
 assert.ok(Math.abs(l2.scale.y-l1.scale.y)<1e-9,'every label is one line (colour dot + name), no made-up name underneath');
 const tex2=l2.material.map;
 h.avatars.upsert(2,look,'Blue',{hex:'#0072B2'}); // the host reset the name
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
 assert(/displayName\(m\)/.test(bridge)&&!/sub:/.test(bridge),'label uses the first name (or the colour name), nothing underneath');
}

// 4. 20-player party (19 friends): the heat caps stay (5 rigs on a phone), the rest are ring + label only, labels nearest 8 within 25 m, emote bubbles max 6
{
 const h=harness(),look=new Array(12).fill(0);
 const ringsMesh=h.avatars.root.children.find(o=>o.name==='remote-avatar-rings');
 const labelsOf=()=>h.avatars.root.children.find(c=>c.name==='remote-avatar-labels').children.filter(c=>c.name==='remote-name');
 const bubblesOf=()=>h.avatars.root.children.find(c=>c.name==='remote-avatar-labels').children.filter(c=>c.name==='remote-emote');
 const ids=Array.from({length:19},(_,i)=>i+1);
 const colours=['#D62828','#0072B2','#009E73','#F0E442','#E69F00','#7B3FA0','#CC79A7','#1B9AAA','#B8860B','#AEB7C0','#FF6F61','#7FD8B0','#1D2F6F','#8BC34A','#56B4E9','#FFB997','#8B5A2B','#8E1B3A','#FFFFFF'];
 ids.forEach((id,i)=>h.avatars.upsert(id,look,'F'+id,{hex:colours[i]}));
 assert.equal(h.state.created,5,'19 friends: the phone tier-0 cap still admits only 5 rigs');
 // friend i sits on a ring of radius 3 + i*0.4 m round the origin: closest-to-camera ids are the ones with small distance
 const at=(id)=>{const a=id*.33,r=3+id*.4;return {x:Math.cos(a)*r,y:0,z:Math.sin(a)*r-6};};
 h.poses.clear();for(const id of ids){const p=at(id);h.poses.set(id,{x:p.x,y:0,z:p.z,yaw:0,speed:0,mode:13,zone:0,fade:1});}
 h.camera.position.set(0,6,14);h.camera.lookAt(0,0,-6);h.camera.updateMatrixWorld();
 h.avatars.update(.016,h.poses,h.camera,false);
 assert.equal(h.state.created,5,'no extra rigs created by the update');
 assert.equal(h.avatars.shown,5,'only the 5 admitted friends are drawn as bodies');
 assert.equal(ringsMesh.count,19,'every other friend still gets a colour ring (marker): 19 rings for 19 friends');
 const vis=labelsOf().filter(l=>l.visible);
 assert.ok(vis.length<=8&&vis.length===8,'only the nearest 8 labels are visible (got '+vis.length+')');
 const cam=h.camera.position,dist=l=>Math.hypot(l.position.x-cam.x,l.position.z-cam.z);
 const farthestVisible=Math.max(...vis.map(dist)),nearestHidden=Math.min(...labelsOf().filter(l=>!l.visible&&l.position.lengthSq()>0).map(dist));
 assert.ok(farthestVisible<=nearestHidden+1e-6,'the visible labels are the nearest ones');
 assert.ok(vis.every(l=>dist(l)<=25),'no label beyond 25 m');
 // a friend 40 m away gets a ring but no label
 h.avatars.upsert(30,look,'Far',{hex:'#000000'});h.poses.set(30,{x:0,y:0,z:-30,yaw:0,speed:0,mode:13,zone:0,fade:1});
 h.camera.position.set(0,6,10);h.camera.lookAt(0,0,-10);h.camera.updateMatrixWorld();
 h.avatars.update(.016,h.poses,h.camera,false);
 const far=labelsOf()[labelsOf().length-1];assert.equal(far.visible,false,'label hidden beyond 25 m');
 // emote bubbles: everyone emotes -> at most 6 bubbles visible
 for(const id of ids)h.avatars.emote(id,1);
 for(let k=0;k<6;k++)h.avatars.update(.2,h.poses,h.camera,false);
 const nb=bubblesOf().filter(b=>b.visible).length;assert.ok(nb>0&&nb<=6,'emote bubbles capped at 6 (got '+nb+')');
 // Battery saver still fades everyone including the markers
 h.state.saver=true;for(let k=0;k<8;k++)h.avatars.update(.2,h.poses,h.camera,false);
 assert.equal(ringsMesh.count,0,'saver: no rings');assert.equal(h.avatars.shown,0);
 h.avatars.dispose();
}
// 9. presence (design 4.4.1): a busy / away friend stands still inside ONE shared green force field with a status line; indoors fades at the door
{
 const h=harness(),look=new Array(12).fill(0),P=load('multiplayer/protocol/index.ts');
 const fieldOf=()=>h.avatars.root.children.find(o=>o.name==='remote-force-fields');
 const statusOf=()=>h.avatars.root.children.find(o=>o.name==='remote-avatar-labels').children.filter(o=>o.name==='remote-status');
 const f=fieldOf();assert.ok(f&&f.isInstancedMesh&&f.instanceMatrix.count===P.PARTY_MAX,'one instanced field mesh, capacity party max');
 assert.equal(f.castShadow,false);assert.equal(f.count,0);
 assert.equal(f.material.uniforms.uColor.value.getHexString(),new T.Color('#5fe39a').getHexString(),'the field is green (the ring keeps the friend colour)');
 for(const id of [1,2])h.avatars.upsert(id,look,'Red',{hex:'#D55E00'});
 const busy=(i,act,extra={})=>Object.assign({x:i-2,y:0,z:0,yaw:0,speed:act*.25,mode:P.Mode.Busy,zone:0,fade:1,flags:0,activity:act},extra);
 h.poses.set(1,busy(1,P.Activity.Lesson));h.poses.set(2,{x:0,y:0,z:0,yaw:0,speed:0,mode:13,zone:0,fade:1,flags:0});
 h.avatars.update(.1,h.poses,h.camera,false);assert.equal(f.count,1,'only the busy friend has a field');
 const a=f.geometry.getAttribute('aField');assert.ok(a.getX(0)>0&&a.getX(0)<1,'the field fades in (not a pop)');
 for(let i=0;i<5;i++)h.avatars.update(.1,h.poses,h.camera,false);assert.ok(Math.abs(a.getX(0)-1)<1e-6,'fully in after ~0.35 s');
 const st=statusOf();assert.equal(st.length,2,'a status sprite per friend');const vis=st.filter(o=>o.visible);
 assert.equal(vis.length,1,'status line only over the busy friend');assert.ok(vis[0].material.map,'with its text texture');
 assert.ok(vis[0].position.y>2.5,'above the name label');
 // two friends on the same line share one texture
 h.poses.set(2,busy(2,P.Activity.Lesson));h.avatars.update(.016,h.poses,h.camera,false);
 const v2=statusOf().filter(o=>o.visible);assert.equal(v2.length,2);assert.equal(v2[0].material.map,v2[1].material.map,'one cached texture per line');
 // a ball hit: shake + ripple, then they settle
 h.avatars.bumpField(1,1,0,0);h.avatars.update(.016,h.poses,h.camera,false);assert.ok(a.getY(0)>.8,'shake right after the hit');assert.ok(a.getZ(0)<.1,'ripple starts');
 for(let i=0;i<6;i++)h.avatars.update(.1,h.poses,h.camera,false);assert.equal(a.getY(0),0,'shake gone after ~0.4 s');
 // emotes from inside the field are ignored
 const bubbleVis=()=>h.avatars.root.children.find(o=>o.name==='remote-avatar-labels').children.filter(o=>o.name==='remote-emote'&&o.visible).length;
 h.avatars.emote(1,P.Emote.Wave);h.avatars.update(.3,h.poses,h.camera,false);assert.equal(bubbleVis(),0,'no emote bubble from a busy friend');
 // away (Hidden flag) is shielded too
 h.poses.set(2,busy(2,0,{mode:13,speed:0,flags:2}));h.avatars.update(.016,h.poses,h.camera,false);assert.equal(f.count,2,'away friend also inside the field');
 // back: the field pops out (swells while fading), the status line goes
 h.poses.set(1,{x:-1,y:0,z:0,yaw:0,speed:0,mode:13,zone:0,fade:1,flags:0});h.avatars.update(.1,h.poses,h.camera,false);
 assert.equal(f.count,2,'still fading out');const m=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),sc=new T.Vector3();f.getMatrixAt(0,m);m.decompose(p,q,sc);assert.ok(sc.x>1.15,'pop: the dome swells as it fades');
 for(let i=0;i<5;i++)h.avatars.update(.1,h.poses,h.camera,false);assert.equal(f.count,1,'gone after the pop');
 h.avatars.emote(1,P.Emote.Wave);h.avatars.update(.3,h.poses,h.camera,false);assert.equal(bubbleVis(),1,'emotes again once back');
 // reduced motion: no fade (instant), no shake
 h.poses.set(1,busy(1,P.Activity.Quiz));h.avatars.update(.016,h.poses,h.camera,true);f.getMatrixAt(0,m);assert.equal(a.getX(0),1,'reduced motion: the field is just there');
 h.avatars.bumpField(1,0,1,0);h.avatars.update(.016,h.poses,h.camera,true);assert.equal(a.getY(0),0,'reduced motion: no shake');
 // indoors: fades out at the door over ~0.6 s (avatar drawn, then gone); reduced motion = gone at once
 h.poses.set(2,busy(2,P.Activity.Museum,{zone:P.Zone.Indoors}));const d0=h.state.drawn;
 h.avatars.update(.2,h.poses,h.camera,false);assert.equal(h.avatars.shown,2,'still visible while fading at the door');
 for(let i=0;i<4;i++)h.avatars.update(.2,h.poses,h.camera,false);assert.equal(h.avatars.shown,1,'gone indoors');
 h.poses.set(2,busy(2,0,{mode:13,speed:0}));h.avatars.update(.016,h.poses,h.camera,false);h.poses.set(2,busy(2,P.Activity.Shop,{zone:P.Zone.Indoors}));h.avatars.update(.016,h.poses,h.camera,true);
 assert.equal(h.avatars.shown,1,'reduced motion: no door fade');void d0;
 h.avatars.dispose();
}
// 10. the ball vs a busy friend's force field (pure): reflect off the dome, lose a little energy, never through, never stuck
{
 const B=load('lib/town/forceFieldBounce.ts');
 const ball={x:-1.3,y:1,z:0,vx:10,vy:0,vz:0};
 assert.equal(B.bounceOffField(ball,0,1,0),true,'touching the dome');
 assert.ok(ball.vx<0&&Math.abs(ball.vx+10*B.FIELD_RESTITUTION)<1e-9,'head-on: reversed with the restitution loss');
 assert.ok(Math.hypot(ball.x,ball.y-1,ball.z)>=B.FIELD_RADIUS+.2,'pushed back to the surface');
 assert.deepEqual([B.fieldHit.nx,B.fieldHit.ny,B.fieldHit.nz],[-1,0,0]);assert.equal(B.fieldHit.speed,10);
 // glancing: tangential speed kept, normal part reflected
 const g={x:0,y:1+1.3*Math.SQRT1_2,z:-1.3*Math.SQRT1_2,vx:0,vy:0,vz:6};B.bounceOffField(g,0,1,0);
 assert.ok(g.vz>0&&g.vy>0,'deflected up and over');const sp=Math.hypot(g.vx,g.vy,g.vz);assert.ok(sp<6&&sp>3,'some energy lost');
 // already leaving (inside, moving out): only pushed out, velocity untouched (never stuck)
 const out={x:.5,y:1,z:0,vx:3,vy:0,vz:0};B.bounceOffField(out,0,1,0);assert.equal(out.vx,3);assert.ok(out.x>=B.FIELD_RADIUS+.2-1e-9);
 // a rolling ball near the feet is pushed out sideways, never into the ground
 const roll={x:.4,y:.2,z:0,vx:-4,vy:0,vz:0};B.bounceOffField(roll,0,1,0);assert.equal(roll.y,.2,'keeps its height');assert.ok(roll.vx>0&&roll.x>1.3);
 // far away: nothing
 const far={x:5,y:1,z:0,vx:-1,vy:0,vz:0};assert.equal(B.bounceOffField(far,0,1,0),false);assert.equal(far.vx,-1);
 // a 40 m/s shot stepped at 1/60 s through a field never ends inside
 const shot={x:-4,y:1.1,z:.3,vx:40,vy:0,vz:0};for(let i=0;i<30;i++){shot.x+=shot.vx/60;shot.y+=shot.vy/60;shot.z+=shot.vz/60;B.bounceOffField(shot,0,1,0);assert.ok(Math.hypot(shot.x,Math.max(0,shot.y-1),shot.z)>=B.FIELD_RADIUS+.2-1e-6,'never inside');}
 assert.ok(shot.x<0,'bounced back');
}
// 11. sources: friends() lists only friends outside a field (emote button / friend-pair emotes / NPC picks), the bridge adds no timer
{
 const br=read('lib/multiplayer/townBridge.ts');
 assert(/friends: \(\) => active\.values\(\)/.test(br),'friends() = active (not busy / away / indoors) friends only');
 assert(/presenceOf\(p\.mode, p\.zone, p\.flags \?\? 0\) === 'active'/.test(br));
 assert(/onBeforeBeat/.test(br),'sleeping-loop presence rides the connection beat (no timer)');
 const town=read('components/Town.tsx');assert(/party\.ballVsFields\(walkBall\.state\)/.test(town),'Town bounces the island ball off busy friends');
}
{ // One ring only, and it goes away with the party (user, Oct 22 2026)
 const br=read('lib/multiplayer/townBridge.ts'),town=read('components/Town.tsx'),ra=read('lib/graphics/remoteAvatars.ts');
 assert(/get meRing\(\)/.test(br)&&/!party\?\.meRing&&/.test(town),'the island cream foot ring hides while the party colour ring is drawn');
 assert(/if \(!live\) \{ if \(drawnLast\)/.test(br)&&/avatars\.update\(dt, poses, camera, ctx\.reducedMotion\(\), null\)/.test(br),'one last empty frame clears the rings when the party ends');
 assert(/radii=\[\.48,\.54\]/.test(ra)&&/RING_RADIUS=1\b/.test(ra),'the party ring has the island foot ring shape and size');
}
console.log('mp-avatars ok');
