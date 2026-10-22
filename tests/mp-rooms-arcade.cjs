// Arcade multiplayer-room prep (docs/multiplayer-rooms-design.md Phase 3 "Arcade prep status"): descriptor, busy mapping,
// hub hooks, crowd replacement, spawn slots, island door hint. Pure: no browser, no relay.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function resolve(from,n){const base=n.startsWith('@/')?path.join(ROOT,n.slice(2)):path.resolve(path.dirname(from),n);for(const ext of ['.ts','.tsx','/index.ts',''])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return base+ext;throw new Error('cannot resolve '+n+' from '+from);}
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')||n.startsWith('@/')?load(resolve(file,n)):require(n),console,Math,Map,WeakMap,Set,Float64Array,Float32Array,Uint16Array,URLSearchParams,Object,Array,JSON,Number,String,Infinity,NaN});return m.exports;}
// vm objects come from another realm: compare by value.
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const A=load(path.join(ROOT,'lib/multiplayer/rooms/arcade.ts')),{arcadeCabinets,arcadeHubCabinets}=load(path.join(ROOT,'lib/arcade/arcadeCatalog.ts'));
const R=A.ARCADE_ROOM,B=R.bounds,inside=(p,m=0)=>p.x>=B.minX-m&&p.x<=B.maxX+m&&p.z>=B.minZ-m&&p.z<=B.maxZ+m;

// 1. Descriptor shape and geometry.
{
 const {Activity}=load(path.join(ROOT,'multiplayer/protocol/presence.ts'));
 assert.equal(R.code,5);assert.equal(R.code,Activity.Arcade,'room code = Activity.Arcade (old clients print the room)');
 assert(R.code>=0&&R.code<=255,'fits the speed byte');assert.equal(R.scale,1);assert.equal(R.route,'/arcade');
 assert(B.minX<B.maxX&&B.minZ<B.maxZ);const halfX=Math.max(-B.minX,B.maxX),halfZ=Math.max(-B.minZ,B.maxZ);assert(halfX<40&&halfZ<40,'rooms < 40 m (wire x/z = m*10 stays well inside WORLD_BOUNDS)');
 assert(halfX+3<=18&&halfZ+3<=16,'inside the relay v1.1 ROOM_BOUNDS for the Arcade (18 x 16 m half extents)');
 assert(inside(R.spawn)&&inside(R.door),'spawn and door inside bounds');
 for(const a of R.areas){assert(inside(a),`area ${a.id} inside bounds`);assert(a.r>0&&a.label);if(a.kind==='cabinet')assert(inside({x:a.standX,z:a.standZ}),`${a.id} stand spot inside bounds`);}
 same(R.areas.filter(a=>a.kind==='cabinet').map(a=>a.id),arcadeCabinets.map(c=>c.id),'one cabinet area per catalog cabinet');
 assert(R.spawnSlots.length>=R.caps.friendsMax+1,'a slot for the local player and every drawn friend');
 for(const [i,s] of R.spawnSlots.entries()){assert(inside(s),'slot inside bounds');assert(!(Math.abs(s.x)<R.exit.halfWidth&&s.z>R.exit.z),'slot clear of the exit trigger');
  for(const c of arcadeHubCabinets())assert(Math.hypot(s.x-c.x,s.z-c.z)>1.5,'slot clear of cabinets');
  for(let j=0;j<i;j++)assert(Math.hypot(s.x-R.spawnSlots[j].x,s.z-R.spawnSlots[j].z)>=.9,'slots never overlap (body 0.84 m)');}
 same(R.spawnSlots[0],{x:R.spawn.x,z:R.spawn.z});
 // Drift guards: the descriptor mirrors the hub's literals.
 const scene=src('lib/arcade/arcadeRoomScene.ts'),props=src('lib/arcade/arcadeRoomProps.ts'),crowd=src('lib/arcade/arcadeRoomCrowd.ts');
 assert(scene.includes(`clamp(x+vx*dt,${B.minX},${B.maxX})`)&&scene.includes(`clamp(z+vz*dt,${B.minZ},${B.maxZ})`),'bounds = the hub movement clamp');
 assert(scene.includes(`hubBounds={minX:${B.minX},maxX:${B.maxX},minZ:${B.minZ},maxZ:${B.maxZ}}`),'host bounds = descriptor bounds');
 assert(scene.includes(`x=start?.x??${R.spawn.x},z=start?.z??${R.spawn.z}`)&&scene.includes('yaw=Math.PI'),'spawn = the hub default start');
 assert(scene.includes(`Math.abs(x)<${R.exit.halfWidth}&&z>${R.exit.z}`),'exit trigger');
 assert(scene.includes('x:c.x+Math.sin(c.yaw)*1.8,z:c.z+Math.cos(c.yaw)*1.8'),'stand spot = walkTo destination');
 assert(scene.includes('const cabinets=arcadeHubCabinets();'),'scene and descriptor share the hub cabinet layout');
 assert(props.includes('place(10,-9.6,13,-2,-Math.PI/3)')&&props.includes('interactionPoint:prizePoint(10,-6.1)'),'prize counter transform unchanged');
 const m=new T.Matrix4().makeTranslation(13,0,-2).multiply(new T.Matrix4().makeRotationY(-Math.PI/3)).multiply(new T.Matrix4().makeTranslation(-10,0,9.6)),p=new T.Vector3(10,0,-6.1).applyMatrix4(m),counter=R.areas.find(a=>a.id==='prize-counter');
 assert(Math.abs(counter.x-p.x)<1e-9&&Math.abs(counter.z-p.z)<1e-9,'prize counter = arcadeRoomProps interaction point');
 assert(crowd.includes(`Math.min(mobile?${R.caps.npcBasePhone}:${R.caps.npcBaseDesktop},stations.length)`),'crowd base counts');
 assert.equal(A.arcadeCrowdCount(true,0),3);assert.equal(A.arcadeCrowdCount(false,2),3);assert.equal(A.arcadeCrowdCount(true,7),0);
 assert(R.wake.remoteFpsPhone<=20&&R.wake.remoteSettleMs<=300&&R.wake.sleepsWhenIdle===false);
 console.log('MP_ROOMS_ARCADE_DESCRIPTOR_PASS',JSON.stringify({areas:R.areas.length,slots:R.spawnSlots.length}));
}

// 2. Busy mapping covers every flag of the page and every game.
{
 const page=src('components/ArcadeRoom.tsx'),flags=[...page.matchAll(/\[(\w+),set\w+\]=useState/g)].map(m=>m[1]);
 assert(flags.length>=12,'source scan found the page state');const busy=R.busy.map(b=>b.flag);
 for(const f of flags)assert(busy.includes(f)!==R.notBusy.includes(f),`page flag "${f}" is classified exactly once (busy or not)`);
 for(const f of [...busy,...R.notBusy])assert(flags.includes(f),`descriptor flag "${f}" exists in ArcadeRoom.tsx`);
 same([...busy].sort(),['game','hall','list']);assert(page.includes('setCovered(list||hall)'),'list / hall are the covered overlays');
 const ids=arcadeCabinets.map(c=>c.id),pageIds=new Set([...page.matchAll(/game===['"](\w+)['"]/g)].map(m=>m[1]));
 for(const id of pageIds)assert(ids.includes(id),`page game "${id}" is a catalog cabinet`);
 const games=fs.readdirSync(path.join(ROOT,'components/games')).join(' ');assert(games.includes('ArcadeGame3D')&&games.includes('PassPuzzleGame'));
 const out=A.createArcadeBusyPose();
 for(const c of arcadeCabinets){
  assert.equal(A.ARCADE_GAME_LABEL[c.id],`Playing ${c.name}`);
  assert.equal(A.arcadeBusyPose({game:c.id,list:false,hall:false},{x:-5,z:5,yaw:0},out),out);
  assert(out.busy&&out.flag==='game'&&out.game===c.id);const area=R.areas.find(a=>a.id===c.id);assert.equal(out.x,area.standX);assert.equal(out.z,area.standZ);
  assert.equal(A.arcadeBusyLabel(out.x,out.z),`Playing ${c.name}`);assert.equal(A.arcadeBusyCabinet(out.x,out.z),c.id);
  // ?game= deep link: no hub pose yet, still at the cabinet.
  A.arcadeBusyPose({game:c.id,list:true,hall:true},null,out);assert.equal(out.flag,'game','a running game wins over overlays');assert.equal(A.arcadeBusyCabinet(out.x,out.z),c.id);
  // An overlay opened while standing on the stand spot is nudged off it: never mislabelled as "Playing".
  for(const flag of ['hall','list']){A.arcadeBusyPose({game:null,list:flag==='list',hall:flag==='hall'},{x:area.standX+.05,z:area.standZ,yaw:1},out);assert.equal(out.flag,flag);assert.equal(A.arcadeBusyCabinet(out.x,out.z),null);assert.equal(A.arcadeBusyLabel(out.x,out.z),'Looking at high scores');assert(inside(out));}
 }
 A.arcadeBusyPose({game:null,list:true,hall:true},{x:3,z:3,yaw:2},out);assert.equal(out.flag,'hall');assert.equal(out.label,'Looking at high scores');same([out.x,out.z,out.yaw],[3,3,2],'overlay keeps the spot');
 A.arcadeBusyPose({game:null,list:true,hall:false},{x:3,z:3,yaw:2},out);assert.equal(out.label,'Choosing a game');
 A.arcadeBusyPose({game:null,list:false,hall:false},{x:3,z:3,yaw:2},out);assert.equal(out.busy,false);
 assert.equal(A.arcadeAreaAt(-12,8.5).id,'claw');assert.equal(A.arcadeAreaAt(0,0),null);
 const c=A.clampArcade({x:99,z:-99});same(c,{x:B.maxX,z:B.minZ});
 console.log('MP_ROOMS_ARCADE_BUSY_PASS',JSON.stringify({flags:flags.length,games:arcadeCabinets.length}));
}

// 3. Hooks: no-op without a layer; attach / detach lifecycle; last pose survives the hub.
{
 const H=load(path.join(ROOT,'lib/arcade/arcadeRoomHooks.ts'));H.resetArcadeRoomHooks();
 assert.equal(H.arcadeLayerFrame(1/15,0),false);H.setArcadeBusy('pinball',false,false);H.setArcadeBusy(null,false,false);H.arcadeRoomHooks.wake();H.arcadeRoomHooks.setFriendSlots(3);
 const pose={x:0,z:0,yaw:0,moving:false,speed:0};assert.equal(H.arcadeRoomHooks.pose(pose),null,'no hub, no pose');
 const calls=[];let px=1,pz=2;const host={scene:{},camera:{},playerRoot:{},mobile:true,covered:false,sleeping:false,bounds:R.bounds,pose(o){o.x=px;o.z=pz;o.yaw=.5;o.moving=false;o.speed=0;return o;},wakeRemote(ms){calls.push(['wake',ms]);},setFriendSlots(n){calls.push(['slots',n]);}};
 const unregister=H.registerArcadeHost(host);assert.equal(H.arcadeLayerFrame(1/15,0),false,'hub alone: still a no-op');assert.equal(calls.length,0);
 const seen=[];let keep=true;const detach=H.attachArcadeLayer({attach(h){seen.push(h);},frame(){return keep;},busy(b){seen.push({...b});}});
 assert.equal(seen[0],host);assert.equal(H.arcadeLayerFrame(1/30,10),true);keep=false;assert.equal(H.arcadeLayerFrame(1/30,20),false);
 H.arcadeRoomHooks.wake(250);H.arcadeRoomHooks.setFriendSlots(2);same(calls,[['wake',250],['slots',2]]);
 H.setArcadeBusy('runner',false,false);same(seen.at(-1),{game:'runner',list:false,hall:false});const n=seen.length;H.setArcadeBusy('runner',false,false);assert.equal(seen.length,n,'unchanged flags do not re-fire');
 px=7;pz=-3;unregister();assert.equal(seen.at(-1),null,'game replaced the hub: layer told');assert.equal(H.arcadeRoomHooks.host,null);
 px=0;assert.equal(H.arcadeRoomHooks.pose(pose),pose);same([pose.x,pose.z,pose.yaw],[7,-3,.5],'last hub pose kept for the beat');
 const again=H.registerArcadeHost(host);detach();same(calls.at(-1),['slots',0],'detach restores every visitor');assert.equal(H.arcadeLayerFrame(1,1),false);again();H.resetArcadeRoomHooks();
 // Scene wiring: registration once at build, frame hook inside tick, unregister in dispose, remote cadence only via the layer.
 const scene=src('lib/arcade/arcadeRoomScene.ts'),tick=scene.slice(scene.indexOf('function tick('),scene.indexOf('function myJugglePoint'));
 assert.equal(scene.split('registerArcadeHost(').length,2,'registered once');assert(!tick.includes('registerArcadeHost('));assert(tick.includes('if(arcadeLayerFrame(dt,now))remoteHold='));
 assert(scene.includes('dispose(){unregisterHost();'));assert(src('components/ArcadeRoom.tsx').includes('useEffect(()=>setArcadeBusy(game,list,hall),[game,list,hall]);'));
 console.log('MP_ROOMS_ARCADE_HOOKS_PASS');
}

// 4. No per-frame allocation in the hooks and helpers (source scan of the per-frame bodies + same-object returns).
{
 const bodyOf=(text,name)=>{const at=text.search(new RegExp(`(function ${name}\\(|\\b${name}\\([^)]*\\)(:[^{]*)?\\{)`));assert(at>=0,name);let i=text.indexOf('{',text.indexOf(')',at)),depth=0,start=i;for(;i<text.length;i++){if(text[i]==='{')depth++;else if(text[i]==='}'&&--depth===0)break;}return text.slice(start+1,i);};
 const banned=/\bnew\s|=>|\.\.\.|\[\s*\]|\{\s*\w+\s*:|\.(map|filter|slice|concat|reduce|forEach)\(|`/;
 const room=src('lib/multiplayer/rooms/arcade.ts'),hooks=src('lib/arcade/arcadeRoomHooks.ts'),hint=src('lib/town/arcadeDoorHint.ts');
 for(const name of ['arcadeBusyLabel','arcadeBusyCabinet','arcadeAreaAt','clampArcade','pickArcadeSpawn','arcadeWalkIn'])assert(!banned.test(bodyOf(room,name)),`${name} allocates`);
 const busyBody=bodyOf(room,'arcadeBusyPose');assert(!/\bnew\s|=>|\.\.\.|\{\s*\w+\s*:|\.(map|filter|slice)\(/.test(busyBody),'arcadeBusyPose allocates');
 for(const name of ['arcadeLayerFrame','setArcadeBusy'])assert(!banned.test(bodyOf(hooks,name)),`${name} allocates`);
 assert(!banned.test(bodyOf(hooks,'pose')));
 const hintBody=bodyOf(hint,'arcadeDoorHint');assert(!/\bnew\s|=>|\.\.\.|\{\s*\w+\s*:/.test(hintBody),'door hint allocates');
 const scene=src('lib/arcade/arcadeRoomScene.ts'),hostPose=scene.slice(scene.indexOf('pose(out:ArcadeHubPose){'),scene.indexOf('},wakeRemote,'));assert(hostPose.length>10&&!banned.test(hostPose.replace('pose(out:ArcadeHubPose){','')),'host pose allocates');
 const p={x:0,z:0,yaw:0};assert.equal(A.clampArcade(p),p);assert.equal(A.pickArcadeSpawn([],0,p),p);assert.equal(typeof A.arcadeWalkIn(1,1,0,p),'boolean');
 console.log('MP_ROOMS_ARCADE_NO_ALLOC_PASS');
}

// 5. Spawn slots when several enter at once; walk-in from the door.
{
 const out={x:0,z:0},friends=new Float64Array(18);same(A.pickArcadeSpawn(friends,0,out),{x:0,z:10.3});
 const taken=[];for(let k=0;k<R.spawnSlots.length;k++){A.pickArcadeSpawn(friends,k,out);assert(inside(out));for(const t of taken)assert(Math.hypot(t.x-out.x,t.z-out.z)>=.9,'each newcomer gets a free slot');taken.push({...out});friends[k*2]=out.x;friends[k*2+1]=out.z;}
 A.pickArcadeSpawn(friends,R.spawnSlots.length,out);assert(inside(out)&&!(Math.abs(out.x)<R.exit.halfWidth&&out.z>R.exit.z),'overflow stays inside, off the exit');
 const w={x:0,z:0,yaw:0};assert.equal(A.arcadeWalkIn(1.2,10.3,0,w),true);assert(Math.abs(w.z-(R.door.z-.4))<1e-9);assert(inside(w));for(let t=0;t<1;t+=.1){A.arcadeWalkIn(1.2,10.3,t,w);assert(inside(w));}assert.equal(A.arcadeWalkIn(1.2,10.3,.9,w),false);same([w.x,w.z],[1.2,10.3]);
 console.log('MP_ROOMS_ARCADE_SPAWN_PASS');
}

// 6. Crowd replacement: friends replace visitors (walk out, cost nothing), and restoring brings every visitor back.
{
 const {createArcadeRoomCrowd}=load(path.join(ROOT,'lib/arcade/arcadeRoomCrowd.ts'));
 for(const mobile of [true,false]){
  const scene=new T.Scene(),cabinets=arcadeHubCabinets(),crowd=createArcadeRoomCrowd({scene,mobile,cabinets,bounds:R.bounds}),base=mobile?3:5,children=scene.children.length,refs=[...crowd.debugStates];
  let t=0;const run=(sec,check)=>{for(let f=0;f<sec*30;f++){crowd.update(1/30,t,99,99);t+=1/30;check?.();}};
  const live=()=>refs.filter(s=>!s.away),bodies=()=>{const l=live();for(const s of l)assert(inside(s),'visible visitors stay inside');for(let i=0;i<l.length;i++)for(let j=0;j<i;j++)assert(Math.hypot(l[i].x-l[j].x,l[i].z-l[j].z)>=.829,'no overlap');};
  run(4,bodies);assert.equal(live().length,base);
  crowd.setFriendSlots(2);assert.equal(crowd.friendSlots,2);run(40,bodies);
  assert.equal(refs.filter(s=>s.away).length,2,'two visitors replaced by friends');assert.equal(scene.children.length,children,'no objects added or removed');
  const hidden=scene.children.filter(o=>o.name.startsWith('arcade-visitor-')&&!o.visible).length;assert.equal(hidden,2,'replaced rigs hidden (no rig update cost)');
  for(const s of refs.filter(s=>s.away))assert(s.z>1000,'parked far away: room proximity / collisions never see it');
  const snap=JSON.stringify(refs.filter(s=>s.away));run(2);assert.equal(JSON.stringify(refs.filter(s=>s.away)),snap,'away visitors do not animate');
  let played=false;run(20,()=>{played||=live().some(s=>s.phase==='play');});assert(played,'the rest keep playing');
  crowd.setFriendSlots(99);run(40,bodies);assert.equal(refs.filter(s=>s.away).length,base,'all visitors can be replaced (count = max(0, base - friends))');
  crowd.setFriendSlots(0);const playedAgain=new Set();run(60,()=>{bodies();refs.forEach((s,i)=>{if(s.phase==='play')playedAgain.add(i);});});
  assert.equal(live().length,base,'every visitor restored');assert(scene.children.every(o=>o.visible),'all rigs visible again');assert.equal(playedAgain.size,base,'restored visitors walk in and play at cabinets again');
  // A visitor in a social exchange with the player is never taken mid-exchange.
  crowd.reserve(0,{seconds:5});crowd.setFriendSlots(base);run(30);assert.equal(refs[0].away,false,'engaged visitor stays');crowd.release(0);run(30);assert.equal(refs[0].away,true,'and leaves once free');
  crowd.setFriendSlots(0);run(60);crowd.dispose();assert.equal(scene.children.length,0);
 }
 console.log('MP_ROOMS_ARCADE_CROWD_SWAP_PASS');
}

// 7. Island door hint.
{
 let H;try{H=load(path.join(ROOT,'lib/town/arcadeDoorHint.ts'));}catch(e){throw new Error('door hint module must load in node: '+e.message);}
 const {ARCADE_DOOR}=load(path.join(ROOT,'lib/town/venues.ts')),out=H.createArcadeDoorHint();same([out.x,out.z],[ARCADE_DOOR.x,ARCADE_DOOR.z]);
 assert.equal(H.arcadeDoorHint([5,-1,5,6],4,out),out);same([out.visible,out.count,out.text],[true,2,'2 in the Arcade']);
 H.arcadeDoorHint([5,-1,5,6],1,out);assert.equal(out.text,'1 in the Arcade');H.arcadeDoorHint([-1,6],2,out);same([out.visible,out.count],[false,0]);
 assert(!/[^\x20-\x7e]/.test(H.arcadeDoorHintText(3)),'plain fixed text');
 console.log('MP_ROOMS_ARCADE_DOOR_HINT_PASS');
}
