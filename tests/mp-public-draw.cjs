// Public island, phase 1 (Nov 11 2026): how strangers are DRAWN (lib/graphics/remoteAvatars.ts + remotePublic.ts + rigCap.ts planNearest,
// components/FriendMapDots.tsx). docs/multiplayer-public-island-plan-2026-11-11.md. Source + pure checks + a headless layer, no browser.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let canvases=0;const texts=[];
const ctx2d={measureText:s=>({width:s.length*30}),fillText:s=>{texts.push(String(s));},strokeText(){},beginPath(){},roundRect(){},rect(){},fill(){},stroke(){},arc(){},clearRect(){},set font(_v){},set fillStyle(_v){},set strokeStyle(_v){},set lineWidth(_v){},set lineJoin(_v){},set textAlign(_v){},set textBaseline(_v){},set shadowColor(_v){},set shadowBlur(_v){},set shadowOffsetY(_v){}};
const documentStub={createElement:()=>{canvases++;return {getContext:()=>ctx2d,width:0,height:0};}};
function load(file,over={},env={}){
 const m={exports:{}},full=path.join(root,file);
 const out=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,process:{env},document:documentStub,Date,Math,Number,Set,Map,WeakMap,Float64Array,Float32Array,Uint8Array,Promise,
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
const P=load('multiplayer/protocol/index.ts');
// One shared adapter instance so the test drives the same module the layer reads.
const source={pub:true,pairs:new Map(),hid:new Set(),isPublic(){return this.pub;},nameIdx(id){return this.pairs.get(id)??null;},hidden(id){return this.hid.has(id);}};
const pubMod=load('lib/graphics/remotePublic.ts');pubMod.setPublicDrawSource(source);
function harness({phone=true,room=false}={}){
 const state={tier:0,created:0,live:new Set(),drawn:0,ghostDrawn:0};let batches=0;
 const over={
  remotePublic:pubMod,
  player:{createPlayer:(name)=>{state.created++;state.live.add(name);return {root:new T.Group(),setAppearance(){},setBeanLook(){},setExpression(){},update(){},dispose(){state.live.delete(name);}};}},
  playerBatch:{playerBatch:()=>{const ghost=batches++===1;return {begin(){if(ghost)state.ghostDrawn=0;else state.drawn=0;},draw(){if(ghost)state.ghostDrawn++;else state.drawn++;},end(){},dispose(){}};}},
  heatTier:{effectiveTier:()=>state.tier,batterySaverOn:()=>false},
  celebrations:{applyCelebrationArms(){},celebrationMotion(){}},emotePose:{applyEmoteArms(){},emoteBody(){return {called:0,jump:undefined};}},
  customization:{beanLookFor:()=>({}),playerOutfit:()=>({})},look:{wireToLook:l=>l},
 };
 const mod=load('lib/graphics/remoteAvatars.ts',over);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(60,1,.1,500);camera.position.set(0,30,35);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 const avatars=mod.createRemoteAvatars(scene,{phone,maxFor:(t,p)=>mod.remoteCap(t,p,false),fieldScale:room?.7:undefined});
 const poses=new Map(),look=new Array(12).fill(0);
 const put=(id,x,z)=>poses.set(id,{x,y:0,z,yaw:0,speed:0,mode:P.Mode.Idle,zone:P.Zone.Main,fade:1});
 const rings=()=>avatars.root.children.find(o=>o.name==='remote-avatar-rings');
 const near=()=>avatars.root.children.find(o=>o.name==='remote-avatar-rings-near');
 const labelGroup=()=>avatars.root.children.find(o=>o.name==='remote-avatar-labels');
 const step=(n,dt=.05,local=null)=>{for(let i=0;i<n;i++)avatars.update(dt,poses,camera,false,local);};
 return {mod,state,avatars,camera,poses,look,put,rings,near,labelGroup,step};
}
const ME={x:0,y:0,z:0,hex:'#0072B2'};
const ok=(name,fn)=>{fn();console.log('ok  '+name);};

ok('pools are sized for a 24-member world: rings 25, fields 24, near rings 8, near batch 5, batch 8 (one instanced ring draw call)',()=>{
 const h=harness();
 assert.equal(h.mod.MAX_REMOTE,24);assert.equal(h.rings().instanceMatrix.count,25);assert.equal(h.near().instanceMatrix.count,h.mod.GHOST_RING_CAPACITY);
 assert.equal(h.mod.GHOST_RING_CAPACITY,8);assert.equal(h.mod.GHOST_CAPACITY,5);
 const f=h.avatars.root.children.find(o=>o.isInstancedMesh&&o!==h.rings()&&o!==h.near());assert.ok(f&&f.instanceMatrix.count===24,'force fields: 24');
 const src=read('lib/graphics/remoteAvatars.ts');
 assert(/BATCH_CAPACITY=8/.test(src)&&/playerBatch\(drawn,BATCH_CAPACITY\)/.test(src)&&/playerBatch\(ghostDrawn,GHOST_CAPACITY\)/.test(src),'one batch of 8 + the near batch of 5');
 assert(/ballD2=new Float64Array\(MAX_REMOTE\+12\)/.test(src)&&/candJet\.length<MAX_REMOTE/.test(src)&&/createForceFields\(MAX_REMOTE\)/.test(src));
 // 23 strangers: every one gets a ring in the ONE ring mesh (beyond the rig cap), 5 rigs on a phone at tier 0
 for(let i=1;i<=23;i++){source.pairs.set(i,[1+i%14,i]);h.avatars.upsert(i,h.look,'Nick'+i,{hex:'#0072B2'});const a=i*.27;h.put(i,Math.cos(a)*(3+i),Math.sin(a)*(3+i));}
 h.step(2,.05,ME);
 assert.equal(h.rings().count,24,'23 rings + mine');assert.equal(h.state.created,5,'rig cap 5');assert.ok(h.state.drawn+h.state.ghostDrawn<=8);
 h.avatars.dispose();
});

ok('no allocation in the per-frame path (source pin + a counted run: no canvas, rig or label made while 23 strangers move)',()=>{
 const src=read('lib/graphics/remoteAvatars.ts'),body=src.slice(src.indexOf('update(dt,poses,camera,reduced,local,balls){'),src.indexOf('dispose(){'));
 assert(!/\bnew\s/.test(body),'update: no new');assert(!/\.clone\(|\.map\(|\.filter\(/.test(body),'update: no array copies');
 const ra=src.slice(src.indexOf('function ringAdd'),src.indexOf('function ringsEnd'));assert(!/\bnew\s/.test(ra));
 const rc=read('lib/graphics/rigCap.ts'),pn=rc.slice(rc.indexOf('{',rc.indexOf('export function planNearest')));assert(!/\bnew\s|\.map\(|\.filter\(|=>/.test(pn),'planNearest allocates nothing');
 const h=harness();
 for(let i=1;i<=23;i++){source.pairs.set(i,[2,i]);h.avatars.upsert(i,h.look,'X',{hex:'#009E73'});}
 const walk=t=>{for(let i=1;i<=23;i++){const a=i*.27+t*.2;h.put(i,Math.cos(a)*(4+i*1.5),Math.sin(a)*(4+i*1.5));}};
 walk(0);h.step(30,.05,ME);const c0=canvases,r0=h.state.created,l0=h.labelGroup().children.length;
 for(let k=0;k<400;k++){walk(k*.01);h.avatars.update(.016,h.poses,h.camera,false,ME);}
 assert.equal(canvases,c0,'no canvas made while drawing');assert.equal(h.labelGroup().children.length,l0,'no sprite made while drawing');
 assert.ok(h.state.created-r0<=2,'slow orbit: at most a swap or two, no rig churn (made '+(h.state.created-r0)+')');
 h.avatars.dispose();
});

ok('a stranger label is the generated pair, never the typed name; party friends keep their label',()=>{
 texts.length=0;const h=harness();
 source.pairs.set(1,[7,3]);h.avatars.upsert(1,h.look,'Emma',{hex:'#1B9AAA'});
 source.pairs.delete(2);h.avatars.upsert(2,h.look,'Oliver',{hex:'#E69F00'});// no pair yet: the colour name
 h.put(1,0,-2);h.put(2,1,-2);h.step(2,.05,ME);
 assert.equal(P.worldNameFor([7,3]),'Teal Puffin');
 assert.ok(texts.includes('Teal Puffin'),'label drawn with the pair');assert.ok(texts.includes('Orange'),'no pair: the colour name');
 assert.ok(!texts.some(t=>/Emma|Oliver/.test(t)),'the typed name is never drawn for a stranger');
 // the pair arrives later (a Joined after the upsert): the label follows on the next recheck (once a second)
 source.pairs.set(2,[4,1]);h.step(25,.05,ME);assert.ok(texts.includes('Orange Panda'),'late pair relabels');
 // a re-upsert with a nick changes nothing for a stranger
 const n=texts.length;h.avatars.upsert(1,h.look,'Emma',{hex:'#1B9AAA'});assert.ok(!texts.slice(n).some(t=>/Emma/.test(t)));
 h.avatars.dispose();
 source.pub=false;texts.length=0;const p=harness();p.avatars.upsert(5,p.look,'Emma',{hex:'#1B9AAA'});assert.ok(texts.includes('Emma'),'party friend: the typed name as today');p.avatars.dispose();source.pub=true;
 // the client never sends a nick in a world, and the store keeps none (Agent B's code; pinned here as the drawing's premise)
 const conn=read('lib/multiplayer/connection.ts');assert(/worldOn \? \[C\.Hello, PROTOCOL_VERSION, look, resumeToken, null\]/.test(conn),'world Hello carries no nick');
 assert(/nick: world \? null :/.test(read('lib/multiplayer/store.ts')),'store: no nick in a world');
});

ok('hidden strangers (session Hide / Report) produce no ring, label, bubble, ball or body',()=>{
 const h=harness();
 for(const id of [1,2]){source.pairs.set(id,[1,id]);h.avatars.upsert(id,h.look,'',{hex:'#0072B2'});}
 h.put(1,0,-3);h.put(2,2,-3);h.step(3,.05,ME);
 assert.equal(h.rings().count,3);assert.equal(h.state.drawn,2);
 source.hid.add(2);h.avatars.emote(2,P.Emote.Wave);h.step(3,.05,ME);
 assert.equal(h.rings().count,2,'no ring for the hidden one');assert.equal(h.state.drawn+h.state.ghostDrawn,1,'no body');
 const lg=h.labelGroup().children,vis=lg.filter(s=>s.visible).length;assert.ok(vis<=2,'one label (+ nothing else)');
 assert.equal(h.avatars.emote(2,P.Emote.Cheer),false,'no emote from a hidden stranger');
 h.avatars.update(.05,h.poses,h.camera,false,ME,new Map([[2,{state:P.BallState.Free,x:2,y:.2,z:-3}]]));assert.equal(h.avatars.ballsShown,0,'no ball');
 // the user's own Hide list (setHidden) still works the same way
 source.hid.clear();h.avatars.setHidden(new Set([1]));h.step(2,.05,ME);assert.equal(h.rings().count,2);
 h.avatars.dispose();source.hid.clear();
});

ok('personal space: within 1.2 m (or on a room camera\'s sight line to my spot) a stranger fades to 40% over 0.25 s',()=>{
 const m=harness().mod;
 assert.equal(m.PERSONAL_SPACE_M,1.2);assert.equal(m.PERSONAL_ALPHA,.4);
 let a=1;for(let i=0;i<5;i++)a=m.stepPersonal(a,.4,.05,false);assert.ok(Math.abs(a-.4)<1e-9,'0.25 s to 40%');
 assert.ok(m.stepPersonal(1,.4,.05,false)>.85,'smooth, not a pop');assert.equal(m.stepPersonal(1,.4,.05,true),.4,'reduced motion: at once');
 assert.ok(m.inSightLine(0,10,0,0,0,5),'between the camera and me');assert.ok(m.inSightLine(0,10,0,0,.3,-1),'just past me (the machine I face)');
 assert.ok(!m.inSightLine(0,10,0,0,2,5),'off the line');assert.ok(!m.inSightLine(0,10,0,0,0,-3),'well behind me');assert.ok(!m.inSightLine(0,10,0,0,0,12),'behind the camera');
 const h=harness();source.pairs.set(1,[1,1]);source.pairs.set(2,[2,2]);
 h.avatars.upsert(1,h.look,'',{hex:'#0072B2'});h.avatars.upsert(2,h.look,'',{hex:'#E69F00'});
 h.put(1,.8,0);h.put(2,5,0);h.step(8,.05,ME);
 assert.equal(h.state.ghostDrawn,1,'the near one is drawn in the 40% batch');assert.equal(h.state.drawn,1);assert.equal(h.avatars.ghosts,1);
 assert.equal(h.near().count,1,'its ring in the near-ring mesh');assert.ok(Math.abs(h.near().material.opacity-.4)<1e-6);
 h.put(1,1.6,0);h.step(8,.05,ME);assert.equal(h.state.ghostDrawn,0,'walked away: opaque again');assert.equal(h.near().count,0);assert.equal(h.near().visible,false,'no draw call when nobody is near');
 h.avatars.dispose();
 source.pub=false;const p=harness();p.avatars.upsert(1,p.look,'A',{hex:'#0072B2'});p.put(1,.5,0);p.step(8,.05,ME);assert.equal(p.state.ghostDrawn,0,'party friends never fade');p.avatars.dispose();source.pub=true;
});

ok('rig selection: nearest first with hysteresis (no flicker between two strangers at about the same distance)',()=>{
 const rc=load('lib/graphics/rigCap.ts'),on=s=>s.admitted;
 const S=(admitted,d)=>({admitted,pd2:d*d,plan:0}),order=[];
 let s=[S(true,11),S(false,10)];assert.equal(rc.planNearest(s,order,on,1,1e9,rc.RIG_HYST_M),0,'1 m nearer: no swap');
 s=[S(true,11),S(false,6)];assert.equal(rc.planNearest(s,order,on,1,1e9,rc.RIG_HYST_M),2);assert.deepEqual(s.map(x=>x.plan),[-1,1],'5 m nearer: swap');
 s=[S(true,30),S(true,31),S(false,3),S(false,4)];rc.planNearest(s,order,on,2,1e9,4,1);assert.equal(s.filter(x=>x.plan!==0).length,2,'one swap per recheck');
 s=[S(true,Infinity),S(false,50)];rc.planNearest(s,order,on,1,1e9,4);assert.deepEqual(s.map(x=>x.plan),[-1,1],'a held slot with no pose loses it');
 s=[S(true,5),S(true,6),S(true,7)];rc.planNearest(s,order,on,1,1e9,4);assert.deepEqual(s.map(x=>x.plan),[0,-1,-1],'over the cap: farthest dropped');
 s=[S(false,5),S(false,9),S(false,Infinity)];rc.planNearest(s,order,on,2,1e9,4);assert.deepEqual(s.map(x=>x.plan),[1,1,0],'under the cap: nearest taken');
 // layer: tier 3 (cap 1), two strangers trading places by 0.5 m every second: the rig is never re-made
 const h=harness();h.state.tier=3;
 for(const id of [1,2]){source.pairs.set(id,[1,id]);h.avatars.upsert(id,h.look,'',{hex:'#0072B2'});}
 const made0=h.state.created;
 for(let k=0;k<12;k++){h.put(1,0,-(8+(k%2)*.5));h.put(2,.5,-(8.5-(k%2)*.5));h.step(20,.05,ME);}
 assert.equal(h.state.created,made0,'no flicker: the same stranger keeps the rig');
 // a much nearer stranger does take it (within ~1 s)
 h.put(2,.5,-2);h.step(25,.05,ME);assert.equal(h.state.created,made0+1,'the nearest wins after the hysteresis');
 h.avatars.dispose();h.state.tier=0;
});

ok('room cap: at most 6 strangers drawn in a room, nearest first (rigs within the tier cap, the rest rings)',()=>{
 const h=harness({room:true});h.camera.position.set(0,6,7);h.camera.lookAt(0,0,0);h.camera.updateMatrixWorld();
 for(let i=1;i<=10;i++){source.pairs.set(i,[1,i]);h.avatars.upsert(i,h.look,'',{hex:'#0072B2'});h.put(i,(i%3)-1,-(i*.6));}
 h.step(25,.05,ME);
 const d=h.avatars.debugPublic();assert.equal(d.room,true);assert.equal(h.rings().count+h.near().count,7,'6 strangers + my ring');
 assert.ok(h.state.drawn+h.state.ghostDrawn<=5);
 // the drawn ones are the nearest: move the far four right next to me (but not within 1.2 m) -> they take over within ~2 s
 for(let i=7;i<=10;i++)h.put(i,(i-8.5)*.9,1.6);for(let i=1;i<=6;i++)h.put(i,(i%3)-1,-(5+i));
 h.step(120,.05,ME);
 const lg=h.labelGroup().children.filter(c=>c.name==='remote-name'&&c.visible).map(c=>Math.hypot(c.position.x,c.position.z));
 assert.ok(lg.length<=6);assert.equal(h.rings().count+h.near().count,7,'still 6 drawn');
 assert.ok(lg.filter(d=>d<3).length===4,"the 4 who came near are drawn (one swap a second)");assert.equal(h.avatars.emote(6,P.Emote.Wave),false,'emotes from strangers not drawn here leave nothing');
 h.avatars.dispose();
 source.pub=false;const p=harness({room:true});for(let i=1;i<=10;i++){p.avatars.upsert(i,p.look,'F',{hex:'#0072B2'});p.put(i,(i%3)-1,-(i*.6));}p.step(25,.05,ME);
 assert.equal(p.rings().count,11,'a party in a room keeps today\'s rule (no room cap)');p.avatars.dispose();source.pub=true;
});

ok('stranger emotes: at most 6 a minute per sender reach the scene; a dropped one draws nothing',()=>{
 const h=harness();source.pairs.set(1,[1,1]);h.avatars.upsert(1,h.look,'',{hex:'#0072B2'});h.put(1,0,-3);h.step(2,.05,ME);
 const got=[];for(let i=0;i<8;i++){got.push(h.avatars.emote(1,P.Emote.Wave));h.step(1,1,ME);}
 assert.deepEqual(got,[true,true,true,true,true,true,false,false]);
 for(let i=0;i<60;i++)h.step(1,1,ME);assert.equal(h.avatars.emote(1,P.Emote.Wave),true,'a minute later: allowed again');
 assert.equal(read('lib/graphics/remoteAvatars.ts').match(/STRANGER_EMOTES_PER_MIN=6/g).length,1);
 h.avatars.dispose();
});

ok('fade out: leaving / Just me fades everyone over ~1 s and frees the pools (rigs, rings, labels)',()=>{
 const h=harness();
 for(let i=1;i<=23;i++){source.pairs.set(i,[1,i]);h.avatars.upsert(i,h.look,'',{hex:'#0072B2'});h.put(i,(i%5)*2-4,-2-i);}
 h.step(5,.05,ME);assert.equal(h.state.live.size,5);
 for(let i=1;i<=23;i++){h.avatars.remove(i);h.poses.delete(i);}// "Just me": the store empties, the poses go
 assert.equal(h.avatars.fading,true);h.step(2,.05,ME);assert.ok(h.state.drawn>0,'still fading at their last spot');
 h.step(20,.05,ME);
 assert.equal(h.avatars.fading,false);assert.equal(h.state.live.size,0,'every rig released');assert.equal(h.rings().count,1,'only my ring left');
 assert.equal(h.labelGroup().children.length,0,'every label sprite released');assert.equal(h.state.drawn+h.state.ghostDrawn,0);
 // the bridge's last flush frame (reduced) frees at once
 for(let i=1;i<=3;i++){h.avatars.upsert(i,h.look,'',{hex:'#0072B2'});h.put(i,i,-3);}h.step(2,.05,ME);
 for(let i=1;i<=3;i++){h.avatars.remove(i);h.poses.delete(i);}h.avatars.update(.016,h.poses,h.camera,true,null);
 assert.equal(h.avatars.fading,false);assert.equal(h.state.live.size,0);
 // an id reused while the old one fades is a new stranger (own label), the old one still fades out
 h.avatars.upsert(4,h.look,'',{hex:'#0072B2'});h.put(4,0,-3);h.step(2,.05,ME);h.avatars.remove(4);source.pairs.set(4,[2,9]);h.avatars.upsert(4,h.look,'',{hex:'#009E73'});
 h.step(25,.05,ME);assert.equal(h.labelGroup().children.filter(c=>c.name==='remote-name').length,1);
 h.avatars.dispose();
 source.pub=false;const p=harness();p.avatars.upsert(1,p.look,'A',{hex:'#0072B2'});p.put(1,0,-3);p.step(2);p.avatars.remove(1);assert.equal(p.avatars.fading,false,'party friends leave as today');p.avatars.dispose();source.pub=true;
});

ok('far cut-off: a stranger fades over the last 10 m before 160 m',()=>{
 const m=harness().mod;assert.equal(m.farFade(100*100),1);assert.equal(m.farFade(150*150),1);assert.ok(Math.abs(m.farFade(155*155)-.5)<1e-9);assert.equal(m.farFade(161*161),0);
});

ok('stranger rules: no map dots, no bumps, no knock-overs, no room duets',()=>{
 const dots=read('components/FriendMapDots.tsx');
 assert(/const partyLive=\(\)=>\{const s=partyStore\.get\(\)\.status;return \(s==='live'\|\|s==='reconnecting'\)&&!publicDraw\.isPublic\(\);\};/.test(dots),'map dots: party friends only');
 assert(/function readDots\(\):FriendDot\[\]\{if\(!partyLive\(\)\)return NONE;/.test(dots)&&/setHas\(partyLive\(\)&&/.test(dots));
 const src=read('lib/graphics/remoteAvatars.ts');assert(/bumps\.detect\(dt,list,poses,local,reduced,saver\|\|pub\)/.test(src),'no bumps while public');
 const h=harness();source.pairs.set(1,[1,1]);h.avatars.upsert(1,h.look,'',{hex:'#0072B2'});h.put(1,0,-3);h.step(2,.05,ME);
 assert.equal(h.avatars.tumble(1,0,false),false,'no knock-over');h.avatars.dispose();
 const r=harness({room:true});source.pairs.set(1,[1,1]);r.avatars.upsert(1,r.look,'',{hex:'#0072B2'});r.put(1,0,-2);r.step(2,.05,ME);assert.equal(r.avatars.duet(1,-1,0,P.Emote.PassBall,1),false,'no stranger duets indoors');r.avatars.dispose();
});
console.log('mp-public-draw: all passed');
