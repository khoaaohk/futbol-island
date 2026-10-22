// Museum room prep (docs/multiplayer-rooms-design.md Phase 2 "Museum prep status"): the room descriptor, spawn slots, busy table
// (checked against a source scan of MuseumRoom.tsx), the station line, the island door hint, and the scene hooks (no-op without
// a layer, no per-frame allocation, wired into museumScene.ts without changing the sleep rule).
// usage: node tests/mp-rooms-museum.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const R=require('../lib/multiplayer/rooms/museum.ts'),H=require('../lib/multiplayer/rooms/museumHooks.ts');
const L=require('../lib/museum/museumLayout.ts'),X=require('../lib/endgame/museum.ts'),Dr=require('../lib/museum/museumDoors.ts');
const {Activity}=require('../multiplayer/protocol/presence.ts'),{WORLD_BOUNDS}=require('../multiplayer/protocol/limits.ts');
const D=R.MUSEUM_ROOM,inR=(r,x,z)=>x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ,inArea=(x,z)=>D.areas.some(a=>inR(a.rect,x,z));
let n=0;const t=(name,fn)=>{fn();n++;console.log('PASS '+name);};

t('descriptor: code, shape, bounds inside the wire and relay v1.1 box',()=>{
 assert.equal(D.code,6);assert.equal(D.code,Activity.Museum,'room code = Activity.Museum (old clients print "In the museum")');
 assert.equal(D.id,'museum');assert.equal(D.scale,1);
 for(const k of ['code','id','name','scale','bounds','areas','galleries','door','spawns','wake','caps','busy'])assert.ok(k in D,k);
 const b=D.bounds;assert.deepEqual([b.minX,b.maxX,b.minZ,b.maxZ],[L.FLOOR.minX,L.FLOOR.maxX,L.FLOOR.minZ,L.FLOOR.maxZ]);
 for(const a of D.areas){assert.ok(a.rect.minX>=b.minX&&a.rect.maxX<=b.maxX&&a.rect.minZ>=b.minZ&&a.rect.maxZ<=b.maxZ,a.id);}
 assert.ok(Math.max(-b.minX,b.maxX)<=25-3&&Math.max(-b.minZ,b.maxZ+1)<=22-3,'inside the relay v1.1 ROOM_BOUNDS (25 x 22 incl. 3 m margin)');
 assert.ok(b.minX*10>=WORLD_BOUNDS.minX&&b.maxX*10<=WORLD_BOUNDS.maxX&&b.minZ*10>=WORLD_BOUNDS.minZ&&(b.maxZ+1)*10<=WORLD_BOUNDS.maxZ,'x/z dm inside WORLD_BOUNDS');
 assert.deepEqual(D.wake,{remote:true,remoteFpsPhone:20,settleMs:300,batterySaver:false});
 assert.ok(D.caps.max<=5&&D.caps.fieldR===.8&&D.caps.stationR===2.5);
 assert.match(read('lib/museum/museumScene.ts'),/const MUSEUM_REMOTE_FPS=20;/,'scene remote fps matches the descriptor');
});

t('galleries: every gallery listed, inside bounds, holding its cases',()=>{
 assert.deepEqual(D.galleries.map(g=>g.id),[...L.GALLERY_ORDER]);
 assert.deepEqual([...D.galleries.map(g=>g.id)].sort(),X.GALLERIES.map(g=>g.id).sort(),'every museum gallery has a sub-area');
 for(const g of D.galleries){const r=g.rect;assert.ok(inR(D.bounds,r.minX,r.minZ)&&inR(D.bounds,r.maxX,r.maxZ),g.id+' inside bounds');
  const cases=X.EXHIBITS.filter(e=>e.gallery===g.id&&L.CASE_PLACES[e.id]);assert.ok(cases.length>0,g.id+' has cases');
  for(const e of cases){const p=L.CASE_PLACES[e.id];assert.ok(inR(r,p.x,p.z)&&inArea(p.x,p.z),e.id+' in '+g.id);}}
});

t('spawn slots: inside, walkable, apart, reachable from the door',()=>{
 const S=D.spawns;assert.ok(S.length>=6,'room for a full museum party (2-6) plus you');
 assert.deepEqual([S[0].x,S[0].z],[R.MUSEUM_ARRIVAL.x,R.MUSEUM_ARRIVAL.z],'slot 0 = today\'s arrival point');
 assert.ok(inR(D.bounds,D.door.x,D.door.z-.3)&&R.museumWalkable(D.door.x,D.door.z),'door sill walkable');
 for(const s of S){assert.ok(inArea(s.x,s.z),'in an area');assert.ok(R.museumWalkable(s.x,s.z),`slot ${s.x},${s.z} walkable`);assert.equal(s.yaw,Math.PI);
  const c=R.clampToMuseum({x:0,z:0},s.x,s.z);assert.ok(Math.abs(c.x-s.x)<1e-9&&Math.abs(c.z-s.z)<1e-9,'clamp leaves a slot alone');
  // walk-in = the scene's: sill -> today's arrival point -> the slot (museumScene arrive(): route=[slot])
  const A=R.MUSEUM_ARRIVAL;for(let k=0;k<=20;k++){const u=k/20;assert.ok(R.museumWalkable(D.door.x+(A.x-D.door.x)*u,D.door.z+(A.z-D.door.z)*u)&&R.museumWalkable(A.x+(s.x-A.x)*u,A.z+(s.z-A.z)*u),'walk-in to '+s.x+','+s.z);}}
 for(let i=0;i<S.length;i++)for(let j=i+1;j<S.length;j++)assert.ok(Math.hypot(S[i].x-S[j].x,S[i].z-S[j].z)>=.8,`slots ${i},${j} apart`);
 const o={x:0,z:0,yaw:0};
 assert.equal(R.pickMuseumSpawn(o,[]),o,'writes out');assert.deepEqual([o.x,o.z],[S[0].x,S[0].z]);
 R.pickMuseumSpawn(o,[{x:S[0].x+.1,z:S[0].z}]);assert.deepEqual([o.x,o.z],[S[1].x,S[1].z],'next free slot');
 R.pickMuseumSpawn(o,S,3);assert.deepEqual([o.x,o.z],[S[3].x,S[3].z],'all taken: seeded slot');
 R.pickMuseumSpawn(o,S,-1);assert.deepEqual([o.x,o.z],[S.at(-1).x,S.at(-1).z]);
});

t('clamp: friends kept inside the L (door sill allowed)',()=>{
 const o={x:0,z:0};
 for(const [x,z] of [[-40,-40],[40,40],[-30,30],[20,-3],[-15,30],[5,9],[0,12],[-11.9,7.99]]){R.clampToMuseum(o,x,z);assert.ok(inR(D.bounds,o.x,o.z)&&(inArea(o.x,o.z)||Math.abs(o.x-D.door.x)<L.ROOM.doorHalf&&o.z<=L.ROOM.halfD+.5),`${x},${z} -> ${o.x},${o.z}`);}
 R.clampToMuseum(o,0,12);assert.ok(o.z>L.ROOM.halfD&&o.z<=L.ROOM.halfD+.5,'door gap');R.clampToMuseum(o,6,12);assert.equal(o.z,L.ROOM.halfD-.6,'wall beside the door');
 R.clampToMuseum(o,-18,30);assert.equal(o.z,L.WING.z1-.6,'wing back wall');
 assert.match(read('lib/museum/museumScene.ts'),/x=T\.MathUtils\.clamp\(x,FLOOR\.minX\+\.6,W-\.6\);z=T\.MathUtils\.clamp\(z,-D\+\.6,x<WX1\?WZ1-\.6:Math\.abs\(x-ROOM\.doorX\)<ROOM\.doorHalf-\.15\?D\+\.5:D-\.6\)/,'same rule as the scene collide()');
});

t('busy table covers every museum busy flag (source scan)',()=>{
 const src=read('components/MuseumRoom.tsx'),cov=src.match(/const covered=([^;]+);/);assert.ok(cov,'covered expression found');
 const flags=new Set([...cov[1].matchAll(/[A-Za-z_]\w*/g)].map(m=>m[0]).filter(w=>!['false','true','null'].includes(w)));
 assert.match(src,/useState<MuseumZoomView\|null>/);flags.add('zoom');// exhibit zoom (not a cover: the hall stays live)
 const table=new Set(D.busy.map(b=>b.flag));for(const f of flags)assert.ok(table.has(f),'busy table has '+f);
 for(const f of table)assert.ok(flags.has(f),f+' is a real MuseumRoom flag');
 const set=src.match(/museumRoomHooks\.setBusy\(([^)]*\))[^)]*\)/);assert.ok(set,'MuseumRoom writes the flags');for(const f of flags)assert.ok(set[1].includes(f),'setBusy passes '+f);
 const f=R.museumBusyFlags();assert.equal(R.museumBusyText(f),'');assert.equal(R.museumBusyFlag(f),null);
 f.zoom='telstar-1970';assert.equal(R.museumBusyText(f),'Looking at '+X.EXHIBITS.find(e=>e.id==='telstar-1970').title);
 f.zoom='timeline';assert.equal(R.museumBusyText(f),'Looking at the timeline');
 f.guideOpen=true;assert.equal(R.museumBusyText(f),'Talking to Ada');f.balls=true;assert.equal(R.museumBusyText(f),'Looking at World Cup balls');
 f.cert=true;assert.equal(R.museumBusyText(f),'Looking at a certificate');f.experience='penalty-1891';assert.equal(R.museumBusyText(f),'Looking at The penalty kick');
 for(const e of X.EXHIBITS){const g=R.museumBusyFlags();g.experience=e.id;assert.equal(R.museumBusyText(g),'Looking at '+e.title);}
});

t('station line (receiver): nearest look-at spot within 2.5 m',()=>{
 for(const p of L.museumPois()){const txt=R.museumStationText((p.a.x+p.b.x)/2,(p.a.z+p.b.z)/2);
  if(p.id==='guide')assert.equal(txt,'Talking to Ada');else if(p.id==='wc-balls')assert.equal(txt,'Looking at World Cup balls');
  else if(p.id==='timeline')assert.equal(txt,'Looking at the timeline');else assert.equal(txt,'Looking at '+p.label,p.id);}
 assert.equal(R.museumStationText(-17,17.5),R.MUSEUM_IDLE_TEXT,'nothing near');
 for(const t of ['Looking at','Talking to'])assert.ok(D.busy.some(b=>b.text.startsWith(t)));
});

t('island door hint',()=>{
 const h=R.MUSEUM_DOOR_HINT;assert.equal(h.x,Dr.MUSEUM_DOOR.x);assert.ok(h.z>=Dr.MUSEUM_DOOR.front&&h.z<Dr.MUSEUM_DOOR.front+2);assert.ok(h.y>4,'above the canopy');assert.equal(h.room,6);
 assert.equal(R.museumDoorHintText(0),null);assert.equal(R.museumDoorHintText(2),'2 in the Museum');assert.equal(R.museumDoorHintText(1),'1 in the Museum');
});

t('hooks: no-op without a layer, then frame/pose/wake/arrive through the source',()=>{
 const M=H.museumRoomHooks,pose=H.roomLocalPose();
 assert.equal(M.registered,false);assert.equal(M.attached,false);assert.equal(M.frame(.016,0,null),false);assert.equal(M.pose(pose),null);assert.equal(M.context(),null);
 M.wake();M.arrive(1,2);assert.equal(M.sleeping(),true);
 let wakes=0,arrived=null,sleeping=true;const cam={};
 const src={scene:{},camera:cam,player:{},readPose(o){o.x=1.5;o.y=0;o.z=-2;o.yaw=.5;o.moving=true;},wake(){wakes++;},sleeping:()=>sleeping,arrive(x,z){arrived=[x,z];}};
 M.register(src);assert.equal(M.context(),src);assert.equal(M.frame(.016,0,cam),false,'registered, no layer: still false (loop sleeps as before)');assert.equal(wakes,0,'no wake without a layer');
 assert.equal(M.pose(pose),pose,'writes out');assert.deepEqual({...pose},{x:1.5,y:0,z:-2,yaw:.5,moving:true,busy:false,activity:''});
 M.setBusy(false,false,false,null,'boots');M.pose(pose);assert.equal(pose.busy,true);assert.equal(pose.activity,'Looking at '+X.EXHIBITS.find(e=>e.id==='boots').title);
 M.setBusy(false,false,false,null,null);M.pose(pose);assert.equal(pose.busy,false);
 let ret=true,seen=null;const layer={update(dt,now,c){seen=c;return ret;}};
 M.attach(layer);assert.equal(wakes,1,'attach wakes once');assert.equal(M.frame(.016,5,cam),true);assert.equal(seen,cam);ret=false;assert.equal(M.frame(.016,6,cam),false);
 M.wake();assert.equal(wakes,2);sleeping=false;assert.equal(M.sleeping(),false);M.arrive(.8,6.5);assert.deepEqual(arrived,[.8,6.5]);
 const p={x:0,z:0};assert.equal(M.clamp(p,99,99),p);
 M.detach({update:()=>true});assert.equal(M.attached,true,'detach of another layer ignored');M.detach(layer);assert.equal(M.frame(.016,7,cam),false);
 M.unregister({});assert.equal(M.registered,true);M.unregister(src);assert.equal(M.pose(pose),null);
});

t('hooks: no per-frame allocation (source scan of the hot paths)',()=>{
 const hs=read('lib/multiplayer/rooms/museumHooks.ts'),rs=read('lib/multiplayer/rooms/museum.ts');
 const body=(src,re)=>{const i=src.search(re);assert.ok(i>=0,String(re));let d=0,j=src.indexOf('{',i);const s=j;for(;j<src.length;j++){if(src[j]==='{')d++;else if(src[j]==='}'&&--d===0)break;}return src.slice(s+1,j);};
 const alloc=/\bnew\s|=>\s*\(\{|[=(,:]\s*\{\s*\w+\s*:|[=(,]\s*\[|`|\.map\(|\.filter\(|\.slice\(|\.\.\./;
 for(const [src,re] of [[hs,/\bframe\(dt/],[hs,/\bpose\(out/],[hs,/\bsetBusy\(/],[hs,/\bwake\(\)\{/],[hs,/\bsleeping\(\)\{/],[rs,/function museumBusyText/],[rs,/function museumBusyFlag/],[rs,/function clampToMuseum/],[rs,/function museumStationText/],[rs,/function pickMuseumSpawn/]]){
  const b=body(src,re);assert.ok(!alloc.test(b),`${re} allocates: ${b.match(alloc)?.[0]}`);}
 const sc=read('lib/museum/museumScene.ts'),rd=body(sc,/readPose\(o\)/);assert.ok(!alloc.test(rd),'scene readPose allocates');
});

t('scene + page wiring (unchanged behaviour without a layer)',()=>{
 const sc=read('lib/museum/museumScene.ts');
 assert.match(sc,/museumRoomHooks\.register\(hookSource\)/);assert.match(sc,/dispose\(\)\{disposed=true;museumRoomHooks\.detach\(hookLayer\);museumRoomHooks\.unregister\(hookSource\);/);
 const f=sc.indexOf('museumRoomHooks.frame(dt,now,camera)'),r=sc.indexOf('renderer.render(scene,camera);draws++');assert.ok(f>0&&f<r,'friends update before the render');
 assert.match(sc,/if\(settle>0\|\|leaving\|\|remote\)frame=requestAnimationFrame\(tick\)/,'remote keeps frames only while the layer says so');
 assert.match(sc,/const arrival=\{x:ROOM\.doorX,z:D-1\.6\},slotPoint=\{x:0,z:0\};target=arrival;/,'arrival walk unchanged');assert.match(sc,/arrive\(px,pz\)\{if\(target===arrival&&!leaving\)\{slotPoint\.x=px;slotPoint\.z=pz;route=\[slotPoint\];wake\(\);\}\}/);
 assert.match(read('components/MuseumRoom.tsx'),/import \{museumRoomHooks\} from '@\/lib\/multiplayer\/rooms\/museumHooks';/);
});

t('Phase 2 wiring: Phase 1 names, hook before the scene, chip Leave only, wake rules, one ring, field obstacle, door hint',()=>{
 const RP=require('../lib/multiplayer/roomPos.ts');
 assert.deepEqual(D.bounds,RP.ROOM_BOUNDS[RP.RoomCode.Museum],'descriptor bounds = roomPos ROOM_BOUNDS (the layer clamps with these)');
 assert.equal(D.code,RP.RoomCode.Museum);
 const sc=read('lib/museum/museumScene.ts'),mr=read('components/MuseumRoom.tsx'),hook=read('components/party/useRoomParty.ts');
 // page: the hook resumes the party and is declared before the scene effect (disposed first); the chip sits in the header, right
 const h=mr.indexOf('useRoomParty(room,RoomCode.Museum,ready,covered||!!zoom)');assert.ok(h>0&&h<mr.indexOf("import('@/lib/museum/museumScene')"),'hook before the scene effect, busy = covered or zoomed');
 assert.match(mr,/\{party&&!zoom&&<span className=\{styles\.partySlot\}><RoomPartyChip party=\{party\} hidden=\{covered\} align="right"\/><\/span>\}/,'chip in the header, hidden while covered / zoomed');
 assert.match(mr,/pickMuseumSpawn\(spot,here,s\.you\?\?0\);museumRoomHooks\.arrive\(spot\.x,spot\.z\)/,'arrival: first free slot, then arrive()');
 assert.match(hook,/station: host\.stationCode \?/,'useRoomParty takes a room\'s own station codes');
 // scene: the layer through museumRoomHooks (attach / detach), hidden while zoomed, remote wake without the local settle
 assert.match(sc,/setFriendLayer\(layer:MuseumFriendLayer\|null\)\{if\(layer\)\{friends=layer;museumRoomHooks\.attach\(hookLayer\);\}else\{museumRoomHooks\.detach\(hookLayer\);friends=null;remoteOnly=false;\}\}/);
 assert.match(sc,/update:\(dt,now,cam\)=>friends\?friends\.update\(dt,now,cam as T\.Camera,zoomIndex!==null\):false/,'friends hidden while a case is zoomed');
 assert.match(sc,/wake:wakeRemote,/,'the layer\'s network wake is the remote-only wake (20 fps on phones)');
 assert.match(sc,/function wakeRemote\(\)\{if\(!frame&&!covered&&!disposed&&!document\.hidden\)\{remoteOnly=true;/);
 assert.match(sc,/function wake\(\)\{remoteOnly=false;/,'a local wake drops the remote cap');
 assert.match(sc,/remoteOnly&&mobile\?Math\.max\(1000\/MUSEUM_REMOTE_FPS,frameMs\(\)\):frameMs\(\)/,'remote-only frames at 20 fps on phones');
 assert.match(sc,/if\(friends\?\.meRing\)playerShadow\.visible=false/,'one ring rule');
 assert.match(sc,/friends\.pushOut\(pushPt,\.3\)/,'busy friends are obstacles');
 assert.match(sc,/stationCode:\(px:number,pz:number\)=>museumRoomHooks\.station\(px,pz\)/);
 assert.match(sc,/async emote\(kind:number,face\?:/,'local emote plays on your rig (no camera change)');
 // no party: nothing runs (the adapter returns false, no layer = no wake; flag off = useRoomParty returns null)
 const M=H.museumRoomHooks;assert.equal(M.attached,false);assert.equal(M.frame(.016,0,null),false);
 // island door hint
 const tw=read('components/Town.tsx');assert.match(tw,/doors:ROOM_DOOR_HINTS/);assert.match(read('lib/multiplayer/townBridge.ts'),/\[RoomCode\.Museum\]: 'in the Museum'/);
 assert.deepEqual({...R.MUSEUM_DOOR_HINT},{...Dr.MUSEUM_DOOR_HINT},'one door hint spot (museumDoors.ts, light for the island bundle)');
 // station codes: every look-at spot has a line, registered once
 const lines=R.museumStationLines();for(const p of L.museumPois()){const c=R.museumStationCode((p.a.x+p.b.x)/2,(p.a.z+p.b.z)/2);assert.ok(lines[c],p.id);assert.equal(lines[c][0],R.museumStationText((p.a.x+p.b.x)/2,(p.a.z+p.b.z)/2));}
});

console.log(`mp-rooms-museum: ${n} groups passed`);
