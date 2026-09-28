// Island vending machines (user, Sep 27 2026; docs/vending-machines.md): eight machines replace the Store. Catalogue and
// specials, placement, the 3D controller (hover, Go, zoom, idle cost), the coin ledger (buy, locked, no re-locking, packs
// through the arcade wallet's pack flow without duplicates) and the removed Store entry points. usage: node tests/vending-machines.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const storage=new Map(),localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
// A do-nothing 2D canvas, enough for the machine atlas and ball skins to draw without a browser.
const ctx2d=new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}),set:(t,k,v)=>{t[k]=v;return true;}});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx2d,style:{}})};
const STUBS={'lib/arcade/arcadeWallet.ts':{readArcadeWallet:()=>({balance:0}),useArcadeWallet:()=>({balance:0,packs:[]}),purchaseMysteryPack:async()=>({ok:false,reason:'stub'}),ARCADE_WALLET_KEY:'fi2-arcade-wallet-v1'}};
const cache=new Map();
function load(file){
 const rel=path.relative(root,file);if(STUBS[rel])return STUBS[rel];if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,Float32Array,Uint32Array,Uint16Array,Int32Array,Uint8Array,ArrayBuffer,DataView,console,localStorage,document,window:undefined,navigator:undefined,queueMicrotask,setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'}},
  require:id=>{
   if(id.startsWith('three/examples/'))return load(path.join(root,'node_modules',id));
   if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
   const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.js',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const C=load(path.join(root,'lib/town/vendingCatalog.ts'));
const {STORE_ITEMS}=load(path.join(root,'lib/town/store.ts'));
const {VENUES,STORE_DOOR,ARCADE_DOOR,COACHES_DOOR,parkingSurfaceHeight}=load(path.join(root,'lib/town/venues.ts'));
const {onIsland}=load(path.join(root,'lib/town/shoreline.ts'));
const {MYSTERY_PACK_OPTIONS}=load(path.join(root,'lib/arcade/legendPacks.ts'));
const {CUSTOMIZATION_OPTIONS,BALL_COLORS}=load(path.join(root,'lib/town/customization.ts'));

// 1. Catalogue: eight machines, the same regular rows everywhere, 2–4 exclusive specials each.
{
 const M=C.VENDING_MACHINES;assert.equal(M.length,8);assert.equal(new Set(M.map(m=>m.id)).size,8);assert.equal(new Set(M.map(m=>m.color)).size,8,'each machine has its own colour');
 const rows=['special','packs','ball','scooter','bike','moped','jetpack','costume'];
 const regular=new Set(C.VENDING_ITEMS.map(i=>i.id)),seen=new Map();
 for(const m of M){
  const stock=C.machineStock(m.id);same(stock.map(r=>r.row),rows,m.id+' rows');
  assert.equal(stock.find(r=>r.row==='costume').items.length,24,'23 club costumes and the fox');
  for(const r of stock.slice(1))same(r.items.map(i=>i.id),C.VENDING_ITEMS.filter(i=>i.row===r.row).map(i=>i.id),'regular stock is identical in every machine');
  assert.equal(m.specials.length,6,m.id+' has six exclusive specials');assert.equal(stock[0].items.filter(i=>i.kind==='display').length,4,'four home collectible previews');
  for(const id of m.specials){assert(!regular.has(id),id+' is not in the regular rows');assert(!seen.has(id),id+' is sold at one machine only');seen.set(id,m.id);const item=C.vendingItem(id);assert.equal(item.machine,m.id);assert(item.blurb.length>40,id+' teaches something');}
  assert(m.lesson.length>20);
 }
 for(const item of [...C.VENDING_ITEMS,...C.VENDING_SPECIALS]){assert(Number.isInteger(item.price)&&item.price>0,item.id+' price');assert(item.blurb.length>10,item.id+' blurb');}
 // Balls, rides and costumes keep their store learning copy; specials are all eight new balls plus eight themed packs.
 for(const s of STORE_ITEMS){const v=C.vendingItem(s.id);assert(v,s.id+' is sold');if(v.row!=='special')assert.equal(v.blurb,s.description,s.id+' keeps its learning blurb');}
 const specialBalls=CUSTOMIZATION_OPTIONS.ball.filter(o=>C.vendingItem('ball:'+o.id)?.row==='special');assert.equal(specialBalls.length,8);for(const o of specialBalls)assert(BALL_COLORS[o.id],'special ball colour '+o.id);
 for(const p of C.VENDING_SPECIALS.filter(i=>i.kind==='pack')){assert.equal(p.pack.size,3);assert.equal(p.price,MYSTERY_PACK_OPTIONS.find(o=>o.size===3).price,'themed packs keep the wallet price');assert(p.pack.legends.length>=2&&p.pack.regular.length>=2,p.id+' draws from the roster');assert(!p.pack.regular.some(n=>p.pack.legends.includes(n)));}
 for(const o of MYSTERY_PACK_OPTIONS)assert.equal(C.vendingItem('pack:'+o.size).price,o.price,'mystery packs keep the arcade prices');
 assert.equal(C.vendingItemFor('packs:legend'),'pack:3');assert.equal(C.vendingItemFor('costume:matchday-fox'),'costume:matchday-fox');assert.equal(C.vendingItemFor('ball:frost'),'ball:frost');
 assert.equal(C.nearestVendingMachine(103,-48).id,'plaza','arriving from the arcade opens the Island Square machine');
}
// 2. Placement: on the island, off every pitch (the rooftop one on the garage roof), clear of doors, spread out, facing the camera.
{
 const M=C.VENDING_MACHINES;
 for(const m of M){
  assert(onIsland(m.x,m.z),m.id+' on the island');
  const v=VENUES.find(v=>Math.abs(m.x-v.x)<v.width/2+3+1&&Math.abs(m.z-v.z)<v.length/2+3+1);assert(!v,m.id+' off the '+(v&&v.id)+' pitch and runoff');
  assert.equal(m.y,m.id==='market'?17.23:parkingSurfaceHeight(m.x,m.z),m.id+' stands on the ground or its accessible rooftop');
  for(const d of [STORE_DOOR,ARCADE_DOOR,COACHES_DOOR])assert(Math.hypot(m.x-d.x,m.z-d.z)>4,m.id+' does not block a door');
  // Default: faces the island camera. Wall/corner machines (pier, market, clubgrounds) face their walk-up side, but the glass
  // front must still read from the default view (camera sits toward +16,+33).
  if(!['plaza','pier','market','clubgrounds'].includes(m.id))assert(Math.abs(m.yaw-Math.atan2(16,33))<1e-9,m.id+' faces the island camera');
  assert((Math.sin(m.yaw)*16+Math.cos(m.yaw)*33)/Math.hypot(16,33)>.3,m.id+' glass front reads from the island camera');
 }
 for(const a of M)for(const b of M)if(a!==b)assert(Math.hypot(a.x-b.x,a.z-b.z)>35,a.id+' and '+b.id+' are spread out');
 assert.equal(M.find(m=>m.id==='rooftop').y,6,'the futsal machine is on the rooftop court level');
 assert.equal(M.find(m=>m.id==='market').name,'High School Rooftop','the purple machine keeps its stable market ID on the school roof');
}
// 3. 3D controller: one draw call per machine, shared material, hover glow + Go, zoom in/out, no work when idle.
{
 const T=require('three');
 const {createVendingMachines,VENDING_SCALE}=load(path.join(root,'lib/graphics/vendingMachines.ts'));
 const scene=new T.Scene(),v=createVendingMachines(scene);
 const meshes=[];v.root.traverse(o=>{if(o.isMesh)meshes.push(o);});
 assert.equal(meshes.length,8,'one merged mesh (one draw call) per machine');assert.equal(new Set(meshes.map(m=>m.material)).size,1,'all eight share one material');
 assert(meshes.every(m=>m.frustumCulled&&m.geometry.boundingSphere),'frustum-culled with bounds');assert(meshes.every(m=>m.geometry.getAttribute('position').count<800),'low-poly');
 assert.equal(v.obstacles.length,8);for(const o of v.obstacles)assert(Math.min(o.w,o.d)>1.1&&Math.max(o.w,o.d)>1.68&&o.w<2.4&&o.d<2.4,'collision footprint covers the cabinet');// any yaw (wall machines are square-on)
 const glow=scene.getObjectByName('vending-selection');assert(glow,'one shared hover glow');
 let glowMeshes=0;glow.traverse(o=>{if(o.isMesh)glowMeshes++;});assert.equal(glowMeshes,3,'single buildingGlow (outline, halo, wash) for all machines');
 const camera=new T.PerspectiveCamera(40,390/844,1,500);const plaza=v.entries.find(e=>e.machine.id==='plaza');
 camera.position.set(plaza.machine.x+18,23,plaza.machine.z+30);camera.lookAt(plaza.machine.x,1,plaza.machine.z);camera.updateMatrixWorld();
 const prompt={hidden:true,dataset:{},style:{}};let placed=0,hovers=0;
 const frame=(o={})=>v.update({now:o.now??0,dt:1/30,reduced:false,hoverRay:o.ray??null,canEnter:o.canEnter??true,flying:false,flightHeight:0,location:o.at??{x:0,z:0},groundY:o.groundY??0,camera,width:390,height:844,hidePrompt:false,prompt,placeUI:()=>{placed++;},setUIHidden:(el,h)=>{el.hidden=h;},onHoverStart:()=>{hovers++;}});
 // Idle: far from every machine, no hover → no target, prompt hidden, glow asleep.
 assert.equal(frame({at:{x:0,z:0},now:5000}),null);assert.equal(prompt.hidden,true);assert.equal(glow.children[0].visible,false,'glow effect hidden when idle');
 // The relocated purple cabinet is reachable at its roof elevation, never from the street below.
 const school=v.entries.find(e=>e.machine.id==='market');
 assert.equal(frame({at:school.front,groundY:17.23,now:5500}),'market');
 assert.equal(frame({at:school.front,groundY:0,now:5550}),null,'roof vending does not target from ground level');
 // Walking up to the front shows Go and highlights.
 const fx=plaza.front.x,fz=plaza.front.z;assert.equal(frame({at:{x:fx,z:fz},now:6000}),'plaza');assert.equal(prompt.hidden,false);assert.equal(prompt.dataset.vending,'plaza');assert(placed>0);
 for(let i=0;i<20;i++)frame({at:{x:fx,z:fz},now:6000+i*33});assert.equal(glow.children[0].visible,true,'building-style highlight on the machine');
 assert(Math.abs(glow.position.x-plaza.machine.x)<1e-6&&Math.abs(glow.position.z-plaza.machine.z)<1e-6,'glow moved to the targeted machine');
 // Hover: a ray at the cabinet picks it, and plays the scene hover once.
 const ray=new T.Raycaster();ray.set(camera.position.clone(),new T.Vector3(plaza.machine.x,1.4,plaza.machine.z).sub(camera.position).normalize());
 assert.equal(v.pick(ray),'plaza');assert.equal(frame({ray,at:{x:0,z:0},now:7000}),'plaza');frame({ray,at:{x:0,z:0},now:7033});assert.equal(hovers,1,'hover sound once per hover');assert.equal(v.hovered,'plaza');
 // Zoom: ~1 s ease to the glass front, arrival callback once, player hidden mid-way, then back out.
 let arrived=0;v.focus('plaza',()=>{arrived++;});assert.equal(v.zooming,true);
 let steps=0;for(;steps<60&&!arrived;steps++){camera.position.set(plaza.machine.x+18,23,plaza.machine.z+30);camera.lookAt(plaza.machine.x,1,plaza.machine.z);v.applyCamera(camera,1/30,false);}
 assert.equal(arrived,1);assert(steps>=27&&steps<=36,'zoom takes about a second: '+steps+' frames');assert.equal(v.hidesPlayer,true);
 const front=new T.Vector3(),look=new T.Vector3();v.faceView('plaza',camera,front,look);assert(camera.position.distanceTo(front)<1e-6,'camera ends at the face view');
 // Level three-quarter view: show cabinet depth without rolling the control surface.
 {const d=look.clone().sub(front).normalize();assert(d.dot(plaza.dir)< -.9&&d.dot(plaza.dir)> -.96,'shallow three-quarter view reveals cabinet depth');assert(Math.abs(d.y)<1e-9,'level');}
 // The face and visible cabinet side fill the phone; every face corner stays on screen.
 {const c=v.faceNow();assert.equal(c.length,4);const px=c.map(p=>({x:(p.x+1)/2*390,y:(1-p.y)/2*844}));const w=px[1].x-px[0].x,h=px[3].y-px[0].y;
  assert(w>390*.66&&w<=390,'face spans the portrait width: '+w.toFixed(1));assert(Math.abs(px[0].y-px[1].y)>1&&Math.abs(px[0].x-px[3].x)<.5,'level perspective reveals depth without rolling the controls');
  assert(px[0].y>0&&px[3].y<844,'whole face on screen');
  const {VENDING_FACE_LAYOUT:L}=load(path.join(root,'lib/graphics/vendingFaceLayout.ts'));
  const tap=(r,W,H)=>Math.min(r.w*W,Math.max(44,r.h*H));for(const r of [L.prev,L.label,L.next,L.coin,L.tray,...L.slots])assert(tap(r,w,h)>=44,'portrait tap target ≥44px');
  // Landscape phone (844×390): the face alone fills the height, taps still ≥44px.
  const land=new T.PerspectiveCamera(40,844/390,1,500),landLook=new T.Vector3();v.faceView('plaza',land,land.position,landLook,390);land.lookAt(landLook);land.updateMatrixWorld();
  const F=load(path.join(root,'lib/graphics/vendingMachines.ts')).VENDING_FACE;const corner=(x,y)=>new T.Vector3(x,y,F.z).applyMatrix4(plaza.mesh.matrixWorld).project(land);
  const a=corner(F.x0,F.y1),b=corner(F.x1,F.y1),dd=corner(F.x0,F.y0),LW=(b.x-a.x)/2*844,LH=(a.y-dd.y)/2*390;assert(LH>=325&&LH<=390,'landscape face fills the height: '+LH.toFixed(1));
  for(const r of [L.prev,L.label,L.next,L.coin,L.tray,...L.slots])assert(tap(r,LW,LH)>=43.5,'landscape tap target ≥44px: '+JSON.stringify(r)+' '+tap(r,LW,LH).toFixed(1));
  // Layout rects sit inside the face and hit areas never overlap.
  const hits=[L.prev,L.label,L.next,...L.slots,L.led,L.coin,L.tray];for(const r of hits)assert(r.x>=0&&r.y>=0&&r.x+r.w<=1.0001&&r.y+r.h<=1.0001,'inside the face');
  for(const p of hits)for(const q of hits)if(p!==q)assert(p.x+p.w<=q.x+1e-9||q.x+q.w<=p.x+1e-9||p.y+p.h<=q.y+1e-9||q.y+q.h<=p.y+1e-9,'hit areas do not overlap');}
 // watchFace: the face layer hears where the face is on awake zoomed frames only.
 {let calls=0;const off=v.watchFace(()=>{calls++;});v.applyCamera(camera,1/30,false);assert.equal(calls,1);off();v.applyCamera(camera,1/30,false);assert.equal(calls,1,'unsubscribed');}
 assert.equal(frame({at:{x:fx,z:fz},now:9000}),'plaza');assert.equal(prompt.hidden,true,'no Go prompt while zoomed');
 let done=0;v.release(()=>{done++;});for(let i=0;i<40&&!done;i++){camera.position.set(plaza.machine.x+18,23,plaza.machine.z+30);v.applyCamera(camera,1/30,false);}assert.equal(done,1);assert.equal(v.applyCamera(camera,1/30,false),false,'camera free again; idle frames return at once');
 v.focus('plaza',()=>{arrived++;});v.applyCamera(camera,1/30,true);assert.equal(arrived,2,'reduced motion: straight to the front');v.release();v.applyCamera(camera,1/30,true);assert.equal(v.focused,null);
 v.dispose();assert.equal(scene.children.length,0,'dispose removes everything');
}
// 4. Ledger: starters free, one-time "already yours" snapshot, buying with coins, locked items, no re-locking, packs.
{
 const {createVendingLedger,VENDING_STARTERS}=load(path.join(root,'lib/town/vendingLedger.ts'));
 const make=({look=null,balance=100,rides={},costumes={},collection=[]}={})=>{let saved=null,packCalls=[];const unlocked={...rides};
  const ledger=createVendingLedger({read:()=>saved,write:v=>{saved=JSON.parse(JSON.stringify(v));},readSavedLook:()=>look,readCollection:()=>collection,arcadeBalance:()=>balance,lock:fn=>Promise.resolve().then(fn),
   buyPack:async p=>{packCalls.push(p);return {ok:true,pack:{id:'p'+packCalls.length}};},now:()=>1,
   rideUnlocked:(c,id)=>id==='classic'||!!unlocked[c+':'+id],costumeEarned:id=>!!costumes[id],allRides:()=>[{category:'scooter',id:'classic'},{category:'scooter',id:'coast'},{category:'scooter',id:'comet'}],allCostumes:()=>['barcelona','arsenal']});
  return {ledger,unlocked,packCalls,saved:()=>saved,setBalance:b=>{balance=b;}};};
 const item=id=>C.vendingItem(id);
 // New player: only starters.
 {const {ledger}=make();for(const s of VENDING_STARTERS)assert(ledger.isOwned(s));assert(!ledger.isOwned('ball:frost'));assert(!ledger.isOwned('scooter:coast'));}
 // Returning player: keeps equipped gear, unlocked rides, earned costumes; later rule changes never re-lock them.
 {const t=make({look:{ball:'solar',scooter:'coast',costume:'arsenal'},rides:{'scooter:coast':true},costumes:{arsenal:true,barcelona:true}});
  assert(t.ledger.isOwned('ball:solar'),'equipped ball kept');assert(t.ledger.isOwned('scooter:coast'),'unlocked ride kept');assert(t.ledger.isOwned('costume:barcelona')&&t.ledger.isOwned('costume:arsenal'),'earned costumes kept');
  delete t.unlocked['scooter:coast'];assert(t.ledger.isOwned('scooter:coast'),'no re-locking');
  const e=t.ledger.enforce({ball:'frost',scooter:'coast',bike:'bmx',moped:'classic',jetpack:'classic',costume:'arsenal'});same([e.ball,e.scooter,e.bike,e.costume],['classic','coast','classic','arsenal'],'unpaid gear falls back to the free starter');}
 // Buying: coins, locked items, owned items free.
 (async()=>{
  const t=make({balance:55});
  const previewTest=make({balance:10000});for(const preview of C.VENDING_SPECIALS.filter(i=>i.kind==='display'&&!i.storyId)){assert.equal((await previewTest.ledger.buy(preview)).ok,false);assert(!previewTest.ledger.isOwned(preview.id));}assert.equal(previewTest.ledger.read().spent,0,'home previews stay unpurchasable while the home feature is hidden');
  let r=await t.ledger.buy(item('scooter:comet'));assert.equal(r.ok,false,'locked ride cannot be bought');assert(!t.ledger.isOwned('scooter:comet'));
  r=await t.ledger.buy(item('costume:barcelona'));assert.equal(r.ok,false,'unearned costume cannot be bought');
  r=await t.ledger.buy(item('ball:frost'));assert.equal(r.ok,true);assert(t.ledger.isOwned('ball:frost'));assert.equal(t.ledger.read().spent,20);
  r=await t.ledger.buy(item('ball:frost'));assert.equal(r.ok,true);assert.equal(t.ledger.read().spent,20,'owned items are never charged twice');
  r=await t.ledger.buy(item('ball:telstar'));assert.equal(r.ok,true,'specials have no unlock rule');assert.equal(t.ledger.read().spent,55);
  r=await t.ledger.buy(item('ball:sunset'));assert.equal(r.ok,false,'not enough coins');assert(/coins/i.test(r.reason));
  t.unlocked['scooter:comet']=true;t.setBalance(100);r=await t.ledger.buy(item('scooter:comet'));assert.equal(r.ok,true,'unlocked ride costs coins');assert.equal(t.ledger.read().spent,85);
  same(t.saved().spend.map(s=>s.id),['ball:frost','ball:telstar','scooter:comet']);
  // Packs: the wallet's own pack purchase, candidates filtered so nothing already collected can come out.
  const legends=['Pelé','Marta','Mia Hamm'],have=['Pelé'];const p=make({balance:100,collection:have});
  const pack={id:'pack:test',kind:'pack',price:30,label:'t',blurb:'t',row:'packs',pack:{size:3,legends,regular:['A','B','C','Pelé']}};
  r=await p.ledger.buy(pack);assert.equal(r.ok,true);assert.equal(r.packId,'p1');same(p.packCalls[0].legends,['Marta','Mia Hamm']);same(p.packCalls[0].regular,['A','B','C'],'no duplicates offered');assert.equal(p.ledger.read().spent,0,'pack coins are charged by the arcade wallet');
  const sold=make({collection:[...legends,'A','B','C']});r=await sold.ledger.buy(pack);assert.equal(r.ok,false,'sold out rather than a duplicate');assert.equal(sold.packCalls.length,0);
  // Economy pass (28 Sep 2026): a pack stays on sale while its own pool can give ONE new card (the old rule needed two legends,
  // which left the last Icons unobtainable), topping up empty slots with other missing cards and never a duplicate.
  {const one=make({collection:['Marta','Mia Hamm','A','B']});one.ledger;r=await one.ledger.buy(pack);assert.equal(r.ok,true,'one missing legend keeps the pack on sale');same(one.packCalls[0].legends,['Pelé']);same(one.packCalls[0].regular,['C']);}
  {const top=createVendingLedger({read:()=>null,write:()=>{},readSavedLook:()=>null,readCollection:()=>['Pelé','Marta','Mia Hamm','A','B'],arcadeBalance:()=>100,lock:fn=>Promise.resolve().then(fn),buyPack:async p=>{top.calls.push(p);return {ok:true,pack:{id:'t'}};},now:()=>1,allCards:()=>['Pelé','Marta','Mia Hamm','A','B','C','D','E']});top.calls=[];
   const f=top.packFreshness(pack.pack);assert.equal(f.available,true);same(f.legends,[]);same(f.regular,['C']);same(f.extra,['D','E'],'other missing cards top up the empty slots');}
  // Light Icon gate: Icons leave every slot except the guaranteed mental-strength legend until the tier gate opens.
  {const gate={open:false},ledger=createVendingLedger({read:()=>null,write:()=>{},readSavedLook:()=>null,readCollection:()=>[],arcadeBalance:()=>100,lock:fn=>Promise.resolve().then(fn),buyPack:async()=>({ok:true,pack:{id:'g'}}),now:()=>1,
    iconsOpen:()=>gate.open,tierOf:n=>['Pelé','Lionel Messi','Zinedine Zidane'].includes(n)?'icon':'regular',allCards:()=>['Pelé','Lionel Messi','Zinedine Zidane','A','B']});
   const mystery={size:3,legends:['Pelé'],regular:['Lionel Messi','A']},themedPack={size:3,legends:['Zinedine Zidane','B'],regular:['Lionel Messi','A']};
   let f=ledger.packFreshness(mystery);same(f.legends,['Pelé'],'mental-strength legend slot stays');same(f.regular,['A'],'Icons filtered from the regular slots');assert(!f.extra.includes('Lionel Messi'));
   f=ledger.packFreshness(themedPack);same(f.legends,['B'],'an Icon all-time great waits for the gate in themed packs');
   gate.open=true;f=ledger.packFreshness(mystery);same(f.regular,['Lionel Messi','A'],'gate open: Icons can come out of packs');}
  // Three packs a day: "This machine restocks at midnight."
  {let today=3;const ledger=createVendingLedger({read:()=>null,write:()=>{},readSavedLook:()=>null,readCollection:()=>[],arcadeBalance:()=>500,lock:fn=>Promise.resolve().then(fn),buyPack:async()=>({ok:true,pack:{id:'x'}}),now:()=>1,packsToday:()=>today});
   const f=ledger.packFreshness(pack.pack);assert.equal(f.available,false);assert.equal(f.restock,true);r=await ledger.buy(pack);assert.equal(r.ok,false);assert.equal(r.reason,'This machine restocks at midnight.');today=2;assert.equal(ledger.packFreshness(pack.pack).available,true);}
  const poor=make({balance:20});r=await poor.ledger.buy(pack);assert.equal(r.ok,false);assert.equal(poor.packCalls.length,0,'balance checked before the wallet is asked');
  const spent=make({balance:40});await spent.ledger.buy(item('ball:frost'));r=await spent.ledger.buy(pack);assert.equal(r.ok,false,'vending spend counts against pack coins');
  sourceChecks();
 })().catch(e=>{console.error(e);process.exit(1);});
}
// 5. The Store is gone: entry points redirect to the nearest machine; no odds in the vending UI.
function sourceChecks(){
 const town=read('components/Town.tsx'),controller=read('components/VendingMachine.tsx'),face=read('components/VendingFace.tsx'),ui=controller+face;
 assert(!fs.existsSync(path.join(root,'components/IslandStore.tsx')),'IslandStore dialog retired');
 assert(!/IslandStore['"]/.test(town)&&!/data-store-enter/.test(town),'no Store dialog or Enter prompt');
 assert(!/kind:'store'/.test(town)&&!/\['store',nearStore/.test(town),'the Store building is no longer highlighted or enterable');
 assert.match(town,/data-vending-go[\s\S]{0,300}?>Go<\/button>/,'Go prompt');
 assert.match(town,/const machine=vending\.pick\(characterRay\);if\(machine\)/,'tap on a machine opens it (touch works like buildings)');
 assert.match(town,/camera\.lookAt\(lookAt\);\n\s*if\(!learningFormat\.current\)\{?vending\.applyCamera\(camera,dt,reduced\)/,'zoom blends after the follow camera');
 assert.match(town,/const openStore=\(itemId\?:string\)=>openVending\(undefined,itemId\)/,'old Store links open the nearest machine');
 assert.match(town,/const store=url\.searchParams\.get\('store'\);if\(store===null\)return;[\s\S]{0,180}openStore\(/,'?store= URLs redirect to the nearest machine');
 assert.match(town,/enforceVendingOwnership\(enforceRideUnlocks\(/,'only owned gear can be worn');
 assert.match(town,/<VendingMachine machineId=\{vendingId\}[^\n]*machines=\{getVendingMachines\}/,'the machine face follows the 3D zoom camera');
 // In-world machine, not a modal (user, Sep 27 2026): no dialog; the face is pinned onto the machine; minimal HUD; island asleep.
 assert(!/<dialog|showModal|role="dialog"/.test(ui),'no dialog or modal: buying happens on the machine face');
 assert.match(controller,/<VendingFace ref=\{faceEl\}/);assert.match(controller,/watchFace\(/);assert.match(controller,/quadMatrix\(w,h,quad\)/,'face pinned with a matrix3d from the projected corners');
 assert.match(controller,/label="Back"/);assert.match(controller,/data-vending-coins/,'coin pill');
 assert.match(town,/settingsRef\.current=[^;]*\bstoreOpen\b/,'the island sleeps while the machine is in use');
 assert.match(town,/<CardOfferHost blocked=\{[^}]*\bstoreOpen\b/,'no card offers while the machine is in use');
 assert.match(town,/v\.focus\(m\.id,\(\)=>setStoreOpen\(true\)\)/,'the face opens once the camera arrives');
 for(const [key,re] of [['Escape',/key==='Escape'/],['arrows',/ArrowRight/],['numbers',/\^\[1-9\]\$/],['Enter',/key==='Enter'/],['walk away',/\['w','a','s','d'\]/]])assert.match(controller,re,'keyboard: '+key);
 // The visual module holds no purchase logic (Astra swaps it: docs/vending-visuals-HANDOFF.md); both renderers share one layout.
 assert(!/vendingWallet|vendingLedger|buyVendingItem|arcadeWallet|equipStoreItem/.test(face),'VendingFace is visuals only');
 assert.match(face,/VENDING_FACE_LAYOUT/);assert.match(read('lib/graphics/vendingMachines.ts'),/VENDING_FACE_LAYOUT/,'the 3D front and the HTML face share one layout');
 // Heat: no looping animation or backdrop blur on the machine; nothing mounted while not in use.
 for(const f of ['components/VendingFace.module.css','components/VendingMachine.module.css']){const css=read(f);assert(!/infinite/.test(css),f+' no looping animation');assert(!/backdrop-filter/.test(css),f+' no backdrop blur');}
 assert.match(controller,/if\(!open\)return null;/,'nothing mounted while not in use');
 assert.match(read('lib/audio/islandSound.ts'),/fi2-vending-cue/,'clink / thunk / pop cues');
 assert(!/\d+\s*%|chance|odds|rarity/i.test(ui),'no odds or rarity numbers in the vending UI');
 assert(!/LegendPackStore/.test(ui),'packs use the wallet flow, not the arcade pack UI with its odds line');
 assert(!/data-machines-found=|>No real money</.test(ui),'requested footer labels removed');assert(!/className=\{styles.only\}/.test(face),'no badges over the product artwork');
 for(const f of ['components/RideUnlockToast.tsx','components/BallHuntLesson.tsx','components/CoinQuest.tsx','lib/town/npcDialogues.ts','lib/town/questModel.ts','lib/town/exploreChecklist.ts','components/IslandTravelMap.tsx'])assert(!/\bthe (Island )?Store\b|Visit the Store|in the Store/.test(read(f)),f+' no longer sends players to the Store');
 console.log('PASS vending machines: 8 placed machines with exclusive specials, one draw call each, shared glow + Go, ~1 s angled zoom fitting the face (taps ≥44px portrait + landscape), in-world face (no modal, one shared layout, visuals-only module), idle frames free, coin ledger (locked, no re-locking, no duplicates), Store entry points redirected');
}
