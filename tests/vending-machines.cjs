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
// Records the product pictures the atlas asks for (they never load here), so the ball pictures can be checked per machine.
const imageLog=[];class Image{set src(v){this._src=v;imageLog.push(v);}get src(){return this._src;}}
const STUBS={'lib/arcade/arcadeWallet.ts':{readArcadeWallet:()=>({balance:0}),useArcadeWallet:()=>({balance:0,packs:[]}),purchaseMysteryPack:async()=>({ok:false,reason:'stub'}),ARCADE_WALLET_KEY:'fi2-arcade-wallet-v1'}};
const cache=new Map();
function load(file){
 const rel=path.relative(root,file);if(STUBS[rel])return STUBS[rel];if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,Float32Array,Uint32Array,Uint16Array,Int32Array,Uint8Array,ArrayBuffer,DataView,console,localStorage,document,Image,window:undefined,navigator:undefined,queueMicrotask,setTimeout,clearTimeout,process:{env:{NODE_ENV:'production'}},
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
const {isOnCayLand}=load(path.join(root,'lib/town/coralCay.ts'));
const {standsOnCay,cayVendingSpots}=load(path.join(root,'lib/town/vendingPlaces.ts'));
const {PLAYER_BOOKS}=load(path.join(root,'lib/books/catalog.ts'));
/** Sep 29 2026: four book machines (North Beach, causeway, two on Coral Cay), each selling one new pop-up book. */
const BOOK_MACHINES=['northbeach','causeway','cayplaza','sharks'],CAY_MACHINES=['causeway','cayplaza','sharks','caykonbini'];
/** Sep 29 2026: the Coral Cay Konbini's machine sells the regular rows only (Island Square's Konbini keeps its specials). */
const REGULAR_ONLY=['caykonbini'];
/** Sep 29 2026: exactly two drink machines (lib/town/drinkMachines.ts), each side by side with its Konbini's machine. */
const DRINK_MACHINES={drinksplaza:'plaza',drinkscay:'caykonbini'};
const {MYSTERY_PACK_OPTIONS}=load(path.join(root,'lib/arcade/legendPacks.ts'));
const {CUSTOMIZATION_OPTIONS,BALL_COLORS}=load(path.join(root,'lib/town/customization.ts'));

// 1. Catalogue: fifteen machines (eight original + four book machines + the Coral Cay Konbini + two drink machines), the same regular rows
// in every shop machine, exclusive specials.
{
 const ALL=C.VENDING_MACHINES;assert.equal(ALL.length,15);assert.equal(new Set(ALL.map(m=>m.id)).size,15);assert.equal(new Set(ALL.map(m=>m.color)).size,15,'each machine has its own colour');
 same(ALL.filter(m=>m.drinks).map(m=>m.id),Object.keys(DRINK_MACHINES),'exactly two drink machines');
 const M=ALL.filter(m=>!m.drinks);
 const rows=['special','books','packs','ball','scooter','bike','moped','jetpack','costume'];
 const regular=new Set(C.VENDING_ITEMS.map(i=>i.id)),seen=new Map();
 for(const m of M){
  const stock=C.machineStock(m.id);same(stock.map(r=>r.row),rows,m.id+' rows');
  assert.equal(stock.find(r=>r.row==='costume').items.length,24,'23 club costumes and the fox');
  for(const r of stock.slice(2))same(r.items.map(i=>i.id),C.VENDING_ITEMS.filter(i=>i.row===r.row).map(i=>i.id),'regular stock is identical in every machine');
  // Sep 30 2026 ("each machine should have 4 books"): every shop machine sells exactly four pop-up books, its home books first.
  const books=stock[1].items;assert.equal(books.length,4,m.id+' sells exactly four books');assert(books.every(b=>b.kind==='display'&&b.price===100&&b.storyId&&PLAYER_BOOKS[b.storyId].itemId===b.id),m.id+' books are real books at 100');
  const home=Object.keys(PLAYER_BOOKS).filter(b=>PLAYER_BOOKS[b].machine===m.id).map(b=>PLAYER_BOOKS[b].itemId);same(books.slice(0,home.length).map(b=>b.id),home,m.id+' features its home books first');
  assert(stock[0].items.every(i=>i.kind!=='display'),'books sit in the Books row, not Specials');
  if(REGULAR_ONLY.includes(m.id)){assert.equal(m.specials.length,0,m.id+' sells the regular rows only');assert.equal(stock[0].items.length,0,'no specials row items');}
  else if(BOOK_MACHINES.includes(m.id)){assert.equal(m.specials.length,1,m.id+' sells its one book as its special');const book=books[0];assert.equal(book.kind,'display');assert.equal(book.price,100,'same book price as every machine');assert(book.storyId&&PLAYER_BOOKS[book.storyId].machine===m.id&&PLAYER_BOOKS[book.storyId].itemId===book.id,m.id+' sells its matching book');}
  else{assert.equal(m.specials.length,6,m.id+' has six exclusive specials');assert.equal(stock[0].items.length,2,'its exclusive ball and pack');assert.equal(books.filter(b=>b.machine===m.id).length,4,'four home books');}
  for(const id of m.specials){assert(!regular.has(id),id+' is not in the regular rows');assert(!seen.has(id),id+' is sold at one machine only');seen.set(id,m.id);const item=C.vendingItem(id);assert.equal(item.machine,m.id);assert(item.blurb.length>40,id+' teaches something');}
  assert(m.lesson.length>20);
 }
 {const sold=new Set(M.flatMap(m=>C.machineStock(m.id)[1].items.map(i=>i.id))),all=Object.keys(PLAYER_BOOKS).filter(b=>PLAYER_BOOKS[b].machine).map(b=>PLAYER_BOOKS[b].itemId);
  same([...sold].sort(),[...all].sort(),'all 36 sellable books are on sale somewhere (the starter book is free), and nothing else');assert.equal(all.length,36);
  assert.equal(C.VENDING_SPECIALS.filter(i=>i.kind==='display').length,36,'one item per book: the own-everything total is unchanged');
  assert(M.flatMap(m=>C.machineStock(m.id)[1].items.map(i=>i.id)).length>sold.size,'some books are sold at more than one machine');}
 for(const item of [...C.VENDING_ITEMS,...C.VENDING_SPECIALS]){assert(Number.isInteger(item.price)&&item.price>0,item.id+' price');assert(item.blurb.length>10,item.id+' blurb');}
 // Balls, rides and costumes keep their store learning copy; specials are all eight new balls plus eight themed packs.
 for(const s of STORE_ITEMS){const v=C.vendingItem(s.id);assert(v,s.id+' is sold');if(v.row!=='special')assert.equal(v.blurb,s.description,s.id+' keeps its learning blurb');}
 const specialBalls=CUSTOMIZATION_OPTIONS.ball.filter(o=>C.vendingItem('ball:'+o.id)?.row==='special');assert.equal(specialBalls.length,8);for(const o of specialBalls)assert(BALL_COLORS[o.id],'special ball colour '+o.id);
 for(const p of C.VENDING_SPECIALS.filter(i=>i.kind==='pack')){assert.equal(p.pack.size,3);assert.equal(p.price,MYSTERY_PACK_OPTIONS.find(o=>o.size===3).price,'themed packs keep the wallet price');assert(p.pack.legends.length>=2&&p.pack.regular.length>=2,p.id+' draws from the roster');assert(!p.pack.regular.some(n=>p.pack.legends.includes(n)));}
 for(const o of MYSTERY_PACK_OPTIONS)assert.equal(C.vendingItem('pack:'+o.size).price,o.price,'mystery packs keep the arcade prices');
 assert.equal(C.vendingItemFor('packs:legend'),'pack:3');assert.equal(C.vendingItemFor('costume:matchday-fox'),'costume:matchday-fox');assert.equal(C.vendingItemFor('ball:frost'),'ball:frost');
 assert.equal(C.nearestVendingMachine(103,-48).id,'plaza','arriving from the arcade opens the Island Square machine');
 for(const [id,beside] of Object.entries(DRINK_MACHINES)){const b=M.find(m=>m.id===beside);assert.equal(C.nearestVendingMachine(b.x+2,b.z+1).id,beside,'old Store links never open a drink machine ('+id+')');}
}
// 2. Placement: on the island, off every pitch (the rooftop one on the garage roof), clear of doors, spread out, facing the camera.
{
 const M=C.VENDING_MACHINES;
 for(const m of M){
  if(DRINK_MACHINES[m.id])continue;// checked in 2b
  if(CAY_MACHINES.includes(m.id)){assert(isOnCayLand(m.x,m.z)&&standsOnCay(m),m.id+' stands on walkable Coral Cay ground (cabinet and walk-up point)');assert.equal(m.y,0);
   const s=cayVendingSpots[m.id==='cayplaza'?'cafe':m.id==='caykonbini'?'konbini':m.id]();same([m.x,m.z,m.yaw],[s.x,s.z,s.yaw],m.id+' placed from the Coral Cay anchors');
   assert((Math.sin(m.yaw)*16+Math.cos(m.yaw)*33)/Math.hypot(16,33)>.3,m.id+' glass front reads from the island camera');continue;}
  assert(onIsland(m.x,m.z),m.id+' on the island');
  const v=VENUES.find(v=>Math.abs(m.x-v.x)<v.width/2+3+1&&Math.abs(m.z-v.z)<v.length/2+3+1);assert(!v,m.id+' off the '+(v&&v.id)+' pitch and runoff');
  assert.equal(m.y,m.id==='market'?17.23:parkingSurfaceHeight(m.x,m.z),m.id+' stands on the ground or its accessible rooftop');
  for(const d of [STORE_DOOR,ARCADE_DOOR,COACHES_DOOR])assert(Math.hypot(m.x-d.x,m.z-d.z)>4,m.id+' does not block a door');
  // Default: faces the island camera. Wall/corner machines (pier, market, clubgrounds) face their walk-up side, but the glass
  // front must still read from the default view (camera sits toward +16,+33).
  if(!['plaza','pier','market','clubgrounds',...CAY_MACHINES].includes(m.id))assert(Math.abs(m.yaw-Math.atan2(16,33))<1e-9,m.id+' faces the island camera');
  assert((Math.sin(m.yaw)*16+Math.cos(m.yaw)*33)/Math.hypot(16,33)>.3,m.id+' glass front reads from the island camera');
 }
 // The Coral Cay Konbini's machine belongs under its store canopy (like Island Square's): it keeps 20 m from the café machine.
 for(const a of M)for(const b of M)if(a!==b&&!a.drinks&&!b.drinks)assert(Math.hypot(a.x-b.x,a.z-b.z)>(REGULAR_ONLY.includes(a.id)||REGULAR_ONLY.includes(b.id)?20:35),a.id+' and '+b.id+' are spread out');
 assert.equal(M.find(m=>m.id==='rooftop').y,6,'the futsal machine is on the rooftop court level');
 assert.equal(M.find(m=>m.id==='market').name,'High School Rooftop','the purple machine keeps its stable market ID on the school roof');
}
// 2b. Drink machines (Sep 29 2026): side by side with their store's machine (same facing, a small gap, placed from its spot), on
// walkable ground, clear of the Konbini sliding doors and far from every other machine.
{
 const M=C.VENDING_MACHINES,D=load(path.join(root,'lib/town/drinkMachines.ts')),{KONBINI_DOORS,konbiniDoorNear}=load(path.join(root,'lib/konbini/konbiniDoors.ts'));
 const {VENDING_SCALE}=load(path.join(root,'lib/graphics/vendingMachines.ts'));
 assert(Math.abs(D.CABINET_WIDTH-C.VENDING_SIZE.w*VENDING_SCALE)<1e-9,'placement uses the real cabinet width');
 for(const [id,beside] of Object.entries(DRINK_MACHINES)){
  const m=M.find(x=>x.id===id),b=M.find(x=>x.id===beside);
  same([m.x,m.z,m.yaw],(({x,z,yaw})=>[x,z,yaw])(D.drinkSpotBeside(b)),id+' placed from '+beside+"'s spot");
  assert.equal(m.yaw,b.yaw,id+' faces the same way as its neighbour');assert.equal(m.y,b.y);
  const along=(m.x-b.x)*Math.cos(b.yaw)-(m.z-b.z)*Math.sin(b.yaw),out=(m.x-b.x)*Math.sin(b.yaw)+(m.z-b.z)*Math.cos(b.yaw),gap=Math.abs(along)-D.CABINET_WIDTH;
  assert(gap>.05&&gap<.4&&Math.abs(out)<1e-6,id+' stands side by side with a small gap: '+gap.toFixed(2)+' m');
  for(const o of M)if(o!==m&&o!==b)assert(Math.hypot(o.x-m.x,o.z-m.z)>20,id+' is the only machine near '+beside+' (not '+o.id+')');
  const door=KONBINI_DOORS[beside==='plaza'?'main':'cay'],fx=m.x+Math.sin(m.yaw)*1.5,fz=m.z+Math.cos(m.yaw)*1.5;
  assert(Math.abs(m.x-door.x)-D.CABINET_WIDTH/2>2.2,id+' keeps the sliding doors clear');assert(!konbiniDoorNear(beside==='plaza'?'main':'cay',fx,fz),id+"'s walk-up spot is outside the door's Enter zone");
  if(beside==='caykonbini')assert(standsOnCay(m),id+' stands on walkable Coral Cay ground (cabinet and walk-up point)');else assert(onIsland(m.x,m.z)&&onIsland(fx,fz),id+' on the island');
 }
}
// 3. 3D controller: one draw call per machine, shared material, hover glow + Go, zoom in/out, no work when idle.
{
 const T=require('three');
 const {createVendingMachines,VENDING_SCALE}=load(path.join(root,'lib/graphics/vendingMachines.ts'));
 const scene=new T.Scene(),v=createVendingMachines(scene);
 const meshes=[];v.root.traverse(o=>{if(o.isMesh)meshes.push(o);});
 assert.equal(meshes.length,15,'one merged mesh (one draw call) per machine');assert.equal(new Set(meshes.map(m=>m.material)).size,1,'all fifteen share one material');
 const atlasMaps=new Set(meshes.map(m=>m.material.map));assert.equal(atlasMaps.size,1,'one shared atlas texture, no new textures for the book machines');
 assert(meshes.every(m=>m.frustumCulled&&m.geometry.boundingSphere),'frustum-culled with bounds');assert(meshes.every(m=>m.geometry.getAttribute('position').count<800),'low-poly');
 assert.equal(v.obstacles.length,15);assert.equal(meshes[0].material.map.image.height,1024,'the atlas did not grow for the drink machines');for(const o of v.obstacles)assert(Math.min(o.w,o.d)>1.1&&Math.max(o.w,o.d)>1.68&&o.w<2.4&&o.d<2.4,'collision footprint covers the cabinet');// any yaw (wall machines are square-on)
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
// 3b. Ball pictures (Sep 29 2026): every ball item, regular and special, shows a baked picture of the real in-game ball
// (public/vending/products/ball-<style>.png, scripts/capture-vending-products.cjs), keyed by ball, not machine, so a ball looks
// the same on every machine and matches the walking ball; the shop snapshots add the walking ball's patches too.
{
 const T=require('three');
 const {BAKED_BALL_PICTURES,vendingBallPicture}=load(path.join(root,'lib/graphics/vendingProductArt.ts'));
 const balls=[...C.VENDING_ITEMS,...C.VENDING_SPECIALS].filter(i=>i.storeItem?.category==='ball');
 same(balls.map(i=>i.id).sort(),CUSTOMIZATION_OPTIONS.ball.map(o=>'ball:'+o.id).sort(),'every ball style is sold');
 for(const item of balls){const src=vendingBallPicture(item.id);assert.equal(src,`/vending/products/ball-${item.id.slice(5)}.png`,item.id+' has a baked picture');
  const file=path.join(root,'public',src),png=fs.readFileSync(file);assert.equal(png.toString('latin1',1,4),'PNG',src+' is a PNG');
  const w=png.readUInt32BE(16),h=png.readUInt32BE(20);const D=w-4;assert(w>=64&&w<=128&&h===w+Math.round(D*.14),src+' is a small ball picture framed as diameter+4 wide with a contact-shadow strip below ('+w+'×'+h+')');assert(png.length<20000,src+' stays small');}
 assert.equal(BAKED_BALL_PICTURES.length,balls.length,'no stale pictures listed');assert.equal(vendingBallPicture('ball:nope'),null,'unknown balls draw instead of 404ing');
 for(const f of fs.readdirSync(path.join(root,'public/vending/products')))assert(/^(pack|ball-[a-z]+)\.png$/.test(f)&&(f==='pack.png'||BAKED_BALL_PICTURES.includes(f.slice(5,-4))),'no per-machine or stale product photos: '+f);
 // The atlas asks, for every machine, for exactly the pictures of the balls on its first page, and nothing that 404s.
 imageLog.length=0;const v=load(path.join(root,'lib/graphics/vendingMachines.ts')).createVendingMachines(new T.Scene());
 const expected=C.VENDING_MACHINES.filter(m=>!m.drinks).flatMap(m=>C.machineStock(m.id).flatMap(r=>r.items).slice(0,6).filter(i=>i.storeItem?.category==='ball').map(i=>vendingBallPicture(i.id)));
 same(imageLog.filter(s=>s.includes('/ball-')).sort(),[...new Set(expected)].sort(),'each machine shows its balls by ball id, one shared request per picture');assert.equal(new Set(imageLog).size,imageLog.length,'every picture is requested once');
 assert(expected.length>=8,'every special ball is on its machine\'s first page');
 for(const src of imageLog)assert(fs.existsSync(path.join(root,'public',src)),src+' exists (no 404)');
 // Sep 30 2026: one atlas texture (no emissive copy); the high-res close-up face only exists while zoomed in a browser.
 {const m=[];v.root.traverse(o=>{if(o.isMesh)m.push(o);});assert.equal(m[0].material.emissiveMap,null,'no full-size emissive copy of the atlas');assert.equal(v.hiRes,null,'no high-res face at rest');}
 v.dispose();
 const vm=read('lib/graphics/vendingMachines.ts');
 assert.match(vm,/HIRES_MAX=2048/,'close-up canvas capped at 2048 px');assert.match(vm,/zoom=null;dropCloseUp\(\)/,'close-up dropped when the zoom-out ends');assert.match(vm,/cancel\(\)\{zoom=null;dropCloseUp\(\);\}/);assert.match(vm,/dispose\(\)\{dropCloseUp\(\);/);
 // Sep 30 2026 (real depth, "apply all the angle perspective changes to all the vending machines"): EVERY machine gets the real 3D
 // bay on zoom (its flat front cut away, products standing on the slabs VENDING_BAY.product behind the glass inside their slots,
 // i.e. under the HTML tap areas), and goes back to the flat printed front at distance.
 {const {VENDING_BAY,VENDING_FACE_LAYOUT:FL}=load(path.join(root,'lib/graphics/vendingFaceLayout.ts'));
  const w=load(path.join(root,'lib/graphics/vendingMachines.ts')).createVendingMachines(new T.Scene(),{viewport:()=>({width:1280,height:800,dpr:2}),coins:()=>123});
  same(w.entries.map(e=>e.machine.id),C.VENDING_MACHINES.map(m=>m.id),'every machine is covered');assert.equal(w.entries.length,15);
  const yaws=new Set();
  for(const e of w.entries){const id=e.machine.id,pos=e.geometry.getAttribute('position'),before=Array.from(pos.array);yaws.add(+e.machine.yaw.toFixed(3));
   assert(!w.hasCloseUp(id),id+' shows its flat front at distance');
   w.focus(id,()=>{});assert(w.hasCloseUp(id),id+' gets the real-depth close-up on zoom');
   const [[s0,n0],[s1,n1]]=e.geometry.userData.cut;for(const [s,n] of [[s0,n0],[s1,n1]])for(let i=1;i<n;i++)for(let j=0;j<3;j++)assert.equal(pos.array[(s+i)*3+j],pos.array[s*3+j],id+' flat front cut away');
   const names=[];e.mesh.traverse(o=>{if(o.name==='vending-closeup')names.push(o);});assert.equal(names.length,4,id+': bay, printed panels, products, glass pane');
   const targets=w.closeUpTargets(id),expected=e.machine.drinks?Math.min(6,load(path.join(root,'lib/town/drinkMachines.ts')).drinksAt(id).length):Math.min(6,C.machineStock(id).flatMap(r=>r.items).length);
   assert.equal(targets.length,expected,id+' shows its page-one products');
   for(const t of targets){const r=FL.slots[t.index];assert(t.u>r.x&&t.u<r.x+r.w,id+' product '+t.id+' stands inside its tap area');assert(Math.abs(t.v-(r.y+r.h*VENDING_BAY.shelf))<1e-9,'on the shelf line');assert.equal(t.depth,VENDING_BAY.product,'at the CSS face depth');}
   if(!e.machine.drinks){const page=C.machineStock(id).flatMap(r=>r.items).slice(0,6).map(i=>i.id);same(targets.map(t=>t.id),page,id+' products in tap order');}
   w.cancel();assert(!w.hasCloseUp(id),id+' back to the flat front');same(Array.from(pos.array),before,id+' flat front restored exactly');
   w.entries.forEach(o=>{let n=0;o.mesh.traverse(x=>{if(x.name==='vending-closeup')n++;});assert.equal(n,0,'nothing left on '+o.machine.id);});}
  assert(yaws.size>=4,'every facing is exercised (0, VENDING_YAW, −π/4, the angled Coral Cay spots)');
  // The Konbini + drink pairs zoom as one close-up; the rooftop machine (y 6) works like any other.
  w.focus('plaza',()=>{});same(w.hiRes.machines,['plaza','drinksplaza'],'the pair shares one close-up texture');assert.equal(w.hiRes.drawCalls,8);assert(w.hiRes.width<=2048&&w.hiRes.height<=2048);w.cancel();
  assert.equal(C.vendingMachine('rooftop').y,6);w.focus('rooftop',()=>{});assert(w.hasCloseUp('rooftop'));w.cancel();w.dispose();}
 assert.match(vm,/paintCoin\(c,w,h,atlas\.coins\)/,'the close-up coin panel shows the same coins as the atlas');
 const previews=read('components/StorePreviews.tsx'),town=read('components/Town.tsx');
 assert.match(previews,/addBallPatches\(/,'shop snapshots show the walking ball\'s patches');assert.match(town,/addBallPatches\(ball,/,'the walking ball uses the same patches');
 console.log('PASS vending ball pictures: '+balls.length+' balls, one baked picture each, same on every machine');
}
// 4. Ledger: starters free, one-time "already yours" snapshot, buying with coins, locked items, no re-locking, packs.
{
 const {createVendingLedger,VENDING_STARTERS}=load(path.join(root,'lib/town/vendingLedger.ts'));
 const make=({look=null,balance=100,rides={},costumes={},collection=[],initial=null}={})=>{let saved=initial,packCalls=[];const unlocked={...rides};
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
  // Books are owned per BOOK (Sep 30 2026): Messi's book is sold at Island Square and at the Coral Cay Konbini under one item id.
  {const b=make({balance:500}),at=(m,id)=>C.machineStock(m)[1].items.find(i=>i.storyId===id);
   const here=at('plaza','messi'),there=at('caykonbini','messi');assert(here&&there&&here===there,'one item for the book at both machines');
   assert.equal((await b.ledger.buy(here)).ok,true);assert.equal(b.ledger.read().spent,100);
   assert.equal((await b.ledger.buy(there)).ok,true);assert.equal(b.ledger.read().spent,100,'never charged twice for the same book at another machine');
   // An existing save that owns 'display:plaza:book' (bought before books were shared) still owns it, and it shows as owned at
   // every machine that sells it: the ids did not change, so no migration is needed.
   const old=make({balance:0,initial:b.saved()});assert(old.ledger.isOwned('display:plaza:book'),'old save keeps the plaza book');
   for(const m of C.VENDING_MACHINES.filter(m=>!m.drinks))for(const i of C.machineStock(m.id)[1].items)if(i.id==='display:plaza:book')assert(old.ledger.isOwned(i.id),'owned at '+m.id);
   assert.equal(PLAYER_BOOKS.messi.itemId,'display:plaza:book','"Read my book" still maps the item to the Messi story');}
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
 console.log('PASS vending machines: 15 placed machines (8 with exclusive specials, 4 book machines incl. 3 on Coral Cay anchors, the Coral Cay Konbini, 2 drink machines beside the Konbini machines), one draw call each, shared glow + Go, ~1 s angled zoom fitting the face (taps ≥44px portrait + landscape), in-world face (no modal, one shared layout, visuals-only module), idle frames free, coin ledger (locked, no re-locking, no duplicates), Store entry points redirected');
}
